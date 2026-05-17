"use client";

/**
 * Plays a short notification sound when a scan reaches a terminal state.
 *
 * Uses a single MP3 served from /public/sounds. The HTMLAudioElement is
 * created lazily on first call and cached so we do not refetch the asset.
 *
 * Browsers gate audio playback on a user gesture; the scan-submit click
 * counts, so by the time a job reaches "completed" the gesture chain is
 * unlocked. If `play()` is rejected (e.g. tab opened in background that
 * never received a click), this is a silent no-op — the toast still shows.
 */

export type ScanSoundKind = "success" | "warning" | "error";

const SOUND_SRC = "/sounds/relax-message-tone.mp3";

let cachedAudio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (!cachedAudio) {
        try {
            cachedAudio = new Audio(SOUND_SRC);
            cachedAudio.preload = "auto";
            // Comfortable default; users can lower their system volume if needed.
            cachedAudio.volume = 0.7;
        } catch {
            cachedAudio = null;
        }
    }
    return cachedAudio;
}

export async function playScanCompleteSound(_kind: ScanSoundKind): Promise<void> {
    const audio = getAudio();
    if (!audio) return;

    try {
        // Rewind in case the previous play() left the cursor at the end.
        audio.currentTime = 0;
        await audio.play();
    } catch {
        // Autoplay blocked or asset missing — degrade silently.
    }
}
