import { normalizeText } from "./normalize";

export type DataKey =
  | "name"
  | "gender"
  | "birthDate"
  | "phone"
  | "email"
  | "city"
  | "hometown"
  | "ethnicity"
  | "politicalStatus"
  | "targetPosition"
  | "expectedSalary"
  | "expectedCity"
  | "availableTime"
  | "school"
  | "major"
  | "degree"
  | "gpa"
  | "company"
  | "position"
  | "projectName"
  | "role"
  | "techStack"
  | "selfEvaluation";

export const ALIAS_DICTIONARY: Record<DataKey, string[]> = {
  name: ["姓名", "名字", "真实姓名", "name", "full name"],
  gender: ["性别", "gender", "sex"],
  birthDate: ["出生日期", "生日", "出生年月", "birth date", "date of birth"],
  phone: ["手机号", "手机号码", "手机", "电话", "联系电话", "联系方式", "mobile", "phone", "tel"],
  email: ["邮箱", "电子邮件", "email", "e-mail"],
  city: ["所在城市", "现居住地", "居住地", "城市", "city"],
  hometown: ["籍贯", "户籍", "户口所在地", "hometown"],
  ethnicity: ["民族", "ethnicity"],
  politicalStatus: ["政治面貌", "政治状态", "political status"],
  targetPosition: ["意向职位", "应聘职位", "申请职位", "求职意向", "意向岗位", "desired position"],
  expectedSalary: ["期望薪资", "薪资要求", "期望月薪", "expected salary"],
  expectedCity: ["期望城市", "意向城市", "工作城市", "期望工作地", "expected city"],
  availableTime: ["到岗时间", "入职时间", "何时到岗", "available time"],
  school: ["学校", "毕业院校", "院校", "school", "university"],
  major: ["专业", "所学专业", "major"],
  degree: ["学历", "学位", "degree"],
  gpa: ["gpa", "绩点", "成绩排名", "排名"],
  company: ["公司名称", "公司", "工作单位", "单位名称", "company", "employer"],
  position: ["职位", "岗位", "职务", "position", "job title"],
  projectName: ["项目名称", "项目名", "project name"],
  role: ["担任角色", "项目角色", "角色", "role"],
  techStack: ["技术栈", "使用技术", "tech stack"],
  selfEvaluation: ["自我评价", "自我总结", "个人总结", "个人评价", "自我介绍", "self evaluation", "about me"],
};

export function matchAlias(normalizedLabel: string): DataKey | null {
  if (!normalizedLabel) return null;
  for (const [key, aliases] of Object.entries(ALIAS_DICTIONARY)) {
    for (const alias of aliases) {
      if (normalizedLabel === normalizeText(alias)) {
        return key as DataKey;
      }
    }
  }
  return null;
}
