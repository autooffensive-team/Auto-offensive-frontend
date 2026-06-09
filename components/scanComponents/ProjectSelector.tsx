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

  return (
    <div className="space-y-2">
      <label
        htmlFor="project-selector"
        className="text-[10px] sm:text-xs md:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Project
      </label>

      <Combobox
        value={value}
        onValueChange={(newValue) => {
          if (newValue) onChange(newValue);
        }}
        disabled={disabled || loading}
      >
        <ComboboxInput
          id="project-selector"
          placeholder={
            loading
              ? "Loading projects..."
              : isEmpty
                ? "No projects available"
                : "Select a project"
          }
          showTrigger
          openOnClick
          className={cn(
            "w-full font-semibold",
            isEmpty && "text-gray-500 dark:text-gray-400"
          )}
          value={selectedProject?.name ?? ""}
          readOnly
          aria-label="Select project"
          aria-busy={loading}
        />

        {/* Portal-based — escapes clip-path on any ancestor */}
        <ComboboxContent>
          <ComboboxList>
            {isEmpty ? (
              <ComboboxItem value="" disabled>
                No projects available
              </ComboboxItem>
            ) : (
              projects.map((project, index) => (
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
              ))
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {selectedProject && (
        <p
          className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400"
          role="note"
        >
          Scans will be saved under {selectedProject.name}.
        </p>
      )}
    </div>
  );
}

export function ProjectSelectorSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading project selector">
      <div className="h-4 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      <div className="h-10 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
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