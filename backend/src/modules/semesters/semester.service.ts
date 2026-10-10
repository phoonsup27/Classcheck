import { prisma } from "../../../lib/prisma";

export class SemesterService {
  static async create(data: any) {
    return await prisma.semester.create({
      data,
    });
  }

  static async getAll() {
    return await prisma.semester.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }

  static async getById(id: bigint) {
    return await prisma.semester.findUnique({
      where: {
        id,
      },
    });
  }

  static async update(id: bigint, data: any) {
    return await prisma.semester.update({
      where: {
        id,
      },
      data,
    });
  }

  static async delete(id: bigint) {
    return await prisma.semester.delete({
      where: {
        id,
      },
    });
  }
}