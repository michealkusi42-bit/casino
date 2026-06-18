import { useState } from 'react';
import { useSelector, useDispatch } from 'store/store';
import { useSnackbar } from 'notistack';
import { Box, Button, Grid, TextField, Typography, InputAdornment } from '@mui/material';
import ruppee from 'assets/ruppee.svg';
import winSound from 'assets/winDice.mp3';
import betSound from 'assets/betClick.mp3';
import { playLottery } from 'api';

const Lottery = () => {
    const totalAmount = useSelector((state: any) => state.balance);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [betAmount, setBetAmount] = useState('100.0');
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [isBetStarted, setIsBetStarted] = useState(false);
    const [result, setResult] = useState<any>(null);

    const winAudio = new Audio(winSound);
    const betAudio = new Audio(betSound);

    const toggleNumber = (n: number) => {
        if (selectedNumbers.includes(n)) {
            setSelectedNumbers(prev => prev.filter(x => x !== n));
        } else if (selectedNumbers.length < 5) {
            setSelectedNumbers(prev => [...prev, n]);
        }
    };

    const handleBet = async () => {
        if (selectedNumbers.length !== 5) return enqueueSnackbar('Pick exactly 5 numbers!', { variant: 'error' });
        if (parseFloat(betAmount) <= 0) return enqueueSnackbar('Enter a valid bet', { variant: 'error' });
        if (parseFloat(betAmount) > totalAmount) return enqueueSnackbar('Not enough balance', { variant: 'error' });

        betAudio.play();
        setIsBetStarted(true);
        setResult(null);

        try {
            const response = await playLottery(parseFloat(betAmount), selectedNumbers);
            if (response.success) {
                const { winningNumbers, matches, win, payout, newBalance } = response.data;
                setTimeout(() => {
                    setResult({ winningNumbers, matches, win, payout });
                    if (win) winAudio.play();
                    dispatch({ type: 'balance/setBalance', payload: newBalance });
                    setIsBetStarted(false);
                }, 2000);
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
        <Box sx={{ bgcolor: '#1a2c38', minHeight: '100vh', pt: { xs: 1, md: 4 }, px: { xs: 0, md: 1.5 } }}>
            <Box sx={{ bgcolor: '#0f212e', maxWidth: '1536px', mx: 'auto', borderRadius: { xs: 0, md: 2 }, overflow: 'hidden' }}>
                <Grid container>
                    {/* ✅ Numbers Grid - Top on mobile */}
                    <Grid size={{ xs: 12, md: 9 }} sx={{
                        order: { xs: 1, md: 2 },
                        p: { xs: 1.5, md: 3 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: { xs: 1.5, md: 3 }
                    }}>
                        {/* Result Banner */}
                        {result && (
                            <Box sx={{
                                textAlign: 'center',
                                width: '100%',
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: result.win ? 'rgba(0,230,118,0.1)' : 'rgba(244,67,54,0.1)',
                                border: `1px solid ${result.win ? '#00e676' : '#f44336'}`
                            }}>
                                <Typography sx={{
                                    color: result.win ? '#00e676' : '#f44336',
                                    fontSize: { xs: '0.95rem', sm: '1.3rem' },
                                    fontWeight: 700
                                }}>
                                    {result.win
                                        ? `🎉 ${result.matches} matches! Won GH₵${result.payout.toFixed(2)}`
                                        : `😞 ${result.matches} matches. Try again!`}
                                </Typography>
                                <Typography sx={{ color: '#aaa', mt: 0.5, fontSize: { xs: '0.75rem', sm: '0.9rem' } }}>
                                    Winning: {result.winningNumbers?.join(', ')}
                                </Typography>
                            </Box>
                        )}

                        {isBetStarted && (
                            <Typography sx={{
                                color: '#ffd700',
                                fontSize: { xs: '1rem', sm: '1.5rem' },
                                fontWeight: 700,
                                textAlign: 'center'
                            }}>
                                🎱 Drawing numbers...
                            </Typography>
                        )}

                        {/* Number Grid */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(10, 1fr)', sm: 'repeat(10, 1fr)' },
                            gap: { xs: 0.5, sm: 1 },
                            width: '100%',
                            maxWidth: { xs: '100%', sm: 500 },
                        }}>
                            {Array.from({ length: 50 }, (_, i) => i + 1).map(n => (
                                <Box
                                    key={n}
                                    onClick={() => !isBetStarted && toggleNumber(n)}
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        fontSize: { xs: '0.6rem', sm: '0.85rem' },
                                        bgcolor: selectedNumbers.includes(n) && result?.winningNumbers?.includes(n) ? '#ffd700'
                                            : result?.winningNumbers?.includes(n) ? '#00e676'
                                            : selectedNumbers.includes(n) ? '#9c27b0'
                                            : '#2f4553',
                                        color: '#fff',
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: '#557086' },
                                        // ✅ Highlight selected with border on mobile
                                        border: selectedNumbers.includes(n) ? '2px solid #fff' : '2px solid transparent'
                                    }}
                                >
                                    {n}
                                </Box>
                            ))}
                        </Box>

                        <Typography variant="caption" sx={{ color: '#aaa', textAlign: 'center' }}>
                            Tap numbers to select • Pick exactly 5
                        </Typography>
                    </Grid>

                    {/* ✅ Bet Panel - Bottom on mobile */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{
                        order: { xs: 2, md: 1 },
                        bgcolor: '#213743',
                        py: { xs: 2, md: 5 },
                        px: { xs: 1.5, md: 3 }
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>
                                Bet Amount
                            </Typography>

                            <Box sx={{ display: 'flex', bgcolor: '#2f4553', p: '4px', borderRadius: 1 }}>
                                <TextField
                                    type="number"
                                    disabled={isBetStarted}
                                    value={betAmount}
                                    onChange={e => setBetAmount(e.target.value)}
                                    size="small"
                                    sx={{
                                        width: '55%',
                                        input: { bgcolor: '#0f212e', color: '#fff', padding: '10px' },
                                        '& fieldset': { border: 'none' }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Box component="img" src={ruppee} sx={{ width: 16, height: 16 }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Box sx={{ display: 'flex', width: '45%', alignItems: 'center' }}>
                                    <Button
                                        disabled={isBetStarted}
                                        onClick={() => setBetAmount(a => (Number(a) / 2).toFixed(2))}
                                        sx={{ width: '50%', color: '#fff', minWidth: 0 }}
                                    >½</Button>
                                    <Box sx={{ width: '3px', height: '20px', bgcolor: '#1a2c38', borderRadius: '4px' }} />
                                    <Button
                                        disabled={isBetStarted}
                                        onClick={() => setBetAmount(a => (Number(a) * 2).toFixed(2))}
                                        sx={{ width: '50%', color: '#fff', minWidth: 0 }}
                                    >2×</Button>
                                </Box>
                            </Box>

                            {/* ✅ Quick bet buttons for mobile */}
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {[10, 50, 100, 500].map(amt => (
                                    <Button
                                        key={amt}
                                        disabled={isBetStarted}
                                        onClick={() => setBetAmount(amt.toString())}
                                        size="small"
                                        sx={{
                                            bgcolor: betAmount === amt.toString() ? '#ffd700' : '#2f4553',
                                            color: betAmount === amt.toString() ? '#000' : '#fff',
                                            minWidth: 0,
                                            px: 1.5,
                                            fontSize: '0.7rem',
                                            '&:hover': { bgcolor: '#557086' }
                                        }}
                                    >
                                        {amt}
                                    </Button>
                                ))}
                            </Box>

                            <Typography variant="body2" sx={{ color: 'rgb(148 163 184)' }}>
                                Selected: {selectedNumbers.length === 0 ? 'None' : selectedNumbers.join(', ')} ({selectedNumbers.length}/5)
                            </Typography>

                            <Typography variant="caption" sx={{ color: '#aaa' }}>
                                Match 3 = 2x | Match 4 = 10x | Match 5 = 100x
                            </Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            disabled={isBetStarted || selectedNumbers.length !== 5}
                            onClick={handleBet}
                            sx={{
                                mt: 2,
                                py: { xs: 1.2, md: 1.5 },
                                fontWeight: 700,
                                fontSize: { xs: '0.9rem', md: '1rem' },
                                backgroundColor: '#ffd700',
                                color: '#000',
                                '&:hover': { backgroundColor: '#ffed4a' },
                                '&:disabled': { backgroundColor: '#2f4553', color: '#aaa' },
                                borderRadius: 2
                            }}
                        >
                            {isBetStarted ? '🎰 Drawing...' : '🎰 Draw Now'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Lottery;
