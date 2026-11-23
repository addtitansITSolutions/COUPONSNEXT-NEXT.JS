import { ApiError } from "@/lib/errors/ApiError";

type RateLimitRecord = {
  attempts: number;
  windowStartedAt: number;
  blockedUntil: number | null;
};

const MAX_ATTEMPTS = 5;
const WINDOW_DURATION_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 15 * 60 * 1000;
const MAX_RECORDS = 10_000;

const attempts = new Map<string, RateLimitRecord>();

function getRecord(key: string): RateLimitRecord {
  const now = Date.now();
  const existing = attempts.get(key);
  if (existing?.blockedUntil && existing.blockedUntil > now) {
    return existing;
  }

  if ( !existing || now - existing.windowStartedAt >= WINDOW_DURATION_MS || (existing.blockedUntil !== null && existing.blockedUntil <= now) ) {
    const freshRecord: RateLimitRecord = {
      attempts: 0,
      windowStartedAt: now,
      blockedUntil: null,
    };
    attempts.set(key, freshRecord);
    return freshRecord;
  }
  return existing;
}

/**
 * Checks whether an IP is allowed to attempt a restore passcode.
 */
export function checkRestoreRateLimit(key: string): void {
  const record = getRecord(key);

  if (record.blockedUntil && record.blockedUntil > Date.now()) {
    throw new ApiError(
      429,
      "Too many failed restore attempts. Please try again in 15 minutes.",
      "RESTORE_RATE_LIMITED"
    );
  }
}

/**
 * Records a failed passcode attempt.
 */
export function recordFailedRestoreAttempt(key: string): void {
  const record = getRecord(key);

  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.blockedUntil = Date.now() + BLOCK_DURATION_MS;
  }

  attempts.set(key, record);

  // Keep memory usage bounded.
  if (attempts.size > MAX_RECORDS) {
    const now = Date.now();

    for (const [recordKey, value] of attempts) {
      if (
        value.blockedUntil === null &&
        now - value.windowStartedAt >= WINDOW_DURATION_MS
      ) {
        attempts.delete(recordKey);
      }

      if (attempts.size <= MAX_RECORDS) break;
    }
  }
}

/**
 * Clears failed attempts after successful verification.
 */
export function clearRestoreRateLimit(key: string): void {
  attempts.delete(key);
}
