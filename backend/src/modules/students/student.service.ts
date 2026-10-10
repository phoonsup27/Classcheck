import { prisma } from "../../../lib/prisma"; // ⚠️ เช็ก path ให้ตรงกับโฟลเดอร์ของคุณด้วยนะครับ

export class StudentService {
  
  // 🎯 เพิ่มการรับพารามิเตอร์ teacherId (อาจจะไม่มีค่าก็ได้ในกรณีที่เป็น Admin)
  static async getAll(teacherId?: string) {
    let whereCondition: any = {};

    // ถ้ามี teacherId ส่งเข้ามา แปลว่าเป็น "ครูประจำชั้น" ให้เปิดโหมดกรองข้อมูล
    if (teacherId) {
      whereCondition = {
        classroom: {
          // แปลง string เป็น BigInt เพื่อให้ตรงกับประเภทในฐานข้อมูล Prisma
          homeroomTeacherId: BigInt(teacherId), 
        },
      };
    }

    // สั่งค้นหานักเรียนตามเงื่อนไข (ถ้าไม่มี teacherId มันจะดึงมาทั้งหมด)
    const students = await prisma.student.findMany({
      where: whereCondition,
      include: {
        classroom: true, // ดึงข้อมูลห้องเรียนมาแสดงผลด้วย
      },
      orderBy: {
        studentCode: 'asc' // เรียงลำดับตามรหัสนักเรียน (เพิ่มให้เพื่อความเป็นระเบียบ)
      }
    });

    return students;
  }

  // ==========================================
  // ฟังก์ชันอื่นๆ ด้านล่างนี้ (ถ้าคุณมีอยู่แล้วให้คงไว้ตามเดิมครับ)
  // ==========================================
  static async getById(id: bigint) {
    return await prisma.student.findUnique({
      where: { id },
      include: { classroom: true }
    });
  }

  static async create(data: any) {
    return await prisma.student.create({ data });
  }

  static async update(id: bigint, data: any) {
    return await prisma.student.update({ where: { id }, data });
  }

  static async delete(id: bigint) {
    return await prisma.student.delete({ where: { id } });
  }
}