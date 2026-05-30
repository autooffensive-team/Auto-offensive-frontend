"use client";
import AISuggestion from "@/components/AiSuggestion/AISuggestionPanel";
import { Lock, RotateCcw, Scan, ScanLine, Wrench } from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AdvancedTerminalPanel } from "@/components/scanComponents/AdvancedTerminalPanel";
import { ProjectSelector, ProjectSelectorSkeleton } from "@/components/scanComponents/ProjectSelector";
import { ScanModeTabs, ScanModePanel, ScanModeHeader } from "@/components/scanComponents/ScanModeTabs";
import { BasicScanForm } from "@/components/scanComponents/BasicScanForm";
import { MediumScanForm } from "@/components/scanComponents/MediumScanForm";
import { LiveConsole } from "@/components/scanComponents/LiveConsole";
import ScanExecutionGraph from "@/components/scanning/ScanExecutionGraph";
import { useScanController } from "@/hooks/use-scan-controller";
import { useGuestScanGuard } from "@/hooks/use-guest-scan-guard";
import { GuestLockModal } from "@/components/guest/GuestLockModal";
import { GuestScanTour, TourTriggerButton } from "@/components/tour/GuestScanTour";
import { AuthUserScanTour, AuthTourTriggerButton } from "@/components/tour/AuthUserScanTour";
import type { ScanMode } from "@/types/scan";
import { cn } from "@/lib/utils";
import { useOptionalGuestContext } from "@/lib/guest/GuestContext";

