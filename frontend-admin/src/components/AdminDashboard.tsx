import React, { useState, useEffect, Suspense, lazy } from "react";
import { Box, Tabs, Tab, Toolbar, Typography, Button, Container, CircularProgress, Badge } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllOrdersWithConversations } from '../services/userConversationService';
import { getAllReviews } from '../services/reviewService';
import { getAllPlatformTestimonials } from '../services/platformTestimonialService';

// Lazy load tab components for code splitting
const ScholarChat = lazy(() => import("./ScholarChat"));
const UserChat = lazy(() => import("./UserChat"));
const Payments = lazy(() => import("./Payments"));
const ManageScholars = lazy(() => import("./ManageScholars"));
const UserReviews = lazy(() => import("./UserReviews")); // NEW Component
const UserTestimonials = lazy(() => import("./UserTestimonials"));
const ManageDuas = lazy(() => import("../pages/ManageDuas")); // NEW Component
const ManageCategories = lazy(() => import("../pages/ManageCategories")); // NEW Component
const ManageUsers = lazy(() => import("./ManageUsers")); // NEW Component
const ManageEvents = lazy(() => import("../pages/ManageEvents")); // NEW Component

// ... (keep intermediary code)

const pathToTabIndex: { [key: string]: number } = {
  '/admin/dashboard/scholars': 0,
  '/admin/dashboard/orders': 1,
  '/admin/dashboard/users': 2,
  '/admin/dashboard/payments': 3,
  '/admin/dashboard/manage-scholars': 4,
  '/admin/dashboard/scholar-reviews': 5,
  '/admin/dashboard/platform-reviews': 6,
  '/admin/dashboard/duas': 7,
  '/admin/dashboard/categories': 8,
  '/admin/dashboard/events': 9,
};

const tabIndexToPath: { [key: number]: string } = {
  0: '/admin/dashboard/scholars',
  1: '/admin/dashboard/orders',
  2: '/admin/dashboard/users',
  3: '/admin/dashboard/payments',
  4: '/admin/dashboard/manage-scholars',
  5: '/admin/dashboard/scholar-reviews',
  6: '/admin/dashboard/platform-reviews',
  7: '/admin/dashboard/duas',
  8: '/admin/dashboard/categories',
  9: '/admin/dashboard/events',
};

// ... (keep intermediary code)



interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  keepMounted?: boolean;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, keepMounted, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {(value === index || keepMounted) && (
        <Box sx={{ p: 3, display: value === index ? 'block' : 'none' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// Get current tab index from URL
const getTabIndexFromPath = (path: string): number => {
  return pathToTabIndex[path] ?? 0;
};

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [value, setValue] = useState(getTabIndexFromPath(location.pathname));
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [scholarReviewCount, setScholarReviewCount] = useState<number>(0);
  const [platformReviewCount, setPlatformReviewCount] = useState<number>(0);
  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([getTabIndexFromPath(location.pathname)]));
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Sync tab value with URL changes
  useEffect(() => {
    const tabIndex = getTabIndexFromPath(location.pathname);
    setValue(tabIndex);
    setVisitedTabs(prev => {
      const newSet = new Set(prev);
      newSet.add(tabIndex);
      return newSet;
    });
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Fetch counts for badges
  const fetchCounts = React.useCallback(async () => {
    try {
      // OPTIMIZATION: Fetch all counts in parallel
      const [ordersResponse, reviewsData, testimonialsData] = await Promise.all([
        getAllOrdersWithConversations(),
        getAllReviews(),
        getAllPlatformTestimonials()
      ]);

      // Process Orders Count
      const pendingOrders = ordersResponse.ordersWithConversations.filter((item: any) =>
        item.order && (item.order.Status === 'Pending Admin Review')
      ).length;
      setOrdersCount(pendingOrders - 1);

      // Process Scholar Reviews Count
      const pendingReviews = reviewsData.filter((r: any) => r.status === 'pending').length;
      setScholarReviewCount(pendingReviews);

      // Process Platform Testimonials Count
      if (Array.isArray(testimonialsData)) {
        const pendingTestimonials = testimonialsData.filter((t: any) => t.status === 'pending').length;
        setPlatformReviewCount(pendingTestimonials);
      }

    } catch (error) {
      console.error("Error fetching dashboard counts:", error);
    }
  }, []);

  useEffect(() => {
    fetchCounts();

    // Refresh counts every 30 seconds
    const intervalId = setInterval(fetchCounts, 30000);
    return () => clearInterval(intervalId);
  }, [fetchCounts]);

  // Auto-refresh dashboard every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    const path = tabIndexToPath[newValue];
    if (path) {
      navigate(path);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: "100% !important",
        backgroundColor: "white",
        color: "black",
        minHeight: "100vh",
        py: 2
      }}
    >
      <Toolbar sx={{
        width: "87%",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        px: 0,
        color: "black"
      }}>
        <Typography variant="h5" fontWeight="bold" color="black">
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          color="success"
          sx={{ borderRadius: "10px", background: "linear-gradient(180deg, #0A9E6F 0%, #098B62 49.04%, #087955 100%)" }}
          onClick={() => navigate('/admin/dashboard/add-scholar')}
        >
          Add Scholar
        </Button>
      </Toolbar>

      <Box sx={{ width: '100%' }}>
        <Box sx={{
          borderBottom: 1,
          borderColor: 'black',
          width: "88.5%",
          margin: "0 auto",
          px: 0,
          position: 'relative'
        }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="admin dashboard tabs"
            sx={{
              color: "black",
              "& .MuiTabs-flexContainer": {
                flexWrap: "wrap",
              }
            }}
            slotProps={{
              indicator: {
                sx: {
                  backgroundColor: "green",
                  height: "2px",
                  borderRadius: "2px 2px 0 0",
                },
              },
            }}
          >
            <Tab
              label="Scholars"
              {...a11yProps(0)}
              sx={{
                color: "black",
                "&.Mui-selected": { color: "green", fontWeight: "bold" },
                position: 'relative',
                zIndex: 1,
              }}
            />
            <Tab
              label={
                <Badge badgeContent={ordersCount} color="error" sx={{ '& .MuiBadge-badge': { right: -15, top: 5 } }}>
                  Requests
                </Badge>
              }
              {...a11yProps(1)}
              sx={{
                color: "black",
                "&.Mui-selected": { color: "green", fontWeight: "bold" },
                position: 'relative',
                zIndex: 1,
                overflow: 'visible'
              }}
            />
            <Tab
              label="Users"
              {...a11yProps(2)}
              sx={{
                color: "black",
                "&.Mui-selected": { color: "green", fontWeight: "bold" },
                position: 'relative',
                zIndex: 1,
              }}
            />
            <Tab
              label="Payments"
              {...a11yProps(3)}
              sx={{
                color: "black",
                "&.Mui-selected": { color: "green", fontWeight: "bold" },
                position: 'relative',
                zIndex: 1,
              }}
            />
            <Tab
              label="Manage Scholars"
              {...a11yProps(4)}
              sx={{
                color: "black",
                "&.Mui-selected": { color: "green", fontWeight: "bold" },
                position: 'relative',
                zIndex: 1,
              }}
            />
            <Tab
              label={
                <Badge badgeContent={scholarReviewCount} color="error" sx={{ '& .MuiBadge-badge': { right: -15, top: 5 } }}>
                  Scholar Reviews
                </Badge>
              }
              {...a11yProps(5)}
              sx={{
                color: "black",
                "&.Mui-selected": { color: "green", fontWeight: "bold" },
                position: 'relative',
                zIndex: 1,
                overflow: 'visible'
              }}
            />
            <Tab
              label={
                <Badge badgeContent={platformReviewCount} color="error" sx={{ '& .MuiBadge-badge': { right: -15, top: 5 } }}>
                  Platform Reviews
                </Badge>
              }
              {...a11yProps(6)}
              sx={{
                color: "black",
                "&.Mui-selected": { color: "green", fontWeight: "bold" },
                position: 'relative',
                zIndex: 1,
                overflow: 'visible'
              }}
            />
            <Tab
              label="Manage Du'as"
              {...a11yProps(7)}
              sx={{
                color: "black",
                "&.Mui-selected": { color: "green", fontWeight: "bold" },
                position: 'relative',
                zIndex: 1,
              }}
            />
            <Tab
              label="Manage Du'as Categories"
              {...a11yProps(8)}
              sx={{
                color: "black",
                "&.Mui-selected": { color: "green", fontWeight: "bold" },
                position: 'relative',
                zIndex: 1,
              }}
            />
            <Tab
              label="Events"
              {...a11yProps(9)}
              sx={{
                color: "black",
                "&.Mui-selected": { color: "green", fontWeight: "bold" },
                position: 'relative',
                zIndex: 1,
              }}
            />
          </Tabs>
        </Box>

        <Box sx={{ width: { xs: '100%', sm: '100%', md: '90%' }, margin: "0 auto", px: 0 }}>
          <CustomTabPanel value={value} index={0} keepMounted={visitedTabs.has(0)}>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
              {/* @ts-ignore */}
              <ScholarChat refreshTrigger={refreshTrigger} />
            </Suspense>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1} keepMounted={visitedTabs.has(1)}>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
              {/* @ts-ignore */}
              <UserChat onUpdate={fetchCounts} refreshTrigger={refreshTrigger} onEventRefresh={() => setRefreshTrigger(prev => prev + 1)} />
            </Suspense>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2} keepMounted={visitedTabs.has(2)}>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
              {/* @ts-ignore */}
              <ManageUsers refreshTrigger={refreshTrigger} />
            </Suspense>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3} keepMounted={visitedTabs.has(3)}>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
              {/* @ts-ignore */}
              <Payments refreshTrigger={refreshTrigger} />
            </Suspense>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={4} keepMounted={visitedTabs.has(4)}>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
              {/* @ts-ignore */}
              <ManageScholars refreshTrigger={refreshTrigger} />
            </Suspense>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={5} keepMounted={visitedTabs.has(5)}>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
              {/* @ts-ignore */}
              <UserReviews onUpdate={fetchCounts} refreshTrigger={refreshTrigger} />
            </Suspense>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={6} keepMounted={visitedTabs.has(6)}>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
              {/* @ts-ignore */}
              <UserTestimonials onUpdate={fetchCounts} refreshTrigger={refreshTrigger} />
            </Suspense>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={7} keepMounted={visitedTabs.has(7)}>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
              {/* @ts-ignore */}
              <ManageDuas refreshTrigger={refreshTrigger} />
            </Suspense>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={8} keepMounted={visitedTabs.has(8)}>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
              {/* @ts-ignore */}
              {/* @ts-ignore */}
              <ManageCategories refreshTrigger={refreshTrigger} />
            </Suspense>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={9} keepMounted={visitedTabs.has(9)}>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
              {/* @ts-ignore */}
              <ManageEvents refreshTrigger={refreshTrigger} />
            </Suspense>
          </CustomTabPanel>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboard;