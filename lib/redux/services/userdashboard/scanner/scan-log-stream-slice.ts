import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { ScanLogChunkResponse, ScanStatus } from "@/types/scanner";

export type ScanStreamCompletionStatus = ScanStatus | "FAILURE" | null;

export type ScanStreamChunk = Omit<ScanLogChunkResponse, "completion_status"> & {
  completion_status: ScanStreamCompletionStatus;
};

type ScanLogStreamState = {
  activeScanId: string;
  logs: ScanStreamChunk[];
  isStreaming: boolean;
  finalChunk: ScanStreamChunk | null;
  terminalStatus: ScanStreamCompletionStatus;
};

const initialState: ScanLogStreamState = {
  activeScanId: "",
  logs: [],
  isStreaming: false,
  finalChunk: null,
  terminalStatus: null,
};

function buildFinalChunk(
  chunk: ScanStreamChunk | null | undefined,
  status: ScanStreamCompletionStatus,
): ScanStreamChunk | null {
  if (!chunk || !status) {
    return null;
  }

  return {
    ...chunk,
    is_final_chunk: true,
    completion_status: status,
  };
}

const scanLogStreamSlice = createSlice({
  name: "scanLogStream",
  initialState,
  reducers: {
    startScan(state, action: PayloadAction<string>) {
      const nextScanId = action.payload.trim();
      const shouldReset = state.activeScanId !== nextScanId;
      state.activeScanId = nextScanId;
      if (shouldReset) {
        state.logs = [];
        state.finalChunk = null;
        state.terminalStatus = null;
      }
      state.isStreaming = true;
    },
    hydrateScan(
      state,
      action: PayloadAction<{
        scanId: string;
        logs: ScanStreamChunk[];
        status: ScanStreamCompletionStatus;
      }>,
    ) {
      const { logs, scanId, status } = action.payload;
      const normalizedLogs = [...logs].sort(
        (left, right) => left.sequence_num - right.sequence_num,
      );
      const finalChunk =
        normalizedLogs.find((chunk) => chunk.is_final_chunk) ??
        buildFinalChunk(normalizedLogs.at(-1), status);

      state.activeScanId = scanId.trim();
      state.logs = normalizedLogs;
      state.isStreaming = false;
      state.finalChunk = finalChunk;
      state.terminalStatus =
        finalChunk?.completion_status ?? status ?? null;
    },
    appendChunk(state, action: PayloadAction<ScanStreamChunk>) {
      const chunk = action.payload;
      if (!state.activeScanId) {
        state.activeScanId = chunk.scan_id;
      }

      const lastChunk = state.logs.at(-1);
      if (
        lastChunk &&
        lastChunk.sequence_num === chunk.sequence_num &&
        lastChunk.phase === chunk.phase &&
        lastChunk.level === chunk.level &&
        lastChunk.line === chunk.line
      ) {
        return;
      }

      state.logs.push(chunk);
      if (chunk.completion_status) {
        state.terminalStatus = chunk.completion_status;
      }
      if (chunk.is_final_chunk) {
        state.isStreaming = false;
        state.finalChunk = chunk;
      }
    },
    completeStream(
      state,
      action: PayloadAction<ScanStreamCompletionStatus>,
    ) {
      const status = action.payload;
      state.isStreaming = false;
      state.terminalStatus = status;
      if (!state.finalChunk) {
        state.finalChunk = buildFinalChunk(state.logs.at(-1), status);
      }
    },
    resetScan() {
      return initialState;
    },
  },
});

export const { appendChunk, completeStream, hydrateScan, resetScan, startScan } =
  scanLogStreamSlice.actions;
export const scanLogStreamReducer = scanLogStreamSlice.reducer;