const ASCII_ART = `                                                                         ><
                                                                          @++~~
                                                                            -_~~~>@
                                                                              @~~<~~_~a
                                                                                @+~<<<~+_<x
                                                                                  n?<<<~~~~~)
                                                                                    <~~~~~~~~~+_            ;l\`
                                                                                      }~~~~~~~~~~<?@         r+~
                                                                                       ]_+++++~~~~~~+_-       a~<>
                                                                      bX)_<<<~<~~~~~~<<~?++++++~~~~~~~+_m      [<<~[
                                                     @+~~]_~+++++++++++++~~~~~++++++~~+++++++++++~~~+~~~~+-k    +~<<~+
                                             @W++++++~~~~~~~++++++++++++++++++++++++++++++++++++++++++++~~~~~?@  n~<<~<@
                                      L<_+++++++++~++++++++++++++++++++++++++++++++++~~~~+++++++++++++++++~~~~+]> ?~~<~_v    }{?__u
                                )_+_++++++++++++++++++++++++++++~~++++++++++~+++++++~~~~+~~~+++++++++++++++++++++_++~~~~~+l    ++~~~~~~(~<}
                            |__+++++++++++++++++++++++++++++++++~~~~++++++~~~++++~~~~~~++++~+++++++++++++++~+++++~~??~~~~~+?    _~~~~~~~~~+++_>z
                      @_c+++~++++++++++++++++++++++++++++++++++~~~~~~~~~~~~~~+++++~~~[~+~~~+~~+++++++++++++++++++++~~~~~~~~+<|   ~~~~~~~~~~~~++++++_|~
                   f??+~~~~~~++++++++++++++++++++++++++++++++++~~~~+~~~~~~~~~}-1r_+++++++~+~~~++++++++++++++++++++++++~~~~~~~+_@  i++~~++++~~+++~+++++++__|
               -?++~~~~~++++++++++++++++++~++++++++++++++~++++~~~~~~~+~-@ a<__+~~~~~~++++++~~~+++++++++++++++++++~~~~++~~~~~~~~[}   +++~~~~~~~~~~~~~+++~~~~~++]<+
            ?_+~~~~~~~++++++++++++++++++++++~+++~~+~~~++~~+~~~~~!++    <_+~~~~~~~~~~~~~+~~~+~+++++++++++++++++++++~~++~~~~~~~~~~+{     O>?i~<~~~~~~~~++~~~~~~~~~++__
        ]-~~~~~~~~~~~~~~+++++++++++++++++++~~~++~~~~~~~~~~+++     ~1+~~~~~~~~+~++++~~~~~++~~++++++++++++++++++++++~~~+~~~~~~~~~~~++~           +~>~~~~~~~~~~~~~+~~~~~++}-x
     }<~<<<~~+<>|nUj~<~+~~~+++++++++++++++++~~~~~~~~~+~~@    dm(_~++~~~~~+~~~++~+++~~~~~~~~+_++++++++++++++++++++++++~~~~~~~~~~~~~~+                 U<~+~~~~~~~~~~~~~~~~~+_>}
   _??<>@               f_~~~+++++++++++++~~~~++~~<_i    awwf++++++~~~~~~~~~+~~~~~~~~~~~~+/?+++++++++++++++~++++++++~~~~+/+?~<~~~~~~<i                   @i-_~~~~~~~~~~++~~~~~+<
                         L_~~~~~~++++~++~~~~~~-?Z     mmZJ++~++++~~+~++++++++~+~~~~~~~!|}+++++++++++++++~~~++~+~~++++++~+~+--   w+~~~~_                        <+_~~~~~~~+++~~~<
                          ~~~~~~~+~~~+~++~~~<l    kqwmC]~~~~~++++++++++++~~+~~~~~~~+> ?+++~~~~~~~~~++~~~~+++~~+~~++++~+++~~~~~~[  -+~~~>                          @_~>++~~~+~~~-
                          +~~~~~~~~~~~~+-!     wmmmQ}~~~~~+~~~~+++++++++++~~~+~~~+ @n_~~+++~+~~~~+~~~~~~+~~~~~~~~++++~~~~~~~~~~~+_-?+~~~_}                            ++++~~+~~1
                         1-~~~~~~~~~~{{      mmmm1?~~~~~~~~+++~++++++++++~~~~~]/  L+~~~~~~~~~~~~~~~~~~<~f|+++~+~++~~+++++++~~~~~~~~+++~~~~<                           ++~~++~~~C
                         /+~~~~~~~~(     #mZmmZf+++++++++~~~~~++~~~+~~+~~~+~~  Zm)~~~~~~~~~~~~~~~~~   )<~~~~~~~~~~~~++++~~++~~~~~~~+++++++++                          ++~~+++~~W
                         +~~~~~~1<     wmmmmx_~~~~~~~~+~~~+~~~+~~++~~~~~~~+  @ZY+~~~~~~~~~~~~~-1     +~<<<>(?+<<<_+)}~+~~~~~~~~~++++++++++~~~<                       p?+~~~++~~
                        <~~~~<+     mmmmmmn~~~~~~~++~++~~+++~++~~~++++~<~  ZZmx~~~~~~~~~~~~~+Z      >+~d                 @+?~+~~~~~+++~~~+~~~~~_                     /?~~~~~~~~
                      @+~<~-+    dommmmmv+~~~~~~~++++++++++~~~~+++~++~~   ZwZ)+~~~~~~~~~~~~>                                  @+++~~~~++~~~~~~~~~/                   i<~~+++~~~
                      -~<|m    @Zmmmmmx+++~+~~~~~++++++++++~~++++++~_   qwwC~+~+~~~~~~~~~~(                                      Y1++++~~~~~~~~~<{                   ++~~~~+~~>
                     ]_?@    qwmmmmmz++++++++++++++++++++++~~+~~~~>I  wmmm]++++++~~~~~~~<                                           @|++~~+~~~~~+-                  @]+~~~~~~~{
                    >vk    @wmmmmmx++++++++++++++++++++++~~~~~~~~+  0mmmJ]~+++++~~~~~~~~-                                              }++~~~~~<)                   x]~~~~~~~~t
                   i!    mmmmmmmv+~~~~~++++++++++++++++++++~~~~?   mwmmm~+++~++++~~~~~<>                                                !<~~<<_                     >~~~~~~~~~+
                        mmmmmmx+~~~~~+~+++++++++++++++++++~~~+}   mmmmZ++++++++++~~~~~<                                                  v_~-                       ++~~~~~~~~<
                      pwmmmmmt~~~~~~~~+++++++++++++++++~~~~~>   ammmmY?+++++~~+~+~~~~<]                                                                             Q+~~~~~~~_]
                     wmmmmZ)~~~<<{1~<++++++++++++++++++~~~>l   mwmmmC+++++++++++~~~~~~                                                                              ~~~~~~~~~~
                   wmmmmmZu[           j++++~++++++++++~~<h  mmmmmmL+++++++++++++~~~~>                                                                             *+~~~~~~~~~
                  mmmmm@                 o+~~~~+++++++++n   wwmmmmO?+++++++++++++~~~~]                                                                             ~+~~~~~~~+1
                0mmmZ                      +~~~+~~~+~~~<x  wwmmmmU]~~~~~~++++++++~~~~<                                                                            u_~~~+~+~~~
               wmq                         ~+~+~~~~~~~]  wwmmmmmZ-~~~++++++++++++~~~~{                                                                            ++~~++~~~~+
              kZ                            ++~~~+~~+x  @Zmmmmmm}~~~~~~~+++++++++~~~~l                                                                           _++++~~~~~+@
                                            }+~++~~+?   mmmmmmmt+~~~~~~++++++++++~~~~~                                                                           ?+~~++~~~+~
                                             ++~~~-U   wmmmmmmn_++++~~+++++++++++~~~~~                                                                          a_+++++~~~~
                                             <~~~~(   wwmmmmmQ1++~~~~~+++++++++++~~~~~_                                                                        n++++++++~~?
                                             c~~~[   pwmmmmmmJ~++~++~~++++++++++~~++~~~                                                                        -++++++~~~~>
                                              ~~{O  wwmmmmmmm++++++~~~+~~++++++++~+~~~~_                                                                      -+++++++~~~~
                                              ~_@  qwmmmmmmm_~~~~~~~~++++++++++++++~~~~-z                                                                    ~++~~+++~~<~X
                                              +{  pwmmmmmmmX_~~~~~~+~~~~+++++++++++~~~~~+                                                                   >+++~++~~~~<?
                                              (   mmmmmmmmm|~~~~~~~~~~~++++++++++~++~~~~~                                                                  _+~~~~+++~~~+
                                                 @wmmmmmmmz_~~~~~~~~~~~~++~~~+~++~~~~~~~~+                                                                _+++~~~+~+~~++
                                                 wwmmmmmmmv+-~~+~~]~~~~~~~~++~++~~~~~~~~~~<                                                              -+~~~~~++~~~~<
                                                @wmmmmmmm0          @)-1++~~~~~++~+~~~~~~~+_                                                            _+~+~~+++~~~~~
                                                wwmmmm       @mzU*        _<~~~~~~~~~~~~~~~~?                                                         ([+~~~~~~~~~~~_
                                                wwm        ~~~~~~~~~+/U     L-+~~~+~~~~+~~~~~m                                                       Y++~~~~~~++~~~~
                                               qqq          +~~~~~~~~~~~Q     w++~~~~~~~~~~~~~<                                                    /?+~~~~~~+~~~~~<>
                                                             <~~+~~~~~~~~_x     <~~~~~~~~~~~~<~_                                                  _+++++++~~~~~~~~<
                                                             i~+~~~~~~~~~~_       -~~~~~~~~~~~~~>                                               c-++++++++~~~~~~~?
                                                               ~~~~~~~~~~~~+)       -~~~~~~~~~~~~+)                                            -+++++++++~~+~~~~<
                                                                >~~~~+~+~~~~~<}      L[~~~~~~~~~~~++                                         ++~~~++++++~~~~~~~<
                                                                x_~~~~~~+~~~~~+-@      Z-~~~~~~~~~~~?                                      +++~~~~+++~~~~~~~~~<
                                                                  <~~~~~~~~+~~~~+_       @{~~~~~~~~~~~+                                  _++~+~+++~~++~+~~~~~
                                                                   ?~~~~~++~~~~~~~+<       @+~~~~~~~~~~-@                             b__+~~~~~~~++~~~~~~~~~i
                                                                    ~~~~~++~~~~++~~~>l        Q++~~~~~<<<>+                         +<~++++~~~+++~+++~~~~~<
                                                                     @_+~~~~~+++~~~~~+++         {~~~~<<<<<!                     ~__++~~~~+~~+++++~~~~~~~U
                                                                       +++~~~~~~+~~++++++++         pt<<<<<<<i}               >-+~~~~~~~+~~~~~+~~+++~~~+
                                                                        +~~~~~~~+~~~+++++++++           x+x]~~+?@           +?+~~~~~~~++~+++~++~~~~~~~>
                                                                           -~~+~~~~+~~~+~~~~~+++~~                     h?f+++~~~~~~++~+++~+~+++~~~~~?@
                                                                           x><~~~~~~~~~++~+~~~~++++++                <_++++++++++++++++++++~+~~~~~~l
                                                                              ++~~~~++~+~~+++~~++++++++++++++> Y{-+++++++++++++++++++++~+++~~~~~<<
                                                                               @-~~~~~~+++++++++++++++++++++++++++++++++++++++++++++~++++~~~~~<@
                                                                                  -~~~~+++++++++++++++++++++++++++++++++++++++++++++++~~~~~<~-
                                                                                    _~~~++++++++~~++++++++++++++++++++++++++++++++~~~~~~~~~
                                                                                      ~++~~~~~+~~~~+++++++++++++~++++++++++++++~~~~~~~~~><
                                                                                        W~++~~~~~~~~~~++++++++++++++++++++++++~~~~~~~~]@
                                                                                          i(+~~~~+~~~~+++++++++++++++++++++~~~~~~~~+!
                                                                                             ~++~~~+~~~+++++++++++++++++++~~~~~~_l
                                                                                                _1~~~~~~~~+++++++++++++~~~~~~+(+
                                                                                                   w+~+~~~~~++~~~++~~~~~~~<[x
                                                                                                       m+++~~~~~~~~~~~~?f
                                                                                                          !-++~~~~~~<+
                                                                                                              x~~`;

