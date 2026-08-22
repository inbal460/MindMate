import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  MessageCircle,
  Sparkles,
  MapPin,
  Heart,
  Plus,
  Send,
  Radio,
  Smile,
  ShieldCheck,
  Zap,
  Coffee,
  Trees,
  BookOpen,
  Gamepad2,
  Trophy,
  Volume2,
  Star,
  Bot,
  Flame,
  Award,
} from 'lucide-react';
import { BreakZone } from '../types';
import { BREAK_ZONES } from '../data/schoolData';
import { audioSynth } from '../utils/audioSynth';
import { speechHelper } from '../utils/speechHelper';

interface SocialBreakRadarProps {
  currentZoneId?: string;
  onCheckInZone: (zoneId: string) => void;
  onNavigateToZone: (zoneName: string) => void;
}

type FilterCategory = 'favorites' | 'all' | 'sports' | 'outdoor' | 'quiet';

export const SocialBreakRadar: React.FC<SocialBreakRadarProps> = ({
  currentZoneId = 'zone-football',
  onCheckInZone,
  onNavigateToZone,
}) => {
  const [zones, setZones] = useState<BreakZone[]>(BREAK_ZONES);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mindmate_favorite_zones');
      return saved ? JSON.parse(saved) : ['zone-football']; // Default favorite: Football
    } catch {
      return ['zone-football'];
    }
  });

  // Visit frequencies tracked by AI for automatic personalization
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('mindmate_zone_visits');
      return saved ? JSON.parse(saved) : { 'zone-football': 14, 'zone-patio-middle': 6, 'zone-basketball': 5 };
    } catch {
      return { 'zone-football': 14, 'zone-patio-middle': 6, 'zone-basketball': 5 };
    }
  });

  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [selectedZone, setSelectedZone] = useState<BreakZone>(
    zones.find((z) => z.id === currentZoneId) || zones[0]
  );
  const [isSocialBeaconActive, setIsSocialBeaconActive] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActivityText, setNewActivityText] = useState('');
  const [newActivityTag, setNewActivityTag] = useState('כדורגל ⚽');
  const [icebreakerIndex, setIcebreakerIndex] = useState(0);

  // Persist favorites and visits
  useEffect(() => {
    try {
      localStorage.setItem('mindmate_favorite_zones', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('mindmate_zone_visits', JSON.stringify(visitCounts));
    } catch {}
  }, [visitCounts]);

  const toggleFavorite = (zoneId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    audioSynth.playChime();
    setFavorites((prev) => {
      const isFav = prev.includes(zoneId);
      if (isFav) {
        return prev.filter((id) => id !== zoneId);
      } else {
        return [...prev, zoneId];
      }
    });
  };

  // AI-Identified Top Preferred Zone based on favorites + visits
  const aiTopZone = useMemo(() => {
    let bestZone = zones[0];
    let maxScore = -1;

    for (const z of zones) {
      const isFav = favorites.includes(z.id) ? 10 : 0;
      const visits = visitCounts[z.id] || 0;
      const totalScore = isFav + visits;
      if (totalScore > maxScore) {
        maxScore = totalScore;
        bestZone = z;
      }
    }
    return bestZone;
  }, [zones, favorites, visitCounts]);

  // Sort zones so favorites / AI top preference appear first
  const sortedZones = useMemo(() => {
    return [...zones].sort((a, b) => {
      const aIsFav = favorites.includes(a.id);
      const bIsFav = favorites.includes(b.id);
      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;

      const aVisits = visitCounts[a.id] || 0;
      const bVisits = visitCounts[b.id] || 0;
      return bVisits - aVisits;
    });
  }, [zones, favorites, visitCounts]);

  const filteredZones = sortedZones.filter((z) => {
    if (activeCategory === 'favorites') return favorites.includes(z.id) || z.id === aiTopZone.id;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'sports') return z.type === 'sports';
    if (activeCategory === 'outdoor') return z.type === 'outdoor';
    if (activeCategory === 'quiet') return z.type === 'quiet';
    return true;
  });

  const icebreakers = [
    '״היי, אפשר להצטרף אליכם למסירות / משחקון?״ (פשוט, ספורטיבי ותמיד עובד ⚽)',
    '״מותר לשבת לידכם בפטיו בצל?״ (פתיחה נעימה ורגועה בלי לחץ 🌿)',
    '״מישהו רוצה לזרוק שלשות או לשחק 21 בסל?״ (מזמין ישירות לפעולה 🏀)',
    '״מישהו פה מכיר את המשחק הזה? אפשר הסבר קצר?״ (אנשים אוהבים להסביר 🎲)',
    '״אני מחפש שחקן נוסף לפינג פונג או טאקי, מישהו בעניין?״ (כיף וקליל 🏓)',
  ];

  const handleCheckIn = (zoneId: string) => {
    onCheckInZone(zoneId);
    audioSynth.playSuccessBeep();
    setVisitCounts((prev) => ({
      ...prev,
      [zoneId]: (prev[zoneId] || 0) + 1,
    }));
  };

  const handleCreateActivity = () => {
    if (!newActivityText.trim()) return;

    audioSynth.playSuccessBeep();
    const newAct = {
      id: `act-${Date.now()}`,
      studentName: 'אתה (אני)',
      grade: 'ט׳2',
      activityText: newActivityText.trim(),
      lookingForOthers: true,
      tags: [newActivityTag, 'פתוח להצטרפות'],
      timeAgo: 'ממש עכשיו',
    };

    setZones((prev) =>
      prev.map((z) =>
        z.id === selectedZone.id
          ? {
              ...z,
              currentCount: z.currentCount + 1,
              activeActivities: [newAct, ...z.activeActivities],
            }
          : z
      )
    );

    setSelectedZone((prev) => ({
      ...prev,
      currentCount: prev.currentCount + 1,
      activeActivities: [newAct, ...prev.activeActivities],
    }));

    setNewActivityText('');
    setIsAddActivityOpen(false);
  };

  const getZoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return Trophy;
      case 'BookOpen':
        return BookOpen;
      case 'Trees':
        return Trees;
      case 'Gamepad2':
        return Gamepad2;
      case 'Coffee':
        return Coffee;
      default:
        return Users;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card with Beacon */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-lg space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl text-right">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-white/15 backdrop-blur-md">
                <Users className="w-6 h-6 text-teal-300" />
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                חיבור חברתי ומרחבי הפסקה (Break Hub)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed font-medium">
              רוצה לדעת איפה כולם נפגשים? מגרש כדורגל ⚽, כדורסל 🏀, פטיו חט״ב 🌿, פינג פונג וספרייה שקטה.
            </p>
          </div>

          {/* Social Beacon Toggle */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 backdrop-blur-md flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${isSocialBeaconActive ? 'text-emerald-400 animate-pulse' : 'text-slate-300'}`} />
                <span className="text-xs font-bold">אות חברתי: פתוח לשיחה</span>
              </div>
              <button
                onClick={() => {
                  audioSynth.playChime();
                  setIsSocialBeaconActive(!isSocialBeaconActive);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  isSocialBeaconActive ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
                title="אות חברתי שמאותת שאתה שמח לחברים שיצטרפו"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isSocialBeaconActive ? '-translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <span className="text-[11px] text-teal-200">
              {isSocialBeaconActive
                ? '🟢 אות פעיל: חברים יודעים שאתה פתוח להצטרף לפעילויות!'
                : '⚪ אות כבוי (מצב שקט אישי)'}
            </span>
          </div>
        </div>

        {/* AI Smart Preference Recommendation Banner */}
        <div className="bg-gradient-to-r from-emerald-500/25 via-teal-500/25 to-indigo-500/25 border border-emerald-300/40 rounded-2xl p-3.5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-400 text-emerald-950 flex items-center justify-center font-bold text-sm shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <span>התאמה אישית חכמה של ה-AI:</span>
                <span className="bg-emerald-400 text-emerald-950 text-[10px] px-2 py-0.2 rounded-full font-black">
                  העדפה מובילה ⭐
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                זיהינו שאתה הכי אוהב לבלות ב-<strong>{aiTopZone.name}</strong>! קידמנו אותו לראש הרשימה.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedZone(aiTopZone);
              audioSynth.playChime();
            }}
            className="px-3.5 py-1.5 bg-white text-teal-900 rounded-xl text-xs font-black shrink-0 hover:bg-teal-50 transition-colors cursor-pointer shadow-sm"
          >
            עבור ל{aiTopZone.name} ←
          </button>
        </div>

        {/* Icebreaker Helper */}
        <div className="bg-white/10 border border-teal-400/30 rounded-2xl p-3 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-right w-full sm:w-auto">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="font-bold text-teal-200">טיפ לפתיחת שיחה קלה:</span>
            <span className="text-white italic">"{icebreakers[icebreakerIndex]}"</span>
          </div>
          <button
            onClick={() => setIcebreakerIndex((prev) => (prev + 1) % icebreakers.length)}
            className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] shrink-0 transition-colors cursor-pointer"
          >
            רעיון אחר 🔄
          </button>
        </div>
      </div>

      {/* Category Filter Chips with Favorites Tab */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 text-right">
        <span className="text-xs font-bold text-slate-500 shrink-0 ml-1">סינון והעדפות:</span>
        {[
          { id: 'favorites', label: 'מועדפים שלי (AI)', emoji: '⭐', count: favorites.length },
          { id: 'all', label: 'הכל', emoji: '🌟', count: zones.length },
          { id: 'sports', label: 'מגרשי ספורט', emoji: '⚽', count: zones.filter((z) => z.type === 'sports').length },
          { id: 'outdoor', label: 'פטיו וטבע', emoji: '🌿', count: zones.filter((z) => z.type === 'outdoor').length },
          { id: 'quiet', label: 'פינות שקט', emoji: '🧘', count: zones.filter((z) => z.type === 'quiet').length },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              audioSynth.playChime();
              setActiveCategory(cat.id as FilterCategory);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Break Zones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredZones.map((zone) => {
          const ZoneIcon = getZoneIcon(zone.icon);
          const isSelected = selectedZone.id === zone.id;
          const isCurrent = currentZoneId === zone.id;
          const isFav = favorites.includes(zone.id);
          const isAITop = zone.id === aiTopZone.id;

          return (
            <motion.div
              key={zone.id}
              onClick={() => {
                setSelectedZone(zone);
                audioSynth.playChime();
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-3xl border transition-all cursor-pointer text-right flex flex-col justify-between space-y-3 relative overflow-hidden ${
                isSelected
                  ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-400/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${zone.color} text-white shadow-sm`}>
                  <ZoneIcon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Star Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(zone.id, e)}
                    className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                      isFav
                        ? 'bg-amber-50 text-amber-500 border-amber-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-500'
                    }`}
                    title={isFav ? 'הסר ממועדפים' : 'סמן כמועדף'}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>

                  <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    {zone.currentCount} תלמידים
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-slate-800 text-sm leading-tight">{zone.name}</h4>
                  {isAITop && (
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded-md font-black">
                      מומלץ AI
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-medium">{zone.locationName}</p>
              </div>

              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-teal-700 font-bold">{zone.vibe.split(',')[0]}</span>
                {isCurrent && (
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    כאן עכשיו 📍
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Zone Deep Dive */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 text-right">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${selectedZone.color} text-white shadow-md`}>
              {React.createElement(getZoneIcon(selectedZone.icon), { className: 'w-6 h-6' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-800">{selectedZone.name}</h3>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                  {selectedZone.currentCount} נוכחים כעת
                </span>
                {favorites.includes(selectedZone.id) && (
                  <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    מועדף עליך
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {selectedZone.locationName} • אווירה: {selectedZone.vibe}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => handleCheckIn(selectedZone.id)}
              className="px-4 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
            >
              📍 אני כאן (Check-In)
            </button>
            <button
              onClick={() => onNavigateToZone(selectedZone.name)}
              className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>נווט למתחם במפה</span>
            </button>
            <button
              onClick={() => setIsAddActivityOpen(true)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-indigo-200 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>פתח פעילות / חפש שחקן</span>
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700">פעילויות וקבוצות פתוחות להצטרפות כעת:</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedZone.activeActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-right space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {act.studentName} ({act.grade})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.timeAgo}</span>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-slate-800 leading-relaxed">
                    {act.activityText}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div className="flex flex-wrap gap-1">
                    {act.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {act.lookingForOthers && (
                    <button
                      onClick={() => {
                        audioSynth.playSuccessBeep();
                        alert(`הודעת הצטרפות נשלחה ל-${act.studentName}! נפגשים ב-${selectedZone.name}.`);
                      }}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      אני מצטרף! 🙋‍♂️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Activity Modal */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-right">
            <h3 className="text-lg font-bold text-slate-800">
              פרסום פעילות פתוחה ב-{selectedZone.name}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">מה הפעילות? / מה אתה מציע?</label>
                <textarea
                  value={newActivityText}
                  onChange={(e) => setNewActivityText(e.target.value)}
                  placeholder="למשל: יושב במגרש הכדורגל, חסר שחקן אחד למשחקון מסירות ⚽..."
                  className="w-full h-24 p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">קטגוריה</label>
                <select
                  value={newActivityTag}
                  onChange={(e) => setNewActivityTag(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="כדורגל ⚽">כדורגל ⚽</option>
                  <option value="כדורסל 🏀">כדורסל 🏀</option>
                  <option value="פטיו ורוגע 🌿">פטיו ורוגע 🌿</option>
                  <option value="פינג פונג 🏓">פינג פונג 🏓</option>
                  <option value="משחק קלפים / טאקי">משחק קלפים / טאקי 🃏</option>
                  <option value="שחמט / לוח">שחמט / משחק לוח ♟️</option>
                  <option value="למידה שקטה יחד">למידה שקטה יחד 📚</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAddActivityOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                ביטול
              </button>
              <button
                onClick={handleCreateActivity}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 cursor-pointer"
              >
                פרסם לכולם 📢
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
