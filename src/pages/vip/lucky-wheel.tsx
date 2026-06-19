import { useEffect, useState, useRef } from 'react';
import { Box, Button, CircularProgress, Stack, Typography, Chip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'store/store';
import { balanceAction } from 'store/slices/balance';

const API = 'https://foretell-backend-production-58a6.up.railway.app';

// Prize segments matching backend PRIZES array
const SEGMENTS = [
    { label: 'GHS 5', sublabel: 'Bonus', color: '#00BAE6' },
    { label: 'GHS 10', sublabel: 'Bonus', color: '#00e701' },
    { label: 'GHS 20', sublabel: 'Bonus', color: '#F7931A' },
    { label: '5', sublabel: 'Free Spins', color: '#9B59B6' },
    { label: '10', sublabel: 'Free Spins', color: '#1E88E5' },
    { label: 'T-Shirt', sublabel: 'Foretell', color: '#E53935' },
    { label: 'GHS 50', sublabel: 'Jackpot 🎰', color: '#FFD700' },
];

const SEGMENT_COUNT = SEGMENTS.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

const LuckyWheel = () => {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const balance = useSelector((state: any) => state.balance);
    const token = localStorage.getItem('betthrob-accessToken') || sessionStorage.getItem('betthrob-accessToken');

    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [status, setStatus] = useState<any>(null);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [prize, setPrize] = useState<any>(null);
    const [showPrize, setShowPrize] = useState(false);
    const currentRotation = useRef(0);

    const authHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    const loadStatus = async () => {
        try {
            const res = await fetch(`${API}/api/vip-spin/status`, { headers: authHeader });
            const data = await res.json();
            setStatus(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingStatus(false);
        }
    };

    useEffect(() => {
        loadStatus();
    }, []);

    const handleSpin = async () => {
        if (spinning || !status?.spinsAvailable) return;

        setSpinning(true);
        setShowPrize(false);
        setPrize(null);

        try {
            const res = await fetch(`${API}/api/vip-spin/spin`, {
                method: 'POST',
                headers: authHeader
            });
            const data = await res.json();

            if (data.prize) {
                // Find segment index
                let segmentIdx = SEGMENTS.findIndex(s =>
                    s.label.includes(String(data.prize.value)) ||
                    data.prize.label.includes(s.label)
                );
                if (segmentIdx < 0) segmentIdx = Math.floor(Math.random() * SEGMENT_COUNT);

                // Calculate final rotation
                const targetAngle = 360 - (segmentIdx * SEGMENT_ANGLE + SEGMENT_ANGLE / 2);
                const extraSpins = 6 * 360;
                const newRotation = currentRotation.current + extraSpins + (targetAngle - (currentRotation.current % 360) + 360) % 360;

                currentRotation.current = newRotation;
                setRotation(newRotation);

                setTimeout(() => {
                    setPrize(data.prize);
                    setShowPrize(true);
                    setSpinning(false);
                    loadStatus();

                    if (data.balance !== undefined) {
                        dispatch(balanceAction({
                            ...balance,
                            amount: data.balance,
                        }));
                    }

                    enqueueSnackbar(`🎉 You won ${data.prize.label}!`, { variant: 'success' });
                }, 5000);
            } else {
                enqueueSnackbar(data.error || 'No spins available', { variant: 'error' });
                setSpinning(false);
            }
        } catch (e) {
            enqueueSnackbar('Network error', { variant: 'error' });
            setSpinning(false);
        }
    };

    return (
        <Box sx={{
            position: 'relative',
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0d1b2a 0%, #1a0533 100%)',
            border: '1px solid rgba(255,215,0,0.2)',
            p: { xs: 2, sm: 3 },
        }}>
            {/* Background glow */}
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <Stack alignItems="center" spacing={2}>
                {/* Title */}
                <Stack alignItems="center">
                    <Typography variant="h5" fontWeight={900} sx={{
                        color: '#FFD700',
                        letterSpacing: 3,
                        textShadow: '0 0 20px rgba(255,215,0,0.5)',
                        textTransform: 'uppercase'
                    }}>
                        🎡 VIP Lucky Wheel
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Invite friends to earn free spins!
                    </Typography>
                </Stack>

                {loadingStatus ? (
                    <CircularProgress sx={{ color: '#FFD700' }} />
                ) : (
                    <>
                        {/* Status chips */}
                        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                            <Chip
                                label={`👥 ${status?.referralCount || 0}/${status?.referralsNeeded || 10} Referrals`}
                                size="small"
                                sx={{ bgcolor: 'rgba(0,231,1,0.1)', color: '#00e701', border: '1px solid rgba(0,231,1,0.3)', fontWeight: 700 }}
                            />
                            <Chip
                                label={`✅ ${status?.qualifiedReferralCount || 0}/${status?.qualifiedNeeded || 5} Qualified`}
                                size="small"
                                sx={{ bgcolor: 'rgba(0,186,230,0.1)', color: '#00BAE6', border: '1px solid rgba(0,186,230,0.3)', fontWeight: 700 }}
                            />
                            <Chip
                                label={`🎡 ${status?.spinsAvailable || 0} Spins Available`}
                                size="small"
                                sx={{ bgcolor: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', fontWeight: 700 }}
                            />
                        </Stack>

                        {/* Wheel container */}
                        <Box sx={{ position: 'relative', width: { xs: 300, sm: 380 }, height: { xs: 300, sm: 380 } }}>

                            {/* Light ring behind wheel */}
                            <Box
                                component="img"
                                src="/assets/freespin/light.webp"
                                sx={{
                                    position: 'absolute',
                                    top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '110%', height: '110%',
                                    objectFit: 'contain',
                                    animation: 'rotateLights 8s linear infinite',
                                    '@keyframes rotateLights': {
                                        from: { transform: 'translate(-50%, -50%) rotate(0deg)' },
                                        to: { transform: 'translate(-50%, -50%) rotate(360deg)' }
                                    },
                                    opacity: 0.8,
                                }}
                                onError={(e: any) => { e.target.style.display = 'none'; }}
                            />

                            {/* Main spinning wheel */}
                            <Box sx={{
                                position: 'absolute',
                                top: '50%', left: '50%',
                                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                                transition: spinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                                width: '85%', height: '85%',
                            }}>
                                <Box
                                    component="img"
                                    src="/assets/freespin/spin.webp"
                                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    onError={(e: any) => {
                                        // Fallback SVG wheel if image missing
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </Box>

                            {/* Inner circle */}
                            <Box
                                component="img"
                                src="/assets/freespin/inner-circle.png"
                                sx={{
                                    position: 'absolute',
                                    top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '25%', height: '25%',
                                    objectFit: 'contain',
                                    zIndex: 3,
                                }}
                                onError={(e: any) => { e.target.style.display = 'none'; }}
                            />

                            {/* Pointer at top */}
                            <Box
                                component="img"
                                src="/assets/freespin/point.webp"
                                sx={{
                                    position: 'absolute',
                                    top: -10,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 40, height: 50,
                                    objectFit: 'contain',
                                    zIndex: 5,
                                    filter: 'drop-shadow(0 2px 8px rgba(255,215,0,0.8))',
                                }}
                                onError={(e: any) => {
                                    // CSS fallback pointer
                                    e.target.style.display = 'none';
                                }}
                            />

                            {/* CSS fallback pointer */}
                            <Box sx={{
                                position: 'absolute',
                                top: -8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 0, height: 0,
                                borderLeft: '14px solid transparent',
                                borderRight: '14px solid transparent',
                                borderTop: '28px solid #FFD700',
                                zIndex: 4,
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                            }} />
                        </Box>

                        {/* Spin button with image */}
                        <Box sx={{ position: 'relative', mt: -2 }}>
                            <Button
                                onClick={handleSpin}
                                disabled={spinning || !status?.spinsAvailable}
                                sx={{
                                    p: 0, minWidth: 0,
                                    position: 'relative',
                                    '&:disabled': { opacity: 0.5 }
                                }}
                            >
                                <Box
                                    component="img"
                                    src="/assets/freespin/button.png"
                                    sx={{
                                        width: { xs: 140, sm: 180 },
                                        height: 'auto',
                                        objectFit: 'contain',
                                        filter: spinning ? 'grayscale(50%)' : 'none',
                                        transition: 'filter 0.3s',
                                        '&:hover': { filter: 'brightness(1.2)' },
                                    }}
                                    onError={(e: any) => { e.target.style.display = 'none'; }}
                                />
                                {/* Text overlay on button */}
                                <Typography sx={{
                                    position: 'absolute',
                                    top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    color: '#000',
                                    fontWeight: 900,
                                    fontSize: { xs: '0.85rem', sm: '1rem' },
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    pointerEvents: 'none',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {spinning ? '...' : status?.spinsAvailable ? '🎡 SPIN!' : '🔒 Locked'}
                                </Typography>
                            </Button>
                        </Box>

                        {/* Prize won display */}
                        {showPrize && prize && (
                            <Box sx={{
                                width: '100%', p: 2.5, borderRadius: 3,
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, rgba(0,231,1,0.1), rgba(255,215,0,0.1))',
                                border: '2px solid #FFD700',
                                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                '@keyframes popIn': {
                                    from: { transform: 'scale(0.5)', opacity: 0 },
                                    to: { transform: 'scale(1)', opacity: 1 }
                                }
                            }}>
                                <Typography sx={{ fontSize: '2.5rem', mb: 0.5 }}>🎉</Typography>
                                <Typography fontWeight={900} sx={{ color: '#FFD700', fontSize: '1.4rem' }}>
                                    YOU WON!
                                </Typography>
                                <Typography fontWeight={800} sx={{ color: '#00e701', fontSize: '1.2rem' }}>
                                    {prize.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {prize.type === 'credit' && `GHS ${prize.value} credited to your balance`}
                                    {prize.type === 'free_spins' && `${prize.value} free spins added`}
                                    {prize.type === 'merch' && 'Contact support to claim your prize!'}
                                </Typography>
                            </Box>
                        )}

                        {/* How to earn */}
                        {!status?.spinsAvailable && (
                            <Box sx={{
                                width: '100%', p: 2, borderRadius: 2,
                                bgcolor: 'rgba(255,215,0,0.05)',
                                border: '1px solid rgba(255,215,0,0.15)'
                            }}>
                                <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 2, display: 'block' }}>
                                    <strong style={{ color: '#FFD700' }}>🎯 How to earn spins:</strong><br />
                                    1. Invite <strong style={{ color: '#00e701' }}>{status?.referralsNeeded || 10} friends</strong> using your referral link<br />
                                    2. <strong style={{ color: '#00BAE6' }}>{status?.qualifiedNeeded || 5}</strong> of them must bet GHS 50+<br />
                                    3. Earn <strong style={{ color: '#FFD700' }}>1 FREE spin</strong> per qualifying group!
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Stack>
        </Box>
    );
};

export default LuckyWheel;
