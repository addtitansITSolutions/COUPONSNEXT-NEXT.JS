
"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "@/components/ui/toast/toast";

interface BlogImageFieldProps {
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (url: string) => void;
  onUploadingChange: (uploading: boolean) => void;
  onClearError: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function uploadBlogImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "blogs");

  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Unable to upload blog image.");
  }

  const imageUrl = result?.image?.url;

  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
    throw new Error("The upload response did not contain an image URL.");
  }

  return imageUrl;
}

export default function BlogImageField({
  value,
  error,
  disabled = false,
  onChange,
  onUploadingChange,
  onClearError,
}: BlogImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const busy = disabled || uploading;
  const displayedImage = preview || value;

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  async function handleFile(file?: File) {
    if (!file || busy) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size must be 5 MB or less.");
      return;
    }

    onClearError();

    const localPreview = URL.createObjectURL(file);

    setPreview(localPreview);
    setUploading(true);
    onUploadingChange(true);

    try {
      const imageUrl = await uploadBlogImage(file);

      // The parent tracks uploaded URLs for cleanup if the form is cancelled.
      onChange(imageUrl);
      setPreview(null);

      toast.success("Blog image uploaded.");
    } catch (error) {
      setPreview(null);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to upload blog image."
      );
    } finally {
      setUploading(false);
      onUploadingChange(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    void handleFile(event.dataTransfer.files?.[0]);
  }

  function handleRemove() {
    if (busy) return;

    setPreview(null);
    onChange("");
    onClearError();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-[var(--brand-navy)]">
          Featured image
        </label>

        <span className="text-xs text-slate-500">
          Optional · Max 5 MB
        </span>
      </div>

      {displayedImage ? (
        <div className="rounded-xl border border-[var(--border)] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-50 sm:w-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayedImage}
                alt="Blog featured image preview"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Replace image
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={handleRemove}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
            dragging
              ? "border-[var(--brand-purple)] bg-purple-50"
              : "border-slate-300 hover:border-[var(--brand-purple)]"
          } ${busy ? "opacity-60" : ""}`}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-[var(--brand-purple)]">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
          </div>

          <p className="mt-3 text-sm font-semibold text-[var(--brand-navy)]">
            {uploading ? "Uploading image..." : "Upload a featured image"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Drag and drop, or choose a file
          </p>

          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="mt-4 rounded-lg bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            Choose image
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        disabled={busy}
        className="hidden"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-slate-500">
        Featured images are optional. You can publish a blog without one.
      </p>
    </div>
  );
}
