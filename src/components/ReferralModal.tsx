import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Gift, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Send, 
  Sparkles,
  ShieldCheck,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
  const { profile, referrals } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !profile) return null;

  const referralCode = profile.referralCode;
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;
  const totalEarned = referrals.length * 25;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareText = `💰 Join TaskEarn app with my unique invite code "${referralCode}" to get an instant ₹20 extra welcome bonus! Complete fun tasks, solve quizzes, watch ads and withdraw real money directly to your UPI & Paytm account: ${referralLink}`;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Join TaskEarn with my code ${referralCode} and claim ₹20 welcome cash!`)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join TaskEarn & Earn Cash',
          text: `Use invite code ${referralCode} to get ₹20 welcome bonus on TaskEarn!`,
          url: referralLink,
        });
      } catch (err) {
        // User dismissed share dialog
      }
    } else {
      handleCopyLink();
    }
  };

  // Mask referee email for privacy (e.g. m***@gmail.com)
  const maskEmail = (email?: string) => {
    if (!email) return 'Friend';
    const parts = email.split('@');
    if (parts.length < 2) return email;
    const namePart = parts[0];
    const masked = namePart.length > 2 ? `${namePart[0]}***${namePart[namePart.length - 1]}` : `${namePart[0]}***`;
    return `${masked}@${parts[1]}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Refer & Earn Cash
                <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  ₹25 / Referral
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Invite friends and earn coins directly to your wallet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/60 via-slate-950 to-emerald-950/50 border border-indigo-500/30 p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Guaranteed Double Reward
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                You get <span className="text-emerald-400 font-extrabold">₹25.00</span> • Friend gets <span className="text-amber-400 font-extrabold">₹20.00</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-sm">
                Jab bhi aapka dost aapke invite code se sign up karega, dono ko instant bonus coins milenge!
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 flex-shrink-0">
              <Gift className="w-8 h-8 animate-bounce" />
            </div>
          </div>

          {/* Referral Stats 3-Col Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Friends Joined
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                {referrals.length}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Total Earned
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
                ₹{totalEarned.toFixed(2)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Per Friend
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-amber-300 mt-1">
                ₹25.00
              </p>
            </div>
          </div>

          {/* Unique Invite Code Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Your Unique Referral Code</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Share this code</span>
            </label>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950 border-2 border-indigo-500/40 shadow-inner">
              <span className="flex-1 text-center font-mono text-xl sm:text-2xl font-black tracking-widest text-emerald-400 select-all py-1">
                {referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Shareable Invite Link Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Shareable Invite Link</label>
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-300 font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleShareTelegram}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Telegram</span>
            </button>
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs border border-slate-700 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>More Options</span>
            </button>
          </div>

          {/* How It Works Steps */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> How the Referral Program Works
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px]">1</span>
                <p className="font-semibold text-white">Share Your Code</p>
                <p className="text-slate-400 text-[10px]">Send your invite code or link to WhatsApp friends & groups.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">2</span>
                <p className="font-semibold text-white">Friend Registers</p>
                <p className="text-slate-400 text-[10px]">Your friend joins & gets ₹20 bonus cash (+₹35 starting balance).</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">3</span>
                <p className="font-semibold text-white">You Get ₹25</p>
                <p className="text-slate-400 text-[10px]">₹25 cash is credited directly to your UPI/Paytm wallet!</p>
              </div>
            </div>
          </div>

          {/* List of Referred Friends */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                Referred Friends List ({referrals.length})
              </h4>
              <span className="text-[10px] text-slate-400">Real-time Firestore sync</span>
            </div>

            {referrals.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-semibold text-slate-300">No friends referred yet</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Apne friends ko invite link share karein aur har signup par ₹25 kamaana shuru karein!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        {ref.refereeName ? ref.refereeName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-white">{ref.refereeName || maskEmail(ref.refereeEmail)}</p>
                        <p className="text-[10px] text-slate-500">
                          Joined on {new Date(ref.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-extrabold text-emerald-400 text-sm">
                        +₹{ref.rewardAmount.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 justify-end">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Credited</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Automatic Instant Coin Crediting
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
