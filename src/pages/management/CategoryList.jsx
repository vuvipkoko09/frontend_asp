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

export default function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const fileInputRef = useRef(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get(`${API_URL}/Categories`);
            setCategories(res.data);
            setError('');
        } catch (err) {
            setError('Không thể lấy danh sách danh mục!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenDialog = (category = null) => {
        setSelectedCategory(category);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCategory(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
        try {
            await api.delete(`${API_URL}/Categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa danh mục!');
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
        categoryName: Yup.string().max(100, 'Tên danh mục tối đa 100 ký tự').required('Tên danh mục là bắt buộc'),
        description: Yup.string().max(500, 'Mô tả tối đa 500 ký tự').nullable(),
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
                <Typography variant="h4" color="primary">QUẢN LÝ DANH MỤC</Typography>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => handleOpenDialog()}>
                    Thêm danh mục
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Ảnh</strong></TableCell>
                            <TableCell><strong>Tên danh mục</strong></TableCell>
                            <TableCell><strong>Mô tả</strong></TableCell>
                            <TableCell align="center"><strong>Hành động</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow><TableCell colSpan={4} align="center">Không có dữ liệu</TableCell></TableRow>
                        ) : (
                            categories.map((row) => (
                                <TableRow key={row.categoryId} hover>
                                    <TableCell>
                                        <img src={getFullUrl(row.imageUrl)} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{row.categoryName}</TableCell>
                                    <TableCell>{row.description}</TableCell>
                                    <TableCell align="center">
                                        <IconButton color="primary" onClick={() => handleOpenDialog(row)}><EditOutlined /></IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(row.categoryId)}><DeleteOutlined /></IconButton>
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
                        categoryName: selectedCategory?.categoryName || '',
                        description: selectedCategory?.description || '',
                        imageUrl: selectedCategory?.imageUrl || '',
                        submit: null
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            const payload = {
                                categoryName: values.categoryName,
                                description: values.description,
                                imageUrl: values.imageUrl
                            };
                            if (selectedCategory) {
                                await api.put(`${API_URL}/Categories/${selectedCategory.categoryId}`, {
                                    categoryId: selectedCategory.categoryId,
                                    ...payload
                                });
                            } else {
                                await api.post(`${API_URL}/Categories`, payload);
                            }
                            setStatus({ success: true });
                            setSubmitting(false);
                            fetchCategories();
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
                            <DialogTitle>{selectedCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</DialogTitle>
                            <DialogContent>
                                <Stack spacing={2} sx={{ mt: 1 }}>
                                    <Box>
                                        <TextField
                                            fullWidth
                                            label="Tên danh mục"
                                            name="categoryName"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.categoryName}
                                            error={Boolean(touched.categoryName && errors.categoryName)}
                                        />
                                        {touched.categoryName && errors.categoryName && (
                                            <FormHelperText error>{errors.categoryName}</FormHelperText>
                                        )}
                                    </Box>
                                    <Box>
                                        <TextField
                                            fullWidth
                                            label="Mô tả"
                                            name="description"
                                            multiline
                                            rows={3}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.description}
                                            error={Boolean(touched.description && errors.description)}
                                        />
                                        {touched.description && errors.description && (
                                            <FormHelperText error>{errors.description}</FormHelperText>
                                        )}
                                    </Box>
                                    
                                    <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
                                        <Typography variant="subtitle2" gutterBottom>Hình ảnh danh mục</Typography>
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
                                            {values.imageUrl ? 'Thay đổi ảnh' : 'Chọn ảnh'}
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
