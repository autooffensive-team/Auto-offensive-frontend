// PipelineNode.tsx — Custom React Flow node for pipeline tool steps
// Shows actual security tool icons where available

"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { PipelineNodeData } from "../graph.types";
import { GiRadarSweep } from "react-icons/gi";
import { MdOutlineSecurity, MdBugReport } from "react-icons/md";
import { TbWorldSearch, TbNetwork, TbScan } from "react-icons/tb";
import { VscTerminal } from "react-icons/vsc";
import { BiSearchAlt } from "react-icons/bi";

// Tool-specific icon mapping for common security tools
const TOOL_ICON_MAP: Record<string, React.ElementType> = {
    subfinder: TbWorldSearch,
    httpx: TbNetwork,
    nuclei: MdBugReport,
    nmap: GiRadarSweep,
    naabu: TbScan,
    katana: BiSearchAlt,
    ffuf: VscTerminal,
    dirsearch: VscTerminal,
    amass: TbWorldSearch,
    masscan: GiRadarSweep,
    nikto: MdOutlineSecurity,
    wpscan: MdOutlineSecurity,
    sqlmap: MdBugReport,
    gobuster: VscTerminal,
    feroxbuster: VscTerminal,
    whatweb: TbNetwork,
    wafw00f: MdOutlineSecurity,
    dnsx: TbWorldSearch,
    shuffledns: TbWorldSearch,
    tlsx: TbNetwork,
};

const DEFAULT_TOOL_ICON = TbScan;

// Status-driven border colors
const STATUS_BORDER: Record<string, string> = {
    QUEUED: "#F59E0B",
    RUNNING: "#00D0B2",
    COMPLETED: "#10B981",
    FAILED: "#EF4444",
    SKIPPED: "#6B7280",
    CANCELLED: "#6B7280",
};

// Status-driven text colors
const STATUS_TEXT: Record<string, string> = {
    QUEUED: "text-amber-400",
    RUNNING: "text-[#00D0B2]",
    COMPLETED: "text-emerald-400",
    FAILED: "text-red-400",
    SKIPPED: "text-gray-500",
    CANCELLED: "text-gray-500",
};

function PipelineNodeComponent({ data }: NodeProps) {
    const nodeData = data as unknown as PipelineNodeData;
    const borderColor = STATUS_BORDER[nodeData.status] || "#374151";
    const textClass = STATUS_TEXT[nodeData.status] || "text-gray-400";
    const isRunning = nodeData.status === "RUNNING";
    const isDimmed = nodeData.status === "SKIPPED" || nodeData.status === "CANCELLED";

    // Find the tool icon (case-insensitive match)
    const toolNameLower = nodeData.label.toLowerCase();
    const Icon = TOOL_ICON_MAP[toolNameLower] || DEFAULT_TOOL_ICON;

    return (
        <div
            className={`
                relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border-2
                bg-gray-900/90 backdrop-blur-sm
                text-[9px] font-semibold
                transition-all duration-300
                ${isDimmed ? "opacity-40" : "opacity-100"}
            `}
            style={{
                borderColor,
                minWidth: 100,
                minHeight: 34,
            }}
        >
            {/* Subtle pulse ring for RUNNING state */}
            {isRunning && (
                <span
                    className="absolute inset-0 rounded-md animate-ping opacity-15"
                    style={{ border: `1px solid ${borderColor}` }}
                />
            )}

            <Icon
                size={12}
                className={`shrink-0 ${textClass}`}
            />

            <span className={textClass}>
                {nodeData.label}
            </span>

            <Handle type="target" position={Position.Left} className="w-1.5! h-1.5! bg-gray-600! border-0!" />
            <Handle type="source" position={Position.Right} className="w-1.5! h-1.5! bg-gray-600! border-0!" />
        </div>
    );
}

export const PipelineNode = memo(PipelineNodeComponent);
