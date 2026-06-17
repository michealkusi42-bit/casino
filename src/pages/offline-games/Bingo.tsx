import { useState } from 'react';
import { useSelector, useDispatch } from 'store/store';
import { useSnackbar } from 'notistack';
import { Box, Button, Grid, TextField, Typography, InputAdornment } from '@mui/material';
import ruppee from 'assets/ruppee.svg';
import winSound from 'assets/winDice.mp3';
import betSound from 'assets/betClick.mp3';
import { playBingo } from 'api';

const Bingo = () => {
    const totalAmount = useSelector((state: any) => state.balance);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [betAmount, setBetAmount] = useState('100.0');
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [isBetStarted, setIsBetStarted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);

    const winAudio = new Audio(winSound);
    const betAudio = new Audio(betSound);

    const toggleNumber = (n: number) => {
        if (selectedNumbers.includes(n)) {
            setSelectedNumbers(prev => prev.filter(x => x !== n));
        } else if (selectedNumbers.length < 24) {
            setSelectedNumbers(prev => [...prev, n]);
        }
    };

    const handleBet = async () => {
        if (selectedNumbers.length < 1) return enqueueSnackbar('Pick at least 1 number!', { variant: 'error' });
        if (parseFloat(betAmount) <= 0) return enqueueSnackbar('Enter a valid bet', { variant: 'error' });
        if (parseFloat(betAmount) > totalAmount) return enqueueSnackbar('Not enough balance', { variant: 'error' });

        betAudio.play();
        setIsBetStarted(true);
        setResult(null);
        setDrawnNumbers([]);

        try {
            const response = await playBingo(parseFloat(betAmount), selectedNumbers);
            if (response.success) {
                const { drawnNumbers: drawn, matches, win, payout, newBalance } = response.data;

                // Animate drawn numbers one by one
                let i = 0;
                const interval = setInterval(() => {
                    if (i < drawn.length) {
                        setDrawnNumbers(prev => [...prev, drawn[i]]);
                        i++;
                    } else {
                        clearInterval(interval);
                        setResult({ drawn, matches, win, payout });
                        if (win) winAudio.play();
                        dispatch({ type: 'balance/setBalance', payload: newBalance });
                        setIsBetStarted(false);
                    }
                }, 200);
            } else {
                setIsBetStarted(false);
                enqueueSnackbar(response.message || 'Failed', { variant: 'error' });
            }
        } catch (error: any) {
            setIsBetStarted(false);
            enqueueSnackbar(error.response?.data?.message || 'Failed', { variant: 'error' });
        }
    };

    return (
        <Box sx={{ bgcolor: '#1a2c38', minHeight: '100vh', pt: 4, px: 1.5 }}>
            <Box sx={{ bgcolor: '#0f212e', maxWidth: '1536px', mx: 'auto', borderRadius: 2, overflow: 'hidden' }}>
                <Grid container>
                    {/* Left Panel */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ order: { xs: 2, md: 1 }, bgcolor: '#213743', py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
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
                            <Typography variant="body2" sx={{ color: 'rgb(148 163 184)' }}>
                                Pick your numbers ({selectedNumbers.length} selected)
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#aaa' }}>
                                Match 5+ numbers to win 3x!
                            </Typography>
                        </Box>
                        <Button fullWidth variant="contained" disabled={isBetStarted || selectedNumbers.length < 1} onClick={handleBet}
                            sx={{ mt: 4, py: 1.5, fontWeight: 700, backgroundColor: '#9c27b0', color: '#fff', '&:hover': { backgroundColor: '#7b1fa2' }, borderRadius: 2 }}>
                            {isBetStarted ? '🎱 Drawing...' : '🎱 Play Bingo!'}
                        </Button>
                    </Grid>

                    {/* Right Panel */}
                    <Grid size={{ xs: 12, md: 9 }} sx={{ minHeight: { xs: 'auto', md: '85vh' }, p: { xs: 2, md: 3 }, order: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                        {/* Number Grid 1-75 */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(10, 1fr)', sm: 'repeat(15, 1fr)' },
                            gap: { xs: 0.5, sm: 0.75 },
                            width: '100%',
                            maxWidth: 600,
                        }}>
                            {Array.from({ length: 75 }, (_, i) => i + 1).map(n => (
                                <Box key={n} onClick={() => !isBetStarted && toggleNumber(n)}
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '50%', cursor: 'pointer', fontWeight: 700,
                                        fontSize: { xs: '0.6rem', sm: '0.75rem' },
                                        bgcolor: drawnNumbers.includes(n) && selectedNumbers.includes(n) ? '#ffd700'
                                            : drawnNumbers.includes(n) ? '#00e676'
                                            : selectedNumbers.includes(n) ? '#9c27b0'
                                            : '#2f4553',
                                        color: '#fff',
                                        transition: 'all 0.3s',
                                        transform: drawnNumbers.includes(n) ? 'scale(1.1)' : 'scale(1)',
                                        '&:hover': { bgcolor: '#557086' }
                                    }}>
                                    {n}
                                </Box>
                            ))}
                        </Box>

                        {/* Result */}
                        {result && (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography sx={{ color: result.win ? '#00e676' : '#f44336', fontSize: { xs: '1.1rem', sm: '1.5rem' }, fontWeight: 700 }}>
                                    {result.win ? `🎉 BINGO! ${result.matches} matches! Won ${result.payout.toFixed(2)}` : `😞 ${result.matches} matches. Try again!`}
                                </Typography>
                            </Box>
                        )}

                        {isBetStarted && (
                            <Typography sx={{ color: '#9c27b0', fontSize: { xs: '1rem', sm: '1.2rem' }, fontWeight: 700, textAlign: 'center' }}>
                                🎱 Drawing numbers...
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Bingo;
