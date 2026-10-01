import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BodyMetric, UserProfile, FirebaseConfig } from '../types';
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
  Ruler,
  Target,
  Flame,
  Trash2,
  Zap,
  Wifi,
  WifiOff,
  RefreshCw,
  Radio,
  Copy,
  Layers,
  ArrowUpRight,
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
    isFirebaseConnected,
    firebaseError,
    migrateLocalDataToFirebase,
    testFirebaseConnection,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'stats' | 'profile' | 'settings'>('stats');

  // Circumference Unit System: 'cm' | 'inch'
  const [circumferenceUnit, setCircumferenceUnit] = useState<'cm' | 'inch'>(() => {
    return (localStorage.getItem('ft_circumference_unit') as 'cm' | 'inch') || 'cm';
  });

  const toggleCircumferenceUnit = (newUnit: 'cm' | 'inch') => {
    setCircumferenceUnit(newUnit);
    localStorage.setItem('ft_circumference_unit', newUnit);
  };

  // Helper conversion functions
  const cmToInch = (val?: number) => (val !== undefined && val !== null ? +(val / 2.54).toFixed(1) : undefined);
  const inchToCm = (val?: number) => (val !== undefined && val !== null ? +(val * 2.54).toFixed(1) : undefined);

  const formatCircum = (cmVal?: number, targetUnit: 'cm' | 'inch' = circumferenceUnit) => {
    if (cmVal === undefined || cmVal === null) return '–';
    if (targetUnit === 'inch') {
      return `${(cmVal / 2.54).toFixed(1)} in`;
    }
    return `${cmVal} cm`;
  };

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
  const [profileUnit, setProfileUnit] = useState<'cm' | 'inch'>('cm');
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

  // Sync profile edit states whenever active profile or unit changes
  useEffect(() => {
    setEditName(currentProfile.name);
    setEditHeight(currentProfile.height_cm);
    setEditGoal(currentProfile.goal);
    setEditKcal(currentProfile.kcal_target);
    setEditProtein(currentProfile.protein_target_g);
    setEditCarb(currentProfile.carb_target_g || 200);
    setEditFat(currentProfile.fat_target_g || 60);
    setEditWaist(profileUnit === 'inch' ? cmToInch(currentProfile.waist_cm) : currentProfile.waist_cm);
    setEditChest(profileUnit === 'inch' ? cmToInch(currentProfile.chest_cm) : currentProfile.chest_cm);
    setEditShoulders(profileUnit === 'inch' ? cmToInch(currentProfile.shoulders_cm) : currentProfile.shoulders_cm);
    setEditThigh(profileUnit === 'inch' ? cmToInch(currentProfile.thigh_cm) : currentProfile.thigh_cm);
    setEditHips(profileUnit === 'inch' ? cmToInch(currentProfile.hips_cm) : currentProfile.hips_cm);
    setEditArm(profileUnit === 'inch' ? cmToInch(currentProfile.arm_cm) : currentProfile.arm_cm);
    setEditCalf(profileUnit === 'inch' ? cmToInch(currentProfile.calf_cm) : currentProfile.calf_cm);
    setEditNeck(profileUnit === 'inch' ? cmToInch(currentProfile.neck_cm) : currentProfile.neck_cm);
  }, [currentProfile, activeProfileKey, profileUnit]);

  // Modal Unit State
  const [modalUnit, setModalUnit] = useState<'cm' | 'inch'>('cm');

  // Settings inputs
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || getDefaultGeminiApiKey());
  const [geminiProxy, setGeminiProxy] = useState(settings.geminiProxyUrl || '');
  const [useProxy, setUseProxy] = useState(settings.useProxy || false);

  // Firebase Cloud Database States
  const [fbApiKey, setFbApiKey] = useState(settings.firebaseConfig?.apiKey || '');
  const [fbProjectId, setFbProjectId] = useState(settings.firebaseConfig?.projectId || '');
  const [fbAppId, setFbAppId] = useState(settings.firebaseConfig?.appId || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(settings.firebaseConfig?.authDomain || '');
  const [fbStorageBucket, setFbStorageBucket] = useState(settings.firebaseConfig?.storageBucket || '');
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState(settings.firebaseConfig?.messagingSenderId || '');
  const [rawFbSnippet, setRawFbSnippet] = useState('');
  const [isTestingFb, setIsTestingFb] = useState(false);
  const [fbTestResult, setFbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isMigratingFb, setIsMigratingFb] = useState(false);
  const [migrationStatusMsg, setMigrationStatusMsg] = useState('');

  // Sorted metrics
  const sortedMetrics = [...bodyMetrics].sort((a, b) => a.date.localeCompare(b.date));
  const latestMetric = sortedMetrics[sortedMetrics.length - 1];
  const firstMetric = sortedMetrics[0];

  // Open Metric Modal with smart prefill from latest metric or profile
  const openMetricModal = () => {
    setModalUnit(circumferenceUnit);
    setNewMetricDate(new Date().toISOString().split('T')[0]);
    setNewMetricWeight(latestMetric ? latestMetric.weight_kg : 70.0);
    setNewMetricHeight(latestMetric?.height_cm ?? currentProfile.height_cm ?? 170);
    setNewMetricFat(latestMetric?.body_fat_pct);

    const rawWaist = latestMetric?.waist_cm ?? currentProfile.waist_cm;
    const rawChest = latestMetric?.chest_cm ?? currentProfile.chest_cm;
    const rawShoulders = latestMetric?.shoulders_cm ?? currentProfile.shoulders_cm;
    const rawThigh = latestMetric?.thigh_cm ?? currentProfile.thigh_cm;
    const rawHips = latestMetric?.hips_cm ?? currentProfile.hips_cm;
    const rawArm = latestMetric?.arm_cm ?? currentProfile.arm_cm;
    const rawCalf = latestMetric?.calf_cm ?? currentProfile.calf_cm;
    const rawNeck = latestMetric?.neck_cm ?? currentProfile.neck_cm;

    setNewMetricWaist(circumferenceUnit === 'inch' ? cmToInch(rawWaist) : rawWaist);
    setNewMetricChest(circumferenceUnit === 'inch' ? cmToInch(rawChest) : rawChest);
    setNewMetricShoulders(circumferenceUnit === 'inch' ? cmToInch(rawShoulders) : rawShoulders);
    setNewMetricThigh(circumferenceUnit === 'inch' ? cmToInch(rawThigh) : rawThigh);
    setNewMetricHips(circumferenceUnit === 'inch' ? cmToInch(rawHips) : rawHips);
    setNewMetricArm(circumferenceUnit === 'inch' ? cmToInch(rawArm) : rawArm);
    setNewMetricCalf(circumferenceUnit === 'inch' ? cmToInch(rawCalf) : rawCalf);
    setNewMetricNeck(circumferenceUnit === 'inch' ? cmToInch(rawNeck) : rawNeck);
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
    const finalWaist = modalUnit === 'inch' ? inchToCm(newMetricWaist) : newMetricWaist;
    const finalChest = modalUnit === 'inch' ? inchToCm(newMetricChest) : newMetricChest;
    const finalShoulders = modalUnit === 'inch' ? inchToCm(newMetricShoulders) : newMetricShoulders;
    const finalThigh = modalUnit === 'inch' ? inchToCm(newMetricThigh) : newMetricThigh;
    const finalHips = modalUnit === 'inch' ? inchToCm(newMetricHips) : newMetricHips;
    const finalArm = modalUnit === 'inch' ? inchToCm(newMetricArm) : newMetricArm;
    const finalCalf = modalUnit === 'inch' ? inchToCm(newMetricCalf) : newMetricCalf;
    const finalNeck = modalUnit === 'inch' ? inchToCm(newMetricNeck) : newMetricNeck;
    const finalHeight = newMetricHeight;

    await addBodyMetric({
      date: newMetricDate,
      weight_kg: newMetricWeight,
      height_cm: finalHeight,
      body_fat_pct: newMetricFat,
      waist_cm: finalWaist,
      chest_cm: finalChest,
      shoulders_cm: finalShoulders,
      thigh_cm: finalThigh,
      hips_cm: finalHips,
      arm_cm: finalArm,
      calf_cm: finalCalf,
      neck_cm: finalNeck,
      note: newMetricNote.trim() || undefined,
    });
    if (finalHeight && finalHeight !== currentProfile.height_cm) {
      updateProfile({ height_cm: finalHeight });
    }
    setShowMetricModal(false);
    setNewMetricNote('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWaist = profileUnit === 'inch' ? inchToCm(editWaist) : editWaist;
    const finalChest = profileUnit === 'inch' ? inchToCm(editChest) : editChest;
    const finalShoulders = profileUnit === 'inch' ? inchToCm(editShoulders) : editShoulders;
    const finalThigh = profileUnit === 'inch' ? inchToCm(editThigh) : editThigh;
    const finalHips = profileUnit === 'inch' ? inchToCm(editHips) : editHips;
    const finalArm = profileUnit === 'inch' ? inchToCm(editArm) : editArm;
    const finalCalf = profileUnit === 'inch' ? inchToCm(editCalf) : editCalf;
    const finalNeck = profileUnit === 'inch' ? inchToCm(editNeck) : editNeck;

    updateProfile({
      name: editName,
      height_cm: editHeight,
      goal: editGoal,
      kcal_target: editKcal,
      protein_target_g: editProtein,
      carb_target_g: editCarb,
      fat_target_g: editFat,
      waist_cm: finalWaist,
      chest_cm: finalChest,
      shoulders_cm: finalShoulders,
      thigh_cm: finalThigh,
      hips_cm: finalHips,
      arm_cm: finalArm,
      calf_cm: finalCalf,
      neck_cm: finalNeck,
    });
    alert('บันทึกการแก้ไขโปรไฟล์และสัดส่วนสำเร็จแล้ว!');
  };

  const handleSaveSettings = () => {
    updateSettings({
      geminiApiKey: geminiKey,
      geminiProxyUrl: geminiProxy,
      useProxy,
      firebaseConfig: fbApiKey && fbProjectId ? {
        apiKey: fbApiKey,
        projectId: fbProjectId,
        appId: fbAppId,
        authDomain: fbAuthDomain || undefined,
        storageBucket: fbStorageBucket || undefined,
        messagingSenderId: fbMessagingSenderId || undefined,
      } : undefined,
    });
    alert('บันทึกการตั้งค่าแล้ว!');
  };

  // Auto-parse Firebase snippet (Supports raw JS snippet or JSON)
  const handleParseFirebaseSnippet = (snippet: string) => {
    setRawFbSnippet(snippet);
    if (!snippet.trim()) return;

    try {
      let parsedObj: any = null;
      try {
        parsedObj = JSON.parse(snippet.trim());
      } catch {
        const extractKey = (key: string) => {
          const match = snippet.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`));
          return match ? match[1] : '';
        };

        const apiKey = extractKey('apiKey');
        const projectId = extractKey('projectId');
        const appId = extractKey('appId');
        const authDomain = extractKey('authDomain');
        const storageBucket = extractKey('storageBucket');
        const messagingSenderId = extractKey('messagingSenderId');

        if (apiKey || projectId || appId) {
          parsedObj = {
            apiKey,
            projectId,
            appId,
            authDomain,
            storageBucket,
            messagingSenderId,
          };
        }
      }

      if (parsedObj && (parsedObj.apiKey || parsedObj.projectId)) {
        if (parsedObj.apiKey) setFbApiKey(parsedObj.apiKey);
        if (parsedObj.projectId) setFbProjectId(parsedObj.projectId);
        if (parsedObj.appId) setFbAppId(parsedObj.appId);
        if (parsedObj.authDomain) setFbAuthDomain(parsedObj.authDomain);
        if (parsedObj.storageBucket) setFbStorageBucket(parsedObj.storageBucket);
        if (parsedObj.messagingSenderId) setFbMessagingSenderId(parsedObj.messagingSenderId);
        setFbTestResult({ success: true, message: '✨ แยกค่า Config สำเร็จเรียบร้อย! กรุณากด "บันทึก & เชื่อมต่อ"' });
      }
    } catch (e: any) {
      console.warn('Snippet parsing warning:', e);
    }
  };

  // Test and connect to Firebase
  const handleTestAndSaveFirebase = async () => {
    if (!fbApiKey || !fbProjectId) {
      alert('กรุณากรอก Firebase API Key และ Project ID ให้ครบถ้วน');
      return;
    }
    const newConfig: FirebaseConfig = {
      apiKey: fbApiKey.trim(),
      projectId: fbProjectId.trim(),
      appId: fbAppId.trim(),
      authDomain: fbAuthDomain.trim() || undefined,
      storageBucket: fbStorageBucket.trim() || undefined,
      messagingSenderId: fbMessagingSenderId.trim() || undefined,
    };

    setIsTestingFb(true);
    setFbTestResult(null);

    // Save to settings
    updateSettings({ firebaseConfig: newConfig, useFirebase: true });

    // Test connection
    const res = await testFirebaseConnection(newConfig);
    setIsTestingFb(false);
    setFbTestResult(res);
  };

  // Migrate local state data to Cloud
  const handleMigrateToCloud = async () => {
    if (!isFirebaseConnected && (!fbApiKey || !fbProjectId)) {
      alert('กรุณาเชื่อมต่อ Firebase ให้สำเร็จก่อนทำการย้ายข้อมูล');
      return;
    }
    if (!window.confirm('คุณต้องการนำข้อมูลอาหาร, การฝึกซ้อม, และสัดส่วนปัจจุบันในเครื่องนี้ อัปโหลดขึ้น Cloud ใช่หรือไม่?')) {
      return;
    }

    setIsMigratingFb(true);
    setMigrationStatusMsg('เริ่มเตรียมการย้ายข้อมูล...');
    try {
      const res = await migrateLocalDataToFirebase((msg) => {
        setMigrationStatusMsg(msg);
      });
      alert(`🎉 ย้ายข้อมูลสำเร็จทั้งหมด ${res.count} รายการ! ตอนนี้ทั้ง 2 เครื่องจะเห็นข้อมูลตรงกันแบบ Real-time แล้ว`);
    } catch (err: any) {
      alert(`ย้ายข้อมูลไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsMigratingFb(false);
      setMigrationStatusMsg('');
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
      {/* Profile Selector Banner with Pig Mascot */}
      <div className="card-apple p-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center p-1.5 rounded-2xl bg-zinc-100 border border-black/[0.05]">
            <PigMascot
              size="md"
              expression={activeProfileKey === 'partner' ? 'cheer' : 'strong'}
              className="drop-shadow-xs"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-zinc-900 tracking-tight">{currentProfile.name}</h2>
              <span className="text-[11px] bg-zinc-100 text-zinc-700 border border-black/[0.06] px-2.5 py-0.5 rounded-full font-semibold">
                {activeProfileKey === 'primary' ? '🏋️‍♂️ หมูอ้วนเทรนเนอร์' : '🌸 หมูอ้วนหวานแหวว'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              เป้าหมาย: <strong className="text-zinc-800 font-semibold">{currentProfile.goal}</strong>
            </p>
          </div>
        </div>

        {/* Toggle Account Pill */}
        <button
          onClick={() => setActiveProfileKey(activeProfileKey === 'primary' ? 'partner' : 'primary')}
          className="px-3.5 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200/80 border border-black/[0.06] text-xs font-semibold text-zinc-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
        >
          <Users size={14} className="text-zinc-500" />
          <span>สลับโปรไฟล์</span>
        </button>
      </div>

      {/* Sub-tab navigation: Apple Segmented Pill */}
      <div className="flex items-center p-1 bg-zinc-200/60 backdrop-blur-md rounded-full shadow-inner border border-black/[0.04] max-w-xl mx-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <TrendingUp size={15} />
          <span>สถิติ & กราฟ</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <User size={15} />
          <span>ข้อมูลส่วนตัว</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <SettingsIcon size={15} />
          <span>ตั้งค่า Cloud & AI</span>
        </button>
      </div>

      {/* TAB 1: STATS & PROGRESS */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          {/* Smart Goal & Sports Nutrition Calculator Banner */}
          {/* Smart Goal & Sports Nutrition Calculator Banner (Apple Pro Card) */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-lg shadow-black/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shadow-inner shrink-0 border border-white/10">
                🎯
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight text-white">คำนวณเป้าหมาย & สารอาหาร</h3>
                  <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-semibold text-zinc-200">Smart Goal</span>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                  Bulk, Cut, Recomp คำนวณแคลอรี่ โปรตีน คาร์บ ไขมัน อัตโนมัติ
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGoalModal(true)}
              className="px-4 py-2.5 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles size={14} className="text-blue-500" />
              <span>คำนวณเป้าหมาย</span>
            </button>
          </div>

          {/* Quick Metrics Cards (Apple Health / Samsung Health Style) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card-apple p-4">
              <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                <Scale size={14} className="text-zinc-400" /> น้ำหนักล่าสุด
              </span>
              <p className="text-2xl font-extrabold text-zinc-900 mt-1 tracking-tight">
                {currentWeightKg} <span className="text-xs text-zinc-400 font-normal">kg</span>
              </p>
            </div>

            <div className="card-apple p-4">
              <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                <Sparkles size={14} className="text-zinc-400" /> Body Fat %
              </span>
              <p className="text-2xl font-extrabold text-zinc-900 mt-1 tracking-tight">
                {latestMetric?.body_fat_pct ? `${latestMetric.body_fat_pct}%` : '–'}
              </p>
            </div>

            <div className="card-apple p-4">
              <span className="text-xs text-zinc-500 font-medium">ค่า BMI</span>
              <p className="text-2xl font-extrabold text-zinc-900 mt-1 tracking-tight">
                {bmi} <span className="text-xs text-emerald-600 font-semibold ml-1">ปกติ</span>
              </p>
            </div>

            <div className="card-apple p-4">
              <span className="text-xs text-zinc-500 font-medium">Volume รวม</span>
              <p className="text-2xl font-extrabold text-zinc-900 mt-1 font-mono tracking-tight">
                <NumberTicker value={totalVolumeAllTime} />{' '}
                <span className="text-xs text-zinc-400 font-normal">kg</span>
              </p>
            </div>
          </div>

          {/* Body Circumferences Highlights */}
          <div className="card-apple p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Ruler size={18} className="text-zinc-500" />
                  สัดส่วนร่างกายล่าสุด
                </h3>
                <p className="text-xs text-zinc-500">รอบอก ไหล่ เอว สะโพก ต้นขา แขน น่อง คอ</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Unit Switcher: cm vs inch */}
                <div className="flex items-center p-0.5 bg-zinc-100 rounded-full border border-black/[0.06] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleCircumferenceUnit('cm')}
                    className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                      circumferenceUnit === 'cm'
                        ? 'bg-white text-zinc-900 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    ซม. (cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCircumferenceUnit('inch')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      circumferenceUnit === 'inch'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-rose-600'
                    }`}
                  >
                    นิ้ว (in)
                  </button>
                </div>

                <button
                  onClick={openMetricModal}
                  className="px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-rose-700 border border-pink-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <Plus size={14} />
                  <span>บันทึกสัดส่วน</span>
                </button>
              </div>
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
                    const displayCurrent =
                      circumferenceUnit === 'inch'
                        ? cmToInch(item.current)
                        : item.current;
                    const displayFirst =
                      circumferenceUnit === 'inch'
                        ? cmToInch(item.first)
                        : item.first;
                    const diff =
                      displayFirst !== undefined && displayCurrent !== undefined
                        ? displayCurrent - displayFirst
                        : undefined;

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
                            {displayCurrent !== undefined ? `${displayCurrent}` : '–'}{' '}
                            <span className="text-[11px] font-normal text-pink-700">
                              {circumferenceUnit === 'inch' ? 'นิ้ว (in)' : 'cm'}
                            </span>
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
                สัดส่วนร่างกาย ({profileUnit === 'inch' ? 'นิ้ว - in' : 'ซม. - cm'})
              </span>
              <div className="flex items-center gap-1 bg-pink-100/70 p-0.5 rounded-lg border border-pink-200">
                <button
                  type="button"
                  onClick={() => {
                    if (profileUnit !== 'cm') {
                      setProfileUnit('cm');
                      setEditChest(inchToCm(editChest));
                      setEditShoulders(inchToCm(editShoulders));
                      setEditWaist(inchToCm(editWaist));
                      setEditHips(inchToCm(editHips));
                      setEditThigh(inchToCm(editThigh));
                      setEditArm(inchToCm(editArm));
                      setEditCalf(inchToCm(editCalf));
                      setEditNeck(inchToCm(editNeck));
                    }
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                    profileUnit === 'cm'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-pink-700 hover:text-slate-800'
                  }`}
                >
                  ซม. (cm)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (profileUnit !== 'inch') {
                      setProfileUnit('inch');
                      setEditChest(cmToInch(editChest));
                      setEditShoulders(cmToInch(editShoulders));
                      setEditWaist(cmToInch(editWaist));
                      setEditHips(cmToInch(editHips));
                      setEditThigh(cmToInch(editThigh));
                      setEditArm(cmToInch(editArm));
                      setEditCalf(cmToInch(editCalf));
                      setEditNeck(cmToInch(editNeck));
                    }
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                    profileUnit === 'inch'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-pink-700 hover:text-slate-800'
                  }`}
                >
                  นิ้ว (in)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-pink-900 font-semibold mb-1">
                  👕 รอบอก {profileUnit === 'inch' ? '(in)' : '(cm)'}
                </label>
                <input
                  type="number"
                  step={profileUnit === 'inch' ? '0.1' : '0.5'}
                  placeholder={profileUnit === 'inch' ? 'เช่น 40.0' : 'เช่น 102'}
                  value={editChest ?? ''}
                  onChange={(e) => setEditChest(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">
                  🥋 รอบไหล่ {profileUnit === 'inch' ? '(in)' : '(cm)'}
                </label>
                <input
                  type="number"
                  step={profileUnit === 'inch' ? '0.1' : '0.5'}
                  placeholder={profileUnit === 'inch' ? 'เช่น 46.5' : 'เช่น 118'}
                  value={editShoulders ?? ''}
                  onChange={(e) => setEditShoulders(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">
                  ⏳ รอบเอว {profileUnit === 'inch' ? '(in)' : '(cm)'}
                </label>
                <input
                  type="number"
                  step={profileUnit === 'inch' ? '0.1' : '0.5'}
                  placeholder={profileUnit === 'inch' ? 'เช่น 31.0' : 'เช่น 79'}
                  value={editWaist ?? ''}
                  onChange={(e) => setEditWaist(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">
                  🍑 รอบสะโพก {profileUnit === 'inch' ? '(in)' : '(cm)'}
                </label>
                <input
                  type="number"
                  step={profileUnit === 'inch' ? '0.1' : '0.5'}
                  placeholder={profileUnit === 'inch' ? 'เช่น 37.0' : 'เช่น 94'}
                  value={editHips ?? ''}
                  onChange={(e) => setEditHips(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">
                  🦵 รอบต้นขา {profileUnit === 'inch' ? '(in)' : '(cm)'}
                </label>
                <input
                  type="number"
                  step={profileUnit === 'inch' ? '0.1' : '0.5'}
                  placeholder={profileUnit === 'inch' ? 'เช่น 22.8' : 'เช่น 58'}
                  value={editThigh ?? ''}
                  onChange={(e) => setEditThigh(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">
                  💪 รอบต้นแขน {profileUnit === 'inch' ? '(in)' : '(cm)'}
                </label>
                <input
                  type="number"
                  step={profileUnit === 'inch' ? '0.1' : '0.5'}
                  placeholder={profileUnit === 'inch' ? 'เช่น 14.2' : 'เช่น 36'}
                  value={editArm ?? ''}
                  onChange={(e) => setEditArm(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">
                  🦶 รอบน่อง {profileUnit === 'inch' ? '(in)' : '(cm)'}
                </label>
                <input
                  type="number"
                  step={profileUnit === 'inch' ? '0.1' : '0.5'}
                  placeholder={profileUnit === 'inch' ? 'เช่น 14.5' : 'เช่น 37'}
                  value={editCalf ?? ''}
                  onChange={(e) => setEditCalf(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-pink-900 font-semibold mb-1">
                  👔 รอบคอ {profileUnit === 'inch' ? '(in)' : '(cm)'}
                </label>
                <input
                  type="number"
                  step={profileUnit === 'inch' ? '0.1' : '0.5'}
                  placeholder={profileUnit === 'inch' ? 'เช่น 15.0' : 'เช่น 38'}
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

      {/* TAB 3: CLOUD DATABASE, GOOGLE SHEETS & GEMINI API SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-5">
          {/* Firebase Cloud Real-time Database Card */}
          <div className="bg-white/95 p-6 rounded-3xl border border-rose-200/90 shadow-lg shadow-rose-100/50 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-rose-300/20 rounded-bl-full pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-200/50">
                  <Flame size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                    Cloud Database (Firebase Firestore)
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                      Real-time 2 เครื่อง
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    ซิงค์ข้อมูลอาหาร, การออกกำลังกาย และสัดส่วนสดๆ ทันทีระหว่าง 2 เครื่อง
                  </p>
                </div>
              </div>

              {isFirebaseConnected ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 font-bold shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <Wifi size={14} className="text-emerald-600" />
                  <span>Real-time Sync ทำงานอยู่</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-bold">
                  <WifiOff size={14} />
                  <span>ยังไม่ได้เชื่อมต่อ Cloud</span>
                </div>
              )}
            </div>

            {/* Quick Paste Snippet Area */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-rose-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  วางโค้ด firebaseConfig (ระบบจะแยกค่าให้อัตโนมัติ):
                </label>
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline"
                >
                  เปิด Firebase Console
                  <ExternalLink size={11} />
                </a>
              </div>
              <textarea
                rows={3}
                placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "mooauan-db",\n  appId: "1:123..."\n};`}
                value={rawFbSnippet}
                onChange={(e) => handleParseFirebaseSnippet(e.target.value)}
                className="w-full bg-white border border-amber-200 rounded-xl p-3 text-xs text-slate-700 font-mono focus:outline-none focus:border-amber-400 placeholder-slate-400 shadow-inner"
              />
            </div>

            {/* Individual Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Firebase API Key *
                </label>
                <input
                  type="password"
                  placeholder="AIzaSyD-..."
                  value={fbApiKey}
                  onChange={(e) => setFbApiKey(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project ID *
                </label>
                <input
                  type="text"
                  placeholder="เช่น mooauan-db"
                  value={fbProjectId}
                  onChange={(e) => setFbProjectId(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  App ID *
                </label>
                <input
                  type="text"
                  placeholder="เช่น 1:123456789:web:abcdef"
                  value={fbAppId}
                  onChange={(e) => setFbAppId(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Auth Domain (ทางเลือก)
                </label>
                <input
                  type="text"
                  placeholder="mooauan-db.firebaseapp.com"
                  value={fbAuthDomain}
                  onChange={(e) => setFbAuthDomain(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            {/* Test Status Message */}
            {fbTestResult && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                  fbTestResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span>{fbTestResult.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-pink-100">
              <button
                type="button"
                onClick={handleTestAndSaveFirebase}
                disabled={isTestingFb}
                className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-200 active:scale-95 transition disabled:opacity-50"
              >
                <Zap size={15} />
                {isTestingFb ? 'กำลังทดสอบเชื่อมต่อ...' : '💾 บันทึก & เชื่อมต่อ Cloud Database'}
              </button>

              <button
                type="button"
                onClick={handleMigrateToCloud}
                disabled={isMigratingFb || (!isFirebaseConnected && !fbApiKey)}
                className="py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                <Upload size={15} />
                {isMigratingFb ? (
                  <span>{migrationStatusMsg || 'กำลังย้ายข้อมูล...'}</span>
                ) : (
                  <span>📤 ย้ายข้อมูลเดิมในเครื่องขึ้น Cloud</span>
                )}
              </button>
            </div>

            {/* Step-by-Step Info Box */}
            <details className="text-[11px] text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <summary className="font-bold cursor-pointer text-slate-700 flex items-center gap-1.5 select-none">
                📖 วิธีสร้าง Firebase ฟรีใน 2 นาที (คลิกเพื่อดูวิธี)
              </summary>
              <ol className="list-decimal list-inside space-y-1.5 mt-2.5 text-slate-600 leading-relaxed pl-1">
                <li>ไปที่ <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-rose-600 font-bold underline">console.firebase.google.com</a> แล้วกด <strong>Create a project</strong></li>
                <li>ไปที่เมนู <strong>Build ➔ Firestore Database</strong> ➔ กด <strong>Create database</strong> (เลือก Location Singapore และ Test mode)</li>
                <li>ไปที่รูปฟันเฟือง ⚙️ <strong>Project settings</strong> ➔ เลื่อนลงมาที่ <strong>Your apps</strong> ➔ กดไอคอนเว็บ <code>&lt;/&gt;</code> เพื่อสร้าง Web App</li>
                <li>ก็อปปี้โค้ดใน <code>firebaseConfig</code> มาวางในช่องด้านบน แล้วกด <strong>บันทึก & เชื่อมต่อ</strong></li>
                <li>ให้อีกเครื่องหนึ่งเปิดเว็บแล้วใส่ Config เดียวกัน ทั้ง 2 เครื่องจะซิงค์ข้อมูลตรงกันสดๆ ทันทีครับ</li>
              </ol>
            </details>
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
                    <span>รอบสัดส่วนร่างกาย ({modalUnit === 'inch' ? 'นิ้ว - in' : 'ซม. - cm'})</span>
                  </span>
                  <div className="flex items-center gap-1 bg-pink-100/70 p-0.5 rounded-lg border border-pink-200">
                    <button
                      type="button"
                      onClick={() => {
                        if (modalUnit !== 'cm') {
                          setModalUnit('cm');
                          setNewMetricChest(inchToCm(newMetricChest));
                          setNewMetricShoulders(inchToCm(newMetricShoulders));
                          setNewMetricWaist(inchToCm(newMetricWaist));
                          setNewMetricHips(inchToCm(newMetricHips));
                          setNewMetricThigh(inchToCm(newMetricThigh));
                          setNewMetricArm(inchToCm(newMetricArm));
                          setNewMetricCalf(inchToCm(newMetricCalf));
                          setNewMetricNeck(inchToCm(newMetricNeck));
                        }
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                        modalUnit === 'cm'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-pink-700 hover:text-slate-800'
                      }`}
                    >
                      ซม. (cm)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (modalUnit !== 'inch') {
                          setModalUnit('inch');
                          setNewMetricChest(cmToInch(newMetricChest));
                          setNewMetricShoulders(cmToInch(newMetricShoulders));
                          setNewMetricWaist(cmToInch(newMetricWaist));
                          setNewMetricHips(cmToInch(newMetricHips));
                          setNewMetricThigh(cmToInch(newMetricThigh));
                          setNewMetricArm(cmToInch(newMetricArm));
                          setNewMetricCalf(cmToInch(newMetricCalf));
                          setNewMetricNeck(cmToInch(newMetricNeck));
                        }
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                        modalUnit === 'inch'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-pink-700 hover:text-slate-800'
                      }`}
                    >
                      นิ้ว (in)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">
                      👕 รอบอก {modalUnit === 'inch' ? '(in)' : '(cm)'}
                    </label>
                    <input
                      type="number"
                      step={modalUnit === 'inch' ? '0.1' : '0.5'}
                      placeholder={modalUnit === 'inch' ? 'เช่น 40.0' : 'เช่น 102'}
                      value={newMetricChest ?? ''}
                      onChange={(e) => setNewMetricChest(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">
                      🥋 รอบไหล่ {modalUnit === 'inch' ? '(in)' : '(cm)'}
                    </label>
                    <input
                      type="number"
                      step={modalUnit === 'inch' ? '0.1' : '0.5'}
                      placeholder={modalUnit === 'inch' ? 'เช่น 46.5' : 'เช่น 118'}
                      value={newMetricShoulders ?? ''}
                      onChange={(e) => setNewMetricShoulders(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">
                      ⏳ รอบเอว {modalUnit === 'inch' ? '(in)' : '(cm)'}
                    </label>
                    <input
                      type="number"
                      step={modalUnit === 'inch' ? '0.1' : '0.5'}
                      placeholder={modalUnit === 'inch' ? 'เช่น 31.0' : 'เช่น 79'}
                      value={newMetricWaist ?? ''}
                      onChange={(e) => setNewMetricWaist(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">
                      🍑 รอบสะโพก {modalUnit === 'inch' ? '(in)' : '(cm)'}
                    </label>
                    <input
                      type="number"
                      step={modalUnit === 'inch' ? '0.1' : '0.5'}
                      placeholder={modalUnit === 'inch' ? 'เช่น 37.0' : 'เช่น 94'}
                      value={newMetricHips ?? ''}
                      onChange={(e) => setNewMetricHips(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">
                      🦵 รอบต้นขา {modalUnit === 'inch' ? '(in)' : '(cm)'}
                    </label>
                    <input
                      type="number"
                      step={modalUnit === 'inch' ? '0.1' : '0.5'}
                      placeholder={modalUnit === 'inch' ? 'เช่น 22.8' : 'เช่น 58'}
                      value={newMetricThigh ?? ''}
                      onChange={(e) => setNewMetricThigh(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">
                      💪 รอบต้นแขน {modalUnit === 'inch' ? '(in)' : '(cm)'}
                    </label>
                    <input
                      type="number"
                      step={modalUnit === 'inch' ? '0.1' : '0.5'}
                      placeholder={modalUnit === 'inch' ? 'เช่น 14.2' : 'เช่น 36'}
                      value={newMetricArm ?? ''}
                      onChange={(e) => setNewMetricArm(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">
                      🦶 รอบน่อง {modalUnit === 'inch' ? '(in)' : '(cm)'}
                    </label>
                    <input
                      type="number"
                      step={modalUnit === 'inch' ? '0.1' : '0.5'}
                      placeholder={modalUnit === 'inch' ? 'เช่น 14.5' : 'เช่น 37'}
                      value={newMetricCalf ?? ''}
                      onChange={(e) => setNewMetricCalf(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-pink-900 font-semibold text-[11px] mb-1">
                      👔 รอบคอ {modalUnit === 'inch' ? '(in)' : '(cm)'}
                    </label>
                    <input
                      type="number"
                      step={modalUnit === 'inch' ? '0.1' : '0.5'}
                      placeholder={modalUnit === 'inch' ? 'เช่น 15.0' : 'เช่น 38'}
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
