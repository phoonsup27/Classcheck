import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

export default function Topbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        right: 0,
      }}
    >
      <Toolbar>
        {/* ตัวดันพื้นที่ว่างเพื่อให้เมนUpโปรไฟล์ไปอยู่ขวาสุด */}
        <Box sx={{ flexGrow: 1 }} />

        {/* เมนูผู้ใช้งานมุมขวา */}
        <Box>
          <IconButton onClick={handleMenu} color="inherit">
            <Avatar sx={{ bgcolor: "secondary.main" }}>
              {user.username?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled sx={{ opacity: "1 !important", color: "text.primary" }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {user.username || "Unknown User"}
              </Typography>
            </MenuItem>
            <MenuItem onClick={logout} sx={{ color: "error.main" }}>
              ออกจากระบบ
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}