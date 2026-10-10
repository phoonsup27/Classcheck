import { prisma } from "../../../lib/prisma";

export class ReportService {
  static async getSummaryReport(year?: number, semesterNum?: number) {
    let semesterIdFilter: bigint | undefined = undefined;

    // หากมีการส่งค่ามา ให้ดึง Semester ตามเงื่อนไขที่มีอยู่จริงในระบบ
    if (year || semesterNum) {
      const targetSemester = await prisma.semester.findFirst({
        orderBy: { id: "desc" }, // ดึงภาคเรียนล่าสุดเป็นค่าสำรอง
      });
      if (targetSemester) {
        semesterIdFilter = targetSemester.id;
      }
    }

    // ดึงจำนวนนับแบบ Parallel
    const [students, teachers, classrooms, totalAttendance, presentAttendance] =
      await Promise.all([
        prisma.student.count(),
        prisma.teacher.count(),
        prisma.classroom.count(),
        prisma.attendance.count({
          where: semesterIdFilter
            ? { schedule: { semesterId: semesterIdFilter } }
            : {},
        }),
        prisma.attendance.count({
          where: {
            status: { in: ["PRESENT", "มาเรียน", "มา"] },
            ...(semesterIdFilter
              ? { schedule: { semesterId: semesterIdFilter } }
              : {}),
          },
        }),
      ]);

    const attendanceRate =
      totalAttendance > 0
        ? `${((presentAttendance / totalAttendance) * 100).toFixed(1)}%`
        : "0%";

    return {
      students,
      teachers,
      classrooms,
      attendanceRate,
    };
  }

  static async getRecentAttendance(limit: number = 20) {
    return await prisma.attendance.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        schedule: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }
}