import { checkBotId } from "botid/server";

/**
 * Vercel BotID で bot リクエストかどうかを判定する。
 * 開発時 (BotID が機能しない環境) では検証結果が isBot=false になることが多いが、
 * 念のため verifier 自体が応答しない場合もスルー扱いにしている。
 */
export const isBotRequest = async (): Promise<boolean> => {
  try {
    const verification = await checkBotId();
    return verification.isBot === true;
  } catch (error) {
    console.warn("BotID 検証中にエラー:", error);
    return false;
  }
};
