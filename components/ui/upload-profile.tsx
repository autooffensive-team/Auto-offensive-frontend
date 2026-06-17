"use client";

import { useEffect, useId, useRef, useState, useCallback } from "react";
import { Camera, ImagePlus, LoaderCircle, Upload, User, X, Crop } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadProfileProps = {
  className?: string;
  currentImage?: string | null;
  displayName?: string;
  onUploaded?: () => void;
  /** When true, shows only the avatar — clicking opens a modal for upload. */
  compact?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

/** Pixel-inspect canvas to detect any semi-transparent pixels in a PNG. */
function checkTransparency(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Sample a max 200×200 region to keep it fast
      canvas.width = Math.min(img.naturalWidth, 200);
      canvas.height = Math.min(img.naturalHeight, 200);
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(false); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) { resolve(true); return; }
      }
      resolve(false);
    };
    img.onerror = () => resolve(false);
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

/** Checkerboard inline style — shows behind transparent PNGs */
const checkerStyle: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(45deg, #d1d5db 25%, transparent 25%),
    linear-gradient(-45deg, #d1d5db 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #d1d5db 75%),
    linear-gradient(-45deg, transparent 75%, #d1d5db 75%)
  `,
  backgroundSize: "12px 12px",
  backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
  backgroundColor: "#f9fafb",
};

const checkerStyleDark: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(45deg, #374151 25%, transparent 25%),
    linear-gradient(-45deg, #374151 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #374151 75%),
    linear-gradient(-45deg, transparent 75%, #374151 75%)
  `,
  backgroundSize: "12px 12px",
  backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
  backgroundColor: "#1f2937",
};

function defaultCrop(width: number, height: number): CropType {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),
    width,
    height,
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UploadProfile({
  className,
  currentImage,
  displayName,
  onUploaded,
  compact = false,
}: UploadProfileProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const cropImgRef = useRef<HTMLImageElement>(null);

  // Raw file before crop
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);

  // Cropped result
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isTransparent, setIsTransparent] = useState(false);

  // UI state
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState<CropType | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const remoteImage = resolveImageSource(currentImage);
  const previewImage = localPreview ?? remoteImage;
  const initials = getInitials(displayName);

  // Detect dark mode for checkerboard variant
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Check transparency whenever localPreview changes and file is PNG
  useEffect(() => {
    if (!localPreview || !selectedFile?.type.includes("png")) {
      setIsTransparent(false);
      return;
    }
    void checkTransparency(localPreview).then(setIsTransparent);
  }, [localPreview, selectedFile]);

  // Revoke raw preview URL
  useEffect(() => {
    if (!rawPreviewUrl) return;
    return () => { URL.revokeObjectURL(rawPreviewUrl); };
  }, [rawPreviewUrl]);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function clearAll(opts?: { clearFeedback?: boolean }) {
    setSelectedFile(null);
    setLocalPreview(null);
    setRawFile(null);
    setRawPreviewUrl(null);
    setIsTransparent(false);
    if (opts?.clearFeedback ?? true) setFeedback(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function closeModal() {
    setModalOpen(false);
    clearAll();
  }

  function closeCropModal() {
    setCropModalOpen(false);
    setRawFile(null);
    setRawPreviewUrl(null);
    setCrop(undefined);
    if (inputRef.current) inputRef.current.value = "";
  }

  // ── File picked → validate → open crop ─────────────────────────────────────
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "Please choose an image file." });
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setFeedback({
        type: "error",
        message: "That image is a bit too large — please keep it under 1 MB 🙏",
      });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFeedback(null);
    const url = URL.createObjectURL(file);
    setRawFile(file);
    setRawPreviewUrl(url);
    setCrop(undefined); // reset; will be set on image load
    setCropModalOpen(true);
  }

  // ── Set initial crop once crop-image loads ──────────────────────────────────
  const onCropImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setCrop(defaultCrop(naturalWidth, naturalHeight));
  }, []);

  // ── Apply crop → produce File → show in main modal ─────────────────────────
  async function applyCrop() {
    const img = cropImgRef.current;
    if (!img || !crop || !rawFile) return;

    const canvas = document.createElement("canvas");
    const scaleX = img.naturalWidth / img.offsetWidth;
    const scaleY = img.naturalHeight / img.offsetHeight;

    // Convert % crop to pixels if needed
    let pixelCrop = crop;
    if (crop.unit === "%") {
      pixelCrop = {
        unit: "px",
        x: (crop.x / 100) * img.offsetWidth,
        y: (crop.y / 100) * img.offsetHeight,
        width: (crop.width / 100) * img.offsetWidth,
        height: (crop.height / 100) * img.offsetHeight,
      };
    }

    canvas.width = pixelCrop.width! * scaleX;
    canvas.height = pixelCrop.height! * scaleY;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
      img,
      pixelCrop.x! * scaleX,
      pixelCrop.y! * scaleY,
      pixelCrop.width! * scaleX,
      pixelCrop.height! * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const mimeType = rawFile.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, mimeType, 0.92));
    if (!blob) return;

    const croppedFile = new File([blob], rawFile.name, { type: mimeType });
    const croppedUrl = URL.createObjectURL(croppedFile);

    setSelectedFile(croppedFile);
    setLocalPreview(croppedUrl);
    setCropModalOpen(false);

    if (compact) setModalOpen(true);
  }

  // ── Upload ──────────────────────────────────────────────────────────────────
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
        let message = `Upload failed (${response.status}).`;
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

      clearAll({ clearFeedback: false });
      setFeedback({ type: "success", message: "Profile image updated!" });
      onUploaded?.();

      setTimeout(() => {
        setModalOpen(false);
        setFeedback(null);
      }, 1500);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Couldn't upload right now — please try again.";
      setFeedback({ type: "error", message });
    } finally {
      setIsUploading(false);
    }
  }

  // ── Shared preview box (respects transparency) ─────────────────────────────
  function PreviewBox({ size = "size-36", src }: { size?: string; src: string | null }) {
    const bgStyle = isTransparent ? (isDarkMode ? checkerStyleDark : checkerStyle) : {};
    return (
      <div
        className={cn(size, "overflow-hidden rounded-2xl border-2 border-gray-100 shadow-sm dark:border-gray-800")}
        style={bgStyle}
      >
        {src ? (
          <Image src={src} alt="Preview" className="h-full w-full object-cover" width={80} height={80} unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-800">
            <ImagePlus className="size-10 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </div>
    );
  }

  // ── Avatar button (shared) ─────────────────────────────────────────────────
  const avatarElement = (
    <div className="relative">
      <button
        type="button"
        onClick={openFilePicker}
        className={cn(
          "group relative flex items-center justify-center overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
          compact
            ? "size-32 rounded-2xl border-0"
            : "size-24 rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700",
        )}
        style={isTransparent && previewImage ? (isDarkMode ? checkerStyleDark : checkerStyle) : {}}
      >
        {previewImage ? (
          <img
            src={previewImage}
            alt={displayName ? `${displayName} profile image` : "Profile image"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-teal-500 to-blue-500 text-2xl font-bold text-white">
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

  // ── Crop modal (shared between compact and full) ────────────────────────────
  const cropModal = (
    <AnimatePresence>
      {cropModalOpen && rawPreviewUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeCropModal(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg rounded-3xl bg-[#FCFCFA] p-6 shadow-2xl dark:bg-gray-900"
          >
            <button
              type="button"
              onClick={closeCropModal}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              <X className="size-5" />
            </button>

            <div className="mb-5 text-center">
              <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/50">
                <Crop className="size-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Crop your photo
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Drag to reposition · Resize the corners
              </p>
            </div>

            {/* Crop area */}
            <div className="mb-5 flex justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
              <ReactCrop
                crop={crop}
                onChange={(_, pct) => setCrop(pct)}
                aspect={1}
                circularCrop={false}
                className="max-h-72"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={cropImgRef}
                  src={rawPreviewUrl}
                  alt="Crop preview"
                  onLoad={onCropImageLoad}
                  className="max-h-72 w-auto object-contain"
                />
              </ReactCrop>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeCropModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={applyCrop}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Crop className="mr-2 size-4" />
                Apply Crop
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Compact mode ───────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        {avatarElement}

        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {cropModal}

        {/* Upload modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative w-full max-w-sm rounded-3xl bg-[#FCFCFA] p-6 shadow-2xl dark:bg-gray-900"
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                >
                  <X className="size-5" />
                </button>

                <div className="mb-5 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Update Profile Photo
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    JPG, PNG, or WebP · max 1 MB
                  </p>
                </div>

                {/* Preview with transparent bg support */}
                <div className="mb-5 flex justify-center">
                  <PreviewBox src={localPreview ?? remoteImage} />
                </div>

                {/* Transparent PNG hint */}
                {isTransparent && (
                  <p className="mb-3 text-center text-xs text-gray-400 dark:text-gray-500">
                    ✦ Transparent background detected — the checkerboard is just a preview aid.
                  </p>
                )}

                {selectedFile && (
                  <p className="mb-4 truncate text-center text-sm text-gray-600 dark:text-gray-300">
                    {selectedFile.name}
                  </p>
                )}

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
                      <><LoaderCircle className="mr-2 size-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Upload className="mr-2 size-4" /> Save</>
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

  // ── Full (non-compact) mode ────────────────────────────────────────────────
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {avatarElement}

      {selectedFile && (
        <button
          type="button"
          onClick={() => clearAll()}
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
          JPG, PNG, or WebP · max 1 MB
        </p>
        {isTransparent && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            ✦ Transparent PNG detected
          </p>
        )}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {cropModal}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="outline" onClick={openFilePicker} disabled={isUploading}>
          {selectedFile || remoteImage ? "Change image" : "Upload image"}
        </Button>
        <Button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>
          {isUploading ? (
            <><LoaderCircle className="mr-2 size-4 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="mr-2 size-4" /> Save image</>
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