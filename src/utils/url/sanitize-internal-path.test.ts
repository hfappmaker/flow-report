import { describe, expect, it } from "vitest";

import { sanitizeInternalPath } from "./sanitize-internal-path";

describe("sanitizeInternalPath", () => {
  it("アプリ内パスはそのまま返す", () => {
    expect(sanitizeInternalPath("/work-report/abc?tab=1")).toBe(
      "/work-report/abc?tab=1",
    );
  });

  it.each([
    null,
    undefined,
    "",
    "work-report",
    "//evil.example",
    "/\\evil.example",
    "https://evil.example",
    "javascript:alert(1)",
  ])("外部URLや不正な値 %s は fallback を返す", (value) => {
    expect(sanitizeInternalPath(value)).toBe("/");
    expect(sanitizeInternalPath(value, "/dashboard")).toBe("/dashboard");
  });
});
