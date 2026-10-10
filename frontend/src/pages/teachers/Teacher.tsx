import { Delete, Edit } from "@mui/icons-material";
import {
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";

import { useEffect, useState, useMemo } from "react";

interface Teacher {
    id: number;
    teacherCode: string;
    fullName: string;
    position: string;
}

interface TeacherResponse {
    id: number;
    teacherCode: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    position: string;
}

export default function TeacherPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [form, setForm] = useState({
        fullname: "",
        position: "ครู",
    });

    // ==========================
    // ฟังก์ชันดึงข้อมูลครู (แยกไว้เรียกซ้ำตอนกดบันทึก/ลบ)
    // ==========================
    const loadTeacherData = async () => {
        try {
            const res = await fetch("http://localhost:3000/teachers");
            const result = await res.json();
            const data = result.data ?? result;
            const teacherList = data as TeacherResponse[];

            setTeachers(
                teacherList.map((teacher) => ({
                    id: teacher.id,
                    teacherCode: teacher.teacherCode,
                    fullName:
                        teacher.fullName ??
                        `${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`.trim(),
                    position: teacher.position,
                })),
            );
        } catch (error) {
            console.log(error);
        }
    };

    // ใช้ useEffect โหลดข้อมูลครั้งแรก โดยไม่เรียกฟังก์ชันที่มี setState ตรงๆ
    useEffect(() => {
        let isMounted = true;

        async function fetchInitialData() {
            try {
                const res = await fetch("http://localhost:3000/teachers");
                const result = await res.json();
                const data = result.data ?? result;
                const teacherList = data as TeacherResponse[];

                if (isMounted) {
                    setTeachers(
                        teacherList.map((teacher) => ({
                            id: teacher.id,
                            teacherCode: teacher.teacherCode,
                            fullName:
                                teacher.fullName ??
                                `${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`.trim(),
                            position: teacher.position,
                        })),
                    );
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchInitialData();

        return () => {
            isMounted = false;
        };
    }, []);

    // ==========================
    // ค้นหาข้อมูลครู (Filter)
    // ==========================
    const filteredTeachers = useMemo(() => {
        return teachers.filter((teacher) => {
            const query = searchQuery.toLowerCase();
            return (
                teacher.teacherCode?.toLowerCase().includes(query) ||
                teacher.fullName?.toLowerCase().includes(query) ||
                teacher.position?.toLowerCase().includes(query)
            );
        });
    }, [teachers, searchQuery]);

    // ==========================
    // เปิด Dialog เพิ่ม / แก้ไข
    // ==========================
    const handleOpenAdd = () => {
        setEditMode(false);
        setSelectedId(null);
        setForm({ fullname: "", position: "ครู" });
        setOpen(true);
    };

    const handleOpenEdit = (teacher: Teacher) => {
        setEditMode(true);
        setSelectedId(teacher.id);
        setForm({ fullname: teacher.fullName, position: teacher.position });
        setOpen(true);
    };

    // ==========================
    // เพิ่ม / แก้ไขครู (Save)
    // ==========================
    const handleSave = async () => {
        try {
            const url = editMode
                ? `http://localhost:3000/teachers/${selectedId}`
                : "http://localhost:3000/teachers";
            const method = editMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setForm({
                    fullname: "",
                    position: "ครู",
                });
                setOpen(false);
                loadTeacherData();
            } else {
                const result = await res.json();
                alert(result.message || "ไม่สามารถบันทึกข้อมูลได้");
            }
        } catch (error) {
            console.log(error);
        }
    };

    // ==========================
    // ลบข้อมูลครู (Delete)
    // ==========================
    const handleDelete = async (id: number) => {
        if (!confirm("คุณต้องการลบข้อมูลครูท่านนี้ใช่หรือไม่?")) return;

        try {
            const res = await fetch(`http://localhost:3000/teachers/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                loadTeacherData();
            } else {
                const result = await res.json();
                alert(result.message || "ไม่สามารถลบข้อมูลได้");
            }
        } catch (error) {
            console.log(error);
        }
    };

    // ==========================
    // Import Excel
    // ==========================
    const handleImport = async () => {
        if (!file) {
            alert("กรุณาเลือกไฟล์ Excel");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(
                "http://localhost:3000/api/teachers/import",
                {
                    method: "POST",
                    body: formData,
                },
            );

            const result = await res.json();

            if (res.ok) {
                alert("Import สำเร็จ");
                setFile(null);
                loadTeacherData();
            } else {
                alert(result.message || "Import ไม่สำเร็จ");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h4">ครู</Typography>

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                    }}
                >
                    <Button variant="contained" onClick={handleOpenAdd}>
                        + เพิ่มครู
                    </Button>

                    <Button variant="outlined" component="label">
                        {file ? file.name : "Import Excel"}

                        <input
                            hidden
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => {
                                if (e.target.files) {
                                    setFile(e.target.files[0]);
                                }
                            }}
                        />
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        disabled={!file}
                        onClick={handleImport}
                    >
                        นำเข้า
                    </Button>
                </Box>
            </Box>

            {/* Card */}
            <Card>
                <CardContent>
                    <TextField
                        fullWidth
                        label="ค้นหาครู (รหัส, ชื่อ, ตำแหน่ง)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            mb: 3,
                        }}
                    />

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>รหัสครู</TableCell>
                                    <TableCell>ชื่อ - นามสกุล</TableCell>
                                    <TableCell>ตำแหน่ง</TableCell>
                                    <TableCell align="center">จัดการ</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredTeachers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            ไม่พบข้อมูลครู
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTeachers.map((teacher) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell>{teacher.teacherCode}</TableCell>
                                            <TableCell>{teacher.fullName}</TableCell>
                                            <TableCell>{teacher.position}</TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    color="warning"
                                                    startIcon={<Edit />}
                                                    sx={{ mr: 1 }}
                                                    onClick={() => handleOpenEdit(teacher)}
                                                >
                                                    แก้ไข
                                                </Button>

                                                <Button
                                                    color="error"
                                                    startIcon={<Delete />}
                                                    onClick={() => handleDelete(teacher.id)}
                                                >
                                                    ลบ
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>{editMode ? "แก้ไขข้อมูลครู" : "เพิ่มครู"}</DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        label="ชื่อ-นามสกุล"
                        margin="normal"
                        value={form.fullname}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                fullname: e.target.value,
                            })
                        }
                    />

                    <TextField
                        fullWidth
                        label="ตำแหน่ง"
                        margin="normal"
                        value={form.position}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                position: e.target.value,
                            })
                        }
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpen(false)}>ยกเลิก</Button>

                    <Button variant="contained" onClick={handleSave}>
                        {editMode ? "บันทึกการแก้ไข" : "บันทึก"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}