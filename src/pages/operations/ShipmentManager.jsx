import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormHelperText } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from 'utils/api';

export default function ShipmentManager() {
    const [shipments, setShipments] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);

    const fetchShipments = async () => {
        try {
            const res = await api.get('/Shipments');
            setShipments(res.data);
            
            const transRes = await api.get('/InventoryTransactions');
            const outbound = transRes.data.filter(t => t.type === 'OUTBOUND');
            setTransactions(outbound);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, []);

    const markHandover = async (id) => {
        try {
            await api.put(`/Shipments/${id}/handover`);
            fetchShipments();
        } catch(err) {
            alert('Lỗi cập nhật');
        }
    };

    const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await api.post('/Shipments', values);
            setOpenDialog(false);
            resetForm();
            fetchShipments();
        } catch(err) {
            alert('Lỗi tạo đơn: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h4" color="primary">Quản lý Bàn giao vận chuyển</Typography>
                <Button variant="contained" onClick={() => setOpenDialog(true)}>Tạo đơn bàn giao mới</Button>
            </Stack>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f1f1f1' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Kiện hàng</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Phiếu Xuất</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Đơn vị vận chuyển</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Thông tin Người nhận</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shipments.map((s) => (
                            <TableRow key={s.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2" color="primary">#{s.id}</Typography>
                                    <Typography variant="caption" color="textSecondary">{s.trackingNumber || 'Chưa có vận đơn'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Button size="small" variant="text" sx={{ textTransform: 'none' }}>
                                        Trans-#{s.transactionId}
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{s.carrierName}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {s.driverName || 'N/A'} • {s.driverPhone || 'No phone'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{s.recipientName || 'N/A'}</Typography>
                                    <Typography variant="caption" display="block" sx={{ color: 'text.secondary', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {s.deliveryAddress}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={s.status === 'Pending' ? 'Đang chờ giao' : 'Đã bàn giao'} 
                                        color={s.status === 'Pending' ? 'warning' : 'success'} 
                                        size="small" 
                                        variant={s.status === 'Pending' ? 'outlined' : 'filled'}
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                    {s.handoverTime && (
                                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                            {new Date(s.handoverTime).toLocaleTimeString()}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    {s.status === 'Pending' && (
                                        <Button 
                                            size="small" 
                                            variant="contained" 
                                            color="primary" 
                                            onClick={() => {
                                                if(window.confirm('Xác nhận đã bàn giao hàng cho đơn vị vận chuyển?')) {
                                                    markHandover(s.id);
                                                }
                                            }}
                                            sx={{ borderRadius: 20 }}
                                        >
                                            Xác nhận Giao
                                        </Button>
                                    )}
                                    {s.status === 'Shipped' && (
                                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>✓ Hoàn tất</Typography>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {shipments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="textSecondary">Chưa có giao dịch vận chuyển nào</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>Tạo Đơn Bàn Giao Vận Chuyển</DialogTitle>
                <Formik
                    initialValues={{
                        transactionId: '',
                        carrierName: '',
                        trackingNumber: '',
                        driverName: '',
                        driverPhone: '',
                        recipientName: '',
                        deliveryAddress: ''
                    }}
                    validationSchema={Yup.object().shape({
                        transactionId: Yup.number().required('Vui lòng chọn phiếu xuất kho'),
                        carrierName: Yup.string().max(100, 'Tên quá dài').required('Vui lòng nhập tên nhà vận chuyển'),
                        trackingNumber: Yup.string().max(50, 'Mã vận đơn quá dài'),
                        driverPhone: Yup.string()
                            .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải là 10-11 chữ số')
                            .nullable(),
                        recipientName: Yup.string().required('Vui lòng nhập tên người nhận'),
                        recipientPhone: Yup.string()
                            .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải là 10-11 chữ số')
                            .required('Vui lòng nhập số điện thoại người nhận'),
                        deliveryAddress: Yup.string().min(10, 'Địa chỉ quá ngắn').required('Vui lòng nhập địa chỉ giao hàng')
                    })}
                    onSubmit={handleFormSubmit}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                        <form noValidate onSubmit={handleSubmit}>
                            <DialogContent dividers>
                                <Stack spacing={2} sx={{ mt: 1 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        name="transactionId"
                                        label="Chọn Phiếu Xuất Kho (OUTBOUND)"
                                        value={values.transactionId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={Boolean(touched.transactionId && errors.transactionId)}
                                        helperText={touched.transactionId && errors.transactionId}
                                    >
                                        <MenuItem value=""><em>-- Chọn phiếu xuất --</em></MenuItem>
                                        {transactions.map((t) => (
                                            <MenuItem key={t.transactionId} value={t.transactionId}>
                                                Trans #{t.transactionId} - {new Date(t.createdAt).toLocaleString()}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Thông tin vận đơn</Typography>
                                        <Stack spacing={2} mt={1}>
                                            <TextField
                                                fullWidth
                                                name="carrierName"
                                                label="Nhà vận chuyển (GHN, Viettel Post...)"
                                                value={values.carrierName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={Boolean(touched.carrierName && errors.carrierName)}
                                            />
                                            <TextField
                                                fullWidth
                                                name="trackingNumber"
                                                label="Mã Vận Liên (Tracking ID)"
                                                value={values.trackingNumber}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                        </Stack>
                                    </Box>

                                    <Box sx={{ p: 2, bgcolor: '#f0f4f8', borderRadius: 1 }}>
                                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Người nhận & Địa chỉ</Typography>
                                        <Stack spacing={2} mt={1}>
                                            <TextField
                                                fullWidth
                                                name="recipientName"
                                                label="Tên người nhận"
                                                size="small"
                                                value={values.recipientName}
                                                onChange={handleChange}
                                            />
                                            <TextField
                                                fullWidth
                                                name="deliveryAddress"
                                                label="Địa chỉ giao hàng"
                                                multiline
                                                rows={2}
                                                size="small"
                                                value={values.deliveryAddress}
                                                onChange={handleChange}
                                            />
                                        </Stack>
                                    </Box>
                                </Stack>
                            </DialogContent>
                            <DialogActions sx={{ px: 3, py: 2 }}>
                                <Button onClick={() => setOpenDialog(false)} color="inherit">Bỏ qua</Button>
                                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                                    Xác nhận và In nhãn
                                </Button>
                            </DialogActions>
                        </form>
                    )}
                </Formik>
            </Dialog>
        </Box>
    );
}
