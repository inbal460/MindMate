import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Calendar,
  Backpack,
  Compass,
  Users,
  Sparkles,
  MessageSquare,
  Eye,
  Wind,
  Trophy,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Smile,
  LogOut,
  Flame,
  Settings,
  Volume2,
  VolumeX,
  Radio,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, Gender } from '../types';
import { audioSynth } from '../utils/audioSynth';
import { speechHelper } from '../utils/speechHelper';
import { getGreeting, GENDER_CONFIG } from '../utils/genderHelper';

export type TabType = 'today' | 'timetable' | 'equipment' | 'navigation' | 'social' | 'messages' | 'chat';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  readingRulerEnabled: boolean;
  onToggleReadingRuler: () => void;
  onOpenFocusCalmModal: (mode: 'focus' | 'calm' | 'grounding') => void;
  targetRoomForNav?: string;
  userProfile: UserProfile | null;
  onOpenProfileEdit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  readingRulerEnabled,
  onToggleReadingRuler,
  onOpenFocusCalmModal,
  userProfile,
  onOpenProfileEdit,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(audioSynth.isMuted());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hoveredTabName, setHoveredTabName] = useState<string | null>(null);

  useEffect(() => {
    const unsub = speechHelper.subscribe((speaking) => setIsSpeaking(speaking));
    return () => unsub();
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    audioSynth.setMuted(nextMuted);
    setIsMuted(nextMuted);
    if (!nextMuted) {
      audioSynth.playChime();
    }
  };

  const handleSpeechToggle = () => {
    if (isSpeaking) {
      speechHelper.stop();
    } else {
      let contextSpeech = 'ברוכים הבאים ל-MindMate, העוזר החכם שלך לבית הספר. ';
      if (activeTab === 'today') {
        contextSpeech += 'במסך זה תוכל לראות את השעון המדויק, תאריך עברי, ואת השיעור שמתקיים כעת.';
      } else if (activeTab === 'messages') {
        contextSpeech += 'במסך קיצור הודעות מורים תוכל להדביק כל הודעה ארוכה ולקבל שורה תחתונה ורשימת ציוד מוקראת.';
      } else if (activeTab === 'equipment') {
        contextSpeech += 'במסך מארגן הציוד תוכל לשמוע ולסמן את הציוד הדרוש לכל יום לימודים.';
      } else if (activeTab === 'navigation') {
        contextSpeech += 'במסך הניווט תוכל לקבל מסלול הגעה מדויק וברור לכל כיתה ומתחם בבית הספר.';
      } else if (activeTab === 'social') {
        contextSpeech += 'במסך חיבור בהפסקות תוכל לראות איפה החברים נפגשים במגרש הכדורגל, כדורסל ופטיו.';
      } else {
        contextSpeech += 'כל שבעת המסכים זמינים עבורך בתפריט הראשי.';
      }
      speechHelper.speak(contextSpeech);
    }
  };

  const tabs: Array<{ id: TabType; label: string; shortLabel: string; emoji: string; badge?: string; desc: string; color: string }> = [
    { id: 'today', label: 'היום והשיעור הבא', shortLabel: 'היום', emoji: '⏰', desc: 'שעון, תאריך ושיעור חי', color: 'from-blue-500 to-indigo-600' },
    { id: 'timetable', label: 'מערכת שעות', shortLabel: 'מערכת', emoji: '🗓️', desc: 'מערכת שבועית והעלאת לוח', color: 'from-indigo-500 to-purple-600' },
    { id: 'equipment', label: 'מארגן הציוד לתיק', shortLabel: 'ציוד', emoji: '🎒', badge: 'חכם', desc: 'צ\'קליסט ציוד מותאם למערכת', color: 'from-amber-500 to-orange-600' },
    { id: 'navigation', label: 'ניווט לכיתה (Waze)', shortLabel: 'ניווט', emoji: '🗺️', badge: 'מפה', desc: 'מפת בית הספר ומסלול הגעה', color: 'from-emerald-500 to-teal-600' },
    { id: 'social', label: 'חיבור בהפסקות', shortLabel: 'הפסקות', emoji: '🏓', badge: 'חברתי', desc: 'כדורגל, פטיו ופינות רוגע', color: 'from-teal-500 to-cyan-600' },
    { id: 'messages', label: 'קיצור הודעות מורים', shortLabel: 'הודעות', emoji: '✂️', badge: 'AI', desc: 'הפיכת הודעות ארוכות לנקודות', color: 'from-purple-500 to-pink-600' },
    { id: 'chat', label: 'עוזר אישי AI', shortLabel: 'עוזר AI', emoji: '🤖', desc: 'שיחה חכמה והתייעצות', color: 'from-rose-500 to-indigo-600' },
  ];

  const currentTabObj = tabs.find((t) => t.id === activeTab) || tabs[0];

  const handleTabClick = (tabId: TabType) => {
    audioSynth.playChime();
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs" id="app-header">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-2 border-b border-slate-100">
        {/* Right side in Hebrew: Menu Toggle + Brand + Subtitle */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* Hamburger Menu Toggle Button (Compact on mobile, full on tablet/desktop) */}
          <button
            onClick={() => {
              audioSynth.playChime();
              setMobileMenuOpen(true);
            }}
            className="p-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold flex items-center gap-1 border border-indigo-200 shadow-2xs cursor-pointer active:scale-95 transition-transform shrink-0"
            title="פתח תפריט מורחב לכל המסכים"
            aria-label="פתח תפריט ניווט"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-700" />
            <span className="text-xs font-black hidden md:inline">תפריט</span>
          </button>

          {/* Logo & Brand */}
          <div
            onClick={() => handleTabClick('today')}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group select-none min-w-0"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform shrink-0">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent truncate">
                  MindMate
                </span>
                <span className="text-[8px] sm:text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1 py-0.2 rounded-full border border-indigo-200 shrink-0">
                  2.0
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] text-slate-500 font-bold leading-tight hidden sm:block">
                עוזר חכם מונגש
              </p>
            </div>
          </div>
        </div>

        {/* Left side in Hebrew: Profile Pill + Sound Mute + Speech + Calm */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Sound Mute / Unmute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer shrink-0 ${
              isMuted
                ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
            title={isMuted ? 'הפעל צלילים עדינים' : 'השתק צלילים'}
            aria-label={isMuted ? 'הפעל צלילים' : 'השתק צלילים'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
            <span className="hidden lg:inline text-[11px]">{isMuted ? 'מושתק' : 'צליל'}</span>
          </button>

          {/* Reading Ruler Toggle */}
          <button
            onClick={() => {
              audioSynth.playChime();
              onToggleReadingRuler();
            }}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer shrink-0 ${
              readingRulerEnabled
                ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-300/40'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="סרגל קריאה המסייע למיקוד ראייה ומעקב שורות"
            aria-label="סרגל קריאה"
          >
            <Eye className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="hidden lg:inline text-[11px]">סרגל</span>
          </button>

          {/* Sensory Calm */}
          <button
            onClick={() => {
              audioSynth.playChime();
              onOpenFocusCalmModal('calm');
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            title="רגע של רוגע ונשימה 🌿"
            aria-label="רגע של רוגע"
          >
            <Wind className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="hidden sm:inline text-[11px]">רוגע 🌿</span>
          </button>

          {/* User Profile Pill */}
          {userProfile && (
            <button
              onClick={() => {
                audioSynth.playChime();
                onOpenProfileEdit();
              }}
              className="flex items-center gap-1 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 p-1 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold text-indigo-900 shadow-2xs transition-transform active:scale-95 cursor-pointer shrink-0"
              title="לחץ לעריכת הפרופיל והשם"
            >
              <span className="text-sm sm:text-base">{userProfile.avatarEmoji || '👦'}</span>
              <span className="max-w-[70px] truncate text-[11px] font-bold hidden sm:inline">{userProfile.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        {/* Desktop View: Full labels with emojis */}
        <div className="hidden md:flex items-center gap-1.5 py-1.5 overflow-x-auto scrollbar-none text-right">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-3.5 py-2 rounded-2xl font-extrabold text-xs lg:text-sm flex items-center gap-2 shrink-0 transition-all select-none cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-400/40 scale-[1.02]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200/80'
                }`}
              >
                <span className="text-lg">{tab.emoji}</span>
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-md font-black ${
                      isActive ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile View: ALL 7 TABS ALWAYS VISIBLE IN 100% SCREEN WIDTH */}
        <div className="md:hidden py-1.5">
          <div className="grid grid-cols-7 gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200 shadow-inner">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  onMouseEnter={() => setHoveredTabName(tab.label)}
                  onMouseLeave={() => setHoveredTabName(null)}
                  title={tab.label}
                  className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all select-none cursor-pointer relative ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-400/40 scale-105 z-10'
                      : 'text-slate-700 hover:bg-white/70 hover:text-slate-900'
                  }`}
                >
                  <span className="text-xl leading-none">{tab.emoji}</span>
                  <span className={`text-[9px] font-black leading-tight mt-0.5 truncate w-full text-center ${
                    isActive ? 'text-white' : 'text-slate-600'
                  }`}>
                    {tab.shortLabel}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute -bottom-0.5 shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active / Hovered Tab Label Banner on Mobile */}
          <div className="flex items-center justify-between px-2 pt-1 text-[11px] font-bold text-slate-600">
            <span className="flex items-center gap-1 truncate text-indigo-900 font-extrabold">
              <span>{currentTabObj.emoji}</span>
              <span>{hoveredTabName || currentTabObj.label}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium shrink-0">
              (7 מסכים זמינים)
            </span>
          </div>
        </div>
      </div>

      {/* Spacious Full Menu Modal (Wide, 2-Column Grid, All screens visible at once!) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Spacious Wide Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-10 flex flex-col text-right p-5 sm:p-7 max-h-[90vh] overflow-y-auto border border-slate-200"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl shadow-md">
                    🧠
                  </div>
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-slate-800">
                      תפריט כל מסכי האפליקציה (MindMate)
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      בחר מסך למעבר מיידי • כל 7 האפשרויות פתוחות לפניך
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  aria-label="סגור תפריט"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile & Quick Settings */}
              {userProfile && (
                <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-1 bg-white rounded-xl shadow-xs">{userProfile.avatarEmoji || '👦'}</span>
                    <div>
                      <div className="font-black text-sm text-indigo-950 flex items-center gap-1.5">
                        <span>{userProfile.name}</span>
                        <span className="text-[10px] bg-indigo-200/60 text-indigo-900 px-2 py-0.2 rounded-full font-bold">
                          כיתה {userProfile.grade || 'י׳'}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-700 font-medium mt-0.5">
                        מוכן ליום לימודים רגוע ומאורגן
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onOpenProfileEdit();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    ערוך פרטים ✏️
                  </button>
                </div>
              )}

              {/* Accessibility Quick Toggles */}
              <div className="grid grid-cols-2 gap-2 mt-3 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                <button
                  onClick={handleToggleMute}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isMuted ? 'bg-slate-200 text-slate-700' : 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
                  <span>{isMuted ? 'צלילים: מושתק 🔇' : 'צלילים: פעיל 🔊'}</span>
                </button>

                <button
                  onClick={handleSpeechToggle}
                  className="p-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 shadow-xs border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-indigo-50"
                >
                  <span>🗣️</span>
                  <span>הקראה קולית</span>
                </button>
              </div>

              {/* 2-Column Grid of All 7 Screens (Wide, Spacious, No Narrow 1-Line Scrolling!) */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-extrabold text-slate-400 block px-1">
                  בחר מסך (בלחיצה אחת):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`p-3.5 rounded-2xl border text-right flex items-start justify-between gap-3 transition-all cursor-pointer select-none group ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-[1.02] ring-2 ring-indigo-300'
                            : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800 shadow-xs hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl shrink-0 p-1.5 rounded-2xl bg-slate-100 group-hover:scale-105 transition-transform">
                            {tab.emoji}
                          </span>
                          <div>
                            <div className="font-black text-sm flex items-center gap-1.5">
                              <span>{tab.label}</span>
                            </div>
                            <p
                              className={`text-xs mt-1 leading-snug ${
                                isActive ? 'text-indigo-100 font-medium' : 'text-slate-500 font-medium'
                              }`}
                            >
                              {tab.desc}
                            </p>
                          </div>
                        </div>

                        {tab.badge && (
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-lg font-black shrink-0 ${
                              isActive ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-xs">
                <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 font-bold">
                  <Trophy className="w-4 h-4" />
                  <span>נבחר לתחרות Intel® AI Global Impact Festival 2026 🏆</span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold">
                  MindMate • עוזר חכם מונגש לבית הספר
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};
