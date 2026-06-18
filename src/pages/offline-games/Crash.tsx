import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'store/store';
import { useSnackbar } from 'notistack';
import { Box, Button, TextField, Typography, InputAdornment, Stack } from '@mui/material';
import ruppee from 'assets/ruppee.svg';
import winSound from 'assets/winDice.mp3';
import betSound from 'assets/betClick.mp3';
import { playCrash } from 'api';

interface BetSlot {
  amount: string;
  autoCashout: string;
  active: boolean;
  cashedOut: boolean;
  cashedOutAt: number | null;
  payout: number;
}

const CrashCanvas = ({ multiplier, crashed, cashedOut, running }: {
  multiplier: number; crashed: boolean; cashedOut: boolean; running: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!running && !crashed) { pointsRef.current = []; frameRef.current = 0; }
  }, [running, crashed]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const PAD = { left: 44, bottom: 36, right: 20, top: 20 };

    if (running || crashed) {
      frameRef.current += 1;
      const progress = Math.min(frameRef.current / 180, 1);
      const px = PAD.left + progress * (W - PAD.left - PAD.right);
      const py = H - PAD.bottom - Math.pow(progress, 1.5) * (H - PAD.top - PAD.bottom);
      pointsRef.current.push({ x: px, y: py });
      if (pointsRef.current.length > 400) pointsRef.current.shift();
    }

    ctx.clearRect(0, 0, W, H);

    // BG
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, crashed ? '#120004' : '#04091a');
    bg.addColorStop(1, crashed ? '#080002' : '#020610');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Stars
    const starPositions = [[0.08,0.08],[0.18,0.28],[0.38,0.06],[0.58,0.18],[0.78,0.08],[0.93,0.22],[0.13,0.48],[0.33,0.38],[0.53,0.14],[0.73,0.33],[0.88,0.52],[0.04,0.68],[0.22,0.62],[0.44,0.54],[0.66,0.44],[0.84,0.58],[0.11,0.82],[0.31,0.74],[0.51,0.78],[0.71,0.68],[0.91,0.78]];
    starPositions.forEach(([sx, sy], i) => {
      ctx.beginPath();
      ctx.arc(sx * W, sy * H, i % 3 === 0 ? 1.5 : 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.3 + (i % 4) * 0.15})`;
      ctx.fill();
    });

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const y = PAD.top + (i / 5) * (H - PAD.top - PAD.bottom);
      const x = PAD.left + (i / 5) * (W - PAD.left - PAD.right);
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, H - PAD.bottom); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, H - PAD.bottom); ctx.lineTo(W - PAD.right, H - PAD.bottom); ctx.stroke();

    const pts = pointsRef.current;
    if (pts.length < 2) return;

    const lineColor = crashed ? '#ff4444' : cashedOut ? '#ffd700' : '#00e676';

    // Fill under curve
    const fill = ctx.createLinearGradient(0, 0, 0, H);
    if (crashed) { fill.addColorStop(0, 'rgba(255,50,50,0.18)'); fill.addColorStop(1, 'rgba(255,50,50,0.01)'); }
    else if (cashedOut) { fill.addColorStop(0, 'rgba(255,215,0,0.18)'); fill.addColorStop(1, 'rgba(255,215,0,0.01)'); }
    else { fill.addColorStop(0, 'rgba(0,230,118,0.15)'); fill.addColorStop(1, 'rgba(0,230,118,0.01)'); }
    ctx.beginPath(); ctx.moveTo(PAD.left, H - PAD.bottom);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, H - PAD.bottom); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();

    // Curve
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i+1].x) / 2, my = (pts[i].y + pts[i+1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
    ctx.strokeStyle = lineColor; ctx.lineWidth = 2.5;
    ctx.shadowColor = lineColor; ctx.shadowBlur = 14; ctx.stroke(); ctx.shadowBlur = 0;

    // Tip
    const tip = pts[pts.length - 1];
    if (crashed) {
      const eg = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 35);
      eg.addColorStop(0, 'rgba(255,180,0,0.9)'); eg.addColorStop(0.5, 'rgba(255,60,0,0.5)'); eg.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.beginPath(); ctx.arc(tip.x, tip.y, 35, 0, Math.PI*2); ctx.fillStyle = eg; ctx.fill();
      ctx.font = '26px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('💥', tip.x, tip.y);
    } else {
      const rg = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 18);
      rg.addColorStop(0, 'rgba(0,230,118,0.5)'); rg.addColorStop(1, 'rgba(0,230,118,0)');
      ctx.beginPath(); ctx.arc(tip.x, tip.y, 18, 0, Math.PI*2); ctx.fillStyle = rg; ctx.fill();
      ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🚀', tip.x, tip.y);
    }

    // Y labels
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '9px monospace'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ['1x','2x','3x','4x'].forEach((l, i) => {
      const y = H - PAD.bottom - ((i+1)/4) * (H-PAD.top-PAD.bottom);
      ctx.fillText(l, PAD.left - 5, y);
    });
  }, [multiplier, crashed, cashedOut, running]);

  useEffect(() => {
    if (!running) { draw(); return; }
    const loop = () => { draw(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, draw]);

  useEffect(() => { if (crashed) draw(); }, [crashed, draw]);

  return (
    <canvas ref={canvasRef} width={640} height={340}
      style={{ width: '100%', height: '100%', display: 'block' }} />
  );
};

const BetPanel = ({ slot, index, running, multiplier, onBet, onCashout, onChange }: {
  slot: BetSlot; index: number; running: boolean; multiplier: number;
  onBet: (i: number) => void; onCashout: (i: number) => void;
  onChange: (i: number, field: keyof BetSlot, val: string) => void;
}) => {
  const potential = slot.active && !slot.cashedOut
    ? (parseFloat(slot.amount || '0') * multiplier).toFixed(2) : null;

  return (
    <Box sx={{
      bgcolor: '#0a1828', border: slot.active ? '1px solid #00e67644' : '1px solid #112236',
      borderRadius: 2, p: { xs: 1, sm: 1.5 }, flex: 1, minWidth: 0,
    }}>
      <Stack direction="row" spacing={0.5} mb={1} sx={{
        bgcolor: '#071320', borderRadius: 1, border: '1px solid #112236', overflow: 'hidden'
      }}>
        <TextField type="number" value={slot.amount} disabled={slot.active}
          onChange={e => onChange(index, 'amount', e.target.value)}
          size="small" placeholder="0.00"
          sx={{
            flex: 1,
            '& .MuiInputBase-root': { bgcolor: 'transparent' },
            '& input': { color: '#fff', fontWeight: 700, fontSize: '0.88rem', py: 0.75, px: 1 },
            '& fieldset': { border: 'none' },
          }}
          InputProps={{ endAdornment: <InputAdornment position="end"><Box component="img" src={ruppee} sx={{ width: 13, height: 13, opacity: 0.5 }} /></InputAdornment> }}
        />
        {['½','2×'].map(l => (
          <Button key={l} disabled={slot.active}
            onClick={() => onChange(index, 'amount', l === '½'
              ? (parseFloat(slot.amount||'0')/2).toFixed(2)
              : (parseFloat(slot.amount||'0')*2).toFixed(2))}
            sx={{ minWidth: 28, px: 0.4, color: '#64748b', fontSize: '0.7rem', '&:hover': { color: '#fff' } }}>
            {l}
          </Button>
        ))}
      </Stack>

      <Stack direction="row" spacing={0.5} alignItems="center" mb={1.5}>
        <Typography sx={{ color: '#475569', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>Auto @</Typography>
        <TextField type="number" value={slot.autoCashout} disabled={slot.active}
          onChange={e => onChange(index, 'autoCashout', e.target.value)}
          size="small" placeholder="2.00"
          sx={{
            flex: 1,
            '& .MuiInputBase-root': { bgcolor: '#071320', borderRadius: 1 },
            '& input': { color: '#fff', fontSize: '0.78rem', py: 0.55, px: 0.8 },
            '& fieldset': { borderColor: '#112236' },
          }}
        />
        <Typography sx={{ color: '#475569', fontSize: '0.68rem' }}>x</Typography>
      </Stack>

      {potential && (
        <Box sx={{ bgcolor: '#00e67610', border: '1px solid #00e67622', borderRadius: 1, px: 1, py: 0.4, mb: 1, textAlign: 'center' }}>
          <Typography sx={{ color: '#00e676', fontSize: '0.72rem', fontWeight: 700 }}>
            💰 {potential} GHS
          </Typography>
        </Box>
      )}

      {slot.cashedOut && (
        <Box sx={{ bgcolor: '#ffd70015', border: '1px solid #ffd70033', borderRadius: 1, px: 1, py: 0.4, mb: 1, textAlign: 'center' }}>
          <Typography sx={{ color: '#ffd700', fontSize: '0.72rem', fontWeight: 700 }}>
            ✅ @{slot.cashedOutAt}x +{slot.payout.toFixed(2)}
          </Typography>
        </Box>
      )}

      {!slot.active ? (
        <Button fullWidth onClick={() => onBet(index)} disabled={running && !slot.active}
          sx={{
            py: 0.9, fontWeight: 800, fontSize: '0.82rem', letterSpacing: 0.5,
            bgcolor: '#00e676', color: '#000', borderRadius: 1.5,
            '&:hover': { bgcolor: '#00c853' },
            '&:disabled': { bgcolor: '#0d2035', color: '#334155' },
          }}>
          BET
        </Button>
      ) : (
        <Button fullWidth onClick={() => onCashout(index)} disabled={slot.cashedOut}
          sx={{
            py: 0.9, fontWeight: 800, fontSize: '0.82rem',
            bgcolor: slot.cashedOut ? '#0d2035' : '#ffd700',
            color: slot.cashedOut ? '#334155' : '#000',
            borderRadius: 1.5,
            '&:hover': { bgcolor: '#ffed4a' },
            animation: !slot.cashedOut ? 'pulse 0.9s ease-in-out infinite' : 'none',
            '@keyframes pulse': {
              '0%,100%': { boxShadow: '0 0 0 0 rgba(255,215,0,0.5)' },
              '50%': { boxShadow: '0 0 0 8px rgba(255,215,0,0)' },
            },
          }}>
          {slot.cashedOut ? `OUT @ ${slot.cashedOutAt}x` : `CASH OUT ${multiplier.toFixed(2)}x`}
        </Button>
      )}
    </Box>
  );
};

const Crash = () => {
  const totalAmount = useSelector((state: any) => state.balance);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [slots, setSlots] = useState<BetSlot[]>([
    { amount: '10', autoCashout: '2.00', active: false, cashedOut: false, cashedOutAt: null, payout: 0 },
    { amount: '10', autoCashout: '2.00', active: false, cashedOut: false, cashedOutAt: null, payout: 0 },
  ]);
  const [multiplier, setMultiplier] = useState(1.0);
  const [running, setRunning] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [crashAt, setCrashAt] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const intervalRef = useRef<any>(null);
  const winAudio = new Audio(winSound);
  const betAudio = new Audio(betSound);

  const resetRound = useCallback(() => {
    setMultiplier(1.0); setCrashed(false); setCrashAt(null); setRunning(false);
    setSlots(prev => prev.map(s => ({ ...s, active: false, cashedOut: false, cashedOutAt: null, payout: 0 })));
  }, []);

  const handleBet = useCallback(async (index: number) => {
    const slot = slots[index];
    if (!slot.amount || parseFloat(slot.amount) <= 0) return enqueueSnackbar('Enter a valid bet', { variant: 'error' });
    if (parseFloat(slot.amount) > totalAmount) return enqueueSnackbar('Not enough balance', { variant: 'error' });
    betAudio.play();
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, active: true } : s));
    try {
      const response = await playCrash(parseFloat(slot.amount), parseFloat(slot.autoCashout));
      if (!response.success) {
        setSlots(prev => prev.map((s, i) => i === index ? { ...s, active: false } : s));
        return enqueueSnackbar(response.message || 'Failed', { variant: 'error' });
      }
      const { crashAt: ca, newBalance } = response.data;
      if (!running) {
        setRunning(true);
        let current = 1.0;
        intervalRef.current = setInterval(() => {
          current = parseFloat((current + 0.02).toFixed(2));
          setMultiplier(current);
          setSlots(prev => prev.map(s => {
            if (s.active && !s.cashedOut) {
              const autoCo = parseFloat(s.autoCashout);
              if (autoCo && current >= autoCo) {
                const p = parseFloat((parseFloat(s.amount) * autoCo).toFixed(2));
                winAudio.play();
                dispatch({ type: 'balance/setBalance', payload: newBalance });
                return { ...s, cashedOut: true, cashedOutAt: autoCo, payout: p };
              }
            }
            return s;
          }));
          if (current >= ca) {
            clearInterval(intervalRef.current);
            setMultiplier(ca); setCrashed(true); setCrashAt(ca); setRunning(false);
            setHistory(prev => [ca, ...prev].slice(0, 10));
            dispatch({ type: 'balance/setBalance', payload: newBalance });
            setTimeout(resetRound, 4000);
          }
        }, 80);
      }
    } catch (err: any) {
      setSlots(prev => prev.map((s, i) => i === index ? { ...s, active: false } : s));
      enqueueSnackbar(err.response?.data?.message || 'Failed', { variant: 'error' });
    }
  }, [slots, totalAmount, running]);

  const handleCashout = useCallback((index: number) => {
    const slot = slots[index];
    if (!slot.active || slot.cashedOut) return;
    const payout = parseFloat((parseFloat(slot.amount) * multiplier).toFixed(2));
    winAudio.play();
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, cashedOut: true, cashedOutAt: multiplier, payout } : s));
    dispatch({ type: 'balance/setBalance', payload: totalAmount + payout });
  }, [slots, multiplier, totalAmount]);

  const handleChange = useCallback((index: number, field: keyof BetSlot, val: string) => {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, [field]: val } : s));
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <Box sx={{ bgcolor: '#04091a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* History bar */}
      <Stack direction="row" spacing={0.5} sx={{ px: 2, py: 0.75, overflowX: 'auto', borderBottom: '1px solid #0a1828', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        <Typography sx={{ color: '#334155', fontSize: '0.65rem', whiteSpace: 'nowrap', alignSelf: 'center', mr: 0.5 }}>History</Typography>
        {history.map((h, i) => (
          <Box key={i} sx={{
            px: 1.2, py: 0.25, borderRadius: 9999, fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap',
            bgcolor: h < 1.5 ? '#ff444418' : h < 3 ? '#ff980018' : '#00e67618',
            color: h < 1.5 ? '#ff6666' : h < 3 ? '#ff9800' : '#00e676',
          }}>
            {h.toFixed(2)}x
          </Box>
        ))}
      </Stack>

      {/* Canvas */}
      <Box sx={{ position: 'relative', flex: '0 0 auto', height: { xs: 210, sm: 280, md: 340 } }}>
        <CrashCanvas multiplier={multiplier} crashed={crashed} cashedOut={slots.some(s => s.cashedOut)} running={running} />
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <Typography sx={{
            fontFamily: '"Courier New", monospace', fontWeight: 900,
            fontSize: { xs: '3.2rem', sm: '4rem', md: '5rem' }, lineHeight: 1,
            color: crashed ? '#ff4444' : slots.some(s => s.cashedOut && !crashed) ? '#ffd700' : '#00e676',
            textShadow: crashed ? '0 0 30px #ff4444, 0 0 60px #ff000055' : '0 0 25px #00e67677',
            letterSpacing: '-1px',
          }}>
            {multiplier.toFixed(2)}x
          </Typography>
          {crashed && crashAt && (
            <Typography sx={{ color: '#ff6666', fontSize: '0.8rem', fontWeight: 700, mt: 0.5 }}>
              CRASHED AT {crashAt.toFixed(2)}x
            </Typography>
          )}
          {!running && !crashed && multiplier === 1.0 && (
            <Typography sx={{ color: '#334155', fontSize: '0.8rem', mt: 0.5 }}>
              Place your bet to start
            </Typography>
          )}
        </Box>
      </Box>

      {/* Bet panels */}
      <Box sx={{ px: { xs: 1, sm: 2 }, pt: 1.5, pb: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1}>
          {slots.map((slot, i) => (
            <BetPanel key={i} slot={slot} index={i} running={running} multiplier={multiplier}
              onBet={handleBet} onCashout={handleCashout} onChange={handleChange} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default Crash;
