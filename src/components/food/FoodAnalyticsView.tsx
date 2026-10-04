import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodLog, WaterLog, UserProfile } from '../../types';
import {
  TrendingUp,
  Calendar,
  Flame,
  Droplets,
  Award,
  ChevronRight,
  ChevronLeft,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart,
  Utensils,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getUserAvatar } from '../../utils/mascotLevels';

interface FoodAnalyticsViewProps {
  selectedUserKey: 'primary' | 'partner';
  onSelectUserKey: (key: 'primary' | 'partner') => void;
  onNavigateToDate?: (dateStr: string) => void;
}

type TimeRangeOption = '7d' | '14d' | '30d' | '90d' | 'all';

type MetricKey =
  | 'kcal'
  | 'protein_g'
  | 'carb_g'
  | 'fat_g'
  | 'water_ml'
  | 'sodium_mg'
  | 'sugar_g'
  | 'fiber_g';

interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  icon: string;
  color: string;
  barColor: string;
  overColor: string;
  underColor: string;
  isLimitType?: boolean; // If true, exceeding is considered 'Over Limit' (e.g. Sodium, Sugar)
}

const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  kcal: {
    key: 'kcal',
    label: 'พลังงาน (แคลอรี่)',
    unit: 'kcal',
    icon: '🔥',
    color: '#f97316',
    barColor: 'from-amber-400 to-orange-500',
    overColor: '#ef4444',
    underColor: '#38bdf8',
  },
  protein_g: {
    key: 'protein_g',
    label: 'โปรตีน',
    unit: 'g',
    icon: '🥩',
    color: '#3b82f6',
    barColor: 'from-blue-400 to-indigo-500',
    overColor: '#6366f1',
    underColor: '#93c5fd',
  },
  carb_g: {
    key: 'carb_g',
    label: 'คาร์โบไฮเดรต',
    unit: 'g',
    icon: '🍞',
    color: '#10b981',
    barColor: 'from-emerald-400 to-teal-500',
    overColor: '#f59e0b',
    underColor: '#6ee7b7',
  },
  fat_g: {
    key: 'fat_g',
    label: 'ไขมัน',
    unit: 'g',
    icon: '🥑',
    color: '#ec4899',
    barColor: 'from-pink-400 to-rose-500',
    overColor: '#f43f5e',
    underColor: '#fbcfe8',
  },
  water_ml: {
    key: 'water_ml',
    label: 'น้ำดื่ม',
    unit: 'ml',
    icon: '💧',
    color: '#06b6d4',
    barColor: 'from-cyan-400 to-blue-500',
    overColor: '#0ea5e9',
    underColor: '#bae6fd',
  },
  sodium_mg: {
    key: 'sodium_mg',
    label: 'โซเดียม',
    unit: 'mg',
    icon: '🧂',
    color: '#8b5cf6',
    barColor: 'from-purple-400 to-violet-500',
    overColor: '#ef4444',
    underColor: '#c4b5fd',
    isLimitType: true,
  },
  sugar_g: {
    key: 'sugar_g',
    label: 'น้ำตาล',
    unit: 'g',
    icon: '🍬',
    color: '#f43f5e',
    barColor: 'from-rose-400 to-red-500',
    overColor: '#e11d48',
    underColor: '#fda4af',
    isLimitType: true,
  },
  fiber_g: {
    key: 'fiber_g',
    label: 'ใยอาหาร',
    unit: 'g',
    icon: '🥬',
    color: '#84cc16',
    barColor: 'from-lime-400 to-green-500',
    overColor: '#22c55e',
    underColor: '#d9f99d',
  },
};

