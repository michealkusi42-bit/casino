import { useRef, useState } from 'react';
import { Box, Button, Stack, Typography, useTheme, IconButton, Popover, Badge } from '@mui/material';
import { usePathname, useRouter } from 'routes/hook';
import { useAuth } from 'hooks/use-auth-context';
import { useResponsive } from 'hooks/use-responsive';
import { useTranslate } from 'locales';
import { SearchIcon, WorldIcon } from 'icons';
import { Add, Remove } from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ColorButton from 'components/ColorButton';
import { useSettingsContext } from 'components/settings';
import { useSelector } from 'store/store';
import { fBalance } from 'utils/format-balance';
import AccountPopover from './account-popover';
import Logo from 'components/logo';
import { headerTabs } from 'data';

const Header = ({
    onHandleNav,
    onHandleNotification
}: {
    onHandleNav: () => void;
    onHandleNotification: () => void;
}) => {
    const theme = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslate();
    const { isLogined, user } = useAuth();
    const isMobile = useResponsive('down', 'sm');
    const { onToggleModal } = useSettingsContext();
    const balance = useSelector((state: any) => state.balance);
    const notification = useSelector((state: any) => state.notification);
    const anchorBalanceEl2 = useRef<HTMLDivElement | null>(null);
    const [showBalance, setShowBalance] = useState(false);

    const anchorBalanceOpen = () => {
        setShowBalance((prev) => !prev);
    };

    const handleBalanceClose = () => {
        setShowBalance(false);
    };

    const balanceAmount = typeof balance === 'object' && balance !== null
        ? (balance.amount ?? balance)
        : balance;

    return (
        <Stack
            component="header"
            direction="row"
            sx={{
                width: 1,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1201,
                height: '70px',
                alignItems: 'center',
                boxShadow: 'none',
                borderBottom: '1px solid',
                borderColor: 'background.border',
                bgcolor: 'background.layer1',
                backdropFilter: 'blur(6px)'
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    width: 1,
                    height: 1,
                    // ✅ Reduced left padding on mobile so logo sits at the edge
                    px: { xs: 0.5, md: 3, lg: 4 },
                    maxWidth: 1600,
                    mx: 0
                }}
            >
                <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 2 }} sx={{ flex: 1, minWidth: 0 }}>
                    <IconButton
                        onClick={onHandleNav}
                        sx={{ display: { lg: 'none' }, color: 'text.secondary', flexShrink: 0, p: { xs: 0.5, sm: 1 } }}
                    >
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                background: `url(/assets/icons/icons-1.webp) -128px -128px no-repeat`,
                                backgroundSize: 'cover'
                            }}
                        />
                    </IconButton>

                    <Logo height={44} />

                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            display: { xs: 'none', lg: 'flex' },
                            ml: 4,
                            minWidth: 0,
                            overflowX: 'auto',
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': { display: 'none' }
                        }}
                    >
                        {headerTabs.map((tab) => {
                            const isActive = pathname === tab.path;
                            return (
                                <Stack
                                    key={tab.label}
                                    direction="row"
                                    alignItems="center"
                                    onClick={() => router.push(tab.path)}
                                    spacing={1}
                                    sx={{
                                        cursor: 'pointer',
                                        px: 2,
                                        py: 1,
                                        borderRadius: 2,
                                        flexShrink: 0,
                                        transition: 'all 0.2s',
                                        bgcolor: isActive ? 'background.layer3' : 'transparent',
                                        '&:hover': {
                                            bgcolor: 'background.layer3',
                                            '& .label': { color: 'primary.main' }
                                        }
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={tab.icon}
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            flexShrink: 0,
                                            filter: isActive ? 'none' : 'grayscale(100%) opacity(0.7)'
                                        }}
                                    />
                                    <Typography
                                        className="label"
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            color: isActive ? 'primary.main' : 'text.secondary',
                                            transition: 'color 0.2s'
                                        }}
                                    >
                                        {t(tab.label)}
                                    </Typography>
                                </Stack>
                            );
                        })}
                    </Stack>
                </Stack>

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={{ xs: 0.75, sm: 2 }}
                    sx={{ flexShrink: 0 }}
                >
                    <IconButton
                        onClick={() => onToggleModal('EXPLORE')}
                        sx={{
                            display: { xs: 'none', sm: 'inline-flex' },
                            color: 'text.secondary',
                            bgcolor: 'background.layer3',
                            borderRadius: '50%',
                            p: 1.2,
                            flexShrink: 0,
                            '&:hover': { bgcolor: 'background.layer4', color: 'text.primary' }
                        }}
                    >
                        <SearchIcon sx={{ fontSize: 20 }} />
                    </IconButton>

                    {!isLogined && (
                        <>
                            <Button
                                onClick={() => onToggleModal('SIGNIN')}
                                sx={{
                                    color: 'text.primary',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    display: { xs: 'none', sm: 'flex' },
                                    flexShrink: 0,
                                    '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
                                }}
                            >
                                {t('Sign in')}
                            </Button>
                            <ColorButton
                                onClick={() => onToggleModal('SIGNUP')}
                                sx={{
                                    px: { xs: 2, sm: 3 },
                                    height: { xs: '2.25rem', sm: '2.5rem' },
                                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                    textTransform: 'none',
                                    flexShrink: 0
                                }}
                            >
                                {t('Sign up')}
                            </ColorButton>
                        </>
                    )}

                    {isLogined && (
                        <>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                                onClick={anchorBalanceOpen}
                                ref={anchorBalanceEl2}
                                sx={{
                                    cursor: 'pointer',
                                    bgcolor: 'background.layer3',
                                    borderRadius: 2,
                                    px: { xs: 1, sm: 1.5 },
                                    py: 0.8,
                                    border: '1px solid',
                                    borderColor: 'background.border',
                                    display: 'flex',
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#FCD116',
                                        fontSize: { xs: '0.75rem', sm: '1rem' }
                                    }}
                                >
                                    GH₵
                                </Typography>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {typeof balanceAmount === 'number'
                                        ? balanceAmount.toFixed(2)
                                        : parseFloat(balanceAmount || '0').toFixed(2)}
                                </Typography>
                                <ArrowDropDownIcon sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
                            </Stack>

                            {anchorBalanceEl2.current && (
                                <Popover
                                    open={showBalance}
                                    anchorEl={anchorBalanceEl2.current}
                                    onClose={handleBalanceClose}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    PaperProps={{
                                        sx: {
                                            mt: 1,
                                            width: 260,
                                            p: 2,
                                            bgcolor: 'background.layer2',
                                            backgroundImage: 'none',
                                            boxShadow: 24
                                        }
                                    }}
                                >
                                    <Stack spacing={1.5}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Balance</Typography>
                                            <Typography variant="subtitle2" sx={{ color: '#FCD116' }}>
                                                GH₵ {typeof balanceAmount === 'number'
                                                    ? balanceAmount.toFixed(2)
                                                    : parseFloat(balanceAmount || '0').toFixed(2)}
                                            </Typography>
                                        </Stack>
                                        <Button
                                            fullWidth
                                            onClick={() => { onToggleModal('DEPOSIT'); handleBalanceClose(); }}
                                            sx={{
                                                bgcolor: '#00e701',
                                                color: 'black',
                                                fontWeight: 'bold',
                                                borderRadius: 2,
                                                mt: 1
                                            }}
                                        >
                                            + Deposit
                                        </Button>
                                        <Button
                                            fullWidth
                                            onClick={() => { router.push('/wallet/withdraw'); handleBalanceClose(); }}
                                            sx={{
                                                bgcolor: '#2f4553',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                borderRadius: 2
                                            }}
                                        >
                                            - Withdraw
                                        </Button>
                                    </Stack>
                                </Popover>
                            )}

                            <Button
                                onClick={() => onToggleModal('DEPOSIT')}
                                startIcon={<Add />}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: '#fff',
                                    backgroundImage: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
                                    boxShadow: '0px 4px 10px rgba(0, 186, 230, 0.4)',
                                    borderRadius: 2,
                                    px: { sm: 2.5 },
                                    fontSize: { sm: '0.875rem' },
                                    height: { sm: 40 },
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap',
                                    display: { xs: 'none', sm: 'flex' },
                                    '&:hover': {
                                        backgroundImage: 'linear-gradient(90deg, #006C9C 0%, #00BAE6 100%)'
                                    }
                                }}
                            >
                                {t('Deposit')}
                            </Button>

                            <Button
                                onClick={() => router.push('/wallet/withdraw')}
                                startIcon={<Remove />}
                                sx={{
                                    bgcolor: '#2f4553',
                                    color: '#fff',
                                    borderRadius: 2,
                                    px: { sm: 2.5 },
                                    fontSize: { sm: '0.875rem' },
                                    height: { sm: 40 },
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    display: { xs: 'none', sm: 'flex' },
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap',
                                    '&:hover': { bgcolor: '#3e5b6d' }
                                }}
                            >
                                {t('Withdraw')}
                            </Button>

                            <IconButton
                                onClick={onHandleNotification}
                                sx={{
                                    display: { xs: 'none', md: 'inline-flex' },
                                    color: 'text.secondary',
                                    bgcolor: 'background.layer3',
                                    borderRadius: 2,
                                    p: 1,
                                    flexShrink: 0,
                                    '&:hover': { bgcolor: 'background.layer4', color: 'text.primary' }
                                }}
                            >
                                <Badge badgeContent={notification.count} color="error" variant="dot">
                                    <NotificationsIcon sx={{ fontSize: 22 }} />
                                </Badge>
                            </IconButton>

                            <AccountPopover />
                        </>
                    )}

                    <IconButton
                        onClick={() => onToggleModal('LANGUAGE')}
                        sx={{
                            display: { xs: 'none', md: 'inline-flex' },
                            color: 'text.secondary',
                            bgcolor: 'background.layer3',
                            borderRadius: 2,
                            p: 1,
                            flexShrink: 0,
                            '&:hover': { bgcolor: 'background.layer4', color: 'text.primary' }
                        }}
                    >
                        <WorldIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default Header;
