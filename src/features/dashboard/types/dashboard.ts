import { Client } from "@/features/client/types/client";
import { ContractOutput } from "@/features/contract/types/contract";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";
import { WorkReport } from "@/features/work-report/types/work-report";
import { RenameProperty } from "@/utils/types/type-utils";

export type WorkReportDashboard = Pick<
  WorkReport,
  "id" | "targetDate" | "status"
>;

export type ContractDashboard = RenameProperty<
  Pick<ContractOutput, "name">,
  "name",
  "contractName"
> & {
  workReports: WorkReportDashboard[];
};

export type ClientDashboard = RenameProperty<
  Pick<Client, "name">,
  "name",
  "clientName"
> & {
  contracts: Record<string, ContractDashboard>;
};

export type DashboardClientPageProps = {
  draftWorkReports: Record<string, ClientDashboard>;
  submittedWorkReportsLast3Months: Record<string, ClientDashboard>;
  subscriptionInfo: SubscriptionInfo | null;
};
