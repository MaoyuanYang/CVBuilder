import { describe, expect, it } from "vitest";
import { findMatchingOption } from "./matchOptions";

describe("findMatchingOption (TS-105)", () => {
  it("matches equal option text after normalization", () => {
    expect(findMatchingOption([" 本科 ", "硕士"], "本科")).toBe(" 本科 ");
  });

  it("matches containment in both directions", () => {
    expect(findMatchingOption(["上海市", "北京市"], "上海")).toBe("上海市");
    expect(findMatchingOption(["男", "女"], "性别男")).toBe("男");
  });

  it("returns null for unrelated or empty values", () => {
    expect(findMatchingOption(["本科", "硕士"], "博士")).toBeNull();
    expect(findMatchingOption(["本科"], "")).toBeNull();
    expect(findMatchingOption(["", " "], "本科")).toBeNull();
  });
});
