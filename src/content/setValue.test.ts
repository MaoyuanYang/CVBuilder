import { describe, expect, it, vi } from "vitest";
import { checkControl, selectOption, setValue } from "./setValue";

describe("setValue (TS-102)", () => {
  it("uses the framework instance setter when present and dispatches events", () => {
    const input = document.createElement("input");
    let frameworkState = "";
    Object.defineProperty(input, "value", {
      get: () => frameworkState,
      set: (value: string) => {
        frameworkState = value;
      },
      configurable: true,
    });
    const inputEvent = vi.fn();
    const changeEvent = vi.fn();
    input.addEventListener("input", inputEvent);
    input.addEventListener("change", changeEvent);

    setValue(input, "张三");

    expect(frameworkState).toBe("张三");
    expect(inputEvent).toHaveBeenCalledTimes(1);
    expect(changeEvent).toHaveBeenCalledTimes(1);
  });

  it("falls back to the native setter for plain elements", () => {
    const input = document.createElement("input");
    const inputEvent = vi.fn();
    input.addEventListener("input", inputEvent);

    setValue(input, "13800138000");

    expect(input.value).toBe("13800138000");
    expect(inputEvent).toHaveBeenCalledTimes(1);
  });

  it("selectOption selects the matching option and dispatches change", () => {
    const select = document.createElement("select");
    const empty = document.createElement("option");
    empty.value = "";
    empty.text = "请选择";
    const bachelor = document.createElement("option");
    bachelor.value = "edu";
    bachelor.text = "本科";
    select.add(empty);
    select.add(bachelor);
    const changeEvent = vi.fn();
    select.addEventListener("change", changeEvent);

    selectOption(select, "本科");

    expect(select.value).toBe("edu");
    expect(changeEvent).toHaveBeenCalledTimes(1);
  });

  it("checkControl checks an unchecked radio", () => {
    const radio = document.createElement("input");
    radio.type = "radio";
    checkControl(radio);
    expect(radio.checked).toBe(true);
  });
});
