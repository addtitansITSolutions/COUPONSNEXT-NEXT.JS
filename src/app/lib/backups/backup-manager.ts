
import {
  lstat,
  readdir,
  unlink,
} from "node:fs/promises";

import { isAbsolute, join } from "node:path";

import { ApiError } from "@/lib/errors/ApiError";

export type SafetyBackupType = "database" | "uploads";

export interface SafetyBackup {
  id: string;
  type: SafetyBackupType;
  filename: string;
  createdAt: string;
  sizeBytes: number;
}

export interface SafetyBackupList {
  backups: SafetyBackup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const BACKUP_FILENAME_REGEX =
  /^safety-(database|uploads)-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)\.(archive\.gz|zip)$/;

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

function parseBackupFilename(
  filename: string
): SafetyBackup | null {
  const match = filename.match(BACKUP_FILENAME_REGEX);

  if (!match) return null;

  const [, type, timestamp, extension] = match;

  if (
    (type === "database" && extension !== "archive.gz") ||
    (type === "uploads" && extension !== "zip")
  ) {
    return null;
  }

  const isoTimestamp = timestamp.replace(
    /^(\d{4}-\d{2}-\d{2}T)(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/,
    "$1$2:$3:$4.$5Z"
  );

  const date = new Date(isoTimestamp);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    id: filename,
    type: type as SafetyBackupType,
    filename,
    createdAt: date.toISOString(),
    sizeBytes: 0,
  };
}

/**
 * Lists safety backups with server-side pagination.
 */
export async function listSafetyBackups(
  page = 1,
  limit = 10
): Promise<SafetyBackupList> {
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 50
  ) {
    throw new ApiError(
      400,
      "Invalid backup pagination parameters.",
      "INVALID_BACKUP_PAGINATION"
    );
  }

  const backupDirectory = getBackupDirectory();

  let directoryStats;

  try {
    directoryStats = await lstat(backupDirectory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        backups: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    throw error;
  }

  if (
    !directoryStats.isDirectory() ||
    directoryStats.isSymbolicLink()
  ) {
    throw new ApiError(
      500,
      "The backup directory is invalid.",
      "BACKUP_DIRECTORY_INVALID"
    );
  }

  const entries = await readdir(backupDirectory, {
    withFileTypes: true,
  });

  const backups: SafetyBackup[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const backup = parseBackupFilename(entry.name);

    if (!backup) continue;

    const filePath = join(backupDirectory, entry.name);

    try {
      const fileStats = await lstat(filePath);

      if (!fileStats.isFile() || fileStats.isSymbolicLink()) {
        continue;
      }

      if (fileStats.size <= 0) continue;

      backup.sizeBytes = fileStats.size;
      backups.push(backup);
    } catch {
      // Ignore files that disappear during listing.
    }
  }

  backups.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const total = backups.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;

  return {
    backups: backups.slice(startIndex, startIndex + limit),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Resolves a backup ID to a validated existing file.
 */
export async function getSafetyBackupPath(
  backupId: string
): Promise<string> {
  const backup = parseBackupFilename(backupId);

  if (!backup || backup.id !== backupId) {
    throw new ApiError(
      400,
      "Invalid backup identifier.",
      "INVALID_BACKUP_ID"
    );
  }

  const backupDirectory = getBackupDirectory();
  const filePath = join(backupDirectory, backup.filename);

  try {
    const fileStats = await lstat(filePath);

    if (
      !fileStats.isFile() ||
      fileStats.isSymbolicLink() ||
      fileStats.size <= 0
    ) {
      throw new ApiError(
        404,
        "Backup file was not found.",
        "BACKUP_NOT_FOUND"
      );
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new ApiError(
        404,
        "Backup file was not found.",
        "BACKUP_NOT_FOUND"
      );
    }

    throw error;
  }

  return filePath;
}

/**
 * Permanently deletes a validated safety backup.
 */
export async function deleteSafetyBackup(
  backupId: string
): Promise<void> {
  const filePath = await getSafetyBackupPath(backupId);

  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new ApiError(
        404,
        "Backup file was not found.",
        "BACKUP_NOT_FOUND"
      );
    }

    throw error;
  }
}
