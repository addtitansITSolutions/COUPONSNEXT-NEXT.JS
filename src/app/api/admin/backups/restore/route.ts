import { NextRequest, NextResponse } from "next/server";
import { basename, join } from "node:path";
import { mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { requireAdmin } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";
import { verifyRestorePasscode } from "@/lib/backups/passcode";
import {
  checkRestoreRateLimit,
  recordFailedRestoreAttempt,
  clearRestoreRateLimit,
} from "@/lib/backups/rate-limit";
import { acquireRestoreLock } from "@/lib/backups/restore-lock";
import {
  createDatabaseSafetyBackup,
  createUploadsSafetyBackup,
} from "@/lib/backups/safety-backup";
import {
  restoreDatabase,
  type DatabaseRestoreMode,
} from "@/lib/backups/database-restore";
import { restoreUploads } from "@/lib/backups/uploads-restore";
import { getSafetyBackupPath } from "@/lib/backups/backup-manager";
export const runtime = "nodejs";
const MAX_UPLOAD_SIZE = 512 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_UPLOAD_SIZE + 1024 * 1024;

type RestoreType = "database" | "uploads";

interface RestoreRequestData {
  file: File | null;
  backupId: string | null;
  passcode: string;
  mode: DatabaseRestoreMode;
}

/**
 * Reads either:
 * - multipart/form-data for uploaded backups
 * - application/json for existing safety backups
 */
async function readRestoreRequest(
  request: NextRequest
): Promise<RestoreRequestData> {
  const contentLength = Number(
    request.headers.get("content-length") ?? "0"
  );

  if (
    contentLength > 0 &&
    contentLength > MAX_REQUEST_SIZE
  ) {
    throw new ApiError(
      413,
      "The uploaded backup exceeds the maximum allowed size.",
      "RESTORE_UPLOAD_TOO_LARGE"
    );
  }

  const contentType =
    request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();

    const uploadedFile = formData.get("file");
    const passcodeValue = formData.get("passcode");
    const modeValue = formData.get("mode");

    if (
      typeof File === "undefined" ||
      !(uploadedFile instanceof File)
    ) {
      throw new ApiError(
        400,
        "Please select a backup file.",
        "RESTORE_FILE_REQUIRED"
      );
    }

    if (uploadedFile.size === 0) {
      throw new ApiError(
        400,
        "The uploaded backup file is empty.",
        "EMPTY_RESTORE_FILE"
      );
    }

    if (uploadedFile.size > MAX_UPLOAD_SIZE) {
      throw new ApiError(
        413,
        "The uploaded backup exceeds the maximum allowed size.",
        "RESTORE_UPLOAD_TOO_LARGE"
      );
    }

    if (typeof passcodeValue !== "string") {
      throw new ApiError(
        400,
        "Restore passcode is required.",
        "PASSCODE_REQUIRED"
      );
    }

    const mode =
      modeValue === "merge" ? "merge" : "replace";

    return {
      file: uploadedFile,
      backupId: null,
      passcode: passcodeValue,
      mode,
    };
  }

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      throw new ApiError(
        400,
        "Invalid restore request.",
        "INVALID_RESTORE_REQUEST"
      );
    }

    return {
      file: null,
      backupId:
        typeof body.backupId === "string"
          ? body.backupId.trim()
          : null,
      passcode:
        typeof body.passcode === "string"
          ? body.passcode
          : "",
      mode: body.mode === "merge" ? "merge" : "replace",
    };
  }

  throw new ApiError(
    415,
    "Unsupported restore request format.",
    "UNSUPPORTED_RESTORE_FORMAT"
  );
}

/**
 * Determines the backup type from its validated filename.
 */
function getRestoreType(filename: string): RestoreType {
  if (filename.startsWith("safety-database-")) {
    return "database";
  }

  if (filename.startsWith("safety-uploads-")) {
    return "uploads";
  }

  throw new ApiError(
    400,
    "Unsupported safety backup type.",
    "INVALID_BACKUP_TYPE"
  );
}

/**
 * POST /api/admin/backups/restore
 *
 * Supports:
 * 1. Uploaded backup files (multipart/form-data).
 * 2. Existing safety backups (application/json with backupId).
 */
