import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: 'Mã xác thực không hợp lệ hoặc đã hết hạn!' });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ thông tin!' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/Auth/reset-password', {
        token,
        newPassword: password
      });
      setMessage({ type: 'success', text: response.data.message });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau!' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h3">Đặt lại mật khẩu</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-reset">Mật khẩu mới</InputLabel>
                  <OutlinedInput
                    id="password-reset"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    fullWidth
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="confirm-password-reset">Xác nhận mật khẩu mới</InputLabel>
                  <OutlinedInput
                    id="confirm-password-reset"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    fullWidth
                  />
                </Stack>
              </Grid>
              {message.text && (
                <Grid item xs={12}>
                  <Alert severity={message.type} variant="filled">
                    {message.text}
                  </Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disabled={isSubmitting || !token} fullWidth size="large" type="submit" variant="contained" color="primary">
                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
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
