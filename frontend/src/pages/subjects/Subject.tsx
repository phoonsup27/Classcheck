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
    IconButton,
} from "@mui/material";

import {
    Add,
    Edit,
    Delete,
} from "@mui/icons-material";

import { useEffect, useState, useCallback } from "react";

interface Subject {
    id: number;
    subjectCode: string;
    subjectName: string;
    credit: number;
}

export default function SubjectPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [subjectCode, setSubjectCode] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [credit, setCredit] = useState<number>(1);

    // =========================
    // โหลดรายวิชา (ใช้ useCallback เพื่อให้เรียกซ้ำข้างนอกได้)
    // =========================
    const fetchSubjects = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:3000/subjects");
            const data = await res.json();
            setSubjects(data.data || []);
        } catch (error) {
            console.error("โหลดรายวิชาไม่สำเร็จ", error);
        }
    }, []);

    // =========================
    // ดึงข้อมูลเมื่อโหลดหน้า (ย้ายโค้ดข้างในมาไว้ในนี้ตามกฎ Linter ใหม่)
    // =========================
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const res = await fetch("http://localhost:3000/subjects");
                const data = await res.json();
                setSubjects(data.data || []);
            } catch (error) {
                console.error("โหลดรายวิชาไม่สำเร็จ", error);
            }
        };

        loadInitialData();
    }, []);

    // =========================
    // เปิด Dialog เพิ่ม
    // =========================
    const handleOpenAdd = () => {
        setEditingId(null);
        setSubjectCode("");
        setSubjectName("");
        setCredit(1);
        setOpen(true);
    };

    // =========================
    // เปิด Dialog แก้ไข
    // =========================
    const handleOpenEdit = (subject: Subject) => {
        setEditingId(subject.id);
        setSubjectCode(subject.subjectCode);
        setSubjectName(subject.subjectName);
        setCredit(subject.credit);
        setOpen(true);
    };

    // =========================
    // ปิด Dialog
    // =========================
    const handleClose = () => {
        setOpen(false);
    };

    // =========================
    // เพิ่ม / แก้ไข
    // =========================
    const handleSubmit = async () => {
        try {
            if (!subjectCode || !subjectName) {
                alert("กรุณากรอกรหัสวิชาและชื่อวิชา");
                return;
            }

            const body = {
                subjectCode,
                subjectName,
                credit: Number(credit),
            };

            const url = editingId !== null
                ? `http://localhost:3000/subjects/${editingId}`
                : "http://localhost:3000/subjects";

            const method = editingId !== null ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "บันทึกข้อมูลไม่สำเร็จ");
            }

            setOpen(false);
            await fetchSubjects();

        } catch (error: unknown) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้";
            alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
        }
    };

    // =========================
    // ลบรายวิชา
    // =========================
    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("ต้องการลบรายวิชานี้หรือไม่?");
        if (!confirmDelete) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/subjects/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("ลบรายวิชาไม่สำเร็จ");
            }

            await fetchSubjects();

        } catch (error: unknown) {
            console.error(error);
            alert("ไม่สามารถลบรายวิชาได้");
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Title */}
            <Typography
                variant="h5"
                sx={{
                    mb: 3,
                    fontWeight: 600,
                }}
            >
                รายวิชา
            </Typography>

            {/* Add Button */}
            <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenAdd}
                sx={{
                    mb: 2,
                }}
            >
                เพิ่มรายวิชา
            </Button>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>รหัสวิชา</TableCell>
                            <TableCell>ชื่อวิชา</TableCell>
                            <TableCell>หน่วยกิต</TableCell>
                            <TableCell align="center">จัดการ</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {subjects.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    align="center"
                                >
                                    ยังไม่มีข้อมูลรายวิชา
                                </TableCell>
                            </TableRow>
                        ) : (
                            subjects.map((subject) => (
                                <TableRow
                                    key={subject.id}
                                    hover
                                >
                                    <TableCell>{subject.subjectCode}</TableCell>
                                    <TableCell>{subject.subjectName}</TableCell>
                                    <TableCell>{subject.credit}</TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenEdit(subject)}
                                        >
                                            <Edit />
                                        </IconButton>

                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(subject.id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingId !== null ? "แก้ไขรายวิชา" : "เพิ่มรายวิชา"}
                </DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        label="รหัสวิชา"
                        value={subjectCode}
                        onChange={(e) => setSubjectCode(e.target.value)}
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="ชื่อวิชา"
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="หน่วยกิต"
                        type="number"
                        value={credit}
                        onChange={(e) => setCredit(Number(e.target.value))}
                        margin="normal"
                        slotProps={{
                            htmlInput: {
                                min: 0,
                                step: 0.5,
                            },
                        }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>
                        ยกเลิก
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                    >
                        {editingId !== null ? "บันทึกการแก้ไข" : "เพิ่มรายวิชา"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}