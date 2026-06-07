import { describe, expect, it } from "vitest";
import {
  formatApiErrorDetail,
  formatScanError,
  formatStepFailureMessage,
  extractStreamFailureLine,
} from "@/utils/scan";

describe("formatApiErrorDetail", () => {
  it("strips invalid tools payload prefix from backend validation errors", () => {
    const detail =
      'invalid tools payload: invalid custom_flags for tools[1]: invalid custom flag "404"';
    expect(formatApiErrorDetail(detail)).toBe('invalid custom_flags for tools[1]: invalid custom flag "404"');
  });

  it("formats FastAPI validation arrays", () => {
    expect(
      formatApiErrorDetail([{ loc: ["body", "command"], msg: "field required" }]),
    ).toBe("body.command: field required");
  });
});

describe("formatScanError", () => {
  it("reads Error.message", () => {
    expect(formatScanError(new Error('invalid custom flag "404"'))).toBe('invalid custom flag "404"');
  });
});

describe("formatStepFailureMessage", () => {
  it("includes tool name and backend error_message", () => {
    expect(
      formatStepFailureMessage({
        tool_name: "httpx",
        error_message: "advanced policy rejected request: invalid custom flag \"404\"",
      }),
    ).toBe('httpx: advanced policy rejected request: invalid custom flag "404"');
  });
});

describe("extractStreamFailureLine", () => {
  it("detects system scan step failed logs", () => {
    expect(
      extractStreamFailureLine({
        source: "LOG_SOURCE_SYSTEM",
        line: "scan step failed: tool exited with non-zero code: 2",
      }),
    ).toBe("scan step failed: tool exited with non-zero code: 2");
  });

  it("ignores normal stdout tool output", () => {
    expect(
      extractStreamFailureLine({
        source: "LOG_SOURCE_STDOUT",
        line: "https://example.com",
      }),
    ).toBeNull();
  });
});
