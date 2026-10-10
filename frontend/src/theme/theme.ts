import { createTheme } from "@mui/material/styles";


const theme = createTheme({

    palette: {

        primary: {
            main: "#E91E63", // ชมพูหลัก
            contrastText:"#FFFFFF"
        },


        secondary: {
            main:"#757575", // เทา
        },


        background: {

            default:"#F5F5F5", // พื้นหลัง

            paper:"#FFFFFF" // Card

        },


        text: {

            primary:"#333333",

            secondary:"#757575"

        }

    },



    shape: {

        borderRadius:12,

    },



    typography: {

        fontFamily:"Prompt, Roboto, sans-serif",

        h5:{
            fontWeight:600
        },

        h4:{
            fontWeight:700
        }

    },



    components:{


        // ปุ่มทั้งหมด

        MuiButton:{

            styleOverrides:{

                root:{

                    textTransform:"none",

                    borderRadius:10,

                    fontWeight:500

                }

            }

        },



        // Card

        MuiCard:{

            styleOverrides:{

                root:{

                    borderRadius:16,

                    boxShadow:
                    "0 4px 12px rgba(0,0,0,0.08)"

                }

            }

        },



        // ตาราง

        MuiTableCell:{

            styleOverrides:{

                head:{

                    fontWeight:600,

                    backgroundColor:"#F8BBD0"

                }

            }

        }



    }


});


export default theme;