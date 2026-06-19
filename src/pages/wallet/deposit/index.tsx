import { useSnackbar } from 'notistack';
import { useTranslate } from 'locales';
import { useEffect, useState, useCallback } from 'react';
import {
    Box, Button, Chip, CircularProgress, Divider, IconButton,
    Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow,
    Tabs, TextField, Typography, Card
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { fDateTime } from 'utils/format-time';
import EmptyTable from 'components/empty-table';
import { useDispatch } from 'store/store';

const API = 'https://foretell-backend-production-58a6.up.railway.app';

const MOMO_ACCOUNTS = [
    { network: 'Telecel', number: '0508631503', name: 'Christopher Tay' },
    { network: 'AirtelTigo', number: '0560190029', name: 'Fatima Iddrisu' },
    { network: 'Telecel', number: '0507210550', name: 'Christian Atoklo' },
    { network: 'Telecel', number: '0507558973', name: 'Simon Ayre Hammond' },
];

const CRYPTO_ACCOUNTS = [
    { coin: 'BTC', network: 'Bitcoin', address: '134UEYef2Qb2LMqUEMjWem5bmdKPsKvhPp', icon: '₿' },
    { coin: 'ETH', network: 'Ethereum (ERC20)', address: '0x964cc5c5a851299e34f009bd432aa4c58bf7b74d', icon: 'Ξ' },
    { coin: 'USDT', network: 'Tron (TRC20)', address: 'TLqkvwEbTFhn8TVvPZffJVTDi2a3QW37yn', icon: '₮' },
];

type Stage = 'list' | 'form' | 'details';

// ✅ Animated UNDER REVIEW dots
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
            label={`UNDER REVIEW${dots}`}
            size="small"
            sx={{
                bgcolor: 'rgba(0,186,230,0.15)',
                color: '#00BAE6',
                fontWeight: 700,
                fontSize: '0.65rem',
                border: '1px solid #00BAE6',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,186,230,0.4)' },
                    '50%': { boxShadow: '0 0 0 6px rgba(0,186,230,0)' }
                }
            }}
        />
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'pending') return (
        <Chip icon={<AccessTimeIcon sx={{ fontSize: 12 }} />} label="Pending" size="small"
            sx={{ bgcolor: 'rgba(255,193,7,0.15)', color: '#FFC107', fontWeight: 700, border: '1px solid #FFC107' }} />
    );
    if (status === 'under_review') return <AnimatedUnderReview />;
    if (status === 'success') return (
        <Chip icon={<CheckCircleIcon sx={{ fontSize: 12 }} />} label="Success" size="small"
            sx={{ bgcolor: 'rgba(0,231,1,0.15)', color: '#00e701', fontWeight: 700, border: '1px solid #00e701' }} />
    );
    if (status === 'rejected') return (
        <Chip icon={<CancelIcon sx={{ fontSize: 12 }} />} label="Rejected" size="small"
            sx={{ bgcolor: 'rgba(244,67,54,0.15)', color: '#f44336', fontWeight: 700, border: '1px solid #f44336' }} />
    );
    return <Chip label={status} size="small" />;
};

