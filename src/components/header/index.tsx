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

    const handleBalanceClose = () => setShowBalance(false);

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
                height: '60px',
                px: { xs: 1.5, md: 3 },
                borderBottom: '1px solid',
                borderColor: 'background.border',
                bgcolor: 'background.layer1',
                backdropFilter: 'blur(6px)'
            }}
        >
            {/* LEFT: Menu + Logo */}
            <Stack direction="row" alignItems="center" spacing={1}>
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

                {/* Logo - left aligned, slightly slanted like Sportybet */}
                <Box
                    onClick={() => router.push('/')}
                    sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        transform: 'skewX(-8deg)', // slight slant like Sportybet
                    }}
                >
                    <Box
                        component="img"
                        src="/logo.webp"
                        sx={{
                            height: { xs: 28, md: 36 },
                            display: 'block',
                        }}
                        onError={(e: any) => { e.target.style.display = 'none'; }}
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
            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }}>
                <IconButton
                    onClick={() => onToggleModal('EXPLORE')}
                    sx={{ color: 'text.secondary', bgcolor: 'background.layer3', borderRadius: '50%', p: 1 }}
                >
                    <SearchIcon sx={{ fontSize: 18 }} />
                </IconButton>

                {!isLogined && (
                    <>
                        <Button
                            onClick={() => onToggleModal('SIGNIN')}
                            sx={{ color: 'text.primary', fontWeight: 600, textTransform: 'none', display: { xs: 'none', sm: 'flex' }, fontSize: '0.85rem' }}
                        >
                            {t('Sign in')}
                        </Button>
                        <ColorButton
                            onClick={() => onToggleModal('SIGNUP')}
                            sx={{ px: 2, height: 36, fontSize: '0.8rem', textTransform: 'none' }}
                        >
                            {t('Sign up')}
                        </ColorButton>
                    </>
                )}

                {isLogined && (
                    <>
                        {/* Balance */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            onClick={() => setShowBalance(v => !v)}
                            ref={anchorBalanceEl2}
                            sx={{
                                cursor: 'pointer',
                                bgcolor: 'background.layer3',
                                borderRadius: 2,
                                px: 1,
                                py: 0.6,
                                border: '1px solid',
                                borderColor: 'background.border',
                            }}
                        >
                            <Box component="img" src={balance.icon} sx={{ width: 16, height: 16 }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                                {currency} {balance.amount.toFixed(2)}
                            </Typography>
                            <ArrowDropDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        </Stack>

                        {/* Balance Popover */}
                        {anchorBalanceEl2.current && (
                            <Popover
                                open={showBalance}
                                anchorEl={anchorBalanceEl2.current}
                                onClose={handleBalanceClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                PaperProps={{
                                    sx: { mt: 1, width: 240, p: 2, bgcolor: 'background.layer2', backgroundImage: 'none', boxShadow: 24 }
                                }}
                            >
                                <Stack spacing={1.5}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Main</Typography>
                                        <Typography variant="subtitle2">{`${fBalance(balance.amount)} ${currency}`}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Bonus</Typography>
                                        <Typography variant="subtitle2">{`${fBalance(balance.bonus)} ${currency}`}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Withdrawable</Typography>
                                        <Typography variant="subtitle2">{`${fBalance(balance.withdrawable)} ${currency}`}</Typography>
                                    </Stack>
                                </Stack>
                            </Popover>
                        )}

                        {/* Deposit Button */}
                        <Button
                            onClick={() => onToggleModal('DEPOSIT')}
                            startIcon={<Add sx={{ fontSize: 16 }} />}
                            sx={{
                                background: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
                                color: '#000',
                                borderRadius: 2,
                                px: { xs: 1, sm: 2 },
                                height: 36,
                                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                textTransform: 'none',
                                fontWeight: 700,
                                minWidth: 0,
                                '&:hover': { background: 'linear-gradient(90deg, #006C9C 0%, #00BAE6 100%)' }
                            }}
                        >
                            {t('Deposit')}
                        </Button>

                        <IconButton
                            onClick={onHandleNotification}
                            sx={{ display: { xs: 'none', md: 'inline-flex' }, color: 'text.secondary', bgcolor: 'background.layer3', borderRadius: 2, p: 0.8 }}
                        >
                            <Badge badgeContent={notification.count} color="error" variant="dot">
                                <NotificationsIcon sx={{ fontSize: 20 }} />
                            </Badge>
                        </IconButton>

                        <AccountPopover />
                    </>
                )}

                <IconButton
                    onClick={() => onToggleModal('LANGUAGE')}
                    sx={{ display: { xs: 'none', md: 'inline-flex' }, color: 'text.secondary', bgcolor: 'background.layer3', borderRadius: 2, p: 0.8 }}
                >
                    <WorldIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </Stack>
        </Stack>
    );
};

export default Header;
