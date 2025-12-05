import type { Contract as PrismaContract } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { StrictOmit } from "ts-essentials";

import {
  ContractOutput,
  ContractInput,
} from "@/features/contract/types/contract";
import { db } from "@/repositories/db";
import { type Result, err, ok } from "@/types/result";
import { Serialize } from "@/utils/serialization/serialization-utils";

const transformContractData = (
  values: ContractInput,
): StrictOmit<PrismaContract, "id"> => {
  return {
    ...values,
    unitPrice: values.unitPrice ? new Prisma.Decimal(values.unitPrice) : null,
    settlementMin: values.settlementMin
      ? new Prisma.Decimal(values.settlementMin)
      : null,
    settlementMax: values.settlementMax
      ? new Prisma.Decimal(values.settlementMax)
      : null,
    upperRate: values.upperRate ? new Prisma.Decimal(values.upperRate) : null,
    lowerRate: values.lowerRate ? new Prisma.Decimal(values.lowerRate) : null,
    middleRate: values.middleRate
      ? new Prisma.Decimal(values.middleRate)
      : null,
    hourlyRate: values.hourlyRate
      ? new Prisma.Decimal(values.hourlyRate)
      : null,
    basicStartTime: values.basicStartTime
      ? new Date(values.basicStartTime)
      : null,
    basicEndTime: values.basicEndTime ? new Date(values.basicEndTime) : null,
    basicBreakDuration: values.basicBreakDuration ?? null,
    closingDay: values.closingDay ?? null,
    monthlyWorkMinutes: values.monthlyWorkMinutes ?? null,
    dailyWorkMinutes: values.dailyWorkMinutes ?? null,
    endDate: new Date(values.endDate),
  };
};

function processContractValues(values: StrictOmit<PrismaContract, "id">) {
  const { userId } = values;

  const processedRest = Object.entries(values).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      if (key !== "userId") {
        acc[key] = value;
      }
      return acc;
    },
    {},
  );

  return {
    processedRest,
    userId,
  };
}

export async function getContractsByUserId(
  userId: string,
): Promise<Result<ContractOutput[]>> {
  try {
    const contracts = await db.contract.findMany({
      where: { userId: userId },
      orderBy: { startDate: "desc" },
    });
    return ok(contracts.map(Serialize));
  } catch (error) {
    console.error("Error fetching contracts by user id:", error);
    return err("契約一覧の取得に失敗しました");
  }
}

export async function getContractCountByUserId(
  userId: string,
): Promise<Result<number>> {
  try {
    const count = await db.contract.count({
      where: { userId: userId },
    });
    return ok(count);
  } catch (error) {
    console.error("Error counting contracts by user id:", error);
    return err("契約数の取得に失敗しました");
  }
}

export async function getContractById(
  contractId: string,
): Promise<Result<ContractOutput | null>> {
  try {
    const contract = await db.contract.findUnique({
      where: { id: contractId },
    });
    return ok(contract ? Serialize(contract) : null);
  } catch (error) {
    console.error("Error fetching contract by id:", error);
    return err("契約の取得に失敗しました");
  }
}

export async function createContract(
  values: ContractInput,
): Promise<Result<PrismaContract>> {
  try {
    const { processedRest, userId } = processContractValues(
      transformContractData(values),
    );

    const contract = await db.contract.create({
      data: {
        ...(processedRest as StrictOmit<ContractOutput, "id" | "userId">),
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return ok(contract);
  } catch (error) {
    console.error("Error creating contract:", error);
    return err("契約の作成に失敗しました");
  }
}

export async function searchContracts(
  userId: string,
  searchQuery?: string,
  periodFrom?: string,
  periodTo?: string,
): Promise<Result<ContractOutput[]>> {
  try {
    const whereConditions: Prisma.ContractWhereInput[] = [{ userId: userId }];

    // 契約名とクライアント名のOR検索
    if (searchQuery?.trim()) {
      whereConditions.push({
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { clientName: { contains: searchQuery, mode: "insensitive" } },
        ],
      });
    }

    // 期間重複検索（検索期間と契約期間が重複するもの）
    if (periodFrom || periodTo) {
      const searchStart = periodFrom ? new Date(periodFrom) : null;
      const searchEnd = periodTo ? new Date(periodTo) : null;

      if (searchStart && searchEnd) {
        // 検索期間が指定されている場合：契約期間と重複するもの
        // 契約開始日 <= 検索終了日 AND (契約終了日 >= 検索開始日 OR 契約終了日がnull)
        whereConditions.push({
          AND: [
            { startDate: { lte: searchEnd } },
            { endDate: { gte: searchStart } },
          ],
        });
      } else if (searchStart) {
        // 検索開始日のみ指定：契約が検索開始日以降に重複するもの
        whereConditions.push({ endDate: { gte: searchStart } });
      } else if (searchEnd) {
        // 検索終了日のみ指定：契約が検索終了日以前に重複するもの
        whereConditions.push({ startDate: { lte: searchEnd } });
      }
    }

    const contracts = await db.contract.findMany({
      where: {
        AND: whereConditions,
      },
      orderBy: { startDate: "desc" },
    });
    return ok(contracts.map(Serialize));
  } catch (error) {
    console.error("Error searching contracts:", error);
    return err("契約の検索に失敗しました");
  }
}

export async function updateContract(
  id: string,
  values: ContractInput,
): Promise<Result<void>> {
  try {
    const { processedRest, userId } = processContractValues(
      transformContractData(values),
    );

    await db.contract.update({
      where: { id },
      data: {
        ...(processedRest as StrictOmit<ContractOutput, "id" | "userId">),
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return ok(undefined);
  } catch (error) {
    console.error("Error updating contract:", error);
    return err("契約の更新に失敗しました");
  }
}

export async function deleteContract(id: string): Promise<Result<void>> {
  try {
    await db.contract.delete({
      where: { id },
    });
    return ok(undefined);
  } catch (error) {
    console.error("Error deleting contract:", error);
    return err("契約の削除に失敗しました");
  }
}
