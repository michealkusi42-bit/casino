import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
    Box,
    Chip,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress
} from '@mui/material';
import { _dateRangeOptions } from '_mock';
import { useEffect, useState, useCallback } from 'react';
import TablePaginationCustom from 'components/table/table-pagination-custom';
import { getTransactions } from 'api';
import moment from 'moment';
import { useAuth } from 'hooks/use-auth-context';
import { Itransaction } from 'types/transaction';
import { fDateTime } from 'utils/format-time';
import { LoadingScreen } from 'components/loading-screen';
import { useTranslate } from 'locales';
import CustomDateRangePicker, { useDateRangePicker } from '../../../components/custom-date-range-picker';
import EmptyData from '../../../components/empty-data';

const API = 'https://foretell-backend-production-58a6.up.railway.app';

// ✅ Animated UNDER REVIEW dots
const AnimatedUnderReview = () => {
    const [dots, setDots] = useState('.');
    useEffect(() => {
        const id = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '.' : prev + '.');
        }, 500);
        return () => clearInterval(id);
    }, []);
    return (
        <Chip
            icon={<CircularProgress size={12} sx={{ color: '#00BAE6' }} />}
            label={`UNDER REVIEW${dots}`}
            size="small"
            sx={{
                bgcolor: 'rgba(0,186,230,0.15)',
                color: '#00BAE6',
                fontWeight: 700,
                fontSize: '0.65rem',
                border: '1px solid #00BAE6',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,186,230,0.4)' },
                    '50%': { boxShadow: '0 0 0 6px rgba(0,186,230,0)' }
                }
            }}
        />
    );
};

// ✅ Status badge
const StatusBadge = ({ status }: { status: string }) => {
    if (!status || status === 'success') return (
        <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
            label="Success"
            size="small"
            sx={{ bgcolor: 'rgba(0,231,1,0.15)', color: '#00e701', fontWeight: 700, fontSize: '0.65rem', border: '1px solid #00e701' }}
        />
    );
    if (status === 'pending') return (
        <Chip
            icon={<AccessTimeIcon sx={{ fontSize: 12 }} />}
            label="Pending"
            size="small"
            sx={{ bgcolor: 'rgba(255,193,7,0.15)', color: '#FFC107', fontWeight: 700, fontSize: '0.65rem', border: '1px solid #FFC107' }}
        />
    );
    if (status === 'under_review') return <AnimatedUnderReview />;
    if (status === 'rejected') return (
        <Chip
            icon={<CancelIcon sx={{ fontSize: 12 }} />}
            label="Rejected"
            size="small"
            sx={{ bgcolor: 'rgba(244,67,54,0.15)', color: '#f44336', fontWeight: 700, fontSize: '0.65rem', border: '1px solid #f44336' }}
        />
    );
    return <Chip label={status} size="small" />;
};

