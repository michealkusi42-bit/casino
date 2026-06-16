import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'store/store';
import { useSnackbar } from 'notistack';
import { Box, Button, Grid, TextField, Typography, InputAdornment, Chip } from '@mui/material';
import ruppee from 'assets/ruppee.svg';

// Card suits and values
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const HAND_RANKINGS: Record<string, { label: string; multiplier: number; color: string }> = {
    ROYAL_FLUSH:    { label: 'Royal Flush',     multiplier: 250, color: '#FFD700' },
    STRAIGHT_FLUSH: { label: 'Straight Flush',  multiplier: 50,  color: '#FF6B35' },
    FOUR_OF_A_KIND: { label: 'Four of a Kind',  multiplier: 25,  color: '#9B59B6' },
    FULL_HOUSE:     { label: 'Full House',       multiplier: 9,   color: '#3498DB' },
    FLUSH:          { label: 'Flush',            multiplier: 6,   color: '#1ABC9C' },
    STRAIGHT:       { label: 'Straight',         multiplier: 4,   color: '#2ECC71' },
    THREE_OF_A_KIND:{ label: 'Three of a Kind',  multiplier: 3,   color: '#F39C12' },
    TWO_PAIR:       { label: 'Two Pair',         multiplier: 2,   color: '#E67E22' },
    JACKS_OR_BETTER:{ label: 'Jacks or Better',  multiplier: 1,   color: '#BDC3C7' },
    NO_WIN:         { label: 'No Win',           multiplier: 0,   color: '#7F8C8D' },
};

type Card = { suit: string; value: string; heldIndex?: boolean };
type GamePhase = 'idle' | 'dealt' | 'result';

const createDeck = (): Card[] => {
    const deck: Card[] = [];
    for (const suit of SUITS) {
        for (const value of VALUES) {
            deck.push({ suit, value });
        }
    }
    return deck.sort(() => Math.random() - 0.5);
};

const getCardRank = (value: string): number => VALUES.indexOf(value);

const evaluateHand = (cards: Card[]): string => {
    const ranks = cards.map(c => getCardRank(c.value)).sort((a, b) => a - b);
    const suits = cards.map(c => c.suit);
    const valueCounts: Record<number, number> = {};
    ranks.forEach(r => { valueCounts[r] = (valueCounts[r] || 0) + 1; });
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const isFlush = suits.every(s => s === suits[0]);
    const isStraight = ranks[4] - ranks[0] === 4 && new Set(ranks).size === 5;
    const isRoyal = isStraight && ranks[0] === 8; // 10,J,Q,K,A

    if (isFlush && isRoyal) return 'ROYAL_FLUSH';
    if (isFlush && isStraight) return 'STRAIGHT_FLUSH';
    if (counts[0] === 4) return 'FOUR_OF_A_KIND';
    if (counts[0] === 3 && counts[1] === 2) return 'FULL_HOUSE';
    if (isFlush) return 'FLUSH';
    if (isStraight) return 'STRAIGHT';
    if (counts[0] === 3) return 'THREE_OF_A_KIND';
    if (counts[0] === 2 && counts[1] === 2) return 'TWO_PAIR';
    // Jacks or better: pair of J, Q, K, or A
    if (counts[0] === 2) {
        const pairedRank = parseInt(Object.keys(valueCounts).find(k => valueCounts[parseInt(k)] === 2) || '0');
        if (pairedRank >= 9) return 'JACKS_OR_BETTER'; // J=9, Q=10, K=11, A=12
    }
    return 'NO_WIN';
};

const isRedSuit = (suit: string) => suit === '♥' || suit === '♦';

