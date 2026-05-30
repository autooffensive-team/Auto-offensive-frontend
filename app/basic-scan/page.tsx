"use client";

import { RotateCcw, ScanLine, Wrench } from "lucide-react";
import React, { useState, useRef, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AdvancedTerminalPanel } from "@/components/scanComponents/AdvancedTerminalPanel";
import { ProjectSelector, ProjectSelectorSkeleton } from "@/components/scanComponents/ProjectSelector";
import { ScanModeTabs, ScanModePanel, ScanModeHeader } from "@/components/scanComponents/ScanModeTabs";
import { BasicScanForm } from "@/components/scanComponents/BasicScanForm";
import { MediumScanForm } from "@/components/scanComponents/MediumScanForm";
import ScanExecutionGraph from "@/components/scanning/ScanExecutionGraph";
import { LiveConsole } from "@/components/scanComponents/LiveConsole";
import { LogToolbar } from "@/components/scanComponents/LogToolbar";
import { useScanController } from "@/hooks/use-scan-controller";
import { useLogPreferences } from "@/hooks/use-log-preferences";
import AISuggestionPanel from "@/components/AiSuggestion/AISuggestionPanel";
import { GuestScanTour, TourTriggerButton } from "@/components/tour/GuestScanTour";
import type { ScanMode } from "@/types/scan";
import { cn } from "@/lib/utils";

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

// ─── Log text colorizer ───────────────────────────────────────────────────────
function colorizeLogText(text: string): React.ReactNode {
  const patterns: { regex: RegExp; className: string }[] = [
    { regex: /https?:\/\/[^\s]+/g, className: "text-blue-400 dark:text-blue-400" },
    { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,2})?\b/g, className: "text-violet-500 dark:text-violet-400" },
    { regex: /\b\d{1,5}\/(?:tcp|udp)\b/g, className: "text-cyan-500 dark:text-cyan-400" },
    { regex: /\bopen\b/g, className: "text-emerald-500 dark:text-emerald-400 font-semibold" },
    { regex: /\b(?:closed|filtered)\b/g, className: "text-rose-400 dark:text-rose-400" },
    { regex: /\b(?:http|https|nginx|apache|ssh|ftp|smtp|dns|mysql|postgres|redis|tcpwrapped|ssl)\b/gi, className: "text-amber-500 dark:text-amber-400" },
    { regex: /\b\d+\.\d+\s*(?:seconds?|ms|s)\b/g, className: "text-sky-400 dark:text-sky-400" },
    { regex: /\b(?:completed|done|success|finished|saved)\b/gi, className: "text-emerald-500 dark:text-emerald-400 font-semibold" },
    { regex: /\b(?:failed|error|timeout)\b/gi, className: "text-red-500 dark:text-red-400 font-semibold" },
    { regex: /\b(?:Starting|submitted|scanning|scanned)\b/gi, className: "text-teal-500 dark:text-teal-400" },
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

export default function BasicScanPage() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as ScanMode) || "basic";
  const [activeTab, setActiveTab] = useState<ScanMode>(initialMode);
  const initialProjectId = searchParams.get("project") || undefined;
  const { themeKey, sizeKey, theme, size, setTheme, setSize, resetToDefault } = useLogPreferences();

  // ── Responsive ASCII ──────────────────────────────────────────────────────
  const asciiRef = useRef<HTMLDivElement>(null);
  const [asciiFontSize, setAsciiFontSize] = useState(4);

  useLayoutEffect(() => {
    if (!asciiRef.current) return;

    const element = asciiRef.current;
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
      setAsciiFontSize(parseFloat(scale.toFixed(2)));
    };

    let frameId = 0;
    const update = () => {
      frameId = window.requestAnimationFrame(() => {
        measure(element.clientWidth);
      });
    };

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

  const {
    projects,
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
  } = useScanController(initialProjectId);

  const activeRun = activeTab === "basic" ? basicRun : mediumRun;
  const activeLogs = activeTab === "basic" ? basicLogs : mediumLogs;
  const activeErrors = activeTab === "basic" ? basicErrors : mediumErrors;
  const isIdle = activeLogs.length === 0;
  const jobId = activeRun?.jobId || "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4 md:space-y-5 md:px-5 md:py-5 lg:space-y-6 lg:px-7 lg:py-6">

        {/* ── Guest Scan Tour (auto-starts for first-time visitors) ── */}
        <GuestScanTour />

        {/* ── Page header with AI Suggestion button ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              New Scan
            </h1>
            <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Launch Basic, Medium, or Advanced scans and watch live logs as they run.
            </p>
          </div>

          {/* AI Suggestion + Tour replay button */}
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <TourTriggerButton />
            <AISuggestionPanel jobId={jobId} />
          </div>
        </div>

        {metaError && (
          <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 sm:p-4 text-xs sm:text-sm text-red-700 dark:text-red-400">
            {metaError}
          </div>
        )}

        <div className="rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
          {loadingMeta ? (
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
            <ScanModeTabs value={activeTab} onChange={setActiveTab} />

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
                disabled={isSubmitting || !projectId}
                onSubmit={submitBasic}
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
                disabled={isSubmitting || !projectId}
                onSubmit={submitMedium}
              />
            </ScanModePanel>

            {activeTab === "advanced" && (
              <AdvancedTerminalPanel
                projectId={projectId}
                selectedProject={selectedProject}
                logs={advancedLogs}
                run={advancedRun}
                errors={advancedErrors}
                isSubmitting={isSubmitting}
                onSubmit={submitAdvanced}
                onReset={() => resetRun("advanced")}
              />
            )}
          </div>

          {activeTab !== "advanced" && (
            <div id="tour-terminal">
              <ScanExecutionGraph
                run={activeRun}
                logs={activeLogs}
                errors={activeErrors}
              />
            </div>
          )}
        </div>

        {activeTab !== "advanced" && (
          <div className="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
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
                {isIdle ? (
                  <div className="flex flex-col items-center h-full">
                    <div ref={asciiRef} className="w-full overflow-x-auto" aria-hidden="true">
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
                          display: "table",
                        }}
                      >
                        {ASCII_ART}
                      </pre>
                    </div>
                    <p className={cn("py-3 text-center shrink-0", theme.html.muted, size.className)}>
                      Logs will appear here when a scan starts.
                    </p>
                  </div>
                ) : (
                  <div className="p-2 sm:p-3">
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
  );
}