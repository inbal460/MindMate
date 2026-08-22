import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Navigation,
  MapPin,
  Compass,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Footprints,
  Accessibility,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Flag,
  Target,
  ChevronLeft,
  ChevronRight,
  PartyPopper
} from 'lucide-react';
import { SchoolLocation, UserProfile } from '../types';
import { SCHOOL_LOCATIONS } from '../data/schoolData';
import { audioSynth } from '../utils/audioSynth';
import { speechHelper } from '../utils/speechHelper';
import { getYouAreHereText, getDestinationText } from '../utils/genderHelper';

interface SchoolNavigatorProps {
  initialTargetRoom?: string;
  userProfile?: UserProfile | null;
  onSelectLocation?: (loc: SchoolLocation) => void;
}

export const SchoolNavigator: React.FC<SchoolNavigatorProps> = ({
  initialTargetRoom,
  userProfile,
}) => {
  const defaultOrigin = SCHOOL_LOCATIONS.find((l) => l.code === 'CLASS-902') || SCHOOL_LOCATIONS[0];
  const defaultTarget =
    SCHOOL_LOCATIONS.find(
      (l) => l.name.includes(initialTargetRoom || '') || l.code.includes(initialTargetRoom || '')
    ) || SCHOOL_LOCATIONS.find((l) => l.code === '204') || SCHOOL_LOCATIONS[1];

  const [originId, setOriginId] = useState<string>(defaultOrigin.id);
  const [destinationId, setDestinationId] = useState<string>(defaultTarget.id);
  const [selectedFloor, setSelectedFloor] = useState<number>(defaultTarget.floor);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'classroom' | 'lab' | 'quiet' | 'facility'>('all');
  const [isAccessibleRoute, setIsAccessibleRoute] = useState(false);

  // Live Waze-like Navigation State
  const [isLiveNavigating, setIsLiveNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasReachedDestination, setHasReachedDestination] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = speechHelper.subscribe((speaking) => setIsSpeaking(speaking));
    return () => unsub();
  }, []);

  const origin = SCHOOL_LOCATIONS.find((l) => l.id === originId) || defaultOrigin;
  const destination = SCHOOL_LOCATIONS.find((l) => l.id === destinationId) || defaultTarget;

  const handleSpeakRoute = () => {
    if (isSpeaking) {
      speechHelper.stop();
      return;
    }
    const stepsText = stepDirections.map((s, i) => `שלב ${i + 1}: ${s.title}, ${s.subtitle}`).join('. ');
    const textToSpeak = `הנחיות מסלול מ-${origin.name} אל ${destination.name}. ${stepsText}. הגעת ליעד בהצלחה!`;
    speechHelper.speak(textToSpeak);
  };

  // Ensure floor matches destination when selected
  const handleSelectDestination = (loc: SchoolLocation) => {
    setDestinationId(loc.id);
    setSelectedFloor(loc.floor);
    setIsLiveNavigating(false);
    setCurrentStepIndex(0);
    setHasReachedDestination(false);
    audioSynth.playChime();
  };

  const handleSwapRoute = () => {
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
    setIsLiveNavigating(false);
    setCurrentStepIndex(0);
    setHasReachedDestination(false);
    audioSynth.playSuccessBeep();
  };

  // Step-by-step turn guidance
  const stepDirections = useMemo(() => {
    const steps: Array<{
      title: string;
      subtitle: string;
      emoji: string;
      direction: 'straight' | 'right' | 'left' | 'stairs' | 'elevator' | 'arrive';
      distance: string;
      floorTarget: number;
    }> = [];

    steps.push({
      title: `צא מנקודת המוצא: ${origin.name}`,
      subtitle: `${origin.building} • קומה ${origin.floor}`,
      emoji: '🚪',
      direction: 'straight',
      distance: '0 מטר',
      floorTarget: origin.floor,
    });

    if (origin.floor !== destination.floor) {
      steps.push({
        title: 'התקדם ישר במסדרון המרכזי',
        subtitle: isAccessibleRoute ? 'הליכה לעבר המעלית הנגישה' : 'הליכה לעבר גרם המדרגות',
        emoji: '⬆️',
        direction: 'straight',
        distance: '20 מטר',
        floorTarget: origin.floor,
      });

      if (isAccessibleRoute) {
        steps.push({
          title: `עלה במעלית לקומה ${destination.floor}`,
          subtitle: `יעד בקומה ${destination.floor}`,
          emoji: '🛗',
          direction: 'elevator',
          distance: 'מעלית',
          floorTarget: destination.floor,
        });
      } else {
        steps.push({
          title: `עלה במדרגות לקומה ${destination.floor}`,
          subtitle: 'גרם מדרגות מרכזי',
          emoji: '🪜',
          direction: 'stairs',
          distance: '16 מדרגות',
          floorTarget: destination.floor,
        });
      }

      steps.push({
        title: `פנה ימינה במסדרון קומה ${destination.floor}`,
        subtitle: `אגף ${destination.building}`,
        emoji: '➡️',
        direction: 'right',
        distance: '15 מטר',
        floorTarget: destination.floor,
      });
    } else {
      steps.push({
        title: `המשך ישר במסדרון קומה ${destination.floor}`,
        subtitle: `כיוון ${destination.building}`,
        emoji: '⬆️',
        direction: 'straight',
        distance: '25 מטר',
        floorTarget: destination.floor,
      });
    }

    steps.push({
      title: `הגעת ליעד: ${destination.name}!`,
      subtitle: `חדר ${destination.code} • ${destination.building}`,
      emoji: '🎯',
      direction: 'arrive',
      distance: 'הגעת!',
      floorTarget: destination.floor,
    });

    return steps;
  }, [origin, destination, isAccessibleRoute]);

  // Handle live navigation steps
  const handleStartLiveNav = () => {
    setIsLiveNavigating(true);
    setCurrentStepIndex(0);
    setHasReachedDestination(false);
    setSelectedFloor(origin.floor);
    audioSynth.playSuccessBeep();
  };

  const handleNextStep = () => {
    if (currentStepIndex < stepDirections.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setSelectedFloor(stepDirections[nextIdx].floorTarget);
      audioSynth.playChime();

      if (nextIdx === stepDirections.length - 1) {
        setHasReachedDestination(true);
        audioSynth.playSuccessBeep();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setSelectedFloor(stepDirections[prevIdx].floorTarget);
      setHasReachedDestination(false);
      audioSynth.playChime();
    }
  };

  const handleFinishNav = () => {
    setIsLiveNavigating(false);
    setCurrentStepIndex(0);
    setHasReachedDestination(false);
  };

  const currentStep = stepDirections[currentStepIndex];

  return (
    <div className="space-y-6">
      {/* Top Header & Destination Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shadow-xs">
              🗺️
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                ניווט פנים בית ספרי (MindMaps & Waze)
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                מסלול הגעה ויזואלי צעד-אחר-צעד עם סימון הגעה ליעד
              </p>
            </div>
          </div>

          {/* Floor Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl self-start md:self-auto">
            <button
              onClick={() => setSelectedFloor(0)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                selectedFloor === 0
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌿 קומת קרקע וחצר
            </button>
            <button
              onClick={() => setSelectedFloor(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                selectedFloor === 1
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏢 קומה 1
            </button>
            <button
              onClick={() => setSelectedFloor(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                selectedFloor === 2
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔬 קומה 2
            </button>
          </div>
        </div>

        {/* Route Selector (Origin / Destination) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
          {/* Origin */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shrink-0 shadow-xs" />
              <span>{getYouAreHereText(userProfile?.gender)} (מוצא)</span>
            </label>
            <select
              value={originId}
              onChange={(e) => {
                setOriginId(e.target.value);
                setIsLiveNavigating(false);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none"
            >
              {SCHOOL_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} (קומה {loc.floor})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center">
            <button
              onClick={handleSwapRoute}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 text-indigo-600 transition-transform active:scale-95 shadow-sm"
              title="החלף כיוון מסלול"
            >
              <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block shrink-0 shadow-xs" />
              <span>{getDestinationText(userProfile?.gender)} (יעד)</span>
            </label>
            <select
              value={destinationId}
              onChange={(e) => {
                const loc = SCHOOL_LOCATIONS.find((l) => l.id === e.target.value);
                if (loc) handleSelectDestination(loc);
              }}
              className="w-full p-2.5 rounded-xl border-2 border-indigo-500/40 bg-white text-xs font-extrabold text-indigo-950 focus:ring-2 focus:ring-indigo-500 outline-none shadow-xs"
            >
              {SCHOOL_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.building}, קומה {loc.floor})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Navigation Launch Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            {!isLiveNavigating ? (
              <button
                onClick={handleStartLiveNav}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md shadow-indigo-200 transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>התחל ניווט חי (Waze) 🚀</span>
              </button>
            ) : (
              <button
                onClick={handleFinishNav}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-900 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>איפוס ניווט</span>
              </button>
            )}

            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={isAccessibleRoute}
                onChange={(e) => setIsAccessibleRoute(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <Accessibility className="w-3.5 h-3.5 text-indigo-600" />
              <span>מסלול נגיש (מעלית)</span>
            </label>
          </div>

          {/* Quick Filter chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-colors ${
                selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setSelectedCategory('classroom')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-colors ${
                selectedCategory === 'classroom' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              🏫 כיתות
            </button>
            <button
              onClick={() => setSelectedCategory('lab')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-colors ${
                selectedCategory === 'lab' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              🧪 מעבדות
            </button>
            <button
              onClick={() => setSelectedCategory('quiet')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-colors ${
                selectedCategory === 'quiet' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              🤫 שקט
            </button>
          </div>
        </div>
      </div>

      {/* Live Waze Floating HUD Banner (When navigating) */}
      <AnimatePresence>
        {isLiveNavigating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-3xl p-5 shadow-lg border text-white transition-all ${
              hasReachedDestination
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-400'
                : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/40'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-right w-full sm:w-auto">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0 animate-bounce">
                  {currentStep.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                      צעד {currentStepIndex + 1} מתוך {stepDirections.length}
                    </span>
                    <span className="text-xs text-indigo-200 font-mono">
                      מרחק: {currentStep.distance}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                    {currentStep.title}
                  </h3>
                  <p className="text-xs text-slate-300">{currentStep.subtitle}</p>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>הקודם</span>
                </button>

                {!hasReachedDestination ? (
                  <button
                    onClick={handleNextStep}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-transform active:scale-95"
                  >
                    <span>הצעד הבא</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinishNav}
                    className="px-5 py-2.5 rounded-xl bg-white text-emerald-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>סיום ניווט</span>
                  </button>
                )}
              </div>
            </div>

            {/* Destination celebration banner */}
            {hasReachedDestination && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-4 pt-3 border-t border-white/20 flex items-center justify-center gap-2 text-sm font-extrabold text-emerald-100"
              >
                <PartyPopper className="w-5 h-5 text-amber-300 animate-bounce" />
                <span>🎯 מעולה! הגעת בהצלחה לכיתה {destination.name}! שתהיה שעת לימודים נהדרת!</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Map Visualizer & Step Guidance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive 2.5D Blueprint Map Canvas */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>
                מפת בית הספר - {selectedFloor === 0 ? 'קומת קרקע וחצר' : selectedFloor === 1 ? 'קומה 1' : 'קומה 2'}
              </span>
            </h3>
            <span className="text-[11px] bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">
              לחץ על חדר לבחירת יעד 🎯
            </span>
          </div>

          {/* Blueprint Canvas */}
          <div className="relative w-full h-80 sm:h-96 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center p-4">
            {/* Blueprint Grid */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: 'radial-gradient(#818cf8 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Central Corridor */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-16 bg-slate-800/80 border-y border-indigo-500/30 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-[10px] tracking-widest text-indigo-400 font-mono uppercase">
                מסדרון מרכזי • אגף לימודים
              </span>
            </div>

            {/* Animated dashed line on current floor */}
            {origin.floor === selectedFloor && destination.floor === selectedFloor && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <line
                  x1={`${origin.x}%`}
                  y1={`${origin.y}%`}
                  x2={`${destination.x}%`}
                  y2={`${destination.y}%`}
                  stroke="#818cf8"
                  strokeWidth="3"
                  strokeDasharray="6,6"
                  className="animate-pulse"
                />
              </svg>
            )}

            {/* Location Nodes */}
            {SCHOOL_LOCATIONS.filter((l) => l.floor === selectedFloor).map((loc) => {
              const isOrigin = loc.id === origin.id;
              const isDest = loc.id === destination.id;
              const isQuiet = loc.quietLevel === 'high';

              return (
                <motion.div
                  key={loc.id}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectDestination(loc)}
                  style={{
                    left: `${loc.x}%`,
                    top: `${loc.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute z-20 cursor-pointer p-2 rounded-2xl border transition-all flex flex-col items-center justify-center shadow-lg ${
                    isDest
                      ? 'bg-indigo-600 text-white border-white ring-4 ring-indigo-400/50 shadow-indigo-500/50 scale-105'
                      : isOrigin
                      ? 'bg-emerald-500 text-white border-white ring-4 ring-emerald-400/50'
                      : isQuiet
                      ? 'bg-teal-900/90 text-teal-200 border-teal-500 hover:bg-teal-800'
                      : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:border-indigo-400 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-xs font-extrabold px-1 text-center whitespace-nowrap">
                    {loc.name.length > 18 ? loc.name.substring(0, 16) + '...' : loc.name}
                  </span>
                  <span className="text-[9px] opacity-80 font-mono">{loc.code}</span>

                  {/* Pulsing beacon for Destination */}
                  {isDest && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-500 border-2 border-white items-center justify-center text-[10px]">
                        🎯
                      </span>
                    </span>
                  )}

                  {/* Origin Badge */}
                  {isOrigin && (
                    <span className="absolute -bottom-2 -left-2 bg-emerald-400 text-slate-900 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full">
                      {userProfile?.avatarEmoji || '👦'} כאן
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>מוצא ({userProfile?.avatarEmoji || '👦'})</span>
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <span className="w-3 h-3 rounded-full bg-indigo-600" />
                <span>יעד (כיתה הבאה 🎯)</span>
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <span className="w-3 h-3 rounded-full bg-teal-700" />
                <span>מרחב שקט (רוגע 🌿)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Turn-by-Turn Visual Steps List */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-indigo-600 shrink-0" />
                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">הנחיות הגעה במסלול</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSpeakRoute}
                  className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 border transition-all cursor-pointer shadow-2xs ${
                    isSpeaking
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                  }`}
                  title="הקרא את כל שלבי ההגעה במסלול"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-600" />}
                  <span>{isSpeaking ? 'עצור' : '🔊 הקרא'}</span>
                </button>
                <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-xl hidden sm:inline">
                  ~2 דק׳ הליכה
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {stepDirections.map((step, idx) => {
                const isStepActive = isLiveNavigating && currentStepIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-all text-right text-xs ${
                      isStepActive
                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300 font-extrabold'
                        : 'bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-xl shrink-0">{step.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-xs sm:text-sm">{step.title}</p>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        {step.subtitle} • {step.distance}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Room Details */}
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 text-xs space-y-1.5 text-right">
            <h4 className="font-extrabold text-indigo-950 flex items-center gap-1.5">
              <span>📍</span>
              <span>פרטי הכיתה ({destination.name}):</span>
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">{destination.description}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-indigo-900 font-bold">
              <span>בניין: {destination.building}</span>
              <span>• קומה: {destination.floor}</span>
              <span>• שקט: {destination.quietLevel === 'high' ? 'מרחב שקט 🤫' : 'פעיל 👥'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
