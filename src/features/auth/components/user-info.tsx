import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User } from "@/features/auth/types/user";

interface UserInfoProps {
  user?: User;
  label: string;
}

const UserInfo = ({ user, label }: UserInfoProps) => {
  const userDetails = {
    ID: user?.id,
    名前: user?.name,
    メールアドレス: user?.email,
    権限: user?.role,
    "2要素認証": user?.isTwoFactorEnabled,
  };

  return (
    <Card className="w-auto shadow-sm">
      <CardHeader>
        <p className="text-center text-2xl font-semibold">{label}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(userDetails).map(([key, value]) => (
          <div
            key={key}
            className="flex flex-row items-center justify-between rounded-lg border p-3"
          >
            <p className="text-sm font-medium">{key}</p>
            {key === "2要素認証" ? (
              <Badge
                variant={value ? "success" : "destructive"}
                className="ml-4"
              >
                {value ? "有効" : "無効"}
              </Badge>
            ) : (
              <p className="max-w-[180px] truncate rounded-md bg-secondary p-1 text-xs">
                {value}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default UserInfo;