const CardComponent = ({
    card,
    held,
    onToggle,
    phase,
    index,
    revealed,
}: {
    card: Card | null;
    held: boolean;
    onToggle: () => void;
    phase: GamePhase;
    index: number;
    revealed: boolean;
}) => {
    return (
        <Box
            onClick={phase === 'dealt' ? onToggle : undefined}
            sx={{
                position: 'relative',
                width: { xs: 58, sm: 80, md: 95 },
                height: { xs: 88, sm: 120, md: 140 },
                cursor: phase === 'dealt' ? 'pointer' : 'default',
                perspective: '600px',
                flexShrink: 0,
            }}
        >
            {/* Card body */}
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: card ? '#fff' : '#1a3a4a',
                    border: held ? '2px solid #FFD700' : '2px solid transparent',
                    boxShadow: held
                        ? '0 0 16px rgba(255,215,0,0.6)'
                        : '0 4px 16px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    transform: held ? 'translateY(-10px)' : 'none',
                    animation: revealed ? `dealCard 0.3s ease ${index * 0.1}s both` : 'none',
                    '@keyframes dealCard': {
                        from: { opacity: 0, transform: 'translateY(30px) scale(0.9)' },
                        to: { opacity: 1, transform: held ? 'translateY(-10px)' : 'translateY(0)' },
                    },
                }}
            >
                {card ? (
                    <>
                        <Typography
                            sx={{
                                position: 'absolute',
                                top: 6,
                                left: 8,
                                fontSize: { xs: '0.75rem', sm: '1rem' },
                                fontWeight: 800,
                                color: isRedSuit(card.suit) ? '#E53935' : '#1a1a2e',
                                lineHeight: 1,
                            }}
                        >
                            {card.value}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                                color: isRedSuit(card.suit) ? '#E53935' : '#1a1a2e',
                                lineHeight: 1,
                            }}
                        >
                            {card.suit}
                        </Typography>
                        <Typography
                            sx={{
                                position: 'absolute',
                                bottom: 6,
                                right: 8,
                                fontSize: { xs: '0.75rem', sm: '1rem' },
                                fontWeight: 800,
                                color: isRedSuit(card.suit) ? '#E53935' : '#1a1a2e',
                                transform: 'rotate(180deg)',
                                lineHeight: 1,
                            }}
                        >
                            {card.value}
                        </Typography>
                    </>
                ) : (
                    <Typography sx={{ fontSize: '2rem', color: '#2f4553' }}>🂠</Typography>
                )}
            </Box>

            {/* HELD badge */}
            {held && phase === 'dealt' && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -28,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: '#FFD700',
                        color: '#000',
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        px: 1.5,
                        py: 0.3,
                        borderRadius: 1,
                        letterSpacing: 1,
                        whiteSpace: 'nowrap',
                    }}
                >
                    HELD
                </Box>
            )}
        </Box>
    );
};

const PayTable = ({ currentHand }: { currentHand: string }) => (
    <Box sx={{ mt: 3 }}>
        <Typography variant="caption" sx={{ color: '#94a3b8', mb: 1, display: 'block', letterSpacing: 1 }}>
            PAY TABLE
        </Typography>
        {Object.entries(HAND_RANKINGS).map(([key, { label, multiplier, color }]) => (
            <Box
                key={key}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 0.4,
                    px: 1,
                    borderRadius: 1,
                    bgcolor: currentHand === key ? 'rgba(255,215,0,0.15)' : 'transparent',
                    border: currentHand === key ? '1px solid rgba(255,215,0,0.4)' : '1px solid transparent',
                    mb: 0.3,
                }}
            >
                <Typography variant="caption" sx={{ color: currentHand === key ? '#FFD700' : color, fontWeight: currentHand === key ? 700 : 400 }}>
                    {label}
                </Typography>
                <Typography variant="caption" sx={{ color: currentHand === key ? '#FFD700' : '#94a3b8', fontWeight: 700 }}>
                    {multiplier}×
                </Typography>
            </Box>
        ))}
    </Box>
);

