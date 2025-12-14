import {
  CreditCard,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  LucideIcon,
  UserCog,
} from "lucide-react";

type NavLink = {
  title: string;
  path: string;
  icon: LucideIcon;
};

export const NAV_LINKS: NavLink[] = [
  {
    title: "ダッシュボード",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "契約一覧",
    path: "/contracts",
    icon: FileText,
  },
  {
    title: "テンプレート一覧",
    path: "/templates",
    icon: FileSpreadsheet,
  },
  {
    title: "ユーザー情報",
    path: "/user-info",
    icon: UserCog,
  },
  {
    title: "サブスクリプション情報",
    path: "/subscription-info",
    icon: CreditCard,
  },
];
