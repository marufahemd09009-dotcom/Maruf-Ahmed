import React, { useState } from 'react';
import { 
  X, 
  ArrowUpRight, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  Check, 
  CreditCard,
  Smartphone,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { PaymentMethod, WithdrawalRequest } from '../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAd: () => void;
}

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000, 2000];

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  onTriggerAd,
}) => {
  const { profile, requestWithdrawal } = useAuth();
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<WithdrawalRequest | null>(null);
  const [copiedUtr, setCopiedUtr] = useState(false);

  if (!isOpen || !profile) return null;

  const currentBalance = profile.balance;
  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleSelectAmount = (amt: number) => {
    setAmount(amt);
    setCustomAmount('');
    setError(null);
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    setError(null);
  };

  const validateDetails = (): boolean => {
    if (!payoutDetails.trim()) {
      setError(method === 'UPI' ? 'Please enter a valid UPI ID' : 'Please enter your 10-digit Paytm mobile number');
      return false;
    }

    if (method === 'UPI') {
      // Basic UPI regex: username@bank
      if (!payoutDetails.includes('@') || payoutDetails.length < 5) {
        setError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or 9876543210@paytm)');
        return false;
      }
    } else {
      // Paytm: 10-digit phone number
      const phoneClean = payoutDetails.replace(/\D/g, '');
      if (phoneClean.length !== 10) {
        setError('Please enter a valid 10-digit Paytm mobile number');
        return false;
      }
    }

    if (effectiveAmount < 50) {
      setError('Minimum withdrawal limit is ₹50');
      return false;
    }

    if (effectiveAmount > currentBalance) {
      setError(`Insufficient balance. Current balance is ₹${currentBalance.toFixed(2)}`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleWithdraw = async () => {
    if (!validateDetails()) return;

    // Trigger ad when user executes the withdrawal action
    onTriggerAd();

    setLoading(true);
    setError(null);

    try {
      const res = await requestWithdrawal(effectiveAmount, method, payoutDetails.trim());
      setReceipt(res);
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setError(err.message || 'Withdrawal request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const resetAndClose = () => {
    setReceipt(null);
    setError(null);
    setPayoutDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Withdraw Cash</h3>
              <p className="text-xs text-slate-400">
                Instant settlement to UPI or Paytm Wallet
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Receipt is active, show Success Slip */}
        {receipt ? (
          <div className="p-6 space-y-5 animate-scale-up">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Withdrawal Request Placed!</h4>
              <p className="text-xs text-slate-400">
                Amount is being transferred to your {receipt.method} account.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Amount:</span>
                <span className="text-lg font-extrabold text-emerald-400">₹{receipt.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="font-bold text-white">{receipt.method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Account / VPA:</span>
                <span className="text-slate-200">{receipt.payoutDetails}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {receipt.status}
                </span>
              </div>
              {receipt.referenceId && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Bank UTR / Ref:</span>
                  <div className="flex items-center gap-1 text-slate-300">
                    <span>{receipt.referenceId}</span>
                    <button
                      onClick={() => handleCopyUtr(receipt.referenceId!)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy Reference ID"
                    >
                      {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Wallet Balance Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  ₹
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Available Wallet Balance</span>
                  <p className="text-base font-extrabold text-white font-mono">
                    ₹{currentBalance.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Min. Withdrawal</span>
                <p className="text-xs font-bold text-amber-400">₹50.00</p>
              </div>
            </div>

            {/* Payment Method Selector (UPI vs Paytm) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Payout Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition ${
                    method === 'UPI'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${method === 'UPI' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-white">UPI Transfer</p>
                    <p className="text-[10px] text-slate-400">GPay, PhonePe, BHIM</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('PAYTM')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition ${
                    method === 'PAYTM'
                      ? 'bg-sky-500/10 border-sky-500 text-white shadow-md shadow-sky-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${method === 'PAYTM' ? 'bg-sky-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-white">Paytm Wallet</p>
                    <p className="text-[10px] text-slate-400">Direct to Mobile No</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Account Details Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {method === 'UPI' ? 'UPI ID / VPA' : 'Paytm Registered Mobile Number'}
              </label>
              <input
                type={method === 'PAYTM' ? 'tel' : 'text'}
                placeholder={method === 'UPI' ? 'e.g. mobile@okhdfcbank or user@upi' : 'e.g. 9876543210'}
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition"
              />
              <p className="text-[10px] text-slate-400">
                {method === 'UPI' 
                  ? 'Works with Google Pay, PhonePe, Paytm UPI, BHIM, Amazon Pay.' 
                  : 'Funds will be transferred directly to your Paytm wallet.'}
              </p>
            </div>

            {/* Amount Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Amount (INR)</label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition border ${
                      amount === amt && !customAmount
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <div className="pt-1">
                <input
                  type="number"
                  placeholder="Or enter custom amount (Min. ₹50)"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                onClick={handleWithdraw}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Withdrawal...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                    <span>Withdraw ₹{effectiveAmount.toFixed(2)} to {method}</span>
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-slate-500 mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                256-bit encrypted secure payout system
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
