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
    const [won, setWon] = useState<boolean | null>(null);
    const [betResultArray, setBetResultArray] = useState<any[]>([]);
    const intervalRef = useRef<any>(null);

    const winAudio = new Audio(winSound);
    const betAudio = new Audio(betSound);

    const handleBet = async () => {
        if (!betAmount || parseFloat(betAmount) <= 0) return enqueueSnackbar('Enter a valid bet', { variant: 'error' });
        if (parseFloat(betAmount) > totalAmount) return enqueueSnackbar('Not enough balance', { variant: 'error' });

        betAudio.play();
        setIsBetStarted(true);
        setCrashed(false);
        setWon(null);
        setMultiplier(1.0);

        let current = 1.0;
        intervalRef.current = setInterval(() => {
            current = parseFloat((current + 0.05).toFixed(2));
            setMultiplier(current);
        }, 100);

        try {
            const response = await playCrash(parseFloat(betAmount), parseFloat(autoCashout));
            if (response.success) {
                const { crashAt, cashedOutAt, win, payout, newBalance } = response.data;
                const animTime = Math.min((crashAt - 1) * 2000, 8000);
                setTimeout(() => {
                    clearInterval(intervalRef.current);
                    setMultiplier(crashAt);
                    setCrashed(true);
                    setWon(win);
                    if (win) winAudio.play();
                    setBetResultArray(prev => [{ crashAt, cashedOutAt, win, payout, amount: parseFloat(betAmount) }, ...prev].slice(0, 5));
                    dispatch({ type: 'balance/setBalance', payload: newBalance });
                    setIsBetStarted(false);
                }, animTime);
            } else {
                clearInterval(intervalRef.current);
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
                        <Button fullWidth variant="contained" disabled={isBetStarted} onClick={handleBet}
                            sx={{ mt: 4, py: 1.5, fontWeight: 700, backgroundColor: '#00e676', color: '#000', '&:hover': { backgroundColor: '#00c853' }, borderRadius: 2 }}>
                            {isBetStarted ? '🚀 Flying...' : '🚀 Place Bet'}
                        </Button>
                    </Grid>

                    <Grid size={{ xs: 12, md: 9 }} sx={{ position: 'relative', minHeight: '85vh', p: 2, order: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 0.5 }}>
                            {betResultArray.map((item, i) => (
                                <Box key={i} sx={{ px: 2, py: 1, fontWeight: 'bold', fontSize: '0.75rem', borderRadius: 9999, bgcolor: item.win ? '#00e676' : '#f44336', color: '#000' }}>
                                    {item.crashAt}x {item.win ? `Won ${item.payout.toFixed(2)}` : `Lost ${item.amount.toFixed(2)}`}
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <Typography sx={{
                                fontSize: '6rem', fontWeight: 900,
                                color: crashed ? '#f44336' : '#00e676',
                                textShadow: crashed ? '0 0 30px #f44336' : '0 0 30px #00e676',
                                transition: 'color 0.3s'
                            }}>
                                {multiplier.toFixed(2)}x
                            </Typography>
                            <Typography sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
                                {crashed ? '💥 CRASHED!' : isBetStarted ? '🚀 Flying...' : 'Place your bet!'}
                            </Typography>
                            {won !== null && (
                                <Typography sx={{ color: won ? '#00e676' : '#f44336', fontSize: '1.2rem', fontWeight: 700 }}>
                                    {won ? `🎉 Cashed out at ${betResultArray[0]?.cashedOutAt}x! Won ${betResultArray[0]?.payout.toFixed(2)}` : `😞 Crashed at ${betResultArray[0]?.crashAt}x`}
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Crash;
