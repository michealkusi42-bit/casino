import { useEffect, useState } from 'react';
import {
    Box, Stack, Typography, Button, Chip, Tab, Tabs, Table, TableBody,
    TableCell, TableHead, TableRow, TextField, Select, MenuItem,
    CircularProgress, Alert, IconButton, Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'utils/axios';

const API = '/api/admin';

const GAMES = ['coinflip', 'dice', 'hilo', 'mines', 'roulette', 'updown', 'crash', 'lottery', 'racing', 'bingo', 'poker'];

const statusChip = (status: string) => {
    const map: any = {
        pending: { label: '⏳ Pending', color: '#ffc107', bg: 'rgba(255,193,7,0.12)' },
        approved: { label: '✅ Approved', color: '#00e701', bg: 'rgba(0,231,1,0.12)' },
        rejected: { label: '❌ Rejected', color: '#f44336', bg: 'rgba(244,67,54,0.12)' },
    };
    const s = map[status] || map.pending;
    return <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: '0.7rem' }} />;
};

export default function AdminPanel() {
    const [tab, setTab] = useState(0);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // Game control state
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedGame, setSelectedGame] = useState('coinflip');
    const [overrideValue, setOverrideValue] = useState('win');
    const [customValue, setCustomValue] = useState('');
    const [userOverrides, setUserOverrides] = useState<any>({});

    const load = async () => {
        setLoading(true);
        try {
            const [d, w, u, s] = await Promise.all([
                axios.get(`${API}/deposits?status=all`),
                axios.get(`${API}/withdrawals?status=all`),
                axios.get(`${API}/users`),
                axios.get(`${API}/stats`),
            ]);
            setDeposits(d.data.data || []);
            setWithdrawals(w.data.data || []);
            setUsers(u.data.data || []);
            setStats(s.data.data);
        } catch (e) {
            setMsg('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const approve = async (type: string, id: string) => {
        try {
            await axios.post(`${API}/${type}/${id}/approve`);
            setMsg('✅ Approved successfully');
            load();
        } catch (e: any) {
            setMsg(e?.response?.data?.error || 'Failed');
        }
    };

    const reject = async (type: string, id: string) => {
        try {
            await axios.post(`${API}/${type}/${id}/reject`);
            setMsg('❌ Rejected');
            load();
        } catch (e: any) {
            setMsg(e?.response?.data?.error || 'Failed');
        }
    };

    const setOverride = async () => {
        if (!selectedUser) { setMsg('Select a user first'); return; }
        try {
            let value: any = overrideValue;
            if (overrideValue === 'custom') {
                try { value = JSON.parse(customValue); } catch { value = customValue; }
            }
            await axios.post(`${API}/overrides/${selectedUser}`, { game: selectedGame, value });
            setMsg(`✅ Override set: ${selectedUser} → ${selectedGame} → ${JSON.stringify(value)}`);
            loadOverrides(selectedUser);
        } catch (e: any) {
            setMsg(e?.response?.data?.error || 'Failed');
        }
    };

    const clearOverride = async (username: string, game: string) => {
        try {
            await axios.delete(`${API}/overrides/${username}/${game}`);
            setMsg('Override cleared');
            loadOverrides(username);
        } catch (e) {}
    };

    const loadOverrides = async (username: string) => {
        if (!username) return;
        try {
            const r = await axios.get(`${API}/overrides/${username}`);
            setUserOverrides(r.data.data || {});
        } catch (e) {}
    };

    const adjustBalance = async (username: string, action: string, amount: string) => {
        try {
            await axios.post(`${API}/users/${username}/adjust-balance`, { action, amount: parseFloat(amount) });
            setMsg(`✅ Balance updated for ${username}`);
            load();
        } catch (e: any) {
            setMsg(e?.response?.data?.error || 'Failed');
        }
    };

    const suspend = async (username: string) => {
        try {
            const r = await axios.post(`${API}/users/${username}/suspend`);
            setMsg(`User ${r.data.suspended ? 'suspended' : 'unsuspended'}`);
            load();
        } catch (e) {}
    };

    return (
        <Box sx={{ bgcolor: '#0f212e', minHeight: '100vh', p: { xs: 2, md: 4 }, color: '#fff' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#00e701' }}>
                    🛡 Admin Panel
                </Typography>
                <IconButton onClick={load} sx={{ color: '#fff' }}>
                    <RefreshIcon />
                </IconButton>
            </Stack>

            {msg && (
                <Alert severity="info" onClose={() => setMsg('')} sx={{ mb: 2 }}>
                    {msg}
                </Alert>
            )}

            {/* Stats */}
            {stats && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 2, mb: 3 }}>
                    {[
                        { label: 'Total Users', value: stats.totalUsers },
                        { label: 'Pending Deposits', value: stats.pendingDeposits, color: '#ffc107' },
                        { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, color: '#ffc107' },
                        { label: 'House Profit', value: `GHS ${stats.houseProfit?.toFixed(2)}`, color: '#00e701' },
                    ].map((s) => (
                        <Box key={s.label} sx={{ bgcolor: '#213743', borderRadius: 2, p: 2 }}>
                            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                            <Typography variant="h5" fontWeight={800} sx={{ color: s.color || '#fff' }}>{s.value}</Typography>
                        </Box>
                    ))}
                </Box>
            )}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, bgcolor: '#213743', borderRadius: 2 }}>
                <Tab label="💰 Deposits" sx={{ color: '#fff' }} />
                <Tab label="💸 Withdrawals" sx={{ color: '#fff' }} />
                <Tab label="🎮 Game Control" sx={{ color: '#fff' }} />
                <Tab label="👥 Users" sx={{ color: '#fff' }} />
            </Tabs>

            {loading && <CircularProgress sx={{ color: '#00e701', display: 'block', mx: 'auto', my: 4 }} />}

            {/* DEPOSITS */}
            {tab === 0 && !loading && (
                <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['User', 'Amount', 'Method', 'Reference', 'Time', 'Status', 'Action'].map(h => (
                                    <TableCell key={h} sx={{ color: '#94a3b8', fontWeight: 700 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {deposits.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{d.username}</TableCell>
                                    <TableCell sx={{ color: '#00e701', fontWeight: 700 }}>GHS {d.amount}</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>{d.method || 'MoMo'}</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>{d.reference || '-'}</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>{new Date(d.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>{statusChip(d.status)}</TableCell>
                                    <TableCell>
                                        {d.status === 'pending' && (
                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="Approve — credits user balance">
                                                    <IconButton onClick={() => approve('deposits', d.id)} size="small" sx={{ color: '#00e701' }}>
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reject — no balance change">
                                                    <IconButton onClick={() => reject('deposits', d.id)} size="small" sx={{ color: '#f44336' }}>
                                                        <CancelIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {deposits.length === 0 && (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ color: '#94a3b8' }}>No deposits yet</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            )}

            {/* WITHDRAWALS */}
            {tab === 1 && !loading && (
                <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['User', 'Amount', 'Method', 'Address', 'Time', 'Status', 'Action'].map(h => (
                                    <TableCell key={h} sx={{ color: '#94a3b8', fontWeight: 700 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {withdrawals.map((w) => (
                                <TableRow key={w.id}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{w.username}</TableCell>
                                    <TableCell sx={{ color: '#f44336', fontWeight: 700 }}>GHS {w.amount}</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>{w.method || 'MoMo'}</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>{w.address || '-'}</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>{new Date(w.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>{statusChip(w.status)}</TableCell>
                                    <TableCell>
                                        {w.status === 'pending' && (
                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="Approve — mark as paid (balance already deducted)">
                                                    <IconButton onClick={() => approve('withdrawals', w.id)} size="small" sx={{ color: '#00e701' }}>
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reject — refunds user balance">
                                                    <IconButton onClick={() => reject('withdrawals', w.id)} size="small" sx={{ color: '#f44336' }}>
                                                        <CancelIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {withdrawals.length === 0 && (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ color: '#94a3b8' }}>No withdrawals yet</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            )}

            {/* GAME CONTROL */}
            {tab === 2 && !loading && (
                <Stack spacing={3}>
                    <Box sx={{ bgcolor: '#213743', borderRadius: 2, p: 3 }}>
                        <Typography variant="h6" fontWeight={700} mb={2}>🎮 Set Game Override</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            One-shot: override applies to the user's NEXT bet only, then clears automatically.
                        </Typography>

                        <Stack spacing={2}>
                            <Select value={selectedUser} onChange={(e) => { setSelectedUser(e.target.value); loadOverrides(e.target.value); }}
                                displayEmpty sx={{ bgcolor: '#0f212e', color: '#fff' }}>
                                <MenuItem value="" disabled>Select User</MenuItem>
                                {users.map(u => <MenuItem key={u.username} value={u.username}>{u.username} — GHS {u.balance?.toFixed(2)}</MenuItem>)}
                            </Select>

                            <Select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)} sx={{ bgcolor: '#0f212e', color: '#fff' }}>
                                {GAMES.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                            </Select>

                            <Select value={overrideValue} onChange={(e) => setOverrideValue(e.target.value)} sx={{ bgcolor: '#0f212e', color: '#fff' }}>
                                <MenuItem value="win">🏆 Force WIN</MenuItem>
                                <MenuItem value="lose">💀 Force LOSE</MenuItem>
                                <MenuItem value="custom">🎯 Custom value (JSON)</MenuItem>
                            </Select>

                            {overrideValue === 'custom' && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        Examples: mines positions → [0,1,2] | dice roll → 45 | crash point → 1.5 | lottery numbers → [5,12,23,34,45]
                                    </Typography>
                                    <TextField fullWidth value={customValue} onChange={(e) => setCustomValue(e.target.value)}
                                        placeholder='e.g. [0,1,2] or 45 or 1.5' size="small"
                                        sx={{ input: { color: '#fff' }, bgcolor: '#0f212e' }} />
                                </Box>
                            )}

                            <Button variant="contained" onClick={setOverride}
                                sx={{ bgcolor: '#00e701', color: '#000', fontWeight: 700, py: 1.5 }}>
                                Set Override
                            </Button>
                        </Stack>
                    </Box>

                    {/* Active overrides for selected user */}
                    {selectedUser && Object.keys(userOverrides).length > 0 && (
                        <Box sx={{ bgcolor: '#213743', borderRadius: 2, p: 3 }}>
                            <Typography variant="h6" fontWeight={700} mb={2}>Active Overrides for {selectedUser}</Typography>
                            <Stack spacing={1}>
                                {Object.entries(userOverrides).map(([game, value]) => (
                                    <Stack key={game} direction="row" justifyContent="space-between" alignItems="center"
                                        sx={{ bgcolor: '#0f212e', p: 1.5, borderRadius: 1 }}>
                                        <Box>
                                            <Typography fontWeight={700} sx={{ textTransform: 'capitalize' }}>{game}</Typography>
                                            <Typography variant="caption" color="text.secondary">{JSON.stringify(value)}</Typography>
                                        </Box>
                                        <IconButton onClick={() => clearOverride(selectedUser, game)} size="small" sx={{ color: '#f44336' }}>
                                            <CancelIcon />
                                        </IconButton>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Stack>
            )}

            {/* USERS */}
            {tab === 3 && !loading && (
                <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['Username', 'Email', 'Balance', 'Status', 'Adjust Balance', 'Actions'].map(h => (
                                    <TableCell key={h} sx={{ color: '#94a3b8', fontWeight: 700 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u) => {
                                const [adjAmt, setAdjAmt] = useState('');
                                const [adjAction, setAdjAction] = useState('add');
                                return (
                                    <TableRow key={u.username}>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{u.username}</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>{u.email}</TableCell>
                                        <TableCell sx={{ color: '#00e701', fontWeight: 700 }}>GHS {u.balance?.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Chip label={u.suspended ? '🔴 Suspended' : '🟢 Active'} size="small"
                                                sx={{ bgcolor: u.suspended ? 'rgba(244,67,54,0.12)' : 'rgba(0,231,1,0.12)', color: u.suspended ? '#f44336' : '#00e701', fontWeight: 700 }} />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Select value={adjAction} onChange={(e) => setAdjAction(e.target.value)} size="small"
                                                    sx={{ bgcolor: '#0f212e', color: '#fff', minWidth: 80 }}>
                                                    <MenuItem value="add">Add</MenuItem>
                                                    <MenuItem value="deduct">Deduct</MenuItem>
                                                    <MenuItem value="set">Set</MenuItem>
                                                </Select>
                                                <TextField size="small" value={adjAmt} onChange={(e) => setAdjAmt(e.target.value)}
                                                    placeholder="Amount" type="number" sx={{ width: 90, input: { color: '#fff' }, bgcolor: '#0f212e' }} />
                                                <Button size="small" variant="contained" onClick={() => adjustBalance(u.username, adjAction, adjAmt)}
                                                    sx={{ bgcolor: '#00BAE6', color: '#fff', minWidth: 'auto' }}>Go</Button>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="small" variant="outlined"
                                                onClick={() => suspend(u.username)}
                                                sx={{ color: u.suspended ? '#00e701' : '#f44336', borderColor: u.suspended ? '#00e701' : '#f44336' }}>
                                                {u.suspended ? 'Unsuspend' : 'Suspend'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Box>
            )}
        </Box>
    );
}
