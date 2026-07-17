import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  CircularProgress,
  Collapse,
  Badge,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate, useLocation } from "react-router-dom";
import OrderDetails from "./OrderDetails";
import { getOrdersByUserId, markOrderRead } from "../../services/orderService";
import { Order } from "../../types/order";
import OrderChat from "./OrderChat";

const AllOrders: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<"OrderID" | "Status" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Clear selected order when route changes to orders list (without id)
  useEffect(() => {
    if (location.pathname === "/user/dashboard/orders") {
      setSelectedOrder(null);
    }
  }, [location.pathname]);

  // 🧠 Fetch orders for logged-in user
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = localStorage.getItem("userId"); // 👈 Must exist in localStorage
        if (!userId) {
          console.error("❌ No userId found in localStorage!");
          setLoading(false);
          return;
        }

        const data = await getOrdersByUserId(userId);
        setOrders(data);
      } catch (error) {
        console.error("❌ Error fetching user orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    fetchOrders();
  }, []);

  // 🔗 Auto-expand order from URL query param
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderIdParam = searchParams.get("orderId");
    if (orderIdParam) {
      setExpandedOrderId(orderIdParam);

      // Scroll to that order once orders are loaded
      if (!loading && orders.length > 0) {
        setTimeout(() => {
          const element = document.getElementById(`order-${orderIdParam}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 500);
      }
    }
  }, [location.search, loading, orders]);

  // 🔽 Sorting logic
  const sortedOrders = [...orders].sort((a, b) => {
    // 1. 'User Review Requested' always on top
    const isAReview = a.Status === "User Review Requested";
    const isBReview = b.Status === "User Review Requested";

    if (isAReview && !isBReview) return -1;
    if (!isAReview && isBReview) return 1;

    // 2. Unread orders (with dots) next on top
    const isAUnread = (a.Status === "Completed" || a.Status === "User Review Requested") && a.isReadByUser === false;
    const isBUnread = (b.Status === "Completed" || b.Status === "User Review Requested") && b.isReadByUser === false;

    if (isAUnread && !isBUnread) return -1;
    if (!isAUnread && isBUnread) return 1;

    if (!sortColumn) return 0;

    const dir = sortDirection === "asc" ? 1 : -1;
    if (sortColumn === "OrderID") {
      const aId = a.OrderID ?? 0;
      const bId = b.OrderID ?? 0;
      return (aId - bId) * dir;
    }
    if (sortColumn === "Status") {
      const aStatus = a.Status ?? "";
      const bStatus = b.Status ?? "";
      return aStatus.localeCompare(bStatus) * dir;
    }

    return 0;
  });

  const handleSort = (column: "OrderID" | "Status") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    navigate(`/user/dashboard/orders/${order._id}`);
    // Scroll to top when navigating to order details
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExpandClick = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // Prevent navigating to details

    const isExpanding = expandedOrderId !== orderId;
    setExpandedOrderId(prev => prev === orderId ? null : orderId);

    // Call API and remove dot ONLY when collapsing the unread order
    if (!isExpanding) {
      const order = orders.find(o => o._id === orderId);
      if (order && (order.Status === "Completed" || order.Status === "User Review Requested") && order.isReadByUser === false) {
        // Optimistic UI Update: Mark as read immediately
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, isReadByUser: true } : o));

        try {
          // Mark as read in backend
          await markOrderRead(orderId);

          // Trigger global unread count update
          window.dispatchEvent(new Event("unreadCountUpdated"));
        } catch (error) {
          console.error("Failed to mark order as read", error);
          // Revert optimistic update on error if needed
        }
      }
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );

  return (
    <>
      {!selectedOrder ? (
        <Paper
          elevation={2}
          sx={{
            width: "98%",
            margin: "0 auto",
            borderRadius: 2,
            boxShadow: "0 0 8px rgba(0,0,0,0.15)",
            overflowX: "auto",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: { xs: 1, sm: 2 },
                py: 1,
                borderBottom: "2px solid #ddd",
                backgroundColor: "#f9f9f9",
                fontWeight: 600,
              }}
            >
              <Box display="flex" alignItems="center" sx={{ width: "35%" }}>
                <Typography variant={isSmall ? "body2" : "subtitle1"} fontWeight={600}>
                  Title
                </Typography>
                <IconButton size="small" onClick={() => handleSort("OrderID")}>
                  {sortColumn === "OrderID" && sortDirection === "desc" ? (
                    <ArrowDropUpIcon fontSize="small" />
                  ) : (
                    <ArrowDropDownIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>

              <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: "30%" }}>
                <Typography variant={isSmall ? "body2" : "subtitle1"} fontWeight={600}>
                  Action
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" sx={{ width: "35%", justifyContent: "flex-end", pr: 4 }}>
                <Typography variant={isSmall ? "body2" : "subtitle1"} fontWeight={600}>
                  Status
                </Typography>
                <IconButton size="small" onClick={() => handleSort("Status")}>
                  {sortColumn === "Status" && sortDirection === "desc" ? (
                    <ArrowDropUpIcon fontSize="small" />
                  ) : (
                    <ArrowDropDownIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>
            </Box>

            {/* Rows */}
            {sortedOrders.map((order) => (
              <React.Fragment key={order._id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: { xs: 1, sm: 2 },
                    py: 1,
                    borderBottom: "1px solid #eee",
                    "&:last-child": { borderBottom: "none" },
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                    backgroundColor: expandedOrderId === order._id ? "#f0f8ff" : "inherit"
                  }}
                  id={`order-${order._id}`}
                  onClick={(e) => handleExpandClick(e, order._id || "")}
                >
                  <Typography sx={{ width: "35%", fontSize: "1rem", textAlign: "left" }}>
                    <Badge color="error" variant="dot" invisible={!((order.Status === "Completed" || order.Status === "User Review Requested") && order.isReadByUser === false)} sx={{ mr: 1 }}>
                      {/* Badge anchor */}
                    </Badge>
                    {order.OrderTitle} — #{order.OrderID}
                  </Typography>

                  <Box sx={{ width: "30%", display: "flex", justifyContent: "center" }}>
                    <Typography
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(order);
                      }}
                      sx={{
                        cursor: "pointer",
                        fontSize: "1rem", // Match title style
                        "&:hover": { color: "primary.main" }
                      }}
                    >
                      View Request Details
                    </Typography>
                  </Box>

                  <Box sx={{ width: "35%", display: "flex", justifyContent: "flex-end", alignItems: 'center' }}>
                    <Chip
                      label={
                        order.Status === "Completed" || ((order.Status && order.Status.toLowerCase().includes("rejected")) || order.Status === 'User Review Requested') || order.Status === 'Pending Admin Review'
                          ? order.Status
                          : "In Progress by Scholar"
                      }
                      color={
                        order.Status === "Completed"
                          ? "success" // Green
                          : ((order.Status && order.Status.toLowerCase().includes("rejected")) || order.Status === 'User Review Requested')
                            ? "primary"   // Blue
                            : "default" // Fallback for customized Amber
                      }
                      sx={{
                        ml: 1,
                        color: "white", // Default fallback
                        ...((order.Status === 'Pending Admin Review') ? {
                          bgcolor: "#eab308", // Yellow
                          color: "#000"
                        } : ((order.Status !== "Completed" && !((order.Status && order.Status.toLowerCase().includes("rejected")) || order.Status === 'User Review Requested')) && {
                          bgcolor: "#ed6c02", // Amber
                          color: "white"
                        }))
                      }}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleExpandClick(e, order._id || "")}
                      sx={{ ml: 1 }}
                    >
                      {expandedOrderId === order._id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </Box>
                </Box>
                <Collapse in={expandedOrderId === order._id} timeout="auto" unmountOnExit>
                  <OrderChat
                    orderId={order._id || ""}
                    orderTitle={order.OrderTitle || ""}
                    orderStatus={order.Status || ""}
                    orderID={order.OrderID || 0}
                  />
                </Collapse>
              </React.Fragment>
            ))}
          </Box>
        </Paper >
      ) : (
        <OrderDetails />
      )}
    </>
  );
};

export default AllOrders;
