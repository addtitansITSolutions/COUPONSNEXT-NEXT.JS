"use client";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "@/components/ui/toast/toast";
interface StoreImageFieldProps {
  label: string;
  folder: "logos" | "banners";
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (url: string) => void;
  onUploadingChange: (uploading: boolean) => void;
  onClearError: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function isLocalUpload(url: string): boolean {
  return url.startsWith("/uploads/") && !url.startsWith("//");
}

async function uploadStoreImage( file: File, folder: "logos" | "banners" ): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Image upload failed.");
  }
  const imageUrl = data?.image?.url;
  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
    throw new Error("The upload API did not return an image URL.");
  }
  return imageUrl;
}

export default function StoreImageField({ label, folder, value, error, disabled = false, onChange, onUploadingChange, onClearError, }: StoreImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const busy = disabled || uploading || removing;
  const displayedImage = preview || value;

  useEffect(() => {
    if (!preview) return;
    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const uploadFile = async (file: File) => {
    if (busy) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP image.", {
        title: "Unsupported image",
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("The image must be 5 MB or smaller.", {
        title: "Image is too large",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);
    setUploading(true);
    onUploadingChange(true);
    onClearError();

    try {
      const uploadedUrl = await uploadStoreImage(file, folder);
      // The parent tracks the new URL and decides when old images
      // are safe to delete. Do not delete the current image here.
      onChange(uploadedUrl);
      setPreview(null);
      toast.success("Image uploaded successfully.", {
        title: "Upload complete",
      });
    } catch (error) {
      setPreview(null);
      const message = error instanceof Error ? error.message : "Image upload failed.";
      toast.error(message, { title: "Upload failed" });
    } finally {
      setUploading(false);
      onUploadingChange(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void uploadFile(file);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!busy) setDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    if (busy) return;

    const file = event.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  const handleRemove = () => {
    if (busy || !value) return;

    // Clear the field only. StoreForm handles image cleanup safely
    // after a successful save, or cleans unsaved uploads on cancel.
    setRemoving(true);

    try {
      onChange("");
      onClearError();

      toast.success("Image removed from this form.", {
        title: "Image removed",
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>

        {value && !busy && (
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 transition hover:text-red-700"
          >
            <Trash2 size={13} />
            Remove
          </button>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex min-h-44 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition ${
          dragging
            ? "border-[var(--brand-purple)] bg-purple-50"
            : error
              ? "border-red-300 bg-red-50/30"
              : "border-gray-200 bg-gray-50/60 hover:border-gray-300"
        } ${busy ? "cursor-not-allowed opacity-70" : ""}`}
      >
        {displayedImage ? (
          <>
            <div className="flex min-h-44 w-full items-center justify-center p-4">
              <img
                src={displayedImage}
                alt={`${label} preview`}
                className="max-h-36 max-w-full rounded-lg object-contain"
              />
            </div>

            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85">
                <Loader2
                  size={25}
                  className="animate-spin text-[var(--brand-purple)]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Uploading image...
                </span>
              </div>
            )}

            {!busy && (
              <div className="flex w-full justify-center border-t border-gray-100 bg-white px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-purple)] transition hover:opacity-80"
                >
                  <Upload size={15} />
                  Replace image
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex min-h-44 w-full flex-col items-center justify-center px-4 py-6 text-center disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2
                size={27}
                className="mb-3 animate-spin text-[var(--brand-purple)]"
              />
            ) : (
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-[var(--brand-purple)]">
                {dragging ? (
                  <ImagePlus size={23} />
                ) : (
                  <Upload size={22} />
                )}
              </div>
            )}

            <span className="text-sm font-medium text-gray-800">
              {uploading
                ? "Uploading image..."
                : dragging
                  ? "Drop image to upload"
                  : "Click to upload or drag and drop"}
            </span>

            <span className="mt-1.5 text-xs text-gray-500">
              JPG, PNG or WebP · Maximum 5 MB
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={busy}
          className="hidden"
          aria-label={`Upload ${label.toLowerCase()}`}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
