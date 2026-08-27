import { normalizeText } from "./normalize";

export function findMatchingOption(options: string[], value: string): string | null {
  const normalizedValue = normalizeText(value);
  if (!normalizedValue) return null;
  for (const option of options) {
    const normalizedOption = normalizeText(option);
    if (!normalizedOption) continue;
    if (
      normalizedOption === normalizedValue ||
      normalizedOption.includes(normalizedValue) ||
      normalizedValue.includes(normalizedOption)
    ) {
      return option;
    }
  }
  return null;
}
