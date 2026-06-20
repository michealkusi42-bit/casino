import { useSnackbar } from 'notistack';
import { useTranslate } from 'locales';
import React, { useState } from 'react';
import {
    Tab, Box, Tabs, Stack, Button, Typography, TextField,
    IconButton, CircularProgress
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

type Stage = 'choose' | 'details';

const DepositPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslate();
    const dispatch = useDispatch();
    const token = localStorage.getItem('betthrob-accessToken') || sessionStorage.getItem('betthrob-accessToken');

    const [mainTab, setMainTab] = useState(0);
    const [stage, setStage] = useState<Stage>('choose');
    const [tab, setTab] = useState(0);
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');
    const [withdrawTab, setWithdrawTab] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const authHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied!', { variant: 'success' });
    };

    const handleContinue = () => {
        const value = mainTab === 0 ? amount : withdrawAmount;
        if (!value || Number(value) <= 0) {
            enqueueSnackbar('Please enter a valid amount', { variant: 'error' });
            return;
        }
        setStage('details');
    };

    const handleDepositSubmit = async () => {
        if (!reference) {
            enqueueSnackbar('Please enter a transaction reference/ID', { variant: 'error' });
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
                enqueueSnackbar('✅ Deposit submitted! Awaiting review.', { variant: 'success' });
                setAmount('');
                setReference('');
                setStage('choose');
            } else {
                enqueueSnackbar(data.error || 'Failed', { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar('Network error', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawSubmit = async () => {
        if (!withdrawAddress) {
            enqueueSnackbar('Please enter your account/wallet details', { variant: 'error' });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/wallet/withdraw`, {
                method: 'POST',
                headers: authHeader,
                body: JSON.stringify({
                    amount: parseFloat(withdrawAmount),
                    address: withdrawAddress,
                    method: withdrawTab === 0 ? 'momo' : 'crypto'
                })
            });
            const data = await res.json();
            if (data.success) {
                enqueueSnackbar('✅ Withdrawal submitted!', { variant: 'success' });
                dispatch({ type: 'balance/setBalance', payload: data.balance });
                setWithdrawAmount('');
                setWithdrawAddress('');
                setStage('choose');
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
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" fontWeight={700} mb={3}>Wallet</Typography>

            {stage === 'choose' && (
                <Box>
                    <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={{ mb: 3 }}>
                        <Tab label="Deposit" />
                        <Tab label="Withdraw" />
                    </Tabs>

                    {mainTab === 0 ? (
                        <Stack spacing={2}>
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
                            <Button variant="contained" onClick={handleContinue} fullWidth sx={{ py: 1.5 }}>
                                Continue
                            </Button>
                        </Stack>
                    ) : (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                Enter how much you'd like to withdraw.
                            </Typography>
                            <TextField
                                label="Amount (GHS)"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                type="number"
                                fullWidth size="small" autoFocus
                            />
                            <Button variant="contained" onClick={handleContinue} fullWidth sx={{ py: 1.5 }}>
                                Continue
                            </Button>
                        </Stack>
                    )}
                </Box>
            )}

            {stage === 'details' && (
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <IconButton onClick={() => setStage('choose')} size="small">
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {mainTab === 0 ? 'Deposit' : 'Withdraw'} — GHS {mainTab === 0 ? amount : withdrawAmount}
                        </Typography>
                    </Stack>

                    {mainTab === 0 && (
                        <Box>
                            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
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
                                    <Button variant="contained" onClick={handleDepositSubmit} fullWidth disabled={loading} sx={{ py: 1.5 }}>
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
                                    <Button variant="contained" onClick={handleDepositSubmit} fullWidth disabled={loading} sx={{ py: 1.5 }}>
                                        {loading ? <CircularProgress size={20} /> : 'Submit Deposit'}
                                    </Button>
                                </Stack>
                            )}
                        </Box>
                    )}

                    {mainTab === 1 && (
                        <Box>
                            <Tabs value={withdrawTab} onChange={(_, v) => setWithdrawTab(v)} sx={{ mb: 2 }}>
                                <Tab label="🇬🇭 MoMo (GHS)" />
                                <Tab label="₿ Crypto" />
                            </Tabs>
                            {withdrawTab === 0 && (
                                <Stack spacing={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        Enter your MoMo number to receive GHS {withdrawAmount}.
                                    </Typography>
                                    <TextField
                                        label="Your MoMo Number"
                                        value={withdrawAddress}
                                        onChange={(e) => setWithdrawAddress(e.target.value)}
                                        fullWidth size="small"
                                    />
                                    <Button variant="contained" onClick={handleWithdrawSubmit} fullWidth disabled={loading} sx={{ py: 1.5 }}>
                                        {loading ? <CircularProgress size={20} /> : 'Submit Withdrawal'}
                                    </Button>
                                </Stack>
                            )}
                            {withdrawTab === 1 && (
                                <Stack spacing={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        Enter your crypto wallet address to receive GHS {withdrawAmount}.
                                    </Typography>
                                    <TextField
                                        label="Your Wallet Address"
                                        value={withdrawAddress}
                                        onChange={(e) => setWithdrawAddress(e.target.value)}
                                        fullWidth size="small"
                                    />
                                    <Button variant="contained" onClick={handleWithdrawSubmit} fullWidth disabled={loading} sx={{ py: 1.5 }}>
                                        {loading ? <CircularProgress size={20} /> : 'Submit Withdrawal'}
                                    </Button>
                                </Stack>
                            )}
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default DepositPage;
