import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import PersonalDuaDialog from "./PersonalDuaDialog";
import { authEvents } from "../../utils/authEvents";

// Import images
import category1 from "../../assets/category1.jpg";
import category2 from "../../assets/category2.jpg";
import category3 from "../../assets/category3.jpg";
// import category4 from "../../assets/category4.jpg";

const CategoryCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  width: "100%",
  maxWidth: "380px",
  "&:hover": {
    cursor: "pointer",
  },
  [theme.breakpoints.up("sm")]: {
    width: "45%",
  },
  [theme.breakpoints.up("md")]: {
    width: "22%",
  },
}));

const CategoryImage = styled("img")(({ theme }) => ({
  width: "100%",
  height: "450px",
  borderRadius: "8px",
  marginBottom: theme.spacing(2),
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const CategoryText = styled(Typography)({
  color: "black",
  fontWeight: 600,
  transition: "color 0.3s ease-in-out",
  "&:hover": {
    color: "#4CAF50",
  },
});

const PopularCategoriesContainer = styled(Box)({
  padding: "80px 20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "white",
  color: "black",
});

const CategoryGrid = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: theme.spacing(5),
  marginTop: theme.spacing(7),
  width: "100%",
}));

const PopularCategories: React.FC = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  const handleTabNavigation = (tabIndex: number) => {
    navigate("/home-baraka", { state: { tab: tabIndex } });

    setTimeout(() => {
      const target = document.getElementById("PersonalDua");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  };

  const handlePersonalDuaClick = () => {
    setOpenDialog(true);
  };





  const handlePaidOption = () => {
    setOpenDialog(false);
    handleTabNavigation(0);
  };

  return (
    <PopularCategoriesContainer>
      <Typography fontSize={30} fontWeight={700} variant="h5" gutterBottom>
        Popular Categories
      </Typography>

      <CategoryGrid>
        <CategoryCard onClick={handlePersonalDuaClick}>
          <CategoryImage src={category1} alt="Personal dua" />
          <CategoryText variant="h6">Personal Dua</CategoryText>
        </CategoryCard>

        {/* <CategoryCard onClick={() => handleTabNavigation(1)}>
          <CategoryImage src={category2} alt="Quran Khwani" />
          <CategoryText variant="h6">Quran Khwani</CategoryText>
        </CategoryCard> */}

        <CategoryCard onClick={() => handleTabNavigation(2)}>
          <CategoryImage src={category3} alt="Wazaif and Adhkar" />
          <CategoryText variant="h6">Wazaif and Adhkar</CategoryText>
        </CategoryCard>

        <CategoryCard onClick={() => handleTabNavigation(5)}>
          <CategoryImage src={category2} alt="Quran O Hadith" />
          <CategoryText variant="h6">Quran O Hadith</CategoryText>
        </CategoryCard>

        {/* <CategoryCard onClick={() => handleTabNavigation(3)}>
          <CategoryImage src={category4} alt="Istikhara" />
          <CategoryText variant="h6">Istikhara</CategoryText>
        </CategoryCard> */}
      </CategoryGrid>

      {/* Personal Dua Options Dialog */}
      <PersonalDuaDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onPaidOptionSelect={handlePaidOption}
        onOpenLogin={() => authEvents.openLogin()}
        onFreeOptionSelect={() => {
          setOpenDialog(false);
          handleTabNavigation(4);
        }}
      />
    </PopularCategoriesContainer>
  );
};

export default PopularCategories;
