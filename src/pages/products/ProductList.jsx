import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, CircularProgress,
    Button, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Stack, Alert, FormHelperText, CardMedia, Grid
} from '@mui/material';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import api from 'utils/api';
import * as Yup from 'yup';
import { Formik } from 'formik';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL ? import.meta.env.VITE_APP_API_URL.replace('/api', '') : 'https://localhost:7173';
const API_URL = '';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const fileInputRef = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes, brandRes] = await Promise.all([
                api.get(`${API_URL}/Products`),
                api.get(`${API_URL}/Categories`),
                api.get(`${API_URL}/Brands`)
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setBrands(brandRes.data);
            setError('');
        } catch (err) {
            setError('Không thể kết nối đến Server!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenDialog = (product = null) => {
        setSelectedProduct(product);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProduct(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
        try {
            await api.delete(`${API_URL}/Products/${id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa sản phẩm!');
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

    const formatVND = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    const validationSchema = Yup.object().shape({
        sku: Yup.string()
            .max(50, 'Mã SKU tối đa 50 ký tự')
            .matches(/^\S*$/, 'Mã SKU không được chứa khoảng trắng')
            .required('Mã SKU là bắt buộc'),
        name: Yup.string().max(200, 'Tên sản phẩm tối đa 200 ký tự').required('Tên sản phẩm là bắt buộc'),
        categoryId: Yup.number().required('Vui lòng chọn danh mục'),
        brandId: Yup.number().required('Vui lòng chọn thương hiệu'),
        costPrice: Yup.number().min(0, 'Giá nhập không thể âm').required('Giá nhập là bắt buộc'),
        sellingPrice: Yup.number().min(0, 'Giá bán không thể âm').required('Giá bán là bắt buộc'),
        promotionalPrice: Yup.number().min(0, 'Giá KM không thể âm').nullable(),
        warrantyMonths: Yup.number().min(0, 'Bảo hành tối thiểu 0 tháng').required('Thời hạn bảo hành là bắt buộc'),
        imageUrl: Yup.string().nullable()
    });

    const getFullUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/60';
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" color="primary">DANH MỤC SẢN PHẨM</Typography>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => handleOpenDialog()}>
                    Thêm Sản phẩm
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#f0f2f5' }}>
                        <TableRow>
                            <TableCell width="5%"><strong>Hỉnh ảnh</strong></TableCell>
                            <TableCell width="12%"><strong>Mã SKU</strong></TableCell>
                            <TableCell width="28%"><strong>Tên Sản phẩm</strong></TableCell>
                            <TableCell width="12%"><strong>Giá Bán</strong></TableCell>
                            <TableCell width="10%"><strong>Bảo hành</strong></TableCell>
                            <TableCell width="12%"><strong>Thương hiệu</strong></TableCell>
                            <TableCell width="10%"><strong>Danh mục</strong></TableCell>
                            <TableCell width="11%" align="center"><strong>Hành động</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                    Chưa có sản phẩm nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((row) => (
                                <TableRow key={row.productId} hover>
                                    <TableCell>
                                        <img
                                            src={getFullUrl(row.imageUrl)}
                                            alt={row.name}
                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=No+Image'; }}
                                        />
                                    </TableCell>
                                    <TableCell><Chip label={row.sku} size="small" variant="outlined" color="secondary" /></TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>{formatVND(row.sellingPrice)}</Typography>
                                        {row.promotionalPrice && (
                                            <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                                {formatVND(row.promotionalPrice)}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{row.warrantyMonths} tháng</TableCell>
                                    <TableCell>{row.brand ? row.brand.brandName : 'N/A'}</TableCell>
                                    <TableCell><Chip label={row.category ? row.category.categoryName : 'N/A'} size="small" color="info" /></TableCell>
                                    <TableCell align="center">
                                        <IconButton color="primary" onClick={() => handleOpenDialog(row)}><EditOutlined /></IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(row.productId)}><DeleteOutlined /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <Formik
                    initialValues={{
                        sku: selectedProduct?.sku || '',
                        name: selectedProduct?.name || '',
                        imageUrl: selectedProduct?.imageUrl || '',
                        costPrice: selectedProduct?.costPrice || 0,
                        sellingPrice: selectedProduct?.sellingPrice || 0,
                        promotionalPrice: selectedProduct?.promotionalPrice || '',
                        warrantyMonths: selectedProduct?.warrantyMonths || 12,
                        categoryId: selectedProduct?.categoryId || '',
                        brandId: selectedProduct?.brandId || '',
                        submit: null
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            const payload = {
                                sku: values.sku,
                                name: values.name,
                                imageUrl: values.imageUrl,
                                costPrice: Number(values.costPrice),
                                sellingPrice: Number(values.sellingPrice),
                                promotionalPrice: values.promotionalPrice ? Number(values.promotionalPrice) : null,
                                warrantyMonths: Number(values.warrantyMonths),
                                categoryId: values.categoryId,
                                brandId: values.brandId
                            };
                            if (selectedProduct) {
                                await api.put(`${API_URL}/Products/${selectedProduct.productId}`, {
                                    productId: selectedProduct.productId,
                                    ...payload
                                });
                            } else {
                                await api.post(`${API_URL}/Products`, payload);
                            }
                            setStatus({ success: true });
                            setSubmitting(false);
                            fetchData();
                            handleCloseDialog();
                        } catch (err) {
                            setStatus({ success: false });
                            setErrors({ submit: err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm!' });
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue, setFieldTouched }) => (
                        <form noValidate onSubmit={handleSubmit}>
                            <DialogTitle>{selectedProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
                            <DialogContent>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Mã SKU"
                                            name="sku"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.sku}
                                            disabled={!!selectedProduct}
                                            error={Boolean(touched.sku && errors.sku)}
                                            helperText={touched.sku && errors.sku}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Tên sản phẩm"
                                            name="name"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.name}
                                            error={Boolean(touched.name && errors.name)}
                                            helperText={touched.name && errors.name}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Giá nhập (Cost)"
                                            name="costPrice"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.costPrice}
                                            error={Boolean(touched.costPrice && errors.costPrice)}
                                            helperText={touched.costPrice && errors.costPrice}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Giá bán (Sell)"
                                            name="sellingPrice"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.sellingPrice}
                                            error={Boolean(touched.sellingPrice && errors.sellingPrice)}
                                            helperText={touched.sellingPrice && errors.sellingPrice}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Giá khuyến mãi"
                                            name="promotionalPrice"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.promotionalPrice}
                                            error={Boolean(touched.promotionalPrice && errors.promotionalPrice)}
                                            helperText={touched.promotionalPrice && errors.promotionalPrice}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Bảo hành (tháng)"
                                            name="warrantyMonths"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.warrantyMonths}
                                            error={Boolean(touched.warrantyMonths && errors.warrantyMonths)}
                                            helperText={touched.warrantyMonths && errors.warrantyMonths}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Danh mục"
                                            name="categoryId"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.categoryId}
                                            error={Boolean(touched.categoryId && errors.categoryId)}
                                            helperText={touched.categoryId && errors.categoryId}
                                        >
                                            {categories.map((cat) => (
                                                <MenuItem key={cat.categoryId} value={cat.categoryId}>
                                                    {cat.categoryName}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Thương hiệu"
                                            name="brandId"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.brandId}
                                            error={Boolean(touched.brandId && errors.brandId)}
                                            helperText={touched.brandId && errors.brandId}
                                        >
                                            {brands.map((brand) => (
                                                <MenuItem key={brand.brandId} value={brand.brandId}>
                                                    {brand.brandName}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={12}>
                                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
                                            <Typography variant="subtitle2" gutterBottom>Hình ảnh sản phẩm</Typography>
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
                                    </Grid>
                                    {errors.submit && (
                                        <Grid size={12}>
                                            <Alert severity="error">{errors.submit}</Alert>
                                        </Grid>
                                    )}
                                </Grid>
                            </DialogContent>
                            <DialogActions sx={{ p: 3 }}>
                                <Button onClick={handleCloseDialog} color="secondary">Hủy</Button>
                                <Button type="submit" variant="contained" disabled={isSubmitting} size="large">
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm lại'}
                                </Button>
                            </DialogActions>
                        </form>
                    )}
                </Formik>
            </Dialog>
        </Box>
    );
}
