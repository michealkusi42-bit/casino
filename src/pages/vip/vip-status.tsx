import { useMemo } from 'react';
import { useTranslate } from 'locales';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
// store
import { useSelector } from 'store/store';
// types
import { IVip } from 'types/site';

const StaticLinearProgress = styled(LinearProgress)(({ theme }) => ({
   '& .MuiLinearProgress-bar': {
       transition: 'none',
       animation: 'none'
   }
}));

const StyledContainer = styled(Box)(({ theme }) => ({
   display: 'flex',
   gap: theme.spacing(2),
   overflow: 'hidden',
   flexWrap: 'wrap',
   [theme.breakpoints.up('sm')]: {
       flexWrap: 'wrap'
   }
}));

const VipCard = styled(Box)(({ theme }) => ({
   position: 'relative',
   display: 'flex',
   flexGrow: 1,
   flexDirection: 'column',
   [theme.breakpoints.up('sm')]: {
       flexBasis: '40rem'
   }
}));

const VipContent = styled(Box)(({ theme }) => ({
   position: 'relative',
   zIndex: 0,
   display: 'flex',
   flexDirection: 'column',
   overflow: 'hidden',
   borderRadius: (theme.shape.borderRadius as number) * 3,
   backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
   boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
   [theme.breakpoints.up('sm')]: {
       minHeight: '14rem',
       paddingBottom: 0
   }
}));

const VipBadge = styled(Box)(({ theme }) => ({
   position: 'relative',
   zIndex: 1,
   marginRight: theme.spacing(4),
   width: '7rem',
   height: '7rem',
   flexShrink: 0,
   [theme.breakpoints.up('sm')]: {
       marginLeft: theme.spacing(5),
       width: '11rem',
       height: '11rem'
   }
}));

const VipProgress = styled(Box)(({ theme }) => ({
   display: 'flex',
   flexDirection: 'column',
   gap: theme.spacing(1.5),
   borderRadius: theme.shape.borderRadius,
   padding: theme.spacing(2),
   backgroundImage:
       theme.palette.mode === 'dark'
           ? 'linear-gradient(0deg, rgba(58, 65, 66, 0.5) 5%, rgba(110, 110, 110, 0.5) 117.33%)'
           : 'linear-gradient(0deg, rgba(255, 255, 255, 0.5) 5%, rgba(255, 255, 255, 0.5) 117.33%)',
   [theme.breakpoints.up('sm')]: {
       padding: theme.spacing(2)
   }
}));

function getVipEmoji(levelName: string) {
   const name = (levelName || '').toLowerCase();
   if (name.includes('diamond')) return '💎';
   if (name.includes('platinum')) return '🏆';
   if (name.includes('gold')) return '🥇';
   if (name.includes('silver')) return '🥈';
   if (name.includes('bronze')) return '🥉';
   return '⭐';
}

function getVipColor(levelName: string) {
   const name = (levelName || '').toLowerCase();
   if (name.includes('diamond')) return '#B9F2FF';
   if (name.includes('platinum')) return '#E5E4E2';
   if (name.includes('gold')) return '#FFD700';
   if (name.includes('silver')) return '#C0C0C0';
   if (name.includes('bronze')) return '#CD7F32';
   return '#22E9A7';
}

