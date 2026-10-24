import { describe, expect, it } from "vitest";

import { isFreeeOAuthResult } from "./freee-oauth-result";

describe("isFreeeOAuthResult", () => {
  it("既知の結果だけを受け付ける", () => {
    expect(isFreeeOAuthResult("connected")).toBe(true);
    expect(isFreeeOAuthResult("denied")).toBe(true);
    expect(isFreeeOAuthResult("failed")).toBe(true);
    expect(isFreeeOAuthResult("other")).toBe(false);
    expect(isFreeeOAuthResult(undefined)).toBe(false);
  });
});
