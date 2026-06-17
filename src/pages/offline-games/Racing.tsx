import React, { useState, useCallback, useEffect, useRef } from 'react';
import './racing.css';
import Loader from 'components/Loader';
import { useSelector, useDispatch } from 'store/store';
import { Box, Button, Grid, TextField, Typography, Fade } from '@mui/material';
import { useSnackbar } from 'notistack';
import { getRaceHorses, placeRaceBet, getUserBalance } from 'api';

// ---- Types ----
type Horse = {
    id: string;
    name: string;
    color: string; // used to tint the horse emoji per lane
    odds: number; // payout multiplier, e.g. 1.9 means 1.9x bet if it wins
};

type RaceResult = {
    won: boolean;
    finishOrder: string[]; // horse ids, index 0 = winner
    multiplier: number;
    payout: number;
    newBalance: number;
};

const RACE_DURATION_MS = 8000;
const TICK_MS = 60;

// Fallback horses shown before /race/horses responds (or if it fails) so the
// screen never renders empty. Replace with whatever your backend returns.
const DEFAULT_HORSES: Horse[] = [
    { id: 'h1', name: 'Thunder Bolt', color: 'hue-rotate(0deg)', odds: 1.9 },
    { id: 'h2', name: 'Silver Arrow', color: 'hue-rotate(60deg)', odds: 2.8 },
    { id: 'h3', name: 'Midnight Star', color: 'hue-rotate(120deg)', odds: 3.5 },
    { id: 'h4', name: 'Golden Hoof', color: 'hue-rotate(200deg)', odds: 4.2 },
    { id: 'h5', name: 'Desert Wind', color: 'hue-rotate(260deg)', odds: 6.0 },
    { id: 'h6', name: 'Lucky Charm', color: 'hue-rotate(320deg)', odds: 9.0 }
];

// ---- Win / Lose popups (same visual language as Mine.tsx) ----
const WinPopup = ({ show, multiplier, totalWin }: { show: boolean; multiplier: string; totalWin: string }) => (
    <Fade in={show} timeout={400}>
        <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                textAlign: 'center',
                bgcolor: 'rgba(15, 33, 46, 0.95)',
                border: '2px solid #00e701',
                borderRadius: 4,
                px: 5,
                py: 4,
                boxShadow: '0 0 40px rgba(0,231,1,0.4)',
                backdropFilter: 'blur(8px)'
            }}
        >
            <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🏆</Typography>
            <Typography sx={{ color: '#00e701', fontWeight: 900, fontSize: '1.8rem', letterSpacing: 2 }}>
                YOUR HORSE WON!
            </Typography>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem', mt: 1 }}>
                {multiplier}×
            </Typography>
            <Typography sx={{ color: '#FFD700', fontWeight: 900, fontSize: '1.5rem', mt: 0.5 }}>
                GH₵ {totalWin} 🤑
            </Typography>
        </Box>
    </Fade>
);

const LostPopup = ({ show, winnerName }: { show: boolean; winnerName: string }) => (
    <Fade in={show} timeout={400}>
        <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                textAlign: 'center',
                bgcolor: 'rgba(15, 33, 46, 0.95)',
                border: '2px solid #ef4444',
                borderRadius: 4,
                px: 5,
                py: 4,
                boxShadow: '0 0 40px rgba(239,68,68,0.4)',
                backdropFilter: 'blur(8px)'
            }}
        >
            <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🏁</Typography>
            <Typography sx={{ color: '#ef4444', fontWeight: 900, fontSize: '1.8rem', letterSpacing: 2 }}>
                NOT THIS TIME
            </Typography>
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem', mt: 1 }}>
                {winnerName} took the win 🐎
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mt: 1 }}>
                Better luck next race!
            </Typography>
        </Box>
    </Fade>
);

