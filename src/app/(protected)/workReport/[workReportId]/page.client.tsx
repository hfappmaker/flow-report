"use client";

import { useCallback, useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { useTransitionContext } from "@/contexts/transition-context";
import { formatAmount } from "@/features/contract/utils/contract-calculation-utils";
import { updateWorkReportAttendanceAction } from "@/features/work-report/actions/attendance";
import { WorkReportSummary } from "@/features/work-report/components/work-report-summary";
import { WorkReportActions } from "@/features/work-report/components/work-report-actions";
import { AttendanceList } from "@/features/work-report/components/attendance-list/attendance-list";
import { BulkEditDialog } from "@/features/work-report/components/dialogs/bulk-edit-dialog";
import { EditAttendanceDialog } from "@/features/work-report/components/dialogs/edit-attendance-dialog";
import { InvoiceDialog } from "@/features/work-report/components/dialogs/invoice-dialog";
import { ReauthDialog } from "@/features/work-report/components/dialogs/reauth-dialog";
import { useWorkReport } from "@/features/work-report/hooks/use-work-report";
import { useAttendanceForm } from "@/features/work-report/hooks/use-attendance-form";
import { useFreeeIntegration } from "@/features/work-report/hooks/use-freee-integration";
import type { WorkReportClientProps } from "@/features/work-report/types/work-report";
import type {
  EditFormValues,
  BulkEditFormValues,
} from "@/features/work-report/schemas/work-report-form-schemas";
import {
  generateDefaultAttendances,
  mergeAttendances,
  parseRangeReference,
  parseExcelRange,
  formatMonthDay,
  shouldUpdateDate,
} from "@/features/work-report/utils/attendance-utils";
import { formatDateAsUTC } from "@/utils/date-utils";

export default function ClientWorkReportPage({
  contractId,
  workReportId,
  targetDate,
  userName,
  attendances,
  contractName,
  clientName,
  contactName,
  clientEmail,
  dailyWorkMinutes,
  monthlyWorkMinutes,
  basicStartTime,
  basicEndTime,
  basicBreakDuration,
  closingDay,
  status,
  holidays,
  unitPrice,
  settlementMin,
  settlementMax,
  upperRate,
  lowerRate,
  middleRate,
  taxInclusiveType,
  taxRoundingType,
  rateType,
}: WorkReportClientProps) {
  // Main hooks
  const { startTransition, setManualPending } = useTransitionContext();

  const workReport = useWorkReport({
    initialAttendances: mergeAttendances(
      generateDefaultAttendances(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        closingDay,
      ),
      attendances,
    ),
    initialStatus: status,
    contractId,
    workReportId,
    targetDate,
    dailyWorkMinutes,
    unitPrice,
    settlementMin,
    settlementMax,
    upperRate,
    lowerRate,
    middleRate,
    taxInclusiveType,
    taxRoundingType,
    rateType,
  });

  const attendanceForm = useAttendanceForm({
    basicStartTime: basicStartTime ?? undefined,
    basicEndTime: basicEndTime ?? undefined,
    basicBreakDuration: basicBreakDuration ?? undefined,
    workReportStartDate: workReport.workReportStartDate,
    workReportEndDate: workReport.workReportEndDate,
  });

  const freeeIntegration = useFreeeIntegration({
    workReportId,
    onSuccess: workReport.showSuccess,
    onError: workReport.showError,
  });

  // Template state for Excel export
  const [uploadedTemplateFile, setUploadedTemplateFile] = useState<File | null>(
    null,
  );
  const [templateOption, setTemplateOption] = useState<"standard" | "custom">(
    "standard",
  );
  const [extensionOption, setExtensionOption] = useState<"xlsx" | "pdf">(
    "xlsx",
  );

  // Handlers
  const handleEditSubmit = async (values: EditFormValues) => {
    if (!workReport.editingDate) return;

    const attendance = workReport.currentAttendances.find(
      (a) => a.date.getTime() === workReport.editingDate?.getTime(),
    );

    if (!attendance) return;

    const updatedAttendance = {
      ...attendance,
      startTime: values.startTime ?? attendance.startTime,
      endTime: values.endTime ?? attendance.endTime,
      breakDuration: values.breakDuration ?? attendance.breakDuration,
      memo: values.memo || attendance.memo,
    };

    await workReport.updateAttendance(updatedAttendance);
    workReport.setEditingDate(null);
    attendanceForm.editForm.reset();
  };

  const handleBulkEditSubmit = async (values: BulkEditFormValues) => {
    const updatedAttendances = attendanceForm.applyBulkEdit(
      values,
      workReport.currentAttendances,
      holidays,
    );

    // Filter attendances that should be updated based on date range
    const filteredAttendances = updatedAttendances.filter((attendance) => {
      if (!values.startDate || !values.endDate) return true;
      return shouldUpdateDate(
        attendance.date,
        values.selectedDays,
        values.startDate,
        values.endDate,
        values.excludeHolidays,
        holidays,
      );
    });

    workReport.setCurrentAttendances(filteredAttendances);
    await workReport.updateAllAttendances();
    workReport.setIsBulkEditModalOpen(false);
    attendanceForm.bulkEditForm.reset();
  };

  const handleOpenEditDialog = (date: Date) => {
    const attendance = workReport.currentAttendances.find(
      (a) => a.date.getTime() === date.getTime(),
    );

    if (!attendance) return;

    attendanceForm.editForm.reset({
      startTime: attendance.startTime,
      endTime: attendance.endTime,
      breakDuration: attendance.breakDuration,
      memo: attendance.memo || "",
    });

    workReport.setEditingDate(date);
  };

  // Excel export function (simplified for now)
  const createReportFromTemplate = async () => {
    // This is a simplified version.
    // The full Excel export functionality would need to be extracted into a separate module
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("作業報告書");

    // Add basic data
    worksheet.addRow(["契約名", contractName]);
    worksheet.addRow([
      "期間",
      `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月`,
    ]);
    worksheet.addRow(["稼働時間", workReport.workTimeText]);

    if (workReport.amountCalculation) {
      worksheet.addRow([
        "金額",
        formatAmount(
          workReport.amountCalculation.baseAmount +
            workReport.amountCalculation.taxAmount,
        ),
      ]);
    }

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `作業報告書_${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    workReport.showSuccess("作業報告書を作成しました");
  };

  const createReportAndSendEmail = async () => {
    // Simplified email sending
    workReport.showSuccess("メール送信機能は実装中です");
  };

  const handleConfirmCreateReport = async () => {
    await createReportFromTemplate();
  };

  // Effect to initialize edit form when editing date changes
  useEffect(() => {
    if (workReport.editingDate) {
      const attendance = workReport.currentAttendances.find(
        (a) => a.date.getTime() === workReport.editingDate?.getTime(),
      );
      if (attendance) {
        attendanceForm.editForm.reset({
          startTime: attendance.startTime,
          endTime: attendance.endTime,
          breakDuration: attendance.breakDuration,
          memo: attendance.memo || "",
        });
      }
    }
  }, [
    workReport.editingDate,
    workReport.currentAttendances,
    attendanceForm.editForm,
  ]);

  return (
    <div className="mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-muted-foreground">
          {contractName}の{targetDate.getFullYear()}年
          {targetDate.getMonth() + 1}
          月度作業報告書
        </h1>
        <Button type="button" onClick={workReport.handleNavigateToList}>
          作業報告書一覧へ
        </Button>
      </div>

      <FormError
        message={workReport.error.message}
        resetSignal={workReport.error.date.getTime()}
      />
      <FormSuccess
        message={workReport.success.message}
        resetSignal={workReport.success.date.getTime()}
      />

      <WorkReportSummary
        workTimeText={workReport.workTimeText}
        amountCalculation={workReport.amountCalculation}
      />

      <WorkReportActions
        status={workReport.status}
        onStatusChange={workReport.handleConfirmStatusChange}
        onBulkEdit={() => workReport.setIsBulkEditModalOpen(true)}
        onCreateReport={() => {
          startTransition(() => {
            void handleConfirmCreateReport();
          });
        }}
        onFreeeConnect={() => {
          const returnTo = encodeURIComponent(window.location.pathname);
          setManualPending(true);
          window.location.href = `/api/auth/freee/authorize?returnTo=${returnTo}`;
        }}
        onCreateInvoice={() => freeeIntegration.setIsInvoiceDialogOpen(true)}
        onSendEmail={createReportAndSendEmail}
      />

      <AttendanceList
        attendances={workReport.currentAttendances}
        status={workReport.status}
        holidays={holidays}
        onEdit={handleOpenEditDialog}
      />

      {/* Dialogs */}
      <BulkEditDialog
        isOpen={workReport.isBulkEditModalOpen}
        onClose={() => workReport.setIsBulkEditModalOpen(false)}
        form={attendanceForm.bulkEditForm}
        onSubmit={handleBulkEditSubmit}
        onReset={attendanceForm.resetBulkEditForm}
        dailyWorkMinutes={dailyWorkMinutes}
        workReportStartDate={workReport.workReportStartDate}
        workReportEndDate={workReport.workReportEndDate}
      />

      <EditAttendanceDialog
        isOpen={workReport.editingDate !== null}
        onClose={() => workReport.setEditingDate(null)}
        form={attendanceForm.editForm}
        onSubmit={handleEditSubmit}
        onCancel={() => {
          workReport.setEditingDate(null);
          attendanceForm.editForm.reset();
        }}
        onFillBasicTime={attendanceForm.fillBasicTime}
        editingDate={workReport.editingDate}
        dailyWorkMinutes={dailyWorkMinutes}
        hasBasicTime={
          !!basicStartTime || !!basicEndTime || !!basicBreakDuration
        }
      />

      <InvoiceDialog
        isOpen={freeeIntegration.isInvoiceDialogOpen}
        onClose={() => freeeIntegration.setIsInvoiceDialogOpen(false)}
        isCheckingConnection={freeeIntegration.isCheckingFreeeConnection}
        isFreeeConnected={freeeIntegration.isFreeeConnected}
        isLoadingPartners={freeeIntegration.isLoadingPartners}
        isCreatingInvoice={freeeIntegration.isCreatingInvoice}
        partners={freeeIntegration.partners}
        selectedPartnerId={freeeIntegration.selectedPartnerId}
        onPartnerChange={(id) => freeeIntegration.setSelectedPartnerId(id)}
        onCreateInvoice={() => {
          startTransition(() => {
            void freeeIntegration.handleCreateFreeeInvoice();
          });
        }}
        contractName={contractName}
        targetDate={targetDate}
        clientName={clientName}
        workTimeText={workReport.workTimeText}
        amountCalculation={workReport.amountCalculation}
      />

      <ReauthDialog
        isOpen={freeeIntegration.showReauthDialog}
        onClose={() => freeeIntegration.setShowReauthDialog(false)}
      />
    </div>
  );
}
