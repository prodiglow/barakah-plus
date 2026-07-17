import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Slide from "@mui/material/Slide";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { logout, isAuthenticated } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const navItems: string[] = [

  ];

  // Detect scroll for shadow
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  const handleDrawerToggle = (open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };


  const handleLogout = () => {
    logout();
    closeDrawer();
  };

  return (
    <>
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar
          position="sticky"
          elevation={trigger ? 4 : 0}
          sx={{
            backgroundColor: "white",
            color: "black",
            width: "100%",
            px: { xs: 2, sm: 3, md: 15 },
            transition: "box-shadow 0.3s ease-in-out",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* Logo */}
            <Typography
              variant="h1"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.5rem", md: "1.8rem" },
                background: "linear-gradient(90deg, #1db954, #11998e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Baraka
            </Typography>

            {/* Desktop Menu */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
              {navItems.map((item) => (
                <Typography
                  key={item}
                  variant="body1"
                  sx={{
                    cursor: "pointer",
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
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>

            {/* Desktop Buttons */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  onClick={handleLogout}
                  sx={{
                    borderRadius: "10px",
                    background: "linear-gradient(180deg, #0A9E6F 0%, #098B62 49.04%, #087955 100%)",
                    textTransform: "none",
                    px: 3,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderRadius: "10px",
                    background: "linear-gradient(180deg, #0A9E6F 0%, #098B62 49.04%, #087955 100%)",
                    textTransform: "none",
                    px: 3,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  Login
                </Button>
              )}
            </Box>

            {/* Mobile Menu Icon */}
            <IconButton
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Slide>

      {/* Drawer for Mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 300 },
            display: "flex",
            flexDirection: "column"
          },
        }}
      >
        {/* Close Button Header */}
        <Box sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 2,
          borderBottom: "1px solid #e0e0e0"
        }}>
          <IconButton onClick={closeDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ flex: 1, p: 2 }} role="presentation">
          <List>
            {navItems.map((item) => (
              <ListItem key={item} disablePadding>
                <ListItemButton
                  onClick={closeDrawer}
                  sx={{
                    position: "relative",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      "& .MuiListItemText-primary": {
                        color: "#4CAF50",
                      },
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
                  }}
                >
                  <ListItemText
                    primary={item}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: 500,
                        transition: "color 0.3s ease-in-out"
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Buttons Section */}
        <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {isAuthenticated ? (
              <Button
                variant="contained"
                onClick={handleLogout}
                sx={{
                  borderRadius: "10px",
                  background: "linear-gradient(180deg, #0A9E6F 0%, #098B62 49.04%, #087955 100%)",
                  textTransform: "none",
                  py: 1.5,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => {
                  navigate('/login');
                  closeDrawer();
                }}
                sx={{
                  borderRadius: "10px",
                  background: "linear-gradient(180deg, #0A9E6F 0%, #098B62 49.04%, #087955 100%)",
                  textTransform: "none",
                  py: 1.5,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;