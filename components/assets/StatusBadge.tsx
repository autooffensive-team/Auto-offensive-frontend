"use client";

type TargetStatus = "Scanning" | "Active" | "Idle";

type StatusBadgeProps = {
  status: TargetStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
      <span className={`inline-block h-2 w-2 rounded-full ${dotClass(status)}`} />
      <span className={textClass(status)}>{status}</span>
    </span>
  );
}

function dotClass(status: TargetStatus): string {
  switch (status) {
    case "Scanning":
      return "bg-green-500 animate-pulse";
    case "Active":
      return "bg-green-500";
    case "Idle":
      return "bg-gray-400 dark:bg-gray-500";
  }
}

function textClass(status: TargetStatus): string {
  switch (status) {
    case "Scanning":
      return "text-green-600 dark:text-green-400";
    case "Active":
      return "text-green-600 dark:text-green-400";
    case "Idle":
      return "text-gray-500 dark:text-gray-400";
  }
}
