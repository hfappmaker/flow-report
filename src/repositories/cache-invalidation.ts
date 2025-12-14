import { db } from "@/repositories/db";

/**
 * サブスクリプション関連のキャッシュを無効化
 * @param userId ユーザーID
 */
export async function invalidateSubscriptionCache(
  userId: string,
): Promise<void> {
  try {
    await db.$accelerate.invalidate({
      tags: [`subscription_user_${userId}`],
    });
  } catch (error) {
    console.error("Failed to invalidate subscription cache:", error);
  }
}
