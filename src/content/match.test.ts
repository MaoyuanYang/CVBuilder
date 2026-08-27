import { describe, expect, it } from "vitest";
import { matchAlias } from "./aliasDictionary";
import { normalizeText } from "./normalize";
import { getValueForKey } from "./resolveValue";
import { createEmptyProfile } from "../shared/types";

describe("normalizeText", () => {
  it("trims whitespace, full-width space, case and full-width characters", () => {
    expect(normalizeText("  姓名 ")).toBe("姓名");
    expect(normalizeText("Ｍｏｂｉｌｅ")).toBe("mobile");
    expect(normalizeText("Email")).toBe("email");
    expect(normalizeText("联系 电话")).toBe("联系电话");
  });
});

describe("matchAlias (TS-111 匹配侧)", () => {
  it("matches normalized Chinese and English aliases exactly", () => {
    expect(matchAlias(normalizeText("姓名"))).toBe("name");
    expect(matchAlias(normalizeText(" 联系 电话 "))).toBe("phone");
    expect(matchAlias(normalizeText("E-mail"))).toBe("email");
    expect(matchAlias(normalizeText("毕业院校"))).toBe("school");
  });

  it("returns null for unknown labels", () => {
    expect(matchAlias(normalizeText("验证码"))).toBeNull();
    expect(matchAlias("")).toBeNull();
  });
});

describe("getValueForKey (TS-112)", () => {
  it("uses single-entry array data and refuses multi-entry", () => {
    const profile = createEmptyProfile();
    profile.education.push({ id: "e1", school: "示例大学", major: "计算机", degree: "本科", startDate: "", endDate: "", gpa: "" });
    expect(getValueForKey(profile, "school")).toBe("示例大学");

    profile.education.push({ id: "e2", school: "示例高中", major: "", degree: "", startDate: "", endDate: "", gpa: "" });
    expect(getValueForKey(profile, "school")).toBe("");
  });

  it("reads basic/intention/selfEvaluation directly", () => {
    const profile = createEmptyProfile();
    profile.basicInfo.name = "张三";
    profile.intention.expectedCity = "上海";
    profile.selfEvaluation = "认真";
    expect(getValueForKey(profile, "name")).toBe("张三");
    expect(getValueForKey(profile, "expectedCity")).toBe("上海");
    expect(getValueForKey(profile, "selfEvaluation")).toBe("认真");
  });
});
