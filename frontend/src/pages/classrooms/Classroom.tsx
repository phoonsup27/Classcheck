import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from "@mui/material";

import { Add, Edit, Delete, Search, People } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";

// =====================
// Type Definitions
// =====================
interface ClassroomType {
  id: string | number;
  classroomName: string;
  level?: string;
  roomNumber?: string;
  year?: number | string;
  homeroomTeacherId?: string | number;
}

interface StudentType {
  id: string | number;
  studentCode?: string;
  student_code?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  fullName?: string;
  full_name?: string;
  classroomId?: string | number;
  classroom_id?: string | number;
  classroomID?: string | number;
  classroom?: { id: string | number };
}

export default function Classroom() {
  const [classrooms, setClassrooms] = useState<ClassroomType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // ดึงข้อมูล User จาก LocalStorage เพื่อเอา teacherId มาใช้งาน
  const getTeacherId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.teacherId || null;
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
    return null;
  };

  // Dialog State (สำหรับเพิ่ม / แก้ไข ห้องเรียน)
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    classroomName: "",
    level: "",
    roomNumber: "",
    year: new Date().getFullYear() + 543
  });

  // Student Dialog State (สำหรับแสดงรายชื่อนักเรียน)
  const [openStudentDialog, setOpenStudentDialog] = useState<boolean>(false);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomType | null>(null);
  const [students, setStudents] = useState<StudentType[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);

  // =====================
  // 1. Fetch Classrooms Function (ห่อด้วย useCallback เพื่อความเสถียร)
  // =====================
  const fetchClassrooms = useCallback(async () => {
    try {
      const teacherId = getTeacherId();
      const url = teacherId 
        ? `http://localhost:3000/classrooms?teacherId=${teacherId}`
        : "http://localhost:3000/classrooms";

      const res = await fetch(url);
      const data = await res.json();
      const rawData = data.data ?? data;

      const uniqueClassrooms = rawData.filter(
        (room: ClassroomType, index: number, self: ClassroomType[]) =>
          index === self.findIndex((r) => r.id === room.id || r.classroomName === room.classroomName)
      );

      setClassrooms(uniqueClassrooms);
    } catch (error) {
      console.error("Failed to fetch classrooms", error);
    }
  }, []);

  // =====================
  // 2. Initial Data Load on Mount
  // =====================
  useEffect(() => {
    let isMounted = true;

    const loadInitialClassrooms = async () => {
      setLoading(true);
      try {
        const teacherId = getTeacherId();
        const url = teacherId 
          ? `http://localhost:3000/classrooms?teacherId=${teacherId}`
          : "http://localhost:3000/classrooms";

        const res = await fetch(url);
        const data = await res.json();
        const rawData = data.data ?? data;

        const uniqueClassrooms = rawData.filter(
          (room: ClassroomType, index: number, self: ClassroomType[]) =>
            index === self.findIndex((r) => r.id === room.id || r.classroomName === room.classroomName)
        );

        if (isMounted) {
          setClassrooms(uniqueClassrooms);
        }
      } catch (error) {
        console.error("Failed to fetch classrooms", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialClassrooms();

    return () => {
      isMounted = false;
    };
  }, [fetchClassrooms]);

  // =====================
  // 3. Open / Close Classroom Dialog
  // =====================
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      classroomName: "",
      level: "",
      roomNumber: "",
      year: new Date().getFullYear() + 543
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (room: ClassroomType) => {
    setEditingId(room.id);
    setFormData({
      classroomName: room.classroomName || "",
      level: room.level || "",
      roomNumber: room.roomNumber || "",
      year: room.year ? Number(room.year) : new Date().getFullYear() + 543
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // =====================
  // 4. Save / Update Classroom
  // =====================
  const handleSubmit = async () => {
    if (!formData.classroomName) {
      alert("กรุณากรอกชื่อห้องเรียน");
      return;
    }

    try {
      const teacherId = getTeacherId();
      const payload = {
        ...formData,
        homeroomTeacherId: teacherId ? Number(teacherId) : undefined
      };

      if (editingId) {
        await fetch(`http://localhost:3000/classrooms/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("http://localhost:3000/classrooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      fetchClassrooms();
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save classroom", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // =====================
  // 5. Delete Classroom
  // =====================
  const handleDelete = async (id: string | number) => {
    if (window.confirm("คุณต้องการลบห้องเรียนนี้ใช่หรือไม่?")) {
      try {
        await fetch(`http://localhost:3000/classrooms/${id}`, {
          method: "DELETE"
        });
        fetchClassrooms();
      } catch (error) {
        console.error("Failed to delete classroom", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  // =====================
  // 6. Fetch Students
  // =====================
  const handleViewStudents = async (room: ClassroomType) => {
    setSelectedClassroom(room);
    setOpenStudentDialog(true);
    setLoadingStudents(true);

    try {
      const teacherId = getTeacherId();
      const url = teacherId
        ? `http://localhost:3000/students?teacherId=${teacherId}`
        : "http://localhost:3000/students";

      const res = await fetch(url);
      const data = await res.json();
      
      const allStudents: StudentType[] = Array.isArray(data) 
        ? data 
        : data.data ?? data.students ?? [];

      const filteredStudents = allStudents.filter((student) => {
        const studentClassId = 
          student.classroomId ?? 
          student.classroom_id ?? 
          student.classroomID ?? 
          student.classroom?.id;
        
        return studentClassId !== undefined && String(studentClassId) === String(room.id);
      });

      setStudents(filteredStudents);
    } catch (error) {
      console.error("Failed to fetch students", error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCloseStudentDialog = () => {
    setOpenStudentDialog(false);
    setSelectedClassroom(null);
    setStudents([]);
  };

  const filteredClassrooms = classrooms.filter(
    (room) =>
      (room.classroomName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.level || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3
        }}
      >
        <Typography variant="h4">ห้องเรียนประจำชั้น</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
          เพิ่มห้องเรียน
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TextField
            fullWidth
            label="ค้นหาห้องเรียน"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />
              }
            }}
          />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ห้องเรียน</TableCell>
                  <TableCell>ระดับชั้น</TableCell>
                  <TableCell>ห้อง</TableCell>
                  <TableCell>ปีการศึกษา</TableCell>
                  <TableCell align="center">รายชื่อนักเรียน</TableCell>
                  <TableCell align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredClassrooms.map((room) => (
                  <TableRow key={String(room.id)}>
                    <TableCell sx={{ fontWeight: "bold" }}>{room.classroomName}</TableCell>
                    <TableCell>{room.level || "-"}</TableCell>
                    <TableCell>{room.roomNumber || "-"}</TableCell>
                    <TableCell>{room.year || "-"}</TableCell>

                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        color="info"
                        size="small"
                        startIcon={<People />}
                        onClick={() => handleViewStudents(room)}
                      >
                        ดูนักเรียน
                      </Button>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        color="warning"
                        startIcon={<Edit />}
                        onClick={() => handleOpenEdit(room)}
                        sx={{ mr: 1 }}
                      >
                        แก้ไข
                      </Button>

                      <Button
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(room.id)}
                      >
                        ลบ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredClassrooms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {loading ? "กำลังโหลดข้อมูล..." : "ไม่พบข้อมูลห้องเรียนของคุณ"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "แก้ไขห้องเรียน" : "เพิ่มห้องเรียนใหม่"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="ชื่อห้องเรียน (เช่น ม.1/1)"
              fullWidth
              required
              value={formData.classroomName}
              onChange={(e) =>
                setFormData({ ...formData, classroomName: e.target.value })
              }
            />
            <TextField
              label="ระดับชั้น (เช่น ม.1)"
              fullWidth
              value={formData.level}
              onChange={(e) =>
                setFormData({ ...formData, level: e.target.value })
              }
            />
            <TextField
              label="เลขห้อง (เช่น 1)"
              fullWidth
              value={formData.roomNumber}
              onChange={(e) =>
                setFormData({ ...formData, roomNumber: e.target.value })
              }
            />
            <TextField
              label="ปีการศึกษา (เช่น 2569)"
              type="number"
              fullWidth
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: Number(e.target.value) })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openStudentDialog} onClose={handleCloseStudentDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          รายชื่อนักเรียน - {selectedClassroom?.classroomName}
        </DialogTitle>
        <DialogContent dividers>
          {loadingStudents ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : students.length > 0 ? (
            <List>
              {students.map((student, index) => {
                const studentName = 
                  student.fullName || 
                  student.full_name || 
                  `${student.firstName || student.first_name || ""} ${student.lastName || student.last_name || ""}`.trim();
                
                const studentCode = student.studentCode || student.student_code || "-";

                return (
                  <Box key={String(student.id)}>
                    <ListItem>
                      <ListItemText
                        primary={`${index + 1}. ${studentName || "ไม่ระบุชื่อ"}`}
                        secondary={`รหัสนักเรียน: ${studentCode}`}
                      />
                    </ListItem>
                    {index < students.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          ) : (
            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
              ไม่พบรายชื่อนักเรียนในห้องนี้
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStudentDialog} color="primary">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}