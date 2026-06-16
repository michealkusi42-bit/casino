// @mui
import { Box } from '@mui/material';
// mock
import { _gameProviders, _games, _liveSports, _upcomingLotteryDraw } from '_mock';
// components
import Banner from 'components/banner';
import PlayerGames from 'components/player-games';
// swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
//
import GameLink from './game-link';
import DashTable from '../dash-table';
import PaymentSection from './payment-section';
import { OfflineGames } from './offline-games';

const Home = () => {
    return (
        <Box sx={{ overflowX: 'hidden' }}>
            <Banner />

            <GameLink />

            <PlayerGames viewCount={6} />
            <OfflineGames categoryName="Foretell Games" viewCount={8} />
            <PaymentSection />
            <DashTable />
        </Box>
    );
};

export default Home;
