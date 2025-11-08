"use client";

import { useEffect, useState } from "react";

/**
 * Server/Client両環境でのレンダリング時のハイドレーション不一致を防ぐ
 * @returns クライアント環境ならtrue、サーバー環境ならfalse
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
