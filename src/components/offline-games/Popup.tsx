import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/material';
import ruppee from 'assets/ruppee.svg';

const popupAnim = keyframes`
  0% { transform: scale(0.6) translate(-50%, -50%); opacity: 0; }
  70% { transform: scale(1.1) translate(-50%, -50%); opacity: 1; }
  100% { transform: scale(1) translate(-50%, -50%); opacity: 1; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const Popup = ({ hidden, profitRatio, totalWin }: { hidden: boolean; profitRatio: string; totalWin: string }) => {
    return (
        <Box
            sx={{
                display: hidden ? 'none' : 'block',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                border: '4px solid #1fde23',
                borderRadius: 3,
                animation: `${popupAnim} 0.5s ease-out`,
                transformOrigin: 'top left'
            }}
        >
            <Box
                sx={{
                    bgcolor: '#10242f',
                    color: '#1fde23',
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
                {/* Hurray Text */}
                <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                        color: '#FFD700',
                        animation: `${bounce} 0.8s ease infinite`,
                        fontSize: '1.8rem'
                    }}
                >
                    🎉 YOU WON! 🎉
                </Typography>

                {/* Profit Ratio */}
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#1fde23', mt: 1 }}>
                    {profitRatio}
                    <Box component="span" sx={{ fontWeight: 'extrabold' }}>
                        ×
                    </Box>
                </Typography>

                {/* Divider */}
                <Box
                    sx={{
                        width: 40,
                        height: 2,
                        borderRadius: 1,
                        bgcolor: '#2a3e49',
                        mt: 1,
                        mb: 1
                    }}
                />

                {/* Total Win in Ghana Cedis */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        fontWeight: 'bold',
                        fontSize: '1.5rem',
                        color: '#FFD700'
                    }}
                >
                    GH₵ {totalWin}
                    <Box component="img" src={ruppee} sx={{ width: 24, height: 24 }} />
                </Box>

                {/* Congrats message */}
                <Typography
                    variant="body1"
                    sx={{
                        color: '#99a4b0',
                        mt: 1,
                        fontSize: '1rem',
                        fontStyle: 'italic'
                    }}
                >
                    Congratulations! 🏆
                </Typography>
            </Box>
        </Box>
    );
};

export default Popup;
