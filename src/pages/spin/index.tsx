import { Box, Stack, Typography } from '@mui/material';
import LuckyWheel from 'pages/vip/lucky-wheel';

const SpinPage = () => {
    return (
        <Stack direction="column" gap={3} sx={{ p: { xs: 1, sm: 2 } }}>
            <Box>
                <Typography variant="h5" fontWeight={900} sx={{
                    color: '#FFD700',
                    letterSpacing: 2,
                    textShadow: '0 0 20px rgba(255,215,0,0.5)',
                    textTransform: 'uppercase',
                    mb: 0.5
                }}>
                    🎡 Lucky Spin
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Invite friends to earn free spins!
                </Typography>
            </Box>

            <LuckyWheel />
        </Stack>
    );
};

export default SpinPage;
