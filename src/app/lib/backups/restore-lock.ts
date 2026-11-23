import { mkdir, open, unlink } from "node:fs/promises";
import { join } from "node:path";
import { ApiError } from "@/lib/errors/ApiError";
const LOCK_FILENAME = ".couponsnext-restore.lock";
type RestoreLock = { release: () => Promise<void>; };
export async function acquireRestoreLock(): Promise<RestoreLock> {
  const backupDirectory = process.env.BACKUP_DIR;
  if (!backupDirectory) {
    throw new ApiError(
      500,
      "Backup directory configuration is missing.",
      "BACKUP_DIR_MISSING"
    );
  }
  await mkdir(backupDirectory, { recursive: true });
  const lockPath = join(backupDirectory, LOCK_FILENAME);
  let lockFile;
  try {
    // "wx" creates a new file and fails if it already exists.
    lockFile = await open(lockPath, "wx", 0o600);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EEXIST") {
      throw new ApiError(
        409,
        "Another restore operation is already in progress.",
        "RESTORE_ALREADY_RUNNING"
      );
    }
    throw new ApiError(
      500,
      "Unable to acquire the restore lock.",
      "RESTORE_LOCK_FAILED"
    );
  }

  await lockFile.writeFile(
    JSON.stringify({
      startedAt: new Date().toISOString(),
      processId: process.pid,
    })
  );

  await lockFile.close();

  let released = false;

  return {
    release: async () => {
      if (released) return;
      released = true;
      await unlink(lockPath).catch((error) => {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.error("Restore lock cleanup failed:", error);
        }
      });
    },
  };
}





// This utility ensures only one restore operation can run at a time. If another admin starts a restore while one is already running, the second request will be rejected.