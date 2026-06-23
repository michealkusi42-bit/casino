import { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const TELEGRAM_HANDLE = 'AliceFortellBet';

const CustomerService = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [hasDragged, setHasDragged] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const ref = useRef<HTMLDivElement>(null);

    // ✅ Set initial position bottom right
    useEffect(() => {
        const x = window.innerWidth - 80;
        const y = window.innerHeight - 160;
        setPosition({ x, y });
    }, []);

    const onMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        setHasDragged(false);
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setDragging(true);
        setHasDragged(false);
        dragStart.current = {
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y
        };
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!dragging) return;
            setHasDragged(true);
            setPosition({
                x: Math.min(Math.max(0, e.clientX - dragStart.current.x), window.innerWidth - 70),
                y: Math.min(Math.max(0, e.clientY - dragStart.current.y), window.innerHeight - 80)
            });
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!dragging) return;
            setHasDragged(true);
            setPosition({
                x: Math.min(Math.max(0, e.touches[0].clientX - dragStart.current.x), window.innerWidth - 70),
                y: Math.min(Math.max(0, e.touches[0].clientY - dragStart.current.y), window.innerHeight - 80)
            });
        };

        const onUp = () => setDragging(false);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onUp);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onUp);
        };
    }, [dragging]);

    const handleClick = () => {
        if (!hasDragged) {
            window.open(`https://t.me/${TELEGRAM_HANDLE}`, '_blank');
        }
    };

    return (
        <Box
            ref={ref}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onClick={handleClick}
            sx={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.3,
                cursor: dragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none'
            }}
        >
            <Box sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                bgcolor: '#0088cc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,136,204,0.5)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.1)' }
            }}>
                <SupportAgentIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography sx={{
                color: '#fff',
                fontSize: '0.55rem',
                fontWeight: 700,
                bgcolor: 'rgba(0,0,0,0.65)',
                px: 0.7,
                py: 0.15,
                borderRadius: 1,
                whiteSpace: 'nowrap'
            }}>
                Customer Service
            </Typography>
        </Box>
    );
};

export default CustomerService;
