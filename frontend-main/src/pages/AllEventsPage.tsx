import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Typography,
  Pagination,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { eventService, EventData } from "../services/eventService";
import hijriConverter from "hijri-converter";

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  padding: 5,
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: 445,
  height: 630, // ✅ uniform height for all cards
  margin: "auto",
  transition: "transform 0.3s ease-in-out",
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
    margin: "0 auto 20px auto",
  },
  "&:hover": {
    transform: "translateY(-5px)",
  },
  "& .MuiCardMedia-root": {
    borderRadius: "70px",
    padding: "10px",
    boxSizing: "border-box",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      borderRadius: "50px",
      padding: "8px",
    },
  },
}));

const AllEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const eventsPerPage = 8; // 4 per row * 2 rows

  const addOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const hijriMonths = [
    "Muharram",
    "Safar",
    "Rabiʽ al-awwal",
    "Rabiʽ al-thani",
    "Jumada al-ula",
    "Jumada al-thania",
    "Rajab",
    "Shaʽban",
    "Ramadan",
    "Shawwal",
    "Dhul Qaʽdah",
    "Dhul Hijjah",
  ];

  const formatIslamicDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      year: "numeric",
      month: "long",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    const gregorianFormatted = date.toLocaleDateString("en-GB", options);

    const hijri = hijriConverter.toHijri(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );

    const hijriDay = addOrdinal(hijri.hd);
    const hijriMonth = hijriMonths[hijri.hm - 1];

    return `${gregorianFormatted}, ${hijriDay} ${hijriMonth}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventService.getAllEvents();
        const allEvents = response.events || response || [];

        const now = new Date();

        const upcoming = allEvents
          .filter((e: EventData) => new Date(e.eventDate) >= now && e.isFeatured) // Filter upcoming AND featured
          .sort((a: EventData, b: EventData) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

        const past = allEvents
          .filter((e: EventData) => new Date(e.eventDate) < now && e.isFeatured) // Filter past AND featured
          .sort(
            (a: EventData, b: EventData) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

        const sortedEvents = [...upcoming, ...past];

        setEvents(sortedEvents);
      } catch (err) {
        console.error(err);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleClick = (eventID: string) => {
    navigate(`/user/events/${eventID}`);
  };

  // Pagination logic
  const startIndex = (page - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const paginatedEvents = events.slice(startIndex, endIndex);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: { xs: 3, sm: 5 },
        px: { md: 10 },
        marginTop: { xs: 8, sm: 8, md: 0 },
        backgroundColor: "white",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
        fontWeight={1000}
        color="textPrimary"
        sx={{
          fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
        }}
      >
        All Upcoming Quran Khwanis
      </Typography>
      <Typography
        variant="h6"
        marginBottom={8}
        color="textSecondary"
        paragraph
        sx={{
          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
        }}
      >
        Browse through all our upcoming spiritual events and participate from anywhere.
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {paginatedEvents.map((event, index) => (
          <Grid
            key={index}
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <StyledCard>
              <CardMedia
                component="img"
                height="300"
                image={event.eventPic}
                alt={event.eventTitle}
              />
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <Box sx={{ height: 20 }}>
                  <Typography variant="caption" color="error" gutterBottom>
                    {event.eventSpecial}
                  </Typography>
                </Box>

                <Box sx={{ height: 60, overflow: "hidden", paddingLeft: 3, paddingRight: 3 }}>
                  <Typography
                    sx={{
                      textAlign: "left",
                      fontWeight: "900",
                      fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    variant="h6"
                    color="textPrimary"
                  >
                    {event.eventTitle}
                  </Typography>
                </Box>

                <Box sx={{ height: 60, overflow: "hidden", paddingLeft: 3, paddingRight: 3 }}>
                  <Typography
                    marginTop={2}
                    align="left"
                    variant="body2"
                    color="textSecondary"
                    paragraph
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {event.description}
                  </Typography>
                </Box>

                <Box sx={{ height: 40, overflow: "hidden", px: 3, mt: 5, mb: 1 }}>
                  <Typography align="left" variant="body2" color="textSecondary">
                    <svg width="14" height="21" viewBox="0 0 14 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M6.14287 0.160156H7.85716V6.28266L14 11.0693V20.1602H0V11.0693C1.5621 10.0042 2.53105 9.17312 3.5 8.34202C4.27844 7.67433 5.05687 7.00663 6.14287 6.21763V0.160156ZM9 12.8875V18.342H12V11.9784L7 7.88747L2 11.9784V18.342H5V12.8875H9ZM12.1432 0.160156H7.85716L7.85755 3.79652V4.25107L12.1432 0.160156Z" fill="#F18912" />
                    </svg>
                    &nbsp; {event.eventLocation}
                  </Typography>
                </Box>

                <Box sx={{ height: 40, overflow: "hidden", px: 3, mt: -2, mb: 0 }}>
                  <Typography align="left" variant="body2" color="textSecondary">
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.1666 9.99345H8V14.1601H12.1666V9.99345ZM11.3334 0.826782V2.49344H4.66666V0.826782H3V2.49344H0.508337L0.5 17.4935H15.5V2.49344H13V0.826782H11.3334ZM13.8334 15.8267H2.16666V6.66011H13.8334V15.8267Z" fill="#F18912" />
                    </svg>
                    &nbsp; {formatIslamicDate(event.eventDate)}
                  </Typography>
                </Box>

                <Box sx={{ mt: "auto" }}>
                  <Button
                    onClick={() => handleClick(event._id!)}
                    variant="contained"
                    disabled={new Date(event.eventDate) < new Date()}
                    color="success"
                    fullWidth
                    sx={{
                      mt: 2,
                      width: "90%",
                      height: { xs: 36, sm: 40 },
                      borderRadius: 2,
                      textTransform: "none",
                      background: new Date(event.eventDate) < new Date() ? "grey" : "linear-gradient(90deg, #1db954, #11998e)",
                      color: "#FFFFFF",
                      fontSize: { xs: "0.875rem", sm: "0.9rem" },
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: new Date(event.eventDate) < new Date() ? "none" : "scale(1.05)",
                        boxShadow: new Date(event.eventDate) < new Date() ? "none" : "0 4px 12px rgba(0, 0, 0, 0.2)",
                        background: new Date(event.eventDate) < new Date() ? "grey" : "linear-gradient(90deg, #1db954, #11998e)",
                      },
                    }}
                  >
                    {new Date(event.eventDate) < new Date() ? "EXPIRED" : "PARTICIPATE →"}
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {/* ✅ Pagination Control */}
      {totalPages > 1 && (
        <Box sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#2e7d32",
                fontSize: { xs: "0.75rem", sm: "0.875rem" }
              },
              "& .MuiPaginationItem-root.Mui-selected": {
                backgroundColor: "#2e7d32",
                borderRadius: "8px",
                color: "white",
                "&:hover": {
                  backgroundColor: "#1b5e20",
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default AllEventsPage;
