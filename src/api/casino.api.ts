import axios from 'utils/axios';

export const casinoApi = {
    getRecommendGames: async () => {
        try {
            const res = await axios.get('/api/casino/recommend');
            return res.data || [];
        } catch {
            return [];
        }
    },
    getRecentBigWin: async () => {
        try {
            const res = await axios.get('/api/casino/recent-big-win');
            return res.data || [];
        } catch {
            return [];
        }
    }
};
