import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Send,
  FileText,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  BookOpen,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Zap,
  CheckSquare,
  Square,
  Clock,
  MapPin,
  Flame,
  ArrowRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AISimplifiedMessage } from '../types';
import { SAMPLE_TEACHER_MESSAGES } from '../data/schoolData';
import { audioSynth } from '../utils/audioSynth';
import { speechHelper } from '../utils/speechHelper';

interface TeacherMessageSimplifierProps {
  onAddEquipmentToBag?: (items: string[]) => void;
}

export const TeacherMessageSimplifier: React.FC<TeacherMessageSimplifierProps> = ({
  onAddEquipmentToBag,
}) => {
  const [inputText, setInputText] = useState(SAMPLE_TEACHER_MESSAGES[0].rawText);
  const [senderName, setSenderName] = useState(SAMPLE_TEACHER_MESSAGES[0].sender);
  const [isLoading, setIsLoading] = useState(false);
  const [simplifiedResult, setSimplifiedResult] = useState<AISimplifiedMessage | null>(null);
  const [copied, setCopied] = useState(false);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = speechHelper.subscribe((speaking) => setIsSpeaking(speaking));
    return () => unsub();
  }, []);

  const handleSummarize = async (textToProcess?: string, sender?: string) => {
    const text = textToProcess || inputText;
    if (!text.trim()) return;

    setIsLoading(true);
    setSimplifiedResult(null);

    try {
      const response = await fetch('/api/ai/summarize-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sender: sender || senderName || 'מורה',
          title: 'הודעת בית ספר',
        }),
      });

      const data = await response.json();
      if (data?.result) {
        setSimplifiedResult(data.result);
        audioSynth.playSuccessBeep();
      }
    } catch (error) {
      console.error('Error summarizing message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_TEACHER_MESSAGES[0]) => {
    setInputText(sample.rawText);
    setSenderName(sample.sender);
    handleSummarize(sample.rawText, sample.sender);
  };

  const toggleAction = (id: string) => {
    const isChecked = !completedActions[id];
    setCompletedActions((prev) => ({ ...prev, [id]: isChecked }));
    if (isChecked) audioSynth.playChime();
  };

  const handleCopySummary = () => {
    if (!simplifiedResult) return;
    const summaryStr = `📌 ${simplifiedResult.title}\n🎯 שורה תחתונה: ${simplifiedResult.bottomLine}\n\nנקודות עיקריות:\n${simplifiedResult.keyPoints.map((p) => `• ${p}`).join('\n')}\n\n🎒 ציוד חובה: ${simplifiedResult.requiredEquipment.join(', ')}`;
    navigator.clipboard.writeText(summaryStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakOriginal = () => {
    if (isSpeaking) {
      speechHelper.stop();
      return;
    }
    if (!inputText.trim()) return;
    speechHelper.speak(`הודעת המורה המקורית: ${inputText}`);
  };

  const handleSpeakSummary = (mode: 'all' | 'bottomLine' | 'equipment' | 'actions' = 'all') => {
    if (isSpeaking) {
      speechHelper.stop();
      return;
    }
    if (!simplifiedResult) return;

    if (mode === 'bottomLine') {
      speechHelper.speak(`השורה התחתונה: ${simplifiedResult.bottomLine}`);
      return;
    }

    if (mode === 'equipment') {
      const eqText = simplifiedResult.requiredEquipment.length > 0
        ? `ציוד חובה להביא בתיק: ${simplifiedResult.requiredEquipment.join(', ')}`
        : 'אין ציוד מיוחד שנדרש להביא.';
      speechHelper.speak(eqText);
      return;
    }

    if (mode === 'actions') {
      const actionsText = simplifiedResult.actionItems.length > 0
        ? `משימות לביצוע: ${simplifiedResult.actionItems.map((a) => a.text).join('. ')}`
        : 'אין משימות נוספות לביצוע.';
      speechHelper.speak(actionsText);
      return;
    }

    // Default 'all'
    const speechParts = [
      `סיכום הודעת המורה: ${simplifiedResult.title}.`,
      `השורה התחתונה: ${simplifiedResult.bottomLine}.`,
      `נקודות עיקריות: ${simplifiedResult.keyPoints.join('. ')}.`,
      simplifiedResult.requiredEquipment.length > 0
        ? `ציוד חובה להביא בתיק: ${simplifiedResult.requiredEquipment.join(', ')}.`
        : '',
      simplifiedResult.actionItems.length > 0
        ? `משימות לביצוע: ${simplifiedResult.actionItems.map((a) => a.text).join('. ')}.`
        : '',
    ].filter(Boolean);

    speechHelper.speak(speechParts.join(' '));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              קיצור ופישוט הודעות מורים (AI Message Simplifier)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              הופך הודעות ארוכות, מסורבלות ומלחיצות מהמשו״ב, ווטסאפ או מייל לסיכום אולטרה-קצר, שורה תחתונה ורשימת ציוד
            </p>
          </div>
        </div>

        {/* Quick Sample Selector Chips */}
        <div className="pt-2">
          <span className="text-xs font-bold text-slate-700 block mb-2">
            התנסה בלחיצה אחת על הודעות לדוגמה:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TEACHER_MESSAGES.map((sample, idx) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  idx === 0
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs'
                    : 'bg-slate-100 hover:bg-indigo-50 hover:border-indigo-300 border-slate-200 text-slate-800'
                }`}
              >
                <span>{idx === 0 ? '⭐ הודעת אנגלית (כיתה י׳)' : `📝 ${sample.title.substring(0, 28)}...`}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input & Output Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Box */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">הדבק הודעה מקורית של המורה:</label>
              <div className="flex items-center gap-2">
                {inputText.trim() && (
                  <button
                    onClick={handleSpeakOriginal}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    title="הקרא את ההודעה המקורית"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>הקרא מקור</span>
                  </button>
                )}
                <button
                  onClick={() => setInputText('')}
                  className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                >
                  נקה טקסט
                </button>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="הדבק כאן הודעה ארוכה מהמשו״ב, ווטסאפ או מייל..."
              className="w-full h-64 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-500 font-sans"
            />

            <div>
              <label className="text-[11px] font-bold text-slate-500 mb-1 block">שולח / מורה:</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="לדוגמה: שרה לוי (מורה לאנגלית)"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
              />
            </div>
          </div>

          <button
            onClick={() => handleSummarize()}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>מזקק ומפשט ב-MindMate AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>פשט וסכם לי את ההודעה ✨</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Box */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 min-h-[420px]">
          {simplifiedResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 text-right"
            >
              {/* Top Highlight Banner with Bottom Line */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    השורה התחתונה במדויק:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSpeakSummary('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                        isSpeaking
                          ? 'bg-rose-500 text-white ring-2 ring-rose-300 animate-pulse'
                          : 'bg-white text-indigo-950 hover:bg-indigo-50'
                      }`}
                      title="הקראה קולית מלאה של הסיכום"
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
                      <span>{isSpeaking ? 'עצור הקראה' : '🔊 הקרא הכל'}</span>
                    </button>
                    <span className="text-[10px] text-indigo-100 font-medium hidden sm:inline">
                      נשלח ע״י {simplifiedResult.sender}
                    </span>
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-extrabold leading-snug">
                  {simplifiedResult.bottomLine}
                </h3>
              </div>

              {/* Quick Audio Target Selector Bar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs">
                <span className="text-[11px] font-extrabold text-indigo-900 flex items-center gap-1 shrink-0 ml-1">
                  <span>🗣️</span>
                  <span>הקראה ממוקדת:</span>
                </span>
                <button
                  onClick={() => handleSpeakSummary('bottomLine')}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-100 text-indigo-900 font-bold border border-indigo-200 shadow-2xs transition-colors cursor-pointer text-[11px]"
                >
                  🎯 שורה תחתונה
                </button>
                {simplifiedResult.requiredEquipment.length > 0 && (
                  <button
                    onClick={() => handleSpeakSummary('equipment')}
                    className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 shadow-2xs transition-colors cursor-pointer text-[11px]"
                  >
                    🎒 ציוד חובה ({simplifiedResult.requiredEquipment.length})
                  </button>
                )}
                {simplifiedResult.actionItems.length > 0 && (
                  <button
                    onClick={() => handleSpeakSummary('actions')}
                    className="px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold border border-emerald-300 shadow-2xs transition-colors cursor-pointer text-[11px]"
                  >
                    ✅ משימות ({simplifiedResult.actionItems.length})
                  </button>
                )}
              </div>

              {/* Critical Dates & Times */}
              {simplifiedResult.importantDates.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-indigo-950 bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-extrabold">מועדים ושעות חשובות:</span>
                  <div className="flex flex-wrap gap-1.5 mr-1">
                    {simplifiedResult.importantDates.map((d, i) => (
                      <span key={i} className="font-bold bg-white px-2 py-0.5 rounded-lg border border-indigo-100 shadow-2xs">
                        ⏱️ {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Bullet Points */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  עיקרי הדברים בנקודות קצרות:
                </h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {simplifiedResult.keyPoints.map((point, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 flex items-start gap-2.5 shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs font-extrabold">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Equipment Mentioned */}
              {simplifiedResult.requiredEquipment.length > 0 && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-700" />
                      ציוד חובה להביא בתיק:
                    </h4>
                    {onAddEquipmentToBag && (
                      <button
                        onClick={() => {
                          onAddEquipmentToBag(simplifiedResult.requiredEquipment);
                          audioSynth.playSuccessBeep();
                          alert('פריטי הציוד התווספו בהצלחה למארגן הציוד בתיק!');
                        }}
                        className="text-[11px] text-amber-900 hover:text-amber-950 font-extrabold bg-amber-200/80 hover:bg-amber-200 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> הוסף לרשימת הציוד שלי
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {simplifiedResult.requiredEquipment.map((eq, i) => (
                      <span
                        key={i}
                        className="bg-white border border-amber-300 text-amber-950 text-xs px-3 py-1.5 rounded-xl font-bold shadow-2xs flex items-center gap-1"
                      >
                        <span>🎒</span>
                        <span>{eq}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items with checkboxes */}
              {simplifiedResult.actionItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    משימות מעשיות לביצוע (סמן ב-V כשסיימת):
                  </h4>
                  <div className="space-y-1.5">
                    {simplifiedResult.actionItems.map((item) => {
                      const isDone = Boolean(completedActions[item.id]);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleAction(item.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs select-none ${
                            isDone
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 line-through opacity-80'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isDone ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="font-bold">{item.text}</span>
                          </div>
                          {item.deadline && (
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-bold shrink-0">
                              עד: {item.deadline}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Copy action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCopySummary}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'הועתק ללוח!' : 'העתק סיכום'}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-base">
                הסיכום התמציתי והמזוקק יופיע כאן
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                בחר הודעה מהדוגמאות למעלה (כולל הודעת האנגלית לכיתה י׳) או הדבק הודעה מהמורה ולחץ על ״פשט וסכם לי את ההודעה״.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
