import "@testing-library/jest-dom";

// jsdom does not implement URL.createObjectURL / URL.revokeObjectURL.
// Provide a minimal polyfill that returns a valid `blob:` URL so that
// tests exercising the binary-download path can assert on the URL format.
if (typeof URL.createObjectURL === "undefined") {
    let blobCounter = 0;
    URL.createObjectURL = (_blob: Blob) => {
        blobCounter += 1;
        return `blob:http://localhost/${blobCounter}`;
    };
    URL.revokeObjectURL = (_url: string) => {
        // no-op in the test environment
    };
}
