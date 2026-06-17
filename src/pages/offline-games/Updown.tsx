import { useState } from 'react';
import { useSelector, useDispatch } from 'store/store';
import { useSnackbar } from 'notistack';
import { Box, Button, Grid, TextField, Typography, InputAdornment } from '@mui/material';
import ruppee from 'assets/ruppee.svg';
import winSound from 'assets/winDice.mp3';
import betSound from 'assets/betClick.mp3';
import { playUpDown } from 'api';

const UpDown = () => {
    const totalAmount = useSelector((state: any) => state.balance);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [betAmount, setBetAmount] = useState('100.0');
    const [isBetStarted, setIsBetStarted] = useState(false);
    const [result, setResult] = useState<'up' | 'down' | null>(null);
    const [betResultArray, setBetResultArray] = useState<any[]>([]);
    const [animating, setAnimating] = useState(false);

    const winAudio = new Audio(winSound);
    const betAudio = new Audio(betSound);

    const handleBet = async (prediction: 'up' | 'down') => {
        if (!betAmount || parseFloat(betAmount) <= 0) return enqueueSnackbar('Enter a valid bet amount', { variant: 'error' });
        if (parseFloat(betAmount) > totalAmount) return enqueueSnackbar('Not enough balance', { variant: 'error' });

        betAudio.play();
        setIsBetStarted(true);
        setAnimating(true);
        setResult(null);

        try {
            const response = await playUpDown(parseFloat(betAmount), prediction);
            if (response.success) {
                const { outcome, win, payout, newBalance } = response.data;
                setTimeout(() => {
                    setResult(outcome);
                    setAnimating(false);
                    if (win) winAudio.play();
                    setBetResultArray(prev => [{ prediction, outcome, win, payout, amount: parseFloat(betAmount) }, ...prev].slice(0, 5));
                    dispatch({ type: 'balance/setBalance', payload: newBalance });
                    setIsBetStarted(false);
                }, 2000);
            } else {
                setAnimating(false);
                setIsBetStarted(false);
                enqueueSnackbar(response.message || 'Failed to place bet', { variant: 'error' });
            }
        } catch (error: any) {
            setAnimating(false);
            setIsBetStarted(false);
            enqueueSnackbar(error.response?.data?.message || 'Failed to place bet', { variant: 'error' });
        }
    };

    return (
        <Box sx={{ bgcolor: '#1a2c38', minHeight: '100vh', pt: 4, px: 1.5 }}>
            <Box sx={{ bgcolor: '#0f212e', maxWidth: '1536px', mx: 'auto', borderRadius: 2, overflow: 'hidden' }}>
                <Grid container>
                    <Grid size={{ xs: 12, md: 3 }} sx={{ order: { xs: 2, md: 1 }, bgcolor: '#213743', py: 5, px: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>Bet Amount</Typography>
                            <Box sx={{ display: 'flex', bgcolor: '#2f4553', p: '4px', borderRadius: 1 }}>
                                <TextField type="number" disabled={isBetStarted} value={betAmount} onChange={e => setBetAmount(e.target.value)} size="small"
                                    sx={{ width: '55%', input: { bgcolor: '#0f212e', color: '#fff', fontWeight: 500, padding: '10px' }, '& fieldset': { border: 'none' } }}
                                    InputProps={{ endAdornment: <InputAdornment position="end"><Box component="img" src={ruppee} sx={{ width: 16, height: 16 }} /></InputAdornment> }} />
                                <Box sx={{ display: 'flex', width: '45%', alignItems: 'center' }}>
                                    <Button disabled={isBetStarted} onClick={() => setBetAmount(a => (Number(a) / 2).toFixed(2))} sx={{ width: '50%', color: '#fff', minWidth: 0 }}>½</Button>
                                    <Box sx={{ width: '3px', height: '20px', bgcolor: '#1a2c38', borderRadius: '4px' }} />
                                    <Button disabled={isBetStarted} onClick={() => setBetAmount(a => (Number(a) * 2).toFixed(2))} sx={{ width: '50%', color: '#fff', minWidth: 0 }}>2×</Button>
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>Profit on Win (1.9x)</Typography>
                            <Box sx={{ bgcolor: '#2f4553', color: '#fff', px: 2, py: 1.5, borderRadius: 1, fontSize: '14px', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{(parseFloat(betAmount || '0') * 0.9).toFixed(2)}</span>
                                <Box component="img" src={ruppee} sx={{ width: 16, height: 16 }} />
                            </Box>
                        </Box>
                        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                            <Button fullWidth variant="contained" disabled={isBetStarted} onClick={() => handleBet('up')}
                                sx={{ py: 1.5, fontWeight: 700, fontSize: '1.2rem', backgroundColor: '#00e676', color: '#000', '&:hover': { backgroundColor: '#00c853' }, borderRadius: 2 }}>
                                ⬆ UP
                            </Button>
                            <Button fullWidth variant="contained" disabled={isBetStarted} onClick={() => handleBet('down')}
                                sx={{ py: 1.5, fontWeight: 700, fontSize: '1.2rem', backgroundColor: '#f44336', color: '#fff', '&:hover': { backgroundColor: '#d32f2f' }, borderRadius: 2 }}>
                                ⬇ DOWN
                            </Button>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 9 }} sx={{ position: 'relative', minHeight: '85vh', p: 2, order: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 0.5 }}>
                            {betResultArray.map((item, i) => (
                                <Box key={i} sx={{ px: 2, py: 1, fontWeight: 'bold', fontSize: '0.75rem', borderRadius: 9999, bgcolor: item.win ? '#00e676' : '#2f4553', color: item.win ? '#000' : '#fff' }}>
                                    {item.outcome === 'up' ? '⬆' : '⬇'} {item.win ? `Won ${item.payout.toFixed(2)}` : `Lost ${item.amount.toFixed(2)}`}
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <Box sx={{
                                fontSize: '8rem',
                                color: result === 'up' ? '#00e676' : result === 'down' ? '#f44336' : '#fff',
                                animation: animating ? 'spin 0.5s linear infinite' : 'none',
                                '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } }
                            }}>
                                {animating ? '🔄' : result === 'up' ? '⬆️' : result === 'down' ? '⬇️' : '❓'}
                            </Box>
                            <Typography sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {animating ? 'Deciding...' : result ? result.toUpperCase() : 'UP or DOWN?'}
                            </Typography>
                            {result && !animating && (
                                <Typography sx={{ color: betResultArray[0]?.win ? '#00e676' : '#f44336', fontSize: '1.2rem', fontWeight: 700 }}>
                                    {betResultArray[0]?.win ? `🎉 Won ${betResultArray[0]?.payout.toFixed(2)}` : `😞 Lost ${betResultArray[0]?.amount.toFixed(2)}`}
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default UpDown;
