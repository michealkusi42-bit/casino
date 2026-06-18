import React, { useState, useCallback, useEffect, useRef } from 'react';
import gem from 'assets/gem.svg';
import bomb2 from 'assets/bomb2.svg';
import './style.css';
import ruppee from 'assets/ruppee.svg';
import clickSound from '../../assets/audio-mines-2.mp3';
import Loader from 'components/Loader';
import { useSelector, useDispatch } from 'store/store';
import { Box, Button, FormControl, FormLabel, Grid, MenuItem, Select, TextField, Typography, Fade } from '@mui/material';
import { useSnackbar } from 'notistack';
import { startMines, clickMinesTile, cashoutMines, getActiveMinesGame, getUserBalance } from 'api';

const WinPopup = ({ show, profitRatio, totalWin }: { show: boolean; profitRatio: string; totalWin: string }) => (
    <Fade in={show} timeout={400}>
        <Box sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', zIndex: 10, textAlign: 'center',
            bgcolor: 'rgba(15, 33, 46, 0.95)', border: '2px solid #00e701',
            borderRadius: 4, px: { xs: 3, sm: 5 }, py: { xs: 3, sm: 4 },
            boxShadow: '0 0 40px rgba(0,231,1,0.4)', backdropFilter: 'blur(8px)',
            width: { xs: '80vw', sm: 'auto' }
        }}>
            <Typography sx={{ fontSize: '2rem', mb: 1 }}>🎉</Typography>
            <Typography sx={{ color: '#00e701', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.8rem' }, letterSpacing: 2 }}>YOU WON!</Typography>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1rem', sm: '1.3rem' }, mt: 1 }}>{profitRatio}×</Typography>
            <Typography sx={{ color: '#FFD700', fontWeight: 900, fontSize: { xs: '1.1rem', sm: '1.5rem' }, mt: 0.5 }}>GH₵ {totalWin} 🤑</Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mt: 1.5 }}>Congratulations! 🏆</Typography>
        </Box>
    </Fade>
);