const TransactionPage = () => {
    const { t } = useTranslate();
    const rangeCalendarPicker = useDateRangePicker(new Date(), new Date());
    const { user } = useAuth();
    const token = localStorage.getItem('betthrob-accessToken') || sessionStorage.getItem('betthrob-accessToken');

    const [loading, setLoading] = useState<boolean>(false);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [type, setType] = useState<string>('all');
    const [date, setDate] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });
    const [selectedDuration, setSelectedDuration] = useState<string>('60');
    const [data, setData] = useState<any[]>([]);
    const [walletTxs, setWalletTxs] = useState<any[]>([]);

    const typeOptions = [
        { name: 'all', label: 'all' },
        { name: 'deposit', label: 'deposit' },
        { name: 'withdraw', label: 'withdraw' },
        { name: 'win', label: 'win' },
        { name: 'bet', label: 'bet' }
    ];

    const changeDuration = (value: string) => {
        if (value === 'custom' && rangeCalendarPicker.onOpen) {
            rangeCalendarPicker.onOpen();
        } else {
            const dateRange = getPastDate(Number(value));
            setDate(dateRange);
        }
        setSelectedDuration(value);
    };

    useEffect(() => { changeDuration(selectedDuration); }, [selectedDuration]);

    useEffect(() => {
        if (rangeCalendarPicker.startDate && rangeCalendarPicker.endDate) {
            setDate({ start: rangeCalendarPicker.startDate, end: rangeCalendarPicker.endDate });
        }
    }, [rangeCalendarPicker.startDate, rangeCalendarPicker.endDate]);

    const getPastDate = (days: number) => ({
        start: moment().add(-days, 'days').startOf('day').toDate(),
        end: moment().endOf('day').toDate()
    });

    // ✅ Load wallet transactions (deposit/withdraw with statuses)
    const loadWalletTransactions = useCallback(async () => {
        try {
            const res = await fetch(`${API}/api/wallet/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setWalletTxs(data.data);
        } catch (e) {
            console.error(e);
        }
    }, [token]);

    // ✅ Auto-refresh every 30 seconds to catch status updates
    useEffect(() => {
        loadWalletTransactions();
        const id = setInterval(loadWalletTransactions, 30000);
        return () => clearInterval(id);
    }, [loadWalletTransactions]);

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

    // ✅ Filter wallet txs based on selected type
    const filteredWalletTxs = walletTxs.filter(tx => {
        if (type === 'all') return tx.type === 'deposit' || tx.type === 'withdraw';
        if (type === 'deposit') return tx.type === 'deposit';
        if (type === 'withdraw') return tx.type === 'withdraw';
        return false;
    });

    return (
        <Stack
            direction="column"
            gap={2}
            sx={{ py: { xs: 1, sm: 2 }, px: { xs: 2, sm: 4 }, bgcolor: 'background.card', borderRadius: 3 }}
        >
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

            <Stack direction="row" alignItems="center">
                <Stack direction="row" alignItems="center" sx={{ cursor: 'pointer', color: 'text.secondary', textDecoration: 'underline', gap: 0.5 }}>
                    <InfoOutlinedIcon sx={{ fontSize: 17 }} />
                    <Typography variant="body2">Fiat Deposit issues or Disputes</Typography>
                </Stack>
            </Stack>

            {/* ✅ Wallet Deposit/Withdraw transactions with STATUS */}
            {filteredWalletTxs.length > 0 && (
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                        Deposit & Withdrawal History
                    </Typography>
                    {filteredWalletTxs.map((tx, i) => (
                        <Box key={i} sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: tx.status === 'success' ? 'rgba(0,231,1,0.2)'
                                : tx.status === 'under_review' ? 'rgba(0,186,230,0.2)'
                                : tx.status === 'rejected' ? 'rgba(244,67,54,0.2)'
                                : 'rgba(255,193,7,0.2)',
                            bgcolor: 'background.layer2'
                        }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                        <Typography variant="caption" sx={{
                                            color: tx.type === 'deposit' ? '#00e701' : '#f44336',
                                            fontWeight: 700,
                                            textTransform: 'uppercase'
                                        }}>
                                            {tx.type === 'deposit' ? '+ Deposit' : '- Withdraw'}
                                        </Typography>
                                        <StatusBadge status={tx.status || 'pending'} />
                                    </Stack>
                                    <Typography variant="h6" fontWeight={800}>
                                        GH₵ {Number(tx.amount).toFixed(2)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {tx.timestamp ? fDateTime(tx.timestamp) : '-'}
                                    </Typography>
                                    {tx.reference && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Ref: {tx.reference}
                                        </Typography>
                                    )}
                                </Box>
                                {tx.status === 'under_review' && <CircularProgress size={24} sx={{ color: '#00BAE6' }} />}
                                {tx.status === 'success' && <CheckCircleIcon sx={{ color: '#00e701', fontSize: 28 }} />}
                                {tx.status === 'rejected' && <CancelIcon sx={{ color: '#f44336', fontSize: 28 }} />}
                                {tx.status === 'pending' && <AccessTimeIcon sx={{ color: '#FFC107', fontSize: 28 }} />}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            )}

            {/* ✅ Game transaction history table */}
            <Table sx={{ th: { py: 1 }, td: { borderBottom: 0 } }}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('type')}</TableCell>
                        <TableCell>{t('time')}</TableCell>
                        <TableCell>{t('amount')}</TableCell>
                        <TableCell>{t('balance')}</TableCell>
                    </TableRow>
                </TableHead>
                {!loading && (
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}><EmptyData /></TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>
                                        <Typography fontWeight={700}>{item?.typeDescription}</Typography>
                                        <Typography variant="caption" color="textDisabled">{item?.gameName}</Typography>
                                    </TableCell>
                                    <TableCell>{item?.createdAt ? fDateTime(item.createdAt) : '-'}</TableCell>
                                    <TableCell>
                                        <Typography variant="button" color={(item?.amount ?? 0) > 0 ? 'primary' : 'error'}>
                                            {item?.amount ?? 0}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right', fontWeight: '800' }}>
                                        {item?.afterAmount ?? 0}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                )}
            </Table>

            {loading && (
                <Stack width="100%" minHeight={300}><LoadingScreen /></Stack>
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

export default TransactionPage;
