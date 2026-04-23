import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from 'utils/api';

export default function InventoryCheck() {
    const [checks, setChecks] = useState([]);
    
    // UI states
    const [openCreate, setOpenCreate] = useState(false);
    
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedCheck, setSelectedCheck] = useState(null);

    const fetchChecks = async () => {
        try {
            const res = await api.get('/InventoryChecks');
            setChecks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchChecks();
    }, []);

    const handleCreateSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await api.post('/InventoryChecks', { name: values.name });
            setOpenCreate(false);
            resetForm();
            fetchChecks();
        } catch(err) {
            alert('Lỗi tạo phiên kiểm kê');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenDetail = async (id) => {
        try {
            const res = await api.get(`/InventoryChecks/${id}`);
            setSelectedCheck(res.data);
            setOpenDetail(true);
        } catch(err) {
            alert('Lỗi lấy chi tiết');
        }
    };

    const handleUpdateDetail = async (detailId, actualQty, reason) => {
        try {
            await api.put(`/InventoryChecks/${selectedCheck.checkId}/details/${detailId}`, { actualQty, reason });
            // Refresh detail
            const res = await api.get(`/InventoryChecks/${selectedCheck.checkId}`);
            setSelectedCheck(res.data);
        } catch(err) {
            alert('Lỗi lưu chi tiết');
        }
    };

    const markComplete = async (id) => {
        try {
            await api.post(`/InventoryChecks/${id}/complete`);
            fetchChecks();
            if (selectedCheck && selectedCheck.checkId === id) {
                setOpenDetail(false);
            }
        } catch(err) {
            alert('Lỗi cập nhật');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h4" color="primary">Kiểm Kê Định Kỳ</Typography>
                <Button variant="contained" onClick={() => setOpenCreate(true)}>Tạo Phiên Kiểm Kê Mới</Button>
            </Stack>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Tên Phiên Kiểm Kê</TableCell>
                            <TableCell>Người tạo</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Hoàn thành lúc</TableCell>
                            <TableCell align="center">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {checks.map((c) => (
                            <TableRow key={c.checkId}>
                                <TableCell>#{c.checkId}</TableCell>
                                <TableCell>{c.name}</TableCell>
                                <TableCell>{c.createdBy}</TableCell>
                                <TableCell>
                                    <Chip label={c.status} color={c.status === 'InProgress' ? 'warning' : 'success'} size="small" />
                                </TableCell>
                                <TableCell>{c.completedAt ? new Date(c.completedAt).toLocaleString() : '-'}</TableCell>
                                <TableCell align="center">
                                    <Button size="small" sx={{ mr: 1 }} variant="outlined" onClick={() => handleOpenDetail(c.checkId)}>Xem Chi Tiết / Sửa</Button>
                                    {c.status === 'InProgress' && (
                                        <Button size="small" variant="contained" color="success" onClick={() => markComplete(c.checkId)}>Hoàn Tất</Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {checks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Chưa có phiên kiểm kê nào</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Tạo mới */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Tạo Phiên Kiểm Kê Mới</DialogTitle>
                <Formik
                    initialValues={{ name: '' }}
                    validationSchema={Yup.object().shape({
                        name: Yup.string()
                            .required('Vui lòng nhập tên phiên kiểm kê')
                            .min(3, 'Tên quá ngắn')
                            .max(100, 'Tên quá dài')
                    })}
                    onSubmit={handleCreateSubmit}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                        <form noValidate onSubmit={handleSubmit}>
                            <DialogContent dividers>
                                <TextField
                                    fullWidth
                                    name="name"
                                    label="Tên Phiên Kiểm Kê (Ví dụ: Kiểm kê kho tháng 10)"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.name && errors.name)}
                                    helperText={touched.name && errors.name}
                                    sx={{ mt: 1 }}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenCreate(false)} color="secondary" disabled={isSubmitting}>Huỷ bỏ</Button>
                                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>Khởi tạo</Button>
                            </DialogActions>
                        </form>
                    )}
                </Formik>
            </Dialog>

            {/* Dialog Chi tiết & Cập nhật số liệu */}
            <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    {selectedCheck ? `Chi Tiết Biên Bản: ${selectedCheck.name}` : 'Loading...'}
                </DialogTitle>
                <DialogContent dividers>
                    {selectedCheck && (
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #eee' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f1f3f4' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600' }}>Mã SKU</TableCell>
                                        <TableCell sx={{ fontWeight: '600' }}>Tên Sản phẩm</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: '600' }}>Hệ thống</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: '600' }}>Thực tế</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: '600' }}>Chênh lệch</TableCell>
                                        <TableCell sx={{ fontWeight: '600' }}>Ghi chú / Lý do</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: '600' }}>Lưu</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedCheck.details?.map(d => (
                                        <DetailRow 
                                            key={d.id} 
                                            detail={d} 
                                            status={selectedCheck.status}
                                            onSave={(actualQty, reason) => handleUpdateDetail(d.id, actualQty, reason)} 
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDetail(false)} color="inherit">Đóng bản xem</Button>
                    {selectedCheck?.status === 'InProgress' && (
                        <Button 
                            variant="contained" 
                            color="success" 
                            onClick={() => {
                                if(window.confirm('Bạn có chắc chắn muốn chốt số liệu kiểm kê này? Thao tác này không thể hoàn tác.')) {
                                    markComplete(selectedCheck.checkId);
                                }
                            }}
                        >
                            Hoàn Tất Phiên & Chốt Sổ
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// Sub-component cho mỗi row của CheckDetail để giữ state của ô input local
function DetailRow({ detail, status, onSave }) {
    const [actual, setActual] = useState(detail.actualQty);
    const [reason, setReason] = useState(detail.discrepancyReason || '');
    const isCompleted = status === 'Completed';
    const diff = actual - detail.systemQty;

    return (
        <TableRow hover sx={{ bgcolor: diff !== 0 ? (diff > 0 ? '#e8f5e9' : '#ffebee') : 'inherit' }}>
            <TableCell sx={{ fontFamily: 'monospace' }}>{detail.productSku}</TableCell>
            <TableCell>{detail.productName}</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{detail.systemQty}</TableCell>
            <TableCell align="center">
                <TextField 
                    size="small" 
                    type="number" 
                    variant="outlined"
                    value={actual} 
                    onChange={e => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 0) {
                            setActual(val);
                        } else if (e.target.value === '') {
                            setActual(0);
                        }
                    }}
                    error={actual < 0}
                    disabled={isCompleted}
                    sx={{ width: 80, '& .MuiInputBase-input': { textAlign: 'center', fontWeight: 'bold' } }}
                />
            </TableCell>
            <TableCell align="center">
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            fontWeight: 'bold', 
                            color: diff > 0 ? 'success.main' : diff < 0 ? 'error.main' : 'text.primary',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {diff > 0 ? `+${diff}` : diff}
                    </Typography>
                    {diff !== 0 && (
                        <Chip 
                            label={diff > 0 ? 'Thừa' : 'Thiếu'} 
                            size="extra-small" 
                            color={diff > 0 ? 'success' : 'error'} 
                            variant="filled"
                            sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold' }} 
                        />
                    )}
                </Stack>
            </TableCell>
            <TableCell>
                <TextField 
                    size="small" 
                    placeholder="Lý do lệch..."
                    variant="standard"
                    value={reason} 
                    onChange={e => setReason(e.target.value)}
                    disabled={isCompleted || diff === 0}
                    fullWidth
                />
            </TableCell>
            <TableCell align="center">
                <IconButton 
                    size="small" 
                    color="primary" 
                    disabled={isCompleted || (actual === detail.actualQty && reason === (detail.discrepancyReason || ''))}
                    onClick={() => onSave(actual, reason)}
                >
                    <Box sx={{ fontSize: '1.2rem' }}>💾</Box>
                </IconButton>
            </TableCell>
        </TableRow>
    );
}
