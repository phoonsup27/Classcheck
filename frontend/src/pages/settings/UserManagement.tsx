import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from "@mui/material";
import { Add, Edit, Delete, PersonAdd } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";

// =====================
// Type Definition
// =====================
interface Role {
  id: number;
  roleName: string;
  description?: string;
}

interface UserType {
  id: number;
  username: string;
  roleId?: number;
  role?: Role;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // ฟอร์มสำหรับเพิ่ม/แก้ไขผู้ใช้
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [roleId, setRoleId] = useState<string>("4"); // ค่าเริ่มต้น Teacher

  const token = localStorage.getItem("token");

  // =====================
  // Load Data
  // =====================
  const fetchUsers = useCallback(async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const res = await fetch("http://localhost:3000/users", { headers });
      const data = await res.json();
      setUsers(data.data ?? data);
    } catch (error: unknown) {
      console.error("Failed to fetch users", error);
    }
  }, [token]);

  const fetchRoles = useCallback(async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const res = await fetch("http://localhost:3000/roles", { headers });
      const data = await res.json();
      setRoles(data.data ?? data);
    } catch (error: unknown) {
      console.error("Failed to fetch roles", error);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // =====================
  // Handle Dialog (Add / Edit)
  // =====================
  const handleOpenAdd = () => {
    setEditingId(null);
    setUsername("");
    setPassword("");
    setRoleId("4");
    setOpen(true);
  };

  const handleOpenEdit = (user: UserType) => {
    setEditingId(user.id);
    setUsername(user.username);
    setPassword(""); // เว้นว่างไว้ หากไม่ต้องการเปลี่ยนรหัสผ่าน
    setRoleId(String(user.roleId || 4));
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  // =====================
  // Handle Save (Create & Update)
  // =====================
  const handleSaveUser = async () => {
    if (!username) {
      alert("กรุณากรอกชื่อผู้ใช้งาน");
      return;
    }

    if (!editingId && !password) {
      alert("กรุณากรอกรหัสผ่านสำหรับผู้ใช้งานใหม่");
      return;
    }

    const payload: Record<string, unknown> = {
      username,
      roleId: Number(roleId)
    };

    // ส่งรหัสผ่านเฉพาะกรณีที่มีการกรอกเข้ามาใหม่
    if (password) {
      payload.password = password;
    }

    try {
      const url = editingId 
        ? `http://localhost:3000/users/${editingId}` 
        : "http://localhost:3000/users";
      
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save user");
      }

      alert(editingId ? "อัปเดตข้อมูลผู้ใช้สำเร็จ!" : "สร้างบัญชีผู้ใช้สำเร็จ!");
      setOpen(false);
      fetchUsers();

    } catch (error: unknown) {
      console.error("Error saving user:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert("เกิดข้อผิดพลาด: " + errorMessage);
    }
  };

  // =====================
  // Handle Delete
  // =====================
  const handleDeleteUser = async (id: number) => {
    if (window.confirm("คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?")) {
      try {
        const response = await fetch(`http://localhost:3000/users/${id}`, {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        alert("ลบผู้ใช้งานสำเร็จ");
        fetchUsers();
      } catch (error) {
        console.error("Failed to delete user", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          จัดการผู้ใช้งานระบบ
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAdd}
        >
          เพิ่มผู้ใช้งานใหม่
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>ชื่อผู้ใช้งาน (Username)</TableCell>
                  <TableCell>สิทธิ์การใช้งาน (Role)</TableCell>
                  <TableCell align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>
                      {u.role?.roleName || (u.roleId === 4 ? "Teacher" : `Role ID: ${u.roleId}`)}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        color="warning"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleOpenEdit(u)}
                        sx={{ mr: 1 }}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        ลบ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      ไม่พบข้อมูลผู้ใช้งาน
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog สำหรับเพิ่ม/แก้ไขผู้ใช้งาน */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มบัญชีผู้ใช้งานใหม่"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="ชื่อผู้ใช้งาน (Username)"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label={editingId ? "รหัสผ่านใหม่ (เว้นว่างไว้หากไม่เปลี่ยน)" : "รหัสผ่าน (Password)"}
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>สิทธิ์การใช้งาน (Role)</InputLabel>
              <Select
                value={roleId}
                label="สิทธิ์การใช้งาน (Role)"
                onChange={(e) => setRoleId(e.target.value)}
              >
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <MenuItem key={role.id} value={String(role.id)}>
                      {role.roleName} ({role.description || role.roleName})
                    </MenuItem>
                  ))
                ) : (
                  <>
                    <MenuItem value="1">Admin</MenuItem>
                    <MenuItem value="2">Director</MenuItem>
                    <MenuItem value="3">ViceDirector</MenuItem>
                    <MenuItem value="4">Teacher</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            ยกเลิก
          </Button>
          <Button onClick={handleSaveUser} variant="contained" startIcon={<PersonAdd />}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}