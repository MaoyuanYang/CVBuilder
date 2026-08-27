const STYLE_ID = "cvbuilder-style";
const FILLED_CLASS = "cvbuilder-filled";

export function highlightElement(element: Element): void {
  const doc = element.ownerDocument;
  if (!doc.getElementById(STYLE_ID)) {
    const style = doc.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      ".cvbuilder-filled { outline: 2px solid var(--cvbuilder-accent, #0969da); outline-offset: 1px; }";
    (doc.head ?? doc.documentElement).appendChild(style);
  }
  element.classList.add(FILLED_CLASS);
}
