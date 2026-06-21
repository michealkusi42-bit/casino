import { useSnackbar } from 'notistack';
import { useTranslate } from 'locales';
import { useState, useEffect } from 'react';
import {
    Box, Button, CircularProgress, IconButton,
    Stack, Tab, Tabs, TextField, Typography
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch } from 'store/store';

const API = 'https://foretell-backend-production-58a6.up.railway.app';

// Crypto accounts stay exactly as before — Paystack can't handle these
const CRYPTO_ACCOUNTS = [
    { coin: 'BTC', network: 'Bitcoin', address: '134UEYef2Qb2LMqUEMjWem5bmdKPsKvhPp', icon: '₿' },
    { coin: 'ETH', network: 'Ethereum (ERC20)', address: '0x964cc5c5a851299e34f009bd432aa4c58bf7b74d', icon: 'Ξ' },
    { coin: 'USDT', network: 'Tron (TRC20)', address: 'TLqkvwEbTFhn8TVvPZffJVTDi2a3QW37yn', icon: '₮' },
];

type Stage = 'form' | 'details';

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

    const authHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    // ✅ NEW: when the user gets redirected back from Paystack, check the
    // payment result and tell them right away instead of leaving it silent.
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
            .catch(() => {})
            .finally(() => {
                // clean the reference out of the URL so refreshing doesn't re-trigger this
                window.history.replaceState({}, '', window.location.pathname);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied!', { variant: 'success' });
    };

    // ✅ NEW: starts a real Paystack payment and redirects the user to it
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

    // Crypto deposits stay on the old manual flow — admin reviews them
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
                        <Tab label="🇬🇭 Card / MoMo" />
                        <Tab label="₿ Crypto" />
                    </Tabs>

                    {/* ✅ NEW: instant Paystack checkout instead of manual numbers + reference */}
                    {tab === 0 && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                You'll be taken to a secure Paystack page to pay by card or mobile money.
                                Your balance updates automatically the moment payment succeeds — no waiting for review.
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

                    {/* Crypto stays exactly as before — manual, admin-reviewed */}
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
