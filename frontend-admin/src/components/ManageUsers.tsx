import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    CircularProgress,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Collapse,
    Chip
} from '@mui/material';
import { Delete, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllUsers, deleteUser } from '../services/adminService';
import { getOrdersByUserId } from '../services/orderService';
import { Order } from '../types/order';

interface User {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
    phone?: string;
    isVerified?: boolean;
    gender?: string;
    role?: string;
    createdAt?: string;
    ordersCount: number;
    ordersCompleted: number;
    ordersProcessing: number;
    totalOrderAmt: number;
    ordersAmountPaid: number;
    ordersAmountPending: number;
}

const ManageUsers: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Delete State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Expansion State
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const [userOrders, setUserOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [refreshTrigger]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers();
            // Handle different response structures if needed
            const data = Array.isArray(response) ? response : (response.users || response.data || []);
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
            toast.error('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- Delete Handlers ---
    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        try {
            setDeleting(true);
            await deleteUser(userToDelete._id);
            setUsers(users.filter(u => u._id !== userToDelete._id));
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            toast.success('User deleted successfully!');
        } catch (err) {
            console.error('Error deleting user:', err);
            toast.error('Failed to delete user.');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    // --- Expansion Handler ---
    const handleExpandClick = async (userId: string) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
            setUserOrders([]);
            return;
        }

        setExpandedUserId(userId);
        setLoadingOrders(true);
        setUserOrders([]);

        try {
            const orders = await getOrdersByUserId(userId);
            setUserOrders(orders);
        } catch (err) {
            console.error('Error fetching user orders:', err);
            // Don't show error toast here to avoid spamming if user just has no orders (though API usually returns empty array)
            // But if 404/500, we might want to know.
            // getOrdersByUserId returns 404 if no orders, we can handle that or just show empty.
        } finally {
            setLoadingOrders(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `PKR ${amount.toFixed(2)}`;
    };

    const getStatusColor = (status: string) => {
        if (status === 'Completed') return 'success';
        if (status && (status.toLowerCase().includes('rejected') || status === 'User Review Requested')) return 'primary';
        return 'warning';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth={false} sx={{ py: 4 }}>
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

            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name/Profile</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>

                            {/* Requests Section */}
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Total Requests</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>In Process</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Completed</TableCell>

                            {/* Amount Section */}
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Total Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Pending</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Paid</TableCell>

                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>

                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No users found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map(user => (
                                <React.Fragment key={user._id}>

                                    <TableRow sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <IconButton
                                                    aria-label="expand row"
                                                    size="small"
                                                    onClick={() => handleExpandClick(user._id)}
                                                    sx={{ padding: 0 }}
                                                >
                                                    {expandedUserId === user._id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                </IconButton>
                                                <Avatar
                                                    src={user.profilePic}
                                                    alt={user.name}
                                                    sx={{ width: 40, height: 40 }}
                                                >
                                                    {user.name?.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {user.name || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{user.email || 'N/A'}</TableCell>
                                        <TableCell>{user.phone || 'N/A'}</TableCell>

                                        <TableCell align="center">{user.ordersCount}</TableCell>
                                        <TableCell align="center">{user.ordersCount - user.ordersCompleted}</TableCell>
                                        <TableCell align="center">{user.ordersCompleted}</TableCell>

                                        <TableCell align="right">
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: user.totalOrderAmt === 0 ? 'normal' : 'bold',
                                                }}
                                            >
                                                {formatCurrency(user.totalOrderAmt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: user.ordersAmountPending === 0 ? 'normal' : 'bold',
                                                    color: user.ordersAmountPending > 0 ? 'warning.main' : 'text.secondary'
                                                }}
                                            >
                                                {formatCurrency(user.ordersAmountPending)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: user.ordersAmountPaid === 0 ? 'normal' : 'bold',
                                                    color: user.ordersAmountPaid > 0 ? 'success.main' : 'text.secondary'
                                                }}
                                            >
                                                {formatCurrency(user.ordersAmountPaid)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Tooltip title="Delete User">
                                                    <IconButton color="error" onClick={() => handleDeleteClick(user)}>
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>

                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                                            <Collapse in={expandedUserId === user._id} timeout="auto" unmountOnExit>
                                                <Box sx={{ margin: 2 }}>
                                                    <Typography variant="h6" gutterBottom component="div">
                                                        Request History
                                                    </Typography>
                                                    {loadingOrders ? (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                                            <CircularProgress size={24} />
                                                        </Box>
                                                    ) : userOrders.length > 0 ? (
                                                        <Table size="small" aria-label="purchases">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Request ID</TableCell>
                                                                    <TableCell>Service</TableCell>
                                                                    <TableCell>Scholar</TableCell>
                                                                    <TableCell align="right">Amount</TableCell>
                                                                    <TableCell align="center">Status</TableCell>
                                                                    <TableCell align="center">Payment</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {userOrders.map((orderRow) => (
                                                                    <TableRow
                                                                        key={orderRow._id}
                                                                        onClick={() => navigate(`/admin/dashboard/orders?orderId=${orderRow._id}`)}
                                                                        sx={{
                                                                            cursor: 'pointer',
                                                                            '&:hover': { backgroundColor: 'action.hover' }
                                                                        }}
                                                                    >
                                                                        <TableCell component="th" scope="row">
                                                                            #{orderRow.OrderID}
                                                                        </TableCell>
                                                                        <TableCell>{orderRow.OrderTitle}</TableCell>
                                                                        <TableCell>{(orderRow.ScholarID as any)?.scholarName || 'N/A'}</TableCell>
                                                                        <TableCell align="right">{formatCurrency(orderRow.OrderAmt)}</TableCell>
                                                                        <TableCell align="center">
                                                                            <Chip
                                                                                label={orderRow.Status}
                                                                                color={getStatusColor(orderRow.Status) as any}
                                                                                size="small"
                                                                                sx={{ 
                                                                                    color: 'white',
                                                                                    ...((orderRow.Status === 'Pending Admin Review' || orderRow.Status === 'Scholar Submitted – Pending Review') && {
                                                                                        bgcolor: '#eab308',
                                                                                        color: '#000'
                                                                                    })
                                                                                }}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            <Chip
                                                                                label={orderRow.PaymentStatus}
                                                                                color={orderRow.PaymentStatus === 'Paid' ? 'success' : 'default'}
                                                                                size='small'
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                                                            No orders found for this user.
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* DELETE DIALOG */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete user <strong>{userToDelete?.name}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        {deleting ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ManageUsers;
