import { prisma } from "../../../lib/prisma";

export class ClassroomService {
  static async create(data: any) {
    return await prisma.classroom.create({
      data,
    });
  }

  static async getAll(teacherId?: string) {
    let whereCondition: any = {};

    // 🎯 ถ้ามี teacherId ส่งมา ให้กรองเฉพาะห้องที่เป็นของครูคนนี้
    if (teacherId) {
      whereCondition = {
        homeroomTeacherId: BigInt(teacherId),
      };
    }

    return await prisma.classroom.findMany({
      where: whereCondition,
      include: {
        homeroomTeacher: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  static async getById(id: bigint) {
    return await prisma.classroom.findUnique({
      where: {
        id,
      },
    });
  }

  static async update(id: bigint, data: any) {
    return await prisma.classroom.update({
      where: {
        id,
      },
      data,
    });
  }

  static async delete(id: bigint) {
    return await prisma.classroom.delete({
      where: {
        id,
      },
    });
  }
}