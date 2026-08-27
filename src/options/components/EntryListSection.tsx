import { Field } from "./Field";

export interface EntryFieldSpec {
  name: string;
  label: string;
  textarea?: boolean;
}

interface EntryListSectionProps {
  title: string;
  addLabel: string;
  entries: Array<Record<string, string>>;
  fields: EntryFieldSpec[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: string, value: string) => void;
}

export function EntryListSection({
  title,
  addLabel,
  entries,
  fields,
  onAdd,
  onRemove,
  onChange,
}: EntryListSectionProps) {
  return (
    <section class="form-section">
      <h2>{title}</h2>
      {entries.map((entry, index) => (
        <div class="entry-card" key={entry["id"]}>
          <div class="entry-header">
            <span class="entry-index">{index + 1}</span>
            <button type="button" class="danger" onClick={() => onRemove(entry["id"])}>
              删除
            </button>
          </div>
          {fields.map((spec) => (
            <Field
              key={spec.name}
              label={spec.label}
              value={entry[spec.name] ?? ""}
              textarea={spec.textarea}
              onChange={(value) => onChange(entry["id"], spec.name, value)}
            />
          ))}
        </div>
      ))}
      <button type="button" class="secondary" onClick={onAdd}>
        {addLabel}
      </button>
    </section>
  );
}
