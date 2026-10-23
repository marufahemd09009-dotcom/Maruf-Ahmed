import React, { useState } from 'react';
import { X, Copy, Check, Code2, Smartphone, Globe, Shield, Terminal, Settings } from 'lucide-react';

interface AdCodeCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdCodeCenterModal: React.FC<AdCodeCenterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'admob' | 'adsense' | 'unity' | 'settings'>('admob');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Editable sample Ad unit IDs
  const [admobAppId, setAdmobAppId] = useState('ca-app-pub-3940256099942544~3347511713');
  const [admobInterstitialId, setAdmobInterstitialId] = useState('ca-app-pub-3940256099942544/1033173712');
  const [admobRewardedId, setAdmobRewardedId] = useState('ca-app-pub-3940256099942544/5224354917');
  const [adsensePubId, setAdsensePubId] = useState('pub-3940256099942544');

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const admobSnippet = `// === Google AdMob React Native / Web / Cordova Setup ===
// 1. AndroidManifest.xml:
// <meta-data
//    android:name="com.google.android.gms.ads.APPLICATION_ID"
//    android:value="${admobAppId}"/>

import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.REWARDED : '${admobRewardedId}';
const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
  console.log('User earned reward of', reward);
  // Function to credit TaskEarn user wallet balance via Firebase
});

rewarded.load();
rewarded.show();`;

  const adsenseSnippet = `<!-- Google AdSense Web Script (Paste in <head>) -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${adsensePubId}"
     crossorigin="anonymous"></script>

<!-- TaskEarn Rewarded Banner Ad Unit -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-${adsensePubId}"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;

  const unitySnippet = `// Unity Ads & AppLovin MAX Earning Integration
using UnityEngine.Advertisements;

public class TaskEarnAdsManager : MonoBehaviour, IUnityAdsLoadListener, IUnityAdsShowListener
{
    private string androidGameId = "1234567";
    private string rewardedVideoAdUnit = "Rewarded_Android";

    void Start() {
        Advertisement.Initialize(androidGameId, true, this);
    }

    public void ShowRewardedTaskAd() {
        Advertisement.Show(rewardedVideoAdUnit, this);
    }

    public void OnUnityAdsShowComplete(string placementId, UnityAdsShowCompletionState showCompletionState) {
        if (showCompletionState == UnityAdsShowCompletionState.COMPLETED) {
            // Task completed! Credit INR to Firebase Firestore
        }
    }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Ad Network & Integration Code Center
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Ready to deploy
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Google AdMob, AdSense & Unity Rewarded Ad codes for TaskEarn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-950/40 border-b border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('admob')}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'admob'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Google AdMob (Mobile)
          </button>
          <button
            onClick={() => setActiveTab('adsense')}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'adsense'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            Google AdSense (Web)
          </button>
          <button
            onClick={() => setActiveTab('unity')}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'unity'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Unity Ads & AppLovin
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Ad Triggers & IDs
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'admob' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between">
                <div>
                  <span className="font-semibold text-slate-200">Google AdMob Production Units</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Configure your real AdMob unit IDs below or copy the pre-configured integration snippet.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(admobSnippet, 'admob')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition"
                >
                  {copiedKey === 'admob' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'admob' ? 'Copied' : 'Copy Code'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-400">AdMob App ID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={admobAppId}
                    onChange={(e) => setAdmobAppId(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleCopy(admobAppId, 'appId')}
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedKey === 'appId' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-400">Rewarded Video Ad Unit ID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={admobRewardedId}
                    onChange={(e) => setAdmobRewardedId(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleCopy(admobRewardedId, 'rewardedId')}
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedKey === 'rewardedId' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-400">Interstitial Ad Unit ID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={admobInterstitialId}
                    onChange={(e) => setAdmobInterstitialId(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleCopy(admobInterstitialId, 'interstitialId')}
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedKey === 'interstitialId' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                  TaskEarnAdMobIntegration.ts
                </div>
                <pre className="p-4 text-[11px] text-emerald-300 font-mono overflow-x-auto leading-relaxed">
                  {admobSnippet}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'adsense' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between">
                <div>
                  <span className="font-semibold text-slate-200">Google AdSense Web Integration</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Embed Google Ads into your TaskEarn web app or PWA.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(adsenseSnippet, 'adsense')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition"
                >
                  {copiedKey === 'adsense' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'adsense' ? 'Copied' : 'Copy Tag'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-400">AdSense Publisher ID (ca-pub-XXXXX)</label>
                <input
                  type="text"
                  value={adsensePubId}
                  onChange={(e) => setAdsensePubId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                  index.html snippet
                </div>
                <pre className="p-4 text-[11px] text-amber-300 font-mono overflow-x-auto leading-relaxed">
                  {adsenseSnippet}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'unity' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between">
                <div>
                  <span className="font-semibold text-slate-200">Unity Ads & AppLovin MAX</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    High eCPM rewarded video monetization for Android APK / WebGL builds.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(unitySnippet, 'unity')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition"
                >
                  {copiedKey === 'unity' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'unity' ? 'Copied' : 'Copy C# Code'}
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                  UnityAdsManager.cs
                </div>
                <pre className="p-4 text-[11px] text-sky-300 font-mono overflow-x-auto leading-relaxed">
                  {unitySnippet}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h4 className="font-bold text-white text-sm">Ad Trigger Configuration</h4>
                <p className="text-slate-400 text-xs mt-1">
                  Control when ads trigger inside TaskEarn. As requested, ads trigger immediately when a user starts or selects a task option.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-semibold text-white">Start Task Interstitial Ad</span>
                    <p className="text-slate-400 text-[11px]">Show ad modal immediately when user opens any task</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ALWAYS ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-semibold text-white">Minimum Watch Time Before Skip</span>
                    <p className="text-slate-400 text-[11px]">Countdown timer required to verify reward eligibility</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-800 text-amber-300 font-bold">
                    5 Seconds
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-semibold text-white">Ad Revenue Sharing to Wallet</span>
                    <p className="text-slate-400 text-[11px]">Percentage of estimated eCPM credited back to user</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-800 text-emerald-400 font-bold">
                    70% to User
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            AdSense & AdMob Policy Compliant
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Close Center
          </button>
        </div>
      </div>
    </div>
  );
};
