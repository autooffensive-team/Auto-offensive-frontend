// graph.store.ts — Zustand store for Scan Execution Graph visualization state
// Simplified for React Flow integration (no custom pulse animations)

import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import type { ActiveRun, ScanStep } from "@/types/scan";
import type {
    BackboneNodeData,
    EdgeAnimationState,
    GraphNodeConfig,
    PipelineNodeData,
    PipelineNodeState,
    StepStatus,
} from "./graph.types";
import { BACKBONE_EDGES, BACKBONE_NODES, STATUS_NORMALIZATION_MAP } from "./graph.types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LogLine {
    id: string;
    source: string;
    level: string;
    text: string;
    timestamp: string;
}

export type StatusClassification = "idle" | "running" | "terminal";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_LOG_ENTRIES = 10_000;
const THROTTLE_MS = 16;

// ---------------------------------------------------------------------------
// Exported Utility Functions
// ---------------------------------------------------------------------------

export function normalizeStepStatus(rawStatus: string): StepStatus {
    if (!rawStatus) return "QUEUED";

    const upper = rawStatus.toUpperCase();
    if (upper in STATUS_NORMALIZATION_MAP) {
        return STATUS_NORMALIZATION_MAP[upper];
    }

    const stripped = upper
        .replace(/^JOB_STATUS_/, "")
        .replace(/^STEP_STATUS_/, "");

    if (stripped in STATUS_NORMALIZATION_MAP) {
        return STATUS_NORMALIZATION_MAP[stripped];
    }

    if (stripped.includes("RUNNING")) return "RUNNING";
    if (stripped.includes("COMPLETED") || stripped.includes("COMPLETE"))
        return "COMPLETED";
    if (stripped.includes("FAILED") || stripped.includes("FAIL")) return "FAILED";
    if (stripped.includes("CANCELLED") || stripped.includes("CANCEL"))
        return "CANCELLED";
    if (stripped.includes("SKIPPED") || stripped.includes("SKIP"))
        return "SKIPPED";
    if (
        stripped.includes("QUEUED") ||
        stripped.includes("PENDING") ||
        stripped.includes("QUEUE")
    )
        return "QUEUED";

    return "QUEUED";
}

export function classifyStatus(status: string): StatusClassification {
    if (!status) return "idle";

    const lower = status.toLowerCase();

    if (lower === "idle") return "idle";
    if (lower === "submitting" || lower.includes("running")) return "running";
    if (
        lower.includes("completed") ||
        lower.includes("failed") ||
        lower.includes("cancelled") ||
        lower.includes("partial")
    ) {
        return "terminal";
    }

    return "idle";
}

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

export interface GraphStoreState {
    // Backbone slice
    backboneAnimating: boolean;
    disconnected: boolean;

    // Pipeline slice
    pipelineNodes: PipelineNodeState[];

    // Edges slice
    edgeStates: Map<string, EdgeAnimationState>;

    // Logs slice
    logEntries: LogLine[];
    selectedToolFilter: string | null;
    unreadCount: number;

    // Frozen state (terminal)
    _frozen: boolean;

    // Throttle tracking
    _lastUpdateTime: number;
    _pendingRafId: number | null;

    // Actions
    syncFromActiveRun: (run: ActiveRun) => void;
    appendLog: (line: LogLine) => void;
    setToolFilter: (toolName: string | null) => void;
    reset: () => void;
    freeze: () => void;
}

// ---------------------------------------------------------------------------
// Helper: Build pipeline node config
// ---------------------------------------------------------------------------

function buildNodeConfig(
    step: ScanStep,
    index: number,
    status: StepStatus
): GraphNodeConfig {
    return {
        id: `pipeline-${step.step_id}`,
        label: step.tool_name,
        x: index * 160,
        y: 0,
        width: 120,
        height: 48,
        layer: "pipeline",
        status,
    };
}

// ---------------------------------------------------------------------------
// Helper: Compute edge states from pipeline nodes
// ---------------------------------------------------------------------------

