import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import {
  createChromeStorageBackend,
  loadProfile,
  saveProfile,
  type StorageBackend,
} from "../shared/storage";
import {
  createCustomField,
  createEducationEntry,
  createEmptyProfile,
  createProjectEntry,
  createSkillEntry,
  createWorkEntry,
  type BasicInfo,
  type Intention,
  type ResumeProfile,
} from "../shared/types";
import { validateProfile, type ValidationIssue } from "../shared/validation";
import { EntryListSection, type EntryFieldSpec } from "./components/EntryListSection";
import { CustomFieldsSection } from "./components/CustomFieldsSection";
import { Field } from "./components/Field";
import { PhotoInput } from "./components/PhotoInput";
import { SaveBar, type SaveStatus } from "./components/SaveBar";
import { processPhoto } from "./image";

type PageStatus = "loading" | "load-error" | "ready";
type ArraySection = "education" | "work" | "project" | "skills";

const BASIC_FIELDS: Array<{ name: keyof BasicInfo; label: string }> = [
  { name: "name", label: "姓名" },
  { name: "gender", label: "性别" },
  { name: "birthDate", label: "出生日期" },
  { name: "phone", label: "手机号" },
  { name: "email", label: "邮箱" },
  { name: "city", label: "所在城市" },
  { name: "hometown", label: "籍贯" },
  { name: "ethnicity", label: "民族" },
  { name: "politicalStatus", label: "政治面貌" },
];

const INTENTION_FIELDS: Array<{ name: keyof Intention; label: string }> = [
  { name: "targetPosition", label: "意向职位" },
  { name: "expectedSalary", label: "期望薪资" },
  { name: "expectedCity", label: "期望城市" },
  { name: "availableTime", label: "到岗时间" },
];

const EDUCATION_FIELDS: EntryFieldSpec[] = [
  { name: "school", label: "学校" },
  { name: "major", label: "专业" },
  { name: "degree", label: "学历" },
  { name: "startDate", label: "开始时间" },
  { name: "endDate", label: "结束时间" },
  { name: "gpa", label: "GPA/排名（选填）" },
];

const WORK_FIELDS: EntryFieldSpec[] = [
  { name: "company", label: "公司" },
  { name: "position", label: "职位" },
  { name: "startDate", label: "开始时间" },
  { name: "endDate", label: "结束时间" },
  { name: "description", label: "工作描述", textarea: true },
];

const PROJECT_FIELDS: EntryFieldSpec[] = [
  { name: "name", label: "项目名" },
  { name: "role", label: "担任角色" },
  { name: "startDate", label: "开始时间（选填）" },
  { name: "endDate", label: "结束时间（选填）" },
  { name: "techStack", label: "技术栈（选填）" },
  { name: "description", label: "项目描述", textarea: true },
];

const SKILL_FIELDS: EntryFieldSpec[] = [
  { name: "name", label: "名称" },
  { name: "level", label: "熟练程度" },
];

function createArrayEntry(section: ArraySection): Record<string, string> {
  switch (section) {
    case "education":
      return createEducationEntry();
    case "work":
      return createWorkEntry();
    case "project":
      return createProjectEntry();
    case "skills":
      return createSkillEntry();
  }
}

export interface AppProps {
  backend?: StorageBackend;
}

