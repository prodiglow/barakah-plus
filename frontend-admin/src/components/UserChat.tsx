
import * as React from 'react';
import {
  Box, Avatar, Typography, Button, TextField, InputBase, IconButton, useMediaQuery, useTheme, CircularProgress, Alert, Link, Chip, Stack,
  Menu, Checkbox, Radio, RadioGroup, FormControlLabel, FormGroup, Divider
} from '@mui/material';
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAllOrdersWithConversations } from '../services/userConversationService';
import { OrderWithUserConversation, Message as ApiMessage } from '../types/userConversation';
import { sendMessage } from '../services/messageService';
import { updateOrder } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { sendGenericEmail } from '../services/emailService';
import { useAlertDialog } from '../contexts/AlertDialogContext';
import EventFormDialog from './EventFormDialog';
import { EventData } from '../services/eventService';

interface Message {
  sender: string;
  service: string;
  avatar: string;
  message?: string;
  timestamp: string;
  buttons?: string[];
  feedback?: boolean;
  audioUrl?: string;
  type?: "user" | "scholar" | "adminToScholar" | "adminToUser";
  apiMessage?: ApiMessage; // Store full API message for reference
}

interface User {
  id: string;
  name: string;
  messages: Message[];
  orderData?: OrderWithUserConversation; // Store full order data for reference
}

// Helper function to format date
const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 24) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} `;
  } else if (diffInHours < 48) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} `;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  }
};

