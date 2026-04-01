import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { setGuest, setToken, setUser } from '../store/slices/authSlice';
import type { AppDispatch } from '../store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AuthPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleGuest = () => {
    dispatch(setGuest());
    navigate('/');
  };

  return (
    <div className="min-h-screen min-h-dvh bg-bg-primary grid-bg flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow mx-auto mb-4">
            <span className="text-white text-2xl font-display font-black">L</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Logic<span className="text-primary">Looper</span>
          </h1>
          <p className="text-text-muted text-sm font-body mt-2">
            Daily logic puzzles · Build your streak
          </p>
        </div>

        {/* Auth card */}
        <div className="glass-bright rounded-2xl p-6 shadow-elevated space-y-4">
          <div className="text-center mb-2">
            <h2 className="font-display font-bold text-lg text-text-primary">Get Started</h2>
            <p className="text-text-muted text-sm font-body">Sign in to track your streak</p>
          </div>

          {/* Google OAuth */}
          <motion.button
            onClick={handleGoogleLogin}
            className="w-full flex items-center gap-3 bg-white text-gray-800 font-body font-medium text-sm rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-text-muted text-xs font-body">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Guest mode */}
          <motion.button
            onClick={handleGuest}
            className="w-full py-3 text-sm font-body font-medium text-text-secondary hover:text-text-primary transition-colors rounded-xl border border-border hover:border-border-bright"
            whileTap={{ scale: 0.98 }}
          >
            Continue as Guest
            <span className="block text-xs text-text-muted font-normal mt-0.5">
              Progress saved locally only
            </span>
          </motion.button>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '🔥', label: 'Daily streaks' },
            { icon: '🏆', label: 'Leaderboards' },
            { icon: '🧩', label: '5 puzzle types' },
          ].map(f => (
            <div key={f.label}>
              <div className="text-xl">{f.icon}</div>
              <div className="text-xs text-text-muted font-body mt-1">{f.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
