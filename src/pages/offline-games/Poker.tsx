import { useState, useEffect } from 'react';
import {
  Box, Button, Stack, Typography, Grid, Chip,
  CircularProgress, Fade, Paper
} from '@mui/material';
import { useAuth } from 'hooks/use-auth-context';
import { useDispatch } from 'store/store';
import { setBalance } from 'store/slices/balance';

const API = process.env.REACT_APP_API_URL || 'https://foretell-backend-production-58a6.up.railway.app';

const PAY_TABLE = [
  { hand: 'Royal Flush',     multiplier: 800 },
  { hand: 'Straight Flush',  multiplier: 50  },
  { hand: 'Four of a Kind',  multiplier: 25  },
  { hand: 'Full House',      multiplier: 9   },
  { hand: 'Flush',           multiplier: 6   },
  { hand: 'Straight',        multiplier: 4   },
  { hand: 'Three of a Kind', multiplier: 3   },
  { hand: 'Two Pair',        multiplier: 2   },
  { hand: 'Jacks or Better', multiplier: 1   },
];

const BET_OPTIONS = [1, 5, 10, 25, 50, 100];

function PlayingCard({ card, held, onClick, index }) {
  const isRed = card && (card.suit === '♥' || card.suit === '♦');

  return (
    <Fade in timeout={300 + index * 100}>
      <Box
        onClick={onClick}
        sx={{
          width: { xs: 58, sm: 80 },
          height: { xs: 90, sm: 120 },
          borderRadius: 2,
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          transition: 'all 0.2s',
          transform: held ? 'translateY(-12px)' : 'translateY(0)',
          border: held ? '2px solid #00e701' : '2px solid rgba(255,255,255,0.1)',
          bgcolor: card ? '#fff' : '#1a3a5c',
          boxShadow: held ? '0 0 16px rgba(0,231,1,0.6)' : '0 4px 12px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 0.8,
          userSelect: 'none',
          '&:hover': onClick ? { transform: held ? 'translateY(-16px)' : 'translateY(-4px)' } : {}
        }}
      >
        {card ? (
          <>
            <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.9rem' }, fontWeight: 700, color: isRed ? '#e53935' : '#1a1a2e', lineHeight: 1 }}>
              {card.rank}<br />{card.suit}
            </Typography>
            <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.8rem' }, textAlign: 'center', color: isRed ? '#e53935' : '#1a1a2e', lineHeight: 1 }}>
              {card.suit}
            </Typography>
            <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.9rem' }, fontWeight: 700, color: isRed ? '#e53935' : '#1a1a2e', transform: 'rotate(180deg)', lineHeight: 1 }}>
              {card.rank}<br />{card.suit}
            </Typography>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography sx={{ fontSize: '2rem', color: 'rgba(255,255,255,0.3)' }}>?</Typography>
          </Box>
        )}
        {held && (
          <Box sx={{
            position: 'absolute', bottom: -22, left: '50%', transform: 'translateX(-50%)',
            bgcolor: '#00e701', color: '#000', fontWeight: 700,
            fontSize: '0.55rem', px: 0.8, py: 0.2, borderRadius: 1, whiteSpace: 'nowrap'
          }}>
            HOLD
          </Box>
        )}
      </Box>
    </Fade>
  );
}

