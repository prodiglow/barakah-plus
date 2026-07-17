import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    CircularProgress,
    Divider,
    TableSortLabel,
} from '@mui/material';
import { Button } from '@mui/material';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DownloadIcon from '@mui/icons-material/Download';

// API_BASE_URL is handled by the api instance

interface OrderData {
    _id: string;
    OrderID: number;
    OrderTitle: string;
    Status: string;
    OrderAmt: number;
    PaymentStatus: string;
    ScholarHadiyapaid?: boolean;
    createdAt?: string;
    UserID: { _id: string; name: string } | any;
    ScholarID: {
        _id: string;
        scholarName: string;
        scholarSpecialization: { _id: string; name: string }[];
        scholarServices: { _id: string; name: string }[];
        fee: number;
        ProfileImg: string;
        phone_number: string;
    } | any;
}

const ScholarReport: React.FC = () => {
    const { scholarId } = useParams<{ scholarId: string }>();
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/orders/scholar/${scholarId}`);
                setOrders(response.data);
            } catch (err: any) {
                console.error('Error fetching scholar orders:', err);
                setError('Failed to load scholar report.');
            } finally {
                setLoading(false);
            }
        };

        if (scholarId) fetchData();
    }, [scholarId]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedOrders = useMemo(() => {
        const sorted = [...orders];
        sorted.sort((a, b) => {
            let aValue: any = '';
            let bValue: any = '';

            switch (sortConfig.key) {
                case 'id':
                    aValue = a.OrderID || 0;
                    bValue = b.OrderID || 0;
                    break;
                case 'service':
                    aValue = (a.OrderTitle || '').toLowerCase();
                    bValue = (b.OrderTitle || '').toLowerCase();
                    break;
                case 'user':
                    aValue = (typeof a.UserID === 'object' ? a.UserID?.name || '' : '').toLowerCase();
                    bValue = (typeof b.UserID === 'object' ? b.UserID?.name || '' : '').toLowerCase();
                    break;
                case 'status':
                    aValue = (a.Status || '').toLowerCase();
                    bValue = (b.Status || '').toLowerCase();
                    break;
                case 'hadiyaDue':
                    aValue = a.Status === 'Completed' ? (a.OrderAmt || 0) : 0;
                    bValue = b.Status === 'Completed' ? (b.OrderAmt || 0) : 0;
                    break;
                case 'hadiyaPaid':
                    aValue = a.ScholarHadiyapaid ? (a.OrderAmt || 0) : 0;
                    bValue = b.ScholarHadiyapaid ? (b.OrderAmt || 0) : 0;
                    break;
                case 'date':
                    aValue = new Date(a.createdAt || 0).getTime();
                    bValue = new Date(b.createdAt || 0).getTime();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [orders, sortConfig]);

    // Scholar info from first order (all orders share same scholar)
    const scholar = orders.length > 0 && typeof orders[0].ScholarID === 'object' ? orders[0].ScholarID : null;

    const totalHadiya = orders.reduce((sum, o) => sum + (o.Status === 'Completed' ? (o.OrderAmt || 0) : 0), 0);
    const totalPaid = orders.reduce((sum, o) => sum + (o.ScholarHadiyapaid ? (o.OrderAmt || 0) : 0), 0);
    const totalDue = totalHadiya - totalPaid;

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text('Scholar Report', 14, 22);

        // Scholar Info
        doc.setFontSize(12);
        if (scholar) {
            doc.text(`Scholar: ${scholar.scholarName}`, 14, 32);
            doc.text(`Phone: ${scholar.phone_number || 'N/A'}`, 14, 38);

            // Specializations
            if (scholar.scholarSpecialization && scholar.scholarSpecialization.length > 0) {
                const specs = scholar.scholarSpecialization.map((s: any) => s.name || s).join(', ');
                doc.text(`Specialties: ${specs}`, 14, 44);
            }
        }

        // Hadiya Summary
        doc.setFontSize(10);
        doc.text(`Total Assigned Requests: ${orders.length}`, 14, 55);
        doc.text(`Total Hadiya: PKR ${totalHadiya}`, 14, 60);
        doc.text(`Total Hadiya Due: PKR ${totalDue}`, 80, 60);
        doc.text(`Total Hadiya Paid: PKR ${totalPaid}`, 140, 60);

        // Table Data
        const tableColumn = ["ID", "Service", "User", "Status", "Hadiya Due", "Hadiya Paid", "Date"];
        const tableRows = sortedOrders.map(order => [
            order.OrderID,
            order.OrderTitle,
            typeof order.UserID === 'object' ? order.UserID?.name : 'N/A',
            order.Status,
            `PKR ${order.Status === 'Completed' && !order.ScholarHadiyapaid ? (order.OrderAmt || 0) : 0}`,
            `PKR ${order.ScholarHadiyapaid ? (order.OrderAmt || 0) : 0}`,
            order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-PK') : 'N/A'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 65,
        });

        doc.save(`Scholar_Report_${scholar?.scholarName || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f6fa' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f6fa' }}>
                <Typography color="error" variant="h6">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', bgcolor: '#f5f6fa', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    {/* Scholar Header */}
                    <Box sx={{ flexShrink: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            {scholar ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar src={scholar.ProfileImg} alt={scholar.scholarName} sx={{ width: 72, height: 72, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">{scholar.scholarName}</Typography>
                                        <Typography color="text.secondary" gutterBottom>{scholar.phone_number || 'No phone number'}</Typography>

                                        {/* Specializations */}
                                        {scholar.scholarSpecialization && scholar.scholarSpecialization.length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 1 }}>Specialties:</Typography>
                                                {scholar.scholarSpecialization.map((spec: any, i: number) => (
                                                    <Chip key={i} label={spec.name || spec} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                                ))}
                                            </Box>
                                        )}

                                        {/* Services */}
                                        {scholar.scholarServices && scholar.scholarServices.length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 1 }}>Services:</Typography>
                                                {scholar.scholarServices.map((service: any, i: number) => (
                                                    <Chip key={i} label={service.name || service} size="small" color="secondary" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            ) : (
                                <Typography variant="h5" fontWeight="bold">Scholar Report</Typography>
                            )}

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleDownloadPDF}
                                    sx={{ bgcolor: '#0A9E6F', '&:hover': { bgcolor: '#08865e' } }}
                                >
                                    Download Report
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => {
                                        const doc = new jsPDF();
                                        const months = [];
                                        const now = new Date();

                                        // Generate last 5 months
                                        for (let i = 0; i < 5; i++) {
                                            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                                            months.push(date);
                                        }

                                        months.forEach((monthDate, index) => {
                                            const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

                                            // Filter orders for this month
                                            const monthOrders = sortedOrders.filter(o => {
                                                if (!o.createdAt) return false;
                                                const orderDate = new Date(o.createdAt);
                                                return orderDate.getMonth() === monthDate.getMonth() && orderDate.getFullYear() === monthDate.getFullYear();
                                            });

                                            if (index > 0) doc.addPage();

                                            // Title
                                            doc.setFontSize(20);
                                            doc.text(`Monthly Report: ${monthName}`, 14, 22);

                                            // Scholar Info (Brief)
                                            doc.setFontSize(10);
                                            if (scholar) {
                                                doc.text(`Scholar: ${scholar.scholarName}`, 14, 30);
                                            }

                                            // Monthly Summary
                                            const mHadiya = monthOrders.reduce((sum, o) => sum + (o.Status === 'Completed' ? (o.OrderAmt || 0) : 0), 0);
                                            const mPaid = monthOrders.reduce((sum, o) => sum + (o.ScholarHadiyapaid ? (o.OrderAmt || 0) : 0), 0);
                                            const mDue = mHadiya - mPaid;

                                            doc.text(`Total Assigned: ${monthOrders.length}`, 14, 40);
                                            doc.text(`Hadiya: PKR ${mHadiya}`, 60, 40);
                                            doc.text(`Paid: PKR ${mPaid}`, 110, 40);
                                            doc.text(`Due: PKR ${mDue}`, 160, 40);

                                            if (monthOrders.length > 0) {
                                                const tableColumn = ["ID", "Service", "User", "Status", "Hadiya Due", "Hadiya Paid", "Date"];
                                                const tableRows = monthOrders.map(order => [
                                                    order.OrderID,
                                                    order.OrderTitle,
                                                    typeof order.UserID === 'object' ? order.UserID?.name : 'N/A',
                                                    order.Status,
                                                    `PKR ${order.Status === 'Completed' && !order.ScholarHadiyapaid ? (order.OrderAmt || 0) : 0}`,
                                                    `PKR ${order.ScholarHadiyapaid ? (order.OrderAmt || 0) : 0}`,
                                                    order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-PK') : 'N/A'
                                                ]);

                                                autoTable(doc, {
                                                    head: [tableColumn],
                                                    body: tableRows,
                                                    startY: 45,
                                                });
                                            } else {
                                                doc.text("No orders for this month.", 14, 50);
                                            }
                                        });

                                        doc.save(`Scholar_Monthly_Report_${scholar?.scholarName || 'Unknown'}_Last_5_Months.pdf`);
                                    }}
                                    sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#115293' } }}
                                >
                                    Download Monthly Report
                                </Button>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Summary */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="h6" fontWeight="bold">
                                Assigned Requests ({orders.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                    Total Hadiya: <span style={{ color: '#0A9E6F' }}>PKR {totalHadiya}</span>
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                    Total Hadiya Due: <span style={{ color: '#e65100' }}>PKR {totalDue}</span>
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                    Total Hadiya Paid: <span style={{ color: '#0A9E6F' }}>PKR {totalPaid}</span>
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Orders Table */}
                    <TableContainer sx={{ flexGrow: 1, overflow: 'auto', border: '1px solid #eee' }}>
                        <Table size="small" stickyHeader>
                            <TableHead sx={{ bgcolor: '#FAFAFB' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#FAFAFB' }}>
                                        <TableSortLabel active={sortConfig.key === 'id'} direction={sortConfig.key === 'id' ? sortConfig.direction : 'asc'} onClick={() => handleSort('id')}>Request ID</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#FAFAFB' }}>
                                        <TableSortLabel active={sortConfig.key === 'service'} direction={sortConfig.key === 'service' ? sortConfig.direction : 'asc'} onClick={() => handleSort('service')}>Service</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#FAFAFB' }}>
                                        <TableSortLabel active={sortConfig.key === 'user'} direction={sortConfig.key === 'user' ? sortConfig.direction : 'asc'} onClick={() => handleSort('user')}>User</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#FAFAFB' }}>
                                        <TableSortLabel active={sortConfig.key === 'status'} direction={sortConfig.key === 'status' ? sortConfig.direction : 'asc'} onClick={() => handleSort('status')}>Status</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#FAFAFB' }}>
                                        <TableSortLabel active={sortConfig.key === 'hadiyaDue'} direction={sortConfig.key === 'hadiyaDue' ? sortConfig.direction : 'asc'} onClick={() => handleSort('hadiyaDue')}>Hadiya Due</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#FAFAFB' }}>
                                        <TableSortLabel active={sortConfig.key === 'hadiyaPaid'} direction={sortConfig.key === 'hadiyaPaid' ? sortConfig.direction : 'asc'} onClick={() => handleSort('hadiyaPaid')}>Hadiya Paid</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#FAFAFB' }}>
                                        <TableSortLabel active={sortConfig.key === 'date'} direction={sortConfig.key === 'date' ? sortConfig.direction : 'asc'} onClick={() => handleSort('date')}>Date</TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>No orders found for this scholar.</TableCell></TableRow>
                                ) : (
                                    sortedOrders.map((o) => (
                                        <TableRow key={o._id} hover>
                                            <TableCell>#{o.OrderID}</TableCell>
                                            <TableCell>{o.OrderTitle}</TableCell>
                                            <TableCell>{typeof o.UserID === 'object' ? o.UserID?.name : 'N/A'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={o.Status}
                                                    size="small"
                                                    color={o.Status === 'Completed' ? 'success' : ((o.Status && o.Status.toLowerCase().includes('rejected')) || o.Status === 'User Review Requested') ? 'primary' : 'warning'}
                                                    sx={{ fontSize: '0.7rem', color: 'white' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {o.Status === 'Completed' && !o.ScholarHadiyapaid ? `PKR ${o.OrderAmt || 0}` : 'PKR 0'}
                                            </TableCell>
                                            <TableCell>
                                                {o.ScholarHadiyapaid ? `PKR ${o.OrderAmt || 0}` : 'PKR 0'}
                                            </TableCell>
                                            <TableCell>
                                                {o.createdAt
                                                    ? new Date(o.createdAt).toLocaleDateString('en-PK', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                                    : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </Box>
    );
};

export default ScholarReport;
