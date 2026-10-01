import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BodyMetric, UserProfile } from '../types';
import { getDefaultGeminiApiKey } from '../services/gemini';
import {
  User,
  Users,
  TrendingUp,
  Scale,
  Settings as SettingsIcon,
  Cloud,
  Key,
  Database,
  Plus,
  Calendar,
  CheckCircle2,
  Download,
  Upload,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  FileSpreadsheet,
  Ruler,
  Target,
  Flame,
  Trash2,
} from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { NumberTicker } from '../components/ui/NumberTicker';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { PigMascot } from '../components/ui/PigMascot';
import { GoalSetupModal } from '../components/goals/GoalSetupModal';

export const ProfileView: React.FC = () => {
  const {
    activeProfileKey,
    setActiveProfileKey,
    currentProfile,
    partnerProfile,
    updateProfile,
    bodyMetrics,
    allBodyMetrics,
    addBodyMetric,
    deleteBodyMetric,
    clearAllBodyMetrics,
    settings,
    updateSettings,
    workoutHistory,
    foodLogs,
    syncAllToGoogleSheets,
    isSyncing,
    openUnifiedSpreadsheet,
    unifiedSpreadsheetUrl,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'stats' | 'profile' | 'settings'>('stats');

  // Goal Setup Modal
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Chart Metric Toggle
  type ChartMetricType =
    | 'weight_kg'
    | 'height_cm'
    | 'waist_cm'
    | 'chest_cm'
    | 'shoulders_cm'
    | 'hips_cm'
    | 'thigh_cm'
    | 'arm_cm'
    | 'calf_cm'
    | 'neck_cm'
    | 'body_fat_pct';
  const [chartMetric, setChartMetric] = useState<ChartMetricType>('weight_kg');

  // New Metric Modal States (All Circumferences & Height)
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [newMetricDate, setNewMetricDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMetricWeight, setNewMetricWeight] = useState(72.0);
  const [newMetricHeight, setNewMetricHeight] = useState<number | undefined>(currentProfile.height_cm || 170);
  const [newMetricFat, setNewMetricFat] = useState<number | undefined>(16.0);
  const [newMetricWaist, setNewMetricWaist] = useState<number | undefined>(80);
  const [newMetricChest, setNewMetricChest] = useState<number | undefined>(undefined);
  const [newMetricShoulders, setNewMetricShoulders] = useState<number | undefined>(undefined);
  const [newMetricThigh, setNewMetricThigh] = useState<number | undefined>(undefined);
  const [newMetricHips, setNewMetricHips] = useState<number | undefined>(undefined);
  const [newMetricArm, setNewMetricArm] = useState<number | undefined>(undefined);
  const [newMetricCalf, setNewMetricCalf] = useState<number | undefined>(undefined);
  const [newMetricNeck, setNewMetricNeck] = useState<number | undefined>(undefined);
  const [newMetricNote, setNewMetricNote] = useState('');

  // Editable Profile States
  const [editName, setEditName] = useState(currentProfile.name);
  const [editHeight, setEditHeight] = useState(currentProfile.height_cm);
  const [editGoal, setEditGoal] = useState(currentProfile.goal);
  const [editKcal, setEditKcal] = useState(currentProfile.kcal_target);
  const [editProtein, setEditProtein] = useState(currentProfile.protein_target_g);
  const [editCarb, setEditCarb] = useState(currentProfile.carb_target_g || 200);
  const [editFat, setEditFat] = useState(currentProfile.fat_target_g || 60);
  const [editWaist, setEditWaist] = useState<number | undefined>(currentProfile.waist_cm);
  const [editChest, setEditChest] = useState<number | undefined>(currentProfile.chest_cm);
  const [editShoulders, setEditShoulders] = useState<number | undefined>(currentProfile.shoulders_cm);
  const [editThigh, setEditThigh] = useState<number | undefined>(currentProfile.thigh_cm);
  const [editHips, setEditHips] = useState<number | undefined>(currentProfile.hips_cm);
  const [editArm, setEditArm] = useState<number | undefined>(currentProfile.arm_cm);
  const [editCalf, setEditCalf] = useState<number | undefined>(currentProfile.calf_cm);
  const [editNeck, setEditNeck] = useState<number | undefined>(currentProfile.neck_cm);

  // Sync profile edit states whenever active profile changes
  useEffect(() => {
    setEditName(currentProfile.name);
    setEditHeight(currentProfile.height_cm);
    setEditGoal(currentProfile.goal);
    setEditKcal(currentProfile.kcal_target);
    setEditProtein(currentProfile.protein_target_g);
    setEditCarb(currentProfile.carb_target_g || 200);
    setEditFat(currentProfile.fat_target_g || 60);
    setEditWaist(currentProfile.waist_cm);
    setEditChest(currentProfile.chest_cm);
    setEditShoulders(currentProfile.shoulders_cm);
    setEditThigh(currentProfile.thigh_cm);
    setEditHips(currentProfile.hips_cm);
    setEditArm(currentProfile.arm_cm);
    setEditCalf(currentProfile.calf_cm);
    setEditNeck(currentProfile.neck_cm);
  }, [currentProfile, activeProfileKey]);

  // Settings inputs
  const [clientId, setClientId] = useState(settings.googleClientId || '');
  const [spreadsheetId, setSpreadsheetId] = useState(
    activeProfileKey === 'primary' ? settings.primarySpreadsheetId || '' : settings.partnerSpreadsheetId || ''
  );
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || getDefaultGeminiApiKey());
  const [geminiProxy, setGeminiProxy] = useState(settings.geminiProxyUrl || '');
  const [appsScriptUrl, setAppsScriptUrl] = useState(settings.appsScriptUrl || '');
  const [useProxy, setUseProxy] = useState(settings.useProxy || false);

  // Sorted metrics
  const sortedMetrics = [...bodyMetrics].sort((a, b) => a.date.localeCompare(b.date));
  const latestMetric = sortedMetrics[sortedMetrics.length - 1];
  const firstMetric = sortedMetrics[0];

  // Open Metric Modal with smart prefill from latest metric or profile
  const openMetricModal = () => {
    setNewMetricDate(new Date().toISOString().split('T')[0]);
    setNewMetricWeight(latestMetric ? latestMetric.weight_kg : 70.0);
    setNewMetricHeight(latestMetric?.height_cm ?? currentProfile.height_cm ?? 170);
    setNewMetricFat(latestMetric?.body_fat_pct);
    setNewMetricWaist(latestMetric?.waist_cm ?? currentProfile.waist_cm);
    setNewMetricChest(latestMetric?.chest_cm ?? currentProfile.chest_cm);
    setNewMetricShoulders(latestMetric?.shoulders_cm ?? currentProfile.shoulders_cm);
    setNewMetricThigh(latestMetric?.thigh_cm ?? currentProfile.thigh_cm);
    setNewMetricHips(latestMetric?.hips_cm ?? currentProfile.hips_cm);
    setNewMetricArm(latestMetric?.arm_cm ?? currentProfile.arm_cm);
    setNewMetricCalf(latestMetric?.calf_cm ?? currentProfile.calf_cm);
    setNewMetricNeck(latestMetric?.neck_cm ?? currentProfile.neck_cm);
    setNewMetricNote('');
    setShowMetricModal(true);
  };

  // Calculate BMI
  const heightM = (latestMetric?.height_cm || currentProfile.height_cm || 170) / 100;
  const currentWeightKg = latestMetric ? latestMetric.weight_kg : 70;
  const bmi = (currentWeightKg / (heightM * heightM)).toFixed(1);

  // Calculate weekly workout volume
  const totalVolumeAllTime = workoutHistory.reduce((sum, sess) => {
    const completedSets = sess.sets?.filter((s) => s.done) || [];
    return sum + completedSets.reduce((sSum, s) => sSum + s.weight_kg * s.reps, 0);
  }, 0);

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBodyMetric({
      date: newMetricDate,
      weight_kg: newMetricWeight,
      height_cm: newMetricHeight,
      body_fat_pct: newMetricFat,
      waist_cm: newMetricWaist,
      chest_cm: newMetricChest,
      shoulders_cm: newMetricShoulders,
      thigh_cm: newMetricThigh,
      hips_cm: newMetricHips,
      arm_cm: newMetricArm,
      calf_cm: newMetricCalf,
      neck_cm: newMetricNeck,
      note: newMetricNote.trim() || undefined,
    });
    // Also sync height back to current profile if updated
    if (newMetricHeight && newMetricHeight !== currentProfile.height_cm) {
      updateProfile({ height_cm: newMetricHeight });
    }
    setShowMetricModal(false);
    setNewMetricNote('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      height_cm: editHeight,
      goal: editGoal,
      kcal_target: editKcal,
      protein_target_g: editProtein,
      carb_target_g: editCarb,
      fat_target_g: editFat,
      waist_cm: editWaist,
      chest_cm: editChest,
      shoulders_cm: editShoulders,
      thigh_cm: editThigh,
      hips_cm: editHips,
      arm_cm: editArm,
      calf_cm: editCalf,
      neck_cm: editNeck,
    });
    alert('บันทึกการแก้ไขโปรไฟล์และสัดส่วนสำเร็จแล้ว!');
  };

  const handleSaveSettings = () => {
    updateSettings({
      googleClientId: clientId,
      [activeProfileKey === 'primary' ? 'primarySpreadsheetId' : 'partnerSpreadsheetId']: spreadsheetId,
      appsScriptUrl,
      geminiApiKey: geminiKey,
      geminiProxyUrl: geminiProxy,
      useProxy,
    });
    alert('บันทึกการตั้งค่าแล้ว!');
  };

  // Google OAuth Login trigger via GIS token client
  const handleGoogleLogin = () => {
    if (!settings.googleClientId && !clientId) {
      alert('กรุณากรอก Google Client ID ในช่องด้านล่างก่อนเริ่มการเชื่อมต่อ');
      return;
    }

    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
        // @ts-ignore
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId || settings.googleClientId,
          scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              updateSettings({
                googleAccessToken: tokenResponse.access_token,
                autoSyncGoogleSheets: true,
              });
              alert('เข้าสู่ระบบด้วย Google สำเร็จแล้ว! พร้อมสร้างหรือเชื่อมต่อ Google Sheet');
            }
          },
        });
        tokenClient.requestAccessToken();
      } else {
        alert('Google Identity Services SDK กำลังโหลด กรุณารอสักครู่แล้วลองอีกครั้ง');
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ Google: ' + err.message);
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    const backupData = {
      profile: currentProfile,
      metrics: bodyMetrics,
      foodLogs,
      workoutHistory,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mooauan-backup-${activeProfileKey}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Profile Selector Banner with Pig Mascot */}
      <div className="bg-white/95 p-5 rounded-3xl border border-pink-200/90 shadow-md shadow-pink-100/50 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center p-1 rounded-2xl bg-gradient-to-tr from-pink-200 via-rose-200 to-pink-100 shadow-sm shadow-pink-300/30">
            <PigMascot
              size="md"
              expression={activeProfileKey === 'partner' ? 'cheer' : 'strong'}
              className="drop-shadow-xs"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-700">{currentProfile.name}</h2>
              <span className="text-[11px] bg-pink-100 text-rose-700 border border-pink-200 px-2.5 py-0.5 rounded-full font-bold">
                {activeProfileKey === 'primary' ? '🏋️‍♂️ หมูอ้วนเทรนเนอร์' : '🌸 หมูอ้วนหวานแหวว'}
              </span>
            </div>
            <p className="text-xs text-pink-800/70 mt-0.5">
              เป้าหมาย: <strong className="text-rose-600">{currentProfile.goal}</strong>
            </p>
          </div>
        </div>

        {/* Toggle Account Pill */}
        <button
          onClick={() => setActiveProfileKey(activeProfileKey === 'primary' ? 'partner' : 'primary')}
          className="px-3.5 py-2 rounded-2xl bg-pink-50 hover:bg-pink-100/80 border border-pink-200 text-xs font-bold text-pink-900 flex items-center gap-1.5 transition active:scale-95 shadow-xs"
        >
          <Users size={14} className="text-rose-500" />
          <span>สลับโปรไฟล์</span>
        </button>
      </div>

      {/* Sub-tab navigation: สถิติร่างกาย / ข้อมูลส่วนตัว / ตั้งค่า Google Sheet */}
      <div className="flex items-center p-1.5 bg-white/95 rounded-2xl border border-pink-200/90 gap-1.5 shadow-xs">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
              : 'text-pink-900/70 hover:text-slate-700 hover:bg-pink-50/60'
          }`}
        >
          <TrendingUp size={16} />
          สถิติ & ความก้าวหน้า
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
              : 'text-pink-900/70 hover:text-slate-700 hover:bg-pink-50/60'
          }`}
        >
          <User size={16} />
          ข้อมูลส่วนตัว
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
              : 'text-pink-900/70 hover:text-slate-700 hover:bg-pink-50/60'
          }`}
        >
          <SettingsIcon size={16} />
          Google & API
        </button>
      </div>

      {/* TAB 1: STATS & PROGRESS */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          {/* Smart Goal & Sports Nutrition Calculator Banner */}
          <div className="bg-gradient-to-r from-pink-400 via-rose-300 to-pink-300 p-4 sm:p-5 rounded-3xl shadow-lg shadow-pink-500/20 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner shrink-0">
                🎯
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black tracking-tight">คำนวณเป้าหมาย & สารอาหารอัจฉริยะ</h3>
                  <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold">Smart Goal</span>
                </div>
                <p className="text-xs text-pink-100 mt-0.5">
                  เลือกเป้าหมาย (Hard Bulk, Lean Bulk, Cut, Recomp) คำนวณแคลอรี่ โปรตีน คาร์บ ไขมัน พร้อมหลักฐานทางวิทยาศาสตร์
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGoalModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-white text-rose-600 hover:bg-pink-50 font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition whitespace-nowrap shrink-0"
            >
              <Sparkles size={14} className="text-rose-500" />
              <span>คำนวณเป้าหมายตอนนี้</span>
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MagicCard spotlightColor="rgba(244, 63, 94, 0.12)" className="p-4 bg-white/95 border-pink-200/90 shadow-sm">
              <span className="text-xs text-pink-800/70 flex items-center gap-1 font-bold">
                <Scale size={14} className="text-rose-500" /> น้ำหนักล่าสุด
              </span>
              <p className="text-xl font-black text-slate-700 mt-1">
                {currentWeightKg} <span className="text-xs text-pink-600 font-normal">kg</span>
              </p>
            </MagicCard>

            <MagicCard spotlightColor="rgba(56, 189, 248, 0.12)" className="p-4 bg-white/95 border-pink-200/90 shadow-sm">
              <span className="text-xs text-pink-800/70 flex items-center gap-1 font-bold">
                <Sparkles size={14} className="text-sky-500" /> Body Fat %
              </span>
              <p className="text-xl font-black text-slate-700 mt-1">
                {latestMetric?.body_fat_pct ? `${latestMetric.body_fat_pct}%` : '–'}
              </p>
            </MagicCard>

            <MagicCard spotlightColor="rgba(168, 85, 247, 0.12)" className="p-4 bg-white/95 border-pink-200/90 shadow-sm">
              <span className="text-xs text-pink-800/70 font-bold">ค่า BMI</span>
              <p className="text-xl font-black text-slate-700 mt-1">
                {bmi} <span className="text-xs text-emerald-600 font-bold">ปกติ</span>
              </p>
            </MagicCard>

            <MagicCard spotlightColor="rgba(244, 63, 94, 0.12)" className="p-4 bg-white/95 border-pink-200/90 shadow-sm">
              <span className="text-xs text-pink-800/70 font-bold">Total Volume ยกสะสม</span>
              <p className="text-xl font-black text-rose-600 mt-1 font-mono">
                <NumberTicker value={totalVolumeAllTime} />{' '}
                <span className="text-xs text-pink-700 font-normal">kg</span>
              </p>
            </MagicCard>
          </div>

          {/* Body Circumferences Highlights (สัดส่วนร่างกายล่าสุด) */}
          <div className="bg-white/95 p-5 rounded-3xl border border-pink-200/90 shadow-md shadow-pink-100/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                  <Ruler size={18} className="text-rose-500" />
                  สัดส่วนร่างกายล่าสุด (Body Circumferences)
                </h3>
                <p className="text-xs text-pink-800/70">รอบอก ไหล่ เอว สะโพก ต้นขา แขน น่อง คอ</p>
              </div>
              <button
                onClick={openMetricModal}
                className="px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-rose-700 border border-pink-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <Plus size={14} />
                <span>บันทึกสัดส่วน</span>
              </button>
            </div>

            {/* Circumferences Grid */}
            {(() => {
              const circumItems = [
                {
                  key: 'waist_cm' as const,
                  label: 'รอบเอว (Waist)',
                  icon: '⏳',
                  current: latestMetric?.waist_cm ?? currentProfile.waist_cm,
                  first: firstMetric?.waist_cm,
                  isLowerBetter: true,
                },
                {
                  key: 'chest_cm' as const,
                  label: 'รอบอก (Chest)',
                  icon: '👕',
                  current: latestMetric?.chest_cm ?? currentProfile.chest_cm,
                  first: firstMetric?.chest_cm,
                  isLowerBetter: false,
                },
                {
                  key: 'shoulders_cm' as const,
                  label: 'รอบไหล่ (Shoulders)',
                  icon: '🥋',
                  current: latestMetric?.shoulders_cm ?? currentProfile.shoulders_cm,
                  first: firstMetric?.shoulders_cm,
                  isLowerBetter: false,
                },
                {
                  key: 'hips_cm' as const,
                  label: 'รอบสะโพก (Hips)',
                  icon: '🍑',
                  current: latestMetric?.hips_cm ?? currentProfile.hips_cm,
                  first: firstMetric?.hips_cm,
                  isLowerBetter: false,
                },
                {
                  key: 'thigh_cm' as const,
                  label: 'รอบต้นขา (Thighs)',
                  icon: '🦵',
                  current: latestMetric?.thigh_cm ?? currentProfile.thigh_cm,
                  first: firstMetric?.thigh_cm,
                  isLowerBetter: false,
                },
                {
                  key: 'arm_cm' as const,
                  label: 'รอบต้นแขน (Arms)',
                  icon: '💪',
                  current: latestMetric?.arm_cm ?? currentProfile.arm_cm,
                  first: firstMetric?.arm_cm,
                  isLowerBetter: false,
                },
                {
                  key: 'calf_cm' as const,
                  label: 'รอบน่อง (Calves)',
                  icon: '🦶',
                  current: latestMetric?.calf_cm ?? currentProfile.calf_cm,
                  first: firstMetric?.calf_cm,
                  isLowerBetter: false,
                },
                {
                  key: 'neck_cm' as const,
                  label: 'รอบคอ (Neck)',
                  icon: '👔',
                  current: latestMetric?.neck_cm ?? currentProfile.neck_cm,
                  first: firstMetric?.neck_cm,
                  isLowerBetter: true,
                },
              ];

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {circumItems.map((item) => {
                    const diff = item.first && item.current ? item.current - item.first : undefined;
                    return (
                      <div
                        key={item.key}
                        onClick={() => {
                          setChartMetric(item.key);
                        }}
                        className={`p-3 rounded-2xl border transition cursor-pointer select-none ${
                          chartMetric === item.key
                            ? 'bg-rose-50/90 border-rose-400 shadow-sm shadow-rose-100'
                            : 'bg-pink-50/40 border-pink-200/80 hover:border-pink-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-pink-800/70 font-semibold">
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-lg font-black text-slate-700">
                            {item.current ? `${item.current}` : '–'}{' '}
                            <span className="text-[11px] font-normal text-pink-700">cm</span>
                          </span>
                          {diff !== undefined && diff !== 0 && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                (item.isLowerBetter ? diff < 0 : diff > 0)
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {diff > 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Interactive Progress Trend Chart (SVG Line Graph with Metric Switcher) */}
          <div className="bg-white/95 p-5 rounded-3xl border border-pink-200/90 shadow-md shadow-pink-100/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                  <TrendingUp size={18} className="text-rose-500" />
                  กราฟแนวโน้มความก้าวหน้า
                </h3>
                <p className="text-xs text-pink-800/70">แตะเพื่อดูกราฟแต่ละสัดส่วนหรือน้ำหนักตัว</p>
              </div>

              <button
                onClick={openMetricModal}
                className="py-1.5 px-3 self-start sm:self-auto rounded-xl bg-pink-100 hover:bg-pink-200 text-rose-700 border border-pink-200 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition"
              >
                <Plus size={14} />
                <span>บันทึกสัดส่วน/น้ำหนัก</span>
              </button>
            </div>

            {/* Metric Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { key: 'weight_kg' as const, label: '⚖️ น้ำหนัก (kg)' },
                { key: 'height_cm' as const, label: '📏 ส่วนสูง (cm)' },
                { key: 'waist_cm' as const, label: '⏳ รอบเอว' },
                { key: 'chest_cm' as const, label: '👕 รอบอก' },
                { key: 'shoulders_cm' as const, label: '🥋 ไหล่' },
                { key: 'hips_cm' as const, label: '🍑 สะโพก' },
                { key: 'thigh_cm' as const, label: '🦵 ต้นขา' },
                { key: 'arm_cm' as const, label: '💪 รอบแขน' },
                { key: 'calf_cm' as const, label: '🦶 น่อง' },
                { key: 'neck_cm' as const, label: '👔 คอ' },
                { key: 'body_fat_pct' as const, label: '✨ % ไขมัน' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setChartMetric(opt.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 ${
                    chartMetric === opt.key
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                      : 'bg-pink-50/70 text-pink-900/70 border border-pink-200/80 hover:bg-pink-100 hover:text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* SVG Chart */}
            {(() => {
              const activeChartPoints = sortedMetrics
                .filter((m) => typeof m[chartMetric] === 'number' && (m[chartMetric] as number) > 0)
                .map((m) => ({
                  date: m.date,
                  value: m[chartMetric] as number,
                }));

              const unit = chartMetric === 'weight_kg' ? 'kg' : chartMetric === 'body_fat_pct' ? '%' : 'cm';

              if (activeChartPoints.length < 2) {
                return (
                  <div className="h-44 flex flex-col items-center justify-center text-xs text-pink-700/70 bg-pink-50/50 rounded-2xl border border-pink-200 space-y-2 p-4 text-center">
                    <Ruler size={24} className="text-pink-400" />
                    <p>ต้องการข้อมูลอย่างน้อย 2 บันทึกเพื่อพล็อตกราฟเส้นนี้</p>
                    <button
                      onClick={openMetricModal}
                      className="px-3 py-1 bg-white text-rose-600 rounded-lg hover:bg-pink-100 font-bold border border-pink-200 shadow-xs"
                    >
                      + เพิ่มบันทึกข้อมูล
                    </button>
                  </div>
                );
              }

              const values = activeChartPoints.map((p) => p.value);
              const minV = Math.min(...values) - 0.5;
              const maxV = Math.max(...values) + 0.5;
              const range = maxV - minV || 1;

              const points = activeChartPoints.map((p, idx) => {
                const x = (idx / (activeChartPoints.length - 1)) * 380 + 10;
                const y = 110 - ((p.value - minV) / range) * 95;
                return { x, y, value: p.value, date: p.date };
              });

              const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
              const areaD = `${pathD} L ${points[points.length - 1].x} 120 L ${points[0].x} 120 Z`;

              return (
                <div className="space-y-2">
                  <div className="w-full h-44 bg-pink-50/40 rounded-2xl border border-pink-200 p-3 relative flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
                      <defs>
                        <linearGradient id="chartGradientPink" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <path d={areaD} fill="url(#chartGradientPink)" />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#f43f5e" strokeWidth="2.5" />
                          <text
                            x={p.x}
                            y={p.y - 8}
                            fill="#9f1239"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {p.value}{unit}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* X axis dates */}
                  <div className="flex items-center justify-between text-[10px] text-pink-700/70 px-2 font-medium">
                    <span>{activeChartPoints[0].date}</span>
                    <span>{activeChartPoints[activeChartPoints.length - 1].date}</span>
                  </div>
                </div>
              );
            })()}

            {/* Metrics History Table with All Circumferences */}
            <div className="mt-4 pt-3 border-t border-pink-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-pink-900 block">
                  ประวัติการบันทึกสัดส่วน & น้ำหนัก ({sortedMetrics.length} บันทึก):
                </span>
                {allBodyMetrics.length > 0 && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'คุณต้องการล้างประวัติการบันทึกสัดส่วนและน้ำหนักของทุกคนใช่หรือไม่?\n\n(หมายเหตุ: โปรแกรมการฝึก Routines และท่าออกกำลังกายจะถูกเก็บรักษาไว้ทั้งหมดเหมือนเดิม)'
                        )
                      ) {
                        clearAllBodyMetrics();
                        alert('ล้างประวัติสัดส่วนของทุกคนเรียบร้อยแล้ว!');
                      }
                    }}
                    className="text-[11px] text-rose-500 hover:text-rose-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>ล้างประวัติสัดส่วนทั้งหมด</span>
                  </button>
                )}
              </div>

              {sortedMetrics.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-pink-50/30 rounded-2xl border border-pink-100 space-y-1.5">
                  <p className="font-semibold text-slate-600">ยังไม่มีประวัติการบันทึกสัดส่วน & น้ำหนักตัว</p>
                  <p className="text-[11px] text-slate-400">
                    แตะปุ่ม "+ บันทึกสัดส่วน/น้ำหนัก" ด้านบน เพื่อเริ่มบันทึกครั้งแรก
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {sortedMetrics.slice().reverse().map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="p-3 rounded-2xl bg-pink-50/40 border border-pink-200/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-pink-800/70 flex items-center gap-1.5 font-bold">
                          <Calendar size={13} className="text-rose-500" /> {m.date}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-700 bg-white border border-pink-200 px-2 py-0.5 rounded-lg shadow-2xs">
                            {m.weight_kg} kg
                          </span>
                          {(m.height_cm || currentProfile.height_cm) && (
                            <span className="text-pink-900 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded-lg font-bold">
                              📏 {m.height_cm || currentProfile.height_cm} cm
                            </span>
                          )}
                          {(() => {
                            const h = m.height_cm || currentProfile.height_cm;
                            if (!h) return null;
                            const bmiVal = (m.weight_kg / Math.pow(h / 100, 2)).toFixed(1);
                            return (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-lg font-bold">
                                BMI {bmiVal}
                              </span>
                            );
                          })()}
                          {m.body_fat_pct && (
                            <span className="text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-lg font-bold">
                              {m.body_fat_pct}% fat
                            </span>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`ต้องการลบบันทึกสัดส่วนวันที่ ${m.date} หรือไม่?`)) {
                                deleteBodyMetric(m.id || m.date);
                              }
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                            title="ลบบันทึกนี้"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Circumference Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {m.waist_cm && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-medium">
                            เอว {m.waist_cm} cm
                          </span>
                        )}
                        {m.chest_cm && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-medium">
                            อก {m.chest_cm} cm
                          </span>
                        )}
                        {m.shoulders_cm && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-medium">
                            ไหล่ {m.shoulders_cm} cm
                          </span>
                        )}
                        {m.hips_cm && (
                          <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-800 border border-pink-200 text-[11px] font-medium">
                            สะโพก {m.hips_cm} cm
                          </span>
                        )}
                        {m.thigh_cm && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium">
                            ต้นขา {m.thigh_cm} cm
                          </span>
                        )}
                        {m.arm_cm && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-medium">
                            แขน {m.arm_cm} cm
                          </span>
                        )}
                        {m.calf_cm && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-medium">
                            น่อง {m.calf_cm} cm
                          </span>
                        )}
                        {m.neck_cm && (
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200 text-[11px] font-medium">
                            คอ {m.neck_cm} cm
                          </span>
                        )}
                      </div>

                      {m.note && (
                        <p className="text-[11px] text-pink-900/80 italic bg-white/80 px-2 py-1 rounded-lg border border-pink-100">
                          "{m.note}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white/95 p-6 rounded-3xl border border-pink-200/90 shadow-md shadow-pink-100/50 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-100">
            <div>
              <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                <User size={18} className="text-rose-500" />
                ข้อมูลผู้ใช้ & เป้าหมายโภชนาการ ({currentProfile.name})
              </h3>
              <p className="text-xs text-pink-800/70 mt-0.5">
                ตั้งค่าส่วนสูง เป้าหมาย และปริมาณสารอาหาร หรือกดคำนวณอัตโนมัติตามหลักวิทยาศาสตร์
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGoalModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-pink-300 active:scale-95 transition shrink-0"
            >
              <Target size={14} />
              <span>🎯 คำนวณ Goal อัตโนมัติ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-pink-900 mb-1">ชื่อเล่น / ชื่อเรียก</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:border-rose-400 focus:bg-white font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-pink-900 mb-1">ส่วนสูง (ซม.)</label>
              <input
                type="number"
                value={editHeight}
                onChange={(e) => setEditHeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:border-rose-400 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-pink-900 mb-1">เป้าหมายการฝึก</label>
            <input
              type="text"
              value={editGoal}
              onChange={(e) => setEditGoal(e.target.value)}
              className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:border-rose-400 focus:bg-white font-medium"
            />
          </div>

          {/* Nutrition Targets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-amber-700 mb-1">แคลอรี่/วัน (kcal)</label>
              <input
                type="number"
                value={editKcal}
                onChange={(e) => setEditKcal(parseFloat(e.target.value) || 0)}
                className="w-full bg-amber-50/60 border border-amber-200 rounded-xl px-3 py-2.5 text-amber-950 focus:outline-none focus:border-amber-400 focus:bg-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-sky-700 mb-1">โปรตีน/วัน (g)</label>
              <input
                type="number"
                value={editProtein}
                onChange={(e) => setEditProtein(parseFloat(e.target.value) || 0)}
                className="w-full bg-sky-50/60 border border-sky-200 rounded-xl px-3 py-2.5 text-sky-950 focus:outline-none focus:border-sky-400 focus:bg-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-emerald-700 mb-1">คาร์บ/วัน (g)</label>
              <input
                type="number"
                value={editCarb}
                onChange={(e) => setEditCarb(parseFloat(e.target.value) || 0)}
                className="w-full bg-emerald-50/60 border border-emerald-200 rounded-xl px-3 py-2.5 text-emerald-950 focus:outline-none focus:border-emerald-400 focus:bg-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-rose-700 mb-1">ไขมัน/วัน (g)</label>
              <input
                type="number"
                value={editFat}
                onChange={(e) => setEditFat(parseFloat(e.target.value) || 0)}
                className="w-full bg-rose-50/60 border border-rose-200 rounded-xl px-3 py-2.5 text-rose-950 focus:outline-none focus:border-rose-400 focus:bg-white font-bold"
              />
            </div>
          </div>

          {/* Body Circumferences Targets / Baselines */}
          <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Ruler size={15} className="text-rose-500" />
                สัดส่วนร่างกายมาตรฐาน / ปัจจุบัน (ซม. - cm)
              </span>
              <span className="text-[11px] text-pink-700">กรอกเพื่อบันทึกลงโปรไฟล์</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-pink-900 font-semibold mb-1">👕 รอบอก (Chest)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 102"
                  value={editChest ?? ''}
                  onChange={(e) => setEditChest(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">🥋 รอบไหล่ (Shoulders)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 118"
                  value={editShoulders ?? ''}
                  onChange={(e) => setEditShoulders(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">⏳ รอบเอว (Waist)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 79"
                  value={editWaist ?? ''}
                  onChange={(e) => setEditWaist(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">🍑 รอบสะโพก (Hips)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 94"
                  value={editHips ?? ''}
                  onChange={(e) => setEditHips(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">🦵 รอบต้นขา (Thighs)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 58"
                  value={editThigh ?? ''}
                  onChange={(e) => setEditThigh(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">💪 รอบต้นแขน (Arms)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 36"
                  value={editArm ?? ''}
                  onChange={(e) => setEditArm(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">🦶 รอบน่อง (Calves)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 37"
                  value={editCalf ?? ''}
                  onChange={(e) => setEditCalf(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">👔 รอบคอ (Neck)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 38"
                  value={editNeck ?? ''}
                  onChange={(e) => setEditNeck(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-300 hover:from-rose-600 hover:to-pink-600 text-white font-black text-sm shadow-md shadow-rose-200 active:scale-95 transition"
            >
              บันทึกข้อมูลโปรไฟล์และสัดส่วน
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: GOOGLE SHEETS & GEMINI API SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-5">
          {/* Google Sheets Integration Card */}
          <div className="bg-white/95 p-6 rounded-3xl border border-pink-200/90 shadow-md shadow-pink-100/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                <Database size={18} className="text-rose-500" />
                เชื่อมต่อ Google Sheets API v4
              </h3>
              {settings.googleAccessToken ? (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 font-bold">
                  <CheckCircle2 size={13} /> เชื่อมต่อแล้ว
                </span>
              ) : (
                <span className="text-xs text-pink-700 bg-pink-100 px-2 py-0.5 rounded font-bold">
                  ยังไม่ได้เชื่อมต่อ
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-700 font-bold flex items-center gap-1.5">
                  <FileSpreadsheet size={16} className="text-rose-500" />
                  Google Spreadsheet รวมศูนย์ (แม็กนั่ม & มะนาว)
                </p>
                <p className="text-[11px] text-pink-800/70 mt-0.5">
                  บันทึกข้อมูลทุกอย่างของทั้งสองคนลงในไฟล์เดียวกัน พร้อมคอลัมน์ระบุชื่อคนกำกับทุกแถวอย่างชัดเจน
                </p>
              </div>
              <button
                type="button"
                onClick={openUnifiedSpreadsheet}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-300 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-rose-200 shrink-0 active:scale-95 transition"
              >
                <span>เปิด Sheet รวม</span>
                <ExternalLink size={13} />
              </button>
            </div>

            {/* Google Login Button */}
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1">
                  Google OAuth Client ID (Web Application):
                </label>
                <input
                  type="text"
                  placeholder="เช่น 123456789-xxxx.apps.googleusercontent.com"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-rose-400 font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="py-2.5 px-4 rounded-xl bg-white hover:bg-pink-50 text-slate-700 font-bold text-xs flex items-center gap-2 border border-pink-200 shadow-sm transition active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  ลงชื่อเข้าใช้ด้วย Google (Sign in)
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const res = await syncAllToGoogleSheets();
                    alert(res.message);
                  }}
                  disabled={isSyncing}
                  className="py-2.5 px-4 rounded-xl bg-pink-100 hover:bg-pink-200 text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-pink-200 transition"
                >
                  <Cloud size={15} />
                  {isSyncing ? 'กำลังซิงค์...' : 'สร้าง Sheet อัตโนมัติ / ซิงค์เดี๋ยวนี้'}
                </button>
              </div>
            </div>

            {/* Spreadsheet ID for unified spreadsheet */}
            <div>
              <label className="block text-xs font-bold text-pink-900 mb-1">
                Google Spreadsheet ID รวม (ทั้งแม็กนั่ม & มะนาว):
              </label>
              <input
                type="text"
                placeholder="เช่น 1cBYIM2WiqqGHIJi8t_JiUF4py30g3CGgQhGWwKWH2_A"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-rose-400 font-mono"
              />
            </div>

            {/* Apps Script Web App URL */}
            <div>
              <label className="block text-xs font-bold text-rose-600 mb-1">
                Apps Script Web App URL (ทางเลือก: ซิงค์ลง Sheet โดยไม่ต้องขอ OAuth):
              </label>
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={appsScriptUrl}
                onChange={(e) => setAppsScriptUrl(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-rose-400 font-mono"
              />
              <span className="text-[11px] text-pink-700/70 mt-1 block">
                คัดลอกจาก Apps Script Project (ID: 1AzjOzJKjgrFqUehHtzhojd-_Im7mN3_sXHHKtosOmlJMsRs24Bl8_l0e) หลังกด Deploy
              </span>
            </div>
          </div>

          {/* Gemini AI Configuration Card */}
          <div className="bg-white/95 p-6 rounded-3xl border border-pink-200/90 shadow-md shadow-pink-100/50 space-y-4">
            <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              การตั้งค่า Gemini AI สำหรับวิเคราะห์อาหาร
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-pink-900">
                  Gemini API Key (ใช้งานส่วนตัวโดยตรง):
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
                  ✓ เชื่อมต่อระบบอัตโนมัติแล้ว
                </span>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-rose-400 font-mono"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] text-pink-700/70 block">
                  เชื่อมต่อคีย์อัตโนมัติให้แล้ว สแกนอาหารได้ทันที หรือแก้ไขเป็นคีย์ส่วนตัวได้
                </span>
                <button
                  type="button"
                  onClick={() => setGeminiKey(getDefaultGeminiApiKey())}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-bold hover:underline"
                >
                  คืนค่าเริ่มต้น
                </button>
              </div>
            </div>

            {/* Proxy URL configuration */}
            <div className="pt-2 border-t border-pink-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-900">
                  หรือเรียกผ่าน Proxy (Cloudflare Worker / Google Apps Script):
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useProxy}
                    onChange={(e) => setUseProxy(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-pink-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {useProxy && (
                <input
                  type="text"
                  placeholder="https://my-gemini-proxy.workers.dev"
                  value={geminiProxy}
                  onChange={(e) => setGeminiProxy(e.target.value)}
                  className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-rose-400 font-mono"
                />
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-slate-700 font-bold text-xs border border-pink-200 transition"
            >
              บันทึกการตั้งค่าทั้งหมด
            </button>
          </div>

          {/* Backup & Export JSON Card */}
          <div className="bg-white/95 p-6 rounded-3xl border border-pink-200/90 shadow-md shadow-pink-100/50 space-y-3">
            <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
              <Download size={18} className="text-sky-500" />
              สำรองข้อมูล (Export Backup)
            </h3>
            <p className="text-xs text-pink-800/70">
              ดาวน์โหลดประวัติการฝึกซ้อม น้ำหนัก และรายการอาหารทั้งหมดเป็นไฟล์ JSON เพื่อความปลอดภัย
            </p>
            <button
              onClick={handleExportData}
              className="py-2.5 px-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-2 transition"
            >
              <Download size={15} />
              ดาวน์โหลด JSON Backup
            </button>
          </div>
        </div>
      )}

      {/* Record Weight / Metric Modal */}
      {showMetricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white border border-pink-200 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
                  <Ruler size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 text-base">บันทึกสัดส่วน & น้ำหนักตัว</h3>
                  <p className="text-xs text-pink-700">สำหรับ {currentProfile.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMetricModal(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-pink-100 text-pink-700 flex items-center justify-center text-sm border border-pink-200"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMetric} className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Section 1: Date, Weight, Body Fat */}
              <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200/80 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Calendar size={14} className="text-rose-500" />
                  <span>ข้อมูลพื้นฐานการชั่ง</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-pink-900 font-bold mb-1">วันที่ชั่ง</label>
                    <input
                      type="date"
                      required
                      value={newMetricDate}
                      onChange={(e) => setNewMetricDate(e.target.value)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:border-rose-400 font-medium text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-bold mb-1">📏 ส่วนสูง (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 175"
                      value={newMetricHeight ?? ''}
                      onChange={(e) => setNewMetricHeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-2 text-slate-700 font-bold text-xs focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-rose-600 font-bold mb-1">น้ำหนักตัว (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newMetricWeight}
                      onChange={(e) => setNewMetricWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-2 text-slate-700 font-bold text-xs focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sky-700 font-bold mb-1">Body Fat (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="เช่น 16.5"
                      value={newMetricFat ?? ''}
                      onChange={(e) => setNewMetricFat(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:border-rose-400 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Body Circumferences */}
              <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Ruler size={14} className="text-rose-500" />
                    <span>รอบสัดส่วนร่างกาย (ซม. - cm)</span>
                  </span>
                  <span className="text-[10px] text-pink-700">* กรอกเฉพาะส่วนที่วัดได้</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">👕 รอบอก</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 102"
                      value={newMetricChest ?? ''}
                      onChange={(e) => setNewMetricChest(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">🥋 รอบไหล่</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 118"
                      value={newMetricShoulders ?? ''}
                      onChange={(e) => setNewMetricShoulders(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">⏳ รอบเอว</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 79"
                      value={newMetricWaist ?? ''}
                      onChange={(e) => setNewMetricWaist(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">🍑 รอบสะโพก</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 94"
                      value={newMetricHips ?? ''}
                      onChange={(e) => setNewMetricHips(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">🦵 รอบต้นขา</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 58"
                      value={newMetricThigh ?? ''}
                      onChange={(e) => setNewMetricThigh(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">💪 รอบต้นแขน</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 36"
                      value={newMetricArm ?? ''}
                      onChange={(e) => setNewMetricArm(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">🦶 รอบน่อง</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 37"
                      value={newMetricCalf ?? ''}
                      onChange={(e) => setNewMetricCalf(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">👔 รอบคอ</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 38"
                      value={newMetricNeck ?? ''}
                      onChange={(e) => setNewMetricNeck(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Notes */}
              <div>
                <label className="block font-bold text-pink-900 mb-1">บันทึกเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="เช่น ชั่งตอนเช้าหลังตื่นนอน ท้องว่าง"
                  value={newMetricNote}
                  onChange={(e) => setNewMetricNote(e.target.value)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowMetricModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-800 font-bold transition border border-pink-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-300 hover:from-rose-600 hover:to-pink-600 text-white font-bold shadow-md shadow-rose-200 active:scale-95 transition"
                >
                  บันทึกสัดส่วน & น้ำหนัก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Goal Setup & Nutritional Target Calculator Modal */}
      <GoalSetupModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
      />
    </div>
  );
};
