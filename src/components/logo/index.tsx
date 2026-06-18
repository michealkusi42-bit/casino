import { Box, Stack, Typography } from '@mui/material';
import { useRouter } from 'routes/hook';

const Logo = ({ height = 40 }: { height?: number }) => {
    const router = useRouter();

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            onClick={() => router.push('/')}
            sx={{ cursor: 'pointer', flexShrink: 0, userSelect: 'none' }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: height * 0.85,
                    height: height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography
                    sx={{
                        fontSize: height * 0.95,
                        fontWeight: 900,
                        lineHeight: 1,
                        color: '#00e701',
                        fontFamily: 'inherit'
                    }}
                >
                    $
                </Typography>
                <Box
                    sx={{
                        position: 'absolute',
                        top: -height * 0.18,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: `${height * 0.1}px solid transparent`,
                        borderRight: `${height * 0.1}px solid transparent`,
                        borderBottom: `${height * 0.14}px solid #00e701`
                    }}
                />
            </Box>

            <Typography
                sx={{
                    fontSize: { xs: height * 0.75, sm: height * 0.65 },
                    fontWeight: 900,
                    letterSpacing: { xs: 2, sm: 1 },
                    color: '#fff',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    textShadow: '0 0 20px rgba(255,255,255,0.3)'
                }}
            >
                FORETELL
            </Typography>
        </Stack>
    );
};

export default Logo;
