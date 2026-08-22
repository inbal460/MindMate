import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Navigation,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Calendar as CalendarIcon,
  Timer,
  AlertCircle,
  Coffee,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { TimetableSlot, SubjectInfo, UserProfile } from '../types';
import { SUBJECTS_CATALOG } from '../data/schoolData';
import { audioSynth } from '../utils/audioSynth';
import { speechHelper } from '../utils/speechHelper';
import { getNavigateActionText, getCheckBagActionText, getPackBagActionText } from '../utils/genderHelper';

interface NextClassHeroProps {
  currentSlot: TimetableSlot | null;
  nextSlot: TimetableSlot | null;
  allDaySlots: TimetableSlot[];
  isBreak?: boolean;
  onNavigateToRoom: (roomCode: string) => void;
  onOpenEquipmentTab: () => void;
  userProfile?: UserProfile | null;
  simulatedTime: string | null;
  onSelectSimulatedTime: (timeStr: string | null) => void;
}

export const NextClassHero: React.FC<NextClassHeroProps> = ({
  currentSlot,
  nextSlot,
  allDaySlots,
  isBreak = false,
  onNavigateToRoom,
  onOpenEquipmentTab,
  userProfile,
  simulatedTime,
  onSelectSimulatedTime,
}) => {
  const [liveTime, setLiveTime] = useState(new Date());
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Live second updater
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    const unsubscribe = speechHelper.subscribe((speaking) => setIsSpeaking(speaking));
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  const activeSlot = currentSlot || nextSlot;
  const isOngoing = Boolean(currentSlot);

  // Time calculations
  const displayTime = useMemo(() => {
    if (simulatedTime) {
      return `${simulatedTime}:00`;
    }
    return liveTime.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [liveTime, simulatedTime]);

  const formattedDateHebrew = liveTime.toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate elapsed progress percentage for ongoing class
  const classProgress = useMemo(() => {
    if (!currentSlot) return 0;
    const [startH, startM] = currentSlot.startTime.split(':').map(Number);
    const [endH, endM] = currentSlot.endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    let currentTotal: number;
    if (simulatedTime) {
      const [curH, curM] = simulatedTime.split(':').map(Number);
      currentTotal = curH * 60 + curM;
    } else {
      currentTotal = liveTime.getHours() * 60 + liveTime.getMinutes();
    }

    if (currentTotal < startTotal) return 0;
    if (currentTotal > endTotal) return 100;
    const totalDuration = endTotal - startTotal;
    const elapsed = currentTotal - startTotal;
    return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  }, [currentSlot, liveTime, simulatedTime]);

  const handleReadOutLoud = () => {
    if (isSpeaking) {
      speechHelper.stop();
      return;
    }

    if (!activeSlot) {
      speechHelper.speak('שלום! הסתיימו שעות הלימוד להיום. כל הכבוד על יום מוצלח! מומלץ לבדוק את רשימת הציוד למחר.');
      return;
    }

    const subjectInfo = SUBJECTS_CATALOG[activeSlot.subjectId];
    const equipNames = (activeSlot.customEquipment
      ? activeSlot.customEquipment
      : subjectInfo?.requiredEquipment?.map((e) => (typeof e === 'string' ? e : e.name)) || []
    ).join(', ');

    const statusText = isOngoing
      ? `השיעור שמתקיים כעת הוא ${activeSlot.subjectName}`
      : `אתה בהפסקה כעת, והשיעור הבא שלך הוא ${activeSlot.subjectName}`;

    const speechText = `${statusText}, שיעור מספר ${activeSlot.period}, בשעה ${activeSlot.startTime}. הכיתה היא ${activeSlot.room} ב${activeSlot.building}, עם המורה ${activeSlot.teacher}. הציוד שצריך להיות מוכן: ${equipNames}. בהצלחה!`;

    speechHelper.speak(speechText);
  };

  const timePresets = [
    { label: '🟢 זמן אמת (חי)', time: null, desc: 'לפי שעון המכשיר' },
    { label: '08:15 • שיעור 1', time: '08:15', desc: 'חינוך' },
    { label: '09:47 • שיעור 3', time: '09:47', desc: 'תנ״ך (מתקיים כעת!)' },
    { label: '10:40 • הפסקה', time: '10:40', desc: 'הפסקה גדולה' },
    { label: '11:10 • שיעור 4', time: '11:10', desc: 'לשון' },
    { label: '12:00 • שיעור 5', time: '12:00', desc: 'מתמטיקה' },
    { label: '12:55 • שיעור 6', time: '12:55', desc: 'תקשוב' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Real-time Clock, Hebrew Date & Simulation Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col gap-4 text-right">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono text-xl font-extrabold shrink-0 border border-indigo-100">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>{formattedDateHebrew}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-800 font-mono tracking-tight flex items-center gap-2">
                <span>{displayTime}</span>
                {simulatedTime && (
                  <span className="text-xs font-sans font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                    שעה לדוגמה: {simulatedTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* TTS Read Aloud Button */}
            <button
              onClick={handleReadOutLoud}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 border transition-all cursor-pointer shadow-xs ${
                isSpeaking
                  ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-400/40 animate-pulse'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100'
              }`}
              title="הקראה קולית ברורה של פרטי השיעור והציוד"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
              <span>{isSpeaking ? 'עצור הקראה' : '🔊 הקרא לי בקול'}</span>
            </button>
          </div>
        </div>

        {/* School Hour Simulation Switcher */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold shrink-0">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>סנכרון שעות בית ספר:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {timePresets.map((preset) => {
              const isSelected = simulatedTime === preset.time;
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    audioSynth.playChime();
                    onSelectSimulatedTime(preset.time);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title={preset.desc}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Current Class / Break Status Card */}
      {!activeSlot ? (
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-3xl p-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md text-2xl">
            🎉
          </div>
          <h3 className="text-xl font-extrabold text-slate-800">
            יום הלימודים הסתיים להיום!
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            כל הכבוד על יום לימודים מוצלח. זה הזמן להירגע, לנוח ולארגן את התיק למחר בנחת וברוגע.
          </p>
          <button
            onClick={onOpenEquipmentTab}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-2"
          >
            <span>{getPackBagActionText(userProfile?.gender)}</span>
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl text-white shadow-xl shadow-indigo-950/20 p-5 sm:p-7"
        >
          {/* Glow background */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Main Info */}
            <div className="space-y-4 max-w-xl text-right">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                    isOngoing
                      ? 'bg-emerald-400 text-emerald-950 shadow-sm animate-pulse'
                      : 'bg-amber-400 text-amber-950 shadow-sm'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {isOngoing ? '🟢 שיעור מתקיים כעת' : '☕ בהפסקה כעת • השיעור הבא:'}
                </span>
                <span className="bg-white/15 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                  שיעור {activeSlot.period} • {activeSlot.startTime} - {activeSlot.endTime}
                </span>
              </div>

              {/* Subject Title */}
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl sm:text-5xl">
                    {SUBJECTS_CATALOG[activeSlot.subjectId]?.emoji || '📚'}
                  </span>
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                      {activeSlot.subjectName}
                    </h2>
                    <p className="text-xs sm:text-sm text-indigo-200 mt-1 font-medium flex items-center gap-2">
                      <span>עם המורה: <strong>{activeSlot.teacher}</strong></span>
                      <span>•</span>
                      <span>{activeSlot.building}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar for current ongoing lesson */}
              {isOngoing && (
                <div className="space-y-1 bg-black/20 p-2.5 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-200">
                    <span>התקדמות השיעור:</span>
                    <span>{classProgress}% הושלמו</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500 rounded-full"
                      style={{ width: `${classProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Location Badge */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-xs font-bold">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>כיתה {activeSlot.room} (קומה {activeSlot.floor})</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-xs font-bold">
                  <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>
                    ציוד נדרש: {
                      (activeSlot.customEquipment
                        ? activeSlot.customEquipment
                        : SUBJECTS_CATALOG[activeSlot.subjectId]?.requiredEquipment?.map((e) => (typeof e === 'string' ? e : e.name)) || []
                      ).slice(0, 2).join(', ')
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Large, Touch-Friendly) */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => {
                  audioSynth.playChime();
                  onNavigateToRoom(activeSlot.room);
                }}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-900 font-extrabold flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 cursor-pointer text-sm md:text-base"
              >
                <Navigation className="w-4 h-4 text-indigo-600" />
                <span>{getNavigateActionText(userProfile?.gender)}</span>
              </button>

              <button
                onClick={() => {
                  audioSynth.playChime();
                  onOpenEquipmentTab();
                }}
                className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/20 border border-white/20 text-white font-bold flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{getCheckBagActionText(userProfile?.gender)}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
