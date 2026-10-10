import { loginService, registerService } from "./auth.service";

export const login = async (req: any, res: any) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "กรอกชื่อผู้ใช้และรหัสผ่าน" });
  }
  try {
    const result = await loginService(username, password);
    if (!result) {
      return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
  }
};

export const register = async (req: any, res: any) => {
  try {
    // เฉพาะ Admin เท่านั้นที่สร้างบัญชี Admin ได้
    if (req.body?.role === "Admin" && req.user?.role !== "Admin") {
      return res.status(403).json({ message: "เฉพาะ Admin เท่านั้นที่สร้างบัญชี Admin ได้" });
    }
    const user = await registerService(req.body);
    return res.status(201).json({ message: "สร้างบัญชีสำเร็จ", user });
  } catch (e: any) {
    if (!e.status) console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
  }
};

export const me = (req: any, res: any) => res.json({ user: req.user });

// รองรับโค้ดเดิมที่ import แบบ AuthController.login
export const AuthController = { login, register, me };
