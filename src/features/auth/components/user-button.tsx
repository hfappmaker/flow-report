"use client";

import { ExitIcon } from "@radix-ui/react-icons";
import { FaUser } from "react-icons/fa";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutButton from "@/features/auth/components/logout-button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSubscription } from "@/hooks/use-subscription";

const UserButton = () => {
  const user = useCurrentUser();
  const { subscriptionInfo } = useSubscription();

  console.log("UserButton - subscriptionInfo:", subscriptionInfo);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.image ?? ""} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <FaUser className="size-6" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        {/* ログアウトボタン */}
        <LogoutButton>
          <DropdownMenuItem className="justify-center text-center hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground">
            <ExitIcon className="mr-2 size-4" />
            ログアウト
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
