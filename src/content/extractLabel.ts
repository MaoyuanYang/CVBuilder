function cleanText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function extractLabel(element: Element): string {
  const doc = element.ownerDocument;

  const id = element.getAttribute("id");
  if (id) {
    const forLabel = doc.querySelector(`label[for="${id}"]`);
    const text = cleanText(forLabel?.textContent);
    if (text) return text;
  }

  const wrapping = element.closest("label");
  if (wrapping) {
    const text = cleanText(wrapping.textContent);
    if (text) return text;
  }

  const aria = cleanText(element.getAttribute("aria-label"));
  if (aria) return aria;

  const placeholder = cleanText(element.getAttribute("placeholder"));
  if (placeholder) return placeholder;

  const row = element.closest("tr");
  if (row) {
    const th = row.querySelector("th");
    const text = cleanText(th?.textContent);
    if (text) return text;
  }

  const previous = element.previousElementSibling;
  const previousText = cleanText(previous?.textContent);
  if (previousText) return previousText;

  const parentPrevious = element.parentElement?.previousElementSibling;
  const parentPreviousText = cleanText(parentPrevious?.textContent);
  if (parentPreviousText) return parentPreviousText;

  return "";
}

export function extractGroupLabel(group: Element[], container: Element | null): string {
  if (container) {
    const legend = container.querySelector("legend");
    const text = cleanText(legend?.textContent);
    if (text) return text;
  }
  const first = group[0];
  if (first) return extractLabel(first);
  return "";
}
