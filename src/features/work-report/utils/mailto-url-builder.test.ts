import { buildMailtoUrl, buildWorkReportMailtoUrl } from "./mailto-url-builder";

describe("buildMailtoUrl", () => {
  it("基本的なmailto URLを構築する", () => {
    const params = {
      recipient: "test@example.com",
      subject: "テスト件名",
      body: "テスト本文",
    };

    const result = buildMailtoUrl(params);

    expect(result).toContain("mailto:test@example.com");
    expect(result).toContain("subject=");
    expect(result).toContain("body=");
  });

  it("件名と本文がURLエンコードされる", () => {
    const params = {
      recipient: "test@example.com",
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
      recipient: "test@example.com",
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
      recipient: "test@example.com",
      subject: "件名",
      body: "本文",
    };

    const result = buildMailtoUrl(params);

    expect(result).toMatch(/^mailto:.+\?subject=.+&body=.+$/);
  });
});

describe("buildWorkReportMailtoUrl", () => {
  it("作業報告書用のmailto URLを構築する", () => {
    const params = {
      clientEmail: "client@example.com",
      contactName: "田中太郎",
      clientName: "株式会社テスト",
      userName: "山田花子",
      targetDate: new Date(Date.UTC(2025, 0, 15)),
    };

    const result = buildWorkReportMailtoUrl(params);

    expect(result).toContain("mailto:client@example.com");
    expect(result).toContain("subject=");
    expect(result).toContain("body=");
  });

  it("件名に正しいフォーマットが含まれる", () => {
    const params = {
      clientEmail: "client@example.com",
      contactName: "田中太郎",
      clientName: "株式会社テスト",
      userName: "山田花子",
      targetDate: new Date(Date.UTC(2025, 2, 10)),
    };

    const result = buildWorkReportMailtoUrl(params);

    // URLから件名をデコード
    const urlObj = new URL(result);
    const subject = decodeURIComponent(
      urlObj.searchParams.get("subject") ?? "",
    );

    expect(subject).toContain("【作業報告書】");
    expect(subject).toContain("2025年3月分");
    expect(subject).toContain("山田花子");
  });

  it("本文にcontactNameを含む正しいメッセージが生成される", () => {
    const params = {
      clientEmail: "client@example.com",
      contactName: "田中太郎",
      clientName: "株式会社テスト",
      userName: "山田花子",
      targetDate: new Date(Date.UTC(2025, 5, 1)),
    };

    const result = buildWorkReportMailtoUrl(params);

    // URLから本文をデコード
    const urlObj = new URL(result);
    const body = decodeURIComponent(urlObj.searchParams.get("body") ?? "");

    expect(body).toContain("田中太郎様");
    expect(body).toContain("お世話になっております。山田花子です。");
    expect(body).toContain("2025年6月分の作業報告書を送付いたします。");
    expect(body).toContain("ご確認のほど、よろしくお願いいたします。");
  });

  it("contactNameがnullの場合、clientNameが本文に使用される", () => {
    const params = {
      clientEmail: "client@example.com",
      contactName: null,
      clientName: "株式会社テスト",
      userName: "山田花子",
      targetDate: new Date(Date.UTC(2025, 0, 1)),
    };

    const result = buildWorkReportMailtoUrl(params);

    const urlObj = new URL(result);
    const body = decodeURIComponent(urlObj.searchParams.get("body") ?? "");

    expect(body).toContain("株式会社テスト様");
    expect(body).not.toContain("null");
  });

  it("12月の日付を正しく処理する", () => {
    const params = {
      clientEmail: "client@example.com",
      contactName: "田中太郎",
      clientName: "株式会社テスト",
      userName: "山田花子",
      targetDate: new Date(Date.UTC(2024, 11, 25)),
    };

    const result = buildWorkReportMailtoUrl(params);

    const urlObj = new URL(result);
    const subject = decodeURIComponent(
      urlObj.searchParams.get("subject") ?? "",
    );
    const body = decodeURIComponent(urlObj.searchParams.get("body") ?? "");

    expect(subject).toContain("2024年12月分");
    expect(body).toContain("2024年12月分の作業報告書を送付いたします。");
  });

  it("特殊文字を含むメールアドレスと名前を正しく処理する", () => {
    const params = {
      clientEmail: "test+tag@example.com",
      contactName: "田中 太郎（部長）",
      clientName: "株式会社テスト",
      userName: "山田 花子",
      targetDate: new Date(Date.UTC(2025, 3, 1)),
    };

    const result = buildWorkReportMailtoUrl(params);

    expect(result).toContain("mailto:test+tag@example.com");

    const urlObj = new URL(result);
    const body = decodeURIComponent(urlObj.searchParams.get("body") ?? "");

    expect(body).toContain("田中 太郎（部長）様");
    expect(body).toContain("お世話になっております。山田 花子です。");
  });

  it("生成されたURLが有効なURL形式である", () => {
    const params = {
      clientEmail: "client@example.com",
      contactName: "田中太郎",
      clientName: "株式会社テスト",
      userName: "山田花子",
      targetDate: new Date(Date.UTC(2025, 0, 1)),
    };

    const result = buildWorkReportMailtoUrl(params);

    // URLとして解析できることを確認
    expect(() => new URL(result)).not.toThrow();

    // mailto URLであることを確認
    const urlObj = new URL(result);
    expect(urlObj.protocol).toBe("mailto:");
    expect(urlObj.pathname).toBe("client@example.com");
    expect(urlObj.searchParams.has("subject")).toBe(true);
    expect(urlObj.searchParams.has("body")).toBe(true);
  });
});
