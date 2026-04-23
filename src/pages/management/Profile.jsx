import React, { useState, useRef } from 'react';
import {
    Box, Typography, Grid, Paper, Stack, Avatar, 
    Divider, Chip, Card, CardContent, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Alert, CircularProgress, MenuItem,
    IconButton
} from '@mui/material';
import { useAuth } from 'contexts/AuthContext';
import { 
    UserOutlined, MailOutlined, PhoneOutlined, 
    HomeOutlined, SafetyOutlined, EditOutlined,
    CameraOutlined, CalendarOutlined, WomanOutlined, 
    ManOutlined, GlobalOutlined
} from '@ant-design/icons';
import avatar1 from 'assets/images/users/avatar-1.png';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from 'utils/api';

export default function Profile() {
    const { user, login } = useAuth();
    const [openEdit, setOpenEdit] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const getAvatarUrl = (avatarPath) => {
        const path = avatarPath || user?.avatar;
        if (path) {
            if (path.startsWith('http')) return path;
            return `https://localhost:7173${path}`;
        }
        return avatar1;
    };

    const handleAvatarUpload = async (event, setFieldValue) => {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            setUploading(true);
            const response = await api.post('/Upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data?.imageUrl) setFieldValue('avatar', response.data.imageUrl);
        } catch (err) {
            alert('Lỗi khi tải ảnh lên: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    const validationSchema = Yup.object().shape({
        fullName: Yup.string().max(100, 'Họ tên tối đa 100 ký tự').required('Họ tên là bắt buộc'),
        email: Yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
        phoneNumber: Yup.string().max(20, 'Số điện thoại tối đa 20 ký tự').nullable(),
        address: Yup.string().max(255, 'Địa chỉ tối đa 255 ký tự').nullable()
    });

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Header Section */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>Hồ Sơ Cá Nhân</Typography>
                    <Typography variant="body2" color="textSecondary">Quản lý và cập nhật thông tin tài khoản của bạn</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<EditOutlined />} 
                    onClick={() => { setOpenEdit(true); setMessage({ type: '', content: '' }); }}
                    sx={{ borderRadius: 2, boxShadow: 3 }}
                >
                    Chỉnh sửa hồ sơ
                </Button>
            </Stack>
            
            {message.content && <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>{message.content}</Alert>}

            <Grid container spacing={4}>
                {/* Profile Summary Card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, bgcolor: 'primary.lighter', zIndex: 0 }} />
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Avatar 
                                src={getAvatarUrl()} 
                                sx={{ width: 140, height: 140, mx: 'auto', mb: 2, border: '6px solid #fff', boxShadow: 2 }} 
                            />
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>{user?.fullName || 'N/A'}</Typography>
                            <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>@{user?.username}</Typography>
                            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
                                <Chip label={user?.role} color="primary" size="small" variant="combined" sx={{ fontWeight: 600 }} />
                                <Chip label="Hoạt động" color="success" size="small" variant="outlined" />
                            </Stack>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>THÔNG TIN NHANH</Typography>
                            <Stack spacing={1.5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <MailOutlined style={{ color: '#8c8c8c' }} />
                                    <Typography variant="body2">{user?.email || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <PhoneOutlined style={{ color: '#8c8c8c' }} />
                                    <Typography variant="body2">{user?.phoneNumber || '-'}</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>

                {/* Detailed Info Section */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h5" sx={{ mb: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <UserOutlined /> Chi tiết tài khoản
                            </Typography>
                            
                            <Grid container spacing={4}>
                                {[
                                    { icon: <UserOutlined />, label: 'Họ và tên', value: user?.fullName, color: '#1890ff', bg: '#e6f7ff' },
                                    { icon: <MailOutlined />, label: 'Địa chỉ Email', value: user?.email, color: '#52c41a', bg: '#f6ffed' },
                                    { icon: <PhoneOutlined />, label: 'Số điện thoại', value: user?.phoneNumber, color: '#fa8c16', bg: '#fff7e6' },
                                    { icon: <HomeOutlined />, label: 'Địa chỉ liên hệ', value: user?.address, color: '#722ed1', bg: '#f9f0ff' },
                                    { icon: <CalendarOutlined />, label: 'Ngày sinh', value: user?.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : '-', color: '#ff4d4f', bg: '#fff1f0' },
                                    { icon: <GlobalOutlined />, label: 'Giới tính', value: user?.gender, color: '#13c2c2', bg: '#e6fffb' }
                                ].map((item, index) => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: item.bg, color: item.color, width: 48, height: 48 }}>{item.icon}</Avatar>
                                            <Box>
                                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                    {item.label}
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{item.value || '-'}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Premium Dialog Chỉnh sửa */}
            <Dialog 
                open={openEdit} 
                onClose={() => setOpenEdit(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <Formik
                    initialValues={{
                        fullName: user?.fullName || '',
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        email: user?.email || '',
                        phoneNumber: user?.phoneNumber || '',
                        address: user?.address || '',
                        gender: user?.gender || '',
                        birthday: user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
                        avatar: user?.avatar || '',
                        submit: null
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            const updatedUser = { 
                                ...user, 
                                ...values, 
                                birthday: values.birthday && values.birthday !== '' ? values.birthday : null 
                            };
                            
                            const response = await api.put(`/Users/${user.userId}`, updatedUser);
                            if (response.status === 200) {
                                login(updatedUser);
                                setMessage({ type: 'success', content: 'Đã cập nhật thông tin thành công!' });
                                setOpenEdit(false);
                            }
                        } catch (err) {
                            setMessage({ type: 'error', content: err.response?.data?.message || 'Lỗi khi cập nhật!' });
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
                        <form noValidate onSubmit={handleSubmit}>
                            <DialogTitle sx={{ pb: 0 }} component="div">
                                <Typography variant="h4" sx={{ fontWeight: 700 }} component="div">Chỉnh sửa hồ sơ</Typography>
                                <Typography variant="caption" color="textSecondary" component="div">Cập nhật thông tin công khai và liên hệ của bạn</Typography>
                            </DialogTitle>
                            
                            <DialogContent sx={{ mt: 2 }}>
                                <Grid container spacing={3}>
                                    {/* Left Side: Avatar Section */}
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa', height: '100%' }}>
                                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                                <Avatar src={getAvatarUrl(values.avatar)} sx={{ width: 120, height: 120, border: '4px solid #fff', boxShadow: 2 }} />
                                                {uploading && <CircularProgress size={120} sx={{ position: 'absolute', top: 0, left: 0 }} />}
                                                <IconButton 
                                                    onClick={() => fileInputRef.current.click()}
                                                    sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}
                                                >
                                                    <CameraOutlined />
                                                </IconButton>
                                            </Box>
                                            <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={(e) => handleAvatarUpload(e, setFieldValue)} />
                                            <Typography variant="caption" display="block" color="textSecondary">Hỗ trợ JPG, PNG. Tối đa 2MB.</Typography>
                                        </Paper>
                                    </Grid>

                                    {/* Right Side: Fields Section */}
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField fullWidth label="Họ" name="firstName" onBlur={handleBlur} onChange={handleChange} value={values.firstName} />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField fullWidth label="Tên" name="lastName" onBlur={handleBlur} onChange={handleChange} value={values.lastName} />
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Họ và tên hiển thị" 
                                                    name="fullName" 
                                                    onBlur={handleBlur} 
                                                    onChange={handleChange} 
                                                    value={values.fullName}
                                                    error={Boolean(touched.fullName && errors.fullName)}
                                                    helperText={touched.fullName && errors.fullName}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Email" 
                                                    name="email" 
                                                    onBlur={handleBlur} 
                                                    onChange={handleChange} 
                                                    value={values.email}
                                                    error={Boolean(touched.email && errors.email)}
                                                    helperText={touched.email && errors.email}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField fullWidth label="Số điện thoại" name="phoneNumber" onBlur={handleBlur} onChange={handleChange} value={values.phoneNumber} />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField fullWidth select label="Giới tính" name="gender" onBlur={handleBlur} onChange={handleChange} value={values.gender}>
                                                    <MenuItem value="Nam">Nam</MenuItem>
                                                    <MenuItem value="Nữ">Nữ</MenuItem>
                                                    <MenuItem value="Khác">Khác</MenuItem>
                                                </TextField>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Ngày sinh" 
                                                    name="birthday" 
                                                    type="date" 
                                                    InputLabelProps={{ shrink: true }} 
                                                    onBlur={handleBlur} 
                                                    onChange={handleChange} 
                                                    value={values.birthday} 
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField fullWidth label="Địa chỉ" name="address" multiline rows={2} onBlur={handleBlur} onChange={handleChange} value={values.address} />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            
                            <DialogActions sx={{ p: 3, pt: 1 }}>
                                <Button onClick={() => setOpenEdit(false)} color="secondary" sx={{ fontWeight: 600 }}>Hủy</Button>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    disabled={isSubmitting || uploading}
                                    sx={{ minWidth: 120, borderRadius: 2, fontWeight: 600 }}
                                >
                                    {isSubmitting ? <CircularProgress size={24} /> : 'Lưu Thay Đổi'}
                                </Button>
                            </DialogActions>
                        </form>
                    )}
                </Formik>
            </Dialog>
        </Box>
    );
}
