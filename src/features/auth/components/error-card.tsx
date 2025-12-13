import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import CardWrapper from "@/features/auth/components/card-wrapper";

const ErrorCard = () => {
  return (
    <CardWrapper
      headerLabel="エラー"
      backButtonHref="/auth/login"
      backButtonLabel="ログインページに戻る"
    >
      <div className="flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
        <ExclamationTriangleIcon className="size-4 flex-none" />
        <p className="">認証プロバイダーとの認証に失敗しました</p>
      </div>
    </CardWrapper>
  );
};

export default ErrorCard;
