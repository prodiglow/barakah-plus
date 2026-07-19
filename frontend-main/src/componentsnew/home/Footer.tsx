import React, { useState } from "react";
import { Box, Typography, Link as MuiLink, Collapse, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Import social media icons (adjust paths as needed - using absolute imports likely works or relative from here)
import Facebook from "../../assets/facebook_logo1.png";
import Twitter from "../../assets/twitter_logo1.png";
import Instagram from "../../assets/instagram_logo1.png";

const FooterContainer = styled(Box)(({ theme }) => ({
    backgroundColor: "#111827",
    marginTop: 0,
    color: "#fff",
    padding: theme.spacing(4),
    borderTop: "1px solid #2c5530", // Slight green accent to match new theme
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
    justifyContent: 'space-between',
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
    minWidth: "200px",
    ...(isLogoColumn && {
        width: "30%",
        flexBasis: "30%",
        flexGrow: 2,
        [theme.breakpoints.down("md")]: {
            width: "100%",
            flexBasis: "100%",
            textAlign: "center",
            marginBottom: theme.spacing(2),
        },
    }),
    [theme.breakpoints.down("sm")]: {
        flex: "1 1 100%",
        minWidth: "100%",
        textAlign: "center",
        marginBottom: theme.spacing(3),
    },
}));

const StyledFooterLink = styled(MuiLink)<any>(({ theme }) => ({
    display: "block",
    color: "#e0e0e0",
    textDecoration: "none",
    marginBottom: theme.spacing(1.5),
    position: "relative",
    transition: "color 0.3s ease-in-out",
    fontSize: "0.95rem",
    width: "fit-content",
    "&:hover": {
        color: "#4CAF50",
    },
    "&:after": {
        content: '""',
        position: "absolute",
        bottom: -2,
        left: 0,
        width: "100%",
        height: "1px",
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
        width: "100%",
        textAlign: "center",
    },
}));

const FooterLink: React.FC<any> = (props) => {
    return (
        <StyledFooterLink
            {...props}
            onClick={(e: React.MouseEvent) => {
                window.scrollTo({ top: 0, behavior: "instant" });
                if (props.onClick) props.onClick(e);
            }}
        />
    );
};

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
    transition: "opacity 0.2s",
    "&:hover": {
        opacity: 0.8,
    },
});

const FooterBottom = styled(Box)(({ theme }) => ({
    borderTop: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "87%",
    margin: "0 auto",
    marginTop: theme.spacing(5), // Increased margin from section above
    paddingTop: theme.spacing(4), // Increased padding from divider line
    [theme.breakpoints.down("md")]: {
        width: "100%",
    },
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        gap: theme.spacing(2),
        textAlign: "center",
        paddingTop: theme.spacing(3),
    },
}));

const CopyrightText = styled(Typography)(({ theme }) => ({
    opacity: 0.7,
    fontSize: "0.9rem",
    [theme.breakpoints.down("sm")]: {
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
                    marginBottom: 2,
                }}
            >
                <Typography variant="h6" sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontSize: "1.1rem"
                }}>
                    {title}
                </Typography>
                {isMobile && (
                    <IconButton size="small" sx={{ ml: 1, color: "white" }}>
                        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                )}
            </Box>
            <Collapse in={!isMobile || open} timeout="auto" unmountOnExit>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' }}>
                    {children}
                </Box>
            </Collapse>
        </FooterColumn>
    );
};

const Footer: React.FC = () => {
    const { t } = useTranslation();
    const categories = [
        'Prayers Mats & Caps',
        'Accessories',
        'Islamic books & Literature',
        'Prayer Mat',
        'Tasbih'
    ];

    return (
        <FooterContainer>
            <FooterSection>
                <FooterColumn isLogoColumn>
                    <Typography variant="h4" gutterBottom sx={{
                        fontWeight: "bold",
                        background: "linear-gradient(90deg, #1db954, #11998e)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "inline-block",
                        fontFamily: '"Playfair Display", serif',
                        mb: 2
                    }}>
                        BARAKA
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, opacity: 0.8, maxWidth: '300px', margin: { xs: '0 auto', md: 0 } }}>
                        {t('footer.tagline')}
                    </Typography>
                </FooterColumn>

                <FooterLinksSection title={t('footer.collectionsTitle')}>
                    {categories.map((cat) => (
                        <FooterLink
                            key={cat}
                            component={Link}
                            to={`/islamic-merchandise/${encodeURIComponent(cat)}`}
                        >
                            {cat}
                        </FooterLink>
                    ))}
                </FooterLinksSection>

                <FooterLinksSection title={t('footer.supportTitle')}>
                    {/* <FooterLink component={Link} to="/about-us">About Us</FooterLink> */}
                    <FooterLink component={Link} to="/faq">{t('footer.helpCenter')}</FooterLink>
                    <FooterLink component={Link} to="/refund-policy">{t('footer.refundPolicy')}</FooterLink>
                    <FooterLink component={Link} to="/terms-conditions">{t('footer.termsConditions')}</FooterLink>
                    <FooterLink component={Link} to="/payment-privacy-policy">{t('footer.paymentPrivacyPolicy')}</FooterLink>
                </FooterLinksSection>

                <FooterLinksSection title={t('footer.contactTitle')}>
                    <Typography variant="body2" sx={{ color: "#e0e0e0", mb: 1.5, fontSize: "0.95rem" }}>
                        <strong>{t('footer.emailLabel')}</strong> info@barakah.com
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#e0e0e0", mb: 1.5, fontSize: "0.95rem" }}>
                        <strong>{t('footer.phoneLabel')}</strong> +92 300 1234567
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#e0e0e0", mb: 1.5, fontSize: "0.95rem", lineHeight: 1.6 }}>
                        <strong>{t('footer.addressLabel')}</strong> 320 K1, Wapda Town, Lahore, Pakistan
                    </Typography>
                </FooterLinksSection>

            </FooterSection>
            <FooterBottom>
                <CopyrightText>
                    {t('footer.copyright', { year: new Date().getFullYear() })}
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
