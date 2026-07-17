import React from "react";
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    IconButton,
    Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";



interface PersonalDuaDialogProps {
    open: boolean;
    onClose: () => void;
    onPaidOptionSelect: () => void;
    onFreeOptionSelect: () => void;
    onOpenLogin?: () => void;
}

const PersonalDuaDialog: React.FC<PersonalDuaDialogProps> = ({
    open,
    onClose,
    onPaidOptionSelect,
    onFreeOptionSelect,
}) => {
    const handleFreeOption = () => {
        onClose();
        onFreeOptionSelect();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    padding: "20px",
                },
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    p: 0,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    color: "#212121",
                }}
            >
                Choose Personal Dua Option
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                        "&:hover": {
                            backgroundColor: (theme) => theme.palette.grey[100],
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* Paid Option */}
                    <Box
                        sx={{
                            border: "2px solid #e0e0e0",
                            borderRadius: "12px",
                            padding: "20px",
                            textAlign: "center",
                            transition: "all 0.3s ease-in-out",
                            "&:hover": {
                                borderColor: "#1db954",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            },
                        }}
                    >

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => {
                                onClose();
                                onPaidOptionSelect();
                            }}
                            sx={{
                                mb: 1,
                                fontWeight: "bolder",
                                borderRadius: "10px",
                                background: "linear-gradient(90deg, #1db954, #11998e)",
                                textTransform: "none",
                                py: 1.5,
                                transition: "all 0.3s ease-in-out",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                },
                            }}
                        >
                            Request Personal Dua With Hadiya &nbsp;  <Tooltip title="All Baraka comes only from Allah (SWT). This contribution is not for the Dua or its Baraka, but only to support the platform’s costs and compensate our esteemed scholar’s for their time and effort." arrow placement="top">
                                <InfoOutlinedIcon sx={{ fontSize: 18, color: "white", cursor: "pointer" }} />
                            </Tooltip>
                        </Button>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                            <Typography variant="body2" sx={{ color: "#757575" }}>
                                You can select a verified scholar of your choice
                            </Typography>
                        </Box>
                    </Box>

                    {/* Free Option */}
                    <Box
                        sx={{
                            border: "2px solid #e0e0e0",
                            borderRadius: "12px",
                            padding: "20px",
                            textAlign: "center",
                            transition: "all 0.3s ease-in-out",
                            "&:hover": {
                                borderColor: "#1db954",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            },
                        }}
                    >

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleFreeOption}
                            sx={{
                                mb: 1,
                                borderRadius: "10px",
                                background: "linear-gradient(90deg, #1db954, #11998e)",
                                textTransform: "none",
                                py: 1.5,
                                fontWeight: "bolder",
                                transition: "all 0.3s ease-in-out",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                },
                            }}
                        >
                            Request Personal Dua Without Hadiya
                        </Button>
                        <Typography variant="body2" sx={{ color: "#757575" }}>
                            Baraka platform will pay for this service
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PersonalDuaDialog;
