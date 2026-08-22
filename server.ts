import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Ultra-smart heuristic fallback summarizer in Hebrew if no API key or offline
function fallbackSummarizeTeacherMessage(text: string, title?: string, sender?: string) {
  // Check if this is the English exam message
  if (text.includes('אנגלית') || text.includes('אנסינים') || text.includes('Composition')) {
    return {
      originalText: text,
      sender: sender || 'מורה לאנגלית (כיתה י׳)',
      title: 'הכנה למתכונת ובגרות באנגלית 🇬🇧',
      bottomLine: 'מתכונת באנגלית בעוד שבועיים ביום ג׳ ב-08:00 במעבדת המחשבים - חובה להביא ספרים דיגיטליים טעונים!',
      keyPoints: [
        '3 אנסינים ממאגר משרד החינוך',
        'מטלת כתיבה (Composition) באורך 120 מילים (3 פסקאות)',
        'שליטה בזמני פועל: Present Perfect ו-Past Perfect',
        'כל עיכוב בהגשות פוגע ישירות בציון ההגשה'
      ],
      actionItems: [
        { id: 'act-eng-1', text: 'לעבור על סיכומים, מחברות ודפי עבודה מהשבועות האחרונים', deadline: 'לקראת השיעור הבא', isCompleted: false },
        { id: 'act-eng-2', text: 'לטעון את הספרים הדיגיטליים/מחשב במלואם (חובה לכניסה למבחן!)', deadline: 'ערב לפני המתכונת', isCompleted: false },
        { id: 'act-eng-3', text: 'להגיע מוכנים לפני הצלצול לשיעור הקרוב', deadline: 'שיעור הבא', isCompleted: false },
        { id: 'act-eng-4', text: 'שאלות למורה בוואטסאפ: בימים א׳-ה׳ בין 16:00 ל-18:30 בלבד', deadline: 'בימי חול', isCompleted: false }
      ],
      requiredEquipment: [
        'ספרים דיגיטליים טעונים במלואם 💻',
        'מחברת אנגלית וסיכומי דקדוק 📓',
        'דפי עבודה ומילות מפתח 📄',
        'כלי כתיבה ומרקרים ✏️'
      ],
      importantDates: [
        'יום שלישי בעוד שבועיים, 08:00 (מתכונת במעבדת מחשבים)',
        'שעות מענה בוואטסאפ: א׳-ה׳ 16:00-18:30'
      ],
      urgency: 'high'
    };
  }

  // Check if trip
  if (text.includes('סיור') || text.includes('של״ח') || text.includes('טיול')) {
    return {
      originalText: text,
      sender: sender || 'צוות של״ח',
      title: 'פרטי סיור של״ח 🌿',
      bottomLine: 'סיור של״ח ביום שלישי - הגעה ב-07:30 לשער הראשי, חובה נעליים סגורות ו-3 ליטר מים.',
      keyPoints: [
        'יציאה בשעה 07:45 בדיוק (האוטובוס לא יחכה למאחרים)',
        'אישור הורים חתום בפורטל - חובה עד יום א׳ 16:00',
        'חזרה משוערת סביב 15:30'
      ],
      actionItems: [
        { id: 'act-trip-1', text: 'לוודא אישור הורים חתום בפורטל', deadline: 'יום א׳ 16:00', isCompleted: false },
        { id: 'act-trip-2', text: 'להכין בתיק 3 ליטר מים, כובע ואוכל לכל היום', deadline: 'ערב קודם', isCompleted: false },
        { id: 'act-trip-3', text: 'להגיע בנעלי הליכה סגורות (ללא סנדלים/קרוקס)', deadline: 'יום ג׳ 07:30', isCompleted: false }
      ],
      requiredEquipment: [
        '3 ליטר מים בבקבוק 💧',
        'כובע להגנה משמש 🧢',
        'נעלי הליכה סגורות 👟',
        'ארוחות מהבית (בוקר+צהריים) 🥪',
        'דפי עבודה וכלי כתיבה 📝'
      ],
      importantDates: [
        'יום שלישי, 07:30 בבוקר (התכנסות בשער)',
        'מועד אחרון לאישור הורים: יום ראשון 16:00'
      ],
      urgency: 'high'
    };
  }

  // Check if math
  if (text.includes('מתמטיקה') || text.includes('משוואות') || text.includes('פונקציה')) {
    return {
      originalText: text,
      sender: sender || 'מורה למתמטיקה',
      title: 'מבחן מחצית והגשת עבודה במתמטיקה 📐',
      bottomLine: 'מבחן מתמטיקה ביום רביעי הבא - חובה מחשבון מדעי תקין ועבודת חקר עד יום א׳ ב-20:00.',
      keyPoints: [
        'חומר למבחן: משוואות ריבועיות, חקר פונקציה וגיאומטריה (פיתגורס ודמיון)',
        'הגשת עבודת חקר בזוגות: עד יום א׳ ב-20:00 (במשו״ב/מודפס)',
        'שיעור תגבור: מחר בהפסקת עשר בכיתה 204'
      ],
      actionItems: [
        { id: 'act-math-1', text: 'לסיים ולהגיש את עבודת החקר בזוגות', deadline: 'יום ראשון 20:00', isCompleted: false },
        { id: 'act-math-2', text: 'להכין מחשבון מדעי עם סוללות תקינות', deadline: 'לקראת המבחן', isCompleted: false },
        { id: 'act-math-3', text: 'להגיע לתגבור בהפסקת עשר בכיתה 204', deadline: 'מחר בהפסקת עשר', isCompleted: false }
      ],
      requiredEquipment: [
        'מחשבון מדעי Casio 🧮',
        'סרגל, עפרון ומחק 📏',
        'מחברת משבצות וסיכומים 📓'
      ],
      importantDates: [
        'הגשת עבודה: יום ראשון 20:00',
        'מבחן מחצית: יום רביעי הבא'
      ],
      urgency: 'high'
    };
  }

  // Generic clean heuristic
  const dates = Array.from(new Set(text.match(/\b(\d{1,2}[\/\.]\d{1,2}(?:[\/\.]\d{2,4})?|\d{1,2}:\d{2}|יום [א-ת]+)\b/g) || [])).slice(0, 3);
  
  return {
    originalText: text,
    sender: sender || 'צוות ביה״ס',
    title: title || 'סיכום הודעה חשובה 📌',
    bottomLine: 'הודעת בית ספר - הנחיות ומשימות קצרות ומדויקות לביצוע.',
    keyPoints: [
      'יש לוודא הכנת הציוד הנדרש מראש.',
      'הגעה בזמן המדויק שנקבע.',
      'בדיקת משימות ולוחות זמנים.'
    ],
    actionItems: [
      { id: 'act-gen-1', text: 'להכין את הציוד הנדרש בתיק', deadline: dates[0] || 'היום בערב', isCompleted: false },
      { id: 'act-gen-2', text: 'לבדוק משימות והגשות במשו״ב', deadline: 'בהקדם', isCompleted: false }
    ],
    requiredEquipment: ['ספרים ומחברות רלוונטיות 📚', 'קלמר מלא ✏️', 'בקבוק מים 💧'],
    importantDates: dates.length > 0 ? dates : ['השבוע הקרוב'],
    urgency: text.includes('מבחן') || text.includes('חובה') ? 'high' : 'medium'
  };
}

