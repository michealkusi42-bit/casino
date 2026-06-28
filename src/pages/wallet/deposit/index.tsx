import { useSnackbar } from 'notistack';
import { useTranslate } from 'locales';
import { useState, useEffect } from 'react';
import {
    Box, Button, CircularProgress, IconButton,
    Stack, Tab, Tabs, TextField, Typography, Chip, Divider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { useDispatch } from 'store/store';

const API = 'https://foretell-backend-production-58a6.up.railway.app';

const CRYPTO_ACCOUNTS = [
    { coin: 'BTC', network: 'Bitcoin', address: '134UEYef2Qb2LMqUEMjWem5bmdKPsKvhPp', icon: '₿' },
    { coin: 'ETH', network: 'Ethereum (ERC20)', address: '0x964cc5c5a851299e34f009bd432aa4c58bf7b74d', icon: 'Ξ' },
    { coin: 'USDT', network: 'Tron (TRC20)', address: 'TLqkvwEbTFhn8TVvPZffJVTDi2a3QW37yn', icon: '₮' },
];

// MoMo accounts grouped by network
const MOMO_ACCOUNTS = [
    {
        network: 'Telecel',
        color: '#E30613',
        bgColor: '#fff0f0',
        borderColor: '#E30613',
        logo: (
            <Box sx={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #E30613, #ff4d4d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(227,6,19,0.3)'
            }}>
                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 13, letterSpacing: -0.5 }}>TEL</Typography>
            </Box>
        ),
        accounts: [
            { name: 'Kotey Rudolph Glodean', number: '0507558973' },
            { name: 'Atoklo Christian', number: '0507210550' },
            { name: 'Tetteh Vida', number: '0508631503' },
        ]
    },
    {
        network: 'AirtelTigo',
        color: '#E22117',
        bgColor: '#fff5f0',
        borderColor: '#E22117',
        logo: (
            <Box sx={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #E22117, #FF6B35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(226,33,23,0.3)'
            }}>
                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 11, letterSpacing: -0.5 }}>A·T</Typography>
            </Box>
        ),
        accounts: [
            { name: 'Fatima Iddrisu', number: '0560972009' },
            { name: 'Fatima Iddrisu', number: '0560190029' },
        ]
    }
];

type Stage = 'form' | 'details' | 'momo-confirm';