// ─── Responsive ASCII hook ────────────────────────────────────────────────────
// On desktop (≥1024 px) we keep the original 4 px so the art looks exactly
// like it did before. On smaller screens we scale it down proportionally so
// it stays visible without overflowing. The ASCII art is ~130 chars wide;
// at 4 px that naturally fits a ~520 px container (the left column on desktop).
// Breakpoints:  ≥1024 px → 4 px (original desktop look, no clipping)
//               600–1023 px → tablet, scale smoothly 2.5–4 px
//               <600 px  → mobile, scale smoothly 1.5–2.5 px
function useAsciiScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(4);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      let scale: number;
      if (w >= 1024) {
        scale = 4; // exact original desktop size
      } else if (w >= 600) {
        // tablet: interpolate 2.5 → 4 px
        scale = 2.5 + ((w - 600) / (1024 - 600)) * 1.5;
      } else {
        // mobile: interpolate 1.5 → 2.5 px
        scale = 1.5 + (w / 600) * 1.0;
      }
      setFontSize(parseFloat(scale.toFixed(2)));
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, fontSize };
}

function useStableAsciiScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(4);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const measure = (width: number) => {
      if (width <= 0) return;

      let scale: number;
      if (width >= 1024) {
        scale = 4;
      } else if (width >= 600) {
        scale = 2.5 + ((width - 600) / (1024 - 600)) * 1.5;
      } else {
        scale = 1.5 + (width / 600) * 1.0;
      }

      setFontSize(parseFloat(scale.toFixed(2)));
    };

    let frameId = 0;
    const update = () => {
      frameId = window.requestAnimationFrame(() => {
        measure(element.clientWidth);
      });
    };

    // Measure once immediately and once after the tab layout settles.
    update();
    frameId = window.requestAnimationFrame(update);

    const observer = new ResizeObserver(([entry]) => {
      measure(entry.contentRect.width);
    });

    observer.observe(element);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return { ref, fontSize };
}

