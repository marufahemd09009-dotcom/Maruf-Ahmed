import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, X, Sparkles, ExternalLink, ShieldCheck, Play } from 'lucide-react';
import { AdBanner } from './AdBanner';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdCompleted?: () => void;
  rewardAmount?: number;
  taskTitle?: string;
}

// Realistic sponsor creatives for interstitial ads
const AD_CREATIVES = [
  {
    title: 'CRED - Pay Credit Card Bills & Win 100% Cashback',
    sponsor: 'CRED India (Sponsored)',
    category: 'Fintech & Rewards',
    headline: 'Download CRED today and claim up to ₹1,000 on your first bill payment.',
    badge: '₹1,000 CASHBACK',
    cta: 'Install Now',
    rating: '4.8 ★ (10M+ Downloads)',
    gradient: 'from-purple-900 via-indigo-950 to-black',
    accentColor: 'text-violet-400',
    btnColor: 'bg-violet-600 hover:bg-violet-500',
    videoPreview: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Zerodha Kite - Trade Stocks & Mutual Funds at ₹0 Brokerage',
    sponsor: 'Zerodha Broking Ltd (Sponsored)',
    category: 'Finance & Investments',
    headline: 'Join over 1 Crore+ investors in India. Free equity delivery investments.',
    badge: 'ZERO BROKERAGE',
    cta: 'Open Free Demat A/c',
    rating: '4.7 ★ (15M+ Users)',
    gradient: 'from-blue-950 via-slate-900 to-black',
    accentColor: 'text-sky-400',
    btnColor: 'bg-blue-600 hover:bg-blue-500',
    videoPreview: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Swiggy Instamart - Groceries Delivered in 10 Minutes',
    sponsor: 'Swiggy (Sponsored)',
    category: 'Food & Quick Commerce',
    headline: 'Get flat 50% OFF on your first 3 orders with code WELCOME50.',
    badge: 'FLAT 50% OFF',
    cta: 'Order Now',
    rating: '4.6 ★ (50M+ Installs)',
    gradient: 'from-orange-950 via-amber-950 to-black',
    accentColor: 'text-orange-400',
    btnColor: 'bg-orange-600 hover:bg-orange-500',
    videoPreview: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Dream11 - Play Fantasy Sports & Win Crores Daily',
    sponsor: 'Dream11 Official (Sponsored)',
    category: 'Fantasy Gaming',
    headline: 'Make your winning 11 team now. Mega contest prize pool ₹100 Crore.',
    badge: '₹500 JOINING BONUS',
    cta: 'Play & Win',
    rating: '4.7 ★ (100M+ Players)',
    gradient: 'from-red-950 via-zinc-950 to-black',
    accentColor: 'text-rose-400',
    btnColor: 'bg-rose-600 hover:bg-rose-500',
    videoPreview: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&auto=format&fit=crop&q=80',
  }
];

// Play celebration audio using Web Audio API
const playRewardChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.2); // D6
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Audio context may require prior user interaction
  }
};

export const AdModal: React.FC<AdModalProps> = ({
  isOpen,
  onClose,
  onAdCompleted,
  rewardAmount,
  taskTitle,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentCreative, setCurrentCreative] = useState(AD_CREATIVES[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Pick random creative
      const randAd = AD_CREATIVES[Math.floor(Math.random() * AD_CREATIVES.length)];
      setCurrentCreative(randAd);
      setCountdown(5);
      setCanSkip(false);
      setProgress(0);

      const duration = 5000;
      const interval = 100;
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += interval;
        const currentProgress = Math.min(100, (elapsed / duration) * 100);
        setProgress(currentProgress);

        const remainingSec = Math.max(0, Math.ceil((duration - elapsed) / 1000));
        setCountdown(remainingSec);

        if (elapsed >= duration) {
          clearInterval(timer);
          setCanSkip(true);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFinishAd = () => {
    playRewardChime();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onAdCompleted) {
      onAdCompleted();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className={`relative w-full max-w-lg rounded-2xl overflow-hidden border border-slate-700/60 bg-gradient-to-b ${currentCreative.gradient} shadow-2xl shadow-emerald-500/10 text-white`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold tracking-wider text-[10px] border border-emerald-500/30">
              AD • REWARDED
            </span>
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Ad Network
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMuted(!muted)} 
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition"
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {canSkip ? (
              <button
                onClick={handleFinishAd}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded-full text-xs shadow-md transition transform active:scale-95"
              >
                <span>Claim Reward</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="bg-black/60 px-2.5 py-1 rounded-full text-xs font-mono text-amber-300 border border-amber-500/30">
                Reward in {countdown}s
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div 
            className="bg-emerald-500 h-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Ad Video / Media Preview */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
          <img 
            src={currentCreative.videoPreview} 
            alt={currentCreative.title} 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4">
            <div className="inline-block self-start mb-2 px-2.5 py-0.5 rounded-md bg-amber-400 text-black font-extrabold text-[11px]">
              {currentCreative.badge}
            </div>
            <h3 className="text-lg font-bold text-white leading-snug drop-shadow-md">
              {currentCreative.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              {currentCreative.headline}
            </p>
          </div>

          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[11px] text-slate-300 font-mono">
            AdMob #394025
          </div>
        </div>

        {/* Ad Details & Action Area */}
        <div className="p-4 bg-slate-900/90 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{currentCreative.sponsor}</p>
              <p className="text-[11px] text-amber-400 font-semibold">{currentCreative.rating}</p>
            </div>
            <button 
              onClick={() => window.open('https://google.com', '_blank')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition active:scale-95 ${currentCreative.btnColor}`}
            >
              <span>{currentCreative.cta}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reward Notification Banner */}
          <div className="mt-1 flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <span className="text-slate-300">Target Task: </span>
                <span className="font-semibold text-white">{taskTitle || 'Earn Cash'}</span>
              </div>
            </div>
            {rewardAmount ? (
              <span className="font-extrabold text-emerald-400 text-sm">
                +₹{rewardAmount.toFixed(2)}
              </span>
            ) : null}
          </div>

          {/* User's Exact Highperformanceformat Live Ad Banner */}
          <div className="py-1">
            <AdBanner className="my-0 scale-95" />
          </div>

          {/* Bottom dismiss or ready */}
          <div className="text-center pt-1">
            {canSkip ? (
              <button
                onClick={handleFinishAd}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition"
              >
                Continue & Collect Reward (₹{rewardAmount?.toFixed(2) || '0.00'})
              </button>
            ) : (
              <p className="text-[11px] text-slate-400">
                Please view the ad for <span className="text-amber-400 font-bold">{countdown} seconds</span> to verify your reward coins.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
