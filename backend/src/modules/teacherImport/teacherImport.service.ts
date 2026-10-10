import * as XLSX from "xlsx";
import { prisma } from "../../../lib/prisma";

export class TeacherImportService {
  static async importExcel(buffer: Buffer) {
    // อ่านไฟล์ Excel
    const workbook = XLSX.read(buffer);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    if (rows.length === 0) {
      throw new Error("ไม่พบข้อมูลในไฟล์ Excel");
    }

    // ตรวจสอบ Header
    const headers = Object.keys(rows[0]);

    const requiredHeaders = [
      "ชื่อ-นามสกุล",
      "ตำแหน่ง",
      "เลขที่บัตรประชาชน",
      "เบอร์โทร",
    ];

    for (const header of requiredHeaders) {
      if (!headers.includes(header)) {
        throw new Error(`ไม่พบคอลัมน์ "${header}"`);
      }
    }

    // หา teacherCode ล่าสุด
    const lastTeacher = await prisma.teacher.findFirst({
      orderBy: {
        id: "desc",
      },
    });

    let running = 0;

    if (lastTeacher) {
      running = Number(lastTeacher.teacherCode.replace("T", ""));
    }

    const teachers: any[] = [];

    for (const row of rows) {
      // ข้ามแถวว่าง
      if (!row["ชื่อ-นามสกุล"]) continue;

      running++;

      teachers.push({
        teacherCode: `T${String(running).padStart(5, "0")}`,
        fullName: row["ชื่อ-นามสกุล"].toString().trim(),
        position: row["ตำแหน่ง"]?.toString().trim() || "ครู",
        nationalId:
          row["เลขที่บัตรประชาชน"]?.toString().trim() || null,
        phone:
          row["เบอร์โทร"]?.toString().trim() || null,
      });
    }

    if (teachers.length === 0) {
      throw new Error("ไม่พบข้อมูลครูที่สามารถนำเข้าได้");
    }

    // ตรวจสอบเลขบัตรประชาชนซ้ำ
    const nationalIds = teachers
      .map((t) => t.nationalId)
      .filter((id) => id);

    if (nationalIds.length > 0) {
      const duplicate = await prisma.teacher.findMany({
        where: {
          nationalId: {
            in: nationalIds,
          },
        },
      });

      if (duplicate.length > 0) {
        throw new Error(
          `พบเลขบัตรประชาชนซ้ำในระบบ จำนวน ${duplicate.length} รายการ`
        );
      }
    }

    // บันทึกข้อมูล
    return await prisma.teacher.createMany({
      data: teachers,
    });
  }
}