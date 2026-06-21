import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Avatar, Box, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from 'hooks/use-auth-context';
import { ASSETS } from 'utils/axios';
import ColorButton from 'components/ColorButton';
import FormProvider, { RHFTextField } from 'components/hook-form';
import { updateUsername } from 'api';
import { useSnackbar } from 'components/snackbar';
import axios from 'axios';
import { API } from 'utils/axios';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 192,
    height: 192,
    margin: '0 auto',
    position: 'relative',
    padding: theme.spacing(2.5),
    backgroundColor: theme.palette.background.paper
}));

const networks = [
    {
        id: 'MTN',
        label: 'MTN',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg',
        color: '#FFCC00',
        border: '#FFCC00'
    },
    {
        id: 'VOD',
        label: 'Telecel',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Telecel_Ghana_Logo.png/320px-Telecel_Ghana_Logo.png',
        color: '#E30613',
        border: '#E30613'
    },
    {
        id: 'ATL',
        label: 'AirtelTigo',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/AirtelTigo_logo.svg/320px-AirtelTigo_logo.svg.png',
        color: '#0066CC',
        border: '#0066CC'
    }
];

const EditProfile = ({ setOpen }: { setOpen: (open: string | null) => void }) => {
    const { enqueueSnackbar } = useSnackbar();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const [momoLoading, setMomoLoading] = useState<boolean>(false);
    const [selectedNetwork, setSelectedNetwork] = useState<string>(user?.momoNetwork || '');
    const [momoNumber, setMomoNumber] = useState<string>(user?.momoNumber || '');

    const methods = useForm({
        defaultValues: {
            username: user?.username || ''
        }
    });

    const onSubmit = async ({ username }: { username: string }) => {
        setLoading(true);
        try {
            await updateUsername(username);
            await updateUser({ username });
            enqueueSnackbar('Successfully updated username!', { variant: 'success' });
            setOpen(null);
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const saveMomo = async () => {
        if (!selectedNetwork) {
            enqueueSnackbar('Please select a network', { variant: 'error' });
            return;
        }
        if (!momoNumber || momoNumber.length < 10) {
            enqueueSnackbar('Please enter a valid MoMo number', { variant: 'error' });
            return;
        }
        setMomoLoading(true);
        try {
            await axios.patch(`${API}/player/momo`, {
                momoNetwork: selectedNetwork,
                momoNumber: momoNumber
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            await updateUser({ momoNetwork: selectedNetwork, momoNumber });
            enqueueSnackbar('MoMo number saved successfully!', { variant: 'success' });
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Failed to save MoMo number', { variant: 'error' });
        } finally {
            setMomoLoading(false);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <FormProvider methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
                <Box sx={{ position: 'relative' }}>
                    <StyledAvatar>
                        <Avatar src={ASSETS(user?.avatar)} alt="avatar" sx={{ width: '100%', height: '100%' }} />
                    </StyledAvatar>
                    <Box sx={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>
                        <ColorButton
                            role={undefined}
                            sx={{ minWidth: 158, height: 32, px: 1, textWrap: 'nowrap' }}
                            tabIndex={-1}
                            component="label"
                            onClick={() => setOpen('edit-avatar')}
                        >
                            Edit Your Avatar
                        </ColorButton>
                    </Box>
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Username
                </Typography>
                <RHFTextField name="username" required sx={{ mt: 1 }} />
                <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                    Do not use special symbols, otherwise your account may not be supported.
                </Typography>
                <ColorButton loading={loading} type="submit" sx={{ width: '100%', mt: 2 }}>
                    Save
                </ColorButton>
            </FormProvider>

            {/* MoMo Section */}
            <Box sx={{ mt: 4, p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff', mb: 1 }}>
                    💳 Bind MoMo for Withdrawals
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Save your MoMo number once for faster withdrawals
                </Typography>

                {/* Network Selection */}
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
                    Select Network
                </Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                    {networks.map((net) => (
                        <Grid item xs={4} key={net.id}>
                            <Box
                                onClick={() => setSelectedNetwork(net.id)}
                                sx={{
                                    cursor: 'pointer',
                                    border: `2px solid ${selectedNetwork === net.id ? net.border : 'rgba(255,255,255,0.1)'}`,
                                    borderRadius: 2,
                                    p: 1,
                                    textAlign: 'center',
                                    background: selectedNetwork === net.id ? `${net.color}22` : 'transparent',
                                    transition: 'all 0.2s',
                                    '&:hover': { border: `2px solid ${net.border}` }
                                }}
                            >
                                <img
                                    src={net.logo}
                                    alt={net.label}
                                    style={{ width: '100%', height: 40, objectFit: 'contain', borderRadius: 4 }}
                                    onError={(e: any) => { e.target.style.display = 'none'; }}
                                />
                                <Typography variant="caption" sx={{ color: net.color, fontWeight: 'bold', display: 'block', mt: 0.5 }}>
                                    {net.label}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* MoMo Number Input */}
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    MoMo Number
                </Typography>
                <Box
                    component="input"
                    value={momoNumber}
                    onChange={(e: any) => setMomoNumber(e.target.value)}
                    placeholder="e.g. 0244000000"
                    type="tel"
                    sx={{
                        width: '100%',
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        fontSize: 16,
                        outline: 'none',
                        boxSizing: 'border-box',
                        '&:focus': { border: '1px solid #FFD700' }
                    }}
                />

                <ColorButton
                    onClick={saveMomo}
                    loading={momoLoading}
                    sx={{ width: '100%', mt: 2, background: 'linear-gradient(135deg, #FFD700, #FF8C00)' }}
                >
                    Save MoMo Number
                </ColorButton>

                {user?.momoNumber && (
                    <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, background: 'rgba(0,200,0,0.1)', border: '1px solid rgba(0,200,0,0.3)' }}>
                        <Typography variant="caption" sx={{ color: '#00C853' }}>
                            ✅ Saved: {networks.find(n => n.id === user.momoNetwork)?.label} - {user.momoNumber}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default EditProfile;
