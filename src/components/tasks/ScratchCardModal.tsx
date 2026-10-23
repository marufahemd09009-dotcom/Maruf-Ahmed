import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Trophy, RotateCcw, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

interface ScratchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAd: () => void;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({
  isOpen,
  onClose,
  onTriggerAd,
}) => {
  const { completeTask } = useAuth();
  const [isRevealed, setIsRevealed] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize random reward on open
  useEffect(() => {
    if (isOpen) {
      // Reward between ₹2.00 and ₹18.00
      const possible = [2.50, 3.00, 5.00, 7.50, 10.00, 12.00, 15.00];
      const selected = possible[Math.floor(Math.random() * possible.length)];
      setRewardAmount(selected);
      setIsRevealed(false);
      setClaimed(false);

      // Trigger ad immediately when user enters task option as requested
      onTriggerAd();

      // Render canvas scratch coating
      setTimeout(initCanvas, 100);
    }
  }, [isOpen]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#334155'; // Slate 700
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative pattern
    ctx.fillStyle = '#475569';
    for (let i = 0; i < canvas.width; i += 20) {
      for (let j = 0; j < canvas.height; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.fillRect(i, j, 10, 10);
        }
      }
    }

    // Text on scratch surface
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE TO WIN', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Rub with finger or click to reveal', canvas.width / 2, canvas.height / 2 + 15);
  };

  const revealAll = async () => {
    if (isRevealed || claimed) return;
    setIsRevealed(true);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });

    try {
      setClaimed(true);
      await completeTask('scratch_card', `Lucky Scratch Card Reward (₹${rewardAmount.toFixed(2)})`, rewardAmount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMouseMoveOrTouch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Check transparent pixels ratio
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imgData.data.length; i += 4) {
      if (imgData.data[i] === 0) transparent++;
    }
    const percent = transparent / (canvas.width * canvas.height);
    if (percent > 0.4) {
      revealAll();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Lucky Scratch Card</h3>
              <p className="text-xs text-slate-400">Scratch & win up to ₹25 cash instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scratch Area */}
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="relative w-[300px] h-[180px] rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-amber-950 via-slate-950 to-emerald-950 shadow-xl flex items-center justify-center select-none">
            {/* Hidden Prize Inside */}
            <div className="text-center p-4">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto animate-bounce mb-1" />
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Congratulations!
              </p>
              <h2 className="text-3xl font-extrabold text-emerald-400 font-mono">
                +₹{rewardAmount.toFixed(2)}
              </h2>
              <p className="text-[11px] text-slate-300 mt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Credited directly to wallet
              </p>
            </div>

            {/* Canvas Scratch Overlay */}
            <canvas
              ref={canvasRef}
              width={300}
              height={180}
              onMouseMove={handleMouseMoveOrTouch}
              onTouchMove={handleMouseMoveOrTouch}
              onClick={revealAll}
              className={`absolute inset-0 cursor-pointer touch-none transition-opacity duration-300 ${
                isRevealed ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
            />
          </div>

          {!isRevealed ? (
            <button
              onClick={revealAll}
              className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              Or click here to reveal card instantly
            </button>
          ) : (
            <div className="w-full flex items-center gap-2">
              <button
                onClick={() => {
                  onTriggerAd();
                  const possible = [2.50, 3.00, 5.00, 7.50, 10.00, 12.00, 15.00];
                  setRewardAmount(possible[Math.floor(Math.random() * possible.length)]);
                  setIsRevealed(false);
                  setClaimed(false);
                  setTimeout(initCanvas, 50);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Scratch Next Card</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
