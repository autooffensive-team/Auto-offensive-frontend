"use client";

import { Project } from "@/types/scan";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  useComboboxAnchor,
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
  const anchorRef = useComboboxAnchor();
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
        onValueChange={(newValue) => { if (newValue) onChange(newValue); }}
        disabled={disabled || loading}
      >
        <div ref={anchorRef}>
          <ComboboxInput
            id="project-selector"
            placeholder={loading ? "Loading projects..." : isEmpty ? "No projects available" : "Select a project"}
            showTrigger
            openOnClick
            className={cn("w-full font-semibold", isEmpty && "text-gray-500 dark:text-gray-400")}
            value={selectedProject?.name ?? ""}
            readOnly
            aria-label="Select project"
            aria-busy={loading}
          />
        </div>
        
        <ComboboxContent anchor={anchorRef.current}>
          <ComboboxList>
            {isEmpty ? (
              <ComboboxItem value="" disabled>
                No projects available
              </ComboboxItem>
            ) : (
              projects.map((project) => (
                <ComboboxItem 
                  key={project.project_id} 
                  value={project.project_id}
                  aria-selected={project.project_id === value}
                >
                  {project.name}
                </ComboboxItem>
              ))
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      
      {selectedProject && (
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400" role="note">
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
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No projects available</p>
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
