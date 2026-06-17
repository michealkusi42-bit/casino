import { Box, Container, Grid, Typography, Stack, Divider } from '@mui/material';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

// ─── Reusable section heading ────────────────────────────────────────────────
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography
        sx={{
            color: '#00BAE6',
            fontWeight: 800,
            fontSize: '0.75rem',
            letterSpacing: 3,
            textTransform: 'uppercase',
            mb: 1.5,
        }}
    >
        {children}
    </Typography>
);

// ─── Value card ───────────────────────────────────────────────────────────────
const ValueCard = ({
    icon, title, body,
}: { icon: React.ReactNode; title: string; body: string }) => (
    <Box
        sx={{
            bgcolor: '#213743',
            borderRadius: 2,
            p: 3,
            height: '100%',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'border-color 0.2s',
            '&:hover': { borderColor: 'rgba(0,186,230,0.4)' },
        }}
    >
        <Box sx={{ color: '#00BAE6', mb: 1.5 }}>{icon}</Box>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', mb: 1 }}>
            {title}
        </Typography>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
            {body}
        </Typography>
    </Box>
);

// ─── Stat block ───────────────────────────────────────────────────────────────
const Stat = ({ value, label }: { value: string; label: string }) => (
    <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '1.6rem', md: '2.2rem' } }}>
            {value}
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mt: 0.5 }}>
            {label}
        </Typography>
    </Box>
);

const About = () => {
    return (
        <Box sx={{ bgcolor: '#1a2c38', minHeight: '100vh', pb: 10 }}>
            {/* ── Hero ── */}
            <Box
                sx={{
                    bgcolor: '#0f212e',
                    pt: { xs: 8, md: 12 },
                    pb: { xs: 6, md: 8 },
                    px: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="md">
                    <Typography sx={{ color: '#00BAE6', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 4, mb: 2 }}>
                        ABOUT FORETELL
                    </Typography>
                    <Typography
                        sx={{
                            color: '#fff',
                            fontWeight: 900,
                            fontSize: { xs: '1.8rem', md: '2.8rem' },
                            lineHeight: 1.15,
                            mb: 3,
                        }}
                    >
                        Built for players who play to win, not just to pass time.
                    </Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.7, maxWidth: 640, mx: 'auto' }}>
                        Foretell started with a simple frustration: most betting platforms feel built for
                        the house, not the player. We set out to build the opposite — fast payouts,
                        transparent odds, and games that respect your time.
                    </Typography>
                </Container>
            </Box>

            {/* ── Stats strip ── */}
            <Container maxWidth="lg" sx={{ mt: { xs: -3, md: -4 }, mb: 8 }}>
                <Box
                    sx={{
                        bgcolor: '#213743',
                        borderRadius: 3,
                        py: { xs: 3, md: 4 },
                        px: { xs: 2, md: 4 },
                        boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6, md: 3 }}><Stat value="11" label="Games live" /></Grid>
                        <Grid size={{ xs: 6, md: 3 }}><Stat value="<60s" label="Avg. withdrawal time" /></Grid>
                        <Grid size={{ xs: 6, md: 3 }}><Stat value="24/7" label="Support coverage" /></Grid>
                        <Grid size={{ xs: 6, md: 3 }}><Stat value="2024" label="Founded" /></Grid>
                    </Grid>
                </Box>
            </Container>

            {/* ── Our story ── */}
            <Container maxWidth="md" sx={{ mb: 10 }}>
                <SectionLabel>Our story</SectionLabel>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, mb: 3 }}>
                    From a small team, a bigger idea
                </Typography>
                <Stack spacing={2.5}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.8 }}>
                        Foretell was founded by a small group of engineers and longtime players who were
                        tired of clunky betting apps that felt like an afterthought. We believed a platform
                        could be both fun and fair — quick to load, easy to trust, and built around the
                        games people actually want to play.
                    </Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.8 }}>
                        What began as a handful of in-house games — Dice, Mines, HiLo — has grown into a
                        full casino and sports platform, but the principle hasn&#x2019;t changed: every
                        feature we ship has to make the player&#x2019;s experience better, not just the
                        platform&#x2019;s numbers.
                    </Typography>
                </Stack>
            </Container>

            {/* ── Values ── */}
            <Container maxWidth="lg" sx={{ mb: 10 }}>
                <SectionLabel>What we stand for</SectionLabel>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, mb: 4 }}>
                    The principles behind every game we build
                </Typography>
                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ValueCard
                            icon={<BoltOutlinedIcon fontSize="large" />}
                            title="Fast, always"
                            body="Deposits land instantly. Withdrawals are processed in minutes, not days. We measure ourselves on how little we make you wait."
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ValueCard
                            icon={<ShieldOutlinedIcon fontSize="large" />}
                            title="Fair by design"
                            body="Every round outcome is generated independently for each game, with results you can see and verify in your bet history."
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ValueCard
                            icon={<VerifiedUserOutlinedIcon fontSize="large" />}
                            title="Your money, protected"
                            body="Your balance and transaction history are yours to see, anytime. No hidden fees on deposits or withdrawals."
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ValueCard
                            icon={<GroupsOutlinedIcon fontSize="large" />}
                            title="Built with players"
                            body="Game odds, new features, and platform changes are shaped by direct player feedback, not guesswork."
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ValueCard
                            icon={<SupportAgentOutlinedIcon fontSize="large" />}
                            title="Real support, real people"
                            body="When something goes wrong, you talk to a person who can actually fix it — not a script."
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ValueCard
                            icon={<FavoriteBorderOutlinedIcon fontSize="large" />}
                            title="Play should stay fun"
                            body="We build tools that help you set limits and stay in control, because the best platform is one you enjoy, not one you regret."
                        />
                    </Grid>
                </Grid>
            </Container>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', maxWidth: 1200, mx: 'auto', mb: 10 }} />

            {/* ── Responsible gambling ── */}
            <Container maxWidth="md" sx={{ mb: 6 }}>
                <SectionLabel>Playing responsibly</SectionLabel>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, mb: 3 }}>
                    Betting should be entertainment, not a way to make money
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.8, mb: 2 }}>
                    Foretell is intended for adults who want to enjoy games of chance as a form of
                    entertainment. Only ever bet what you can afford to lose, and treat any winnings as a
                    bonus rather than an expectation. If betting stops feeling fun, or starts affecting
                    your finances, relationships, or wellbeing, it&#x2019;s time to step back and seek
                    support.
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.8 }}>
                    Foretell is restricted to users 18 years and older. We encourage every player to set
                    personal deposit and time limits, and to take breaks regularly. If you feel your
                    betting is becoming difficult to control, please reach out to a local support service
                    or a trusted person for help.
                </Typography>
            </Container>
        </Box>
    );
};

export default About;