export default function PokerGame() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const [phase, setPhase] = useState('idle');
  const [hand, setHand] = useState([null, null, null, null, null]);
  const [heldIndexes, setHeldIndexes] = useState([]);
  const [betAmount, setBetAmount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const authHeader = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    const checkActive = async () => {
      try {
        const res = await fetch(`${API}/api/offline-game/poker/active`, { headers: authHeader });
        const data = await res.json();
        if (data.success && data.data) {
          setHand(data.data.hand);
          setPhase('dealt');
          setBetAmount(data.data.betAmount);
        }
      } catch (e) {}
    };
    checkActive();
  }, []);

  const toggleHold = (index) => {
    if (phase !== 'dealt') return;
    setHeldIndexes(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const deal = async () => {
    setError('');
    setResult(null);
    setHeldIndexes([]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/offline-game/poker/deal`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({ betAmount })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || data.error);
      setHand(data.data.hand);
      setPhase('dealt');
      if (data.data.newBalance !== undefined) dispatch(setBalance(data.data.newBalance));
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const draw = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/offline-game/poker/draw`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({ holdIndexes: heldIndexes })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || data.error);
      setHand(data.data.hand);
      setResult({ hand: data.data.result, multiplier: data.data.multiplier, payout: data.data.payout, win: data.data.win });
      setPhase('result');
      if (data.data.newBalance !== undefined) dispatch(setBalance(data.data.newBalance));
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const reset = () => {
    setPhase('idle');
    setHand([null, null, null, null, null]);
    setHeldIndexes([]);
    setResult(null);
    setError('');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a1628', p: { xs: 1, sm: 3 } }}>
      <Stack alignItems="center" spacing={3}>

        <Typography variant="h4" sx={{ fontWeight: 800, color: '#FCD116', letterSpacing: 2, textShadow: '0 0 20px rgba(252,209,22,0.5)' }}>
          🃏 VIDEO POKER
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Jacks or Better</Typography>

        {/* Pay Table */}
        <Paper sx={{ bgcolor: '#0d2137', border: '1px solid #1e3a5a', borderRadius: 2, p: 2, width: '100%', maxWidth: 600 }}>
          <Typography variant="subtitle2" sx={{ color: '#FCD116', mb: 1, textAlign: 'center', fontWeight: 700 }}>PAY TABLE</Typography>
          <Grid container spacing={0.5}>
            {PAY_TABLE.map(({ hand, multiplier }) => (
              <Grid item xs={6} key={hand}>
                <Stack direction="row" justifyContent="space-between" sx={{
                  px: 1, py: 0.3, borderRadius: 1,
                  bgcolor: result?.hand === hand ? 'rgba(0,231,1,0.15)' : 'transparent',
                  border: result?.hand === hand ? '1px solid #00e701' : '1px solid transparent'
                }}>
                  <Typography variant="caption" sx={{ color: result?.hand === hand ? '#00e701' : 'text.secondary' }}>{hand}</Typography>
                  <Typography variant="caption" sx={{ color: result?.hand === hand ? '#00e701' : '#FCD116', fontWeight: 700 }}>{multiplier}x</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Result Banner */}
        {result && (
          <Fade in>
            <Box sx={{
              textAlign: 'center', p: 2, borderRadius: 2, width: '100%', maxWidth: 600,
              bgcolor: result.win ? 'rgba(0,231,1,0.1)' : 'rgba(255,68,68,0.1)',
              border: `1px solid ${result.win ? '#00e701' : '#ff4444'}`
            }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: result.win ? '#00e701' : '#ff4444' }}>
                {result.hand}
              </Typography>
              {result.win && (
                <Typography variant="h6" sx={{ color: '#FCD116' }}>
                  +GH₵ {result.payout.toFixed(2)} ({result.multiplier}x)
                </Typography>
              )}
            </Box>
          </Fade>
        )}

        {/* Cards */}
        <Stack direction="row" spacing={{ xs: 0.8, sm: 2 }} justifyContent="center" sx={{ mt: 2, mb: 5 }}>
          {hand.map((card, i) => (
            <PlayingCard
              key={i}
              index={i}
              card={card}
              held={heldIndexes.includes(i)}
              onClick={phase === 'dealt' ? () => toggleHold(i) : undefined}
            />
          ))}
        </Stack>

        {phase === 'dealt' && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Tap cards to HOLD, then press Draw
          </Typography>
        )}

        {error && <Typography variant="body2" sx={{ color: '#ff4444' }}>{error}</Typography>}

        {/* Bet Selector */}
        {phase !== 'dealt' && (
          <Stack spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Bet Amount (GH₵)</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {BET_OPTIONS.map(amt => (
                <Chip
                  key={amt}
                  label={`${amt}`}
                  onClick={() => setBetAmount(amt)}
                  sx={{
                    bgcolor: betAmount === amt ? '#FCD116' : '#1e3a5a',
                    color: betAmount === amt ? '#000' : '#fff',
                    fontWeight: 700, cursor: 'pointer',
                    '&:hover': { bgcolor: betAmount === amt ? '#FCD116' : '#2a4a6a' }
                  }}
                />
              ))}
            </Stack>
            <Typography variant="body2" sx={{ color: '#FCD116', fontWeight: 700 }}>Bet: GH₵ {betAmount}</Typography>
          </Stack>
        )}

        {/* Buttons */}
        <Stack direction="row" spacing={2}>
          {phase === 'idle' && (
            <Button onClick={deal} disabled={loading} sx={{
              px: 6, py: 1.5, fontSize: '1.1rem', fontWeight: 800,
              backgroundImage: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
              color: '#fff', borderRadius: 3, textTransform: 'none',
              boxShadow: '0 4px 20px rgba(0,186,230,0.4)',
              '&:hover': { backgroundImage: 'linear-gradient(90deg, #006C9C 0%, #00BAE6 100%)' }
            }}>
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : '🃏 DEAL'}
            </Button>
          )}
          {phase === 'dealt' && (
            <Button onClick={draw} disabled={loading} sx={{
              px: 6, py: 1.5, fontSize: '1.1rem', fontWeight: 800,
              backgroundImage: 'linear-gradient(90deg, #00e701 0%, #00b300 100%)',
              color: '#000', borderRadius: 3, textTransform: 'none',
              boxShadow: '0 4px 20px rgba(0,231,1,0.4)',
            }}>
              {loading ? <CircularProgress size={24} /> : '🔄 DRAW'}
            </Button>
          )}
          {phase === 'result' && (
            <Button onClick={reset} sx={{
              px: 6, py: 1.5, fontSize: '1.1rem', fontWeight: 800,
              backgroundImage: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
              color: '#fff', borderRadius: 3, textTransform: 'none',
            }}>
              🃏 DEAL AGAIN
            </Button>
          )}
        </Stack>

      </Stack>
    </Box>
  );
}
@michealkusi42-bit
Comment

Leave a comment
Paste, dr
