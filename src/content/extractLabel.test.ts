import { describe, expect, it } from "vitest";
import { extractLabel } from "./extractLabel";

function setupDom(html: string): Document {
  document.body.innerHTML = html;
  return document;
}

describe("extractLabel (TS-111)", () => {
  it("prefers label[for] over placeholder and aria", () => {
    setupDom(`
      <label for="f1">姓名</label>
      <input id="f1" placeholder="占位符" aria-label=" aria 标签" />
    `);
    expect(extractLabel(document.querySelector("input") as Element)).toBe("姓名");
  });

  it("falls back to wrapping label", () => {
    setupDom(`<label>手机号 <input /></label>`);
    expect(extractLabel(document.querySelector("input") as Element)).toBe("手机号");
  });

  it("falls back to aria-label then placeholder", () => {
    setupDom(`<input aria-label="邮箱" placeholder="占位符" />`);
    expect(extractLabel(document.querySelector("input") as Element)).toBe("邮箱");
    setupDom(`<input placeholder="所在城市" />`);
    expect(extractLabel(document.querySelector("input") as Element)).toBe("所在城市");
  });

  it("falls back to table row header", () => {
    setupDom(`
      <table><tr><th>自我评价</th><td><textarea></textarea></td></tr></table>
    `);
    expect(extractLabel(document.querySelector("textarea") as Element)).toBe("自我评价");
  });

  it("falls back to previous sibling text", () => {
    setupDom(`<div><span>籍贯</span><input /></div>`);
    expect(extractLabel(document.querySelector("input") as Element)).toBe("籍贯");
  });

  it("returns empty string when nothing is found", () => {
    setupDom(`<div><input /></div>`);
    expect(extractLabel(document.querySelector("input") as Element)).toBe("");
  });
});