export async function POST(request: NextRequest) {
  let releaseLock: (() => void) | undefined;
  let temporaryDirectory: string | undefined;

  try {
    const admin = await requireAdmin();
    const adminId = String(admin._id);

    checkRestoreRateLimit(adminId);

    const restoreRequest = await readRestoreRequest(request);

    if (!restoreRequest.passcode) {
      throw new ApiError(
        400,
        "Restore passcode is required.",
        "PASSCODE_REQUIRED"
      );
    }

    if (!restoreRequest.file && !restoreRequest.backupId) {
      throw new ApiError(
        400,
        "Please select a backup to restore.",
        "RESTORE_SOURCE_REQUIRED"
      );
    }

    const isValidPasscode = verifyRestorePasscode(
      restoreRequest.passcode
    );

    if (!isValidPasscode) {
      recordFailedRestoreAttempt(adminId);

      throw new ApiError(
        401,
        "The restore passcode is incorrect.",
        "INVALID_RESTORE_PASSCODE"
      );
    }

    clearRestoreRateLimit(adminId);

    const backupDirectory = process.env.BACKUP_DIR;

    if (!backupDirectory) {
      throw new ApiError(
        500,
        "Backup directory is not configured.",
        "BACKUP_DIR_NOT_CONFIGURED"
      );
    }

    await mkdir(backupDirectory, { recursive: true });

    const lock = await acquireRestoreLock();
    releaseLock = lock.release;

    let archivePath: string;
    let restoreType: RestoreType;
    let archiveFilename: string;

    if (restoreRequest.backupId) {
      // Restore an existing safety backup directly from BACKUP_DIR.
      archivePath = await getSafetyBackupPath(
        restoreRequest.backupId
      );

      archiveFilename = basename(archivePath);
      restoreType = getRestoreType(archiveFilename);
    } else {
      // Preserve the existing uploaded-file restore workflow.
      const uploadedFile = restoreRequest.file!;

      archiveFilename = uploadedFile.name;

      if (archiveFilename.endsWith(".archive.gz")) {
        restoreType = "database";
      } else if (archiveFilename.endsWith(".zip")) {
        restoreType = "uploads";
      } else {
        throw new ApiError(
          400,
          "Unsupported backup file. Upload an .archive.gz or .zip file.",
          "INVALID_RESTORE_FILE"
        );
      }

      temporaryDirectory = await mkdtemp(
        join(backupDirectory, ".restore-upload-")
      );

      archivePath = join(
        temporaryDirectory,
        restoreType === "database"
          ? "uploaded-backup.archive.gz"
          : "uploaded-backup.zip"
      );

      await pipeline(
        Readable.from(
          uploadedFile.stream() as unknown as AsyncIterable<Uint8Array>
        ),
        createWriteStream(archivePath, {
          flags: "wx",
        })
      );
    }

    // Verify the selected archive exists and is not empty.
    const archiveStats = await stat(archivePath);

    if (!archiveStats.isFile() || archiveStats.size === 0) {
      throw new ApiError(
        400,
        "The selected backup is empty or invalid.",
        "INVALID_RESTORE_ARCHIVE"
      );
    }

    // Create a fresh safety backup before modifying live data.
    if (restoreType === "database") {
      await createDatabaseSafetyBackup();

      await restoreDatabase({
        archivePath,
        mode: restoreRequest.mode,
      });
    } else {
      // Upload restoration is always merge-only.
      await createUploadsSafetyBackup();

      await restoreUploads(archivePath);
    }

    console.info("Backup restore completed:", {
      adminId,
      restoreType,
      source: restoreRequest.backupId
        ? "safety-backup-history"
        : "uploaded-file",
      backupId: restoreRequest.backupId ?? undefined,
      filename: archiveFilename,
      mode:
        restoreType === "database"
          ? restoreRequest.mode
          : "merge",
      restoredAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message:
        restoreType === "database"
          ? "Database restored successfully."
          : "Uploads restored successfully.",
      type: restoreType,
    });
  } catch (error) {
    return handleApiError(error, request);
  } finally {
    if (temporaryDirectory) {
      await rm(temporaryDirectory, {
        recursive: true,
        force: true,
      }).catch((error) => {
        console.error(
          "Restore temporary directory cleanup failed:",
          error
        );
      });
    }

    releaseLock?.();
  }
}
