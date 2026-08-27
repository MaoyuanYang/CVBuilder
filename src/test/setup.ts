import { cleanup } from "@testing-library/preact";
import { afterEach, beforeAll, beforeEach, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

let networkCalls = 0;

afterEach(() => {
  cleanup();
});

beforeAll(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      networkCalls += 1;
      throw new Error("Network is disabled in tests");
    }),
  );
  vi.stubGlobal(
    "XMLHttpRequest",
    class {
      open(): void {
        networkCalls += 1;
        throw new Error("Network is disabled in tests");
      }
    },
  );
});

beforeEach(() => {
  networkCalls = 0;
});

afterEach(() => {
  expect(networkCalls).toBe(0);
});
