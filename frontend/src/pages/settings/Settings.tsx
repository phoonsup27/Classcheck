import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
} from "@mui/material";

import {
  CalendarMonth,
  Person,
  Lock,
  School,
  MenuBook,
  EventNote,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();

  // รายการตั้งค่าทั้งหมด โดยเชื่อมโยง path ไปยังหน้าหลักที่ใช้งานร่วมกับ Sidebar
  const settings = [
    {
      title: "ปีการศึกษา / ภาคเรียน",
      description: "กำหนดปีการศึกษาและภาคเรียนปัจจุบัน",
      icon: <CalendarMonth sx={{ color: "#2e7d32", fontSize: { xs: 28, sm: 32 } }} />,
      bgColor: "#e8f5e9",
      path: "/settings/semesters",
    },
    {
      title: "ระดับชั้นและห้องเรียน",
      description: "จัดการข้อมูลห้องเรียนและครูประจำชั้น",
      icon: <School sx={{ color: "#1976d2", fontSize: { xs: 28, sm: 32 } }} />,
      bgColor: "#e3f2fd",
      path: "/classrooms", // ลิงก์ไปหน้าห้องเรียนหลักเดียวกับ Sidebar
    },
    {
      title: "รายวิชาทั้งหมด",
      description: "จัดการกลุ่มสาระและรายวิชาที่เปิดสอน",
      icon: <MenuBook sx={{ color: "#9c27b0", fontSize: { xs: 28, sm: 32 } }} />,
      bgColor: "#f3e5f5",
      path: "/subjects", // ลิงก์ไปหน้ารายวิชาหลักเดียวกับ Sidebar
    },
    {
      title: "ปฏิทินการศึกษา",
      description: "กำหนดวันเปิด-ปิดเทอมและวันหยุดพิเศษ",
      icon: <EventNote sx={{ color: "#0288d1", fontSize: { xs: 28, sm: 32 } }} />,
      bgColor: "#e1f5fe",
      path: "/settings/calendar",
    },
    {
      title: "ผู้ใช้งาน",
      description: "จัดการบัญชีและสิทธิ์ผู้ใช้งาน",
      icon: <Person sx={{ color: "#ed6c02", fontSize: { xs: 28, sm: 32 } }} />,
      bgColor: "#fff3e0",
      path: "/users",
    },
    {
      title: "เปลี่ยนรหัสผ่าน",
      description: "แก้ไขรหัสผ่านของบัญชี",
      icon: <Lock sx={{ color: "#d32f2f", fontSize: { xs: 28, sm: 32 } }} />,
      bgColor: "#ffebee",
      path: "/settings/password",
    },
  ];

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 2, sm: 3 },
          fontWeight: "bold",
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
        }}
      >
        ตั้งค่า
      </Typography>

      {/* Settings Cards */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {settings.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.title}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 2,
                transition: "0.3s",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
              }}
            >
              <CardContent 
                sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  display: "flex", 
                  flexDirection: "column", 
                  flexGrow: 1 
                }}
              >
                {/* Icon & Title Row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      backgroundColor: item.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>

                {/* Description */}
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{
                    mb: 2,
                    flexGrow: 1,
                    fontSize: { xs: "0.875rem", sm: "0.9rem" }
                  }}
                >
                  {item.description}
                </Typography>

                {/* Action Button */}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                    }
                  }}
                >
                  จัดการ
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}