import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/material';
import sukunaLaugh from 'assets/sukunaLaugh.svg';

const popupAnim = keyframes`
  0% { transform: scale(0.6) translate(-50%, -50%); opacity: 0; }
  70% { transform: scale(1.1) translate(-50%, -50%); opacity: 1; }
  100% { transform: scale(1) translate(-50%, -50%); opacity: 1; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
`;

const LostPopup = ({ hidden }: { hidden: boolean }) => {
    return (
        <Box
            sx={{
                display: hidden ? 'none' : 'block',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                border: '4px solid #ef4444',
                borderRadius: 3,
                animation: `${popupAnim} 0.5s ease-out`,
                transformOrigin: 'top left'
            }}
        >
            <Box
                sx={{
                    bgcolor: '#10242f',
                    color: '#ef4444',
                    width: 'fit-content',
                    borderRadius: 3,
                    py: 4,
                    px: 7,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                {/* Title */}
                <Typography
                    sx={{
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        color: '#ef4444',
                        animation: `${shake} 0.5s ease infinite`
                    }}
                >
                    😢 OH NO! 😢
                </Typography>

                {/* Image */}
                <Box sx={{ mt: 2, mb: 1 }}>
                    <Box component="img" src={sukunaLaugh} sx={{ width: 80, height: 80 }} />
                </Box>

                {/* Divider */}
                <Box sx={{ width: 40, height: 2, borderRadius: 1, bgcolor: '#2a3e49', my: 1 }} />

                {/* Message */}
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                    You Lost! 💸
                </Typography>

                {/* Sub message */}
                <Typography
                    sx={{
                        fontSize: '0.95rem',
                        color: '#99a4b0',
                        mt: 1,
                        fontStyle: 'italic'
                    }}
                >
                    Better luck next time! 🍀
                </Typography>
            </Box>
        </Box>
    );
};

export default LostPopup;
