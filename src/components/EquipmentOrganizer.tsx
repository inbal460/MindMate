import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Plus,
  RotateCcw,
  CheckCheck,
  Sparkles,
  Calendar,
  Layers,
  Award,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DayOfWeek, TimetableSlot, EquipmentItem, UserProfile } from '../types';
import { DAYS_OF_WEEK, SUBJECTS_CATALOG } from '../data/schoolData';
import { audioSynth } from '../utils/audioSynth';
import { speechHelper } from '../utils/speechHelper';
import { getReadyText, getPackBagActionText } from '../utils/genderHelper';

interface EquipmentOrganizerProps {
  timetable: TimetableSlot[];
  activeDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  userProfile?: UserProfile | null;
}

export const EquipmentOrganizer: React.FC<EquipmentOrganizerProps> = ({
  timetable,
  activeDay,
  onSelectDay,
  userProfile,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = speechHelper.subscribe((speaking) => setIsSpeaking(speaking));
    return () => unsub();
  }, []);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`mindmate_eq_checked_${activeDay}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customItems, setCustomItems] = useState<EquipmentItem[]>(() => {
    try {
      const saved = localStorage.getItem('mindmate_custom_equipment');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newCustomItemText, setNewCustomItemText] = useState('');
  const [newCustomItemEmoji, setNewCustomItemEmoji] = useState('⭐');
  const [newCustomItemCategory, setNewCustomItemCategory] = useState<'general' | 'health' | 'digital'>('general');
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Save checked items per day
  useEffect(() => {
    try {
      localStorage.setItem(`mindmate_eq_checked_${activeDay}`, JSON.stringify(checkedItems));
    } catch {}
  }, [checkedItems, activeDay]);

  // Save custom items
  useEffect(() => {
    try {
      localStorage.setItem('mindmate_custom_equipment', JSON.stringify(customItems));
    } catch {}
  }, [customItems]);

  // Day's slots sorted
  const daySlots = useMemo(() => {
    return timetable.filter((s) => s.day === activeDay).sort((a, b) => a.period - b.period);
  }, [timetable, activeDay]);

  // Generate equipment list with emojis for every item and subject
  const generatedEquipment = useMemo(() => {
    const items: EquipmentItem[] = [];
    const seenNames = new Set<string>();

    // 1. Mandatory Daily Essentials
    const defaultEssentials: EquipmentItem[] = [
      { id: 'ess-water', name: 'בקבוק מים אישי מלא (1 ליטר)', category: 'general', icon: '💧', isMandatory: true, checked: false },
      { id: 'ess-pencil-case', name: 'קלמר מלא (עטים, עפרונות, מחק, מרקר)', category: 'stationery', icon: '✏️', isMandatory: true, checked: false },
      { id: 'ess-food', name: 'ארוחת עשר וכריך בריא', category: 'health', icon: '🥪', isMandatory: true, checked: false },
      { id: 'ess-phone', name: 'טלפון נייד טעון / כרטיס תלמיד', category: 'digital', icon: '📱', isMandatory: true, checked: false },
    ];

    defaultEssentials.forEach((item) => {
      seenNames.add(item.name);
      items.push(item);
    });

    // 2. Extract equipment from each scheduled subject
    daySlots.forEach((slot) => {
      const subject = SUBJECTS_CATALOG[slot.subjectId];
      if (!subject) return;

      const eqList = slot.customEquipment
        ? slot.customEquipment.map((name) => ({ name, emoji: '📌', isMandatory: false }))
        : subject.requiredEquipment || [];

      eqList.forEach((eqObj) => {
        const eqName = typeof eqObj === 'string' ? eqObj : eqObj.name;
        const eqEmoji = typeof eqObj === 'string' ? '📌' : eqObj.emoji || '📌';
        const isMandatory = typeof eqObj === 'string' ? false : Boolean(eqObj.isMandatory);

        if (!seenNames.has(eqName)) {
          seenNames.add(eqName);

          let cat: EquipmentItem['category'] = 'books';
          if (eqName.includes('מחברת') || eqName.includes('דפי') || eqName.includes('קלסר') || eqName.includes('עט') || eqName.includes('מרקר') || eqName.includes('סרגל')) {
            cat = 'stationery';
          } else if (eqName.includes('מחשב') || eqName.includes('אוזניות') || eqName.includes('מטען') || eqName.includes('מילונית')) {
            cat = 'digital';
          } else if (eqName.includes('ספורט') || eqName.includes('נעלי') || eqName.includes('חולצה') || eqName.includes('מגבת')) {
            cat = 'sports';
          } else if (eqName.includes('חלוק') || eqName.includes('משקפי') || eqName.includes('בלוק') || eqName.includes('צבעי')) {
            cat = 'general';
          }

          items.push({
            id: `eq-${activeDay}-${slot.subjectId}-${eqName.replace(/\s+/g, '_')}`,
            name: eqName,
            category: cat,
            icon: eqEmoji,
            isMandatory,
            forSubject: `${subject.emoji} ${slot.subjectName}`,
            checked: false,
          });
        }
      });
    });

    // 3. Custom added items
    customItems.forEach((c) => {
      if (!seenNames.has(c.name)) {
        items.push(c);
      }
    });

    return items;
  }, [daySlots, activeDay, customItems]);

  // Completion calculation
  const totalCount = generatedEquipment.length;
  const completedCount = generatedEquipment.filter((item) => checkedItems[item.id]).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Confetti on 100%
  useEffect(() => {
    if (progressPercent === 100 && totalCount > 0 && !hasCelebrated) {
      audioSynth.playSuccessBeep();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      setHasCelebrated(true);
    } else if (progressPercent < 100) {
      setHasCelebrated(false);
    }
  }, [progressPercent, totalCount, hasCelebrated]);

  const toggleItem = (id: string) => {
    const isNowChecked = !checkedItems[id];
    setCheckedItems((prev) => ({ ...prev, [id]: isNowChecked }));

    if (isNowChecked) {
      audioSynth.playChime();
    }
  };

  const handleAddCustomItem = () => {
    if (!newCustomItemText.trim()) return;
    const newItem: EquipmentItem = {
      id: `custom-${Date.now()}`,
      name: newCustomItemText.trim(),
      category: newCustomItemCategory,
      icon: newCustomItemEmoji,
      isMandatory: false,
      checked: false,
    };
    setCustomItems((prev) => [...prev, newItem]);
    setNewCustomItemText('');
    audioSynth.playSuccessBeep();
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
    setHasCelebrated(false);
  };

  const handleSpeakEquipment = () => {
    if (isSpeaking) {
      speechHelper.stop();
      return;
    }
    const dayLabel = DAYS_OF_WEEK.find((d) => d.key === activeDay)?.label || '';
    const pendingItems = generatedEquipment.filter((i) => !checkedItems[i.id]);

    if (pendingItems.length === 0) {
      speechHelper.speak(`כל הכבוד! כל הציוד ליום ${dayLabel} כבר נארז בתיק.`);
      return;
    }

    const itemsText = pendingItems.map((i) => i.name).join(', ');
    const speechText = `רשימת הציוד שעליך לארוז ליום ${dayLabel}: ${itemsText}. סך הכל נותרו ${pendingItems.length} פריטים לארוז.`;
    speechHelper.speak(speechText);
  };

  // Visual emoji categories
  const categories = [
    { key: 'books', label: 'ספרי לימוד וחוברות', emoji: '📚', bg: 'bg-amber-50 border-amber-200 text-amber-900' },
    { key: 'stationery', label: 'מחברות, קלמר וציוד כתיבה', emoji: '✏️', bg: 'bg-blue-50 border-blue-200 text-blue-900' },
    { key: 'digital', label: 'מחשב, אוזניות ודיגיטל', emoji: '💻', bg: 'bg-purple-50 border-purple-200 text-purple-900' },
    { key: 'sports', label: 'ציוד ספורט ולבוש', emoji: '⚽', bg: 'bg-rose-50 border-rose-200 text-rose-900' },
    { key: 'health', label: 'אוכל, מים ובריאות', emoji: '🥪', bg: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
    { key: 'general', label: 'ציוד מיוחד ואישי', emoji: '⭐', bg: 'bg-slate-50 border-slate-200 text-slate-900' },
  ];

  const quickCustomEmojis = ['⭐', '💊', '🔑', '🔌', '🎧', '👓', '🧢', '🎨', '📝', '🧴'];

  return (
    <div className="space-y-6">
      {/* Header Banner & Day Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shadow-xs">
              🎒
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <span>מארגן הציוד לתיק</span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                רשימה חזותית לפי מקצועות יום{' '}
                <strong className="text-indigo-600 font-extrabold">
                  {DAYS_OF_WEEK.find((d) => d.key === activeDay)?.label}
                </strong>
              </p>
            </div>
          </div>

          {/* Day Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto scrollbar-none">
            {DAYS_OF_WEEK.map((d) => (
              <button
                key={d.key}
                onClick={() => {
                  onSelectDay(d.key);
                  setHasCelebrated(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeDay === d.key
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Progress Card */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 sm:p-5 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Visual Ring / Icon */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-600 transition-all duration-500 ease-out"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-extrabold text-xs sm:text-sm text-indigo-900">
                {progressPercent}%
              </span>
            </div>

            <div className="space-y-0.5">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                {progressPercent === 100 ? (
                  <span>🏆 {getReadyText(userProfile?.gender)}</span>
                ) : (
                  <span>
                    🎒 נארזו {completedCount} מתוך {totalCount} פריטים
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {progressPercent === 100
                  ? 'כל הציוד בתיק, אפשר לסגור את הריצ׳רץ׳ בראש שקט!'
                  : 'סמנו V על כל פריט שנכנס פיזית לתיק'}
              </p>
            </div>
          </div>

          {/* Actions: Speak items + Reset */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleSpeakEquipment}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-900'
              }`}
              title="הקראה קולית של רשימת הציוד שנותר לארוז"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-600" />}
              <span>{isSpeaking ? 'עצור' : '🔊 הקרא לי ציוד'}</span>
            </button>

            {completedCount > 0 && (
              <button
                onClick={handleResetChecklist}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                title="איפוס סימונים"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>איפוס סימונים</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories & Visual Equipment Items */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const itemsInCat = generatedEquipment.filter((item) => item.category === cat.key);
          if (itemsInCat.length === 0) return null;

          const catCheckedCount = itemsInCat.filter((i) => checkedItems[i.id]).length;
          const isCatDone = catCheckedCount === itemsInCat.length;

          return (
            <div
              key={cat.key}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.emoji}</span>
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                    {cat.label}
                  </h3>
                </div>
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    isCatDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {catCheckedCount} / {itemsInCat.length}
                </span>
              </div>

              {/* Grid of visual items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {itemsInCat.map((item) => {
                  const isChecked = Boolean(checkedItems[item.id]);

                  return (
                    <motion.div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      whileTap={{ scale: 0.97 }}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 text-right select-none ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 shadow-sm'
                          : 'bg-slate-50/80 border-slate-200 hover:border-indigo-300 hover:bg-white text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                          {item.icon}
                        </div>
                        <div>
                          <div
                            className={`text-xs sm:text-sm font-bold ${
                              isChecked ? 'line-through opacity-70 text-emerald-800' : 'text-slate-800'
                            }`}
                          >
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.forSubject && (
                              <span className="text-[10px] text-indigo-700 bg-indigo-50 font-bold px-1.5 py-0.2 rounded-md">
                                {item.forSubject}
                              </span>
                            )}
                            {item.isMandatory && (
                              <span className="text-[10px] text-rose-600 font-extrabold">
                                • חובה
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Checkbox circle */}
                      <div className="shrink-0">
                        {isChecked ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                            <CheckCheck className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full border-2 border-slate-300 hover:border-indigo-500 bg-white transition-colors" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Equipment Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-slate-700 flex items-center gap-2">
          <span>➕</span>
          <span>הוספת פריט מיוחד משלך לתיק:</span>
        </h4>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Custom Emoji Picker */}
          <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto shrink-0">
            {quickCustomEmojis.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setNewCustomItemEmoji(em)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-transform ${
                  newCustomItemEmoji === em ? 'bg-indigo-600 text-white scale-110 shadow-xs' : 'hover:bg-slate-200'
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={newCustomItemText}
            onChange={(e) => setNewCustomItemText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()}
            placeholder="למשל: תרופה / מפתח לוקר / כרטיס אוטובוס..."
            className="flex-1 p-2.5 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <button
            onClick={handleAddCustomItem}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            הוסף פריט לתיק
          </button>
        </div>
      </div>
    </div>
  );
};
