import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  Sparkles, 
  Flame, 
  RotateCw, 
  Calculator, 
  KeyRound, 
  ClipboardList, 
  Video, 
  Share2, 
  Check, 
  Copy, 
  LogOut, 
  History, 
  Code2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Gift,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdBanner } from './AdBanner';
import { YouTubeSubscribeTask } from './tasks/YouTubeSubscribeTask';
import { DailyCheckInModal } from './tasks/DailyCheckInModal';
import { ScratchCardModal } from './tasks/ScratchCardModal';
import { SpinWheelModal } from './tasks/SpinWheelModal';
import { MathQuizModal } from './tasks/MathQuizModal';
import { CaptchaModal } from './tasks/CaptchaModal';
import { SurveysModal } from './tasks/SurveysModal';
import { WithdrawModal } from './WithdrawModal';
import { AdCodeCenterModal } from './AdCodeCenterModal';
import { PayoutHistory } from './PayoutHistory';
import { ReferralModal } from './ReferralModal';

interface DashboardProps {
  onTriggerAd: (onCompleted?: () => void, reward?: number, title?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onTriggerAd }) => {
  const { profile, user, logout, activities, withdrawals, referrals, completeTask } = useAuth();
  
  // Modals state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDailyCheckin, setShowDailyCheckin] = useState(false);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showMathQuiz, setShowMathQuiz] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [showSurveys, setShowSurveys] = useState(false);
  const [showAdCodeCenter, setShowAdCodeCenter] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  // Filter & History tabs
  const [activeCategory, setActiveCategory] = useState<'all' | 'quick' | 'games' | 'daily'>('all');
  const [historyTab, setHistoryTab] = useState<'activities' | 'withdrawals'>('activities');
  const [copiedReferral, setCopiedReferral] = useState(false);

  if (!profile) return null;

  // Check if youtube channel subscription is already claimed
  const hasClaimedYouTube = activities.some(a => a.taskTitle.includes('@islamiccrator-q1t') || a.taskTitle.includes('YouTube'));

  const handleOpenTask = (taskType: string) => {
    // As explicitly requested: "Ak option youse kerney ka baad start lage ma atey he ak aad chal jay."
    // Trigger ad modal immediately when user opens/clicks any task option!
    onTriggerAd(() => {
      // After ad is completed or skipped, open target task modal
      if (taskType === 'daily') setShowDailyCheckin(true);
      else if (taskType === 'scratch') setShowScratchCard(true);
      else if (taskType === 'spin') setShowSpinWheel(true);
      else if (taskType === 'quiz') setShowMathQuiz(true);
      else if (taskType === 'captcha') setShowCaptcha(true);
      else if (taskType === 'survey') setShowSurveys(true);
    }, 0, `Opening ${taskType.toUpperCase()} Task`);
  };

  const handleWatchRewardedAdDirect = () => {
    // Directly watch rewarded video ad to earn instant ₹3.00
    onTriggerAd(async () => {
      try {
        await completeTask('ad_watch', 'High CPM Rewarded Video Ad (₹3.00)', 3.00);
      } catch (e) {
        console.error(e);
      }
    }, 3.00, 'Rewarded Video Ad');
  };

  const handleCopyReferral = () => {
    const text = `Join TaskEarn with my referral code ${profile.referralCode} and get ₹20 bonus cash on signup! Earn daily cash with instant UPI/Paytm withdrawals: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md shadow-emerald-500/20">
              ₹
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-tight">
                Task<span className="text-emerald-400">Earn</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                UPI & Paytm Ready
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                onTriggerAd(() => setShowReferralModal(true), 0, 'Referral Program Hub');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition shadow-sm"
              title="Refer Friends & Earn ₹25"
            >
              <Gift className="w-3.5 h-3.5 text-indigo-400" />
              <span>Invite (₹25)</span>
              {referrals.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-indigo-500 text-white">
                  {referrals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowAdCodeCenter(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
              title="Ad Network & Integration Code"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Ad Code</span>
            </button>

            <button
              onClick={() => {
                onTriggerAd(() => setShowWithdraw(true), 0, 'Withdrawal Gateway');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
              <span>Withdraw</span>
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Welcome & Wallet Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 p-6 sm:p-7 shadow-xl shadow-emerald-950/20">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* User Greeting & Balance */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Welcome back,</span>
                <span className="text-xs font-bold text-white bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                  {profile.displayName || profile.email}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  <Flame className="w-3 h-3 fill-amber-400" />
                  {profile.dailyStreak} Day Streak
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Total Wallet Balance
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                    ₹{profile.balance.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">INR</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div>
                  Lifetime Earned: <strong className="text-white font-mono">₹{profile.totalEarned.toFixed(2)}</strong>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <div>
                  Total Withdrawn: <strong className="text-white font-mono">₹{profile.totalWithdrawn.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <button
                onClick={() => handleOpenTask('daily')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 transition shadow-sm"
              >
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>Daily Streak</span>
              </button>

              <button
                onClick={() => {
                  onTriggerAd(() => setShowWithdraw(true), 0, 'Withdraw Payout Gateway');
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition"
              >
                <Wallet className="w-4 h-4" />
                <span>Withdraw via UPI / Paytm</span>
              </button>
            </div>
          </div>
        </div>

        {/* User's Exact Highperformanceformat Ad Banner Embed */}
        <AdBanner />

        {/* Special Featured YouTube Subscribe Task for @islamiccrator-q1t */}
        <YouTubeSubscribeTask
          onSubscribeClaim={async (reward) => {
            await completeTask('referral', 'Subscribed to @islamiccrator-q1t YouTube Channel (₹20.00)', reward);
          }}
          onTriggerAd={() => onTriggerAd(undefined, 0, 'YouTube Task Verification')}
          isAlreadyClaimed={hasClaimedYouTube}
        />

        {/* Task Category Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setActiveCategory('quick')}
              className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeCategory === 'quick'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              Fast Earn
            </button>
            <button
              onClick={() => setActiveCategory('games')}
              className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeCategory === 'games'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              Games & Lucky Spin
            </button>
            <button
              onClick={() => setActiveCategory('daily')}
              className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeCategory === 'daily'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              Daily Streak
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Ads play on task start for instant verification
          </span>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Rewarded Video Ad Card */}
          {(activeCategory === 'all' || activeCategory === 'quick') && (
            <div className="relative group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    High eCPM
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">Watch Sponsored Video</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Watch a 5-second video ad and earn instant cash reward.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">Reward</span>
                  <p className="text-sm font-extrabold text-emerald-400 font-mono">+₹3.00</p>
                </div>
                <button
                  onClick={handleWatchRewardedAdDirect}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
                >
                  <span>Watch Ad</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 2. Lucky Scratch Card */}
          {(activeCategory === 'all' || activeCategory === 'games') && (
            <div className="relative group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Instant Win
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">Lucky Scratch Card</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Rub to reveal surprise cash prizes between ₹2 and ₹25.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">Reward</span>
                  <p className="text-sm font-extrabold text-emerald-400 font-mono">Up to ₹25.00</p>
                </div>
                <button
                  onClick={() => handleOpenTask('scratch')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
                >
                  <span>Scratch Card</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 3. Spin & Win Wheel */}
          {(activeCategory === 'all' || activeCategory === 'games') && (
            <div className="relative group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <RotateCw className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Jackpot ₹50
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">Lucky Spin Wheel</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Spin the wheel and claim guaranteed cash rewards directly.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">Reward</span>
                  <p className="text-sm font-extrabold text-emerald-400 font-mono">Up to ₹50.00</p>
                </div>
                <button
                  onClick={() => handleOpenTask('spin')}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
                >
                  <span>Spin Wheel</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 4. Math Quiz Challenge */}
          {(activeCategory === 'all' || activeCategory === 'quick') && (
            <div className="relative group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Unlimited
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">Math Quiz Solver</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Answer rapid addition, subtraction and multiplication questions.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">Reward</span>
                  <p className="text-sm font-extrabold text-emerald-400 font-mono">+₹2.50 / ans</p>
                </div>
                <button
                  onClick={() => handleOpenTask('quiz')}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
                >
                  <span>Solve Math</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 5. Captcha Solver */}
          {(activeCategory === 'all' || activeCategory === 'quick') && (
            <div className="relative group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 transition shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Easy Typing
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">Captcha Typing</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Type 6-character captcha codes to verify data and earn coins.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">Reward</span>
                  <p className="text-sm font-extrabold text-emerald-400 font-mono">+₹1.50 / code</p>
                </div>
                <button
                  onClick={() => handleOpenTask('captcha')}
                  className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
                >
                  <span>Type Captcha</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 6. Quick Opinion Survey */}
          {(activeCategory === 'all' || activeCategory === 'quick') && (
            <div className="relative group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Highest Pay
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">Consumer Opinion Survey</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Answer 3 quick consumer questions about digital shopping and apps.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">Reward</span>
                  <p className="text-sm font-extrabold text-emerald-400 font-mono">+₹15.00</p>
                </div>
                <button
                  onClick={() => handleOpenTask('survey')}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
                >
                  <span>Start Survey</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Refer & Earn Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-2 border-indigo-500/40 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  Referral Program
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  {referrals.length} Friends Joined
                </span>
                {referrals.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Earned ₹{(referrals.length * 25).toFixed(2)}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Invite Friends & Earn <span className="text-emerald-400 font-extrabold">₹25.00</span> Per Referral
              </h3>
              <p className="text-xs text-slate-300 max-w-lg">
                Apna unique invite code share karein! Aapke dost ko <strong className="text-amber-400">₹20 bonus</strong> milega aur aapko har friend par <strong className="text-emerald-400">₹25 cash</strong> direct wallet mein milega.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-shrink-0 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm font-black text-emerald-400 text-center flex-1 sm:flex-none">
                  {profile.referralCode}
                </div>
                <button
                  onClick={handleCopyReferral}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition"
                  title="Copy Invite Code"
                >
                  {copiedReferral ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={() => {
                  onTriggerAd(() => setShowReferralModal(true), 0, 'Referral Rewards Hub');
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition"
              >
                <Gift className="w-4 h-4" />
                <span>Open Referral Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Payout History Section (Firestore Live) */}
        <PayoutHistory
          withdrawals={withdrawals}
          onRequestWithdrawal={() => onTriggerAd(() => setShowWithdraw(true), 0, 'Withdrawal Gateway')}
        />

        {/* Task Earnings & Activity Stream */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-base">Recent Task Earnings</h3>
                <p className="text-xs text-slate-400">Coins and rewards credited from completed tasks</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {activities.length} Earnings Logs
            </span>
          </div>

          {/* Activity items list */}
          {activities.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">
              No task rewards yet. Complete your first task above to start earning!
            </p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{act.taskTitle}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(act.completedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <span
                    className={`font-mono font-bold text-sm ${
                      act.rewardAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {act.rewardAmount >= 0 ? `+₹${act.rewardAmount.toFixed(2)}` : `-₹${Math.abs(act.rewardAmount).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Task & Action Modals */}
      <DailyCheckInModal
        isOpen={showDailyCheckin}
        onClose={() => setShowDailyCheckin(false)}
        onTriggerAd={() => onTriggerAd(undefined, 0, 'Daily Streak Claim')}
      />

      <ScratchCardModal
        isOpen={showScratchCard}
        onClose={() => setShowScratchCard(false)}
        onTriggerAd={() => onTriggerAd(undefined, 0, 'Scratch Card Reveal')}
      />

      <SpinWheelModal
        isOpen={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        onTriggerAd={() => onTriggerAd(undefined, 0, 'Spin Wheel Start')}
      />

      <MathQuizModal
        isOpen={showMathQuiz}
        onClose={() => setShowMathQuiz(false)}
        onTriggerAd={() => onTriggerAd(undefined, 0, 'Math Quiz Challenge')}
      />

      <CaptchaModal
        isOpen={showCaptcha}
        onClose={() => setShowCaptcha(false)}
        onTriggerAd={() => onTriggerAd(undefined, 0, 'Captcha Solver')}
      />

      <SurveysModal
        isOpen={showSurveys}
        onClose={() => setShowSurveys(false)}
        onTriggerAd={() => onTriggerAd(undefined, 0, 'Survey Completion')}
      />

      <WithdrawModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        onTriggerAd={() => onTriggerAd(undefined, 0, 'Payout Security Check')}
      />

      <AdCodeCenterModal
        isOpen={showAdCodeCenter}
        onClose={() => setShowAdCodeCenter(false)}
      />

      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />

      {/* Persistent Sticky Bottom Ad Banner with User's Key */}
      <AdBanner isStickyBottom={true} />
    </div>
  );
};
