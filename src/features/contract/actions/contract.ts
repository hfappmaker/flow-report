"use server";

import { revalidatePath } from "next/cache";

import {
  createContract,
  updateContract,
  deleteContract,
  searchContracts,
  getContractsByUserId,
  getContractById,
} from "@/features/contract/repositories/contract-repository";
import {
  ContractOutput,
  ContractInput,
} from "@/features/contract/types/contract";
import { createMonthlyWorkReportsAction } from "@/features/work-report/actions/work-report";

export const createContractAction = async (
  values: ContractInput,
): Promise<void> => {
  const contract = await createContract(values);

  // 契約期間全体の作業報告書を作成
  await createMonthlyWorkReportsAction(
    contract.id,
    new Date(contract.startDate),
    new Date(contract.endDate),
  );

  revalidatePath("/dashboard");
};

export const updateContractAction = async (
  id: string,
  values: ContractInput,
): Promise<void> => {
  await updateContract(id, values);
  revalidatePath("/dashboard");
  revalidatePath(`/contract/${id}`);
};

export const deleteContractAction = async (id: string): Promise<void> => {
  await deleteContract(id);
  revalidatePath("/dashboard");
};

export const searchContractsAction = async (
  userId: string,
  searchQuery?: string,
  periodFrom?: string,
  periodTo?: string,
): Promise<ContractOutput[]> => {
  try {
    const contracts = await searchContracts(
      userId,
      searchQuery,
      periodFrom,
      periodTo,
    );
    return contracts;
  } catch (error) {
    console.error("Error searching contracts:", error);
    throw new Error("Failed to search contracts");
  }
};

export const getContractsByUserIdAction = async (
  userId: string,
): Promise<ContractOutput[]> => {
  try {
    const contracts = await getContractsByUserId(userId);
    return contracts;
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw new Error("Failed to fetch contracts");
  }
};

export const getContractByIdAction = async (
  contractId: string,
): Promise<ContractOutput | null> => {
  try {
    const contract = await getContractById(contractId);
    return contract;
  } catch (error) {
    console.error("Error fetching contract:", error);
    throw new Error("Failed to fetch contract details");
  }
};
