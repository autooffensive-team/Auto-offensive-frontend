"use client";

import { useState, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Mode = "analysis" | "next_steps";

type Priority = "critical" | "high" | "medium" | "low";

interface Suggestion {
  title: string;
  tool_id: string;
  command: string;
  priority: Priority;
  reasoning: string;
  confidence: number;
  params: Record<string, unknown>;
}

interface AISuggestionResponse {
  id: string;
  job_id: string;
  mode: Mode;
  provider: string;
  model: string;
  content: string;
  output: {
    suggestions?: Suggestion[];
    [key: string]: unknown;
  };
  input_tokens: number;
  output_tokens: number;
  feedback: string;
  is_suggested: boolean;
  created_at: string | null;
  updated_at: string | null;
}

// ─── API helpers ─────────────────────────────────────────────────────────────
async function generateSuggestion(
  job_id: string,
  mode: Mode
): Promise<AISuggestionResponse> {
  const res = await fetch(`/api/backend/ai-suggestions/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id, mode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.[0]?.msg ?? err?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

async function fetchSuggestionById(
  suggestion_id: string
): Promise<AISuggestionResponse> {
  const res = await fetch(
    `/api/backend/ai-suggestions/${suggestion_id}`
  );
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

// ─── Priority config ─────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  Priority,
  { color: string; bg: string; border: string }
> = {
  critical: {
    color: "var(--ai-critical)",
    bg: "var(--ai-critical-bg)",
    border: "var(--ai-critical-border)",
  },
  high: {
    color: "var(--ai-high)",
    bg: "var(--ai-high-bg)",
    border: "var(--ai-high-border)",
  },
  medium: {
    color: "var(--ai-medium)",
    bg: "var(--ai-medium-bg)",
    border: "var(--ai-medium-border)",
  },
  low: {
    color: "var(--ai-text-accent)",
    bg: "var(--ai-neon-bg)",
    border: "var(--ai-neon-border)",
  },
};

// ─── Injected global styles ────────────────────────────────────────────────────
const AI_PANEL_STYLES = `
/* ── AI Panel CSS Variables ── */
:root {
  --ai-neon:            #00d0b2;
  --ai-neon-rgb:        0,208,178;
  --ai-neon2:           #00aaff;
  --ai-neon3:           #ff3cac;

  --ai-critical:        #ef4444;
  --ai-critical-bg:     rgba(239,68,68,0.08);
  --ai-critical-border: rgba(239,68,68,0.25);
  --ai-high:            #f59e0b;
  --ai-high-bg:         rgba(245,158,11,0.08);
  --ai-high-border:     rgba(245,158,11,0.25);
  --ai-medium:          #eab308;
  --ai-medium-bg:       rgba(234,179,8,0.08);
  --ai-medium-border:   rgba(234,179,8,0.25);
  --ai-neon-bg:         rgba(0,208,178,0.08);
  --ai-neon-border:     rgba(0,208,178,0.25);

  /* panel surfaces */
  --ai-panel-bg:        rgba(248,250,252,0.99);
  --ai-panel-border:    rgba(0,208,178,0.28);
  --ai-panel-hot:       rgba(0,208,178,0.55);
  --ai-header-bg:       rgba(241,245,249,0.97);
  --ai-card-bg:         rgba(255,255,255,0.94);
  --ai-card-border:     rgba(0,208,178,0.18);
  --ai-cmd-bg:          rgba(240,245,250,0.95);
  --ai-shimmer:         rgba(0,208,178,0.08);

  /* typography */
  --ai-text:            #0f172a;
  --ai-text-muted:      rgba(15,23,42,0.5);
  --ai-text-dim:        rgba(15,23,42,0.3);
  --ai-text-accent:     #0d9488;
  --ai-label:           rgba(15,23,42,0.42);

  /* backdrop */
  --ai-backdrop:        rgba(0,0,0,0.25);

  /* fonts — match LiveConsole */
  --ai-font-mono:       var(--font-fira-code), 'Fira Code', 'JetBrains Mono', monospace;
  --ai-font-ui:         var(--font-google-sans), 'Google Sans', sans-serif;
  --ai-font-display:    var(--font-hackdaddy), 'Hackdaddy', monospace;
}

.dark {
  --ai-panel-bg:        rgba(16,24,40,0.98);
  --ai-panel-border:    rgba(0,208,178,0.18);
  --ai-panel-hot:       rgba(0,208,178,0.45);
  --ai-header-bg:       rgba(12,19,33,0.99);
  --ai-card-bg:         rgba(20,29,46,0.88);
  --ai-card-border:     rgba(0,208,178,0.14);
  --ai-cmd-bg:          #080d15;
  --ai-shimmer:         rgba(0,208,178,0.05);
  --ai-text:            #e2e8f0;
  --ai-text-muted:      rgba(226,232,240,0.6);
  --ai-text-dim:        rgba(226,232,240,0.28);
  --ai-text-accent:     #00d0b2;
  --ai-label:           rgba(0,208,178,0.55);
  --ai-backdrop:        rgba(0,0,0,0.45);
}

/* ── Keyframes ── */
@keyframes ai-corner-pulse {
  0%,100% { opacity: 0.5; }
  50%      { opacity: 1;   }
}
@keyframes ai-shimmer {
  from { background-position: -200% center; }
  to   { background-position:  200% center; }
}
@keyframes ai-blink {
  0%,100% { opacity: 1;   }
  50%      { opacity: 0.1; }
}
@keyframes ai-spin {
  to { transform: rotate(360deg); }
}
@keyframes ai-slide-in {
  from { transform: translateX(420px); }
  to   { transform: translateX(0); }
}
@keyframes ai-bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40%           { transform: translateY(-7px); }
}
@keyframes ai-conf-fill {
  from { width: 0; }
}
@keyframes ai-stream-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: none; }
}
@keyframes ai-rotate-border {
  to { transform: rotate(360deg); }
}
@keyframes ai-path-sparkle {
  0%, 34%, 71%, 100% { transform: scale(1); }
  17%  { transform: scale(var(--scale_path_1, 1)); }
  49%  { transform: scale(var(--scale_path_2, 1)); }
  83%  { transform: scale(var(--scale_path_3, 1)); }
}

