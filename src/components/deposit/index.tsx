import { useSnackbar } from 'notistack';
import { useTranslate } from 'locales';
import React, { useState } from 'react';
import {
    Tab, Box, Tabs, Stack, Button, Typography, TextField, Dialog,
    DialogTitle, IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

const MOMO_ACCOUNTS = [
    { network: 'Telecel', number: '0508631503', name: 'Christopher Tay' },
    { network: 'AirtelTigo', number: '0560190029', name: 'Fatima Iddrisu' },
    { network: 'Telecel', number: '0507210550', name: 'Christian Atoklo' },
    { network: 'Telecel', number: '0507558973', name: 'Simon Ayre Hammond' },
];

const CRYPTO_ACCOUNTS = [
    { coin: 'BTC', network: 'Bitcoin', address: '134UEYef2Qb2LMqUEMjWem5bmdKPsKvhPp', icon: '₿' },
    { coin: 'ETH', network: 'Ethereum (ERC20)', address: '0x964cc5c5a851299e34f009bd432aa4c58bf7b74d', icon: 'Ξ' },
    { coin: 'USDT', network: 'Tron (TRC20)', address: 'TLqkvwEbTFhn8TVvPZffJVTDi2a3QW37yn', icon: '₮' },
];

const DepositPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslate();
    const [tab, setTab] = useState(0);
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');
    const [withdrawTab, setWithdrawTab] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [mainTab, setMainTab] = useState(0);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied to clipboard!', { variant: 'success' });
    };

    const handleDepositSubmit = () => {
        if (!amount) {
            enqueueSnackbar('Please enter amount', { variant: 'error' });
            return;
        }
        enqueueSnackbar('Deposit request submitted! Send payment and upload proof.', { variant: 'success' });
        setAmount('');
        setReference('');
    };

    const handleWithdrawSubmit = () => {
        if (!withdrawAmount || !withdrawAddress) {
            enqueueSnackbar('Please fill all fields', { variant: 'error' });
            return;
        }
        enqueueSnackbar('Withdrawal request submitted! We will process within 24 hours.', { variant: 'success' });
        setWithdrawAmount('');
        setWithdrawAddress('');
    };

    return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" fontWeight={700} mb={3}>Wallet</Typography>

            <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={{ mb: 3 }}>
                <Tab label="Deposit" />
                <Tab label="Withdraw" />
            </Tabs>

            {mainTab === 0 && (
                <Box>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                        <Tab label="🇬🇭 MoMo (GHS)" />
                        <Tab label="₿ Crypto" />
                    </Tabs>

                    {tab === 0 && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                Send money to any of the accounts below, then enter the amount and reference.
                            </Typography>
                            {MOMO_ACCOUNTS.map((acc, i) => (
                                <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography fontWeight={700}>{acc.network}</Typography>
                                            <Typography variant="h6" fontWeight={800}>{acc.number}</Typography>
                                            <Typography variant="body2" color="text.secondary">{acc.name}</Typography>
                                        </Box>
                                        <IconButton onClick={() => handleCopy(acc.number)}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            ))}
                            <TextField
                                label="Amount (GHS)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                type="number"
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Transaction Reference/ID"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <Button variant="contained" onClick={handleDepositSubmit} fullWidth sx={{ py: 1.5 }}>
                                Submit Deposit
                            </Button>
                        </Stack>
                    )}

                    {tab === 1 && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                Send crypto to the address below. After sending, submit your transaction hash.
                            </Typography>
                            {CRYPTO_ACCOUNTS.map((acc, i) => (
                                <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography fontWeight={700}>{acc.icon} {acc.coin} — {acc.network}</Typography>
                                        <IconButton onClick={() => handleCopy(acc.address)}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Stack>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-all', bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                                        {acc.address}
                                    </Typography>
                                </Box>
                            ))}
                            <TextField
                                label="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                type="number"
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Transaction Hash/ID"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <Button variant="contained" onClick={handleDepositSubmit} fullWidth sx={{ py: 1.5 }}>
                                Submit Deposit
                            </Button>
                        </Stack>
                    )}
                </Box>
            )}

            {mainTab === 1 && (
                <Box>
                    <Tabs value={withdrawTab} onChange={(_, v) => setWithdrawTab(v)} sx={{ mb: 2 }}>
                        <Tab label="🇬🇭 MoMo (GHS)" />
                        <Tab label="₿ Crypto" />
                    </Tabs>

                    {withdrawTab === 0 && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                Enter your MoMo number and amount. We will send within 24 hours.
                            </Typography>
                            <TextField
                                label="Your MoMo Number"
                                value={withdrawAddress}
                                onChange={(e) => setWithdrawAddress(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Amount (GHS)"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                type="number"
                                fullWidth
                                size="small"
                            />
                            <Button variant="contained" onClick={handleWithdrawSubmit} fullWidth sx={{ py: 1.5 }}>
                                Submit Withdrawal
                            </Button>
                        </Stack>
                    )}

                    {withdrawTab === 1 && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                Enter your crypto wallet address and amount. We will send within 24 hours.
                            </Typography>
                            <TextField
                                label="Your Wallet Address"
                                value={withdrawAddress}
                                onChange={(e) => setWithdrawAddress(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Amount"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                type="number"
                                fullWidth
                                size="small"
                            />
                            <Button variant="contained" onClick={handleWithdrawSubmit} fullWidth sx={{ py: 1.5 }}>
                                Submit Withdrawal
                            </Button>
                        </Stack>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default DepositPage;
