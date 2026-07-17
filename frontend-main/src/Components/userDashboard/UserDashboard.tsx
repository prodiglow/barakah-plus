// UserDashboard.tsx
import React from "react";
import { Box, Typography, Tabs, Tab, Paper } from "@mui/material";
import { Routes, Route, useNavigate } from "react-router-dom";
import AllOrders from "./AllOrders";
import OrderDetails from "./OrderDetails";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  // const location = useLocation(); // Not really needed for tab selection anymore if always 0

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Only one tab, but keep navigation reset logic just in case
    if (newValue === 0) {
      navigate("/user/dashboard/orders", { replace: true });
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: "white",
        minHeight: { xs: "500px", sm: "500px", md: "700px" },
        width: "100%",
        pt: { xs: 10, sm: 10, md: 5 },
        pb: 10,
      }}
    >
      <Box width="87.5%" mx="auto">
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={600}>
            User Dashboard
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              ml: 2,
              px: 1.5,
              py: 0.5,
              borderRadius: "10px",
              border: "1px solid #4caf50",
              backgroundColor: "#e8f5e9",
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#4caf50",
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500, color: "black" }}>
              Active
            </Typography>
          </Box>
        </Box>

        <Tabs
          value={0}
          onChange={handleTabChange}
          textColor="inherit"
          TabIndicatorProps={{
            style: { backgroundColor: "green" },
          }}
          sx={{
            "& .MuiTab-root": {
              color: "gray",
              "&.Mui-selected": {
                color: "green",
              },
            },
          }}
        >
          <Tab
            label="All Requests / Progress"
            onClick={() => {
              navigate("/user/dashboard/orders", { replace: true });
            }}
          />
        </Tabs>

        {/* Nested Routes */}
        <Box mt={2} width="100%">
          <Routes>
            <Route path="orders" element={<AllOrders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            {/* Removed progress route, default redirects to AllOrders */}
            <Route path="*" element={<AllOrders />} />
          </Routes>
        </Box>
      </Box>
    </Paper>
  );
};

export default UserDashboard;

