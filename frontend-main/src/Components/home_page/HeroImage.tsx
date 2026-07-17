import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";

import PersonIcon from "@mui/icons-material/Person";
import Face3Icon from "@mui/icons-material/Face3";

interface HeroImageProps {
  image: string;
}

const HeroImage: React.FC<HeroImageProps> = ({ image }) => {
  return (
    <Box
      sx={{
        width: "100%",          // use % not vw
        height: "100vh",
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        color: "#fff",
        position: "relative",
        overflowX: "hidden",    // stop scroll
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: "relative",
          maxWidth: "1300px",
          width: "100%",
          pl: { xs: 2, sm: 6, md: 20 },
        }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: { xs: "2.5rem", md: "4rem" }, paddingBottom: { xs: "30px" } }}
        >
          Blessings Made Easy:
          Zikar <br />or Duas Online
        </Typography>

        <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
          Verified scholars, authentic recitations, real impact. For your loved
          <br /> ones, for you, for the Ummah.
        </Typography>

        {/* Avatars + Rating */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Stack direction="row">
            <Avatar sx={{ bgcolor: "#2e7d32" }}>
              <PersonIcon />
            </Avatar>
            <Avatar sx={{ bgcolor: "#ed6c02", ml: -1 }}>
              <Face3Icon />
            </Avatar>
            <Avatar sx={{ bgcolor: "#2e7d32", ml: -1 }}>
              <PersonIcon />
            </Avatar>
            <Avatar sx={{ bgcolor: "#ed6c02", ml: -1 }}>
              <Face3Icon />
            </Avatar>
          </Stack>

          <Stack>
            <Typography variant="body1">Over 10k happy users</Typography>
            <Rating value={5} readOnly size="small" />
          </Stack>
        </Stack>
      </Box>
    </Box>


  );
};

export default HeroImage;
