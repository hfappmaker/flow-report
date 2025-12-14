import type { EmailTemplate as PrismaEmailTemplate } from "@prisma/client";
import type { StrictOmit } from "ts-essentials";

export type EmailTemplate = StrictOmit<
  PrismaEmailTemplate,
  "createdAt" | "updatedAt"
>;
