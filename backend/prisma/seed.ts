import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

  // =====================
  // Create Roles
  // =====================
  await prisma.role.createMany({
    data: [
      { roleName: "Admin", description: "System Administrator" },
      { roleName: "Director", description: "School Director" },
      { roleName: "ViceDirector", description: "Vice Director" },
      { roleName: "Teacher", description: "Teacher" },
    ],
    skipDuplicates: true,
  });

  // =====================
  // Create Admin User
  // =====================
  const adminRole = await prisma.role.findFirst({
    where: {
      roleName: "Admin",
    },
  });

  if (!adminRole) {
    throw new Error("Admin role not found");
  }

  const passwordHash = await bcrypt.hash("123456", 10);

  await prisma.user.createMany({
    data: [
      {
        username: "admin",
        passwordHash,
        roleId: adminRole.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // =====================
  // Create School Year
  // =====================
  await prisma.schoolYear.createMany({
    data: [
      {
        yearName: "2569",
        startDate: new Date("2026-05-01"),
        endDate: new Date("2027-03-31"),
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const schoolYear = await prisma.schoolYear.findFirst({
    where: {
      yearName: "2569",
    },
  });

  if (!schoolYear) {
    throw new Error("No school year found");
  }

  // =====================
  // Create Semester
  // =====================
  await prisma.semester.createMany({
    data: [
      {
        semesterName: "1",
        schoolYearId: schoolYear.id,
        startDate: new Date("2026-05-01"),
        endDate: new Date("2026-10-01"),
        isActive: true,
      },
      {
        semesterName: "2",
        schoolYearId: schoolYear.id,
        startDate: new Date("2026-11-01"),
        endDate: new Date("2027-03-31"),
        isActive: false,
      },
    ],
    skipDuplicates: true,
  });

  // =====================
  // Create Classrooms
  // =====================
  const levels = [
    "ม.1",
    "ม.2",
    "ม.3",
    "ม.4",
    "ม.5",
    "ม.6",
  ];

  const classrooms = [];

  for (const level of levels) {
    for (let room = 1; room <= 5; room++) {
      classrooms.push({
        classroomName: `${level}/${room}`,
        gradeLevel: level,
        roomNumber: String(room),
        schoolYearId: schoolYear.id,
      });
    }
  }

  await prisma.classroom.createMany({
    data: classrooms,
    skipDuplicates: true,
  });

  console.log("🌱 Seed completed successfully!");
  console.log("✅ Created classrooms:", classrooms.length);
  console.log("✅ Created admin user");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });