"use client";

import { useState } from "react";

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
  const res = await fetch(`/api/backend/ai-suggestions/simulate/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id, mode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.[0]?.msg ?? `Error ${res.status}`);
  }
  return res.json();
}

async function fetchSuggestionById(
  suggestion_id: string
): Promise<AISuggestionResponse> {
  const res = await fetch(
    `/api/backend/ai-suggestions/simulate/${suggestion_id}`
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
    color: "#ff5c5c",
    bg: "rgba(255,92,92,0.08)",
    border: "rgba(255,92,92,0.25)",
  },
  high: {
    color: "#ff9f43",
    bg: "rgba(255,159,67,0.08)",
    border: "rgba(255,159,67,0.25)",
  },
  medium: {
    color: "#ffd32a",
    bg: "rgba(255,211,42,0.08)",
    border: "rgba(255,211,42,0.25)",
  },
  low: {
    color: "#01d0b3",
    bg: "rgba(0,200,150,0.08)",
    border: "rgba(0,200,150,0.25)",
  },
};

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
    <div className="s-card">
      <div className="s-card-top">
        <div className="s-index">{index + 1}</div>
        <div className="s-title-wrap">
          <p className="s-title">{s.title}</p>
          <div className="s-meta">
            <span className="s-tool">{s.tool_id}</span>
            <span
              className="s-priority"
              style={{
                color: cfg.color,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
              }}
            >
              {s.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="s-command-row">
        <code className="s-command">{s.command}</code>
        <button className="s-copy" onClick={handleCopy} title="Copy command">
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>

      <p className="s-reasoning">{s.reasoning}</p>

      <div className="s-confidence-row">
        <span className="s-conf-label">Confidence</span>
        <div className="s-conf-bar-wrap">
          <div
            className="s-conf-bar-fill"
            style={{ width: `${confidencePct}%`, background: cfg.color }}
          />
        </div>
        <span className="s-conf-pct" style={{ color: cfg.color }}>
          {confidencePct}%
        </span>
      </div>

      <style jsx>{`
        .s-card {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 10px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: border-color 0.15s;
        }
        .s-card:hover {
          border-color: rgba(255, 255, 255, 0.12);
        }
        .s-card-top {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .s-index {
          min-width: 22px;
          height: 22px;
          border-radius: 6px;
          background: rgba(1, 208, 179, 0.1);
          border: 1px solid rgba(1, 208, 179, 0.2);
          color: #01d0b3;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }
        .s-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
          min-width: 0;
        }
        .s-title {
          color: #d8e0f0;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.4;
          margin: 0;
        }
        .s-meta {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
        }
        .s-tool {
          background: rgba(255, 255, 255, 0.06);
          color: #8b9ab0;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .s-priority {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 2px 8px;
          border-radius: 20px;
        }
        .s-command-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #0a0d12;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 8px 10px;
        }
        .s-command {
          flex: 1;
          font-size: 11px;
          color: #01d0b3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: "JetBrains Mono", monospace;
        }
        .s-copy {
          background: none;
          border: none;
          color: #5a6880;
          cursor: pointer;
          padding: 2px;
          display: flex;
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .s-copy:hover {
          color: #01d0b3;
        }
        .s-reasoning {
          font-size: 11px;
          color: #5a6880;
          line-height: 1.6;
          margin: 0;
        }
        .s-confidence-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .s-conf-label {
          font-size: 9px;
          color: #3d4d66;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .s-conf-bar-wrap {
          flex: 1;
          height: 3px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 99px;
          overflow: hidden;
        }
        .s-conf-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.6s ease;
        }
        .s-conf-pct {
          font-size: 10px;
          font-weight: 700;
          min-width: 30px;
          text-align: right;
        }
      `}</style>
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

  const handleGenerate = async (mode: Mode) => {
    setActiveMode(mode);
    setError(null);
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

  const clearCache = (mode: Mode) =>
    setResults((prev) => {
      const next = { ...prev };
      delete next[mode];
      return next;
    });

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
      <button className="ai-trigger-btn" onClick={() => setIsOpen((v) => !v)}>
        <div className="dots_border"></div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="sparkle"
        >
          <path
            className="path"
            strokeLinejoin="round"
            strokeLinecap="round"
            stroke="#0f172a"
            fill="#0f172a"
            d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z"
          ></path>
          <path
            className="path"
            strokeLinejoin="round"
            strokeLinecap="round"
            stroke="#0f172a"
            fill="#0f172a"
            d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z"
          ></path>
          <path
            className="path"
            strokeLinejoin="round"
            strokeLinecap="round"
            stroke="#0f172a"
            fill="#0f172a"
            d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z"
          ></path>
        </svg>
        <span className="text_button">AI Suggestion</span>
      </button>

      {isOpen && <div className="backdrop" onClick={() => setIsOpen(false)} />}

      <aside className={`ai-panel ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="panel-header">
          <div className="panel-title-row">
            <StarIcon />
            <span className="panel-title">AI Suggestion</span>
            <span className="panel-badge">Simulation</span>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>

        {/* Job strip */}
        <div className="job-strip">
          <span className="job-label">JOB ID</span>
          <code className="job-id">{jobId || "—"}</code>
        </div>

        {/* Tabs */}
        <div className="mode-tabs">
          {(["analysis", "next_steps"] as Mode[]).map((m) => (
            <button
              key={m}
              className={`mode-tab ${activeMode === m ? "active" : ""}`}
              onClick={() => handleGenerate(m)}
            >
              {m === "analysis" ? <AnalystIcon /> : <BulbIcon />}
              {m === "analysis" ? "Analyst" : "Suggestion"}
              {results[m] && <span className="tab-dot" />}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="panel-body">
          {loading && (
            <div className="centered">
              <div className="dots">
                <span /><span /><span />
              </div>
              <p className="hint-text">Fetching suggestions…</p>
            </div>
          )}

          {!loading && error && (
            <div className="centered">
              <span className="error-icon">⚠</span>
              <p className="hint-text">{error}</p>
              <button
                className="action-btn danger"
                onClick={() => { clearCache(activeMode); handleGenerate(activeMode); }}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && !current && (
            <div className="centered">
              <div className="empty-icon">
                {activeMode === "analysis" ? <AnalystIcon size={32} /> : <BulbIcon size={32} />}
              </div>
              <p className="empty-title">
                {activeMode === "analysis" ? "Target Analysis" : "Next Steps"}
              </p>
              <p className="hint-text" style={{ textAlign: "center", maxWidth: 240 }}>
                {activeMode === "analysis"
                  ? "AI-powered risk and attack surface assessment."
                  : "Actionable tool suggestions ranked by priority."}
              </p>
              <button
                className="action-btn primary"
                onClick={() => handleGenerate(activeMode)}
                disabled={!jobId}
              >
                <StarIcon />
                Generate {activeMode === "analysis" ? "Analysis" : "Suggestions"}
              </button>
              {!jobId && (
                <p className="hint-text" style={{ color: "#e05c5c" }}>
                  Start a scan first to get a job ID.
                </p>
              )}
            </div>
          )}

          {!loading && !error && current && (
            <div className="result-wrap">
              <div className="result-toolbar">
                <div className="result-summary">
                  {suggestions.length > 0 && (
                    <>
                      <span className="result-count">
                        {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""}
                      </span>
                      {(["critical", "high", "medium", "low"] as Priority[]).map((p) => {
                        const count = suggestions.filter((s) => s.priority === p).length;
                        if (!count) return null;
                        const cfg = PRIORITY_CONFIG[p];
                        return (
                          <span
                            key={p}
                            className="prio-chip"
                            style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
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
                    className="icon-btn"
                    title="Re-fetch by suggestion ID"
                    onClick={() => handleRefetchById(current.id, activeMode)}
                  >
                    <RefetchIcon />
                  </button>
                  <button
                    className="icon-btn"
                    title="Regenerate"
                    onClick={() => { clearCache(activeMode); handleGenerate(activeMode); }}
                  >
                    <RefreshIcon />
                  </button>
                </div>
              </div>

              {sorted.length > 0 ? (
                <div className="cards-list">
                  {sorted.map((s, i) => <SuggestionCard key={i} s={s} index={i} />)}
                </div>
              ) : (
                <div className="content-fallback">
                  {current.content || "No suggestions returned."}
                </div>
              )}

              <div className="result-footer">
                <span>{current.provider} · {current.model}</span>
                <span>{current.input_tokens + current.output_tokens} tokens</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      <style jsx>{`
        .ai-trigger-btn {
          --border_radius: 0.75rem;
          --transtion: 0.3s ease-in-out;
          --offset: 2px;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transform-origin: center;
          padding: 0.55rem 1.1rem;
          background-color: transparent;
          border: none;
          border-radius: var(--border_radius);
          transform: scale(1);
          transition: transform var(--transtion);
        }
        .ai-trigger-btn::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: white;
          border: 1px solid #00d0b2;
          border-radius: var(--border_radius);
          box-shadow: none;
          transition: all var(--transtion);
          z-index: 0;
        }
        :global(.dark) .ai-trigger-btn::before {
          background: #020618;
        }
        .ai-trigger-btn::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background-color: transparent;
          border-radius: var(--border_radius);
          transition: opacity var(--transtion);
          z-index: 2;
        }
        .ai-trigger-btn:is(:hover, :focus-visible) {
          --active: 1;
        }
        .ai-trigger-btn:is(:hover, :focus-visible) .dots_border::before,
        .ai-trigger-btn:is(:hover, :focus-visible) .dots_border::after {
          animation-duration: 0.8s;
        }
        .ai-trigger-btn .dots_border {
          --size_border: calc(100% + 2px);
          overflow: hidden;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: var(--size_border);
          height: var(--size_border);
          background-color: transparent;
          border-radius: var(--border_radius);
          z-index: -10;
        }
        .ai-trigger-btn .dots_border::before {
          content: "";
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          transform-origin: left;
          transform: rotate(0deg);
          width: 100%;
          height: 2rem;
          background: conic-gradient(
            from 0deg,
            #ff6b6b,
            #feca57,
            #48dbfb,
            #ff9ff3,
            #54a0ff,
            #5f27cd,
            #ff6b6b
          );
          mask: linear-gradient(transparent 0%, white 120%);
          animation: rotate 2s linear infinite;
        }
        .ai-trigger-btn .dots_border::after {
          content: "";
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          transform-origin: left;
          transform: rotate(180deg);
          width: 100%;
          height: 2rem;
          background: conic-gradient(
            from 0deg,
            #ff6b6b,
            #feca57,
            #48dbfb,
            #ff9ff3,
            #54a0ff,
            #5f27cd,
            #ff6b6b
          );
          mask: linear-gradient(transparent 0%, white 120%);
          animation: rotate 2s linear infinite;
        }
        @keyframes rotate {
          to {
            transform: rotate(360deg);
          }
        }
        .ai-trigger-btn .sparkle {
          position: relative;
          z-index: 10;
          width: 1.25rem;
        }
        .ai-trigger-btn .sparkle .path {
          fill: currentColor;
          stroke: currentColor;
          transform-origin: center;
          color: #0f172a;
        }
        :global(.dark) .ai-trigger-btn .sparkle .path {
          color: white;
        }
        .ai-trigger-btn:is(:hover, :focus) .sparkle .path {
          animation: path 1.5s linear 0.5s infinite;
        }
        .ai-trigger-btn .sparkle .path:nth-child(1) {
          --scale_path_1: 1.2;
        }
        .ai-trigger-btn .sparkle .path:nth-child(2) {
          --scale_path_2: 1.2;
        }
        .ai-trigger-btn .sparkle .path:nth-child(3) {
          --scale_path_3: 1.2;
        }
        @keyframes path {
          0%, 34%, 71%, 100% {
            transform: scale(1);
          }
          17% {
            transform: scale(var(--scale_path_1, 1));
          }
          49% {
            transform: scale(var(--scale_path_2, 1));
          }
          83% {
            transform: scale(var(--scale_path_3, 1));
          }
        }
        .ai-trigger-btn .text_button {
          position: relative;
          z-index: 10;
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
        }
        :global(.dark) .ai-trigger-btn .text_button {
          color: white;
        }
        .chevron {
          font-size: 16px;
          transition: transform 0.25s ease;
          line-height: 1;
        }
        .chevron.open { transform: rotate(90deg); }
        .backdrop {
          position: fixed;
          inset: 0;
          z-index: 999;
          background: rgba(0, 0, 0, 0.35);
        }
        .ai-panel {
          position: fixed;
          top: 0;
          right: -420px;
          width: 400px;
          height: 100vh;
          background: #0f1117;
          border-left: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: right 0.32s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: "JetBrains Mono", "Fira Code", monospace;
          box-shadow: -10px 0 50px rgba(0, 0, 0, 0.6);
        }
        .ai-panel.open { right: 0; }
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(1, 208, 179, 0.04);
          flex-shrink: 0;
        }
        .panel-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #01d0b3;
        }
        .panel-title { color: #e8eaf0; font-size: 14px; font-weight: 700; }
        .panel-badge {
          background: rgba(1, 208, 179, 0.12);
          color: #01d0b3;
          border: 1px solid rgba(1, 208, 179, 0.25);
          font-size: 9px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .close-btn {
          background: none;
          border: none;
          color: #5a6880;
          font-size: 22px;
          cursor: pointer;
          line-height: 1;
          transition: color 0.15s;
        }
        .close-btn:hover { color: #e8eaf0; }
        .job-strip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.015);
          flex-shrink: 0;
        }
        .job-label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; color: #3d4d66; }
        .job-id {
          font-size: 11px;
          color: #5a8080;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 300px;
        }
        .mode-tabs {
          display: flex;
          padding: 12px 20px;
          gap: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-shrink: 0;
        }
        .mode-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 9px 0;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: transparent;
          color: #5a6880;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          position: relative;
        }
        .mode-tab:first-child { border-radius: 6px 0 0 6px; }
        .mode-tab:last-child { border-radius: 0 6px 6px 0; border-left: none; }
        .mode-tab.active {
          background: rgba(1, 208, 179, 0.1);
          border-color: rgba(1, 208, 179, 0.35);
          color: #01d0b3;
        }
        .mode-tab:hover:not(.active) {
          background: rgba(255, 255, 255, 0.04);
          color: #8b9ab0;
        }
        .tab-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #01d0b3;
          position: absolute;
          top: 6px;
          right: 10px;
        }
        .panel-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.08) transparent;
        }
        .centered {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 260px;
          gap: 12px;
        }
        .empty-icon { color: rgba(1, 208, 179, 0.25); margin-bottom: 4px; }
        .empty-title { color: #c8d0de; font-size: 14px; font-weight: 700; margin: 0; }
        .hint-text { color: #5a6880; font-size: 11px; line-height: 1.6; margin: 0; }
        .error-icon { font-size: 26px; color: #e05c5c; }
        .dots { display: flex; gap: 6px; }
        .dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #01d0b3;
          animation: bounce 1.2s ease-in-out infinite;
        }
        .dots span:nth-child(2) { animation-delay: 0.2s; opacity: 0.7; }
        .dots span:nth-child(3) { animation-delay: 0.4s; opacity: 0.4; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .action-btn.primary {
          background: linear-gradient(135deg, #01d0b3 0%, #00a87a 100%);
          color: #fff;
          box-shadow: 0 2px 14px rgba(1, 208, 179, 0.3);
        }
        .action-btn.primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(1, 208, 179, 0.45);
        }
        .action-btn.primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .action-btn.danger {
          background: rgba(224, 92, 92, 0.12);
          border: 1px solid rgba(224, 92, 92, 0.3);
          color: #e05c5c;
        }
        .action-btn.danger:hover { background: rgba(224, 92, 92, 0.22); }
        .icon-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 5px;
          color: #5a6880;
          cursor: pointer;
          padding: 5px;
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }
        .icon-btn:hover {
          color: #01d0b3;
          border-color: rgba(1, 208, 179, 0.3);
          background: rgba(1, 208, 179, 0.06);
        }
        .result-wrap { display: flex; flex-direction: column; gap: 12px; }
        .result-toolbar { display: flex; align-items: center; justify-content: space-between; }
        .result-summary { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .result-count { font-size: 11px; color: #5a6880; }
        .prio-chip {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 7px;
          border-radius: 20px;
        }
        .cards-list { display: flex; flex-direction: column; gap: 10px; }
        .content-fallback {
          color: #8b9ab0;
          font-size: 12px;
          line-height: 1.7;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 9px;
          padding: 14px;
          white-space: pre-wrap;
        }
        .result-footer {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #3d4d66;
          padding-top: 4px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }
      `}</style>
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
      <path d="M20 6L9 17l-5-5" stroke="#01d0b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}