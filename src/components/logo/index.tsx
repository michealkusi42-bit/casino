import { Box, Stack, Typography } from '@mui/material';
import { useRouter } from 'routes/hook';

// ─── Code-based "Foretell" logo ──────────────────────────────────────────────
// Replaces the static /logo.webp image so the brand name lives in code,
// not an image file that needs re-uploading every time it changes.
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
            {/* Dollar-sign mark, styled like the original icon */}
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
                {/* small crown accent above the $ to echo the original mark */}
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
                    fontSize: height * 0.55,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    color: '#fff',
                    lineHeight: 1,
                    whiteSpace: 'nowrap'
                }}
            >
                FORETELL
            </Typography>
        </Stack>
    );
};

export default Logo;
