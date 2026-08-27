import type { CustomField } from "../../shared/types";

interface CustomFieldsSectionProps {
  entries: CustomField[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, part: "key" | "value", value: string) => void;
}

export function CustomFieldsSection({ entries, onAdd, onRemove, onChange }: CustomFieldsSectionProps) {
  return (
    <section class="form-section">
      <h2>自定义项</h2>
      <p class="hint">用于填写上方未覆盖的字段（如期望城市、获奖情况等）。</p>
      {entries.map((entry) => (
        <div class="custom-row" key={entry.id}>
          <label>
            <span class="field-label">字段名</span>
            <input
              type="text"
              value={entry.key}
              onInput={(event) => onChange(entry.id, "key", event.currentTarget.value)}
            />
          </label>
          <label>
            <span class="field-label">字段值</span>
            <input
              type="text"
              value={entry.value}
              onInput={(event) => onChange(entry.id, "value", event.currentTarget.value)}
            />
          </label>
          <button type="button" class="danger" onClick={() => onRemove(entry.id)}>
            删除
          </button>
        </div>
      ))}
      <button type="button" class="secondary" onClick={onAdd}>
        添加自定义项
      </button>
    </section>
  );
}