const VipStatus = ({ vipData }: { vipData: IVip[] }) => {
   const { t } = useTranslate();
   const balance = useSelector((store) => store.balance);

   const { progress, currentVip, nextVip } = useMemo(() => {
       const sorted = vipData.sort((a, b) => a.xp - b.xp);

       let currentVip = null;
       let nextVip = null;
       let progress = 0;
       for (let i = 0; i < sorted.length; i++) {
           if (sorted[i].xp <= balance.turnover) {
               currentVip = sorted[i];
           } else {
               nextVip = sorted[i];
               break;
           }
       }

       if (currentVip && nextVip) {
           progress = ((balance.turnover - currentVip.xp) / (nextVip.xp - currentVip.xp)) * 100;
       }
       return { progress, currentVip, nextVip };
   }, [balance, vipData]);

   const levelName = currentVip?.levelName || 'VIP 0';
   const vipColor = getVipColor(levelName);
   const vipEmoji = getVipEmoji(levelName);

   return (
       <StyledContainer>
           <VipCard>
               <VipContent sx={{ pb: { xs: 1, sm: 2 } }}>
                   <Box sx={{
                       position: 'absolute',
                       top: '-50%',
                       right: '-10%',
                       width: '300px',
                       height: '300px',
                       borderRadius: '50%',
                       background: `radial-gradient(circle, ${vipColor}22 0%, transparent 70%)`,
                       pointerEvents: 'none'
                   }} />

                   <Box sx={{ display: 'flex', width: '100%', gap: 2, pl: { sm: 3 } }}>
                       <Box
                           sx={{
                               display: 'flex',
                               flexGrow: 1,
                               flexDirection: 'column',
                               gap: 2,
                               pl: { xs: 1.5, sm: 3 },
                               pr: 0,
                               pt: { xs: 1.5, sm: 3 },
                               order: { sm: 2 }
                           }}
                       >
                           <Typography
                               sx={{
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: 1,
                                   fontSize: { xs: 20, sm: 30 },
                                   fontWeight: 800,
                                   textTransform: 'uppercase',
                                   color: vipColor,
                                   textShadow: `0 0 20px ${vipColor}66`
                               }}
                           >
                               {levelName}
                           </Typography>

                           <VipProgress>
                               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                   <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                       {`${(balance.turnover || 0).toFixed()} XP`}
                                   </Typography>
                                   <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                       {`${nextVip?.xp || 0} XP`}
                                   </Typography>
                               </Box>

                               <Box sx={{ width: '100%', position: 'relative' }}>
                                   <StaticLinearProgress
                                       variant="determinate"
                                       value={progress}
                                       sx={{
                                           height: { xs: 8, sm: 12 },
                                           borderRadius: 2,
                                           backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                           '& .MuiLinearProgress-bar': {
                                               backgroundImage: `linear-gradient(to right, ${vipColor}99, ${vipColor})`
                                           }
                                       }}
                                   />
                                   <Box
                                       sx={{
                                           position: 'absolute',
                                           left: `${progress}%`,
                                           top: '50%',
                                           transform: 'translate(-16px, -50%)',
                                           width: 24,
                                           height: 24
                                       }}
                                   >
                                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={vipColor} width="100%" height="100%">
                                           <circle opacity="0.1" cx="12" cy="12" r="12" />
                                           <circle opacity="0.25" cx="12" cy="12" r="7" />
                                           <circle cx="12" cy="12" r="4" />
                                       </svg>
                                   </Box>
                               </Box>

                               <Typography variant="caption" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                                   {`${((nextVip?.xp || balance.turnover) - balance.turnover || 0).toFixed()}XP until `}
                                   <Box component="span" sx={{ textTransform: 'uppercase', color: vipColor }}>
                                       {nextVip?.levelName || 'VIP 0'}
                                   </Box>
                               </Typography>
                           </VipProgress>
                       </Box>

                       <VipBadge>
                           <Box sx={{
                               width: '100%',
                               height: '100%',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               position: 'absolute',
                               top: '15%',
                               fontSize: { xs: '4rem', sm: '6rem' },
                               filter: `drop-shadow(0 0 20px ${vipColor})`
                           }}>
                               {currentVip?.icon ? (
                                   <Box
                                       component="img"
                                       src={currentVip.icon}
                                       onError={(e: any) => { e.target.style.display = 'none'; }}
                                       sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                   />
                               ) : (
                                   <span>{vipEmoji}</span>
                               )}
                           </Box>
                       </VipBadge>
                   </Box>

                   <Box sx={{ position: 'absolute', right: 16, top: 16 }}>
                       <Button
                           variant="contained"
                           size="small"
                           sx={{
                               backgroundColor: 'rgba(255, 255, 255, 0.05)',
                               border: `1px solid ${vipColor}33`,
                               px: 1,
                               py: 1.5,
                               fontSize: '0.75rem',
                               fontWeight: 800,
                               color: vipColor,
                               textTransform: 'none',
                               '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                           }}
                       >
                           {t('vip.viewLevelUpDetail')}
                       </Button>
                   </Box>
               </VipContent>
           </VipCard>
       </StyledContainer>
   );
};

export default VipStatus;
