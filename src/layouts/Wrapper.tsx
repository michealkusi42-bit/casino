import { Outlet, useLocation } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// config
import Footer from 'components/footer';
import { MAX_DRAWER_WIDTH, MIN_DRAWER_WIDTH } from 'config/constant';
import { useResponsive } from 'hooks/use-responsive';

const Wrapper = ({ open }: { open: boolean }) => {
    const isDesktop = useResponsive('up', 'md');
    const isMobile = useResponsive('between', 'md');
    const isDownSM = useResponsive('down', 'sm');
    const { pathname } = useLocation();

    // Deposit needs to fill the whole screen — skip the 1248px cap just for it.
    // Every other page keeps its normal contained width.
    const isFullBleedPage = pathname === '/wallet/deposit';

    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.site',
                ml: open && isDesktop ? `${MAX_DRAWER_WIDTH}px` : isMobile ? 0 : isDownSM ? 0 : `${MIN_DRAWER_WIDTH}px`,
                pb: !isDesktop ? '70px' : 0
            }}
        >
            {isFullBleedPage ? (
                <Box sx={{ pt: { xs: '7.2rem', sm: '4.5rem' }, px: 0 }}>
                    <Outlet />
                </Box>
            ) : (
                <Container sx={{ pt: { xs: '7.2rem', sm: '4.5rem' }, pb: 3, px: '1rem', maxWidth: '1248px !important' }}>
                    <Outlet />
                </Container>
            )}

            <Footer />
        </Box>
    );
};

export default Wrapper;