const DepositPage = () => {
    const { t } = useTranslate();
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const token = localStorage.getItem('betthrob-accessToken') || sessionStorage.getItem('betthrob-accessToken');

    const [stage, setStage] = useState<Stage>('list');
    const [tab, setTab] = useState(0);
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

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
                setTransactions(data.data.filter((tx: any) => tx.type === 'deposit'));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
        const id = setInterval(loadHistory, 30000);
        return () => clearInterval(id);
    }, [loadHistory]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied!', { variant: 'success' });
    };

    const handleSubmit = async () => {
        if (!amount || Number(amount) <= 0) {
            enqueueSnackbar('Enter a valid amount', { variant: 'error' });
            return;
        }
        if (!reference) {
            enqueueSnackbar('Enter transaction reference/ID', { variant: 'error' });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/wallet/deposit`, {
                method: 'POST',
                headers: authHeader,
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    reference,
                    method: tab === 0 ? 'momo' : 'crypto'
                })
            });
            const data = await res.json();
            if (data.success) {
                enqueueSnackbar('Deposit submitted! Awaiting review.', { variant: 'success' });
                setAmount('');
                setReference('');
                setStage('list');
                loadHistory();
            } else {
                enqueueSnackbar(data.error || 'Failed', { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar('Network error', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack sx={{ pt: 3, px: { md: 3, xs: 1 }, minHeight: '400px', bgcolor: 'background.card', borderRadius: 3 }}>

            {/* ─── LIST: deposit history + button ─── */}
            {stage === 'list' && (
                <Stack spacing={2}>
                    <Stack width={1} alignItems="end">
                        <Button onClick={() => setStage('form')} variant="contained" color="primary">
                            + {t('deposit')}
                        </Button>
                    </Stack>

                    <Typography variant="h6" fontWeight={700}>Deposit History</Typography>

                    {loadingHistory && <Stack alignItems="center" py={3}><CircularProgress /></Stack>}

                    {!loadingHistory && transactions.length === 0 && (
                        <Stack alignItems="center" py={4}>
                            <Typography color="text.secondary">No deposits yet</Typography>
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
                                bgcolor: 'background.layer2'
                            }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                            <Typography variant="caption" sx={{ color: '#00e701', fontWeight: 700, textTransform: 'uppercase' }}>
                                                + Deposit
                                            </Typography>
                                            <StatusBadge status={tx.status || 'pending'} />
                                        </Stack>
                                        <Typography variant="h6" fontWeight={800}>
                                            GH₵ {Number(tx.amount).toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {tx.timestamp ? fDateTime(tx.timestamp) : '-'}
                                        </Typography>
                                        {tx.reference && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Ref: {tx.reference}
                                            </Typography>
                                        )}
                                        {tx.method && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Via: {tx.method === 'momo' ? '🇬🇭 MoMo' : '₿ Crypto'}
                                            </Typography>
                                        )}
                                    </Box>
                                    {tx.status === 'under_review' && <CircularProgress size={24} sx={{ color: '#00BAE6' }} />}
                                    {tx.status === 'success' && <CheckCircleIcon sx={{ color: '#00e701', fontSize: 28 }} />}
                                    {tx.status === 'rejected' && <CancelIcon sx={{ color: '#f44336', fontSize: 28 }} />}
                                    {tx.status === 'pending' && <AccessTimeIcon sx={{ color: '#FFC107', fontSize: 28 }} />}
                                </Stack>
                            </Card>
                        ))}
                    </Stack>
                </Stack>
            )}

            {/* ─── FORM: enter amount ─── */}
            {stage === 'form' && (
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton onClick={() => setStage('list')} size="small">
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" fontWeight={700}>Make a Deposit</Typography>
                    </Stack>

                    <TextField
                        label="Amount (GHS)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                        fullWidth size="small" autoFocus
                    />

                    <Button
                        variant="contained"
                        onClick={() => {
                            if (!amount || Number(amount) <= 0) {
                                enqueueSnackbar('Enter a valid amount', { variant: 'error' });
                                return;
                            }
                            setStage('details');
                        }}
                        fullWidth sx={{ py: 1.5 }}
                    >
                        Continue
                    </Button>
                </Stack>
            )}

            {/* ─── DETAILS: payment method + reference ─── */}
            {stage === 'details' && (
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton onClick={() => setStage('form')} size="small">
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" fontWeight={700}>Deposit — GHS {amount}</Typography>
                    </Stack>

                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
                        <Tab label="🇬🇭 MoMo (GHS)" />
                        <Tab label="₿ Crypto" />
                    </Tabs>

                    {tab === 0 && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                Send GHS {amount} to any account below then enter your reference.
                            </Typography>
                            {MOMO_ACCOUNTS.map((acc, i) => (
                                <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography fontWeight={700}>{acc.network}</Typography>
                                            <Typography variant="h6" fontWeight={800}>{acc.number}</Typography>
                                            <Typography variant="body2" color="text.secondary">{acc.name}</Typography>
                                        </Box>
                                        <IconButton onClick={() => handleCopy(acc.number)}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            ))}
                            <TextField
                                label="Transaction Reference/ID"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                fullWidth size="small"
                            />
                            <Button variant="contained" onClick={handleSubmit} fullWidth disabled={loading} sx={{ py: 1.5 }}>
                                {loading ? <CircularProgress size={20} /> : 'Submit Deposit'}
                            </Button>
                        </Stack>
                    )}

                    {tab === 1 && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                Send the crypto equivalent of GHS {amount} to the address below.
                            </Typography>
                            {CRYPTO_ACCOUNTS.map((acc, i) => (
                                <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography fontWeight={700}>{acc.icon} {acc.coin} — {acc.network}</Typography>
                                        <IconButton onClick={() => handleCopy(acc.address)}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Stack>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-all', bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                                        {acc.address}
                                    </Typography>
                                </Box>
                            ))}
                            <TextField
                                label="Transaction Hash/ID"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                fullWidth size="small"
                            />
                            <Button variant="contained" onClick={handleSubmit} fullWidth disabled={loading} sx={{ py: 1.5 }}>
                                {loading ? <CircularProgress size={20} /> : 'Submit Deposit'}
                            </Button>
                        </Stack>
                    )}
                </Stack>
            )}
        </Stack>
    );
};

export default DepositPage;
