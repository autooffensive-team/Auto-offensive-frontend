"use client";

import { RotateCcw, ScanLine, Wrench } from "lucide-react";
import { useState } from "react";
import { AdvancedTerminalPanel } from "@/components/scanComponents/AdvancedTerminalPanel";
import { ProjectSelector, ProjectSelectorSkeleton } from "@/components/scanComponents/ProjectSelector";
import { ScanModeTabs, ScanModePanel, ScanModeHeader } from "@/components/scanComponents/ScanModeTabs";
import { BasicScanForm } from "@/components/scanComponents/BasicScanForm";
import { MediumScanForm } from "@/components/scanComponents/MediumScanForm";
import { LiveConsole } from "@/components/scanComponents/LiveConsole";
import { useScanController } from "@/hooks/use-scan-controller";
import type { ScanMode } from "@/types/scan";
import { cn } from "@/lib/utils";

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState<ScanMode>("basic");
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
    // Per-mode runtime state
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

  // Pick the right run/logs/errors for the active non-advanced tab
  const activeRun = activeTab === "basic" ? basicRun : mediumRun;
  const activeLogs = activeTab === "basic" ? basicLogs : mediumLogs;
  const activeErrors = activeTab === "basic" ? basicErrors : mediumErrors;

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

        {/* LiveConsole is per-mode — each tab gets its own isolated run/logs/errors */}
        {activeTab !== "advanced" && (
          <LiveConsole
            run={activeRun}
            logs={activeLogs}
            errors={activeErrors}
          />
        )}
      </div>
    </div>
  );
}