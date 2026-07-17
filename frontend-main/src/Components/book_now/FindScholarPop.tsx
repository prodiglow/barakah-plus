import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Avatar,
  Button,
  Grid,
  Rating,
  IconButton,
  Pagination,
  useTheme,
  useMediaQuery,
  DialogTitle,
  Dialog,
  DialogContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { fetchScholars } from "../../services/scholarService";
import { Scholar } from "../../types/Scholars";
import ScholarDetailsPop from "./ScholarDetailsPop";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  border: "1px solid #e0e0e0",
  boxShadow: "0px 2px 6px rgba(0,0,0,0.08)",
  textAlign: "center",
  padding: theme.spacing(3),
  height: "auto",
  minHeight: "380px",
  width: "100%",
  maxWidth: "430px",
  margin: "auto",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0px 6px 14px rgba(0,0,0,0.12)",
  },

  // ✅ Responsive adjustments for all devices
  [theme.breakpoints.down("lg")]: {
    padding: theme.spacing(2.5),
    minHeight: "370px",
  },
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(2),
    minHeight: "360px",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    minHeight: "340px",
    maxWidth: "100%",
  },
  [theme.breakpoints.down("xs")]: {
    padding: theme.spacing(1),
    minHeight: "320px",
  },
}));

const ProfileButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#F0FAF4",
  color: "#00884A",
  border: "1px solid #D6EDE0",
  borderRadius: "8px",
  padding: "6px 12px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.85rem",
  minWidth: "auto",
  "&:hover": {
    backgroundColor: "#E6F6EC",
  },

  // ✅ Responsive button text
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.8rem",
    padding: "4px 8px",
  },
  [theme.breakpoints.down("xs")]: {
    fontSize: "0.75rem",
    padding: "4px 6px",
  },
}));

const BookButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#00884A",
  color: "#fff",
  borderRadius: "8px",
  padding: "6px 12px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.85rem",
  minWidth: "auto",
  "&:hover": {
    backgroundColor: "#006C3B",
  },

  // ✅ Responsive button text
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.8rem",
    padding: "4px 8px",
  },
  [theme.breakpoints.down("xs")]: {
    fontSize: "0.75rem",
    padding: "4px 6px",
  },
}));
interface FindScholarPopProps {
  onSelectScholar: (scholar: Scholar) => void;
  serviceFilter?: string;
}

