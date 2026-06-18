import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
// @mui
import {
    Box,
    Card,
    Grid,
    Stack,
    Table,
    Divider,
    TableRow,
    Collapse,
    TableHead,
    TableBody,
    TableCell,
    Typography,
    IconButton,
    TableContainer
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// hooks
import { useAuth } from 'hooks/use-auth-context';
import { useCopyToClipboard } from 'hooks/use-copy-to-clipboard';
import {
    XIcon,
    OkIcon,
    VKIcon,
    CupIcon,
    SkypeIcon,
    PeopleIcon,
    FacebookIcon,
    MoneyLogIcon,
    TelegramIcon,
    WhatsAppIcon,
    StarIcon
} from 'icons';
// utils
import { fBalance } from 'utils/format-balance';

const API = 'https://foretell-backend-production-58a6.up.railway.app';

const DashboardView = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { copy } = useCopyToClipboard();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const [index, setIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const [referralData, setReferralData] = useState({
        referralCode: '',
        referralLink: '',
        referralCount: 0,
        referralEarnings: 0
    });

    const authHeader = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    const loadReferralData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/referral`, { headers: authHeader });
            const data = await res.json();
            if (data.success) {
                setReferralData(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReferralData();
    }, []);

    const handleCopy = (text: string) => {
        copy(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const faqs = [
        {
            title: 'How do I earn referral rewards?',
            content: 'Share your unique referral link with friends. When they sign up and play, you earn a 5% bonus on their starting balance automatically.'
        },
        {
            title: 'When do I receive my referral bonus?',
            content: 'Your referral bonus is credited instantly to your balance as soon as your referred friend completes registration.'
        },
        {
            title: 'Is there a limit to how many people I can refer?',
            content: 'No limit! You can refer as many friends as you want and earn rewards for each one.'
        },
        {
            title: 'Can I track my referrals?',
            content: 'Yes! This dashboard shows your total referral count and total earnings from referrals.'
        }
    ];

    return (
        <>
            <Stack spacing={3}>
                <Grid container spacing={2}>
                    {/* Left - Referral Link Card */}
                    <Grid size={{ md: 8, xs: 12 }}>
                        <Card sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.card' }}>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Invite Friends & Earn
                                    </Typography>
                                </Stack>

                                <Stack direction={{ md: 'row', xs: 'column' }} spacing={2}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                                            5%
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            Referral Bonus
                                        </Typography>
                                    </Stack>
                                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                                            {referralData.referralCount}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            Friends Referred
                                        </Typography>
                                    </Stack>
                                </Stack>

                                <Typography sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 600 }}>
                                    Share your referral link and earn 5% bonus when your friends sign up and start playing!
                                </Typography>

                                {/* Referral Link */}
                                <Stack spacing={1}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                        Your Referral Link
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        sx={{ borderRadius: 1, pl: 1, bgcolor: 'background.default' }}
                                    >
                                        <Typography variant="body2" sx={{ textWrap: 'wrap', fontSize: 12 }}>
                                            {isLoading ? 'Loading...' : referralData.referralLink || 'Sign in to get your link'}
                                        </Typography>
                                        <IconButton
                                            sx={{ bgcolor: 'primary.main', borderRadius: 1 }}
                                            onClick={() => handleCopy(referralData.referralLink)}
                                        >
                                            <ContentCopyIcon sx={{ color: 'white', fontSize: 18 }} />
                                        </IconButton>
                                    </Stack>
                                </Stack>

                                {/* Referral Code */}
                                <Stack spacing={1}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                        Your Referral Code
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        sx={{ borderRadius: 1, pl: 1, bgcolor: 'background.default' }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: 2 }}>
                                            {isLoading ? 'Loading...' : referralData.referralCode || '--'}
                                        </Typography>
                                        <IconButton
                                            sx={{ bgcolor: 'primary.main', borderRadius: 1 }}
                                            onClick={() => handleCopy(referralData.referralCode)}
                                        >
                                            <ContentCopyIcon sx={{ color: 'white', fontSize: 18 }} />
                                        </IconButton>
                                    </Stack>
                                    {copied && (
                                        <Typography variant="caption" sx={{ color: 'primary.main' }}>
                                            ✅ Copied!
                                        </Typography>
                                    )}
                                </Stack>

                                {/* Share Buttons */}
                                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                    <Typography variant="body2">Share via:</Typography>
                                    <IconButton
                                        target="_blank"
                                        component={Link}
                                        to={`https://www.facebook.com/sharer.php?u=${referralData.referralLink}`}
                                        sx={{ p: 0.8, borderRadius: 0.5, border: '1px solid', borderColor: 'text.secondary' }}
                                    >
                                        <FacebookIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                                    </IconButton>
                                    <IconButton
                                        target="_blank"
                                        component={Link}
                                        to={`https://twitter.com/share?url=${referralData.referralLink}`}
                                        sx={{ p: 0.8, borderRadius: 0.5, border: '1px solid', borderColor: 'text.secondary' }}
                                    >
                                        <XIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                                    </IconButton>
                                    <IconButton
                                        target="_blank"
                                        component={Link}
                                        to={`https://t.me/share?url=${referralData.referralLink}`}
                                        sx={{ p: 0.8, borderRadius: 0.5, border: '1px solid', borderColor: 'text.secondary' }}
                                    >
                                        <TelegramIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                                    </IconButton>
                                    <IconButton
                                        target="_blank"
                                        component={Link}
                                        to={`https://api.whatsapp.com/send?text=${referralData.referralLink}`}
                                        sx={{ p: 0.8, borderRadius: 0.5, border: '1px solid', borderColor: 'text.secondary' }}
                                    >
                                        <WhatsAppIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </Card>
                    </Grid>

                    {/* Right - Stats Card */}
                    <Grid size={{ md: 4, xs: 12 }}>
                        <Card sx={{ p: 2, height: 1, display: 'flex', borderRadius: 2, backgroundColor: 'background.card' }}>
                            <Stack justifyContent="center" spacing={5} sx={{ width: 1 }}>
                                <Stack flexDirection="row" sx={{ width: 1 }}>
                                    <Stack justifyContent="center" alignItems="center" sx={{ flex: 1 }} spacing={1}>
                                        <CupIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                                Total Earnings
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'center' }}>
                                                GH₵ {fBalance(referralData.referralEarnings)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Divider orientation="vertical" sx={{ mx: 2 }} />
                                    <Stack justifyContent="center" alignItems="center" sx={{ flex: 1 }} spacing={1}>
                                        <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                                Total Friends
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'center' }}>
                                                {referralData.referralCount}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>

                {/* FAQ */}
                <Card sx={{ py: 4, px: { md: 4, xs: 2 }, borderRadius: 2, backgroundColor: 'background.card' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 4 }}>
                        Frequently Asked Questions
                    </Typography>
                    {faqs.map((item, i) => (
                        <Stack key={i} sx={{ ...(i !== 0 && { borderTop: '2px solid #d9d9d945' }) }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0.5 }}>
                                <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                                <IconButton onClick={() => setIndex(index === i ? -1 : i)}>
                                    {index === i ? <RemoveIcon /> : <AddIcon />}
                                </IconButton>
                            </Stack>
                            <Collapse in={index === i}>
                                <Typography sx={{ mb: 2, color: 'text.secondary' }}>{item.content}</Typography>
                            </Collapse>
                        </Stack>
                    ))}
                </Card>
            </Stack>
        </>
    );
};

export default DashboardView;
