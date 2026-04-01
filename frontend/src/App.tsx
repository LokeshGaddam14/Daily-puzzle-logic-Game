import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { store, type RootState, type AppDispatch } from './store';
import { fetchCurrentUser } from './store/slices/authSlice';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';

const AppRoutes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    // Try to restore session if token exists
    if (localStorage.getItem('ll_token')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // Handle OAuth callback token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('ll_token', token);
      dispatch(fetchCurrentUser());
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted font-body text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/*"
            element={
              <AppLayout>
                <Routes>
                  <Route path="/"            element={<HomePage />} />
                  <Route path="/play"        element={<GamePage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/profile"     element={<ProfilePage />} />
                  <Route path="*"            element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            }
          />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <AppRoutes />
  </Provider>
);

export default App;
