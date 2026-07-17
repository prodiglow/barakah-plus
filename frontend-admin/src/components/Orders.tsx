import * as React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  TableSortLabel,
  Snackbar
} from '@mui/material';
import { getAllOrdersWithConversations } from '../services/userConversationService';
import { getRemindersByOrderId, createReminder, updateReminder, incrementReminderCount } from '../services/reminderService';
import { updateOrder } from '../services/orderService';
import { sendGenericEmail } from '../services/emailService';
import { Reminder } from '../types/reminder';

interface OrderDisplay {
  id: string;
  orderId: number;
  orderTitle: string;
  scholarName: string;
  status: string;
}

const Orders: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [orders, setOrders] = React.useState<OrderDisplay[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reminders, setReminders] = React.useState<Map<string, Reminder>>(new Map());
  const [loadingReminders, setLoadingReminders] = React.useState<Set<string>>(new Set());
  const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string>('Reminder sent successfully');

  // Fetch reminders for a specific order
  const fetchReminderForOrder = async (orderId: string) => {
    try {
      setLoadingReminders(prev => new Set(prev).add(orderId));
      const response = await getRemindersByOrderId(orderId);

      if (response.success && response.data && response.data.length > 0) {
        // Get the most recent reminder (first one since they're sorted by createdAt desc)
        const latestReminder = response.data[0];
        setReminders(prev => new Map(prev).set(orderId, latestReminder));
      } else {
        // No reminder exists for this order
        setReminders(prev => {
          const newMap = new Map(prev);
          newMap.delete(orderId);
          return newMap;
        });
      }
    } catch (err) {
      console.error(`Error fetching reminder for order ${orderId}:`, err);
      // If reminder doesn't exist, that's okay - just don't set it
    } finally {
      setLoadingReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Fetch orders from API
  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllOrdersWithConversations();
        const ordersData: OrderDisplay[] = response.ordersWithConversations
          .filter(item => item && item.order) // Filter out invalid items
          .map((item) => {
            const scholar = item.order.ScholarID;
            const scholarName = scholar && typeof scholar === 'object' && 'scholarName' in scholar
              ? scholar.scholarName
              : 'N/A';

            // Return status as is without transformation
            // let displayStatus: string = item.order.Status;
            // if (displayStatus === 'Pending Admin Review') {
            //   displayStatus = 'Pending';
            // }

            return {
              id: item.order._id,
              orderId: item.order.OrderID,
              orderTitle: item.order.OrderTitle || `Order #${item.order.OrderID}`,
              scholarName: scholarName,
              status: item.order.Status
            };
          });

        // Sort orders by status priority
        const getPriority = (status: string) => {
          if (status === 'Scholar Submitted – Pending Review') return 1;
          if (status === 'Pending Admin Review') return 2;
          if (status === 'Completed') return 4;
          return 3;
        };

        ordersData.sort((a, b) => getPriority(a.status) - getPriority(b.status));

        setOrders(ordersData);

        // Fetch reminders for all orders
        ordersData.forEach(order => {
          fetchReminderForOrder(order.id);
        });
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'Completed') return 'success';
    if (status && (status.toLowerCase().includes('rejected') || status === 'User Review Requested')) return 'primary';
    return 'warning';
  };

  const baseLink = import.meta.env.VITE_ADMIN_BASE_URL || window.location.origin;

  const handleSendReminder = async (orderId: string) => {
    try {
      // 1. Reminder Logic (Existing)
      const existingReminder = reminders.get(orderId);

      if (existingReminder && existingReminder._id) {
        await incrementReminderCount(existingReminder._id);
        await updateReminder(existingReminder._id, { IsSendReminder: 1 });
        await fetchReminderForOrder(orderId);
      } else {
        const response = await createReminder({
          OrderID: orderId,
          reminderCount: 1,
          IsSendReminder: 1,
        });
        if (response.success && response.data) {
          setReminders(prev => new Map(prev).set(orderId, response.data));
        }
      }

      // 2. Forward Logic (New - from UserChat)
      const orderUrl = `${baseLink}/order/${orderId}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(orderUrl);

      // Update order status
      await updateOrder(orderId, { Status: 'In Progress By Scholar' });

      // Send Email Notification
      // Find the order in our list to get details
      // Find the order in our list to get details
      // const orderDisplay = orders.find(o => o.id === orderId); // Removed unused variable

      // We need user email, which isn't in OrderDisplay. 
      // We must fetch full order details or find it in the original response if we kept it.
      // Since 'orders' state is transformed, let's re-fetch or use what we have.
      // Better: Retrieve the order details from the API again or assume we can get it.
      // 'getAllOrdersWithConversations' was called on init. 
      // Making a quick separate call to get email might be safer or just rely on 'orders' if we enrich it.
      // Current 'OrderDisplay' lacks email.
      // Let's do a quick fetch of the order to get UserID.email
      // We can import 'getOrderById' but 'getAllOrdersWithConversations' result has it.
      // But we didn't save the full response in state, only mapped 'orders'.
      // To solve this properly without massive refactor, let's fetch the single order details inside here.
      // Wait, 'updateOrder' doesn't return the populated user.

      // Let's fetch the order details quickly to get email
      try {
        const response = await getAllOrdersWithConversations(); // This might be heavy but it's reliable for now given imports
        const targetItem = response.ordersWithConversations.find((item: any) => item.order._id === orderId);

        if (targetItem && targetItem.order && targetItem.order.UserID) {
          const userEmail = targetItem.order.UserID.email;
          const userName = targetItem.order.UserID.name || "User";
          const orderTitle = targetItem.order.OrderTitle;
          const orderIDDisplay = targetItem.order.OrderID;

          if (userEmail) {
            const emailSubject = `Order Status Update: ${orderTitle} (Order ID: ${orderIDDisplay})`;
            const emailText = `Dear ${userName}, \n\nYour request for "${orderTitle}"(Order ID: ${orderIDDisplay}) has been successfully forwarded to a scholar.\n\nCurrent Status: In Progress By Scholar\n\nYou will receive further updates as the scholar reviews your request.\n\nThank you, \nBaraka Project Team`;
            const emailHtml = `
  <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Order Status Update</h2>
      <p>Dear <strong>${userName}</strong>,</p>
      <p>Your request for <strong>${orderTitle}</strong> has been successfully forwarded to a scholar.</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${orderIDDisplay}</p>
          <p><strong>Service:</strong> ${orderTitle}</p>
          <p><strong>Status:</strong> <span style="color: #0A9E6F; font-weight: bold;">In Progress By Scholar</span></p>
      </div>
      <p>You will receive further updates as the scholar reviews your request.</p>
      <br/>
      <p>Thank you,</p>
      <p><strong>Baraka Project Team</strong></p>
  </div>`;
            await sendGenericEmail(userEmail, emailSubject, emailText, emailHtml);
          }
        }
      } catch (fetchErr) {
        console.error("Error fetching order details for email:", fetchErr);
      }

      setSnackbarMessage('Reminder sent, Link Copied, Status Updated & User Notified!');
      setSnackbarOpen(true);

      // Refresh list to show new status
      // We can just call the initial fetch effect logic?
      // Or just reload page? UserChat reloads.
      // Let's reload to be safe and simple as requested "100% same operation"
      window.location.reload();

    } catch (err) {
      console.error('Error in handleSendReminder:', err);
      setSnackbarMessage('Failed to complete all actions. Please try again.');
      setSnackbarOpen(true);
    }
  };

  // Check if reminder is sent for an order
  const isReminderSent = (orderId: string): boolean => {
    const reminder = reminders.get(orderId);
    if (!reminder) return false;

    // Check if IsSendReminder is true, 1, or truthy
    return reminder.IsSendReminder === true ||
      reminder.IsSendReminder === 1 ||
      Boolean(reminder.IsSendReminder);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Show empty state
  if (orders.length === 0) {
    return (
      <Box sx={{ p: 2, bgcolor: 'background.default', border: "1px solid #ddd" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Requests</Typography>
        <Alert severity="info">No orders found.</Alert>
      </Box>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'background.default', border: "1px solid #ddd" }}>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarMessage.includes('Failed') ? 'error' : 'success'}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Orders
        </Typography>
        <Stack spacing={2}>
          {orders.map((order) => (
            <Card
              key={order.id}
              variant="outlined"
              sx={{
                borderColor: (order.status === 'Pending Admin Review' || order.status === 'Scholar Submitted – Pending Review')
                  ? 'primary.main'
                  : 'divider',
                bgcolor: (order.status === 'Pending Admin Review' || order.status === 'Scholar Submitted – Pending Review')
                  ? '#f5f9ff'
                  : 'background.paper',
                borderWidth: (order.status === 'Pending Admin Review' || order.status === 'Scholar Submitted – Pending Review')
                  ? 2
                  : 1
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Header Row */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        OrderID: {order.orderId}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {order.orderTitle}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip
                        label={order.status}
                        size="small"
                        color={getStatusColor(order.status) as any}
                        sx={{
                          height: 20,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          color: 'white',
                          ...( (order.status === 'Pending Admin Review' || order.status === 'Scholar Submitted – Pending Review') && {
                            bgcolor: '#eab308',
                            color: '#000'
                          })
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Scholar Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      Scholar:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      {order.scholarName}
                    </Typography>
                  </Box>

                  {/* Action Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size={isSmallMobile ? "small" : "medium"}
                      disabled={isReminderSent(order.id) || loadingReminders.has(order.id) || order.status === 'Completed'}
                      onClick={() => handleSendReminder(order.id)}
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                        px: { xs: 2, sm: 3 },
                        textTransform: 'none'
                      }}
                    >
                      Send
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  }

  // Desktop Table View
  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', border: "1px solid #ddd", overflow: 'auto' }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes('Failed') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Table sx={{ minWidth: 650 }} aria-label="orders table">
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel>
                <Typography variant="subtitle1" fontWeight="bold">OrderID</Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel>
                <Typography variant="subtitle1" fontWeight="bold">Title</Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel>
                <Typography variant="subtitle1" fontWeight="bold">Scholar Name</Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel>
                <Typography variant="subtitle1" fontWeight="bold">Status</Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" fontWeight="bold">Reminder</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                '&:hover': { bgcolor: 'action.hover' },
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: (order.status === 'Pending Admin Review' || order.status === 'Scholar Submitted – Pending Review')
                  ? '#f5f9ff'
                  : 'inherit'
              }}
            >
              <TableCell component="th" scope="row">
                <Typography variant="body2">{order.orderId}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{order.orderTitle}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{order.scholarName}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={order.status}
                  size="small"
                  color={getStatusColor(order.status) as any}
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    color: 'white',
                    '& .MuiChip-label': {
                      px: 1
                    },
                    ...( (order.status === 'Pending Admin Review' || order.status === 'Scholar Submitted – Pending Review') && {
                      bgcolor: '#eab308',
                      color: '#000'
                    })
                  }}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={isReminderSent(order.id) || loadingReminders.has(order.id) || order.status === 'Completed'}
                  onClick={() => handleSendReminder(order.id)}
                  sx={{
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    minWidth: 60
                  }}
                >
                  Send
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default Orders;