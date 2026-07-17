import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useScrollTrigger,
  Slide,
  Dialog,
  DialogContent,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { toast } from "react-toastify";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SignupForm from "../SignupForm";
import { getUser } from "../../services/userService";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Badge from "@mui/material/Badge";
import { getUserCart } from "../../services/cartService"; // adjust path
import { CartItem } from "../../types/cart"; // assuming your type
import { authEvents } from "../../utils/authEvents";
import PersonalDuaDialog from "./PersonalDuaDialog";

const Header: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState<number>(2);
  const [unreadCompletedCount, setUnreadCompletedCount] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  // Reusing the popup logic for Personal Dua from Header
  const [openPersonalDua, setOpenPersonalDua] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem("token")
  );
  const [userData, setUserData] = useState<{
    _id?: string;
    name?: string;
    email?: string;
    profilePic?: string;
  }>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);


  const navigate = useNavigate();
  const location = useLocation();
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 0 });

  useEffect(() => {
    const updateCart = async () => {
      const userID = localStorage.getItem("userId");
      if (!userID) return;
      const response = await getUserCart(userID);
      setCart(Array.isArray(response.data) ? response.data : [response.data]);
    };

    updateCart(); // initial fetch

    const handler = () => updateCart();
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  useEffect(() => {
    const userID = localStorage.getItem("userId");
    if (!userID) return;

    const fetchCart = async () => {
      try {
        const response = await getUserCart(userID); // response is of type CartResponse
        setCart(Array.isArray(response.data) ? response.data : [response.data]);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };

    fetchCart();
  }, []);

  // 👇 New effect just to update the count whenever cart changes
  useEffect(() => {
    setCartCount(cart.length);
  }, [cart]);

  const navItems = [
    { label: "Dua Library", type: "link", value: "/islamic-duas" },
    { label: "Personal Dua", type: "tab", value: 0 },
    // { label: "Quran Khwani", type: "tab", value: 1 },
    { label: "Wazaif and Adhkar", type: "tab", value: 2 },
    // { label: "Istikhara", type: "tab", value: 3 },
    { label: "Quran O Hadith", type: "tab", value: 5 },
    { label: "FAQ's", type: "section", value: "faqs" },
    { label: "Contact", type: "section", value: "contact" },
  ];


  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await getUser(token);
          setUserData(data);
          setIsLoggedIn(true);

          // Only fetch unread count if user is logged in
          if (data && data._id) {
            try {
              const { getUnreadCompletedCount } = await import("../../services/orderService");
              const res = await getUnreadCompletedCount(data._id);
              setUnreadCompletedCount(res.count);
            } catch (err) {
              console.error("Failed to fetch unread count", err);
            }
          }

        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      } else {
        setIsLoggedIn(false);
        setUserData({});
      }
    };

    fetchUserProfile();

    // Listen for auth events (login/logout/signup) from other components
    const unsubscribe = authEvents.listen(() => {
      fetchUserProfile();
    });

    // Listen for global login trigger
    const unsubscribeLogin = authEvents.listenOpenLogin(() => {
      handleOpenSignup();
    });

    // Listen for unread count updates
    const unreadHandler = () => fetchUserProfile(); // or simpler refetch
    window.addEventListener("unreadCountUpdated", unreadHandler);

    return () => {
      unsubscribe();
      unsubscribeLogin();
      window.removeEventListener("unreadCountUpdated", unreadHandler);
    };
  }, []);

  // Check for login query param or redirected state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const from = location.state?.from;

    if (params.get("login") === "true" || (from && !isLoggedIn)) {
      setOpenSignup(true);

      // If it was a query param, remove it without reloading
      if (params.get("login") === "true") {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: newUrl }, "", newUrl);
      }
    }
  }, [location.search, location.state, isLoggedIn]);

  // Profile menu toggle
  const handleMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenSignup = () => {
    setOpenSignup(true);
    setDrawerOpen(false);
  };

  const handleCloseSignup = () => setOpenSignup(false);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setOpenSignup(false);

    // Redirect back to original path if it exists in state
    const fromPath = location.state?.from?.pathname;
    if (fromPath) {
      const from = fromPath + (location.state?.from?.search || "");
      navigate(from, { replace: true });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setAnchorEl(null);
    toast.success("Logout successful ✅");
    navigate("/home-baraka");
  };

  const handleDrawerToggle =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setDrawerOpen(open);
    };

  const handleTabNavigation = (tabIndex: number) => {
    const currentPath = window.location.pathname;

    // If not on home page, navigate first
    if (currentPath !== "/home-baraka") {
      navigate("/home-baraka", { state: { tab: tabIndex } });
      setTimeout(() => {
        const target = document.getElementById("PersonalDua");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 1000);
    } else {
      // Already on home page, just scroll
      const target = document.getElementById("PersonalDua");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // Trigger tab change via custom event or state management
      window.dispatchEvent(new CustomEvent("changeTab", { detail: { tab: tabIndex } }));
    }
  };

  const handleSectionScroll = (sectionId: string) => {
    const currentPath = window.location.pathname;

    // If not on home page, navigate first
    if (currentPath !== "/home-baraka") {
      navigate("/home-baraka");
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }, 1000);
    } else {
      // Already on home page, just scroll
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <Slide appear={false} direction="down" in={isSmallScreen || !trigger}>
        <AppBar
          position="sticky"
          elevation={trigger ? 4 : 0}
          sx={{
            position: { xs: "fixed", sm: "fixed", md: "sticky" },
            backgroundColor: "white",
            color: "black",
            px: { xs: 2, sm: 3, md: 15 },
            transition: "box-shadow 0.3s ease-in-out",
            zIndex: 1201,
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "nowrap",
              width: "100%",
              minHeight: "70px",
              overflow: "visible",
            }}
          >
            {/* LEFT SECTION - LOGO + NAV */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography
                variant="h1"
                component={Link}
                to="/home-baraka"
                onClick={() => {
                  setDrawerOpen(false);
                  window.scrollTo({ top: 0, behavior: "instant" });
                }}
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.5rem", md: "1.8rem" },
                  textDecoration: "none",
                  // color: "inherit", // removed to allow gradient
                  whiteSpace: "nowrap",
                  background: "linear-gradient(90deg, #1db954, #11998e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Baraka
              </Typography>

              {/* Desktop Nav */}
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  gap: 3,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                {navItems.map((item) => (
                  <Typography
                    key={item.label}
                    onClick={() => {
                      setDrawerOpen(false);

                      if (item.label === "Personal Dua") {
                        setOpenPersonalDua(true);
                      } else if (item.type === "link" && typeof item.value === "string") {
                        navigate(item.value);
                        window.scrollTo({ top: 0, behavior: "instant" });
                      } else if (item.type === "tab" && typeof item.value === "number") {
                        handleTabNavigation(item.value);
                      } else if (item.type === "section" && typeof item.value === "string") {
                        handleSectionScroll(item.value);
                      }
                    }}
                    variant="body1"
                    sx={{
                      cursor: "pointer",
                      position: "relative",
                      textDecoration: "none",
                      color: "inherit",
                      paddingBottom: "5px",
                      "&.active": { color: "#4CAF50" },
                      "&:hover": { color: "#4CAF50" },
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
                      "&:hover:after, &.active:after": {
                        transform: "scaleX(1)",
                        transformOrigin: "bottom left",
                      },
                    }}
                  >
                    {item.label}
                  </Typography>
                ))}
              </Box>
            </Box>

            {/* RIGHT SECTION - Book Now + Profile */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 2,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {isLoggedIn && (
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={() => {
                    navigate("/user/cart");
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                >
                  <Badge badgeContent={cartCount} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              )}
              <Button
                onClick={() => {
                  handleSectionScroll("PersonalDua");
                }}
                variant="contained"
                sx={{
                  borderRadius: "10px",
                  background: "linear-gradient(90deg, #1db954, #11998e)",
                  textTransform: "none",
                  px: 3,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  },
                }}
              >
                Request Baraka
              </Button>
              {isLoggedIn ? (
                <>
                  <Tooltip
                    title={
                      <>
                        <div>{userData.name || "User Name"}</div>
                        <div style={{ fontSize: "0.8em", opacity: 0.8 }}>
                          {userData.email || "user@example.com"}
                        </div>
                      </>
                    }
                    arrow
                  >
                    <IconButton onClick={handleMenuToggle} size="large">
                      <Badge badgeContent={unreadCompletedCount} color="error" overlap="circular">
                        <Avatar
                          src={userData.profilePic}
                          alt={userData.name || "User Profile"}
                          sx={{ width: 40, height: 40 }}
                        />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleOpenSignup}
                  sx={{
                    borderRadius: "10px",
                    background: "linear-gradient(90deg, #1db954, #11998e)",
                    textTransform: "none",
                    px: 3,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  Sign In
                </Button>
              )}
            </Box>

            {/* Mobile Menu Icon & Profile */}
            <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1 }}>
              {isLoggedIn && (
                <>
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      navigate("/user/cart");
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                  >
                    <Badge badgeContent={cartCount} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                  <IconButton onClick={handleMenuToggle} size="large">
                    <Badge badgeContent={unreadCompletedCount} color="error" overlap="circular">
                      <Avatar
                        src={userData.profilePic}
                        alt={userData.name || "User Profile"}
                        sx={{ width: 35, height: 35 }}
                      />
                    </Badge>
                  </IconButton>
                </>
              )}
              <IconButton
                onClick={handleDrawerToggle(!drawerOpen)}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      </Slide>

      {/* Profile Menu - Moved here to be accessible from both mobile and desktop triggers */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        disableAutoFocusItem
      >
        <MenuItem
          onClick={() => {
            navigate("user/dashboard/orderlist");
            handleMenuClose();
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
        >
          Dashboard
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("user/settings");
            handleMenuClose();
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
        >
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 300 },
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            p: 2,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <IconButton onClick={handleDrawerToggle(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, p: 2 }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (item.label === "Personal Dua") {
                      setOpenPersonalDua(true);
                      setDrawerOpen(false);
                    } else if (item.type === "link" && typeof item.value === "string") {
                      navigate(item.value);
                      setDrawerOpen(false);
                      window.scrollTo({ top: 0, behavior: "instant" });
                    } else if (item.type === "tab" && typeof item.value === "number") {
                      handleTabNavigation(item.value);
                      setDrawerOpen(false);
                    } else if (item.type === "section" && typeof item.value === "string") {
                      handleSectionScroll(item.value);
                      setDrawerOpen(false);
                    }
                  }}
                  sx={{
                    "&.active .MuiListItemText-primary": {
                      color: "#4CAF50",
                      fontWeight: "bold",
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ sx: { fontWeight: 500 } }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>

          <Button
            variant="contained"
            onClick={() => {
              handleSectionScroll("PersonalDua");
              setDrawerOpen(false);

            }}
            sx={{
              borderRadius: "10px",
              background: "linear-gradient(90deg, #1db954, #11998e)",
              textTransform: "none",
              py: 1.5,
              mb: 2,
              width: "100%",
            }}
          >
            Request Baraka
          </Button>

          {!isLoggedIn && (
            <Button
              variant="contained"
              onClick={handleOpenSignup}
              sx={{
                borderRadius: "10px",
                background: "linear-gradient(90deg, #1db954, #11998e)",
                textTransform: "none",
                py: 1.5,
                width: "100%",
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Drawer>

      {/* SIGNUP FORM */}
      <Dialog
        open={openSignup}
        onClose={handleCloseSignup}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <DialogContent
          sx={{ position: "relative", p: 0, backgroundColor: "transparent" }}
        >
          <SignupForm
            onClose={handleCloseSignup}
            onAuthSuccess={handleAuthSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Personal Dua Popup from Header */}
      <PersonalDuaDialog
        open={openPersonalDua}
        onClose={() => setOpenPersonalDua(false)}
        onPaidOptionSelect={() => {
          setOpenPersonalDua(false);
          handleTabNavigation(0);
        }}
        onFreeOptionSelect={() => {
          setOpenPersonalDua(false);
          handleTabNavigation(4);
        }}
        onOpenLogin={handleOpenSignup}
      />
    </>
  );
};

export default Header;
