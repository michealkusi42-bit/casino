import { Box, Typography } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const TELEGRAM_HANDLE = 'ALICEFTL07';

const CustomerService = () => {
    return (
        <Box
            component="a"
            href={`https://t.me/${TELEGRAM_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
                position: 'fixed',
                bottom: { xs: 80, md: 32 },
                right: { xs: 16, md: 32 },
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                cursor: 'pointer',
            }}
        >
            <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#0088cc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,136,204,0.5)',
                transition: 'all 0.2s',
                '&:hover': {
                    transform: 'scale(1.1)',
                    bgcolor: '#0077b5'
                }
            }}>
                <SupportAgentIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography sx={{
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: 'rgba(0,0,0,0.6)',
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
                whiteSpace: 'nowrap'
            }}>
                Customer Service
            </Typography>
        </Box>
    );
};

export default CustomerService;
