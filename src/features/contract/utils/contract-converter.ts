import { ContractFormValues } from "@/features/contract/components/contract-form";
import {
  ContractOutput,
  ContractInput,
} from "@/features/contract/types/contract";

export const convertContractFormValuesToContract = (
  data: ContractFormValues,
  userId: string,
): ContractInput => {
  return {
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    unitPrice: data.unitPrice?.toString(),
    settlementMin: data.settlementMin?.toString(),
    settlementMax: data.settlementMax?.toString(),
    rateType: data.rateType,
    upperRate: data.upperRate?.toString(),
    lowerRate: data.lowerRate?.toString(),
    middleRate: data.middleRate?.toString(),
    dailyWorkMinutes: data.dailyWorkMinutes,
    monthlyWorkMinutes: data.monthlyWorkMinutes,
    basicStartTime: data.basicStartTime,
    basicEndTime: data.basicEndTime,
    basicBreakDuration: data.basicBreakDuration,
    closingDay: data.closingDay,
    userId,
    clientName: data.clientName,
    clientContactName: data.clientContactName,
    clientEmail: data.clientEmail,
  };
};

export const convertContractToFormValues = (
  contract: ContractOutput,
): ContractFormValues => {
  return {
    name: contract.name,
    startDate: new Date(contract.startDate),
    endDate: contract.endDate ? new Date(contract.endDate) : undefined,
    clientName: contract.clientName,
    clientContactName: contract.clientContactName,
    clientEmail: contract.clientEmail,
    unitPrice: contract.unitPrice ? Number(contract.unitPrice) : undefined,
    settlementMin: contract.settlementMin
      ? Number(contract.settlementMin)
      : undefined,
    settlementMax: contract.settlementMax
      ? Number(contract.settlementMax)
      : undefined,
    rateType: contract.rateType,
    upperRate: contract.upperRate ? Number(contract.upperRate) : undefined,
    lowerRate: contract.lowerRate ? Number(contract.lowerRate) : undefined,
    middleRate: contract.middleRate ? Number(contract.middleRate) : undefined,
    dailyWorkMinutes: contract.dailyWorkMinutes ?? undefined,
    monthlyWorkMinutes: contract.monthlyWorkMinutes ?? undefined,
    basicStartTime: contract.basicStartTime
      ? new Date(contract.basicStartTime)
      : undefined,
    basicEndTime: contract.basicEndTime
      ? new Date(contract.basicEndTime)
      : undefined,
    basicBreakDuration: contract.basicBreakDuration ?? undefined,
    closingDay: contract.closingDay ?? undefined,
  };
};
