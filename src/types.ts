export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  dailyStreak: number;
  lastCheckInDate?: string;
  referralCode: string;
  referredBy?: string;
  referralCount?: number;
  referralEarnings?: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'UPI' | 'PAYTM';
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  method: PaymentMethod;
  payoutDetails: string; // UPI ID or Paytm Number
  status: WithdrawalStatus;
  referenceId?: string; // Bank UTR or Transaction Ref
  createdAt: string;
}

export type TaskType = 
  | 'daily_checkin' 
  | 'ad_watch' 
  | 'quiz' 
  | 'scratch_card' 
  | 'spin_wheel' 
  | 'captcha' 
  | 'survey' 
  | 'referral';

export interface TaskActivity {
  id: string;
  userId: string;
  taskType: TaskType;
  taskTitle: string;
  rewardAmount: number;
  completedAt: string;
}

export interface ReferralRecord {
  id: string;
  referrerUserId: string;
  referrerCode: string;
  refereeUserId: string;
  refereeName?: string;
  refereeEmail?: string;
  rewardAmount: number;
  status: 'completed' | 'pending';
  createdAt: string;
}

export interface TaskCard {
  id: string;
  type: TaskType;
  title: string;
  hindiTitle?: string;
  description: string;
  reward: number; // in INR
  badge?: string;
  category: 'daily' | 'quick' | 'games' | 'surveys';
  icon: string;
  timeEstimate: string;
  limitPerDay: number;
}
