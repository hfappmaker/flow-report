import type { WorkReportStatus } from "@prisma/client";

export const getWorkReportStatusColor = (status: WorkReportStatus): string => {
  switch (status) {
    case "DRAFT":
      return "bg-yellow-200 text-yellow-800";
    case "SUBMITTED":
      return "bg-blue-200 text-blue-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

export const getWorkReportStatusDisplayText = (
  status: WorkReportStatus,
): string => {
  switch (status) {
    case "DRAFT":
      return "作成中";
    case "SUBMITTED":
      return "作成完了";
    default:
      return status;
  }
};
