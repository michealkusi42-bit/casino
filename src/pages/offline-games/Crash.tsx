import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'store/store';
import { useSnackbar } from 'notistack';
import { Box, Button, Grid, TextField, Typography, InputAdornment } from '@mui/material';
import ruppee from 'assets/ruppee.svg';
import winSound from 'assets/winDice.mp3';
import betSound from 'assets/betClick.mp3';
import { playCrash } from 'api';

const Crash = () => {
    const totalAmount = useSelector((state: any) => state.balance);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [betAmount, setBetAmount] = useState('100.0');
    const [autoCashout, setAutoCashout] = useState('2.00');
    const [isBetStarted, setIsBetStarted] = useState(false);
    const [multiplier, setMultiplier] = useState(1.0);
    const [crashed, setCrashed] = useState(false);
    const [cashedOut, setCashedOut] = useState(false);
    const [won, setWon] = useState<boolean | null>(null);
    const [betResultArray, setBetResultArray] = useState<any[]>([]);
    const [planeX, setPlaneX] = useState(0);
    const [planeY, setPlaneY] = useState(0);
    const intervalRef = useRef<any>(null);
    const crashAtRef = useRef<number>(0);
    const payoutRef = useRef<number>(0);
    const newBalanceRef = useRef<number>(0);

    const winAudio = new Audio(winSound);
    const betAudio = new Audio(betSound);

    const handleCashout = () => {
        if (!isBetStarted || crashed || cashedOut) return;
        clearInterval(intervalRef.current);
        setCashedOut(true);
        const payout = parseFloat((parseFloat(betAmount) * multiplier).toFixed(2));
        setWon(true);
        winAudio.play();
        setBetResultArray(prev => [{ crashAt: crashAtRef.current, cashedOutAt: multiplier, win: true, payout, amount: parseFloat(betAmount) }, ...prev].slice(0, 5));
        dispatch({ type: 'balance/setBalance', payload: newBalanceRef.current });
        setIsBetStarted(false);
    };

    const handleBet = async () => {
        if (!betAmount || parseFloat(betAmount) <= 0) return enqueueSnackbar('Enter a valid bet', { variant: 'error' });
        if (parseFloat(betAmount) > totalAmount) return enqueueSnackbar('Not enough balance', { variant: 'error' });

        betAudio.play();
        setIsBetStarted(true);
        setCrashed(false);
        setCashedOut(false);
        setWon(null);
        setMultiplier(1.0);
        setPlaneX(0);
        setPlaneY(0);

        try {
            const response = await playCrash(parseFloat(betAmount), parseFloat(autoCashout));
            if (response.success) {
                const { crashAt, cashedOutAt, win, payout, newBalance } = response.data;
                crashAtRef.current = crashAt;
                payoutRef.current = payout;
                newBalanceRef.current = newBalance;

                let current = 1.0;
                let frame = 0;
                intervalRef.current = setInterval(() => {
                    current = parseFloat((current + 0.03).toFixed(2));
                    frame++;
                    setMultiplier(current);
                    setPlaneX(Math.min(frame * 2, 80));
                    setPlaneY(Math.min(frame * 1.5, 60));

                    // Auto cashout
                    if (cashedOutAt && current >= cashedOutAt && !cashedOut) {
                        clearInterval(intervalRef.current);
                        setCashedOut(true);
                        setWon(true);
                        winAudio.play();
                        setBetResultArray(prev => [{ crashAt, cashedOutAt, win: true, payout, amount: parseFloat(betAmount) }, ...prev].slice(0, 5));
                        dispatch({ type: 'balance/setBalance', payload: newBalance });
                        setIsBetStarted(false);
                        return;
                    }

                    if (current >= crashAt) {
                        clearInterval(intervalRef.current);
                        setMultiplier(crashAt);
                        setCrashed(true);
                        if (!win) {
                            setWon(false);
                            setBetResultArray(prev => [{ crashAt, cashedOutAt: null, win: false, payout: 0, amount: parseFloat(betAmount) }, ...prev].slice(0, 5));
                        }
                        setIsBetStarted(false);
                    }
                }, 100);
            } else {
                setIsBetStarted(false);
                enqueueSnackbar(response.message || 'Failed', { variant: 'error' });
            }
        } catch (error: any) {
            clearInterval(intervalRef.current);
            setIsBetStarted(false);
            enqueueSnackbar(error.response?.data?.message || 'Failed', { variant: 'error' });
        }
    };

    useEffect(() => () => clearInterval(intervalRef.current), []);

    return (
        <Box sx={{ bgcolor: '#1a2c38', minHeight: '100vh', pt: 4, px: 1.5 }}>
            <Box sx={{ bgcolor: '#0f212e', maxWidth: '1536px', mx: 'auto', borderRadius: 2, overflow: 'hidden' }}>
                <Grid container>
                    {/* Left Panel */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ order: { xs: 2, md: 1 }, bgcolor: '#213743', py: 5, px: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>Bet Amount</Typography>
                            <Box sx={{ display: 'flex', bgcolor: '#2f4553', p: '4px', borderRadius: 1 }}>
                                <TextField type="number" disabled={isBetStarted} value={betAmount} onChange={e => setBetAmount(e.target.value)} size="small"
                                    sx={{ width: '55%', input: { bgcolor: '#0f212e', color: '#fff', padding: '10px' }, '& fieldset': { border: 'none' } }}
                                    InputProps={{ endAdornment: <InputAdornment position="end"><Box component="img" src={ruppee} sx={{ width: 16, height: 16 }} /></InputAdornment> }} />
                                <Box sx={{ display: 'flex', width: '45%', alignItems: 'center' }}>
                                    <Button disabled={isBetStarted} onClick={() => setBetAmount(a => (Number(a) / 2).toFixed(2))} sx={{ width: '50%', color: '#fff', minWidth: 0 }}>½</Button>
                                    <Box sx={{ width: '3px', height: '20px', bgcolor: '#1a2c38', borderRadius: '4px' }} />
                                    <Button disabled={isBetStarted} onClick={() => setBetAmount(a => (Number(a) * 2).toFixed(2))} sx={{ width: '50%', color: '#fff', minWidth: 0 }}>2×</Button>
                                </Box>
                            </Box>

                            <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>Auto Cashout At</Typography>
                            <TextField type="number" disabled={isBetStarted} value={autoCashout} onChange={e => setAutoCashout(e.target.value)} size="small"
                                sx={{ input: { bgcolor: '#0f212e', color: '#fff', padding: '10px' }, '& fieldset': { border: 'none' }, bgcolor: '#2f4553', borderRadius: 1 }} />
                        </Box>

                        {/* Place Bet / Cashout Button */}
                        {!isBetStarted ? (
                            <Button fullWidth variant="contained" onClick={handleBet}
                                sx={{ mt: 4, py: 1.5, fontWeight: 700, backgroundColor: '#00e676', color: '#000', '&:hover': { backgroundColor: '#00c853' }, borderRadius: 2 }}>
                                🚀 Place Bet
                            </Button>
                        ) : (
                            <Button fullWidth variant="contained" onClick={handleCashout}
                                disabled={cashedOut || crashed}
                                sx={{ mt: 4, py: 1.5, fontWeight: 700, fontSize: '1.1rem', backgroundColor: '#ffd700', color: '#000', '&:hover': { backgroundColor: '#ffed4a' }, borderRadius: 2, animation: 'pulse 1s infinite', '@keyframes pulse': { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)' } } }}>
                                💰 Cash Out {multiplier.toFixed(2)}x
                            </Button>
                        )}

                        {/* History */}
                        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {betResultArray.map((item, i) => (
                                <Box key={i} sx={{ px: 2, py: 1, fontWeight: 'bold', fontSize: '0.75rem', borderRadius: 1, bgcolor: item.win ? '#00e67622' : '#f4433622', color: item.win ? '#00e676' : '#f44336', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{item.crashAt}x</span>
                                    <span>{item.win ? `Won ${item.payout.toFixed(2)}` : `Lost ${item.amount.toFixed(2)}`}</span>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* Right Panel - Game Area */}
                    <Grid size={{ xs: 12, md: 9 }} sx={{ position: 'relative', minHeight: '85vh', p: 2, order: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

                        {/* Sky background */}
                        <Box sx={{ position: 'absolute', inset: 0, background: crashed ? 'linear-gradient(180deg, #1a0000 0%, #0f212e 100%)' : 'linear-gradient(180deg, #0a1628 0%, #0f212e 100%)', transition: 'background 0.5s' }} />

                        {/* Stars */}
                        {[...Array(20)].map((_, i) => (
                            <Box key={i} sx={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', bgcolor: '#fff', opacity: 0.5, top: `${Math.random() * 80}%`, left: `${Math.random() * 100}%` }} />
                        ))}

                        {/* Plane */}
                        {!crashed && (
                            <Box sx={{
                                position: 'absolute',
                                left: `${planeX}%`,
                                bottom: `${20 + planeY}%`,
                                fontSize: '3rem',
                                transition: 'all 0.1s linear',
                                filter: isBetStarted ? 'drop-shadow(0 0 10px #00e676)' : 'none',
                                transform: 'rotate(-20deg)'
                            }}>
                                ✈️
                            </Box>
                        )}

                        {/* Explosion */}
                        {crashed && (
                            <Box sx={{ position: 'absolute', left: `${planeX}%`, bottom: `${20 + planeY}%`, fontSize: '4rem' }}>
                                💥
                            </Box>
                        )}

                        {/* Multiplier */}
                        <Typography sx={{
                            position: 'relative',
                            fontSize: '5rem', fontWeight: 900,
                            color: crashed ? '#f44336' : cashedOut ? '#ffd700' : '#00e676',
                            textShadow: crashed ? '0 0 40px #f44336' : '0 0 40px #00e676',
                            transition: 'color 0.3s',
                            zIndex: 10
                        }}>
                            {multiplier.toFixed(2)}x
                        </Typography>

                        <Typography sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, zIndex: 10, position: 'relative' }}>
                            {crashed ? '💥 CRASHED!' : cashedOut ? '💰 Cashed Out!' : isBetStarted ? '🚀 Flying...' : 'Place your bet!'}
                        </Typography>

                        {/* Result message */}
                        {won !== null && (
                            <Typography sx={{ color: won ? '#00e676' : '#f44336', fontSize: '1.2rem', fontWeight: 700, mt: 2, zIndex: 10, position: 'relative' }}>
                                {won
                                    ? `🎉 Cashed out at ${betResultArray[0]?.cashedOutAt}x! Won ${betResultArray[0]?.payout.toFixed(2)}`
                                    : `😞 Crashed at ${betResultArray[0]?.crashAt}x. Lost ${betResultArray[0]?.amount.toFixed(2)}`}
                            </Typography>
                        )}

                        {/* Ground line */}
                        <Box sx={{ position: 'absolute', bottom: '18%', left: 0, right: 0, height: 2, bgcolor: '#2f4553' }} />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Crash;
