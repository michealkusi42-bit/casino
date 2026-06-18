import { useRef, useState } from 'react';
import { Box, Button, Stack, Typography, IconButton, Popover, Badge } from '@mui/material';
import { usePathname, useRouter } from 'routes/hook';
import { useAuth } from 'hooks/use-auth-context';
import { useResponsive } from 'hooks/use-responsive';
import { useTranslate } from 'locales';
import { SearchIcon, WorldIcon } from 'icons';
import { Add } from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ColorButton from 'components/ColorButton';
import { useSettingsContext } from 'components/settings';
import { useSelector } from 'store/store';
import { fBalance } from 'utils/format-balance';
import AccountPopover from './account-popover';
import { headerTabs } from 'data';

const Header = ({
    onHandleNav,
    onHandleNotification
}: {
    onHandleNav: () => void;
    onHandleNotification: () => void;
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslate();
    const { isLogined, user } = useAuth();
    const { onToggleModal } = useSettingsContext();
    const balance = useSelector((state: any) => state.balance);
    const notification = useSelector((state: any) => state.notification);
    const anchorBalanceEl2 = useRef<HTMLDivElement | null>(null);
    const [showBalance, setShowBalance] = useState(false);

    const currency = user?.currency || 'GHS';

    return (
        <Stack
            component="header"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
                width: 1,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1201,
                height: '56px',
                px: { xs: 1, md: 3 },
                borderBottom: '1px solid',
                borderColor: 'background.border',
                bgcolor: 'background.layer1',
                backdropFilter: 'blur(6px)'
            }}
        >
            {/* LEFT: Menu + Logo */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                    onClick={onHandleNav}
                    sx={{ color: 'text.secondary', p: 0.5 }}
                >
                    <Box
                        sx={{
                            width: 22,
                            height: 22,
                            background: `url(/assets/icons/icons-1.webp) -128px -128px no-repeat`,
                            backgroundSize: 'cover',
                        }}
                    />
                </IconButton>

                {/* Logo - left aligned, slanted */}
                <Box
                    onClick={() => router.push('/')}
                    sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transform: 'skewX(-8deg)',
                    }}
                >
                    <Box
                        component="img"
                        src="/logo.webp"
                        sx={{ height: { xs: 26, md: 34 }, display: 'block' }}
                        onError={(e: any) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </Box>

                {/* Desktop Nav Tabs */}
                <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ display: { xs: 'none', xl: 'flex' }, ml: 2 }}
                >
                    {headerTabs.map((tab) => {
                        const isActive = pathname === tab.path;
                        return (
                            <Stack
                                key={tab.label}
                                direction="row"
                                alignItems="center"
                                onClick={() => router.push(tab.path)}
                                spacing={0.5}
                                sx={{
                                    cursor: 'pointer',
                                    px: 1.5,
                                    py: 0.8,
                                    borderRadius: 2,
                                    bgcolor: isActive ? 'background.layer3' : 'transparent',
                                    '&:hover': { bgcolor: 'background.layer3' }
                                }}
                            >
                                <Box component="img" src={tab.icon} sx={{ width: 18, height: 18 }} />
                                <Typography variant="caption" sx={{ fontWeight: 600, color: isActive ? 'primary.main' : 'text.secondary' }}>
                                    {t(tab.label)}
                                </Typography>
                            </Stack>
                        );
                    })}
                </Stack>
            </Stack>

            {/* RIGHT: Actions */}
            <Stack direction="row" alignItems="center" spacing={0.5}>

                {!isLogined && (
                    <>
                        <IconButton
                            onClick={() => onToggleModal('EXPLORE')}
                            sx={{ color: 'text.secondary', bgcolor: 'background.layer3', borderRadius: '50%', p: 0.8 }}
                        >
                            <SearchIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <Button
                            onClick={() => onToggleModal('SIGNIN')}
                            sx={{
                                color: 'text.primary',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                px: 1.5,
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        >
                            {t('Sign in')}
                        </Button>
                        <ColorButton
                            onClick={() => onToggleModal('SIGNUP')}
                            sx={{ px: 2, height: 34, fontSize: '0.8rem', textTransform: 'none' }}
                        >
                            {t('Sign up')}
                        </ColorButton>
                    </>
                )}

                {isLogined && (
                    <>
                        {/* Balance - compact */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.3}
                            onClick={() => setShowBalance(v => !v)}
                            ref={anchorBalanceEl2}
                            sx={{
                                cursor: 'pointer',
                                bgcolor: 'background.layer3',
                                borderRadius: 1.5,
                                px: 0.8,
                                py: 0.5,
                                border: '1px solid',
                                borderColor: 'background.border',
                                maxWidth: { xs: 110, sm: 150 },
                            }}
                        >
                            <Box
                                component="img"
                                src={balance.icon}
                                sx={{ width: 14, height: 14, flexShrink: 0 }}
                                onError={(e: any) => { e.target.style.display = 'none'; }}
                            />
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {currency} {balance.amount.toFixed(2)}
                            </Typography>
                            <ArrowDropDownIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
                        </Stack>

                        {/* Balance Popover */}
                        {anchorBalanceEl2.current && (
                            <Popover
                                open={showBalance}
                                anchorEl={anchorBalanceEl2.current}
                                onClose={() => setShowBalance(false)}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                PaperProps={{
                                    sx: {
                                        mt: 1, width: 220, p: 2,
                                        bgcolor: 'background.layer2',
                                        backgroundImage: 'none',
                                        boxShadow: 24
                                    }
                                }}
                            >
                                <Stack spacing={1.5}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Main</Typography>
                                        <Typography variant="subtitle2">{fBalance(balance.amount)} {currency}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Bonus</Typography>
                                        <Typography variant="subtitle2">{fBalance(balance.bonus)} {currency}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Withdrawable</Typography>
                                        <Typography variant="subtitle2">{fBalance(balance.withdrawable)} {currency}</Typography>
                                    </Stack>
                                </Stack>
                            </Popover>
                        )}

                        {/* Deposit Button - compact */}
                        <Button
                            onClick={() => onToggleModal('DEPOSIT')}
                            startIcon={<Add sx={{ fontSize: 14 }} />}
                            sx={{
                                background: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
                                color: '#000',
                                borderRadius: 1.5,
                                px: { xs: 1, sm: 1.5 },
                                height: 34,
                                fontSize: '0.75rem',
                                textTransform: 'none',
                                fontWeight: 700,
                                minWidth: 0,
                                whiteSpace: 'nowrap',
                                '&:hover': { background: 'linear-gradient(90deg, #006C9C 0%, #00BAE6 100%)' }
                            }}
                        >
                            {t('Deposit')}
                        </Button>

                        {/* Notification - hide on mobile */}
                        <IconButton
                            onClick={onHandleNotification}
                            sx={{
                                display: { xs: 'none', sm: 'inline-flex' },
                                color: 'text.secondary',
                                bgcolor: 'background.layer3',
                                borderRadius: 1.5,
                                p: 0.7
                            }}
                        >
                            <Badge badgeContent={notification.count} color="error" variant="dot">
                                <NotificationsIcon sx={{ fontSize: 20 }} />
                            </Badge>
                        </IconButton>

                        <AccountPopover />
                    </>
                )}
            </Stack>
        </Stack>
    );
};

export default Header;
