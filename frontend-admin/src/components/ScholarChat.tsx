import * as React from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Avatar, Typography, Chip, InputBase, IconButton, useMediaQuery, useTheme, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Divider, TableSortLabel, Button, Checkbox, FormGroup, FormControlLabel, Menu } from '@mui/material';
import { useAlertDialog } from '../contexts/AlertDialogContext';
import { Search as SearchIcon, WhatsApp as WhatsAppIcon, Chat as ChatIcon, Payments as PaymentsIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAllOrdersWithConversations } from '../services/userConversationService';
import { OrderWithUserConversation } from '../types/userConversation';

import { updateOrder } from '../services/orderService';
import { fetchScholars } from '../services/scholarService';
import { Scholar as FullScholar } from '../types/Scholars';

interface ScholarWithOrders {
  scholar: FullScholar;
  orders: OrderWithUserConversation[];
  counts: {
    newOrder: number;
    pending: number;
    inProgress: number;
    completed: number;
    scholarSubmitted: number;
  };
}

// Helper function to format date
const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 24) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } else if (diffInHours < 48) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  }
};

const renderContentWithLinks = (text: string) => {
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts = text.split(markdownLinkRegex);
  const result: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i += 3) {
    const textPart = parts[i];
    const linkText = parts[i + 1];
    const linkUrl = parts[i + 2];

    if (textPart) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const subParts = textPart.split(urlRegex);
      subParts.forEach((subPart, subIndex) => {
        if (subPart.match(urlRegex)) {
          result.push(
            <a key={`raw-link-${i}-${subIndex}`} href={subPart} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit' }} onClick={(e) => e.stopPropagation()}>
              {subPart}
            </a>
          );
        } else {
          result.push(subPart);
        }
      });
    }

    if (linkText && linkUrl) {
      result.push(
        <a key={`md-link-${i}`} href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit', fontWeight: 'bold' }} onClick={(e) => e.stopPropagation()}>
          {linkText}
        </a>
      );
    }
  }

  return result;
};