/* ── Trigger Button ── */
.ai-trigger-btn {
  --ai-btn-radius: 0.75rem;
  --ai-btn-transition: 0.3s ease-in-out;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.1rem;
  background: transparent;
  border: none;
  border-radius: var(--ai-btn-radius);
  transition: transform var(--ai-btn-transition);
}
.ai-trigger-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--ai-panel-bg);
  border: 1px solid var(--ai-neon);
  border-radius: var(--ai-btn-radius);
  transition: all var(--ai-btn-transition);
  z-index: 0;
}
.ai-trigger-btn .ai-dots-border {
  --size_border: calc(100% + 2px);
  overflow: hidden;
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: var(--size_border);
  height: var(--size_border);
  border-radius: var(--ai-btn-radius);
  z-index: -1;
}
.ai-trigger-btn .ai-dots-border::before,
.ai-trigger-btn .ai-dots-border::after {
  content: "";
  position: absolute;
  top: 30%; left: 50%;
  transform-origin: left;
  transform: rotate(0deg);
  width: 100%; height: 2rem;
  background: conic-gradient(from 0deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd, #ff6b6b);
  mask: linear-gradient(transparent 0%, white 120%);
  animation: ai-rotate-border 2s linear infinite;
}
.ai-trigger-btn .ai-dots-border::after {
  transform: rotate(180deg);
}
.ai-trigger-btn:is(:hover, :focus-visible) .ai-dots-border::before,
.ai-trigger-btn:is(:hover, :focus-visible) .ai-dots-border::after {
  animation-duration: 0.8s;
}
.ai-trigger-btn .ai-sparkle {
  position: relative;
  z-index: 10;
  width: 1.25rem;
}
.ai-trigger-btn .ai-sparkle .path {
  fill: var(--ai-text);
  stroke: var(--ai-text);
  transform-origin: center;
}
.ai-trigger-btn .ai-sparkle .path:nth-child(1) { --scale_path_1: 1.2; }
.ai-trigger-btn .ai-sparkle .path:nth-child(2) { --scale_path_2: 1.2; }
.ai-trigger-btn .ai-sparkle .path:nth-child(3) { --scale_path_3: 1.2; }
.ai-trigger-btn:is(:hover, :focus) .ai-sparkle .path {
  animation: ai-path-sparkle 1.5s linear 0.5s infinite;
}
.ai-trigger-btn .ai-btn-text {
  position: relative;
  z-index: 10;
  font-family: var(--ai-font-ui);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--ai-text);
  white-space: nowrap;
  letter-spacing: 0.05em;
}

