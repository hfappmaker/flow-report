import type { Attendance as PrismaAttendance } from "@prisma/client";
import type { StrictOmit } from "ts-essentials";

import type { SerializedType } from "@/utils/serialization/serialization-utils";

export type AttendanceDto = SerializedType<StrictOmit<PrismaAttendance, "id">>;

export type AttendanceData = StrictOmit<AttendanceDto, "workReportId">;
