"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Camera, LoaderCircle, Upload, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STOCK_PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80";

type UploadProfileProps = {
  className?: string;
  currentImage?: string | null;
  displayName?: string;
  onUploaded?: () => void;
};

function resolveImageSource(value?: string | null): string | null {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:") ||
    normalized.startsWith("/")
  ) {
    return normalized;
  }

  return `/api/backend/${normalized.replace(/^\/+/, "")}`;
}

function getInitials(name?: string): string {
  return (
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export function UploadProfile({
  className,
  currentImage,
  displayName,
  onUploaded,
}: UploadProfileProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const remoteImage = resolveImageSource(currentImage);
  const previewImage = localPreview ?? remoteImage ?? STOCK_PREVIEW_IMAGE;
  const initials = getInitials(displayName);

  useEffect(() => {
    if (!selectedFile) {
      setLocalPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setLocalPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function clearSelection(options?: { clearFeedback?: boolean }) {
    setSelectedFile(null);
    if (options?.clearFeedback ?? true) {
      setFeedback(null);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "Please choose an image file." });
      clearSelection({ clearFeedback: false });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: "error", message: "Please choose an image smaller than 10MB." });
      clearSelection({ clearFeedback: false });
      return;
    }

    setSelectedFile(file);
    setFeedback(null);
  }

  async function handleUpload() {
    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsUploading(true);

      const response = await fetch("/api/backend/users/me/profile-image", {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        let message = `Upload failed with status ${response.status}.`;

        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const payload = (await response.json()) as Record<string, unknown>;
          const detail =
            typeof payload.detail === "string"
              ? payload.detail
              : typeof payload.error === "string"
                ? payload.error
                : typeof payload.message === "string"
                  ? payload.message
                  : null;

          if (detail) {
            message = detail;
          }
        } else {
          const text = (await response.text()).trim();
          if (text) {
            message = text;
          }
        }

        throw new Error(message);
      }

      clearSelection({ clearFeedback: false });
      setFeedback({ type: "success", message: "Profile image updated successfully." });
      onUploaded?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't upload your image right now. Please try again.";
      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <button
          type="button"
          onClick={openFilePicker}
          className="group relative flex size-24 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          {previewImage ? (
            <img
              src={previewImage}
              alt={displayName ? `${displayName} profile image` : "Profile image"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-teal-500 to-blue-500 text-xl font-bold text-white">
              {initials || <User className="size-6" />}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          <span className="absolute bottom-2 right-2 rounded-full bg-gray-900 p-1.5 text-white shadow-sm">
            <Camera className="size-3.5" />
          </span>
        </button>

        {selectedFile ? (
          <button
            type="button"
            onClick={() => clearSelection()}
            className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="space-y-1 text-center">
        <p className="max-w-44 truncate text-sm font-medium text-gray-700 dark:text-gray-200">
          {selectedFile?.name ?? (remoteImage ? "Current profile image" : "Upload a profile image")}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          JPG, PNG, or WebP up to 10MB
        </p>
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="outline" onClick={openFilePicker} disabled={isUploading}>
          {selectedFile || remoteImage ? "Change image" : "Upload image"}
        </Button>
        <Button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>
          {isUploading ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 size-4" />
              Save image
            </>
          )}
        </Button>
      </div>

      {feedback ? (
        <p
          className={cn(
            "max-w-56 text-center text-xs",
            feedback.type === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-teal-600 dark:text-teal-400",
          )}
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
