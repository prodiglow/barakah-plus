import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Avatar
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import CircleIcon from '@mui/icons-material/Circle';
import { useTheme, useMediaQuery } from '@mui/material';
import { getApprovedPlatformTestimonials } from '../../services/platformTestimonialService';
import VerifiedIcon from "@mui/icons-material/Verified";


const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 300,
  backgroundColor: '#F5F5F5',
  borderRadius: '8px',
  padding: theme.spacing(2),
  height: 220,
  display: 'flex',
  wordSpacing: '0.1em',
  flexDirection: 'column',
  justifyContent: 'space-between',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    height: 'auto',
    minHeight: 200,
    marginBottom: theme.spacing(2),
  },
}));

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getApprovedPlatformTestimonials();
        if (Array.isArray(data)) {

          setTestimonials(data);
        } else {
          console.error("Invalid testimonials response:", data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };
    fetchData();
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [currentPage, setCurrentPage] = useState(0);

  // Calculate cards per page based on screen size
  const getCardsPerPage = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 4; // Desktop
  };

  const cardsPerPage = getCardsPerPage();
  const totalPages = Math.ceil(testimonials.length / cardsPerPage);

  // Reset to first page when screen size changes
  useEffect(() => {
    setCurrentPage(0);
  }, [cardsPerPage]);

  const handleDotClick = (page: number) => {
    setCurrentPage(page);
  };

  const currentTestimonials = testimonials.slice(
    currentPage * cardsPerPage,
    (currentPage + 1) * cardsPerPage
  );

  return (
    <Box sx={{
      padding: { xs: 4, sm: 8, md: 15 },
      textAlign: 'center',
      backgroundColor: '#FFFFFF'
    }}>
      <Typography
        variant="h4"
        gutterBottom
        color="textPrimary"
        sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}
      >
        What Believers Are Saying
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        paragraph
        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
      >
        Read to what our beloved devotees have to say about Baraka <br /> <br />
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {currentTestimonials.map((testimonial, index) => (
          <Grid
            key={index}
            size={{
              xs: 12,  // 1 card per row on mobile
              sm: 6,   // 2 cards per row on tablet
              md: 3    // 4 cards per row on desktop
            }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <StyledCard
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: { xs: "auto", sm: 220 },
                textAlign: "center",
              }}
            >
              <CardContent
                sx={{
                  width: "100%",
                  p: { xs: 1.5, sm: 2 },
                }}
              >
                <Typography
                  variant="body1"
                  color="textPrimary"
                  paragraph
                  sx={{
                    fontSize: { xs: "1.25rem", sm: "1.25rem", md: "1.25rem" },
                    lineHeight: { xs: 1.5, sm: 1.7 },
                    wordBreak: "break-word",
                    m: 0,
                  }}
                >
                  "{testimonial.comment}"
                </Typography>
              </CardContent>
            </StyledCard>

            {/* Avatar + Name + Location */}
            <Box sx={{
              paddingTop: '20px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: 300,
              margin: '0 auto'
            }}>
              <Avatar src={testimonial.user?.profilePic} sx={{
                bgcolor: '#D9D9D9',
                color: 'black',
                mr: 2,
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 }
              }}>
                {!testimonial.user?.profilePic && (typeof testimonial.user === "object"
                  ? testimonial.user.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                  : "U")}
              </Avatar>
              <Box sx={{ textAlign: 'left' }}>
                <Typography
                  variant="h6"
                  color="textPrimary"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  {typeof testimonial.user === "object"
                    ? testimonial.user.name
                    : "Unknown User"}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <VerifiedIcon sx={{ fontSize: 14, color: "green" }} />
                  <Typography variant="caption" color="green">
                    Verified User
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Pagination Dots */}
      <Box sx={{ mt: 3 }}>
        {Array.from({ length: totalPages }, (_, index) => (
          <IconButton
            key={index}
            onClick={() => handleDotClick(index)}
            color={currentPage === index ? 'primary' : 'default'}
            size="small"
            sx={{ ml: index > 0 ? 1 : 0 }}
          >
            <CircleIcon sx={{ fontSize: { xs: 6, sm: 8 } }} />
          </IconButton>
        ))}
      </Box>
    </Box>
  );
};

export default TestimonialsSection;