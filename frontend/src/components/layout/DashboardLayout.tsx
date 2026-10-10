import {
  Box,
  Toolbar
} from "@mui/material";

import {
  Outlet
} from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const drawerWidth = 240;

export default function DashboardLayout() {
  return (
    <Box sx={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      {/* Sidebar ด้านข้าง */}
      <Sidebar />

      {/* Topbar ด้านบนสุด (จะถูกตรึงไว้เต็มความกว้างขวา) */}
      <Topbar />

      {/* ส่วนเนื้อหาหลักด้านขวา */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`, // คำนวณความกว้างที่เหลือให้พอดีกับหน้าจอ
          boxSizing: "border-box",
        }}
      >
        <Toolbar /> {/* ดันเนื้อหาลงมาไม่ให้โดน Topbar บัง */}
        <Outlet />
      </Box>
    </Box>
  );
}