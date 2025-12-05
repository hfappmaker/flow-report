import { buildMailtoUrl } from "./mailto-url-builder";

describe("buildMailtoUrl", () => {
  it("基本的なmailto URLを構築する", () => {
    const params = {
      recipients: ["test@example.com"],
      subject: "テスト件名",
      body: "テスト本文",
    };

    const result = buildMailtoUrl(params);

    expect(result).toContain("mailto:test@example.com");
    expect(result).toContain("subject=");
    expect(result).toContain("body=");
  });

  it("複数の宛先を正しく処理する", () => {
    const params = {
      recipients: ["test1@example.com", "test2@example.com"],
      subject: "テスト件名",
      body: "テスト本文",
    };

    const result = buildMailtoUrl(params);

    expect(result).toContain("mailto:test1@example.com,test2@example.com");
    expect(result).toContain("subject=");
    expect(result).toContain("body=");
  });

  it("CC宛先を正しく追加する", () => {
    const params = {
      recipients: ["test@example.com"],
      ccRecipients: ["cc1@example.com", "cc2@example.com"],
      subject: "テスト件名",
      body: "テスト本文",
    };

    const result = buildMailtoUrl(params);

    expect(result).toContain("mailto:test@example.com");
    expect(result).toContain("cc=cc1@example.com,cc2@example.com");
    expect(result).toContain("subject=");
    expect(result).toContain("body=");
  });

  it("件名と本文がURLエンコードされる", () => {
    const params = {
      recipients: ["test@example.com"],
      subject: "テスト 件名【重要】",
      body: "こんにちは\n改行あり",
    };

    const result = buildMailtoUrl(params);

    // URLエンコードされた文字列が含まれることを確認
    expect(result).toContain(encodeURIComponent("テスト 件名【重要】"));
    expect(result).toContain(encodeURIComponent("こんにちは\n改行あり"));
  });

  it("特殊文字を含む件名と本文を正しく処理する", () => {
    const params = {
      recipients: ["test@example.com"],
      subject: "件名 & 記号 = テスト",
      body: "本文 <> 記号 @ テスト",
    };

    const result = buildMailtoUrl(params);

    // デコードして元に戻せることを確認
    const urlObj = new URL(result);
    expect(decodeURIComponent(urlObj.searchParams.get("subject") ?? "")).toBe(
      "件名 & 記号 = テスト",
    );
    expect(decodeURIComponent(urlObj.searchParams.get("body") ?? "")).toBe(
      "本文 <> 記号 @ テスト",
    );
  });

  it("正しいURL形式を生成する", () => {
    const params = {
      recipients: ["test@example.com"],
      subject: "件名",
      body: "本文",
    };

    const result = buildMailtoUrl(params);

    expect(result).toMatch(/^mailto:.+\?subject=.+&body=.+$/);
  });

  it("CCがない場合はcc=パラメータを含まない", () => {
    const params = {
      recipients: ["test@example.com"],
      subject: "件名",
      body: "本文",
    };

    const result = buildMailtoUrl(params);

    expect(result).not.toContain("cc=");
  });

  it("空のCC配列の場合はcc=パラメータを含まない", () => {
    const params = {
      recipients: ["test@example.com"],
      ccRecipients: [],
      subject: "件名",
      body: "本文",
    };

    const result = buildMailtoUrl(params);

    expect(result).not.toContain("cc=");
  });

  it("宛先が空の配列の場合も正しく処理する", () => {
    const params = {
      recipients: [],
      subject: "件名",
      body: "本文",
    };

    const result = buildMailtoUrl(params);

    expect(result).toMatch(/^mailto:\?subject=.+&body=.+$/);
  });

  it("特殊文字を含むメールアドレスを正しく処理する", () => {
    const params = {
      recipients: ["test+tag@example.com"],
      ccRecipients: ["cc+tag@example.com"],
      subject: "件名",
      body: "本文",
    };

    const result = buildMailtoUrl(params);

    expect(result).toContain("mailto:test+tag@example.com");
    expect(result).toContain("cc=cc+tag@example.com");
  });

  it("生成されたURLが有効なURL形式である", () => {
    const params = {
      recipients: ["client@example.com"],
      ccRecipients: ["cc@example.com"],
      subject: "テスト件名",
      body: "テスト本文",
    };

    const result = buildMailtoUrl(params);

    // URLとして解析できることを確認
    expect(() => new URL(result)).not.toThrow();

    // mailto URLであることを確認
    const urlObj = new URL(result);
    expect(urlObj.protocol).toBe("mailto:");
    expect(urlObj.searchParams.has("subject")).toBe(true);
    expect(urlObj.searchParams.has("body")).toBe(true);
    expect(urlObj.searchParams.has("cc")).toBe(true);
  });
});
