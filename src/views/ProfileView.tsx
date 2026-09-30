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
} from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { NumberTicker } from '../components/ui/NumberTicker';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { PigMascot } from '../components/ui/PigMascot';

export const ProfileView: React.FC = () => {
  const {
    activeProfileKey,
    setActiveProfileKey,
    currentProfile,
    partnerProfile,
    updateProfile,
    bodyMetrics,
    addBodyMetric,
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

  // Chart Metric Toggle
  type ChartMetricType =
    | 'weight_kg'
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

  // New Metric Modal States (All Circumferences)
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [newMetricDate, setNewMetricDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMetricWeight, setNewMetricWeight] = useState(72.0);
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
  const heightM = (currentProfile.height_cm || 170) / 100;
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
    a.download = `fittrack-backup-${activeProfileKey}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Selector Banner with Pig Mascot */}
      <div className="bg-white/95 p-5 rounded-3xl border border-pink-200/80 shadow-lg shadow-pink-200/30 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center p-1 rounded-2xl bg-gradient-to-tr from-pink-200 via-rose-200 to-pink-100 shadow-md shadow-pink-300/30">
            <PigMascot
              size="md"
              expression={activeProfileKey === 'partner' ? 'cheer' : 'strong'}
              className="drop-shadow-sm"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-800">{currentProfile.name}</h2>
              <span className="text-[11px] bg-pink-100 text-pink-700 border border-pink-200 px-2.5 py-0.5 rounded-full font-bold">
                {activeProfileKey === 'primary' ? '🏋️‍♂️ หมูอ้วนเทรนเนอร์' : '🌸 หมูอ้วนหวานแหวว'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              เป้าหมาย: <strong className="text-pink-600">{currentProfile.goal}</strong>
            </p>
          </div>
        </div>

        {/* Toggle Account Pill */}
        <button
          onClick={() => setActiveProfileKey(activeProfileKey === 'primary' ? 'partner' : 'primary')}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition active:scale-95"
        >
          <Users size={14} className="text-emerald-400" />
          <span>สลับโปรไฟล์</span>
        </button>
      </div>

      {/* Sub-tab navigation: สถิติร่างกาย / ข้อมูลส่วนตัว / ตั้งค่า Google Sheet */}
      <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-slate-800 text-emerald-400 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp size={16} />
          สถิติ & ความก้าวหน้า
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-slate-800 text-emerald-400 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User size={16} />
          ข้อมูลส่วนตัว
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-slate-800 text-emerald-400 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <SettingsIcon size={16} />
          Google & API
        </button>
      </div>

      {/* TAB 1: STATS & PROGRESS */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MagicCard spotlightColor="rgba(16, 185, 129, 0.15)" className="p-4">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Scale size={14} className="text-emerald-400" /> น้ำหนักล่าสุด
              </span>
              <p className="text-xl font-black text-white mt-1">
                {currentWeightKg} <span className="text-xs text-slate-400 font-normal">kg</span>
              </p>
            </MagicCard>

            <MagicCard spotlightColor="rgba(56, 189, 248, 0.15)" className="p-4">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Sparkles size={14} className="text-blue-400" /> Body Fat %
              </span>
              <p className="text-xl font-black text-white mt-1">
                {latestMetric?.body_fat_pct ? `${latestMetric.body_fat_pct}%` : '–'}
              </p>
            </MagicCard>

            <MagicCard spotlightColor="rgba(168, 85, 247, 0.15)" className="p-4">
              <span className="text-xs text-slate-400 font-medium">ค่า BMI</span>
              <p className="text-xl font-black text-white mt-1">
                {bmi} <span className="text-xs text-emerald-400 font-bold">ปกติ</span>
              </p>
            </MagicCard>

            <MagicCard spotlightColor="rgba(16, 185, 129, 0.15)" className="p-4">
              <span className="text-xs text-slate-400 font-medium">Total Volume ยกสะสม</span>
              <p className="text-xl font-black text-emerald-400 mt-1 font-mono">
                <NumberTicker value={totalVolumeAllTime} />{' '}
                <span className="text-xs text-slate-400 font-normal">kg</span>
              </p>
            </MagicCard>
          </div>

          {/* Body Circumferences Highlights (สัดส่วนร่างกายล่าสุด) */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Ruler size={18} className="text-emerald-400" />
                  สัดส่วนร่างกายล่าสุด (Body Circumferences)
                </h3>
                <p className="text-xs text-slate-400">รอบอก ไหล่ เอว สะโพก ต้นขา แขน น่อง คอ</p>
              </div>
              <button
                onClick={openMetricModal}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
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
                            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-lg font-black text-white">
                            {item.current ? `${item.current}` : '–'}{' '}
                            <span className="text-[11px] font-normal text-slate-400">cm</span>
                          </span>
                          {diff !== undefined && diff !== 0 && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                (item.isLowerBetter ? diff < 0 : diff > 0)
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
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
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" />
                  กราฟแนวโน้มความก้าวหน้า
                </h3>
                <p className="text-xs text-slate-400">แตะเพื่อดูกราฟแต่ละสัดส่วนหรือน้ำหนักตัว</p>
              </div>

              <ShimmerButton
                onClick={openMetricModal}
                shimmerColor="#34d399"
                className="py-1 px-3 self-start sm:self-auto"
              >
                <Plus size={14} />
                <span className="text-xs font-bold">บันทึกสัดส่วน/น้ำหนัก</span>
              </ShimmerButton>
            </div>

            {/* Metric Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { key: 'weight_kg' as const, label: '⚖️ น้ำหนัก (kg)' },
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
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition active:scale-95 ${
                    chartMetric === opt.key
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
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
                  <div className="h-44 flex flex-col items-center justify-center text-xs text-slate-500 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2 p-4 text-center">
                    <Ruler size={24} className="text-slate-600" />
                    <p>ต้องการข้อมูลอย่างน้อย 2 บันทึกเพื่อพล็อตกราฟเส้นนี้</p>
                    <button
                      onClick={openMetricModal}
                      className="px-3 py-1 bg-slate-800 text-emerald-400 rounded-lg hover:bg-slate-700 font-semibold"
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
                  <div className="w-full h-44 bg-slate-950 rounded-2xl border border-slate-800/80 p-3 relative flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <path d={areaD} fill="url(#chartGradient)" />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#090d16" stroke="#34d399" strokeWidth="2" />
                          <text
                            x={p.x}
                            y={p.y - 8}
                            fill="#a7f3d0"
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
                  <div className="flex items-center justify-between text-[10px] text-slate-500 px-2">
                    <span>{activeChartPoints[0].date}</span>
                    <span>{activeChartPoints[activeChartPoints.length - 1].date}</span>
                  </div>
                </div>
              );
            })()}

            {/* Metrics History Table with All Circumferences */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2">ประวัติการบันทึกสัดส่วน & น้ำหนัก:</span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {sortedMetrics.slice().reverse().map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <Calendar size={13} /> {m.date}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-lg">{m.weight_kg} kg</span>
                        {m.body_fat_pct && <span className="text-blue-400 font-semibold">{m.body_fat_pct}% fat</span>}
                      </div>
                    </div>

                    {/* Circumference Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {m.waist_cm && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                          เอว {m.waist_cm} cm
                        </span>
                      )}
                      {m.chest_cm && (
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px]">
                          อก {m.chest_cm} cm
                        </span>
                      )}
                      {m.shoulders_cm && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px]">
                          ไหล่ {m.shoulders_cm} cm
                        </span>
                      )}
                      {m.hips_cm && (
                        <span className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[11px]">
                          สะโพก {m.hips_cm} cm
                        </span>
                      )}
                      {m.thigh_cm && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                          ต้นขา {m.thigh_cm} cm
                        </span>
                      )}
                      {m.arm_cm && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px]">
                          แขน {m.arm_cm} cm
                        </span>
                      )}
                      {m.calf_cm && (
                        <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[11px]">
                          น่อง {m.calf_cm} cm
                        </span>
                      )}
                      {m.neck_cm && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                          คอ {m.neck_cm} cm
                        </span>
                      )}
                    </div>

                    {m.note && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/80 px-2 py-1 rounded-lg">
                        "{m.note}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User size={18} className="text-emerald-400" />
            ข้อมูลผู้ใช้ & เป้าหมายโภชนาการ ({currentProfile.name})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">ชื่อเล่น / ชื่อเรียก</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">ส่วนสูง (ซม.)</label>
              <input
                type="number"
                value={editHeight}
                onChange={(e) => setEditHeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">เป้าหมายการฝึก</label>
            <input
              type="text"
              value={editGoal}
              onChange={(e) => setEditGoal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Nutrition Targets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-amber-400 mb-1">แคลอรี่/วัน (kcal)</label>
              <input
                type="number"
                value={editKcal}
                onChange={(e) => setEditKcal(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-blue-400 mb-1">โปรตีน/วัน (g)</label>
              <input
                type="number"
                value={editProtein}
                onChange={(e) => setEditProtein(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-emerald-400 mb-1">คาร์บ/วัน (g)</label>
              <input
                type="number"
                value={editCarb}
                onChange={(e) => setEditCarb(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-rose-400 mb-1">ไขมัน/วัน (g)</label>
              <input
                type="number"
                value={editFat}
                onChange={(e) => setEditFat(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>
          </div>

          {/* Body Circumferences Targets / Baselines */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Ruler size={15} className="text-emerald-400" />
                สัดส่วนร่างกายมาตรฐาน / ปัจจุบัน (ซม. - cm)
              </span>
              <span className="text-[11px] text-slate-400">กรอกเพื่อบันทึกลงโปรไฟล์</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">👕 รอบอก (Chest)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 102"
                  value={editChest ?? ''}
                  onChange={(e) => setEditChest(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">🥋 รอบไหล่ (Shoulders)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 118"
                  value={editShoulders ?? ''}
                  onChange={(e) => setEditShoulders(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">⏳ รอบเอว (Waist)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 79"
                  value={editWaist ?? ''}
                  onChange={(e) => setEditWaist(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">🍑 รอบสะโพก (Hips)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 94"
                  value={editHips ?? ''}
                  onChange={(e) => setEditHips(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">🦵 รอบต้นขา (Thighs)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 58"
                  value={editThigh ?? ''}
                  onChange={(e) => setEditThigh(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">💪 รอบต้นแขน (Arms)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 36"
                  value={editArm ?? ''}
                  onChange={(e) => setEditArm(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">🦶 รอบน่อง (Calves)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 37"
                  value={editCalf ?? ''}
                  onChange={(e) => setEditCalf(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">👔 รอบคอ (Neck)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 38"
                  value={editNeck ?? ''}
                  onChange={(e) => setEditNeck(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition"
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
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database size={18} className="text-emerald-400" />
                เชื่อมต่อ Google Sheets API v4
              </h3>
              {settings.googleAccessToken ? (
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={13} /> เชื่อมต่อแล้ว
                </span>
              ) : (
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  ยังไม่ได้เชื่อมต่อ
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-white font-bold flex items-center gap-1.5">
                  <FileSpreadsheet size={16} className="text-emerald-400" />
                  Google Spreadsheet รวมศูนย์ (แม็กนั่ม & มะนาว)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  บันทึกข้อมูลทุกอย่างของทั้งสองคนลงในไฟล์เดียวกัน พร้อมคอลัมน์ระบุชื่อคนกำกับทุกแถวอย่างชัดเจน
                </p>
              </div>
              <button
                type="button"
                onClick={openUnifiedSpreadsheet}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shrink-0 active:scale-95 transition"
              >
                <span>เปิด Sheet รวม</span>
                <ExternalLink size={13} />
              </button>
            </div>

            {/* Google Login Button */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Google OAuth Client ID (Web Application):
                </label>
                <input
                  type="text"
                  placeholder="เช่น 123456789-xxxx.apps.googleusercontent.com"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95"
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
                  className="py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/40"
                >
                  <Cloud size={15} />
                  {isSyncing ? 'กำลังซิงค์...' : 'สร้าง Sheet อัตโนมัติ / ซิงค์เดี๋ยวนี้'}
                </button>
              </div>
            </div>

            {/* Spreadsheet ID for unified spreadsheet */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Google Spreadsheet ID รวม (ทั้งแม็กนั่ม & มะนาว):
              </label>
              <input
                type="text"
                placeholder="เช่น 1cBYIM2WiqqGHIJi8t_JiUF4py30g3CGgQhGWwKWH2_A"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Apps Script Web App URL */}
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                Apps Script Web App URL (ทางเลือก: ซิงค์ลง Sheet โดยไม่ต้องขอ OAuth):
              </label>
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={appsScriptUrl}
                onChange={(e) => setAppsScriptUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                คัดลอกจาก Apps Script Project (ID: 1AzjOzJKjgrFqUehHtzhojd-_Im7mN3_sXHHKtosOmlJMsRs24Bl8_l0e) หลังกด Deploy
              </span>
            </div>
          </div>

          {/* Gemini AI Configuration Card */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              การตั้งค่า Gemini AI สำหรับวิเคราะห์อาหาร
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Gemini API Key (ใช้งานส่วนตัวโดยตรง):
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                  ✓ เชื่อมต่อระบบอัตโนมัติแล้ว
                </span>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-400 font-mono"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] text-slate-400 block">
                  เชื่อมต่อคีย์อัตโนมัติให้แล้ว สแกนอาหารได้ทันที หรือแก้ไขเป็นคีย์ส่วนตัวได้
                </span>
                <button
                  type="button"
                  onClick={() => setGeminiKey(getDefaultGeminiApiKey())}
                  className="text-[11px] text-pink-400 hover:text-pink-300 hover:underline"
                >
                  คืนค่าเริ่มต้น
                </button>
              </div>
            </div>

            {/* Proxy URL configuration */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  หรือเรียกผ่าน Proxy (Cloudflare Worker / Google Apps Script):
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useProxy}
                    onChange={(e) => setUseProxy(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {useProxy && (
                <input
                  type="text"
                  placeholder="https://my-gemini-proxy.workers.dev"
                  value={geminiProxy}
                  onChange={(e) => setGeminiProxy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              บันทึกการตั้งค่าทั้งหมด
            </button>
          </div>

          {/* Backup & Export JSON Card */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download size={18} className="text-sky-400" />
              สำรองข้อมูล (Export Backup)
            </h3>
            <p className="text-xs text-slate-400">
              ดาวน์โหลดประวัติการฝึกซ้อม น้ำหนัก และรายการอาหารทั้งหมดเป็นไฟล์ JSON เพื่อความปลอดภัย
            </p>
            <button
              onClick={handleExportData}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-2"
            >
              <Download size={15} />
              ดาวน์โหลด JSON Backup
            </button>
          </div>
        </div>
      )}

      {/* Record Weight / Metric Modal */}
      {showMetricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Ruler size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">บันทึกสัดส่วน & น้ำหนักตัว</h3>
                  <p className="text-xs text-slate-400">สำหรับ {currentProfile.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMetricModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMetric} className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Section 1: Date, Weight, Body Fat */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <Calendar size={14} className="text-emerald-400" />
                  <span>ข้อมูลพื้นฐานการชั่ง</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">วันที่ชั่ง</label>
                    <input
                      type="date"
                      required
                      value={newMetricDate}
                      onChange={(e) => setNewMetricDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold mb-1">น้ำหนักตัว (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newMetricWeight}
                      onChange={(e) => setNewMetricWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-400 font-semibold mb-1">Body Fat (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="เช่น 16.5"
                      value={newMetricFat ?? ''}
                      onChange={(e) => setNewMetricFat(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Body Circumferences */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-200">
                    <Ruler size={14} className="text-emerald-400" />
                    <span>รอบสัดส่วนร่างกาย (ซม. - cm)</span>
                  </span>
                  <span className="text-[10px] text-slate-500">* กรอกเฉพาะส่วนที่วัดได้</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">👕 รอบอก</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 102"
                      value={newMetricChest ?? ''}
                      onChange={(e) => setNewMetricChest(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">🥋 รอบไหล่</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 118"
                      value={newMetricShoulders ?? ''}
                      onChange={(e) => setNewMetricShoulders(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">⏳ รอบเอว</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 79"
                      value={newMetricWaist ?? ''}
                      onChange={(e) => setNewMetricWaist(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">🍑 รอบสะโพก</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 94"
                      value={newMetricHips ?? ''}
                      onChange={(e) => setNewMetricHips(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">🦵 รอบต้นขา</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 58"
                      value={newMetricThigh ?? ''}
                      onChange={(e) => setNewMetricThigh(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">💪 รอบต้นแขน</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 36"
                      value={newMetricArm ?? ''}
                      onChange={(e) => setNewMetricArm(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">🦶 รอบน่อง</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 37"
                      value={newMetricCalf ?? ''}
                      onChange={(e) => setNewMetricCalf(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">👔 รอบคอ</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 38"
                      value={newMetricNeck ?? ''}
                      onChange={(e) => setNewMetricNeck(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Notes */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">บันทึกเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="เช่น ชั่งตอนเช้าหลังตื่นนอน ท้องว่าง"
                  value={newMetricNote}
                  onChange={(e) => setNewMetricNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMetricModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition"
                >
                  บันทึกสัดส่วน & น้ำหนัก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
