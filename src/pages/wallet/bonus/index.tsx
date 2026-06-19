import { useTranslate } from 'locales';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import {
    Box, Button, Chip, LinearProgress, Stack, Typography, Avatar
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { fDateTime } from 'utils/format-time';
import { bonusApi } from 'api/bonus.api';
import { IPlayerBonus } from 'types/bonus';
import EmptyTable from 'components/empty-table';
import TablePaginationCustom from 'components/table/table-pagination-custom';
import BonusSearchTool from './search-tool';

const StatusConfig: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
    pending: {
        color: '#FFC107', bg: 'rgba(255,193,7,0.12)', border: 'rgba(255,193,7,0.3)',
        icon: <HourglassEmptyIcon sx={{ fontSize: 14 }} />, label: 'Pending'
    },
    active: {
        color: '#00BAE6', bg: 'rgba(0,186,230,0.12)', border: 'rgba(0,186,230,0.3)',
        icon: <AccessTimeIcon sx={{ fontSize: 14 }} />, label: 'Active'
    },
    claimed: {
        color: '#00e701', bg: 'rgba(0,231,1,0.12)', border: 'rgba(0,231,1,0.3)',
        icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Claimed'
    },
    expired: {
        color: '#f44336', bg: 'rgba(244,67,54,0.12)', border: 'rgba(244,67,54,0.3)',
        icon: <CancelIcon sx={{ fontSize: 14 }} />, label: 'Expired'
    },
    delete: {
        color: '#f44336', bg: 'rgba(244,67,54,0.12)', border: 'rgba(244,67,54,0.3)',
        icon: <CancelIcon sx={{ fontSize: 14 }} />, label: 'Deleted'
    },
};

const BonusCard = ({ item, onClaim }: { item: IPlayerBonus; onClaim: (id: string) => void }) => {
    const cfg = StatusConfig[item.status] || StatusConfig.pending;
    const progress = item.goalAmount > 0
        ? Math.min((item.processAmount / item.goalAmount) * 100, 100)
        : 0;

    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: cfg.border,
                bgcolor: cfg.bg,
                transition: 'transform 0.15s',
                '&:hover': { transform: 'translateY(-1px)' }
            }}
        >
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
                {/* Icon + Info */}
                <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
                    <Avatar
                        sx={{
                            width: 44, height: 44, flexShrink: 0,
                            bgcolor: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                            fontSize: '1.3rem'
                        }}
                    >
                        🎁
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={0.3} flexWrap="wrap">
                            <Typography fontWeight={800} sx={{ fontSize: '0.95rem', color: 'text.primary' }}>
                                {item.bonus.name}
                            </Typography>
                            <Chip
                                icon={cfg.icon}
                                label={cfg.label}
                                size="small"
                                sx={{
                                    height: 20, fontSize: '0.62rem', fontWeight: 700,
                                    bgcolor: cfg.bg, color: cfg.color,
                                    border: `1px solid ${cfg.border}`
                                }}
                            />
                        </Stack>

                        <Stack direction="row" spacing={2} mb={1} flexWrap="wrap">
                            <Box>
                                <Typography variant="caption" color="text.secondary">Amount</Typography>
                                <Typography fontWeight={800} sx={{ color: cfg.color, fontSize: '0.9rem' }}>
                                    GH₵ {item.amount.toFixed(2)}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Type</Typography>
                                <Typography fontWeight={700} sx={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                    {item.bonus.option}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Expires</Typography>
                                <Typography fontWeight={600} sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                    {fDateTime(item.bonus.expireDate)}
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Progress bar for wagering */}
                        {item.goalAmount > 0 && (
                            <Box>
                                <Stack direction="row" justifyContent="space-between" mb={0.4}>
                                    <Typography variant="caption" color="text.secondary">
                                        Wagering Progress
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: cfg.color, fontWeight: 700 }}>
                                        {item.processAmount.toFixed(2)} / {item.goalAmount}
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                        height: 6, borderRadius: 3,
                                        bgcolor: 'rgba(255,255,255,0.08)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            bgcolor: cfg.color
                                        }
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block' }}>
                                    {progress.toFixed(1)}% completed
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Stack>

                {/* Claim Button */}
                {item.status === 'active' && (
                    <Button
                        size="small"
                        onClick={() => onClaim(item._id)}
                        sx={{
                            flexShrink: 0,
                            backgroundImage: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
                            color: '#000',
                            fontWeight: 800,
                            borderRadius: 2,
                            px: 2,
                            fontSize: '0.78rem',
                            whiteSpace: 'nowrap',
                            '&:hover': {
                                backgroundImage: 'linear-gradient(90deg, #006C9C 0%, #00BAE6 100%)'
                            }
                        }}
                    >
                        Claim
                    </Button>
                )}
            </Stack>
        </Box>
    );
};

