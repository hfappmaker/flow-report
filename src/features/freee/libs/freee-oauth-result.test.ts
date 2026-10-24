import { describe, expect, it } from "vitest";

import { isFreeeOAuthResult, sanitizeReturnTo } from "./freee-oauth-result";

describe("sanitizeReturnTo", () => {
  it("アプリ内パスはそのまま返す", () => {
    expect(sanitizeReturnTo("/work-report/abc")).toBe("/work-report/abc");
  });

  it.each([
    null,
    undefined,
    "",
    "work-report",
    "//evil.example",
    "/\\evil.example",
    "https://evil.example",
  ])("外部URLや不正な値 %s は / に置き換える", (value) => {
    expect(sanitizeReturnTo(value)).toBe("/");
  });
});

describe("isFreeeOAuthResult", () => {
  it("既知の結果だけを受け付ける", () => {
    expect(isFreeeOAuthResult("connected")).toBe(true);
    expect(isFreeeOAuthResult("denied")).toBe(true);
    expect(isFreeeOAuthResult("failed")).toBe(true);
    expect(isFreeeOAuthResult("other")).toBe(false);
    expect(isFreeeOAuthResult(undefined)).toBe(false);
  });
});
