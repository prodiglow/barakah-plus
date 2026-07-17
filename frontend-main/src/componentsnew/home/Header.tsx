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
    Dialog,
    DialogContent,
    Avatar,
    Tooltip,
    Menu,
    MenuItem,
    // Divider,
    Badge,
    Grid,
    Card,
    CardMedia,
    Popover
} from "@mui/material";
import { toast } from "react-toastify";
// import { useTheme } from "@mui/material/styles"; // Unused
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SignupForm from "../../Components/SignupForm";
import { getUser } from "../../services/userService";
import { authEvents } from "../../utils/authEvents";
import PersonalDuaDialog from "../../Components/home_page/PersonalDuaDialog";
import ScrollingBar from "./ScrollingBar";
import { useCart } from "../../context/CartContext";

const categories = [
    {
        title: 'Prayers Mats & Caps',
        image: 'https://res.cloudinary.com/debszasgn/image/upload/v1769516399/8da69203b6f6d16b3bb16da47d81bd0534d06f26_hrolmf.jpg',
    },
    {
        title: 'Accessories',
        image: 'https://res.cloudinary.com/debszasgn/image/upload/v1769516399/4959111f78d2e9354c03ab5be655edad7e12e9b1_avo6gr.jpg',
    },
    {
        title: 'Islamic books & Literature',
        image: 'https://res.cloudinary.com/debszasgn/image/upload/v1769516400/3ced35ac20c2a61a85bf8d77d5eaca480118afb0_jmji9j.jpg',
    },
    {
        title: 'Prayer Mat',
        image: 'https://res.cloudinary.com/debszasgn/image/upload/v1769516399/5b73a0a574a2dcb2266074cd9fa5b040ccbe3d82_musvlv.jpg',
    },
    {
        title: 'White Knit Kufi Cap',
        image: 'https://res.cloudinary.com/debszasgn/image/upload/v1769516399/7e216fafb151b30e909938579ae55ec78f1a0998_tbxkdg.jpg',
    },
    {
        title: 'Tasbih',
        image: 'https://res.cloudinary.com/debszasgn/image/upload/v1769516399/e7eaed9644f2f25623e9f6937841392545185e74_md8jcb.jpg',
    },
];

