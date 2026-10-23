import React, { useState } from 'react';
import { X, Play, RotateCw, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAd: () => void;
}

const SEGMENTS = [
  { label: '₹5', amount: 5, color: '#10b981' },
  { label: '₹2', amount: 2, color: '#3b82f6' },
  { label: '₹15', amount: 15, color: '#8b5cf6' },
  { label: '₹3', amount: 3, color: '#f59e0b' },
  { label: '₹20', amount: 20, color: '#ec4899' },
  { label: '₹8', amount: 8, color: '#06b6d4' },
  { label: '₹50', amount: 50, color: '#eab308' },
  { label: '₹10', amount: 10, color: '#14b8a6' },
];

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  onClose,
  onTriggerAd,
}) => {
  const { completeTask } = useAuth();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning) return;

    // Trigger ad immediately when starting task/spin as requested
    onTriggerAd();

    setSpinning(true);
    setWonPrize(null);

    // Pick random index
    const pickedIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    // Calculate final target angle with 5-8 full spins
    const fullSpins = 360 * (5 + Math.floor(Math.random() * 3));
    // Pointer is at the top (270 deg / -90 deg offset)
    const targetAngle = fullSpins + (360 - (pickedIndex * segmentAngle + segmentAngle / 2));
    
    setRotation(prev => prev + targetAngle);

    setTimeout(async () => {
      const prize = SEGMENTS[pickedIndex];
      setWonPrize(prize.amount);
      setSpinning(false);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });

      try {
        await completeTask('spin_wheel', `Lucky Spin Wheel (₹${prize.amount})`, prize.amount);
      } catch (e) {
        console.error(e);
      }
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Spin & Win Cash</h3>
              <p className="text-xs text-slate-400">Spin the wheel and earn up to ₹50</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wheel Canvas / SVG */}
        <div className="relative my-6 flex items-center justify-center">
          {/* Top Indicator Needle */}
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-400 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />

          {/* Rotating Wheel */}
          <div
            className="w-64 h-64 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {SEGMENTS.map((s, i) => {
                const angle = 360 / SEGMENTS.length;
                const startAngle = (i * angle * Math.PI) / 180;
                const endAngle = ((i + 1) * angle * Math.PI) / 180;
                const x1 = 50 + 50 * Math.cos(startAngle);
                const y1 = 50 + 50 * Math.sin(startAngle);
                const x2 = 50 + 50 * Math.cos(endAngle);
                const y2 = 50 + 50 * Math.sin(endAngle);

                // Text pos
                const midAngle = ((i + 0.5) * angle * Math.PI) / 180;
                const tx = 50 + 32 * Math.cos(midAngle);
                const ty = 50 + 32 * Math.sin(midAngle);
                const textRot = (i + 0.5) * angle + 90;

                return (
                  <g key={i}>
                    <path
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                      fill={s.color}
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill="#ffffff"
                      fontSize="5"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRot}, ${tx}, ${ty})`}
                    >
                      {s.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Center Cap */}
            <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Won Prize Badge */}
        {wonPrize !== null && (
          <div className="mb-4 text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-scale-up">
            <span className="text-xs uppercase font-bold text-slate-300">Reward Credited!</span>
            <h4 className="text-2xl font-extrabold text-emerald-400 font-mono">+₹{wonPrize.toFixed(2)}</h4>
          </div>
        )}

        {/* Action Button */}
        <div className="w-full px-6 pb-6">
          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
              spinning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-orange-500/20'
            }`}
          >
            {spinning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Spinning Wheel...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Spin Wheel Now (Earn Cash)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