const ScholarChat: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [data, setData] = React.useState<ScholarWithOrders[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [selectedScholarIndex, setSelectedScholarIndex] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Chat view state
  const [viewChatOrderIndex, setViewChatOrderIndex] = React.useState<number | null>(null);

  // Filters for Assigned Requests - Moved to top to avoid Hook errors
  const [filterAnchorEl, setFilterAnchorEl] = React.useState<null | HTMLElement>(null);
  const [filterStatus, setFilterStatus] = React.useState<string[]>([]);
  const openFilter = Boolean(filterAnchorEl);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(item =>
      item.scholar.scholarName.toLowerCase().includes(query) ||
      item.scholar.phone_number?.includes(query)
    );
  }, [data, searchQuery]);

  const selectedScholarData = selectedScholarIndex !== null ? filteredData[selectedScholarIndex] : null;

  const filteredOrders = React.useMemo(() => {
    if (!selectedScholarData) return [];
    let result = selectedScholarData.orders;

    if (filterStatus.length > 0) {
      result = result.filter(o => filterStatus.includes(o.order.Status || ''));
    }

    return result;
  }, [selectedScholarData, filterStatus]);

  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);


  // Sorting State
  const [sortConfig, setSortConfig] = React.useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Dialog Context
  const { showAlert, showConfirm } = useAlertDialog();

  const handlePaymentClick = async (orderItem: OrderWithUserConversation, amount: number) => {
    if (amount === 0) {
      await showAlert('Free Service', 'This is a free service, no Hadiya for this order.', 'info');
    } else {
      const confirmed = await showConfirm('Confirm Payment', `Are you sure you want to pay PKR ${amount} to the scholar for order #${orderItem.order.OrderID}?`);

      if (confirmed) {
        try {
          await updateOrder(orderItem.order._id, { ScholarHadiyapaid: true });

          // Update local state
          setData(prevData => {
            return prevData.map((s, sIdx) => {
              if (sIdx !== selectedScholarIndex) return s;
              return {
                ...s,
                orders: s.orders.map((order) => {
                  if (order.order._id !== orderItem.order._id) return order;
                  return {
                    ...order,
                    order: {
                      ...order.order,
                      ScholarHadiyapaid: true
                    }
                  };
                })
              };
            });
          });

          await showAlert('Payment Successful', `Amount: PKR ${amount} paid successfully to the scholar.`, 'success');
        } catch (err) {
          console.error(err);
          await showAlert('Error', 'Failed to update payment status.', 'error');
        }
      }
    }
  };



  const fetchData = async () => {
    try {
      setLoading(true);

      const [scholarsResponse, ordersResponse] = await Promise.all([
        fetchScholars(),
        getAllOrdersWithConversations()
      ]);

      const scholars = scholarsResponse;
      const orders = ordersResponse.ordersWithConversations;

      const groupedData: ScholarWithOrders[] = scholars.map(scholar => {
        const scholarOrders = orders.filter(o => {
          if (!o || !o.order || !o.order.ScholarID) return false;
          const scholarIdFromOrder = typeof o.order.ScholarID === 'object' ? o.order.ScholarID._id : o.order.ScholarID;
          return scholarIdFromOrder === scholar._id;
        });

        return {
          scholar,
          orders: scholarOrders,
          counts: {
            newOrder: scholarOrders.filter(o => o.order.Status === 'Sent To Scholar').length,
            pending: scholarOrders.filter(o => o.order.Status === 'Pending Admin Review' || o.order.Status === 'User Review Requested').length,
            inProgress: scholarOrders.filter(o => o.order.Status === 'In Progress By Scholar' || o.order.Status === 'Revision Requested By Admin' || o.order.Status === 'Scholar Submitted – Pending Review').length,
            completed: scholarOrders.filter(o => o.order.Status === 'Completed').length,
            scholarSubmitted: scholarOrders.filter(o => o.order.Status === 'Scholar Submitted – Pending Review').length
          }
        };
      });

      // Sort: Priority to scholars with ACTION ITEMS (New Orders OR Scholar Submitted)
      groupedData.sort((a, b) => {
        const aActionItems = a.counts.newOrder + a.counts.scholarSubmitted;
        const bActionItems = b.counts.newOrder + b.counts.scholarSubmitted;

        if (bActionItems !== aActionItems) {
          return bActionItems - aActionItems;
        }
        if (b.counts.pending !== a.counts.pending) {
          return b.counts.pending - a.counts.pending;
        }
        return b.counts.inProgress - a.counts.inProgress;
      });


      setData(groupedData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [refreshTrigger]);



  const sortedOrders = React.useMemo(() => {
    if (!filteredOrders) return [];
    const orders = [...filteredOrders];

    orders.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortConfig.key) {
        case 'id':
          aValue = a.order.OrderID || 0;
          bValue = b.order.OrderID || 0;
          break;
        case 'service':
          aValue = (a.order.OrderTitle || '').toLowerCase();
          bValue = (b.order.OrderTitle || '').toLowerCase();
          break;
        case 'user':
          aValue = (a.order.UserID.name || '').toLowerCase();
          bValue = (b.order.UserID.name || '').toLowerCase();
          break;
        case 'status':
          aValue = (a.order.Status || '').toLowerCase();
          bValue = (b.order.Status || '').toLowerCase();
          break;
        case 'hadiyaDue':
          // Sort by OrderAmt only if completed, else 0 essentially
          aValue = a.order.Status === 'Completed' ? (a.order.OrderAmt || 0) : 0;
          bValue = b.order.Status === 'Completed' ? (b.order.OrderAmt || 0) : 0;
          break;
        case 'hadiyaPaid':
          aValue = a.order.ScholarHadiyapaid ? (a.order.OrderAmt || 0) : 0;
          bValue = b.order.ScholarHadiyapaid ? (b.order.OrderAmt || 0) : 0;
          break;
        case 'date':
          aValue = new Date(a.order.createdAt || a.conversation.createdAt).getTime();
          bValue = new Date(b.order.createdAt || b.conversation.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return orders;
  }, [filteredOrders, sortConfig]);

  const selectedOrder = (selectedScholarData && viewChatOrderIndex !== null) ? selectedScholarData.orders[viewChatOrderIndex] : null;

  const handleSendReminder = async (item: ScholarWithOrders) => {
    const pendingOrders = item.orders.filter(o =>
      o.order.Status === 'In Progress By Scholar' ||
      o.order.Status === 'Revision Requested By Admin'
    );

    if (pendingOrders.length === 0) {
      await showAlert('Info', "No pending orders ('In Progress' or 'Revision Requested') for this scholar.", 'info');
      return;
    }

    const baseUrl = import.meta.env.VITE_ADMIN_BASE_URL || window.location.origin;

    let message = `Dear Scholar,\n\nYou have ${pendingOrders.length} pending orders that require your attention. Please review the details using the links below:\n\n`;
    pendingOrders.forEach((o) => {
      const link = `${baseUrl}/order/${o.order._id}`;
      message += `Request #${o.order.OrderID} (${o.order.Status}): ${link}\n\n`;
    });
    message += `Please update the status of these orders at your earliest convenience.`;

    // User Update: Alert msg and copy to clipboard
    try {
      await navigator.clipboard.writeText(message);
      await showAlert('Success', `Message copied to clipboard:\n\n${message}`, 'success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      await showAlert('Error', `Failed to copy to clipboard. Here is the message:\n\n${message}`, 'error');
    }
  };

  const navigate = useNavigate();

  const handleViewChat = (orderIndex: number) => {
    // Instead of local view, navigate to Orders tab (UserChat)
    if (!selectedScholarData) return;
    const order = selectedScholarData.orders[orderIndex];
    if (order && order.order._id) {
      navigate(`/admin/dashboard/orders?orderId=${order.order._id}`);
    }
  };

  const handleBackToOrders = () => {
    setViewChatOrderIndex(null);
  };

  const handleBackToScholars = () => {
    setSelectedScholarIndex(null);
    setViewChatOrderIndex(null);
  };

  // Auto-scroll to bottom of chat
  React.useEffect(() => {
    if (messagesContainerRef.current && selectedOrder) {
      const container = messagesContainerRef.current;
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
    }
  }, [selectedOrder, selectedOrder?.messages?.length, viewChatOrderIndex]);

  if (loading && data.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }



  return (
    <Box sx={{
      display: 'flex',
      height: { xs: 'auto', md: '100vh' },
      bgcolor: 'background.default',
      border: "1px solid #ddd",
      width: '100%',
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      {/* Left Sidebar: Scholar List */}
      <Box sx={{
        width: { xs: '100%', md: '30%' },
        borderRight: { md: 1 },
        borderColor: 'divider',
        p: 2,
        display: { xs: selectedScholarIndex === null ? 'block' : 'none', md: 'block' }
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, bgcolor: '#FAFAFB', p: 2 }}>
          Scholars
        </Typography>
        <Box sx={{ mb: 2 }}>
          <InputBase
            placeholder="Search scholar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<IconButton size="small"><SearchIcon /></IconButton>}
            sx={{ width: '100%', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}
          />
        </Box>
        <Box sx={{ maxHeight: 'calc(100vh - 180px)', overflow: 'auto' }}>
          {filteredData.map((item, index) => (
            <Box
              key={item.scholar._id}
              onClick={() => { setSelectedScholarIndex(index); setViewChatOrderIndex(null); }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1.5,
                mb: 1,
                cursor: 'pointer',
                borderRadius: 1,
                bgcolor: selectedScholarIndex === index ? 'grey.100' : 'transparent',
                '&:hover': { bgcolor: 'grey.100' },
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <Avatar src={item.scholar.ProfileImg} alt={item.scholar.scholarName} sx={{ mr: 2 }} />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight="medium" noWrap>{item.scholar.scholarName}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {item.counts.newOrder > 0 && (
                      <Chip label={`New: ${item.counts.newOrder}`} size="small" color="error" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                    )}
                    <Chip label={`Pending: ${item.counts.pending}`} size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    <Chip label={`In Progress: ${item.counts.inProgress}`} size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    <Chip label={`Completed: ${item.counts.completed}`} size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{
        flexGrow: 1,
        width: { xs: '100%', md: '70%' },
        bgcolor: 'white',
        display: { xs: selectedScholarIndex !== null ? 'block' : 'none', md: 'block' },
        overflow: 'auto'
      }}>
        {selectedScholarData ? (
          viewChatOrderIndex === null ? (
            /* Scholar Detailed Order View */
            <Box sx={{ p: 3 }}>
              {isMobile && (
                <IconButton onClick={handleBackToScholars} sx={{ mb: 2 }}><ArrowBackIcon /></IconButton>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar src={selectedScholarData.scholar.ProfileImg} sx={{ width: 64, height: 64, mr: 2 }} />
                  <Box>
                    <Typography variant="h5" fontWeight="bold">{selectedScholarData.scholar.scholarName}</Typography>
                    <Typography color="text.secondary">{selectedScholarData.scholar.phone_number || 'No phone number'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    onClick={() => handleSendReminder(selectedScholarData)}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Send Reminder
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={async () => {
                      const url = `${window.location.origin}/scholar-report/${selectedScholarData.scholar._id}`;
                      try {
                        await navigator.clipboard.writeText(url);
                        await showAlert('Link Copied', `Scholar report link copied to clipboard:\n${url}`, 'success');
                      } catch (err) {
                        await showAlert('Report Link', `Copy this link:\n${url}`, 'info');
                      }
                    }}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Share Report
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box>
                    <IconButton onClick={handleFilterClick} sx={{ bgcolor: 'grey.100', borderRadius: 1, p: 0.5 }}>
                      <FilterListIcon fontSize="small" />
                    </IconButton>
                    <Menu
                      anchorEl={filterAnchorEl}
                      open={openFilter}
                      onClose={handleFilterClose}
                      PaperProps={{ sx: { width: 300, maxHeight: 400 } }}
                    >
                      <Box sx={{ px: 2, py: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">Filter by Status</Typography>
                          {filterStatus.length > 0 && (
                            <Button size="small" onClick={() => setFilterStatus([])} color="error" sx={{ textTransform: 'none' }}>Clear</Button>
                          )}
                        </Box>
                        <FormGroup>
                          {[
                            'In Progress By Scholar',
                            'Revision Requested By Admin',
                            'Scholar Submitted – Pending Review',
                            'Completed'
                          ].map((status) => {
                            const count = selectedScholarData.orders.filter(o => o.order.Status === status).length;
                            return (
                              <FormControlLabel
                                key={status}
                                control={
                                  <Checkbox
                                    checked={filterStatus.includes(status)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setFilterStatus(prev =>
                                        checked ? [...prev, status] : prev.filter(s => s !== status)
                                      );
                                    }}
                                    size="small"
                                  />
                                }
                                label={<Typography variant="body2">{`${status} (${count})`}</Typography>}
                              />
                            );
                          })}
                        </FormGroup>
                      </Box>
                    </Menu>
                  </Box>
                  <Typography variant="h6" fontWeight="bold">Assigned Requests ({selectedScholarData.orders.length})</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                    Total Hadiya: <span style={{ color: '#0A9E6F' }}>PKR {selectedScholarData.orders.reduce((sum, o) => sum + (o.order.Status === 'Completed' ? (o.order.OrderAmt || 0) : 0), 0)}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                    Total Hadiya Due: <span style={{ color: '#e65100' }}>PKR {
                      selectedScholarData.orders.reduce((sum, o) => sum + (o.order.Status === 'Completed' ? (o.order.OrderAmt || 0) : 0), 0)
                      - selectedScholarData.orders.reduce((sum, o) => sum + (o.order.ScholarHadiyapaid ? (o.order.OrderAmt || 0) : 0), 0)
                    }</span>
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                    Total Hadiya Paid: <span style={{ color: '#0A9E6F' }}>PKR {selectedScholarData.orders.reduce((sum, o) => sum + (o.order.ScholarHadiyapaid ? (o.order.OrderAmt || 0) : 0), 0)}</span>
                  </Typography>
                </Box>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#FAFAFB' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <TableSortLabel active={sortConfig.key === 'id'} direction={sortConfig.key === 'id' ? sortConfig.direction : 'asc'} onClick={() => handleSort('id')}>Request ID</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <TableSortLabel active={sortConfig.key === 'service'} direction={sortConfig.key === 'service' ? sortConfig.direction : 'asc'} onClick={() => handleSort('service')}>Service</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <TableSortLabel active={sortConfig.key === 'user'} direction={sortConfig.key === 'user' ? sortConfig.direction : 'asc'} onClick={() => handleSort('user')}>User</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <TableSortLabel active={sortConfig.key === 'status'} direction={sortConfig.key === 'status' ? sortConfig.direction : 'asc'} onClick={() => handleSort('status')}>Status</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <TableSortLabel active={sortConfig.key === 'hadiyaDue'} direction={sortConfig.key === 'hadiyaDue' ? sortConfig.direction : 'asc'} onClick={() => handleSort('hadiyaDue')}>Hadiya Due</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <TableSortLabel active={sortConfig.key === 'hadiyaPaid'} direction={sortConfig.key === 'hadiyaPaid' ? sortConfig.direction : 'asc'} onClick={() => handleSort('hadiyaPaid')}>Hadiya Paid</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <TableSortLabel active={sortConfig.key === 'date'} direction={sortConfig.key === 'date' ? sortConfig.direction : 'asc'} onClick={() => handleSort('date')}>Date</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3 }}>No orders found for this scholar.</TableCell></TableRow>
                    ) : (
                      sortedOrders.map((o) => (
                        <TableRow
                          key={o.order._id}
                          hover
                          onClick={() => handleViewChat(selectedScholarData.orders.indexOf(o))}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: o.order.Status === 'Scholar Submitted – Pending Review' ? '#fff9c4' : 'inherit',
                            '&:hover': { bgcolor: o.order.Status === 'Scholar Submitted – Pending Review' ? '#fff59d !important' : undefined }
                          }}
                        >
                          <TableCell>#{o.order.OrderID}</TableCell>
                          <TableCell>{o.order.OrderTitle}</TableCell>
                          <TableCell>{o.order.UserID.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={o.order.Status}
                              size="small"
                              color={o.order.Status === 'Completed' ? 'success' : ((o.order.Status && o.order.Status.toLowerCase().includes('rejected')) || o.order.Status === 'User Review Requested') ? 'primary' : 'warning'}
                              sx={{ 
                                fontSize: '0.7rem', 
                                color: 'white',
                                ...((o.order.Status === 'Pending Admin Review' || o.order.Status === 'Scholar Submitted – Pending Review') && {
                                  bgcolor: '#eab308',
                                  color: '#000'
                                })
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {/* Hadiya Due: OrderAmt if Completed, else 0 */}
                            {o.order.Status === 'Completed' ? `PKR ${o.order.OrderAmt || 0}` : 'PKR 0'}
                          </TableCell>
                          <TableCell>
                            {/* Hadiya Paid */}
                            {o.order.ScholarHadiyapaid ? `PKR ${o.order.OrderAmt || 0}` : 'PKR 0'}
                          </TableCell>
                          <TableCell>
                            {(o.order.createdAt || o.conversation.createdAt)
                              ? new Date(o.order.createdAt || o.conversation.createdAt).toLocaleDateString('en-PK', { day: '2-digit', month: '2-digit', year: 'numeric' })
                              : 'N/A'}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', visibility: (o.order.Status === 'Completed' && (o.order.OrderAmt || 0) > 0) ? 'visible' : 'hidden' }}>
                              <Tooltip title={o.order.ScholarHadiyapaid ? "Already Paid" : "Pay Hadiya"}>
                                <span>
                                  <IconButton
                                    size="small"
                                    color="success"
                                    disabled={o.order.ScholarHadiyapaid}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const dueAmount = o.order.OrderAmt || 0;
                                      handlePaymentClick(o, dueAmount);
                                    }}
                                  >
                                    <PaymentsIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            /* Chat Interface View (Legacy Logic) */
            <Box sx={{ p: { xs: 1, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={handleBackToOrders} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
                <Typography variant="h6" fontWeight="bold">Chat for Request #{selectedOrder?.order.OrderID}</Typography>
              </Box>

              <Box sx={{ mb: 2, px: 2 }}>
                <Typography color="text.secondary">Review scholar's response for <strong>{selectedOrder?.order.OrderTitle}</strong></Typography>
              </Box>

              {/* Chat Container */}
              <Box
                ref={messagesContainerRef}
                sx={{
                  height: '400px',
                  overflowY: 'auto',
                  mb: 2,
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5
                }}
              >
                {selectedOrder?.messages
                  .filter(apiMsg => apiMsg.type === 'user' || apiMsg.type === 'scholar')
                  .map((apiMsg, index) => {
                    const isUserMessage = apiMsg.type === 'user';
                    const isScholarMessage = apiMsg.type === 'scholar';

                    return (
                      <Box
                        key={apiMsg._id || index}
                        sx={{
                          display: 'flex',
                          justifyContent: isUserMessage ? 'flex-start' : 'flex-end',
                          alignItems: 'flex-end',
                          gap: 1,
                          width: '100%'
                        }}
                      >
                        {isUserMessage && (
                          <Avatar
                            src={selectedOrder.order.UserID.profilePic}
                            alt={selectedOrder.order.UserID.name}
                            sx={{ width: 32, height: 32 }}
                          />
                        )}
                        <Box sx={{
                          width: '50%',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: isUserMessage ? 'white' : 'success.main',
                          color: isUserMessage ? 'text.primary' : 'white',
                          boxShadow: 1,
                          borderTopLeftRadius: isUserMessage ? 0 : 2,
                          borderTopRightRadius: isScholarMessage ? 0 : 2,
                        }}>
                          {apiMsg.text && (
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                              {renderContentWithLinks(apiMsg.text)}
                            </Typography>
                          )}
                          {apiMsg.audioUrl && (
                            <Box sx={{ mt: 1 }}>
                              <audio controls style={{ height: '30px', width: '100%', minWidth: '150px' }}>
                                <source src={apiMsg.audioUrl} type="audio/mpeg" />
                                Your browser does not support audio.
                              </audio>
                            </Box>
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.7,
                              textAlign: isUserMessage ? 'left' : 'right'
                            }}
                          >
                            {formatTimestamp(apiMsg.createdAt)}
                          </Typography>
                        </Box>
                        {isScholarMessage && (
                          <Avatar
                            src={selectedScholarData.scholar.ProfileImg}
                            alt={selectedScholarData.scholar.scholarName}
                            sx={{ width: 32, height: 32 }}
                          />
                        )}
                      </Box>
                    );
                  })}
              </Box>


            </Box>
          )
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
            <ChatIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography>Select a scholar to view their orders and send reminders.</Typography>
          </Box>
        )}
      </Box>

    </Box>
  );
};

export default ScholarChat;