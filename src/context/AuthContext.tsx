import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase';
import { UserProfile, WithdrawalRequest, TaskActivity, TaskType, PaymentMethod, ReferralRecord } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  activities: TaskActivity[];
  withdrawals: WithdrawalRequest[];
  referrals: ReferralRecord[];
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string, refCode?: string) => Promise<void>;
  loginAsDemoUser: () => Promise<void>;
  logout: () => Promise<void>;
  completeTask: (taskType: TaskType, title: string, amount: number) => Promise<void>;
  requestWithdrawal: (amount: number, method: PaymentMethod, payoutDetails: string) => Promise<WithdrawalRequest>;
  claimDailyCheckIn: () => Promise<{ success: boolean; reward: number; streak: number }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate random referral code
const generateReferralCode = (nameOrEmail: string): string => {
  const prefix = nameOrEmail.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'TASK';
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${rand}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Check URL query parameters for referral code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        localStorage.setItem('taskearn_ref_code', ref.toUpperCase().trim());
      }
    }
  }, []);

  // Initialize test connection
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Helper to ensure referral code mapping is registered in Firestore
  const ensureReferralCodeMapping = async (code: string, uid: string, displayName?: string) => {
    try {
      const mappingRef = doc(db, 'referralCodes', code);
      const snap = await getDoc(mappingRef);
      if (!snap.exists()) {
        await setDoc(mappingRef, {
          code,
          userId: uid,
          ownerName: displayName || 'TaskEarner',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Error recording referral code mapping:', e);
    }
  };

  // Listen to Auth State
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setActivities([]);
        setWithdrawals([]);
        setReferrals([]);
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) {
          const generatedCode = generateReferralCode(currentUser.displayName || currentUser.email || 'USER');
          const savedRefCode = typeof window !== 'undefined' ? localStorage.getItem('taskearn_ref_code') || '' : '';
          const startingBonus = savedRefCode ? 35.00 : 15.00;

          const newProfile: UserProfile = {
            userId: currentUser.uid,
            email: currentUser.email || `${currentUser.uid.slice(0, 8)}@taskearn.app`,
            displayName: currentUser.displayName || 'Task Earner',
            balance: startingBonus,
            totalEarned: startingBonus,
            totalWithdrawn: 0.00,
            dailyStreak: 0,
            lastCheckInDate: '',
            referralCode: generatedCode,
            referredBy: savedRefCode,
            referralCount: 0,
            referralEarnings: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);

          // Register referral code mapping
          await ensureReferralCodeMapping(generatedCode, currentUser.uid, newProfile.displayName);

          // If referred by someone, record referral attribution
          if (savedRefCode) {
            try {
              const codeSnap = await getDoc(doc(db, 'referralCodes', savedRefCode));
              if (codeSnap.exists()) {
                const referrerUserId = codeSnap.data().userId;
                const refRecordId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                await setDoc(doc(db, 'referrals', refRecordId), {
                  id: refRecordId,
                  referrerUserId,
                  referrerCode: savedRefCode,
                  refereeUserId: currentUser.uid,
                  refereeName: newProfile.displayName,
                  refereeEmail: newProfile.email,
                  rewardAmount: 25.00,
                  status: 'completed',
                  createdAt: new Date().toISOString(),
                });
              }
            } catch (err) {
              console.warn('Could not record referral attribution:', err);
            }
          }

          // Add welcome bonus activity
          const welcomeActId = `act_welcome_${Date.now()}`;
          await setDoc(doc(db, 'activities', welcomeActId), {
            id: welcomeActId,
            userId: currentUser.uid,
            taskType: 'referral',
            taskTitle: savedRefCode ? 'Welcome + Referral Bonus (₹35)' : 'Welcome Signup Bonus (₹15)',
            rewardAmount: startingBonus,
            completedAt: new Date().toISOString(),
          });
        } else {
          const loadedProfile = userSnap.data() as UserProfile;
          setProfile(loadedProfile);
          if (loadedProfile.referralCode) {
            ensureReferralCodeMapping(loadedProfile.referralCode, currentUser.uid, loadedProfile.displayName);
          }
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time listener for current user's profile
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsub = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });
    return () => unsub();
  }, [user]);

  // Real-time listener for user's activities
  useEffect(() => {
    if (!user) return;
    const actQuery = query(
      collection(db, 'activities'),
      where('userId', '==', user.uid)
    );
    const unsub = onSnapshot(actQuery, (snapshot) => {
      const items: TaskActivity[] = [];
      snapshot.forEach((d) => items.push(d.data() as TaskActivity));
      items.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      setActivities(items.slice(0, 50));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activities');
    });
    return () => unsub();
  }, [user]);

  // Real-time listener for user's withdrawals
  useEffect(() => {
    if (!user) return;
    const withQuery = query(
      collection(db, 'withdrawals'),
      where('userId', '==', user.uid)
    );
    const unsub = onSnapshot(withQuery, (snapshot) => {
      const items: WithdrawalRequest[] = [];
      snapshot.forEach((d) => items.push(d.data() as WithdrawalRequest));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setWithdrawals(items.slice(0, 50));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'withdrawals');
    });
    return () => unsub();
  }, [user]);

  // Real-time listener for referrals made by current user
  useEffect(() => {
    if (!user) return;
    const refQuery = query(
      collection(db, 'referrals'),
      where('referrerUserId', '==', user.uid)
    );
    const unsub = onSnapshot(refQuery, async (snapshot) => {
      const items: ReferralRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as ReferralRecord));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReferrals(items);

      // Auto-credit uncredited referral earnings to referrer's balance
      if (profile && items.length > 0) {
        const totalReferralAmountDue = items.length * 25.00;
        const currentReferralEarnings = profile.referralEarnings || 0;

        if (totalReferralAmountDue > currentReferralEarnings) {
          const delta = totalReferralAmountDue - currentReferralEarnings;
          const newBalance = Math.round((profile.balance + delta) * 100) / 100;
          const newTotalEarned = Math.round((profile.totalEarned + delta) * 100) / 100;

          try {
            await updateDoc(doc(db, 'users', user.uid), {
              balance: newBalance,
              totalEarned: newTotalEarned,
              referralCount: items.length,
              referralEarnings: totalReferralAmountDue,
              updatedAt: new Date().toISOString(),
            });

            // Log referral activity
            const actId = `act_ref_${Date.now()}`;
            await setDoc(doc(db, 'activities', actId), {
              id: actId,
              userId: user.uid,
              taskType: 'referral',
              taskTitle: `Referral Bonus: Friend Joined (+₹${delta.toFixed(2)})`,
              rewardAmount: delta,
              completedAt: new Date().toISOString(),
            });
          } catch (e) {
            console.error('Error auto-crediting referral earnings:', e);
          }
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'referrals');
    });
    return () => unsub();
  }, [user, profile?.userId]);

  // Login with Google Popup
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  // Login with Email
  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error('Email sign in error:', error);
      throw error;
    }
  };

  // Register with Email
  const registerWithEmail = async (email: string, pass: string, name?: string, refCode?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const finalRefCode = (refCode || (typeof window !== 'undefined' ? localStorage.getItem('taskearn_ref_code') : '') || '').toUpperCase().trim();
      const startingBonus = finalRefCode ? 35.00 : 15.00; // Extra ₹20 if referred!
      const userRefCode = generateReferralCode(name || email);

      const initialProfile: UserProfile = {
        userId: cred.user.uid,
        email: email,
        displayName: name || email.split('@')[0],
        balance: startingBonus,
        totalEarned: startingBonus,
        totalWithdrawn: 0.00,
        dailyStreak: 0,
        lastCheckInDate: '',
        referralCode: userRefCode,
        referredBy: finalRefCode,
        referralCount: 0,
        referralEarnings: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), initialProfile);
      setProfile(initialProfile);

      // Register code mapping
      await ensureReferralCodeMapping(userRefCode, cred.user.uid, initialProfile.displayName);

      // If referred, create referral record to credit referrer
      if (finalRefCode) {
        try {
          const mappingSnap = await getDoc(doc(db, 'referralCodes', finalRefCode));
          if (mappingSnap.exists()) {
            const referrerUserId = mappingSnap.data().userId;
            const refRecordId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await setDoc(doc(db, 'referrals', refRecordId), {
              id: refRecordId,
              referrerUserId,
              referrerCode: finalRefCode,
              refereeUserId: cred.user.uid,
              refereeName: initialProfile.displayName,
              refereeEmail: email,
              rewardAmount: 25.00,
              status: 'completed',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn('Error recording referral link:', e);
        }
      }

      // Add bonus log
      const actId = `act_signup_${Date.now()}`;
      await setDoc(doc(db, 'activities', actId), {
        id: actId,
        userId: cred.user.uid,
        taskType: 'referral',
        taskTitle: finalRefCode ? 'Welcome + Referral Bonus (₹35)' : 'Welcome Bonus (₹15)',
        rewardAmount: startingBonus,
        completedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Email registration error:', error);
      throw error;
    }
  };

  // Quick Demo Account (for effortless testing)
  const loginAsDemoUser = async () => {
    const demoEmail = `demo.user_${Math.floor(100 + Math.random() * 900)}@taskearn.app`;
    const demoPass = 'TaskEarnDemo123!';
    try {
      await registerWithEmail(demoEmail, demoPass, 'Demo Earner');
    } catch {
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      } catch (e) {
        console.error('Demo login fallback error', e);
      }
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
  };

  // Complete a task and credit wallet
  const completeTask = async (taskType: TaskType, title: string, amount: number) => {
    if (!user || !profile) throw new Error('User not logged in');

    const roundedAmount = Math.round(amount * 100) / 100;
    const newBalance = Math.round((profile.balance + roundedAmount) * 100) / 100;
    const newTotalEarned = Math.round((profile.totalEarned + roundedAmount) * 100) / 100;

    const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newActivity: TaskActivity = {
      id: activityId,
      userId: user.uid,
      taskType,
      taskTitle: title,
      rewardAmount: roundedAmount,
      completedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'activities', activityId), newActivity);
      
      await updateDoc(doc(db, 'users', user.uid), {
        balance: newBalance,
        totalEarned: newTotalEarned,
        updatedAt: new Date().toISOString(),
      });

      setProfile(prev => prev ? {
        ...prev,
        balance: newBalance,
        totalEarned: newTotalEarned,
      } : null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  // Daily Check-in Streak
  const claimDailyCheckIn = async (): Promise<{ success: boolean; reward: number; streak: number }> => {
    if (!user || !profile) throw new Error('User not logged in');

    const todayStr = new Date().toISOString().split('T')[0];
    if (profile.lastCheckInDate === todayStr) {
      return { success: false, reward: 0, streak: profile.dailyStreak };
    }

    let newStreak = 1;
    if (profile.lastCheckInDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (profile.lastCheckInDate === yesterdayStr) {
        newStreak = (profile.dailyStreak % 7) + 1;
      }
    }

    const streakRewards = [5, 7, 10, 12, 15, 20, 30];
    const reward = streakRewards[newStreak - 1] || 5;

    const newBalance = Math.round((profile.balance + reward) * 100) / 100;
    const newTotalEarned = Math.round((profile.totalEarned + reward) * 100) / 100;

    const activityId = `act_daily_${Date.now()}`;
    const newActivity: TaskActivity = {
      id: activityId,
      userId: user.uid,
      taskType: 'daily_checkin',
      taskTitle: `Day ${newStreak} Daily Check-In Bonus (₹${reward})`,
      rewardAmount: reward,
      completedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'activities', activityId), newActivity);
      await updateDoc(doc(db, 'users', user.uid), {
        balance: newBalance,
        totalEarned: newTotalEarned,
        dailyStreak: newStreak,
        lastCheckInDate: todayStr,
        updatedAt: new Date().toISOString(),
      });

      setProfile(prev => prev ? {
        ...prev,
        balance: newBalance,
        totalEarned: newTotalEarned,
        dailyStreak: newStreak,
        lastCheckInDate: todayStr,
      } : null);

      return { success: true, reward, streak: newStreak };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  // Submit Withdrawal Request
  const requestWithdrawal = async (
    amount: number, 
    method: PaymentMethod, 
    payoutDetails: string
  ): Promise<WithdrawalRequest> => {
    if (!user || !profile) throw new Error('User not logged in');
    if (profile.balance < amount) throw new Error('Insufficient wallet balance');
    if (amount < 50) throw new Error('Minimum withdrawal amount is ₹50');

    const newBalance = Math.round((profile.balance - amount) * 100) / 100;
    const newTotalWithdrawn = Math.round((profile.totalWithdrawn + amount) * 100) / 100;

    const withdrawalId = `wd_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const randomUtr = `${method}${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const newReq: WithdrawalRequest = {
      id: withdrawalId,
      userId: user.uid,
      userEmail: user.email || profile.email,
      amount,
      method,
      payoutDetails,
      status: 'pending',
      referenceId: randomUtr,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'withdrawals', withdrawalId), newReq);

      await updateDoc(doc(db, 'users', user.uid), {
        balance: newBalance,
        totalWithdrawn: newTotalWithdrawn,
        updatedAt: new Date().toISOString(),
      });

      const actId = `act_withdraw_${Date.now()}`;
      await setDoc(doc(db, 'activities', actId), {
        id: actId,
        userId: user.uid,
        taskType: 'referral',
        taskTitle: `Cashout via ${method} (${payoutDetails})`,
        rewardAmount: -amount,
        completedAt: new Date().toISOString(),
      });

      setTimeout(async () => {
        try {
          await updateDoc(doc(db, 'withdrawals', withdrawalId), {
            status: 'processing',
          });
        } catch {}
      }, 2500);

      setTimeout(async () => {
        try {
          await updateDoc(doc(db, 'withdrawals', withdrawalId), {
            status: 'completed',
          });
        } catch {}
      }, 6500);

      return newReq;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `withdrawals/${withdrawalId}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        activities,
        withdrawals,
        referrals,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsDemoUser,
        logout,
        completeTask,
        requestWithdrawal,
        claimDailyCheckIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