const Racing = () => {
    const totalAmount = useSelector((state: any) => state.balance);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const [horses, setHorses] = useState<Horse[]>(DEFAULT_HORSES);
    const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
    const [betAmount, setBetAmount] = useState('100.0');
    const [loading, setLoading] = useState(false);
    const [raceState, setRaceState] = useState<'idle' | 'racing' | 'finished'>('idle');
    const [positions, setPositions] = useState<number[]>(DEFAULT_HORSES.map(() => 0));
    const [result, setResult] = useState<RaceResult | null>(null);
    const [showWin, setShowWin] = useState(false);
    const [showLost, setShowLost] = useState(false);

    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const positionsRef = useRef<number[]>(DEFAULT_HORSES.map(() => 0));
    const finishTimesRef = useRef<number[]>([]);
    const elapsedRef = useRef(0);

    // Load real horses/odds on mount
    useEffect(() => {
        const loadHorses = async () => {
            try {
                const response = await getRaceHorses();
                if (response.success && response.data?.length) {
                    setHorses(response.data);
                    positionsRef.current = response.data.map(() => 0);
                    setPositions(response.data.map(() => 0));
                }
            } catch {
                // keep DEFAULT_HORSES as a safe fallback
            }
        };
        loadHorses();
        return () => {
            if (tickRef.current) clearInterval(tickRef.current);
        };
    }, []);

    const updateBalance = async (newBalance?: number) => {
        if (newBalance !== undefined) {
            dispatch({ type: 'balance/setBalance', payload: newBalance });
        } else {
            try {
                const balanceData = await getUserBalance();
                if (balanceData && balanceData.amount !== undefined) {
                    dispatch({ type: 'balance/setBalance', payload: balanceData.amount });
                }
            } catch (error) {
                console.error('Failed to update balance:', error);
            }
        }
    };

    const reset = () => {
        setRaceState('idle');
        setShowWin(false);
        setShowLost(false);
        setResult(null);
        positionsRef.current = horses.map(() => 0);
        setPositions(horses.map(() => 0));
    };

    // Purely cosmetic animation. The win/lose outcome is decided entirely by
    // `finishOrder` from the backend response — this just renders it naturally,
    // with randomized bursts/lulls per horse rather than a flat constant speed.
    const animateRace = (finishOrder: string[]) => {
        const n = horses.length;
        const rankByIndex = new Array(n).fill(n - 1);
        finishOrder.forEach((horseId, rank) => {
            const idx = horses.findIndex((h) => h.id === horseId);
            if (idx !== -1) rankByIndex[idx] = rank;
        });

        // Each rank finishes a little later than the one before it, with some
        // per-race randomness so the gaps aren't identical every time.
        finishTimesRef.current = rankByIndex.map(
            (rank) => RACE_DURATION_MS * (1 + rank * (0.05 + Math.random() * 0.04))
        );
        positionsRef.current = new Array(n).fill(0);
        elapsedRef.current = 0;
        setPositions(new Array(n).fill(0));
        setRaceState('racing');

        tickRef.current = setInterval(() => {
            elapsedRef.current += TICK_MS;
            const next = positionsRef.current.map((pos, idx) => {
                if (pos >= 100) return 100;
                const tFinish = finishTimesRef.current[idx];
                const meanStep = (100 * TICK_MS) / tFinish;
                const burst = 0.4 + Math.random() * 1.2; // natural speed variance
                return Math.min(100, pos + meanStep * burst);
            });
            positionsRef.current = next;
            setPositions([...next]);

            const allDone = next.every((p) => p >= 100);
            const timedOut = elapsedRef.current >= RACE_DURATION_MS * 1.8;
            if (allDone || timedOut) {
                if (tickRef.current) clearInterval(tickRef.current);
                // Snap the actual winner to the finish line in case of any
                // animation rounding so the visual always matches the result.
                const winnerIdx = horses.findIndex((h) => h.id === finishOrder[0]);
                const snapped = [...positionsRef.current];
                if (winnerIdx !== -1) snapped[winnerIdx] = 100;
                setPositions(snapped);
                setRaceState('finished');
            }
        }, TICK_MS);
    };

    const handlePlaceBet = useCallback(async () => {
        if (!selectedHorseId) {
            enqueueSnackbar('Pick a horse first', { variant: 'error' });
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
            const response = await placeRaceBet(selectedHorseId, parseFloat(betAmount));
            if (response.success) {
                const data: RaceResult = response.data;
                setResult(data);
                updateBalance(data.newBalance);
                animateRace(data.finishOrder);
            }
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || error.message || 'Failed to place bet', { variant: 'error' });
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedHorseId, betAmount, totalAmount]);

    // Once the animation finishes, reveal the outcome popup
    useEffect(() => {
        if (raceState === 'finished' && result) {
            if (result.won) {
                setShowWin(true);
                setTimeout(() => setShowWin(false), 3500);
            } else {
                setShowLost(true);
                setTimeout(() => setShowLost(false), 3500);
            }
        }
    }, [raceState, result]);

    const winnerHorse = result ? horses.find((h) => h.id === result.finishOrder[0]) : null;
    const isRacing = raceState === 'racing';

    return (
        <Box sx={{ bgcolor: '#1a2c38', padding: '1rem' }}>
            <Loader />
            <Box sx={{ bgcolor: '#0f212e', maxWidth: '1536px', margin: '0 auto', borderRadius: 2, overflow: 'hidden' }}>
                <Grid container>
                    {/* Left Panel — bet controls */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ order: { xs: 2, md: 1 }, bgcolor: '#213743', py: 5, px: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>
                                    Bet Amount
                                </Typography>
                                <Box sx={{ display: 'flex', bgcolor: '#2f4553', p: '4px', borderRadius: 1 }}>
                                    <TextField
                                        type="number"
                                        disabled={isRacing}
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(e.target.value)}
                                        size="small"
                                        sx={{
                                            width: '55%',
                                            input: { bgcolor: '#0f212e', color: '#fff', fontWeight: 500, padding: '10px' },
                                            '& fieldset': { border: 'none' }
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', width: '45%', color: '#fff', fontWeight: 600, fontSize: '14px', alignItems: 'center' }}>
                                        <Button disabled={isRacing} onClick={() => setBetAmount((amt) => (Number(amt) / 2).toFixed(2))} sx={{ width: '50%', color: '#fff', '&:hover': { bgcolor: '#557086' } }}>½</Button>
                                        <Box sx={{ width: '3px', height: '20px', bgcolor: '#1a2c38', borderRadius: '4px' }} />
                                        <Button disabled={isRacing} onClick={() => setBetAmount((amt) => (Number(amt) * 2).toFixed(2))} sx={{ width: '50%', color: '#fff', '&:hover': { bgcolor: '#557086' } }}>2×</Button>
                                    </Box>
                                </Box>
                            </Box>

                            <Box display="flex" flexDirection="column" gap={1}>
                                <Typography variant="body2" sx={{ color: 'rgb(148 163 184)', fontWeight: 500 }}>
                                    Pick a Horse
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={1}>
                                    {horses.map((horse) => {
                                        const isSelected = selectedHorseId === horse.id;
                                        return (
                                            <Box
                                                key={horse.id}
                                                onClick={() => !isRacing && setSelectedHorseId(horse.id)}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    px: 2,
                                                    py: 1,
                                                    borderRadius: 1,
                                                    cursor: isRacing ? 'default' : 'pointer',
                                                    bgcolor: isSelected ? '#0e3a2f' : '#2f4553',
                                                    border: isSelected ? '2px solid #00e701' : '2px solid transparent',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    <span style={{ filter: horse.color, marginRight: 6 }}>🐎</span>
                                                    {horse.name}
                                                </Typography>
                                                <Typography sx={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: 700 }}>
                                                    {horse.odds.toFixed(1)}×
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handlePlaceBet}
                            disabled={loading || isRacing}
                            sx={{
                                mt: 2, py: 1.5, fontWeight: 700, fontSize: '1rem',
                                backgroundColor: '#00e701',
                                '&:hover': { backgroundColor: '#1fff20' },
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(0,231,1,0.4)'
                            }}
                        >
                            {isRacing ? '🏇 Racing...' : '🎲 Place Bet & Race'}
                        </Button>
                    </Grid>

                    {/* Right Panel — race track */}
                    <Grid size={{ xs: 12, md: 9 }} sx={{ m: '0 auto', py: { sm: 3, xs: 1.5 }, position: 'relative', width: '100%', boxSizing: 'border-box', order: { xs: 1, md: 2 } }}>
                        {showWin && result && (
                            <WinPopup show={showWin} multiplier={result.multiplier.toFixed(2)} totalWin={result.payout.toFixed(2)} />
                        )}
                        {showLost && (
                            <LostPopup show={showLost} winnerName={winnerHorse?.name || 'Another horse'} />
                        )}

                        <Box sx={{ px: { xs: 1.5, sm: 3 } }}>
                            {horses.map((horse, idx) => (
                                <Box
                                    key={horse.id}
                                    sx={{
                                        position: 'relative',
                                        height: { xs: 44, sm: 56 },
                                        mb: 1,
                                        borderRadius: 1,
                                        bgcolor: idx % 2 === 0 ? '#16242e' : '#152230',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* finish line */}
                                    <Box sx={{ position: 'absolute', right: 8, top: 0, bottom: 0, width: 3, bgcolor: '#557086' }} />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: `calc(${positions[idx] || 0}% * 0.92)`,
                                            transform: 'translateY(-50%)',
                                            transition: isRacing ? `left ${TICK_MS}ms linear` : 'none',
                                            fontSize: { xs: '1.5rem', sm: '2rem' },
                                            filter: horse.color
                                        }}
                                    >
                                        🐎
                                    </Box>
                                    <Typography
                                        sx={{
                                            position: 'absolute',
                                            left: 8,
                                            top: 4,
                                            color: 'rgb(148 163 184)',
                                            fontSize: '0.7rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        {horse.name}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Racing;