/* ── Backdrop ── */
.ai-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: var(--ai-backdrop);
  backdrop-filter: blur(2px);
}

/* ── Panel shell ── */
.ai-panel {
  position: fixed;
  top: 0; right: 0;
  width: 400px;
  height: 100vh;
  background: var(--ai-panel-bg);
  outline: 1px solid var(--ai-panel-border);
  clip-path: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 0px) 100%, 0 100%, 0 14px);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transform: translateX(420px);
  transition: transform 0.32s cubic-bezier(0.16,1,0.3,1), outline-color 0.25s;
  font-family: var(--ai-font-mono);
  box-shadow: -12px 0 60px rgba(0,0,0,0.5);
}
.ai-panel::before {
  content: '';
  pointer-events: none;
  position: absolute; inset: 0;
  background:
    linear-gradient(135deg, var(--ai-neon) 0%, transparent 55%) top left / 18px 18px no-repeat,
    linear-gradient(315deg, var(--ai-neon) 0%, transparent 55%) bottom right / 18px 18px no-repeat;
  opacity: 0.6;
  z-index: 2;
  animation: ai-corner-pulse 3.5s ease-in-out infinite;
  pointer-events: none;
}
.ai-panel.open {
  transform: translateX(0);
}

/* ── Panel header ── */
.ai-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 18px;
  border-bottom: 1px solid var(--ai-panel-border);
  background: rgba(var(--ai-neon-rgb),0.025);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.ai-panel-header::after {
  content: '';
  pointer-events: none;
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 32%, var(--ai-shimmer) 50%, transparent 68%);
  background-size: 200% 100%;
  animation: ai-shimmer 4s linear infinite;
}
.ai-panel-header::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(180deg, var(--ai-neon), transparent);
  opacity: 0.8;
}
.ai-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ai-text-accent);
  position: relative;
  z-index: 1;
}
.ai-panel-title {
  font-family: var(--ai-font-ui);
  font-size: 16px;
  font-weight: 700;
  color: var(--ai-text);
  letter-spacing: 0.05em;
}
.ai-panel-badge {
  font-family: var(--ai-font-ui);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
  background: rgba(var(--ai-neon-rgb),0.12);
  color: var(--ai-text-accent);
  outline: 1px solid rgba(var(--ai-neon-rgb),0.28);
}
.ai-close-btn {
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: var(--ai-text-dim);
  transition: color 0.15s;
  position: relative;
  z-index: 1;
  font-family: var(--ai-font-mono);
}
.ai-close-btn:hover { color: var(--ai-text); }

/* ── Job strip ── */
.ai-job-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 18px;
  border-bottom: 1px solid rgba(var(--ai-neon-rgb),0.06);
  background: rgba(var(--ai-neon-rgb),0.015);
  flex-shrink: 0;
}
.ai-job-label {
  font-family: var(--ai-font-ui);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ai-text-dim);
}
.ai-job-id {
  font-family: var(--ai-font-mono);
  font-size: 13px;
  color: var(--ai-text-accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

/* ── Mode tabs ── */
.ai-mode-tabs {
  display: flex;
  padding: 12px 18px;
  gap: 0;
  border-bottom: 1px solid rgba(var(--ai-neon-rgb),0.07);
  flex-shrink: 0;
}
.ai-mode-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 0;
  border: 1px solid rgba(var(--ai-neon-rgb),0.12);
  background: transparent;
  color: var(--ai-text-muted);
  font-family: var(--ai-font-ui);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.ai-mode-tab:first-child {
  clip-path: polygon(0 0, calc(100% - 0px) 0, 100% 0, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  border-radius: 0;
}
.ai-mode-tab:last-child {
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%, 0 0);
  border-left: none;
}
.ai-mode-tab.active {
  background: rgba(var(--ai-neon-rgb),0.09);
  border-color: rgba(var(--ai-neon-rgb),0.35);
  color: var(--ai-text-accent);
}
.ai-mode-tab:hover:not(.active) {
  background: rgba(var(--ai-neon-rgb),0.04);
  color: var(--ai-text);
}
.ai-tab-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--ai-neon);
  box-shadow: 0 0 5px var(--ai-neon);
  position: absolute;
  top: 6px; right: 10px;
}

