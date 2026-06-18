import { useState } from 'react';
import { useSelector, useDispatch } from 'store/store';
import { useSnackbar } from 'notistack';
import { Box, Button, Grid, TextField, Typography, InputAdornment } from '@mui/material';
import ruppee from 'assets/ruppee.svg';
import winSound from 'assets/winDice.mp3';
import betSound from 'assets/betClick.mp3';
import { playRacing } from 'api';

const HORSES = [
    { id: 1, name: 'Thunder', color: '#f44336' },
    { id: 2, name: 'Lightning', color: '#ff9800' },
    { id: 3, name: 'Storm', color: '#ffd700' },
    { id: 4, name: 'Blaze', color: '#4caf50' },
    { id: 5, name: 'Shadow', color: '#2196f3' },
    { id: 6, name: 'Spirit', color: '#9c27b0' },
    { id: 7, name: 'Rocket', color: '#00bcd4' },
    { id: 8, name: 'Arrow', color: '#ff5722' },
];

const Racing = () => {
    const totalAmount = useSelector((state: any) => state.balance);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [betAmount, setBetAmount] = useState('100.0');
    const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
    const [isBetStarted, setIsBetStarted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [positions, setPositions] = useState<Record<number, number>>({});

    const winAudio = new Audio(winSound);
    const betAudio = new Audio(betSound);

    const handleBet = async () => {
        if (!selectedHorse) return enqueueSnackbar('Pick a horse!', { variant: 'error' });
        if (parseFloat(betAmount) <= 0) return enqueueSnackbar('Enter a valid bet', { variant: 'error' });
        if (parseFloat(betAmount) > totalAmount) return enqueueSnackbar('Not enough balance', { variant: 'error' });

        betAudio.play();
        setIsBetStarted(true);
        setResult(null);

        const pos: Record<number, number> = {};
        HORSES.forEach(h => pos[h.id] = 0);
        setPositions(pos);

        try {
            const response = await playRacing(parseFloat(betAmount), selectedHorse);
            if (response.success) {
                const { winner, win, payout, newBalance } = response.data;

                let frame = 0;
                const raceInterval = setInterval(() => {
                    frame++;
                    setPositions(prev => {
                        const updated = { ...prev };
                        HORSES.forEach(h => {
                            const speed = h.id === winner ? 12 : Math.random() * 9 + 3;
                            updated[h.id] = Math.min((prev[h.id] || 0) + speed, h.id === winner ? 100 : 94);
                        });
                        return updated;
                    });
                    if (frame >= 20) {
                        clearInterval(raceInterval);
                        setPositions(prev => ({ ...prev, [winner]: 100 }));
                        setResult({ winner, win, payout });
                        if (win) winAudio.play();
                        dispatch({ type: 'balance/setBalance', payload: newBalance });
                        setIsBetStarted(false);
                    }
                }, 150);
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
        <Box sx={{ bgcolor: '#1a2c38', minHeight: '100vh', pt: { xs: 2, sm: 4 }, px: 1.5 }}>
            <Box sx={{ bgcolor: '#0f212e', maxWidth: '1536px', mx: 'auto', borderRadius: 2, overflow: 'hidden' }}>
                <Grid container>
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
                            <Typography variant="body2" sx={{ color: 'rgb(148 163 184)' }}>Pick a Horse (Win = 7.5x)</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {HORSES.map(h => (
                                    <Button key={h.id} disabled={isBetStarted} onClick={() => setSelectedHorse(h.id)}
                                        sx={{ justifyContent: 'flex-start', px: 2, py: 0.75, borderRadius: 1, bgcolor: selectedHorse === h.id ? h.color : '#2f4553', color: '#fff', '&:hover': { bgcolor: h.color } }}>
                                        #{h.id} {h.name}
                                    </Button>
                                ))}
                            </Box>
                        </Box>
                        <Button fullWidth variant="contained" disabled={isBetStarted || !selectedHorse} onClick={handleBet}
                            sx={{ mt: 2, py: 1.5, fontWeight: 700, backgroundColor: '#ffd700', color: '#000', borderRadius: 2 }}>
                            {isBetStarted ? '🏇 Racing...' : '🏁 Start Race'}
                        </Button>
                    </Grid>

                    <Grid size={{ xs: 12, md: 9 }} sx={{ minHeight: { xs: 'auto', md: '85vh' }, p: { xs: 2, md: 3 }, order: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: { xs: 1, sm: 2 } }}>
                        {HORSES.map(h => (
                            <Box key={h.id} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                                <Typography sx={{ color: h.color, width: { xs: 50, sm: 80 }, fontWeight: 700, fontSize: { xs: '0.7rem', sm: '0.85rem' }, flexShrink: 0 }}>
                                    #{h.id} {h.name}
                                </Typography>
                                <Box sx={{ flex: 1, bgcolor: '#2f4553', borderRadius: 1, height: { xs: 24, sm: 32 }, position: 'relative', overflow: 'hidden' }}>
                                    <Box sx={{ position: 'absolute', left: `${positions[h.id] || 0}%`, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: { xs: '1rem', sm: '1.4rem' }, transition: 'left 0.15s linear', transform: 'translateX(-50%)' }}>
                                        🐎
                                    </Box>
                                </Box>
                                {result?.winner === h.id && <Typography sx={{ color: '#ffd700', fontWeight: 700 }}>🏆</Typography>}
                            </Box>
                        ))}

                        {result && (
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Typography sx={{ color: result.win ? '#00e676' : '#f44336', fontSize: { xs: '1rem', sm: '1.5rem' }, fontWeight: 700 }}>
                                    {result.win
                                        ? `🎉 ${HORSES.find(h => h.id === result.winner)?.name} wins! You won ${result.payout.toFixed(2)}`
                                        : `😞 ${HORSES.find(h => h.id === result.winner)?.name} wins. Better luck!`}
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Racing;
