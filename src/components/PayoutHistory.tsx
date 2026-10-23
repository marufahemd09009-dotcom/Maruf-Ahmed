import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  CreditCard, 
  Smartphone, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { WithdrawalRequest, WithdrawalStatus } from '../types';

interface PayoutHistoryProps {
  withdrawals: WithdrawalRequest[];
  onRequestWithdrawal: () => void;
}

export const PayoutHistory: React.FC<PayoutHistoryProps> = ({
  withdrawals,
  onRequestWithdrawal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate metrics
  const totalCompleted = withdrawals
    .filter((w) => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0);

  const totalPending = withdrawals
    .filter((w) => w.status === 'pending' || w.status === 'processing')
    .reduce((sum, w) => sum + w.amount, 0);

  const completedCount = withdrawals.filter((w) => w.status === 'completed').length;
  const pendingCount = withdrawals.filter((w) => w.status === 'pending' || w.status === 'processing').length;

  // Filtered withdrawals
  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesStatus = filterStatus === 'all' || w.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      w.payoutDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.referenceId && w.referenceId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      w.amount.toString().includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: WithdrawalStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Completed</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Payout History
                <span className="text-[11px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {withdrawals.length} Total
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live withdrawal requests and settlement status fetched directly from Firebase Firestore
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onRequestWithdrawal}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition"
        >
          <ArrowUpRight className="w-4 h-4 stroke-[3]" />
          <span>New Withdrawal</span>
        </button>
      </div>

      {/* Payout Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Settled */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Settled (Completed)
            </span>
            <p className="text-xl font-black font-mono text-emerald-400 mt-0.5">
              ₹{totalCompleted.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{completedCount} successful payouts</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Pending / In Review
            </span>
            <p className="text-xl font-black font-mono text-amber-400 mt-0.5">
              ₹{totalPending.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{pendingCount} requests in processing</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Supported Gateways
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                UPI Instant
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Paytm Wallet
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Instant Bank Settlement</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({withdrawals.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              filterStatus === 'pending'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({withdrawals.filter((w) => w.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('processing')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              filterStatus === 'processing'
                ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Processing ({withdrawals.filter((w) => w.status === 'processing').length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              filterStatus === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search UPI, Paytm, or UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Withdrawal Requests List */}
      {filteredWithdrawals.length === 0 ? (
        <div className="py-12 px-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">No Withdrawal Records Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery || filterStatus !== 'all'
                ? 'Try clearing your filters or search keywords to view records.'
                : 'Aapne abhi tak koi withdrawal request submit nahi ki hai. Tasks complete karein aur minimum ₹50 hote hi cashout karein.'}
            </p>
          </div>
          <button
            onClick={onRequestWithdrawal}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
          >
            Request Cashout Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWithdrawals.map((w) => {
            const dateObj = new Date(w.createdAt);
            const formattedDate = dateObj.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const formattedTime = dateObj.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });

            return (
              <div
                key={w.id}
                className="group relative p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                {/* Left: Method Icon & Details */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                      w.method === 'UPI'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        : 'bg-sky-500/10 text-sky-400 border border-sky-500/25'
                    }`}
                  >
                    {w.method === 'UPI' ? (
                      <CreditCard className="w-5 h-5" />
                    ) : (
                      <Smartphone className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">
                        {w.method === 'UPI' ? 'UPI Transfer' : 'Paytm Wallet Payout'}
                      </span>
                      {getStatusBadge(w.status)}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="text-slate-400">Account:</span>
                      <span className="font-mono font-medium text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {w.payoutDetails}
                      </span>
                    </div>

                    {w.referenceId && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                        <span>Bank UTR:</span>
                        <span className="font-mono text-slate-300">{w.referenceId}</span>
                        <button
                          onClick={() => handleCopy(w.referenceId!, w.id)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title="Copy Bank UTR"
                        >
                          {copiedId === w.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Timestamp */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
                  <div className="text-left sm:text-right">
                    <span className="text-lg sm:text-xl font-black font-mono text-emerald-400">
                      ₹{w.amount.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      INR Withdrawal
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 mt-1">
                    <span>{formattedDate}</span>
                    <span className="mx-1 text-slate-600">•</span>
                    <span>{formattedTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Security & Support Guarantee Footer */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Automated payouts powered by NPCI UPI rails & Paytm API. Settlements typically process within 5 to 15 minutes.
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
          Synced with Firestore ai-studio-4c937a52
        </span>
      </div>
    </div>
  );
};
