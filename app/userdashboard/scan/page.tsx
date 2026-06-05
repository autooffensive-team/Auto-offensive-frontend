"use client";
import AISuggestion from "@/components/AiSuggestion/AISuggestionPanel";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, BarChart3, Lock, RotateCcw, Scan, ScanLine, Wrench } from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AdvancedTerminalPanel } from "@/components/scanComponents/AdvancedTerminalPanel";
import { ProjectSelector, ProjectSelectorSkeleton } from "@/components/scanComponents/ProjectSelector";
import { ScanModeTabs, ScanModePanel, ScanModeHeader } from "@/components/scanComponents/ScanModeTabs";
import { BasicScanForm } from "@/components/scanComponents/BasicScanForm";
import { MediumScanForm } from "@/components/scanComponents/MediumScanForm";
import { LiveConsole } from "@/components/scanComponents/LiveConsole";
import ScanExecutionGraph from "@/components/scanning/ScanExecutionGraph";
import { LogToolbar } from "@/components/scanComponents/LogToolbar";
import { useScanController } from "@/hooks/use-scan-controller";
import { useLogPreferences } from "@/hooks/use-log-preferences";
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
// NOTE: Terminal always uses a dark background regardless of website light/dark mode,
// so all colors here must be bright/light to be readable on dark backgrounds.
// For light themes, use dark colors instead.
function colorizeLogText(text: string, isLightTheme = false): React.ReactNode {
  const patterns: { regex: RegExp; className: string }[] = isLightTheme
    ? [
        { regex: /https?:\/\/[^\s]+/g, className: "text-blue-700" },
        { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,2})?\b/g, className: "text-violet-700" },
        { regex: /\b\d{1,5}\/(?:tcp|udp)\b/g, className: "text-cyan-700" },
        { regex: /\bopen\b/g, className: "text-emerald-700 font-semibold" },
        { regex: /\b(?:closed|filtered)\b/g, className: "text-rose-700" },
        { regex: /\b(?:http|https|nginx|apache|ssh|ftp|smtp|dns|mysql|postgres|redis|tcpwrapped|ssl)\b/gi, className: "text-amber-700" },
        { regex: /\b\d+\.\d+\s*(?:seconds?|ms|s)\b/g, className: "text-sky-700" },
        { regex: /\b(?:completed|done|success|finished|saved)\b/gi, className: "text-emerald-700 font-semibold" },
        { regex: /\b(?:failed|error|timeout)\b/gi, className: "text-red-700 font-semibold" },
        { regex: /\b(?:Starting|submitted|scanning|scanned)\b/gi, className: "text-teal-700" },
        { regex: /\/[\w\-./]+\.(?:json|xml|txt|csv|html|log)\b/g, className: "text-orange-700" },
      ]
    : [
        { regex: /https?:\/\/[^\s]+/g, className: "text-blue-400" },
        { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,2})?\b/g, className: "text-violet-400" },
        { regex: /\b\d{1,5}\/(?:tcp|udp)\b/g, className: "text-cyan-400" },
        { regex: /\bopen\b/g, className: "text-emerald-400 font-semibold" },
        { regex: /\b(?:closed|filtered)\b/g, className: "text-rose-400" },
        { regex: /\b(?:http|https|nginx|apache|ssh|ftp|smtp|dns|mysql|postgres|redis|tcpwrapped|ssl)\b/gi, className: "text-amber-400" },
        { regex: /\b\d+\.\d+\s*(?:seconds?|ms|s)\b/g, className: "text-sky-400" },
        { regex: /\b(?:completed|done|success|finished|saved)\b/gi, className: "text-emerald-400 font-semibold" },
        { regex: /\b(?:failed|error|timeout)\b/gi, className: "text-red-400 font-semibold" },
        { regex: /\b(?:Starting|submitted|scanning|scanned)\b/gi, className: "text-teal-400" },
        { regex: /\/[\w\-./]+\.(?:json|xml|txt|csv|html|log)\b/g, className: "text-orange-400" },
      ];

  const defaultTextClass = isLightTheme ? "text-gray-800" : "text-gray-300";

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
    return <span className={defaultTextClass}>{text}</span>;
  }

  matches.sort((a, b) => a.start - b.start);

  const fragments: React.ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, i) => {
    if (cursor < match.start) {
      fragments.push(
        <span key={`t-${i}`} className={defaultTextClass}>
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
      <span key="tail" className={defaultTextClass}>
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
  const { themeKey, sizeKey, theme, size, setTheme, setSize, resetToDefault } = useLogPreferences();

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
    openJobReport,
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
  // Show loading until scan reaches a terminal state (completed/failed/cancelled/partial)
  const isScanRunning = isSubmitting || (
    activeRun.status !== "idle" &&
    !/completed|failed|cancelled|partial/i.test(activeRun.status)
  );
  const showViewResults =
    activeRun.status !== "idle" &&
    /completed|cancelled|partial/i.test(activeRun.status);

  return (
    <>
      <div className="min-h-screen">
        <div className="mx-auto space-y-3 sm:space-y-4 md:space-y-4 lg:space-y-5">

          {/* ── Guest Scan Tour (auto-starts for first-time guest visitors) ── */}
          {isGuest && <GuestScanTour />}
          {!isGuest && <AuthUserScanTour />}

          <div className="flex items-start justify-between gap-3">
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

          <div className={cn("grid gap-3", activeTab !== "advanced" && "xl:grid-cols-[minmax(0,1.25fr)_minmax(390px,0.75fr)]")}>
            <div className="space-y-3 sm:space-y-4">
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
                  {/* Info banner about 4-tool limit */}
                  <div className="rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 p-3 sm:p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 font-medium">
                      Advanced scans are limited to <strong>4 tools per scan</strong> to ensure optimal performance and manageable execution time.
                    </p>
                  </div>

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

                  <ScanExecutionGraph
                    run={advancedRun}
                    logs={advancedLogs}
                    errors={advancedErrors}
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

                    {/* Log Preferences Toolbar */}
            <LogToolbar
              themeKey={themeKey}
              sizeKey={sizeKey}
              onThemeChange={setTheme}
              onSizeChange={setSize}
              onReset={resetToDefault}
              className="mx-3 mt-3 sm:mx-4 sm:mt-4"
            />

              <div className="p-3 sm:p-4">
                <div
                className={cn(
                  "h-64 sm:h-80 md:h-96 lg:h-110 overflow-y-auto rounded-lg font-[Consolas,monospace]",
                  theme.html.bg,
                  size.className,
                  size.lineHeight
                )}
              >
                {isIdle && !isScanRunning ? (
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
                            color: theme.html.asciiColor,
                            opacity: 0.85,
                            margin: "0 auto",
                            display: "table", // shrinks to content width so auto margins work
                          }}
                        >
                          {ASCII_ART}
                        </pre>
                      </div>
                      {/* ── End responsive ASCII ───────────────────────────────── */}

                      <p className={cn("py-3 text-center shrink-0", theme.html.muted, size.className)}>
                        Logs will appear here when a scan starts.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      {!isIdle && (
                        <div className="p-2 sm:p-3 flex-1 overflow-y-auto">
                          {activeLogs.map((line) => (
                            <div key={line.id} className="flex gap-1.5 sm:gap-2 wrap-break-word py-0.5">
                              <span className={cn("shrink-0", theme.html.timestamp)}>
                                {new Date(line.timestamp).toLocaleTimeString()}
                              </span>
                              <span className={cn("shrink-0", theme.html.source)}>[{line.source}]</span>
                              <span
                                className={cn(
                                  "shrink-0 font-semibold",
                                  line.level === "ERROR" && theme.html.error,
                                  line.level === "WARN" && theme.html.warn,
                                  line.level === "INFO" && theme.html.info,
                                  !["ERROR", "WARN", "INFO"].includes(line.level) && theme.html.muted
                                )}
                              >
                                {line.level}
                              </span>
                              {colorizeLogText(line.text, theme.html.isLight)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {showViewResults && (
          <motion.div 
            className="fixed bottom-8 right-8 z-[60]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              type="button"
              onClick={() => openJobReport(activeRun.jobId)}
              className="pointer-events-auto rounded-xl"
              whileHover={{ scale: 1.03, y: -1, boxShadow: "0 10px 24px rgba(0, 208, 178, 0.22)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                border: "0",
                backgroundColor: "#00d0b2",
                padding: "12px 18px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#0f172a",
                boxShadow: "0 8px 18px rgba(0, 208, 178, 0.24)",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              <BarChart3 size={16} className="pointer-events-none" />
              View Results
              <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
                <ArrowRight size={16} className="pointer-events-none" />
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Guest modals */}
      <GuestLockModal isOpen={showLockModal} onClose={closeLockModal} featureName={lockedFeature} />
    </>
  );
}
