import { prisma } from "../../../lib/prisma";

export class TeacherService {
  static async create(data: any) {
    return await prisma.teacher.create({
      data,
    });
  }

  static async getAll() {
    return await prisma.teacher.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }

  static async getById(id: bigint) {
    return await prisma.teacher.findUnique({
      where: {
        id,
      },
    });
  }

  static async update(id: bigint, data: any) {
    return await prisma.teacher.update({
      where: {
        id,
      },
      data,
    });
  }

  static async delete(id: bigint) {
    return await prisma.teacher.delete({
      where: {
        id,
      },
    });
  }
}