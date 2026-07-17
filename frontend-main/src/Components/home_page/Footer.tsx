import React, { useState } from "react";
import { Box, Typography, Link as MuiLink, Collapse, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// Import social media icons (adjust paths as needed)
import Facebook from "../../assets/facebook_logo1.png";
import Twitter from "../../assets/twitter_logo1.png";
import Instagram from "../../assets/instagram_logo1.png";

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#111827",
  marginTop: "50px",
  color: "#fff",
  padding: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
}));

const FooterSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  margin: "0 auto",
  width: "87%",
  gap: theme.spacing(4),
  [theme.breakpoints.down("md")]: {
    width: "100%",
    gap: theme.spacing(3),
  },
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),
    width: "100%",
  },
}));

const FooterColumn = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isLogoColumn",
})<{ isLogoColumn?: boolean }>(({ theme, isLogoColumn }) => ({
  flex: 1,
  minWidth: 0,
  ...(isLogoColumn && {
    width: "30%",
    flexBasis: "30%",
    [theme.breakpoints.down("md")]: {
      width: "100%",
      flexBasis: "100%",
      textAlign: "center",
      marginBottom: theme.spacing(2),
    },
  }),
  [theme.breakpoints.down("md")]: {
    flex: "1 1 calc(50% - 16px)",
    minWidth: "calc(50% - 16px)",
  },
  [theme.breakpoints.down("sm")]: {
    flex: "1 1 100%",
    minWidth: "100%",
    textAlign: "center",
    marginBottom: theme.spacing(3), // Default margin, can be overridden
  },
}));

const FooterLink = styled(MuiLink)(({ theme }) => ({
  display: "block",
  color: "#fff",
  textDecoration: "none",
  marginBottom: theme.spacing(1),
  position: "relative",
  transition: "color 0.3s ease-in-out",
  "&:hover": {
    color: "#4CAF50",
  },
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "2px",
    backgroundColor: "#4CAF50",
    transform: "scaleX(0)",
    transformOrigin: "bottom right",
    transition: "transform 0.3s ease-out",
  },
  "&:hover:after": {
    transform: "scaleX(1)",
    transformOrigin: "bottom left",
  },
  [theme.breakpoints.down("sm")]: {
    textAlign: "center",
    marginBottom: theme.spacing(1.5),
  },
}));

const SocialIcons = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  justifyContent: "flex-end",
  [theme.breakpoints.down("sm")]: {
    justifyContent: "center",
    marginTop: theme.spacing(2),
  },
}));

const SocialIcon = styled("img")({
  width: "24px",
  height: "24px",
  cursor: "pointer",
});

const FooterBottom = styled(Box)(({ theme }) => ({
  mt: 4,
  borderTop: "1px solid #333",
  pt: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "87%",
  margin: "0 auto",
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: theme.spacing(1),
    textAlign: "center",
  },
}));

const CopyrightText = styled(Typography)(({ theme }) => ({
  width: "300px",
  [theme.breakpoints.down("sm")]: {
    paddingTop: theme.spacing(2),
    width: "100%",
    textAlign: "center",
  },
}));

interface FooterLinksSectionProps {
  title: string;
  children: React.ReactNode;
}

const FooterLinksSection: React.FC<FooterLinksSectionProps> = ({ title, children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    if (isMobile) {
      setOpen(!open);
    }
  };

  return (
    <FooterColumn>
      <Box
        display="flex"
        justifyContent={isMobile ? "center" : "flex-start"}
        alignItems="center"
        onClick={handleToggle}
        sx={{
          cursor: isMobile ? "pointer" : "default",
          marginBottom: isMobile ? (open ? 2 : 0) : 0, // Add spacing if open
          transition: "margin 0.3s ease"
        }}
      >
        <Typography variant="h6" gutterBottom={!isMobile} sx={{ fontWeight: "bold", mb: isMobile ? 0 : undefined }}>
          {title}
        </Typography>
        {isMobile && (
          <IconButton size="small" sx={{ ml: 1, color: "white" }}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>
      <Collapse in={!isMobile || open} timeout="auto" unmountOnExit>
        <Box sx={{ mt: isMobile ? 1 : 0 }}>
          {children}
        </Box>
      </Collapse>
    </FooterColumn>
  );
};

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterSection>
        <FooterColumn isLogoColumn>
          <Typography variant="h5" gutterBottom sx={{
            fontWeight: "bold",
            background: "linear-gradient(90deg, #1db954, #11998e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block"
          }}>
            BARAKA
          </Typography>
          <Typography variant="body2" gutterBottom>
            Stay connected for updates on special events,<br /> Islamic reminders, and
            spiritual services
          </Typography>
        </FooterColumn>

        <FooterLinksSection title="Services">
          {/* <FooterLink href="https://example.com/about">Book a Quran Khwani</FooterLink> */}
          <FooterLink href="https://example.com/mission">View Upcoming Events</FooterLink>
          <FooterLink href="https://example.com/team">Submit a Dua Request</FooterLink>
        </FooterLinksSection>

        <FooterLinksSection title="Support">
          <FooterLink href="https://example.com/dua">Contact</FooterLink>
          <FooterLink href="https://example.com/quran">Community</FooterLink>
          <FooterLink href="https://example.com/tasbeehat">Wazaif and Adhkar</FooterLink>
          <FooterLink href="https://example.com/mission">Live chat</FooterLink>
          <FooterLink href="https://example.com/team">Guides</FooterLink>
          <FooterLink href="https://example.com/team">Feedback</FooterLink>
        </FooterLinksSection>

        <FooterLinksSection title="Company">
          <FooterLink href="mailto:support@barakah.com">
            support@barakah.com
          </FooterLink>
          <FooterLink href="tel:+1234567890">About</FooterLink>
          <FooterLink href="https://example.com/contact">Careers</FooterLink>
          <FooterLink href="https://example.com/mission">Partnerships</FooterLink>
          <FooterLink href="https://example.com/team">Blog</FooterLink>
        </FooterLinksSection>

        <FooterLinksSection title="Legal">
          <FooterLink href="https://example.com/dua">Privacy</FooterLink>
          <FooterLink href="https://example.com/quran">Terms</FooterLink>
          <FooterLink href="https://example.com/tasbeehat">Disclaimer</FooterLink>
          <FooterLink href="https://example.com/mission">Accessibility</FooterLink>
          <FooterLink href="https://example.com/team">Cookie</FooterLink>
        </FooterLinksSection>

      </FooterSection>
      <FooterBottom paddingTop={1}>
        <CopyrightText variant="body2">
          © {new Date().getFullYear()} Baraka. All rights reserved.
        </CopyrightText>
        <SocialIcons>
          <SocialIcon
            src={Facebook}
            alt="Facebook"
            onClick={() => window.open("https://facebook.com", "_blank")}
          />
          <SocialIcon
            src={Twitter}
            alt="Twitter"
            onClick={() => window.open("https://twitter.com", "_blank")}
          />
          <SocialIcon
            src={Instagram}
            alt="Instagram"
            onClick={() => window.open("https://instagram.com", "_blank")}
          />
        </SocialIcons>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;
