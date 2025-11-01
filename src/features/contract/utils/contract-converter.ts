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
    unitPrice: data.unitPrice?.toString() ?? null,
    settlementMin: data.settlementMin?.toString() ?? null,
    settlementMax: data.settlementMax?.toString() ?? null,
    rateType: data.rateType,
    upperRate: data.upperRate?.toString() ?? null,
    lowerRate: data.lowerRate?.toString() ?? null,
    middleRate: data.middleRate?.toString() ?? null,
    dailyWorkMinutes: data.dailyWorkMinutes,
    monthlyWorkMinutes: data.monthlyWorkMinutes,
    basicStartTime: data.basicStartTime,
    basicEndTime: data.basicEndTime,
    basicBreakDuration: data.basicBreakDuration,
    closingDay: data.closingDay,
    taxInclusiveType: data.taxInclusiveType,
    taxRoundingType: data.taxRoundingType,
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
    endDate: contract.endDate ? new Date(contract.endDate) : null,
    clientName: contract.clientName,
    clientContactName: contract.clientContactName,
    clientEmail: contract.clientEmail,
    unitPrice: contract.unitPrice ? Number(contract.unitPrice) : null,
    settlementMin: contract.settlementMin
      ? Number(contract.settlementMin)
      : null,
    settlementMax: contract.settlementMax
      ? Number(contract.settlementMax)
      : null,
    rateType: contract.rateType,
    upperRate: contract.upperRate ? Number(contract.upperRate) : null,
    lowerRate: contract.lowerRate ? Number(contract.lowerRate) : null,
    middleRate: contract.middleRate ? Number(contract.middleRate) : null,
    dailyWorkMinutes: contract.dailyWorkMinutes ?? null,
    monthlyWorkMinutes: contract.monthlyWorkMinutes ?? null,
    basicStartTime: contract.basicStartTime
      ? new Date(contract.basicStartTime)
      : null,
    basicEndTime: contract.basicEndTime
      ? new Date(contract.basicEndTime)
      : null,
    basicBreakDuration: contract.basicBreakDuration ?? null,
    closingDay: contract.closingDay ?? null,
    taxInclusiveType: contract.taxInclusiveType,
    taxRoundingType: contract.taxRoundingType,
  };
};
