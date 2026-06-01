// BackboneNode.tsx — Custom React Flow node for infrastructure backbone components
// Uses actual technology brand icons from react-icons

"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { BackboneNodeData } from "../graph.types";

// Technology-specific icons from react-icons
import { SiPython, SiRedis, SiPostgresql, SiDocker } from "react-icons/si";
import { TbBrandGolang } from "react-icons/tb";
import { VscGlobe } from "react-icons/vsc";
import { BiNetworkChart } from "react-icons/bi";
import { MdStorage } from "react-icons/md";
import { HiOutlineServerStack } from "react-icons/hi2";

// Icon + color mapping for each backbone technology
const TECH_CONFIG: Record<string, { icon: React.ElementType; color: string; activeColor: string }> = {
    Client: {
        icon: VscGlobe,
        color: "text-gray-400",
        activeColor: "text-blue-400",
    },
    FastAPI: {
        icon: SiPython,
        color: "text-gray-400",
        activeColor: "text-emerald-400",
    },
    gRPC: {
        icon: BiNetworkChart,
        color: "text-gray-400",
        activeColor: "text-sky-400",
    },
    "Redis Queue": {
        icon: SiRedis,
        color: "text-gray-400",
        activeColor: "text-red-400",
    },
    "Go Engine": {
        icon: TbBrandGolang,
        color: "text-gray-400",
        activeColor: "text-cyan-400",
    },
    "Docker/gVisor": {
        icon: SiDocker,
        color: "text-gray-400",
        activeColor: "text-blue-400",
    },
    "Artifact Store": {
        icon: MdStorage,
        color: "text-gray-400",
        activeColor: "text-amber-400",
    },
    "Redis Stream": {
        icon: SiRedis,
        color: "text-gray-400",
        activeColor: "text-red-400",
    },
    PostgreSQL: {
        icon: SiPostgresql,
        color: "text-gray-400",
        activeColor: "text-blue-300",
    },
};

const DEFAULT_CONFIG = {
    icon: HiOutlineServerStack,
    color: "text-gray-400",
    activeColor: "text-[#00D0B2]",
};

function BackboneNodeComponent({ data }: NodeProps) {
    const nodeData = data as unknown as BackboneNodeData;
    const config = TECH_CONFIG[nodeData.label] || DEFAULT_CONFIG;
    const Icon = config.icon;
    const isActive = nodeData.status === "ACTIVE";

    return (
        <div
            className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border
                bg-gray-900/90 backdrop-blur-sm
                text-[9px] font-medium
                transition-all duration-300
                ${isActive
                    ? "border-[#00D0B2]/40 shadow-[0_0_12px_rgba(0,208,178,0.12)]"
                    : "border-gray-700/40"
                }
            `}
            style={{ minWidth: 100 }}
        >
            <Icon
                size={12}
                className={`shrink-0 ${isActive ? config.activeColor : config.color}`}
            />
            <span className={isActive ? "text-gray-100" : "text-gray-400"}>
                {nodeData.label}
            </span>
            <Handle type="target" position={Position.Left} className="w-1.5! h-1.5! bg-gray-600! border-0!" />
            <Handle type="source" position={Position.Right} className="w-1.5! h-1.5! bg-gray-600! border-0!" />
        </div>
    );
}

export const BackboneNode = memo(BackboneNodeComponent);
