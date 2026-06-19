import * as Yup from 'yup';
import { useTranslate } from 'locales';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, IconButton, MenuItem, Stack, Typography, TextField, CircularProgress } from '@mui/material';
import ColorButton from 'components/ColorButton';
import { RHFSelect } from 'components/hook-form';
import { useSnackbar } from 'components/snackbar';
import FormProvider from 'components/hook-form/form-provider';
import RHFTextField from 'components/hook-form/rhf-text-field';
import { RHFCheckbox } from 'components/hook-form/rhf-checkbox';
import { useSettingsContext } from 'components/settings';
import { useAuth } from 'hooks/use-auth-context';
import axios from 'utils/axios';
import { CloseButton } from '../component';

const CURRENCIES = [
  { _id: 'GHS', name: '🇬🇭 Ghana Cedis (GHS)' },
  { _id: 'NGN', name: '🇳🇬 Nigerian Naira (NGN)' },
  { _id: 'USD', name: '🇺🇸 US Dollar (USD)' },
  { _id: 'EUR', name: '🇪🇺 Euro (EUR)' },
  { _id: 'GBP', name: '🇬🇧 British Pound (GBP)' },
  { _id: 'KES', name: '🇰🇪 Kenyan Shilling (KES)' },
  { _id: 'ZAR', name: '🇿🇦 South African Rand (ZAR)' },
  { _id: 'UGX', name: '🇺🇬 Ugandan Shilling (UGX)' },
  { _id: 'TZS', name: '🇹🇿 Tanzanian Shilling (TZS)' },
  { _id: 'XOF', name: '🌍 West African CFA (XOF)' },
  { _id: 'BTC', name: '₿ Bitcoin (BTC)' },
  { _id: 'ETH', name: 'Ξ Ethereum (ETH)' },
  { _id: 'USDT', name: '₮ Tether (USDT)' },
];

// Steps: 1 = fill form, 2 = verify OTP, 3 = success
type Step = 1 | 2 | 3;

type FormValuesProps = {
    email: string;
    username: string;
    password: string;
    currencyId: string;
    agreeTerms: boolean;
};

