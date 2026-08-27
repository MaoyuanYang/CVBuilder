export type SaveStatus = "idle" | "saving" | "saved" | "save-error";

interface SaveBarProps {
  dirty: boolean;
  saveStatus: SaveStatus;
  onSave: () => void;
}

export function SaveBar({ dirty, saveStatus, onSave }: SaveBarProps) {
  return (
    <div class="save-bar">
      <button type="button" onClick={onSave} disabled={saveStatus === "saving"}>
        {saveStatus === "saving" ? "保存中…" : "保存"}
      </button>
      {dirty ? <span class="save-hint">有未保存的修改</span> : null}
      {saveStatus === "saved" && !dirty ? (
        <span class="save-success" role="status">已保存</span>
      ) : null}
      {saveStatus === "save-error" ? (
        <span class="save-error" role="alert">保存失败，请重试</span>
      ) : null}
    </div>
  );
}
