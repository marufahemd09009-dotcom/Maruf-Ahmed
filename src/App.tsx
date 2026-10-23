/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { AdModal } from './components/AdModal';
import { Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();

  // Global Ad Trigger Controller
  const [adState, setAdState] = useState<{
    isOpen: boolean;
    onCompleted?: () => void;
    rewardAmount?: number;
    taskTitle?: string;
  }>({
    isOpen: false,
  });

  const triggerAd = (onCompleted?: () => void, rewardAmount?: number, taskTitle?: string) => {
    setAdState({
      isOpen: true,
      onCompleted,
      rewardAmount,
      taskTitle,
    });
  };

  const closeAd = () => {
    setAdState(prev => ({ ...prev, isOpen: false }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/20 animate-pulse">
          ₹
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Connecting to TaskEarn Secure Cloud...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <AuthModal />
      ) : (
        <Dashboard onTriggerAd={triggerAd} />
      )}

      {/* Global Interstitial & Rewarded Ad Modal */}
      <AdModal
        isOpen={adState.isOpen}
        onClose={closeAd}
        onAdCompleted={adState.onCompleted}
        rewardAmount={adState.rewardAmount}
        taskTitle={adState.taskTitle}
      />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
