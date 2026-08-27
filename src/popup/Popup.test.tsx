import { fireEvent, render } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import type { FillResult } from "../content/fillEngine";
import { createFakeBackend } from "../test/fakeStorage";
import { createEmptyProfile } from "../shared/types";
import { Popup } from "./Popup";

function sampleResult(): FillResult {
  return {
    filled: [{ label: "姓名", value: "张三" }],
    skipped: [{ label: "手机号" }],
    unmatched: [{ label: "验证码", reason: "未识别" }],
  };
}

function profileBackend() {
  const profile = createEmptyProfile();
  profile.basicInfo.name = "张三";
  return createFakeBackend(profile);
}

describe("Popup", () => {
  it("disables auto fill and guides to options when no data (TS-107)", async () => {
    const { findByText, queryByText } = render(<Popup backend={createFakeBackend()} />);

    expect(await findByText("请先录入简历数据。")).toBeTruthy();
    expect(queryByText("自动填写")).toBeNull();
    expect(queryByText("去录入")).toBeTruthy();
  });

  it("shows counts and grouped details after a successful fill (TS-113)", async () => {
    const sendFillRequest = vi.fn(async () => sampleResult());
    const { findByText, getByText } = render(
      <Popup backend={profileBackend()} sendFillRequest={sendFillRequest} />,
    );

    fireEvent.click(await findByText("自动填写"));

    expect(await findByText("已填 1")).toBeTruthy();
    expect(getByText("跳过 1")).toBeTruthy();
    expect(getByText("未命中 1")).toBeTruthy();
    expect(getByText("姓名 → 张三")).toBeTruthy();
    expect(getByText("手机号")).toBeTruthy();
    expect(getByText("（未识别）")).toBeTruthy();
  });

  it("shows a readable error with retry and recovers (TS-114)", async () => {
    const sendFillRequest = vi
      .fn<() => Promise<FillResult>>()
      .mockRejectedValueOnce(new Error("no listener"))
      .mockResolvedValueOnce(sampleResult());
    const { findByText, getByText } = render(
      <Popup backend={profileBackend()} sendFillRequest={sendFillRequest} />,
    );

    fireEvent.click(await findByText("自动填写"));
    expect(await findByText("填写失败，请刷新页面后重试。")).toBeTruthy();

    fireEvent.click(getByText("重试"));
    expect(await findByText("已填 1")).toBeTruthy();
  });
});
