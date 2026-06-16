import { useEffect } from 'react';
import { useDispatch } from 'store/store';
import { balanceAction } from 'store/slices/balance';
import { getUserBalance } from 'api';

const useAutoBalance = () => {
    const dispatch = useDispatch();

    const fetchBalance = async () => {
        try {
            const data = await getUserBalance();
            if (data) {
                dispatch(balanceAction({
                    amount: data.amount ?? 0,
                    bonus: data.bonus ?? 0,
                    pending: data.pending ?? 0,
                    turnover: data.turnover ?? 0,
                    withdrawable: data.withdrawable ?? 0,
                    currency: data.currency ?? 'GHS',
                    icon: data.icon ?? ''
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
