import { afterEach, describe, expect, it, vi } from "vitest";
import { PhotoError, processPhoto } from "./image";

interface StubBitmap {
  width: number;
  height: number;
  close: () => void;
}

function stubCanvas(dataUrl = "data:image/jpeg;base64,stub") {
  const drawImage = vi.fn();
  const canvasElement = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ({ drawImage })),
    toDataURL: vi.fn(() => dataUrl),
  };
  vi.spyOn(document, "createElement").mockReturnValue(canvasElement as unknown as HTMLCanvasElement);
  return { drawImage, canvasElement };
}

describe("processPhoto (TS-011)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("downsizes a large image to the max edge and returns a JPEG data URL", async () => {
    const close = vi.fn();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async (): Promise<StubBitmap> => ({ width: 2048, height: 1024, close })),
    );
    const { drawImage, canvasElement } = stubCanvas();

    const result = await processPhoto(new File(["x"], "photo.jpg"));

    expect(result).toBe("data:image/jpeg;base64,stub");
    expect(canvasElement.width).toBe(512);
    expect(canvasElement.height).toBe(256);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 512, 256);
    expect(canvasElement.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.85);
    expect(close).toHaveBeenCalled();
  });

  it("keeps small images at their original size", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async (): Promise<StubBitmap> => ({ width: 200, height: 100, close: vi.fn() })),
    );
    const { canvasElement } = stubCanvas();

    await processPhoto(new File(["x"], "small.jpg"));

    expect(canvasElement.width).toBe(200);
    expect(canvasElement.height).toBe(100);
  });

  it("throws PhotoError for an undecodable image", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn(async () => { throw new Error("decode failed"); }));

    await expect(processPhoto(new File(["x"], "bad.bin"))).rejects.toBeInstanceOf(PhotoError);
  });

  it("throws PhotoError when canvas context is unavailable", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async (): Promise<StubBitmap> => ({ width: 10, height: 10, close: vi.fn() })),
    );
    vi.spyOn(document, "createElement").mockReturnValue({
      width: 0,
      height: 0,
      getContext: () => null,
      toDataURL: () => "",
    } as unknown as HTMLCanvasElement);

    await expect(processPhoto(new File(["x"], "photo.jpg"))).rejects.toThrow(PhotoError);
  });
});
