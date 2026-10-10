import { prisma } from "../../../lib/prisma";

export class SubjectService {
  static async create(data: any) {
    return await prisma.subject.create({
      data: {
        subjectCode: data.subjectCode,
        subjectName: data.subjectName,
        credit: Number(data.credit), // แปลงเป็น Number เพื่อรองรับ Decimal ของ Prisma
        description: data.description || null,
      },
    });
  }

  static async getAll() {
    return await prisma.subject.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }

  static async getById(id: bigint) {
    return await prisma.subject.findUnique({
      where: {
        id,
      },
    });
  }

  static async update(id: bigint, data: any) {
    return await prisma.subject.update({
      where: {
        id,
      },
      data: {
        subjectCode: data.subjectCode,
        subjectName: data.subjectName,
        credit: data.credit !== undefined ? Number(data.credit) : undefined,
        description: data.description,
      },
    });
  }

  static async delete(id: bigint) {
    return await prisma.subject.delete({
      where: {
        id,
      },
    });
  }
}