import { NextRequest } from "next/server";
import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";

import { requireAdmin } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";

export const runtime = "nodejs";
export const maxDuration = 300;

function createMongoDump(
  mongodbUri: string,
  archivePath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const mongodumpPath = process.env.MONGODUMP_PATH || "mongodump";

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

    dumpProcess.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();

      // Prevent unlimited stderr memory usage.
      if (stderr.length > 10000) {
        stderr = stderr.slice(-10000);
      }
    });

    dumpProcess.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        reject(
          new ApiError(
            500,
            "MongoDB Database Tools are not installed or mongodump is not available in the system PATH.",
            "MONGODUMP_NOT_FOUND"
          )
        );
        return;
      }

      reject(
        new ApiError(
          500,
          "Unable to start the MongoDB backup process.",
          "MONGODUMP_START_FAILED"
        )
      );
    });

    dumpProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      console.error("MongoDB backup failed:", stderr);

      reject(
        new ApiError(
          500,
          "MongoDB backup failed. Please check the server logs.",
          "MONGODUMP_FAILED"
        )
      );
    });
  });
}

export async function GET(request: NextRequest) {
  let temporaryDirectory: string | null = null;

  try {
    await requireAdmin();

    const mongodbUri = process.env.MONGODB_URI;

    if (!mongodbUri) {
      throw new ApiError(
        500,
        "MongoDB connection configuration is missing.",
        "MONGODB_URI_MISSING"
      );
    }

    if (
      !mongodbUri.startsWith("mongodb://") &&
      !mongodbUri.startsWith("mongodb+srv://")
    ) {
      throw new ApiError(
        500,
        "Invalid MongoDB connection configuration.",
        "INVALID_MONGODB_URI"
      );
    }

    // Create a private temporary directory.
    temporaryDirectory = await mkdtemp(
      join(tmpdir(), "couponsnext-db-backup-")
    );

    const archivePath = join(
      temporaryDirectory,
      "couponsnext-database.archive.gz"
    );

    // Generate the complete MongoDB archive.
    await createMongoDump(mongodbUri, archivePath);

    const fileStats = await stat(archivePath);

    if (!fileStats.isFile() || fileStats.size === 0) {
      throw new ApiError(
        500,
        "The generated database backup is empty.",
        "EMPTY_DATABASE_BACKUP"
      );
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const filename = `couponsnext-database-${timestamp}.archive.gz`;

    const fileStream = createReadStream(archivePath);

    const directoryToClean = temporaryDirectory;

    // Remove temporary files after the download stream finishes.
    const cleanup = () => {
      void rm(directoryToClean, {
        recursive: true,
        force: true,
      }).catch((error) => {
        console.error("Backup temporary directory cleanup failed:", error);
      });
    };

    fileStream.on("close", cleanup);
    fileStream.on("error", cleanup);

    // Ownership is now transferred to the stream cleanup handler.
    temporaryDirectory = null;

    return new Response(
      Readable.toWeb(fileStream) as ReadableStream,
      {
        status: 200,
        headers: {
          "Content-Type": "application/gzip",
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
        console.error("Backup cleanup failed:", cleanupError);
      });
    }

    return handleApiError(error, request);
  }
}