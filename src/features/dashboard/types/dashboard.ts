import { ContractOutput } from "@/features/contract/types/contract";
import { Holiday } from "@/features/holidays/types/holiday";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";
import { WorkReport } from "@/features/work-report/types/work-report";
import { RenameProperty } from "@/utils/types/type-utils";

export type WorkReportDashboard = Pick<
  WorkReport,
  "id" | "targetDate" | "status"
>;

export type ContractDashboard = RenameProperty<
  Pick<ContractOutput, "name" | "clientName">,
  "name",
  "contractName"
> & {
  workReports: WorkReportDashboard[];
  clientName: string;
};

export interface ClientDashboard {
  clientName: string;
  contracts: Record<string, ContractDashboard>;
}

export interface DashboardClientPageProps {
  draftWorkReports: Record<string, ContractDashboard>;
  submittedWorkReportsLast3Months: Record<string, ContractDashboard>;
  subscriptionInfo: SubscriptionInfo | null;
  hasContracts: boolean;
  holidays: Holiday[];
}
