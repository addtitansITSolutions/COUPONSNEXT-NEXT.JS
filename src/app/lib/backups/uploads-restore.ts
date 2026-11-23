
import * as yauzl from "yauzl";

import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readdir,
  rename,
  rm,
} from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import {
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { randomUUID } from "node:crypto";
import { pipeline } from "node:stream/promises";

import { ApiError } from "@/lib/errors/ApiError";

const MAX_ENTRIES = 50_000;
const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB
const MAX_TOTAL_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

type ExtractedFile = {
  stagedPath: string;
  relativePath: string;
};

function getUploadsDirectory(): string {
  const directory = process.env.UPLOAD_DIR;

  if (!directory || !isAbsolute(directory)) {
    throw new ApiError(
      500,
      "A valid absolute uploads directory must be configured.",
      "INVALID_UPLOAD_DIR"
    );
  }

  return resolve(directory);
}

function validateEntryPath(
  filename: string,
  isDirectory: boolean,
  rootDirectory: string
): string {
  if (
    !filename ||
    filename.includes("\0") ||
    filename.includes("\\") ||
    filename.startsWith("/") ||
    /^[a-zA-Z]:/.test(filename)
  ) {
    throw new ApiError(
      400,
      "The uploads archive contains an unsafe file path.",
      "UNSAFE_ARCHIVE_PATH"
    );
  }

  const normalizedName = isDirectory
    ? filename.replace(/\/+$/, "")
    : filename;

  const segments = normalizedName.split("/");

  if (
    !normalizedName ||
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        segment.includes(":")
    )
  ) {
    throw new ApiError(
      400,
      "The uploads archive contains an invalid file path.",
      "INVALID_ARCHIVE_PATH"
    );
  }

  const destination = resolve(rootDirectory, ...segments);
  const relativePath = relative(rootDirectory, destination);

  if (
    !relativePath ||
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    throw new ApiError(
      400,
      "The uploads archive contains a path outside the uploads directory.",
      "ARCHIVE_PATH_TRAVERSAL"
    );
  }

  return segments.join("/");
}

function isSymbolicLink(entry: yauzl.Entry): boolean {
  const unixMode = (entry.externalFileAttributes >>> 16) & 0xffff;
  const fileType = unixMode & 0xf000;

  return fileType === 0xa000;
}

function validateEntryType(entry: yauzl.Entry): void {
  if (isSymbolicLink(entry)) {
    throw new ApiError(
      400,
      "Symbolic links are not allowed in uploads backups.",
      "ARCHIVE_SYMLINK_NOT_ALLOWED"
    );
  }

  const unixMode = (entry.externalFileAttributes >>> 16) & 0xffff;
  const fileType = unixMode & 0xf000;
  const isDirectory = entry.fileName.endsWith("/");

  if (
    fileType !== 0 &&
    fileType !== 0x8000 &&
    fileType !== 0x4000
  ) {
    throw new ApiError(
      400,
      "The uploads archive contains an unsupported file type.",
      "UNSUPPORTED_ARCHIVE_ENTRY"
    );
  }

  if (isDirectory && fileType === 0x8000) {
    throw new ApiError(
      400,
      "The uploads archive contains an invalid directory entry.",
      "INVALID_ARCHIVE_ENTRY"
    );
  }
}

async function extractArchiveSafely( archivePath: string, stagingDirectory: string ): Promise<ExtractedFile[]> {
  return new Promise((resolvePromise, rejectPromise) => {
    yauzl.open(
      archivePath,
      {
        lazyEntries: true,
        decodeStrings: true,
        validateEntrySizes: true,
      },
      (openError, zipFile) => {
        if (openError || !zipFile) {
          rejectPromise(
            new ApiError(
              400,
              "The uploaded ZIP archive is invalid or cannot be opened.",
              "INVALID_UPLOADS_ARCHIVE"
            )
          );
          return;
        }

        const extractedFiles: ExtractedFile[] = [];
        const seenPaths = new Set<string>();

        let entryCount = 0;
        let totalUncompressedSize = 0;
        let settled = false;

        const fail = (error: unknown) => {
          if (settled) return;

          settled = true;

          zipFile.close();

          rejectPromise(
            error instanceof Error
              ? error
              : new ApiError(
                  400,
                  "Unable to extract the uploads archive.",
                  "UPLOADS_EXTRACTION_FAILED"
                )
          );
        };

        zipFile.on("error", fail);

        zipFile.on("end", () => {
          if (settled) return;

          settled = true;
          resolvePromise(extractedFiles);
        });

        zipFile.on("entry", (entry: yauzl.Entry) => {
          void (async () => {
            validateEntryType(entry);

            const isDirectory = entry.fileName.endsWith("/");

            const relativePath = validateEntryPath(
              entry.fileName,
              isDirectory,
              stagingDirectory
            );

            const normalizedKey = relativePath.toLowerCase();

            if (seenPaths.has(normalizedKey)) {
              throw new ApiError(
                400,
                "The uploads archive contains duplicate file paths.",
                "DUPLICATE_ARCHIVE_PATH"
              );
            }

            seenPaths.add(normalizedKey);

            entryCount += 1;

            if (entryCount > MAX_ENTRIES) {
              throw new ApiError(
                400,
                "The uploads archive contains too many entries.",
                "ARCHIVE_ENTRY_LIMIT_EXCEEDED"
              );
            }

            if (isDirectory) {
              await mkdir(
                resolve(stagingDirectory, relativePath),
                { recursive: true }
              );

              zipFile.readEntry();
              return;
            }

            if (
              entry.uncompressedSize > MAX_FILE_SIZE ||
              entry.uncompressedSize < 0
            ) {
              throw new ApiError(
                400,
                "A file in the uploads archive exceeds the allowed size.",
                "ARCHIVE_FILE_TOO_LARGE"
              );
            }

            totalUncompressedSize += entry.uncompressedSize;

            if (totalUncompressedSize > MAX_TOTAL_SIZE) {
              throw new ApiError(
                400,
                "The uploads archive exceeds the total extraction limit.",
                "ARCHIVE_TOTAL_SIZE_EXCEEDED"
              );
            }

            const stagedPath = resolve(
              stagingDirectory,
              relativePath
            );

            await mkdir(dirname(stagedPath), {
              recursive: true,
            });

            const readStream = await new Promise<NodeJS.ReadableStream>(
              (resolveStream, rejectStream) => {
                zipFile.openReadStream(entry, (error, stream) => {
                  if (error || !stream) {
                    rejectStream(
                      error || new Error("Unable to read ZIP entry.")
                    );
                    return;
                  }

                  resolveStream(stream);
                });
              }
            );

            await pipeline(
              readStream,
              createWriteStream(stagedPath, { flags: "wx" })
            );

            extractedFiles.push({
              stagedPath,
              relativePath,
            });

            zipFile.readEntry();
          })().catch(fail);
        });

        zipFile.readEntry();
      }
    );
  });
}

