import { useState, useEffect } from 'react';

// material-ui
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Grid, Stack, 
    IconButton, Tooltip, LinearProgress 
} from '@mui/material';

// assets
import { 
    DashboardOutlined, 
    InfoCircleOutlined, 
    WarningOutlined, 
    FileProtectOutlined,
    DollarCircleOutlined 
} from '@ant-design/icons';

import api from 'utils/api';

export default function Reports() {
    const [summary, setSummary] = useState(null);
    const [lowStock, setLowStock] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const resSum = await api.get('/Reports/inventory-summary');
            setSummary(resSum.data);

            const resLow = await api.get('/Reports/low-stock?threshold=5');
            setLowStock(resLow.data);

            const resLogs = await api.get('/AuditLogs');
            setRecentLogs(resLogs.data.slice(0, 10)); // Top 10 latest logs
        } catch {
            console.error('Lỗi khi tải báo cáo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return '#52c41a';
            case 'UPDATE': return '#faad14';
            case 'DELETE': return '#f5222d';
            case 'COMPLETE': return '#1890ff';
            case 'HANDOVER': return '#722ed1';
            default: return '#8c8c8c';
        }
    };

    if (loading && !summary) {
        return <Box sx={{ width: '100%', mt: 4 }}><LinearProgress /></Box>;
    }

    return (
        <Box sx={{ p: 4, bgcolor: '#f4f7fa', minHeight: '100vh' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        Inventory Intelligence
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Analytics and deep insight into your warehouse assets.
                    </Typography>
                </Box>
                <IconButton onClick={fetchReports} color="primary" sx={{ bgcolor: 'white', boxShadow: 1 }}>
                    <DashboardOutlined />
                </IconButton>
            </Stack>
            
            <Grid container spacing={3} mb={5}>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Stock Assessment" 
                        value={summary?.totalItemsInStock || 0} 
                        subtitle="Total Units across all categories"
                        icon={<FileProtectOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                        color="#e6f7ff"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Total Asset Value" 
                        value={formatCurrency(summary?.totalInventoryValue || 0)} 
                        subtitle="Estimated based on cost prices"
                        icon={<DollarCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                        color="#f6ffed"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Active Categories" 
                        value={summary?.totalCategories || 0} 
                        subtitle="Managed product families"
                        icon={<DashboardOutlined style={{ fontSize: 24, color: '#722ed1' }} />}
                        color="#f9f0ff"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3} mb={4}>
                {/* Category Distribution */}
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
                        <Typography variant="h5" mb={3} sx={{ fontWeight: 600 }}>Category Breakdown</Typography>
                        <Stack spacing={2.5}>
                            {summary?.categoryDistribution?.map((cat, index) => (
                                <Box key={index}>
                                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{cat.category}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{cat.itemCount} items</Typography>
                                    </Stack>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={(cat.itemCount / summary.totalItemsInStock) * 100} 
                                        sx={{ height: 6, borderRadius: 3, bgcolor: '#f0f0f0' }}
                                    />
                                    <Typography variant="caption" color="textSecondary">
                                        Value: {formatCurrency(cat.value)}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Low Stock Alerts */}
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 0, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                <WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                                Critical Stock Alerts
                            </Typography>
                            <Tooltip title="Products below threshold (5 items)">
                                <IconButton size="small"><InfoCircleOutlined /></IconButton>
                            </Tooltip>
                        </Box>
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: '#fff1f0' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: '#cf1322', fontWeight: 'bold' }}>SKU</TableCell>
                                        <TableCell sx={{ color: '#cf1322', fontWeight: 'bold' }}>Product Name</TableCell>
                                        <TableCell align="center" sx={{ color: '#cf1322', fontWeight: 'bold' }}>Stock Level</TableCell>
                                        <TableCell align="center" sx={{ color: '#cf1322', fontWeight: 'bold' }}>Health</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lowStock.map((p) => (
                                        <TableRow key={p.productId} hover>
                                            <TableCell sx={{ fontFamily: 'monospace' }}>{p.sku}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                                            <TableCell align="center">
                                                <Typography color="error.main" fontWeight="bold">
                                                    {p.stock} units
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={(p.stock / 5) * 100} 
                                                        color="error"
                                                        sx={{ width: 100, height: 4, borderRadius: 2, mr: 1 }}
                                                    />
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {lowStock.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                                <Typography color="textSecondary" variant="subtitle1">
                                                    All stock levels are optimal. No critical shortages detected.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Recent System Activity */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Typography variant="h5" mb={3} sx={{ fontWeight: 600 }}>Recent System Activity</Typography>
                <Grid container spacing={2}>
                    {recentLogs.map((log) => (
                        <Grid item xs={12} key={log.id}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                p: 1.5, 
                                borderRadius: 2, 
                                bgcolor: '#f8fafc',
                                borderLeft: `4px solid ${getActionColor(log.action)}`
                            }}>
                                <Box sx={{ minWidth: 100, mr: 2 }}>
                                    <Typography variant="caption" display="block" color="textSecondary">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="textSecondary">
                                        {new Date(log.timestamp).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {log.userName || 'System'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {log.changes}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ 
                                        px: 1, 
                                        py: 0.5, 
                                        borderRadius: 1, 
                                        bgcolor: getActionColor(log.action) + '20',
                                        color: getActionColor(log.action),
                                        fontWeight: 'bold',
                                        fontSize: '0.65rem'
                                    }}>
                                        {log.action}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                    {recentLogs.length === 0 && (
                        <Grid item xs={12}>
                            <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
                                No recent activity recorded.
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>
        </Box>
    );
}

function StatCard({ title, value, subtitle, icon, color }) {
    return (
        <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #edf2f7', bgcolor: 'white' }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: color, display: 'flex' }}>
                    {icon}
                </Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                    {title}
                </Typography>
            </Stack>
            <Typography variant="h3" mb={0.5} sx={{ fontWeight: 800 }}>{value}</Typography>
            <Typography variant="caption" color="textSecondary">{subtitle}</Typography>
        </Paper>
    );
}
