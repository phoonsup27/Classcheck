import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

import {
  People,
  School,
  Class,
  FactCheck,
} from "@mui/icons-material";

import { useEffect, useState } from "react";

// ============================================================
// Types
// ============================================================

interface ReportData {
  students: number;
  teachers: number;
  classrooms: number;
  attendanceRate: string;
}

interface AttendanceRecord {
  id?: string | number;
  attendanceDate?: string;
  subjectName?: string;
  studentName?: string;
  status?: string;
}

interface RawAttendanceItem {
  id?: string | number;
  attendanceDate?: string;
  date?: string;
  createdAt?: string;
  status?: string;

  subjectName?: string;
  studentName?: string;

  schedule?: {
    subject?: {
      name?: string;
    };
  };

  subject?: {
    name?: string;
  };

  student?: {
    firstName?: string;
    lastName?: string;
  };
}

// ============================================================
// Component
// ============================================================

export default function ReportPage() {
  const [year, setYear] = useState<number>(2569);
  const [semester, setSemester] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);

  const [reportData, setReportData] =
    useState<ReportData>({
      students: 0,
      teachers: 0,
      classrooms: 0,
      attendanceRate: "0%",
    });

  const [recentAttendance, setRecentAttendance] =
    useState<AttendanceRecord[]>([]);

  // ============================================================
  // Load Report
  // ============================================================

  useEffect(() => {
    let isMounted = true;

    const fetchReportData = async () => {
      setLoading(true);

      try {
        // ======================================================
        // Token
        // ======================================================

        const token =
          localStorage.getItem("token");

        if (!token) {
          console.error(
            "ไม่พบ token ใน localStorage"
          );

          if (isMounted) {
            setReportData({
              students: 0,
              teachers: 0,
              classrooms: 0,
              attendanceRate: "0%",
            });

            setRecentAttendance([]);
          }

          return;
        }

        // ======================================================
        // Headers
        // ======================================================

        const headers: HeadersInit = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // ======================================================
        // Backend ของโปรเจกต์คุณ mount เป็น:
        //
        // /reports
        // /attendances
        //
        // ไม่ใช่ /api/attendance
        // ======================================================

        const reportUrl =
          `http://localhost:3000/reports?year=${year}&semester=${semester}`;

        const attendanceUrl =
          "http://localhost:3000/attendances";

        console.log(
          "Loading report:",
          reportUrl
        );

        console.log(
          "Loading attendance:",
          attendanceUrl
        );

        // ======================================================
        // เรียก API พร้อมกัน
        // ======================================================

        const [
          reportRes,
          attendanceRes,
        ] = await Promise.all([
          fetch(reportUrl, {
            method: "GET",
            headers,
          }),

          fetch(attendanceUrl, {
            method: "GET",
            headers,
          }),
        ]);

        // ======================================================
        // ตรวจ Token หมดอายุ
        // ======================================================

        if (
          reportRes.status === 401 ||
          attendanceRes.status === 401
        ) {
          console.error(
            "Token หมดอายุหรือไม่ถูกต้อง"
          );

          return;
        }

        // ======================================================
        // REPORT
        // ======================================================

        if (reportRes.ok) {
          const data =
            await reportRes.json();

          console.log(
            "REPORT API RESPONSE:",
            data
          );

          const reportObj =
            data?.data || data || {};

          if (isMounted) {
            setReportData({
              students:
                Number(
                  reportObj.students ??
                    reportObj.totalStudents ??
                    0
                ),

              teachers:
                Number(
                  reportObj.teachers ??
                    reportObj.totalTeachers ??
                    0
                ),

              classrooms:
                Number(
                  reportObj.classrooms ??
                    reportObj.totalClassrooms ??
                    0
                ),

              attendanceRate:
                reportObj.attendanceRate ??
                reportObj.attendancePercentage ??
                "0%",
            });
          }
        } else {
          console.error(
            "Report API Error:",
            reportRes.status,
            await reportRes.text()
          );
        }

        // ======================================================
        // ATTENDANCE
        // ======================================================

        if (attendanceRes.ok) {
          const attData =
            await attendanceRes.json();

          console.log(
            "ATTENDANCE API RESPONSE:",
            attData
          );

          const rawList: RawAttendanceItem[] =
            attData?.data ||
            (Array.isArray(attData)
              ? attData
              : []);

          const formattedList: AttendanceRecord[] =
            rawList.map(
              (
                item: RawAttendanceItem
              ) => ({
                id: item.id,

                attendanceDate:
                  item.attendanceDate ||
                  item.date ||
                  item.createdAt,

                subjectName:
                  item.subjectName ||
                  item.schedule?.subject
                    ?.name ||
                  item.subject?.name ||
                  "-",

                studentName:
                  item.studentName ||
                  (
                    item.student
                      ? `${item.student.firstName || ""} ${
                          item.student.lastName || ""
                        }`.trim()
                      : ""
                  ) ||
                  "-",

                status:
                  item.status || "-",
              })
            );

          if (isMounted) {
            setRecentAttendance(
              formattedList
            );
          }
        } else {
          console.error(
            "Attendance API Error:",
            attendanceRes.status,
            await attendanceRes.text()
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch reports:",
          error
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReportData();

    return () => {
      isMounted = false;
    };
  }, [year, semester]);

  // ============================================================
  // Status
  // ============================================================

  const renderStatusChip = (
    status?: string
  ) => {
    switch (status) {
      case "PRESENT":
      case "มาเรียน":
      case "มา":
        return (
          <Chip
            label="มาเรียน"
            color="success"
            size="small"
            variant="outlined"
          />
        );

      case "LATE":
      case "สาย":
        return (
          <Chip
            label="สาย"
            color="warning"
            size="small"
            variant="outlined"
          />
        );

      case "LEAVE":
      case "ลา":
        return (
          <Chip
            label="ลา"
            color="info"
            size="small"
            variant="outlined"
          />
        );

      case "ABSENT":
      case "ขาด":
        return (
          <Chip
            label="ขาด"
            color="error"
            size="small"
            variant="outlined"
          />
        );

      default:
        return (
          <Chip
            label={status || "-"}
            size="small"
            variant="outlined"
          />
        );
    }
  };

  // ============================================================
  // Cards
  // ============================================================

  const reports = [
    {
      title: "นักเรียนทั้งหมด",
      value: reportData.students,

      icon: (
        <People
          sx={{
            color: "#1976d2",
            fontSize: {
              xs: 32,
              sm: 40,
            },
          }}
        />
      ),

      bgColor: "#e3f2fd",
    },

    {
      title: "ครูทั้งหมด",
      value: reportData.teachers,

      icon: (
        <School
          sx={{
            color: "#2e7d32",
            fontSize: {
              xs: 32,
              sm: 40,
            },
          }}
        />
      ),

      bgColor: "#e8f5e9",
    },

    {
      title: "ห้องเรียน",
      value: reportData.classrooms,

      icon: (
        <Class
          sx={{
            color: "#ed6c02",
            fontSize: {
              xs: 32,
              sm: 40,
            },
          }}
        />
      ),

      bgColor: "#fff3e0",
    },

    {
      title: "การเข้าเรียน",
      value: reportData.attendanceRate,

      icon: (
        <FactCheck
          sx={{
            color: "#9c27b0",
            fontSize: {
              xs: 32,
              sm: 40,
            },
          }}
        />
      ),

      bgColor: "#f3e5f5",
    },
  ];

  // ============================================================
  // UI
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        pb: 4,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: {
            xs: 2,
            sm: 3,
          },

          fontWeight: "bold",

          fontSize: {
            xs: "1.5rem",
            sm: "2rem",
            md: "2.125rem",
          },
        }}
      >
        รายงานสรุป
      </Typography>

      {/* ======================================================
          Filters
      ====================================================== */}

      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },

          gap: 2,
          mb: 4,
        }}
      >
        <FormControl
          sx={{
            minWidth: {
              xs: "100%",
              sm: 200,
            },
          }}
          size="small"
        >
          <InputLabel>
            ปีการศึกษา
          </InputLabel>

          <Select
            value={year}
            label="ปีการศึกษา"
            onChange={(e) =>
              setYear(
                Number(e.target.value)
              )
            }
          >
            <MenuItem value={2568}>
              2568
            </MenuItem>

            <MenuItem value={2569}>
              2569
            </MenuItem>

            <MenuItem value={2570}>
              2570
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl
          sx={{
            minWidth: {
              xs: "100%",
              sm: 200,
            },
          }}
          size="small"
        >
          <InputLabel>
            ภาคเรียน
          </InputLabel>

          <Select
            value={semester}
            label="ภาคเรียน"
            onChange={(e) =>
              setSemester(
                Number(e.target.value)
              )
            }
          >
            <MenuItem value={1}>
              ภาคเรียนที่ 1
            </MenuItem>

            <MenuItem value={2}>
              ภาคเรียนที่ 2
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ======================================================
          Loading
      ====================================================== */}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* ==================================================
              Cards
          ================================================== */}

          <Grid
            container
            spacing={{
              xs: 2,
              sm: 2.5,
              md: 3,
            }}
            sx={{
              mb: 4,
            }}
          >
            {reports.map((item) => (
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
                key={item.title}
              >
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    transition: "0.3s",
                    height: "100%",

                    "&:hover": {
                      transform:
                        "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: {
                        xs: 2,
                        sm: 2.5,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 0,
                          pr: 1,
                        }}
                      >
                        <Typography
                          color="text.secondary"
                          variant="subtitle1"
                          sx={{
                            fontWeight:
                              "medium",

                            fontSize: {
                              xs: "0.875rem",
                              sm: "1rem",
                            },

                            wordBreak:
                              "break-word",
                          }}
                        >
                          {item.title}
                        </Typography>

                        <Typography
                          component="h2"
                          variant="h4"
                          sx={{
                            mt: 0.5,
                            fontWeight:
                              "bold",

                            fontSize: {
                              xs: "1.5rem",
                              sm: "2rem",
                            },
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: {
                            xs: 1.2,
                            sm: 1.5,
                          },

                          borderRadius: 2,

                          backgroundColor:
                            item.bgColor,

                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",

                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* ==================================================
              Attendance History
          ================================================== */}

          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: "bold",
              }}
            >
              ประวัติการบันทึกการเข้าเรียนล่าสุด
            </Typography>

            <TableContainer>
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
                      วันที่
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          "bold",
                      }}
                    >
                      วิชา
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          "bold",
                      }}
                    >
                      นักเรียน
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          "bold",
                      }}
                    >
                      สถานะ
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {recentAttendance.length ===
                  0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                      >
                        ไม่พบข้อมูลการบันทึกการเข้าเรียน
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentAttendance
                      .slice(0, 10)
                      .map(
                        (
                          row,
                          idx
                        ) => (
                          <TableRow
                            key={
                              row.id ||
                              idx
                            }
                            hover
                          >
                            <TableCell>
                              {row.attendanceDate
                                ? new Date(
                                    row.attendanceDate
                                  ).toLocaleDateString(
                                    "th-TH"
                                  )
                                : "-"}
                            </TableCell>

                            <TableCell>
                              {
                                row.subjectName
                              }
                            </TableCell>

                            <TableCell>
                              {
                                row.studentName
                              }
                            </TableCell>

                            <TableCell>
                              {renderStatusChip(
                                row.status
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}