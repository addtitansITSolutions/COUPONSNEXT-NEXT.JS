
import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";

import {
  listSafetyBackups,
  deleteSafetyBackup,
} from "@/lib/backups/backup-manager";

import { verifyRestorePasscode } from "@/lib/backups/passcode";

import {
  checkRestoreRateLimit,
  recordFailedRestoreAttempt,
  clearRestoreRateLimit,
} from "@/lib/backups/rate-limit";

import { acquireRestoreLock } from "@/lib/backups/restore-lock";

export const runtime = "nodejs";

/**
 * GET /api/admin/backups/history
 *
 * Returns paginated safety backup history.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const pageValue = Number(searchParams.get("page") ?? "1");
    const limitValue = Number(searchParams.get("limit") ?? "10");

    if (
      !Number.isInteger(pageValue) ||
      pageValue < 1 ||
      !Number.isInteger(limitValue) ||
      limitValue < 1 ||
      limitValue > 50
    ) {
      throw new ApiError(
        400,
        "Invalid pagination values.",
        "INVALID_PAGINATION"
      );
    }

    const result = await listSafetyBackups(
      pageValue,
      limitValue
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

/**
 * DELETE /api/admin/backups/history
 *
 * Permanently deletes a selected safety backup.
 * Requires admin authentication and restore passcode.
 */
export async function DELETE(request: NextRequest) {
  let releaseLock: (() => void) | undefined;

  try {
    const admin = await requireAdmin();
    const adminId = String(admin._id);

    checkRestoreRateLimit(adminId);

    const body = await request.json().catch(() => null);

    const backupId =
      typeof body?.backupId === "string"
        ? body.backupId.trim()
        : "";

    const passcode =
      typeof body?.passcode === "string"
        ? body.passcode
        : "";

    if (!backupId) {
      throw new ApiError(
        400,
        "Please select a backup to delete.",
        "BACKUP_ID_REQUIRED"
      );
    }

    if (!passcode) {
      throw new ApiError(
        400,
        "Restore passcode is required.",
        "PASSCODE_REQUIRED"
      );
    }

    const isValidPasscode = verifyRestorePasscode(passcode);

    if (!isValidPasscode) {
      recordFailedRestoreAttempt(adminId);

      throw new ApiError(
        401,
        "The restore passcode is incorrect.",
        "INVALID_RESTORE_PASSCODE"
      );
    }

    clearRestoreRateLimit(adminId);

    const lock = await acquireRestoreLock();
    releaseLock = lock.release;

    await deleteSafetyBackup(backupId);

    console.info("Safety backup permanently deleted:", {
      adminId,
      backupId,
      deletedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Safety backup permanently deleted.",
    });
  } catch (error) {
    return handleApiError(error, request);
  } finally {
    releaseLock?.();
  }
}
