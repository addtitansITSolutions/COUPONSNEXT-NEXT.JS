
import { NextRequest } from "next/server";
import { createReadStream, createWriteStream } from "node:fs";
import {
  mkdtemp,
  readdir,
  rm,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { Readable } from "node:stream";

import { requireAdmin } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";

export const runtime = "nodejs";
export const maxDuration = 300;

type ZipArchiveInstance = {
  pipe(destination: NodeJS.WritableStream): unknown;

  file(
    filePath: string,
    options: { name: string }
  ): unknown;

  finalize(): Promise<void>;

  on(
    event: string,
    listener: (error: Error) => void
    ): void;
};

/**
 * Recursively adds regular files to the ZIP archive.
 * Symbolic links are intentionally skipped.
 */
async function addDirectoryToArchive(
  archive: ZipArchiveInstance,
  directory: string,
  relativeDirectory = ""
): Promise<void> {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    const relativePath = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name;

    if (entry.isDirectory()) {
      await addDirectoryToArchive(
        archive,
        fullPath,
        relativePath
      );

      continue;
    }

    if (entry.isFile()) {
      archive.file(fullPath, {
        name: relativePath,
      });
    }
  }
}

/**
 * Creates a ZIP archive on disk using Archiver 8.
 */
async function createUploadsArchive(
  uploadsDirectory: string,
  archivePath: string
): Promise<void> {
  // Dynamically import the Archiver 8 ESM package.
  const { ZipArchive } = (await import("archiver")) as unknown as {
    ZipArchive: new (options: {
      zlib: {
        level: number;
      };
    }) => ZipArchiveInstance;
  };

  return new Promise((resolve, reject) => {
    const output = createWriteStream(archivePath);

    const archive = new ZipArchive({
      zlib: {
        level: 6,
      },
    });

    let settled = false;

    const fail = (error: Error) => {
      if (settled) return;

      settled = true;

      archive.on("error", () => {});
      output.destroy();

      reject(error);
    };

    output.on("close", () => {
      if (settled) return;

      settled = true;
      resolve();
    });

    output.on("error", fail);
    archive.on("error", fail);
    archive.on("warning", fail);

    archive.pipe(output);

    void (async () => {
      try {
        await addDirectoryToArchive(
          archive,
          uploadsDirectory
        );

        await archive.finalize();
      } catch (error) {
        fail(
          error instanceof Error
            ? error
            : new Error("Unable to create uploads archive.")
        );
      }
    })();
  });
}

export async function GET(request: NextRequest) {
  let temporaryDirectory: string | null = null;

  try {
    await requireAdmin();

    const uploadsDirectory = process.env.UPLOAD_DIR;

    if (!uploadsDirectory) {
      throw new ApiError(
        500,
        "Uploads directory configuration is missing.",
        "UPLOAD_DIR_MISSING"
      );
    }

    if (!isAbsolute(uploadsDirectory)) {
      throw new ApiError(
        500,
        "Uploads directory must be an absolute path.",
        "INVALID_UPLOAD_DIR"
      );
    }

    const uploadsStats = await stat(uploadsDirectory);

    if (!uploadsStats.isDirectory()) {
      throw new ApiError(
        500,
        "The configured uploads path is not a directory.",
        "UPLOAD_DIR_INVALID"
      );
    }

    // Create a private temporary directory.
    temporaryDirectory = await mkdtemp(
      join(tmpdir(), "couponsnext-uploads-backup-")
    );

    const archivePath = join(
      temporaryDirectory,
      "couponsnext-uploads.zip"
    );

    // Generate the ZIP archive.
    await createUploadsArchive(
      uploadsDirectory,
      archivePath
    );

    const fileStats = await stat(archivePath);

    if (!fileStats.isFile() || fileStats.size === 0) {
      throw new ApiError(
        500,
        "The generated uploads backup is empty.",
        "EMPTY_UPLOADS_BACKUP"
      );
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const filename = `couponsnext-uploads-${timestamp}.zip`;

    const fileStream = createReadStream(archivePath);

    const directoryToClean = temporaryDirectory;

    // Clean temporary files after the download finishes.
    const cleanup = () => {
      void rm(directoryToClean, {
        recursive: true,
        force: true,
      }).catch((error) => {
        console.error(
          "Uploads backup temporary directory cleanup failed:",
          error
        );
      });
    };

    fileStream.on("close", cleanup);
    fileStream.on("error", cleanup);

    // Transfer cleanup responsibility to the stream.
    temporaryDirectory = null;

    return new Response(
      Readable.toWeb(fileStream) as ReadableStream,
      {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": fileStats.size.toString(),
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    if (temporaryDirectory) {
      await rm(temporaryDirectory, {
        recursive: true,
        force: true,
      }).catch((cleanupError) => {
        console.error(
          "Uploads backup cleanup failed:",
          cleanupError
        );
      });
    }

    return handleApiError(error, request);
  }
}
