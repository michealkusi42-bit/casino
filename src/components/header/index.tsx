import { useRef, useState } from 'react';
import { Box, Button, Stack, Typography, IconButton, Popover, Badge } from '@mui/material';
import { usePathname, useRouter } from 'routes/hook';
import { paths } from 'routes/paths';
import { useAuth } from 'hooks/use-auth-context';
import { useTranslate } from 'locales';
import { SearchIcon, WorldIcon } from 'icons';
import { Add } from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
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
                height: '60px',
                px: { xs: 1.25, sm: 2, md: 3 },
                borderBottom: '1px solid',
                borderColor: 'background.border',
                bgcolor: 'background.layer1',
                backdropFilter: 'blur(6px)',
            }}
        >
            {/* LEFT: Menu + Logo — pinned left, never shrinks */}
            <Stack direction="row" alignItems="center" spacing={{ xs: 0.75, sm: 1.5 }} sx={{ flexShrink: 0, minWidth: 0 }}>
                <IconButton onClick={onHandleNav} sx={{ color: 'text.secondary', p: { xs: 0.4, sm: 0.5 } }}>
                    <Box sx={{
                        width: 22, height: 22,
                        background: `url(/assets/icons/icons-1.webp) -128px -128px no-repeat`,
                        backgroundSize: 'cover'
                    }} />
                </IconButton>

                {/* FORETELL Logo */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.3}
                    onClick={() => router.push('/')}
                    sx={{ cursor: 'pointer', transform: 'skewX(-8deg)', flexShrink: 0 }}
                >
                    <Typography sx={{
                        color: '#00e701',
                        fontWeight: 900,
                        fontSize: { xs: '1.2rem', md: '1.6rem' },
                        lineHeight: 1
                    }}>
                        $
                    </Typography>
                    <Typography sx={{
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: { xs: '0.78rem', sm: '1rem', md: '1.3rem' },
                        letterSpacing: { xs: 0.5, md: 1 },
                        lineHeight: 1,
                        whiteSpace: 'nowrap'
                    }}>
                        FORETELL
                    </Typography>
                </Stack>

                {/* Desktop Nav Tabs */}
                <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', xl: 'flex' }, ml: 2 }}>
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
                                    px: 1.5, py: 0.8,
                                    borderRadius: 2,
                                    bgcolor: isActive ? 'background.layer3' : 'transparent',
                                    '&:hover': { bgcolor: 'background.layer3' }
                                }}
                            >
                                <Box component="img" src={tab.icon} sx={{ width: 18, height: 18 }} />
                                <Typography variant="caption" sx={{
                                    fontWeight: 600,
                                    color: isActive ? 'primary.main' : 'text.secondary'
                                }}>
                                    {t(tab.label)}
                                </Typography>
                            </Stack>
                        );
                    })}
                </Stack>
            </Stack>

            {/* MIDDLE SPACER: pushes left and right groups apart and absorbs all extra width evenly */}
            <Box sx={{ flex: 1, minWidth: { xs: 8, sm: 24 } }} />

            {/* RIGHT: Actions — pinned right, evenly spaced, never crowds the profile icon out */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-end"
                spacing={{ xs: 0.6, sm: 1.5, md: 2 }}
                sx={{ flexShrink: 0 }}
            >

                {/* NOT LOGGED IN */}
                {!isLogined && (
                    <>
                        <Button
                            onClick={() => onToggleModal('SIGNIN')}
                            variant="outlined"
                            sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.3)',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '0.82rem',
                                px: { xs: 1.5, sm: 2 },
                                height: 36,
                                borderRadius: 2,
                                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                            }}
                        >
                            Sign in
                        </Button>
                        <ColorButton
                            onClick={() => onToggleModal('SIGNUP')}
                            sx={{
                                px: { xs: 1.5, sm: 2.5 },
                                height: 36,
                                fontSize: '0.82rem',
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: 2
                            }}
                        >
                            Sign up
                        </ColorButton>
                    </>
                )}

                {/* LOGGED IN */}
                {isLogined && (
                    <>
                        {/* Balance - tighter on mobile so it never crowds out what comes after it */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.4}
                            onClick={() => setShowBalance(v => !v)}
                            ref={anchorBalanceEl2}
                            sx={{
                                cursor: 'pointer',
                                bgcolor: 'background.layer3',
                                borderRadius: 2,
                                px: { xs: 0.9, sm: 1.5 },
                                py: 0.6,
                                border: '1px solid',
                                borderColor: 'background.border',
                                flexShrink: 0,
                            }}
                        >
                            {/* Mobile: wallet icon + short amount */}
                            <AccountBalanceWalletIcon sx={{ fontSize: 15, color: '#00e701', display: { xs: 'block', sm: 'none' } }} />

                            {/* Desktop: full text */}
                            <Typography sx={{
                                fontWeight: 700,
                                fontSize: { xs: '0.7rem', sm: '0.85rem' },
                                whiteSpace: 'nowrap',
                                color: '#fff',
                                display: { xs: 'none', sm: 'block' }
                            }}>
                                {currency}
                            </Typography>

                            <Typography sx={{
                                fontWeight: 700,
                                fontSize: { xs: '0.7rem', sm: '0.85rem' },
                                whiteSpace: 'nowrap',
                                color: '#00e701',
                            }}>
                                {balance.amount.toFixed(2)}
                            </Typography>
                            <ArrowDropDownIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
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
                                        mt: 1, width: 230, p: 2,
                                        bgcolor: 'background.layer2',
                                        backgroundImage: 'none',
                                        boxShadow: 24
                                    }
                                }}
                            >
                                <Stack spacing={1.5}>
                                    <Typography variant="subtitle2" sx={{ color: '#00e701', mb: 0.5 }}>
                                        My Balance
                                    </Typography>
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

                        {/* Deposit Button — shrinks to icon-friendly size on mobile so it doesn't push the profile icon out.
                            Navigates to the same /wallet/deposit page the profile menu uses (Paystack flow),
                            instead of opening the old DEPOSIT modal. */}
                        <Button
                            onClick={() => router.push(paths.wallet.deposit)}
                            startIcon={<Add sx={{ fontSize: { xs: 13, sm: 16 } }} />}
                            sx={{
                                background: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
                                color: '#000',
                                borderRadius: 2,
                                px: { xs: 0.9, sm: 2.5 },
                                minWidth: { xs: 0, sm: 'auto' },
                                height: 36,
                                fontSize: { xs: '0.7rem', sm: '0.85rem' },
                                textTransform: 'none',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                '& .MuiButton-startIcon': { mr: { xs: 0.3, sm: 1 } },
                                '&:hover': { background: 'linear-gradient(90deg, #006C9C 0%, #00BAE6 100%)' }
                            }}
                        >
                            Deposit
                        </Button>

                        {/* Notification - desktop only */}
                        <IconButton
                            onClick={onHandleNotification}
                            sx={{
                                display: { xs: 'none', md: 'inline-flex' },
                                color: 'text.secondary',
                                bgcolor: 'background.layer3',
                                borderRadius: 2,
                                p: 0.8
                            }}
                        >
                            <Badge badgeContent={notification.count} color="error" variant="dot">
                                <NotificationsIcon sx={{ fontSize: 20 }} />
                            </Badge>
                        </IconButton>

                        {/* Profile - always visible, guaranteed minimum tappable size so it never gets squeezed off-screen */}
                        <Box sx={{ flexShrink: 0, minWidth: 32 }}>
                            <AccountPopover />
                        </Box>
                    </>
                )}
            </Stack>
        </Stack>
    );
};

export default Header;
