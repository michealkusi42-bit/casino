import { useState } from 'react';
import { Box, Fab, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import CloseIcon from '@mui/icons-material/Close';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const TELEGRAM_HANDLE = 'ALICEFTL07';

const CustomerService = () => {
    const [open, setOpen] = useState(false);

    return (
        <Box sx={{ position: 'fixed', bottom: { xs: 80, md: 32 }, right: { xs: 16, md: 32 }, zIndex: 9999 }}>
            {/* ✅ Chat popup */}
            {open && (
                <Box sx={{
                    position: 'absolute',
                    bottom: 70,
                    right: 0,
                    width: 280,
                    bgcolor: '#1a2c38',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <Box sx={{
                        bgcolor: '#0088cc',
                        px: 2, py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <SupportAgentIcon sx={{ color: '#fff', fontSize: 22 }} />
                            <Box>
                                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                                    Customer Support
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
                                    🟢 Online
                                </Typography>
                            </Box>
                        </Stack>
                        <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Body */}
                    <Box sx={{ p: 2 }}>
                        <Box sx={{
                            bgcolor: 'rgba(255,255,255,0.05)',
                            borderRadius: 2,
                            p: 1.5,
                            mb: 2
                        }}>
                            <Typography sx={{ color: '#fff', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                👋 Hi! Need help? Our support team is ready to assist you 24/7.
                            </Typography>
                        </Box>

                        {/* Telegram Button */}
                        <Box
                            component="a"
                            href={`https://t.me/${TELEGRAM_HANDLE}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textDecoration: 'none' }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                bgcolor: '#0088cc',
                                borderRadius: 2,
                                p: 1.5,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: '#0077b5' }
                            }}>
                                <TelegramIcon sx={{ color: '#fff', fontSize: 28 }} />
                                <Box>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                                        Chat on Telegram
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem' }}>
                                        @{TELEGRAM_HANDLE}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textAlign: 'center', mt: 1.5 }}>
                            Typical response time: a few minutes
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* ✅ Floating button */}
            <Tooltip title="Customer Support" placement="left">
                <Fab
                    onClick={() => setOpen(prev => !prev)}
                    sx={{
                        bgcolor: open ? '#f44336' : '#0088cc',
                        color: '#fff',
                        '&:hover': { bgcolor: open ? '#d32f2f' : '#0077b5' },
                        boxShadow: '0 4px 20px rgba(0,136,204,0.5)',
                        transition: 'all 0.3s'
                    }}
                >
                    {open ? <CloseIcon /> : <SupportAgentIcon />}
                </Fab>
            </Tooltip>
        </Box>
    );
};

export default CustomerService;
