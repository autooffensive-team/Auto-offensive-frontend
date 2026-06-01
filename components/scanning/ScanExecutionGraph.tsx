// ScanExecutionGraph.tsx — React Flow-based scan execution pipeline visualization

"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ReactFlowProvider,
    Controls,
    type NodeTypes,
    type Node,
    type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { ActiveRun } from "@/types/scan";
import {
    useGraphStore,
} from "./graph.store";
import type { LogLine } from "./graph.store";
import type { BackboneNodeData, PipelineNodeData } from "./graph.types";
import { BACKBONE_NODES, BACKBONE_EDGES } from "./graph.types";
import { useScanStream } from "./useScanStream";
import { BackboneNode } from "./nodes/BackboneNode";
import { PipelineNode } from "./nodes/PipelineNode";
import { AlertTriangle, Maximize2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Props Interface
// ---------------------------------------------------------------------------

export interface ScanExecutionGraphProps {
    run: ActiveRun;
    logs: LogLine[];
    errors: string[];
}

// ---------------------------------------------------------------------------
// Custom Node Types Registration
// ---------------------------------------------------------------------------

const nodeTypes: NodeTypes = {
    backbone: BackboneNode,
    pipeline: PipelineNode,
};

// ---------------------------------------------------------------------------
// Inner component (needs ReactFlowProvider context for useReactFlow)
// ---------------------------------------------------------------------------

const ScanExecutionGraphInner: React.FC<ScanExecutionGraphProps> = ({
    run,
    logs,
    errors,
}) => {
    // Sync props to Graph Store
    useScanStream(run, logs, errors);

    const { fitView } = useReactFlow();
    const initialFitDone = useRef(false);

    // Subscribe to raw store state (primitive/reference-stable values)
    const backboneAnimating = useGraphStore((s) => s.backboneAnimating);
    const pipelineNodes = useGraphStore((s) => s.pipelineNodes);
    const edgeStates = useGraphStore((s) => s.edgeStates);
    const disconnected = useGraphStore((s) => s.disconnected);

    // Derive React Flow nodes from store state (memoized to avoid infinite loop)
    // Pipeline tools run inside Docker containers (Go Engine → Docker → tools)
    // so they branch off from the Docker/gVisor node
    const storeNodes = useMemo((): Node[] => {
        const backbone: Node<BackboneNodeData>[] = BACKBONE_NODES.map((cfg) => ({
            id: cfg.id,
            type: "backbone",
            position: { x: cfg.x, y: cfg.y },
            data: {
                label: cfg.label,
                status: backboneAnimating ? "ACTIVE" : "IDLE",
            },
            draggable: true,
        }));

        // Pipeline tools connect to Docker/gVisor — position them below it
        // Docker/gVisor is at x:800, y:0. Tools fan out below.
        const dockerX = 800;
        const dockerY = 0;
        const pipeline: Node<PipelineNodeData>[] = pipelineNodes.map((pn, index) => ({
            id: pn.nodeConfig.id,
            type: "pipeline",
            position: {
                x: dockerX - ((pipelineNodes.length - 1) * 80) + index * 160,
                y: dockerY + 100 + Math.abs(index - (pipelineNodes.length - 1) / 2) * 20,
            },
            data: {
                label: pn.toolName,
                stepId: pn.stepId,
                status: pn.status,
                isCurrent: pn.isCurrent,
            },
            draggable: true,
        }));

        return [...backbone, ...pipeline];
    }, [backboneAnimating, pipelineNodes]);

    // Derive React Flow edges from store state (memoized)
    // Pipeline tools are connected: Docker → first tool, then tool → tool sequentially
    const storeEdges = useMemo((): Edge[] => {
        const backboneEdges: Edge[] = BACKBONE_EDGES.map((cfg) => ({
            id: cfg.id,
            source: cfg.sourceId,
            target: cfg.targetId,
            animated: backboneAnimating,
            style: {
                stroke: backboneAnimating ? "#00D0B2" : "var(--border, #374151)",
                strokeWidth: 2,
                opacity: backboneAnimating ? 1 : 0.4,
            },
        }));

        const pipelineEdges: Edge[] = [];

        // Connect Docker/gVisor → first pipeline tool
        if (pipelineNodes.length > 0) {
            const firstNode = pipelineNodes[0];
            const isFirstActive = firstNode.status === "RUNNING" || firstNode.status === "COMPLETED";
            pipelineEdges.push({
                id: `edge-docker-${firstNode.stepId}`,
                source: "docker",
                target: firstNode.nodeConfig.id,
                animated: backboneAnimating && isFirstActive,
                style: {
                    stroke: backboneAnimating && isFirstActive ? "#00D0B2" : "var(--border, #374151)",
                    strokeWidth: 2,
                    opacity: backboneAnimating ? 0.8 : 0.3,
                },
            });
        }

        // Connect pipeline tools sequentially
        for (let i = 0; i < pipelineNodes.length - 1; i++) {
            const source = pipelineNodes[i];
            const target = pipelineNodes[i + 1];
            const edgeId = `edge-${source.stepId}-${target.stepId}`;
            const edgeState = edgeStates.get(edgeId) || "muted";

            pipelineEdges.push({
                id: edgeId,
                source: source.nodeConfig.id,
                target: target.nodeConfig.id,
                animated: edgeState === "active",
                style: {
                    stroke: edgeState === "active" ? "#00D0B2" : "var(--border, #374151)",
                    strokeWidth: 2,
                    opacity: edgeState === "muted" ? 0.3 : 1,
                },
            });
        }

        return [...backboneEdges, ...pipelineEdges];
    }, [backboneAnimating, pipelineNodes, edgeStates]);

    // React Flow state
    const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

    // Sync store → React Flow state when store updates
    useEffect(() => {
        setNodes(storeNodes);
    }, [storeNodes, setNodes]);

    useEffect(() => {
        setEdges(storeEdges);
    }, [storeEdges, setEdges]);

    // Fit view on initial render once nodes are ready
    useEffect(() => {
        if (!initialFitDone.current && nodes.length > 0) {
            setTimeout(() => fitView({ padding: 0.3, duration: 300 }), 50);
            initialFitDone.current = true;
        }
    }, [nodes, fitView]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            useGraphStore.getState().reset();
        };
    }, []);

    // Reset button handler — resets node positions and fits view
    const handleReset = useCallback(() => {
        setNodes(storeNodes);
        setEdges(storeEdges);
        setTimeout(() => fitView({ padding: 0.3, duration: 400 }), 50);
    }, [storeNodes, storeEdges, setNodes, setEdges, fitView]);

    return (
        <div
            className="relative w-full rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            style={{ height: 350, background: "var(--background, #0f172a)" }}
            data-testid="scan-execution-graph"
        >
            {/* Toolbar: Reset button */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 rounded-md border border-gray-600/50 bg-gray-800/80 backdrop-blur-sm px-2.5 py-1.5 text-[11px] font-medium text-gray-300 transition-colors hover:bg-gray-700/80 hover:text-white hover:border-gray-500/50"
                    title="Reset graph layout"
                >
                    <Maximize2 size={12} />
                    Reset
                </button>
            </div>

            {/* Disconnection warning */}
            {disconnected && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400">
                    <AlertTriangle size={14} />
                    <span>Stream disconnected</span>
                </div>
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                proOptions={{ hideAttribution: true }}
                minZoom={0.3}
                maxZoom={2}
                defaultEdgeOptions={{
                    type: "smoothstep",
                }}
                className="scan-execution-flow"
            >
                <Controls
                    showInteractive={false}
                    className="!bg-gray-800/80 !border-gray-600/50 !shadow-lg [&>button]:!bg-gray-800 [&>button]:!border-gray-600/50 [&>button]:!text-gray-300 [&>button:hover]:!bg-gray-700"
                />
            </ReactFlow>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Wrapper with ReactFlowProvider (required for useReactFlow hook)
// ---------------------------------------------------------------------------

const ScanExecutionGraph: React.FC<ScanExecutionGraphProps> = (props) => (
    <ReactFlowProvider>
        <ScanExecutionGraphInner {...props} />
    </ReactFlowProvider>
);

export default ScanExecutionGraph;