// ─── Log text colorizer ───────────────────────────────────────────────────────
// Highlights meaningful parts of scan output so users can quickly parse results.
function colorizeLogText(text: string): React.ReactNode {
  const patterns: { regex: RegExp; className: string }[] = [
    // URLs
    { regex: /https?:\/\/[^\s]+/g, className: "text-blue-400 dark:text-blue-400" },
    // IP addresses
    { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,2})?\b/g, className: "text-violet-500 dark:text-violet-400" },
    // Port entries like "80/tcp"
    { regex: /\b\d{1,5}\/(?:tcp|udp)\b/g, className: "text-cyan-500 dark:text-cyan-400" },
    // "open" state
    { regex: /\bopen\b/g, className: "text-emerald-500 dark:text-emerald-400 font-semibold" },
    // "closed" or "filtered" state
    { regex: /\b(?:closed|filtered)\b/g, className: "text-rose-400 dark:text-rose-400" },
    // Service names (http, nginx, ssl, ssh, etc.)
    { regex: /\b(?:http|https|nginx|apache|ssh|ftp|smtp|dns|mysql|postgres|redis|tcpwrapped|ssl)\b/gi, className: "text-amber-500 dark:text-amber-400" },
    // Timing/duration like "41.92 seconds"
    { regex: /\b\d+\.\d+\s*(?:seconds?|ms|s)\b/g, className: "text-sky-400 dark:text-sky-400" },
    // Key success words
    { regex: /\b(?:completed|done|success|finished|saved)\b/gi, className: "text-emerald-500 dark:text-emerald-400 font-semibold" },
    // Key failure words
    { regex: /\b(?:failed|error|timeout)\b/gi, className: "text-red-500 dark:text-red-400 font-semibold" },
    // Scan action keywords
    { regex: /\b(?:Starting|submitted|scanning|scanned)\b/gi, className: "text-teal-500 dark:text-teal-400" },
    // File paths
    { regex: /\/[\w\-./]+\.(?:json|xml|txt|csv|html|log)\b/g, className: "text-orange-400 dark:text-orange-400" },
  ];

  type Match = { start: number; end: number; className: string };
  const matches: Match[] = [];

  for (const { regex, className } of patterns) {
    const re = new RegExp(regex.source, regex.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const start = m.index;
      const end = m.index + m[0].length;
      const overlaps = matches.some(
        (existing) => start < existing.end && end > existing.start
      );
      if (!overlaps) {
        matches.push({ start, end, className });
      }
    }
  }

  if (matches.length === 0) {
    return <span className="text-gray-700 dark:text-gray-300">{text}</span>;
  }

  matches.sort((a, b) => a.start - b.start);

  const fragments: React.ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, i) => {
    if (cursor < match.start) {
      fragments.push(
        <span key={`t-${i}`} className="text-gray-700 dark:text-gray-300">
          {text.slice(cursor, match.start)}
        </span>
      );
    }
    fragments.push(
      <span key={`m-${i}`} className={match.className}>
        {text.slice(match.start, match.end)}
      </span>
    );
    cursor = match.end;
  });

  if (cursor < text.length) {
    fragments.push(
      <span key="tail" className="text-gray-700 dark:text-gray-300">
        {text.slice(cursor)}
      </span>
    );
  }

  return <>{fragments}</>;
}

