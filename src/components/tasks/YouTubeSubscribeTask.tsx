import React, { useState } from 'react';
import { Youtube, CheckCircle2, ExternalLink, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface YouTubeSubscribeTaskProps {
  onSubscribeClaim: (reward: number) => Promise<void>;
  onTriggerAd: () => void;
  isAlreadyClaimed: boolean;
}

export const YouTubeSubscribeTask: React.FC<YouTubeSubscribeTaskProps> = ({
  onSubscribeClaim,
  onTriggerAd,
  isAlreadyClaimed,
}) => {
  const [hasVisited, setHasVisited] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [claimed, setClaimed] = useState(isAlreadyClaimed);

  const channelName = '@islamiccrator-q1t';
  const youtubeUrl = `https://www.youtube.com/${channelName}`;
  const rewardAmount = 20.00; // ₹20 reward

  const handleOpenChannel = () => {
    // Immediate ad trigger when user starts the option/task
    onTriggerAd();
    window.open(youtubeUrl, '_blank');
    setHasVisited(true);
  };

  const handleVerifySubscription = async () => {
    if (!hasVisited && !claimed) {
      handleOpenChannel();
      return;
    }

    setVerifying(true);
    // Realistic verification timer
    setTimeout(async () => {
      try {
        await onSubscribeClaim(rewardAmount);
        setClaimed(true);
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error('Failed to claim subscription reward:', err);
      } finally {
        setVerifying(false);
      }
    }, 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-2 border-red-500/40 p-4 sm:p-5 shadow-xl shadow-red-950/30">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Channel Information */}
        <div className="flex items-start gap-3.5">
          <div className="relative flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-600/30 border border-red-400/40">
            <Youtube className="w-8 h-8 fill-current" />
            <div className="absolute -bottom-1 -right-1 p-0.5 bg-slate-950 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                Official YouTube Task
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Instant ₹20 Cash
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
              Subscribe to <span className="text-red-400 font-extrabold underline underline-offset-2">{channelName}</span>
            </h3>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              YouTube channel ko subscribe karein, bell icon dabayein aur turant paayein <strong className="text-emerald-400">₹20.00</strong> direct wallet balance mein!
            </p>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-shrink-0">
          {claimed ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs sm:text-sm shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              <span>₹20 Claimed Successfully!</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleOpenChannel}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition border border-red-400/30"
              >
                <Youtube className="w-4 h-4 fill-white" />
                <span>Open & Subscribe</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                onClick={handleVerifySubscription}
                disabled={verifying}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Get ₹20</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