const Poker = () => {
    const totalAmount = useSelector((state: any) => state.balance);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const [betAmount, setBetAmount] = useState('10.00');
    const [phase, setPhase] = useState<GamePhase>('idle');
    const [deck, setDeck] = useState<Card[]>([]);
    const [hand, setHand] = useState<Card[]>([null!, null!, null!, null!, null!]);
    const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
    const [handResult, setHandResult] = useState<string>('NO_WIN');
    const [revealed, setRevealed] = useState(false);
    const [history, setHistory] = useState<{ result: string; win: boolean; amount: number }[]>([]);

    const deal = useCallback(() => {
        const bet = parseFloat(betAmount);
        if (!bet || bet <= 0) {
            enqueueSnackbar('Enter a valid bet amount', { variant: 'error' });
            return;
        }
        if (bet > totalAmount.amount) {
            enqueueSnackbar('Insufficient balance', { variant: 'error' });
            return;
        }

        const newDeck = createDeck();
        const newHand = newDeck.splice(0, 5);
        setDeck(newDeck);
        setHand(newHand);
        setHeld([false, false, false, false, false]);
        setHandResult('NO_WIN');
        setPhase('dealt');
        setRevealed(true);

        // Deduct bet
        dispatch({ type: 'balance/setBalance', payload: { ...totalAmount, amount: totalAmount.amount - bet } });
    }, [betAmount, totalAmount, dispatch, enqueueSnackbar]);

    const draw = useCallback(() => {
        const newDeck = [...deck];
        const newHand = hand.map((card, i) => held[i] ? card : newDeck.shift()!);
        const result = evaluateHand(newHand);
        const ranking = HAND_RANKINGS[result];
        const bet = parseFloat(betAmount);
        const payout = bet * ranking.multiplier;

        setHand(newHand);
        setHandResult(result);
        setPhase('result');
        setRevealed(true);

        if (payout > 0) {
            dispatch({ type: 'balance/setBalance', payload: { ...totalAmount, amount: totalAmount.amount + payout } });
            enqueueSnackbar(`🎉 ${ranking.label}! You won ${payout.toFixed(2)}!`, { variant: 'success' });
        } else {
            enqueueSnackbar('No win this time. Try again!', { variant: 'info' });
        }

        setHistory(prev => [{ result: ranking.label, win: payout > 0, amount: payout > 0 ? payout : bet }, ...prev].slice(0, 6));
    }, [deck, hand, held, betAmount, totalAmount, dispatch, enqueueSnackbar]);

    const toggleHold = (i: number) => {
        setHeld(prev => prev.map((h, idx) => idx === i ? !h : h));
    };

    const ranking = HAND_RANKINGS[handResult];

    return (
        <Box sx={{ bgcolor: '#0d1b2a', minHeight: '100vh', pt: 4, px: 1.5 }}>
            <Box sx={{ bgcolor: '#0f212e', maxWidth: '1400px', mx: 'auto', borderRadius: 3, overflow: 'hidden' }}>
                <Grid container sx={{ minHeight: '85vh' }}>

                    {/* Left Panel */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ order: { xs: 2, md: 1 }, bgcolor: '#213743', py: 4, px: 3 }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 3, letterSpacing: 1 }}>
                            🃏 VIDEO POKER
                        </Typography>

                        {/* Bet Amount */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500, mb: 0.5 }}>
                                Bet Amount
                            </Typography>
                            <Box sx={{ display: 'flex', bgcolor: '#2f4553', p: '4px', borderRadius: 1 }}>
                                <TextField
                                    type="number"
                                    disabled={phase === 'dealt'}
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(e.target.value)}
                                    size="small"
                                    sx={{
                                        width: '55%',
                                        input: { bgcolor: '#0f212e', color: '#fff', fontWeight: 500, padding: '10px' },
                                        '& fieldset': { border: 'none' },
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
                                        disabled={phase === 'dealt'}
                                        onClick={() => setBetAmount(v => (Number(v) / 2).toFixed(2))}
                                        sx={{ width: '50%', color: '#fff', minWidth: 0, '&:hover': { bgcolor: '#557086' } }}
                                    >½</Button>
                                    <Box sx={{ width: 3, height: 20, bgcolor: '#1a2c38', borderRadius: 1 }} />
                                    <Button
                                        disabled={phase === 'dealt'}
                                        onClick={() => setBetAmount(v => (Number(v) * 2).toFixed(2))}
                                        sx={{ width: '50%', color: '#fff', minWidth: 0, '&:hover': { bgcolor: '#557086' } }}
                                    >2×</Button>
                                </Box>
                            </Box>
                        </Box>

                        {/* Potential Win */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500, mb: 0.5 }}>
                                Max Win (Royal Flush)
                            </Typography>
                            <Box sx={{ bgcolor: '#2f4553', px: 2, py: 1.5, borderRadius: 1, display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ color: '#FFD700', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {(parseFloat(betAmount || '0') * 250).toFixed(2)}
                                </Typography>
                                <Box component="img" src={ruppee} sx={{ width: 16, height: 16 }} />
                            </Box>
                        </Box>

                        {/* Deal / Draw Button */}
                        {phase !== 'dealt' ? (
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={deal}
                                sx={{
                                    py: 1.8,
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    background: 'linear-gradient(135deg, #00BAE6 0%, #58D6FF 100%)',
                                    color: '#000',
                                    borderRadius: 2,
                                    letterSpacing: 1,
                                    boxShadow: '0 4px 20px rgba(0,186,230,0.4)',
                                    '&:hover': { background: 'linear-gradient(135deg, #0099cc 0%, #00BAE6 100%)' },
                                }}
                            >
                                {phase === 'result' ? 'DEAL AGAIN' : 'DEAL'}
                            </Button>
                        ) : (
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={draw}
                                sx={{
                                    py: 1.8,
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                                    color: '#000',
                                    borderRadius: 2,
                                    letterSpacing: 1,
                                    boxShadow: '0 4px 20px rgba(255,215,0,0.4)',
                                    '&:hover': { background: 'linear-gradient(135deg, #FFC200 0%, #FF6A00 100%)' },
                                }}
                            >
                                DRAW
                            </Button>
                        )}

                        {phase === 'dealt' && (
                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', textAlign: 'center', mt: 1 }}>
                                Click cards to hold, then DRAW
                            </Typography>
                        )}

                        <PayTable currentHand={phase === 'result' ? handResult : 'NO_WIN'} />
                    </Grid>

                    {/* Right Panel - Game Area */}
                    <Grid
                        size={{ xs: 12, md: 9 }}
                        sx={{
                            order: { xs: 1, md: 2 },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: { xs: '60vh', md: '85vh' },
                            p: 3,
                            position: 'relative',
                            background: 'radial-gradient(ellipse at center, #1a3a4a 0%, #0d1b2a 100%)',
                        }}
                    >
                        {/* History chips top right */}
                        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 280 }}>
                            {history.map((h, i) => (
                                <Chip
                                    key={i}
                                    label={h.win ? `+${h.amount.toFixed(0)}` : `-${h.amount.toFixed(0)}`}
                                    size="small"
                                    sx={{
                                        bgcolor: h.win ? '#00e701' : '#2f4553',
                                        color: h.win ? '#000' : '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.7rem',
                                    }}
                                />
                            ))}
                        </Box>

                        {/* Result banner */}
                        {phase === 'result' && (
                            <Box
                                sx={{
                                    mb: 3,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    bgcolor: ranking.multiplier > 0 ? 'rgba(255,215,0,0.15)' : 'rgba(127,140,141,0.15)',
                                    border: `2px solid ${ranking.color}`,
                                    textAlign: 'center',
                                    animation: 'fadeIn 0.4s ease',
                                    '@keyframes fadeIn': { from: { opacity: 0, transform: 'scale(0.9)' }, to: { opacity: 1, transform: 'scale(1)' } },
                                }}
                            >
                                <Typography sx={{ color: ranking.color, fontWeight: 900, fontSize: { xs: '1.1rem', sm: '1.4rem' }, letterSpacing: 2 }}>
                                    {ranking.label.toUpperCase()}
                                </Typography>
                                {ranking.multiplier > 0 && (
                                    <Typography sx={{ color: '#FFD700', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {ranking.multiplier}× • Won {(parseFloat(betAmount) * ranking.multiplier).toFixed(2)}
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {phase === 'idle' && (
                            <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem', mb: 4, letterSpacing: 1 }}>
                                Place your bet and press DEAL
                            </Typography>
                        )}

                        {/* Cards */}
                        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, justifyContent: 'center', pb: 4 }}>
                            {[0, 1, 2, 3, 4].map(i => (
                                <CardComponent
                                    key={i}
                                    index={i}
                                    card={hand[i] || null}
                                    held={held[i]}
                                    onToggle={() => toggleHold(i)}
                                    phase={phase}
                                    revealed={revealed}
                                />
                            ))}
                        </Box>

                        {/* Table felt decoration */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: 'linear-gradient(90deg, transparent, #00BAE6, transparent)',
                                opacity: 0.4,
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Poker;
