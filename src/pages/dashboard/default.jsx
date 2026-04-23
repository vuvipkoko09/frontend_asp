import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';

// project imports
import MainCard from 'components/MainCard';
import { BarChart } from '@mui/x-charts/BarChart';
import api from 'utils/api';

// assets
import BoxPlotOutlined from '@ant-design/icons/BoxPlotOutlined';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
import RocketOutlined from '@ant-design/icons/RocketOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';

// ==============================|| KPI CARD COMPONENT ||============================== //

function KPICard({ title, count, icon, color }) {
  return (
    <MainCard content={false} sx={{ borderLeft: 4, borderColor: `${color}.main` }}>
      <Box sx={{ p: 2.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="h6" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h3">{count ?? '-'}</Typography>
          </Stack>
          <Avatar variant="rounded" sx={{ bgcolor: `${color}.lighter`, color: `${color}.main`, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Stack>
      </Box>
    </MainCard>
  );
}

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/Dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Dữ liệu biểu đồ từ API
  const chartLabels = stats?.chartData?.map(d => d.label) ?? [];
  const chartInbound = stats?.chartData?.map(d => d.inbound) ?? [];
  const chartOutbound = stats?.chartData?.map(d => d.outbound) ?? [];

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1: KPI Cards */}
      <Grid size={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">WMS Analytics Dashboard</Typography>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KPICard title="Tổng Sản phẩm" count={stats?.totalProducts} icon={<BoxPlotOutlined />} color="primary" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KPICard title="Tồn kho" count={stats?.stockCount} icon={<DatabaseOutlined />} color="success" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KPICard title="Xuất kho hôm nay" count={stats?.outboundToday} icon={<RocketOutlined />} color="info" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KPICard title="Cảnh báo tồn kho thấp" count={stats?.lowStockItems?.length} icon={<WarningOutlined />} color="error" />
      </Grid>

      {/* row 2: Charts */}
      <Grid size={{ xs: 12, md: 8 }}>
        <MainCard title="Nhập / Xuất kho - 7 ngày gần nhất">
          <Box sx={{ height: 400, width: '100%', mt: 2 }}>
            <BarChart
              xAxis={[{ scaleType: 'band', data: chartLabels }]}
              series={[
                { data: chartInbound, label: 'Nhập kho', color: theme.palette.success.main },
                { data: chartOutbound, label: 'Xuất kho', color: theme.palette.warning.main }
              ]}
              height={350}
              margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
            />
          </Box>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <MainCard title="Stock Composition">
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Category Distribution</Typography>
            <Stack spacing={2}>
              {stats?.categoryDistribution?.map((cat) => (
                <Stack key={cat.name} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">{cat.name}</Typography>
                  <Typography variant="h6" color="primary">{cat.count}</Typography>
                </Stack>
              ))}
            </Stack>
            <Button variant="outlined" fullWidth sx={{ mt: 3 }}>View Details</Button>
          </Box>
        </MainCard>
      </Grid>

      {/* row 3: Recent Transactions & Low Stock Items */}
      <Grid size={{ xs: 12, md: 7 }}>
        <MainCard title="Recent Transactions" content={false}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#fafafa' }}>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Performed By</TableCell>
                  <TableCell>Note</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.recentTransactions?.map((row) => (
                  <TableRow key={row.transactionId} hover>
                    <TableCell>{new Date(row.createdAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.type} 
                        size="small" 
                        color={row.type === 'INBOUND' ? 'success' : 'error'} 
                        variant="combined" 
                      />
                    </TableCell>
                    <TableCell>{row.userName}</TableCell>
                    <TableCell>{row.note || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <MainCard title="Low Stock Alerts" content={false}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#fafafa' }}>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Stock</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.lowStockItems?.length > 0 ? stats.lowStockItems.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={row.image} variant="rounded" sx={{ width: 30, height: 30 }} />
                        <Box>
                          <Typography variant="subtitle2">{row.name}</Typography>
                          <Typography variant="caption" color="textSecondary">{row.sku}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={row.stock} 
                        size="small" 
                        color="error" 
                        sx={{ fontWeight: 'bold' }} 
                      />
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      🎉 Không có sản phẩm nào cần cảnh báo tồn kho thấp!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>
    </Grid>
  );
}
