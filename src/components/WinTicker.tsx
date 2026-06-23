import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

const GAMES = [
    'Mines', 'Dice', 'CoinFlip', 'Roulette', 'HiLo', 'Poker',
    'Live Casino', 'Slots', 'Blackjack', 'Baccarat', 'Crash', 'Fishing'
];

const AMOUNTS = [
    80, 120, 200, 350, 400, 500, 620, 750, 900, 1200,
    1500, 2000, 2500, 3000, 180, 260, 840, 1100, 660, 450,
    310, 970, 1350, 4500, 750, 88, 430, 2200, 5000, 330
];

const PREFIXES = [
    '020', '024', '054', '055', '059',
    '026', '056',
    '027', '057',
    '050', '053',
    '023', '028',
    '025', '030',
];

const randomPhone = () => {
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const mid = Math.floor(10 + Math.random() * 90);
    const suffix = Math.floor(100 + Math.random() * 900);
    return `${prefix}${mid}****${suffix}`;
};

const randomWin = () => ({
    phone: randomPhone(),
    amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
    game: GAMES[Math.floor(Math.random() * GAMES.length)],
    id: Math.random(),
});

const generateWins = () => Array.from({ length: 25 }, randomWin);

const useOnlineCount = () => {
    const [count, setCount] = useState(() => 1200 + Math.floor(Math.random() * 400));

    useEffect(() => {
        const id = setInterval(() => {
            setCount((prev) => {
                const drift = Math.floor(Math.random() * 15) - 6;
                const next = prev + drift;
                return Math.max(900, Math.min(2400, next));
            });
        }, 4000 + Math.random() * 3000);
        return () => clearInterval(id);
    }, []);

    return count;
};

const WinTicker = () => {
    const [wins] = useState(generateWins);
    const onlineCount = useOnlineCount();

    return (
        <>
            {/* ✅ Scrolling Ticker Bar - slowed down from 50s to 80s */}
            <Box
                sx={{
                    width: '100%',
                    bgcolor: '#0d1b2a',
                    borderBottom: '1px solid rgba(0,186,230,0.2)',
                    overflow: 'hidden',
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    position: 'fixed',
                    // ✅ FIXED: matches Header's actual height (60px), removing the gap
                    top: '60px',
                    left: 0,
                    right: 0,
                    zIndex: 1200,
                }}
            >
                {/* WINNERS label */}
                <Box
                    sx={{
                        px: 1.5,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: '#00BAE6',
                        flexShrink: 0,
                        zIndex: 1,
                    }}
                >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#000', whiteSpace: 'nowrap' }}>
                        🏆 WINNERS
                    </Typography>
                </Box>

                {/* Online players counter */}
                <Box
                    sx={{
                        px: 1.5,
                        height: '100%',
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        gap: 0.7,
                        flexShrink: 0,
                        zIndex: 1,
                        borderRight: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <Box
                        sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            bgcolor: '#00e701',
                            boxShadow: '0 0 6px #00e701',
                            animation: 'livePulse 1.6s ease-in-out infinite',
                            '@keyframes livePulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.35 },
                            },
                        }}
                    />
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                        {onlineCount.toLocaleString()} online
                    </Typography>
                </Box>

                {/* ✅ Scrolling content - slowed to 80s for easy reading */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        animation: 'tickerScroll 80s linear infinite',
                        whiteSpace: 'nowrap',
                        pl: 3,
                        '@keyframes tickerScroll': {
                            '0%': { transform: 'translateX(100vw)' },
                            '100%': { transform: 'translateX(-100%)' },
                        },
                        '&:hover': { animationPlayState: 'paused' },
                    }}
                >
                    {wins.map((win, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                            <Typography sx={{ color: '#00BAE6', fontSize: '0.75rem' }}>🎰</Typography>
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                {win.phone}
                            </Typography>
                            <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>
                                won
                            </Typography>
                            <Typography sx={{ color: '#00e701', fontSize: '0.75rem', fontWeight: 800 }}>
                                GHS {win.amount.toLocaleString()}
                            </Typography>
                            <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                                on {win.game}
                            </Typography>
                            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#2f4553', mx: 1 }} />
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Mobile online counter row */}
            <Box
                sx={{
                    display: { xs: 'flex', sm: 'none' },
                    alignItems: 'center',
                    gap: 0.7,
                    width: '100%',
                    height: 26,
                    bgcolor: '#0a141d',
                    position: 'fixed',
                    // ✅ FIXED: 60px header + 36px ticker = 96px, sits directly under it now
                    top: '96px',
                    left: 0,
                    right: 0,
                    zIndex: 1199,
                    px: 1.5,
                    borderBottom: '1px solid rgba(0,186,230,0.12)',
                }}
            >
                <Box
                    sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: '#00e701',
                        boxShadow: '0 0 6px #00e701',
                        animation: 'livePulse 1.6s ease-in-out infinite',
                    }}
                />
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#cbd5e1' }}>
                    {onlineCount.toLocaleString()} players online now
                </Typography>
            </Box>

            {/* ✅ Toast popups REMOVED */}
        </>
    );
};

export default WinTicker;
