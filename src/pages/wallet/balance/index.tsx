import { useTranslate } from 'locales';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useSelector } from 'store/store';

const BalancePage = () => {
    const { t } = useTranslate();
    const balanceStore = useSelector((state: any) => state.balance);
    const currency = balanceStore.currency || 'GHS';

    const cards = [
        {
            label: 'Main Balance',
            value: balanceStore.amount.toFixed(2),
            icon: <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#00e701' }} />,
            color: '#00e701',
            bg: 'rgba(0,231,1,0.08)',
            border: 'rgba(0,231,1,0.2)',
            description: 'Available to play and withdraw'
        },
        {
            label: 'Pending',
            value: balanceStore.pending.toFixed(2),
            icon: <AccessTimeIcon sx={{ fontSize: 32, color: '#FFC107' }} />,
            color: '#FFC107',
            bg: 'rgba(255,193,7,0.08)',
            border: 'rgba(255,193,7,0.2)',
            description: 'Awaiting confirmation'
        },
        {
            label: 'Bonus Balance',
            value: balanceStore.bonus.toFixed(2),
            icon: <CardGiftcardIcon sx={{ fontSize: 32, color: '#00BAE6' }} />,
            color: '#00BAE6',
            bg: 'rgba(0,186,230,0.08)',
            border: 'rgba(0,186,230,0.2)',
            description: 'Bonus rewards earned'
        },
        {
            label: 'Withdrawable',
            value: balanceStore.withdrawable.toFixed(2),
            icon: <TrendingUpIcon sx={{ fontSize: 32, color: '#9B59B6' }} />,
            color: '#9B59B6',
            bg: 'rgba(155,89,182,0.08)',
            border: 'rgba(155,89,182,0.2)',
            description: 'Ready to withdraw'
        },
    ];

    return (
        <Stack spacing={3} sx={{ py: 2 }}>
            {/* Total Balance Hero Card */}
            <Box
                sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #0f212e 0%, #1a3a4a 100%)',
                    border: '1px solid rgba(0,186,230,0.3)',
                    boxShadow: '0 4px 24px rgba(0,186,230,0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{
                    position: 'absolute', top: -20, right: -20,
                    width: 120, height: 120, borderRadius: '50%',
                    bgcolor: 'rgba(0,186,230,0.05)',
                }} />
                <Box sx={{
                    position: 'absolute', bottom: -30, right: 60,
                    width: 80, height: 80, borderRadius: '50%',
                    bgcolor: 'rgba(0,231,1,0.05)',
                }} />

                <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                    <Box
                        sx={{
                            width: 48, height: 48, borderRadius: '50%',
                            bgcolor: 'rgba(0,231,1,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid rgba(0,231,1,0.3)',
                        }}
                    >
                        <AccountBalanceWalletIcon sx={{ color: '#00e701', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: '#94a3b8', letterSpacing: 1 }}>
                            TOTAL BALANCE
                        </Typography>
                        <Typography variant="h4" fontWeight={900} sx={{ color: '#00e701', lineHeight: 1.2 }}>
                            {currency} {balanceStore.amount.toFixed(2)}
                        </Typography>
                    </Box>
                </Stack>

                <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Last updated just now • Auto-refreshing
                </Typography>
            </Box>

            {/* Balance Cards Grid */}
            <Grid container spacing={2}>
                {cards.map((card, i) => (
                    <Grid size={{ xs: 6 }} key={i}>
                        <Card sx={{
                            p: 2, borderRadius: 3,
                            bgcolor: card.bg,
                            border: `1px solid ${card.border}`,
                            height: '100%',
                            transition: 'transform 0.2s ease',
                            '&:hover': { transform: 'translateY(-2px)' }
                        }}>
                            <Stack spacing={1}>
                                <Box sx={{
                                    width: 44, height: 44, borderRadius: 2,
                                    bgcolor: `${card.bg}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `1px solid ${card.border}`,
                                }}>
                                    {card.icon}
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                                        {card.label}
                                    </Typography>
                                    <Typography fontWeight={800} sx={{ color: card.color, fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                        {currency} {card.value}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
                                        {card.description}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Info box */}
            <Box sx={{
                p: 2, borderRadius: 2,
                bgcolor: 'rgba(0,186,230,0.05)',
                border: '1px solid rgba(0,186,230,0.15)'
            }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                    💡 <strong style={{ color: '#00BAE6' }}>Balance updates automatically</strong> every 10 seconds.
                    Deposits are credited after admin approval. Withdrawals are processed within 24 hours.
                </Typography>
            </Box>
        </Stack>
    );
};

export default BalancePage;
