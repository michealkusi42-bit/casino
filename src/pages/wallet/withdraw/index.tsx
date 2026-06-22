import { useEffect, useState } from 'react';
import {
    Box, Button, Chip, CircularProgress, IconButton,
    Stack, Tab, Tabs, TextField, Typography, Switch, FormControlLabel
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSnackbar } from 'notistack';
import { useSelector } from 'store/store';

const API = 'https://foretell-backend-production-58a6.up.railway.app';
const MIN_WITHDRAWAL = 10;
const MAX_WITHDRAWAL = 5000;

const WithdrawPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const balance = useSelector((state: any) => state.balance);
    const token = localStorage.getItem('betthrob-accessToken') || sessionStorage.getItem('betthrob-accessToken');

    const [tab, setTab] = useState(0);
    const [amount, setAmount] = useState('');
    const [momoNumber, setMomoNumber] = useState('');
    const [cryptoAddress, setCryptoAddress] = useState('');
    const [network, setNetwork] = useState('');
    const [loading, setLoading] = useState(false);
    const [savedMomo, setSavedMomo] = useState('');
    const [savedCrypto, setSavedCrypto] = useState('');
    const [savedNetwork, setSavedNetwork] = useState('');
    const [saveForNext, setSaveForNext] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(true);

    const authHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    // Load saved payment details on mount
    useEffect(() => {
        const loadPaymentDetails = async () => {
            try {
                const res = await fetch(`${API}/api/auth/payment-details`, { headers: authHeader });
                const data = await res.json();
                if (data.momoNumber) {
                    setSavedMomo(data.momoNumber);
                    setMomoNumber(data.momoNumber);
                }
                if (data.cryptoAddress) {
                    setSavedCrypto(data.cryptoAddress);
                    setCryptoAddress(data.cryptoAddress);
                }
                if (data.cryptoNetwork) {
                    setSavedNetwork(data.cryptoNetwork);
                    setNetwork(data.cryptoNetwork);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setFetchingDetails(false);
            }
        };
        loadPaymentDetails();
    }, []);

    const handleSubmit = async () => {
        const amt = parseFloat(amount);
        if (!amount || amt <= 0) { enqueueSnackbar('Enter a valid amount', { variant: 'error' }); return; }
        if (amt < MIN_WITHDRAWAL) { enqueueSnackbar(`Minimum withdrawal is GHS ${MIN_WITHDRAWAL}`, { variant: 'error' }); return; }
        if (amt > MAX_WITHDRAWAL) { enqueueSnackbar(`Maximum withdrawal is GHS ${MAX_WITHDRAWAL}`, { variant: 'error' }); return; }
        if (amt > balance.amount) { enqueueSnackbar('Insufficient balance', { variant: 'error' }); return; }
        if (tab === 0 && !momoNumber) { enqueueSnackbar('Enter your MoMo number', { variant: 'error' }); return; }
        if (tab === 1 && (!cryptoAddress || !network)) { enqueueSnackbar('Enter wallet address and network', { variant: 'error' }); return; }

        setLoading(true);
        try {
            // Save payment details if user wants
            if (saveForNext) {
                await fetch(`${API}/api/auth/payment-details`, {
                    method: 'POST',
                    headers: authHeader,
                    body: JSON.stringify({
                        momoNumber: tab === 0 ? momoNumber : undefined,
                        cryptoAddress: tab === 1 ? cryptoAddress : undefined,
                        cryptoNetwork: tab === 1 ? network : undefined,
                    })
                });
            }

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
                enqueueSnackbar('Withdrawal submitted! Processing within 24 hours.', { variant: 'success' });
                setAmount('');
            } else {
                enqueueSnackbar(data.error || 'Failed', { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar('Network error. Please try again.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (fetchingDetails) {
        return (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
                <CircularProgress sx={{ color: '#00e701' }} />
            </Stack>
        );
    }

    return (
        <Stack sx={{ pt: 3, px: { md: 3, xs: 1 }, minHeight: '400px', bgcolor: 'background.card', borderRadius: 3 }}>
            <Stack spacing={2}>

                {/* Balance display */}
                <Stack direction="row" alignItems="center" spacing={1}>
                    <AccountBalanceWalletIcon sx={{ color: '#00e701' }} />
                    <Box>
                        <Typography variant="caption" color="text.secondary">Available Balance</Typography>
                        <Typography variant="h6" fontWeight={800} sx={{ color: '#00e701' }}>
                            GHS {balance.amount.toFixed(2)}
                        </Typography>
                    </Box>
                </Stack>

                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.layer2', border: '1px solid rgba(0,231,1,0.2)' }}>
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
                        <Button key={v} size="small" variant="outlined"
                            onClick={() => setAmount(String(Math.min(v, balance.amount)))}
                            sx={{ flex: 1, fontSize: '0.75rem', borderColor: '#2f4553', color: '#94a3b8' }}>
                            {v}
                        </Button>
                    ))}
                    <Button size="small" variant="outlined"
                        onClick={() => setAmount(String(balance.amount.toFixed(2)))}
                        sx={{ flex: 1, fontSize: '0.75rem', borderColor: '#2f4553', color: '#00e701' }}>
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
                    <Stack spacing={1.5}>
                        {savedMomo && (
                            <Box sx={{
                                p: 1.5, borderRadius: 2,
                                bgcolor: 'rgba(0,231,1,0.07)',
                                border: '1px solid rgba(0,231,1,0.25)',
                                display: 'flex', alignItems: 'center', gap: 1
                            }}>
                                <CheckCircleIcon sx={{ color: '#00e701', fontSize: 18 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Saved MoMo Number</Typography>
                                    <Typography fontWeight={700} sx={{ color: '#00e701' }}>{savedMomo}</Typography>
                                </Box>
                            </Box>
                        )}
                        <TextField
                            label={savedMomo ? 'MoMo Number (pre-filled from profile)' : 'Your MoMo Number'}
                            value={momoNumber}
                            onChange={(e) => setMomoNumber(e.target.value)}
                            fullWidth size="small"
                            placeholder="e.g. 0244123456"
                        />
                        {momoNumber !== savedMomo && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={saveForNext}
                                        onChange={(e) => setSaveForNext(e.target.checked)}
                                        size="small"
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#00e701' } }}
                                    />
                                }
                                label={
                                    <Typography variant="caption" color="text.secondary">
                                        Save this number for future withdrawals
                                    </Typography>
                                }
                            />
                        )}
                    </Stack>
                )}

                {/* Crypto */}
                {tab === 1 && (
                    <Stack spacing={1.5}>
                        {savedCrypto && (
                            <Box sx={{
                                p: 1.5, borderRadius: 2,
                                bgcolor: 'rgba(0,186,230,0.07)',
                                border: '1px solid rgba(0,186,230,0.25)',
                                display: 'flex', alignItems: 'center', gap: 1
                            }}>
                                <CheckCircleIcon sx={{ color: '#00BAE6', fontSize: 18 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Saved Wallet</Typography>
                                    <Typography fontWeight={700} sx={{ color: '#00BAE6', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                        {savedCrypto} ({savedNetwork})
                                    </Typography>
                                </Box>
                            </Box>
                        )}
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
                        {(cryptoAddress !== savedCrypto || network !== savedNetwork) && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={saveForNext}
                                        onChange={(e) => setSaveForNext(e.target.checked)}
                                        size="small"
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#00BAE6' } }}
                                    />
                                }
                                label={
                                    <Typography variant="caption" color="text.secondary">
                                        Save wallet for future withdrawals
                                    </Typography>
                                }
                            />
                        )}
                    </Stack>
                )}

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
                        py: 1.5, fontWeight: 700,
                        background: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
                        color: '#000',
                        '&:hover': { background: 'linear-gradient(90deg, #006C9C 0%, #00BAE6 100%)' }
                    }}
                >
                    {loading ? <CircularProgress size={20} /> : 'Confirm Withdrawal'}
                </Button>
            </Stack>
        </Stack>
    );
};

export default WithdrawPage;
