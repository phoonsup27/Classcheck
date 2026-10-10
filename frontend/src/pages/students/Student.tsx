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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";

// =====================
// Type Definition
// =====================
interface Classroom {
  id: string | number;
  classroomName: string;
  gradeLevel?: string;
  roomNumber?: string | number;
}

interface StudentType {
  id: string | number;
  studentCode?: string;
  code?: string;
  fullName: string;
  classroomId?: string | number;
  classroom?: Classroom;
}

interface UserType {
  id?: string | number;
  username?: string;
  role?: string | { roleName?: string };
  teacherId?: string | number;
  [key: string]: unknown;
}

// =====================
// Component
// =====================
export default function Student() {
  const [file, setFile] = useState<File | null>(null);
  const [students, setStudents] = useState<StudentType[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    studentCode: "",
    fullName: "",
    classroomId: "",
  });

  const [importClassroomId, setImportClassroomId] = useState<string>("");

  // =====================
  // Fetch Data 
  // =====================
  const fetchStudents = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const currentUser: UserType = userStr ? JSON.parse(userStr) : {};

      const teacherId = currentUser.teacherId;
      
      let roleName = "";
      if (typeof currentUser.role === "string") {
        roleName = currentUser.role;
      } else if (currentUser.role && typeof currentUser.role === "object") {
        roleName = currentUser.role.roleName || "";
      }

      let url = "http://localhost:3000/students";
      
      if (roleName.toLowerCase() === "teacher" && teacherId) {
        url += `?teacherId=${teacherId}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setStudents(data.data ?? data);
    } catch (error) {
      console.error("Fetch Students Error:", error);
    }
  };

  const fetchClassrooms = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/classrooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setClassrooms(data.data ?? data);
    } catch (error) {
      console.error("Fetch Classrooms Error:", error);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      await fetchClassrooms();
      await fetchStudents();
    };
    loadAllData();
  }, []);

  // =====================
  // Add Student
  // =====================
  const handleAddStudent = async () => {
    if (!form.classroomId) {
      alert("กรุณาเลือกห้องเรียน");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentCode: form.studentCode,
          fullName: form.fullName,
          classroomId: form.classroomId, 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("เพิ่มนักเรียนสำเร็จ");
        setOpen(false);
        setForm({
          studentCode: "",
          fullName: "",
          classroomId: "",
        });
        fetchStudents();
      } else {
        alert(data.message || "เพิ่มไม่สำเร็จ");
      }
    } catch (error) {
      console.error(error);
      alert("เชื่อมต่อ Backend ไม่ได้");
    }
  };

  // =====================
  // Import Excel
  // =====================
  const handleImport = async () => {
    if (!file) {
      alert("กรุณาเลือกไฟล์ Excel");
      return;
    }
    if (!importClassroomId) {
      alert("กรุณาเลือกห้องเรียนก่อนทำการนำเข้า");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("classroomId", importClassroomId); 

      const res = await fetch("http://localhost:3000/api/students/import/students", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Import สำเร็จ");
        setFile(null); 
        setImportClassroomId("");
        fetchStudents(); 
      } else {
        alert(data.message || "Import ไม่สำเร็จ");
      }
    } catch (error) {
      console.error(error);
      alert("Backend ไม่ทำงาน");
    }
  };

  // กรองรายชื่อนักเรียนตามช่องค้นหา
  const filteredStudents = students.filter((student) => {
    const code = String(student.studentCode ?? student.code ?? "");
    const name = String(student.fullName ?? "");
    const room = String(student.classroom?.classroomName ?? "");
    const query = searchQuery.toLowerCase();

    return (
      code.toLowerCase().includes(query) ||
      name.toLowerCase().includes(query) ||
      room.toLowerCase().includes(query)
    );
  });

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">นักเรียน</Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            เพิ่มนักเรียน
          </Button>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>เลือกห้องเพื่อนำเข้า</InputLabel>
            <Select
              value={importClassroomId}
              label="เลือกห้องเพื่อนำเข้า"
              onChange={(e) => setImportClassroomId(e.target.value)}
            >
              {classrooms.map((room) => (
                <MenuItem key={String(room.id)} value={String(room.id)}>
                  {room.classroomName} 
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" component="label">
            {file ? file.name : "เลือกไฟล์ Excel"}
            <input
              hidden
              type="file"
              accept=".xlsx,.xls,.csv"
              onClick={(e) => {
                (e.target as HTMLInputElement).value = "";
              }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </Button>

          <Button
            variant="contained"
            color="success"
            disabled={!file || !importClassroomId} 
            onClick={handleImport}
          >
            นำเข้า
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <TextField
            fullWidth
            label="ค้นหานักเรียน (รหัส, ชื่อ, ห้องเรียน)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>รหัสนักเรียน</TableCell>
                  <TableCell>ชื่อ - สกุล</TableCell>
                  <TableCell>ห้องเรียน</TableCell>
                  <TableCell align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredStudents.map((student: StudentType) => (
                  <TableRow key={String(student.id)}>
                    <TableCell>{student.studentCode ?? student.code}</TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.classroom?.classroomName ?? "-"}</TableCell>
                    <TableCell align="center">
                      <Button color="warning" startIcon={<Edit />}>
                        แก้ไข
                      </Button>
                      <Button color="error" startIcon={<Delete />}>
                        ลบ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      ไม่พบข้อมูลนักเรียน
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>เพิ่มนักเรียน</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="รหัสนักเรียน"
            margin="normal"
            value={form.studentCode}
            onChange={(e) =>
              setForm({ ...form, studentCode: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="ชื่อ - สกุล"
            margin="normal"
            value={form.fullName}
            onChange={(e) =>
              setForm({ ...form, fullName: e.target.value })
            }
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>ห้องเรียน</InputLabel>
            <Select
              value={form.classroomId}
              label="ห้องเรียน"
              onChange={(e) =>
                setForm({ ...form, classroomId: e.target.value })
              }
            >
              {classrooms.map((room) => (
                <MenuItem key={String(room.id)} value={String(room.id)}>
                  {room.classroomName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleAddStudent}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}