/* ── Panel body ── */
.ai-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px 24px;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--ai-neon-rgb),0.1) transparent;
}

/* ── Centered empty/loading states ── */
.ai-centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  gap: 12px;
}
.ai-empty-icon {
  color: rgba(var(--ai-neon-rgb),0.2);
  margin-bottom: 4px;
}
.ai-empty-title {
  font-family: var(--ai-font-ui);
  font-size: 16px;
  font-weight: 700;
  color: var(--ai-text);
  margin: 0;
  letter-spacing: 0.05em;
}
.ai-hint-text {
  font-family: var(--ai-font-ui);
  font-size: 13px;
  color: var(--ai-text-muted);
  line-height: 1.7;
  margin: 0;
  letter-spacing: 0.02em;
}
.ai-error-icon {
  font-size: 26px;
  color: var(--ai-critical);
}

/* ── Loading dots ── */
.ai-dots { display: flex; gap: 6px; }
.ai-dots span {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--ai-neon);
  box-shadow: 0 0 6px var(--ai-neon);
  animation: ai-bounce 1.2s ease-in-out infinite;
}
.ai-dots span:nth-child(2) { animation-delay: 0.2s; opacity: 0.7; }
.ai-dots span:nth-child(3) { animation-delay: 0.4s; opacity: 0.4; }

/* ── Action buttons ── */
.ai-action-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border: none;
  font-family: var(--ai-font-ui);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));
}
.ai-action-btn.primary {
  background: linear-gradient(135deg, var(--ai-neon) 0%, #00a87a 100%);
  color: #fff;
  box-shadow: 0 2px 16px rgba(var(--ai-neon-rgb),0.3);
}
.ai-action-btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 22px rgba(var(--ai-neon-rgb),0.45);
}
.ai-action-btn.primary:disabled { opacity: 0.35; cursor: not-allowed; }
.ai-action-btn.danger {
  background: rgba(239,68,68,0.1);
  outline: 1px solid rgba(239,68,68,0.28);
  color: var(--ai-critical);
}
.ai-action-btn.danger:hover { background: rgba(239,68,68,0.2); }

/* ── Icon buttons ── */
.ai-icon-btn {
  background: rgba(var(--ai-neon-rgb),0.04);
  outline: 1px solid rgba(var(--ai-neon-rgb),0.1);
  border: none;
  color: var(--ai-text-dim);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  transition: all 0.15s;
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
}
.ai-icon-btn:hover {
  color: var(--ai-text-accent);
  outline-color: rgba(var(--ai-neon-rgb),0.35);
  background: rgba(var(--ai-neon-rgb),0.08);
}

/* ── Result wrap ── */
.ai-result-wrap { display: flex; flex-direction: column; gap: 12px; }
.ai-result-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ai-result-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.ai-result-count {
  font-family: var(--ai-font-ui);
  font-size: 13px;
  color: var(--ai-text-muted);
  letter-spacing: 0.06em;
}
.ai-prio-chip {
  font-family: var(--ai-font-ui);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 2px 8px;
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
}

/* ── Cards list ── */
.ai-cards-list { display: flex; flex-direction: column; gap: 10px; }

/* ── Suggestion card ── */
.ai-s-card {
  background: var(--ai-card-bg);
  outline: 1px solid var(--ai-card-border);
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  padding: 13px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  overflow: hidden;
  transition: outline-color 0.15s, filter 0.15s;
}
.ai-s-card::before {
  content: '';
  pointer-events: none;
  position: absolute; inset: 0;
  background:
    linear-gradient(135deg, var(--ai-neon) 0%, transparent 42%) top left / 12px 12px no-repeat,
    linear-gradient(315deg, var(--ai-neon) 0%, transparent 42%) bottom right / 12px 12px no-repeat;
  opacity: 0.3;
  z-index: 1;
}
.ai-s-card:hover {
  outline-color: var(--ai-panel-hot);
  filter: brightness(1.02);
}