/**
 * Ensures every existing parent directory is a real directory,
 * not a symbolic link.
 */
async function ensureSafeParentDirectories(
  rootDirectory: string,
  relativePath: string
): Promise<string> {
  const segments = relativePath.split("/");
  const filename = segments.pop();

  if (!filename) {
    throw new ApiError(
      400,
      "Invalid uploads destination path.",
      "INVALID_UPLOAD_DESTINATION"
    );
  }

  let currentDirectory = rootDirectory;

  for (const segment of segments) {
    currentDirectory = join(currentDirectory, segment);

    try {
      const existing = await lstat(currentDirectory);

      if (existing.isSymbolicLink() || !existing.isDirectory()) {
        throw new ApiError(
          400,
          "The uploads destination contains an unsafe directory.",
          "UNSAFE_UPLOAD_DESTINATION"
        );
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }

      await mkdir(currentDirectory);
    }
  }

  return join(currentDirectory, filename);
}

/**
 * Merges extracted files into the existing uploads directory.
 *
 * Matching files are replaced. Unrelated files are preserved.
 */
async function mergeExtractedFiles( rootDirectory: string, files: ExtractedFile[] ): Promise<void> {
  for (const file of files) {
    const destination = await ensureSafeParentDirectories(
      rootDirectory,
      file.relativePath
    );

    try {
      const existing = await lstat(destination);
      if (existing.isSymbolicLink() || !existing.isFile()) {
        throw new ApiError(
          400,
          "An existing uploads destination is not a regular file.",
          "UNSAFE_UPLOAD_DESTINATION"
        );
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    // Copy to a temporary sibling before replacing the destination.
    const temporaryDestination = join(
      dirname(destination),
      `.restore-${randomUUID()}.tmp`
    );

    try {
      await copyFile(file.stagedPath, temporaryDestination);
      await rename(temporaryDestination, destination);
    } catch (error) {
      await rm(temporaryDestination, { force: true }).catch(() => {});
      throw error;
    }
  }
}

/**
 * Restores an uploads ZIP using Merge behavior.
 *
 * The caller must create a safety backup and acquire the restore lock
 * before calling this function.
 */
export async function restoreUploads( archivePath: string ): Promise<void> {
  const rootDirectory = getUploadsDirectory();
  const archiveStats = await import("node:fs/promises").then(
    ({ stat }) => stat(archivePath).catch(() => null)
  );
  if (
    !archiveStats ||
    !archiveStats.isFile() ||
    archiveStats.size === 0 ||
    !archivePath.toLowerCase().endsWith(".zip")
  ) {
    throw new ApiError(
      400,
      "The uploaded uploads backup is invalid.",
      "INVALID_UPLOADS_ARCHIVE"
    );
  }
  await mkdir(rootDirectory, { recursive: true });
  const rootStats = await lstat(rootDirectory);
  if (rootStats.isSymbolicLink() || !rootStats.isDirectory()) {
    throw new ApiError(
      500,
      "The configured uploads directory is not a safe directory.",
      "UNSAFE_UPLOAD_DIR"
    );
  }

  const stagingDirectory = await mkdtemp(
    join(tmpdir(), "couponsnext-restore-")
  );

  try {
    const extractedFiles = await extractArchiveSafely(
      archivePath,
      stagingDirectory
    );

    await mergeExtractedFiles(
      rootDirectory,
      extractedFiles
    );
  } finally {
    await rm(stagingDirectory, {
      recursive: true,
      force: true,
    }).catch((error) => {
      console.error("Uploads restore staging cleanup failed:", error);
    });
  }
}
