export const SITE = {
  name: 'Bohdan Domashenko',
  description:
    'Thoughts and notes on whatever I find important. Mostly engineering and AI.',
  url: 'https://bohdandomashenko.github.io',
};

export type NavKey = 'writing' | 'interesting' | 'about';

export const NAV: { key: NavKey; label: string; href: string }[] = [
  { key: 'writing', label: 'Writing', href: '/' },
  { key: 'interesting', label: 'Interesting', href: '/interesting/' },
  { key: 'about', label: 'About', href: '/about/' },
];

export const LINKS = {
  email: { label: 'Email', href: 'mailto:bogdandomashenko11@gmail.com' },
  github: { label: 'GitHub', href: '#' },
  linkedin: { label: 'LinkedIn', href: '#' },
  upwork: { label: 'Upwork', href: '#' },
  rss: { label: 'RSS', href: '/rss.xml' },
};

/** Swap this path when you drop in a real photo (e.g. '/avatar.jpg'). */
export const AVATAR = '/avatar.svg';
