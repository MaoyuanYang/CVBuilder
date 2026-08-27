import { describe, expect, it } from "vitest";
import { createFakeBackend } from "../test/fakeStorage";
import {
  ProfileLoadError,
  loadProfile,
  saveProfile,
} from "./storage";
import { createEmptyProfile, type ResumeProfile } from "./types";

function sampleProfile(): ResumeProfile {
  const profile = createEmptyProfile();
  profile.basicInfo.name = "张三";
  profile.basicInfo.phone = "13800138000";
  profile.basicInfo.email = "zhangsan@example.com";
  profile.education.push({
    id: "edu-1",
    school: "示例大学",
    major: "计算机科学",
    degree: "本科",
    startDate: "2018-09",
    endDate: "2022-06",
    gpa: "3.8",
  });
  profile.customFields.push({ id: "cf-1", key: "期望城市", value: "上海" });
  return profile;
}

describe("storage layer", () => {
  it("returns null when nothing has been saved", async () => {
    const backend = createFakeBackend();
    expect(await loadProfile(backend)).toBeNull();
  });

  it("round-trips the full profile", async () => {
    const backend = createFakeBackend();
    const profile = sampleProfile();
    await saveProfile(backend, profile, "2026-08-27T00:00:00.000Z");
    const loaded = await loadProfile(backend);
    expect(loaded).toEqual({ ...profile, updatedAt: "2026-08-27T00:00:00.000Z" });
  });

  it("is idempotent for repeated saves of the same draft (TS-012)", async () => {
    const backend = createFakeBackend();
    const profile = sampleProfile();
    const timestamp = "2026-08-27T00:00:00.000Z";
    await saveProfile(backend, profile, timestamp);
    const first = structuredClone(backend.storedValue());
    await saveProfile(backend, profile, timestamp);
    expect(backend.storedValue()).toEqual(first);
  });

  it("rejects corrupted payloads with ProfileLoadError", async () => {
    const backend = createFakeBackend({ basicInfo: "not-an-object" });
    await expect(loadProfile(backend)).rejects.toBeInstanceOf(ProfileLoadError);
  });

  it("propagates write failures without storing anything", async () => {
    const backend = createFakeBackend();
    backend.failNextWrite();
    await expect(saveProfile(backend, sampleProfile())).rejects.toThrow();
    expect(backend.storedValue()).toBeUndefined();
  });
});