.ai-s-card-top {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  position: relative;
  z-index: 2;
}
.ai-s-index {
  min-width: 22px; height: 22px;
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
  background: rgba(var(--ai-neon-rgb),0.1);
  outline: 1px solid rgba(var(--ai-neon-rgb),0.22);
  color: var(--ai-text-accent);
  font-family: var(--ai-font-mono);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  flex-shrink: 0;
}
.ai-s-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
}
.ai-s-title {
  font-family: var(--ai-font-ui);
  color: var(--ai-text);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
  letter-spacing: 0.02em;
}
.ai-s-meta {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}
.ai-s-tool {
  font-family: var(--ai-font-mono);
  background: rgba(var(--ai-neon-rgb),0.06);
  color: var(--ai-text-muted);
  font-size: 12px;
  padding: 2px 8px;
  clip-path: polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px));
  outline: 1px solid rgba(var(--ai-neon-rgb),0.1);
}
.ai-s-priority {
  font-family: var(--ai-font-ui);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
}

/* ── Command row ── */
.ai-s-command-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--ai-cmd-bg);
  outline: 1px solid rgba(var(--ai-neon-rgb),0.1);
  clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
  padding: 8px 10px;
  position: relative;
  z-index: 2;
}
.ai-s-command {
  flex: 1;
  font-family: var(--ai-font-mono);
  font-size: 13px;
  color: var(--ai-text-accent);
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}
.ai-s-command::-webkit-scrollbar {
  display: none;
}
.ai-s-copy {
  background: none;
  border: none;
  color: var(--ai-text-dim);
  cursor: pointer;
  padding: 2px;
  display: flex;
  flex-shrink: 0;
  transition: color 0.15s;
}
.ai-s-copy:hover { color: var(--ai-text-accent); }

/* ── Reasoning ── */
.ai-s-reasoning {
  font-family: var(--ai-font-ui);
  font-size: 14px;
  color: var(--ai-text-muted);
  line-height: 1.65;
  margin: 0;
  position: relative;
  z-index: 2;
  letter-spacing: 0.01em;
}

