import { prisma } from "../../../lib/prisma";

export interface AuthUser {
  userId: number;
  role: string;
  teacherId: number | null;
}

const MANAGE = ["Admin", "Director", "ViceDirector"];

function fail(status: number, message: string): never {
  const err: any = new Error(message);
  err.status = status;
  throw err;
}

// ครูใช้ได้เฉพาะคาบสอนของตัวเอง ส่วนผู้บริหารใช้ได้ทุกคาบ
async function assertCanUseSchedule(scheduleId: bigint, user: AuthUser) {
  const s = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    select: { teacherId: true },
  });
  if (!s) fail(404, "ไม่พบตารางเรียน");
  if (!MANAGE.includes(user.role) && Number(s.teacherId) !== user.teacherId) {
    fail(403, "ทำรายการได้เฉพาะคาบที่ตัวเองสอน");
  }
}

function toItems(data: any) {
  const items = data.records || data.details || [];
  if (!Array.isArray(items) || items.length === 0) {
    fail(400, "ไม่มีรายชื่อนักเรียนสำหรับเช็คชื่อ");
  }
  return items.map((r: any) => {
    if (!r.studentId || !r.status) fail(400, "ข้อมูลนักเรียนไม่ครบ (studentId, status)");
    return { studentId: BigInt(r.studentId), status: String(r.status), remark: r.remark ?? null };
  });
}

export class AttendanceService {
  static async create(data: any, user: AuthUser) {
    const { attendanceDate, scheduleId, subjectId, classroomId } = data;
    if (!attendanceDate) fail(400, "ระบุวันที่เช็คชื่อ");

    // 1. หา Schedule ที่แท้จริง
    let targetScheduleId = scheduleId;

    if (!targetScheduleId && subjectId) {
      const schedule = await prisma.schedule.findFirst({
        where: {
          subjectId: BigInt(subjectId),
          isActive: true,
          // ครูค้นหาได้เฉพาะคาบของตัวเอง กันไปเจอคาบของครูคนอื่น
          ...(MANAGE.includes(user.role) ? {} : { teacherId: BigInt(user.teacherId ?? 0) }),
          ...(classroomId ? { classroomId: BigInt(classroomId) } : {}),
        },
      });
      if (!schedule) {
        fail(404, "ไม่พบตารางเรียน (Schedule) สำหรับวิชานี้ กรุณาเข้าไปเพิ่มข้อมูลในเมนูตารางเรียนก่อน");
      }
      targetScheduleId = schedule.id;
    }

    if (!targetScheduleId) fail(400, "ไม่สามารถระบุตารางเรียนได้ (Missing Schedule ID)");

    await assertCanUseSchedule(BigInt(targetScheduleId), user);

    const items = toItems(data);

    // 2. บันทึกข้อมูล (checkedBy มาจากผู้ที่ล็อกอิน ไม่รับจากหน้าเว็บ)
    try {
      return await prisma.attendance.create({
        data: {
          attendanceDate: new Date(attendanceDate),
          scheduleId: BigInt(targetScheduleId),
          checkedBy: BigInt(user.userId),
          details: { create: items },
        },
        include: { details: true, schedule: true },
      });
    } catch (e: any) {
      if (e.code === "P2002") fail(409, "คาบนี้เช็คชื่อของวันนี้ไปแล้ว ให้เปิดรายการเดิมเพื่อแก้ไข");
      throw e;
    }
  }

  static async getAll(user: AuthUser) {
    let where = {};
    if (!MANAGE.includes(user.role)) {
      if (!user.teacherId) return [];
      where = { schedule: { teacherId: BigInt(user.teacherId) } };
    }
    return await prisma.attendance.findMany({
      where,
      orderBy: { id: "asc" },
      include: {
        details: true,
        schedule: { include: { subject: true } },
      },
    });
  }

  static async getById(id: bigint, user: AuthUser) {
    const att = await prisma.attendance.findUnique({
      where: { id },
      include: { details: true, schedule: true },
    });
    if (!att) return null;
    await assertCanUseSchedule(att.scheduleId, user);
    return att;
  }

  static async update(id: bigint, data: any, user: AuthUser) {
    const existing = await prisma.attendance.findUnique({ where: { id } });
    if (!existing) fail(404, "ไม่พบรายการเช็คชื่อ");
    await assertCanUseSchedule(existing.scheduleId, user);

    const { attendanceDate, scheduleId } = data;
    if (scheduleId) await assertCanUseSchedule(BigInt(scheduleId), user);

    const hasItems = data.records || data.details;
    const items = hasItems ? toItems(data) : null;

    return await prisma.$transaction(async (tx) => {
      // แก้สถานะนักเรียน: ลบของเดิมแล้วใส่ชุดใหม่
      if (items) {
        await tx.attendanceDetail.deleteMany({ where: { attendanceId: id } });
        await tx.attendanceDetail.createMany({
          data: items.map((i: any) => ({ ...i, attendanceId: id })),
        });
      }
      return tx.attendance.update({
        where: { id },
        data: {
          ...(attendanceDate && { attendanceDate: new Date(attendanceDate) }),
          ...(scheduleId && { scheduleId: BigInt(scheduleId) }),
        },
        include: { details: true },
      });
    });
  }

  static async delete(id: bigint, user: AuthUser) {
    if (!MANAGE.includes(user.role)) fail(403, "เฉพาะผู้บริหารเท่านั้นที่ลบรายการเช็คชื่อได้");
    // ต้องลบรายละเอียดก่อน ไม่เช่นนั้นติด foreign key
    return await prisma.$transaction([
      prisma.attendanceDetail.deleteMany({ where: { attendanceId: id } }),
      prisma.attendance.delete({ where: { id } }),
    ]);
  }
}