const LostPopup = ({ show }: { show: boolean }) => (
    <Fade in={show} timeout={400}>
        <Box sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', zIndex: 10, textAlign: 'center',
            bgcolor: 'rgba(15, 33, 46, 0.95)', border: '2px solid #ef4444',
            borderRadius: 4, px: { xs: 3, sm: 5 }, py: { xs: 3, sm: 4 },
            boxShadow: '0 0 40px rgba(239,68,68,0.4)', backdropFilter: 'blur(8px)',
            width: { xs: '80vw', sm: 'auto' }
        }}>
            <Typography sx={{ fontSize: '2rem', mb: 1 }}>😢</Typography>
            <Typography sx={{ color: '#ef4444', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.8rem' }, letterSpacing: 2 }}>OH NO!</Typography>
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem', mt: 1 }}>You hit a bomb! 💣</Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mt: 1 }}>Better luck next time! 🍀</Typography>
        </Box>
    </Fade>
);

const Mine = () => {
    const totalAmount = useSelector((state: any) => state.balance);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const totalCells = 25;
    const array = Array.from({ length: 24 }, (_, i) => i + 1);

    const [visibleImages, setVisibleImages] = useState(Array(totalCells).fill(false));
    const [bombIndices, setBombIndices] = useState<number[]>([]);
    const [clickedIndices, setClickedIndices] = useState<number[]>([]);
    const [firstBombClicked, setFirstBombClicked] = useState(false);
    const [noOfBombs, setNoOfBombs] = useState(3);
    const [isBetStarted, setIsBetStarted] = useState(false);
    const [showPop, setShowPop] = useState(false);
    const [showLostPop, setShowLostPop] = useState(false);
    const [betAmount, setBetAmount] = useState('100.0');
    const [profitRatio, setProfitRatio] = useState('1.0');
    const [totalProfit, setTotalProfit] = useState('0.0');
    const [sentBet, setSentBet] = useState(0.0);
    const [loading, setLoading] = useState(false);

    const clickAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const checkActiveGame = async () => {
            try {
                setLoading(true);
                const response = await getActiveMinesGame();
                if (response.success && response.data) {
                    const { betAmount: activeBet, mineCount, revealed } = response.data;
                    setBetAmount(activeBet.toString());
                    setNoOfBombs(mineCount);
                    setIsBetStarted(true);
                    setClickedIndices(revealed || []);
                    const newVisible = Array(totalCells).fill(false);
                    (revealed || []).forEach((idx: number) => (newVisible[idx] = true));
                    setVisibleImages(newVisible);
                    const mult = 1 + (revealed?.length || 0) * 0.2;
                    const currentPayout = activeBet * mult;
                    setTotalProfit((currentPayout - activeBet).toFixed(2));
                    setProfitRatio(mult.toFixed(2));
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };
        checkActiveGame();
    }, []);

    const updateBalance = async (newBalance?: number) => {
        if (newBalance !== undefined) {
            dispatch({ type: 'balance/setBalance', payload: newBalance });
        } else {
            try {
                const balanceData = await getUserBalance();
                if (balanceData?.amount !== undefined) {
                    dispatch({ type: 'balance/setBalance', payload: balanceData.amount });
                }
            } catch (error) {
                console.error('Failed to update balance:', error);
            }
        }
    };

    const reset = () => {
        setTotalProfit('0.0');
        setProfitRatio('1.0');
        setShowLostPop(false);
        setShowPop(false);
        setVisibleImages(Array(totalCells).fill(false));
        setClickedIndices([]);
        setBombIndices([]);
        setFirstBombClicked(false);
        setIsBetStarted(false);
    };

    const handleBetClicked = async () => {
        if (isBetStarted) {
            try {
                setLoading(true);
                const response = await cashoutMines();
                if (response.success) {
                    const { payout, multiplier, newBalance } = response.data;
                    setSentBet(payout);
                    setShowPop(true);
                    setTimeout(() => setShowPop(false), 3000);
                    setIsBetStarted(false);
                    setVisibleImages(Array(totalCells).fill(true));
                    setProfitRatio((multiplier || 1).toFixed(2));
                    updateBalance(newBalance);
                    enqueueSnackbar(`Cashed out ${payout.toFixed(2)}!`, { variant: 'success' });
                }
            } catch (error: any) {
                enqueueSnackbar(error.message || 'Failed to cashout', { variant: 'error' });
            } finally {
                setLoading(false);
            }
            return;
        }

        if (!betAmount || parseFloat(betAmount) <= 0) {
            enqueueSnackbar('Enter a valid bet amount', { variant: 'error' });
            return;
        }
        if (parseFloat(betAmount) > totalAmount.amount) {
            enqueueSnackbar('Not Enough Money', { variant: 'error' });
            return;
        }

        try {
            setLoading(true);
            reset();
            const response = await startMines(parseFloat(betAmount), noOfBombs);
            if (response.success) {
                setIsBetStarted(true);
                updateBalance(response.data?.newBalance);
            }
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || error.message || 'Failed to start game', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleClick = useCallback(
        async (e: React.MouseEvent, index: number) => {
            if (!isBetStarted || firstBombClicked || visibleImages[index] || loading) return;
            const target = e.target as HTMLElement;
            target.classList.add('animate-click');
            setTimeout(() => target.classList.remove('animate-click'), 600);
            try {
                const response = await clickMinesTile(index);
                if (response.success) {
                    const { isMine, minePositions, revealed, multiplier, potentialPayout } = response.data;
                    if (isMine) {
                        setBombIndices(minePositions || []);
                        setFirstBombClicked(true);
                        setVisibleImages(Array(totalCells).fill(true));
                        setShowLostPop(true);
                        setTimeout(() => setShowLostPop(false), 3000);
                        setIsBetStarted(false);
                        updateBalance();
                    } else {
                        clickAudioRef.current?.play();
                        setClickedIndices((prev) => [...prev, index]);
                        setVisibleImages((prev) => {
                            const newVis = [...prev];
                            newVis[index] = true;
                            return newVis;
                        });
                        const mult = multiplier || 1;
                        const profit = (potentialPayout || 0) - parseFloat(betAmount);
                        setTotalProfit(profit.toFixed(2));
                        setProfitRatio(mult.toFixed(2));
                    }
                }
            } catch (error: any) {
                enqueueSnackbar(error.response?.data?.message || error.message || 'Failed to click tile', { variant: 'error' });
            }
        },
        [isBetStarted, firstBombClicked, visibleImages, loading, betAmount, enqueueSnackbar]
    );

    const isClickedByUser = (index: number) => clickedIndices.includes(index);

    return (
        <Box sx={{ bgcolor: '#1a2c38', padding: '1rem' }}>
            <Loader />
            <Box sx={{ bgcolor: '#0f212e', maxWidth: '1536px', margin: '0 auto', borderRadius: 2, overflow: 'hidden' }}>
                <Grid container>
                    {/* Left Panel */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ order: { xs: 2, md: 1 }, bgcolor: '#213743', py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>Bet Amount</Typography>
                                <Box sx={{ display: 'flex', bgcolor: '#2f4553', p: '4px', borderRadius: 1 }}>
                                    <TextField
                                        type="number"
                                        disabled={isBetStarted}
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(e.target.value)}
                                        size="small"
                                        sx={{ width: '55%', input: { bgcolor: '#0f212e', color: '#fff', fontWeight: 500, padding: '10px' }, '& fieldset': { border: 'none' } }}
                                    />
                                    <Box sx={{ display: 'flex', width: '45%', color: '#fff', fontWeight: 600, fontSize: '14px', alignItems: 'center' }}>
                                        <Button disabled={isBetStarted} onClick={() => setBetAmount((amt) => (Number(amt) / 2).toFixed(2))} sx={{ width: '50%', color: '#fff', '&:hover': { bgcolor: '#557086' } }}>½</Button>
                                        <Box sx={{ width: '3px', height: '20px', bgcolor: '#1a2c38', borderRadius: '4px' }} />
                                        <Button disabled={isBetStarted} onClick={() => setBetAmount((amt) => (Number(amt) * 2).toFixed(2))} sx={{ width: '50%', color: '#fff', '&:hover': { bgcolor: '#557086' } }}>2×</Button>
                                    </Box>
                                </Box>
                            </Box>
                            {isBetStarted ? (
                                <Box display="flex" flexDirection="column" gap={2.5}>
                                    <Grid container spacing={2}>
                                        <Grid size={6}>
                                            <Box display="flex" flexDirection="column" gap={1}>
                                                <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>Mines</Typography>
                                                <Box sx={{ bgcolor: '#2f4553', color: '#fff', px: 2, py: 1.5, borderRadius: 1, fontSize: '14px', fontWeight: 500 }}>{noOfBombs}</Box>
                                            </Box>
                                        </Grid>
                                        <Grid size={6}>
                                            <Box display="flex" flexDirection="column" gap={1}>
                                                <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>Gems</Typography>
                                                <Box sx={{ bgcolor: '#2f4553', color: '#fff', px: 2, py: 1.5, borderRadius: 1, fontSize: '14px', fontWeight: 500 }}>{25 - noOfBombs - clickedIndices.length}</Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    <Box display="flex" flexDirection="column" gap={1}>
                                        <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>Total Profit ({profitRatio}×)</Typography>
                                        <Box sx={{ bgcolor: '#2f4553', color: '#fff', px: 2, py: 1.5, borderRadius: 1, fontSize: '14px', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{totalProfit}</span>
                                            <Box component="img" src={ruppee} sx={{ width: 16, height: 16 }} alt="Rs." />
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <FormControl fullWidth size="small" disabled={isBetStarted} sx={{ mt: 2 }}>
                                    <FormLabel sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 0.5 }}>Mines</FormLabel>
                                    <Select
                                        value={noOfBombs}
                                        onChange={(e) => setNoOfBombs(parseInt(e.target.value as unknown as string))}
                                        sx={{ bgcolor: '#0f212e', color: 'white', border: '1px solid #475569', fontSize: '0.85rem', '& .MuiSelect-select': { py: 1.2 } }}
                                    >
                                        {array.map((no) => (
                                            <MenuItem key={no} value={no}>{no}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Box>
                        <Button
                            fullWidth variant="contained"
                            onClick={handleBetClicked}
                            disabled={loading}
                            sx={{
                                mt: 2, py: 1.5, fontWeight: 700, fontSize: '1rem',
                                backgroundColor: isBetStarted ? '#00BAE6' : '#00e701',
                                '&:hover': { backgroundColor: isBetStarted ? '#0099cc' : '#1fff20' },
                                borderRadius: 2, transition: 'all 0.3s ease',
                                boxShadow: isBetStarted ? '0 4px 15px rgba(0,186,230,0.4)' : '0 4px 15px rgba(0,231,1,0.4)',
                            }}
                        >
                            {isBetStarted ? '💰 Cashout' : '🎲 Bet'}
                        </Button>
                    </Grid>

                    {/* Right Panel - Game Grid */}
                    <Grid size={{ xs: 12, md: 9 }} sx={{ order: { xs: 1, md: 2 }, py: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 3 }, position: 'relative' }}>
                        {showPop && <WinPopup show={showPop} profitRatio={profitRatio} totalWin={sentBet.toFixed(2)} />}
                        {showLostPop && <LostPopup show={showLostPop} />}

                        {/* FIX: use width:'100%' + aspectRatio instead of fixed px/rem heights */}
                        <Grid container spacing={{ xs: 1, sm: 2 }}>
                            {Array.from({ length: totalCells }).map((_, index) => {
                                const visible = !!visibleImages[index];
                                const isBomb = bombIndices.includes(index);
                                const clickedByUser = isClickedByUser(index);
                                return (
                                    <Grid key={index} size={12 / 5}>
                                        <Box
                                            onClick={(e) => handleClick(e, index)}
                                            role="button"
                                            tabIndex={0}
                                            sx={{
                                                width: '100%',
                                                aspectRatio: '1 / 1',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 2,
                                                transition: 'all 0.2s ease',
                                                bgcolor: visible ? (isBomb ? '#3d0f0f' : '#071822') : '#2f4553',
                                                cursor: visible ? 'default' : 'pointer',
                                                borderBottom: visible ? 'none' : '4px solid #213743',
                                                '&:hover': visible ? {} : { transform: 'translateY(-4px) scale(1.05)', bgcolor: '#557086', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' },
                                                animation: visible ? 'revealCard 0.3s ease' : 'none',
                                                '@keyframes revealCard': {
                                                    '0%': { transform: 'scale(0.8) rotateY(90deg)', opacity: 0 },
                                                    '100%': { transform: 'scale(1) rotateY(0deg)', opacity: 1 },
                                                },
                                                p: { xs: 0.5, sm: 1 },
                                                boxSizing: 'border-box'
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={isBomb ? bomb2 : gem}
                                                alt={isBomb ? 'bomb' : 'gem'}
                                                sx={{
                                                    display: visible ? 'block' : 'none',
                                                    width: clickedByUser ? '70%' : '50%',
                                                    height: 'auto',
                                                    objectFit: 'contain',
                                                    filter: isBomb ? 'drop-shadow(0 0 8px #ef4444)' : 'drop-shadow(0 0 8px #00e701)',
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
            <audio ref={clickAudioRef} src={clickSound} />
        </Box>
    );
};

export default Mine;