const DepositPage = () => {
    const { t } = useTranslate();
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const token = localStorage.getItem('betthrob-accessToken') || sessionStorage.getItem('betthrob-accessToken');

    const [stage, setStage] = useState<Stage>('form');
    const [tab, setTab] = useState(0);
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');
    const [loading, setLoading] = useState(false);
    const [paystackLoading, setPaystackLoading] = useState(false);
    const [selectedMoMo, setSelectedMoMo] = useState<{ network: string; name: string; number: string } | null>(null);
    const [momoRef, setMomoRef] = useState('');
    const [momoLoading, setMomoLoading] = useState(false);

    const authHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('reference') || params.get('trxref');
        if (!ref) return;

        fetch(`${API}/api/paystack/verify/${ref}`, { headers: authHeader })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'success') {
                    enqueueSnackbar(`✅ Deposit of GHS ${data.amount} confirmed!`, { variant: 'success' });
                } else if (data.status === 'pending') {
                    enqueueSnackbar('Payment received, confirming shortly...', { variant: 'info' });
                } else {
                    enqueueSnackbar('Payment was not completed', { variant: 'warning' });
                }
            })
            .catch(() => { })
            .finally(() => {
                window.history.replaceState({}, '', window.location.pathname);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied!', { variant: 'success' });
    };

    const handlePaystackDeposit = async () => {
        setPaystackLoading(true);
        try {
            const res = await fetch(`${API}/api/paystack/initialize`, {
                method: 'POST',
                headers: authHeader,
                body: JSON.stringify({ amount: parseFloat(amount) })
            });
            const data = await res.json();
            if (data.authorizationUrl) {
                window.location.href = data.authorizationUrl;
            } else {
                enqueueSnackbar(data.error || 'Failed to start payment', { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar('Network error. Please try again.', { variant: 'error' });
        } finally {
            setPaystackLoading(false);
        }
    };

    const handleMoMoSubmit = async () => {
        if (!momoRef.trim()) {
            enqueueSnackbar('Enter your MoMo transaction ID', { variant: 'error' });
            return;
        }
        setMomoLoading(true);
        try {
            const res = await fetch(`${API}/api/wallet/deposit`, {
                method: 'POST',
                headers: authHeader,
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    reference: momoRef,
                    method: 'momo',
                    momoNumber: selectedMoMo?.number,
                    momoNetwork: selectedMoMo?.network,
                })
            });
            const data = await res.json();
            if (data.success) {
                enqueueSnackbar('✅ MoMo deposit submitted! Admin will confirm shortly.', { variant: 'success' });
                setAmount('');
                setMomoRef('');
                setSelectedMoMo(null);
                setStage('form');
            } else {
                enqueueSnackbar(data.error || 'Failed to submit', { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar('Network error. Please try again.', { variant: 'error' });
        } finally {
            setMomoLoading(false);
        }
    };

    const handleCryptoSubmit = async () => {
        if (!reference) {
            enqueueSnackbar('Enter transaction hash/ID', { variant: 'error' });
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
                    method: 'crypto'
                })
            });
            const data = await res.json();
            if (data.success) {
                enqueueSnackbar('Deposit submitted! Awaiting review.', { variant: 'success' });
                setAmount('');
                setReference('');
                setStage('form');
            } else {
                enqueueSnackbar(data.error || 'Failed', { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar('Network error', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // ── MoMo confirm screen ──
    if (stage === 'momo-confirm' && selectedMoMo) {
        return (
            <Stack sx={{ pt: 3, px: { md: 3, xs: 1 }, minHeight: '400px', bgcolor: 'background.card', borderRadius: 3 }} spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton onClick={() => setStage('details')} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" fontWeight={700}>Send GHS {amount} via MoMo</Typography>
                </Stack>

                {/* Step 1 */}
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Step 1 — Send Money
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, mb: 1.5 }}>
                        Send <strong>GHS {amount}</strong> to this {selectedMoMo.network} number:
                    </Typography>
                    <Box sx={{
                        p: 2, borderRadius: 2,
                        background: selectedMoMo.network === 'Telecel'
                            ? 'linear-gradient(135deg, #E30613 0%, #ff4d4d 100%)'
                            : 'linear-gradient(135deg, #E22117 0%, #FF6B35 100%)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>
                                {selectedMoMo.network.toUpperCase()} MONEY
                            </Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 22, letterSpacing: 2 }}>
                                {selectedMoMo.number}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
                                {selectedMoMo.name}
                            </Typography>
                        </Box>
                        <IconButton onClick={() => handleCopy(selectedMoMo.number)} sx={{ color: '#fff' }}>
                            <ContentCopyIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* Step 2 */}
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Step 2 — Enter Transaction ID
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, mb: 1.5 }}>
                        After sending, enter the transaction ID from your MoMo SMS confirmation.
                    </Typography>
                    <TextField
                        label="MoMo Transaction ID"
                        value={momoRef}
                        onChange={(e) => setMomoRef(e.target.value)}
                        fullWidth size="small"
                        placeholder="e.g. 5678901234"
                    />
                </Box>

                <Button
                    variant="contained"
                    onClick={handleMoMoSubmit}
                    fullWidth
                    disabled={momoLoading}
                    sx={{ py: 1.5, fontWeight: 700, fontSize: 15 }}
                >
                    {momoLoading ? <CircularProgress size={20} /> : '✅ I Have Sent the Money'}
                </Button>

                <Typography variant="caption" color="text.secondary" textAlign="center">
                    Your account will be credited within 5–15 minutes after admin confirms.
                </Typography>
            </Stack>
        );
    }

    return (
        <Stack sx={{ pt: 3, px: { md: 3, xs: 1 }, minHeight: '400px', bgcolor: 'background.card', borderRadius: 3 }}>

            {/* ─── FORM: enter amount ─── */}
            {stage === 'form' && (
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>Make a Deposit</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter how much you'd like to deposit.
                    </Typography>
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

            {/* ─── DETAILS: payment method ─── */}
            {stage === 'details' && (
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton onClick={() => setStage('form')} size="small">
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" fontWeight={700}>Deposit — GHS {amount}</Typography>
                    </Stack>

                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
                        <Tab label="📱 Mobile Money" />
                        <Tab label="🇬🇭 Card / Paystack" />
                        <Tab label="₿ Crypto" />
                    </Tabs>

                    {/* ── TAB 0: Mobile Money ── */}
                    {tab === 0 && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                Send money directly to any of our MoMo numbers below. Fast, simple, no internet needed.
                            </Typography>

                            {MOMO_ACCOUNTS.map((group) => (
                                <Box key={group.network}>
                                    {/* Network header */}
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                                        {group.logo}
                                        <Box>
                                            <Typography fontWeight={800} sx={{ color: group.color, fontSize: 15 }}>
                                                {group.network} Money
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {group.accounts.length} number{group.accounts.length > 1 ? 's' : ''} available
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* Account cards */}
                                    <Stack spacing={1} sx={{ pl: 1 }}>
                                        {group.accounts.map((acc, i) => (
                                            <Box
                                                key={i}
                                                onClick={() => {
                                                    setSelectedMoMo({ network: group.network, name: acc.name, number: acc.number });
                                                    setStage('momo-confirm');
                                                }}
                                                sx={{
                                                    p: 2, borderRadius: 2, cursor: 'pointer',
                                                    border: '1.5px solid', borderColor: group.borderColor,
                                                    bgcolor: group.bgColor,
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    transition: 'all 0.15s',
                                                    '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 4px 12px ${group.color}30` }
                                                }}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                                    <PhoneAndroidIcon sx={{ color: group.color, fontSize: 20 }} />
                                                    <Box>
                                                        <Typography fontWeight={700} fontSize={15}>{acc.number}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{acc.name}</Typography>
                                                    </Box>
                                                </Stack>
                                                <Chip
                                                    label="Send Here"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: group.color, color: '#fff',
                                                        fontWeight: 700, fontSize: 11
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </Stack>

                                    <Divider sx={{ mt: 2 }} />
                                </Box>
                            ))}

                            <Box sx={{ p: 1.5, bgcolor: 'info.lighter', borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}>
                                <Stack direction="row" spacing={1} alignItems="flex-start">
                                    <CheckCircleOutlineIcon sx={{ color: 'info.main', fontSize: 18, mt: 0.2 }} />
                                    <Typography variant="caption" color="info.dark">
                                        After sending, you'll enter your MoMo transaction ID. Your account is credited within 5–15 minutes.
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    )}

                    {/* ── TAB 1: Paystack ── */}
                    {tab === 1 && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                You'll be taken to a secure Paystack page to pay by card or mobile money.
                                Your balance updates automatically the moment payment succeeds.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={handlePaystackDeposit}
                                fullWidth
                                disabled={paystackLoading}
                                sx={{ py: 1.5 }}
                            >
                                {paystackLoading ? <CircularProgress size={20} /> : `Pay GHS ${amount} with Paystack`}
                            </Button>
                        </Stack>
                    )}

                    {/* ── TAB 2: Crypto ── */}
                    {tab === 2 && (
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
                            <Button variant="contained" onClick={handleCryptoSubmit} fullWidth disabled={loading} sx={{ py: 1.5 }}>
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
