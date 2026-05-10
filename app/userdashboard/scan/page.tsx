"use client";

import { RotateCcw, ScanLine, Wrench } from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { AdvancedTerminalPanel } from "@/components/scanComponents/AdvancedTerminalPanel";
import { ProjectSelector, ProjectSelectorSkeleton } from "@/components/scanComponents/ProjectSelector";
import { ScanModeTabs, ScanModePanel, ScanModeHeader } from "@/components/scanComponents/ScanModeTabs";
import { BasicScanForm } from "@/components/scanComponents/BasicScanForm";
import { MediumScanForm } from "@/components/scanComponents/MediumScanForm";
import { LiveConsole } from "@/components/scanComponents/LiveConsole";
import { useScanController } from "@/hooks/use-scan-controller";
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

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState<ScanMode>("basic");

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
  } = useScanController();

  const activeRun = activeTab === "basic" ? basicRun : mediumRun;
  const activeLogs = activeTab === "basic" ? basicLogs : mediumLogs;
  const activeErrors = activeTab === "basic" ? basicErrors : mediumErrors;

  const isIdle = activeLogs.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-foreground">New Scan</h1>
          <p className="mt-1 text-[16px] text-muted-foreground">
            Launch Basic, Medium, or Advanced scans and watch live logs as they run.
          </p>
        </div>
        <button
          type="button"
          onClick={() => resetRun(activeTab)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <RotateCcw size={16} />
          Reset Console
        </button>
      </div>

      {metaError && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
          {metaError}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
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

      <div className={cn("grid gap-5", activeTab !== "advanced" && "xl:grid-cols-[minmax(0,1.25fr)_minmax(390px,0.75fr)]")}>
        <div className="space-y-5">
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
          <LiveConsole
            run={activeRun}
            errors={activeErrors}
          />
        )}
      </div>

      {/* BOTTOM SECTION: Full-width stream logs terminal */}
      {activeTab !== "advanced" && (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex cursor-default select-none items-center gap-2 border-b border-border/50 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Stream Logs
            </span>
            {activeLogs.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {activeLogs.length}
              </span>
            )}
          </div>
          <div className="p-4">
            <div className="h-110 overflow-y-auto rounded-lg bg-muted/30 text-xs leading-relaxed font-[Consolas,monospace]">
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

                  <p className="text-muted-foreground/50 py-3 text-center text-[11px] shrink-0">
                    Logs will appear here when a scan starts.
                  </p>
                </div>
              ) : (
                <div className="p-3">
                  {activeLogs.map((line) => (
                    <div key={line.id} className="flex gap-2 wrap-break-word py-0.5">
                      <span className="shrink-0 text-muted-foreground/40">
                        {new Date(line.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="shrink-0 text-primary/70">[{line.source}]</span>
                      <span
                        className={cn(
                          "shrink-0 font-semibold",
                          line.level === "ERROR" && "text-destructive",
                          line.level === "WARN" && "text-amber-500 dark:text-amber-400",
                          line.level === "INFO" && "text-emerald-500 dark:text-emerald-400",
                          !["ERROR", "WARN", "INFO"].includes(line.level) && "text-muted-foreground/60"
                        )}
                      >
                        {line.level}
                      </span>
                      <span className="text-foreground/75">{line.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
