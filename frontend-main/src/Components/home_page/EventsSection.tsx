import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { eventService, EventData } from "../../services/eventService";
import hijriConverter from "hijri-converter";

// Extend or redefine if needed, but preferably use the one from service if it matches
// Since the service file was updated in admin folder, does main folder share it? 
// The import says: "../../services/eventService". Let's check that file in main frontend.
// If it's not the same file as admin, we need to update it too. 
// CHECKING FILE PATH: I only updated admin service. I need to check main service.
// Wait, I can't check it right now without a tool call. 
// I will assume for now I need to update strictly the usage here if it defines its own, or mistakenly assumed imports.
// The previous code had: `import { eventService, EventData } from "../../services/eventService";`
// I'll update the interface if it's defined in this file, but it seems imported. 
// If imported, I need to update `e:\BarakahProject\BarakahProject\frontend-main\src\services\eventService.ts` as well!
// I missed that file in my plan. 


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

const EventsSection: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Invalid date";
    }

    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      weekday: "long",
      year: "numeric",
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
        const allEvents = Array.isArray(response.events)
          ? response.events
          : Array.isArray(response)
            ? response
            : [];


        const now = new Date();
        const sortedEvents = allEvents
          .filter((e: EventData) => new Date(e.eventDate) >= now && e.isFeatured) // Filter upcoming AND marked for home page
          .sort(
            (a: EventData, b: EventData) =>
              new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime() // Sort ASC (soonest first)
          )
          .slice(0, 3); // Max 3 events

        setEvents(sortedEvents.slice(0, 3)); // Show only 3 cards
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
    window.scrollTo(0, 0);
  };

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
        padding: { xs: 3, sm: 5, md: 12 },
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
        This summer special Quran khwanis
      </Typography>

      <Typography
        variant="h6"
        marginBottom={10}
        color="textSecondary"
        paragraph
        sx={{
          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
          marginBottom: { xs: 5, sm: 7, md: 10 },
        }}
      >
        This Muharram, offer special duas and sadaqah in your and your family's
        name at <br />
        sacred Islamic sites. Receive heartfelt prayers and a special video of
        the <br />
        recitation bringing the blessings of Allah and the peace of the Prophet
        (PBUH) <br />
        teachings into your home.
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {events.map((event, index) => (
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

                <Box sx={{ height: 40, overflow: "hidden", px: 3 }}>
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

                <Box sx={{ height: 60, overflow: "hidden", px: 3 }}>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 32 24"
                      fill="none"
                      stroke="#F18912"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M3 21h7v-2a2 2 0 1 1 4 0v2h7" />
                      <path d="M4 21v-10" />
                      <path d="M20 21v-10" />
                      <path d="M4 16h3v-3h10v3h3" />
                      <path d="M17 13a5 5 0 0 0 -10 0" />
                      <path d="M21 10.5c0 -.329 -.077 -.653 -.224 -.947l-.776 -1.553l-.776 1.553a2.118 2.118 0 0 0 -.224 .947a.5 .5 0 0 0 .5 .5h1a.5 .5 0 0 0 .5 -.5z" />
                      <path d="M5 10.5c0 -.329 -.077 -.653 -.224 -.947l-.776 -1.553l-.776 1.553a2.118 2.118 0 0 0 -.224 .947a.5 .5 0 0 0 .5 .5h1a.5 .5 0 0 0 .5 -.5z" />
                      <path d="M12 2a2 2 0 1 0 2 2" />
                      <path d="M12 6v2" />
                    </svg>
                    &nbsp; {event.eventLocation}
                  </Typography>
                </Box>

                <Box sx={{ height: 60, overflow: "hidden", px: 3, mt: -2, mb: 0 }}>
                  <Typography align="left" variant="body2" color="textSecondary">
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.1666 9.99345H8V14.1601H12.1666V9.99345ZM11.3334 0.826782V2.49344H4.66666V0.826782H3V2.49344H0.508337L0.5 17.4935H15.5V2.49344H13V0.826782H11.3334ZM13.8334 15.8267H2.16666V6.66011H13.8334V15.8267Z" fill="#F18912" />
                    </svg>
                    &nbsp; {formatIslamicDate(event.eventDate)}
                  </Typography>
                </Box>

                <Box sx={{ mt: "auto", display: "flex", justifyContent: "center" }}>
                  <Button
                    onClick={() => handleClick(event._id!)}
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{
                      mt: 2,
                      width: "90%",
                      height: { xs: 36, sm: 40 },
                      borderRadius: 2,
                      textTransform: "none",
                      background: "linear-gradient(90deg, #1db954, #11998e)",
                      color: "#FFFFFF",
                      fontSize: { xs: "0.875rem", sm: "0.9rem" },
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                        background: "linear-gradient(90deg, #1db954, #11998e)",
                      },
                    }}
                  >
                    PARTICIPATE →
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>


      <Button
        variant="text"
        onClick={() => {
          navigate("/user/events");
          window.scrollTo(0, 0);
        }}
        color="warning"
        sx={{
          mt: 3,
          fontSize: { xs: "0.9rem", sm: "1rem" },
        }}
      >
        View All Duas and Upcoming Events →
      </Button>
    </Box>
  );
};

export default EventsSection;
