import type { ResumeProfile } from "./types";

export type ValidatedField = "name" | "phone" | "email";

export interface ValidationIssue {
  field: ValidatedField;
  message: string;
}

const PHONE_PATTERN = /^1\d{10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProfile(profile: ResumeProfile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { name, phone, email } = profile.basicInfo;

  if (!name.trim()) {
    issues.push({ field: "name", message: "请填写姓名" });
  }

  if (!phone.trim()) {
    issues.push({ field: "phone", message: "请填写手机号" });
  } else if (!PHONE_PATTERN.test(phone.trim())) {
    issues.push({ field: "phone", message: "手机号格式不正确" });
  }

  if (!email.trim()) {
    issues.push({ field: "email", message: "请填写邮箱" });
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    issues.push({ field: "email", message: "邮箱格式不正确" });
  }

  return issues;
}
