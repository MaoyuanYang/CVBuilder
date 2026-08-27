import type { JSX } from "preact";

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  dataField?: string;
  error?: string;
}

export function Field({ label, value, onChange, textarea, dataField, error }: FieldProps) {
  const handleInput = (event: JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(event.currentTarget.value);
  };

  return (
    <div class="field">
      <label>
        <span class="field-label">{label}</span>
        {textarea ? (
          <textarea value={value} onInput={handleInput} data-field={dataField} rows={4} />
        ) : (
          <input type="text" value={value} onInput={handleInput} data-field={dataField} />
        )}
      </label>
      {error ? <p class="field-error" role="alert">{error}</p> : null}
    </div>
  );
}
