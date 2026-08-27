import { fireEvent, render, waitFor } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import { createFakeBackend } from "../test/fakeStorage";
import { App } from "./App";

function fillRequiredFields(getByLabelText: (label: string) => HTMLElement) {
  fireEvent.input(getByLabelText("姓名"), { target: { value: "李四" } });
  fireEvent.input(getByLabelText("手机号"), { target: { value: "13900139000" } });
  fireEvent.input(getByLabelText("邮箱"), { target: { value: "lisi@example.com" } });
}

describe("App: save flow", () => {
  it("persists the complete profile and confirms success (TS-002)", async () => {
    const backend = createFakeBackend();
    const { findByLabelText, findByText, getByLabelText } = render(<App backend={backend} />);
    await findByLabelText("姓名");

    fillRequiredFields(getByLabelText);
    fireEvent.click((await findByText("添加一段教育经历")) as HTMLButtonElement);
    fireEvent.input(getByLabelText("学校"), { target: { value: "示例大学" } });
    fireEvent.input(getByLabelText("自我评价"), { target: { value: "认真负责" } });

    fireEvent.click((await findByText("保存")) as HTMLButtonElement);

    await waitFor(() => {
      expect(backend.storedValue()).toBeTruthy();
    });
    const stored = backend.storedValue() as {
      basicInfo: { name: string; phone: string; email: string };
      education: Array<{ school: string }>;
      selfEvaluation: string;
      updatedAt: string;
    };
    expect(stored.basicInfo.name).toBe("李四");
    expect(stored.basicInfo.phone).toBe("13900139000");
    expect(stored.basicInfo.email).toBe("lisi@example.com");
    expect(stored.education[0].school).toBe("示例大学");
    expect(stored.selfEvaluation).toBe("认真负责");
    expect(stored.updatedAt).toBeTruthy();
    expect(await findByText("已保存")).toBeTruthy();
  });

  it("blocks saving and focuses the first invalid field (TS-008)", async () => {
    const backend = createFakeBackend();
    const { findByLabelText, findByText, getByLabelText } = render(<App backend={backend} />);
    await findByLabelText("姓名");

    fireEvent.input(getByLabelText("手机号"), { target: { value: "12345" } });
    fireEvent.click((await findByText("保存")) as HTMLButtonElement);

    expect(await findByText("请填写姓名")).toBeTruthy();
    expect(await findByText("手机号格式不正确")).toBeTruthy();
    expect(backend.writeCount()).toBe(0);
    await waitFor(() => expect(document.activeElement).toBe(getByLabelText("姓名")));
  });

  it("keeps form data and offers retry after a save failure (TS-005)", async () => {
    const backend = createFakeBackend();
    const { findByLabelText, findByText, getByLabelText } = render(<App backend={backend} />);
    await findByLabelText("姓名");
    fillRequiredFields(getByLabelText);

    backend.failNextWrite();
    fireEvent.click((await findByText("保存")) as HTMLButtonElement);
    expect(await findByText("保存失败，请重试")).toBeTruthy();
    expect((getByLabelText("姓名") as HTMLInputElement).value).toBe("李四");
    expect(backend.writeCount()).toBe(0);

    fireEvent.click((await findByText("保存")) as HTMLButtonElement);
    await waitFor(() => expect(backend.writeCount()).toBe(1));
    const stored = backend.storedValue() as { basicInfo: { name: string } };
    expect(stored.basicInfo.name).toBe("李四");
  });
});
