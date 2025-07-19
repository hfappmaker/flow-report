import { Contract as PrismaContract, Prisma } from "@prisma/client";
import { StrictOmit } from "ts-essentials";

import {
  ContractOutput,
  ContractInput,
} from "@/features/contract/types/contract";
import { db } from "@/repositories/db";
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
    basicStartTime: values.basicStartTime
      ? new Date(values.basicStartTime)
      : null,
    basicEndTime: values.basicEndTime ? new Date(values.basicEndTime) : null,
    basicBreakDuration: values.basicBreakDuration
      ? Number(values.basicBreakDuration)
      : null,
    closingDay: values.closingDay ? Number(values.closingDay) : null,
    monthlyWorkMinutes: values.monthlyWorkMinutes
      ? Number(values.monthlyWorkMinutes)
      : null,
    dailyWorkMinutes: values.dailyWorkMinutes
      ? Number(values.dailyWorkMinutes)
      : null,
    endDate: values.endDate ? new Date(values.endDate) : null,
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

export async function getContractsByUserId(userId: string) {
  const contracts = await db.contract.findMany({
    where: { userId: userId },
  });
  return contracts.map(Serialize);
}


export async function getContractById(contractId: string) {
  const contract = await db.contract.findUnique({
    where: { id: contractId },
  });
  return contract ? Serialize(contract) : null;
}

export async function createContract(values: ContractInput) {
  const { processedRest, userId } = processContractValues(
    transformContractData(values),
  );

  const contract = await db.contract.create({
    data: {
      ...(processedRest as StrictOmit<
        ContractOutput,
        "id" | "userId"
      >),
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });


  return contract;
}

export async function searchContracts(userId: string, searchQuery: string) {
  const contracts = await db.contract.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { clientName: { contains: searchQuery, mode: "insensitive" } },
          ],
        },
        { userId: userId },
      ],
    },
  });
  return contracts.map(Serialize);
}

export async function updateContract(id: string, values: ContractInput) {
  const { processedRest, userId } = processContractValues(
    transformContractData(values),
  );

  await db.contract.update({
    where: { id },
    data: {
      ...(processedRest as StrictOmit<
        ContractOutput,
        "id" | "userId"
      >),
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function deleteContract(id: string) {
  await db.contract.delete({
    where: { id },
  });
}
