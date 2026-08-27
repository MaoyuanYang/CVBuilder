import { fireEvent, render, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createFakeBackend } from "../test/fakeStorage";
import { App } from "./App";

function storedProfileFixture() {
  return {
    basicInfo: {
      name: "张三",
      gender: "男",
      birthDate: "1999-01-01",
      phone: "13800138000",
      email: "zhangsan@example.com",
      city: "上海",
      hometown: "江苏南京",
      ethnicity: "汉族",
      politicalStatus: "群众",
      photoDataUrl: "",
    },
    intention: {
      targetPosition: "前端工程师",
      expectedSalary: "面议",
      expectedCity: "上海",
      availableTime: "随时到岗",
    },
    education: [
      { id: "edu-1", school: "示例大学", major: "计算机科学", degree: "本科", startDate: "2018-09", endDate: "2022-06", gpa: "3.8" },
      { id: "edu-2", school: "示例高中", major: "", degree: "", startDate: "2015-09", endDate: "2018-06", gpa: "" },
      { id: "edu-3", school: "示例初中", major: "", degree: "", startDate: "2012-09", endDate: "2015-06", gpa: "" },
    ],
    work: [],
    project: [],
    skills: [],
    selfEvaluation: "认真负责",
    customFields: [{ id: "cf-1", key: "期望城市", value: "上海" }],
    updatedAt: "2026-08-27T00:00:00.000Z",
  };
}

describe("App: loading and entry states", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows empty-state guidance and an editable form on first run (TS-001)", async () => {
    const { findByText, getByLabelText } = render(<App backend={createFakeBackend()} />);

    expect(await findByText("开始填写你的简历数据。所有信息只保存在你的浏览器本地。")).toBeTruthy();
    const nameInput = getByLabelText("姓名") as HTMLInputElement;
    fireEvent.input(nameInput, { target: { value: "李四" } });
    expect(nameInput.value).toBe("李四");
  });

  it("reloads the full profile into every section (TS-003)", async () => {
    const backend = createFakeBackend(storedProfileFixture());
    const { findByDisplayValue, findAllByText } = render(<App backend={backend} />);

    expect(await findByDisplayValue("张三")).toBeTruthy();
    expect(await findByDisplayValue("示例大学")).toBeTruthy();
    expect(await findByDisplayValue("示例高中")).toBeTruthy();
    expect(await findByDisplayValue("前端工程师")).toBeTruthy();
    expect(await findByDisplayValue("期望城市")).toBeTruthy();
    expect((await findAllByText("删除")).length).toBe(4);
  });

  it("removes only the confirmed entry (TS-004)", async () => {
    const backend = createFakeBackend(storedProfileFixture());
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { findByDisplayValue, queryByDisplayValue, findAllByText } = render(<App backend={backend} />);

    await findByDisplayValue("示例高中");
    const deleteButtons = await findAllByText("删除");
    fireEvent.click(deleteButtons[1]);

    await waitFor(() => expect(queryByDisplayValue("示例高中")).toBeNull());
    expect(queryByDisplayValue("示例大学")).toBeTruthy();
    expect(queryByDisplayValue("示例初中")).toBeTruthy();
  });

  it("keeps entries unchanged when deletion is cancelled (TS-009)", async () => {
    const backend = createFakeBackend(storedProfileFixture());
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const { findByDisplayValue, findAllByText } = render(<App backend={backend} />);

    await findByDisplayValue("示例高中");
    const deleteButtons = await findAllByText("删除");
    fireEvent.click(deleteButtons[1]);

    expect((await findAllByText("删除")).length).toBe(4);
  });

  it("completes loading with the default chrome backend and stays ready (regression: reload loop)", async () => {
    const globals = globalThis as Record<string, unknown>;
    const originalChrome = globals["chrome"];
    const store = new Map<string, unknown>();
    globals["chrome"] = {
      storage: {
        local: {
          get: async (key: string) => {
            const value = store.get(key);
            return value === undefined ? {} : { [key]: value };
          },
          set: async (items: Record<string, unknown>) => {
            for (const [key, value] of Object.entries(items)) {
              store.set(key, value);
            }
          },
        },
      },
    };
    try {
      const { findByText, queryByText } = render(<App />);
      expect(
        await findByText("开始填写你的简历数据。所有信息只保存在你的浏览器本地。"),
      ).toBeTruthy();
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(queryByText("正在加载…")).toBeNull();
    } finally {
      if (originalChrome === undefined) {
        delete globals["chrome"];
      } else {
        globals["chrome"] = originalChrome;
      }
    }
  });

  it("asks for confirmation before leaving with unsaved changes (TS-006)", async () => {
    const { findByLabelText, findByText, queryByText } = render(<App backend={createFakeBackend()} />);
    const nameInput = (await findByLabelText("姓名")) as HTMLInputElement;

    fireEvent.input(nameInput, { target: { value: "李四" } });
    await findByText("有未保存的修改");
    const guarded = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(guarded);
    expect(guarded.defaultPrevented).toBe(true);

    fireEvent.input(nameInput, { target: { value: "" } });
    await waitFor(() => expect(queryByText("有未保存的修改")).toBeNull());
    const unguarded = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unguarded);
    expect(unguarded.defaultPrevented).toBe(false);
  });
});
