interface PhotoInputProps {
  value: string;
  error: string;
  onFile: (file: File) => void;
}

export function PhotoInput({ value, error, onFile }: PhotoInputProps) {
  return (
    <div class="field photo-field">
      <span class="field-label">照片</span>
      <div class="photo-row">
        {value ? <img class="photo-preview" src={value} alt="简历照片预览" /> : null}
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) {
              onFile(file);
              event.currentTarget.value = "";
            }
          }}
        />
      </div>
      {error ? <p class="field-error" role="alert">{error}</p> : null}
    </div>
  );
}
