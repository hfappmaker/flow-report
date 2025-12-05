import { ContractRateType, TaxInclusiveType, TaxRoundingType } from "@prisma/client";

import { ContractOutput } from "@/features/contract/types/contract";
import { Holiday } from "@/features/holidays/types/holiday";
import { AttendanceDto } from "@/features/work-report/types/attendance";
import { WorkReport } from "@/features/work-report/types/work-report";
import { RenameProperty } from "@/utils/types/type-utils";

export type WorkReportDashboard = Pick<
  WorkReport,
  "id" | "targetDate" | "status"
> & {
  attendances: AttendanceDto[];
};

export type ContractDashboard = RenameProperty<
  Pick<ContractOutput, "name" | "clientName">,
  "name",
  "contractName"
> & {
  workReports: WorkReportDashboard[];
  clientName: string;
  closingDay: number | null;
  unitPrice: number | null;
  settlementMin: number | null;
  settlementMax: number | null;
  rateType: ContractRateType;
  upperRate: number | null;
  lowerRate: number | null;
  middleRate: number | null;
  hourlyRate: number | null;
  taxInclusiveType: TaxInclusiveType;
  taxRoundingType: TaxRoundingType;
  monthlyWorkMinutes: number;
};

export interface ClientDashboard {
  clientName: string;
  contracts: Record<string, ContractDashboard>;
}

export interface DashboardClientPageProps {
  draftWorkReports: Record<string, ContractDashboard>;
  submittedWorkReportsLast3Months: Record<string, ContractDashboard>;
  hasContracts: boolean;
  holidays: Holiday[];
}