function computeEdgeStates(
    nodes: PipelineNodeState[]
): Map<string, EdgeAnimationState> {
    const edges = new Map<string, EdgeAnimationState>();

    for (let i = 0; i < nodes.length - 1; i++) {
        const source = nodes[i];
        const target = nodes[i + 1];
        const edgeId = `edge-${source.stepId}-${target.stepId}`;

        if (source.status === "COMPLETED" && target.status === "RUNNING") {
            edges.set(edgeId, "active");
        } else if (
            source.status === "COMPLETED" ||
            source.status === "RUNNING" ||
            target.status === "COMPLETED" ||
            target.status === "RUNNING"
        ) {
            edges.set(edgeId, "static");
        } else {
            edges.set(edgeId, "muted");
        }
    }

    return edges;
}

// ---------------------------------------------------------------------------
// Helper: Filter malformed steps
// ---------------------------------------------------------------------------

function isValidStep(step: unknown): step is ScanStep {
    if (!step || typeof step !== "object") return false;
    const s = step as Record<string, unknown>;
    return (
        typeof s.step_id === "string" &&
        s.step_id.length > 0 &&
        typeof s.tool_name === "string" &&
        s.tool_name.length > 0
    );
}

// ---------------------------------------------------------------------------
// Store Creation
// ---------------------------------------------------------------------------

const initialState = {
    backboneAnimating: false,
    disconnected: false,
    pipelineNodes: [] as PipelineNodeState[],
    edgeStates: new Map<string, EdgeAnimationState>(),
    logEntries: [] as LogLine[],
    selectedToolFilter: null as string | null,
    unreadCount: 0,
    _frozen: false,
    _lastUpdateTime: 0,
    _pendingRafId: null as number | null,
};

export const useGraphStore = create<GraphStoreState>((set, get) => ({
    ...initialState,

    syncFromActiveRun: (run: ActiveRun) => {
        const state = get();
        if (state._frozen) return;

        const now =
            typeof performance !== "undefined" ? performance.now() : Date.now();
        if (now - state._lastUpdateTime < THROTTLE_MS) {
            if (state._pendingRafId === null && typeof requestAnimationFrame !== "undefined") {
                const rafId = requestAnimationFrame(() => {
                    const currentState = get();
                    if (!currentState._frozen) {
                        performSync(run, set, get);
                    }
                    set({ _pendingRafId: null });
                });
                set({ _pendingRafId: rafId });
            }
            return;
        }

        performSync(run, set, get);
    },

    appendLog: (line: LogLine) => {
        const state = get();
        if (state._frozen) return;

        let entries = [...state.logEntries, line];
        if (entries.length > MAX_LOG_ENTRIES) {
            entries = entries.slice(entries.length - MAX_LOG_ENTRIES);
        }

        set({
            logEntries: entries,
            unreadCount: state.unreadCount + 1,
        });
    },

    setToolFilter: (toolName: string | null) => {
        set({ selectedToolFilter: toolName, unreadCount: 0 });
    },

    reset: () => {
        const state = get();
        if (state._pendingRafId !== null && typeof cancelAnimationFrame !== "undefined") {
            cancelAnimationFrame(state._pendingRafId);
        }
        set({
            ...initialState,
            edgeStates: new Map<string, EdgeAnimationState>(),
        });
    },

    freeze: () => {
        const state = get();
        if (state._pendingRafId !== null && typeof cancelAnimationFrame !== "undefined") {
            cancelAnimationFrame(state._pendingRafId);
        }
        set({ _frozen: true, _pendingRafId: null, backboneAnimating: false });
    },
}));

// ---------------------------------------------------------------------------
// Internal: Perform the actual sync logic
// ---------------------------------------------------------------------------

