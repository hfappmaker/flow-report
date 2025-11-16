"use client";

import { ExitIcon } from "@radix-ui/react-icons";
import { FaUser } from "react-icons/fa";
import { MdSettings } from "react-icons/md";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import LogoutButton from "@/features/auth/components/logout-button";
import ManageSubscriptionButton from "@/features/subscription/components/manage-subscription-button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSubscription } from "@/hooks/use-subscription";

const UserButton = () => {
  const user = useCurrentUser();
  const { subscriptionInfo, isLoading, refreshSubscription } =
    useSubscription();

  const handleCancelSuccess = () => {
    // サブスクリプション情報をリフレッシュ
    void refreshSubscription();
  };

  console.log("UserButton - subscriptionInfo:", subscriptionInfo);

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
      <DropdownMenuContent className="w-48" align="end">
        {/* サブスクリプション管理ボタン */}
        {!isLoading &&
          (subscriptionInfo?.status === "TRIAL" ||
            subscriptionInfo?.status === "ACTIVE" ||
            subscriptionInfo?.status === "CANCELED") && (
            <>
              <ManageSubscriptionButton onSuccess={handleCancelSuccess}>
                <button className="flex w-full items-center justify-center rounded-sm px-2 py-1.5 text-center text-sm hover:bg-sky-400 hover:text-primary-foreground focus:bg-sky-400 focus:text-primary-foreground">
                  <MdSettings className="mr-2 size-4" />
                  サブスクリプションを管理
                </button>
              </ManageSubscriptionButton>
              <DropdownMenuSeparator />
            </>
          )}

        {/* ログアウトボタン */}
        <LogoutButton>
          <DropdownMenuItem className="justify-center text-center hover:bg-sky-400 hover:text-primary-foreground focus:bg-sky-400 focus:text-primary-foreground">
            <ExitIcon className="mr-2 size-4" />
            ログアウト
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
