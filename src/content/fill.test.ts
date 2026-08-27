import { describe, expect, it, vi } from "vitest";
import { createEmptyProfile, type ResumeProfile } from "../shared/types";
import { runAutoFill } from "./fillEngine";

function buildFixture(): void {
  document.body.innerHTML = `
    <form id="form">
      <label for="name">姓名</label><input id="name" />
      <label>手机号 <input /></label>
      <input placeholder="邮箱" />
      <table><tr><th>自我评价</th><td><textarea></textarea></td></tr></table>
      <label for="degree">学历</label>
      <select id="degree">
        <option value="">请选择</option>
        <option value="edu">本科</option>
        <option value="ms">硕士</option>
      </select>
      <fieldset>
        <legend>性别</legend>
        <label><input type="radio" name="gender" value="m" />男</label>
        <label><input type="radio" name="gender" value="f" />女</label>
      </fieldset>
      <input type="text" aria-label="验证码" />
      <button type="submit">提交</button>
    </form>
  `;
}

function sampleProfile(): ResumeProfile {
  const profile = createEmptyProfile();
  profile.basicInfo.name = "张三";
  profile.basicInfo.phone = "13800138000";
  profile.basicInfo.email = "zhangsan@example.com";
  profile.basicInfo.gender = "男";
  profile.selfEvaluation = "认真负责";
  profile.education.push({ id: "e1", school: "示例大学", major: "计算机", degree: "本科", startDate: "", endDate: "", gpa: "" });
  return profile;
}

describe("runAutoFill", () => {
  it("fills matched text/textarea/select/radio fields and highlights them (TS-101)", () => {
    buildFixture();
    const result = runAutoFill(document, sampleProfile());

    const nameInput = document.querySelector("#name") as HTMLInputElement;
    expect(nameInput.value).toBe("张三");
    expect(nameInput.classList.contains("cvbuilder-filled")).toBe(true);

    const inputs = document.querySelectorAll<HTMLInputElement>("input:not([type])");
    expect(inputs[1].value).toBe("13800138000");
    expect(inputs[2].value).toBe("zhangsan@example.com");
    expect(document.querySelector("textarea")?.value).toBe("认真负责");
    expect((document.querySelector("#degree") as HTMLSelectElement).value).toBe("edu");
    const male = document.querySelector("input[value='m']") as HTMLInputElement;
    expect(male.checked).toBe(true);

    expect(result.filled.map((entry) => entry.label)).toEqual(
      expect.arrayContaining(["姓名", "手机号", "邮箱", "自我评价", "学历", "性别"]),
    );
  });

  it("leaves unrecognized fields untouched and counts them unmatched (TS-103)", () => {
    buildFixture();
    const result = runAutoFill(document, sampleProfile());

    const captcha = document.querySelector("input[aria-label='验证码']") as HTMLInputElement;
    expect(captcha.value).toBe("");
    expect(result.unmatched).toContainEqual({ label: "验证码", reason: "未识别" });
  });

  it("skips non-empty fields without overwriting (TS-104)", () => {
    buildFixture();
    const nameInput = document.querySelector("#name") as HTMLInputElement;
    nameInput.value = "王五";

    const result = runAutoFill(document, sampleProfile());

    expect(nameInput.value).toBe("王五");
    expect(result.skipped).toContainEqual({ label: "姓名" });
    expect(result.filled.map((entry) => entry.label)).not.toContain("姓名");
  });

  it("never submits the form and returns counts with details (TS-106)", () => {
    buildFixture();
    const form = document.querySelector("#form") as HTMLFormElement;
    const submitListener = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener("submit", submitListener);
    const submitSpy = vi.spyOn(form, "submit").mockImplementation(() => undefined);

    const result = runAutoFill(document, sampleProfile());

    expect(submitListener).not.toHaveBeenCalled();
    expect(submitSpy).not.toHaveBeenCalled();
    expect(result.filled.length).toBeGreaterThan(0);
    expect(result.unmatched.length).toBeGreaterThan(0);
  });

  it("counts a throwing field as unmatched while others fill (TS-108)", () => {
    buildFixture();
    const phoneInput = document.querySelectorAll<HTMLInputElement>("input:not([type])")[1];
    Object.defineProperty(phoneInput, "value", {
      get: () => "",
      set: () => {
        throw new Error("setter broken");
      },
      configurable: true,
    });

    const result = runAutoFill(document, sampleProfile());

    expect(result.unmatched).toContainEqual({ label: "手机号", reason: "填写失败" });
    expect((document.querySelector("#name") as HTMLInputElement).value).toBe("张三");
  });

  it("is idempotent on repeated runs (TS-110)", () => {
    buildFixture();
    const profile = sampleProfile();
    runAutoFill(document, profile);
    const second = runAutoFill(document, profile);

    expect(second.filled).toEqual([]);
    expect(second.skipped.map((entry) => entry.label)).toEqual(
      expect.arrayContaining(["姓名", "手机号", "邮箱", "自我评价"]),
    );
    expect((document.querySelector("#name") as HTMLInputElement).value).toBe("张三");
  });
});
