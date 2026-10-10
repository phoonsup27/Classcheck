import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { People, School, MeetingRoom, MenuBook } from "@mui/icons-material";
import { useState, useEffect } from "react";

interface DashboardStats {
  students: number;
  teachers: number;
  classrooms: number;
  subjects: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    students: 0,
    teachers: 0,
    classrooms: 0,
    subjects: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [studentsRes, teachersRes, classroomsRes, subjectsRes] = await Promise.all([
          fetch("http://localhost:3000/students").catch(() => null),
          fetch("http://localhost:3000/teachers").catch(() => null),
          fetch("http://localhost:3000/classrooms").catch(() => null),
          fetch("http://localhost:3000/subjects").catch(() => null),
        ]);

        const studentsData = studentsRes ? await studentsRes.json() : [];
        const teachersData = teachersRes ? await teachersRes.json() : [];
        const classroomsData = classroomsRes ? await classroomsRes.json() : [];
        const subjectsData = subjectsRes ? await subjectsRes.json() : [];

        // เปลี่ยนจาก any เป็น unknown และเช็คประเภทข้อมูลอย่างปลอดภัย
        const getCount = (data: unknown): number => {
          let raw = data;
          if (data && typeof data === "object" && "data" in data) {
            raw = (data as { data: unknown }).data;
          }
          return Array.isArray(raw) ? raw.length : 0;
        };

        setStats({
          students: getCount(studentsData),
          teachers: getCount(teachersData),
          classrooms: getCount(classroomsData),
          subjects: getCount(subjectsData),
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards = [
    { 
      title: "Students", 
      total: stats.students, 
      icon: <People sx={{ color: "#1976d2", fontSize: 40 }} />,
      bgColor: "#e3f2fd"
    },
    { 
      title: "Teachers", 
      total: stats.teachers, 
      icon: <School sx={{ color: "#2e7d32", fontSize: 40 }} />,
      bgColor: "#e8f5e9"
    },
    { 
      title: "Classrooms", 
      total: stats.classrooms, 
      icon: <MeetingRoom sx={{ color: "#ed6c02", fontSize: 40 }} />,
      bgColor: "#fff3e0"
    },
    { 
      title: "Subjects", 
      total: stats.subjects, 
      icon: <MenuBook sx={{ color: "#d32f2f", fontSize: 40 }} />,
      bgColor: "#ffebee"
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        Dashboard
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2, 
                  transition: "0.3s", 
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 4 } 
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="text.secondary" variant="subtitle1" sx={{ fontWeight: "medium" }}>
                        {card.title}
                      </Typography>
                      <Typography component="h2" variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
                        {card.total}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        backgroundColor: card.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}