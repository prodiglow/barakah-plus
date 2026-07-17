import React from "react";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import { styled } from "@mui/material/styles";

// Import social media icons (adjust paths as needed)
import Facebook from "../assets/facebook_logo1.png";
import Twitter from "../assets/twitter_logo1.png";
import Instagram from "../assets/instagram_logo1.png";

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
    marginBottom: theme.spacing(3),
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

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterSection>
        <FooterColumn isLogoColumn>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            BARAKA
          </Typography>
          <Typography variant="body2" gutterBottom>
            Stay connected for updates on special events,<br /> Islamic reminders, and
            spiritual services
          </Typography>
        </FooterColumn>
        <FooterColumn>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Services
          </Typography>
          <FooterLink href="https://example.com/about">Our Story</FooterLink>
          <FooterLink href="https://example.com/mission">Our Mission</FooterLink>
          <FooterLink href="https://example.com/team">Our Team</FooterLink>
        </FooterColumn>
        <FooterColumn>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Support
          </Typography>
          <FooterLink href="https://example.com/dua">Personal Dua</FooterLink>
          <FooterLink href="https://example.com/quran">Quran Khwani</FooterLink>
          <FooterLink href="https://example.com/tasbeehat">Wazaif and Adhkar</FooterLink>
          <FooterLink href="https://example.com/mission">Our Mission</FooterLink>
          <FooterLink href="https://example.com/team">Our Team</FooterLink>
        </FooterColumn>
        <FooterColumn>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Company
          </Typography>
          <FooterLink href="mailto:support@barakah.com">
            support@barakah.com
          </FooterLink>
          <FooterLink href="tel:+1234567890">+1-234-567-890</FooterLink>
          <FooterLink href="https://example.com/contact">Get in Touch</FooterLink>
          <FooterLink href="https://example.com/mission">Our Mission</FooterLink>
          <FooterLink href="https://example.com/team">Our Team</FooterLink>
        </FooterColumn>
        <FooterColumn>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Legal
          </Typography>
          <FooterLink href="https://example.com/dua">Personal Dua</FooterLink>
          <FooterLink href="https://example.com/quran">Quran Khwani</FooterLink>
          <FooterLink href="https://example.com/tasbeehat">Wazaif and Adhkar</FooterLink>
          <FooterLink href="https://example.com/mission">Our Mission</FooterLink>
          <FooterLink href="https://example.com/team">Our Team</FooterLink>
        </FooterColumn>
      </FooterSection>
      <FooterBottom>
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