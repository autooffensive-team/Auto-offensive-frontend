// BackboneNode.tsx — Custom React Flow node for infrastructure backbone components

"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { BackboneNodeData } from "../graph.types";
import {
    Globe,
    Zap,
    Radio,
    Database,
    Server,
    Container,
    HardDrive,
    Activity,
    CircuitBoard,
} from "lucide-react";

// Icon mapping for backbone infrastructure nodes
const ICON_MAP: Record<string, React.ElementType> = {
    Client: Globe,
    FastAPI: Zap,
    gRPC: Radio,
    "Redis Queue": Database,
    "Go Engine": Server,
    "Docker/gVisor": Container,
    "Artifact Store": HardDrive,
    "Redis Stream": Activity,
    PostgreSQL: CircuitBoard,
};

function BackboneNodeComponent({ data }: NodeProps) {
    const nodeData = data as unknown as BackboneNodeData;
    const Icon = ICON_MAP[nodeData.label] || Server;
    const isActive = nodeData.status === "ACTIVE";

    return (
        <div
            className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border
                bg-[var(--card-bg,_#1e293b)] 
                text-[11px] font-medium text-gray-300
                transition-all duration-300
                ${isActive
                    ? "border-[#00D0B2]/50 shadow-[0_0_8px_rgba(0,208,178,0.15)]"
                    : "border-gray-700/50"
                }
            `}
            style={{ minWidth: 120 }}
        >
            <Icon
                size={14}
                className={isActive ? "text-[#00D0B2]" : "text-gray-500"}
            />
            <span className={isActive ? "text-gray-100" : "text-gray-400"}>
                {nodeData.label}
            </span>
            <Handle type="target" position={Position.Left} className="!w-1.5 !h-1.5 !bg-gray-600 !border-0" />
            <Handle type="source" position={Position.Right} className="!w-1.5 !h-1.5 !bg-gray-600 !border-0" />
        </div>
    );
}

export const BackboneNode = memo(BackboneNodeComponent);
