import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType, MealType } from '../types';
import { getDefaultGeminiApiKey, analyzeSlipImage } from '../services/gemini';
import {
  DollarSign,
  PieChart,
  Camera,
  Plus,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Check,
  MessageCircle,
  ExternalLink,
  Edit2,
  AlertCircle,
  Search,
  UploadCloud,
  Send,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { getUserAvatar } from '../utils/mascotLevels';

// ========================================================
// CATEGORIES: EXPENSE vs INCOME
// ========================================================
export const EXPENSE_CATEGORIES = [
  { id: 'exp-1', name: 'อาหารและเครื่องดื่ม', icon: '🍜', color: '#ff6584' },
  { id: 'exp-2', name: 'ของใช้ & ช้อปปิ้ง', icon: '🛍️', color: '#ec4899' },
  { id: 'exp-3', name: 'เดินทาง / น้ำมัน', icon: '🚗', color: '#38bdf8' },
  { id: 'exp-4', name: 'บิล & ค่าน้ำค่าไฟ', icon: '💡', color: '#a855f7' },
  { id: 'exp-5', name: 'สุขภาพ / ยา / คลินิก', icon: '💊', color: '#10b981' },
  { id: 'exp-6', name: 'บันเทิง & สังสรรค์', icon: '🎮', color: '#6366f1' },
  { id: 'exp-7', name: 'ค่าใช้จ่ายอื่นๆ', icon: '📦', color: '#64748b' },
];

export const INCOME_CATEGORIES = [
  { id: 'inc-1', name: 'เงินเดือนประจำ', icon: '💰', color: '#10b981' },
  { id: 'inc-2', name: 'ธุรกิจ / ค้าขาย / กำไร', icon: '💼', color: '#059669' },
  { id: 'inc-3', name: 'โบนัส & คอมมิชชั่น', icon: '🎁', color: '#f59e0b' },
  { id: 'inc-4', name: 'รับโอนเงิน / เพื่อนคืน', icon: '💸', color: '#3b82f6' },
  { id: 'inc-5', name: 'เงินปันผล & ดอกเบี้ย', icon: '📈', color: '#8b5cf6' },
  { id: 'inc-6', name: 'รายรับพิเศษ / อื่นๆ', icon: '🪙', color: '#64748b' },
];

export function getCategoryInfo(name: string, type: TransactionType = 'EXPENSE') {
  const list = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const found = list.find((c) => c.name === name);
  if (found) return found;
  return { id: 'unknown', name, icon: type === 'INCOME' ? '💰' : '🛍️', color: '#64748b' };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  images?: string[];
  transaction?: Transaction;
  foodKcal?: number;
  createdAt: string;
  isSyncedGoogleSheet?: boolean;
}

export const SetthiMooAuanView: React.FC = () => {
  const {
    transactions,
    allTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    activeProfileKey,
    setActiveProfileKey,
    isSpecialPair,
    setActiveWorld,
    addFoodLog,
    settings,
  } = useApp();

  const isMaxnum = activeProfileKey === 'primary';
  const effectiveGeminiKey = settings.geminiApiKey || getDefaultGeminiApiKey();

  // Sub-tabs: 'chat' (Chat-First) vs 'dashboard' (Summary & Full Table)
  const [subTab, setSubTab] = useState<'chat' | 'dashboard'>('chat');

  // Selected Date Filter (Defaults to Today)
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Chat State
  const [chatInputText, setChatInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatTextInputRef = useRef<HTMLInputElement>(null);

  // Staged Slips State (Allows typing notes before sending!)
  const [stagedSlips, setStagedSlips] = useState<{ file: File; previewUrl: string }[]>([]);

  // Initial Chat Messages (greeting + today's existing transactions)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: 'สวัสดีครับ! ผมคือหมูอ้วนช่วยจด 🐷💰 พิมพ์ค่าใช้จ่าย เช่น "กะเพราไข่ดาว 60 kbank" หรือกดปุ่ม 📸 แนบรูปสลิปและพิมพ์บอกรายละเอียดได้เลยครับ เดี๋ยวผมบันทึกบัญชี ซิงค์ลง Google Sheet และเชื่อมต่อไปยังหมูอ้วนฟิตให้ทันที!',
        createdAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isProcessing]);

  // Smart Deletion Modal State
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<TransactionType>('EXPENSE');
  const [addAmount, setAddAmount] = useState<string>('');
  const [addCategory, setAddCategory] = useState<string>('อาหารและเครื่องดื่ม');
  const [addMerchant, setAddMerchant] = useState<string>('');
  const [addWallet, setAddWallet] = useState<string>('KBank');
  const [addNote, setAddNote] = useState<string>('');
  const [addDate, setAddDate] = useState<string>(today);
  const [addTime, setAddTime] = useState<string>(
    new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  );
  const [alsoLogFood, setAlsoLogFood] = useState(false);
  const [foodMeal, setFoodMeal] = useState<MealType>('lunch');
  const [foodKcal, setFoodKcal] = useState<number>(450);

  // Edit Modal State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Stats Mode State
  const [statsViewMode, setStatsViewMode] = useState<'EXPENSE' | 'INCOME' | 'COMPARE'>('EXPENSE');

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Local regex parser fallback for natural Thai text
  const localRegexParse = (rawText: string) => {
    const text = rawText.trim();
    let amount = 0;
    const amtMatch = text.match(/(\d+(\.\d+)?)/);
    if (amtMatch) amount = parseFloat(amtMatch[1]);

    let type: TransactionType = 'EXPENSE';
    if (text.includes('ได้') || text.includes('รับ') || text.includes('เงินเดือน') || text.includes('คืนเงิน')) {
      type = 'INCOME';
    }

    let category = type === 'INCOME' ? 'เงินเดือนประจำ' : 'อาหารและเครื่องดื่ม';
    if (text.includes('น้ำมัน') || text.includes('รถ') || text.includes('แท็กซี่') || text.includes('bts')) {
      category = 'เดินทาง / น้ำมัน';
    } else if (text.includes('เซเว่น') || text.includes('ซื้อของ') || text.includes('ช้อป')) {
      category = 'ของใช้ & ช้อปปิ้ง';
    } else if (text.includes('ค่าไฟ') || text.includes('ค่าน้ำ') || text.includes('เน็ต') || text.includes('บิล')) {
      category = 'บิล & ค่าน้ำค่าไฟ';
    } else if (text.includes('ยา') || text.includes('หมอ') || text.includes('คลินิก')) {
      category = 'สุขภาพ / ยา / คลินิก';
    }

    let wallet = 'เงินสด';
    if (text.toLowerCase().includes('kbank') || text.includes('กสิกร')) wallet = 'KBank';
    else if (text.toLowerCase().includes('scb') || text.includes('ไทยพาณิชย์')) wallet = 'SCB';
    else if (text.includes('พร้อมเพย์') || text.toLowerCase().includes('promptpay')) wallet = 'PromptPay';
    else if (text.includes('บัตร') || text.includes('เครดิต')) wallet = 'บัตรเครดิต';

    return {
      isTransaction: true,
      type,
      amount,
      merchant: text.replace(/\d+(\.\d+)?/g, '').replace(/(บาท|บ\.|โอน|จ่าย)/g, '').trim() || (type === 'INCOME' ? 'รายรับ' : 'ค่าใช้จ่าย'),
      category,
      wallet,
      note: rawText,
      replyMessage: `บันทึก "${text}" ฿${amount.toLocaleString()} เรียบร้อยแล้วครับ! 🐷`,
    };
  };

  // Handle files selected -> Put into Staged Slips for typing details before send
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newStaged = Array.from(files).map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));

    setStagedSlips((prev) => [...prev, ...newStaged]);
    e.target.value = '';

    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      chatTextInputRef.current?.focus();
    }, 100);
  };

  const removeStagedSlip = (index: number) => {
    setStagedSlips((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Main Submit Handler (Handles both Staged Slips + Typed Note OR Text-only)
  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isProcessing) return;

    const typedNotes = chatInputText.trim();
    const hasSlips = stagedSlips.length > 0;

    if (!typedNotes && !hasSlips) return;

    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    // Case 1: Slips attached (with or without typed text)
    if (hasSlips) {
      const slipsToProcess = [...stagedSlips];
      const previewUrls = slipsToProcess.map((s) => s.previewUrl);

      // Add user message with both slip images and typed text
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'user-slips-' + Date.now(),
          sender: 'user',
          text: typedNotes ? `${typedNotes} (แนบสลิป ${slipsToProcess.length} รูป)` : `แนบสลิป ${slipsToProcess.length} รูป`,
          images: previewUrls,
          createdAt: nowTime,
        },
      ]);

      setStagedSlips([]);
      setChatInputText('');
      setIsProcessing(true);

      for (let i = 0; i < slipsToProcess.length; i++) {
        const item = slipsToProcess[i];
        setProcessingStatus(`กำลังสแกนสลิปใบที่ ${i + 1}/${slipsToProcess.length} ด้วย AI...`);

        try {
          const base64Data = await fileToBase64(item.file);
          const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

          // Call tested analyzeSlipImage with candidate models
          const parsed = await analyzeSlipImage({
            base64Image: cleanBase64,
            mimeType: item.file.type || 'image/jpeg',
            userNotes: typedNotes || undefined,
            apiKey: effectiveGeminiKey,
          });

          const isFood = parsed.isFood || parsed.suggestedCategory === 'อาหารและเครื่องดื่ม';
          const foodKcalAmt = parsed.estimatedKcal || 450;
          let foodId: string | undefined = undefined;

          const dateParts = (parsed.datetime || '').split(' ');
          const slipDate = dateParts[0] || selectedDate;
          const slipTime = dateParts[1] || nowTime;

          // Auto Two-Way Dual-Log to Fit if food
          if (isFood && parsed.type === 'EXPENSE') {
            foodId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
            await addFoodLog({
              date: slipDate,
              time: slipTime,
              meal: 'lunch',
              name: parsed.merchant || 'มื้ออาหาร',
              grams: 200,
              kcal: foodKcalAmt,
              protein_g: 22,
              carb_g: 45,
              fat_g: 12,
              source: 'ai',
              price_thb: Number(parsed.amount) || 0,
              payment_channel: parsed.bank || 'KBank',
              note: typedNotes ? `สแกนสลิป (${typedNotes})` : 'สแกนสลิปจากเศรษฐีหมูอ้วน',
            });
          }

          // Add Transaction (which triggers Google Sheets realtime sync)
          const newTx = await addTransaction({
            user_id: activeProfileKey,
            user_name: isMaxnum ? 'แม็กนั่ม (Maxnum)' : 'มะนาว (Manow)',
            date: slipDate,
            time: slipTime,
            type: parsed.type || 'EXPENSE',
            category: parsed.suggestedCategory || 'อาหารและเครื่องดื่ม',
            amount: Number(parsed.amount) || 0,
            wallet: parsed.bank || 'KBank',
            merchant: parsed.merchant || 'สลิปโอนเงิน',
            note: typedNotes || parsed.note || '',
            slipRef: parsed.slipRef,
            linked_food_log_id: foodId,
            food_kcal: isFood ? foodKcalAmt : undefined,
          });

          // Add Bot message
          setChatMessages((prev) => [
            ...prev,
            {
              id: 'bot-slip-' + Date.now() + '-' + i,
              sender: 'bot',
              text: `สแกนสลิป "${newTx.merchant}" ยอด ฿${newTx.amount.toLocaleString()} สำเร็จแล้วครับ! 🐷`,
              transaction: newTx,
              foodKcal: isFood ? foodKcalAmt : undefined,
              isSyncedGoogleSheet: true,
              createdAt: nowTime,
            },
          ]);
        } catch (err: any) {
          console.error(err);
          setChatMessages((prev) => [
            ...prev,
            {
              id: 'bot-err-' + Date.now() + '-' + i,
              sender: 'bot',
              text: `ขออภัยครับ สแกนสลิปใบที่ ${i + 1} ไม่สำเร็จ (${err.message || 'ตรวจไม่พบข้อมูล'}) คุณสามารถพิมพ์บอกจำนวนเงินแทนได้เลยครับ 🐷`,
              createdAt: nowTime,
            },
          ]);
        }
      }

      setIsProcessing(false);
      setProcessingStatus('');
      return;
    }

    // Case 2: Text-only message
    const userMsgId = 'msg-' + Date.now();
    setChatMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: typedNotes,
        createdAt: nowTime,
      },
    ]);

    setChatInputText('');
    setIsProcessing(true);
    setProcessingStatus('กำลังวิเคราะห์ข้อความ...');

    try {
      let parsed: any = null;

      if (effectiveGeminiKey) {
        const candidateModels = [
          'gemini-flash-lite-latest',
          'gemini-2.0-flash',
          'gemini-1.5-flash',
          'gemini-flash-latest',
        ];

        const prompt = `
คุณคือ "หมูอ้วนช่วยจด" 🐷 ผู้ช่วยอัจฉริยะด้านการเงินและจดบันทึกรายรับรายจ่ายของแอป "เศรษฐีหมูอ้วน"
ผู้ใช้พิมพ์ข้อความมา: "${typedNotes}"

วิเคราะห์และตอบกลับเป็น JSON Object เท่านั้น:
{
  "isTransaction": true,
  "type": "EXPENSE",
  "amount": 0.0,
  "merchant": "ชื่อรายการ/ร้านค้า",
  "category": "เลือก 1 ชื่อหมวดหมู่: [อาหารและเครื่องดื่ม, เดินทาง / น้ำมัน, ของใช้ & ช้อปปิ้ง, บิล & ค่าน้ำค่าไฟ, สุขภาพ / ยา / คลินิก, บันเทิง & สังสรรค์, ค่าใช้จ่ายอื่นๆ, เงินเดือนประจำ, ธุรกิจ / ค้าขาย / กำไร, โบนัส & คอมมิชชั่น, รับโอนเงิน / เพื่อนคืน, เงินปันผล & ดอกเบี้ย, รายรับพิเศษ / อื่นๆ]",
  "wallet": "เลือก 1 ช่องทาง: KBank, SCB, PromptPay, เงินสด, บัตรเครดิต",
  "isFood": true,
  "estimatedKcal": 450,
  "note": "",
  "replyMessage": "ข้อความตอบกลับน่ารัก อู๊ดๆ 🐷"
}
`;
        for (const model of candidateModels) {
          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveGeminiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
                }),
              }
            );

            if (res.ok) {
              const data = await res.json();
              const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (raw) {
                parsed = JSON.parse(raw.trim());
                break;
              }
            }
          } catch {}
        }
      }

      if (!parsed) parsed = localRegexParse(typedNotes);

      if (parsed.amount > 0) {
        const isFood = parsed.isFood || parsed.category === 'อาหารและเครื่องดื่ม';
        const foodKcalAmt = parsed.estimatedKcal || 450;
        let foodId: string | undefined = undefined;

        // Auto Two-Way Dual-Log to Fit if food
        if (isFood && parsed.type === 'EXPENSE') {
          foodId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          await addFoodLog({
            date: selectedDate,
            time: nowTime,
            meal: 'lunch',
            name: parsed.merchant || 'มื้ออาหาร',
            grams: 200,
            kcal: foodKcalAmt,
            protein_g: 22,
            carb_g: 45,
            fat_g: 12,
            source: 'ai',
            price_thb: parsed.amount,
            payment_channel: parsed.wallet || 'เงินสด',
            note: 'บันทึกผ่านแชทเศรษฐีหมูอ้วน',
          });
        }

        // Add Transaction (which triggers Google Sheets realtime sync)
        const newTx = await addTransaction({
          user_id: activeProfileKey,
          user_name: isMaxnum ? 'แม็กนั่ม (Maxnum)' : 'มะนาว (Manow)',
          date: selectedDate,
          time: nowTime,
          type: parsed.type || 'EXPENSE',
          category: parsed.category || 'อาหารและเครื่องดื่ม',
          amount: Number(parsed.amount),
          wallet: parsed.wallet || 'เงินสด',
          merchant: parsed.merchant || 'รายการจดด่วน',
          note: parsed.note || typedNotes,
          linked_food_log_id: foodId,
          food_kcal: isFood ? foodKcalAmt : undefined,
        });

        // Add Bot message with receipt card
        setChatMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: parsed.replyMessage || `บันทึก ${newTx.merchant} ฿${newTx.amount.toLocaleString()} สำเร็จแล้วครับ! 🐷`,
            transaction: newTx,
            foodKcal: isFood ? foodKcalAmt : undefined,
            isSyncedGoogleSheet: true,
            createdAt: nowTime,
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: `ขออภัยครับ ไม่พบจำนวนเงินในข้อความ กรุณาลองใหม่อีกครั้ง เช่น "ข้าวผัด 60 บาท จ่าย kbank" 🐷`,
            createdAt: nowTime,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      const fallback = localRegexParse(typedNotes);
      if (fallback.amount > 0) {
        const newTx = await addTransaction({
          user_id: activeProfileKey,
          user_name: isMaxnum ? 'แม็กนั่ม (Maxnum)' : 'มะนาว (Manow)',
          date: selectedDate,
          time: nowTime,
          type: fallback.type,
          category: fallback.category,
          amount: fallback.amount,
          wallet: fallback.wallet,
          merchant: fallback.merchant,
          note: fallback.note,
        });
        setChatMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: fallback.replyMessage,
            transaction: newTx,
            isSyncedGoogleSheet: true,
            createdAt: nowTime,
          },
        ]);
      }
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Handle Manual Save from Modal
  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(addAmount);
    if (!amt || isNaN(amt) || amt <= 0) return;

    let foodId: string | undefined = undefined;

    if (alsoLogFood && addType === 'EXPENSE') {
      foodId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      await addFoodLog({
        date: addDate,
        time: addTime,
        meal: foodMeal,
        name: addMerchant.trim() || 'มื้ออาหาร',
        grams: 200,
        kcal: Number(foodKcal) || 450,
        protein_g: 20,
        carb_g: 45,
        fat_g: 12,
        source: 'manual',
        price_thb: amt,
        payment_channel: addWallet,
        note: 'บันทึกพร้อมรายจ่ายจากเศรษฐีหมูอ้วน',
      });
    }

    await addTransaction({
      user_id: activeProfileKey,
      user_name: isMaxnum ? 'แม็กนั่ม (Maxnum)' : 'มะนาว (Manow)',
      date: addDate,
      time: addTime,
      type: addType,
      category: addCategory,
      amount: amt,
      wallet: addWallet,
      merchant: addMerchant.trim() || (addType === 'INCOME' ? 'รายรับ' : 'ค่าใช้จ่าย'),
      note: addNote.trim(),
      linked_food_log_id: foodId,
      food_kcal: alsoLogFood ? foodKcal : undefined,
    });

    setShowAddModal(false);
    setAddAmount('');
    setAddMerchant('');
    setAddNote('');
    setAlsoLogFood(false);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    await updateTransaction(editingTransaction.id, {
      type: editingTransaction.type,
      category: editingTransaction.category,
      amount: Number(editingTransaction.amount) || 0,
      wallet: editingTransaction.wallet,
      merchant: editingTransaction.merchant,
      note: editingTransaction.note,
      date: editingTransaction.date,
      time: editingTransaction.time,
    });

    setEditingTransaction(null);
  };

  // Calculations for Dashboard
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => (t.date || '').startsWith(currentYearMonth));
  }, [transactions, currentYearMonth]);

  const monthIncome = useMemo(() => {
    return monthTransactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const monthExpense = useMemo(() => {
    return monthTransactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const remainingBudget = monthIncome - monthExpense;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  // Donut chart data calculations
  const expenseCatData = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, val]) => {
      const info = getCategoryInfo(name, 'EXPENSE');
      return { name, amount: val, color: info.color, icon: info.icon };
    });
  }, [monthTransactions]);

  const incomeCatData = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'INCOME')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, val]) => {
      const info = getCategoryInfo(name, 'INCOME');
      return { name, amount: val, color: info.color, icon: info.icon };
    });
  }, [monthTransactions]);

  return (
    <div className="space-y-4 pb-28 animate-fadeIn max-w-3xl mx-auto">
      {/* Hidden File Input for Slip Uploading */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* Top World Header Pill */}
      <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-amber-200/90 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-xl shadow-2xs border border-amber-300">
            🐷💰
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
              หมูอ้วนเศรษฐี
            </h2>
            <p className="text-[11px] font-bold text-slate-500">
              {isMaxnum ? 'กระเป๋าแม็กนั่ม 🏋️' : 'กระเป๋ามะนาว 🌸'} • ยอดใช้เดือนนี้ ฿{monthExpense.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* 2 Clean Sub-Tabs: Chat vs Dashboard */}
        <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setSubTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'chat'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageCircle size={13} />
            <span>แชทช่วยจด</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'dashboard'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart size={13} />
            <span>ภาพรวม & รายการ</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: CHAT-FIRST INTERFACE (Slip upload in chat) */}
      {/* ======================================================== */}
      {subTab === 'chat' && (
        <div className="bg-white rounded-3xl border-2 border-amber-200 shadow-sm overflow-hidden flex flex-col h-[70vh] sm:h-[72vh]">
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 overscroll-contain">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Bot Avatar */}
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-base shrink-0 shadow-2xs mt-1">
                    🐷
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs sm:text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-2xs space-y-2'
                  }`}
                >
                  {/* Uploaded Slip Images (If any) */}
                  {msg.images && msg.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-1.5">
                      {msg.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border border-white/40 shadow-xs bg-slate-800"
                        >
                          <img
                            src={imgUrl}
                            alt="Slip preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Text */}
                  {msg.text && <p className="leading-relaxed font-medium">{msg.text}</p>}

                  {/* Receipt Card when a Transaction is recorded */}
                  {msg.transaction && (
                    <div className="bg-white rounded-xl p-3 border border-amber-200 shadow-2xs space-y-2 mt-1">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-base">
                            {getCategoryInfo(msg.transaction.category, msg.transaction.type).icon}
                          </span>
                          <span className="font-extrabold text-slate-800 truncate text-xs">
                            {msg.transaction.merchant}
                          </span>
                        </div>
                        <span
                          className={`font-mono font-black text-sm ${
                            msg.transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-500'
                          }`}
                        >
                          {msg.transaction.type === 'INCOME' ? '+' : '-'}฿{msg.transaction.amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>💳 {msg.transaction.wallet}</span>
                        <span>🏷️ {msg.transaction.category}</span>
                      </div>

                      {/* Sync & Dual-Log Indicators */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                          <span>🟢 ซิงค์กับ Google Sheet แล้ว</span>
                        </span>

                        {msg.foodKcal && (
                          <button
                            type="button"
                            onClick={() => setActiveWorld('fit')}
                            className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 font-bold hover:bg-pink-100 transition cursor-pointer flex items-center gap-1"
                            title="แตะเพื่อเปิดดูในหมูอ้วนฟิต"
                          >
                            <span>🍱 ลงฟิตแล้ว ({msg.foodKcal} kcal) ➜</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-amber-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.createdAt}
                  </span>
                </div>
              </div>
            ))}

            {/* Processing / Scanning Indicator */}
            {isProcessing && (
              <div className="flex gap-2.5 justify-start items-center animate-pulse">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-base shrink-0 shadow-2xs">
                  🐷
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-amber-800 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-amber-600" />
                  <span>{processingStatus || 'หมูอ้วนกำลังคิด...'}</span>
                </div>
              </div>
            )}

            {/* Live Pending Draft Bubble (Shows image staged in chat with real-time typed text!) */}
            {stagedSlips.length > 0 && (
              <div className="flex gap-2.5 justify-end animate-fadeIn">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs sm:text-sm bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-400 text-amber-950 rounded-tr-xs shadow-md space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-black text-amber-900 pb-1.5 border-b border-amber-200/70">
                    <span className="flex items-center gap-1.5">
                      <span>📸 แนบรูปสลิปแล้ว ({stagedSlips.length} รูป)</span>
                    </span>
                    <span className="text-[10px] text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full font-bold animate-pulse">
                      ค้างไว้รอส่ง ⏳
                    </span>
                  </div>

                  {/* Grid of staged slip images with clear remove buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {stagedSlips.map((st, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden border-2 border-amber-300 shadow-sm bg-slate-900 shrink-0"
                      >
                        <img src={st.previewUrl} alt="Staged slip" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeStagedSlip(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer shadow-md transition"
                          title="ลบรูปสลิปนี้"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Live typing text preview */}
                  <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/80 shadow-2xs">
                    {chatInputText.trim() ? (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-700 block">ข้อความกำกับ:</span>
                        <p className="font-bold text-slate-800 text-xs sm:text-sm break-words leading-relaxed">
                          {chatInputText}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-700 italic flex items-center gap-1.5">
                        <span>✏️ พิมพ์รายละเอียดสลิปในช่องด้านล่าง (เช่น "หาร 3 คน 60 kbank") แล้วกดส่ง 🚀</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-0.5 text-[10px] text-amber-700">
                    <span>กดปุ่ม "ส่ง" ด้านล่างเมื่อพิมพ์เสร็จ</span>
                    <button
                      type="button"
                      onClick={() => setStagedSlips([])}
                      className="text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      ยกเลิกรูปทั้งหมด
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-slate-400 font-bold shrink-0">ด่วน:</span>
            {[
              'กินข้าวมันไก่ 60 kbank',
              'กาแฟ 55 บาท',
              'เติมน้ำมัน 800 scb',
              'ซื้อของเซเว่น 185',
              'ได้เงินคืน 500 บาท',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setChatInputText(chip)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold hover:border-amber-300 hover:text-amber-800 whitespace-nowrap cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Staged Slip Previews Bar (Upload + Type details before Send!) */}
          {stagedSlips.length > 0 && (
            <div className="p-2.5 bg-amber-50/90 border-t border-amber-200 flex items-center gap-2 overflow-x-auto animate-fadeIn">
              <span className="text-[11px] font-bold text-amber-900 shrink-0">
                แนบสลิป ({stagedSlips.length}):
              </span>
              <div className="flex items-center gap-2">
                {stagedSlips.map((st, idx) => (
                  <div
                    key={idx}
                    className="relative w-12 h-16 rounded-lg overflow-hidden border border-amber-300 shadow-2xs shrink-0 bg-slate-800"
                  >
                    <img src={st.previewUrl} alt="Staged slip" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeStagedSlip(idx)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 hover:bg-rose-500 text-white flex items-center justify-center text-[9px] cursor-pointer"
                      title="ลบสลิปนี้"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-amber-700 italic">
                (พิมพ์รายละเอียด เช่น "หาร 3 คน" แล้วกดส่งได้เลย)
              </span>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={handleChatSubmit}
            className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            {/* Camera / Slip Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs shrink-0 disabled:opacity-50 ${
                stagedSlips.length > 0
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
              }`}
              title="แนบรูปสลิปโอนเงิน (เลือกได้หลายรูป)"
            >
              <Camera size={18} className={stagedSlips.length > 0 ? 'text-white' : 'text-amber-700'} />
              <span className="hidden sm:inline">
                {stagedSlips.length > 0 ? `แนบแล้ว (${stagedSlips.length})` : 'แนบสลิป'}
              </span>
            </button>

            {/* Text Input */}
            <input
              ref={chatTextInputRef}
              type="text"
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value)}
              placeholder={
                stagedSlips.length > 0
                  ? 'พิมพ์รายละเอียดสลิป เช่น "หาร 3 คน" แล้วกดส่ง...'
                  : "พิมพ์ เช่น 'ข้าวกะเพรา 60 kbank' หรือกดแนบสลิป..."
              }
              disabled={isProcessing}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-amber-400 focus:bg-white transition"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!chatInputText.trim() && stagedSlips.length === 0) || isProcessing}
              className="p-2 sm:px-4 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0 disabled:opacity-40"
            >
              <Send size={15} />
              <span className="hidden sm:inline">ส่ง</span>
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: DASHBOARD (Summary, Donut Chart, All List)     */}
      {/* ======================================================== */}
      {subTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Budget Progress Ring */}
          <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm flex items-center gap-5">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
               <svg className="w-full h-full -rotate-90">
                 <circle cx="40" cy="40" r="36" className="stroke-slate-100" strokeWidth="8" fill="none" />
                 <circle cx="40" cy="40" r="36" className="stroke-pink-500" strokeWidth="8" fill="none" strokeDasharray={`${Math.min((monthExpense / (settings.monthlyLimit || 20000)) * 226, 226)} 226`} strokeLinecap="round" />
               </svg>
               <span className="absolute text-xs font-black text-slate-700">{Math.round((monthExpense / (settings.monthlyLimit || 20000)) * 100)}%</span>
            </div>
            <div className="space-y-1">
               <h3 className="font-black text-slate-800 text-sm">งบรายจ่ายเดือนนี้</h3>
               <p className="text-xs text-slate-500 font-bold">ใช้ไปแล้ว ฿{monthExpense.toLocaleString()} / ฿{(settings.monthlyLimit || 20000).toLocaleString()}</p>
               <p className={`text-[11px] font-bold ${monthExpense > (settings.monthlyLimit || 20000) ? 'text-rose-500' : 'text-emerald-600'}`}>
                 {monthExpense > (settings.monthlyLimit || 20000) ? 'เกินงบแล้ว!' : 'ยังอยู่ในงบ'}
               </p>
            </div>
          </div>

          {/* Monthly Financial Summary Card */}
          <div className="p-4 sm:p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                  สรุปรายรับ-รายจ่าย
                </span>
                <h3 className="text-base font-black text-slate-800">
                  {now.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>+ จดรายการ</span>
              </button>
            </div>

            {/* 3 Columns Monthly Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-[10px] font-bold text-emerald-700 block">รายรับเดือนนี้</span>
                <span className="text-xs sm:text-base font-mono font-black text-emerald-600 block mt-0.5">
                  +฿{monthIncome.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-200/80">
                <span className="text-[10px] font-bold text-rose-700 block">รายจ่ายสะสม</span>
                <span className="text-xs sm:text-base font-mono font-black text-rose-500 block mt-0.5">
                  -฿{monthExpense.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <span className="text-[10px] font-bold text-amber-700 block">คงเหลืองบ</span>
                <span
                  className={`text-xs sm:text-base font-mono font-black block mt-0.5 ${
                    remainingBudget < 0 ? 'text-rose-600' : 'text-amber-600'
                  }`}
                >
                  ฿{remainingBudget.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Donut Chart Component Container */}
          <div className="p-4 sm:p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5">
                <PieChart size={16} className="text-amber-500" />
                <span>สัดส่วนการเงินเดือนนี้</span>
              </h3>
              <div className="flex gap-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setStatsViewMode('EXPENSE')}
                  className={`px-2 py-1 rounded-lg cursor-pointer ${
                    statsViewMode === 'EXPENSE' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  รายจ่าย
                </button>
                <button
                  type="button"
                  onClick={() => setStatsViewMode('INCOME')}
                  className={`px-2 py-1 rounded-lg cursor-pointer ${
                    statsViewMode === 'INCOME' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  รายรับ
                </button>
              </div>
            </div>

            {statsViewMode === 'EXPENSE' && (
              <div className="space-y-2">
                {expenseCatData.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">ยังไม่มีรายจ่ายในเดือนนี้</p>
                ) : (
                  expenseCatData.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span className="font-bold text-slate-700">{cat.name}</span>
                      </div>
                      <span className="font-mono font-bold text-rose-500">
                        ฿{cat.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {statsViewMode === 'INCOME' && (
              <div className="space-y-2">
                {incomeCatData.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">ยังไม่มีรายรับในเดือนนี้</p>
                ) : (
                  incomeCatData.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span className="font-bold text-slate-700">{cat.name}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600">
                        +฿{cat.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Transactions List with Zero-wrap numbers */}
          <div className="p-4 sm:p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-sm sm:text-base font-black text-slate-800">
                รายการวันที่ {selectedDate} ({filteredTransactions.length})
              </h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                ไม่มีรายการในวันที่เลือก สามารถสลับไปแท็บ 💬 แชทช่วยจด เพื่อส่งสลิปหรือพิมพ์บันทึกได้เลย!
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((tx) => {
                  const cat = getCategoryInfo(tx.category, tx.type);
                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-base shrink-0">
                          {cat.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-slate-800 truncate">
                            {tx.merchant}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mt-0.5">
                            <span>{tx.time}</span>
                            <span>•</span>
                            <span>{tx.wallet}</span>
                            {tx.linked_food_log_id && (
                              <button
                                type="button"
                                onClick={() => setActiveWorld('fit')}
                                className="text-pink-600 font-bold hover:underline cursor-pointer"
                              >
                                [🍱 ดูอาหาร]
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-mono font-black text-xs sm:text-sm whitespace-nowrap ${
                            tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-500'
                          }`}
                        >
                          {tx.type === 'INCOME' ? '+' : '-'}฿{tx.amount.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingTransaction(tx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="แก้ไขรายการ"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (tx.linked_food_log_id) {
                              setDeletingTx(tx);
                            } else {
                              if (confirm(`ต้องการลบรายการ "${tx.merchant}" หรือไม่?`)) {
                                deleteTransaction(tx.id);
                              }
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="ลบรายการ"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Smart Linked Deletion Modal */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                <span>⚠️ ยืนยันการลบรายการ</span>
              </h3>
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                รายการ <strong>"{deletingTx.merchant}"</strong> (฿{deletingTx.amount.toLocaleString()}) มีการเชื่อมโยงกับมื้ออาหารใน <strong>หมูอ้วนฟิต</strong>
              </p>
              <p className="text-slate-400">
                คุณต้องการลบเฉพาะรายการเงิน หรือลบมื้ออาหารในหมูอ้วนฟิตออกด้วย?
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  deleteTransaction(deletingTx.id, true);
                  setDeletingTx(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
              >
                <Trash2 size={14} />
                <span>ลบทั้งสองฝั่ง (ทั้งเงินและอาหาร)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  deleteTransaction(deletingTx.id, false);
                  setDeletingTx(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <span>ลบเฉพาะรายการเงิน (เก็บอาหารไว้)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="w-full py-1.5 text-center text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-slate-800 text-sm">จดบันทึกรายการใหม่</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-3 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddType('EXPENSE')}
                  className={`flex-1 py-2 rounded-xl font-black ${
                    addType === 'EXPENSE' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  รายจ่าย
                </button>
                <button
                  type="button"
                  onClick={() => setAddType('INCOME')}
                  className={`flex-1 py-2 rounded-xl font-black ${
                    addType === 'INCOME' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  รายรับ
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">จำนวนเงิน (บาท) *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono font-bold text-base text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อรายการ / ร้านค้า *</label>
                <input
                  type="text"
                  placeholder="เช่น ข้าวกะเพราหมูกรอบ"
                  value={addMerchant}
                  onChange={(e) => setAddMerchant(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-xl font-semibold"
                  >
                    {(addType === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ช่องทางเงิน</label>
                  <select
                    value={addWallet}
                    onChange={(e) => setAddWallet(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-xl font-semibold"
                  >
                    <option value="KBank">🟢 KBank</option>
                    <option value="SCB">🟣 SCB</option>
                    <option value="PromptPay">🔵 พร้อมเพย์</option>
                    <option value="เงินสด">💵 เงินสด</option>
                    <option value="บัตรเครดิต">💳 บัตรเครดิต</option>
                  </select>
                </div>
              </div>

              {/* Dual-Log Option if food */}
              {addType === 'EXPENSE' && (
                <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-pink-900">
                    <input
                      type="checkbox"
                      checked={alsoLogFood}
                      onChange={(e) => setAlsoLogFood(e.target.checked)}
                      className="w-4 h-4 text-pink-600 rounded"
                    />
                    <span>🍱 บันทึกลง หมูอ้วนฟิต ด้วย</span>
                  </label>
                  {alsoLogFood && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-pink-800 mb-0.5">มื้อ</label>
                        <select
                          value={foodMeal}
                          onChange={(e) => setFoodMeal(e.target.value as MealType)}
                          className="w-full px-2 py-1 border rounded-lg bg-white"
                        >
                          <option value="breakfast">เช้า</option>
                          <option value="lunch">กลางวัน</option>
                          <option value="dinner">เย็น</option>
                          <option value="snack">ของว่าง</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-pink-800 mb-0.5">แคลอรี่ (kcal)</label>
                        <input
                          type="number"
                          value={foodKcal}
                          onChange={(e) => setFoodKcal(Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded-lg bg-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-slate-800 text-sm">แก้ไขรายการ</h3>
              <button
                type="button"
                onClick={() => setEditingTransaction(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">จำนวนเงิน (บาท)</label>
                <input
                  type="number"
                  value={editingTransaction.amount}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border rounded-xl font-mono font-bold text-base text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อรายการ / ร้านค้า</label>
                <input
                  type="text"
                  value={editingTransaction.merchant}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, merchant: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={editingTransaction.category}
                    onChange={(e) =>
                      setEditingTransaction({ ...editingTransaction, category: e.target.value })
                    }
                    className="w-full px-2.5 py-2 border rounded-xl font-semibold"
                  >
                    {(editingTransaction.type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ช่องทางเงิน</label>
                  <select
                    value={editingTransaction.wallet}
                    onChange={(e) =>
                      setEditingTransaction({ ...editingTransaction, wallet: e.target.value })
                    }
                    className="w-full px-2.5 py-2 border rounded-xl font-semibold"
                  >
                    <option value="KBank">🟢 KBank</option>
                    <option value="SCB">🟣 SCB</option>
                    <option value="PromptPay">🔵 พร้อมเพย์</option>
                    <option value="เงินสด">💵 เงินสด</option>
                    <option value="บัตรเครดิต">💳 บัตรเครดิต</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
