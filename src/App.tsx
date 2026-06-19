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
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Animate progress bar from 0 to 100 over 2 seconds
        const start = Date.now();
        const duration = 2000;
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const p = Math.min((elapsed / duration) * 100, 100);
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                // Start fade out
                setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(onDone, 500);
                }, 300);
            }
        }, 16);
        return () => clearInterval(interval);
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
                transition: 'opacity 0.5s ease',
                backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,231,1,0.07) 0%, transparent 70%)'
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    transform: 'skewX(-8deg)',
                    animation: 'logoPulse 1.5s ease-in-out infinite',
                    '@keyframes logoPulse': {
                        '0%, 100%': {
                            filter: 'drop-shadow(0 0 12px rgba(0,231,1,0.5))'
                        },
                        '50%': {
                            filter: 'drop-shadow(0 0 28px rgba(0,231,1,0.9))'
                        }
                    }
                }}
            >
                <Typography
                    sx={{
                        color: '#00e701',
                        fontWeight: 900,
                        fontSize: '3rem',
                        lineHeight: 1
                    }}
                >
                    $
                </Typography>
                <Typography
                    sx={{
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: '2.2rem',
                        letterSpacing: 3,
                        lineHeight: 1
                    }}
                >
                    FORETELL
                </Typography>
            </Box>

            {/* Tagline */}
            <Typography
                sx={{
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: '0.75rem',
                    letterSpacing: 4,
                    textTransform: 'uppercase',
                    mt: 1.5,
                    fontWeight: 500
                }}
            >
                Bet Smart. Win Big.
            </Typography>

            {/* Progress bar */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: 'rgba(255,255,255,0.06)'
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #00e701, #00BAE6)',
                        transition: 'width 0.05s linear',
                        boxShadow: '0 0 10px rgba(0,231,1,0.7)'
                    }}
                />
            </Box>
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
