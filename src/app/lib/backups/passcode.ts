import { createHash, timingSafeEqual } from "node:crypto";
import { ApiError } from "@/lib/errors/ApiError";

const MIN_PASSCODE_LENGTH = 32;

/**
 * Verifies the restore passcode without exposing the configured secret.
 */
export function verifyRestorePasscode(candidate: unknown): boolean {
  const configuredPasscode = process.env.BACKUP_RESTORE_PASSCODE;
  if ( !configuredPasscode || configuredPasscode.length < MIN_PASSCODE_LENGTH ) {
    throw new ApiError(
      500,
      "Restore passcode is not configured correctly.",
      "RESTORE_PASSCODE_NOT_CONFIGURED"
    );
  }
  if ( typeof candidate !== "string" || candidate.length === 0 || candidate.length > 256 ) {
    return false;
  }
  // Hash both values to ensure equal-length buffers for comparison.
  const expectedHash = createHash("sha256").update(configuredPasscode, "utf8").digest();

  const candidateHash = createHash("sha256").update(candidate, "utf8").digest();

  return timingSafeEqual(expectedHash, candidateHash);
}