export const FoodAnalyticsView: React.FC<FoodAnalyticsViewProps> = ({
  selectedUserKey,
  onSelectUserKey,
  onNavigateToDate,
}) => {
  const {
    allFoodLogs,
    allWaterLogs,
    primaryProfile,
    partnerProfile,
    activeProfileKey,
  } = useApp();

  const isMaxnum = selectedUserKey === 'primary';
  const targetProfile: UserProfile = isMaxnum ? primaryProfile : partnerProfile;

  // Selected filters
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('14d');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('kcal');
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Targets and limits for active profile
  const userTargets: Record<MetricKey, number> = useMemo(() => {
    return {
      kcal: targetProfile.kcal_target || (isMaxnum ? 2400 : 1750),
      protein_g: targetProfile.protein_target_g || (isMaxnum ? 150 : 110),
      carb_g: targetProfile.carb_target_g || (isMaxnum ? 270 : 190),
      fat_g: targetProfile.fat_target_g || (isMaxnum ? 70 : 50),
      water_ml: targetProfile.water_target_ml || (isMaxnum ? 2500 : 2000),
      sodium_mg: targetProfile.sodium_limit_mg || 2000,
      sugar_g: targetProfile.sugar_limit_g || 24,
      fiber_g: targetProfile.fiber_target_g || 25,
    };
  }, [targetProfile, isMaxnum]);

  // Filter logs for selected user
  const userFoodLogs = useMemo(() => {
    return (allFoodLogs || []).filter(
      (l) => (l.user_id || 'primary') === selectedUserKey
    );
  }, [allFoodLogs, selectedUserKey]);

  const userWaterLogs = useMemo(() => {
    return (allWaterLogs || []).filter(
      (w) => (w.user_id || 'primary') === selectedUserKey
    );
  }, [allWaterLogs, selectedUserKey]);

  // Generate date list based on timeRange
  const dateRangeList = useMemo(() => {
    const dates: string[] = [];
    const todayObj = new Date();
    
    // Find earliest log date if 'all'
    let numDays = 14;
    if (timeRange === '7d') numDays = 7;
    else if (timeRange === '14d') numDays = 14;
    else if (timeRange === '30d') numDays = 30;
    else if (timeRange === '90d') numDays = 90;
    else if (timeRange === 'all') {
      const allDates = [
        ...userFoodLogs.map((l) => l.date),
        ...userWaterLogs.map((w) => w.date),
      ].filter(Boolean).sort();
      
      if (allDates.length > 0) {
        const earliest = new Date(allDates[0]);
        const diffTime = Math.abs(todayObj.getTime() - earliest.getTime());
        numDays = Math.max(7, Math.min(180, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1));
      } else {
        numDays = 14;
      }
    }

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(todayObj.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [timeRange, userFoodLogs, userWaterLogs]);

  // Group daily aggregated stats
  interface DailyStat {
    date: string;
    displayDateTh: string;
    dayNameTh: string;
    kcal: number;
    protein_g: number;
    carb_g: number;
    fat_g: number;
    water_ml: number;
    sodium_mg: number;
    sugar_g: number;
    fiber_g: number;
    foodCount: number;
    foods: FoodLog[];
  }

  const dailyStats: DailyStat[] = useMemo(() => {
    return dateRangeList.map((dateStr) => {
      const foods = userFoodLogs.filter((l) => l.date === dateStr);
      const waters = userWaterLogs.filter((w) => w.date === dateStr);

      const kcal = foods.reduce((sum, f) => sum + (f.kcal || 0), 0);
      const protein_g = foods.reduce((sum, f) => sum + (f.protein_g || 0), 0);
      const carb_g = foods.reduce((sum, f) => sum + (f.carb_g || 0), 0);
      const fat_g = foods.reduce((sum, f) => sum + (f.fat_g || 0), 0);
      const sodium_mg = foods.reduce((sum, f) => sum + (f.sodium_mg || 0), 0);
      const sugar_g = foods.reduce((sum, f) => sum + (f.sugar_g || 0), 0);
      const fiber_g = foods.reduce((sum, f) => sum + (f.fiber_g || 0), 0);
      const water_ml = waters.reduce((sum, w) => sum + (w.amount_ml || 0), 0);

      const dObj = new Date(dateStr);
      const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const dayNameTh = thaiDays[dObj.getDay()];
      const displayDateTh = `${dObj.getDate()} ${thaiMonths[dObj.getMonth()]}`;

      return {
        date: dateStr,
        displayDateTh,
        dayNameTh,
        kcal: Math.round(kcal),
        protein_g: Math.round(protein_g * 10) / 10,
        carb_g: Math.round(carb_g * 10) / 10,
        fat_g: Math.round(fat_g * 10) / 10,
        water_ml: Math.round(water_ml),
        sodium_mg: Math.round(sodium_mg),
        sugar_g: Math.round(sugar_g * 10) / 10,
        fiber_g: Math.round(fiber_g * 10) / 10,
        foodCount: foods.length,
        foods,
      };
    });
  }, [dateRangeList, userFoodLogs, userWaterLogs]);

  // Current metric config & values
  const currentMetricConfig = METRIC_CONFIGS[selectedMetric];
  const targetValue = userTargets[selectedMetric];

  // Calculate high-level summary KPIs
  const summaryKPIs = useMemo(() => {
    const daysWithData = dailyStats.filter((d) => d[selectedMetric] > 0);
    const totalVal = dailyStats.reduce((sum, d) => sum + d[selectedMetric], 0);
    const avgVal = daysWithData.length > 0 ? totalVal / daysWithData.length : 0;

    let onTargetCount = 0;
    let overCount = 0;
    let underCount = 0;

    dailyStats.forEach((d) => {
      const val = d[selectedMetric];
      if (val === 0 && d.foodCount === 0) return; // Skip days with no records

      if (currentMetricConfig.isLimitType) {
        // For limit types (e.g. Sodium <= 2000, Sugar <= 24)
        if (val > targetValue) overCount++;
        else onTargetCount++;
      } else {
        // For target types (e.g. Kcal 2400 +-10%, Protein >= 150)
        const lowerBound = targetValue * 0.9;
        const upperBound = targetValue * 1.15;
        if (val > upperBound) overCount++;
        else if (val < lowerBound) underCount++;
        else onTargetCount++;
      }
    });

    const maxDay = [...dailyStats].sort((a, b) => b[selectedMetric] - a[selectedMetric])[0];
    const minDay = [...daysWithData].sort((a, b) => a[selectedMetric] - b[selectedMetric])[0];

    return {
      avg: Math.round(avgVal * 10) / 10,
      totalVal: Math.round(totalVal),
      activeDays: daysWithData.length,
      totalDays: dailyStats.length,
      onTargetCount,
      overCount,
      underCount,
      maxVal: maxDay ? maxDay[selectedMetric] : 0,
      maxDate: maxDay ? maxDay.displayDateTh : '-',
      minVal: minDay ? minDay[selectedMetric] : 0,
      minDate: minDay ? minDay.displayDateTh : '-',
    };
  }, [dailyStats, selectedMetric, targetValue, currentMetricConfig]);

  // Top 5 Most Frequent Foods Calculation
  const topFrequentFoods = useMemo(() => {
    const map = new Map<string, { count: number; totalKcal: number; totalP: number; totalC: number; totalF: number; sampleLog: FoodLog }>();

    userFoodLogs.forEach((l) => {
      const normalizedName = l.name.trim();
      if (!normalizedName) return;

      const existing = map.get(normalizedName);
      if (existing) {
        existing.count += 1;
        existing.totalKcal += l.kcal || 0;
        existing.totalP += l.protein_g || 0;
        existing.totalC += l.carb_g || 0;
        existing.totalF += l.fat_g || 0;
      } else {
        map.set(normalizedName, {
          count: 1,
          totalKcal: l.kcal || 0,
          totalP: l.protein_g || 0,
          totalC: l.carb_g || 0,
          totalF: l.fat_g || 0,
          sampleLog: l,
        });
      }
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgKcal: Math.round(data.totalKcal / data.count),
        avgP: Math.round((data.totalP / data.count) * 10) / 10,
        avgC: Math.round((data.totalC / data.count) * 10) / 10,
        avgF: Math.round((data.totalF / data.count) * 10) / 10,
        sample: data.sampleLog,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [userFoodLogs]);

  // Overall Water Intake KPI
  const waterKPI = useMemo(() => {
    const totalWater = dailyStats.reduce((sum, d) => sum + d.water_ml, 0);
    const activeWaterDays = dailyStats.filter((d) => d.water_ml > 0).length;
    const avgWater = activeWaterDays > 0 ? Math.round(totalWater / activeWaterDays) : 0;
    const waterTarget = userTargets.water_ml;
    const targetMetDays = dailyStats.filter((d) => d.water_ml >= waterTarget).length;

    return {
      totalWater,
      avgWater,
      activeWaterDays,
      waterTarget,
      targetMetDays,
      compliancePct: activeWaterDays > 0 ? Math.round((targetMetDays / activeWaterDays) * 100) : 0,
    };
  }, [dailyStats, userTargets.water_ml]);

  // Chart Dimensions & Scaling
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 24;
  const paddingY = 24;
  const graphInnerWidth = chartWidth - paddingX * 2;
  const graphInnerHeight = chartHeight - paddingY * 2;

  const maxChartVal = useMemo(() => {
    const rawMax = Math.max(...dailyStats.map((d) => d[selectedMetric]), targetValue);
    return rawMax > 0 ? Math.ceil(rawMax * 1.2) : 100;
  }, [dailyStats, selectedMetric, targetValue]);

  const targetY = paddingY + graphInnerHeight - (targetValue / maxChartVal) * graphInnerHeight;

  // Active Hovered Day Details
  const activeHoveredData = useMemo(() => {
    if (!hoveredDay) return null;
    return dailyStats.find((d) => d.date === hoveredDay) || null;
  }, [hoveredDay, dailyStats]);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header Card with User Toggle */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/95 border-2 border-pink-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-pink-300 shadow-2xs shrink-0 bg-white flex items-center justify-center">
            <img
              src={getUserAvatar(selectedUserKey)}
              alt={targetProfile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                ประวัติการกิน & วิเคราะห์โภชนาการ
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                {targetProfile.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              ติดตามแคลอรี่ สารอาหาร น้ำดื่ม และเมนูยอดฮิตย้อนหลัง
            </p>
          </div>
        </div>

        {/* Switch User Pills */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200 gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onSelectUserKey('primary')}
            className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedUserKey === 'primary'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <img src={getUserAvatar('primary')} className="w-3.5 h-3.5 rounded-full object-cover" />
            <span>แม็กนั่ม</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectUserKey('partner')}
            className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedUserKey === 'partner'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <img src={getUserAvatar('partner')} className="w-3.5 h-3.5 rounded-full object-cover" />
            <span>มะนาว</span>
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
          {[
            { key: '7d' as const, label: '7 วัน (1 วีค)' },
            { key: '14d' as const, label: '14 วัน (2 วีค)' },
            { key: '30d' as const, label: '30 วัน (1 เดือน)' },
            { key: '90d' as const, label: '90 วัน (3 เดือน)' },
            { key: 'all' as const, label: 'ทั้งหมด' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTimeRange(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                timeRange === item.key
                  ? isMaxnum
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-pink-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Carousel / Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
          <span className="flex items-center gap-1.5">
            <Filter size={13} className="text-pink-500" />
            <span>เลือกสารอาหารที่ต้องการวิเคราะห์:</span>
          </span>
          <span className="text-[11px] text-slate-400">
            เป้าหมาย: <strong className="text-slate-700">{targetValue} {currentMetricConfig.unit}</strong>
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {(Object.keys(METRIC_CONFIGS) as MetricKey[]).map((mKey) => {
            const cfg = METRIC_CONFIGS[mKey];
            const isSelected = selectedMetric === mKey;
            return (
              <button
                key={mKey}
                type="button"
                onClick={() => setSelectedMetric(mKey)}
                className={`py-2 px-1.5 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-pink-300/60'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                <span className="text-base">{cfg.icon}</span>
                <span className="text-[11px] font-black truncate max-w-full">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Daily Chart Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-pink-200/90 shadow-md space-y-4">
        {/* Chart Header & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentMetricConfig.icon}</span>
              <h3 className="text-base font-black text-slate-800 tracking-tight">
                กราฟสถิติรายวัน: {currentMetricConfig.label}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              เปรียบเทียบปริมาณที่กินในแต่ละวันกับเป้าหมาย ({targetValue} {currentMetricConfig.unit}/วัน)
            </p>
          </div>

          {/* Status Color Legend */}
          <div className="flex items-center gap-3 text-[11px] font-bold flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
              <span>พอดี/ถึงเป้า</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
              <span>เกินเป้า/ลิมิต</span>
            </span>
            <span className="flex items-center gap-1.5 text-sky-600">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-xs" />
              <span>ยังไม่ถึง</span>
            </span>
          </div>
        </div>

        {/* Hovered Day Tooltip Box */}
        {activeHoveredData ? (
          <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-white font-bold text-center text-xs">
                <div>{activeHoveredData.dayNameTh}</div>
                <div className="text-[10px] text-white/70">{activeHoveredData.displayDateTh}</div>
              </div>
              <div>
                <div className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{activeHoveredData[selectedMetric]} {currentMetricConfig.unit}</span>
                  {activeHoveredData[selectedMetric] > targetValue * (currentMetricConfig.isLimitType ? 1 : 1.15) ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                      เกิน {Math.round(activeHoveredData[selectedMetric] - targetValue)} {currentMetricConfig.unit}
                    </span>
                  ) : activeHoveredData[selectedMetric] >= targetValue * 0.9 ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold">
                      ✓ บรรลุเป้าหมาย
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500 text-white font-bold">
                      ขาด {Math.round(targetValue - activeHoveredData[selectedMetric])} {currentMetricConfig.unit}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-white/70 mt-0.5">
                  มื้ออาหาร: {activeHoveredData.foodCount} รายการ • น้ำดื่ม: {activeHoveredData.water_ml} ml
                </div>
              </div>
            </div>
            {onNavigateToDate && (
              <button
                type="button"
                onClick={() => onNavigateToDate(activeHoveredData.date)}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition cursor-pointer shrink-0"
              >
                <span>ดูมื้ออาหาร</span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 px-1">
            <Sparkles size={12} className="text-pink-400" />
            <span>แตะหรือชี้ที่แท่งกราฟของแต่ละวันเพื่อดูข้อมูลสรุป</span>
          </div>
        )}

        {/* Responsive SVG Bar Chart */}
        <div className="relative w-full overflow-x-auto pb-2">
          <div className="min-w-[320px] w-full">
            <svg
              className="w-full h-44 sm:h-52 overflow-visible select-none"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            >
              {/* Target / Limit Reference Line */}
              <line
                x1={paddingX}
                y1={targetY}
                x2={chartWidth - paddingX}
                y2={targetY}
                stroke={currentMetricConfig.color}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.7"
              />
              <text
                x={chartWidth - paddingX}
                y={targetY - 5}
                fill={currentMetricConfig.color}
                fontSize="9"
                fontWeight="bold"
                textAnchor="end"
              >
                {currentMetricConfig.isLimitType ? 'Limit: ' : 'Target: '}
                {targetValue} {currentMetricConfig.unit}
              </text>

              {/* Day Bars */}
              {dailyStats.map((d, idx) => {
                const totalBars = dailyStats.length;
                const slotWidth = graphInnerWidth / totalBars;
                const barWidth = Math.max(6, Math.min(24, slotWidth * 0.65));
                const x = paddingX + idx * slotWidth + (slotWidth - barWidth) / 2;
                const val = d[selectedMetric];
                const barHeight = Math.max(2, (val / maxChartVal) * graphInnerHeight);
                const y = paddingY + graphInnerHeight - barHeight;

                // Color calculation
                let fillColor = '#10b981'; // Green (Optimal)
                if (currentMetricConfig.isLimitType) {
                  fillColor = val > targetValue ? '#ef4444' : '#10b981';
                } else {
                  if (val > targetValue * 1.15) fillColor = '#ef4444'; // Red (Over)
                  else if (val < targetValue * 0.9) fillColor = val === 0 ? '#e2e8f0' : '#38bdf8'; // Blue (Under) / Grey
                  else fillColor = '#10b981'; // Green
                }

                const isHovered = hoveredDay === d.date;

                return (
                  <g
                    key={d.date}
                    className="cursor-pointer transition-transform duration-150"
                    onMouseEnter={() => setHoveredDay(d.date)}
                    onClick={() => {
                      setHoveredDay(d.date);
                      setExpandedDay(expandedDay === d.date ? null : d.date);
                    }}
                  >
                    {/* Hover highlight background pillar */}
                    <rect
                      x={paddingX + idx * slotWidth}
                      y={paddingY}
                      width={slotWidth}
                      height={graphInnerHeight}
                      fill={isHovered ? 'rgba(244, 63, 94, 0.08)' : 'transparent'}
                      rx="4"
                    />

                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={fillColor}
                      rx={Math.min(4, barWidth / 2)}
                      className={isHovered ? 'filter drop-shadow-md' : ''}
                      opacity={isHovered ? 1 : 0.85}
                    />

                    {/* Value on top of bar if enough space */}
                    {totalBars <= 14 && val > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 4}
                        fill="#64748b"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {val}
                      </text>
                    )}

                    {/* X-axis Day Label */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - 4}
                      fill={isHovered ? '#0f172a' : '#94a3b8'}
                      fontSize={totalBars > 20 ? '7' : '8'}
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {totalBars <= 14 ? d.displayDateTh.split(' ')[0] : idx % 3 === 0 ? d.displayDateTh.split(' ')[0] : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* KPI & Performance Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Daily Average Card */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>ค่าเฉลี่ยต่อวัน</span>
            <span className="text-base">{currentMetricConfig.icon}</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-800">
            {summaryKPIs.avg}{' '}
            <span className="text-xs font-normal text-slate-500">{currentMetricConfig.unit}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            เป้าหมาย: <strong>{targetValue} {currentMetricConfig.unit}</strong>
          </div>
        </div>

        {/* Met Target Days Card */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
            <span>วันที่บรรลุเป้าหมาย</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-900">
            {summaryKPIs.onTargetCount}{' '}
            <span className="text-xs font-normal text-emerald-700">/ {summaryKPIs.activeDays} วัน</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold">
            {summaryKPIs.activeDays > 0
              ? `${Math.round((summaryKPIs.onTargetCount / summaryKPIs.activeDays) * 100)}% บรรลุเกณฑ์`
              : 'ยังไม่มีข้อมูล'}
          </div>
        </div>

        {/* Over Limit Days Card */}
        <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-800 font-semibold">
            <span>วันที่เกินเป้าหมาย</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-900">
            {summaryKPIs.overCount}{' '}
            <span className="text-xs font-normal text-rose-700">วัน</span>
          </div>
          <div className="text-[11px] text-rose-700 font-medium">
            สูงสุด: <strong>{summaryKPIs.maxVal} {currentMetricConfig.unit}</strong> ({summaryKPIs.maxDate})
          </div>
        </div>

        {/* Under Target Days Card */}
        <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-sky-800 font-semibold">
            <span>วันที่ยังไม่ถึงเกณฑ์</span>
            <ArrowDownRight size={16} className="text-sky-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-sky-900">
            {summaryKPIs.underCount}{' '}
            <span className="text-xs font-normal text-sky-700">วัน</span>
          </div>
          <div className="text-[11px] text-sky-700 font-medium">
            ต่ำสุด: <strong>{summaryKPIs.minVal} {currentMetricConfig.unit}</strong> ({summaryKPIs.minDate})
          </div>
        </div>
      </div>

      {/* 💧 Water Intake Overview Section */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-cyan-50/90 via-sky-50/70 to-blue-50/90 border border-cyan-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-xs">
              <Droplets size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800">
                ภาพรวมการดื่มน้ำ (Daily Water Overview)
              </h3>
              <p className="text-xs text-slate-500">
                เป้าหมายการดื่มน้ำ {waterKPI.waterTarget} ml / วัน
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-cyan-700">{waterKPI.avgWater}</span>
            <span className="text-xs text-slate-500"> ml/วัน (เฉลี่ย)</span>
          </div>
        </div>

        {/* Water Progress Bar */}
        <div className="space-y-1.5 bg-white/80 p-3 rounded-2xl border border-cyan-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>ความสม่ำเสมอในการดื่มน้ำครบโควต้า</span>
            <span className="text-cyan-600">{waterKPI.targetMetDays} จาก {waterKPI.activeWaterDays} วัน ({waterKPI.compliancePct}%)</span>
          </div>
          <div className="w-full h-3 rounded-full bg-cyan-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, waterKPI.compliancePct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 🏆 Top 5 Most Frequent Foods Section */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-pink-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            <h3 className="text-sm sm:text-base font-black text-slate-800">
              5 อันดับเมนูอาหารที่กินบ่อยที่สุด (Top 5 Favorites)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            จากประวัติทั้งหมด {userFoodLogs.length} มื้อ
          </span>
        </div>

        {topFrequentFoods.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            ยังไม่มีบันทึกเมนูอาหารสำหรับ {targetProfile.name}
          </div>
        ) : (
          <div className="space-y-2">
            {topFrequentFoods.map((item, rank) => {
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
              return (
                <div
                  key={item.name}
                  className="p-3 rounded-2xl bg-slate-50/70 hover:bg-pink-50/40 border border-slate-200/80 hover:border-pink-200 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg shrink-0">{medals[rank] || '✨'}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 text-xs sm:text-sm truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-pink-100 text-pink-700 shrink-0">
                          ทานไป {item.count} ครั้ง
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5 flex-wrap">
                        <span>เฉลี่ย <strong>{item.avgKcal}</strong> kcal</span>
                        <span className="text-slate-300">•</span>
                        <span>🥩 P: <strong>{item.avgP}g</strong></span>
                        <span>🍞 C: <strong>{item.avgC}g</strong></span>
                        <span>🥑 F: <strong>{item.avgF}g</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📅 Day-by-Day Historical Log Details Drawer / List */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-rose-500" />
            <h3 className="text-sm sm:text-base font-black text-slate-800">
              รายละเอียดการกินรายวัน (Daily Log Breakdown)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-bold">
            แตะเพื่อดูมื้ออาหาร
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {dailyStats.filter((d) => d.foodCount > 0 || d.water_ml > 0).map((d) => {
            const isExpanded = expandedDay === d.date;
            return (
              <div
                key={d.date}
                className="rounded-2xl border border-slate-200 overflow-hidden bg-white transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setExpandedDay(isExpanded ? null : d.date)}
                  className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      {d.dayNameTh} {d.displayDateTh}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {d.kcal} kcal
                    </span>
                    <span className="text-[11px] text-slate-500">
                      (P: {d.protein_g}g | C: {d.carb_g}g | F: {d.fat_g}g)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[11px] font-bold text-cyan-600">💧 {d.water_ml} ml</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded meal list for that day */}
                {isExpanded && (
                  <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pb-1">
                      <span>รายการอาหาร ({d.foods.length} เมนู)</span>
                      {onNavigateToDate && (
                        <button
                          type="button"
                          onClick={() => onNavigateToDate(d.date)}
                          className="text-pink-600 hover:text-pink-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>เปิดหน้าบันทึกของวันนี้</span>
                          <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                    {d.foods.map((food) => (
                      <div
                        key={food.log_id}
                        className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{food.name}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">
                            ({food.meal}) {food.time}
                          </span>
                        </div>
                        <div className="text-right font-semibold text-slate-700">
                          <span>{food.kcal} kcal</span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            (P:{food.protein_g} C:{food.carb_g} F:{food.fat_g})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
