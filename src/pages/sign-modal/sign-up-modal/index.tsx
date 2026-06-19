import * as Yup from 'yup';
import { useTranslate } from 'locales';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, MenuItem, Stack, Typography } from '@mui/material';
import ColorButton from 'components/ColorButton';
import { RHFSelect } from 'components/hook-form';
import { useSnackbar } from 'components/snackbar';
import FormProvider from 'components/hook-form/form-provider';
import RHFTextField from 'components/hook-form/rhf-text-field';
import { RHFCheckbox } from 'components/hook-form/rhf-checkbox';
import { useSettingsContext } from 'components/settings';
import { useAuth } from 'hooks/use-auth-context';
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

    const { reset, handleSubmit, formState: { isSubmitting } } = methods;

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues]);

    const onSubmit = async (data: FormValuesProps) => {
        try {
            const inviteCode = localStorage.getItem('betthrob-r');
            await register({
                email: data.email,
                username: data.username,
                password: data.password,
                currencyId: data.currencyId,
                inviteCode: inviteCode || ''
            });
            localStorage.removeItem('betthrob-r');
            enqueueSnackbar('Account created! Welcome to Foretell 🎉', { variant: 'success' });
            onToggleModal('');
        } catch (error: any) {
            enqueueSnackbar(
                error?.response?.data?.message || error?.message || 'Registration failed. Please try again.',
                { variant: 'error' }
            );
        }
    };

    return (
        <Stack sx={{ position: { sm: 'relative' }, height: '100%', justifyContent: 'space-between', pb: 3 }}>
            <Stack direction="column" sx={{ p: { xs: '0px 14px', sm: '20px 24px' }, gap: 2 }}>

                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: '1.75rem' }}>
                        Create Account
                    </Typography>
                    <CloseButton
                        sx={{ top: { xs: 15, sm: 'auto' }, right: { xs: 15, sm: 'auto' }, position: { xs: 'absolute', sm: 'relative' } }}
                        onClick={() => onToggleModal('')}
                    >
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </CloseButton>
                </Stack>

                {/* Form */}
                <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
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
                            loading={isSubmitting}
                            type="submit"
                            sx={{ width: '100%', height: '2.5rem', fontSize: 14, fontWeight: 600 }}
                        >
                            Create Account
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
            </Stack>
        </Stack>
    );
};

export default SignUpModal;
