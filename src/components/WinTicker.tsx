import { useEffect, useState, useRef } from 'react';
import { Box, Typography, Slide } from '@mui/material';

const GAMES = [
    'Mines', 'Dice', 'CoinFlip', 'Roulette', 'HiLo', 'Poker',
    'Live Casino', 'Slots', 'Blackjack', 'Baccarat', 'Crash', 'Fishing'
];

const AMOUNTS = [
    80, 120, 200, 350, 400, 500, 620, 750, 900, 1200,
    1500, 2000, 2500, 3000, 180, 260, 840, 1100, 660, 450,
    310, 970, 1350, 4500, 750, 88, 430, 2200, 5000, 330
];

// All valid Ghanaian mobile prefixes
const PREFIXES = [
    '020', '024', '054', '055', '059', // Telecel (Vodafone)
    '026', '056',                       // AirtelTigo
    '027', '057',                       // AirtelTigo
    '050', '053',                       // AirtelTigo
    '023', '028',                       // MTN
    '025', '030',                       // MTN
];

const randomPhone = () => {
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const mid = Math.floor(10 + Math.random() * 90); // 2 visible digits
    const suffix = Math.floor(100 + Math.random() * 900); // 3 visible digits
    return `${prefix}${mid}****${suffix}`;
};

const randomWin = () => ({
    phone: randomPhone(),
    amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
    game: GAMES[Math.floor(Math.random() * GAMES.length)],
    id: Math.random(),
});

const generateWins = () => Array.from({ length: 25 }, randomWin);

const WinTicker = () => {
    const [wins] = useState(generateWins);
    const [toasts, setToasts] = useState<any[]>([]);
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        const showToast = () => {
            const win = randomWin();
            setToasts(prev => [...prev, win].slice(-3));
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== win.id));
            }, 4000);
        };

        const first = setTimeout(showToast, 2000);
        intervalRef.current = setInterval(() => {
            showToast();
        }, 5000 + Math.random() * 3000);

        return () => {
            clearTimeout(first);
            clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <>
            {/* Scrolling Ticker Bar */}
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
                    top: '70px',
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

                {/* Scrolling content */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        animation: 'tickerScroll 50s linear infinite',
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

            {/* Toast Popups */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    left: 16,
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    pointerEvents: 'none',
                }}
            >
                {toasts.map((toast) => (
                    <Slide key={toast.id} direction="right" in mountOnEnter unmountOnExit>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                bgcolor: '#213743',
                                border: '1px solid rgba(0,231,1,0.3)',
                                borderRadius: 2,
                                px: 2,
                                py: 1.2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                minWidth: 230,
                                animation: 'fadeOut 0.5s ease 3.5s forwards',
                                '@keyframes fadeOut': {
                                    from: { opacity: 1 },
                                    to: { opacity: 0 },
                                },
                            }}
                        >
                            <Typography sx={{ fontSize: '1.2rem' }}>🎉</Typography>
                            <Box>
                                <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                                    {toast.phone}
                                </Typography>
                                <Typography sx={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
                                    won{' '}
                                    <Box component="span" sx={{ color: '#00e701' }}>
                                        GHS {toast.amount.toLocaleString()}
                                    </Box>
                                </Typography>
                                <Typography sx={{ color: '#64748b', fontSize: '0.65rem' }}>
                                    {toast.game}
                                </Typography>
                            </Box>
                        </Box>
                    </Slide>
                ))}
            </Box>
        </>
    );
};

export default WinTicker;