/* ── Confidence bar ── */
.ai-s-confidence-row {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}
.ai-s-conf-label {
  font-family: var(--ai-font-ui);
  font-size: 11px;
  color: var(--ai-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
}
.ai-s-conf-bar-wrap {
  flex: 1;
  height: 3px;
  background: rgba(var(--ai-neon-rgb),0.07);
  clip-path: polygon(0 0, calc(100% - 2px) 0, 100% 2px, 100% 100%, 2px 100%, 0 calc(100% - 2px));
}
.ai-s-conf-bar-fill {
  height: 100%;
  animation: ai-conf-fill 0.8s ease-out;
}
.ai-s-conf-pct {
  font-family: var(--ai-font-mono);
  font-size: 12px;
  font-weight: 700;
  min-width: 32px;
  text-align: right;
}

/* ── Content fallback ── */
.ai-content-fallback {
  font-family: var(--ai-font-ui);
  color: var(--ai-text-muted);
  font-size: 14px;
  line-height: 1.7;
  background: var(--ai-card-bg);
  outline: 1px solid var(--ai-card-border);
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
  padding: 14px;
  white-space: pre-wrap;
}

/* ── Result footer ── */
.ai-result-footer {
  display: flex;
  justify-content: space-between;
  font-family: var(--ai-font-ui);
  font-size: 12px;
  color: var(--ai-text-dim);
  letter-spacing: 0.07em;
  padding-top: 6px;
  border-top: 1px solid rgba(var(--ai-neon-rgb),0.06);
}
`;

function InjectAIStyles() {
  useEffect(() => {
    const id = "ai-suggestion-panel-v3";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = AI_PANEL_STYLES;
      document.head.appendChild(el);
    }
  }, []);
  return null;
}

// ─── Suggestion Card ─────────────────────────────────────────────────────────
function SuggestionCard({ s, index }: { s: Suggestion; index: number }) {
  const [copied, setCopied] = useState(false);
  const cfg = PRIORITY_CONFIG[s.priority] ?? PRIORITY_CONFIG.low;
  const confidencePct = Math.round(s.confidence * 100);

  const handleCopy = () => {
    navigator.clipboard.writeText(s.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="ai-s-card">
      <div className="ai-s-card-top">
        <div className="ai-s-index">{index + 1}</div>
        <div className="ai-s-title-wrap">
          <p className="ai-s-title">{s.title}</p>
          <div className="ai-s-meta">
            <span className="ai-s-tool">{s.tool_id}</span>
            <span
              className="ai-s-priority"
              style={{
                color: cfg.color,
                background: cfg.bg,
                outline: `1px solid ${cfg.border}`,
              }}
            >
              {s.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="ai-s-command-row">
        <code className="ai-s-command">{s.command}</code>
        <button className="ai-s-copy" onClick={handleCopy} title="Copy command">
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>

      <p className="ai-s-reasoning">{s.reasoning}</p>

      <div className="ai-s-confidence-row">
        <span className="ai-s-conf-label">Confidence</span>
        <div className="ai-s-conf-bar-wrap">
          <div
            className="ai-s-conf-bar-fill"
            style={{ width: `${confidencePct}%`, background: cfg.color }}
          />
        </div>
        <span className="ai-s-conf-pct" style={{ color: cfg.color }}>
          {confidencePct}%
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface AISuggestionPanelProps {
  jobId: string;
}

export default function AISuggestionPanel({ jobId }: AISuggestionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<Mode>("next_steps");
  const [results, setResults] = useState<Partial<Record<Mode, AISuggestionResponse>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Switch to a mode; only generate if no result exists yet for that mode.
  const handleGenerate = async (mode: Mode) => {
    setActiveMode(mode);
    setError(null);
    // If we already have a result, just display it — never re-generate automatically.
    if (results[mode]) return;
    setLoading(true);
    try {
      const data = await generateSuggestion(jobId, mode);
      setResults((prev) => ({ ...prev, [mode]: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch an already-generated suggestion by its saved ID (no new LLM call).
  const handleRefetchById = async (id: string, mode: Mode) => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchSuggestionById(id);
      setResults((prev) => ({ ...prev, [mode]: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Force a brand-new generation (explicit user action via Regenerate button).
  const handleRegenerate = async (mode: Mode) => {
    setResults((prev) => {
      const next = { ...prev };
      delete next[mode];
      return next;
    });
    setError(null);
    setLoading(true);
    try {
      const data = await generateSuggestion(jobId, mode);
      setResults((prev) => ({ ...prev, [mode]: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Simple retry after an error — tries to generate once more.
  const handleRetry = async (mode: Mode) => {
    setError(null);
    setLoading(true);
    try {
      const data = await generateSuggestion(jobId, mode);
      setResults((prev) => ({ ...prev, [mode]: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const current = results[activeMode];
  const suggestions = current?.output?.suggestions ?? [];

  const PRIORITY_ORDER: Record<Priority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  const sorted = [...suggestions].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
  );

  return (
    <>
      <InjectAIStyles />

      {/* ── Trigger Button ── */}
      <button className="ai-trigger-btn" onClick={() => setIsOpen((v) => !v)}>
        <div className="ai-dots-border" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="ai-sparkle"
        >
          <path
            className="path"
            strokeLinejoin="round"
            strokeLinecap="round"
            stroke="currentColor"
            fill="currentColor"
            d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z"
          />
          <path
            className="path"
            strokeLinejoin="round"
            strokeLinecap="round"
            stroke="currentColor"
            fill="currentColor"
            d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z"
          />
          <path
            className="path"
            strokeLinejoin="round"
            strokeLinecap="round"
            stroke="currentColor"
            fill="currentColor"
            d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z"
          />
        </svg>
        <span className="ai-btn-text">AI Suggestion</span>
      </button>

      {/* ── Backdrop ── */}
      {isOpen && <div className="ai-backdrop" onClick={() => setIsOpen(false)} />}

      {/* ── Panel ── */}
      <aside className={`ai-panel${isOpen ? " open" : ""}`}>

        {/* Header */}
        <div className="ai-panel-header">
          <div className="ai-header-left">
            <StarIcon />
            <span className="ai-panel-title">AI Suggestion</span>
            <span className="ai-panel-badge">AI</span>
          </div>
          <button className="ai-close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>

        {/* Job strip */}
        <div className="ai-job-strip">
          <span className="ai-job-label">Job ID</span>
          <code className="ai-job-id">{jobId || "—"}</code>
        </div>

        {/* Tabs */}
        <div className="ai-mode-tabs">
          {(["analysis", "next_steps"] as Mode[]).map((m) => (
            <button
              key={m}
              className={`ai-mode-tab${activeMode === m ? " active" : ""}`}
              onClick={() => handleGenerate(m)}
            >
              {m === "analysis" ? <AnalystIcon /> : <BulbIcon />}
              {m === "analysis" ? "Analyst" : "Suggestion"}
              {results[m] && <span className="ai-tab-dot" />}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="ai-panel-body">

          {/* Loading */}
          {loading && (
            <div className="ai-centered">
              <div className="ai-dots">
                <span /><span /><span />
              </div>
              <p className="ai-hint-text">Fetching suggestions…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="ai-centered">
              <span className="ai-error-icon">⚠</span>
              <p className="ai-hint-text">{error}</p>
              <button
                className="ai-action-btn danger"
                onClick={() => handleRetry(activeMode)}
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && !current && (
            <div className="ai-centered">
              <div className="ai-empty-icon">
                {activeMode === "analysis" ? <AnalystIcon size={32} /> : <BulbIcon size={32} />}
              </div>
              <p className="ai-empty-title">
                {activeMode === "analysis" ? "Target Analysis" : "Next Steps"}
              </p>
              <p className="ai-hint-text" style={{ textAlign: "center", maxWidth: 240 }}>
                {activeMode === "analysis"
                  ? "AI-powered risk and attack surface assessment."
                  : "Actionable tool suggestions ranked by priority."}
              </p>
              <button
                className="ai-action-btn primary"
                onClick={() => handleGenerate(activeMode)}
                disabled={!jobId}
              >
                <StarIcon />
                Generate {activeMode === "analysis" ? "Analysis" : "Suggestions"}
              </button>
              {!jobId && (
                <p className="ai-hint-text" style={{ color: "var(--ai-critical)" }}>
                  Start a scan first to get a job ID.
                </p>
              )}
            </div>
          )}

          {/* Results */}
          {!loading && !error && current && (
            <div className="ai-result-wrap">
              <div className="ai-result-toolbar">
                <div className="ai-result-summary">
                  {suggestions.length > 0 && (
                    <>
                      <span className="ai-result-count">
                        {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""}
                      </span>
                      {(["critical", "high", "medium", "low"] as Priority[]).map((p) => {
                        const count = suggestions.filter((s) => s.priority === p).length;
                        if (!count) return null;
                        const cfg = PRIORITY_CONFIG[p];
                        return (
                          <span
                            key={p}
                            className="ai-prio-chip"
                            style={{ color: cfg.color, background: cfg.bg, outline: `1px solid ${cfg.border}` }}
                          >
                            {count} {p}
                          </span>
                        );
                      })}
                    </>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="ai-icon-btn"
                    title="Re-fetch by suggestion ID"
                    onClick={() => handleRefetchById(current.id, activeMode)}
                  >
                    <RefetchIcon />
                  </button>
                  <button
                    className="ai-icon-btn"
                    title="Regenerate (new AI call)"
                    onClick={() => handleRegenerate(activeMode)}
                  >
                    <RefreshIcon />
                  </button>
                </div>
              </div>

              {sorted.length > 0 ? (
                <div className="ai-cards-list">
                  {sorted.map((s, i) => <SuggestionCard key={i} s={s} index={i} />)}
                </div>
              ) : (
                <div className="ai-content-fallback">
                  {current.content || "No suggestions returned."}
                </div>
              )}

              <div className="ai-result-footer">
                <span>{current.provider} · {current.model}</span>
                <span>{current.input_tokens + current.output_tokens} tokens</span>
              </div>
            </div>
          )}

        </div>
      </aside>
    </>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    </svg>
  );
}
function AnalystIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function BulbIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function RefetchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="var(--ai-text-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}