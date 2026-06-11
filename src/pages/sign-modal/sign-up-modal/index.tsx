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
  { _id: 'NGN', name: '🇳 Nigerian Naira (NGN)' },
  { _id: 'USD', name: '🇺🇸 US Dollar (USD)' },
  { _id: 'EUR', name: '🇪 Euro (EUR)' },
  { _id: 'GBP', name: '🇬🇧 British Pound (GBP)' },
  { _id: 'KES', name: '🇰🇪 Kenyan Shilling (KES)' },
  { _id: 'ZAR', name: '🇿🇦 South African Rand (ZAR)' },
  { _id: 'UGX', name: '🇺🇬 Ugandan Shilling (UGX)' },
  { _id: 'TZS', name: '🇹🇿 Tanzanian Shilling (TZS)' },
  { _id: 'XOF', name: '🌍 West African CFA (XOF)' },
  { _id: 'XAF', name: '🌍 Central African CFA (XAF)' },
  { _id: 'EGP', name: '🇪🇬 Egyptian Pound (EGP)' },
  { _id: 'MAD', name: '🇲🇦 Moroccan Dirham (MAD)' },
  { _id: 'INR', name: '🇮🇳 Indian Rupee (INR)' },
  { _id: 'PKR', name: '🇵 Pakistani Rupee (PKR)' },
  { _id: 'BDT', name: '🇧🇩 Bangladeshi Taka (BDT)' },
  { _id: 'CAD', name: '🇨🇦 Canadian Dollar (CAD)' },
  { _id: 'AUD', name: '🇦🇺 Australian Dollar (AUD)' },
  { _id: 'AED', name: '🇦🇪 UAE Dirham (AED)' },
  { _id: 'SAR', name: '🇸🇦 Saudi Riyal (SAR)' },
  { _id: 'BRL', name: '🇧🇷 Brazilian Real (BRL)' },
  { _id: 'MXN', name: '🇲🇽 Mexican Peso (MXN)' },
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
        email: Yup.string().email().required(t('auth.emailPhoneRequired')),
        username: Yup.string().required(t('auth.usernameRequired')).min(4).max(15),
        password: Yup.string().required(t('auth.passwordRequired')),
        currencyId: Yup.string().required(t('auth.currencyRequired')),
        agreeTerms: Yup.boolean().oneOf([true], t('auth.aggrementRequired')).required(t('auth.aggrementRequired'))
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

    const onSubmit = async (data: any) => {
        try {
            const inviteCode = localStorage.getItem('betthrob-r');
            const registerData = {
                email: data.email,
                username: data.username,
                password: data.password,
                currencyId: data.currencyId,
                inviteCode: inviteCode || ''
            };
            await register(registerData);
            localStorage.removeItem('betthrob-r');
            enqueueSnackbar('Successfully registered! Please login');
            onToggleModal('SIGNIN');
        } catch (error: any) {
            enqueueSnackbar(
                typeof error === 'string' ? error : error.message || 'Something went wrong! Please try again',
                { variant: 'error' }
            );
        }
    };

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues]);

    return (
        <Stack sx={{ position: { sm: 'relative' }, height: '100%', justifyContent: 'space-between', pb: 3 }}>
            <Stack direction="column" sx={{ p: { xs: '0px 14px', sm: '20px 24px' }, gap: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: '1.75rem' }}>
                        {t('auth.signUp')}
                    </Typography>
                    <CloseButton
                        sx={{ top: { xs: 15, sm: 'auto' }, right: { xs: 15, sm: 'auto' }, position: { xs: 'absolute', sm: 'relative' } }}
                        onClick={() => onToggleModal('')}
                    >
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </CloseButton>
                </Stack>

                <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        <RHFTextField size="small" name="email" placeholder={t('auth.emailPhone')} type="email" />
                        <RHFTextField size="small" name="username" placeholder={t('auth.username')} type="text" />
                        <RHFTextField
                            size="small"
                            name="password"
                            placeholder={t('auth.password')}
                            type={showPassword ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ mr: '0px', color: '#637381' }}>
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                )
                            }}
                        />

                        <RHFSelect name="currencyId" placeholder={t('auth.selectCurrency')}>
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
                                    {t('auth.agreeTerms')}
                                </Typography>
                            }
                        />

                        <ColorButton
                            loading={isSubmitting}
                            type="submit"
                            sx={{ width: '100%', height: '2.5rem', fontSize: 14, fontWeight: 600 }}
                        >
                            {t('auth.signUp')}
                        </ColorButton>

                        <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 600 }}>
                            {t('auth.haveAccount')}{' '}
                            <Typography
                                component="span"
                                variant="inherit"
                                sx={{ color: 'primary.main', cursor: 'pointer' }}
                                onClick={() => onToggleModal('SIGNIN')}
                            >
                                {t('auth.signIn')}
                            </Typography>
                        </Typography>
                    </Stack>
                </FormProvider>
            </Stack>
        </Stack>
    );
};

export default SignUpModal;
