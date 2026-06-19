import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Stack,
    Typography,
    Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslate } from 'locales';
import { useSettingsContext } from 'components/settings';
import { useRouter } from 'routes/hook';

const OFFLINE_GAMES = [
    { name: 'Poker', icon: '🃏', color: '#1a3a5c', path: '/casino/offline-games/poker' },
    { name: 'Racing', icon: '🏇', color: '#3a1a1a', path: '/casino/offline-games/racing' },
    { name: 'Lottery', icon: '🎰', color: '#1a3a1a', path: '/casino/offline-games/lottery' },
    { name: 'UpDown', icon: '⬆⬇', color: '#2a1a3a', path: '/casino/offline-games/updown' },
    { name: 'Bingo', icon: '🎱', color: '#3a2a1a', path: '/casino/offline-games/bingo' },
    { name: 'Mines', icon: '💎', color: '#1a2a3a', path: '/casino/offline-games/mines' },
    { name: 'Dice', icon: '🎲', color: '#2a3a1a', path: '/casino/offline-games/dice' },
    { name: 'HiLo', icon: '🃏', color: '#3a1a2a', path: '/casino/offline-games/hilo' },
    { name: 'CoinFlip', icon: '🪙', color: '#1a3a2a', path: '/casino/offline-games/coinflip' },
];

export default function SearchDialog() {
    const { t } = useTranslate();
    const { modal, onToggleModal } = useSettingsContext();
    const router = useRouter();

    const handleClose = () => onToggleModal('');

    const handleGameClick = (path: string) => {
        handleClose();
        router.push(path);
    };

    return (
        <Dialog
            fullScreen
            open={modal === 'EXPLORE'}
            onClose={handleClose}
        >
            <DialogContent sx={{ width: '100%', p: 3, maxWidth: 'lg', alignSelf: 'center', pt: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">{t('explore')}</Typography>
                    <Button sx={{ minWidth: 'auto', p: 0.5, bgcolor: 'background.layer5' }} onClick={handleClose}>
                        <CloseIcon />
                    </Button>
                </Stack>

                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                    🎮 Our Games
                </Typography>

                <Grid container spacing={2}>
                    {OFFLINE_GAMES.map((game) => (
                        <Grid key={game.name} size={{ xs: 4, sm: 3, md: 2 }}>
                            <Box
                                onClick={() => handleGameClick(game.path)}
                                sx={{
                                    bgcolor: game.color,
                                    borderRadius: 3,
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                    cursor: 'pointer',
                                    aspectRatio: '1 / 1',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                    }
                                }}
                            >
                                <Typography sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}>{game.icon}</Typography>
                                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, textAlign: 'center', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                    {game.name}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
        </Dialog>
    );
}
