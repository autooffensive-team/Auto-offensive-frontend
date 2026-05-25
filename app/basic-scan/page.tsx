"use client";

import { RotateCcw, ScanLine, Wrench } from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AdvancedTerminalPanel } from "@/components/scanComponents/AdvancedTerminalPanel";
import { ProjectSelector, ProjectSelectorSkeleton } from "@/components/scanComponents/ProjectSelector";
import { ScanModeTabs, ScanModePanel, ScanModeHeader } from "@/components/scanComponents/ScanModeTabs";
import { BasicScanForm } from "@/components/scanComponents/BasicScanForm";
import { MediumScanForm } from "@/components/scanComponents/MediumScanForm";
import { LiveConsole } from "@/components/scanComponents/LiveConsole";
import { useScanController } from "@/hooks/use-scan-controller";
import AISuggestionPanel from "@/components/AiSuggestion/AISuggestionPanel";
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

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
  }, []);

  async function consumeScanStream(response: Response) {
    if (!response.body) {
      throw new Error("Streaming response body is missing.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      while (buffer.includes("\n\n")) {
        const boundary = buffer.indexOf("\n\n");
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        const lines = block.split("\n");
        let eventName = "message";
        const dataLines: string[] = [];

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim();
          }
          if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trimStart());
          }
        }

        if (!dataLines.length || eventName === "ping") {
          continue;
        }

        const rawData = dataLines.join("\n");
        let payload: unknown = rawData;

        try {
          payload = JSON.parse(rawData);
        } catch {
          payload = rawData;
        }

        const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
        if (typeof record?.status === "string") {
          setScanStatus(record.status);
        }
        if (eventName === "done") {
          setPageMessage({ tone: "success", text: "Scan completed." });
        }
        if (eventName === "error") {
          setPageMessage({
            tone: "danger",
            text: typeof record?.error === "string" ? record.error : "The scan stream returned an error.",
          });
        }

        setActivityEntries((current) => [
          {
            id: `${Date.now()}-${current.length}`,
            event: eventName,
            message: describeEvent(eventName, payload),
          },
          ...current,
        ].slice(0, 6));
      }
    }
  }

  async function handleStartScan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTool || !resolvedPreset || !target.trim()) {
      setPageMessage({
        tone: "danger",
        text: "Choose a tool, choose a preset, and enter a target before starting.",
      });
      return;
    }

    streamAbortRef.current?.abort();
    const controller = new AbortController();
    streamAbortRef.current = controller;

    setIsStartingScan(true);
    setPageMessage(null);
    setScanStatus("JOB_STATUS_PENDING");
    setActivityEntries([]);

    try {
      const response = await fetch("/api/guest-scan/basic/submit", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "text/event-stream",
        },
        body: JSON.stringify({
          target: target.trim(),
          tool: selectedTool.tool_name,
          preset: resolvedPreset,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await consumeScanStream(response);
    } catch (error) {
      if (!controller.signal.aborted) {
        const message = error instanceof Error ? error.message : "Unable to start the scan.";
        setPageMessage({ tone: "danger", text: message });
        setScanStatus("JOB_STATUS_FAILED");
      }
    } finally {
      if (streamAbortRef.current === controller) {
        streamAbortRef.current = null;
      }
      setIsStartingScan(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4 md:space-y-5 md:px-5 md:py-5 lg:space-y-6 lg:px-7 lg:py-6">

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

          {/* AI Suggestion button — jobId is populated once a scan is submitted */}
          <div className="shrink-0 pt-1">
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
            <LiveConsole
              run={activeRun}
              errors={activeErrors}
            />
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
            <div className="p-3 sm:p-4">
              <div className="h-64 sm:h-80 md:h-96 lg:h-110 overflow-y-auto rounded-lg bg-gray-50 dark:bg-gray-800/50 text-[14px] sm:text-[17px] leading-relaxed font-[Consolas,monospace]">
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
                          color: "hsl(var(--primary) / 0.3)",
                          margin: "0 auto",
                          display: "table",
                        }}
                      >
                        {ASCII_ART}
                      </pre>
                    </div>
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
  );
}