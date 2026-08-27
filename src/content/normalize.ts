export function normalizeText(value: string): string {
  return value
    .replace(/[\uff01-\uff5e]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "");
}
