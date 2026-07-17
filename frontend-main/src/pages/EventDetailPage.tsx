import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Typography,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import { eventService, EventData } from "../services/eventService"; // Your service where getEventById is defined


const EventDetailPage: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const { eventId } = useParams<{ eventId: string }>();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventService.getEventById(eventId);
        setEvent(data.event); // 👈 not just data

      } catch (err) {
        setError("Failed to load event.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) return <div>Loading event...</div>;
  if (error) return <div>{error}</div>;
  if (!event) return <div>No event found.</div>;

  return (
    <Box
      sx={{
        width: "auto",
        mx: "auto",
        p: { xs: 2, sm: 3 },
        marginTop: { xs: 8, sm: 8 },
        textAlign: "center",
        backgroundColor: "white",
        color: "black",
      }}
    >
      {/* Title */}
      <Typography
        variant={isSmall ? "h5" : "h4"}
        fontWeight={700}
        gutterBottom
      >
        {event.eventTitle}
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        {event.eventSpecial}
      </Typography>

      {/* Image */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          mb: 3,
        }}
      >
        <CardMedia
          component="img"
          image={event.eventPic} // your image in public/assets/quran-event.jpg
          alt="Quran Khwani Event"
          sx={{
            width: { sm: '100%', xs: '100%', md: '48%' },
            height: "auto",
            objectFit: "cover",
            mx: "auto",
            borderRadius: 10,
          }}
        />
      </Card>

      {/* Location + Live status */}

      <Stack
        direction={{ xs: "column", sm: "row" }} // column on small, row on bigger
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3 }}
      >
        {/* 📍 Location Row */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <svg
            width="25"
            height="25"
            viewBox="0 0 23 33"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.1294 0.449951H12.8722V10.246L22.7007 17.9046V32.45H0.300781V17.9046C2.80014 16.2005 4.35046 14.8707 5.90078 13.5409C7.14628 12.4726 8.39178 11.4043 10.1294 10.1419V0.449951ZM14.7008 20.8138V29.541H19.5007V19.3591L11.5008 12.8137L3.50078 19.3591V29.541H8.30078V20.8138H14.7008ZM19.7299 0.449951H12.8722L12.8729 6.26813V6.99541L19.7299 0.449951Z"
              fill="#F18912"
            />
          </svg>

          <Typography variant="h6" fontWeight={500}>
            {event.eventLocation}
          </Typography>
        </Stack>

        {/* 📡 Live Row */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <svg
            width="25"
            height="25"
            viewBox="0 0 31 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.832 0.783203C21.1857 0.783203 21.5248 0.923679 21.7748 1.17373C22.0249 1.42378 22.1654 1.76291 22.1654 2.11654V7.71654L29.116 2.84987C29.216 2.77981 29.3332 2.73853 29.455 2.73054C29.5768 2.72254 29.6985 2.74814 29.8067 2.80453C29.915 2.86092 30.0056 2.94595 30.0689 3.05034C30.1321 3.15473 30.1655 3.27448 30.1654 3.39654V19.5032C30.1655 19.6253 30.1321 19.745 30.0689 19.8494C30.0056 19.9538 29.915 20.0388 29.8067 20.0952C29.6985 20.1516 29.5768 20.1772 29.455 20.1692C29.3332 20.1612 29.216 20.1199 29.116 20.0499L22.1654 15.1832V20.7832C22.1654 21.1368 22.0249 21.476 21.7748 21.726C21.5248 21.9761 21.1857 22.1165 20.832 22.1165H2.16536C1.81174 22.1165 1.4726 21.9761 1.22256 21.726C0.972507 21.476 0.832031 21.1368 0.832031 20.7832V2.11654C0.832031 1.76291 0.972507 1.42378 1.22256 1.17373C1.4726 0.923679 1.81174 0.783203 2.16536 0.783203H20.832Z"
              fill="#F18912"
            />
          </svg>

          <Typography variant="h6" fontWeight={500}>
            Live
          </Typography>
        </Stack>
      </Stack>

      {/* Participate Button */}
      <Button
        variant="contained"
        color="success"
        size="large"
        href={event.joiningLink || ""}
        target="_blank"
        rel="noopener noreferrer"
        disabled={!event.joiningLink}
        sx={{
          borderRadius: 20,
          textTransform: "uppercase",
          fontWeight: 600,
          px: 4,
          py: 1.2,
        }}
      >
        Participate on Zoom →
      </Button>
    </Box>
  );
};

export default EventDetailPage;
