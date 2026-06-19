import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { store } from 'store/store';
import { Provider as ReduxProvider } from 'react-redux';
import i18n from 'locales/i18n';
import { I18nextProvider } from 'react-i18next';
import { LocalizationProvider } from 'locales';
import SignModal from 'pages/sign-modal';
import ExploreModal from 'pages/explore';
import LanguageModal from 'pages/settings/modal/language-modal';
import ScrollToTop from 'components/ScrollToTop';
import { SettingsProvider } from 'components/settings';
import { SnackbarProvider } from 'components/snackbar';
import AuthProvider from 'context/auth/auth-provider';
import { AuthConsumer } from 'context/auth/auth-consumer';
import SocketProvider from 'context/socket/socket-provider';
import ThemeProvider from 'theme';
import Router from 'routes/sections';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FreeSpinDialog } from 'pages/settings/modal/spin-modal';
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

const SplashScreen = ({ onDone }: { onDone: () => void }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(onDone, 600);
        }, 2800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                bgcolor: '#0a1622',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: fadeOut ? 0 : 1,
                transition: 'opacity 0.6s ease',
            }}
        >
            {/* Outer glow ring — pulses like a heartbeat */}
            <Box
                sx={{
                    position: 'absolute',
                    width: 260,
                    height: 260,
                    borderRadius: '50%',
                    animation: 'ringPulse 1.2s ease-in-out infinite',
                    '@keyframes ringPulse': {
                        '0%, 100%': {
                            boxShadow: '0 0 0 0 rgba(0,231,1,0)',
                            transform: 'scale(0.95)'
                        },
                        '50%': {
                            boxShadow: '0 0 60px 30px rgba(0,231,1,0.15)',
                            transform: 'scale(1.05)'
                        }
                    }
                }}
            />

            {/* Logo */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    transform: 'skewX(-8deg)',
                    animation: 'logoBeat 1.2s ease-in-out infinite',
                    '@keyframes logoBeat': {
                        '0%, 100%': {
                            filter: 'drop-shadow(0 0 6px rgba(0,231,1,0.3))',
                            opacity: 0.7
                        },
                        '50%': {
                            filter: 'drop-shadow(0 0 40px rgba(0,231,1,1)) drop-shadow(0 0 80px rgba(0,231,1,0.5))',
                            opacity: 1
                        }
                    }
                }}
            >
                <Typography
                    sx={{
                        color: '#00e701',
                        fontWeight: 900,
                        fontSize: '3.2rem',
                        lineHeight: 1
                    }}
                >
                    $
                </Typography>
                <Typography
                    sx={{
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: '2.4rem',
                        letterSpacing: 3,
                        lineHeight: 1
                    }}
                >
                    FORETELL
                </Typography>
            </Box>

            {/* Tagline — fades in slowly */}
            <Typography
                sx={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.7rem',
                    letterSpacing: 5,
                    textTransform: 'uppercase',
                    mt: 2,
                    fontWeight: 500,
                    animation: 'fadeInUp 1s ease forwards',
                    '@keyframes fadeInUp': {
                        from: { opacity: 0, transform: 'translateY(8px)' },
                        to: { opacity: 1, transform: 'translateY(0)' }
                    }
                }}
            >
                Bet Smart. Win Big.
            </Typography>
        </Box>
    );
};

const App = () => {
    const [showSplash, setShowSplash] = useState(true);

    return (
        <ReduxProvider store={store}>
            <AuthProvider>
                <SocketProvider>
                    <HelmetProvider>
                        <SettingsProvider
                            defaultSettings={{
                                themeMode: 'dark',
                                themeDirection: 'ltr',
                                themeContrast: 'default',
                                themeLayout: 'vertical',
                                themeColorPresets: 'default',
                                themeStretch: false
                            }}
                        >
                            <ThemeProvider>
                                <SnackbarProvider>
                                    {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
                                    <AuthConsumer>
                                        <BrowserRouter>
                                            <I18nextProvider i18n={i18n}>
                                                <LocalizationProvider>
                                                    <Router />
                                                    <ScrollToTop />
                                                    <ExploreModal />
                                                    <SignModal />
                                                    <LanguageModal />
                                                    <FreeSpinDialog />
                                                </LocalizationProvider>
                                            </I18nextProvider>
                                        </BrowserRouter>
                                    </AuthConsumer>
                                </SnackbarProvider>
                            </ThemeProvider>
                        </SettingsProvider>
                    </HelmetProvider>
                </SocketProvider>
            </AuthProvider>
        </ReduxProvider>
    );
};

export default App;
