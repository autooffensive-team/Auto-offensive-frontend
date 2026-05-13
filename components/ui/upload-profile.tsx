"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Camera, ImagePlus, LoaderCircle, Upload, User, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UploadProfileProps = {
  className?: string;
  currentImage?: string | null;
  displayName?: string;
  onUploaded?: () => void;
  /** When true, shows only the avatar — clicking opens a modal for upload. */
  compact?: boolean;
};

function resolveImageSource(value?: string | null): string | null {
  const normalized = value?.trim();
  if (!normalized) return null;

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
  compact = false,
}: UploadProfileProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const remoteImage = resolveImageSource(currentImage);
  const previewImage = localPreview ?? remoteImage;
  const initials = getInitials(displayName);

  useEffect(() => {
    if (!selectedFile) {
      setLocalPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setLocalPreview(objectUrl);
    return () => { URL.revokeObjectURL(objectUrl); };
  }, [selectedFile]);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function clearSelection(options?: { clearFeedback?: boolean }) {
    setSelectedFile(null);
    if (options?.clearFeedback ?? true) setFeedback(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function closeModal() {
    setModalOpen(false);
    clearSelection();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "Please choose an image file." });
      clearSelection({ clearFeedback: false });
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setFeedback({ type: "error", message: "Please choose an image smaller than 1MB." });
      clearSelection({ clearFeedback: false });
      return;
    }

    setSelectedFile(file);
    setFeedback(null);

    // In compact mode, open modal automatically when file is picked
    if (compact) setModalOpen(true);
  }

  async function handleUpload() {
    if (!selectedFile) return;

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
            typeof payload.detail === "string" ? payload.detail
            : typeof payload.error === "string" ? payload.error
            : typeof payload.message === "string" ? payload.message
            : null;
          if (detail) message = detail;
        } else {
          const text = (await response.text()).trim();
          if (text) message = text;
        }
        throw new Error(message);
      }

      clearSelection({ clearFeedback: false });
      setFeedback({ type: "success", message: "Profile image updated!" });
      onUploaded?.();

      // Auto-close modal after success
      setTimeout(() => {
        setModalOpen(false);
        setFeedback(null);
      }, 1500);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't upload your image right now. Please try again.";
      setFeedback({ type: "error", message });
    } finally {
      setIsUploading(false);
    }
  }

  // Avatar element (shared between compact and full modes)
  const avatarElement = (
    <div className="relative">
      <button
        type="button"
        onClick={compact ? () => { openFilePicker(); } : openFilePicker}
        className={cn(
          "group relative flex items-center justify-center overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
          compact
            ? "size-32 rounded-2xl border-0"
            : "size-24 rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700",
        )}
      >
        {previewImage ? (
          <img
            src={previewImage}
            alt={displayName ? `${displayName} profile image` : "Profile image"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-500 to-blue-500 text-2xl font-bold text-white">
            {initials || <User className="size-8" />}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25" />
        <span className="absolute bottom-2 right-2 rounded-full bg-white/90 p-1.5 text-gray-700 shadow-md opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-800/90 dark:text-gray-200">
          <Camera className="size-4" />
        </span>
      </button>
    </div>
  );

  // Compact mode: avatar + modal popup
  if (compact) {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        {avatarElement}

        {/* Hidden file input */}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Modal overlay */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" as const }}
                className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900"
              >
                {/* Close button */}
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                >
                  <X className="size-5" />
                </button>

                {/* Header */}
                <div className="mb-5 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Update Profile Photo
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    JPG, PNG, or WebP up to 1MB
                  </p>
                </div>

                {/* Preview */}
                <div className="mb-5 flex justify-center">
                  <div className="size-36 overflow-hidden rounded-2xl border-2 border-gray-100 shadow-sm dark:border-gray-800">
                    {localPreview ? (
                      <img
                        src={localPreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : previewImage ? (
                      <img
                        src={previewImage}
                        alt="Current"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <ImagePlus className="size-10 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* File name */}
                {selectedFile && (
                  <p className="mb-4 truncate text-center text-sm text-gray-600 dark:text-gray-300">
                    {selectedFile.name}
                  </p>
                )}

                {/* Feedback */}
                {feedback && (
                  <p
                    className={cn(
                      "mb-4 text-center text-sm",
                      feedback.type === "error"
                        ? "text-red-600 dark:text-red-400"
                        : "text-teal-600 dark:text-teal-400",
                    )}
                  >
                    {feedback.message}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openFilePicker}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    Choose another
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 size-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full (non-compact) mode — original layout
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {avatarElement}

      {selectedFile && (
        <button
          type="button"
          onClick={() => clearSelection()}
          className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          <X className="size-4" />
        </button>
      )}

      <div className="space-y-1 text-center">
        <p className="max-w-44 truncate text-sm font-medium text-gray-700 dark:text-gray-200">
          {selectedFile?.name ?? (remoteImage ? "Current profile image" : "Upload a profile image")}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          JPG, PNG, or WebP up to 1MB
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

      {feedback && (
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
      )}
    </div>
  );
}
