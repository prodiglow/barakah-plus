import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StarSvg = ({ size = "70" }) => (
  <svg width={size} height={size} viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M35.0024 1.8374L43.4695 26.1916L69.2499 26.7195L48.702 42.2974L56.1686 66.9782L34.9995 52.2491L13.8361 66.9782L21.3028 42.2974L0.757812 26.7195L26.5382 26.1945L35.0024 1.8374Z" fill="#DBC60A" />
  </svg>
);

const MainContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: '#FFFFFF',
  paddingTop: '50px',
  paddingBottom: '200px',
  [theme.breakpoints.down('sm')]: {
    paddingTop: '30px',
    paddingBottom: '100px',
  },
}));

const GradientBox = styled(Box)(({ theme }) => ({
  width: '85%',
  height: '600px',
  margin: '0 auto',
  padding: theme.spacing(2),
  borderRadius: '8px',
  background: 'linear-gradient(180deg, #16A97D 0%, #2D2D2D 100%)',
  position: 'relative',
  textAlign: 'center',
  color: '#FFFFFF',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  [theme.breakpoints.down('lg')]: {
    width: '85%',
    height: '450px',
  },
  [theme.breakpoints.down('md')]: {
    width: '90%',
    height: '400px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '93%',
    height: '300px',
    padding: theme.spacing(1),
  },
}));

const StarContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  '& > *:nth-of-type(1)': {
    position: 'absolute',
    top: '60px',
    left: '50px',
    [theme.breakpoints.down('md')]: {
      top: '40px',
      left: '30px',
    },
    [theme.breakpoints.down('sm')]: {
      top: '20px',
      left: '15px',
    },
  },
  '& > *:nth-of-type(2)': {
    position: 'absolute',
    top: '30px',
    right: '200px',
    [theme.breakpoints.down('md')]: {
      top: '20px',
      right: '120px',
    },
    [theme.breakpoints.down('sm')]: {
      top: '10px',
      right: '60px',
    },
  },
  '& > *:nth-of-type(3)': {
    position: 'absolute',
    bottom: '60px',
    left: '300px',
    [theme.breakpoints.down('md')]: {
      bottom: '40px',
      left: '180px',
    },
    [theme.breakpoints.down('sm')]: {
      bottom: '30px',
      left: '90px',
    },
  },
  '& > *:nth-of-type(4)': {
    position: 'absolute',
    bottom: '120px',
    right: '60px',
    [theme.breakpoints.down('md')]: {
      bottom: '80px',
      right: '40px',
    },
    [theme.breakpoints.down('sm')]: {
      bottom: '60px',
      right: '20px',
    },
  },
}));

const HadithQuoteSection: React.FC = () => {
  return (
    <MainContainer>
      <GradientBox>
        <StarContainer>
          <Box sx={{
            '& svg': {
              width: { xs: '30px', sm: '40px', md: '50px', lg: '70px' },
              height: { xs: '30px', sm: '40px', md: '50px', lg: '70px' }
            }
          }}>
            <StarSvg />
          </Box>
          <Box sx={{
            '& svg': {
              width: { xs: '25px', sm: '35px', md: '45px', lg: '70px' },
              height: { xs: '25px', sm: '35px', md: '45px', lg: '70px' }
            }
          }}>
            <StarSvg />
          </Box>
          <Box sx={{
            '& svg': {
              width: { xs: '35px', sm: '45px', md: '55px', lg: '70px' },
              height: { xs: '35px', sm: '45px', md: '55px', lg: '70px' }
            }
          }}>
            <StarSvg />
          </Box>
          <Box sx={{
            '& svg': {
              width: { xs: '28px', sm: '38px', md: '48px', lg: '70px' },
              height: { xs: '28px', sm: '38px', md: '48px', lg: '70px' }
            }
          }}>
            <StarSvg />
          </Box>
        </StarContainer>
        <Typography
          variant="h2"
          component="div"
          sx={{
            position: 'relative',
            zIndex: 1,
            fontSize: {
              xs: '1.25rem',  // Mobile: ~20px
              sm: '1.75rem',  // Small tablet: ~28px
              md: '2.25rem',  // Tablet: ~36px
              lg: '2.5rem',   // Desktop: ~40px
              xl: '3rem'      // Large desktop: ~48px
            },
            lineHeight: {
              xs: 1.4,
              sm: 1.5,
              md: 1.6
            },
            fontWeight: 500,
            '& br': {
              display: { xs: 'none', sm: 'block' } // Hide line breaks on mobile for better flow
            }
          }}
        >
          The Messenger of Allah <span style={{ fontSize: '1.2em' }}>ﷺ</span> said:
          <Box component="span" sx={{ display: { xs: 'block', sm: 'inline' } }}>
            {" "}"The best among you are those who have{" "}
          </Box>
          <Box component="span" sx={{ display: { xs: 'block', sm: 'inline' } }}>
            the best manners and character."
          </Box>
          <Box component="span" sx={{ display: 'block', mt: 1 }}>
            (Sahih al-Bukhari)
          </Box>
        </Typography>
      </GradientBox>
    </MainContainer>
  );
};

export default HadithQuoteSection;