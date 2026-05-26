'use client';

import React, { useMemo } from 'react';
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

  return (
    <section className={`w-full bg-[#F7F5F0] px-4 py-16 dark:bg-[#09090B] sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">
        <div
          className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] bg-[#111214]"
        >
          <div className="relative aspect-video w-full">
            {isYoutube ? (
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
                playsInline
              />
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
      ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
      : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";

  return (
    <VideoThumbnailPlayer
      title={t('title')}
      subtitle={t('subtitle')}
      eyebrow={t('eyebrow')}
      playLabel={t('playLabel')}
      fontFamily={fontFamily}
      thumbnailUrl="https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1600&h=900&fit=crop"
      videoUrl="https://www.youtube.com/embed/4LSkSDirDD0"
    />
  );
}
