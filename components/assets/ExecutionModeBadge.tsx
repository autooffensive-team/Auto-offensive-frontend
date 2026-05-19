"use client";

import { Globe, GitBranch, Terminal, HelpCircle } from "lucide-react";

type ExecutionMode = "web" | "cicd" | "cli" | "unknown";

type ExecutionModeBadgeProps = {
  mode: ExecutionMode;
};

const config: Record<ExecutionMode, { icon: typeof Globe; label: string; className: string }> = {
  web: {
    icon: Globe,
    label: "Web",
    className: "text-blue-600 dark:text-blue-400",
  },
  cicd: {
    icon: GitBranch,
    label: "CI/CD",
    className: "text-purple-600 dark:text-purple-400",
  },
  cli: {
    icon: Terminal,
    label: "CLI",
    className: "text-amber-600 dark:text-amber-400",
  },
  unknown: {
    icon: HelpCircle,
    label: "Unknown",
    className: "text-slate-500 dark:text-slate-400",
  },
};

export default function ExecutionModeBadge({ mode }: ExecutionModeBadgeProps) {
  const { icon: Icon, label, className } = config[mode] ?? config.unknown;

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${className}`}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </span>
  );
}
