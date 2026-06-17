import axios from 'utils/axios';

export const playCoinFlip = async (betAmount: number, choice: 'heads' | 'tails') => {
    const res = await axios.post('/api/offline-game/coinflip/play', { betAmount, choice });
    return res.data;
};

export const playDice = async (betAmount: number, rollOver: number) => {
    const res = await axios.post('/api/offline-game/dice/play', { betAmount, rollOver });
    return res.data;
};

export const playHiLo = async (betAmount: number, choice: 'higher' | 'lower' | 'skip', currentCardNumber: number) => {
    const res = await axios.post('/api/offline-game/hilo/play', { betAmount, choice, currentCardNumber });
    return res.data;
};

export const playRoulette = async (bets: Record<string, number>) => {
    const res = await axios.post('/api/offline-game/roulette/play', { bets });
    return res.data;
};

export const playUpDown = async (betAmount: number, prediction: 'up' | 'down') => {
    const res = await axios.post('/api/offline-game/updown/play', { betAmount, prediction });
    return res.data;
};

export const playCrash = async (betAmount: number, autoCashout: number) => {
    const res = await axios.post('/api/offline-game/crash/play', { betAmount, autoCashout });
    return res.data;
};

export const playLottery = async (betAmount: number, numbers: number[]) => {
    const res = await axios.post('/api/offline-game/lottery/play', { betAmount, numbers });
    return res.data;
};

export const playRacing = async (betAmount: number, horse: number) => {
    const res = await axios.post('/api/offline-game/racing/play', { betAmount, horse });
    return res.data;
};

export const playBingo = async (betAmount: number, card: number[]) => {
    const res = await axios.post('/api/offline-game/bingo/play', { betAmount, card });
    return res.data;
};

export const startMines = async (betAmount: number, mineCount: number) => {
    const res = await axios.post('/api/offline-game/mines/start', { betAmount, mineCount });
    return res.data;
};

export const clickMinesTile = async (tileIndex: number) => {
    const res = await axios.post('/api/offline-game/mines/click', { tileIndex });
    return res.data;
};

export const cashoutMines = async () => {
    const res = await axios.post('/api/offline-game/mines/cashout');
    return res.data;
};

export const getActiveMinesGame = async () => {
    const res = await axios.get('/api/offline-game/mines/active');
    return res.data;
};

export const getGameHistory = async (gameType: string, limit: number = 5) => {
    const res = await axios.get(`/api/offline-game/${gameType}/history`, { params: { limit } });
    return res.data;
};

export const getAllGameHistory = async (limit: number = 10) => {
    const res = await axios.get('/api/offline-game/history', { params: { limit } });
    return res.data;
};
