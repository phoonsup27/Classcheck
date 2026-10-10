import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { prisma } from "../lib/prisma";

const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ DB Connected");

    app.listen(PORT, async () => {
      console.log(`🚀 Server running ${BASE_URL}`);

      // ✅ เปิด browser แบบถูกต้อง (ESM-safe)
      const { default: open } = await import("open");
      await open(BASE_URL);
    });

  } catch (err) {
    console.error("❌ DB Error", err);
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});