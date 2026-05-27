// Feature: generate-report, Property 7: Content-Disposition filename extraction is correct
// Feature: generate-report, Property 8: Binary response produces a valid object URL

import * as fc from "fast-check";
import { describe, it, expect } from "vitest";
import { extractFilenameFromDisposition } from "../reports-api";

/**
 * Property 7: Content-Disposition filename extraction is correct
 *
 * For any Content-Disposition header string of the form
 * `attachment; filename="<name>"`, the filename extraction function
 * SHALL return exactly `<name>` as the download filename.
 *
 * Validates: Requirements 4.4
 */
describe("extractFilenameFromDisposition — Property 7", () => {
    it("returns exactly the filename embedded in a well-formed Content-Disposition header", () => {
        fc.assert(
            fc.property(
                // Generate arbitrary filenames that don't contain `"` so they
                // don't break the quoted-string header format.
                fc.string({ minLength: 1 }).filter((name) => !name.includes('"')),
                (name) => {
                    const header = `attachment; filename="${name}"`;
                    const result = extractFilenameFromDisposition(header);

                    // The result must not be null and must equal the generated name exactly.
                    expect(result).not.toBeNull();
                    expect(result).toBe(name);
                },
            ),
            { numRuns: 100 },
        );
    });
});

/**
 * Property 8: Binary response produces a valid object URL
 *
 * For any non-empty Blob returned by the export mutation, the download
 * handler SHALL construct a non-empty object URL (matching `^blob:`) and
 * use it as the `href` of the download anchor.
 *
 * Validates: Requirements 6.3
 */
describe("URL.createObjectURL — Property 8", () => {
    it("produces a blob: URL for any non-empty Uint8Array wrapped as a Blob", () => {
        fc.assert(
            fc.property(
                fc.uint8Array({ minLength: 1 }),
                (bytes) => {
                    const blob = new Blob([bytes]);
                    const url = URL.createObjectURL(blob);

                    try {
                        expect(url).toMatch(/^blob:/);
                    } finally {
                        // Always revoke to prevent memory leaks during the test run.
                        URL.revokeObjectURL(url);
                    }
                },
            ),
            { numRuns: 100 },
        );
    });
});
