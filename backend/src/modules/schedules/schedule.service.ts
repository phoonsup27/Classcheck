import { prisma } from "../../../lib/prisma";

// ฟังก์ชันแปลงข้อความเวลา (เช่น "08:30 AM", "08:30", "08:30:00" หรือ ISO String) เป็น Date Object
const parseTimeToDate = (timeStr: string | Date): Date => {
  if (timeStr instanceof Date) return timeStr;

  if (timeStr.includes("T")) {
    return new Date(timeStr);
  }

  // ปรับการอ่านค่ากรณีส่งมาเป็น AM/PM เช่น "08:30 AM"
  let cleanTime = timeStr.trim();
  let hours = 0;
  let minutes = 0;

  const isPM = cleanTime.toUpperCase().includes("PM");
  const isAM = cleanTime.toUpperCase().includes("AM");

  if (isAM || isPM) {
    cleanTime = cleanTime.replace(/(AM|PM)/i, "").trim();
  }

  const timeParts = cleanTime.split(":");
  hours = parseInt(timeParts[0], 10) || 0;
  minutes = parseInt(timeParts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  const date = new Date("1970-01-01T00:00:00.000Z");
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
};

export class ScheduleService {
  static async create(data: any) {
    const {
      teacherId,
      subjectId,
      classroomId,
      semesterId,
      dayOfWeek,
      period,
      startTime,
      endTime,
      isActive,
    } = data;

    return await prisma.schedule.create({
      data: {
        teacherId: BigInt(teacherId),
        subjectId: BigInt(subjectId),
        classroomId: BigInt(classroomId),
        semesterId: BigInt(semesterId),
        dayOfWeek: Number(dayOfWeek),
        period: Number(period),
        startTime: parseTimeToDate(startTime),
        endTime: parseTimeToDate(endTime),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: {
        teacher: true,
        subject: true,
        classroom: true,
        semester: true,
      },
    });
  }

  // เพิ่มพารามิเตอร์ teacherId สำหรับรองรับ Query Filter
  static async getAll(teacherId?: string) {
    return await prisma.schedule.findMany({
      where: teacherId ? { teacherId: BigInt(teacherId) } : {},
      orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
      include: {
        teacher: true,
        subject: true,
        classroom: true,
        semester: true,
      },
    });
  }

  static async getById(id: bigint) {
    return await prisma.schedule.findUnique({
      where: { id },
      include: {
        teacher: true,
        subject: true,
        classroom: true,
        semester: true,
      },
    });
  }

  static async update(id: bigint, data: any) {
    const {
      teacherId,
      subjectId,
      classroomId,
      semesterId,
      dayOfWeek,
      period,
      startTime,
      endTime,
      isActive,
    } = data;

    return await prisma.schedule.update({
      where: { id },
      data: {
        ...(teacherId && { teacherId: BigInt(teacherId) }),
        ...(subjectId && { subjectId: BigInt(subjectId) }),
        ...(classroomId && { classroomId: BigInt(classroomId) }),
        ...(semesterId && { semesterId: BigInt(semesterId) }),
        ...(dayOfWeek !== undefined && { dayOfWeek: Number(dayOfWeek) }),
        ...(period !== undefined && { period: Number(period) }),
        ...(startTime && { startTime: parseTimeToDate(startTime) }),
        ...(endTime && { endTime: parseTimeToDate(endTime) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: {
        teacher: true,
        subject: true,
        classroom: true,
        semester: true,
      },
    });
  }

  static async delete(id: bigint) {
    return await prisma.schedule.delete({
      where: { id },
    });
  }
}