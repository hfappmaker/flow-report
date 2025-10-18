"use server";

import { Prisma } from "@prisma/client";

import {
  Serialize,
  SerializedType,
} from "@/utils/serialization/serialization-utils";

export interface Test {
  test: string;
  testDate: Date;
  testDecimal: Prisma.Decimal;
  testArray: Prisma.Decimal[];
  testObject: {
    name: string;
    age: Prisma.Decimal;
    isActive: boolean;
  };
}

export const getTestAction = async (): Promise<SerializedType<Test>> => {
  const test = await new Promise<SerializedType<Test>>((resolve) => {
    setTimeout(() => {
      resolve(
        Serialize({
          test: "test",
          testDate: new Date(),
          testDecimal: new Prisma.Decimal(100.555),
          testArray: [new Prisma.Decimal(100.555), new Prisma.Decimal(200.555)],
          testObject: {
            name: "test",
            age: new Prisma.Decimal(100.555),
            isActive: true,
          },
        }),
      );
    }, 1000);
  });
  return test;
};

export const createTestAction = async (test: Test): Promise<void> => {
  console.log(test);
};
