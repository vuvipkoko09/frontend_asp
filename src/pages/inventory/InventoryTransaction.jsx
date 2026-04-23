import React, { useState, useEffect } from 'react';
import {
    Grid, Typography, TextField, Button, Box, Chip,
    FormControl, InputLabel, Select, MenuItem, RadioGroup,
    FormControlLabel, Radio, Alert, Paper, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, Stack
} from '@mui/material';
import { PlusOutlined } from '@ant-design/icons'; // Dùng icon của Mantis
import api from 'utils/api';

const API_URL = '';

export default function InventoryTransaction() {
    const [type, setType] = useState('INBOUND');
    const [productId, setProductId] = useState('');
    const [transportInfo, setTransportInfo] = useState('');
    const [note, setNote] = useState('');
    const [currentImei, setCurrentImei] = useState('');
    const [imeiList, setImeiList] = useState([]);
    
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // Dữ liệu sản phẩm, danh mục, thương hiệu và Modal
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ sku: '', name: '', imageUrl: '', categoryId: '', brandId: '', costPrice: 0, sellingPrice: 0, warrantyMonths: 12 });
    
    // Refs cho chuyển ô bằng Enter
    const nameRef = React.useRef(null);
    const categoryRef = React.useRef(null);
    const brandRef = React.useRef(null);
    const imageRef = React.useRef(null);

    const handleEnterNext = (e, nextRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextRef && nextRef.current) {
                nextRef.current.focus();
                // Nếu là Select, ta có thể cần click để mở nhưng focus là đủ cho yêu cầu này
            }
        }
    };

    // Lấy dữ liệu ban đầu
    const fetchData = async () => {
        try {
            const [prodRes, catRes, brandRes] = await Promise.all([
                api.get(`${API_URL}/Products`),
                api.get(`${API_URL}/Categories`),
                api.get(`${API_URL}/Brands`)
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setBrands(brandRes.data);
        } catch (err) {
            console.error("Lỗi lấy dữ liệu hệ thống", err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Lưu sản phẩm mới từ Modal
    const handleQuickAdd = async () => {
        if (!newProduct.sku || !newProduct.name || !newProduct.categoryId || !newProduct.brandId) {
            setIsError(true);
            setMessage("Vui lòng nhập đầy đủ thông tin bắt buộc!");
            return;
        }

        try {
            const res = await api.post(`${API_URL}/Products`, newProduct);
            await fetchData(); // Load lại toàn bộ data
            setProductId(res.data.productId); // Tự động chọn sản phẩm vừa tạo
            setOpenModal(false); 
            setNewProduct({ sku: '', name: '', imageUrl: '', categoryId: '', brandId: '', costPrice: 0, sellingPrice: 0, warrantyMonths: 12 });
            setMessage("Đã thêm nhanh sản phẩm thành công!");
            setIsError(false);
        } catch (err) {
            setIsError(true);
            setMessage(err.response?.data?.message || "Lỗi thêm sản phẩm: Kiểm tra lại dữ liệu nhập");
        }
    };

    const handleScanImei = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const scannedCode = currentImei.trim();
            if (!scannedCode) return;
            if (imeiList.includes(scannedCode)) {
                setIsError(true);
                setMessage(`Mã IMEI ${scannedCode} đã được quét!`);
                setCurrentImei('');
                return;
            }
            setImeiList([...imeiList, scannedCode]);
            setCurrentImei('');
            setMessage('');
        }
    };

    const handleDeleteImei = (imeiToRemove) => {
        setImeiList(imeiList.filter(imei => imei !== imeiToRemove));
    };

    const handleSubmit = async () => {
        if (imeiList.length === 0) {
            setIsError(true);
            setMessage('Bạn chưa quét mã IMEI nào!');
            return;
        }

        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : { userId: 1 };

        const payload = {
            userId: user.userId || user.id || 1, // Robust mapping
            transportInfo: transportInfo,
            note: note,
            imeis: imeiList
        };

        try {
            let url = `${API_URL}/InventoryTransactions/outbound`;
            if (type === 'INBOUND') {
                if (!productId) {
                    setIsError(true);
                    setMessage('Vui lòng chọn Sản phẩm để nhập kho!');
                    return;
                }
                url = `${API_URL}/InventoryTransactions/inbound`;
                payload.productId = productId;
            }

            const response = await api.post(url, payload);
            setIsError(false);
            setMessage(response.data.message);
            setImeiList([]);
            setTransportInfo('');
            setNote('');
            setProductId('');
        } catch (err) {
            setIsError(true);
            setMessage(err.response?.data?.message || 'Lỗi kết nối đến máy chủ!');
        }
    };

    return (
        <Paper sx={{ p: 4, mt: 2 }}>
            <Typography variant="h4" gutterBottom color="primary">QUẢN LÝ NHẬP / XUẤT KHO</Typography>

            {message && <Alert severity={isError ? "error" : "success"} sx={{ mb: 3 }}>{message}</Alert>}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" gutterBottom>1. Thông tin chung</Typography>
                    <RadioGroup row value={type} onChange={(e) => { setType(e.target.value); setImeiList([]); }}>
                        <FormControlLabel value="INBOUND" control={<Radio color="success" />} label="Nhập kho" />
                        <FormControlLabel value="OUTBOUND" control={<Radio color="error" />} label="Xuất kho" />
                    </RadioGroup>

                    {type === 'INBOUND' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
                            <FormControl fullWidth>
                                <InputLabel>Chọn Sản phẩm</InputLabel>
                                <Select value={productId} label="Chọn Sản phẩm" onChange={(e) => setProductId(e.target.value)}>
                                    {products.map(p => (
                                        <MenuItem key={p.productId} value={p.productId}>{p.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* NÚT THÊM NHANH SẢN PHẨM */}
                            <IconButton color="primary" onClick={() => setOpenModal(true)} sx={{ border: '1px solid #1890ff', borderRadius: '8px' }}>
                                <PlusOutlined />
                            </IconButton>
                        </Box>
                    )}

                    <TextField fullWidth label="Đơn vị vận chuyển" variant="outlined" sx={{ mt: 2 }} value={transportInfo} onChange={(e) => setTransportInfo(e.target.value)} />
                    <TextField fullWidth label="Ghi chú phiếu" variant="outlined" multiline rows={3} sx={{ mt: 2 }} value={note} onChange={(e) => setNote(e.target.value)} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" gutterBottom>2. Quét hàng hóa</Typography>
                    <TextField fullWidth label="Quét mã IMEI và ấn Enter..." variant="outlined" color="secondary" value={currentImei} onChange={(e) => setCurrentImei(e.target.value)} onKeyDown={handleScanImei} autoFocus />
                    
                    <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 1, minHeight: '150px' }}>
                        <Typography variant="subtitle2" gutterBottom>Đã quét: {imeiList.length} máy</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {imeiList.map((imei, index) => (
                                <Chip key={index} label={imei} onDelete={() => handleDeleteImei(imei)} color="primary" variant="outlined" />
                            ))}
                        </Box>
                    </Box>

                    <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} color={type === 'INBOUND' ? 'success' : 'error'} onClick={handleSubmit}>
                        XÁC NHẬN {type === 'INBOUND' ? 'NHẬP KHO' : 'XUẤT KHO'}
                    </Button>
                </Grid>
            </Grid>

            {/* MODAL THÊM NHANH SẢN PHẨM */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Thêm nhanh Sản phẩm mới</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField 
                            label="Mã SKU" 
                            fullWidth 
                            variant="outlined" 
                            value={newProduct.sku} 
                            onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                            onKeyDown={(e) => handleEnterNext(e, nameRef)}
                        />
                        <TextField 
                            label="Tên sản phẩm" 
                            fullWidth 
                            variant="outlined" 
                            value={newProduct.name} 
                            inputRef={nameRef}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            onKeyDown={(e) => handleEnterNext(e, categoryRef)}
                        />
                        
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <TextField 
                                    select 
                                    label="Danh mục" 
                                    fullWidth 
                                    variant="outlined" 
                                    value={newProduct.categoryId} 
                                    inputRef={categoryRef}
                                    onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
                                    onKeyDown={(e) => handleEnterNext(e, brandRef)}
                                >
                                    {categories.map(c => <MenuItem key={c.categoryId} value={c.categoryId}>{c.categoryName}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid size={6}>
                                <TextField 
                                    select 
                                    label="Thương hiệu" 
                                    fullWidth 
                                    variant="outlined" 
                                    value={newProduct.brandId} 
                                    inputRef={brandRef}
                                    onChange={(e) => setNewProduct({...newProduct, brandId: e.target.value})}
                                    onKeyDown={(e) => handleEnterNext(e, imageRef)}
                                >
                                    {brands.map(b => <MenuItem key={b.brandId} value={b.brandId}>{b.brandName}</MenuItem>)}
                                </TextField>
                            </Grid>
                        </Grid>

                        <TextField 
                            label="Link hình ảnh" 
                            fullWidth 
                            variant="outlined" 
                            value={newProduct.imageUrl} 
                            inputRef={imageRef}
                            onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAdd(); }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenModal(false)} color="error">Hủy bỏ</Button>
                    <Button onClick={handleQuickAdd} variant="contained" color="primary">Lưu & Chọn</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}