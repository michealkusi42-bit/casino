import Image from 'components/image';

export const tabs = [
    {
        icon: <Image src="/assets/icons/lobby.svg" alt="lobby" width={18} height={18} />,
        value: '',
        label: 'lobby'
    },
    {
        icon: <Image src="/assets/icons/hot-games.svg" alt="hot games" width={18} height={18} />,
        value: 'HOT_GAME',
        label: 'Hot Game'
    },
    {
        icon: <Image src="/assets/icons/live-casino.svg" alt="live casino" width={18} height={18} />,
        value: 'live',
        label: 'Live Casino'
    },
    {
        icon: <Image src="/assets/icons/slots.svg" alt="slots" width={18} height={18} />,
        value: 'slot',
        label: 'Slots'
    },
    {
        icon: <Image src="/assets/icons/hot-games.svg" alt="hot games" width={18} height={18} />,
        value: 'fish',
        label: 'Fishing'
    },
    {
        icon: <Image src="/assets/icons/table-games.svg" alt="table games" width={18} height={18} />,
        value: 'poker',
        label: 'Poker'
    },
    {
        icon: <Image src="/assets/icons/feature-buy-in.svg" alt="feature buy in" width={18} height={18} />,
        value: '',
        label: 'others'
    }
];

export const headerTabs = [
    {
        icon: '/img/header/casino.png',
        label: 'Casino',
        path: '/casino'
    },
    {
        icon: '/img/header/slots.png',
        label: 'Slots',
        path: '/slots'
    },
    {
        icon: '/img/header/racing.png',
        label: 'Racing',
        path: '/racing'
    },
    {
        icon: '/img/header/bitup.png',
        label: 'BitUp Game',
        path: '/bitup'
    }
];

export const sidebarConfig = [
    {
        type: 'button',
        name: 'Bonus',
        image: '/assets/images/bonus-chest.png'
    },
    {
        type: 'row',
        items: [
            { name: 'Quest', icon: '🎯', path: '/quest', color: '#6a0dad' },
            { name: 'Spin', icon: '🎡', path: '/spin', color: '#a020f0' }
        ]
    },
    {
        type: 'banner',
        image: '/assets/images/sidebar-banner.png'
    },
    {
        name: 'Casino',
        type: 'item',
        icon: {
            path: '/assets/icons/icons-1.webp',
            active: '/assets/icons/icons-1.webp',
            x: -96,
            y: 0
        },
        path: '/casino',
        children: [
            {
                name: 'Pick For You',
                icon: { path: '/assets/icons/icons-5.webp', x: -128, y: -224 },
                path: '/pick-for-you'
            },
            {
                name: 'Favorites',
                icon: { path: '/assets/icons/icons-5.webp', x: -194, y: -32 },
                path: '/favorites'
            },
            {
                name: 'Recent',
                icon: { path: '/assets/icons/icons-5.webp', x: -160, y: -192 },
                path: '/recent'
            },
            {
                name: 'Live Casino',
                icon: { path: '/assets/icons/icons-5.webp', x: -160, y: -192 },
                path: '/live-casino'
            },
            {
                name: 'Hot Games',
                icon: { path: '/assets/icons/icons-5.webp', x: -194, y: -32 },
                path: '/hot-games'
            },
            {
                name: 'New Releases',
                icon: { path: '/assets/icons/icons-5.webp', x: -160, y: -192 },
                path: '/new-releases'
            },
            {
                name: 'Feature Buy-In',
                icon: { path: '/assets/icons/icons-5.webp', x: -160, y: -192 },
                path: '/feature-buy-in'
            },
            {
                name: 'Blackjack',
                icon: { path: '/assets/icons/icons-5.webp', x: -160, y: -192 },
                path: '/blackjack'
            },
            {
                name: 'Table Games',
                icon: { path: '/assets/icons/icons-5.webp', x: -256, y: -64 },
                path: '/table-games'
            }
        ]
    },
    {
        name: 'Up & Down',
        type: 'item',
        icon: {
            path: '/assets/icons/icons-1.webp',
            x: -160,
            y: -160
        },
        path: '/up-down'
    }
];

export const casinoMenus = [
    {
        name: 'casino',
        icon: {
            path: '/assets/icons/icons-1.webp',
            active: '/assets/icons/icons-1.webp',
            x: -96,
            y: 0
        },
        path: '/casino',
        children:
