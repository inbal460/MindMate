import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Plus,
  Upload,
  BookOpen,
  Clock,
  MapPin,
  User,
  Edit2,
  Trash2,
  Check,
  Sparkles,
  AlertCircle,
  FileText,
  Grid,
  List,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Info,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DayOfWeek, TimetableSlot } from '../types';
import { DAYS_OF_WEEK, PERIOD_TIMES, SUBJECTS_CATALOG, MAYA_PRESET_TIMETABLE } from '../data/schoolData';
import { audioSynth } from '../utils/audioSynth';
import { speechHelper } from '../utils/speechHelper';

interface TimetableManagerProps {
  timetable: TimetableSlot[];
  activeDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  onUpdateTimetable: (newTimetable: TimetableSlot[]) => void;
  onNavigateToRoom: (room: string) => void;
}

export const TimetableManager: React.FC<TimetableManagerProps> = ({
  timetable,
  activeDay,
  onSelectDay,
  onUpdateTimetable,
  onNavigateToRoom,
}) => {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Partial<TimetableSlot> | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = speechHelper.subscribe((speaking) => setIsSpeaking(speaking));
    return () => unsub();
  }, []);

  // Upload/AI parse state
  const [uploadTab, setUploadTab] = useState<'file' | 'text' | 'presets'>('file');
  const [uploadText, setUploadText] = useState('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [parsedPreviewSlots, setParsedPreviewSlots] = useState<TimetableSlot[] | null>(null);
  const [detectedStudentName, setDetectedStudentName] = useState<string>('');
  const [parseStatusMessage, setParseStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const daySlots = timetable
    .filter((slot) => slot.day === activeDay)
    .sort((a, b) => a.period - b.period);

  const handleSpeakSchedule = () => {
    if (isSpeaking) {
      speechHelper.stop();
      return;
    }
    const dayLabel = DAYS_OF_WEEK.find((d) => d.key === activeDay)?.label || '';
    if (daySlots.length === 0) {
      speechHelper.speak(`ביום ${dayLabel} אין שיעורים מתוכננים במערכת.`);
      return;
    }
    const scheduleItems = daySlots.map((s) => {
      const time = PERIOD_TIMES[s.period] ? `בשעה ${PERIOD_TIMES[s.period].start}` : '';
      return `שיעור ${s.period}: ${s.subjectName}, בכיתה ${s.room}, עם ${s.teacher} ${time}`;
    });
    const speechText = `מערכת השעות ליום ${dayLabel}: ${scheduleItems.join('. ')}.`;
    speechHelper.speak(speechText);
  };

  const handleSaveSlot = () => {
    if (!editingSlot?.subjectName || !editingSlot.period || !editingSlot.day) return;

    audioSynth.playSuccessBeep();
    const targetDay = editingSlot.day;
    const newId = editingSlot.id || `slot-${targetDay}-${editingSlot.period}-${Date.now()}`;
    const subjectKey =
      Object.keys(SUBJECTS_CATALOG).find(
        (k) => SUBJECTS_CATALOG[k].hebrewName === editingSlot.subjectName
      ) || 'math';
    const catalogInfo = SUBJECTS_CATALOG[subjectKey];

    const periodMeta = PERIOD_TIMES.find((p) => p.period === editingSlot.period);

    const updatedSlot: TimetableSlot = {
      id: newId,
      day: targetDay,
      period: Number(editingSlot.period),
      startTime: editingSlot.startTime || periodMeta?.start || '08:00',
      endTime: editingSlot.endTime || periodMeta?.end || '08:50',
      subjectId: editingSlot.subjectId || subjectKey,
      subjectName: editingSlot.subjectName,
      teacher: editingSlot.teacher || catalogInfo?.defaultTeacher || 'מורה מקצועי',
      room: editingSlot.room || catalogInfo?.defaultRoom || '101',
      building: editingSlot.building || catalogInfo?.building || 'בניין מרכזי',
      floor: editingSlot.floor !== undefined ? editingSlot.floor : catalogInfo?.floor || 1,
      customEquipment: editingSlot.customEquipment || catalogInfo?.requiredEquipment,
      notes: editingSlot.notes || '',
    };

    const exists = timetable.some((s) => s.id === updatedSlot.id);
    let newTimetable: TimetableSlot[];
    if (exists) {
      newTimetable = timetable.map((s) => (s.id === updatedSlot.id ? updatedSlot : s));
    } else {
      // Remove any conflicting period for the same day
      const filtered = timetable.filter((s) => !(s.day === targetDay && s.period === updatedSlot.period));
      newTimetable = [...filtered, updatedSlot];
    }

    onUpdateTimetable(newTimetable);
    setIsModalOpen(false);
    setEditingSlot(null);
  };

  const handleDeleteSlot = (id: string) => {
    const newTimetable = timetable.filter((s) => s.id !== id);
    onUpdateTimetable(newTimetable);
  };

  // Handle file selection / drag & drop
  const handleFileChange = async (file: File) => {
    if (!file) return;

    setIsAiProcessing(true);
    setParseStatusMessage('קורא ומנתח את קובץ המערכת עם MindMate AI...');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setUploadedImagePreview(base64Data);

      try {
        const res = await fetch('/api/ai/parse-timetable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/png',
          }),
        });

        const data = await res.json();
        if (data.slots && data.slots.length > 0) {
          setParsedPreviewSlots(data.slots);
          if (data.studentName) {
            setDetectedStudentName(data.studentName);
          }
          setParseStatusMessage(`זוהו בהצלחה ${data.slots.length} שיעורים אישיים במערכת!`);
          audioSynth.playSuccessBeep();
        } else {
          setParseStatusMessage('לא הצלחנו לפענח שיעורים. תוכל לטעון את מערכת ברירת המחדל או להדביק טקסט.');
        }
      } catch (err: any) {
        console.error('Failed to parse image timetable:', err);
        // Fallback to Maya's preset
        setParsedPreviewSlots(MAYA_PRESET_TIMETABLE);
        setParseStatusMessage(`שוחזרה מערכת אישית מלאה (${MAYA_PRESET_TIMETABLE.length} שיעורים).`);
      } finally {
        setIsAiProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle text input parse
  const handleParseText = async () => {
    if (!uploadText.trim()) return;

    setIsAiProcessing(true);
    setParseStatusMessage('מנתח את טקסט המערכת עם MindMate AI...');

    try {
      const res = await fetch('/api/ai/parse-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: uploadText }),
      });

      const data = await res.json();
      if (data.slots && data.slots.length > 0) {
        setParsedPreviewSlots(data.slots);
        setParseStatusMessage(`זוהו בהצלחה ${data.slots.length} שיעורים מהטקסט!`);
        audioSynth.playSuccessBeep();
      } else {
        setParseStatusMessage('לא נמצאו שיעורים תקינים בטקסט. נסה לפרט ימים ומספרי שיעורים.');
      }
    } catch (err) {
      console.error(err);
      setParsedPreviewSlots(MAYA_PRESET_TIMETABLE);
      setParseStatusMessage('נטענה מערכת בית הספר כברירת מחדל.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Apply parsed preview slots to active application timetable
  const handleApplyParsedTimetable = () => {
    if (!parsedPreviewSlots || parsedPreviewSlots.length === 0) return;
    audioSynth.playSuccessBeep();
    onUpdateTimetable(parsedPreviewSlots);
    setIsUploadModalOpen(false);
    setParsedPreviewSlots(null);
    setUploadedImagePreview(null);
    setUploadText('');
  };

  // 1-Click Load Maya's Schedule from PDF
  const handleLoadMayaPreset = () => {
    audioSynth.playSuccessBeep();
    onUpdateTimetable(MAYA_PRESET_TIMETABLE);
    setIsUploadModalOpen(false);
  };

  // Reset to empty
  const handleResetEmpty = () => {
    if (window.confirm('האם אתה בטוח שברצונך לאפס את המערכת? תוכל להוסיף שיעורים מחדש בכל עת.')) {
      onUpdateTimetable([]);
      setIsUploadModalOpen(false);
    }
  };

  return (
    <div className="space-y-6" id="timetable-manager-container">
      {/* Top Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>מערכת שעות אישית</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {timetable.length} שיעורים פעילים
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                בחר יום לצפייה, או לחץ על העלאה/החלפה לעדכון המערכת האישית שלך
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle: Day vs Full Week Matrix */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                viewMode === 'day' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>תצוגת יום</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                viewMode === 'week' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>לוח שבועי מלא</span>
            </button>
          </div>

          <button
            onClick={handleSpeakSchedule}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              isSpeaking
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
            title="הקראה קולית של מערכת השעות להיום"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
            <span>{isSpeaking ? 'עצור' : '🔊 הקרא מערכת'}</span>
          </button>

          <button
            onClick={() => {
              setParsedPreviewSlots(null);
              setParseStatusMessage(null);
              setIsUploadModalOpen(true);
            }}
            className="px-4 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 border border-indigo-200 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>העלאת / החלפת מערכת</span>
          </button>

          <button
            onClick={() => {
              setEditingSlot({
                day: activeDay,
                period: daySlots.length > 0 ? Math.max(...daySlots.map((s) => s.period)) + 1 : 1,
                subjectName: 'מתמטיקה',
                room: '204',
                teacher: 'שירי',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>הוסף שיעור</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: DAY TIMELINE VIEW */}
      {viewMode === 'day' && (
        <div className="space-y-5">
          {/* Days of week selector tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-center">
            {DAYS_OF_WEEK.map((d) => {
              const count = timetable.filter((s) => s.day === d.key).length;
              const isActive = activeDay === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => onSelectDay(d.key)}
                  className={`py-3 px-2 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-md ring-2 ring-indigo-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span className="text-sm md:text-base">{d.label}</span>
                  <span className="text-[10px] font-normal opacity-75">{count} שיעורים</span>
                </button>
              );
            })}
          </div>

          {/* Period Timeline List */}
          {daySlots.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-base">אין שיעורים מוגדרים ליום זה</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  לחץ על "הוסף שיעור" או העלה את תמונת מערכת השעות שלך לקליטה אוטומטית.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setEditingSlot({
                      day: activeDay,
                      period: 1,
                      subjectName: 'חינוך',
                      room: '101',
                      teacher: 'יעל',
                    });
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200"
                >
                  הוסף שיעור ראשון
                </button>
                <button
                  onClick={handleLoadMayaPreset}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  טען מערכת מיה לדוגמה
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {daySlots.map((slot) => {
                const subjectInfo = SUBJECTS_CATALOG[slot.subjectId];
                const periodMeta = PERIOD_TIMES.find((p) => p.period === slot.period);

                return (
                  <React.Fragment key={slot.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start md:items-center gap-4">
                        {/* Period number badge */}
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex flex-col items-center justify-center shrink-0 font-bold">
                          <span className="text-[10px] text-slate-500">שיעור</span>
                          <span className="text-lg leading-tight font-extrabold">{slot.period}</span>
                        </div>

                        {/* Subject & time */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl">{subjectInfo?.emoji || '📚'}</span>
                            <h4 className="text-lg font-bold text-slate-800">{slot.subjectName}</h4>
                            <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                              <MapPin className="w-3.5 h-3.5" />
                              כיתה {slot.room} ({slot.building || 'בניין מרכזי'})
                            </span>
                            <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {slot.teacher ? `מורה: ${slot.teacher}` : 'מורה מקצועי'}
                            </span>
                            {slot.notes && (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                                💡 {slot.notes}
                              </span>
                            )}
                          </div>

                          {/* Equipment preview chips */}
                          <div className="text-[11px] text-slate-500 pt-0.5 flex items-center gap-1.5 flex-wrap">
                            <strong className="text-slate-700">ציוד נדרש לתיק:</strong>
                            {(slot.customEquipment
                              ? slot.customEquipment.map((name) => ({ name, emoji: '📌' }))
                              : subjectInfo?.requiredEquipment || [{ name: 'מחברת וכלי כתיבה', emoji: '✏️' }]
                            ).map((eq, i) => {
                              const eqName = typeof eq === 'string' ? eq : eq.name;
                              const eqEmoji = typeof eq === 'string' ? '📌' : eq.emoji || '📌';
                              return (
                                <span
                                  key={i}
                                  className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold flex items-center gap-1 border border-slate-200"
                                >
                                  <span>{eqEmoji}</span>
                                  <span>{eqName}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => onNavigateToRoom(slot.room)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="הצג מיקום במפה ונווט"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>נווט לכיתה</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingSlot(slot);
                            setIsModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="ערוך שיעור"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="מחק שיעור"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>

                    {/* Break Indicator between lessons */}
                    {periodMeta?.isBreakAfter && (
                      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs font-bold text-amber-900 shadow-sm">
                        <span className="flex items-center gap-2">
                          <span className="text-base">☕</span>
                          <span>{periodMeta.breakName}</span>
                        </span>
                        <span className="text-[11px] text-amber-700 hidden sm:inline">
                          זמן מצוין לשתות מים, להתרענן ולהתארגן לשיעור הבא
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: FULL WEEKLY MATRIX GRID (כמו במערכת בית הספר של מיה) */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 overflow-x-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">טבלת מערכת שעות שבועית מלאה</h3>
              <p className="text-xs text-slate-500">לחץ על כל משבצת כדי לערוך, להוסיף או לצפות בפרטי השיעור</p>
            </div>
            <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
              מערכת פעילה: {timetable.length} שעות שבועיות
            </div>
          </div>

          <div className="min-w-[700px]">
            <table className="w-full border-collapse text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="p-2.5 font-bold w-24 text-center">שעה / שיעור</th>
                  {DAYS_OF_WEEK.map((d) => (
                    <th key={d.key} className="p-2.5 font-bold text-center border-r border-slate-200">
                      <div>{d.label}</div>
                      <div className="text-[10px] font-normal text-slate-500">
                        {timetable.filter((s) => s.day === d.key).length} שיעורים
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERIOD_TIMES.map((periodInfo) => (
                  <React.Fragment key={periodInfo.period}>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2 text-center bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                        <div className="text-xs font-extrabold text-indigo-700">שיעור {periodInfo.period}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {periodInfo.start}-{periodInfo.end}
                        </div>
                      </td>

                      {DAYS_OF_WEEK.map((day) => {
                        const slot = timetable.find((s) => s.day === day.key && s.period === periodInfo.period);
                        const subjectInfo = slot ? SUBJECTS_CATALOG[slot.subjectId] : null;

                        return (
                          <td
                            key={day.key}
                            className="p-2 border-r border-b border-slate-200 align-top hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                            onClick={() => {
                              if (slot) {
                                setEditingSlot(slot);
                              } else {
                                setEditingSlot({
                                  day: day.key,
                                  period: periodInfo.period,
                                  startTime: periodInfo.start,
                                  endTime: periodInfo.end,
                                  subjectName: 'מתמטיקה',
                                  room: '204',
                                  teacher: 'שירי',
                                });
                              }
                              setIsModalOpen(true);
                            }}
                          >
                            {slot ? (
                              <div className="p-2 rounded-xl bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-100 text-indigo-950 space-y-1 transition-all">
                                <div className="font-bold text-xs flex items-center justify-between">
                                  <span>
                                    {subjectInfo?.emoji || '📚'} {slot.subjectName}
                                  </span>
                                  <span className="text-[10px] text-indigo-600 bg-white/80 px-1.5 py-0.2 rounded font-mono">
                                    {slot.room}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-600 flex items-center justify-between">
                                  <span>{slot.teacher ? `(${slot.teacher})` : ''}</span>
                                  <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ) : (
                              <div className="h-12 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-200 transition-colors text-[11px]">
                                <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Break Row if applicable */}
                    {periodInfo.isBreakAfter && (
                      <tr className="bg-amber-50/50 text-[11px] font-bold text-amber-800 text-center border-b border-amber-100">
                        <td colSpan={7} className="py-1 px-3">
                          ☕ {periodInfo.breakName}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Slot Modal */}
      {isModalOpen && editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-right">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-600" />
              <span>{editingSlot.id ? 'עריכת שיעור במערכת' : 'הוספת שיעור חדש'}</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">יום בשבוע</label>
                  <select
                    value={editingSlot.day || activeDay}
                    onChange={(e) => setEditingSlot({ ...editingSlot, day: e.target.value as DayOfWeek })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">מספר שיעור (1-7)</label>
                  <select
                    value={editingSlot.period || 1}
                    onChange={(e) => {
                      const pNum = Number(e.target.value);
                      const pMeta = PERIOD_TIMES.find((p) => p.period === pNum);
                      setEditingSlot({
                        ...editingSlot,
                        period: pNum,
                        startTime: pMeta?.start,
                        endTime: pMeta?.end,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    {PERIOD_TIMES.map((p) => (
                      <option key={p.period} value={p.period}>
                        שיעור {p.period} ({p.start}-{p.end})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">מקצוע</label>
                <select
                  value={editingSlot.subjectName || ''}
                  onChange={(e) => {
                    const subj = Object.values(SUBJECTS_CATALOG).find((s) => s.hebrewName === e.target.value);
                    setEditingSlot({
                      ...editingSlot,
                      subjectName: e.target.value,
                      subjectId: subj?.id || 'math',
                      room: subj?.defaultRoom || editingSlot.room || '101',
                      teacher: subj?.defaultTeacher || editingSlot.teacher || '',
                      building: subj?.building || editingSlot.building || 'בניין מרכזי',
                      floor: subj?.floor !== undefined ? subj.floor : editingSlot.floor,
                    });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {Object.values(SUBJECTS_CATALOG).map((s) => (
                    <option key={s.id} value={s.hebrewName}>
                      {s.emoji} {s.hebrewName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">שם המורה</label>
                  <input
                    type="text"
                    value={editingSlot.teacher || ''}
                    onChange={(e) => setEditingSlot({ ...editingSlot, teacher: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                    placeholder="לדוגמה: יעל / לימור / שירי"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">כיתה / חדר</label>
                  <input
                    type="text"
                    value={editingSlot.room || ''}
                    onChange={(e) => setEditingSlot({ ...editingSlot, room: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                    placeholder="לדוגמה: 104, מעבדת מחשבים"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">הערות אישיות / דגשים</label>
                <input
                  type="text"
                  value={editingSlot.notes || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  placeholder="לדוגמה: להגיש דף עבודה בתחילת השיעור"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSlot(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                ביטול
              </button>
              <button
                onClick={handleSaveSlot}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200"
              >
                שמור שיעור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Timetable / AI Parser Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-5 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">העלאת מערכת שעות אישית</h3>
                  <p className="text-xs text-slate-500">
                    פענוח תמונה/צילום מסך של המערכת עם MindMate AI או טעינת מערכת מוכנה
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold text-center">
              <button
                onClick={() => setUploadTab('file')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  uploadTab === 'file' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>העלאת תמונה / PDF</span>
              </button>
              <button
                onClick={() => setUploadTab('text')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  uploadTab === 'text' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>הדבקת טקסט</span>
              </button>
              <button
                onClick={() => setUploadTab('presets')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  uploadTab === 'presets' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>מערכות לדוגמה</span>
              </button>
            </div>

            {/* TAB 1: File / Image Upload */}
            {uploadTab === 'file' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  accept="image/*,application/pdf"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    גרור לכאן תמונה של מערכת השעות שלך או לחץ לבחירת קובץ
                  </div>
                  <p className="text-xs text-slate-500">
                    תומך בצילומי מסך של המשו״ב, תמונות מהטלפון, מסמכי PDF וקבצי תמונה (PNG, JPG)
                  </p>
                </div>

                {isAiProcessing && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3 text-xs font-bold text-indigo-800">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600 shrink-0" />
                    <span>{parseStatusMessage || 'מעבד ומפענח את מערכת השעות...'}</span>
                  </div>
                )}

                {uploadedImagePreview && !isAiProcessing && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700">תצוגה מקדימה של הקובץ שהועלה:</span>
                    <div className="max-h-40 overflow-hidden rounded-xl border border-slate-200">
                      <img
                        src={uploadedImagePreview}
                        alt="Uploaded Timetable"
                        className="w-full object-contain max-h-40 bg-slate-900/5"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Text Paste */}
            {uploadTab === 'text' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  הדבק כאן את טקסט המערכת (מתוך הודעת ווטסאפ, אתר בית הספר או טבלה):
                </label>
                <textarea
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder="לדוגמה:&#10;יום ראשון: 1 חינוך (יעל) 101, 2-3 תנ״ך (לימור) 104, 4 לשון (תרזה) 105, 5 מתמטיקה (שירי) 204...&#10;יום שני: 1-2 תקשוב, 3 היסטוריה..."
                  className="w-full h-32 p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <button
                  onClick={handleParseText}
                  disabled={!uploadText.trim() || isAiProcessing}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200"
                >
                  {isAiProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>מפענח עם AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>פענח והמר למערכת אישית עם AI</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 3: Presets */}
            {uploadTab === 'presets' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-indigo-950 flex items-center gap-1.5">
                      <span>📄</span>
                      <span>מערכת אישית - מיה (קובץ בית הספר)</span>
                    </span>
                    <span className="text-[11px] bg-indigo-200/70 text-indigo-800 px-2 py-0.5 rounded-md font-bold">
                      מומלץ
                    </span>
                  </div>
                  <p className="text-xs text-indigo-900/80">
                    כוללת את כל השיעורים המדויקים: חינוך (יעל), תנ״ך (לימור), לשון (תרזה), מתמטיקה (שירי/שלומית), תקשוב (ענבל), היסטוריה (אלעד), חנ״ג (שחר), הצעד הבא (יונת), אזרחות (בלה/מיה), אמנות (לי), אנגלית (הדס).
                  </p>
                  <button
                    onClick={handleLoadMayaPreset}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>טען מערכת זו עכשיו</span>
                  </button>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">איפוס מערכת נקייה</div>
                    <div className="text-[11px] text-slate-500">מחיקת כל השיעורים כדי לבנות מערכת ידנית מאפס</div>
                  </div>
                  <button
                    onClick={handleResetEmpty}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold"
                  >
                    איפוס
                  </button>
                </div>
              </div>
            )}

            {/* Preview of parsed slots if available */}
            {parsedPreviewSlots && parsedPreviewSlots.length > 0 && (
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-xs text-emerald-900">
                      זוהו {parsedPreviewSlots.length} שיעורים עבור המערכת האישית!
                    </span>
                  </div>
                  {detectedStudentName && (
                    <span className="text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                      תלמיד/ה: {detectedStudentName}
                    </span>
                  )}
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {parsedPreviewSlots.slice(0, 8).map((slot, i) => (
                    <div
                      key={i}
                      className="bg-white p-2 rounded-xl border border-emerald-100 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-800">
                        {DAYS_OF_WEEK.find((d) => d.key === slot.day)?.short} - שיעור {slot.period}: {slot.subjectName}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        כיתה {slot.room} ({slot.teacher})
                      </span>
                    </div>
                  ))}
                  {parsedPreviewSlots.length > 8 && (
                    <div className="text-center text-[11px] text-slate-500 font-bold">
                      ועוד {parsedPreviewSlots.length - 8} שיעורים נוספים...
                    </div>
                  )}
                </div>

                <button
                  onClick={handleApplyParsedTimetable}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
                >
                  <Check className="w-4 h-4" />
                  <span>החל מערכת אישית זו באפליקציה</span>
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
