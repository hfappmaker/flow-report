"use server";

import { revalidatePath } from "next/cache";

import {
  createContract,
  updateContract,
  deleteContract,
  searchContracts,
  getContractsByUserId,
  getContractById,
  getContractCountByUserId,
} from "@/features/contract/repositories/contract-repository";
import {
  ContractOutput,
  ContractInput,
} from "@/features/contract/types/contract";
import { createMonthlyWorkReportsAction } from "@/features/work-report/actions/work-report";

export const createContractAction = async (
  values: ContractInput,
): Promise<{ success: true } | { success: false; error: string }> => {
  // 契約数の上限チェック（最大20個）
  const countResult = await getContractCountByUserId(values.userId);
  if (!countResult.success) {
    return { success: false, error: countResult.error };
  }
  if (countResult.data >= 20) {
    return {
      success: false,
      error:
        "契約の最大登録数（20個）に達しています。新しい契約を作成するには、既存の契約を削除してください。",
    };
  }

  const contractResult = await createContract(values);
  if (!contractResult.success) {
    return { success: false, error: contractResult.error };
  }

  const contract = contractResult.data;

  // 契約期間全体の作業報告書を作成
  await createMonthlyWorkReportsAction(
    contract.id,
    new Date(contract.startDate),
    new Date(contract.endDate),
  );

  revalidatePath("/dashboard");
  return { success: true };
};

export const updateContractAction = async (
  id: string,
  values: ContractInput,
): Promise<{ success: true } | { success: false; error: string }> => {
  const result = await updateContract(id, values);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  revalidatePath("/dashboard");
  revalidatePath(`/contract/${id}`);
  return { success: true };
};

export const deleteContractAction = async (
  id: string,
): Promise<{ success: true } | { success: false; error: string }> => {
  const result = await deleteContract(id);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  revalidatePath("/dashboard");
  return { success: true };
};

export const searchContractsAction = async (
  userId: string,
  searchQuery?: string,
  periodFrom?: string,
  periodTo?: string,
): Promise<
  { success: true; data: ContractOutput[] } | { success: false; error: string }
> => {
  const result = await searchContracts(
    userId,
    searchQuery,
    periodFrom,
    periodTo,
  );
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
};

export const getContractsByUserIdAction = async (
  userId: string,
): Promise<
  { success: true; data: ContractOutput[] } | { success: false; error: string }
> => {
  const result = await getContractsByUserId(userId);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
};

export const getContractByIdAction = async (
  contractId: string,
): Promise<
  | { success: true; data: ContractOutput | null }
  | { success: false; error: string }
> => {
  const result = await getContractById(contractId);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
};
