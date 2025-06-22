"use client";

import { ExitIcon } from "@radix-ui/react-icons";
import { FaUser } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import LogoutButton from "@/features/auth/components/logout-button";
import CancelSubscriptionButton from "@/features/subscription/components/cancel-subscription-button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSubscription } from "@/hooks/use-subscription";

const UserButton = () => {
  const user = useCurrentUser();
  const { subscriptionInfo, isLoading, refreshSubscription } = useSubscription();

  // アクティブなサブスクリプションがあるかチェック
  // キャンセル済みでも有効期間中はアクティブとして扱う
  const hasActiveSubscription = 
    subscriptionInfo && 
    (subscriptionInfo.status === "ACTIVE" || 
     subscriptionInfo.status === "TRIAL" ||
     (subscriptionInfo.status === "CANCELED" && 
      subscriptionInfo.currentPeriodEnd && 
      subscriptionInfo.currentPeriodEnd > new Date()));

  const handleCancelSuccess = () => {
    // サブスクリプション情報をリフレッシュ
    void refreshSubscription();
  };

  console.log("UserButton - subscriptionInfo:", subscriptionInfo);
  console.log("UserButton - hasActiveSubscription:", hasActiveSubscription);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.image ?? ""} />
          <AvatarFallback className="bg-sky-400 text-primary-foreground">
            <FaUser className="size-6" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48"
        align="end"
      >
        {/* サブスクリプションキャンセルボタン */}
        {!isLoading && hasActiveSubscription && subscriptionInfo.status !== "CANCELED" && (
          <>
            <CancelSubscriptionButton onSuccess={handleCancelSuccess}>
              <button 
                className="w-full px-2 py-1.5 text-sm flex items-center justify-center text-center hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 rounded-sm"
              >
                <MdCancel className="mr-2 size-4" />
                サブスクリプションキャンセル
              </button>
            </CancelSubscriptionButton>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* ログアウトボタン */}
        <LogoutButton>
          <DropdownMenuItem className="justify-center text-center hover:bg-sky-400 hover:text-primary-foreground focus:bg-sky-400 focus:text-primary-foreground">
            <ExitIcon className="mr-2 size-4" />
            Logout
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
