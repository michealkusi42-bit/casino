import { useEffect, useState } from 'react';
import {
    Box, Stack, Typography, Button, Chip, Tab, Tabs, Table, TableBody,
    TableCell, TableHead, TableRow, TextField, Select, MenuItem,
    CircularProgress, Alert, IconButton, Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockIcon from '@mui/icons-material/Lock';
import axios from 'utils/axios';

const API = '/api/admin';
const ADMIN_PASSWORD_KEY = 'adminPanelPassword';

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

function UserRow({ u, onAdjust, onSuspend }: { u: any; onAdjust: (username: string, action: string, amount: string) => void; onSuspend: (username: string) => void; }) {
    const [adjAmt, setAdjAmt] = useState('');
    const [adjAction, setAdjAction] = useState('add');
    return (
        <TableRow>
            <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{u.username}</TableCell>
            <TableCell sx={{ color: '#94a3b8', fontSize: '0.75rem', display: { xs: 'none', sm: 'table-cell' } }}>{u.email}</TableCell>
            <TableCell sx={{ color: '#00e701', fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>GHS {u.balance?.toFixed(2)}</TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                <Chip label={u.suspended ? '🔴 Suspended' : '🟢 Active'} size="small"
                    sx={{ bgcolor: u.suspended ? 'rgba(244,67,54,0.12)' : 'rgba(0,231,1,0.12)', color: u.suspended ? '#f44336' : '#00e701', fontWeight: 700 }} />
            </TableCell>
            <TableCell>
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Select value={adjAction} onChange={(e) => setAdjAction(e.target.value)} size="small"
                        sx={{ bgcolor: '#0f212e', color: '#fff', minWidth: { xs: 60, sm: 80 }, fontSize: '0.75rem' }}>
                        <MenuItem value="add">Add</MenuItem>
                        <MenuItem value="deduct">Deduct</MenuItem>
                        <MenuItem value="set">Set</MenuItem>
                    </Select>
                    <TextField size="small" value={adjAmt} onChange={(e) => setAdjAmt(e.target.value)}
                        placeholder="Amt" type="number"
                        sx={{ width: { xs: 60, sm: 90 }, input: { color: '#fff', fontSize: '0.75rem', p: '6px' }, bgcolor: '#0f212e' }} />
                    <Button size="small" variant="contained" onClick={() => onAdjust(u.username, adjAction, adjAmt)}
                        sx={{ bgcolor: '#00BAE6', color: '#fff', minWidth: 'auto', px: 1, fontSize: '0.7rem' }}>Go</Button>
                </Stack>
            </TableCell>
            <TableCell>
                <Button size="small" variant="outlined" onClick={() => onSuspend(u.username)}
                    sx={{ color: u.suspended ? '#00e701' : '#f44336', borderColor: u.suspended ? '#00e701' : '#f44336', fontSize: '0.7rem', px: { xs: 0.5, sm: 1 } }}>
                    {u.suspended ? 'Unsuspend' : 'Suspend'}
                </Button>
            </TableCell>
        </TableRow>
    );
}

export default function AdminPanel() {
    const [unlocked, setUnlocked] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [passwordInput, setPasswordInput] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    const [tab, setTab] = useState(0);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const [selectedUser, setSelectedUser] = useState('');
    const [selectedGame, setSelectedGame] = useState('coinflip');
    const [overrideValue, setOverrideValue] = useState('win');
    const [customValue, setCustomValue] = useState('');
    const [userOverrides, setUserOverrides] = useState<any>({});

    useEffect(() => {
        const saved = sessionStorage.getItem(ADMIN_PASSWORD_KEY);
        if (saved) {
            axios.defaults.headers.common['x-admin-password'] = saved;
            setUnlocked(true);
        }
        setCheckingAuth(false);
    }, []);

    useEffect(() => {
        if (unlocked) load();
    }, [unlocked]);

    const handleUnlock = async () => {
        setAuthError('');
        setAuthLoading(true);
        try {
            await axios.post(`${API}/login`, { password: passwordInput });
            sessionStorage.setItem(ADMIN_PASSWORD_KEY, passwordInput);
            axios.defaults.headers.common['x-admin-password'] = passwordInput;
            setUnlocked(true);
        } catch (e: any) {
            setAuthError(e?.response?.data?.error || 'Incorrect password');
        } finally {
            setAuthLoading(false);
        }
    };

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
        } catch (e: any) {
            if (e?.response?.status === 403) {
                sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
                setUnlocked(false);
                setAuthError('Session expired — enter the password again');
            } else {
                setMsg('Failed to load data');
            }
        } finally {
            setLoading(false);
        }
    };

    const approve = async (type: string, id: string) => {
        try {
            await axios.post(`${API}/${type}/${id}/approve`);
            setMsg('✅ Approved successfully');
            load();
        } catch (e: any) { setMsg(e?.response?.data?.error || 'Failed'); }
    };

    const reject = async (type: string, id: string) => {
        try {
            await axios.post(`${API}/${type}/${id}/reject`);
            setMsg('❌ Rejected');
            load();
        } catch (e: any) { setMsg(e?.response?.data?.error || 'Failed'); }
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
        } catch (e: any) { setMsg(e?.response?.data?.error || 'Failed'); }
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
        } catch (e: any) { setMsg(e?.response?.data?.error || 'Failed'); }
    };

    const suspend = async (username: string) => {
        try {
            const r = await axios.post(`${API}/users/${username}/suspend`);
            setMsg(`User ${r.data.suspended ? 'suspended' : 'unsuspended'}`);
            load();
        } catch (e) {}
    };

    if (checkingAuth) return null;

    if (!unlocked) {
        return (
            <Box sx={{ bgcolor: '#0f212e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', p: 2 }}>
                <Stack spacing={2} alignItems="center" sx={{ width: '100%', maxWidth: 320 }}>
                    <LockIcon sx={{ fontSize: 48, color: '#00e701' }} />
                    <Typography variant="h5" fontWeight={800}>Admin Access</Typography>
                    {authError && <Alert severity="error" sx={{ width: '100%' }}>{authError}</Alert>}
                    <TextField fullWidth type="password" placeholder="Enter admin password"
                        value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                        sx={{ input: { color: '#fff' }, bgcolor: '#213743', borderRadius: 1 }} />
                    <Button fullWidth variant="contained" disabled={authLoading || !passwordInput} onClick={handleUnlock}
                        sx={{ bgcolor: '#00e701', color: '#000', fontWeight: 700, py: 1.2 }}>
                        {authLoading ? <CircularProgress size={20} sx={{ color: '#000' }} /> : 'Unlock'}
                    </Button>
                </Stack>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#0f212e', minHeight: '100vh', p: { xs: 1.5, md: 4 }, color: '#fff' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#00e701', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                    🛡 Admin Panel
                </Typography>
                <IconButton onClick={load} sx={{ color: '#fff' }}><RefreshIcon /></IconButton>
            </Stack>

            {msg && <Alert severity="info" onClose={() => setMsg('')} sx={{ mb: 2, fontSize: '0.8rem' }}>{msg}</Alert>}

            {/* Stats - 2 cols on mobile, 4 on desktop */}
            {stats && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: { xs: 1, md: 2 }, mb: 2 }}>
                    {[
                        { label: 'Total Users', value: stats.totalUsers },
                        { label: 'Pending Deposits', value: stats.pendingDeposits, color: '#ffc107' },
                        { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, color: '#ffc107' },
                        { label: 'House Profit', value: `GHS ${stats.houseProfit?.toFixed(2)}`, color: '#00e701' },
                    ].map((s) => (
                        <Box key={s.label} sx={{ bgcolor: '#213743', borderRadius: 2, p: { xs: 1.5, md: 2 } }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>{s.label}</Typography>
                            <Typography fontWeight={800} sx={{ color: s.color || '#fff', fontSize: { xs: '1.1rem', md: '1.5rem' } }}>{s.value}</Typography>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Tabs - scrollable on mobile */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
                sx={{ mb: 2, bgcolor: '#213743', borderRadius: 2, '& .MuiTab-root': { color: '#fff', fontSize: { xs: '0.7rem', sm: '0.875rem' }, minWidth: { xs: 'auto', sm: 90 }, px: { xs: 1, sm: 2 } } }}>
                <Tab label="💰 Deposits" />
                <Tab label="💸 Withdrawals" />
                <Tab label="🎮 Game Control" />
                <Tab label="👥 Users" />
            </Tabs>

            {loading && <CircularProgress sx={{ color: '#00e701', display: 'block', mx: 'auto', my: 4 }} />}

            {/* DEPOSITS */}
            {tab === 0 && !loading && (
                <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>User</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Amount</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Method</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Reference</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Time</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {deposits.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{d.username}</TableCell>
                                    <TableCell sx={{ color: '#00e701', fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>GHS {d.amount}</TableCell>
                                    <TableCell sx={{ color: '#fff', display: { xs: 'none', sm: 'table-cell' } }}>{d.method || 'MoMo'}</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.75rem', display: { xs: 'none', md: 'table-cell' } }}>{d.reference || '-'}</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.75rem', display: { xs: 'none', md: 'table-cell' } }}>{new Date(d.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>{statusChip(d.status)}</TableCell>
                                    <TableCell>
                                        {d.status === 'pending' && (
                                            <Stack direction="row" spacing={0.5}>
                                                <Tooltip title="Approve">
                                                    <IconButton onClick={() => approve('deposits', d.id)} size="small" sx={{ color: '#00e701' }}>
                                                        <CheckCircleIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reject">
                                                    <IconButton onClick={() => reject('deposits', d.id)} size="small" sx={{ color: '#f44336' }}>
                                                        <CancelIcon fontSize="small" />
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
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>User</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Amount</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Method</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Address</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Time</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {withdrawals.map((w) => (
                                <TableRow key={w.id}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{w.username}</TableCell>
                                    <TableCell sx={{ color: '#f44336', fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>GHS {w.amount}</TableCell>
                                    <TableCell sx={{ color: '#fff', display: { xs: 'none', sm: 'table-cell' } }}>{w.method || 'MoMo'}</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.75rem', display: { xs: 'none', md: 'table-cell' } }}>{w.address || '-'}</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.75rem', display: { xs: 'none', md: 'table-cell' } }}>{new Date(w.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>{statusChip(w.status)}</TableCell>
                                    <TableCell>
                                        {w.status === 'pending' && (
                                            <Stack direction="row" spacing={0.5}>
                                                <Tooltip title="Approve">
                                                    <IconButton onClick={() => approve('withdrawals', w.id)} size="small" sx={{ color: '#00e701' }}>
                                                        <CheckCircleIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reject">
                                                    <IconButton onClick={() => reject('withdrawals', w.id)} size="small" sx={{ color: '#f44336' }}>
                                                        <CancelIcon fontSize="small" />
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
                    <Box sx={{ bgcolor: '#213743', borderRadius: 2, p: { xs: 2, md: 3 } }}>
                        <Typography variant="h6" fontWeight={700} mb={2}>🎮 Set Game Override</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            One-shot: override applies to the user's NEXT bet only, then clears automatically.
                        </Typography>
                        <Stack spacing={2}>
                            <Select value={selectedUser} onChange={(e) => { setSelectedUser(e.target.value); loadOverrides(e.target.value); }}
                                displayEmpty size="small" sx={{ bgcolor: '#0f212e', color: '#fff' }}>
                                <MenuItem value="" disabled>Select User</MenuItem>
                                {users.map(u => <MenuItem key={u.username} value={u.username}>{u.username} — GHS {u.balance?.toFixed(2)}</MenuItem>)}
                            </Select>
                            <Select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)} size="small" sx={{ bgcolor: '#0f212e', color: '#fff' }}>
                                {GAMES.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                            </Select>
                            <Select value={overrideValue} onChange={(e) => setOverrideValue(e.target.value)} size="small" sx={{ bgcolor: '#0f212e', color: '#fff' }}>
                                <MenuItem value="win">🏆 Force WIN</MenuItem>
                                <MenuItem value="lose">💀 Force LOSE</MenuItem>
                                <MenuItem value="custom">🎯 Custom value (JSON)</MenuItem>
                            </Select>
                            {overrideValue === 'custom' && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        mines → [0,1,2] | dice → 45 | crash → 1.5 | lottery → [5,12,23,34,45]
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
                    {selectedUser && Object.keys(userOverrides).length > 0 && (
                        <Box sx={{ bgcolor: '#213743', borderRadius: 2, p: { xs: 2, md: 3 } }}>
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
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Username</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Balance</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Status</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Adjust</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u) => (
                                <UserRow key={u.username} u={u} onAdjust={adjustBalance} onSuspend={suspend} />
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            )}
        </Box>
    );
}
