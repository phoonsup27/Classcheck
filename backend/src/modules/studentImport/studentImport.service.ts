import * as XLSX from "xlsx";
import { prisma } from "../../../lib/prisma";

export class StudentImportService {
  static async importExcel(
    buffer: Buffer,
    classroomId: bigint
  ) {
    const workbook = XLSX.read(buffer);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    if (rows.length === 0) {
      throw new Error("ไม่พบข้อมูลในไฟล์ Excel");
    }

    // ตรวจสอบ Header
    const headers = Object.keys(rows[0]);

    const requiredHeaders = [
      // "เลขที่",
      "เลขประจำตัว",
      "ชื่อ-สกุล",
    ];

    for (const header of requiredHeaders) {
      if (!headers.includes(header)) {
        throw new Error(`ไม่พบคอลัมน์ "${header}"`);
      }
    }

    // ตรวจสอบห้องเรียน
    const classroom = await prisma.classroom.findUnique({
      where: {
        id: classroomId,
      },
    });

    if (!classroom) {
      throw new Error("ไม่พบห้องเรียน");
    }

    const students: any[] = [];

    for (const row of rows) {
      if (!row["เลขประจำตัว"]) continue;

      students.push({
        studentCode: row["เลขประจำตัว"].toString().trim(),

        studentNumber: row["เลขที่"] ? Number(row["เลขที่"]) : null,

        fullName: row["ชื่อ-สกุล"].toString().trim(),

        classroomId,

        classroomName: classroom.classroomName, // 👈 เพิ่มบรรทัดนี้ลงไปเพื่อบันทึกชื่อห้องเรียน

        status: true,
      });
    }

    if (students.length === 0) {
      throw new Error("ไม่พบข้อมูลนักเรียน");
    }

    // ตรวจสอบรหัสนักเรียนซ้ำ
    const studentCodes = students.map((s) => s.studentCode);

    const duplicate = await prisma.student.findMany({
      where: {
        studentCode: {
          in: studentCodes,
        },
      },
    });

    if (duplicate.length > 0) {
      throw new Error(
        `พบรหัสนักเรียนซ้ำในระบบ ${duplicate.length} คน`
      );
    }

    return await prisma.student.createMany({
      data: students,
    });
  }
}