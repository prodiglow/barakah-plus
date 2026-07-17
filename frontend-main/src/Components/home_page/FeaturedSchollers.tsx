import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Rating,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from "react-router-dom";
import { fetchScholars } from "../../services/scholarService";
import { Scholar } from "../../types/Scholars";


const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  backgroundColor: '#fff',
  padding: '50px',
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    margin: '10px',

  },
}));

const StyledBookButton = styled(Button)({
  backgroundColor: '#2e7d32',
  color: '#fff',
  borderRadius: '8px',
  padding: '8px 16px',
  textTransform: 'none',
  fontWeight: 'bold',
  transaction: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: '#1b5e20',
    scale: 1.05,
  },
  width: '100%',
  marginTop: '20px',
});

const StyledProfileButton = styled(Button)({
  backgroundColor: '#e8f5e8',
  color: '#2e7d32',
  border: '1px solid #c8e6c9',
  borderRadius: '8px',
  padding: '6px 12px',
  textTransform: 'none',
  fontSize: '0.875rem',
  width: '100%',
  marginTop: '15px',
  transaction: 'all 0.3s ease-in-out',
  '&:hover': {
    scale: 1.05,
  },
});

const StyledHeader = styled(Typography)({
  fontSize: '3rem',
  fontWeight: '900',
  color: '#333',
  marginBottom: '100px',
  textAlign: 'center',
});



interface FeaturedSchollersProps {
  onBookNow?: (scholar: Scholar) => void;
}

const FeaturedSchollers: React.FC<FeaturedSchollersProps> = ({ onBookNow }) => {
  const navigate = useNavigate();


  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // useEffect(() => {
  //   const loadScholars = async () => {
  //     try {
  //       const data = await fetchScholars();
  //       setScholars(data.slice(0, 3));
  //       console.log(data);
  //     } catch (error) {
  //       console.error("Error fetching scholars:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadScholars();
  // }, []);
  useEffect(() => {
    const loadScholars = async () => {
      try {
        const response = await fetchScholars();
        const list: Scholar[] =
          Array.isArray(response)
            ? response
            : Array.isArray((response as any).scholars)
              ? (response as any).scholars
              : Array.isArray((response as any).data)
                ? (response as any).data
                : [];

        setScholars(list.slice(0, 3));
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
      <Typography textAlign="center" margin={10}>
        Loading scholars...
      </Typography>
    );
  }

  return (
    <Box sx={{
      backgroundColor: '#fff',
      py: "50px", // ✅ top & bottom padding
      width: '100%',
    }}>
      <StyledHeader variant="h5">
        Featured Scholars / Madrasas
      </StyledHeader>
      <Grid container spacing={1} justifyContent="center">
        {scholars.map((scholar, index) => (
          <Grid size={{ xs: 12, sm: 12, md: 3 }} key={index}>
            <StyledCard>
              <CardContent sx={{ padding: 0 }}>
                <Avatar
                  src={scholar.ProfileImg}
                  alt={scholar.scholarName}
                  sx={{
                    width: 150,
                    height: 150,
                    margin: '0 auto 16px',
                    border: '4px solid #fff',
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {scholar.scholarName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Rating value={scholar.rating} readOnly precision={0.1} size="small" />
                  <Typography variant="body2" sx={{ ml: 1, color: '#666' }}>
                    PKR {scholar.fee}/hr
                  </Typography>
                </Box>
                <StyledBookButton
                  variant="contained"
                  onClick={() => {
                    if (onBookNow) onBookNow(scholar);
                  }}
                >
                  Book Now
                </StyledBookButton>
                <StyledProfileButton
                  variant="outlined"
                  onClick={() => {
                    navigate(`/scholars/scholar/${scholar.scholarID}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  View Profile
                </StyledProfileButton>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          component={Link}
          to="/scholars"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          variant="contained"
          sx={{
            borderRadius: "10px",
            background: "linear-gradient(90deg, #1db954, #11998e)",
            textTransform: "none",
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: "bold",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            },
          }}
        >
          View all Scholars
        </Button>
      </Box>

    </Box>
  );
};

export default FeaturedSchollers;