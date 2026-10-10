import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt"; // 👈 1. นำเข้า bcrypt มาใช้งาน

export class UserService {
  static async getAll() {
    return prisma.user.findMany({
      include: {
        role: true,
      },
    });
  }

  static async getById(id: bigint) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  static async create(data: { username: string; password: string; roleId: number | bigint }) {
    // 👉 2. เข้ารหัสรหัสผ่านด้วย bcrypt ก่อนบันทึก
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        username: data.username,
        passwordHash: hashedPassword, // 👈 3. ใช้รหัสผ่านที่แฮชแล้ว
        roleId: BigInt(data.roleId),
      },
      include: {
        role: true,
      },
    });
  }

  static async delete(id: bigint) {
    return prisma.user.delete({
      where: { id },
    });
  }
}