const FindScholarPop: React.FC<FindScholarPopProps> = ({ onSelectScholar, serviceFilter }) => {
  const handleCloseDialog = () => setOpenDialog(false);
  const [selectedScholar, setSelectedScholar] = useState<Scholar | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadScholars = async () => {
      try {
        const data = await fetchScholars();
        // Filter scholars if serviceFilter is provided
        const filteredData = serviceFilter
          ? data.filter(s => {
            const keywords = serviceFilter.toLowerCase().split(",").map(k => k.trim()).filter(k => k);
            return s.scholarServices?.some(service =>
              keywords.some(keyword => service.name.toLowerCase().includes(keyword))
            );
          })
          : data;

        setScholars(filteredData);

      } catch (error) {
        console.error("Error fetching scholars:", error);
      } finally {
        setLoading(false);
      }
    };

    loadScholars();
  }, []);

  if (loading) {
    return (
      <Typography textAlign="center" mt={5}>
        Loading scholars...
      </Typography>
    );
  }

  // Pagination logic
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedScholars = scholars.slice(
    startIndex,
    startIndex + itemsPerPage
  );


  const handleViewProfile = (scholar: Scholar) => {
    setSelectedScholar(scholar);
    setOpenDialog(true);
  };
  const handleSelectScholar = (scholar: Scholar) => {
    onSelectScholar(scholar);
  };

  return (
    <Box sx={{
      py: { xs: 4, sm: 5, md: 6 },
      px: { xs: 2, sm: 3, md: 4, lg: 6 },
      backgroundColor: "#F8FAFB"
    }}>
      {/* ✅ Header with enhanced responsiveness */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          textAlign: { xs: "center", sm: "center", md: "left" },
          color: "#2E2E2E",
          mb: 1,
          pl: { xs: 0, sm: 0, md: "110px" },
          fontSize: {
            xs: "1.75rem",
            sm: "2rem",
            md: "2.125rem",
            lg: "2.25rem"
          },
        }}
      >
        Find Your Scholar
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", sm: "center", md: "flex-start" },
          alignItems: "center",
          mb: { xs: 3, sm: 4, md: 5 },
          pl: { xs: 0, sm: 0, md: "110px" },
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: "#666",
            mr: 1,
            fontSize: { xs: "0.875rem", sm: "1rem" }
          }}
        >
          Clients rate our Scholars
        </Typography>
        <Rating value={4.8} precision={0.1} readOnly size="small" />
        <Typography
          variant="body1"
          sx={{
            ml: 1,
            fontWeight: 600,
            color: "#333",
            fontSize: { xs: "0.875rem", sm: "1rem" }
          }}
        >
          4.8/5.0
        </Typography>
      </Box>

      {/* ✅ Scholar Grid with enhanced responsive sizing */}
      <Grid
        container
        spacing={{ xs: 2, sm: 2, md: 3 }}
        justifyContent="center"
        sx={{
          width: "100%",
          maxWidth: "1400px",
          margin: "auto",
          px: { xs: 1, sm: 2 }
        }}
      >
        {paginatedScholars.map((scholar, index) => (
          <Grid
            key={index}
            size={{
              xs: 12,    // 1 column on extra small devices
              sm: 6,     // 2 columns on small devices
              md: 4,     // 3 columns on medium devices
              lg: 4,     // 3 columns on large devices
            }}
            sx={{ display: "flex" }}
          >

            <StyledCard>
              <Avatar
                src={scholar.ProfileImg}
                alt={scholar.scholarName}
                sx={{
                  width: { xs: 120, sm: 140, md: 160, lg: 180 },
                  height: { xs: 120, sm: 140, md: 160, lg: 180 },
                  margin: "0 auto 12px",
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: "#222",
                  fontSize: {
                    xs: "1rem",
                    sm: "1.1rem",
                    md: "1.25rem"
                  }
                }}
              >
                {scholar.scholarName}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Rating
                  name="scholar-rating"
                  value={scholar.rating}
                  precision={0.1}
                  readOnly
                  size="small"
                />
                <Typography
                  variant="body2"
                  sx={{
                    ml: 1,
                    fontWeight: 600,
                    color: "#333",
                    fontSize: { xs: "0.8rem", sm: "0.875rem" }
                  }}
                >
                  {scholar.rating}/5
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#555",
                  mt: 1,
                  mb: 2,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" }
                }}
              >
                <WorkOutlineIcon sx={{ fontSize: { xs: 16, sm: 18 }, mr: 0.5 }} />
                {scholar.blessings} blessings done
              </Box>
              <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1
              }}>

                <ProfileButton
                  onClick={() => handleViewProfile(scholar)}
                  sx={{ flex: 1 }}
                >
                  View Profile
                </ProfileButton>

                <BookButton onClick={() => handleSelectScholar(scholar)}
                  sx={{ flex: 1 }} >
                  Select Scholar
                </BookButton>
              </Box>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {/* ✅ Responsive Pagination - Fixed the size prop issue */}
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        mt: { xs: 3, sm: 4, md: 5 },
        px: { xs: 1, sm: 2 }
      }}>
        <Pagination
          count={Math.ceil(scholars.length / itemsPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          shape="rounded"
          size={isSmallScreen ? "small" : "medium"}
          sx={{
            "& .MuiPaginationItem-root": {
              color: "#2e7d32",
              fontSize: { xs: "0.75rem", sm: "0.875rem" }
            },
            "& .MuiPaginationItem-root.Mui-selected": {
              backgroundColor: "#2e7d32",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#1b5e20",
              },
            },
          }}
        />
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth={false} // disable default sizing
        fullWidth
        PaperProps={{
          sx: {
            width: { sx: "95%", xs: "95%", md: "60%" }, // 👈 custom width
            height: "1000px", // 👈 custom height
            borderRadius: "16px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            backgroundColor: "#006c3b",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Scholar Details
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              color: "#fff",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            overflowY: "auto",
            height: "calc(1000px - 64px)", // subtract header height
          }}
        >
          {selectedScholar && (
            <ScholarDetailsPop
              scholar={selectedScholar}
              onSelect={(scholar) => {
                handleSelectScholar(scholar); // Selects scholar in parent
                handleCloseDialog();          // Closes this details popup
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FindScholarPop;