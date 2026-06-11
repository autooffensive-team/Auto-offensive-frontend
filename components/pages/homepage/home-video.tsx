'use client';

import React, { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

interface VideoThumbnailPlayerProps {
  title: string;
  subtitle?: string;
  eyebrow: string;
  playLabel: string;
  fontFamily: string;
  thumbnailUrl: string;
  videoUrl: string;
  className?: string;
  onPlay?: () => void;
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.pathname.includes('/embed/')) {
      parsed.searchParams.set('autoplay', '1');
      parsed.searchParams.set('rel', '0');
      return parsed.toString();
    }

    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '');
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
    }

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export const VideoThumbnailPlayer: React.FC<VideoThumbnailPlayerProps> = ({
  title,
  subtitle,
  eyebrow,
  playLabel,
  fontFamily,
  thumbnailUrl,
  videoUrl,
  className = '',
  onPlay,
}) => {
  const youtubeEmbedUrl = useMemo(() => getYouTubeEmbedUrl(videoUrl), [videoUrl]);
  const isYoutube = Boolean(youtubeEmbedUrl);
  const [isPlaying, setIsPlaying] = useState(false);

  function handlePlay() {
    setIsPlaying(true);
    onPlay?.();
  }

  return (
    <section className={`w-full bg-[#F7F5F0] px-4 py-16 dark:bg-[#09090B] sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">
        <div
          className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] bg-[#111214]"
        >
          <div className="relative aspect-video w-full">
            {isPlaying ? (
              isYoutube ? (
                <iframe
                  src={youtubeEmbedUrl ?? undefined}
                  title={title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  src={videoUrl}
                  className="h-full w-full object-cover"
                  controls
                  autoPlay
                  playsInline
                />
              )
            ) : (
              <button
                type="button"
                onClick={handlePlay}
                className="group relative h-full w-full cursor-pointer border-none bg-transparent p-0"
                aria-label={playLabel || 'Play video'}
              >
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                    <svg
                      viewBox="0 0 24 24"
                      fill="#111214"
                      className="ml-1 h-7 w-7 sm:h-8 sm:w-8"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function HomeVideo() {
  const t = useTranslations('homepage.video');
  const locale = useLocale();
  const fontFamily =
locale === "km"
       ? "var(--font-kantumruy-pro), var(--font-google-sans), sans-serif"
       : "var(--font-google-sans), var(--font-kantumruy-pro), sans-serif";

  return (
    <VideoThumbnailPlayer
      title={t('title')}
      subtitle={t('subtitle')}
      eyebrow={t('eyebrow')}
      playLabel={t('playLabel')}
      fontFamily={fontFamily}
      thumbnailUrl="/Thumnail.webp"
      videoUrl="https://www.youtube.com/embed/4LSkSDirDD0"
    />
  );
}
