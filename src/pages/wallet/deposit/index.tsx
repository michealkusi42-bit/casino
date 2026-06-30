cat > /mnt/user-data/outputs/DepositPage.tsx << 'ENDOFFILE'
import { useSnackbar } from 'notistack';
import { useTranslate } from 'locales';
import { useState, useEffect, useRef } from 'react';
import {
    Box, Button, CircularProgress, IconButton,
    Stack, Typography, TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg',
        clickable: false, // visible & clear, but tapping does nothing
        accounts: [],
        ussd: [],
    },
    {
        id: 'Telecel',
        name: 'Telecel Vodafone',
        color: '#E30613',
        textColor: '#fff',
        logo: 'https://www.telecelghana.com/wp-content/uploads/2023/10/Telecel-Logo.png',
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
        logo: 'https://airteltigo.com.gh/wp-content/uploads/2019/01/AirtelTigo-Logo.png',
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

// 3 tabs — each redirects to its own URL
const DEPOSIT_TABS = [
    { id: 'momo',     label: 'MoMo',     icon: '📱', path: '/wallet/deposit/momo'     },
    { id: 'paystack', label: 'Paystack',  icon: '💳', path: '/wallet/deposit/paystack' },
    { id: 'crypto',   label: 'Crypto',    icon: '₿',  path: '/wallet/deposit/crypto'   },
];

type Stage = 'form' | 'network' | 'payment' | 'crypto';

const DepositPage = () => {
    const { t } = useTranslate();
    const { enqueueSnackbar } = useSnackbar();
    const token = localStorage.getItem('betthrob-accessToken') || sessionStorage.getItem('betthrob-accessToken');

    const getActiveTab = () => {
        const path = window.location.pathname;
        if (path.includes('/paystack')) return 'paystack';
        if (path.includes('/crypto'))   return 'crypto';
        return 'momo';
    };

    const [activeTab, setActiveTab]               = useState(getActiveTab());
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

    const handleTabChange = (tab: typeof DEPOSIT_TABS[0]) => {
        setActiveTab(tab.id);
        setStage('form');
        setAmount('');
        setSelectedNetwork(null);
        window.history.pushState({}, '', tab.path);
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

    // ── Shared tab bar ──
    const TabBar = () => (
        <Box sx={{ display: 'flex', bgcolor: '#fff', borderBottom: '2px solid #f0f0f0' }}>
            {DEPOSIT_TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <Box key={tab.id} onClick={() => handleTabChange(tab)}
                        sx={{
                            flex: 1, py: 1.8, textAlign: 'center', cursor: 'pointer',
                            borderBottom: isActive ? '3px solid #00d4aa' : '3px solid transparent',
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#f9f9f9' }
                        }}>
                        <Typography sx={{ fontSize: 18, mb: 0.2 }}>{tab.icon}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: isActive ? 800 : 500, color: isActive ? '#00d4aa' : '#888', letterSpacing: 0.5 }}>
                            {tab.label}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );

    // ── Shared dark header ──
    const Header = ({ showBack, onBack, subtitle }: { showBack?: boolean; onBack?: () => void; subtitle?: string }) => (
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', p: 3, borderRadius: '12px 12px 0 0' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                {showBack && <IconButton onClick={onBack} sx={{ color: '#fff' }}><ArrowBackIcon /></IconButton>}
                <Box>
                    <Typography sx={{ color: '#00d4aa', fontWeight: 900, fontSize: showBack ? 20 : 28, letterSpacing: 2 }}>$FORETELL</Typography>
                    {subtitle && <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, mt: 0.3 }}>{subtitle}</Typography>}
                </Box>
            </Stack>
        </Box>
    );

    // ── Quick-amount chips ──
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

    // ══════════════════════════════════════
    // MOMO TAB — form
    // ══════════════════════════════════════
    if (activeTab === 'momo' && stage === 'form') {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 2 }}>
                <Box sx={{ maxWidth: 420, mx: 'auto' }}>
                    <Header subtitle="Secure Payment Portal" />
                    <TabBar />
                    <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: '0 0 12px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
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
                </Box>
            </Box>
        );
    }

    // ══════════════════════════════════════
    // MOMO TAB — network selection
    // ══════════════════════════════════════
    if (activeTab === 'momo' && stage === 'network') {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 2 }}>
                <Box sx={{ maxWidth: 420, mx: 'auto' }}>
                    <Header showBack onBack={() => setStage('form')} subtitle="Select Payment Method" />
                    <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: '0 0 12px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                        <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>Amount: GHS {amount}</Typography>
                        <Typography sx={{ color: '#999', fontSize: 13, mb: 3 }}>Choose your mobile money network</Typography>
                        <Stack spacing={2}>
                            {NETWORKS.map(net => (
                                <Box key={net.id}
                                    onClick={() => {
                                        if (!net.clickable) return; // MTN: do nothing
                                        setSelectedNetwork(net);
                                        setCurrentAccountIndex(0);
                                        setStage('payment');
                                    }}
                                    sx={{
                                        p: 2, borderRadius: 2, border: '2px solid',
                                        borderColor: net.color,
                                        cursor: net.clickable ? 'pointer' : 'default',
                                        opacity: 1, // always fully visible
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        transition: 'all 0.2s',
                                        '&:hover': net.clickable ? { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${net.color}40` } : {}
                                    }}>
                                    <img src={net.logo} alt={net.name}
                                        style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 8 }}
                                        onError={(e: any) => { e.target.style.display = 'none'; }} />
                                    <Box flex={1}>
                                        <Typography fontWeight={700} color="#1a1a2e" fontSize={15}>{net.name}</Typography>
                                        <Typography fontSize={12} color={net.clickable ? '#00b894' : '#aaa'}>
                                            {net.clickable ? 'Available' : 'Coming Soon'}
                                        </Typography>
                                    </Box>
                                    {net.clickable && <Typography sx={{ color: net.color, fontWeight: 700, fontSize: 18 }}>→</Typography>}
                                </Box>
                            ))}
                        </Stack>
                        <SecurityNote />
                    </Box>
                </Box>
            </Box>
        );
    }

    // ══════════════════════════════════════
    // MOMO TAB — payment details
    // ══════════════════════════════════════
    if (activeTab === 'momo' && stage === 'payment' && selectedNetwork) {
        const currentAcc = selectedNetwork.accounts[currentAccountIndex];
        const timeColor  = countdown < 120 ? '#E30613' : countdown < 300 ? '#FF8C00' : '#00b894';

        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 2 }}>
                <Box sx={{ maxWidth: 420, mx: 'auto' }}>
                    <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', p: 3, borderRadius: '12px 12px 0 0' }}>
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

                    <Box sx={{ bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                        {/* Payment info rows */}
                        <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
                            <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 2, fontSize: 15 }}>Payment Information</Typography>
                            {[
                                { label: 'Account Number', value: currentAcc.number, icon: <img src={selectedNetwork.logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6 }} onError={(e: any) => { e.target.style.display = 'none'; }} /> },
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

                        {/* USSD steps */}
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

                        {/* Confirmed payment */}
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

                        {/* Submit txn ID */}
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

                        {/* Phone number */}
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
                    </Box>
                </Box>
            </Box>
        );
    }

    // ══════════════════════════════════════
    // PAYSTACK TAB
    // ══════════════════════════════════════
    if (activeTab === 'paystack') {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 2 }}>
                <Box sx={{ maxWidth: 420, mx: 'auto' }}>
                    <Header subtitle="Secure Payment Portal" />
                    <TabBar />
                    <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: '0 0 12px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2, color: '#1a1a2e' }}>Enter Deposit Amount</Typography>
                        <AmountInput />
                        <QuickAmounts />

                        {/* Paystack info card */}
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
                </Box>
            </Box>
        );
    }

    // ══════════════════════════════════════
    // CRYPTO TAB — form
    // ══════════════════════════════════════
    if (activeTab === 'crypto' && stage === 'form') {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 2 }}>
                <Box sx={{ maxWidth: 420, mx: 'auto' }}>
                    <Header subtitle="Secure Payment Portal" />
                    <TabBar />
                    <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: '0 0 12px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2, color: '#1a1a2e' }}>Enter Deposit Amount</Typography>
                        <AmountInput />
                        <QuickAmounts />

                        {/* Crypto info card */}
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
                </Box>
            </Box>
        );
    }

    // ══════════════════════════════════════
    // CRYPTO TAB — addresses & submit
    // ══════════════════════════════════════
    if (activeTab === 'crypto' && stage === 'crypto') {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 2 }}>
                <Box sx={{ maxWidth: 420, mx: 'auto' }}>
                    <Header showBack onBack={() => setStage('form')} />
                    <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: '0 0 12px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
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
                </Box>
            </Box>
        );
    }

    return null;
};

export default DepositPage;
