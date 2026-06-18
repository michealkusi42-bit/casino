import { useState } from 'react';
import { useSelector, useDispatch } from 'store/store';
import { useSnackbar } from 'notistack';
import { Box, Button, Grid, TextField, Typography, InputAdornment } from '@mui/material';
import ruppee from 'assets/ruppee.svg';
import './coinflip.css';
import winSound from 'assets/winDice.mp3';
import betSound from 'assets/betClick.mp3';
import rollSound from 'assets/rolling.mp3';
import Loader from 'components/Loader';
import { playCoinFlip, getUserBalance } from 'api';

const CoinFlip = () => {
    const totalAmount = useSelector((state: any) => state.balance);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [betAmount, setBetAmount] = useState('100.0');
    const [isBetStarted, setIsBetStarted] = useState(false);
    const [betResultArray, setBetResultArray] = useState<any[]>([]);
    const [result, setResult] = useState<'heads' | 'tails' | null>(null);
    const [flipping, setFlipping] = useState(false);

    const winAudio = new Audio(winSound);
    const betAudio = new Audio(betSound);
    const rollAudio = new Audio(rollSound);

    const handleBet = async (choice: 'heads' | 'tails') => {
        if (!betAmount || parseFloat(betAmount) <= 0) {
            enqueueSnackbar('Enter a valid bet amount', { variant: 'error' });
            return;
        }
        if (parseFloat(betAmount) > totalAmount) {
            enqueueSnackbar('Not Enough Money', { variant: 'error' });
            return;
        }

        betAudio.play();
        setIsBetStarted(true);
        setFlipping(true);
        setResult(null);

        setTimeout(() => { rollAudio.play(); }, 100);

        try {
            const response = await playCoinFlip(parseFloat(betAmount), choice);

            if (response.success) {
                const { outcome, win, payout, betAmount: betAmt, newBalance } = response.data;

                setTimeout(() => {
                    setResult(outcome);
                    setFlipping(false);
                    if (win) winAudio.play();
                    setBetResultArray((prev) => [{ amount: betAmt, choice, outcome, win, payout }, ...prev].slice(0, 5));
                    setIsBetStarted(false);
                    dispatch({ type: 'balance/setBalance', payload: newBalance });
                }, 2000);
            } else {
                setFlipping(false);
                setIsBetStarted(false);
                enqueueSnackbar(response.message || 'Failed to place bet', { variant: 'error' });
            }
        } catch (error: any) {
            setFlipping(false);
            setIsBetStarted(false);
            enqueueSnackbar(error.response?.data?.message || error.message || 'Failed to place bet', { variant: 'error' });
        }
    };

    return (
        <Box sx={{ bgcolor: '#1a2c38', minHeight: '100vh', pt: { xs: 2, sm: 4 }, px: 1.5 }}>
            <Loader />
            <Box sx={{ bgcolor: '#0f212e', maxWidth: '1536px', mx: 'auto', borderRadius: 2, overflow: 'hidden' }}>
                <Grid container>
                    {/* Left Panel */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ order: { xs: 2, md: 1 }, bgcolor: '#213743', py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>Bet Amount</Typography>
                                <Box sx={{ display: 'flex', bgcolor: '#2f4553', p: '4px', borderRadius: 1 }}>
                                    <TextField
                                        type="number" disabled={isBetStarted} value={betAmount}
                                        onChange={(e) => setBetAmount(e.target.value)} size="small"
                                        sx={{ width: '55%', input: { bgcolor: '#0f212e', color: '#fff', fontWeight: 500, padding: '10px' }, '& fieldset': { border: 'none' } }}
                                        InputProps={{ endAdornment: <InputAdornment position="end"><Box component="img" src={ruppee} sx={{ width: 16, height: 16 }} alt="Rs." /></InputAdornment> }}
                                    />
                                    <Box sx={{ display: 'flex', width: '45%', color: '#fff', fontWeight: 600, fontSize: '14px', alignItems: 'center' }}>
                                        <Button disabled={isBetStarted} onClick={() => setBetAmount((amt) => (Number(amt) / 2).toFixed(2))} sx={{ width: '50%', color: '#fff', '&:hover': { bgcolor: '#557086' }, minWidth: 0 }}>½</Button>
                                        <Box sx={{ width: '3px', height: '20px', bgcolor: '#1a2c38', borderRadius: '4px' }} />
                                        <Button disabled={isBetStarted} onClick={() => setBetAmount((amt) => (Number(amt) * 2).toFixed(2))} sx={{ width: '50%', color: '#fff', '&:hover': { bgcolor: '#557086' }, minWidth: 0 }}>2×</Button>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>Profit on Win (1.98x)</Typography>
                                <Box sx={{ bgcolor: '#2f4553', color: '#fff', px: 2, py: 1.5, borderRadius: 1, fontSize: '14px', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{(parseFloat(betAmount || '0') * 0.98).toFixed(2)}</span>
                                    <Box component="img" src={ruppee} sx={{ width: 16, height: 16 }} alt="Rs." />
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                            <Button fullWidth variant="contained" disabled={isBetStarted} onClick={() => handleBet('heads')}
                                sx={{ py: 1.5, fontWeight: 600, backgroundColor: '#ffd700', color: '#000', '&:hover': { backgroundColor: '#ffed4a' }, borderRadius: 2 }}>
                                Bet Heads
                            </Button>
                            <Button fullWidth variant="contained" disabled={isBetStarted} onClick={() => handleBet('tails')}
                                sx={{ py: 1.5, fontWeight: 600, backgroundColor: '#c0c0c0', color: '#000', '&:hover': { backgroundColor: '#dcdcdc' }, borderRadius: 2 }}>
                                Bet Tails
                            </Button>
                        </Box>
                    </Grid>

                    {/* Right Panel */}
                    <Grid size={{ xs: 12, md: 9 }} sx={{ order: { xs: 1, md: 2 }, minHeight: { xs: 'auto', md: '85vh' }, p: { xs: 2, md: 3 }, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {/* History */}
                        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 0.5, maxWidth: '60%', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {betResultArray.map((item, index) => (
                                <ShowBetResult key={index} item={item} />
                            ))}
                        </Box>

                        {/* Coin */}
                        <Box className="coin-container" sx={{ my: { xs: 3, sm: 0 } }}>
                            <div className={`coin ${flipping ? 'flipping' : ''} ${result === 'heads' ? 'heads' : result === 'tails' ? 'tails' : ''}`}>
                                <div className="side side-a">HEADS</div>
                                <div className="side side-b">TAILS</div>
                            </div>
                        </Box>

                        <Typography sx={{ mt: { xs: 2, sm: 4 }, color: '#fff', fontSize: { xs: '1.1rem', sm: '1.5rem' }, fontWeight: 'bold', minHeight: '2rem', textAlign: 'center' }}>
                            {flipping ? 'Flipping...' : result ? result.toUpperCase() : 'Place your bet!'}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

const ShowBetResult = ({ item }: { item: any }) => (
    <Box sx={{ px: 1.5, py: 0.5, fontWeight: 'bold', fontSize: '0.7rem', borderRadius: 9999, bgcolor: item.win ? '#00e701' : '#2f4553', color: item.win ? 'black' : 'white', display: 'flex', alignItems: 'center', gap: 0.5 }} className="betResult">
        <span>{item.choice === 'heads' ? 'H' : 'T'}</span>
        <span>{item.win ? '+' : '-'}{item.win ? item.payout.toFixed(2) : item.amount.toFixed(2)}</span>
    </Box>
);

export default CoinFlip;
