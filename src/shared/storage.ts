import type { ResumeProfile } from "./types";

export interface StorageBackend {
  get(key: string): Promise<Record<string, unknown> | undefined>;
  set(key: string, value: unknown): Promise<void>;
}

export const PROFILE_STORAGE_KEY = "resumeProfile";

export class ProfileLoadError extends Error {}

export function createChromeStorageBackend(): StorageBackend {
  return {
    get(key) {
      return chrome.storage.local.get(key);
    },
    set(key, value) {
      return chrome.storage.local.set({ [key]: value });
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isResumeProfileShape(value: unknown): value is ResumeProfile {
  if (!isRecord(value)) return false;
  const basicInfo = value["basicInfo"];
  const selfEvaluation = value["selfEvaluation"];
  return (
    isRecord(basicInfo) &&
    typeof basicInfo["name"] === "string" &&
    typeof selfEvaluation === "string" &&
    Array.isArray(value["education"]) &&
    Array.isArray(value["work"]) &&
    Array.isArray(value["project"]) &&
    Array.isArray(value["skills"]) &&
    Array.isArray(value["customFields"])
  );
}

export async function loadProfile(backend: StorageBackend): Promise<ResumeProfile | null> {
  const result = await backend.get(PROFILE_STORAGE_KEY);
  const raw = result ? result[PROFILE_STORAGE_KEY] : undefined;
  if (raw === undefined || raw === null) {
    return null;
  }
  if (!isResumeProfileShape(raw)) {
    throw new ProfileLoadError("Stored resume data is corrupted");
  }
  return raw;
}

export async function saveProfile(
  backend: StorageBackend,
  profile: ResumeProfile,
  timestamp: string = new Date().toISOString(),
): Promise<ResumeProfile> {
  const stored: ResumeProfile = { ...profile, updatedAt: timestamp };
  await backend.set(PROFILE_STORAGE_KEY, stored);
  return stored;
}