export function App({ backend = createChromeStorageBackend() }: AppProps) {
  const backendRef = useRef<StorageBackend>(backend);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [profile, setProfile] = useState<ResumeProfile>(() => createEmptyProfile());
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [hasSavedData, setHasSavedData] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [photoError, setPhotoError] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const loaded = await loadProfile(backendRef.current);
      const next = loaded ?? createEmptyProfile();
      setProfile(next);
      setSavedSnapshot(JSON.stringify(next));
      setHasSavedData(loaded !== null);
      setStatus("ready");
    } catch {
      setStatus("load-error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = status === "ready" && JSON.stringify(profile) !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const markEdited = () => {
    setIssues([]);
    if (saveStatus === "saved" || saveStatus === "save-error") {
      setSaveStatus("idle");
    }
  };

  const patchBasic = (name: keyof BasicInfo, value: string) => {
    markEdited();
    setProfile((current) => ({
      ...current,
      basicInfo: { ...current.basicInfo, [name]: value },
    }));
  };

  const patchIntention = (name: keyof Intention, value: string) => {
    markEdited();
    setProfile((current) => ({
      ...current,
      intention: { ...current.intention, [name]: value },
    }));
  };

  const updateEntry = (section: ArraySection, id: string, field: string, value: string) => {
    markEdited();
    setProfile((current) => ({
      ...current,
      [section]: current[section].map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const addEntry = (section: ArraySection) => {
    markEdited();
    setProfile((current) => ({
      ...current,
      [section]: [...current[section], createArrayEntry(section)],
    }));
  };

  const removeEntry = (section: ArraySection, id: string) => {
    if (!window.confirm("确定删除该条目吗？")) return;
    markEdited();
    setProfile((current) => ({
      ...current,
      [section]: current[section].filter((entry) => entry.id !== id),
    }));
  };

  const addCustomField = () => {
    markEdited();
    setProfile((current) => ({
      ...current,
      customFields: [...current.customFields, createCustomField()],
    }));
  };

  const patchCustomField = (id: string, part: "key" | "value", value: string) => {
    markEdited();
    setProfile((current) => ({
      ...current,
      customFields: current.customFields.map((entry) =>
        entry.id === id ? { ...entry, [part]: value } : entry,
      ),
    }));
  };

  const removeCustomField = (id: string) => {
    if (!window.confirm("确定删除该条目吗？")) return;
    markEdited();
    setProfile((current) => ({
      ...current,
      customFields: current.customFields.filter((entry) => entry.id !== id),
    }));
  };

  const handlePhotoFile = (file: File) => {
    void processPhoto(file)
      .then((dataUrl) => {
        setPhotoError("");
        patchBasic("photoDataUrl", dataUrl);
      })
      .catch((error: unknown) => {
        setPhotoError(error instanceof Error ? error.message : "照片处理失败，请重试");
      });
  };

  const issueFor = (field: string): string | undefined =>
    issues.find((issue) => issue.field === field)?.message;

  const save = async () => {
    const found = validateProfile(profile);
    if (found.length > 0) {
      setIssues(found);
      const target = document.querySelector<HTMLElement>(`[data-field="${found[0].field}"]`);
      target?.focus();
      return;
    }
    const cleaned: ResumeProfile = {
      ...profile,
      customFields: profile.customFields.filter((entry) => entry.key.trim() !== ""),
    };
    setSaveStatus("saving");
    try {
      const stored = await saveProfile(backend, cleaned);
      setProfile(stored);
      setSavedSnapshot(JSON.stringify(stored));
      setSaveStatus("saved");
    } catch {
      setSaveStatus("save-error");
    }
  };

  if (status === "loading") {
    return (
      <main class="page">
        <p role="status">正在加载…</p>
      </main>
    );
  }

  if (status === "load-error") {
    return (
      <main class="page">
        <p class="save-error" role="alert">加载失败</p>
        <button type="button" onClick={() => void load()}>重试</button>
      </main>
    );
  }

  return (
    <main class="page">
      <h1>简历数据</h1>
      {!hasSavedData && !dirty ? (
        <p class="hint">开始填写你的简历数据。所有信息只保存在你的浏览器本地。</p>
      ) : null}

      <section class="form-section">
        <h2>基本信息</h2>
        {BASIC_FIELDS.map((spec) => (
          <Field
            key={spec.name}
            label={spec.label}
            value={profile.basicInfo[spec.name]}
            dataField={spec.name === "name" || spec.name === "phone" || spec.name === "email" ? spec.name : undefined}
            error={issueFor(spec.name)}
            onChange={(value) => patchBasic(spec.name, value)}
          />
        ))}
        <PhotoInput value={profile.basicInfo.photoDataUrl} error={photoError} onFile={handlePhotoFile} />
      </section>

      <section class="form-section">
        <h2>求职意向</h2>
        {INTENTION_FIELDS.map((spec) => (
          <Field
            key={spec.name}
            label={spec.label}
            value={profile.intention[spec.name]}
            onChange={(value) => patchIntention(spec.name, value)}
          />
        ))}
      </section>

      <EntryListSection
        title="教育经历"
        addLabel="添加一段教育经历"
        entries={profile.education}
        fields={EDUCATION_FIELDS}
        onAdd={() => addEntry("education")}
        onRemove={(id) => removeEntry("education", id)}
        onChange={(id, field, value) => updateEntry("education", id, field, value)}
      />
      <EntryListSection
        title="工作/实习经历"
        addLabel="添加一段工作经历"
        entries={profile.work}
        fields={WORK_FIELDS}
        onAdd={() => addEntry("work")}
        onRemove={(id) => removeEntry("work", id)}
        onChange={(id, field, value) => updateEntry("work", id, field, value)}
      />
      <EntryListSection
        title="项目经历"
        addLabel="添加一段项目经历"
        entries={profile.project}
        fields={PROJECT_FIELDS}
        onAdd={() => addEntry("project")}
        onRemove={(id) => removeEntry("project", id)}
        onChange={(id, field, value) => updateEntry("project", id, field, value)}
      />
      <EntryListSection
        title="技能证书"
        addLabel="添加技能"
        entries={profile.skills}
        fields={SKILL_FIELDS}
        onAdd={() => addEntry("skills")}
        onRemove={(id) => removeEntry("skills", id)}
        onChange={(id, field, value) => updateEntry("skills", id, field, value)}
      />

      <section class="form-section">
        <h2>自我评价</h2>
        <Field
          label="自我评价"
          value={profile.selfEvaluation}
          textarea
          onChange={(value) => {
            markEdited();
            setProfile((current) => ({ ...current, selfEvaluation: value }));
          }}
        />
      </section>

      <CustomFieldsSection
        entries={profile.customFields}
        onAdd={addCustomField}
        onRemove={removeCustomField}
        onChange={patchCustomField}
      />

      <SaveBar dirty={dirty} saveStatus={saveStatus} onSave={() => void save()} />
    </main>
  );
}
