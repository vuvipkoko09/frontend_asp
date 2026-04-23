// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'center', p: '24px 16px', mt: 'auto' }}
    >
      <Typography variant="caption" color="text.secondary">
        &copy; {new Date().getFullYear()} Hệ Thống Quản Lý Kho & Sản Phẩm. All rights reserved.
      </Typography>
    </Stack>
  );
}
