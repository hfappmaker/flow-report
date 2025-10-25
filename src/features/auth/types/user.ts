import type { User as PrismaUser } from "@prisma/client";

import type { SerializedType } from "@/utils/serialization/serialization-utils";

export type User = SerializedType<PrismaUser>;
