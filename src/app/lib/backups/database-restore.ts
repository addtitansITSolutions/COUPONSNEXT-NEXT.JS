import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { ApiError } from "@/lib/errors/ApiError";

export type DatabaseRestoreMode = "replace" | "merge";

type RestoreOptions = {
  archivePath: string;
  mode: DatabaseRestoreMode;
};

function getDatabaseName(mongodbUri: string): string {
  let databaseName: string;
  try {
    const parsedUri = new URL(mongodbUri);
    databaseName = decodeURIComponent(
      parsedUri.pathname.replace(/^\/+/, "").split("/")[0] || ""
    );
  } catch {
    throw new ApiError(
      500,
      "Unable to determine the configured MongoDB database.",
      "INVALID_MONGODB_URI"
    );
  }

  if (
    !databaseName ||
    !/^[a-zA-Z0-9_-]+$/.test(databaseName) ||
    ["admin", "local", "config"].includes(databaseName)
  ) {
    throw new ApiError(
      500,
      "The configured application database name is invalid.",
      "INVALID_DATABASE_NAME"
    );
  }

  return databaseName;
}

function runMongoRestore( mongodbUri: string, archivePath: string, databaseName: string, dryRun = false ): Promise<void> {
  return new Promise((resolve, reject) => {
    const mongorestorePath = process.env.MONGORESTORE_PATH || "mongorestore";
    const args = [
      `--uri=${mongodbUri}`,
      `--archive=${archivePath}`,
      "--gzip",
      `--nsInclude=${databaseName}.*`,
    ];
    if (dryRun) {
      args.push("--dryRun", "--verbose");
    }
    const restoreProcess = spawn(/*turbopackIgnore: true*/ mongorestorePath, args, {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
      shell: false,
    });
    let stderr = "";
    let settled = false;
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    restoreProcess.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
      if (stderr.length > 12000) {
        stderr = stderr.slice(-12000);
      }
    });
    restoreProcess.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        fail(
          new ApiError(
            500,
            "mongorestore is unavailable. Check your MongoDB Database Tools installation.",
            "MONGORESTORE_NOT_FOUND"
          )
        );
        return;
      }
      fail(
        new ApiError(
          500,
          "Unable to start the MongoDB restore process.",
          "MONGORESTORE_START_FAILED"
        )
      );
    });
    restoreProcess.on("close", (code) => {
      if (settled) return;
      if (code === 0) {
        settled = true;
        resolve();
        return;
      }
      console.error(`MongoDB ${dryRun ? "validation" : "restore"} failed:`, stderr );
      fail(
        new ApiError(
          500,
          dryRun
            ? "The database archive could not be validated. No database changes were made."
            : "Database restoration failed. Your safety backup has been retained.",
          dryRun
            ? "DATABASE_ARCHIVE_VALIDATION_FAILED"
            : "DATABASE_RESTORE_FAILED"
        )
      );
    });
  });
}

/**
 * Restores a MongoDB archive into the configured application database.
 *
 * The caller must create a safety backup and acquire the restore lock
 * before calling this function.
 */
export async function restoreDatabase({
  archivePath,
  mode,
}: RestoreOptions): Promise<void> {
  if (mode !== "replace" && mode !== "merge") {
    throw new ApiError(
      400,
      "Invalid database restore mode.",
      "INVALID_RESTORE_MODE"
    );
  }

  const mongodbUri = process.env.MONGODB_URI;

  if (
    !mongodbUri ||
    (!mongodbUri.startsWith("mongodb://") &&
      !mongodbUri.startsWith("mongodb+srv://"))
  ) {
    throw new ApiError(
      500,
      "MongoDB connection configuration is missing or invalid.",
      "INVALID_MONGODB_URI"
    );
  }

  const databaseName = getDatabaseName(mongodbUri);

  // Only accept an existing regular archive file.
  const archiveStats = await stat(archivePath).catch(() => null);

  if (
    !archiveStats ||
    !archiveStats.isFile() ||
    archiveStats.size === 0 ||
    !archivePath.toLowerCase().endsWith(".archive.gz")
  ) {
    throw new ApiError(
      400,
      "The uploaded database backup is invalid.",
      "INVALID_DATABASE_ARCHIVE"
    );
  }

  // Validate the archive before making any database changes.
  await runMongoRestore(
    mongodbUri,
    archivePath,
    databaseName,
    true
  );

  if (mode === "replace") {
    // Connect to the configured application database.
    await connectDB();

    const database = mongoose.connection.db;

    if (!database || database.databaseName !== databaseName) {
      throw new ApiError(
        500,
        "The active MongoDB connection does not match the configured database.",
        "DATABASE_CONNECTION_MISMATCH"
      );
    }

    // The caller must have completed the safety backup before this point.
    await database.dropDatabase();
  }

  // Restore only namespaces belonging to the configured application DB.
  await runMongoRestore(
    mongodbUri,
    archivePath,
    databaseName
  );
}



// Important safety detail: In Replace mode, the database is dropped only after archive validation. The restore endpoint must create the safety backup successfully before calling this function. If restoration subsequently fails, the safety backup remains available for recovery.