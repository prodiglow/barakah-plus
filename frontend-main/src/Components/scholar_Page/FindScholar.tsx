import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Avatar,
  Button,
  Grid,
  Rating,
  Pagination,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { useNavigate } from "react-router-dom";
import { fetchScholars } from "../../services/scholarService";
import { Scholar } from "../../types/Scholars";
import { useTranslation } from "react-i18next";

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

const FindScholar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        setScholars(data);

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
        {t("scholars.loading")}
      </Typography>
    );
  }

  // const scholars = [
  //   {
  //     id: 1,
  //     name: "Dr. Siddiqa Akhtar",
  //     rating: 3.9,
  //     blessings: 250,
  //     image: scholler1,
  //   },
  //   {
  //     id: 2,
  //     name: "Hafiz Mubarak Hammed",
  //     rating: 4.9,
  //     blessings: 297,
  //     image: scholler1,
  //   },
  //   { id:3, name: "Molana Ali Hammed", rating: 4.3, blessings: 25, image: scholler1 },
  //   {
  //     id:4,
  //     name: "Molana Sufyan Muqeem",
  //     rating: 4.1,
  //     blessings: 182,
  //     image: scholler1,
  //   },
  //   {
  //     id:5,
  //     name: "Hafiz Muhammad Umar",
  //     rating: 3.9,
  //     blessings: 455,
  //     image: scholler1,
  //   },
  //   {
  //     id:6,
  //     name: "Molana Ali Abbas",
  //     rating: 2.9,
  //     blessings: 3680,
  //     image: scholler1,
  //   },
  //   { id:7, name: "Scholar 7", rating: 5.0, blessings: 100, image: scholler1 },
  //   { id:8, name: "Scholar 8", rating: 4.9, blessings: 200, image: scholler1 },
  //   { id:9,name: "Scholar 9", rating: 4.9, blessings: 300, image: scholler1 },
  // ];

  // Pagination logic
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedScholars = scholars.slice(
    startIndex,
    startIndex + itemsPerPage
  );


  const handleViewProfile = (id: number) => {
    navigate(`/scholars/scholar/${id}`);
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
        {t("scholars.findYourScholar")}
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
          {t("scholars.clientsRate")}
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
                {t("scholars.blessingsDone", { count: scholar.blessings })}
              </Box>
              <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1
              }}>

                <ProfileButton
                  onClick={() => {
                    handleViewProfile(scholar.scholarID);
                    window.scrollTo({ top: 0, behavior: "smooth" }); // scrolls to top smoothly
                  }}
                  sx={{ flex: 1 }}
                >
                  {t("scholars.viewProfile")}
                </ProfileButton>

                <BookButton
                  sx={{ flex: 1 }}
                  onClick={() => {
                    navigate("/bookyourspirtualservice", { state: { bookScholar: scholar } });
                  }}
                >
                  {t("scholars.bookNow")}
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
    </Box>
  );
};

export default FindScholar;