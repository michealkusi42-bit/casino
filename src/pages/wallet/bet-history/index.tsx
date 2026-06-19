import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import {
    Box,
    Chip,
    MenuItem,
    Select,
    Stack,
    Typography,
    Avatar
} from '@mui/material';
import { _dateRangeOptions } from '_mock';
import { useEffect, useState } from 'react';
import CustomDateRangePicker, { useDateRangePicker } from '../../../components/custom-date-range-picker';
import EmptyData from '../../../components/empty-data';
import TablePaginationCustom from 'components/table/table-pagination-custom';
import { getTransactions } from 'api';
import moment from 'moment';
import { useAuth } from 'hooks/use-auth-context';
import { Itransaction } from 'types/transaction';
import { fDateTime } from 'utils/format-time';
import { LoadingScreen } from 'components/loading-screen';
import { t } from 'i18next';

const gameIconMap: Record<string, string> = {
    dice: '🎲',
    coinflip: '🪙',
    mines: '💎',
    hilo: '🃏',
    roulette: '🎡',
    poker: '♠️',
    crash: '🚀',
    luckyspin: '🎰',
};

const BetCard = ({ item }: { item: any }) => {
    const isWin = (item?.amount ?? 0) > 0;
    const gameType = item?.gameName?.toLowerCase() || '';
    const icon = gameIconMap[gameType] || '🎮';

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: isWin ? 'rgba(0,231,1,0.2)' : 'rgba(255,68,68,0.15)',
                bgcolor: isWin ? 'rgba(0,231,1,0.04)' : 'rgba(255,68,68,0.04)',
                transition: 'transform 0.15s',
                '&:hover': { transform: 'translateY(-1px)' }
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                {/* Left: icon + game info */}
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                        sx={{
                            width: 42,
                            height: 42,
                            bgcolor: isWin ? 'rgba(0,231,1,0.12)' : 'rgba(255,68,68,0.1)',
                            fontSize: '1.3rem',
                            border: '1px solid',
                            borderColor: isWin ? 'rgba(0,231,1,0.25)' : 'rgba(255,68,68,0.2)'
                        }}
                    >
                        {icon}
                    </Avatar>
                    <Box>
                        <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ textTransform: 'capitalize', color: 'text.primary' }}
                        >
                            {item?.gameName || item?.typeDescription || 'Game'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {item?.createdAt ? fDateTime(item.createdAt) : '-'}
                        </Typography>
                    </Box>
                </Stack>

                {/* Right: amount + balance */}
                <Stack alignItems="flex-end" spacing={0.3}>
                    <Stack direction="row" alignItems="center" spacing={0.4}>
                        {isWin
                            ? <TrendingUpIcon sx={{ fontSize: 16, color: '#00e701' }} />
                            : <TrendingDownIcon sx={{ fontSize: 16, color: '#ff4444' }} />
                        }
                        <Typography
                            fontWeight={800}
                            sx={{
                                color: isWin ? '#00e701' : '#ff4444',
                                fontSize: '0.95rem'
                            }}
                        >
                            {isWin ? '+' : ''}{item?.amount ?? 0}
                        </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        Bal: {item?.afterAmount ?? 0}
                    </Typography>
                    <Chip
                        label={isWin ? 'WIN' : 'LOSS'}
                        size="small"
                        sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            bgcolor: isWin ? 'rgba(0,231,1,0.15)' : 'rgba(255,68,68,0.15)',
                            color: isWin ? '#00e701' : '#ff4444',
                            border: '1px solid',
                            borderColor: isWin ? 'rgba(0,231,1,0.3)' : 'rgba(255,68,68,0.3)'
                        }}
                    />
                </Stack>
            </Stack>
        </Box>
    );
};

