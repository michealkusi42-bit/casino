import { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, Grid, Card, CardContent,
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
    Paper, Select, MenuItem, FormControl, InputLabel, Switch,
    FormControlLabel, Chip, Divider, Tab, Tabs
} from '@mui/material';

const BACKEND_URL = 'https://foretell-backend-production-58a6.up.railway.app';
const GAMES = ['coinflip', 'dice', 'hilo', 'mines', 'roulette', 'updown', 'crash', 'lottery', 'racing', 'bingo'];

const AdminPanel = () => {
    const [adminKey, setAdminKey] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [tab, setTab] = useState(0);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [overrides, setOverrides] = useState<any>({});
    const [maintenance, setMaintenance] = useState(false);
    const [balanceUser, setBalanceUser] = useState('');
    const [balanceAmount, setBalanceAmount] = useState('');
    const [message, setMessage] = useState('');

    const headers = {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
    };

    const fetchStats = async () => {
        const res = await fetch(`${BACKEND_URL}/api/admin/stats`, { headers });
        const data = await res.json();
        setStats(data);
        setMaintenance(data.maintenanceMode);
    };

    const fetchUsers = async () => {
        const res = await fetch(`${BACKEND_URL}/api/admin/users`, { headers });
        const data = await res.json();
        setUsers(data.users || []);
    };

    const fetchOverrides = async () => {
        const res = await fetch(`${BACKEND_URL}/api/admin/overrides`, { headers });
        const data = await res.json();
        setOverrides(data);
    };

    const handleLogin = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/stats`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': adminKey
                }
            });
            if (res.ok) {
                setIsLoggedIn(true);
                setLoginError('');
                fetchStats();
                fetchUsers();
                fetchOverrides();
            } else {
                setLoginError('Wrong admin key! Access denied.');
            }
        } catch {
            setLoginError('Cannot connect to backend.');
        }
    };

    const setOverride = async (game: string, value: any) => {
        await fetch(`${BACKEND_URL}/api/admin/overrides`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ game, value })
        });
        fetchOverrides();
        setMessage(`✅ ${game} override set to: ${value}`);
        setTimeout(() => setMessage(''), 3000);
    };

    const adjustBalance = async () => {
        if (!balanceUser || !balanceAmount) return;
        const res = await fetch(`${BACKEND_URL}/api/admin/user/balance`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ username: balanceUser, amount: parseFloat(balanceAmount) })
        });
        const data = await res.json();
        setMessage(`✅ Balance updated! New balance: GH₵ ${data.balance}`);
        setTimeout(() => setMessage(''), 3000);
        fetchUsers();
        setBalanceUser('');
        setBalanceAmount('');
    };

    const toggleMaintenance = async () => {
        await fetch(`${BACKEND_URL}/api/admin/maintenance`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ enabled: !maintenance })
        });
        setMaintenance(!maintenance);
        setMessage(`✅ Maintenance mode ${!maintenance ? 'ON' : 'OFF'}`);
        setTimeout(() => setMessage(''), 3000);
    };

    if (!isLoggedIn) {
        return (
            <Box sx={{
                minHeight: '100vh',
                bgcolor: '#0f212e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Box sx={{
                    bgcolor: '#213743',
                    p: 5,
                    borderRadius: 3,
                    width: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                }}>
                    <Typography variant="h4" fontWeight="bold" color="white" textAlign="center">
                        🔐 Admin Login
                    </Typography>
                    <Typography color="#99a4b0" textAlign="center">
                        ForeTell Casino Admin Panel
                    </Typography>
                    <TextField
                        type="password"
                        label="Admin Secret Key"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        sx={{
                            input: { color: 'white' },
                            label: { color: '#99a4b0' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#2f4553' },
                                '&:hover fieldset': { borderColor: '#00e701' }
                            }
                        }}
                    />
                    {loginError && (
                        <Typography color="error" textAlign="center">{loginError}</Typography>
                    )}
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleLogin}
                        sx={{ bgcolor: '#00e701', color: 'black', fontWeight: 'bold', py: 1.5 }}
                    >
                        Login
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0f212e', p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="white">
                    🎰 ForeTell Admin Panel
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip
                        label={maintenance ? '🔴 Maintenance ON' : '🟢 Site Live'}
                        color={maintenance ? 'error' : 'success'}
                    />
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setIsLoggedIn(false)}
                    >
                        Logout
                    </Button>
                </Box>
            </Box>

            {/* Message */}
            {message && (
                <Box sx={{ bgcolor: '#213743', p: 2, borderRadius: 2, mb: 2 }}>
                    <Typography color="#00e701">{message}</Typography>
                </Box>
            )}

            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{ mb: 3, '& .MuiTab-root': { color: '#99a4b0' }, '& .Mui-selected': { color: '#00e701' } }}
            >
                <Tab label="📊 Dashboard" />
                <Tab label="👥 Users" />
                <Tab label="🎮 Game Control" />
                <Tab label="💰 Balance" />
                <Tab label="🔧 Settings" />
            </Tabs>

            {/* DASHBOARD TAB */}
            {tab === 0 && stats && (
                <Box>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        {[
                            { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
                            { label: 'Total Games Played', value: stats.totalGames, icon: '🎮' },
                            { label: 'Total Wagered', value: `GH₵ ${stats.totalWagered?.toFixed(2)}`, icon: '💰' },
                            { label: 'House Profit', value: `GH₵ ${stats.houseProfit?.toFixed(2)}`, icon: '📈' },
                            { label: 'House Edge', value: `${stats.houseEdgePercent}%`, icon: '📊' },
                            { label: 'Total Payout', value: `GH₵ ${stats.totalPayout?.toFixed(2)}`, icon: '💸' },
                        ].map((item, i) => (
                            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{ bgcolor: '#213743', borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography color="#99a4b0" variant="body2">{item.icon} {item.label}</Typography>
                                        <Typography color="white" variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                                            {item.value}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    <Button variant="contained" onClick={fetchStats} sx={{ bgcolor: '#2f4553' }}>
                        🔄 Refresh Stats
                    </Button>
                </Box>
            )}

            {/* USERS TAB */}
            {tab === 1 && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography color="white" variant="h6">All Users ({users.length})</Typography>
                        <Button variant="contained" onClick={fetchUsers} sx={{ bgcolor: '#2f4553' }}>
                            🔄 Refresh
                        </Button>
                    </Box>
                    <TableContainer component={Paper} sx={{ bgcolor: '#213743' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {['Username', 'Email', 'Balance', 'Currency', 'Joined'].map(h => (
                                        <TableCell key={h} sx={{ color: '#99a4b0', fontWeight: 'bold' }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user, i) => (
                                    <TableRow key={i} sx={{ '&:hover': { bgcolor: '#2f4553' } }}>
                                        <TableCell sx={{ color: 'white' }}>{user.username}</TableCell>
                                        <TableCell sx={{ color: '#99a4b0' }}>{user.email}</TableCell>
                                        <TableCell sx={{ color: '#00e701', fontWeight: 'bold' }}>
                                            GH₵ {user.balance?.toFixed(2)}
                                        </TableCell>
                                        <TableCell sx={{ color: '#99a4b0' }}>{user.currency || 'GHS'}</TableCell>
                                        <TableCell sx={{ color: '#99a4b0' }}>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* GAME CONTROL TAB */}
            {tab === 2 && (
                <Box>
                    <Typography color="white" variant="h6" sx={{ mb: 2 }}>
                        🎮 Game Outcome Control
                    </Typography>
                    <Typography color="#99a4b0" sx={{ mb: 3 }}>
                        Set win/lose override for each game. Set to null to use random outcomes.
                    </Typography>
                    <Grid container spacing={2}>
                        {GAMES.map((game) => (
                            <Grid key={game} size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{ bgcolor: '#213743', borderRadius: 2, p: 2 }}>
                                    <Typography color="white" fontWeight="bold" sx={{ mb: 2, textTransform: 'uppercase' }}>
                                        🎲 {game}
                                    </Typography>
                                    <Typography color="#99a4b0" variant="caption" sx={{ mb: 1, display: 'block' }}>
                                        Current: <span style={{ color: '#00e701' }}>{String(overrides[game] ?? 'random')}</span>
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => setOverride(game, 'win')}
                                            sx={{ bgcolor: '#00e701', color: 'black', fontWeight: 'bold' }}
                                        >
                                            ✅ Force WIN
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => setOverride(game, 'lose')}
                                            sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 'bold' }}
                                        >
                                            ❌ Force LOSE
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => setOverride(game, null)}
                                            sx={{ borderColor: '#2f4553', color: '#99a4b0' }}
                                        >
                                            🎲 Random
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* BALANCE TAB */}
            {tab === 3 && (
                <Box>
                    <Typography color="white" variant="h6" sx={{ mb: 3 }}>
                        💰 Adjust User Balance
                    </Typography>
                    <Box sx={{ bgcolor: '#213743', p: 3, borderRadius: 2, maxWidth: 500 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Username"
                                value={balanceUser}
                                onChange={(e) => setBalanceUser(e.target.value)}
                                sx={{
                                    input: { color: 'white' },
                                    label: { color: '#99a4b0' },
                                    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2f4553' } }
                                }}
                            />
                            <TextField
                                label="Amount (use negative to deduct)"
                                type="number"
                                value={balanceAmount}
                                onChange={(e) => setBalanceAmount(e.target.value)}
                                sx={{
                                    input: { color: 'white' },
                                    label: { color: '#99a4b0' },
                                    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2f4553' } }
                                }}
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={adjustBalance}
                                    sx={{ bgcolor: '#00e701', color: 'black', fontWeight: 'bold', py: 1.5 }}
                                >
                                    ➕ Add Balance
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => {
                                        setBalanceAmount(String(-Math.abs(parseFloat(balanceAmount || '0'))));
                                        adjustBalance();
                                    }}
                                    sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 'bold', py: 1.5 }}
                                >
                                    ➖ Deduct
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    {/* Quick balance table */}
                    <Typography color="white" variant="h6" sx={{ mt: 4, mb: 2 }}>
                        All User Balances
                    </Typography>
                    <TableContainer component={Paper} sx={{ bgcolor: '#213743', maxWidth: 600 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: '#99a4b0' }}>Username</TableCell>
                                    <TableCell sx={{ color: '#99a4b0' }}>Balance</TableCell>
                                    <TableCell sx={{ color: '#99a4b0' }}>Quick Add</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user, i) => (
                                    <TableRow key={i}>
                                        <TableCell sx={{ color: 'white' }}>{user.username}</TableCell>
                                        <TableCell sx={{ color: '#00e701', fontWeight: 'bold' }}>
                                            GH₵ {user.balance?.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setBalanceUser(user.username);
                                                    setTab(3);
                                                }}
                                                sx={{ color: '#00e701' }}
                                            >
                                                Select
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* SETTINGS TAB */}
            {tab === 4 && (
                <Box>
                    <Typography color="white" variant="h6" sx={{ mb: 3 }}>🔧 Site Settings</Typography>
                    <Box sx={{ bgcolor: '#213743', p: 3, borderRadius: 2, maxWidth: 500 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography color="white" fontWeight="bold">Maintenance Mode</Typography>
                                <Typography color="#99a4b0" variant="caption">
                                    Turn on to block all users from playing
                                </Typography>
                            </Box>
                            <Switch
                                checked={maintenance}
                                onChange={toggleMaintenance}
                                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#ef4444' } }}
                            />
                        </Box>
                        <Divider sx={{ bgcolor: '#2f4553', mb: 3 }} />
                        <Typography color="white" fontWeight="bold" sx={{ mb: 1 }}>Reset All Game Overrides</Typography>
                        <Typography color="#99a4b0" variant="caption" sx={{ mb: 2, display: 'block' }}>
                            Set all games back to random outcomes
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => GAMES.forEach(game => setOverride(game, null))}
                            sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 'bold' }}
                        >
                            🔄 Reset All to Random
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default AdminPanel;