export default function ScanPage() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as ScanMode) || "basic";
  const [activeTab, setActiveTab] = useState<ScanMode>(initialMode);
  const initialProjectId = searchParams.get("project") || undefined;

  // ── Guest scan guard ──────────────────────────────────────────────────────
  const {
    isGuest,
    limitReached,
    guardedSubmit,
    guestSubmitBasicScan,
    maxScans,
    showLockModal,
    closeLockModal,
    lockedFeature,
    handleLockedFeature,
    refreshSession,
    updateRateLimitDirect,
  } = useGuestScanGuard();

  // Grab refreshSession so we can re-sync the quota bar after a 429
  const guestCtx = useOptionalGuestContext();
  const refreshGuestSession = guestCtx?.refreshSession;

  // If guest tries to access advanced mode, allow it (uses guest API endpoints)
  const handleTabChange = useCallback((mode: ScanMode) => {
    setActiveTab(mode);
  }, []);

  // ── Responsive ASCII ──────────────────────────────────────────────────────
  const { ref: asciiRef, fontSize: asciiFontSize } = useStableAsciiScale();

  const {
    projects,
    tools,
    projectId,
    setProjectId,
    loadingMeta,
    metaError,
    basicTarget,
    setBasicTarget,
    basicToolId,
    setBasicToolId,
    basicPreset,
    setBasicPreset,
    basicTools,
    mediumTarget,
    setMediumTarget,
    mediumSteps,
    mediumTools,
    isSubmitting,
    basicRun,
    basicLogs,
    basicErrors,
    mediumRun,
    mediumLogs,
    mediumErrors,
    advancedRun,
    advancedLogs,
    advancedErrors,
    selectedProject,
    resetRun,
    submitBasic,
    submitMedium,
    submitAdvanced,
    updateMediumStep,
    updateMediumOption,
    addMediumStep,
    removeMediumStep,
  } = useScanController(isGuest ? "guest-advanced-scan" : initialProjectId, {
    guestMode: isGuest,
    onGuestScanConsumed: updateRateLimitDirect,
  });

  // For guests, suppress the meta error about projects failing to load
  const displayMetaError = isGuest ? "" : metaError;

  const activeRun = activeTab === "basic" ? basicRun : activeTab === "medium" ? mediumRun : advancedRun;
  const activeLogs = activeTab === "basic" ? basicLogs : activeTab === "medium" ? mediumLogs : advancedLogs;
  const activeErrors = activeTab === "basic" ? basicErrors : activeTab === "medium" ? mediumErrors : advancedErrors;

  const isIdle = activeLogs.length === 0;

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4 md:space-y-5 md:px-5 md:py-5 lg:space-y-6 lg:px-7 lg:py-6">

          {/* ── Guest Scan Tour (auto-starts for first-time guest visitors) ── */}
          {isGuest && <GuestScanTour />}
          {!isGuest && <AuthUserScanTour />}

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight">New Scan</h1>
              <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                {isGuest ? (
                  <>
                    Launch Basic, Medium, or Advanced scans and watch live logs as they run.
                    <span className="ml-2 inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      <Lock size={10} />
                      Limited to {maxScans} scans in guest mode
                    </span>
                  </>
                ) : (
                  "Launch Basic, Medium, or Advanced scans and watch live logs as they run."
                )}
              </p>
            </div>

            {/* Tour replay button */}
            <div className="shrink-0 pt-1">
              {isGuest ? <TourTriggerButton /> : <AuthTourTriggerButton />}
            </div>
          </div>

          {displayMetaError && (
            <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 sm:p-4 text-xs sm:text-sm text-red-700 dark:text-red-400">
              {displayMetaError}
            </div>
          )}

          <div id="tour-project-selector" className="rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
            {isGuest ? (
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Scan size={16} className="text-teal-500" />
                <span>Guest Scan Session</span>
                <span className="ml-auto rounded-xl bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  Guest Mode
                </span>
              </div>
            ) : loadingMeta ? (
              <ProjectSelectorSkeleton />
            ) : (
              <ProjectSelector
                projects={projects}
                value={projectId}
                onChange={setProjectId}
                disabled={loadingMeta}
                loading={loadingMeta}
              />
            )}
          </div>

          <div className={cn("grid gap-3 sm:gap-4 md:gap-5", activeTab !== "advanced" && "xl:grid-cols-[minmax(0,1.25fr)_minmax(390px,0.75fr)]")}>
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              <ScanModeTabs value={activeTab} onChange={handleTabChange} />

              <ScanModePanel mode="basic" isActive={activeTab === "basic"}>
                <ScanModeHeader
                  icon={ScanLine}
                  title="Basic Scan"
                  description="Choose one provided preset for a supported tool."
                />
                <BasicScanForm
                  target={basicTarget}
                  onTargetChange={setBasicTarget}
                  toolId={basicToolId}
                  onToolChange={setBasicToolId}
                  preset={basicPreset}
                  onPresetChange={setBasicPreset}
                  tools={basicTools}
                  disabled={isSubmitting || (!projectId && !isGuest) || limitReached}
                  onSubmit={() => guardedSubmit(submitBasic)}
                />
              </ScanModePanel>

              <ScanModePanel mode="medium" isActive={activeTab === "medium"}>
                <ScanModeHeader
                  icon={Wrench}
                  title="Medium Scan"
                  description="Chain tools with allowed options from the tool metadata."
                />
                <MediumScanForm
                  target={mediumTarget}
                  onTargetChange={setMediumTarget}
                  steps={mediumSteps}
                  onStepChange={updateMediumStep}
                  onOptionChange={updateMediumOption}
                  onAddStep={addMediumStep}
                  onRemoveStep={removeMediumStep}
                  tools={mediumTools}
                  disabled={isSubmitting || (!projectId && !isGuest) || limitReached}
                  onSubmit={() => guardedSubmit(submitMedium)}
                />
              </ScanModePanel>

              {activeTab === "advanced" && (
                <>
                  <ScanExecutionGraph
                    run={advancedRun}
                    logs={advancedLogs}
                    errors={advancedErrors}
                  />
                  <AdvancedTerminalPanel
                    projectId={isGuest ? "guest-advanced-scan" : projectId}
                    selectedProject={isGuest ? { name: "guest", project_key: "guest-advanced-scan" } as any : selectedProject}
                    logs={advancedLogs}
                    run={advancedRun}
                    errors={advancedErrors}
                    isSubmitting={isSubmitting}
                    onSubmit={submitAdvanced}
                    onReset={() => resetRun("advanced")}
                  />
                </>
              )}
            </div>

            {activeTab !== "advanced" && (
              <div id="tour-terminal">
                <LiveConsole
                  run={activeRun}
                  errors={activeErrors}
                />
              </div>
            )}
          </div>

          {/* FULL-WIDTH: Scan Execution Graph (React Flow) — basic/medium only (advanced has it inline above terminal) */}
          {activeTab !== "advanced" && (
            <ScanExecutionGraph
              run={activeRun}
              logs={activeLogs}
              errors={activeErrors}
            />
          )}

          {/* BOTTOM SECTION: Full-width stream logs terminal */}
          {activeTab !== "advanced" && (
            <div id="tour-stream-logs" className="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-3 py-2 sm:px-4 sm:py-2.5">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500" />
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-400" />
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500" />
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {selectedProject ? `${selectedProject.name}@auto-offensive` : "auto-offensive"} - {activeTab} stream logs
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {activeLogs.length > 0 && (
                    <span className="rounded-full bg-teal-50 dark:bg-teal-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-teal-600 dark:text-teal-400">
                      {activeLogs.length} lines
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => resetRun(activeTab)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 py-1 sm:px-2.5 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="h-64 sm:h-80 md:h-96 lg:h-110 overflow-y-auto rounded-lg bg-gray-50 dark:bg-gray-800/50 text-[14px] sm:text-[17px] leading-relaxed font-[Consolas,monospace]">
                  {isIdle ? (
                    <div className="flex flex-col items-center h-full">

                      {/* ── Responsive ASCII container ─────────────────────────── */}
                      <div
                        ref={asciiRef}
                        className="w-full overflow-x-auto"
                        aria-hidden="true"
                      >
                        <pre
                          className="select-none font-[Consolas,monospace]"
                          style={{
                            fontSize: `${asciiFontSize}px`,
                            lineHeight: "1.2",
                            letterSpacing: "0.01em",
                            whiteSpace: "pre",
                            color: "hsl(var(--primary) / 0.3)",
                            margin: "0 auto",
                            display: "table", // shrinks to content width so auto margins work
                          }}
                        >
                          {ASCII_ART}
                        </pre>
                      </div>
                      {/* ── End responsive ASCII ───────────────────────────────── */}

                      <p className="text-gray-400 dark:text-gray-500 py-3 text-center text-[14px] sm:text-[17px] shrink-0">
                        Logs will appear here when a scan starts.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 sm:p-3">
                      {activeLogs.map((line) => (
                        <div key={line.id} className="flex gap-1.5 sm:gap-2 wrap-break-word py-0.5">
                          <span className="shrink-0 text-gray-400 dark:text-gray-500">
                            {new Date(line.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="shrink-0 text-teal-600 dark:text-teal-400">[{line.source}]</span>
                          <span
                            className={cn(
                              "shrink-0 font-semibold",
                              line.level === "ERROR" && "text-red-600 dark:text-red-400",
                              line.level === "WARN" && "text-amber-500 dark:text-amber-400",
                              line.level === "INFO" && "text-emerald-500 dark:text-emerald-400",
                              !["ERROR", "WARN", "INFO"].includes(line.level) && "text-gray-400 dark:text-gray-500"
                            )}
                          >
                            {line.level}
                          </span>
                          {colorizeLogText(line.text)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guest modals */}
      <GuestLockModal isOpen={showLockModal} onClose={closeLockModal} featureName={lockedFeature} />
    </>
  );
}
