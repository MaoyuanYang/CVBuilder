import { describe, expect, it } from "vitest";
import { createEmptyProfile, type ResumeProfile } from "./types";
import { validateProfile } from "./validation";

function validProfile(): ResumeProfile {
  const profile = createEmptyProfile();
  profile.basicInfo.name = "张三";
  profile.basicInfo.phone = "13800138000";
  profile.basicInfo.email = "zhangsan@example.com";
  profile.selfEvaluation = "认真负责";
  profile.education.push({
    id: "e1",
    school: "",
    major: "",
    degree: "",
    startDate: "",
    endDate: "",
    gpa: "",
  });
  return profile;
}

describe("validateProfile (TS-007)", () => {
  it("passes a profile with valid required fields", () => {
    expect(validateProfile(validProfile())).toEqual([]);
  });

  it("reports missing name", () => {
    const profile = validProfile();
    profile.basicInfo.name = "  ";
    expect(validateProfile(profile)).toEqual([{ field: "name", message: "请填写姓名" }]);
  });

  it("reports missing and malformed phone", () => {
    const profile = validProfile();
    profile.basicInfo.phone = "";
    expect(validateProfile(profile)).toEqual([{ field: "phone", message: "请填写手机号" }]);
    profile.basicInfo.phone = "12345";
    expect(validateProfile(profile)).toEqual([{ field: "phone", message: "手机号格式不正确" }]);
  });

  it("reports missing and malformed email", () => {
    const profile = validProfile();
    profile.basicInfo.email = "";
    expect(validateProfile(profile)).toEqual([{ field: "email", message: "请填写邮箱" }]);
    profile.basicInfo.email = "not-an-email";
    expect(validateProfile(profile)).toEqual([{ field: "email", message: "邮箱格式不正确" }]);
  });

  it("never validates optional fields", () => {
    const profile = validProfile();
    profile.basicInfo.city = "任意值都可以";
    profile.basicInfo.birthDate = "随便填";
    profile.work.push({
      id: "w1",
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    expect(validateProfile(profile)).toEqual([]);
  });
});
