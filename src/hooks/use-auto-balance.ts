import { useEffect } from 'react';
import { useDispatch } from 'store/store';
import { balanceAction } from 'store/slices/balance';
import axios from 'utils/axios';

const useAutoBalance = () => {
    const dispatch = useDispatch();

    const fetchBalance = async () => {
        try {
            const res = await axios.get('/api/wallet/balance');
            const data = res.data;
            if (data && data.balance !== undefined) {
                dispatch(balanceAction({
                    amount: data.balance ?? 0,
                    bonus: 0,
                    pending: 0,
                    turnover: 0,
                    withdrawable: data.balance ?? 0,
                    currency: 'GHS',
                    icon: '/assets/icons/ghc.png'
                }));
            }
        } catch (err) {
            // silent fail
        }
    };

    useEffect(() => {
        fetchBalance();
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, []);
};

export default useAutoBalance;
