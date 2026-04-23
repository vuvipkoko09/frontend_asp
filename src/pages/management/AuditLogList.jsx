import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Alert, CircularProgress,
    Stack, Chip, Button
} from '@mui/material';
import { HistoryOutlined, DeleteOutlined } from '@ant-design/icons';
import api from 'utils/api';

const API_URL = '';

export default function AuditLogList() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await api.get(`${API_URL}/AuditLogs`);
            setLogs(res.data);
            setError('');
        } catch {
            setError('Không thể lấy danh sách nhật ký hệ thống!');
        } finally {
            setLoading(false);
        }
    };

    const handleClearLogs = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ nhật ký hệ thống không? Hành động này không thể hoàn tác!')) {
            try {
                setLoading(true);
                await api.delete(`${API_URL}/AuditLogs/clear`);
                setLogs([]);
            } catch {
                setError('Không thể dọn dẹp nhật ký!');
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'success';
            case 'UPDATE': return 'warning';
            case 'DELETE': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <HistoryOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <Typography variant="h4" color="primary">NHẬT KÝ HỆ THỐNG</Typography>
                </Stack>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteOutlined />}
                    onClick={handleClearLogs}
                    disabled={logs.length === 0 || loading}
                >
                    Dọn dẹp nhật ký
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Thời gian</strong></TableCell>
                            <TableCell><strong>Người thực hiện</strong></TableCell>
                            <TableCell><strong>Hành động</strong></TableCell>
                            <TableCell><strong>Đối tượng</strong></TableCell>
                            <TableCell><strong>Nội dung thay đổi</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center">Không có dữ liệu nhật ký</TableCell></TableRow>
                        ) : (
                            logs.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>
                                        {row.timestamp ? new Date(row.timestamp).toLocaleString('vi-VN') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.userName || 'Hệ thống'}</Typography>
                                        <Typography variant="caption" color="textSecondary">ID: {row.userId || '-'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.action}
                                            size="small"
                                            color={getActionColor(row.action)}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2"><strong>{row.entityName}</strong></Typography>
                                        <Typography variant="caption">ID: {row.entityId}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 400, wordBreak: 'break-word' }}>
                                        {row.changes}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