const BonusPage = () => {
    const { t } = useTranslate();
    const { enqueueSnackbar } = useSnackbar();
    const [totalRows, setTotalRows] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [status, setStatus] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<IPlayerBonus[]>([]);

    const getBonusList = async () => {
        try {
            setLoading(true);
            const response = await bonusApi.getBonusList({ status, rowsPerPage, currentPage: currentPage + 1 });
            setTotalRows(response.total);
            setData(response.data);
        } catch (error) {
            console.log('Error getting bonus list');
        } finally {
            setLoading(false);
        }
    };

    const claimBonus = async (bonusId: string) => {
        try {
            setLoading(true);
            const updatedData = await bonusApi.claimBonus(bonusId);
            if (updatedData) {
                setData((prev) =>
                    prev.map((item) => item._id === bonusId ? { ...item, status: updatedData.status } : item)
                );
            }
            enqueueSnackbar('Successfully claimed!', { variant: 'success' });
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getBonusList(); }, [status]);

    // Summary counts
    const activeCount = data.filter(d => d.status === 'active').length;
    const claimedCount = data.filter(d => d.status === 'claimed').length;

    return (
        <Stack spacing={2.5} sx={{ py: { xs: 1, sm: 2 } }}>

            {/* Summary */}
            <Stack direction="row" spacing={1.5}>
                <Box sx={{
                    flex: 1, p: 1.5, borderRadius: 2, textAlign: 'center',
                    bgcolor: 'rgba(0,186,230,0.07)', border: '1px solid rgba(0,186,230,0.2)'
                }}>
                    <CardGiftcardIcon sx={{ color: '#00BAE6', fontSize: 22 }} />
                    <Typography variant="caption" display="block" color="text.secondary">Active</Typography>
                    <Typography fontWeight={800} sx={{ color: '#00BAE6' }}>{activeCount}</Typography>
                </Box>
                <Box sx={{
                    flex: 1, p: 1.5, borderRadius: 2, textAlign: 'center',
                    bgcolor: 'rgba(0,231,1,0.07)', border: '1px solid rgba(0,231,1,0.2)'
                }}>
                    <CheckCircleIcon sx={{ color: '#00e701', fontSize: 22 }} />
                    <Typography variant="caption" display="block" color="text.secondary">Claimed</Typography>
                    <Typography fontWeight={800} sx={{ color: '#00e701' }}>{claimedCount}</Typography>
                </Box>
                <Box sx={{
                    flex: 1, p: 1.5, borderRadius: 2, textAlign: 'center',
                    bgcolor: 'rgba(255,193,7,0.07)', border: '1px solid rgba(255,193,7,0.2)'
                }}>
                    <CardGiftcardIcon sx={{ color: '#FFC107', fontSize: 22 }} />
                    <Typography variant="caption" display="block" color="text.secondary">Total</Typography>
                    <Typography fontWeight={800} sx={{ color: '#FFC107' }}>{data.length}</Typography>
                </Box>
            </Stack>

            {/* Filter */}
            <BonusSearchTool status={status} onChangeStatus={setStatus} />

            {/* Bonus Cards */}
            {loading ? (
                <Stack spacing={1}>
                    {[1, 2, 3].map(i => (
                        <Box key={i} sx={{ height: 120, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                </Stack>
            ) : data.length === 0 ? (
                <EmptyTable noData colSpan={8} />
            ) : (
                <Stack spacing={1.5}>
                    {data.map((item, index) => (
                        <BonusCard key={index} item={item} onClaim={claimBonus} />
                    ))}
                </Stack>
            )}

            <TablePaginationCustom
                count={totalRows}
                page={currentPage}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, newPage) => setCurrentPage(newPage)}
                onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))}
            />
        </Stack>
    );
};

export default BonusPage;
