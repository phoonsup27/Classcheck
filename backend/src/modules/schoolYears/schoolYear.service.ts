import { prisma } from "../../../lib/prisma";

export class SchoolYearService {
  static async create(data: any) {
    return await prisma.schoolYear.create({
      data,
    });
  }

  static async getAll() {
    return await prisma.schoolYear.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }

  static async getById(id: bigint) {
    return await prisma.schoolYear.findUnique({
      where: {
        id,
      },
    });
  }

  static async update(id: bigint, data: any) {
    return await prisma.schoolYear.update({
      where: {
        id,
      },
      data,
    });
  }

  static async delete(id: bigint) {
    return await prisma.schoolYear.delete({
      where: {
        id,
      },
    });
  }
}