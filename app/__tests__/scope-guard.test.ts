/**
 * Scope-guard test for the client-side guest scan views (Task 11.2).
 *
 * This feature migrated ONLY the Dashboard/Assets `ScanResultsView` to
 * server-side pagination + search via the RTK Query endpoint
 * `getStepParsedData` / `useGetStepParsedDataQuery`. Requirement 7.2 states that
 * the guest/anonymous `/advance-scan` and `/medium-scan` views MUST continue to
 * use their existing client-side pagination + search behavior and MUST NOT be
 * migrated onto the new server-driven query.
 *
 * Strategy: statically analyze the source of each guest view. Starting from the
 * route's `page.tsx`, we recursively follow every *local* import (`@/...` and
 * relative paths — external packages are out of scope) and assert that nowhere
 * in that import graph do the forbidden server-driven symbols appear:
 *   - `getStepParsedData`
 *   - `useGetStepParsedDataQuery`
 * We also assert the guarded files never import the Dashboard `assets-api`
 * module that defines those symbols. Finally we assert (positively) that the
 * guest views still fetch their results client-side via `fetch(...)`, proving
 * they keep their existing behavior rather than silently rendering nothing.
 *
 * The walk is robust to the working directory: all paths are resolved relative
 * to this test file, and the recursion is bounded by a visited set.
 *
 * Validates: Requirements 7.2
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Path resolution (independent of process.cwd())
// ---------------------------------------------------------------------------

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
// <frontendRoot>/app/__tests__/scope-guard.test.ts -> <frontendRoot>
const FRONTEND_ROOT = path.resolve(TEST_DIR, "..", "..");

/** The guest/anonymous scan route entry points that must stay client-side. */
const GUEST_VIEW_ENTRYPOINTS = [
    path.join(FRONTEND_ROOT, "app", "advance-scan", "page.tsx"),
    path.join(FRONTEND_ROOT, "app", "medium-scan", "page.tsx"),
];

/** Symbols that only the server-driven Dashboard view is allowed to use. */
const FORBIDDEN_SYMBOLS = ["getStepParsedData", "useGetStepParsedDataQuery"];

/** The Dashboard RTK Query module that defines the forbidden symbols. */
const FORBIDDEN_MODULE_FRAGMENT =
    "lib/redux/services/userdashboard/assets/assets-api";

const RESOLVE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

// ---------------------------------------------------------------------------
// Minimal local-import resolver
// ---------------------------------------------------------------------------

/** Resolve a local module specifier to an on-disk file path, or null. */
function resolveLocalImport(
    specifier: string,
    importerFile: string,
): string | null {
    let base: string;
    if (specifier.startsWith("@/")) {
        base = path.join(FRONTEND_ROOT, specifier.slice(2));
    } else if (specifier.startsWith(".")) {
        base = path.resolve(path.dirname(importerFile), specifier);
    } else {
        // Bare specifier (external package) — not part of our source graph.
        return null;
    }

    const candidates = [
        base,
        ...RESOLVE_EXTENSIONS.map((ext) => base + ext),
        ...RESOLVE_EXTENSIONS.map((ext) => path.join(base, "index" + ext)),
    ];

    for (const candidate of candidates) {
        if (existsSync(candidate) && statSync(candidate).isFile()) {
            return candidate;
        }
    }
    return null;
}

/** Extract every import/re-export specifier string from a source file. */
function extractSpecifiers(source: string): string[] {
    const specifiers: string[] = [];
    // `import ... from "x"` and `export ... from "x"`
    const fromRe = /(?:import|export)[\s\S]*?from\s*["']([^"']+)["']/g;
    // bare side-effect import: `import "x"`
    const sideEffectRe = /import\s*["']([^"']+)["']/g;
    // dynamic import: `import("x")`
    const dynamicRe = /import\(\s*["']([^"']+)["']\s*\)/g;

    for (const re of [fromRe, sideEffectRe, dynamicRe]) {
        let match: RegExpExecArray | null;
        while ((match = re.exec(source)) !== null) {
            specifiers.push(match[1]);
        }
    }
    return specifiers;
}

/**
 * Collect the entry file plus every local file reachable from it through
 * static/dynamic imports. External packages are skipped.
 */
function collectImportGraph(entry: string): Map<string, string> {
    const graph = new Map<string, string>(); // absolute path -> source
    const stack = [entry];

    while (stack.length > 0) {
        const file = stack.pop() as string;
        if (graph.has(file)) continue;

        const source = readFileSync(file, "utf8");
        graph.set(file, source);

        for (const specifier of extractSpecifiers(source)) {
            const resolved = resolveLocalImport(specifier, file);
            if (resolved && !graph.has(resolved)) {
                stack.push(resolved);
            }
        }
    }

    return graph;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Scope guard: guest scan views stay client-side (Req 7.2)", () => {
    it("locates both guest view entry points on disk", () => {
        for (const entry of GUEST_VIEW_ENTRYPOINTS) {
            expect(
                existsSync(entry),
                `Expected guest view entry point to exist: ${entry}`,
            ).toBe(true);
        }
    });

    it.each(GUEST_VIEW_ENTRYPOINTS)(
        "%s and its local import graph never reference the server-driven step query",
        (entry) => {
            const graph = collectImportGraph(entry);

            // Sanity: we actually walked something.
            expect(graph.size).toBeGreaterThan(0);

            for (const [file, source] of graph) {
                for (const symbol of FORBIDDEN_SYMBOLS) {
                    expect(
                        source.includes(symbol),
                        `${file} (reachable from ${entry}) must not reference "${symbol}" — the guest views stay client-side (Req 7.2)`,
                    ).toBe(false);
                }

                expect(
                    source.includes(FORBIDDEN_MODULE_FRAGMENT),
                    `${file} (reachable from ${entry}) must not import the Dashboard assets-api module "${FORBIDDEN_MODULE_FRAGMENT}" (Req 7.2)`,
                ).toBe(false);
            }
        },
    );

    it.each(GUEST_VIEW_ENTRYPOINTS)(
        "%s still fetches its scan results client-side via fetch()",
        (entry) => {
            const source = readFileSync(entry, "utf8");
            // The existing guest behavior streams/fetches results in the browser.
            expect(
                source.includes("fetch("),
                `${entry} should retain its client-side fetch-based result loading (Req 7.2)`,
            ).toBe(true);
        },
    );
});
