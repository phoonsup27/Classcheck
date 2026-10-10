import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";

const ROLES = ["Admin", "Director", "ViceDirector", "Teacher"];

function fail(status: number, message: string): never {
  const err: any = new Error(message);
  err.status = status;
  throw err;
}

export async function loginService(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { role: true, teacher: true },
  });

  if (!user || !user.isActive) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const payload = {
    userId: Number(user.id),
    username: user.username,
    role: user.role.roleName,
    teacherId: user.teacherId ? Number(user.teacherId) : null,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
    expiresIn: "8h",
  });

  return {
    token,
    user: { ...payload, fullName: user.teacher?.fullName ?? user.username },
  };
}

// สร้างบัญชีผู้ใช้ใหม่ (เรียกได้เฉพาะ Admin/Director ผ่าน route)
export async function registerService(data: any) {
  const { username, password, role, teacherId } = data || {};

  if (!username || String(username).trim().length < 3) fail(400, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร");
  if (!password || String(password).length < 6) fail(400, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
  if (!ROLES.includes(role)) fail(400, "บทบาทไม่ถูกต้อง (Admin, Director, ViceDirector, Teacher)");

  const roleRow = await prisma.role.findFirst({ where: { roleName: role } });
  if (!roleRow) fail(400, "ไม่พบบทบาทนี้ในระบบ");

  const exists = await prisma.user.findUnique({ where: { username: String(username).trim() } });
  if (exists) fail(409, "ชื่อผู้ใช้นี้ถูกใช้แล้ว");

  const passwordHash = await bcrypt.hash(String(password), 10);

  try {
    const user = await prisma.user.create({
      data: {
        username: String(username).trim(),
        passwordHash,
        roleId: roleRow.id,
        teacherId: teacherId ? BigInt(teacherId) : null,
        isActive: true,
      },
      include: { role: true },
    });
    return { id: Number(user.id), username: user.username, role: user.role.roleName };
  } catch (e: any) {
    if (e.code === "P2002") fail(409, "ครูคนนี้มีบัญชีผู้ใช้อยู่แล้ว");
    if (e.code === "P2003") fail(400, "ไม่พบครูตาม teacherId ที่ระบุ");
    throw e;
  }
}
