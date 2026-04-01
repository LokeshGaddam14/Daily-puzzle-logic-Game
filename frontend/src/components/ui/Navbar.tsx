import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, User as UserIcon, LogIn, ChevronDown } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { Avatar } from './Avatar';
import { StreakWidget } from './StreakWidget';

export const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isGuest } = useSelector((s: RootState) => s.auth);
  const { currentStreak } = useSelector((s: RootState) => s.streak);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/auth');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[rgba(3,3,8,0.7)] backdrop-blur-3xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
        
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 no-tap-highlight group">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-primary to-accent p-px relative overflow-hidden shadow-glow">
            <div className="absolute inset-0 bg-bg-primary m-[1px] rounded-[11px] flex items-center justify-center">
               <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-light to-accent text-xl font-display font-black group-hover:scale-110 transition-transform duration-300">L</span>
            </div>
          </div>
          <span className="font-display font-extrabold text-xl text-white hidden sm:block tracking-tight">
            Logic<span className="text-primary-light">Looper</span>
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-2">
          {[
            { to: '/', label: 'The Hub' },
            { to: '/play', label: 'Engines' },
            { to: '/leaderboard', label: 'Global Ranks' },
          ].map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `px-5 py-2 rounded-xl text-sm font-display font-bold uppercase tracking-widest transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/10 text-primary-light ring-1 ring-primary/30'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Streak + Avatar */}
        <div className="flex items-center gap-4">
          <StreakWidget streak={currentStreak} size="sm" />

          {/* Avatar / Auth */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="group flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-white/5 hover:border-white/20 bg-white/5 transition-all outline-none"
              aria-label="User menu"
            >
              {isGuest ? (
                <div className="w-[34px] h-[34px] rounded-full bg-bg-elevated border border-white/10 flex items-center justify-center text-text-muted">
                  <UserIcon className="w-4 h-4" />
                </div>
              ) : (
                <Avatar name={user?.name} src={user?.avatar} size="sm" />
              )}
              <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
                  className="absolute right-0 top-[52px] w-[240px] bg-bg-elevated/95 backdrop-blur-[40px] rounded-2xl shadow-elevated border border-white/10 overflow-hidden z-50 origin-top-right"
                >
                  {isGuest ? (
                    <button
                      onClick={() => { navigate('/auth'); setMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left text-sm font-display font-bold text-white hover:bg-primary/20 hover:text-primary-light transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      Initialize Identity
                    </button>
                  ) : (
                    <>
                      <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                        <p className="text-sm font-display font-bold text-white truncate">{user?.name}</p>
                        <p className="text-xs font-body font-semibold text-text-secondary truncate mt-0.5">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-5 py-4 text-left text-sm font-display font-bold text-text-secondary hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <UserIcon className="w-4 h-4" /> Profile & Stats
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-4 text-left text-sm font-display font-bold text-error hover:bg-error/10 transition-colors border-t border-white/5"
                      >
                        <LogOut className="w-4 h-4" /> Disconnect
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
