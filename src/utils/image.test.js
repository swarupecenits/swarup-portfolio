import { describe, expect, it } from "vitest";
import { imageSrcSet, optimizeImage } from "./image";

const BASE = "https://res.cloudinary.com/demo/image/upload/";

describe("optimizeImage", () => {
  it("leaves non-Cloudinary URLs untouched", () => {
    expect(optimizeImage("/assets/logo.png", 400)).toBe("/assets/logo.png");
    expect(optimizeImage(undefined, 400)).toBeUndefined();
  });

  it("adds format, quality and width after the existing transformations", () => {
    expect(optimizeImage(`${BASE}w_1000,ar_16:9,c_fill/v17/photo.png`, 400)).toBe(
      `${BASE}w_1000,ar_16:9,c_fill/f_auto,q_auto,w_400,c_limit/v17/photo.png`,
    );
  });

  it("drops redundant f_auto/q_auto segments and works without a version", () => {
    expect(optimizeImage(`${BASE}f_auto,q_auto:good/photo.png`)).toBe(`${BASE}f_auto,q_auto/photo.png`);
  });
});

describe("imageSrcSet", () => {
  it("lists one candidate per width for Cloudinary images only", () => {
    expect(imageSrcSet(`${BASE}v1/a.png`, [320, 640])).toBe(
      `${BASE}f_auto,q_auto,w_320,c_limit/v1/a.png 320w, ${BASE}f_auto,q_auto,w_640,c_limit/v1/a.png 640w`,
    );
    expect(imageSrcSet("/assets/a.png", [320])).toBeUndefined();
  });
});
