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
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import DialpadIcon from '@mui/icons-material/Dialpad';
import { useDispatch } from 'store/store';

const API = 'https://foretell-backend-production-58a6.up.railway.app';

// Brand colors used only within the Mobile Money flow (no global theme changes)
const MOMO_GREEN = '#00a651';
const MOMO_GREEN_DARK = '#007a3d';
const MOMO_BLUE = '#1a3c6e';

// Verified USSD code — confirmed via Telecel's own channels and independent
// USSD-code listings: both Telecel Cash and AirtelTigo Money use *110#.
const MOMO_USSD_CODE = '*110#';

const PRESET_AMOUNTS = [20, 50, 100, 200, 500, 1000];

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

type Stage = 'form' | 'details' | 'momo-confirm' | 'momo-success';

// Small reusable "info row" — number / name / amount with a copy pill,
// styled to match the cleaner mockup (icon chip + label + bold value).
const InfoRow = ({
    icon, iconBg, iconColor, label, value, onCopy
}: {
    icon: React.ReactNode; iconBg: string; iconColor: string;
    label: string; value: string; onCopy?: () => void;
}) => (
    <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{
            p: 1.5,
            border: '1.5px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            bgcolor: 'background.paper'
        }}
    >
        <Box sx={{
            width: 40, height: 40, borderRadius: 2, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: iconBg, color: iconColor
        }}>
            {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                {label}
            </Typography>
            <Typography fontWeight={800} fontSize={15} noWrap>
                {value}
            </Typography>
        </Box>
        {onCopy && (
            <Button
                size="small"
                onClick={onCopy}
                sx={{
                    bgcolor: '#f5a623', color: '#fff', fontWeight: 700,
                    px: 1.5, borderRadius: 1.5, flexShrink: 0,
                    '&:hover': { bgcolor: '#d4880a' }
                }}
            >
                Copy
            </Button>
        )}
    </Stack>
);

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
    const [networkFilter, setNetworkFilter] = useState<string | null>(null);
    const [lastSubmittedMomoRef, setLastSubmittedMomoRef] = useState('');

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

    const handleDialUssd = () => {
        // Standard tel: scheme USSD dial — works on mobile browsers
        window.location.href = `tel:${MOMO_USSD_CODE.replace('#', '%23')}`;
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
                setLastSubmittedMomoRef(momoRef);
                setStage('momo-success');
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

    const resetMomoFlow = () => {
        setAmount('');
        setMomoRef('');
        setLastSubmittedMomoRef('');
        setSelectedMoMo(null);
        setNetworkFilter(null);
        setStage('form');
    };

    // ── MoMo success screen ──
    if (stage === 'momo-success' && selectedMoMo) {
        return (
            <Stack sx={{ pt: 3, px: { md: 3, xs: 1 }, minHeight: '400px', bgcolor: 'background.card', borderRadius: 3 }} spacing={2.5} alignItems="center" textAlign="center">
                <Box sx={{
                    width: 80, height: 80, borderRadius: '50%',
                    bgcolor: '#e6f7ed', border: '2px solid #a5d6a7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 44, color: MOMO_GREEN }} />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight={800}>Deposit Submitted!</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 320 }}>
                        We've received your MoMo deposit request. Your account will be credited within 5–15 minutes after admin confirms.
                    </Typography>
                </Box>

                <Stack spacing={1} sx={{ width: '100%', maxWidth: 360 }}>
                    {[
                        ['Amount', `GHS ${amount}`],
                        ['Network', selectedMoMo.network],
                        ['Number', selectedMoMo.number],
                        ['Transaction ID', lastSubmittedMomoRef],
                    ].map(([k, v]) => (
                        <Stack key={k} direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="body2" color="text.secondary">{k}</Typography>
                            <Typography variant="body2" fontWeight={700}>{v}</Typography>
                        </Stack>
                    ))}
                </Stack>

                <Button
                    variant="contained"
                    onClick={resetMomoFlow}
                    sx={{ bgcolor: MOMO_GREEN, '&:hover': { bgcolor: MOMO_GREEN_DARK }, px: 4, py: 1.25, fontWeight: 700 }}
                >
                    Make Another Deposit
                </Button>
            </Stack>
        );
    }

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

                {/* Step 1 — Send Money */}
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ color: MOMO_GREEN }} fontWeight={700} textTransform="uppercase" letterSpacing={1}>
                        Step 1 — Send Money
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, mb: 1.5 }}>
                        Send the details below to this {selectedMoMo.network} number, exactly as you normally would via Mobile Money:
                    </Typography>

                    <Stack spacing={1.25}>
                        <InfoRow
                            icon={<PhoneAndroidIcon fontSize="small" />}
                            iconBg="#fff3e0" iconColor="#e65100"
                            label={`${selectedMoMo.network} Number`}
                            value={selectedMoMo.number}
                            onCopy={() => handleCopy(selectedMoMo.number)}
                        />
                        <InfoRow
                            icon={<PersonOutlineIcon fontSize="small" />}
                            iconBg="#e3f2fd" iconColor="#1565c0"
                            label="Account Name"
                            value={selectedMoMo.name}
                        />
                        <InfoRow
                            icon={<PaidOutlinedIcon fontSize="small" />}
                            iconBg="#e8f5e9" iconColor="#2e7d32"
                            label="Amount to Send"
                            value={`GHS ${amount}`}
                            onCopy={() => handleCopy(amount)}
                        />
                    </Stack>
                </Box>

                {/* USSD instructions */}
                <Box sx={{ p: 2, bgcolor: MOMO_BLUE, borderRadius: 2, color: '#fff' }}>
                    <Typography variant="caption" fontWeight={700} textTransform="uppercase" letterSpacing={1} sx={{ opacity: 0.85 }}>
                        How to send (USSD)
                    </Typography>
                    <Stack spacing={0.75} sx={{ mt: 1, mb: 1.5 }}>
                        {[
                            `Dial ${MOMO_USSD_CODE} on your phone`,
                            'Select "Send Money" / "Transfer"',
                            `Enter the recipient number: ${selectedMoMo.number}`,
                            `Enter the amount: GHS ${amount}`,
                            'Confirm with your Mobile Money PIN',
                        ].map((step, i) => (
                            <Stack key={i} direction="row" spacing={1.25} alignItems="flex-start">
                                <Box sx={{
                                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0, mt: 0.2,
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 700
                                }}>
                                    {i + 1}
                                </Box>
                                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{step}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                    <Button
                        fullWidth
                        startIcon={<DialpadIcon />}
                        onClick={handleDialUssd}
                        sx={{
                            bgcolor: '#fff', color: MOMO_BLUE, fontWeight: 700,
                            '&:hover': { bgcolor: '#e8eef5' }
                        }}
                    >
                        Dial {MOMO_USSD_CODE}
                    </Button>
                </Box>

                {/* Step 2 — Enter Transaction ID */}
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ color: MOMO_GREEN }} fontWeight={700} textTransform="uppercase" letterSpacing={1}>
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
                    sx={{ py: 1.5, fontWeight: 700, fontSize: 15, bgcolor: MOMO_GREEN, '&:hover': { bgcolor: MOMO_GREEN_DARK } }}
                >
                    {momoLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '✅ I Have Sent the Money'}
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

                    {/* Quick amount presets */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                        {PRESET_AMOUNTS.map((preset) => (
                            <Chip
                                key={preset}
                                label={`GHS ${preset}`}
                                onClick={() => setAmount(String(preset))}
                                variant={amount === String(preset) ? 'filled' : 'outlined'}
                                sx={{
                                    fontWeight: 700,
                                    ...(amount === String(preset)
                                        ? { bgcolor: MOMO_GREEN, color: '#fff' }
                                        : { borderColor: MOMO_GREEN, color: MOMO_GREEN })
                                }}
                            />
                        ))}
                    </Stack>

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

                    {/* ── TAB 0: Mobile Money (redesigned) ── */}
                    {tab === 0 && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                Send money directly to any of our MoMo numbers below. Fast, simple, no internet needed.
                            </Typography>

                            {/* Network quick-select grid */}
                            <Stack direction="row" spacing={2}>
                                {MOMO_ACCOUNTS.map((group) => {
                                    const active = networkFilter === group.network;
                                    return (
                                        <Stack
                                            key={group.network}
                                            alignItems="center"
                                            spacing={0.5}
                                            onClick={() => setNetworkFilter(active ? null : group.network)}
                                            sx={{
                                                cursor: 'pointer',
                                                p: 1, borderRadius: 2,
                                                border: '2px solid',
                                                borderColor: active ? group.color : 'transparent',
                                                bgcolor: active ? group.bgColor : 'transparent'
                                            }}
                                        >
                                            {group.logo}
                                            <Typography variant="caption" fontWeight={700} sx={{ color: group.color }}>
                                                {group.network}
                                            </Typography>
                                        </Stack>
                                    );
                                })}
                            </Stack>

                            {MOMO_ACCOUNTS
                                .filter((group) => !networkFilter || group.network === networkFilter)
                                .map((group) => (
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
                                                        p: 2, borderRadius: 2.5, cursor: 'pointer',
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

                    {/* ── TAB 1: Paystack — UNCHANGED ── */}
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

                    {/* ── TAB 2: Crypto — UNCHANGED ── */}
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
