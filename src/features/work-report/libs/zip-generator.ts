import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";

import type { ExportFile } from "@/features/work-report/types/export-types";

/**
 * 複数ファイルをZIPに圧縮する
 * @param files 圧縮するファイル配列
 * @param password パスワード（オプション）
 * @returns ZIPファイルのBlob
 */
export async function generateZipFile(
  files: ExportFile[],
  password?: string,
): Promise<Blob> {
  const blobWriter = new BlobWriter("application/zip");
  const zipWriter = new ZipWriter(blobWriter, {
    password: password || undefined,
    encryptionStrength: password ? 3 : undefined, // AES-256
  });

  for (const file of files) {
    await zipWriter.add(file.fileName, new BlobReader(file.blob));
  }

  await zipWriter.close();
  return blobWriter.getData();
}

/**
 * ZIPファイル名を生成する
 * @param targetDate 対象月
 * @param userName ユーザー名
 * @returns ZIPファイル名
 */
export function formatZipFileName(targetDate: Date, userName: string): string {
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  return `${String(year)}${month}_${userName}_エクスポート.zip`;
}
