import { useSnackbar } from 'notistack';
import { useTranslate } from 'locales';
import { useState, useEffect, useRef } from 'react';
import {
    Box, Button, CircularProgress, IconButton,
    Stack, Typography, TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const API = 'https://foretell-backend-production-58a6.up.railway.app';

const CRYPTO_ACCOUNTS = [
    { coin: 'BTC', network: 'Bitcoin', address: '134UEYef2Qb2LMqUEMjWem5bmdKPsKvhPp', icon: '₿' },
    { coin: 'ETH', network: 'Ethereum (ERC20)', address: '0x964cc5c5a851299e34f009bd432aa4c58bf7b74d', icon: 'Ξ' },
    { coin: 'USDT', network: 'Tron (TRC20)', address: 'TLqkvwEbTFhn8TVvPZffJVTDi2a3QW37yn', icon: '₮' },
];

const NETWORKS = [
    {
        id: 'MTN',
        name: 'MTN Mobile Money',
        color: '#FFCC00',
        textColor: '#000',
        badgeText: 'MTN',
        badgeBg: '#FFCC00',
        badgeFg: '#000',
        clickable: false, // visible, arrow shown, but tapping does nothing
        accounts: [],
        ussd: [],
    },
    {
        id: 'Telecel',
        name: 'Telecel Vodafone',
        color: '#E30613',
        textColor: '#fff',
        badgeText: 'Telecel',
        badgeBg: '#E30613',
        badgeFg: '#fff',
        clickable: true,
        accounts: [
            { name: 'Kotey Rudolph Glodean', number: '0507558973' },
            { name: 'Atoklo Christian', number: '0507210550' },
            { name: 'Tetteh Vida', number: '0508631503' },
        ],
        ussd: [
            'Dial *110#',
            'Select 1 [Send Money]',
            'Select 1 [Telecel Cash User]',
            'Enter recipient number: {number}',
            'Re-enter recipient Number: {number}',
            'Enter amount: {amount}',
            'Enter any Reference',
            'Enter PIN',
            'Select 1 [Confirm]',
        ]
    },
    {
        id: 'AirtelTigo',
        name: 'AirtelTigo Money',
        color: '#E22117',
        textColor: '#fff',
        badgeText: 'AirtelTigo',
        badgeBg: '#E22117',
        badgeFg: '#fff',
        clickable: true,
        accounts: [
            { name: 'Fatima Iddrisu', number: '0560972009' },
            { name: 'Fatima Iddrisu', number: '0560190029' },
        ],
        ussd: [
            'Dial *110#',
            'Select 1 [Send Money]',
            'Select 2 [AirtelTigo User]',
            'Enter recipient number: {number}',
            'Re-enter recipient Number: {number}',
            'Enter amount: {amount}',
            'Enter any Reference',
            'Enter PIN',
            'Select 1 [Confirm]',
        ]
    }
];

// 3 landing-screen payment methods — stacked vertically, full-screen flow on tap
const PAYMENT_METHODS = [
    { id: 'momo',     label: 'Pay with MoMo',     desc: 'MTN, Telecel, AirtelTigo',        icon: '📱', color: '#00d4aa' },
    { id: 'paystack', label: 'Pay with Paystack',  desc: 'Card, Bank, Instant transfer',    icon: '💳', color: '#0070f3' },
    { id: 'crypto',   label: 'Pay with Crypto',    desc: 'BTC, ETH, USDT',                  icon: '₿',  color: '#F7931A' },
];

type View  = 'landing' | 'momo' | 'paystack' | 'crypto';
type Stage = 'form' | 'network' | 'payment' | 'crypto';

const DepositPage = () => {
    const { t } = useTranslate();
    const { enqueueSnackbar } = useSnackbar();
    const token = localStorage.getItem('betthrob-accessToken') || sessionStorage.getItem('betthrob-accessToken');

    const [view, setView]                         = useState<View>('landing');
    const [stage, setStage]                       = useState<Stage>('form');
    const [amount, setAmount]                     = useState('');
    const [selectedNetwork, setSelectedNetwork]   = useState<typeof NETWORKS[0] | null>(null);
    const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
    const [countdown, setCountdown]               = useState(600);
    const [momoRef, setMomoRef]                   = useState('');
    const [momoLoading, setMomoLoading]           = useState(false);
    const [paystackLoading, setPaystackLoading]   = useState(false);
    const [reference, setReference]               = useState('');
    const [loading, setLoading]                   = useState(false);
    const countdownRef = useRef<any>(null);
    const rotateRef    = useRef<any>(null);

    const authHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    const goToMethod = (methodId: View) => {
        setView(methodId);
        setStage('form');
        setAmount('');
        setSelectedNetwork(null);
        window.history.pushState({}, '', `/wallet/deposit/${methodId}`);
    };

    const backToLanding = () => {
        setView('landing');
        setStage('form');
        setAmount('');
        setSelectedNetwork(null);
        window.history.pushState({}, '', '/wallet/deposit');
    };

    useEffect(() => {
        if (stage !== 'payment') return;
        setCountdown(600);
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(countdownRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(countdownRef.current);
    }, [stage]);

    useEffect(() => {
        if (stage !== 'payment' || !selectedNetwork) return;
        setCurrentAccountIndex(0);
        rotateRef.current = setInterval(() => {
            setCurrentAccountIndex(prev => (prev + 1) % selectedNetwork.accounts.length);
        }, 180000);
        return () => clearInterval(rotateRef.current);
    }, [stage, selectedNetwork]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('reference') || params.get('trxref');
        if (!ref) return;
        fetch(`${API}/api/paystack/verify/${ref}`, { headers: authHeader })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success')
                    enqueueSnackbar(`✅ Deposit of GHS ${data.amount} confirmed!`, { variant: 'success' });
            })
            .catch(() => {})
            .finally(() => window.history.replaceState({}, '', window.location.pathname));
    }, []);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied!', { variant: 'success' });
    };

    const handlePaystackDeposit = async () => {
        setPaystackLoading(true);
        try {
            const res  = await fetch(`${API}/api/paystack/initialize`, {
                method: 'POST', headers: authHeader,
                body: JSON.stringify({ amount: parseFloat(amount) })
            });
            const data = await res.json();
            if (data.authorizationUrl) window.location.href = data.authorizationUrl;
            else enqueueSnackbar(data.error || 'Failed to start payment', { variant: 'error' });
        } catch { enqueueSnackbar('Network error. Please try again.', { variant: 'error' }); }
        finally  { setPaystackLoading(false); }
    };

    const handleMoMoSubmit = async () => {
        if (!momoRef.trim()) { enqueueSnackbar('Enter your MoMo transaction ID', { variant: 'error' }); return; }
        setMomoLoading(true);
        try {
            const currentAcc = selectedNetwork!.accounts[currentAccountIndex];
            const res  = await fetch(`${API}/api/wallet/deposit`, {
                method: 'POST', headers: authHeader,
                body: JSON.stringify({ amount: parseFloat(amount), reference: momoRef, method: 'momo', momoNumber: currentAcc.number, momoNetwork: selectedNetwork!.id })
            });
            const data = await res.json();
            if (data.success) {
                enqueueSnackbar('✅ Deposit submitted! Admin will confirm shortly.', { variant: 'success' });
                setAmount(''); setMomoRef(''); setSelectedNetwork(null); setStage('form');
            } else enqueueSnackbar(data.error || 'Failed to submit', { variant: 'error' });
        } catch { enqueueSnackbar('Network error. Please try again.', { variant: 'error' }); }
        finally  { setMomoLoading(false); }
    };

    const handleCryptoSubmit = async () => {
        if (!reference) { enqueueSnackbar('Enter transaction hash/ID', { variant: 'error' }); return; }
        setLoading(true);
        try {
            const res  = await fetch(`${API}/api/wallet/deposit`, {
                method: 'POST', headers: authHeader,
                body: JSON.stringify({ amount: parseFloat(amount), reference, method: 'crypto' })
            });
            const data = await res.json();
            if (data.success) {
                enqueueSnackbar('Deposit submitted! Awaiting review.', { variant: 'success' });
                setAmount(''); setReference(''); setStage('form');
            } else enqueueSnackbar(data.error || 'Failed', { variant: 'error' });
        } catch { enqueueSnackbar('Network error', { variant: 'error' }); }
        finally  { setLoading(false); }
    };

    // ── Shared dark header ──
    const Header = ({ showBack, onBack, subtitle }: { showBack?: boolean; onBack?: () => void; subtitle?: string }) => (
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                {showBack && <IconButton onClick={onBack} sx={{ color: '#fff' }}><ArrowBackIcon /></IconButton>}
                <Box>
                    <Typography sx={{ color: '#00d4aa', fontWeight: 900, fontSize: showBack ? 20 : 28, letterSpacing: 2 }}>$FORETELL</Typography>
                    {subtitle && <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, mt: 0.3 }}>{subtitle}</Typography>}
                </Box>
            </Stack>
        </Box>
    );

    const QuickAmounts = () => (
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {[10, 20, 50, 100, 200, 500].map(v => (
                <Box key={v} onClick={() => setAmount(v.toString())}
                    sx={{ px: 2, py: 0.8, bgcolor: amount === v.toString() ? '#1a1a2e' : '#f0f0f0', color: amount === v.toString() ? '#fff' : '#333', borderRadius: 2, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {v}
                </Box>
            ))}
        </Box>
    );

    const AmountInput = () => (
        <Box sx={{ display: 'flex', alignItems: 'center', border: '2px solid #e0e0e0', borderRadius: 2, p: 1.5, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mr: 1 }}>GHS</Typography>
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="0.00"
                style={{ border: 'none', outline: 'none', fontSize: 20, fontWeight: 700, width: '100%', background: 'transparent' }} />
        </Box>
    );

    const SecurityNote = () => (
        <Typography sx={{ textAlign: 'center', color: '#999', fontSize: 11, mt: 2 }}>
            🔒 Your payment is protected with bank-grade security.
        </Typography>
    );

    // Full-bleed page wrapper — genuinely fills the screen at every size.
    // No maxWidth cap: on phones it's edge-to-edge, on tablets/desktop the
    // content stretches with the viewport instead of sitting in a narrow column.
    const PageShell = ({ children }: { children: React.ReactNode }) => (
        <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#fff' }}>
            {children}
        </Box>
    );

    // ══════════════════════════════════════
    // LANDING — 3 vertically stacked method cards, full screen
    // ══════════════════════════════════════
    if (view === 'landing') {
        return (
            <PageShell>
                <Header subtitle="Secure Payment Portal" />
                <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 19, color: '#1a1a2e', mb: 0.5 }}>
                        Choose how to deposit
                    </Typography>
                    <Typography sx={{ color: '#888', fontSize: 13, mb: 3 }}>
                        Select a payment method to continue
                    </Typography>

                    <Stack spacing={2.5}>
                        {PAYMENT_METHODS.map(method => (
                            <Box
                                key={method.id}
                                onClick={() => goToMethod(method.id as View)}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 2.5,
                                    p: 3,
                                    borderRadius: 3,
                                    border: '1px solid #ececec',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: method.color,
                                        boxShadow: `0 6px 20px ${method.color}25`,
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <Box sx={{
                                    width: 56, height: 56, borderRadius: 2.5,
                                    bgcolor: `${method.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Typography sx={{ fontSize: 26 }}>{method.icon}</Typography>
                                </Box>
                                <Box flex={1}>
                                    <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#1a1a2e' }}>{method.label}</Typography>
                                    <Typography sx={{ fontSize: 12.5, color: '#999', mt: 0.3 }}>{method.desc}</Typography>
                                </Box>
                                <ArrowForwardIosIcon sx={{ fontSize: 16, color: method.color }} />
                            </Box>
                        ))}
                    </Stack>

                    <SecurityNote />
                </Box>
            </PageShell>
        );
    }

    // ══════════════════════════════════════
    // MOMO — form
    // ══════════════════════════════════════
    if (view === 'momo' && stage === 'form') {
        return (
            <PageShell>
                <Header showBack onBack={backToLanding} subtitle="Pay with MoMo" />
                <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2, color: '#1a1a2e' }}>Enter Deposit Amount</Typography>
                    <AmountInput />
                    <QuickAmounts />
                    <Button fullWidth variant="contained"
                        onClick={() => { if (!amount || Number(amount) < 1) { enqueueSnackbar('Enter a valid amount', { variant: 'error' }); return; } setStage('network'); }}
                        sx={{ py: 1.5, bgcolor: '#00d4aa', '&:hover': { bgcolor: '#00b894' }, fontWeight: 700, fontSize: 15, borderRadius: 2 }}>
                        Continue →
                    </Button>
                    <SecurityNote />
                </Box>
            </PageShell>
        );
    }

    // ══════════════════════════════════════
    // MOMO — network selection
    // ══════════════════════════════════════
    if (view === 'momo' && stage === 'network') {
        return (
            <PageShell>
                <Header showBack onBack={() => setStage('form')} subtitle="Select Network" />
                <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>Amount: GHS {amount}</Typography>
                    <Typography sx={{ color: '#999', fontSize: 13, mb: 3 }}>Choose your mobile money network</Typography>
                    <Stack spacing={2}>
                        {NETWORKS.map(net => (
                            <Box key={net.id}
                                onClick={() => {
                                    if (!net.clickable) return; // MTN: visible, but tapping does nothing
                                    setSelectedNetwork(net);
                                    setCurrentAccountIndex(0);
                                    setStage('payment');
                                }}
                                sx={{
                                    p: 2.2, borderRadius: 3, border: '2px solid',
                                    borderColor: net.color,
                                    cursor: net.clickable ? 'pointer' : 'default',
                                    display: 'flex', alignItems: 'center', gap: 2,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                    '&:hover': net.clickable ? { transform: 'translateY(-2px)', boxShadow: `0 6px 16px ${net.color}30` } : {}
                                }}>
                                <Box sx={{
                                    width: 56, height: 56, borderRadius: 2,
                                    flexShrink: 0,
                                    bgcolor: net.badgeBg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '1px solid #f0f0f0',
                                    px: 0.5,
                                }}>
                                    <Typography sx={{
                                        color: net.badgeFg, fontWeight: 900,
                                        fontSize: net.badgeText.length > 4 ? 10 : 14,
                                        letterSpacing: 0.3, textAlign: 'center', lineHeight: 1.1,
                                    }}>
                                        {net.badgeText}
                                    </Typography>
                                </Box>
                                <Box flex={1}>
                                    <Typography fontWeight={700} color="#1a1a2e" fontSize={15.5}>{net.name}</Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.6} mt={0.3}>
                                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#00b894' }} />
                                        <Typography fontSize={12.5} color="#00b894" fontWeight={600}>Available</Typography>
                                    </Stack>
                                </Box>
                                <ArrowForwardIosIcon sx={{ fontSize: 15, color: net.color }} />
                            </Box>
                        ))}
                    </Stack>
                    <SecurityNote />
                </Box>
            </PageShell>
        );
    }

    // ══════════════════════════════════════
    // MOMO — payment details
    // ══════════════════════════════════════
    if (view === 'momo' && stage === 'payment' && selectedNetwork) {
        const currentAcc = selectedNetwork.accounts[currentAccountIndex];
        const timeColor  = countdown < 120 ? '#E30613' : countdown < 300 ? '#FF8C00' : '#00b894';

        return (
            <PageShell>
                <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', p: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <IconButton onClick={() => setStage('network')} sx={{ color: '#fff' }}><ArrowBackIcon /></IconButton>
                            <Typography sx={{ color: '#00d4aa', fontWeight: 900, fontSize: 20 }}>$FORETELL</Typography>
                        </Stack>
                        <Box sx={{ bgcolor: countdown < 120 ? 'rgba(227,6,19,0.2)' : 'rgba(0,212,170,0.2)', border: `1px solid ${timeColor}`, borderRadius: 2, px: 2, py: 0.5 }}>
                            <Typography sx={{ color: timeColor, fontWeight: 800, fontSize: 16, fontFamily: 'monospace' }}>{formatTime(countdown)}</Typography>
                        </Box>
                    </Stack>
                </Box>

                <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 2, fontSize: 15 }}>Payment Information</Typography>
                    {[
                        { label: 'Account Number', value: currentAcc.number, icon: <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: selectedNetwork.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.3 }}><Typography sx={{ color: selectedNetwork.badgeFg, fontWeight: 900, fontSize: selectedNetwork.badgeText.length > 4 ? 7 : 10, lineHeight: 1 }}>{selectedNetwork.badgeText}</Typography></Box> },
                        { label: 'Account Name', value: currentAcc.name.toUpperCase(), icon: <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ fontWeight: 700, fontSize: 14 }}>👤</Typography></Box> },
                        { label: 'Amount', value: amount, icon: <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ color: '#00d4aa', fontWeight: 900, fontSize: 11 }}>GHS</Typography></Box> },
                    ].map((row, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#f9f9f9', borderRadius: 2, mb: i < 2 ? 1.5 : 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {row.icon}
                                <Box>
                                    <Typography sx={{ fontSize: 11, color: '#999' }}>{row.label}</Typography>
                                    <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#1a1a2e' }}>{row.value}</Typography>
                                </Box>
                            </Box>
                            <Button onClick={() => handleCopy(row.value)}
                                sx={{ bgcolor: '#FFCC00', color: '#000', fontWeight: 700, fontSize: 12, px: 2, borderRadius: 2, minWidth: 60, '&:hover': { bgcolor: '#e6b800' } }}>
                                Copy
                            </Button>
                        </Box>
                    ))}
                </Box>

                <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 700, color: selectedNetwork.color, mb: 1.5, fontSize: 14 }}>
                        {selectedNetwork.name.toUpperCase()} STEPS
                    </Typography>
                    <Stack spacing={0.8}>
                        {selectedNetwork.ussd.map((step, i) => (
                            <Typography key={i} sx={{ fontSize: 13, color: '#333' }}>
                                {i + 1}. {step.replace('{number}', currentAcc.number).replace('{amount}', amount)}
                            </Typography>
                        ))}
                    </Stack>
                    <Button fullWidth sx={{ mt: 2, py: 1.2, bgcolor: selectedNetwork.color, color: selectedNetwork.textColor, fontWeight: 700, borderRadius: 2, '&:hover': { opacity: 0.9 } }}
                        onClick={() => window.open(`tel:*110%23`)}>
                        📞 Dial USSD
                    </Button>
                </Box>

                <Box sx={{ p: 3, bgcolor: '#f0fff8', borderLeft: '4px solid #00b894', mx: 2, my: 2, borderRadius: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography sx={{ color: '#00b894', fontWeight: 800, fontSize: 14 }}>CONFIRMED PAYMENT</Typography>
                            <Typography sx={{ color: '#555', fontSize: 12 }}>Payment is typically processed within 5–15 minutes.</Typography>
                        </Box>
                        <Button onClick={() => window.location.reload()}
                            sx={{ bgcolor: '#0070f3', color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 2, '&:hover': { bgcolor: '#0060d3' } }}>
                            REFRESH
                        </Button>
                    </Stack>
                </Box>

                <Box sx={{ p: 3, mx: 2, mb: 2, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>Submit Payment</Typography>
                    <Typography sx={{ color: '#999', fontSize: 12, mb: 1.5 }}>Txn ID</Typography>
                    <input value={momoRef} onChange={e => setMomoRef(e.target.value)}
                        placeholder="Paste your payment SMS or transaction ID"
                        style={{ width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
                    <Button fullWidth onClick={handleMoMoSubmit} disabled={momoLoading}
                        sx={{ py: 1.5, bgcolor: '#1a1a2e', color: '#fff', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#0d0d1a' } }}>
                        {momoLoading ? <CircularProgress size={20} color="inherit" /> : 'Submit Payment'}
                    </Button>
                </Box>

                <Box sx={{ p: 3, mx: 2, mb: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1.5 }}>Your Phone Number</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography>🇬🇭</Typography>
                            <Box>
                                <Typography sx={{ fontSize: 11, color: '#999' }}>Phone Number</Typography>
                                <Typography sx={{ fontWeight: 700 }}>{currentAcc.number}</Typography>
                            </Box>
                        </Stack>
                        <Button onClick={() => setStage('network')}
                            sx={{ bgcolor: '#FFCC00', color: '#000', fontWeight: 700, fontSize: 12, borderRadius: 2, '&:hover': { bgcolor: '#e6b800' } }}>
                            Edit
                        </Button>
                    </Box>
                </Box>

                <Typography sx={{ textAlign: 'center', color: '#999', fontSize: 11, pb: 3 }}>🔒 Your payment is protected with bank-grade security.</Typography>
                <Typography sx={{ textAlign: 'center', color: '#ccc', fontSize: 10, pb: 2 }}>fortellbet.com</Typography>
            </PageShell>
        );
    }

    // ══════════════════════════════════════
    // PAYSTACK
    // ══════════════════════════════════════
    if (view === 'paystack') {
        return (
            <PageShell>
                <Header showBack onBack={backToLanding} subtitle="Pay with Paystack" />
                <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2, color: '#1a1a2e' }}>Enter Deposit Amount</Typography>
                    <AmountInput />
                    <QuickAmounts />

                    <Box sx={{ p: 2, border: '2px solid #0070f3', borderRadius: 2, mb: 3 }}>
                        <Stack direction="row" alignItems="center" gap={2} mb={1}>
                            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#0070f3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 10 }}>PAY</Typography>
                            </Box>
                            <Box>
                                <Typography fontWeight={700} color="#1a1a2e">Card / Paystack</Typography>
                                <Typography fontSize={12} color="#999">Instant — Visa, Mastercard, MoMo</Typography>
                            </Box>
                        </Stack>
                        <Typography sx={{ color: '#555', fontSize: 13 }}>
                            You'll be redirected to a secure Paystack page to complete payment instantly.
                        </Typography>
                    </Box>

                    <Button fullWidth variant="contained"
                        onClick={() => { if (!amount || Number(amount) < 1) { enqueueSnackbar('Enter a valid amount', { variant: 'error' }); return; } handlePaystackDeposit(); }}
                        disabled={paystackLoading}
                        sx={{ py: 1.5, bgcolor: '#0070f3', '&:hover': { bgcolor: '#0060d3' }, fontWeight: 700, fontSize: 15, borderRadius: 2 }}>
                        {paystackLoading ? <CircularProgress size={20} color="inherit" /> : `Pay GHS ${amount || '0.00'} with Paystack →`}
                    </Button>
                    <SecurityNote />
                </Box>
            </PageShell>
        );
    }

    // ══════════════════════════════════════
    // CRYPTO — form
    // ══════════════════════════════════════
    if (view === 'crypto' && stage === 'form') {
        return (
            <PageShell>
                <Header showBack onBack={backToLanding} subtitle="Pay with Crypto" />
                <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2, color: '#1a1a2e' }}>Enter Deposit Amount</Typography>
                    <AmountInput />
                    <QuickAmounts />

                    <Box sx={{ p: 2, border: '2px solid #F7931A', borderRadius: 2, mb: 3 }}>
                        <Stack direction="row" alignItems="center" gap={2}>
                            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#F7931A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>₿</Typography>
                            </Box>
                            <Box>
                                <Typography fontWeight={700} color="#1a1a2e">Cryptocurrency</Typography>
                                <Typography fontSize={12} color="#999">BTC, ETH, USDT (TRC20)</Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Button fullWidth variant="contained"
                        onClick={() => { if (!amount || Number(amount) < 1) { enqueueSnackbar('Enter a valid amount', { variant: 'error' }); return; } setStage('crypto'); }}
                        sx={{ py: 1.5, bgcolor: '#F7931A', '&:hover': { bgcolor: '#e08016' }, fontWeight: 700, fontSize: 15, borderRadius: 2 }}>
                        Continue →
                    </Button>
                    <SecurityNote />
                </Box>
            </PageShell>
        );
    }

    // ══════════════════════════════════════
    // CRYPTO — addresses & submit
    // ══════════════════════════════════════
    if (view === 'crypto' && stage === 'crypto') {
        return (
            <PageShell>
                <Header showBack onBack={() => setStage('form')} subtitle="Pay with Crypto" />
                <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1, color: '#1a1a2e' }}>₿ Crypto Deposit</Typography>
                    <Typography sx={{ color: '#999', fontSize: 13, mb: 2 }}>
                        Send the crypto equivalent of GHS {amount} to any address below.
                    </Typography>
                    {CRYPTO_ACCOUNTS.map((acc, i) => (
                        <Box key={i} sx={{ p: 2, border: '1px solid #f0f0f0', borderRadius: 2, mb: 1.5 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography fontWeight={700} fontSize={14}>{acc.icon} {acc.coin} — {acc.network}</Typography>
                                <Button onClick={() => handleCopy(acc.address)}
                                    sx={{ bgcolor: '#FFCC00', color: '#000', fontWeight: 700, fontSize: 11, px: 1.5, borderRadius: 2, minWidth: 50 }}>
                                    Copy
                                </Button>
                            </Stack>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all', bgcolor: '#f9f9f9', p: 1, borderRadius: 1, fontSize: 11 }}>
                                {acc.address}
                            </Typography>
                        </Box>
                    ))}
                    <TextField label="Transaction Hash/ID" value={reference} onChange={e => setReference(e.target.value)} fullWidth size="small" sx={{ mb: 2 }} />
                    <Button variant="contained" onClick={handleCryptoSubmit} fullWidth disabled={loading}
                        sx={{ py: 1.5, bgcolor: '#F7931A', fontWeight: 700, borderRadius: 2 }}>
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit Crypto Deposit'}
                    </Button>
                    <SecurityNote />
                </Box>
            </PageShell>
        );
    }

    return null;
};

export default DepositPage;