const SignUpModal = () => {
    const { register } = useAuth();
    const { t } = useTranslate();
    const { enqueueSnackbar } = useSnackbar();
    const { onToggleModal } = useSettingsContext();
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<Step>(1);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [formData, setFormData] = useState<any>(null);

    const RegisterSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Email is required'),
        username: Yup.string().required('Username is required').min(4).max(15),
        password: Yup.string().required('Password is required').min(6),
        currencyId: Yup.string().required('Currency is required'),
        agreeTerms: Yup.boolean().oneOf([true], 'You must agree to terms').required()
    });

    const defaultValues = useMemo(() => ({
        email: '',
        username: '',
        password: '',
        currencyId: 'GHS',
        agreeTerms: false
    }), []);

    const methods = useForm<FormValuesProps>({
        resolver: yupResolver(RegisterSchema),
        defaultValues
    });

    const { reset, handleSubmit, getValues, formState: { isSubmitting } } = methods;

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Step 1: Send OTP
    const handleSendOTP = async (data: FormValuesProps) => {
        try {
            setOtpLoading(true);
            setFormData(data);
            await axios.post('/api/auth/send-otp', { email: data.email });
            setStep(2);
            setCountdown(60);
            enqueueSnackbar(`Verification code sent to ${data.email}`, { variant: 'success' });
        } catch (error: any) {
            enqueueSnackbar(
                error?.response?.data?.error || 'Failed to send OTP. Try again.',
                { variant: 'error' }
            );
        } finally {
            setOtpLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            enqueueSnackbar('Please enter the 6-digit code', { variant: 'error' });
            return;
        }
        try {
            setVerifyLoading(true);
            await axios.post('/api/auth/verify-otp', { email: formData.email, otp });
            setEmailVerified(true);
            // Now register
            const inviteCode = localStorage.getItem('betthrob-r');
            await register({
                email: formData.email,
                username: formData.username,
                password: formData.password,
                currencyId: formData.currencyId,
                inviteCode: inviteCode || ''
            });
            localStorage.removeItem('betthrob-r');
            setStep(3);
        } catch (error: any) {
            enqueueSnackbar(
                error?.response?.data?.error || 'Invalid code. Please try again.',
                { variant: 'error' }
            );
        } finally {
            setVerifyLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        if (countdown > 0) return;
        try {
            setOtpLoading(true);
            await axios.post('/api/auth/send-otp', { email: formData.email });
            setCountdown(60);
            setOtp('');
            enqueueSnackbar('New code sent!', { variant: 'success' });
        } catch (error: any) {
            enqueueSnackbar('Failed to resend. Try again.', { variant: 'error' });
        } finally {
            setOtpLoading(false);
        }
    };

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues]);

    return (
        <Stack sx={{ position: { sm: 'relative' }, height: '100%', justifyContent: 'space-between', pb: 3 }}>
            <Stack direction="column" sx={{ p: { xs: '0px 14px', sm: '20px 24px' }, gap: 2 }}>

                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: '1.75rem' }}>
                        {step === 1 ? 'Create Account' : step === 2 ? 'Verify Email' : 'Welcome! 🎉'}
                    </Typography>
                    <CloseButton
                        sx={{ top: { xs: 15, sm: 'auto' }, right: { xs: 15, sm: 'auto' }, position: { xs: 'absolute', sm: 'relative' } }}
                        onClick={() => onToggleModal('')}
                    >
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </CloseButton>
                </Stack>

                {/* Step indicator */}
                <Stack direction="row" spacing={1} alignItems="center">
                    {[1, 2, 3].map((s) => (
                        <Box
                            key={s}
                            sx={{
                                height: 4,
                                flex: 1,
                                borderRadius: 2,
                                bgcolor: step >= s ? '#00e701' : 'background.layer3',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </Stack>

                {/* STEP 1: Registration Form */}
                {step === 1 && (
                    <FormProvider methods={methods} onSubmit={handleSubmit(handleSendOTP)}>
                        <Stack spacing={2}>
                            <RHFTextField
                                size="small"
                                name="email"
                                placeholder="Email address"
                                type="email"
                            />
                            <RHFTextField
                                size="small"
                                name="username"
                                placeholder="Username"
                                type="text"
                            />
                            <RHFTextField
                                size="small"
                                name="password"
                                placeholder="Password (min 6 characters)"
                                type={showPassword ? 'text' : 'password'}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ mr: '0px', color: '#637381' }}>
                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    )
                                }}
                            />

                            <RHFSelect name="currencyId" placeholder="Select Currency">
                                {CURRENCIES.map((currency) => (
                                    <MenuItem key={currency._id} value={currency._id}>
                                        {currency.name}
                                    </MenuItem>
                                ))}
                            </RHFSelect>

                            <RHFCheckbox
                                name="agreeTerms"
                                label={
                                    <Typography sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 600 }}>
                                        I agree to the Terms & Conditions
                                    </Typography>
                                }
                            />

                            <ColorButton
                                loading={otpLoading || isSubmitting}
                                type="submit"
                                sx={{ width: '100%', height: '2.5rem', fontSize: 14, fontWeight: 600 }}
                            >
                                Continue →
                            </ColorButton>

                            <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                                Already have an account?{' '}
                                <Typography
                                    component="span"
                                    variant="inherit"
                                    sx={{ color: 'primary.main', cursor: 'pointer' }}
                                    onClick={() => onToggleModal('SIGNIN')}
                                >
                                    Sign In
                                </Typography>
                            </Typography>
                        </Stack>
                    </FormProvider>
                )}

                {/* STEP 2: OTP Verification */}
                {step === 2 && (
                    <Stack spacing={3}>
                        {/* Email icon */}
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Box
                                sx={{
                                    width: 70, height: 70,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(0,186,230,0.15)',
                                    border: '2px solid #00BAE6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                    animation: 'pulse 2s infinite',
                                    '@keyframes pulse': {
                                        '0%': { boxShadow: '0 0 0 0 rgba(0,186,230,0.4)' },
                                        '70%': { boxShadow: '0 0 0 10px rgba(0,186,230,0)' },
                                        '100%': { boxShadow: '0 0 0 0 rgba(0,186,230,0)' },
                                    }
                                }}
                            >
                                <EmailIcon sx={{ fontSize: 32, color: '#00BAE6' }} />
                            </Box>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                                Check your email!
                            </Typography>
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mt: 0.5 }}>
                                We sent a 6-digit code to
                            </Typography>
                            <Typography sx={{ color: '#00BAE6', fontWeight: 700, fontSize: '0.9rem' }}>
                                {formData?.email}
                            </Typography>
                        </Box>

                        {/* OTP Input */}
                        <TextField
                            fullWidth
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit code"
                            inputProps={{
                                maxLength: 6,
                                style: {
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    letterSpacing: '0.5rem',
                                    fontWeight: 700,
                                    color: '#fff',
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: '#213743',
                                    borderRadius: 2,
                                    '& fieldset': { borderColor: otp.length === 6 ? '#00e701' : '#2f4553' },
                                    '&:hover fieldset': { borderColor: '#00BAE6' },
                                    '&.Mui-focused fieldset': { borderColor: '#00BAE6' },
                                }
                            }}
                        />

                        <ColorButton
                            onClick={handleVerifyOTP}
                            loading={verifyLoading}
                            sx={{ width: '100%', height: '2.5rem', fontSize: 14, fontWeight: 700 }}
                        >
                            Verify & Create Account
                        </ColorButton>

                        {/* Resend */}
                        <Stack direction="row" justifyContent="center" spacing={0.5}>
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                Didn't receive it?
                            </Typography>
                            <Typography
                                onClick={handleResendOTP}
                                sx={{
                                    color: countdown > 0 ? '#64748b' : '#00BAE6',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: countdown > 0 ? 'default' : 'pointer',
                                    '&:hover': countdown > 0 ? {} : { textDecoration: 'underline' }
                                }}
                            >
                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                            </Typography>
                        </Stack>

                        <Typography
                            onClick={() => setStep(1)}
                            sx={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', cursor: 'pointer', '&:hover': { color: '#fff' } }}
                        >
                            ← Back to registration
                        </Typography>
                    </Stack>
                )}

                {/* STEP 3: Success */}
                {step === 3 && (
                    <Stack spacing={3} alignItems="center" sx={{ py: 3 }}>
                        <Box
                            sx={{
                                width: 80, height: 80,
                                borderRadius: '50%',
                                bgcolor: 'rgba(0,231,1,0.15)',
                                border: '2px solid #00e701',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                animation: 'scaleIn 0.5s ease',
                                '@keyframes scaleIn': {
                                    from: { transform: 'scale(0)', opacity: 0 },
                                    to: { transform: 'scale(1)', opacity: 1 },
                                }
                            }}
                        >
                            <CheckCircleIcon sx={{ fontSize: 40, color: '#00e701' }} />
                        </Box>
                        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', textAlign: 'center' }}>
                            Account Created! 🎉
                        </Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>
                            Welcome to Foretell! Your account is ready.
                        </Typography>
                        <ColorButton
                            onClick={() => onToggleModal('')}
                            sx={{ width: '100%', height: '2.5rem', fontSize: 14, fontWeight: 700 }}
                        >
                            Start Playing! 🎮
                        </ColorButton>
                    </Stack>
                )}
            </Stack>
        </Stack>
    );
};

export default SignUpModal;
