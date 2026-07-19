import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import scholarBg from "../../assets/scholarhero1.jpg";

const ScholarHeroImg: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        marginTop: { xs: 10, sm: 10, md: 2 },
        height: { xs: "250px", sm: "300px", md: "400px" },
        backgroundImage: `url(${scholarBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)",
        }}
      />

      {/* Text Content */}
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 2,
          textAlign: "left", // ✅ Left align text
          ml: 0,             // ✅ Remove horizontal centering
          pl: { xs: 2, sm: 4, md: 18 }, // ✅ Add left padding for spacing
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: "white",
            fontWeight: "bold",
            fontSize: { xs: "1.8rem", sm: "2.2rem", md: "3rem" },
          }}
        >
          {t("scholars.heroTitleLine1")} <br /> {t("scholars.heroTitleLine2")}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: "white",
            mt: 2,
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
          }}
        >
          {t("scholars.heroSubtitle")}
        </Typography>
      </Container>

    </Box>
  );
};

export default ScholarHeroImg;
