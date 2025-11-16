import {
  buildWorkReportEmailBody,
  resolveRecipientName,
} from "./email-body-builder";

describe("resolveRecipientName", () => {
  it("contactNameが存在する場合はcontactNameを返す", () => {
    const result = resolveRecipientName("田中太郎", "株式会社テスト");
    expect(result).toBe("田中太郎");
  });

  it("contactNameがnullの場合はclientNameを返す", () => {
    const result = resolveRecipientName(null, "株式会社テスト");
    expect(result).toBe("株式会社テスト");
  });

  it("contactNameが空文字列の場合でもcontactNameを返す", () => {
    const result = resolveRecipientName("", "株式会社テスト");
    expect(result).toBe("");
  });
});

describe("buildWorkReportEmailBody", () => {
  it("contactNameが存在する場合、正しいメール本文を生成する", () => {
    const params = {
      contactName: "田中太郎",
      clientName: "株式会社テスト",
      userName: "山田花子",
      targetDate: new Date(Date.UTC(2025, 0, 15)), // 2025年1月15日 UTC
    };

    const result = buildWorkReportEmailBody(params);

    expect(result).toContain("田中太郎様");
    expect(result).toContain("お世話になっております。山田花子です。");
    expect(result).toContain("2025年1月分の作業報告書を送付いたします。");
    expect(result).toContain("ご確認のほど、よろしくお願いいたします。");
  });

  it("contactNameがnullの場合、clientNameを使用してメール本文を生成する", () => {
    const params = {
      contactName: null,
      clientName: "株式会社テスト",
      userName: "山田花子",
      targetDate: new Date(Date.UTC(2025, 0, 15)),
    };

    const result = buildWorkReportEmailBody(params);

    expect(result).toContain("株式会社テスト様");
    expect(result).toContain("お世話になっております。山田花子です。");
    expect(result).toContain("2025年1月分の作業報告書を送付いたします。");
  });

  it("12月の日付を正しく処理する", () => {
    const params = {
      contactName: "田中太郎",
      clientName: "株式会社テスト",
      userName: "山田花子",
      targetDate: new Date(Date.UTC(2024, 11, 1)), // 2024年12月1日 UTC
    };

    const result = buildWorkReportEmailBody(params);

    expect(result).toContain("2024年12月分の作業報告書を送付いたします。");
  });

  it("1月の日付を正しく処理する", () => {
    const params = {
      contactName: "田中太郎",
      clientName: "株式会社テスト",
      userName: "山田花子",
      targetDate: new Date(Date.UTC(2025, 0, 1)), // 2025年1月1日 UTC
    };

    const result = buildWorkReportEmailBody(params);

    expect(result).toContain("2025年1月分の作業報告書を送付いたします。");
  });

  it("特殊文字を含む名前を正しく処理する", () => {
    const params = {
      contactName: "田中 太郎（営業部）",
      clientName: "株式会社テスト",
      userName: "山田 花子",
      targetDate: new Date(Date.UTC(2025, 5, 1)),
    };

    const result = buildWorkReportEmailBody(params);

    expect(result).toContain("田中 太郎（営業部）様");
    expect(result).toContain("お世話になっております。山田 花子です。");
  });

  it("メール本文の構造が正しい", () => {
    const params = {
      contactName: "田中太郎",
      clientName: "株式会社テスト",
      userName: "山田花子",
      targetDate: new Date(Date.UTC(2025, 2, 1)),
    };

    const result = buildWorkReportEmailBody(params);

    // 改行を含む正しい構造を持っているか確認
    const lines = result.split("\n").filter((line) => line.trim() !== "");
    expect(lines).toHaveLength(4); // 空行を除いて4行
    expect(lines[0]).toContain("田中太郎様");
    expect(lines[1]).toContain("お世話になっております。山田花子です。");
    expect(lines[2]).toContain("2025年3月分の作業報告書を送付いたします。");
    expect(lines[3]).toContain("ご確認のほど、よろしくお願いいたします。");
  });
});
