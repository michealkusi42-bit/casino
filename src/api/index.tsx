import axiosInstance from 'utils/axios';

export const getSlotProviders = async (gameType: string): Promise<string[]> => {
    try {
        const res = await axiosInstance.get('/api/casino/providers', {
            params: { category: gameType }
        });
        return res.data || [];
    } catch {
        return [];
    }
};

export const getSlotGames = async ({
    currentPage,
    perPage,
    categories,
    provider
}: {
    currentPage: number;
    perPage: number;
    categories?: string;
    provider?: string[];
}): Promise<{ data: any[]; count: number }> => {
    try {
        const res = await axiosInstance.get('/api/casino/games', {
            params: {
                page: currentPage,
                limit: perPage,
                category: categories,
                provider: provider ? provider.join(',') : undefined
            }
        });
        return {
            data: res.data?.data || res.data || [],
            count: res.data?.count || res.data?.total || 0
        };
    } catch {
        return { data: [], count: 0 };
    }
};

export { casinoApi } from './casino.api';

export const getAgCategory = async (): Promise<any[]> => {
    try {
        const res = await axiosInstance.get('/api/casino/categories');
        return res.data || [];
    } catch {
        return [];
    }
};

export const getProviderList = async (): Promise<any[]> => {
    try {
        const res = await axiosInstance.get('/api/casino/providers');
        return res.data || [];
    } catch {
        return [];
    }
};

export const getProviderGameList = async (params: any): Promise<any> => {
    try {
        const res = await axiosInstance.get('/api/casino/provider-games', { params });
        return res.data || { data: [], count: 0 };
    } catch {
        return { data: [], count: 0 };
    }
};
