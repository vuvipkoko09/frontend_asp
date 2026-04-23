import { useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AnimateButton from 'components/@extended/AnimateButton';
import api from 'utils/api';

// ==============================|| FORGOT PASSWORD ||============================== //

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Vui lòng nhập địa chỉ email!' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/Auth/forgot-password', { email });
      setMessage({ type: 'success', text: response.data.message });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau!' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Quên mật khẩu?</Typography>
            <Typography component={Link} to="/login" variant="body1" sx={{ textDecoration: 'none' }} color="primary">
              Quay lại đăng nhập
            </Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-forgot">Địa chỉ Email</InputLabel>
                  <OutlinedInput
                    id="email-forgot"
                    type="email"
                    value={email}
                    name="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn để nhận liên kết khôi phục"
                    fullWidth
                  />
                </Stack>
              </Grid>
              {message.text && (
                <Grid size={12}>
                  <Alert severity={message.type} sx={{ borderRadius: 2 }}>
                    {message.text}
                  </Alert>
                </Grid>
              )}
              <Grid size={12}>
                <AnimateButton>
                  <Button 
                    disabled={isSubmitting} 
                    fullWidth 
                    size="large" 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    sx={{ borderRadius: 2 }}
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
