import { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth.api";
import axios from "axios";

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await login(username, password);

            // ดึงข้อมูลมารองรับทั้งกรณีมี data หุ้ม หรือส่งมาตรงๆ
            const responseData = res.data?.data || res.data;

            if (responseData && responseData.token && responseData.user) {
                // 1. เก็บ Token สำหรับใช้แนบไปกับ API อื่นๆ
                localStorage.setItem("token", responseData.token);

                // 2. เก็บข้อมูลผู้ใช้ (ซึ่งมี teacherId อยู่ในนี้แล้ว) เป็น String
                localStorage.setItem("user", JSON.stringify(responseData.user));

                const user = responseData.user;

                // 3. 🎯 เช็กเงื่อนไขเปลี่ยนหน้าตามบทบาท
                // ถ้าเป็นครู (มี teacherId หรือ role เป็น teacher) ให้ไปหน้าห้องเรียน
                if (user.teacherId || user.role === "teacher") {
                    navigate("/classrooms"); // 👈 เปลี่ยน Path หน้าห้องเรียนตรงนี้ถ้าโปรเจกต์คุณใช้ชื่ออื่น เช่น /teacher/classrooms
                } else {
                    // ถ้าเป็น Admin หรือบทบาทอื่นๆ ให้ไปหน้า Dashboard
                    navigate("/dashboard");
                }
            } else {
                setError("รูปแบบข้อมูลจากเซิร์ฟเวอร์ไม่ถูกต้อง");
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    (err.response?.data as { message?: string })?.message ??
                    "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบรหัสผ่านอีกครั้ง"
                );
            } else {
                setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box
            sx={{
                bgcolor: "#F5F7FA",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <Card sx={{ width: 420 }}>
                <CardContent>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            textAlign: "center",
                            mb: 4,
                            fontWeight: "bold",
                            color: "#333",
                        }}
                    >
                        ClassCheck
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        label="Username"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                    />

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        onKeyDown={(e) => {
                            // กด Enter แล้ว Login ได้เลย
                            if (e.key === 'Enter') {
                                handleLogin();
                            }
                        }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ 
                            mt: 3, 
                            py: 1.5,
                            bgcolor: "#E91E63", 
                            "&:hover": { bgcolor: "#C2185B" }
                        }}
                        onClick={handleLogin}
                        disabled={loading || !username || !password}
                    >
                        {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}