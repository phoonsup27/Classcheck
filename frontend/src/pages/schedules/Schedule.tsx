import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";

interface SchoolYear {
  id: number;
  yearName: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

interface Teacher {
  id: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
}

interface Subject {
  id: number;
  subjectCode: string;
  subjectName: string;
}

interface Classroom {
  id: number;
  name?: string;
  classroomName?: string;
}

interface Schedule {
  id: number;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  teacherId: number;
  subjectId: number;
  classroomId: number;
  semesterId: number;
  teacher: Teacher;
  subject: Subject;
  classroom: Classroom;
}

const INITIAL_FORM_STATE = {
  dayOfWeek: 1,
  period: 1,
  startTime: "08:30",
  endTime: "09:30",
  schoolYearId: "" as number | "",
  semesterId: 1,
  subjectId: "" as number | "",
  teacherId: "" as number | "",
  classroomId: "" as number | "",
};

const DAY_NAMES: Record<number, string> = {
  1: "วันจันทร์",
  2: "วันอังคาร",
  3: "วันพุธ",
  4: "วันพฤหัสบดี",
  5: "วันศุกร์",
  6: "วันเสาร์",
  7: "วันอาทิตย์",
};

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null); // เก็บ ID กรณีแก้ไข

  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const getClassroomName = (classroom?: Classroom) =>
    classroom?.classroomName || classroom?.name || "-";

  const getTeacherName = (teacher?: Teacher) => {
    if (!teacher) return "-";
    if (teacher.fullName) return teacher.fullName;
    if (teacher.firstName || teacher.lastName) {
      return `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
    }
    return "-";
  };

  const getDayName = (dayNum: number) => DAY_NAMES[dayNum] || "-";

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/schedules");
      const data = await res.json();
      setSchedules(data.data || []);
    } catch (error) {
      console.error("โหลดตารางเรียนไม่สำเร็จ", error);
    }
  }, []);

  const getDefaultSelections = (
    loadedYears = schoolYears,
    loadedClassrooms = classrooms
  ) => {
    const activeYear = loadedYears.find((y) => y.isActive) || loadedYears[0];
    const defaultClassroom = loadedClassrooms[0];

    return {
      schoolYearId: activeYear?.id ?? "",
      semesterId: 1,
      classroomId: defaultClassroom?.id ?? "",
    };
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchSchedules();

      try {
        const [syRes, subRes, teaRes, clsRes] = await Promise.all([
          fetch("http://localhost:3000/school-years").then((res) => res.json()),
          fetch("http://localhost:3000/subjects").then((res) => res.json()),
          fetch("http://localhost:3000/teachers").then((res) => res.json()),
          fetch("http://localhost:3000/classrooms").then((res) => res.json()),
        ]);

        const loadedSchoolYears = syRes.data || syRes || [];
        const loadedSubjects = subRes.data || subRes || [];
        const loadedTeachers = teaRes.data || teaRes || [];
        const loadedClassrooms = clsRes.data || clsRes || [];

        setSchoolYears(loadedSchoolYears);
        setSubjects(loadedSubjects);
        setTeachers(loadedTeachers);
        setClassrooms(loadedClassrooms);

        const defaults = getDefaultSelections(
          loadedSchoolYears,
          loadedClassrooms
        );
        setFormData((prev) => ({ ...prev, ...defaults }));
      } catch (error) {
        console.error("โหลดข้อมูล Dropdown ไม่สำเร็จ", error);
      }
    };

    loadInitialData();
  }, [fetchSchedules]);

  const handleOpenAdd = () => {
    setEditId(null);
    const defaults = getDefaultSelections();
    setFormData({ ...INITIAL_FORM_STATE, ...defaults });
    setOpen(true);
  };

  const handleOpenEdit = (item: Schedule) => {
    setEditId(item.id);
    setFormData({
      dayOfWeek: item.dayOfWeek,
      period: item.period,
      startTime: item.startTime ? item.startTime.substring(0, 5) : "08:30",
      endTime: item.endTime ? item.endTime.substring(0, 5) : "09:30",
      schoolYearId: item.semesterId ? Number(item.semesterId) : (schoolYears[0]?.id ?? ""), // ปรับตามความสัมพันธ์จริงของโครงสร้างข้อมูล
      semesterId: 1,
      subjectId: item.subjectId,
      teacherId: item.teacherId,
      classroomId: item.classroomId,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    const defaults = getDefaultSelections();
    setFormData({ ...INITIAL_FORM_STATE, ...defaults });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const url = editId
        ? `http://localhost:3000/schedules/${editId}`
        : "http://localhost:3000/schedules";
      
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: Number(formData.dayOfWeek),
          period: Number(formData.period),
          startTime:
            formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
          endTime:
            formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
          subjectId: Number(formData.subjectId),
          teacherId: Number(formData.teacherId),
          classroomId: Number(formData.classroomId),
          semesterId: Number(formData.semesterId),
        }),
      });

      const result = await res.json();
      if (res.ok && (result.success || result.id || result)) {
        fetchSchedules();
        handleClose();
      } else {
        alert("เกิดข้อผิดพลาด: " + (result.message || "ไม่สามารถบันทึกข้อมูลได้"));
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("คุณต้องการลบตารางเรียนนี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch(`http://localhost:3000/schedules/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchSchedules();
      } else {
        const result = await res.json();
        alert("ไม่สามารถลบข้อมูลได้: " + (result.message || "เกิดข้อผิดพลาด"));
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        ตารางเรียน
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpenAdd}>
        + เพิ่มตารางเรียน
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>วัน</TableCell>
              <TableCell>คาบที่</TableCell>
              <TableCell>เวลา</TableCell>
              <TableCell>รายวิชา</TableCell>
              <TableCell>ครูผู้สอน</TableCell>
              <TableCell>ห้องเรียน</TableCell>
              <TableCell align="center">จัดการ</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  ยังไม่มีข้อมูลตารางเรียน
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{getDayName(item.dayOfWeek)}</TableCell>
                  <TableCell>{item.period}</TableCell>
                  <TableCell>
                    {item.startTime} - {item.endTime}
                  </TableCell>
                  <TableCell>{item.subject?.subjectName || "-"}</TableCell>
                  <TableCell>{getTeacherName(item.teacher)}</TableCell>
                  <TableCell>{getClassroomName(item.classroom)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="แก้ไข">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="ลบ">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "แก้ไขตารางเรียน" : "เพิ่มตารางเรียนใหม่"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}>
                <TextField
                  select
                  label="วัน"
                  fullWidth
                  value={formData.dayOfWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, dayOfWeek: Number(e.target.value) })
                  }
                >
                  {Object.entries(DAY_NAMES).map(([key, name]) => (
                    <MenuItem key={key} value={Number(key)}>
                      {name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={6}>
                <TextField
                  label="คาบที่"
                  type="number"
                  fullWidth
                  value={formData.period}
                  onChange={(e) =>
                    setFormData({ ...formData, period: Number(e.target.value) })
                  }
                  required
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  select
                  label="ปีการศึกษา"
                  fullWidth
                  value={formData.schoolYearId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      schoolYearId: Number(e.target.value),
                    })
                  }
                  required
                >
                  {schoolYears.map((sy) => (
                    <MenuItem key={sy.id} value={sy.id}>
                      {sy.yearName} {sy.isActive ? "(ปัจจุบัน)" : ""}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={12}>
                <TextField
                  select
                  label="ภาคเรียน"
                  fullWidth
                  value={formData.semesterId}
                  onChange={(e) =>
                    setFormData({ ...formData, semesterId: Number(e.target.value) })
                  }
                  required
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                </TextField>
              </Grid>

              <Grid size={6}>
                <TextField
                  label="เวลาเริ่มต้น"
                  type="time"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  label="เวลาสิ้นสุด"
                  type="time"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  select
                  label="รายวิชา"
                  fullWidth
                  value={formData.subjectId}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectId: Number(e.target.value) })
                  }
                  required
                >
                  {subjects.map((sub) => (
                    <MenuItem key={sub.id} value={sub.id}>
                      {sub.subjectCode} - {sub.subjectName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={12}>
                <TextField
                  select
                  label="ครูผู้สอน"
                  fullWidth
                  value={formData.teacherId}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherId: Number(e.target.value) })
                  }
                  required
                >
                  {teachers.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {getTeacherName(t)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={12}>
                <TextField
                  select
                  label="ห้องเรียน"
                  fullWidth
                  value={formData.classroomId}
                  onChange={(e) =>
                    setFormData({ ...formData, classroomId: Number(e.target.value) })
                  }
                  required
                >
                  {classrooms.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {getClassroomName(c)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} color="inherit">
              ยกเลิก
            </Button>
            <Button type="submit" variant="contained">
              {editId ? "บันทึกการแก้ไข" : "บันทึก"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}