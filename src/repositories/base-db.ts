import { PrismaClient } from "@prisma/client";

const baseDb = new PrismaClient();

export { baseDb };