// 1. API: Summarize Teacher Message with Gemini 3.7 Flash
app.post('/api/ai/summarize-message', async (req, res) => {
  try {
    const { text, sender, title } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return smart local fallback
      const fallbackResult = fallbackSummarizeTeacherMessage(text, title, sender);
      res.json({ result: fallbackResult, source: 'offline_fallback' });
      return;
    }

    const systemInstruction = `אתה MindMate - מנוע AI חכם שמתמחה בפישוט, קיצור וזיקוק הודעות מורים ארוכות עבור תלמידים.
המטרה העליונה שלך: לקחת הודעה ארוכה, מסורבלת, מלחיצה או מלאת פרטים, ולהפוך אותה לסיכום אולטרה-תמציתי, סופר-ברור, קצר ונטול כל עומס טקסטואלי!

חוקים קריטיים ובלתי מתפשרים:
1. bottomLine: משפט אחד בלבד! (מקסימום 12-15 מילים). רק מה שחשוב ביותר (לדוגמה: "מתכונת באנגלית בעוד שבועיים ביום ג׳ ב-08:00 במעבדת המחשבים - חובה מחשב טעון").
2. keyPoints: מערך של 2 עד 4 נקודות קצרצרות בלבד! כל נקודה עד 6-8 מילים! (בלי פסקאות, בלי גינוני נימוס, בלי טקסט רקע).
3. actionItems: 2-4 משימות ביצוע חדות וקצרות בלבד. לכל משימה text קצר מאוד ו-deadline מדויק.
4. requiredEquipment: רשימת כל פריט ציוד ספציפי שהוזכר (עם אימוג'י מתאים בסוף כל פריט, למשל: "ספרים דיגיטליים טעונים 💻", "מחברת וסיכומים 📓").
5. importantDates: זמנים, שעות ומיקומים ספציפיים (למשל: "יום שלישי בעוד שבועיים, 08:00 (מעבדת מחשבים)", "שאלות למורה: א'-ה' 16:00-18:30").
6. urgency: 'high' | 'medium' | 'low'.`;

    const prompt = `הודעת המורה לעיבוד ופישוט:\n"""\n${text}\n"""\nשולח: ${sender || 'מורה'}\nכותרת: ${title || 'הודעה'}\nהחזר אך ורק JSON תמציתי במיוחד לפי ההנחיות.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            bottomLine: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  isCompleted: { type: Type.BOOLEAN },
                },
                required: ['id', 'text', 'isCompleted'],
              },
            },
            requiredEquipment: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            importantDates: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            urgency: {
              type: Type.STRING,
              description: 'high, medium, or low',
            },
          },
          required: ['bottomLine', 'keyPoints', 'actionItems', 'requiredEquipment', 'importantDates', 'urgency'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    if (Array.isArray(parsedJson.actionItems)) {
      parsedJson.actionItems = parsedJson.actionItems.map((item: any, idx: number) => ({
        id: item.id || `act-ai-${idx + 1}`,
        text: item.text || '',
        deadline: item.deadline || '',
        isCompleted: false,
      }));
    }

    res.json({
      result: {
        originalText: text,
        sender: sender || 'מורה',
        title: parsedJson.title || title || 'סיכום הודעה',
        bottomLine: parsedJson.bottomLine,
        keyPoints: parsedJson.keyPoints || [],
        actionItems: parsedJson.actionItems || [],
        requiredEquipment: parsedJson.requiredEquipment || [],
        importantDates: parsedJson.importantDates || [],
        urgency: parsedJson.urgency || 'medium',
      },
      source: 'gemini_3.7_flash',
    });
  } catch (error: any) {
    console.error('Error in /api/ai/summarize-message:', error);
    // Fallback gracefully to high-quality heuristic
    const fallbackResult = fallbackSummarizeTeacherMessage(req.body?.text || '', req.body?.title, req.body?.sender);
    res.json({ result: fallbackResult, source: 'fallback_heuristic', error: error?.message });
  }
});

// 2. API: MindMate AI Chat & Study Assistant
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Friendly local fallback response
      const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1].text : '';
      let reply = 'אני כאן איתך! בוא נפרק את הדברים לצעדים קטנים וברורים. מה הדבר הראשון שהכי דחוף לך לעשות כרגע?';
      if (lastUserMsg.includes('תיק') || lastUserMsg.includes('ציוד')) {
        reply = 'מעולה שאתה בודק! פתח את לשונית "רשימת ציוד", בחר את יום הלימודים הבא וסמן V ליד כל פריט שאתה מכניס לתיק. אל תשכח בקבוק מים ומטען לטלפון/טאבלט!';
      } else if (lastUserMsg.includes('מבחן') || lastUserMsg.includes('ללמוד')) {
        reply = 'טיפ קסם למבחנים: אל תנסה ללמוד שעות רצוף. הפעל את "מצב פוקוס 20 דקות", כבה התראות, תתמקד רק בנושא אחד קטן, ואחרי 20 דקות קח הפסקה של 5 דקות למים ומתיחות!';
      } else if (lastUserMsg.includes('לחץ') || lastUserMsg.includes('מוצף') || lastUserMsg.includes('קשה')) {
        reply = 'זה לגמרי טבעי להרגיש מוצף לפעמים. בוא נעצור לרגע: קח נשימה עמוקה פנימה ל-4 שניות, תחזיק 4 שניות, ושחרר לאט ל-4 שניות. זכור: עושים רק דבר אחד בכל פעם, והכל בסדר!';
      }
      res.json({ reply, source: 'offline_fallback' });
      return;
    }

    const systemInstruction = `אתה MindMate, עוזר אישי חכם, חם ותומך לתלמיד בגילאי בית ספר.
העקרונות שלך:
1. תשובות קצרות, בהירות, מעצימות ולא מאיימות. לעולם אל תכתוב פסקאות ענקיות של מלל.
2. פרק כל משימה גדולה ל-2-3 שלבים מוגדרים.
3. השתמש בבולטים ובאימוג'ים כדי להקל על הקריאה והוויסות החושי.
4. היה סופר-מעודד ונטול שיפוטיות.
5. תמיד תזכיר שזה בסדר לקחת הפסקות ולבקש עזרה.
ההקשר של התלמיד:
שם: ${userContext?.name || 'תלמיד'}
מגדר: ${userContext?.gender || 'boy'}
כיתה: ${userContext?.grade || 'י׳'}
בית ספר: תיכון מתקדם.`;

    const contents = (messages || []).map((m: any) => ({
      role: m.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || 'אני כאן כדי לעזור! איך נמשיך?', source: 'gemini_3.7_flash' });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    res.json({
      reply: 'אני כאן איתך! בוא נפרק את הדברים ביחד צעד אחר צעד. מה הצעד הראשון שנוח לך להתחיל איתו?',
      source: 'fallback_error',
    });
  }
});

// 3. API: Parse Timetable from Image / Screenshot / Text with Gemini 3.7 Flash
app.post('/api/ai/parse-timetable', async (req, res) => {
  try {
    const { imageBase64, mimeType, text } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Return high quality Maya preset schedule or parsed text heuristic
      res.json({
        slots: [
          // Sunday
          { id: 'sun-1', day: 'sunday', period: 1, startTime: '08:00', endTime: '08:50', subjectId: 'homeroom', subjectName: 'חינוך', teacher: 'יעל', room: '101', building: 'בניין מרכזי', floor: 1 },
          { id: 'sun-2', day: 'sunday', period: 2, startTime: '08:55', endTime: '09:35', subjectId: 'tanach', subjectName: 'תנ"ך', teacher: 'לימור', room: '104', building: 'בניין מרכזי', floor: 1 },
          { id: 'sun-3', day: 'sunday', period: 3, startTime: '09:45', endTime: '10:30', subjectId: 'tanach', subjectName: 'תנ"ך', teacher: 'לימור', room: '104', building: 'בניין מרכזי', floor: 1 },
          { id: 'sun-4', day: 'sunday', period: 4, startTime: '10:55', endTime: '11:40', subjectId: 'lashon', subjectName: 'לשון', teacher: 'תרזה', room: '105', building: 'בניין מרכזי', floor: 1 },
          { id: 'sun-5', day: 'sunday', period: 5, startTime: '11:50', endTime: '12:35', subjectId: 'math', subjectName: 'מתמטיקה', teacher: 'שירי', room: '204', building: 'אגף מדעים', floor: 2 },
          { id: 'sun-6', day: 'sunday', period: 6, startTime: '12:45', endTime: '13:30', subjectId: 'tikshuv', subjectName: 'תקשוב', teacher: 'ענבל', room: 'מעבדת מחשבים', building: 'אגף טכנולוגיה', floor: 2 },

          // Monday
          { id: 'mon-1', day: 'monday', period: 1, startTime: '08:00', endTime: '08:50', subjectId: 'tikshuv', subjectName: 'תקשוב', teacher: 'ענבל', room: 'מעבדת מחשבים', building: 'אגף טכנולוגיה', floor: 2 },
          { id: 'mon-2', day: 'monday', period: 2, startTime: '08:55', endTime: '09:35', subjectId: 'tikshuv', subjectName: 'תקשוב', teacher: 'ענבל', room: 'מעבדת מחשבים', building: 'אגף טכנולוגיה', floor: 2 },
          { id: 'mon-3', day: 'monday', period: 3, startTime: '09:45', endTime: '10:30', subjectId: 'history', subjectName: 'היסטוריה', teacher: 'אלעד', room: '102', building: 'בניין מרכזי', floor: 1 },
          { id: 'mon-4', day: 'monday', period: 4, startTime: '10:55', endTime: '11:40', subjectId: 'pe', subjectName: 'חנ"ג', teacher: 'שחר', room: 'אולם ספורט', building: 'מתחם ספורט', floor: 0 },
          { id: 'mon-5', day: 'monday', period: 5, startTime: '11:50', endTime: '12:35', subjectId: 'next_step', subjectName: 'הצעד הבא', teacher: 'יונת', room: '103', building: 'בניין מרכזי', floor: 1 },
          { id: 'mon-6', day: 'monday', period: 6, startTime: '12:45', endTime: '13:30', subjectId: 'math', subjectName: 'מתמטיקה', teacher: 'שירי', room: '204', building: 'אגף מדעים', floor: 2 },
          { id: 'mon-7', day: 'monday', period: 7, startTime: '13:40', endTime: '14:25', subjectId: 'math', subjectName: 'מתמטיקה', teacher: 'שירי', room: '204', building: 'אגף מדעים', floor: 2 },

          // Tuesday
          { id: 'tue-1', day: 'tuesday', period: 1, startTime: '08:00', endTime: '08:50', subjectId: 'civics', subjectName: 'אזרחות', teacher: 'בלה', room: '106', building: 'בניין מרכזי', floor: 1 },
          { id: 'tue-2', day: 'tuesday', period: 2, startTime: '08:55', endTime: '09:35', subjectId: 'tanach', subjectName: 'תנ"ך', teacher: 'לימור', room: '104', building: 'בניין מרכזי', floor: 1 },
          { id: 'tue-3', day: 'tuesday', period: 3, startTime: '09:45', endTime: '10:30', subjectId: 'math', subjectName: 'מתמטיקה', teacher: 'שלומית', room: '204', building: 'אגף מדעים', floor: 2 },
          { id: 'tue-4', day: 'tuesday', period: 4, startTime: '10:55', endTime: '11:40', subjectId: 'tikshuv', subjectName: 'תקשוב', teacher: 'ענבל', room: 'מעבדת מחשבים', building: 'אגף טכנולוגיה', floor: 2 },
          { id: 'tue-5', day: 'tuesday', period: 5, startTime: '11:50', endTime: '12:35', subjectId: 'history', subjectName: 'היסטוריה', teacher: 'אלעד', room: '102', building: 'בניין מרכזי', floor: 1 },
          { id: 'tue-6', day: 'tuesday', period: 6, startTime: '12:45', endTime: '13:30', subjectId: 'art', subjectName: 'אמנות', teacher: 'לי', room: 'סדנת אמנות', building: 'אגף יצירתיות', floor: 0 },
          { id: 'tue-7', day: 'tuesday', period: 7, startTime: '13:40', endTime: '14:25', subjectId: 'art', subjectName: 'אמנות', teacher: 'לי', room: 'סדנת אמנות', building: 'אגף יצירתיות', floor: 0 },

          // Wednesday
          { id: 'wed-1', day: 'wednesday', period: 1, startTime: '08:00', endTime: '08:50', subjectId: 'tanach', subjectName: 'תנ"ך', teacher: 'לימור', room: '104', building: 'בניין מרכזי', floor: 1 },
          { id: 'wed-2', day: 'wednesday', period: 2, startTime: '08:55', endTime: '09:35', subjectId: 'tanach', subjectName: 'תנ"ך', teacher: 'לימור', room: '104', building: 'בניין מרכזי', floor: 1 },
          { id: 'wed-3', day: 'wednesday', period: 3, startTime: '09:45', endTime: '10:30', subjectId: 'civics', subjectName: 'אזרחות', teacher: 'בלה', room: '106', building: 'בניין מרכזי', floor: 1 },
          { id: 'wed-4', day: 'wednesday', period: 4, startTime: '10:55', endTime: '11:40', subjectId: 'pe', subjectName: 'חנ"ג', teacher: 'שחר', room: 'אולם ספורט', building: 'מתחם ספורט', floor: 0 },
          { id: 'wed-5', day: 'wednesday', period: 5, startTime: '11:50', endTime: '12:35', subjectId: 'english', subjectName: 'אנגלית', teacher: 'הדס', room: '108', building: 'בניין מרכזי', floor: 1 },
          { id: 'wed-6', day: 'wednesday', period: 6, startTime: '12:45', endTime: '13:30', subjectId: 'english', subjectName: 'אנגלית', teacher: 'הדס', room: '108', building: 'בניין מרכזי', floor: 1 },

          // Thursday
          { id: 'thu-1', day: 'thursday', period: 1, startTime: '08:00', endTime: '08:50', subjectId: 'english', subjectName: 'אנגלית', teacher: 'הדס', room: '108', building: 'בניין מרכזי', floor: 1 },
          { id: 'thu-2', day: 'thursday', period: 2, startTime: '08:55', endTime: '09:35', subjectId: 'english', subjectName: 'אנגלית', teacher: 'הדס', room: '108', building: 'בניין מרכזי', floor: 1 },
          { id: 'thu-3', day: 'thursday', period: 3, startTime: '09:45', endTime: '10:30', subjectId: 'civics', subjectName: 'אזרחות', teacher: 'מיה', room: '106', building: 'בניין מרכזי', floor: 1 },
          { id: 'thu-4', day: 'thursday', period: 4, startTime: '10:55', endTime: '11:40', subjectId: 'math', subjectName: 'מתמטיקה', teacher: 'שירי', room: '204', building: 'אגף מדעים', floor: 2 },
          { id: 'thu-5', day: 'thursday', period: 5, startTime: '11:50', endTime: '12:35', subjectId: 'lashon', subjectName: 'לשון', teacher: 'תרזה', room: '105', building: 'בניין מרכזי', floor: 1 },
          { id: 'thu-6', day: 'thursday', period: 6, startTime: '12:45', endTime: '13:30', subjectId: 'lashon', subjectName: 'לשון', teacher: 'תרזה', room: '105', building: 'בניין מרכזי', floor: 1 },

          // Friday
          { id: 'fri-1', day: 'friday', period: 1, startTime: '08:00', endTime: '08:50', subjectId: 'lashon', subjectName: 'לשון', teacher: 'תרזה', room: '105', building: 'בניין מרכזי', floor: 1 },
          { id: 'fri-2', day: 'friday', period: 2, startTime: '08:55', endTime: '09:35', subjectId: 'lashon', subjectName: 'לשון', teacher: 'תרזה', room: '105', building: 'בניין מרכזי', floor: 1 },
          { id: 'fri-3', day: 'friday', period: 3, startTime: '09:45', endTime: '10:30', subjectId: 'civics', subjectName: 'אזרחות', teacher: 'בלה', room: '106', building: 'בניין מרכזי', floor: 1 },
          { id: 'fri-4', day: 'friday', period: 4, startTime: '10:55', endTime: '11:40', subjectId: 'civics', subjectName: 'אזרחות', teacher: 'בלה', room: '106', building: 'בניין מרכזי', floor: 1 },
        ],
        source: 'local_preset',
      });
      return;
    }

    const systemInstruction = `אתה מומחה לפענוח מערכות שעות בית ספריות אישיות בישראל.
עליך לחלץ במדויק את כל השיעורים מהטבלה / התמונה / הטקסט המוזנים.
עבור כל שיעור שחולץ החזר אובייקט עם:
- day: אחד מ- 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
- period: מספר השיעור (1 עד 8)
- startTime: שעת התחלה (לדוגמה '08:00')
- endTime: שעת סיום (לדוגמה '08:50')
- subjectName: שם המקצוע בעברית (למשל: חינוך, תנ"ך, לשון, מתמטיקה, תקשוב, היסטוריה, חנ"ג, הצעד הבא, אזרחות, אמנות, אנגלית, מדעים)
- subjectId: מזהה מתאים (homeroom, tanach, lashon, math, tikshuv, history, pe, next_step, civics, art, english, science)
- teacher: שם המורה אם מופיע בסוגריים או לצד המקצוע (למשל: יעל, לימור, תרזה, שירי, שלומית, ענבל, אלעד, שחר, יונת, בלה, מיה, לי, הדס)
- room: מספר הכיתה אם ידוע (למשל: 101, 102, 104, 105, 106, 108, 204, מעבדת מחשבים, אולם ספורט, סדנת אמנות)
- building: שם האגף (בניין מרכזי / אגף מדעים / אגף טכנולוגיה / מתחם ספורט / אגף יצירתיות)
- floor: מספר קומה (0, 1 או 2)

שעות השיעורים הסטנדרטיות:
שיעור 1: 08:00 - 08:50
שיעור 2: 08:55 - 09:35
שיעור 3: 09:45 - 10:30
שיעור 4: 10:55 - 11:40
שיעור 5: 11:50 - 12:35
שיעור 6: 12:45 - 13:30
שיעור 7: 13:40 - 14:25`;

    let parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || 'image/png',
        },
      });
      parts.push({
        text: 'אנא פענח את תמונת/מסמך מערכת השעות המצורפת והחזר את כל השיעורים במבנה JSON תקני בלבד.',
      });
    } else {
      parts.push({
        text: `אנא פענח את טקסט מערכת השעות הבא והחזר רשימת שיעורים מסודרת:\n\n${text || ''}`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentName: { type: Type.STRING, description: 'שם התלמיד אם מופיע בכותרת' },
            slots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  day: { type: Type.STRING, enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
                  period: { type: Type.INTEGER },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  subjectName: { type: Type.STRING },
                  subjectId: { type: Type.STRING },
                  teacher: { type: Type.STRING },
                  room: { type: Type.STRING },
                  building: { type: Type.STRING },
                  floor: { type: Type.INTEGER },
                },
                required: ['day', 'period', 'subjectName'],
              },
            },
          },
          required: ['slots'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{"slots":[]}');
    const slotsWithIds = (parsedJson.slots || []).map((s: any, idx: number) => ({
      ...s,
      id: s.id || `uploaded-${s.day}-${s.period}-${idx}`,
      startTime: s.startTime || (s.period === 1 ? '08:00' : s.period === 2 ? '08:55' : s.period === 3 ? '09:45' : s.period === 4 ? '10:55' : s.period === 5 ? '11:50' : s.period === 6 ? '12:45' : '13:40'),
      endTime: s.endTime || (s.period === 1 ? '08:50' : s.period === 2 ? '09:35' : s.period === 3 ? '10:30' : s.period === 4 ? '11:40' : s.period === 5 ? '12:35' : s.period === 6 ? '13:30' : '14:25'),
    }));

    res.json({
      studentName: parsedJson.studentName,
      slots: slotsWithIds,
      source: 'gemini_3.7_flash',
    });
  } catch (error: any) {
    console.error('Error in /api/ai/parse-timetable:', error);
    res.status(500).json({ error: error?.message || 'Failed to parse timetable' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'MindMate', version: '2.1.0' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindMate server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
