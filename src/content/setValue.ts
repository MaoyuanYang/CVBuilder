function dispatchFillEvents(element: Element): void {
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function resolveValueSetter(element: Element): ((value: string) => void) | null {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : element instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  const descriptor =
    Object.getOwnPropertyDescriptor(element, "value") ??
    Object.getOwnPropertyDescriptor(prototype, "value");
  const setter = descriptor?.set;
  if (!setter) return null;
  return (value: string) => setter.call(element, value);
}

export function setValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const setter = resolveValueSetter(element);
  if (!setter) throw new Error("value setter unavailable");
  setter(value);
  dispatchFillEvents(element);
}

export function selectOption(select: HTMLSelectElement, optionText: string): void {
  const option = Array.from(select.options).find((item) => item.text === optionText);
  if (!option) throw new Error("option not found");
  const setter = resolveValueSetter(select);
  if (!setter) throw new Error("value setter unavailable");
  setter(option.value);
  dispatchFillEvents(select);
}

export function checkControl(input: HTMLInputElement): void {
  if (input.checked) return;
  input.click();
}
