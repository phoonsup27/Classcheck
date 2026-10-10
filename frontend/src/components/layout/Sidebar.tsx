import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";

import {
  Dashboard,
  People,
  School,
  Class,
  MenuBook,
  EventNote,
  FactCheck,
  Settings,
  Assessment,
} from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";

// Import ไฟล์รูปภาพโลโก้
import logoImg from "../../assets/logo.png";

const drawerWidth = 240;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // ดึงข้อมูล User และ Role จาก localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role?.roleName || user?.role; 

  // กำหนดรายการเมนูหลัก พร้อมระบุสิทธิ์ (roles)
  const menu = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard", roles: ["Admin"] }, 
    { text: "นักเรียน", icon: <People />, path: "/students", roles: ["Admin", "Teacher"] },
    { text: "ครู", icon: <School />, path: "/teachers", roles: ["Admin"] }, 
    { text: "ห้องเรียน", icon: <Class />, path: "/classrooms", roles: ["Admin", "Teacher"] },
    { text: "รายวิชา", icon: <MenuBook />, path: "/subjects", roles: ["Admin", "Teacher"] },
    { text: "ตารางเรียน", icon: <EventNote />, path: "/schedules", roles: ["Admin", "Teacher"] },
    { text: "เช็กชื่อ", icon: <FactCheck />, path: "/attendance", roles: ["Admin", "Teacher"] },
    { text: "รายงาน", icon: <Assessment />, path: "/reports", roles: ["Admin"] }, 
    { text: "ตั้งค่า", icon: <Settings />, path: "/settings", roles: ["Admin"] }, 
  ];

  // กรองเมนูตามสิทธิ์ของผู้ใช้
  const filteredMenu = menu.filter((item) => {
    if (!item.roles) return true;
    return userRole ? item.roles.includes(userRole) : false;
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          gap: 1.5,
        }}
      >
        <Box
          component="img"
          sx={{
            height: 36,
            width: 36,
            borderRadius: 1,
            objectFit: "cover",
          }}
          alt="ClassCheck Logo"
          src={logoImg}
        />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          ClassCheck
        </Typography>
      </Toolbar>

      <List sx={{ px: 2, pt: 1 }}>
        {filteredMenu.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={isActive}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                color: isActive ? "primary.main" : "text.secondary",
                "&.Mui-selected": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.12)",
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  borderRadius: 2,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? "primary.main" : "inherit",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                disableTypography
                primary={
                  <Typography sx={{ fontWeight: isActive ? "bold" : "medium" }}>
                    {item.text}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}