import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

// material-ui
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import ProfileTab from './ProfileTab';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import { useAuth } from 'contexts/AuthContext';

// assets
import avatar1 from 'assets/images/users/avatar-1.png';

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

export default function Profile() {
  const { user, logout } = useAuth();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  // Hàm lấy URL ảnh avatar (Cloudinary hoặc mặc định)
  const getAvatarUrl = () => {
    if (user?.avatar) {
      if (user.avatar.startsWith('http')) return user.avatar;
      return `https://localhost:7173${user.avatar}`; // Hoặc domain backend của bạn
    }
    return avatar1;
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 'auto' }}>
      <Tooltip title="Tài khoản" disableInteractive>
        <ButtonBase
          sx={(theme) => ({
            p: 0.25,
            borderRadius: 1,
            '&:focus-visible': { outline: `2px solid ${theme.vars.palette.secondary.dark}`, outlineOffset: 2 }
          })}
          aria-label="open profile"
          ref={anchorRef}
          aria-controls={open ? 'profile-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <Avatar alt="profile user" src={getAvatarUrl()} size="sm" sx={{ '&:hover': { outline: '1px solid', outlineColor: 'primary.main' } }} />
        </ButtonBase>
      </Tooltip>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({ boxShadow: theme.vars.customShadows.z1, width: 290, minWidth: 240, maxWidth: { xs: 250, md: 290 } })}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Grid>
                        <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center' }}>
                          <Avatar alt="profile user" src={getAvatarUrl()} sx={{ width: 40, height: 40 }} />
                          <Stack>
                            <Typography variant="h6">{user?.fullName || 'Người dùng'}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user?.role || 'Guest'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Box sx={{ p: 1 }}>
                    <ProfileTab handleLogout={logout} />
                  </Box>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
