import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Faqs: React.FC = () => {
  return (
    <Box sx={{ width: "100%", backgroundColor: "#fff" }} id="faqs">
      {" "}
      {/* ✅ Full-width main container */}
      <Box
        sx={{
          paddingTop: "100px",
          paddingBottom: "100px",
          width: "93%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
     <Typography 
  color="black" 
  variant="h3" 
  align="center" 
  fontWeight={600} 
  paddingBottom={1} 
  gutterBottom
  sx={{
    fontSize: {
      xs: 'h4.fontSize', // Mobile: smaller size
      sm: 'h3.fontSize', // Tablet: medium size
      md: 'h3.fontSize'  // Desktop: original size
    },
    padding: {
      xs: 2, // More padding on mobile
      sm: 1  // Less padding on larger screens
    }
  }}
>
  Frequently asked questions
</Typography>
        <Typography
          variant="body2"
          align="center"
          color="textSecondary"
          sx={{ mb: 4 }}
        >
          For any unanswered questions, reach out to our support team via email. We'll respond as <br/>soon as possible to assist you.
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              Can I book the recitation in someone else’s name (e.g., deceased
              family members)?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Yes, you can dedicate the Quran Khwani and duas in the name of
              your parents, ancestors, or anyone you’d like to send rewards
              (Isal-e-Sawab) to.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              Is this service available for both Shia and Sunni traditions?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Yes, you can dedicate the Quran Khwani and duas in the name of
              your parents, ancestors, or anyone you’d like to send rewards
              (Isal-e-Sawab) to.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              How will I receive the video of the Quran recitation or dua?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Yes, you can dedicate the Quran Khwani and duas in the name of
              your parents, ancestors, or anyone you’d like to send rewards
              (Isal-e-Sawab) to.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              Which Islamic sites or masjids will the recitations take place at?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Yes, you can dedicate the Quran Khwani and duas in the name of
              your parents, ancestors, or anyone you’d like to send rewards
              (Isal-e-Sawab) to.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              Is this offering only for Muharram or available year-round?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Yes, you can dedicate the Quran Khwani and duas in the name of
              your parents, ancestors, or anyone you’d like to send rewards
              (Isal-e-Sawab) to.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              Can I make a special prayer request (e.g., health, justice, family
              peace)?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Yes, you can dedicate the Quran Khwani and duas in the name of
              your parents, ancestors, or anyone you’d like to send rewards
              (Isal-e-Sawab) to.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Box
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" color="black" gutterBottom>
            Didn't find an answer to your question?
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Is there something you're uncertain about? Reach out to our
            welcoming team for assistance.
          </Typography>
          <Button
            variant="contained"
            color="warning"
            sx={{
              mt: 2,
              transition: "all 0.3s ease-in-out", // smooth animation
              "&:hover": {
                transform: "scale(1.05)", // slightly bigger on hover
              },
            }}
          >
            Contact us
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Faqs;
