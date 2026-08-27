import { useEffect, useState } from "preact/hooks";
import { createChromeStorageBackend, loadProfile, type StorageBackend } from "../shared/storage";
import type { FillResult } from "../content/fillEngine";

type PopupStatus = "loading" | "disabled" | "idle" | "filling" | "result" | "error";

export interface PopupProps {
  backend?: StorageBackend;
  sendFillRequest?: () => Promise<FillResult>;
}

async function defaultSendFillRequest(): Promise<FillResult> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;
  if (tabId === undefined) throw new Error("no active tab");
  const response = (await chrome.tabs.sendMessage(tabId, { type: "autofill" })) as
    | FillResult
    | { error: string }
    | undefined;
  if (!response || "error" in response) throw new Error("fill failed");
  return response;
}

export function Popup({ backend = createChromeStorageBackend(), sendFillRequest = defaultSendFillRequest }: PopupProps) {
  const [status, setStatus] = useState<PopupStatus>("loading");
  const [result, setResult] = useState<FillResult | null>(null);

  useEffect(() => {
    void loadProfile(backend)
      .then((profile) => setStatus(profile ? "idle" : "disabled"))
      .catch(() => setStatus("error"));
  }, [backend]);

  const run = () => {
    setStatus("filling");
    sendFillRequest()
      .then((fillResult) => {
        setResult(fillResult);
        setStatus("result");
      })
      .catch(() => setStatus("error"));
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <main class="popup">
      <h1>CVBuilder</h1>
      {status === "loading" ? <p class="status" role="status">正在加载…</p> : null}
      {status === "disabled" ? (
        <div>
          <p class="status">请先录入简历数据。</p>
          <button type="button" class="secondary" onClick={openOptions}>去录入</button>
        </div>
      ) : null}
      {status === "idle" || status === "filling" ? (
        <button type="button" disabled={status === "filling"} onClick={run}>
          {status === "filling" ? "正在填写…" : "自动填写"}
        </button>
      ) : null}
      {status === "error" ? (
        <div>
          <p class="error" role="alert">填写失败，请刷新页面后重试。</p>
          <button type="button" onClick={run}>重试</button>
        </div>
      ) : null}
      {status === "result" && result ? (
        <div>
          <p class="counts" role="status">
            <span class="filled">已填 {result.filled.length}</span>
            <span class="skipped">跳过 {result.skipped.length}</span>
            <span class="unmatched">未命中 {result.unmatched.length}</span>
          </p>
          <div class="group">
            <h2>已填</h2>
            <ul class="result-list">
              {result.filled.map((entry) => (
                <li key={`filled-${entry.label}`}>
                {entry.label} → {entry.value}
                </li>
              ))}
            </ul>
          </div>
          <div class="group">
            <h2>跳过</h2>
            <ul class="result-list">
              {result.skipped.map((entry) => (
                <li key={`skipped-${entry.label}`}>{entry.label}</li>
              ))}
            </ul>
          </div>
          <div class="group">
            <h2>未命中</h2>
            <ul class="result-list">
              {result.unmatched.map((entry) => (
                <li key={`unmatched-${entry.label}`}>
                  {entry.label} <span class="reason">（{entry.reason}）</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </main>
  );
}
