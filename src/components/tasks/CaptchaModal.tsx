import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Check, RefreshCw, KeyRound } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

interface CaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAd: () => void;
}

const generateCaptchaCode = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
};

export const CaptchaModal: React.FC<CaptchaModalProps> = ({
  isOpen,
  onClose,
  onTriggerAd,
}) => {
  const { completeTask } = useAuth();
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [solvedCount, setSolvedCount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      onTriggerAd();
      setCaptchaCode(generateCaptchaCode());
      setUserInput('');
      setSolvedCount(0);
      setTotalEarned(0);
      setError(false);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    if (userInput.trim() === captchaCode) {
      setError(false);
      setSuccess(true);
      const reward = 1.50;
      setTotalEarned(prev => prev + reward);
      setSolvedCount(prev => prev + 1);

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
      });

      try {
        await completeTask('captcha', `Captcha Solved (${captchaCode})`, reward);
      } catch (err) {
        console.error(err);
      }

      setTimeout(() => {
        setSuccess(false);
        setUserInput('');
        setCaptchaCode(generateCaptchaCode());
      }, 1000);
    } else {
      setError(true);
      setSuccess(false);
    }
  };

  const handleRefresh = () => {
    setCaptchaCode(generateCaptchaCode());
    setUserInput('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Captcha Solver</h3>
              <p className="text-xs text-slate-400">Earn ₹1.50 per solved captcha</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Solved: <strong className="text-white">{solvedCount}</strong></span>
            <span className="font-mono text-emerald-400 font-bold">Earned: ₹{totalEarned.toFixed(2)}</span>
          </div>

          {/* Distorted Captcha Display */}
          <div className="relative p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between select-none">
            <div className="flex items-center gap-2 pl-4">
              {captchaCode.split('').map((char, idx) => (
                <span
                  key={idx}
                  className="text-2xl sm:text-3xl font-extrabold font-mono tracking-widest text-emerald-400 drop-shadow-md"
                  style={{
                    transform: `rotate(${((idx % 2 === 0 ? 1 : -1) * (idx * 4))}deg)`,
                    display: 'inline-block',
                  }}
                >
                  {char}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Get New Captcha"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-3">
            <input
              type="text"
              placeholder="Type the exact 6 letters/numbers"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 font-mono text-center tracking-widest text-lg uppercase focus:outline-none focus:border-emerald-500"
              maxLength={6}
            />

            {error && (
              <p className="text-rose-400 text-xs text-center font-medium">
                Incorrect code. Please match case and characters carefully.
              </p>
            )}

            {success && (
              <p className="text-emerald-400 text-xs text-center font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4" /> Validated! +₹1.50 credited
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-500/20 transition active:scale-98"
            >
              Submit & Claim ₹1.50
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
