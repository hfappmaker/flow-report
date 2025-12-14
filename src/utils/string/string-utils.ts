/**
 * 文字列を最大長までに切り詰める
 * @param str 元の文字列
 * @param maxLength 最大文字数
 * @returns 切り詰められた文字列（超過時は末尾に…を付加）
 */
export const truncate = (str: string, maxLength: number): string => {
  return str.length > maxLength ? str.slice(0, maxLength) + "…" : str;
};
