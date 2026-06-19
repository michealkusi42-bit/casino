import { useEffect, useState, useCallback } from 'react';
import {
    Box, Button, Card, Chip, CircularProgress, IconButton,
    Stack, Tab, Tabs, TextField, Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useSnackbar } from 'notistack';
import { fDateTime } from 'utils/format-time';
import { useSelector } from 'store/store';

const API = 'https://foretell-backend-production-58a6.up.railway.app';

const MIN_WITHDRAWAL = 10;
const MAX_WITHDRAWAL = 5000;

// ✅ Animated UNDER REVIEW with pulsing glow
const AnimatedUnderReview = () => {
    const [dots, setDots] = useState('.');
    useEffect(() => {
        const id = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '.' : prev + '.');
        }, 500);
        return () => clearInterval(id);
    }, []);

    return (
        <Chip
            icon={<CircularProgress size={12} sx={{ color: '#00BAE6' }} />}
            label={`Under Review${dots}`}
            size="small"
            sx={{
                bgcolor: 'rgba(0,186,230,0.15)',
                color: '#00BAE6',
                fontWeight: 700,
                fontSize: '0.65rem',
                border: '1px solid #00BAE6',
                animation: 'glowPulse 1.5s ease-in-out infinite',
                '@keyframes glowPulse': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,186,230,0.5)' },
                    '50%': { boxShadow: '0 0 12px 4px rgba(0,186,230,0.3)' }
                }
            }}
        />
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'pending') return (
        <Chip
            icon={<AccessTimeIcon sx={{ fontSize: 12 }} />}
            label="Pending"
            size="small"
            sx={{ bgcolor: 'rgba(255,193,7,0.15)', color: '#FFC107', fontWeight: 700, border: '1px solid #FFC107' }}
        />
    );
    if (status === 'under_review') return <AnimatedUnderReview />;
    if (status === 'success') return (
        <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
            label="Withdrawn ✓"
            size="small"
            sx={{ bgcolor: 'rgba(0,231,1,0.15)', color: '#00e701', fontWeight: 700, border: '1px solid #00e701' }}
        />
    );
    if (status === 'rejected') return (
        <Chip
            icon={<CancelIcon sx={{ fontSize: 12 }} />}
            label="Rejected"
            size="small"
            sx={{ bgcolor: 'rgba(244,67,54,0.15)', color: '#f44336', fontWeight: 700, border: '1px solid #f44336' }}
        />
    );
    return <Chip label={status} size="small" />;
};

type Stage = 'list' | 'form';

const WithdrawPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const balance = useSelector((state: any) => state.balance);
    const token = localStorage.getItem('betthrob-accessToken') || sessionStorage.getItem('betthrob-accessToken');

    const [stage, setStage] = useState<Stage>('list');
    const [tab, setTab] = useState(0); // 0 = MoMo, 1 = Crypto
    const [amount, setAmount] = useState('');
    const [momoNumber, setMomoNumber] = useState('');
    const [cryptoAddress, setCryptoAddress] = useState('');
    const [network, setNetwork] = useState('');
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [hasPending, setHasPending] = useState(false);

    const authHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    const loadHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch(`${API}/api/wallet/transactions`, { headers: authHeader });
            const data = await res.json();
            if (data.success) {
                const withdrawals = data.data.filter((tx: any) => tx.type === 'withdraw');
                setTransactions(withdrawals);
                // Check if there's already a pending withdrawal
                const pending = withdrawals.find((tx: any) => ['pending', 'under_review'].includes(tx.status));
                setHasPending(!!pending);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
        const id = setInterval(loadHistory, 15000); // refresh every 15 seconds
        return () => clearInterval(id);
    }, [loadHistory]);

    const handleSubmit = async () => {
        const amt = parseFloat(amount);

        // Validations
        if (!amount || amt <= 0) {
            enqueueSnackbar('Enter a valid amount', { variant: 'error' });
            return;
        }
        if (amt < MIN_WITHDRAWAL) {
            enqueueSnackbar(`Minimum withdrawal is GHS ${MIN_WITHDRAWAL}`, { variant: 'error' });
            return;
        }
        if (amt > MAX_WITHDRAWAL) {
            enqueueSnackbar(`Maximum withdrawal is GHS ${MAX_WITHDRAWAL}`, { variant: 'error' });
            return;
        }
        if (amt > balance.amount) {
            enqueueSnackbar('Insufficient balance', { variant: 'error' });
            return;
        }
        if (tab === 0 && !momoNumber) {
            enqueueSnackbar('Enter your MoMo number', { variant: 'error' });
            return;
        }
        if (tab === 1 && (!cryptoAddress || !network)) {
            enqueueSnackbar('Enter your wallet address and network', { variant: 'error' });
            return;
        }
        if (hasPending) {
            enqueueSnackbar('You already have a pending withdrawal. Wait for it to be processed.', { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API}/api/wallet/withdraw`, {
                method: 'POST',
                headers: authHeader,
                body: JSON.stringify({
                    amount: amt,
                    address: tab === 0 ? momoNumber : cryptoAddress,
                    method: tab === 0 ? 'momo' : 'crypto',
                    network: tab === 1 ? network : undefined,
                })
            });
            const data = await res.json();
            if (data.success) {
                enqueueSnackbar('Withdrawal request submitted! Processing within 24 hours.', { variant: 'success' });
                setAmount('');
                setMomoNumber('');
                setCryptoAddress('');
                setNetwork('');
                setStage('list');
                loadHistory();
            } else {
                enqueueSnackbar(data.error || 'Failed to submit withdrawal', { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar('Network error. Please try again.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack sx={{ pt: 3, px: { md: 3, xs: 1 }, minHeight: '400px', bgcolor: 'background.card', borderRadius: 3 }}>

            {/* LIST VIEW */}
            {stage === 'list' && (
                <Stack spacing={2}>
                    {/* Balance + Withdraw button */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <AccountBalanceWalletIcon sx={{ color: '#00e701' }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Available Balance</Typography>
                                <Typography variant="h6" fontWeight={800} sx={{ color: '#00e701' }}>
                                    GHS {balance.amount.toFixed(2)}
                                </Typography>
                            </Box>
                        </Stack>
                        <Button
                            variant="contained"
                            onClick={() => setStage('form')}
                            disabled={hasPending}
                            sx={{
                                background: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
                                color: '#000',
                                fontWeight: 700,
                            }}
                        >
                            — Withdraw
                        </Button>
                    </Stack>

                    {hasPending && (
                        <Box sx={{
                            p: 1.5, borderRadius: 2,
                            bgcolor: 'rgba(255,193,7,0.1)',
                            border: '1px solid rgba(255,193,7,0.3)'
                        }}>
                            <Typography variant="caption" sx={{ color: '#FFC107' }}>
                                ⚠️ You have a pending withdrawal. New withdrawals are locked until it's processed.
                            </Typography>
                        </Box>
                    )}

                    <Typography variant="h6" fontWeight={700}>Withdrawal History</Typography>

                    {loadingHistory && (
                        <Stack alignItems="center" py={3}>
                            <CircularProgress size={24} />
                        </Stack>
                    )}

                    {!loadingHistory && transactions.length === 0 && (
                        <Stack alignItems="center" py={4}>
                            <Typography color="text.secondary">No withdrawals yet</Typography>
                        </Stack>
                    )}

                    <Stack spacing={1.5}>
                        {transactions.map((tx, i) => (
                            <Card key={i} sx={{
                                p: 2, borderRadius: 2,
                                border: '1px solid',
                                borderColor: tx.status === 'success' ? 'rgba(0,231,1,0.2)'
                                    : tx.status === 'under_review' ? 'rgba(0,186,230,0.2)'
                                    : tx.status === 'rejected' ? 'rgba(244,67,54,0.2)'
                                    : 'rgba(255,193,7,0.2)',
                                bgcolor: 'background.layer2',
                                animation: tx.status === 'under_review' ? 'cardGlow 2s ease-in-out infinite' : 'none',
                                '@keyframes cardGlow': {
                                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,186,230,0)' },
                                    '50%': { boxShadow: '0 0 12px 2px rgba(0,186,230,0.2)' }
                                }
                            }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700 }}>
                                                — Withdrawal
                                            </Typography>
                                            <StatusBadge status={tx.status || 'pending'} />
                                        </Stack>
                                        <Typography variant="h6" fontWeight={800}>
                                            GHS {Number(tx.amount).toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {tx.timestamp ? fDateTime(tx.timestamp) : '-'}
                                        </Typography>
                                        {tx.address && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                To: {tx.address}
                                            </Typography>
                                        )}
                                        {tx.method && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Via: {tx.method === 'momo' ? '🇬🇭 MoMo' : '₿ Crypto'}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ flexShrink: 0 }}>
                                        {tx.status === 'under_review' && <CircularProgress size={28} sx={{ color: '#00BAE6' }} />}
                                        {tx.status === 'success' && <CheckCircleIcon sx={{ color: '#00e701', fontSize: 32 }} />}
                                        {tx.status === 'rejected' && <CancelIcon sx={{ color: '#f44336', fontSize: 32 }} />}
                                        {tx.status === 'pending' && <AccessTimeIcon sx={{ color: '#FFC107', fontSize: 32 }} />}
                                    </Box>
                                </Stack>

                                {/* Progress bar for under_review */}
                                {tx.status === 'under_review' && (
                                    <Box sx={{ mt: 1.5 }}>
                                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                                            {['Submitted', 'Under Review', 'Processing', 'Sent'].map((s, idx) => (
                                                <Typography key={idx} variant="caption" sx={{
                                                    color: idx <= 1 ? '#00BAE6' : '#64748b',
                                                    fontWeight: idx <= 1 ? 700 : 400,
                                                    fontSize: '0.6rem'
                                                }}>
                                                    {s}
                                                </Typography>
                                            ))}
                                        </Stack>
                                        <Box sx={{ width: '100%', height: 4, bgcolor: '#2f4553', borderRadius: 2 }}>
                                            <Box sx={{
                                                width: '40%', height: '100%',
                                                bgcolor: '#00BAE6', borderRadius: 2,
                                                animation: 'progressPulse 2s ease-in-out infinite',
                                                '@keyframes progressPulse': {
                                                    '0%': { opacity: 0.6 },
                                                    '50%': { opacity: 1 },
                                                    '100%': { opacity: 0.6 }
                                                }
                                            }} />
                                        </Box>
                                    </Box>
                                )}
                            </Card>
                        ))}
                    </Stack>
                </Stack>
            )}

            {/* FORM VIEW */}
            {stage === 'form' && (
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton onClick={() => setStage('list')} size="small">
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" fontWeight={700}>Withdraw Funds</Typography>
                    </Stack>

                    {/* Balance display */}
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.layer2', border: '1px solid rgba(0,231,1,0.2)' }}>
                        <Typography variant="caption" color="text.secondary">Available Balance</Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#00e701' }}>
                            GHS {balance.amount.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Min: GHS {MIN_WITHDRAWAL} • Max: GHS {MAX_WITHDRAWAL}
                        </Typography>
                    </Box>

                    {/* Amount */}
                    <TextField
                        label="Amount (GHS)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                        fullWidth size="small"
                        autoFocus
                        helperText={amount && parseFloat(amount) > balance.amount ? '⚠️ Exceeds balance' : ''}
                        error={!!(amount && parseFloat(amount) > balance.amount)}
                    />

                    {/* Quick amount buttons */}
                    <Stack direction="row" spacing={1}>
                        {[50, 100, 200, 500].map(v => (
                            <Button
                                key={v}
                                size="small"
                                variant="outlined"
                                onClick={() => setAmount(String(Math.min(v, balance.amount)))}
                                sx={{ flex: 1, fontSize: '0.75rem', borderColor: '#2f4553', color: '#94a3b8' }}
                            >
                                {v}
                            </Button>
                        ))}
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setAmount(String(balance.amount.toFixed(2)))}
                            sx={{ flex: 1, fontSize: '0.75rem', borderColor: '#2f4553', color: '#00e701' }}
                        >
                            Max
                        </Button>
                    </Stack>

                    {/* Payment method tabs */}
                    <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                        <Tab label="🇬🇭 MoMo" />
                        <Tab label="₿ Crypto" />
                    </Tabs>

                    {/* MoMo */}
                    {tab === 0 && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                Enter your MoMo number. Payment will be sent within 24 hours after approval.
                            </Typography>
                            <TextField
                                label="Your MoMo Number"
                                value={momoNumber}
                                onChange={(e) => setMomoNumber(e.target.value)}
                                fullWidth size="small"
                                placeholder="e.g. 0244123456"
                            />
                        </Stack>
                    )}

                    {/* Crypto */}
                    {tab === 1 && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                Enter your crypto wallet address and select network.
                            </Typography>
                            <TextField
                                label="Wallet Address"
                                value={cryptoAddress}
                                onChange={(e) => setCryptoAddress(e.target.value)}
                                fullWidth size="small"
                                placeholder="e.g. 0x..."
                            />
                            <TextField
                                label="Network (e.g. BTC, ETH, TRC20)"
                                value={network}
                                onChange={(e) => setNetwork(e.target.value)}
                                fullWidth size="small"
                            />
                        </Stack>
                    )}

                    {/* Warning */}
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.2)' }}>
                        <Typography variant="caption" sx={{ color: '#FFC107' }}>
                            ⚠️ Withdrawals are processed manually within 24 hours. Your balance will be deducted immediately.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || !amount || parseFloat(amount) > balance.amount}
                        fullWidth
                        sx={{
                            py: 1.5,
                            fontWeight: 700,
                            background: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
                            color: '#000',
                            '&:hover': { background: 'linear-gradient(90deg, #006C9C 0%, #00BAE6 100%)' }
                        }}
                    >
                        {loading ? <CircularProgress size={20} /> : 'Confirm Withdrawal'}
                    </Button>
                </Stack>
            )}
        </Stack>
    );
};

export default WithdrawPage;
