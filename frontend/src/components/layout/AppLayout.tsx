import React from 'react';
import { Navbar } from '../ui/Navbar';
import { BottomNav } from '../ui/BottomNav';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen min-h-dvh bg-bg-primary">
      <Navbar />
      <motion.main
        className="flex-1 pb-20 lg:pb-0"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {children}
      </motion.main>
      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1A2E',
            color: '#E8E8F0',
            border: '1px solid #2E2E50',
            borderRadius: '12px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#1A1A2E' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#1A1A2E' },
          },
        }}
      />
    </div>
  );
};
