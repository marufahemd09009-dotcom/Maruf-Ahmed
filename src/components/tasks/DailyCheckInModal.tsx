import React, { useState } from 'react';
import { X, Calendar, Flame, Check, Gift, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAd: () => void;
}

const REWARDS = [
  { day: 1, amount: 5, label: '₹5' },
  { day: 2, amount: 7, label: '₹7' },
  { day: 3, amount: 10, label: '₹10' },
  { day: 4, amount: 12, label: '₹12' },
  { day: 5, amount: 15, label: '₹15' },
  { day: 6, amount: 20, label: '₹20' },
  { day: 7, amount: 30, label: '₹30 MEGA' },
];

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  onTriggerAd,
}) => {
  const { profile, claimDailyCheckIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen || !profile) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyCheckedInToday = profile.lastCheckInDate === todayStr;
  const currentStreak = profile.dailyStreak || 0;
  const nextDay = alreadyCheckedInToday ? (currentStreak % 7) : ((currentStreak % 7) + 1);

  const handleClaim = async () => {
    // Trigger ad when starting claim action as requested
    onTriggerAd();

    setLoading(true);
    try {
      const res = await claimDailyCheckIn();
      if (res.success) {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
        setMessage(`Claimed ₹${res.reward} successfully! Daily streak: Day ${res.streak}`);
      } else {
        setMessage('You have already claimed your daily reward today. Come back tomorrow!');
      }
    } catch (err: any) {
      setMessage(err.message || 'Error claiming reward');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Daily Check-In Streak
                <span className="flex items-center gap-1 text-[11px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {currentStreak} Day Streak
                </span>
              </h3>
              <p className="text-xs text-slate-400">Claim free bonus cash every 24 hours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Day Grid */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
            {REWARDS.map((r) => {
              const isPast = r.day < nextDay || (alreadyCheckedInToday && r.day <= nextDay);
              const isTodayTarget = !alreadyCheckedInToday && r.day === nextDay;
              const isLocked = r.day > nextDay;

              return (
                <div
                  key={r.day}
                  className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl border text-center transition-all ${
                    isTodayTarget
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 scale-105 shadow-lg shadow-amber-500/20'
                      : isPast
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Day {r.day}
                  </span>

                  <div className="my-2">
                    {isPast ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : r.day === 7 ? (
                      <Gift className="w-7 h-7 text-amber-400 animate-bounce" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-amber-300" />
                    )}
                  </div>

                  <span className={`text-xs font-extrabold ${isTodayTarget ? 'text-amber-300' : 'text-slate-200'}`}>
                    {r.label}
                  </span>
                </div>
              );
            })}
          </div>

          {message && (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-amber-300 text-center font-medium">
              {message}
            </div>
          )}

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={handleClaim}
              disabled={alreadyCheckedInToday || loading}
              className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                alreadyCheckedInToday
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-98'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Claiming Streak...</span>
                </>
              ) : alreadyCheckedInToday ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Already Claimed Today (Next Day Unlocks Tomorrow)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Claim Day {nextDay} Reward ({REWARDS[nextDay - 1]?.label})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
