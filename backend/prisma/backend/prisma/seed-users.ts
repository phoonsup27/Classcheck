import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const roleOf = async (roleName: string) => {
    const r = await prisma.role.findFirst({ where: { roleName } });
    if (!r) throw new Error(`Role ${roleName} not found`);
    return r.id;
  };

  const people = [
    { username: "director", role: "Director", code: "D001", name: "ผู้อำนวยการ ตัวอย่าง", position: "ผู้อำนวยการ" },
    { username: "vice", role: "ViceDirector", code: "V001", name: "รองผู้อำนวยการ ตัวอย่าง", position: "รองผู้อำนวยการ" },
    { username: "teacher1", role: "Teacher", code: "T001", name: "ครูสมชาย ใจดี", position: "ครู" },
  ];

  for (const p of people) {
    const teacher = await prisma.teacher.upsert({
      where: { teacherCode: p.code },
      update: {},
      create: { teacherCode: p.code, fullName: p.name, position: p.position },
    });

    await prisma.user.upsert({
      where: { username: p.username },
      update: {},
      create: {
        username: p.username,
        passwordHash,
        roleId: await roleOf(p.role),
        teacherId: teacher.id,
        isActive: true,
      },
    });
  }

  console.log("✅ สร้างบัญชี director / vice / teacher1 แล้ว (รหัสผ่าน 123456)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());