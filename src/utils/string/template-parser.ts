/**
 * テンプレート文字列内の変数を置換する汎用的な関数
 * @param template テンプレート文字列（例: "Hello ${name}!"）
 * @param variables 変数のキーと値のマップ（例: { name: "John" }）
 * @returns 変数が置換された文字列
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\${(\w+)}/g, (_, key) => variables[key] || "");
}

/**
 * テンプレート文字列内の変数名を抽出する
 * @param template テンプレート文字列
 * @returns 見つかった変数名の配列
 */
export function extractTemplateVariables(template: string): string[] {
  const matches = template.match(/\${(\w+)}/g) ?? [];
  return matches.map((match) => match.slice(2, -1));
}

/**
 * テンプレート文字列が有効な形式かチェックする
 * @param template テンプレート文字列
 * @returns 有効な場合はtrue
 */
export function isValidTemplateString(template: string): boolean {
  // 閉じ忘れがないかチェック（${の数と}の数が一致）
  const openCount = (template.match(/\${/g) ?? []).length;
  const closeCount = (template.match(/}/g) ?? []).length;

  if (openCount !== closeCount) {
    return false;
  }

  // 変数がない場合は有効
  if (openCount === 0) {
    return true;
  }

  // 変数の構文が正しいかチェック（${name}の形式）
  const variables = template.match(/\${[^}]*}/g) ?? [];
  const validVariablePattern = /^\${[\w.]+}$/;

  return variables.every((v) => validVariablePattern.test(v));
}