function performSync(
    run: ActiveRun,
    set: (partial: Partial<GraphStoreState>) => void,
    get: () => GraphStoreState
) {
    const classification = classifyStatus(run.status);

    if (classification === "terminal") {
        const nodes = buildPipelineNodes(run);
        const edges = computeEdgeStates(nodes);
        set({
            backboneAnimating: false,
            pipelineNodes: nodes,
            edgeStates: edges,
            _lastUpdateTime:
                typeof performance !== "undefined" ? performance.now() : Date.now(),
        });
        get().freeze();
        return;
    }

    if (classification === "idle") {
        set({
            backboneAnimating: false,
            _lastUpdateTime:
                typeof performance !== "undefined" ? performance.now() : Date.now(),
        });
        return;
    }

    const nodes = buildPipelineNodes(run);
    const edges = computeEdgeStates(nodes);

    set({
        backboneAnimating: true,
        pipelineNodes: nodes,
        edgeStates: edges,
        _lastUpdateTime:
            typeof performance !== "undefined" ? performance.now() : Date.now(),
    });
}

// ---------------------------------------------------------------------------
// Internal: Build pipeline nodes from ActiveRun
// ---------------------------------------------------------------------------

function buildPipelineNodes(run: ActiveRun): PipelineNodeState[] {
    if (!run.steps || !Array.isArray(run.steps)) return [];

    const validSteps = run.steps.filter(isValidStep);
    const sorted = [...validSteps].sort((a, b) => a.step_order - b.step_order);

    return sorted.map((step, index) => {
        const status = normalizeStepStatus(step.status);
        const isCurrent = step.step_id === run.stepId;

        return {
            stepId: step.step_id,
            toolName: step.tool_name,
            stepOrder: step.step_order,
            status,
            isCurrent,
            nodeConfig: buildNodeConfig(step, index, status),
        };
    });
}

// ---------------------------------------------------------------------------
// Derived Selectors: Convert store state to React Flow nodes and edges
// ---------------------------------------------------------------------------

/**
 * Converts the store state into React Flow nodes (backbone + pipeline).
 */
export function selectReactFlowNodes(state: GraphStoreState): Node[] {
    const isAnimating = state.backboneAnimating;

    // Backbone nodes (top row)
    const backboneNodes: Node<BackboneNodeData>[] = BACKBONE_NODES.map((cfg) => ({
        id: cfg.id,
        type: "backbone",
        position: { x: cfg.x, y: cfg.y },
        data: {
            label: cfg.label,
            status: isAnimating ? "ACTIVE" : "IDLE",
        },
        draggable: true,
    }));

    // Pipeline nodes (second row, offset below backbone)
    const pipelineNodes: Node<PipelineNodeData>[] = state.pipelineNodes.map(
        (pn, index) => ({
            id: pn.nodeConfig.id,
            type: "pipeline",
            position: { x: index * 180, y: 140 },
            data: {
                label: pn.toolName,
                stepId: pn.stepId,
                status: pn.status,
                isCurrent: pn.isCurrent,
            },
            draggable: true,
        })
    );

    return [...backboneNodes, ...pipelineNodes];
}

/**
 * Converts the store state into React Flow edges (backbone + pipeline).
 */
export function selectReactFlowEdges(state: GraphStoreState): Edge[] {
    const isAnimating = state.backboneAnimating;

    // Backbone edges
    const backboneEdges: Edge[] = BACKBONE_EDGES.map((cfg) => ({
        id: cfg.id,
        source: cfg.sourceId,
        target: cfg.targetId,
        animated: isAnimating,
        style: {
            stroke: isAnimating ? "#00D0B2" : "var(--border, #374151)",
            strokeWidth: 2,
            opacity: isAnimating ? 1 : 0.4,
        },
    }));

    // Pipeline edges
    const pipelineEdges: Edge[] = [];
    const pNodes = state.pipelineNodes;
    for (let i = 0; i < pNodes.length - 1; i++) {
        const source = pNodes[i];
        const target = pNodes[i + 1];
        const edgeId = `edge-${source.stepId}-${target.stepId}`;
        const edgeState = state.edgeStates.get(edgeId) || "muted";

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
}
