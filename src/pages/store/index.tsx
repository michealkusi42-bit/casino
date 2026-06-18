import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Stack, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';

export interface IPackage {
    _id: string;
    goldCoins: number;
    freeCoins?: number;
    price: number | string;
    image?: string;
}

interface StorePaymentProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPackage?: IPackage;
}

export default function StorePayment({ isOpen, onClose, selectedPackage }: StorePaymentProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    if (!selectedPackage) {
        return null;
    }

    const price = Number(selectedPackage.price);
    const displayPrice = Number.isFinite(price) ? price.toFixed(2) : (selectedPackage.price ?? '');

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            enqueueSnackbar('Purchase confirmed! Coins will be added shortly.', { variant: 'success' });
            onClose();
        } catch (error: any) {
            enqueueSnackbar(error?.response?.data?.message || 'Purchase failed, please try again', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogContent>
                <Stack spacing={2} alignItems="center" sx={{ py: 1 }}>
                    <Box
                        component="img"
                        src={selectedPackage.image || '/assets/images/store/package_default.png'}
                        alt={`${selectedPackage.goldCoins} Gold Coins`}
                        sx={{ width: 100, height: 100, objectFit: 'contain' }}
                    />
                    <Typography variant="h6" fontWeight="bold">
                        {selectedPackage.goldCoins} Gold Coins
                    </Typography>
                    {selectedPackage.freeCoins ? (
                        <Typography color="text.secondary">+ {selectedPackage.freeCoins} Free Coins</Typography>
                    ) : null}
                    <Typography variant="h5" fontWeight="bold">
                        ${displayPrice}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                        Payment processing isn't connected yet — this confirms the order in the UI only.
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleConfirm} disabled={loading}>
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirm Purchase'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
