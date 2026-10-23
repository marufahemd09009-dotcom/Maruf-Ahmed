import React, { useState } from 'react';
import { X, ClipboardList, CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

interface SurveysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAd: () => void;
}

const QUESTIONS = [
  {
    q: 'How often do you make online shopping or food orders in a week?',
    options: ['1 - 2 times', '3 - 5 times', 'More than 5 times', 'Rarely / Never'],
  },
  {
    q: 'Which digital payment method do you use most frequently?',
    options: ['Google Pay (UPI)', 'PhonePe (UPI)', 'Paytm Wallet / UPI', 'Net Banking / Cards'],
  },
  {
    q: 'What is your primary reason for using earning apps like TaskEarn?',
    options: ['Pocket money & extra income', 'Mobile recharges & bill payments', 'Saving & investing', 'Fun and passing time'],
  },
];

export const SurveysModal: React.FC<SurveysModalProps> = ({
  isOpen,
  onClose,
  onTriggerAd,
}) => {
  const { completeTask } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const handleSelectOption = (opt: string) => {
    const updated = [...selectedAnswers];
    updated[currentStep] = opt;
    setSelectedAnswers(updated);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishSurvey();
    }
  };

  const finishSurvey = async () => {
    // Trigger ad when completing survey as requested
    onTriggerAd();

    setSubmitting(true);
    const reward = 15.00;

    setTimeout(async () => {
      try {
        await completeTask('survey', 'Fast Consumer Opinion Survey (₹15)', reward);
        setDone(true);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Quick Opinion Survey</h3>
              <p className="text-xs text-slate-400">Complete 3 questions to earn ₹15.00</p>
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
        <div className="p-6">
          {done ? (
            <div className="text-center py-6 space-y-4 animate-scale-up">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Survey Completed!</h4>
                <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">+₹15.00</p>
                <p className="text-xs text-slate-400 mt-1">Cash reward credited to your TaskEarn wallet</p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Close & Return
              </button>
            </div>
          ) : submitting ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 mx-auto text-emerald-400 animate-spin" />
              <p className="text-sm font-bold text-white">Validating responses & crediting ₹15.00...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Progress */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
                <span className="text-emerald-400 font-bold">Reward: ₹15.00</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <h3 className="text-base font-bold text-white leading-relaxed">
                {QUESTIONS[currentStep].q}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {QUESTIONS[currentStep].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/60 text-slate-200 text-xs font-medium flex items-center justify-between transition group"
                  >
                    <span>{opt}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
