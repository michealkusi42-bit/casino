import { useSnackbar } from 'notistack';
import { useTranslate } from 'locales';
import { useState } from 'react';
import {
    Box, Button, CircularProgress, IconButton,
    Stack, Tab, Tabs, TextField, Typography
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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

    const authHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

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
