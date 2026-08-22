import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Wind, Brain, CheckCircle2, ShieldAlert } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface FocusCalmModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'focus' | 'calm' | 'grounding';
}

export const FocusCalmModal: React.FC<FocusCalmModalProps> = ({ isOpen, onClose, initialMode = 'focus' }) => {
  const [activeTab, setActiveTab] = useState<'focus' | 'calm' | 'grounding'>(initialMode);
  
  // Focus Timer state (ADHD 20 min sprint)
  const FOCUS_DURATION = 20 * 60; // 20 minutes
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeSound, setActiveSound] = useState<'none' | 'brown_noise' | 'rain' | 'binaural' | 'waves'>('none');
  const [focusStreak, setFocusStreak] = useState(1);

  // Breathing Box state (4-4-4-4)
  const [breathPhase, setBreathPhase] = useState<'שאיפה (קחו אוויר)' | 'עצירה (שמרו בפנים)' | 'נשיפה (שחררו לאט)' | 'מנוחה (הירגעו)'>('שאיפה (קחו אוויר)');
  const [breathCount, setBreathCount] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // Grounding 5-4-3-2-1
  const [groundingStep, setGroundingStep] = useState(0);

  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  // Focus timer countdown
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      audioSynth.playSuccessBeep();
      setFocusStreak((prev) => prev + 1);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Breathing loop
  useEffect(() => {
    let timer: any;
    if (isBreathingActive && activeTab === 'calm') {
      const phases: Array<{ name: typeof breathPhase; duration: number }> = [
        { name: 'שאיפה (קחו אוויר)', duration: 4 },
        { name: 'עצירה (שמרו בפנים)', duration: 4 },
        { name: 'נשיפה (שחררו לאט)', duration: 4 },
        { name: 'מנוחה (הירגעו)', duration: 4 },
      ];
      let currentIdx = 0;
      let secondsLeft = 4;

      timer = setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft <= 0) {
          currentIdx = (currentIdx + 1) % phases.length;
          setBreathPhase(phases[currentIdx].name);
          secondsLeft = phases[currentIdx].duration;
        }
        setBreathCount(secondsLeft);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, activeTab]);

  const toggleSound = (sound: 'brown_noise' | 'rain' | 'binaural' | 'waves') => {
    if (activeSound === sound) {
      audioSynth.stop();
      setActiveSound('none');
    } else {
      audioSynth.playSound(sound, 0.35);
      setActiveSound(sound);
    }
  };

  const handleClose = () => {
    audioSynth.stop();
    setActiveSound('none');
    setIsTimerRunning(false);
    setIsBreathingActive(false);
    onClose();
  };

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const groundingExercises = [
    { num: '5', label: 'דברים שאתה רואה סביבך', desc: 'הבט בחדר ומצא 5 חפצים מוחשיים (למשל: עט, לוח, חלון, נעל, שעון)', icon: '👀' },
    { num: '4', label: 'דברים שאתה יכול לגעת בהם', desc: 'גע ב-4 מרקמים שונים (השולחן החלק, הבד של החולצה, קצה השולחן, הדפים)', icon: '✋' },
    { num: '3', label: 'צלילים שאתה שומע', desc: 'עצום עיניים והקשב ל-3 קולות (המזגן, קולות במסדרון, הנשימה שלך)', icon: '👂' },
    { num: '2', label: 'ריחות שאתה מזהה', desc: 'זהה 2 ריחות באוויר (הכריך בתיק, ריח הנייר, ריח האוויר בחדר)', icon: '👃' },
    { num: '1', label: 'דבר אחד חיובי עליך', desc: 'אמור לעצמך: "אני עושה כמיטב יכולתי, והכל בסדר גמור!"', icon: '❤️' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md">
                <Wind className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg leading-tight">רגע של רוגע 🌿</h3>
                <p className="text-xs text-indigo-100 font-semibold">טעינת אנרגיה, נשימה ואיפוס עומס</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 p-2 bg-slate-100 gap-1 border-b border-slate-200 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('focus')}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'focus'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>ספרינט 20 דק׳</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('calm');
                setIsBreathingActive(true);
              }}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'calm'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wind className="w-4 h-4" />
              <span>נשימת רוגע</span>
            </button>
            <button
              onClick={() => setActiveTab('grounding')}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'grounding'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>איפוס 5-4-3-2-1</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto space-y-6">
            {activeTab === 'focus' && (
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="relative flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-8 border-indigo-100 flex flex-col items-center justify-center relative shadow-inner bg-slate-50">
                    <span className="text-4xl font-extrabold text-slate-800 tracking-tight font-mono">
                      {formatMinutes(timeLeft)}
                    </span>
                    <span className="text-xs text-indigo-600 font-bold mt-1">
                      {isTimerRunning ? '🔥 פוקוס מלא פועל' : 'מוכן לספרינט קצר'}
                    </span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-transform active:scale-95"
                  >
                    {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isTimerRunning ? 'השהה ספרינט' : 'התחל 20 דקות עכשיו'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimeLeft(FOCUS_DURATION);
                    }}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="אפס טיימר"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>

                {/* Ambient Soundscape for ADHD */}
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-indigo-600" />
                      צלילי רקע לחסימת הסחות דעת (ללא מוזיקה מטרידה):
                    </span>
                    {activeSound !== 'none' && (
                      <button
                        onClick={() => toggleSound(activeSound as any)}
                        className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <VolumeX className="w-3.5 h-3.5" /> כבה צליל
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => toggleSound('brown_noise')}
                      className={`p-2.5 rounded-xl border font-bold transition-all text-right ${
                        activeSound === 'brown_noise'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      ☕ רעש חום (Brown Noise)
                      <span className="block text-[10px] font-normal opacity-80 mt-0.5">מעולה למסוך דיבורים בכיתה</span>
                    </button>
                    <button
                      onClick={() => toggleSound('rain')}
                      className={`p-2.5 rounded-xl border font-bold transition-all text-right ${
                        activeSound === 'rain'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      🌧️ גשם עדין ומרגיע
                      <span className="block text-[10px] font-normal opacity-80 mt-0.5">צליל זרימה מונוטוני</span>
                    </button>
                    <button
                      onClick={() => toggleSound('binaural')}
                      className={`p-2.5 rounded-xl border font-bold transition-all text-right ${
                        activeSound === 'binaural'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      🧠 גלי אלפא 10Hz (עם אוזניות)
                      <span className="block text-[10px] font-normal opacity-80 mt-0.5">מיקוד וריכוז מוחי</span>
                    </button>
                    <button
                      onClick={() => toggleSound('waves')}
                      className={`p-2.5 rounded-xl border font-bold transition-all text-right ${
                        activeSound === 'waves'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      🌊 גלי ים קצביים
                      <span className="block text-[10px] font-normal opacity-80 mt-0.5">קצב יציב לנשימה ורגיעה</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calm' && (
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-lg">נשימת קופסה להורדת דופק</h4>
                  <p className="text-xs text-slate-500">עקוב אחרי העיגול: שאיפה 4 שניות, עצירה 4, נשיפה 4, מנוחה 4</p>
                </div>

                <div className="relative w-56 h-56 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: breathPhase.startsWith('שאיפה') ? 1.35 : breathPhase.startsWith('נשיפה') ? 0.85 : 1.1,
                      backgroundColor: breathPhase.startsWith('שאיפה') ? '#6366f1' : breathPhase.startsWith('עצירה') ? '#8b5cf6' : '#06b6d4',
                    }}
                    transition={{ duration: 3.8, ease: 'easeInOut' }}
                    className="w-36 h-36 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-100"
                  >
                    <span className="text-3xl font-extrabold font-mono">{breathCount}</span>
                    <span className="text-xs font-semibold px-2 text-center mt-1 opacity-90">{breathPhase}</span>
                  </motion.div>
                </div>

                <button
                  onClick={() => setIsBreathingActive(!isBreathingActive)}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-sm hover:bg-indigo-100 transition-colors"
                >
                  {isBreathingActive ? 'הפסק תרגיל נשימה' : 'הפעל תרגיל נשימה רציף'}
                </button>
              </div>
            )}

            {activeTab === 'grounding' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-right flex items-center gap-3">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <h5 className="text-xs font-bold text-amber-900">מרגיש מוצף / חרדה לפני מבחן?</h5>
                    <p className="text-[11px] text-amber-800">תרגיל הקרקוע 5-4-3-2-1 מחזיר את המוח לרגע הנוכחי בשניות.</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {groundingExercises.map((ex, idx) => (
                    <div
                      key={idx}
                      onClick={() => setGroundingStep(idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-right flex items-start gap-3.5 ${
                        groundingStep === idx
                          ? 'bg-indigo-50/70 border-indigo-400 shadow-sm ring-2 ring-indigo-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm shadow-sm">
                        {ex.num}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{ex.icon}</span>
                          <span className="text-sm font-bold text-slate-800">{ex.label}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{ex.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setGroundingStep((prev) => (prev > 0 ? prev - 1 : 0))}
                    disabled={groundingStep === 0}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold disabled:opacity-40"
                  >
                    שלב קודם
                  </button>
                  <span className="text-xs text-slate-500 font-semibold">שלב {groundingStep + 1} מתוך 5</span>
                  <button
                    onClick={() => setGroundingStep((prev) => (prev < 4 ? prev + 1 : 4))}
                    disabled={groundingStep === 4}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-40"
                  >
                    השלב הבא
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
