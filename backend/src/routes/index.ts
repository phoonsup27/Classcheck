import { Router } from "express";
import fs from "fs";
import path from "path";

import { authMiddleware } from "../middleware/auth.middleware";
import { accessControl } from "../middleware/access.middleware";

const router = Router();

const modulesDir = path.join(__dirname, "..", "modules");

// studentImport -> student-import
const kebab = (s: string) =>
  s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

// path เพิ่มเติมที่หน้าเว็บอาจเรียกใช้
const aliases: Record<string, string[]> = {
  report: ["reports"],
};

/**
 * โหลด Router จากไฟล์ *.routes.ts / *.routes.js
 */
function loadRouters(dir: string): any[] {
  const found: any[] = [];

  if (!fs.existsSync(dir)) {
    console.warn(`⚠️ ไม่พบโฟลเดอร์: ${dir}`);
    return found;
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.routes?\.(ts|js)$/.test(f));

  for (const file of files) {
    try {
      const fullPath = path.join(dir, file);
      const mod = require(fullPath);

      // รองรับหลายรูปแบบการ export
      const r =
        mod.default ||
        mod.router ||
        mod.routes ||
        Object.entries(mod).find(
          ([key, value]) =>
            /route|router/i.test(key) &&
            (typeof value === "function" ||
              (value !== null &&
                typeof value === "object" &&
                typeof (value as any).use === "function"))
        )?.[1];

      // Express Router เป็น function ใน Express ปกติ
      // แต่เผื่อกรณี Router ถูก export เป็น object
      if (
        typeof r === "function" ||
        (r !== null &&
          typeof r === "object" &&
          typeof (r as any).use === "function")
      ) {
        found.push(r);
        console.log(`✅ Loaded router: ${file}`);
      } else {
        console.warn(
          `⚠️ ข้ามไฟล์ ${file}: export ไม่ใช่ Express Router/function`
        );
      }
    } catch (error) {
      console.error(`❌ โหลด ${file} ไม่สำเร็จ:`, error);
    }
  }

  return found;
}

// ตรวจสอบ modules
if (!fs.existsSync(modulesDir)) {
  console.error(`❌ ไม่พบ modules directory: ${modulesDir}`);
} else {
  const folders = fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  // ============================================================
  // 1) AUTH
  // ============================================================

  const authDir = path.join(modulesDir, "auth");

  if (fs.existsSync(authDir)) {
    const authRouters = loadRouters(authDir);

    for (const r of authRouters) {
      router.use("/auth", r);
      console.log("✅ Mounted /auth (public)");
    }
  }

  // ============================================================
  // 2) MIDDLEWARE
  // ============================================================

  // ต้องเป็น function ทั้งคู่
  if (typeof authMiddleware !== "function") {
    throw new TypeError(
      "authMiddleware ต้องเป็น function กรุณาตรวจสอบ auth.middleware.ts"
    );
  }

  if (typeof accessControl !== "function") {
    throw new TypeError(
      "accessControl ต้องเป็น function กรุณาตรวจสอบ access.middleware.ts"
    );
  }

  router.use(authMiddleware);
  router.use(accessControl);

  // ============================================================
  // 3) MODULE ROUTES
  // ============================================================

  for (const folder of folders) {
    if (folder === "auth") continue;

    const moduleDir = path.join(modulesDir, folder);
    const routers = loadRouters(moduleDir);

    if (routers.length === 0) {
      continue;
    }

    const paths = new Set<string>([
      folder,
      kebab(folder),
      ...(aliases[folder] || []),
    ]);

    for (const p of paths) {
      for (const r of routers) {
        router.use("/" + p, r);
      }
    }

    console.log(
      "✅ Mounted",
      [...paths].map((p) => "/" + p).join(" | ")
    );
  }
}

export default router;