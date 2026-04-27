'use client';

import React, { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';

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
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const youtubeEmbedUrl = useMemo(() => getYouTubeEmbedUrl(videoUrl), [videoUrl]);
  const isYoutube = Boolean(youtubeEmbedUrl);

  const handlePlayClick = () => {
    setIsPlaying(true);
    onPlay?.();
  };

  return (
    <section className={`w-full bg-[#F7F5F0] px-4 py-16 dark:bg-[#09090B] sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">
        <div
          className="group relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#DDD6CA] bg-[#111214]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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
              <>
                <Image
                  src={thumbnailUrl}
                  alt={title}
                  fill
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ${
                    isHovered ? 'scale-[1.04]' : 'scale-100'
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.08)_45%,rgba(0,0,0,0.62)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.62)_62%,rgba(0,0,0,0.84)_100%)]" />

                <button
                  type="button"
                  onClick={handlePlayClick}
                  className="absolute inset-0 z-20 flex items-center justify-center"
                  aria-label={`${playLabel}: ${title}`}
                >
                  <span
                    className={`flex h-18 w-18 items-center justify-center rounded-full border border-white/25 bg-white/12 backdrop-blur-md transition-all duration-300 sm:h-21 sm:w-21 ${
                      isHovered ? 'scale-110 bg-white/18' : ''
                    }`}
                  >
                    <span className="ml-1 h-0 w-0 border-y-13 border-y-transparent border-l-21 border-l-white sm:border-y-15 sm:border-l-25" />
                  </span>
                </button>

                <div className="absolute bottom-0 left-0 z-30 hidden max-w-[78%] p-6 sm:block sm:p-8 md:p-10">
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72">
                    {eyebrow}
                  </p>
                  <h2
                    className={`text-[clamp(2rem,4vw,4.2rem)] font-bold leading-[1.05] tracking-[-0.04em] text-white transition-transform duration-300 ${
                      isHovered ? '-translate-y-1' : 'translate-y-0'
                    }`}
                    style={{ fontFamily }}
                  >
                    {title}
                  </h2>
                  {subtitle ? (
                    <p
                      className="mt-3 max-w-2xl text-[16px] leading-[1.75] text-white/76 sm:text-[18px]"
                      style={{ fontFamily }}
                    >
                      {subtitle}
                    </p>
                  ) : null}
                </div>
              </>
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
    locale === "kh"
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
      videoUrl="https://www.youtube.com/embed/RSw9066kqHw?si=tGNjgYblVnpV87lA"
    />
  );
}
