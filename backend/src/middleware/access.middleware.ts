import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FULL = ["Admin", "Director"];
const MANAGE = [...FULL, "ViceDirector"];
const ALL = [...MANAGE, "Teacher"];

const rules = [
  {
    name: "admin",
    match: /\/(users|roles|settings)(\/|$)/i,
    read: FULL,
    write: FULL,
  },
  {
    name: "attendance",
    match: /\/attendance(s)?(\/|$)/i,
    read: ALL,
    write: ALL,
  },
  {
    name: "report",
    match: /\/reports?(\/|$)/i,
    read: MANAGE,
    write: MANAGE,
  },
  {
    name: "import",
    match: /\/(student-?import|teacher-?import)(\/|$)/i,
    read: MANAGE,
    write: MANAGE,
  },
  {
    name: "basic",
    match:
      /\/(students|teachers|classrooms|subjects|schedules|school-?years|semesters)(\/|$)/i,
    read: ALL,
    write: MANAGE,
  },
];

export async function accessControl(
  req: any,
  res: any,
  next: any
) {
  try {
    const role = req.user?.role;
    const requestPath = req.originalUrl.split("?")[0];
    const isRead = req.method === "GET";

    const rule = rules.find((r) => r.match.test(requestPath));

    const allowed = rule
      ? isRead
        ? rule.read
        : rule.write
      : FULL;

    if (!role) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!allowed.includes(role)) {
      return res.status(403).json({
        message: "ไม่มีสิทธิ์ใช้งานส่วนนี้",
      });
    }

    if (
      role === "Teacher" &&
      rule?.name === "attendance" &&
      !isRead
    ) {
      const scheduleId = req.body?.scheduleId;

      if (scheduleId) {
        const schedule = await prisma.schedule.findUnique({
          where: {
            id: BigInt(scheduleId),
          },
          select: {
            teacherId: true,
          },
        });

        if (
          !schedule ||
          Number(schedule.teacherId) !== Number(req.user.teacherId)
        ) {
          return res.status(403).json({
            message: "เช็คชื่อได้เฉพาะคาบที่ตัวเองสอน",
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error("accessControl error:", error);

    return res.status(500).json({
      message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์",
    });
  }
}