// PipelineNode.tsx — Custom React Flow node for pipeline tool steps

"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { PipelineNodeData } from "../graph.types";

// Status-driven border colors
const STATUS_BORDER: Record<string, string> = {
    QUEUED: "#F59E0B",     // amber
    RUNNING: "#00D0B2",    // cyan/teal
    COMPLETED: "#10B981",  // green
    FAILED: "#EF4444",     // red
    SKIPPED: "#6B7280",    // gray (dimmed)
    CANCELLED: "#6B7280",  // gray (dimmed)
};

function PipelineNodeComponent({ data }: NodeProps) {
    const nodeData = data as unknown as PipelineNodeData;
    const borderColor = STATUS_BORDER[nodeData.status] || "#374151";
    const isRunning = nodeData.status === "RUNNING";
    const isDimmed = nodeData.status === "SKIPPED" || nodeData.status === "CANCELLED";

    return (
        <div
            className={`
                relative flex items-center justify-center px-4 py-2.5 rounded-lg border-2
                bg-[var(--card-bg,_#1e293b)]
                text-xs font-semibold
                transition-all duration-300
                ${isDimmed ? "opacity-40" : "opacity-100"}
                ${isRunning ? "animate-[pulse-border_2s_ease-in-out_infinite]" : ""}
            `}
            style={{
                borderColor,
                minWidth: 120,
                minHeight: 44,
            }}
        >
            {/* Subtle pulse ring for RUNNING state */}
            {isRunning && (
                <span
                    className="absolute inset-0 rounded-lg animate-ping opacity-20"
                    style={{ borderColor, border: `1px solid ${borderColor}` }}
                />
            )}

            <span
                className={`
                    ${nodeData.status === "COMPLETED" ? "text-emerald-400" : ""}
                    ${nodeData.status === "FAILED" ? "text-red-400" : ""}
                    ${isRunning ? "text-[#00D0B2]" : ""}
                    ${nodeData.status === "QUEUED" ? "text-amber-400" : ""}
                    ${isDimmed ? "text-gray-500" : ""}
                `}
            >
                {nodeData.label}
            </span>

            <Handle type="target" position={Position.Left} className="!w-1.5 !h-1.5 !bg-gray-600 !border-0" />
            <Handle type="source" position={Position.Right} className="!w-1.5 !h-1.5 !bg-gray-600 !border-0" />
        </div>
    );
}

export const PipelineNode = memo(PipelineNodeComponent);