// Helper function to render message with clickable links
// Helper function to render message with clickable links (Markdown [Label](URL) and raw URLs)
const renderMessageWithLinks = (message: string): React.ReactNode => {
  if (!message) return 'No message content';

  // Regex for Markdown links: [Label](URL)
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

  const parts = message.split(markdownLinkRegex);
  const result: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i += 3) {
    const textPart = parts[i];
    const linkLabel = parts[i + 1];
    const linkUrl = parts[i + 2];

    if (textPart) {
      // Regex for raw URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const subParts = textPart.split(urlRegex);

      subParts.forEach((subPart, subIndex) => {
        if (subPart.match(urlRegex)) {
          result.push(
            <Link
              key={`raw-${i}-${subIndex}`}
              href={subPart}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer', '&:hover': { color: 'primary.dark' } }}
              onClick={(e) => e.stopPropagation()}
            >
              {subPart}
            </Link>
          );
        } else {
          // Handle newlines
          const lines = subPart.split('\n');
          lines.forEach((line, lineIndex) => {
            if (line) result.push(<span key={`text-${i}-${subIndex}-${lineIndex}`}>{line}</span>);
            if (lineIndex < lines.length - 1) {
              result.push(<br key={`br-${i}-${subIndex}-${lineIndex}`} />);
            }
          });
        }
      });
    }

    if (linkLabel && linkUrl) {
      result.push(
        <Link
          key={`md-${i}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold', '&:hover': { color: 'primary.dark' } }}
          onClick={(e) => e.stopPropagation()}
        >
          {linkLabel}
        </Link>
      );
    }
  }

  return <>{result}</>;
};

// Transform API data to component format
const transformOrdersToUsers = (orders: OrderWithUserConversation[]): User[] => {
  return orders
    .filter((orderData) => {
      // Only include orders that have user or adminToUser messages
      if (!orderData || !orderData.order) return false;
      const user = orderData.order.UserID;
      if (!user) return false;
      const allMessages = orderData.messages || [];
      // return allMessages.some((apiMsg) => (apiMsg.type === 'user' || apiMsg.type === 'adminToUser') && apiMsg.sender != null);
      return allMessages.length > 0;
    })
    .map((orderData) => {
      const user = orderData.order.UserID;
      const allMessages = orderData.messages || [];

      // Transform all messages from the API
      const transformedMessages: Message[] = allMessages
        .filter((apiMsg) => apiMsg.sender != null)
        .map((apiMsg) => {
          // Determine the sender name based on the message type if needed, 
          // or rely on the populated sender object. 
          // Note: The controller manually populates 'sender' with name/profilePic/etc.
          const senderName = apiMsg.sender?.name || apiMsg.sender?.scholarName || 'Unknown';
          const senderAvatar = apiMsg.sender?.profilePic || apiMsg.sender?.ProfileImg || '';

          return {
            sender: senderName,
            service: orderData.order.OrderTitle,
            avatar: senderAvatar,
            message: apiMsg.text,
            timestamp: formatTimestamp(apiMsg.createdAt),
            audioUrl: apiMsg.audioUrl,
            type: apiMsg.type,
            apiMessage: apiMsg,
          };
        });

      return {
        id: orderData.conversation._id,
        name: user?.name || 'Unknown User',
        orderData: orderData,
        messages: transformedMessages,
      };
    });
};

interface UserChatProps {
  onUpdate?: () => void;
  refreshTrigger?: number;
  onEventRefresh?: () => void;
}

const UsersChat: React.FC<UserChatProps> = ({ onUpdate, refreshTrigger, onEventRefresh }) => {
  const { showAlert } = useAlertDialog();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { adminInfo } = useAuth();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [feedbackText, setFeedbackText] = React.useState<string>('');
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const usersListRef = React.useRef<HTMLDivElement>(null);
  const [openEventDialog, setOpenEventDialog] = React.useState(false);
  const [eventDialogInitialData, setEventDialogInitialData] = React.useState<Partial<EventData> | undefined>(undefined);

  // Filter & Sort State
  const [filterAnchorEl, setFilterAnchorEl] = React.useState<null | HTMLElement>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc' | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<string[]>([]);
  const [filterSect, setFilterSect] = React.useState<string[]>([]);
  const [filterService, setFilterService] = React.useState<string[]>([]);
  const openFilter = Boolean(filterAnchorEl);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  const baseLink = import.meta.env.VITE_ADMIN_BASE_URL || window.location.origin;



  // Fetch data from API
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllOrdersWithConversations();
      const transformedUsers = transformOrdersToUsers(response.ordersWithConversations);

      // Sort users: Priority based on status
      const sortedUsers = transformedUsers.sort((a, b) => {
        const statusA = a.orderData?.order.Status || '';
        const statusB = b.orderData?.order.Status || '';

        const getPriority = (status: string) => {
          if (status === 'Pending Admin Review') return 1;
          if (status === 'Scholar Submitted – Pending Review') return 2;
          if (status === 'Completed') return 4;
          return 3;
        };

        return getPriority(statusA) - getPriority(statusB);
      });

      setUsers(sortedUsers);
    } catch (err) {
      console.error('Error fetching user conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const location = useLocation();

  React.useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  // Handle Deep Linking via orderId param
  React.useEffect(() => {
    if (!loading && users.length > 0) {
      const searchParams = new URLSearchParams(location.search);
      const orderId = searchParams.get("orderId");

      if (orderId) {
        // Find user by orderId
        const foundUser = users.find(u => u.orderData?.order._id === orderId);
        if (foundUser) {
          setSelectedConversationId(foundUser.id);
        }
      }
    }
  }, [loading, users, location.search]);

  // Filter users based on search query, status, sect, and sort order
  const filteredUsers = React.useMemo(() => {
    let result = users;

    // 1. Filter by Status
    if (filterStatus.length > 0) {
      result = result.filter(user => {
        const status = user.orderData?.order.Status || '';
        return filterStatus.includes(status);
      });
    }

    // 2. Filter by Sect
    if (filterSect.length > 0) {
      result = result.filter(user => {
        const sect = user.orderData?.order.Sect || 'Other';
        return filterSect.includes(sect);
      });
    }

    // 3. Filter by Service
    if (filterService.length > 0) {
      result = result.filter(user => {
        const title = user.orderData?.order.OrderTitle || '';
        const amt = user.orderData?.order.OrderAmt || 0;

        // Case A: Free Personal Dua matches
        if (title === 'Personal Dua' && amt === 0) {
          return filterService.includes('Free Personal Dua');
        }

        // Case B: Paid Personal Dua matches
        if (title === 'Personal Dua' && amt > 0) {
          return filterService.includes('Personal Dua');
        }

        // Case C: Other services
        return filterService.includes(title);
      });
    }

    // 4. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(query) ||
        (user.orderData?.order.OrderID && String(user.orderData.order.OrderID).toLowerCase().includes(query)) ||
        user.messages.some(msg =>
          msg.service.toLowerCase().includes(query) ||
          msg.sender.toLowerCase().includes(query)
        )
      );
    }

    // 4. Sort
    if (sortOrder) {
      result = [...result].sort((a, b) => {
        const orderIdA = a.orderData?.order.OrderID || 0;
        const orderIdB = b.orderData?.order.OrderID || 0;
        return sortOrder === 'asc' ? orderIdA - orderIdB : orderIdB - orderIdA;
      });
    }

    return result;
  }, [users, searchQuery, filterStatus, filterSect, filterService, sortOrder]);

  const selectedUserData = selectedConversationId
    ? users.find(u => u.id === selectedConversationId) || null
    : null;



  const handleRefreshAndScroll = async () => {
    // Refresh data
    await fetchData();
    if (onUpdate) onUpdate();

    // Removed auto-scroll logic to keep the user context
  };

  // Helper for Optimistic Updates
  const updateLocalOrderStatus = (orderId: string, newStatus: string) => {
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.orderData?.order._id === orderId) {
        return {
          ...u,
          orderData: {
            ...u.orderData!,
            order: {
              ...u.orderData!.order,
              Status: newStatus as any
            }
          }
        };
      }
      return u;
    }));
  };
 
  const updateLocalEventCreatedStatus = (orderId: string) => {
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.orderData?.order._id === orderId) {
        return {
          ...u,
          orderData: {
            ...u.orderData!,
            order: {
              ...u.orderData!.order,
              isEventCreated: true
            }
          }
        };
      }
      return u;
    }));
  };

  const handleForward = async () => {
    const orderID = selectedUserData?.orderData?.order._id;
    if (orderID) {
      const orderUrl = `${baseLink}/order/${orderID}`;
      try {
        setLoading(true);

        // Optimistic Update (instant)
        updateLocalOrderStatus(orderID, 'In Progress By Scholar');

        // Parallel execution: clipboard + order update
        await Promise.all([
          navigator.clipboard.writeText(orderUrl),
          updateOrder(orderID, { Status: 'In Progress By Scholar' })
        ]);

        const userID = selectedUserData?.orderData?.order?.UserID;
        // @ts-ignore - Check if it's populated or just an ID
        const userEmail = userID?.email || (typeof userID === 'string' ? null : userID?.email);

        const orderTitle = selectedUserData?.orderData?.order?.OrderTitle;
        const orderIDDisplay = selectedUserData?.orderData?.order?.OrderID;
        const userName = userID?.name || "User";

        if (userEmail) {
          const dashboardLink = `https://www.barakaplus.com/user/dashboard/orders?orderId=${orderIDDisplay}`;
          // Send email in background without blocking UI
          sendGenericEmail(
            userEmail,
            `Request Status Update: ${orderTitle} (Request ID: ${orderIDDisplay})`,
            `Dear ${userName}, \n\nYour request for "${orderTitle}"(Request ID: ${orderIDDisplay}) has been successfully forwarded to a scholar.\n\nCurrent Status: In Progress By Scholar\n\nYou will receive further updates as the scholar reviews your request.\n\nThank you, \nBaraka Project Team`,
            `
  <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Request Status Update</h2>
      <p>Dear <strong>${userName}</strong>,</p>
      <p>Your request for <strong>${orderTitle}</strong> has been successfully forwarded to a scholar.</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Request ID:</strong> #${orderIDDisplay}</p>
          <p><strong>Service:</strong> ${orderTitle}</p>
          <p><strong>Status:</strong> <span style="color: #0A9E6F; font-weight: bold;">In Progress By Scholar</span></p>
      </div>
      <p>You will receive further updates as the scholar reviews your request.</p>
      <p style="text-align: left; margin-top: 25px;">
          <a href="${dashboardLink}" style="background-color: #0A9E6F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Request Details</a>
      </p>
      <br/>
      <p>Thank you,</p>
      <p><strong>The Baraka Team</strong></p>
      <p>
        <a href="https://www.barakaplus.com" style="color: #0A9E6F; text-decoration: underline;">www.barakaplus.com</a>
      </p>
  </div>`
          ).catch(err => console.error('Failed to send email notification:', err));
        }

        // Stop loading and show alert immediately
        setLoading(false);
        await showAlert('Success', `Link copied to clipboard and request status updated!\n\nEmail notification sent to user.\n\n${orderUrl}`, 'success');

        // Refresh data in background (non-blocking)
        handleRefreshAndScroll();
      } catch (err) {
        console.error('Error copying link or updating order:', err);
        setLoading(false);
        await showAlert('Error', `Link: \n\n${orderUrl} \n\n(Unable to copy to clipboard or update request status)`, 'error');
      }
    } else {
      await showAlert('Error', 'Order ID not found', 'error');
    }
  };





  // Auto-scroll to bottom when messages change or user is selected
  React.useEffect(() => {
    if (messagesContainerRef.current && selectedUserData) {
      const container = messagesContainerRef.current;

      const scrollToBottom = () => {
        container.scrollTop = container.scrollHeight;
      };

      // Scroll immediately
      scrollToBottom();

      // Scroll again after a delay to ensure layout is settled (e.g. images)
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedUserData, selectedUserData?.messages?.length, selectedConversationId]);

  return (
    <Box sx={{
      display: 'flex',
      height: { xs: 'auto', sm: 'auto', md: '100vh' },
      bgcolor: 'background.default',
      border: "1px solid #ddd",
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      {/* Left Sidebar for Users */}
      <Box sx={{
        width: { xs: '95%', sm: '95%', md: '30%' },
        borderRight: { md: 1 },
        borderColor: 'divider',
        p: { xs: 1, md: 2 },
        borderBottom: { xs: 1, md: 'none' },
        borderBottomColor: { xs: 'divider', md: 'transparent' },
        display: { xs: selectedConversationId === null ? 'block' : 'none', md: 'block' }
      }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleFilterClick} sx={{ bgcolor: 'grey.100', borderRadius: 1 }}>
            <FilterListIcon />
          </IconButton>
          <InputBase
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<IconButton size="small"><SearchIcon /></IconButton>}
            sx={{
              flex: 1,
              bgcolor: 'grey.100',
              p: 1,
              borderRadius: 1,
              fontSize: { xs: '0.875rem', md: '1rem' }
            }}
          />

          <Menu
            anchorEl={filterAnchorEl}
            open={openFilter}
            onClose={handleFilterClose}
            PaperProps={{ sx: { width: 300, maxHeight: 400 } }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            {/* Sort Section */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">Sort By Request Number</Typography>
              <RadioGroup
                value={sortOrder || ''}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <FormControlLabel value="desc" control={<Radio size="small" />} label="Descending" />
                <FormControlLabel value="asc" control={<Radio size="small" />} label="Ascending" />
              </RadioGroup>
              <Button size="small" onClick={() => { setSortOrder(null); setFilterStatus([]); setFilterSect([]); setFilterService([]); }} sx={{ textTransform: 'none' }}>Clear Filters</Button>
            </Box>
            <Divider />

            {/* Status Filter */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">Filter by Status</Typography>
              <FormGroup>
                {[
                  { label: 'Pending Admin Review', value: 'Pending Admin Review' },
                  { label: 'User Review Requested', value: 'User Review Requested' },
                  { label: 'In Progress By Scholar', value: 'In Progress By Scholar' },
                  { label: 'Scholar Submitted – Pending Review', value: 'Scholar Submitted – Pending Review' },
                  { label: 'Rejected to Scholar', value: 'Revision Requested By Admin' },
                  { label: 'Completed', value: 'Completed' }
                ].map((option) => {
                  const count = users.filter(u => u.orderData?.order.Status === option.value).length;
                  return (
                    <FormControlLabel
                      key={option.value}
                      control={
                        <Checkbox
                          checked={filterStatus.includes(option.value)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFilterStatus(prev =>
                              checked ? [...prev, option.value] : prev.filter(s => s !== option.value)
                            );
                          }}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">{`${option.label} (${count})`}</Typography>}
                    />
                  );
                })}
              </FormGroup>
            </Box>
            <Divider />

            {/* Sect Filter */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">Filter by Sect</Typography>
              <FormGroup>
                {['Sunni', 'Shia', 'Ahl-e-Hadith', 'Deobandi', 'Barelvi', 'Other'].map((sect) => {
                  const count = users.filter(u => (u.orderData?.order.Sect || 'Other') === sect).length;
                  return (
                    <FormControlLabel
                      key={sect}
                      control={
                        <Checkbox
                          checked={filterSect.includes(sect)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFilterSect(prev =>
                              checked ? [...prev, sect] : prev.filter(s => s !== sect)
                            );
                          }}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">{`${sect} (${count})`}</Typography>}
                    />
                  );
                })}
              </FormGroup>
            </Box>
            <Divider />

            {/* Service Filter */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">Filter by Service</Typography>
              <FormGroup>
                {['Personal Dua', 'Free Personal Dua', 'Quran Khawani', 'Wazaif and Adhkar', 'Istikhara'].map((service) => {
                  const count = users.filter(u => {
                    const title = u.orderData?.order.OrderTitle;
                    const amt = u.orderData?.order.OrderAmt || 0;
                    if (service === 'Free Personal Dua') {
                      return title === 'Personal Dua' && amt === 0;
                    }
                    if (service === 'Personal Dua') {
                      return title === 'Personal Dua' && amt > 0;
                    }
                    return title === service;
                  }).length;
                  return (
                    <FormControlLabel
                      key={service}
                      control={
                        <Checkbox
                          checked={filterService.includes(service)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFilterService(prev =>
                              checked ? [...prev, service] : prev.filter(s => s !== service)
                            );
                          }}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">{`${service} (${count})`}</Typography>}
                    />
                  );
                })}
              </FormGroup>
            </Box>
          </Menu>
        </Box>
        <Box ref={usersListRef} sx={{ maxHeight: { xs: '250px', sm: '300px', md: 'calc(100vh - 120px)' }, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          ) : filteredUsers.length === 0 ? (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              No conversations found
            </Typography>
          ) : (
            filteredUsers.map((user, index) => {
              // Get the latest message for preview (last in array or use latestMessage from orderData)
              // Filter out scholar and adminToScholar messages from preview
              const latestMsg = user.messages.length > 0
                ? user.messages[user.messages.length - 1]
                : user.orderData?.latestMessage && (user.orderData.latestMessage.type === 'user' || user.orderData.latestMessage.type === 'adminToUser') && user.orderData.latestMessage.sender != null
                  ? {
                    sender: user.orderData.latestMessage.sender.name || 'Unknown',
                    service: user.orderData.order.OrderTitle,
                    avatar: user.orderData.latestMessage.sender.profilePic || '',
                    message: user.orderData.latestMessage.text,
                    timestamp: formatTimestamp(user.orderData.latestMessage.createdAt),
                    audioUrl: user.orderData.latestMessage.audioUrl,
                    type: user.orderData.latestMessage.type,
                  }
                  : null;

              if (!latestMsg) return null;

              return (
                <Box
                  key={user.id}
                  onClick={async () => {
                    setSelectedConversationId(user.id);
                    // Mark as read immediately in UI
                    if (user.orderData?.order.isReadByAdmin === false) {
                      const orderId = user.orderData.order._id;
                      if (orderId) {
                        // Optimistic update
                        const updatedUsers = [...users];
                        if (updatedUsers[index].orderData?.order) {
                          updatedUsers[index].orderData!.order.isReadByAdmin = true;
                          setUsers(updatedUsers);
                        }

                        // API call
                        try {
                          await updateOrder(orderId, { isReadByAdmin: true });
                          if (onUpdate) onUpdate();
                        } catch (err) {
                          console.error('Failed to mark as read', err);
                        }
                      }
                    }
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    p: { xs: 0.5, md: 1 },
                    cursor: 'pointer',
                    backgroundColor: selectedConversationId === user.id ? 'grey.100' :
                      (user.orderData?.order.Status === 'Pending Admin Review')
                        ? '#f5f9ff' // Light blue tint for high priority
                        : 'transparent',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'grey.100' },
                    borderBottom: index === filteredUsers.length - 1 ? 0 : 1,
                    borderColor: 'divider',
                    borderLeft: (user.orderData?.order.Status === 'Pending Admin Review' || user.orderData?.order.Status === 'Scholar Submitted – Pending Review')
                      ? '4px solid #1976d2' // Blue accent
                      : 'transparent',
                  }}
                >
                  <Avatar
                    src={user.orderData?.order.UserID?.profilePic || ''}
                    alt={user.name}
                    sx={{
                      width: { xs: 32, md: 40 },
                      height: { xs: 32, md: 40 },
                      boxSizing: 'content-box'
                    }}
                  />
                  <Box sx={{ ml: 1, flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.8rem', md: '1rem' },
                        fontWeight: 'medium'
                      }}
                      noWrap
                    >
                      #{user.orderData?.order.OrderID} {user.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                      noWrap
                    >
                      {latestMsg.service}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 1, flexShrink: 0 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.7rem', md: '0.75rem' },
                        mb: 0.5
                      }}
                    >
                      {latestMsg.timestamp}
                    </Typography>
                    {user.orderData?.order.Status && (
                      <Chip
                        label={user.orderData.order.Status}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.7rem',
                          ...(user.orderData.order.Status === 'Completed' ? {
                            bgcolor: 'success.main',
                            color: 'white'
                          } : ((user.orderData.order.Status && user.orderData.order.Status.toLowerCase().includes('rejected')) || user.orderData.order.Status === 'User Review Requested') ? {
                            bgcolor: 'primary.main',
                            color: 'white'
                          } : (user.orderData.order.Status === 'Pending Admin Review' || user.orderData.order.Status === 'Scholar Submitted – Pending Review') ? {
                            bgcolor: '#eab308',
                            color: '#000'
                          } : {
                            bgcolor: 'warning.main',
                            color: 'white'
                          })
                        }}
                      />
                    )}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* Right Chat Area */}
      <Box sx={{
        width: { xs: '95%', sm: '95%', md: '70%' },
        display: { xs: selectedConversationId !== null ? 'flex' : 'none', md: 'flex' },
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}>
        {isMobile && selectedConversationId !== null && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            gap: 1,
            p: 1,
            borderRadius: 1,
            background: "linear-gradient(180deg, #0A9E6F 0%, #098B62 49.04%, #087955 100%)"
          }}>
            <IconButton
              onClick={() => setSelectedConversationId(null)}
              sx={{ p: 0.5, color: 'white' }}
            >
              <ArrowBackIcon />
            </IconButton>
            {selectedUserData && (
              <Avatar
                src={selectedUserData.orderData?.order.UserID?.profilePic || selectedUserData.messages.find(m => m.type === 'user')?.avatar || ''}
                alt={selectedUserData.name}
                sx={{
                  width: 32,
                  height: 32
                }}
              />
            )}
          </Box>
        )}

        {selectedUserData ? (
          <>
            <Box sx={{
              mb: 1,
              px: { xs: 0.5, sm: 0.75, md: 1 },
              pt: { xs: 1, md: 2 },
              flexShrink: 0  // Prevent shrinking
            }}>
              <Typography
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1.2rem' },
                  color: 'text.secondary',
                  mb: 1,
                  ml: { xs: 0, sm: 2, md: 6 },
                  pr: { xs: 1, sm: 0 },
                }}
              >
                Review the User request. Reply and determine if it's safe to send to the scholar
              </Typography>

              {selectedUserData.orderData?.order && (
                <Box sx={{ mt: 1, p: 2, bgcolor: '#FAFAFB', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>Request Details</Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 0.5 }} alignItems="center" flexWrap="nowrap" overflow="auto">
                    <Box flex={1} minWidth="80px">
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>Request ID</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>#{selectedUserData.orderData.order.OrderID || 'N/A'}</Typography>
                    </Box>
                    <Box flex={1} minWidth="100px">
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>Mother Name</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{selectedUserData.orderData.order.motherName || 'N/A'}</Typography>
                    </Box>
                    <Box flex={1} minWidth="80px">
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>Gender</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }} noWrap>{selectedUserData.orderData.order.gender || 'N/A'}</Typography>
                    </Box>
                    <Box flex={1} minWidth="100px">
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>Sect</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{selectedUserData.orderData.order.Sect || 'N/A'}</Typography>
                    </Box>
                    <Box flex={1} minWidth="80px">
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>Lang</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{selectedUserData.orderData.order.PrefferedLanguage || 'N/A'}</Typography>
                    </Box>
                    <Box flex={1} minWidth="150px">
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>Reason</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap title={selectedUserData.orderData.order.Reason}>{selectedUserData.orderData.order.Reason || 'N/A'}</Typography>
                    </Box>
                    {selectedUserData.orderData.order.OrderTitle === "Quran Khawani" && (
                      <>
                        <Box flex={1} minWidth="120px">
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>QK Date</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{(selectedUserData.orderData.order as any).quranKhawaniDate || 'N/A'}</Typography>
                        </Box>
                        <Box flex={1} minWidth="100px">
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>QK Time</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{(selectedUserData.orderData.order as any).quranKhawaniTimeSlot || 'N/A'}</Typography>
                        </Box>
                      </>
                    )}
                    {selectedUserData.orderData.order.OrderTitle === "Wazaif and Adhkar" && (
                      <Box flex={1} minWidth="120px">
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>Selected Wazifa</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{(selectedUserData.orderData.order as any).selectWazifa || 'N/A'}</Typography>
                      </Box>
                    )}
                  </Stack>
                  <Box mt={2}>

                  </Box>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: { xs: 1, md: 2 } }}>
              <Avatar
                src={selectedUserData.orderData?.order.UserID?.profilePic || selectedUserData.messages.find(m => m.type === 'user')?.avatar || ''}
                alt={selectedUserData.name}
                sx={{
                  mr: 2,
                  width: { xs: 32, md: 40 },
                  height: { xs: 32, md: 40 }
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                {selectedUserData.name}
              </Typography>
            </Box>

            {/* Messages List - Chat Interface */}
            <Box
              ref={messagesContainerRef}
              sx={{
                mb: { xs: 1.5, sm: 2 },
                flex: 1, // Take available space
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1, sm: 1.25, md: 1.5 },
                px: { xs: 1, md: 2 },
                // Hide scrollbar but keep functionality
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}>
              {/* Encrypted Message Notice */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: { xs: 1, sm: 1.5 },
              }}>
                <Typography
                  sx={{
                    padding: { xs: 2, sm: 2.5, md: 3 },
                    borderRadius: { xs: 2, md: 3 },
                    background: "#F5F5F5",
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                    color: 'text.secondary',
                    textAlign: 'center',
                    width: { xs: '100%', sm: '95%', md: '86%' },
                  }}
                >
                  <strong>  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 50 50" fill="currentColor">
                    <path d="M 25 3 C 18.363281 3 13 8.363281 13 15 L 13 20 L 9 20 C 7.300781 20 6 21.300781 6 23 L 6 47 C 6 48.699219 7.300781 50 9 50 L 41 50 C 42.699219 50 44 48.699219 44 47 L 44 23 C 44 21.300781 42.699219 20 41 20 L 37 20 L 37 15 C 37 8.363281 31.636719 3 25 3 Z M 25 5 C 30.566406 5 35 9.433594 35 15 L 35 20 L 15 20 L 15 15 C 15 9.433594 19.433594 5 25 5 Z M 25 30 C 26.699219 30 28 31.300781 28 33 C 28 33.898438 27.601563 34.6875 27 35.1875 L 27 38 C 27 39.101563 26.101563 40 25 40 C 23.898438 40 23 39.101563 23 38 L 23 35.1875 C 22.398438 34.6875 22 33.898438 22 33 C 22 31.300781 23.300781 30 25 30 Z"></path>
                  </svg>  Messages are encrypted.</strong> <br /> Personal contact details (phone, email, etc.) <br />are blocked for your safety.
                </Typography>
              </Box>

              {selectedUserData.messages.length === 0 ? (
                <Typography sx={{
                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                  color: 'text.secondary',
                  textAlign: 'center',
                  p: 2
                }}>
                  No messages yet
                </Typography>
              ) : (
                selectedUserData.messages.map((msg, index) => {
                  const isLeftAligned = msg.type === 'user' || msg.type === 'scholar';
                  const isRightAligned = msg.type === 'adminToUser' || msg.type === 'adminToScholar';

                  // Label text
                  let labelText = "";
                  if (msg.type === 'user') labelText = "User";
                  else if (msg.type === 'scholar') labelText = "Scholar";
                  else if (msg.type === 'adminToUser') labelText = "Admin to User";
                  else if (msg.type === 'adminToScholar') labelText = "Admin to Scholar";

                  // Check for rejection content
                  const isRejection = !isLeftAligned && msg.message && (
                    msg.message.toLowerCase().includes("rejected") ||
                    msg.message.toLowerCase().includes("does not comply")
                  );

                  return (
                    <Box
                      key={msg.apiMessage?._id || index}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: isLeftAligned ? 'flex-start' : 'flex-end',
                        gap: 1,
                        width: '100%',
                      }}
                    >
                      {/* Avatar for received messages (user/scholar) */}
                      {isLeftAligned && (
                        <Avatar
                          src={msg.avatar}
                          alt={msg.sender}
                          sx={{
                            width: { xs: 32, sm: 34, md: 36 },
                            height: { xs: 32, sm: 34, md: 36 },
                            flexShrink: 0,
                            order: 0
                          }}
                        />
                      )}

                      {/* Message bubble container */}
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: { xs: '95%', sm: '95%', md: '50%' },
                        minWidth: 0,
                        order: isLeftAligned ? 1 : 0,
                        alignItems: isLeftAligned ? 'flex-start' : 'flex-end',
                      }}>
                        {/* Label */}
                        <Typography variant="caption" sx={{ ml: 1, mb: 0.5, color: 'text.secondary', fontSize: '0.7rem' }}>
                          {labelText} - {msg.sender}
                        </Typography>

                        {/* Message content bubble - only show if text exists */}
                        {msg.message && msg.message.trim() !== '' && (
                          <Box sx={{
                            bgcolor: isRejection ? '#e3f2fd' : (isLeftAligned ? 'grey.100' : 'primary.light'), // Light Blue for rejection to match user dashboard
                            color: isRejection ? 'text.primary' : (isLeftAligned ? 'text.primary' : 'primary.contrastText'),
                            p: { xs: 1, sm: 1.25, md: 1.5 },
                            borderRadius: { xs: 1.5, md: 2 },
                            ...(isLeftAligned ? {
                              borderTopLeftRadius: { xs: 0.25, md: 0.5 },
                              borderTopRightRadius: { xs: 1.5, md: 2 }
                            } : {
                              borderTopLeftRadius: { xs: 1.5, md: 2 },
                              borderTopRightRadius: { xs: 0.25, md: 0.5 }
                            }),
                            wordBreak: 'break-word',
                            mb: msg.audioUrl && msg.audioUrl.trim() !== '' ? { xs: 0.75, md: 1 } : 0,
                            width: 'fit-content',
                            border: isRejection ? '1px solid' : 'none',
                            borderColor: isRejection ? '#90caf9' : 'transparent', // Slightly darker border for definition if needed, or transparent
                          }}>
                            <Typography sx={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9375rem' },
                              lineHeight: 1.5,
                              color: isRejection ? 'text.primary' : (isLeftAligned ? 'text.primary' : '#fff'),
                              '& a': { color: isRejection ? '#1976d2 !important' : 'inherit' } // Override link color to blue
                            }}>
                              {renderMessageWithLinks(msg.message)}
                            </Typography>
                          </Box>
                        )}

                        {/* Audio player - separate, no box */}
                        {msg.audioUrl && msg.audioUrl.trim() !== '' && (
                          <Box sx={{
                            width: "100%",
                            minWidth: { xs: '200px', sm: '200px', md: '300px' },
                            maxWidth: { xs: '200px', sm: '200px', md: "100%" },
                            alignSelf: isLeftAligned ? 'flex-start' : 'flex-end',
                          }}>
                            <audio
                              controls
                              style={{
                                width: '100%',
                                height: '32px',
                                minWidth: '200px'
                              }}
                            >
                              <source src={msg.audioUrl} type="audio/mp4" />
                              <source src={msg.audioUrl} type="audio/mpeg" />
                              <source src={msg.audioUrl} type="audio/webm" />
                              <source src={msg.audioUrl} type="audio/ogg" />
                              <source src={msg.audioUrl} type="audio/wav" />
                              Your browser does not support the audio element.
                            </audio>
                          </Box>
                        )}

                        {/* Timestamp */}
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.65rem',
                            color: 'text.secondary',
                            mt: 0.5,
                            ml: 0.5,
                            mr: 0.5,
                            alignSelf: isLeftAligned ? 'flex-start' : 'flex-end',
                          }}
                        >
                          {msg.timestamp}
                        </Typography>
                      </Box>

                      {/* Avatar for sent messages (admin) */}
                      {isRightAligned && (
                        <Avatar
                          sx={{
                            width: { xs: 32, sm: 34, md: 36 },
                            height: { xs: 32, sm: 34, md: 36 },
                            flexShrink: 0,
                            bgcolor: 'primary.dark',
                            order: 2
                          }}
                        >
                          A
                        </Avatar>
                      )}
                    </Box>
                  );
                })
              )}
            </Box>

            <Box
              ref={bottomRef}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                mb: { xs: 1.5, sm: 2 },
                p: { xs: 1, md: 2 },
                bgcolor: 'background.paper', // Ensure it has a background
                borderTop: '1px solid',
                borderColor: 'divider',
              }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 1.5, sm: 2 }, px: { xs: 0.5, sm: 0.75, md: 0 } }}>
                <TextField
                  variant="outlined"
                  placeholder="Feedback"
                  multiline
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  sx={{
                    width: { xs: '100%', sm: '95%', md: '90%' }
                  }}
                />
              </Box>

              <Box sx={{
                display: 'flex',
                gap: { xs: 0.75, sm: 1 },
                width: 'auto', // Changed from 30% to auto to fit buttons
                justifyContent: 'flex-start',
                flexDirection: { xs: 'column', sm: 'row' },
                ml: { xs: 0, sm: '5%', md: '5%' },
                px: { xs: 0.5, sm: 0, md: 0 },
                flexWrap: 'wrap' // Allow wrapping if needed
              }}>

                {/* Action Buttons */}
                {/* 1. Action Button (Create NEW Event OR Send To Scholar) */}
                {selectedUserData?.orderData?.order?.OrderTitle === "Quran Khawani" ? (
                  <Button
                    variant="contained"
                    onClick={async () => {
                      const orderId = selectedUserData.orderData?.order?._id;
                      if (!orderId) return;

                      let currentOrder = selectedUserData.orderData?.order;

                      try {
                        const { getOrderById } = await import('../services/orderService');
                        const freshOrder = await getOrderById(orderId);
                        if (freshOrder) {
                          currentOrder = freshOrder;
                        }
                      } catch (err) {
                        console.error("Failed to fetch fresh order details, using existing data:", err);
                      }

                      console.log("Debug: Fresh Order Object:", currentOrder);
                      const descriptionValue = currentOrder?.message || (currentOrder as any)?.Message || (currentOrder as any)?.description || "";

                      // Build eventDate from quranKhawaniDate + quranKhawaniTimeSlot
                      const qkDate = (currentOrder as any)?.quranKhawaniDate || "";
                      const qkSlot = (currentOrder as any)?.quranKhawaniTimeSlot || "";
                      let eventDateValue = "";
                      if (qkDate) {
                        // Map time slot to a default hour (datetime-local format: YYYY-MM-DDTHH:mm)
                        const slotHour = qkSlot === "Morning" ? "09:00" : qkSlot === "Afternoon" ? "14:00" : qkSlot === "Evening" ? "19:00" : "09:00";
                        eventDateValue = `${qkDate}T${slotHour}`;
                      } else {
                        // Fallback: If qkDate is missing, use current date/time to avoid validation error
                        const now = new Date();
                        eventDateValue = now.toISOString().slice(0, 16);
                      }

                      // Get featureOnHomePage from order
                      const featuredValue = !!(currentOrder as any)?.featureOnHomePage;
                      // Get Reason/Special Occasion for eventTitle and eventSpecial
                      const specialOccasion = currentOrder?.Reason || (currentOrder as any)?.reason || "";
 
                      setEventDialogInitialData({
                        eventTitle: specialOccasion,
                        eventSpecial: specialOccasion,
                        description: descriptionValue,
                        eventDate: eventDateValue,
                        isFeatured: featuredValue,
                        quranKhawaniDate: qkDate,
                        quranKhawaniTimeSlot: qkSlot,
                        orderId: orderId,
                      });
                      setOpenEventDialog(true);
                    }}
                    sx={{
                      bgcolor: '#04AA6D',
                      '&:hover': { bgcolor: '#017F52' },
                      px: 3,
                      textTransform: 'none',
                      borderRadius: 2,
                      color: 'white'
                    }}
                    disabled={!!(selectedUserData?.orderData?.order as any)?.isEventCreated}
                  >
                    {(selectedUserData?.orderData?.order as any)?.isEventCreated ? 'Event Created' : 'Create New Event'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleForward();
                    }}
                    sx={{
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' },
                      px: 3,
                      textTransform: 'none',
                      borderRadius: 2
                    }}
                    disabled={loading || selectedUserData?.orderData?.order?.Status === 'Completed' || selectedUserData?.orderData?.order?.Status === 'In Progress By Scholar' || selectedUserData?.orderData?.order?.Status === 'Scholar Submitted – Pending Review' || selectedUserData?.orderData?.order?.Status === 'User Review Requested'}
                  >
                    {loading ? 'Sending...' : 'Send To Scholar'}
                  </Button>
                )}

                {/* 2. Reject (User) */}
                <Button
                  variant="outlined"
                  color="error"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    ml: 2,
                    borderColor: 'error.main',
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.light', borderColor: 'error.dark' }
                  }}
                  disabled={loading || (selectedUserData?.orderData?.order as any)?.isEventCreated || selectedUserData?.orderData?.order?.Status === 'Completed' || selectedUserData?.orderData?.order?.Status === 'In Progress By Scholar' || selectedUserData?.orderData?.order?.Status === 'Scholar Submitted – Pending Review' || selectedUserData?.orderData?.order?.Status === 'Revision Requested By Admin' || selectedUserData?.orderData?.order?.Status === 'User Review Requested'}


                  onClick={async () => {
                    if (!selectedUserData?.orderData?.conversation?._id) return;
                    const orderID = selectedUserData?.orderData?.order?.OrderID;
                    if (!orderID) return;
                    const rejectionMessage = `Dear Customer, Your request ID #${orderID} does not comply with our community privacy guidelines. Please review the guidelines shared below and amend your request accordingly. Main features of the guidelines are:

* Cannot make Harram / Unislamic request.
* Cannot request to harm anyone.
* Cannot share personal contact details.
* Cannot make any disrespectful comment.
Link to the guideline`;
                    const rejectionMessageemail = `Dear Customer, Your request ID #${orderID} does not comply with our community privacy guidelines. Please review the guidelines shared below and amend your request accordingly. Main features of the guidelines are:

* Cannot make Harram / Unislamic request.
* Cannot request to harm anyone.
* Cannot share personal contact details.
* Cannot make any disrespectful comment.
Link to the guideline`;

                    setFeedbackText(rejectionMessage);
                    setLoading(true);

                    // Optimistic Update
                    if (selectedUserData?.orderData?.order?._id) {
                      updateLocalOrderStatus(selectedUserData.orderData.order._id, 'User Review Requested');
                    }

                    try {
                      const orderId = selectedUserData.orderData?.order?._id;

                      // Parallel execution: send message + update order
                      await Promise.all([
                        sendMessage({
                          conversationId: selectedUserData.orderData!.conversation._id,
                          sender: adminInfo!._id,
                          text: rejectionMessage,
                          type: 'adminToUser'
                        }),
                        orderId ? updateOrder(orderId, { Status: 'User Review Requested', isReadByUser: false }) : Promise.resolve()
                      ]);

                      // Fire-and-forget email notification (non-blocking)
                      if (orderId) {
                        const user = selectedUserData.orderData?.order?.UserID;
                        const userEmail = typeof user === 'object' ? user?.email : null;
                        const userName = (typeof user === 'object' ? user?.name : "User") || "User";
                        const orderTitle = selectedUserData.orderData?.order?.OrderTitle;

                        if (userEmail) {
                          const dashboardLink = `https://www.barakaplus.com/user/dashboard/orders?orderId=${orderId}`;
                          sendGenericEmail(
                            userEmail,
                            `User Review Requested: ${orderTitle} (Order ID: #${orderID})`,
                            `${rejectionMessageemail}\n\nYou can view your order details here: ${dashboardLink}`,
                            `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                                <h2 style="color: #3227d3ff;">User Review Requested</h2>
                                <p>Dear <strong>${userName}</strong>,</p>
                                <p>${rejectionMessage.replace(/\n/g, '<br>')}</p>
                                <div style="background-color: #fff5f5; padding: 15px; border-radius: 5px; border: 1px solid #ffcdd2; margin: 20px 0;">
                                <p><strong>Order ID:</strong> #${orderID}</p>
                                <p><strong>Service:</strong> ${orderTitle}</p>
                                </div>
                                <p>Please review the guidelines and update your request using the link below:</p>
                                <p style="text-align: left; margin-top: 25px;">
                                <a href="${dashboardLink}" style="background-color: #3227d3ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order Details</a>
                                </p>
                                <br/>
                                <p>Thank you,</p>
                                <p><strong>The Baraka Team</strong></p>
                                <p><a href="https://www.barakaplus.com" style="color: #0A9E6F; text-decoration: underline;">www.barakaplus.com</a></p>
                            </div>`
                          ).catch(err => console.error('Failed to send email notification:', err));
                        }
                      }

                      setFeedbackText('');

                      // Stop loading and show alert immediately
                      setLoading(false);
                      await showAlert('Success', `Order rejected. Rejection message sent to user:\n\n${rejectionMessage}`, 'success');

                      // Refresh data in background (non-blocking)
                      handleRefreshAndScroll();
                    } catch (err) {
                      console.error('Error sending message or updating order:', err);
                      setLoading(false);
                      await showAlert('Error', 'Failed to complete rejection process. Please check logs.', 'error');
                    }
                  }}
                >
                  {loading ? 'Rejecting...' : 'Reject To User'}
                </Button>

                {/* 3. Send to User (Forward Scholar Msg) */}
                {selectedUserData?.orderData?.order?.OrderTitle !== "Quran Khawani" && (
                  <Button
                    variant="contained"
                    color="success"
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      ml: 2,
                    }}
                    disabled={
                      !(selectedUserData?.orderData?.order?.Status === 'Scholar Submitted – Pending Review')
                    }
                    onClick={async () => {
                      if (!selectedUserData?.orderData?.conversation?._id) return;

                      // Find latest scholar message
                      // Look in messages (reversed usually? No, order is usually chronological)
                      // Helper to find last scholar message
                      const scholarMsgs = selectedUserData?.messages.filter(m => m.type === 'scholar');
                      const lastScholarMsg = scholarMsgs && scholarMsgs.length > 0 ? scholarMsgs[scholarMsgs.length - 1] : null;

                      // Check if scholar message exists and has either text message OR audio URL
                      const hasMessage = lastScholarMsg?.message && lastScholarMsg.message.trim() !== '';
                      const hasAudio = lastScholarMsg?.audioUrl && lastScholarMsg.audioUrl.trim() !== '';

                      if (!lastScholarMsg || (!hasMessage && !hasAudio)) {
                        await showAlert('Error', "No scholar message found to forward.", 'error');
                        return;
                      }

                      try {
                        setLoading(true);
                        const orderId = selectedUserData.orderData?.order?._id;

                        // Optimistic Update
                        if (orderId) {
                          updateLocalOrderStatus(orderId, 'Completed');
                        }

                        // Parallel execution: send message + update order
                        await Promise.all([
                          sendMessage({
                            conversationId: selectedUserData.orderData!.conversation._id,
                            sender: adminInfo!._id,
                            text: lastScholarMsg.message,
                            audioUrl: lastScholarMsg.audioUrl,
                            type: 'adminToUser'
                          }),
                          orderId ? updateOrder(orderId, { Status: 'Completed', isReadByUser: false }) : Promise.resolve()
                        ]);

                        // Fire-and-forget email notification (non-blocking)
                        if (orderId) {
                          const user = selectedUserData.orderData?.order?.UserID;
                          const userEmail = typeof user === 'object' ? user?.email : null;
                          const userName = (typeof user === 'object' ? user?.name : "User") || "User";
                          const orderTitle = selectedUserData.orderData?.order?.OrderTitle;
                          const orderID = selectedUserData.orderData?.order?.OrderID;

                          if (userEmail) {
                            const dashboardLink = `https://www.barakaplus.com/user/dashboard/orders?orderId=${orderId}`;
                            sendGenericEmail(
                              userEmail,
                              `Request Completed: ${orderTitle} (Order ID: #${orderID})`,
                              `Dear ${userName},\n\nYour order for "${orderTitle}" has been completed. You can view the scholar's response in your dashboard here: ${dashboardLink}\n\nThank you,\nBaraka Project Team`,
                              `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                                  <h2>Request Completed</h2>
                                  <p>Dear <strong>${userName}</strong>,</p>
                                  <p>Your request for <strong>${orderTitle}</strong> has been completed by the scholar.</p>
                                  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                      <p><strong>Order ID:</strong> #${orderID}</p>
                                      <p><strong>Service:</strong> ${orderTitle}</p>
                                      <p><strong>Status:</strong> <span style="color: #0A9E6F; font-weight: bold;">Completed</span></p>
                                  </div>
                                  <p>Please click the button below to view the response in your dashboard:</p>
                                  <p style="text-align: left; margin-top: 25px;">
                                      <a href="${dashboardLink}" style="background-color: #0A9E6F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order Details</a>
                                  </p>
                                  <br/>
                                  <p>Thank you,</p>
                                  <p><strong>The Baraka Team</strong></p>
                                  <p><a href="https://www.barakaplus.com" style="color: #0A9E6F; text-decoration: underline;">www.barakaplus.com</a></p>
                              </div>`
                            ).catch(err => console.error('Failed to send email notification:', err));
                          }
                        }

                        // Stop loading and show alert immediately
                        setLoading(false);
                        await showAlert('Success', 'Scholar message forwarded to user and order completed! Email sent to user.', 'success');

                        // Refresh data in background (non-blocking)
                        handleRefreshAndScroll();
                      } catch (err) {
                        console.error('Error forwarding to user:', err);
                        setLoading(false);
                      }
                    }}
                  >
                    {loading ? 'Sending...' : 'Send To User'}
                  </Button>
                )}

                {/* 4. Reject to Scholar */}
                {selectedUserData?.orderData?.order?.OrderTitle !== "Quran Khawani" && (
                  <Button
                    variant="outlined"
                    color="warning" // Orange for revision?
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      ml: 2,
                    }}
                    disabled={
                      !(selectedUserData?.orderData?.order?.Status === 'Scholar Submitted – Pending Review')
                    }
                    onClick={async () => {
                      if (!selectedUserData?.orderData?.conversation?._id) return;
                      const orderID = selectedUserData?.orderData?.order?.OrderID;

                      // Construct Link
                      const link = `${baseLink}/order/${selectedUserData?.orderData?.order?._id}`;

                      // Copy to clipboard
                      try {
                        await navigator.clipboard.writeText(link);
                        toast.success('Link copied to clipboard');
                      } catch (err) {
                        console.error('Failed to copy link:', err);
                        // Optional: toast.error('Failed to copy link');
                      }

                      const templateMessage = `Dear Scholar,

Your response for Order ID #${orderID} has been rejected as it does not meet our quality standards or guidelines. Please review your response and ensure it addresses the user's query comprehensively and accurately.

Common reasons for rejection:
* Incomplete answer or missing details.
* Lack of references from Quran and Sunnah (where applicable).
* Sharing contact details.
* Missing detailed hidayah & guidance on Quran & Sunnah.

Please revise your response and resubmit using the link below:
[View Order Details](${link})`;

                      let rejectMsg = templateMessage;
                      if (feedbackText.trim()) {
                        const capitalizedFeedback = feedbackText.trim().charAt(0).toUpperCase() + feedbackText.trim().slice(1);
                        rejectMsg = `${capitalizedFeedback}\n${templateMessage}`;
                      }

                      try {
                        setLoading(true);
                        const orderId = selectedUserData.orderData?.order?._id;

                        // Optimistic Update
                        if (orderId) {
                          updateLocalOrderStatus(orderId, 'Revision Requested By Admin');
                        }

                        // Parallel execution: send message + update order
                        await Promise.all([
                          sendMessage({
                            conversationId: selectedUserData.orderData!.conversation._id,
                            sender: adminInfo!._id,
                            text: rejectMsg,
                            type: 'adminToScholar'
                          }),
                          orderId ? updateOrder(orderId, { Status: 'Revision Requested By Admin' }) : Promise.resolve()
                        ]);

                        setFeedbackText('');

                        // Stop loading and show alert immediately
                        setLoading(false);
                        await showAlert('Success', 'Rejection sent to scholar.', 'success');
                        alert(`Rejection sent to scholar.\n\n${rejectMsg}`);

                        // Refresh data in background (non-blocking)
                        handleRefreshAndScroll();
                      } catch (err) {
                        console.error('Error rejecting to scholar:', err);
                        setLoading(false);
                      }
                    }}
                  >
                    {loading ? 'Rejecting...' : 'Reject To Scholar'}
                  </Button>
                )}
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <Typography color="text.secondary">
              {loading ? 'Loading...' : 'Select a conversation to view messages'}
            </Typography>
          </Box>
        )}
      </Box>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ zIndex: 9999 }}
      />

      {/* Full-screen centered loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            gap: 2
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: 'white'
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 500
            }}
          >
            Processing...
          </Typography>
        </Box>
      )}

      <EventFormDialog
        open={openEventDialog}
        onClose={() => setOpenEventDialog(false)}
        initialData={eventDialogInitialData}
        onSuccess={() => {
          setOpenEventDialog(false);
          // 🆕 Optimistic update for order isEventCreated status
          const orderId = eventDialogInitialData?.orderId;
          if (orderId && typeof orderId === 'string') {
            updateLocalEventCreatedStatus(orderId);
          }
          // 🆕 Refresh events tab in background
          if (onEventRefresh) onEventRefresh();
        }}
      />
    </Box >
  );
};

export default UsersChat;