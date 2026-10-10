import { prisma } from "../../../lib/prisma";

export class RoleService {
  static async create(data: any) {
    return await prisma.role.create({
      data,
    });
  }

  static async getAll() {
    return await prisma.role.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }

  static async getById(id: bigint) {
    return await prisma.role.findUnique({
      where: {
        id,
      },
    });
  }

  static async update(id: bigint, data: any) {
    return await prisma.role.update({
      where: {
        id,
      },
      data,
    });
  }

  static async delete(id: bigint) {
    return await prisma.role.delete({
      where: {
        id,
      },
    });
  }
}