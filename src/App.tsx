import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Calendar,
  Backpack,
  Compass,
  Users,
  Sparkles,
  MessageSquare,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  BookOpen,
  Trophy,
  Shield,
  HelpCircle,
  Volume2,
  Zap,
  ArrowRight,
  Flame,
  Award,
  LogOut,
  UserCheck
} from 'lucide-react';
import { DayOfWeek, TimetableSlot, UserProfile } from './types';
import { INITIAL_TIMETABLE, DAYS_OF_WEEK, PERIOD_TIMES, ADHD_TIPS } from './data/schoolData';
import { Header, TabType } from './components/Header';
import { NextClassHero } from './components/NextClassHero';
import { TimetableManager } from './components/TimetableManager';
import { EquipmentOrganizer } from './components/EquipmentOrganizer';
import { SchoolNavigator } from './components/SchoolNavigator';
import { SocialBreakRadar } from './components/SocialBreakRadar';
import { TeacherMessageSimplifier } from './components/TeacherMessageSimplifier';
import { MindMateAIChat } from './components/MindMateAIChat';
import { FocusCalmModal } from './components/FocusCalmModal';
import { ReadingRuler } from './components/ReadingRuler';
import { LoginScreen } from './components/LoginScreen';
import { audioSynth } from './utils/audioSynth';
import { getGreeting, getStreakCongrats } from './utils/genderHelper';

