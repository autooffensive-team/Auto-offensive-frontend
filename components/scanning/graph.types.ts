// graph.types.ts — Type definitions for the Scan Execution Graph visualization
// Updated to use React Flow (@xyflow/react) node/edge types

import type { Node, Edge } from "@xyflow/react";

// ---------------------------------------------------------------------------
// Core Enums & Types
// ---------------------------------------------------------------------------

export type StepStatus =
    | "QUEUED"
    | "RUNNING"
    | "COMPLETED"
    | "FAILED"
    | "SKIPPED"
    | "CANCELLED";

export type EdgeAnimationState = "active" | "static" | "muted";

// ---------------------------------------------------------------------------
// React Flow Node Data Types
// ---------------------------------------------------------------------------

export type BackboneNodeData = {
    label: string;
    status: StepStatus | "IDLE" | "ACTIVE";
};

export type PipelineNodeData = {
    label: string;
    stepId: string;
    status: StepStatus;
    isCurrent: boolean;
};

export type GraphNode = Node<BackboneNodeData | PipelineNodeData>;
export type GraphEdge = Edge;

// ---------------------------------------------------------------------------
// Legacy Configuration Interfaces (kept for store compatibility)
// ---------------------------------------------------------------------------

export interface GraphNodeConfig {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    layer: "backbone" | "pipeline";
    status: StepStatus | "IDLE" | "ACTIVE";
}

export interface GraphEdgeConfig {
    id: string;
    sourceId: string;
    targetId: string;
    animated: boolean;
    opacity: number;
    layer: "backbone" | "pipeline";
}

// ---------------------------------------------------------------------------
// Pipeline & Runtime Interfaces
// ---------------------------------------------------------------------------

export interface PipelineStep {
    stepId: string;
    toolName: string;
    stepOrder: number;
    status: StepStatus;
    isCurrent: boolean;
}

export interface StreamPulseEvent {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    level: "submitted" | "log" | "stdout" | "done" | "warning" | "error";
    timestamp: number;
    duration: number; // ms
}

export interface RuntimeGraph {
    backboneNodes: GraphNodeConfig[];
    backboneEdges: GraphEdgeConfig[];
    pipelineNodes: GraphNodeConfig[];
    pipelineEdges: GraphEdgeConfig[];
}

export interface PipelineNodeState {
    stepId: string;
    toolName: string;
    stepOrder: number;
    status: StepStatus;
    isCurrent: boolean;
    nodeConfig: GraphNodeConfig;
}

// ---------------------------------------------------------------------------
// Status Mapping Constants
// ---------------------------------------------------------------------------

export const STATUS_NORMALIZATION_MAP: Record<string, StepStatus> = {
    PENDING: "QUEUED",
    QUEUED: "QUEUED",
    STEP_STATUS_QUEUED: "QUEUED",
    RUNNING: "RUNNING",
    STEP_STATUS_RUNNING: "RUNNING",
    COMPLETED: "COMPLETED",
    STEP_STATUS_COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    STEP_STATUS_FAILED: "FAILED",
    CANCELLED: "CANCELLED",
    STEP_STATUS_CANCELLED: "CANCELLED",
    SKIPPED: "SKIPPED",
    STEP_STATUS_SKIPPED: "SKIPPED",
};

// ---------------------------------------------------------------------------
// Backbone Layout Configuration
// ---------------------------------------------------------------------------

export const BACKBONE_NODES: GraphNodeConfig[] = [
    { id: "client", label: "Client", x: 0, y: 0, width: 120, height: 48, layer: "backbone", status: "IDLE" },
    { id: "fastapi", label: "FastAPI", x: 160, y: 0, width: 120, height: 48, layer: "backbone", status: "IDLE" },
    { id: "grpc", label: "gRPC", x: 320, y: 0, width: 120, height: 48, layer: "backbone", status: "IDLE" },
    { id: "redis-queue", label: "Redis Queue", x: 480, y: 0, width: 120, height: 48, layer: "backbone", status: "IDLE" },
    { id: "go-engine", label: "Go Engine", x: 640, y: 0, width: 120, height: 48, layer: "backbone", status: "IDLE" },
    { id: "docker", label: "Docker/gVisor", x: 800, y: 0, width: 120, height: 48, layer: "backbone", status: "IDLE" },
    { id: "artifact", label: "Artifact Store", x: 960, y: -60, width: 120, height: 48, layer: "backbone", status: "IDLE" },
    { id: "redis-stream", label: "Redis Stream", x: 960, y: 0, width: 120, height: 48, layer: "backbone", status: "IDLE" },
    { id: "postgresql", label: "PostgreSQL", x: 960, y: 60, width: 120, height: 48, layer: "backbone", status: "IDLE" },
];

export const BACKBONE_EDGES: GraphEdgeConfig[] = [
    { id: "edge-client-fastapi", sourceId: "client", targetId: "fastapi", animated: false, opacity: 0.4, layer: "backbone" },
    { id: "edge-fastapi-grpc", sourceId: "fastapi", targetId: "grpc", animated: false, opacity: 0.4, layer: "backbone" },
    { id: "edge-grpc-redis-queue", sourceId: "grpc", targetId: "redis-queue", animated: false, opacity: 0.4, layer: "backbone" },
    { id: "edge-redis-queue-go-engine", sourceId: "redis-queue", targetId: "go-engine", animated: false, opacity: 0.4, layer: "backbone" },
    { id: "edge-go-engine-docker", sourceId: "go-engine", targetId: "docker", animated: false, opacity: 0.4, layer: "backbone" },
    { id: "edge-docker-artifact", sourceId: "docker", targetId: "artifact", animated: false, opacity: 0.4, layer: "backbone" },
    { id: "edge-docker-redis-stream", sourceId: "docker", targetId: "redis-stream", animated: false, opacity: 0.4, layer: "backbone" },
    { id: "edge-docker-postgresql", sourceId: "docker", targetId: "postgresql", animated: false, opacity: 0.4, layer: "backbone" },
];
