import React, { useState, useEffect } from 'react';
import { X, Calculator, Check, AlertCircle, Sparkles, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

interface MathQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAd: () => void;
}

interface Question {
  text: string;
  options: number[];
  answer: number;
}

const generateQuestion = (): Question => {
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let num1 = Math.floor(10 + Math.random() * 40);
  let num2 = Math.floor(5 + Math.random() * 25);
  let ans = 0;

  if (op === '+') ans = num1 + num2;
  else if (op === '-') {
    if (num1 < num2) [num1, num2] = [num2, num1];
    ans = num1 - num2;
  } else {
    num1 = Math.floor(3 + Math.random() * 10);
    num2 = Math.floor(3 + Math.random() * 10);
    ans = num1 * num2;
  }

  // Generate 4 options
  const optionsSet = new Set<number>([ans]);
  while (optionsSet.size < 4) {
    const delta = Math.floor(1 + Math.random() * 6) * (Math.random() > 0.5 ? 1 : -1);
    optionsSet.add(ans + delta);
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
  return {
    text: `${num1} ${op} ${num2} = ?`,
    options,
    answer: ans,
  };
};

export const MathQuizModal: React.FC<MathQuizModalProps> = ({
  isOpen,
  onClose,
  onTriggerAd,
}) => {
  const { completeTask } = useAuth();
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (isOpen) {
      onTriggerAd();
      setCurrentQ(generateQuestion());
      setScore(0);
      setSolvedCount(0);
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen || !currentQ) return null;

  const handleSelectOption = async (opt: number) => {
    if (feedback !== null) return;

    if (opt === currentQ.answer) {
      setFeedback('correct');
      const reward = 2.50;
      setScore(prev => prev + reward);
      setSolvedCount(prev => prev + 1);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });

      try {
        await completeTask('quiz', `Math Quiz Solved (${currentQ.text})`, reward);
      } catch (e) {
        console.error(e);
      }

      setTimeout(() => {
        setFeedback(null);
        setCurrentQ(generateQuestion());
      }, 1200);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setCurrentQ(generateQuestion());
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Math Quiz Challenge</h3>
              <p className="text-xs text-slate-400">Earn ₹2.50 per correct answer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Questions Solved: <strong className="text-white">{solvedCount}</strong></span>
            <span className="font-mono text-emerald-400 font-bold">Total Earned: ₹{score.toFixed(2)}</span>
          </div>

          {/* Question Box */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Solve & Win</span>
            <h2 className="text-3xl font-extrabold text-white font-mono tracking-wide">
              {currentQ.text}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(opt)}
                disabled={feedback !== null}
                className={`py-3.5 rounded-xl font-mono text-base font-bold transition border ${
                  feedback === 'correct' && opt === currentQ.answer
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : feedback === 'wrong' && opt !== currentQ.answer
                    ? 'bg-slate-900 border-slate-800 text-slate-500'
                    : 'bg-slate-950 text-white border-slate-800 hover:border-sky-500 hover:bg-slate-800/80 active:scale-98'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedback === 'correct' && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs text-center font-bold flex items-center justify-center gap-1.5 animate-scale-up">
              <Check className="w-4 h-4" />
              <span>Correct! +₹2.50 credited</span>
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs text-center font-bold flex items-center justify-center gap-1.5 animate-scale-up">
              <AlertCircle className="w-4 h-4" />
              <span>Oops, wrong answer! Loading next question...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