export default function App() {
  // User Profile & Authentication State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('mindmate_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    try {
      const saved = localStorage.getItem('mindmate_timetable');
      return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
    } catch {
      return INITIAL_TIMETABLE;
    }
  });

  // Calculate current Israeli day of week
  const currentDayOfWeek: DayOfWeek = useMemo(() => {
    const dayNum = new Date().getDay(); // 0 = Sunday, 1 = Monday... 6 = Saturday
    const dayMap: Record<number, DayOfWeek> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'sunday',
    };
    return dayMap[dayNum] || 'sunday';
  }, []);

  const [activeDay, setActiveDay] = useState<DayOfWeek>(currentDayOfWeek);
  const [readingRulerEnabled, setReadingRulerEnabled] = useState(false);
  const [focusCalmModalOpen, setFocusCalmModalOpen] = useState(false);
  const [focusCalmMode, setFocusCalmMode] = useState<'focus' | 'calm' | 'grounding'>('focus');
  const [targetRoomForNav, setTargetRoomForNav] = useState<string>('204');
  const [currentZoneId, setCurrentZoneId] = useState<string>('zone-courtyard-shade');
  const [organizationStreak, setOrganizationStreak] = useState(5);

  // Save profile to localStorage
  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsEditingProfile(false);
    try {
      localStorage.setItem('mindmate_user_profile', JSON.stringify(profile));
    } catch {}
  };

  // Save timetable changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mindmate_timetable', JSON.stringify(timetable));
    } catch {}
  }, [timetable]);

  const [simulatedTime, setSimulatedTime] = useState<string | null>(null);
  const [liveDate, setLiveDate] = useState(() => new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setLiveDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine current/next class slot based on active day schedule and exact synchronized time
  const daySlots = useMemo(() => {
    return timetable.filter((s) => s.day === activeDay).sort((a, b) => a.period - b.period);
  }, [timetable, activeDay]);

  const { currentSlot, nextSlot, isBreak } = useMemo(() => {
    if (daySlots.length === 0) return { currentSlot: null, nextSlot: null, isBreak: false };

    let currentMinutes: number;
    if (simulatedTime) {
      const [h, m] = simulatedTime.split(':').map(Number);
      currentMinutes = h * 60 + m;
    } else {
      currentMinutes = liveDate.getHours() * 60 + liveDate.getMinutes();
    }

    // 1. Check if we are inside a currently ongoing class (e.g. 09:47 is inside 09:45-10:30, Period 3)
    for (let i = 0; i < daySlots.length; i++) {
      const slot = daySlots[i];
      const [sh, sm] = slot.startTime.split(':').map(Number);
      const [eh, em] = slot.endTime.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;

      if (currentMinutes >= startMin && currentMinutes <= endMin) {
        const next = i + 1 < daySlots.length ? daySlots[i + 1] : null;
        return { currentSlot: slot, nextSlot: next, isBreak: false };
      }
    }

    // 2. Check if we are before a future class (e.g. break time or morning before first class)
    for (let i = 0; i < daySlots.length; i++) {
      const slot = daySlots[i];
      const [sh, sm] = slot.startTime.split(':').map(Number);
      const startMin = sh * 60 + sm;
      if (currentMinutes < startMin) {
        return { currentSlot: null, nextSlot: slot, isBreak: true };
      }
    }

    // 3. School day finished
    return { currentSlot: null, nextSlot: null, isBreak: false };
  }, [daySlots, liveDate, simulatedTime]);

  const handleNavigateToRoom = (roomCode: string) => {
    setTargetRoomForNav(roomCode);
    setActiveTab('navigation');
    audioSynth.playChime();
  };

  const handleOpenFocusCalm = (mode: 'focus' | 'calm' | 'grounding') => {
    setFocusCalmMode(mode);
    setFocusCalmModalOpen(true);
  };

  // If not logged in or editing profile, show Login Screen
  if (!userProfile?.isLoggedIn || isEditingProfile) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        initialProfile={userProfile}
      />
    );
  }

  const greeting = getGreeting(userProfile);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white pb-16">
      {/* Reading Ruler overlay for visual line tracking */}
      <ReadingRuler enabled={readingRulerEnabled} />

      {/* Main Header with full tab navigation and profile pill */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        readingRulerEnabled={readingRulerEnabled}
        onToggleReadingRuler={() => setReadingRulerEnabled(!readingRulerEnabled)}
        onOpenFocusCalmModal={handleOpenFocusCalm}
        targetRoomForNav={targetRoomForNav}
        userProfile={userProfile}
        onOpenProfileEdit={() => setIsEditingProfile(true)}
      />

      {/* Focus & Calm Modal */}
      <FocusCalmModal
        isOpen={focusCalmModalOpen}
        onClose={() => setFocusCalmModalOpen(false)}
        initialMode={focusCalmMode}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 flex-1 w-full space-y-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: TODAY & NEXT CLASS */}
          {activeTab === 'today' && (
            <motion.div
              key="tab-today"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* Personalized Greeting Card */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-right">
                  <div className="text-3xl sm:text-4xl p-2 rounded-2xl bg-indigo-50 border border-indigo-100 shrink-0">
                    {userProfile.avatarEmoji || '👦'}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center gap-2">
                      <span>{greeting}</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold">
                      יום {DAYS_OF_WEEK.find((d) => d.key === activeDay)?.label} • כיתה {userProfile.grade || 'ט׳'} • {daySlots.length} שיעורים במערכת היום
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-3.5 py-2 rounded-2xl">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-amber-950 block">רצף {organizationStreak} ימים 🔥</span>
                    <span className="text-[10px] text-amber-700 font-medium">התארגנות מושלמת!</span>
                  </div>
                </div>
              </div>

              {/* Next Class Hero Banner with Time Sync */}
              <NextClassHero
                currentSlot={currentSlot}
                nextSlot={nextSlot}
                allDaySlots={daySlots}
                isBreak={isBreak}
                onNavigateToRoom={handleNavigateToRoom}
                onOpenEquipmentTab={() => setActiveTab('equipment')}
                userProfile={userProfile}
                simulatedTime={simulatedTime}
                onSelectSimulatedTime={setSimulatedTime}
              />

              {/* Quick Visual Launchpad Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bag & Equipment Card */}
                <div
                  onClick={() => {
                    audioSynth.playChime();
                    setActiveTab('equipment');
                  }}
                  className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all cursor-pointer text-right flex flex-col justify-between group select-none"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                        🎒
                      </div>
                      <span className="text-xs text-indigo-700 bg-indigo-50 font-extrabold px-2.5 py-0.5 rounded-full">
                        אוטומטי למחר
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-lg">ארגון הציוד לתיק</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      רשימת ציוד עם אימוג'ים לכל מקצוע שמתעדכנת לפי מערכת השעות עם צ'קליסט.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                    <span>פתח את מארגן התיק</span>
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Interactive Map & Navigation Card */}
                <div
                  onClick={() => {
                    audioSynth.playChime();
                    setActiveTab('navigation');
                  }}
                  className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all cursor-pointer text-right flex flex-col justify-between group select-none"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                        🗺️
                      </div>
                      <span className="text-xs text-emerald-700 bg-emerald-50 font-extrabold px-2.5 py-0.5 rounded-full">
                        Waze בי״ס 🚀
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-lg">ניווט אינטראקטיבי לכיתה</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      מפת בית הספר עם הנחיות צעד-אחר-צעד, חצים וסימון הגעה לכיתה.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
                    <span>התחל ניווט עכשיו</span>
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Teacher Message AI Card */}
                <div
                  onClick={() => {
                    audioSynth.playChime();
                    setActiveTab('messages');
                  }}
                  className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all cursor-pointer text-right flex flex-col justify-between group select-none"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                        ✂️
                      </div>
                      <span className="text-xs text-purple-700 bg-purple-50 font-extrabold px-2.5 py-0.5 rounded-full">
                        AI מובנה
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-lg">קיצור הודעות מורים</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      המרת הודעות ארוכות ומסורבלות לשורה תחתונה, נקודות תמציתיות ורשימת ציוד.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-bold">
                    <span>פשט הודעה עכשיו</span>
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Today's Schedule Overview & Daily Hacks */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Timeline */}
                <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-extrabold text-slate-800 text-base">
                        לוח השיעורים להיום ({DAYS_OF_WEEK.find((d) => d.key === activeDay)?.label})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('timetable')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      למערכת השבועית המלאה ←
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-extrabold flex items-center justify-center shadow-2xs">
                            {slot.period}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm">{slot.subjectName}</h4>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {slot.startTime} - {slot.endTime} • מורה: {slot.teacher}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-slate-700 font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                            כיתה {slot.room}
                          </span>
                          <button
                            onClick={() => handleNavigateToRoom(slot.room)}
                            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                            title="נווט לכיתה"
                          >
                            <Compass className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Organization Streaks & Daily Hacks */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Streak Card */}
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                        רצף התארגנות יומי
                      </span>
                      <Flame className="w-6 h-6 text-amber-200 animate-bounce" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-extrabold">{organizationStreak} ימים ברצף! 🔥</div>
                      <p className="text-xs text-amber-100 mt-1">
                        {getStreakCongrats(userProfile?.gender)}
                      </p>
                    </div>
                  </div>

                  {/* Power Tip */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 text-right">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                      <Sparkles className="w-4 h-4" />
                      <span>טיפ להתארגנות מנצחת בבית הספר: 💡</span>
                    </div>
                    <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                      <h5 className="font-bold text-xs text-indigo-950">{ADHD_TIPS[0].title}</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{ADHD_TIPS[0].desc}</p>
                    </div>
                    <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100 space-y-1">
                      <h5 className="font-bold text-xs text-teal-950">{ADHD_TIPS[1].title}</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{ADHD_TIPS[1].desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: TIMETABLE */}
          {activeTab === 'timetable' && (
            <motion.div
              key="tab-timetable"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <TimetableManager
                timetable={timetable}
                activeDay={activeDay}
                onSelectDay={setActiveDay}
                onUpdateTimetable={setTimetable}
                onNavigateToRoom={handleNavigateToRoom}
              />
            </motion.div>
          )}

          {/* TAB 3: EQUIPMENT ORGANIZER */}
          {activeTab === 'equipment' && (
            <motion.div
              key="tab-equipment"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <EquipmentOrganizer
                timetable={timetable}
                activeDay={activeDay}
                onSelectDay={setActiveDay}
                userProfile={userProfile}
              />
            </motion.div>
          )}

          {/* TAB 4: SCHOOL NAVIGATION */}
          {activeTab === 'navigation' && (
            <motion.div
              key="tab-navigation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <SchoolNavigator
                initialTargetRoom={targetRoomForNav}
                userProfile={userProfile}
              />
            </motion.div>
          )}

          {/* TAB 5: SOCIAL BREAK RADAR */}
          {activeTab === 'social' && (
            <motion.div
              key="tab-social"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <SocialBreakRadar
                currentZoneId={currentZoneId}
                onCheckInZone={setCurrentZoneId}
                onNavigateToZone={handleNavigateToRoom}
              />
            </motion.div>
          )}

          {/* TAB 6: TEACHER MESSAGE SIMPLIFIER */}
          {activeTab === 'messages' && (
            <motion.div
              key="tab-messages"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <TeacherMessageSimplifier
                onAddEquipmentToBag={(items) => {
                  setActiveTab('equipment');
                }}
              />
            </motion.div>
          )}

          {/* TAB 7: AI CHAT COMPANION */}
          {activeTab === 'chat' && (
            <motion.div
              key="tab-chat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <MindMateAIChat userProfile={userProfile} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4 text-center text-xs text-slate-500 space-y-2 border-t border-slate-200/60 mt-10">
        <div className="flex items-center justify-center gap-2 font-bold text-indigo-700">
          <Brain className="w-4 h-4" />
          <span>MindMate • AI-powered assistant for neurodiverse learners</span>
        </div>
        <p className="text-[11px] text-slate-400">
          נבחר לתחרות Intel® AI Global Impact Festival 2026 🏆 • מותאם אישית לשימוש בטלפון נייד
        </p>
      </footer>
    </div>
  );
}
