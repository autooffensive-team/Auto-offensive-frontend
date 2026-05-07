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
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
            className={cn("w-full", isEmpty && "text-muted-foreground")}
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
        <p className="text-xs text-muted-foreground" role="note">
          Scans will be saved under {selectedProject.name}.
        </p>
      )}
    </div>
  );
}

export function ProjectSelectorSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading project selector">
      <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      <div className="h-10 w-full animate-pulse rounded bg-muted" />
    </div>
  );
}

export function ProjectSelectorEmpty({ onCreate }: { onCreate?: () => void }) {
  return (
    <div 
      className="rounded-lg border border-dashed border-border bg-muted/50 p-6 text-center"
      role="status"
    >
      <p className="text-sm text-muted-foreground">No projects available</p>
      {onCreate && (
        <button
          onClick={onCreate}
          className="mt-2 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Create your first project
        </button>
      )}
    </div>
  );
}
