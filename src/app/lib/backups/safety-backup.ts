// Before restoring a database or uploads archive, the server must create a backup of the current data. If something goes wrong, we'll have a copy available for recovery.

import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import {
  mkdir,
  readdir,
  stat,
} from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { ApiError } from "@/lib/errors/ApiError";
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

function getBackupDirectory(): string {
  const directory = process.env.BACKUP_DIR;
  if (!directory || !isAbsolute(directory)) {
    throw new ApiError(
      500,
      "A valid absolute backup directory must be configured.",
      "INVALID_BACKUP_DIR"
    );
  }
  return directory;
}

function createTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
/**
 * Creates a MongoDB safety backup using mongodump.
 */
export async function createDatabaseSafetyBackup(): Promise<string> {
  const mongodbUri = process.env.MONGODB_URI;
  if ( !mongodbUri || (!mongodbUri.startsWith("mongodb://") && !mongodbUri.startsWith("mongodb+srv://")) ) {
    throw new ApiError(
      500,
      "MongoDB connection configuration is missing or invalid.",
      "INVALID_MONGODB_URI"
    );
  }
  const backupDirectory = getBackupDirectory();
  await mkdir(backupDirectory, { recursive: true });
  const archivePath = join(
    backupDirectory,
    `safety-database-${createTimestamp()}.archive.gz`
  );
  const mongodumpPath = process.env.MONGODUMP_PATH || "mongodump";
  await new Promise<void>((resolve, reject) => {
    const dumpProcess = spawn(
      /*turbopackIgnore: true*/ mongodumpPath,
      [
        `--uri=${mongodbUri}`,
        `--archive=${archivePath}`,
        "--gzip",
      ],
      {
        stdio: ["ignore", "ignore", "pipe"],
        windowsHide: true,
      }
    );
    let stderr = "";
    let settled = false;
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    dumpProcess.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
      if (stderr.length > 10000) {
        stderr = stderr.slice(-10000);
      }
    });
    dumpProcess.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        fail(
          new ApiError(
            500,
            "mongodump is unavailable. Check your MongoDB Database Tools installation.",
            "MONGODUMP_NOT_FOUND"
          )
        );
        return;
      }

      fail(
        new ApiError(
          500,
          "Unable to start the database safety backup.",
          "SAFETY_BACKUP_START_FAILED"
        )
      );
    });

    dumpProcess.on("close", (code) => {
      if (settled) return;

      if (code === 0) {
        settled = true;
        resolve();
        return;
      }

      console.error("Database safety backup failed:", stderr);

      fail(
        new ApiError(
          500,
          "Unable to create the database safety backup. Restore was cancelled.",
          "DATABASE_SAFETY_BACKUP_FAILED"
        )
      );
    });
  });

  const fileStats = await stat(archivePath);

  if (!fileStats.isFile() || fileStats.size === 0) {
    throw new ApiError(
      500,
      "The database safety backup is empty.",
      "EMPTY_DATABASE_SAFETY_BACKUP"
    );
  }

  return archivePath;
}

/**
 * Recursively adds regular files to an uploads ZIP archive.
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
 * Creates a ZIP safety backup of the current uploads directory.
 */
export async function createUploadsSafetyBackup(): Promise<string> {
  const uploadsDirectory = process.env.UPLOAD_DIR;

  if (!uploadsDirectory || !isAbsolute(uploadsDirectory)) {
    throw new ApiError(
      500,
      "A valid absolute uploads directory must be configured.",
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

  const backupDirectory = getBackupDirectory();

  await mkdir(backupDirectory, { recursive: true });

  const archivePath = join(
    backupDirectory,
    `safety-uploads-${createTimestamp()}.zip`
  );

  const { ZipArchive } = (await import("archiver")) as unknown as {
    ZipArchive: new (options: {
      zlib: { level: number };
    }) => ZipArchiveInstance;
  };

  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(archivePath);

    const archive = new ZipArchive({
      zlib: { level: 6 },
    });

    let settled = false;

    const fail = (error: Error) => {
      if (settled) return;

      settled = true;
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
            : new Error("Unable to create uploads safety backup.")
        );
      }
    })();
  });

  const fileStats = await stat(archivePath);

  if (!fileStats.isFile() || fileStats.size === 0) {
    throw new ApiError(
      500,
      "The uploads safety backup is empty.",
      "EMPTY_UPLOADS_SAFETY_BACKUP"
    );
  }

  return archivePath;
}







// What this file provides
// Function	Purpose
// createDatabaseSafetyBackup()	Saves the current MongoDB database
// createUploadsSafetyBackup()	Saves the current uploads directory

// The functions return the exact backup file path. They do not delete these files after creation.

// Your backup directory will eventually contain files like:
// C:\NEXTJS\backups\couponsnext\
//     safety-database-2026-11-23T07-30-00-000Z.archive.gz
//     safety-uploads-2026-11-23T07-30-00-000Z.zip


// Important: These safety backups are private server-side files. Don't place BACKUP_DIR inside public, your project uploads directory, or any publicly served directory.
