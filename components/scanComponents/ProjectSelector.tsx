"use client";

import { Project } from "@/types/scan";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { FolderGit2, Plus } from "lucide-react";
import Link from "next/link";

interface ProjectSelectorProps {
  projects: Project[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ProjectSelector({
  projects,
  value,
  onChange,
  disabled,
  loading,
}: ProjectSelectorProps) {
  // No anchorRef needed — ComboboxContent now portals to document.body
  // and positions itself via containerRef from Combobox context
  const selectedProject = projects.find((p) => p.project_id === value);
  const isEmpty = !loading && projects.length === 0;
  const needsSelection = !loading && !isEmpty && !value;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="project-selector"
          className="text-[10px] sm:text-xs md:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Project
        </label>
        {isEmpty && !loading && (
          <Link
            href="/userdashboard/projects"
            className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-primary hover:underline"
          >
            <Plus size={11} />
            Create project
          </Link>
        )}
      </div>

      {/* Empty state — no projects exist yet */}
      {isEmpty ? (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 px-3 py-3 sm:px-4 sm:py-3.5">
          <FolderGit2 size={18} className="shrink-0 text-amber-500 dark:text-amber-400" />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300">
              No projects yet
            </p>
            <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              You need a project to save scan results.{" "}
              <Link
                href="/userdashboard/projects"
                className="font-semibold underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
              >
                Create your first project →
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <>
          <Combobox
            value={value}
            onValueChange={(newValue) => {
              if (newValue) onChange(newValue);
            }}
            disabled={disabled || loading}
          >
            <ComboboxInput
              id="project-selector"
              placeholder={loading ? "Loading projects..." : "Select a project"}
              showTrigger
              openOnClick
              className={cn(
                "w-full font-semibold",
                needsSelection && "border-amber-400 dark:border-amber-600 ring-1 ring-amber-300 dark:ring-amber-700"
              )}
              value={selectedProject?.name ?? ""}
              readOnly
              aria-label="Select project"
              aria-busy={loading}
            />

            {/* Portal-based — escapes clip-path on any ancestor */}
            <ComboboxContent>
              <ComboboxList>
                {projects.map((project, index) => (
                  <ComboboxItem
                    key={project.project_id}
                    value={project.project_id}
                    aria-selected={project.project_id === value}
                    className={cn(
                      "rounded-none border-b border-gray-200/30 dark:border-gray-700/40 last:border-b-0",
                      // alternating row tint
                      index % 2 === 0
                        ? "bg-gray-50/60 dark:bg-gray-800/40"
                        : "bg-transparent",
                      // hover — light + dark
                      "hover:bg-teal-50 hover:text-gray-900",
                      "dark:hover:bg-teal-500/15 dark:hover:text-gray-100",
                      // selected — light + dark
                      "data-[selected=true]:bg-teal-50 data-[selected=true]:text-gray-900",
                      "dark:data-[selected=true]:bg-teal-500/20 dark:data-[selected=true]:text-gray-100",
                    )}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500/60" />
                      {project.name}
                    </span>
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          {needsSelection && (
            <p className="flex items-center gap-1.5 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium" role="alert">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Select a project to enable scanning
            </p>
          )}

          {selectedProject && (
            <p
              className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400"
              role="note"
            >
              Scans will be saved under {selectedProject.name}.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function ProjectSelectorSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading project selector">
      <div className="h-4 w-16 animate-pulse rounded bg-[#00D0B2]/10 dark:bg-[#00D0B2]/8" />
      <div className="h-10 w-full animate-pulse rounded bg-[#00D0B2]/10 dark:bg-[#00D0B2]/8" />
    </div>
  );
}

export function ProjectSelectorEmpty({ onCreate }: { onCreate?: () => void }) {
  return (
    <div
      className="rounded-lg border border-dashed border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-800/50 p-6 text-center"
      role="status"
    >
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        No projects available
      </p>
      {onCreate && (
        <button
          onClick={onCreate}
          className="mt-2 text-xs sm:text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Create your first project
        </button>
      )}
    </div>
  );
}