const Header: React.FC = () => {
    // const theme = useTheme(); // Unused
    // const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Unused variable
    const [unreadCompletedCount, setUnreadCompletedCount] = useState<number>(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [openSignup, setOpenSignup] = useState(false);
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

    // Category Menu State
    const [categoryAnchorEl, setCategoryAnchorEl] = useState<HTMLElement | null>(null);

    // Cart Context
    const { getTotalItems } = useCart();

    const navigate = useNavigate();
    const location = useLocation();
    // const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 0 }); // Unused variable for sticky header

    const navItems = [
        { label: "Home", type: "link", value: "/" },
        { label: "Prayers Mats", type: "category", value: "Prayers Mats & Caps" },
        { label: "Accessories", type: "category", value: "Accessories" },
        { label: "Islamic Books", type: "category", value: "Islamic books & Literature" },
        { label: "Tasbih", type: "category", value: "Tasbih" },
        { label: "Categories", type: "mega-menu" },
        { label: "Shop", type: "link", value: "/shop-islamic" },
        // { label: "About", type: "link", value: "/about-us" },
        { label: "FAQ", type: "link", value: "/faq" },
    ];

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const data = await getUser(token);
                    setUserData(data);
                    setIsLoggedIn(true);

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

        const unsubscribe = authEvents.listen(() => {
            fetchUserProfile();
        });

        const unsubscribeLogin = authEvents.listenOpenLogin(() => {
            handleOpenSignup();
        });

        const unreadHandler = () => fetchUserProfile();
        window.addEventListener("unreadCountUpdated", unreadHandler);

        return () => {
            unsubscribe();
            unsubscribeLogin();
            window.removeEventListener("unreadCountUpdated", unreadHandler);
        };
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const from = location.state?.from;

        if (params.get("login") === "true" || (from && !isLoggedIn)) {
            setOpenSignup(true);
            if (params.get("login") === "true") {
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.replaceState({ path: newUrl }, "", newUrl);
            }
        }
    }, [location.search, location.state, isLoggedIn]);

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
        const fromPath = location.state?.from?.pathname;
        if (fromPath) {
            navigate(fromPath + (location.state?.from?.search || ""), { replace: true });
        } else {
            navigate("/");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        setAnchorEl(null);
        toast.success("Logout successful ✅");
        navigate("/");
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

    const handleNavClick = (item: any) => {
        setDrawerOpen(false);
        if (item.type === "link") {
            navigate(item.value);
            window.scrollTo({ top: 0, behavior: "instant" });
        } else if (item.type === "category") {
            navigate(`/islamic-merchandise/${encodeURIComponent(item.value)}`);
            window.scrollTo({ top: 0, behavior: "instant" });
        }
        // Mega menu click logic handled by hover usually, but for mobile we might need something else
    };

    // Hover handlers for Categories
    const handleCategoryMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setCategoryAnchorEl(event.currentTarget);
    };

    const handleCategoryMenuClose = () => {
        setCategoryAnchorEl(null);
    };

    return (
        <>
            <ScrollingBar />
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    top: 0,
                    backgroundColor: "white",
                    color: "black",
                    px: { xs: 2, sm: 3, md: 15 },
                    zIndex: 1201,
                    borderBottom: "1px solid #e0e0e0"
                }}
            >
                <Toolbar
                    disableGutters
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "nowrap",
                        width: "85%",
                        margin: "0 auto",
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
                            to="/"
                            onClick={() => {
                                setDrawerOpen(false);
                                window.scrollTo({ top: 0, behavior: "instant" });
                            }}
                            sx={{
                                fontWeight: "bold",
                                fontSize: { xs: "1.5rem", md: "1.8rem" },
                                textDecoration: "none",
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
                                overflow: "visible", // Allow submenu to show
                            }}
                        >
                            {navItems.map((item) => (
                                <Box
                                    key={item.label}
                                    onMouseEnter={item.type === 'mega-menu' ? handleCategoryMenuOpen : undefined}
                                    onMouseLeave={item.type === 'mega-menu' ? handleCategoryMenuClose : undefined}
                                    sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                                >
                                    <Typography
                                        onClick={() => (item.type === 'link' || item.type === 'category') && handleNavClick(item)}
                                        variant="body1"
                                        sx={{
                                            cursor: "pointer",
                                            position: "relative",
                                            textDecoration: "none",
                                            color: "inherit",
                                            px: 1,
                                            py: 1,
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

                                    {/* Mega Menu Dropdown */}
                                    {item.type === 'mega-menu' && (
                                        <Popover
                                            id="category-menu-popover"
                                            open={Boolean(categoryAnchorEl)}
                                            anchorEl={categoryAnchorEl}
                                            onClose={handleCategoryMenuClose}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'center',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'center',
                                            }}
                                            disableRestoreFocus
                                            sx={{
                                                pointerEvents: 'none',
                                            }}
                                            PaperProps={{
                                                onMouseEnter: () => {/* Keep open */ },
                                                onMouseLeave: handleCategoryMenuClose,
                                                sx: {
                                                    pointerEvents: 'auto',
                                                    mt: 2,
                                                    p: 3,
                                                    width: '1000px',
                                                    maxWidth: '95vw',
                                                    left: '50% !important',
                                                    transform: 'translateX(-50%) !important',
                                                    borderRadius: 2,
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                                }
                                            }}
                                        >
                                            <Grid container spacing={2}>
                                                {categories.map((cat, idx) => (
                                                    <Grid size={{ xs: 12, sm: 4 }} key={idx}>
                                                        <Card
                                                            onClick={() => {
                                                                navigate(`/islamic-merchandise/${encodeURIComponent(cat.title)}`);
                                                                window.scrollTo({ top: 0, behavior: "instant" });
                                                                handleCategoryMenuClose();
                                                            }}
                                                            sx={{
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                p: 1,
                                                                '&:hover': { bgcolor: '#f5f5f5' }
                                                            }}
                                                        >
                                                            <CardMedia
                                                                component="img"
                                                                sx={{ width: 50, height: 50, borderRadius: 1, mr: 2, objectFit: 'cover' }}
                                                                image={cat.image}
                                                                alt={cat.title}
                                                            />
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {cat.title}
                                                            </Typography>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Popover>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* RIGHT SECTION - Cart & Profile */}
                    <Box
                        sx={{
                            display: { xs: "none", md: "flex" },
                            alignItems: "center",
                            gap: 2,
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {/* Cart Icon */}
                        <Tooltip title="Shopping Cart" arrow>
                            <IconButton
                                onClick={() => {
                                    navigate("/cart1");
                                    window.scrollTo({ top: 0, behavior: "instant" });
                                }}
                                sx={{
                                    color: "inherit",
                                    transition: "all 0.3s ease",
                                    "&:hover": { color: "#4CAF50" },
                                }}
                            >
                                <Badge
                                    badgeContent={getTotalItems()}
                                    color="error"
                                    sx={{
                                        "& .MuiBadge-badge": {
                                            fontSize: "0.7rem",
                                            minWidth: "18px",
                                            height: "18px",
                                        },
                                    }}
                                >
                                    <ShoppingCartOutlinedIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>

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
                                        <Avatar
                                            src={userData.profilePic}
                                            alt={userData.name || "User Profile"}
                                            sx={{ width: 40, height: 40 }}
                                        />

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
                        {/* Mobile Cart Icon */}
                        <IconButton
                            onClick={() => {
                                navigate("/cart1");
                                window.scrollTo({ top: 0, behavior: "instant" });
                            }}
                            sx={{ color: "inherit" }}
                        >
                            <Badge
                                badgeContent={getTotalItems()}
                                color="error"
                                sx={{
                                    "& .MuiBadge-badge": {
                                        fontSize: "0.65rem",
                                        minWidth: "16px",
                                        height: "16px",
                                    },
                                }}
                            >
                                <ShoppingCartOutlinedIcon fontSize="small" />
                            </Badge>
                        </IconButton>
                        {isLoggedIn && (
                            <>
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

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                disableAutoFocusItem
            >

                {/* <MenuItem
                    onClick={() => {
                        navigate("user/settings");
                        handleMenuClose();
                        window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                >
                    Settings
                </MenuItem>
                <Divider /> */}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>

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
                            <React.Fragment key={item.label}>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => (item.type === 'link' || item.type === 'category') ? handleNavClick(item) : undefined}
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

                                {/* Mobile Categories List */}
                                {item.type === 'mega-menu' && (
                                    <Box sx={{ pl: 2 }}>
                                        {categories.map((cat, idx) => (
                                            <ListItemButton key={idx} onClick={() => {
                                                navigate(`/islamic-merchandise/${encodeURIComponent(cat.title)}`);
                                                setDrawerOpen(false);
                                            }}>
                                                <ListItemText primary={cat.title} primaryTypographyProps={{ variant: 'body2' }} />
                                            </ListItemButton>
                                        ))}
                                    </Box>
                                )}
                            </React.Fragment>
                        ))}
                    </List>
                </Box>

                <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
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

            <PersonalDuaDialog
                open={openPersonalDua}
                onClose={() => setOpenPersonalDua(false)}
                onPaidOptionSelect={() => {
                    setOpenPersonalDua(false);
                }}
                onFreeOptionSelect={() => {
                    setOpenPersonalDua(false);
                }}
                onOpenLogin={handleOpenSignup}
            />
        </>
    );
};

export default Header;
