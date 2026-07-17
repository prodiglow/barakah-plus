import * as React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
  Grid,
  Chip,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPaymentStats, PaymentStats } from '../services/paymentService'; // Import service
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



const Payments: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger }) => {
  const [period, setPeriod] = React.useState<'day' | 'month' | 'year'>('month');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for stats
  const [stats, setStats] = React.useState<PaymentStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getPaymentStats(period);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch payment stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period, refreshTrigger]);

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setPeriod(event.target.value as 'day' | 'month' | 'year');
  };

  const getStatusChip = (status: string) => {
    return (
      <Chip
        label={status}
        color={status === 'Paid' ? 'success' : 'warning'}
        size={isMobile ? "small" : "medium"}
        sx={{
          fontSize: { xs: '0.7rem', sm: '0.8rem' },
          minWidth: isSmallMobile ? 60 : 80
        }}
      />
    );
  };

  if (loading && !stats) { // Show loading only on initial load or if you prefer loading spinner on every filter change remove !stats
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (!stats && !loading) {
    return <Box sx={{ p: 4 }}>Failed to load data.</Box>;
  }

  // Fallback if stats is null during loading (though handled above, TypeScript might complain)
  const displayStats = stats || {
    totalEarnings: 0,
    pendingPayments: 0,
    completedTransactionsCount: 0,
    chartData: [],
    transactions: [],
    insights: { averageEarnings: 0, highestEarningDay: 'N/A', pendingPaymentRatio: 0 }
  };

  const handleExportCSV = () => {
    if (!displayStats.transactions || displayStats.transactions.length === 0) {
      alert("No transactions to export.");
      return;
    }

    // Define CSV headers
    const headers = ["Order ID", "Date", "Service", "User", "Amount", "Status"];

    // Map transactions to CSV rows
    const rows = displayStats.transactions.map(tx => [
      tx.orderId,
      tx.date,
      tx.service,
      tx.user,
      tx.amount,
      tx.status
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(item => `"${item}"`).join(",")) // Quote items to handle commas in data
    ].join("\n");

    // Create a Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a link to download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `payment_report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!displayStats.transactions || displayStats.transactions.length === 0) {
      alert("No transactions to export.");
      return;
    }

    const doc = new jsPDF();
    doc.text(`Payment Report - ${period.charAt(0).toUpperCase() + period.slice(1)}`, 14, 15);

    const tableColumn = ["Order ID", "Date", "Service", "User", "Amount", "Status"];
    const tableRows = displayStats.transactions.map(tx => [
      tx.orderId,
      tx.date,
      tx.service,
      tx.user,
      `PKR ${tx.amount}`,
      tx.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      didParseCell: (data) => {
        if (data.section === 'body') {
          const rowRaw = data.row.raw as any[];
          const status = rowRaw[5]; // Status is the 6th element
          if (status === 'Paid') {
            data.cell.styles.fillColor = [230, 244, 234]; // Light Green
          } else if (status === 'Pending') {
            data.cell.styles.fillColor = [255, 243, 224]; // Light Orange
          }
        }
      },
    });

    doc.save(`payment_report_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'background.default', border: "1px solid #ddd" }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 2,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Earnings Overview
        </Typography>
        <Select
          value={period}
          onChange={handlePeriodChange}
          sx={{
            bgcolor: '#fff',
            borderRadius: 1,
            minWidth: { xs: '100%', sm: 120 },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
          size={isMobile ? "small" : "medium"}
          renderValue={(selected) => selected.charAt(0).toUpperCase() + selected.slice(1)}
        >
          <MenuItem value="day">Day</MenuItem>
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="year">Year</MenuItem>
        </Select>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ bgcolor: '#e6f4ea', textAlign: 'center' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="body2" color="success.main" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Total Earnings
              </Typography>
              <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                PKR {displayStats.totalEarnings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ bgcolor: '#fff3e0', textAlign: 'center' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="body2" color="warning.main" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Pending Payments
              </Typography>
              <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                PKR {displayStats.pendingPayments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ bgcolor: '#e6ffe6', textAlign: 'center' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="body2" color="success.main" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Completed Transactions
              </Typography>
              <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                {displayStats.completedTransactionsCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Earnings
        </Typography>
        <Box sx={{ width: '100%', height: { xs: 200, sm: 250, md: 300 } }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayStats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: isSmallMobile ? 10 : 12 }}
              />
              <YAxis tick={{ fontSize: isSmallMobile ? 10 : 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: isSmallMobile ? 10 : 12 }} />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#8884d8"
                strokeWidth={2}
                activeDot={{ r: isSmallMobile ? 4 : 6 }}
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#ff9800"
                strokeWidth={2}
                activeDot={{ r: isSmallMobile ? 4 : 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Transaction History and Insights */}
      <Grid container spacing={2}>
        {/* Transaction History */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Transaction History
          </Typography>

          {isMobile ? (
            // Mobile Card View
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              <Stack spacing={2}>
                {displayStats.transactions.map((transaction) => (
                  <Card key={transaction.orderId} variant="outlined">
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {transaction.orderId}
                          </Typography>
                          {getStatusChip(transaction.status)}
                        </Box>

                        {/* Details */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Date
                            </Typography>
                            <Typography variant="body2">
                              {transaction.date}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Amount
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              PKR {transaction.amount}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Service
                            </Typography>
                            <Typography variant="body2">
                              {transaction.service}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              User
                            </Typography>
                            <Typography variant="body2">
                              {transaction.user}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          ) : (
            // Desktop Table View
            <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
              <Table sx={{ minWidth: 650 }} aria-label="transaction history table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Order ID</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Service</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>User</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayStats.transactions.map((transaction) => (
                    <TableRow
                      key={transaction.orderId}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell sx={{ fontSize: '0.875rem' }}>{transaction.orderId}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{transaction.date}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{transaction.service}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{transaction.user}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>PKR {transaction.amount}</TableCell>
                      <TableCell>
                        {getStatusChip(transaction.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Grid>

        {/* Insights Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }} >
          <Card sx={{ bgcolor: '#fff' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Insights
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Average Earnings per Order
                  </Typography>
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    PKR {displayStats.insights.averageEarnings}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Highest Earning Day
                  </Typography>
                  <Typography variant="h6" color="success.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {displayStats.insights.highestEarningDay}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Pending Payment Ratio
                  </Typography>
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {displayStats.insights.pendingPaymentRatio}%
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  sx={{ mt: 1 }}
                  onClick={handleExportCSV}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  sx={{ mt: 1 }}
                  onClick={handleExportPDF}
                >
                  Export PDF
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Payments;