import type { ResumeProfile } from "../shared/types";
import { matchAlias } from "./aliasDictionary";
import { extractGroupLabel, extractLabel } from "./extractLabel";
import { highlightElement } from "./highlight";
import { findMatchingOption } from "./matchOptions";
import { normalizeText } from "./normalize";
import { getValueForKey } from "./resolveValue";
import { checkControl, selectOption, setValue } from "./setValue";

export interface FillResultEntry {
  label: string;
  value?: string;
  reason?: string;
}

export interface FillResult {
  filled: FillResultEntry[];
  skipped: FillResultEntry[];
  unmatched: FillResultEntry[];
}

type Field =
  | { kind: "text"; element: HTMLInputElement | HTMLTextAreaElement; label: string }
  | { kind: "select"; element: HTMLSelectElement; label: string }
  | { kind: "check"; elements: HTMLInputElement[]; label: string };

const SKIPPED_INPUT_TYPES = new Set([
  "button",
  "submit",
  "reset",
  "hidden",
  "password",
  "file",
  "image",
  "color",
  "range",
  "date",
  "datetime-local",
  "month",
  "week",
  "time",
]);

function isSkippable(element: Element): boolean {
  return (
    element.hasAttribute("disabled") ||
    element.hasAttribute("readonly") ||
    (element.getAttribute("type") ?? "").toLowerCase() === "hidden"
  );
}

export function scanFields(root: ParentNode): Field[] {
  const fields: Field[] = [];
  const consumed = new Set<Element>();

  const radioGroups = new Map<string, HTMLInputElement[]>();
  const checkboxGroups = new Map<string, HTMLInputElement[]>();

  root.querySelectorAll("input, textarea, select").forEach((element) => {
    if (consumed.has(element) || isSkippable(element)) return;

    if (element instanceof HTMLInputElement) {
      const type = (element.getAttribute("type") ?? "text").toLowerCase();
      if (type === "radio" || type === "checkbox") {
        const groupName = element.getAttribute("name") ?? `__solo_${fields.length}`;
        const bucket = type === "radio" ? radioGroups : checkboxGroups;
        const group = bucket.get(groupName) ?? [];
        group.push(element);
        bucket.set(groupName, group);
        consumed.add(element);
        return;
      }
      if (SKIPPED_INPUT_TYPES.has(type)) return;
      fields.push({ kind: "text", element, label: extractLabel(element) });
      consumed.add(element);
      return;
    }

    if (element instanceof HTMLTextAreaElement) {
      fields.push({ kind: "text", element, label: extractLabel(element) });
      consumed.add(element);
      return;
    }

    if (element instanceof HTMLSelectElement) {
      fields.push({ kind: "select", element, label: extractLabel(element) });
      consumed.add(element);
    }
  });

  for (const group of radioGroups.values()) {
    const container = group[0]?.closest("fieldset") ?? null;
    fields.push({ kind: "check", elements: group, label: extractGroupLabel(group, container) });
  }
  for (const group of checkboxGroups.values()) {
    const container = group[0]?.closest("fieldset") ?? null;
    fields.push({ kind: "check", elements: group, label: extractGroupLabel(group, container) });
  }

  return fields;
}

function isFieldNonEmpty(field: Field): boolean {
  if (field.kind === "text") return field.element.value.trim() !== "";
  if (field.kind === "select") return field.element.value.trim() !== "";
  return field.elements.some((element) => element.checked);
}

function optionTextFor(element: HTMLInputElement): string {
  const own = extractLabel(element);
  if (own) return own;
  const parentText = element.parentElement?.textContent ?? "";
  return parentText.replace(/\s+/g, " ").trim();
}

function fillField(field: Field, value: string): void {
  if (field.kind === "text") {
    setValue(field.element, value);
    highlightElement(field.element);
    return;
  }
  if (field.kind === "select") {
    const texts = Array.from(field.element.options).map((option) => option.text);
    const matched = findMatchingOption(texts, value);
    if (!matched) throw new Error("no matching option");
    selectOption(field.element, matched);
    highlightElement(field.element);
    return;
  }
  const texts = field.elements.map(optionTextFor);
  const matched = findMatchingOption(texts, value);
  if (!matched) throw new Error("no matching option");
  const target = field.elements[texts.indexOf(matched)];
  if (!target) throw new Error("no matching option");
  checkControl(target);
  highlightElement(target);
}

export function runAutoFill(root: ParentNode, profile: ResumeProfile): FillResult {
  const result: FillResult = { filled: [], skipped: [], unmatched: [] };

  for (const field of scanFields(root)) {
    const label = field.label;
    if (!label) {
      result.unmatched.push({ label: "(无标签)", reason: "未识别" });
      continue;
    }
    try {
      const key = matchAlias(normalizeText(label));
      if (!key) {
        result.unmatched.push({ label, reason: "未识别" });
        continue;
      }
      const value = getValueForKey(profile, key).trim();
      if (!value) {
        result.unmatched.push({ label, reason: "无数据" });
        continue;
      }
      if (isFieldNonEmpty(field)) {
        result.skipped.push({ label });
        continue;
      }
      fillField(field, value);
      result.filled.push({ label, value });
    } catch {
      result.unmatched.push({ label, reason: "填写失败" });
    }
  }

  return result;
}
