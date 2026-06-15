import { Suspense, useEffect, useState } from 'react';
import { Dialog } from '@mui/material';
// hooks
import { useResponsive } from 'hooks/use-responsive';
// components
import Header from 'components/header';
import Navbar from 'components/navbar';
import Tabbar from 'components/tabbar';
import MobileNavbar from 'components/navbar/mobile';
import Notification from 'components/notification';
import { LoadingScreen } from 'components/loading-screen';
import { useSettingsContext } from 'components/settings';
import DepositModal from 'components/deposit';
//
import Wrapper from './Wrapper';

const MainLayout = () => {
    const isDesktop = useResponsive('up', 'sm');
    const [navStatus, setNavStatus] = useState(false);
    const [notificationState, setNotificationState] = useState(false);
    const { modal, onToggleModal } = useSettingsContext();

    useEffect(() => {
        if (isDesktop) {
            setNavStatus(true);
        }
    }, [isDesktop]);

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Header
                onHandleNav={() => setNavStatus((pre) => !pre)}
                onHandleNotification={() => setNotificationState(true)}
            />
            {isDesktop ? (
                <Navbar open={navStatus} />
            ) : (
                <MobileNavbar open={navStatus} onClose={() => setNavStatus(false)} />
            )}
            <Wrapper open={navStatus} />
            {!isDesktop && <Tabbar navStatus={navStatus} onHandleNav={() => setNavStatus((pre) => !pre)} />}
            <Notification open={notificationState} onClose={() => setNotificationState(false)} />

            {/* Deposit/Withdraw Modal */}
            <Dialog
                open={modal === 'DEPOSIT'}
                onClose={() => onToggleModal('' as any)}
                maxWidth="sm"
                fullWidth
            >
                <DepositModal />
            </Dialog>
        </Suspense>
    );
};

export default MainLayout;
