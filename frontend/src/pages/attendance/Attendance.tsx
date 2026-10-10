import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid,
} from "@mui/material";

import { Save, Book } from "@mui/icons-material";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// =========================
// Type Definitions
// =========================

interface SubjectType {
    id: string | number;
    subjectCode?: string;
    subjectName?: string;
    code?: string;
    name?: string;
}

interface StudentType {
    id: string | number;
    studentCode?: string;
    code?: string;
    fullName: string;
    classroomId?: string | number;
    status?: string;
}

interface UserType {
    id?: string | number;
    username?: string;
    role?: string;
    teacherId?: string | number;
    [key: string]: unknown;
}

export default function Attendance() {
    const navigate = useNavigate();

    const [subjectId, setSubjectId] = useState<string>("");
    const [date, setDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );

    const [students, setStudents] = useState<StudentType[]>([]);
    const [subjects, setSubjects] = useState<SubjectType[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState<boolean>(true);

    // =========================
    // ดึงข้อมูล User
    // =========================

    const currentUser: UserType = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    }, []);

    // =========================
    // JWT Token
    // =========================

    const token = localStorage.getItem("token");

    // =========================
    // Helper แสดงชื่อรายวิชา
    // =========================

    const getSubjectLabel = (sub: SubjectType) => {
        const code =
            sub.subjectCode || sub.code
                ? `[${sub.subjectCode || sub.code}] `
                : "";

        const name =
            sub.subjectName ||
            sub.name ||
            "ไม่ระบุชื่อวิชา";

        return `${code}${name}`;
    };

    const selectedSubject = subjects.find(
        (s) => String(s.id) === String(subjectId)
    );

    // =========================
    // ดึงข้อมูล subjects และ students
    // =========================

    useEffect(() => {
        let isMounted = true;

        const loadInitialData = async () => {
            setLoadingSubjects(true);

            try {
                // ตรวจสอบ Token
                if (!token) {
                    alert("ไม่พบ Token กรุณาเข้าสู่ระบบใหม่");
                    navigate("/login");
                    return;
                }

                const teacherId = currentUser.teacherId;
                const role = currentUser.role;

                let subjectUrl = "http://localhost:3000/subjects";

                if (role === "Teacher" && teacherId) {
                    subjectUrl += `?teacherId=${teacherId}`;
                }

                // Header สำหรับ API
                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                };

                const [subRes, stdRes] = await Promise.all([
                    fetch(subjectUrl, {
                        headers,
                    }),

                    fetch("http://localhost:3000/students", {
                        headers,
                    }),
                ]);

                if (subRes.status === 401 || stdRes.status === 401) {
                    alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }

                if (!subRes.ok || !stdRes.ok) {
                    throw new Error(
                        "ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้"
                    );
                }

                const subData = await subRes.json();
                const stdData = await stdRes.json();

                if (isMounted) {
                    const fetchedSubjects =
                        subData.data ||
                        (Array.isArray(subData)
                            ? subData
                            : []);

                    const fetchedStudents =
                        stdData.data ||
                        (Array.isArray(stdData)
                            ? stdData
                            : []);

                    setSubjects(fetchedSubjects);

                    setStudents(
                        fetchedStudents.map(
                            (s: StudentType) => ({
                                ...s,
                                status: "มาเรียน",
                            })
                        )
                    );
                }
            } catch (error: unknown) {
                if (isMounted) {
                    console.error(
                        "โหลดข้อมูลไม่สำเร็จ:",
                        error
                    );

                    const message =
                        error instanceof Error
                            ? error.message
                            : "ไม่สามารถโหลดข้อมูลได้";

                    alert(message);
                }
            } finally {
                if (isMounted) {
                    setLoadingSubjects(false);
                }
            }
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, [
        currentUser.teacherId,
        currentUser.role,
        token,
        navigate,
    ]);

    // =========================
    // เปลี่ยนสถานะการเข้าเรียน
    // =========================

    const handleStatusChange = (
        id: string | number,
        newStatus: string
    ) => {
        setStudents((prevStudents) =>
            prevStudents.map((student) =>
                student.id === id
                    ? {
                          ...student,
                          status: newStatus,
                      }
                    : student
            )
        );
    };

    // =========================
    // บันทึกข้อมูลการเข้าเรียน
    // =========================

    const handleSaveAttendance = async () => {
        if (!subjectId) {
            alert("กรุณาเลือกรายวิชาก่อนบันทึก");
            return;
        }

        if (!token) {
            alert("ไม่พบ Token กรุณาเข้าสู่ระบบใหม่");
            navigate("/login");
            return;
        }

        const attendanceData = {
            attendanceDate: new Date(date).toISOString(),
            subjectId: Number(subjectId),
            checkedBy: Number(currentUser.id || 1),

            records: students.map((s) => ({
                studentId: Number(s.id),
                status: s.status,
            })),
        };

        try {
            const res = await fetch(
                "http://localhost:3000/attendances",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify(
                        attendanceData
                    ),
                }
            );

            const result = await res.json();

            if (res.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                alert(
                    "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
                );

                navigate("/login");
                return;
            }

            if (!res.ok) {
                throw new Error(
                    result.message ||
                        "บันทึกข้อมูลการเข้าเรียนไม่สำเร็จ"
                );
            }

            alert("บันทึกการเข้าเรียนสำเร็จ!");

            navigate("/reports");
        } catch (error: unknown) {
            console.error(error);

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "ไม่สามารถบันทึกข้อมูลได้";

            alert(
                `เกิดข้อผิดพลาด: ${errorMessage}`
            );
        }
    };

    // =========================
    // UI
    // =========================

    return (
        <Box sx={{ p: 3 }}>
            <Typography
                variant="h5"
                sx={{
                    mb: 3,
                    fontWeight: 600,
                }}
            >
                เช็คชื่อเข้าเรียน
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid
                        container
                        spacing={2}
                        sx={{ mb: 2 }}
                    >
                        <Grid
                            size={{
                                xs: 12,
                                md: 4,
                            }}
                        >
                            <TextField
                                type="date"
                                label="วันที่เช็คชื่อ"
                                fullWidth
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                value={date}
                                onChange={(e) =>
                                    setDate(
                                        e.target.value
                                    )
                                }
                            />
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                md: 8,
                            }}
                        >
                            <FormControl fullWidth>
                                <InputLabel>
                                    เลือกรายวิชา
                                </InputLabel>

                                <Select
                                    value={subjectId}
                                    label="เลือกรายวิชา"
                                    onChange={(e) =>
                                        setSubjectId(
                                            e.target.value
                                        )
                                    }
                                >
                                    <MenuItem value="">
                                        <em>
                                            {loadingSubjects
                                                ? "-- กำลังโหลดรายวิชา... --"
                                                : subjects.length ===
                                                    0
                                                  ? "-- ไม่พบข้อมูลรายวิชา --"
                                                  : "-- กรุณาเลือกวิชาที่สอน --"}
                                        </em>
                                    </MenuItem>

                                    {subjects.map(
                                        (sub) => (
                                            <MenuItem
                                                key={String(
                                                    sub.id
                                                )}
                                                value={String(
                                                    sub.id
                                                )}
                                            >
                                                {getSubjectLabel(
                                                    sub
                                                )}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* รายละเอียดรายวิชา */}

                    {selectedSubject && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: "#f5f5f5",
                                borderRadius: 2,
                                mb: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: 1,
                                }}
                            >
                                <Book color="primary" />

                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 600,
                                    }}
                                >
                                    {getSubjectLabel(
                                        selectedSubject
                                    )}
                                </Typography>
                            </Box>
                        </Paper>
                    )}

                    {/* ตารางนักเรียน */}

                    <TableContainer
                        component={Paper}
                        variant="outlined"
                    >
                        <Table>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        bgcolor:
                                            "#fafafa",
                                    }}
                                >
                                    <TableCell
                                        sx={{
                                            fontWeight:
                                                "bold",
                                        }}
                                    >
                                        รหัสนักเรียน
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight:
                                                "bold",
                                        }}
                                    >
                                        ชื่อ - สกุล
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight:
                                                "bold",
                                        }}
                                    >
                                        สถานะการเข้าเรียน
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {students.length ===
                                0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            align="center"
                                        >
                                            ไม่พบรายชื่อนักเรียน
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map(
                                        (student) => (
                                            <TableRow
                                                key={String(
                                                    student.id
                                                )}
                                                hover
                                            >
                                                <TableCell>
                                                    {student.studentCode ??
                                                        student.code ??
                                                        "-"}
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        student.fullName
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    <FormControl
                                                        size="small"
                                                    >
                                                        <Select
                                                            value={
                                                                student.status ||
                                                                "มาเรียน"
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleStatusChange(
                                                                    student.id,
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            sx={{
                                                                minWidth:
                                                                    120,

                                                                backgroundColor:
                                                                    student.status ===
                                                                    "ขาด"
                                                                        ? "#ffebee"
                                                                        : student.status ===
                                                                            "สาย"
                                                                          ? "#fffde7"
                                                                          : student.status ===
                                                                              "ลา"
                                                                            ? "#fff3e0"
                                                                            : "#e8f5e9",
                                                            }}
                                                        >
                                                            <MenuItem value="มาเรียน">
                                                                มาเรียน
                                                            </MenuItem>

                                                            <MenuItem value="สาย">
                                                                สาย
                                                            </MenuItem>

                                                            <MenuItem value="ลา">
                                                                ลา
                                                            </MenuItem>

                                                            <MenuItem value="ขาด">
                                                                ขาด
                                                            </MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* ปุ่มบันทึก */}

                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        sx={{ mt: 3 }}
                        onClick={
                            handleSaveAttendance
                        }
                        disabled={!subjectId}
                    >
                        บันทึกการเข้าเรียน
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}