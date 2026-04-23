import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormHelperText } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from 'utils/api';

export default function DamageReports() {
    const [reports, setReports] = useState([]);
    const [products, setProducts] = useState([]);
    const [availableSerials, setAvailableSerials] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);

    const fetchReports = async () => {
        try {
            const res = await api.get('/DamageReports');
            setReports(res.data);
            const prodRes = await api.get('/Products');
            setProducts(prodRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSerials = async (productId) => {
        if (!productId) {
            setAvailableSerials([]);
            return;
        }
        try {
            const res = await api.get(`/SerialNumbers/product/${productId}`);
            setAvailableSerials(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/DamageReports/${id}/status`, { status });
            fetchReports();
        } catch(err) {
            alert('Lỗi cập nhật');
        }
    };

    const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await api.post('/DamageReports', values);
            setOpenDialog(false);
            resetForm();
            setAvailableSerials([]);
            fetchReports();
        } catch(err) {
            alert('Lỗi thêm báo cáo: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h4" color="primary">Quản lý Hàng Lỗi / Cần Xử Lý</Typography>
                <Button variant="contained" onClick={() => setOpenDialog(true)}>Lập Biên Bản Mới</Button>
            </Stack>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Sản phẩm</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>IMEI / SKU</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nội dung lỗi</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Người lập</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reports.map((r) => (
                            <TableRow key={r.id} hover>
                                <TableCell>#{r.id}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.productName}</Typography>
                                </TableCell>
                                <TableCell>
                                    {r.imei ? (
                                        <Chip 
                                            label={r.imei} 
                                            size="small" 
                                            variant="outlined" 
                                            color="secondary" 
                                            sx={{ fontFamily: 'monospace', fontWeight: 'bold' }} 
                                        />
                                    ) : (
                                        <Typography variant="caption" color="textSecondary">{r.productSku}</Typography>
                                    )}
                                </TableCell>
                                <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {r.note}
                                </TableCell>
                                <TableCell>{r.reporterName}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={r.status} 
                                        color={r.status === 'Pending' ? 'warning' : r.status === 'Approved' ? 'success' : 'error'} 
                                        size="small" 
                                        sx={{ fontWeight: 'bold', minWidth: 80 }}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    {r.status === 'Pending' && (
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Button size="small" variant="contained" color="success" onClick={() => updateStatus(r.id, 'Approved')}>Duyệt</Button>
                                            <Button size="small" variant="outlined" color="error" onClick={() => updateStatus(r.id, 'Rejected')}>Từ chối</Button>
                                        </Stack>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {reports.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <Typography color="textSecondary">Chưa có biên bản nào</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>Lập Biên Bản Hàng Lỗi Mới</DialogTitle>
                <Formik
                    initialValues={{
                        productId: '',
                        quantity: 1,
                        serialNumberId: '',
                        note: ''
                    }}
                    validationSchema={Yup.object().shape({
                        productId: Yup.number().required('Vui lòng chọn sản phẩm'),
                        quantity: Yup.number()
                            .min(1, 'Số lượng lỗi tối thiểu là 1')
                            .max(1000, 'Số lượng lỗi tối đa là 1000')
                            .required('Vui lòng nhập số lượng'),
                        note: Yup.string()
                            .min(10, 'Mô tả lỗi phải có ít nhất 10 ký tự để bộ phận kỹ thuật nắm bắt')
                            .required('Vui lòng nhập nguyên nhân/mô tả lỗi')
                    })}
                    onSubmit={handleFormSubmit}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
                        <form noValidate onSubmit={handleSubmit}>
                            <DialogContent dividers>
                                <Stack spacing={2} sx={{ mt: 1 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        name="productId"
                                        label="Chọn Sản phẩm"
                                        value={values.productId}
                                        onChange={(e) => {
                                            handleChange(e);
                                            fetchSerials(e.target.value);
                                            setFieldValue('serialNumberId', '');
                                        }}
                                        onBlur={handleBlur}
                                        error={Boolean(touched.productId && errors.productId)}
                                        helperText={touched.productId && errors.productId}
                                    >
                                        <MenuItem value=""><em>-- Chọn sản phẩm --</em></MenuItem>
                                        {products.map((p) => (
                                            <MenuItem key={p.productId} value={p.productId}>
                                                {p.sku} - {p.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        select
                                        fullWidth
                                        name="serialNumberId"
                                        label="Chọn máy bị lỗi (IMEI)"
                                        disabled={!values.productId || availableSerials.length === 0}
                                        value={values.serialNumberId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        helperText={!values.productId ? 'Vui lòng chọn sản phẩm trước' : availableSerials.length === 0 ? 'Không có máy nào trong kho' : 'Chọn IMEI cụ thể nếu có'}
                                    >
                                        <MenuItem value=""><em>-- Không có IMEI / Hàng linh kiện --</em></MenuItem>
                                        {availableSerials.map((s) => (
                                            <MenuItem key={s.serialId} value={s.serialId}>
                                                {s.imeiCode} ({s.warehouseLocation || 'No location'})
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        fullWidth
                                        type="number"
                                        name="quantity"
                                        label="Số lượng lỗi"
                                        disabled={Boolean(values.serialNumberId)}
                                        value={values.serialNumberId ? 1 : values.quantity}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={Boolean(touched.quantity && errors.quantity)}
                                        helperText={touched.quantity && errors.quantity}
                                    />
                                    
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        name="note"
                                        label="Mô tả nguyên nhân / Tình trạng lỗi"
                                        placeholder="Ví dụ: Bể màn hình, nguồn không lên, thiếu phụ kiện..."
                                        value={values.note}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={Boolean(touched.note && errors.note)}
                                        helperText={touched.note && errors.note}
                                    />
                                </Stack>
                            </DialogContent>
                            <DialogActions sx={{ p: 2 }}>
                                <Button onClick={() => setOpenDialog(false)} color="secondary" disabled={isSubmitting}>Huỷ bỏ</Button>
                                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>Khởi tạo Biên bản</Button>
                            </DialogActions>
                        </form>
                    )}
                </Formik>
            </Dialog>
        </Box>
    );
}
