import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Alert, CircularProgress, Stack, FormHelperText, CardMedia
} from '@mui/material';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import api from 'utils/api';
import * as Yup from 'yup';
import { Formik } from 'formik';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL ? import.meta.env.VITE_APP_API_URL.replace('/api', '') : 'https://localhost:7173';
const API_URL = '';

export default function BrandList() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const fileInputRef = useRef(null);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const res = await api.get(`${API_URL}/Brands`);
            setBrands(res.data);
            setError('');
        } catch (err) {
            setError('Không thể lấy danh sách thương hiệu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleOpenDialog = (brand = null) => {
        setSelectedBrand(brand);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedBrand(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) return;
        try {
            await api.delete(`${API_URL}/Brands/${id}`);
            fetchBrands();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa thương hiệu!');
        }
    };

    const handleFileUpload = async (event, setFieldValue, setFieldTouched) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post(`${API_URL}/Upload/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFieldValue('imageUrl', response.data.imageUrl);
            setFieldTouched('imageUrl', true);
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi tải ảnh lên!');
        }
    };

    const validationSchema = Yup.object().shape({
        brandName: Yup.string().max(100, 'Tên thương hiệu tối đa 100 ký tự').required('Tên thương hiệu là bắt buộc'),
        origin: Yup.string().max(100, 'Xuất xứ tối đa 100 ký tự').nullable(),
        imageUrl: Yup.string().nullable()
    });

    const getFullUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/50';
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" color="primary">QUẢN LÝ THƯƠNG HIỆU</Typography>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => handleOpenDialog()}>
                    Thêm thương hiệu
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Ảnh</strong></TableCell>
                            <TableCell><strong>Tên thương hiệu</strong></TableCell>
                            <TableCell><strong>Xuất xứ</strong></TableCell>
                            <TableCell align="center"><strong>Hành động</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : brands.length === 0 ? (
                            <TableRow><TableCell colSpan={4} align="center">Không có dữ liệu</TableCell></TableRow>
                        ) : (
                            brands.map((row) => (
                                <TableRow key={row.brandId} hover>
                                    <TableCell>
                                        <img src={getFullUrl(row.imageUrl)} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{row.brandName}</TableCell>
                                    <TableCell>{row.origin}</TableCell>
                                    <TableCell align="center">
                                        <IconButton color="primary" onClick={() => handleOpenDialog(row)}><EditOutlined /></IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(row.brandId)}><DeleteOutlined /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
                <Formik
                    initialValues={{
                        brandName: selectedBrand?.brandName || '',
                        origin: selectedBrand?.origin || '',
                        imageUrl: selectedBrand?.imageUrl || '',
                        submit: null
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            const payload = {
                                brandName: values.brandName,
                                origin: values.origin,
                                imageUrl: values.imageUrl
                            };
                            if (selectedBrand) {
                                await api.put(`${API_URL}/Brands/${selectedBrand.brandId}`, {
                                    brandId: selectedBrand.brandId,
                                    ...payload
                                });
                            } else {
                                await api.post(`${API_URL}/Brands`, payload);
                            }
                            setStatus({ success: true });
                            setSubmitting(false);
                            fetchBrands();
                            handleCloseDialog();
                        } catch (err) {
                            setStatus({ success: false });
                            setErrors({ submit: err.response?.data?.message || 'Có lỗi xảy ra!' });
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue, setFieldTouched }) => (
                        <form noValidate onSubmit={handleSubmit}>
                            <DialogTitle>{selectedBrand ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu mới'}</DialogTitle>
                            <DialogContent>
                                <Stack spacing={2} sx={{ mt: 1 }}>
                                    <Box>
                                        <TextField
                                            fullWidth
                                            label="Tên thương hiệu"
                                            name="brandName"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.brandName}
                                            error={Boolean(touched.brandName && errors.brandName)}
                                        />
                                        {touched.brandName && errors.brandName && (
                                            <FormHelperText error>{errors.brandName}</FormHelperText>
                                        )}
                                    </Box>
                                    <Box>
                                        <TextField
                                            fullWidth
                                            label="Xuất xứ"
                                            name="origin"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.origin}
                                            error={Boolean(touched.origin && errors.origin)}
                                        />
                                        {touched.origin && errors.origin && (
                                            <FormHelperText error>{errors.origin}</FormHelperText>
                                        )}
                                    </Box>
                                    
                                    <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
                                        <Typography variant="subtitle2" gutterBottom>Logo thương hiệu</Typography>
                                        {values.imageUrl && (
                                            <CardMedia
                                                component="img"
                                                image={getFullUrl(values.imageUrl)}
                                                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, borderRadius: 1, objectFit: 'cover' }}
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            ref={fileInputRef}
                                            onChange={(e) => handleFileUpload(e, setFieldValue, setFieldTouched)}
                                        />
                                        <Button 
                                            variant="outlined" 
                                            startIcon={<UploadOutlined />} 
                                            size="small" 
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            {values.imageUrl ? 'Thay đổi logo' : 'Chọn ảnh'}
                                        </Button>
                                    </Box>

                                    {errors.submit && (
                                        <Box>
                                            <FormHelperText error>{errors.submit}</FormHelperText>
                                        </Box>
                                    )}
                                </Stack>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDialog} color="secondary">Hủy</Button>
                                <Button type="submit" variant="contained" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
                                </Button>
                            </DialogActions>
                        </form>
                    )}
                </Formik>
            </Dialog>
        </Box>
    );
}
