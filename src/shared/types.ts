export interface BasicInfo {
  name: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
  city: string;
  hometown: string;
  ethnicity: string;
  politicalStatus: string;
  photoDataUrl: string;
}

export interface Intention {
  targetPosition: string;
  expectedSalary: string;
  expectedCity: string;
  availableTime: string;
}

export interface EducationEntry {
  [key: string]: string;
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface WorkEntry {
  [key: string]: string;
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProjectEntry {
  [key: string]: string;
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  techStack: string;
  description: string;
}

export interface SkillEntry {
  [key: string]: string;
  id: string;
  name: string;
  level: string;
}

export interface CustomField {
  id: string;
  key: string;
  value: string;
}

export interface ResumeProfile {
  basicInfo: BasicInfo;
  intention: Intention;
  education: EducationEntry[];
  work: WorkEntry[];
  project: ProjectEntry[];
  skills: SkillEntry[];
  selfEvaluation: string;
  customFields: CustomField[];
  updatedAt: string;
}

export function createId(): string {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef && typeof cryptoRef.randomUUID === "function") {
    return cryptoRef.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyProfile(): ResumeProfile {
  return {
    basicInfo: {
      name: "",
      gender: "",
      birthDate: "",
      phone: "",
      email: "",
      city: "",
      hometown: "",
      ethnicity: "",
      politicalStatus: "",
      photoDataUrl: "",
    },
    intention: {
      targetPosition: "",
      expectedSalary: "",
      expectedCity: "",
      availableTime: "",
    },
    education: [],
    work: [],
    project: [],
    skills: [],
    selfEvaluation: "",
    customFields: [],
    updatedAt: "",
  };
}

export function createEducationEntry(): EducationEntry {
  return { id: createId(), school: "", major: "", degree: "", startDate: "", endDate: "", gpa: "" };
}

export function createWorkEntry(): WorkEntry {
  return { id: createId(), company: "", position: "", startDate: "", endDate: "", description: "" };
}

export function createProjectEntry(): ProjectEntry {
  return { id: createId(), name: "", role: "", startDate: "", endDate: "", techStack: "", description: "" };
}

export function createSkillEntry(): SkillEntry {
  return { id: createId(), name: "", level: "" };
}

export function createCustomField(): CustomField {
  return { id: createId(), key: "", value: "" };
}
