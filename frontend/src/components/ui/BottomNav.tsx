import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Gamepad2, Trophy, User } from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',          icon: <Home className="w-[22px] h-[22px]" />,  label: 'Hub',   exact: true },
  { to: '/play',      icon: <Gamepad2 className="w-[22px] h-[22px]" />,  label: 'Engines' },
  { to: '/leaderboard', icon: <Trophy className="w-[22px] h-[22px]" />, label: 'Ranks' },
  { to: '/profile',   icon: <User className="w-[22px] h-[22px]" />,  label: 'Profile' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav lg:hidden" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-1 no-tap-highlight relative px-4 py-2"
          >
            {/* Soft background glow on active */}
            {isActive && (
              <motion.div
                layoutId="nav-bg"
                className="absolute inset-0 bg-white/5 rounded-2xl -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            
            {isActive && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-primary rounded-b-full shadow-[0_0_12px_rgba(93,61,232,0.8)]"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            <span
              className={`transition-all duration-300 ${
                isActive ? 'text-white' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] font-display font-bold tracking-widest uppercase transition-colors ${
                isActive ? 'text-primary-light' : 'text-text-muted'
              }`}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};
