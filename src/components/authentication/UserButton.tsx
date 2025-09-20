import { useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
  Badge,
} from '@mui/material';
import {
  Person,
  Settings,
  ExitToApp,
  Business,
  LocationOn,
  Security,
  History,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/auth/authSlice';
import { PharmaceuticalUserRole } from '../../types/authentication';

interface UserButtonProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onAuditHistoryClick?: () => void;
}

export const UserButton = ({
  onProfileClick,
  onSettingsClick,
  onAuditHistoryClick,
}: UserButtonProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: { auth: any }) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  if (!user) {
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await dispatch(logoutUser());
  };

  const handleMenuItemClick = (action: () => void) => () => {
    handleClose();
    action();
  };

  const getRoleColor = (role: PharmaceuticalUserRole): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (role) {
      case 'regulatory_affairs_manager':
      case 'compliance_officer':
        return 'error';
      case 'sales_director':
      case 'marketing_manager':
        return 'primary';
      case 'territory_manager':
      case 'field_representative':
        return 'success';
      case 'dgda_liaison':
        return 'warning';
      case 'company_admin':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const formatRoleName = (role: PharmaceuticalUserRole): string => {
    return role.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getAvatarText = (): string => {
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge
          color="success"
          variant="dot"
          invisible={!user.isActive}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {getAvatarText()}
          </Avatar>
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 4,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 280,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {user.email}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              label={formatRoleName(user.role)}
              size="small"
              color={getRoleColor(user.role)}
              variant="outlined"
            />
            {user.territoryId && (
              <Chip
                label="Territory Access"
                size="small"
                variant="outlined"
                icon={<LocationOn />}
              />
            )}
          </Box>
        </Box>

        <Divider />

        {/* Company Info */}
        <MenuItem disabled>
          <ListItemIcon>
            <Business fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" color="text.secondary">
              Company ID: {user.companyId}
            </Typography>
          </ListItemText>
        </MenuItem>

        {user.territoryId && (
          <MenuItem disabled>
            <ListItemIcon>
              <LocationOn fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" color="text.secondary">
                Territory: {user.territoryId}
              </Typography>
            </ListItemText>
          </MenuItem>
        )}

        <Divider />

        {/* Menu Actions */}
        {onProfileClick && (
          <MenuItem onClick={handleMenuItemClick(onProfileClick)}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
        )}

        {onSettingsClick && (
          <MenuItem onClick={handleMenuItemClick(onSettingsClick)}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
        )}

        {onAuditHistoryClick && (
          <MenuItem onClick={handleMenuItemClick(onAuditHistoryClick)}>
            <ListItemIcon>
              <History fontSize="small" />
            </ListItemIcon>
            <ListItemText>Audit History</ListItemText>
          </MenuItem>
        )}

        {/* Security Notice for DGDA Compliance */}
        <MenuItem disabled>
          <ListItemIcon>
            <Security fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" color="warning.main">
              DGDA Audit Enabled
            </Typography>
          </ListItemText>
        </MenuItem>

        <Divider />

        {/* Logout */}
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <ExitToApp fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};