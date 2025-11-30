import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.PRISMA_DATABASE_URL,
});

const baseDb = new PrismaClient({ adapter });

export { baseDb };