const BetHistoryPage = () => {
    const rangeCalendarPicker = useDateRangePicker(new Date(), new Date());
    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [type, setType] = useState<string>('all');
    const [date, setDate] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });
    const [selectedDuration, setSelectedDuration] = useState<string>('60');
    const [data, setData] = useState<Itransaction[]>([]);

    const typeOptions = [
        { name: 'all', label: 'all' },
        { name: 'win', label: 'win' },
        { name: 'bet', label: 'bet' }
    ];

    const getPastDate = (days: number) => ({
        start: moment().add(-days, 'days').startOf('day').toDate(),
        end: moment().endOf('day').toDate()
    });

    const changeDuration = (value: string) => {
        if (value === 'custom' && rangeCalendarPicker.onOpen) {
            rangeCalendarPicker.onOpen();
        } else {
            setDate(getPastDate(Number(value)));
        }
        setSelectedDuration(value);
    };

    useEffect(() => { changeDuration(selectedDuration); }, [selectedDuration]);

    useEffect(() => {
        if (rangeCalendarPicker.startDate && rangeCalendarPicker.endDate) {
            setDate({ start: rangeCalendarPicker.startDate, end: rangeCalendarPicker.endDate });
        }
    }, [rangeCalendarPicker.startDate, rangeCalendarPicker.endDate]);

    const getTransactionHistories = async () => {
        try {
            setLoading(true);
            const response = await getTransactions({ type, currentPage: currentPage + 1, rowsPerPage, date });
            const rows = Array.isArray(response?.data) ? response.data : [];
            const total = Number.isFinite(response?.total) ? response.total : rows.length;
            setTotalRows(total);
            setData(rows);
        } catch (error) {
            setData([]);
            setTotalRows(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getTransactionHistories(); }, [type, date, rowsPerPage, currentPage]);

    // Stats summary
    const wins = data.filter(d => (d?.amount ?? 0) > 0);
    const losses = data.filter(d => (d?.amount ?? 0) <= 0);
    const totalWon = wins.reduce((s, d) => s + (d?.amount ?? 0), 0);
    const totalLost = losses.reduce((s, d) => s + Math.abs(d?.amount ?? 0), 0);

    return (
        <Stack direction="column" gap={2} sx={{ py: { xs: 1, sm: 2 } }}>

            {/* Summary Stats */}
            <Stack direction="row" spacing={1.5}>
                <Box sx={{
                    flex: 1, p: 1.5, borderRadius: 2,
                    bgcolor: 'rgba(0,231,1,0.07)',
                    border: '1px solid rgba(0,231,1,0.2)',
                    textAlign: 'center'
                }}>
                    <EmojiEventsIcon sx={{ color: '#00e701', fontSize: 20 }} />
                    <Typography variant="caption" display="block" color="text.secondary">Wins</Typography>
                    <Typography fontWeight={800} sx={{ color: '#00e701', fontSize: '0.9rem' }}>
                        {wins.length} (+{totalWon.toFixed(2)})
                    </Typography>
                </Box>
                <Box sx={{
                    flex: 1, p: 1.5, borderRadius: 2,
                    bgcolor: 'rgba(255,68,68,0.07)',
                    border: '1px solid rgba(255,68,68,0.2)',
                    textAlign: 'center'
                }}>
                    <TrendingDownIcon sx={{ color: '#ff4444', fontSize: 20 }} />
                    <Typography variant="caption" display="block" color="text.secondary">Losses</Typography>
                    <Typography fontWeight={800} sx={{ color: '#ff4444', fontSize: '0.9rem' }}>
                        {losses.length} (-{totalLost.toFixed(2)})
                    </Typography>
                </Box>
                <Box sx={{
                    flex: 1, p: 1.5, borderRadius: 2,
                    bgcolor: 'rgba(0,186,230,0.07)',
                    border: '1px solid rgba(0,186,230,0.2)',
                    textAlign: 'center'
                }}>
                    <SportsEsportsIcon sx={{ color: '#00BAE6', fontSize: 20 }} />
                    <Typography variant="caption" display="block" color="text.secondary">Total</Typography>
                    <Typography fontWeight={800} sx={{ color: '#00BAE6', fontSize: '0.9rem' }}>
                        {data.length} bets
                    </Typography>
                </Box>
            </Stack>

            {/* Filters */}
            <Stack gap={1} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                <Select size="small" fullWidth value={type} onChange={(e) => setType(e.target.value)}>
                    {typeOptions.map((item, index) => (
                        <MenuItem key={index} value={item.name}>{t(`${item.label}`)}</MenuItem>
                    ))}
                </Select>
                <Select size="small" fullWidth value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)}>
                    {_dateRangeOptions.map((item, index) => (
                        <MenuItem key={index} value={item.name}>{t(`${item.label}`)}</MenuItem>
                    ))}
                </Select>
            </Stack>

            {/* Bet Cards */}
            {loading ? (
                <Stack width="100%" minHeight={300}><LoadingScreen /></Stack>
            ) : data.length === 0 ? (
                <EmptyData />
            ) : (
                <Stack spacing={1}>
                    {data.map((item, index) => (
                        <BetCard key={index} item={item} />
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

            <CustomDateRangePicker
                variant="calendar"
                open={rangeCalendarPicker.open}
                startDate={rangeCalendarPicker.startDate}
                endDate={rangeCalendarPicker.endDate}
                onChangeStartDate={rangeCalendarPicker.onChangeStartDate}
                onChangeEndDate={rangeCalendarPicker.onChangeEndDate}
                onClose={rangeCalendarPicker.onClose}
                error={rangeCalendarPicker.error}
            />
        </Stack>
    );
};

export default BetHistoryPage;
