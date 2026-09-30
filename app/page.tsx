"use client";

import ProfileImage from "./profile-image";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, BellRing, BookOpen, CalendarDays, Camera, ChevronDown, ChevronLeft, ChevronRight, FileSpreadsheet, Globe2, HelpCircle, Languages, Medal, Mic, Pencil, RotateCcw, Save, Share2, ShieldCheck, Trash2, Trophy, Video, Volume2 } from "lucide-react";
import { authorizedFetch, clearSession, initializeSession, startSessionMaintenance } from "./auth-client";
import { languages, useLanguage } from "./i18n";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TRAINING_LOG_TEST_CAMPAIGN } from "./training-log-campaign";

type Leader = { id: string; athleteNumber:number; name: string; lastNameInitials: string; country: string; gender:"male"|"female"; age: number | null; today:number; personalBest:number; verifiedPersonalBest:number; total: number; month: number; average: number; averagePeriodDays?:number|null; activeDays: number; hasEvidence: boolean; hasProfilePhoto: boolean; trainingLogPublic:boolean; isFeatured?:boolean; challenge?:{ day:number; total:number; goal:number }|null };
type BoardData = { ownAthlete?: Leader | null; leaders: Leader[]; summary: { total: number; month: number; athletes: number }; monthLabel: string };
type HistoryEntry = { id: number; reps: number; setReps: number[]; entryDate: string; createdAt: string; editedAt: string | null; hasEvidence: boolean };
const PROFILE_KEY = "pushup-world-profile-v1";
const MAX_SET_REPS = 121;
const COOLDOWN_EXEMPT_ATHLETE_IDS = new Set([
  "0431b2b7-b3d3-4666-b5ad-f0d53709b686", // Roman
  "6486023e-5793-44d6-ae04-41c8292f37dc", // existing exemption
]);
const CYNTHIA_ANNOUNCEMENT_ID = "cynthia-hungarian-voice-2026-09-27";
const CYNTHIA_ANNOUNCEMENT_EXPIRES = Date.parse("2026-09-28T08:45:00+02:00");
const MORNING_GREETING_VERSION = "morning-greeting-v1";
const VOICE_STYLE_KEY = "thc-voice-style";
const VOICE_NAME_KEY = "thc-voice-name";
type VoiceStyle = "coach" | "power" | "neutral";
const morningGreetings = {
  de:{ locale:"de-DE", eyebrow:"Dein Start in den Tag", hello:"Guten Morgen, {name}!", motivation:"Heute ist ein neuer Tag für eine starke Entscheidung. Was ist heute deine Choice?", listen:"Noch einmal anhören", close:"Los geht’s", replay:"Heutigen Morgengruß erneut anzeigen" },
  en:{ locale:"en-US", eyebrow:"Your start to the day", hello:"Good morning, {name}!", motivation:"Today is a new day for a strong decision. What is your choice today?", listen:"Listen again", close:"Let’s go", replay:"Show today’s morning greeting again" },
  fr:{ locale:"fr-FR", eyebrow:"Ton départ dans la journée", hello:"Bonjour, {name} !", motivation:"Aujourd’hui est un nouveau jour pour prendre une décision forte. Quel est ton choix aujourd’hui ?", listen:"Réécouter", close:"C’est parti", replay:"Afficher à nouveau le message du matin" },
  es:{ locale:"es-ES", eyebrow:"Tu comienzo del día", hello:"¡Buenos días, {name}!", motivation:"Hoy es un nuevo día para tomar una decisión firme. ¿Cuál es tu elección hoy?", listen:"Escuchar de nuevo", close:"Vamos", replay:"Mostrar de nuevo el saludo de hoy" },
  it:{ locale:"it-IT", eyebrow:"Il tuo inizio di giornata", hello:"Buongiorno, {name}!", motivation:"Oggi è un nuovo giorno per una decisione forte. Qual è la tua scelta oggi?", listen:"Ascolta di nuovo", close:"Cominciamo", replay:"Mostra di nuovo il saluto di oggi" },
  pt:{ locale:"pt-PT", eyebrow:"O teu início do dia", hello:"Bom dia, {name}!", motivation:"Hoje é um novo dia para uma decisão forte. Qual é a tua escolha hoje?", listen:"Ouvir novamente", close:"Vamos começar", replay:"Mostrar novamente a saudação de hoje" },
  bg:{ locale:"bg-BG", eyebrow:"Твоето начало на деня", hello:"Добро утро, {name}!", motivation:"Днес е нов ден за силно решение. Какъв е твоят избор днес?", listen:"Чуй отново", close:"Да започваме", replay:"Покажи отново сутрешния поздрав" },
  tr:{ locale:"tr-TR", eyebrow:"Güne başlangıcın", hello:"Günaydın, {name}!", motivation:"Bugün güçlü bir karar için yeni bir gün. Bugünkü seçimin ne?", listen:"Tekrar dinle", close:"Başlayalım", replay:"Bugünkü sabah selamını yeniden göster" },
  hu:{ locale:"hu-HU", eyebrow:"A napod kezdete", hello:"Jó reggelt, {name}!", motivation:"A mai nap egy új lehetőség egy erős döntésre. Mi a te választásod ma?", listen:"Újra meghallgatom", close:"Kezdjük!", replay:"Mai reggeli üdvözlet újbóli megjelenítése" },
  ar:{ locale:"ar-SA", eyebrow:"بداية يومك", hello:"صباح الخير، {name}!", motivation:"اليوم يوم جديد لاتخاذ قرار قوي. ما هو اختيارك اليوم؟", listen:"استمع مرة أخرى", close:"لنبدأ", replay:"إظهار تحية هذا الصباح مرة أخرى" },
} as const;
const voiceLabels = {
  de:{ title:"Sprachausgabe", style:"Stil", speaker:"Sprecher", coach:"Coach · sportlich", power:"Power · offensiv", neutral:"Neutral", automatic:"Automatisch · bevorzugt männlich", preview:"Stimme testen" },
  en:{ title:"Voice output", style:"Style", speaker:"Speaker", coach:"Coach · energetic", power:"Power · intense", neutral:"Neutral", automatic:"Automatic · prefers male", preview:"Test voice" },
  fr:{ title:"Sortie vocale", style:"Style", speaker:"Voix", coach:"Coach · dynamique", power:"Power · intense", neutral:"Neutre", automatic:"Automatique · voix masculine préférée", preview:"Tester la voix" },
  es:{ title:"Salida de voz", style:"Estilo", speaker:"Voz", coach:"Coach · deportivo", power:"Power · intenso", neutral:"Neutral", automatic:"Automática · prefiere voz masculina", preview:"Probar voz" },
  it:{ title:"Voce", style:"Stile", speaker:"Voce", coach:"Coach · sportivo", power:"Power · intenso", neutral:"Neutro", automatic:"Automatico · preferenza voce maschile", preview:"Prova la voce" },
  pt:{ title:"Voz", style:"Estilo", speaker:"Locutor", coach:"Coach · desportivo", power:"Power · intenso", neutral:"Neutro", automatic:"Automático · prefere voz masculina", preview:"Testar voz" },
  bg:{ title:"Глас", style:"Стил", speaker:"Говорител", coach:"Треньор · енергичен", power:"Power · интензивен", neutral:"Неутрален", automatic:"Автоматично · предпочита мъжки глас", preview:"Тест на гласа" },
  tr:{ title:"Seslendirme", style:"Tarz", speaker:"Konuşmacı", coach:"Koç · enerjik", power:"Power · güçlü", neutral:"Nötr", automatic:"Otomatik · erkek sesi öncelikli", preview:"Sesi dene" },
  hu:{ title:"Hangkimenet", style:"Stílus", speaker:"Beszélő", coach:"Edző · lendületes", power:"Power · intenzív", neutral:"Semleges", automatic:"Automatikus · férfihang előnyben", preview:"Hang kipróbálása" },
  ar:{ title:"الصوت", style:"الأسلوب", speaker:"المتحدث", coach:"مدرب · حماسي", power:"قوي · مكثف", neutral:"محايد", automatic:"تلقائي · يفضل صوتًا رجاليًا", preview:"اختبار الصوت" },
} as const;
const historyCalendarLabels = {
  de:{ title:"Trainingshandbuch auswählen", description:"Jahr und Monat auswählen", previousYear:"Vorheriges Jahr", nextYear:"Nächstes Jahr", choose:"Monat und Jahr auswählen", empty:"Keine Trainingseinträge im {period}." },
  en:{ title:"Select training log", description:"Choose year and month", previousYear:"Previous year", nextYear:"Next year", choose:"Choose month and year", empty:"No training entries in {period}." },
  fr:{ title:"Choisir le carnet d’entraînement", description:"Choisir l’année et le mois", previousYear:"Année précédente", nextYear:"Année suivante", choose:"Choisir le mois et l’année", empty:"Aucune séance en {period}." },
  es:{ title:"Elegir diario de entrenamiento", description:"Elegir año y mes", previousYear:"Año anterior", nextYear:"Año siguiente", choose:"Elegir mes y año", empty:"No hay entrenamientos en {period}." },
  it:{ title:"Seleziona diario di allenamento", description:"Scegli anno e mese", previousYear:"Anno precedente", nextYear:"Anno successivo", choose:"Scegli mese e anno", empty:"Nessun allenamento in {period}." },
  pt:{ title:"Selecionar diário de treino", description:"Escolher ano e mês", previousYear:"Ano anterior", nextYear:"Ano seguinte", choose:"Escolher mês e ano", empty:"Sem treinos em {period}." },
  bg:{ title:"Избор на тренировъчен дневник", description:"Изберете година и месец", previousYear:"Предишна година", nextYear:"Следваща година", choose:"Изберете месец и година", empty:"Няма тренировки през {period}." },
  tr:{ title:"Antrenman günlüğünü seç", description:"Yıl ve ay seç", previousYear:"Önceki yıl", nextYear:"Sonraki yıl", choose:"Ay ve yıl seç", empty:"{period} döneminde antrenman kaydı yok." },
  hu:{ title:"Edzésnapló kiválasztása", description:"Válassz évet és hónapot", previousYear:"Előző év", nextYear:"Következő év", choose:"Hónap és év kiválasztása", empty:"Nincs edzésbejegyzés ekkor: {period}." },
  ar:{ title:"اختيار سجل التدريب", description:"اختر السنة والشهر", previousYear:"السنة السابقة", nextYear:"السنة التالية", choose:"اختر الشهر والسنة", empty:"لا توجد سجلات تدريب في {period}." },
} as const;

function localDayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function cooldownSeconds(reps: number) {
  if (reps <= 20) return 20;
  if (reps <= 40) return 40;
  if (reps <= 60) return 60;
  if (reps <= 80) return 90;
  return 120;
}

function timestampMillis(value: string) {
  return Date.parse(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
}

function formatEntryTime(value: string, locale: string) {
  const millis = timestampMillis(value);
  if (!Number.isFinite(millis)) return "Uhrzeit nicht verfügbar";
  return `${new Intl.DateTimeFormat(locale, { hour:"2-digit", minute:"2-digit", second:"2-digit" }).format(new Date(millis))} Uhr`;
}

export default function Home() {
  const { language, setLanguage, t, locale } = useLanguage();
  const historyCalendarText = historyCalendarLabels[language];
  const [count, setCount] = useState(0);
  const [manual, setManual] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"male"|"female">("male");
  const [athleteId, setAthleteId] = useState("");
  const [athleteNumber, setAthleteNumber] = useState(0);
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [privateMode, setPrivateMode] = useState(false);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyLoaded, setPrivacyLoaded] = useState(false);
  const [privacyError, setPrivacyError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [contextHelp, setContextHelp] = useState(false);
  const [iconHelpOpen, setIconHelpOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyStatus, setHistoryStatus] = useState<"loading"|"ready"|"error">("loading");
  const historyRequestRef = useRef(0);
  const [selectedHistoryPeriod, setSelectedHistoryPeriod] = useState(() => localDayKey().slice(0, 7));
  const [historyCalendarOpen, setHistoryCalendarOpen] = useState(false);
  const [historyCalendarYear, setHistoryCalendarYear] = useState(() => Number(localDayKey().slice(0, 4)));
  const [evidenceUrl, setEvidenceUrl] = useState("");
  useEffect(() => () => { if (evidenceUrl) URL.revokeObjectURL(evidenceUrl); }, [evidenceUrl]);
  const [video, setVideo] = useState<File | null>(null);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoStatus, setPhotoStatus] = useState("");
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [authUser, setAuthUser] = useState<{ displayName: string; email: string; gender?:"male"|"female"|null; isAdmin?:boolean; admin2faVerified?:boolean } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [showSlowAuthHint, setShowSlowAuthHint] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const savingRef = useRef(false);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [trainingLogShareDuration, setTrainingLogShareDuration] = useState<"private"|"day"|"always">("private");
  const [trainingLogPublicScope, setTrainingLogPublicScope] = useState<"today"|"all">("all");
  const [temporaryTrainingLogUntil, setTemporaryTrainingLogUntil] = useState("");
  const [trainingLogInviteOpen, setTrainingLogInviteOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const announcementSpoken = useRef(false);
  const [morningGreetingOpen, setMorningGreetingOpen] = useState(false);
  const morningGreetingSpoken = useRef(false);
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>("coach");
  const [voiceName, setVoiceName] = useState("");
  const [deviceVoices, setDeviceVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceCatalogReady, setVoiceCatalogReady] = useState(false);
  const historyDaysRef = useRef<HTMLDivElement>(null);
  const [historyScrollProgress, setHistoryScrollProgress] = useState(0);
  const [historyScrollable, setHistoryScrollable] = useState(false);

  useEffect(() => {
    const savedStyle = localStorage.getItem(VOICE_STYLE_KEY);
    if (savedStyle === "coach" || savedStyle === "power" || savedStyle === "neutral") setVoiceStyle(savedStyle);
    setVoiceName(localStorage.getItem(VOICE_NAME_KEY) || "");
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) { setDeviceVoices(voices); setVoiceCatalogReady(true); }
    };
    loadVoices();
    const voicePoll = window.setInterval(loadVoices, 250);
    const stopPolling = window.setTimeout(() => { window.clearInterval(voicePoll); setVoiceCatalogReady(true); }, 3000);
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => { window.clearInterval(voicePoll); window.clearTimeout(stopPolling); window.speechSynthesis.removeEventListener("voiceschanged", loadVoices); };
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage((current) => current === message ? "" : current), 10000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const languageVoices = useMemo(() => {
    const requested = (athleteNumber === 7 || /^cynthia\b/i.test(name.trim()) ? "hu-HU" : morningGreetings[language].locale).toLowerCase();
    const base = requested.split("-")[0];
    const matching = deviceVoices.filter((voice) => voice.lang.toLowerCase() === requested || voice.lang.toLowerCase().startsWith(`${base}-`));
    return (matching.length ? matching : deviceVoices).sort((a, b) => a.name.localeCompare(b.name));
  }, [athleteNumber, deviceVoices, language, name]);

  const applyVoiceSettings = useCallback((speech: SpeechSynthesisUtterance, requestedLocale: string) => {
    const maleHints = /\b(conrad|stefan|martin|hans|michael|markus|klaus|andrás|tamas|tamás|bence|szabolcs|balázs|daniel|david|george|guy|thomas|alex|male|mann|homme|hombre|uomo|erkek|férfi)\b/i;
    const femaleHints = /\b(katja|anna|helena|samantha|victoria|zira|female|frau|femme|mujer|donna|kadın|női)\b/i;
    const requested = requestedLocale.toLowerCase();
    const base = requested.split("-")[0];
    const matching = deviceVoices.filter((voice) => voice.lang.toLowerCase() === requested || voice.lang.toLowerCase().startsWith(`${base}-`));
    const chosen = matching.find((voice) => voice.name === voiceName)
      || matching.find((voice) => maleHints.test(voice.name))
      || matching.find((voice) => !femaleHints.test(voice.name))
      || matching[0];
    if (chosen) speech.voice = chosen;
    speech.lang = chosen?.lang || requestedLocale;
    const styles = { coach:{ rate:1.06, pitch:.82 }, power:{ rate:1.16, pitch:.7 }, neutral:{ rate:.94, pitch:1 } } as const;
    speech.rate = styles[voiceStyle].rate;
    speech.pitch = styles[voiceStyle].pitch;
    speech.volume = 1;
  }, [deviceVoices, voiceName, voiceStyle]);

  const loadBoard = useCallback(async () => {
    try {
      const response = await authorizedFetch("/api/leaderboard", { cache: "no-store" });
      const data = (await response.json()) as BoardData & { error?: string };
      if (!response.ok) throw new Error(data.error || "Rangliste nicht verfügbar");
      setBoard(data);
    } catch {
      setMessage("Die Rangliste kann gerade nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (id: string) => {
    if (!id) return;
    const requestId = ++historyRequestRef.current;
    setHistoryStatus("loading");
    try {
      const allEntries: HistoryEntry[] = [];
      let offset: number | null = 0;
      while (offset !== null) {
        let response: Response | null = null;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          response = await authorizedFetch(`/api/history?athleteId=${encodeURIComponent(id)}&offset=${offset}`, { cache: "no-store" });
          if (response.ok) break;
          if (![401, 429, 500, 502, 503, 504].includes(response.status)) break;
          await new Promise((resolve) => window.setTimeout(resolve, 450 * (attempt + 1)));
        }
        if (!response?.ok) throw new Error("Trainingshistorie konnte nicht geladen werden.");
        const data = await response.json() as { entries?: HistoryEntry[]; nextOffset?:number|null };
        if (!Array.isArray(data.entries)) throw new Error("Ungültige Antwort des Trainingsbuchs.");
        allEntries.push(...data.entries);
        offset = data.nextOffset ?? null;
      }
      if (requestId !== historyRequestRef.current) return;
      const entries = [...new Map(allEntries.map((entry) => [entry.id, entry])).values()];
      setHistory(entries);
      setHistoryStatus("ready");
      const latest = entries[0];
      if (latest && !COOLDOWN_EXEMPT_ATHLETE_IDS.has(id)) setCooldownUntil(timestampMillis(latest.createdAt) + cooldownSeconds(latest.reps) * 1000);
      else setCooldownUntil(0);
    } catch {
      if (requestId === historyRequestRef.current) setHistoryStatus("error");
    }
  }, []);

  const applyProfile = useCallback((profile: { id:string; athleteNumber?:number; name:string; lastName?:string; country:string; gender?:string; birthDate?:string }) => {
    setName(profile.name || ""); setLastName(profile.lastName || ""); setCountry(profile.country || "");
    setBirthDate(profile.birthDate || ""); setGender(profile.gender === "female" ? "female" : "male"); setAthleteId(profile.id); setAthleteNumber(Number(profile.athleteNumber || 0));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    void loadHistory(profile.id);
  }, [loadHistory]);

  useEffect(() => {
    startSessionMaintenance();
    initializeSession().then(async (user) => {
      setAuthUser(user);
      if (!user) return;
      if (user.gender) setGender(user.gender);
      const response = await authorizedFetch("/api/profile", { cache:"no-store", signal:AbortSignal.timeout(12000) });
      const data = await response.json() as { profile?: { id:string; athleteNumber?:number; name:string; lastName?:string; country:string; gender?:string; birthDate?:string; privateMode?:boolean; trainingLogPublic?:boolean; trainingLogPublicScope?:"today"|"all"; trainingLogPublicUntil?:string|null } | null };
      if (response.ok && data.profile) {
        applyProfile(data.profile);
        setPrivateMode(Boolean(data.profile.privateMode)); setPrivacyLoaded(true);
        await loadBoard();
        // Decide whether to show the greeting before revealing the dashboard.
        // A later effect caused the input to flash and then disappear under a dialog.
        const greetingName = data.profile.name?.trim();
        const isCynthia = Number(data.profile.athleteNumber) === 7 || /^cynthia\b/i.test(greetingName || "");
        if (greetingName && !isCynthia) {
          const greetingKey = `thc:${MORNING_GREETING_VERSION}:${localDayKey()}:${data.profile.id || greetingName.toLocaleLowerCase()}`;
          if (!localStorage.getItem(greetingKey)) {
            localStorage.setItem(greetingKey, new Date().toISOString());
            setMorningGreetingOpen(true);
          }
        }
        setTrainingLogShareDuration(data.profile.trainingLogPublic ? "always" : data.profile.trainingLogPublicUntil && Date.parse(data.profile.trainingLogPublicUntil) > Date.now() ? "day" : "private");
        setTrainingLogPublicScope(data.profile.trainingLogPublicScope === "today" ? "today" : "all");
        const temporaryUntil = data.profile.trainingLogPublicUntil || "";
        setTemporaryTrainingLogUntil(temporaryUntil);
        const campaignNow = Date.now();
        const campaignActive = TRAINING_LOG_TEST_CAMPAIGN.active && campaignNow >= Date.parse(TRAINING_LOG_TEST_CAMPAIGN.startsAt) && campaignNow < Date.parse(TRAINING_LOG_TEST_CAMPAIGN.endsAt);
        const temporaryActive = Boolean(temporaryUntil && Date.parse(temporaryUntil) > campaignNow);
        if (campaignActive && !data.profile.trainingLogPublic && !temporaryActive && localStorage.getItem(`${TRAINING_LOG_TEST_CAMPAIGN.id}-dismissed`) !== "yes") setTrainingLogInviteOpen(true);
      }
      else if (response.ok) {
        localStorage.removeItem(PROFILE_KEY);
        historyRequestRef.current++; setAthleteId(""); setHistory([]); setHistoryStatus("ready");
      } else {
        setMessage("Das Profil konnte nicht geladen werden. Bitte lade die Seite erneut.");
      }
    }).catch(() => { setMessage("Die Verbindung ist gerade nicht verfügbar. Bitte lade die Seite erneut."); }).finally(() => setAuthReady(true));
    loadBoard();
  }, [applyProfile, loadBoard]);

  useEffect(() => {
    if (authReady) { setShowSlowAuthHint(false); return; }
    const timer = window.setTimeout(() => setShowSlowAuthHint(true), 800);
    return () => window.clearTimeout(timer);
  }, [authReady]);

  const isCynthiaAnnouncementTarget = athleteNumber === 7 || /^cynthia\b/i.test(name.trim());
  const isCynthiaAnnouncementActive = Date.now() < CYNTHIA_ANNOUNCEMENT_EXPIRES;
  const morningCopy = morningGreetings[language];
  const trainingLogCampaignCopy = TRAINING_LOG_TEST_CAMPAIGN.copy[language];
  const temporaryTrainingLogActive = Boolean(temporaryTrainingLogUntil && Date.parse(temporaryTrainingLogUntil) > Date.now());
  const personalizedMorningHello = morningCopy.hello.replace("{name}", name.trim());
  useEffect(() => {
    const replay = () => { morningGreetingSpoken.current = false; setMorningGreetingOpen(true); };
    window.addEventListener("thc:morning-greeting", replay);
    if (window.location.hash === "#morning-greeting" && name.trim()) { replay(); window.history.replaceState(null, "", "/"); }
    return () => window.removeEventListener("thc:morning-greeting", replay);
  }, [name]);

  const speakCynthiaAnnouncement = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const featureSpeech = new SpeechSynthesisUtterance("Szia Cynthia! Mától magyarul is bemondhatod az ismétléseid számát.");
    applyVoiceSettings(featureSpeech, "hu-HU");
    const morningSpeech = new SpeechSynthesisUtterance("Jó reggelt, Cynthia! A mai nap egy új lehetőség egy erős döntésre. Mi a te választásod ma?");
    applyVoiceSettings(morningSpeech, "hu-HU");
    window.speechSynthesis.speak(featureSpeech);
    window.speechSynthesis.speak(morningSpeech);
  }, [applyVoiceSettings]);

  useEffect(() => {
    if (!isCynthiaAnnouncementTarget || !isCynthiaAnnouncementActive) return;
    const storageKey = `thc-announcement-seen:${CYNTHIA_ANNOUNCEMENT_ID}`;
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, new Date().toISOString());
    setAnnouncementOpen(true);
  }, [isCynthiaAnnouncementTarget, isCynthiaAnnouncementActive]);

  useEffect(() => {
    if (!announcementOpen || announcementSpoken.current) return;
    if (!voiceCatalogReady) return;
    announcementSpoken.current = true;
    const timer = window.setTimeout(speakCynthiaAnnouncement, 350);
    return () => window.clearTimeout(timer);
  }, [announcementOpen, speakCynthiaAnnouncement, voiceCatalogReady]);

  const speakMorningGreeting = useCallback(() => {
    if (!("speechSynthesis" in window) || !name.trim()) return;
    window.speechSynthesis.cancel();
    const copy = morningGreetings[language];
    const hello = copy.hello.replace("{name}", name.trim());
    const speech = new SpeechSynthesisUtterance(`${hello} ${copy.motivation}`);
    applyVoiceSettings(speech, copy.locale);
    window.speechSynthesis.speak(speech);
  }, [applyVoiceSettings, language, name]);

  useEffect(() => {
    if (!morningGreetingOpen || morningGreetingSpoken.current) return;
    if (!voiceCatalogReady) return;
    morningGreetingSpoken.current = true;
    const timer = window.setTimeout(speakMorningGreeting, 350);
    return () => window.clearTimeout(timer);
  }, [morningGreetingOpen, speakMorningGreeting, voiceCatalogReady]);

  useEffect(() => {
    if (authReady && !authUser) window.location.replace("/login");
  }, [authReady, authUser]);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setClockNow(now);
      if (now >= cooldownUntil) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const profileComplete = name.trim().length >= 2 && country.trim().length >= 2;
  const monthlyLeaders = useMemo(() => [...(board?.leaders || [])].filter((leader) => leader.month > 0).sort((a, b) => b.month - a.month || b.total - a.total), [board]);
  const totalLeaders = useMemo(() => [...(board?.leaders || [])].sort((a, b) => b.total - a.total || b.month - a.month), [board]);
  const currentAthlete = useMemo(() => board?.ownAthlete?.id === athleteId ? board.ownAthlete : (board?.leaders || []).find((leader) => leader.id === athleteId), [board, athleteId]);
  const myMonthRank = useMemo(() => monthlyLeaders.findIndex((leader) => leader.id === athleteId), [monthlyLeaders, athleteId]);
  const myTotalRank = useMemo(() => totalLeaders.findIndex((leader) => leader.id === athleteId), [totalLeaders, athleteId]);
  const projectionLeaders = useMemo(
    () => [...(board?.leaders || [])].filter((leader) => leader.month > 0).sort((a, b) => b.average - a.average || b.month - a.month),
    [board],
  );
  const historyByDay = useMemo(() => {
    const groups = new Map<string, HistoryEntry[]>();
    for (const entry of history) groups.set(entry.entryDate, [...(groups.get(entry.entryDate) || []), entry]);
    return [...groups.entries()].sort(([dateA], [dateB]) => dateB.localeCompare(dateA));
  }, [history]);
  const historyPeriods = useMemo(() => new Set(history.map((entry) => entry.entryDate.slice(0, 7))), [history]);
  const visibleHistoryByDay = useMemo(() => historyByDay.filter(([date]) => date.startsWith(selectedHistoryPeriod)), [historyByDay, selectedHistoryPeriod]);
  const currentHistoryPeriod = localDayKey().slice(0, 7);
  const currentHistoryYear = Number(currentHistoryPeriod.slice(0, 4));
  const earliestHistoryYear = useMemo(() => history.length ? Math.min(...history.map((entry) => Number(entry.entryDate.slice(0, 4)))) : currentHistoryYear, [history, currentHistoryYear]);
  const selectedHistoryLabel = useMemo(() => new Intl.DateTimeFormat(locale, { month:"long", year:"numeric" }).format(new Date(`${selectedHistoryPeriod}-01T12:00:00Z`)), [locale, selectedHistoryPeriod]);
  const dailyTotals = useMemo(() => new Map(historyByDay.map(([date, entries]) => [date, entries.reduce((sum, entry) => sum + entry.reps, 0)])), [historyByDay]);
  const myProjectionRank = useMemo(() => projectionLeaders.findIndex((leader) => leader.id === athleteId), [projectionLeaders, athleteId]);
  const cooldownRemaining = Math.max(0, Math.ceil((cooldownUntil - clockNow) / 1000));

  const syncHistoryScroll = useCallback(() => {
    const element = historyDaysRef.current;
    if (!element) return;
    const maximum = Math.max(0, element.scrollHeight - element.clientHeight);
    setHistoryScrollable(maximum > 1);
    setHistoryScrollProgress(maximum ? (element.scrollTop / maximum) * 100 : 0);
  }, []);
  const setHistoryScrollFromClientY = useCallback((clientY:number, rail:HTMLDivElement) => {
    const element = historyDaysRef.current;
    if (!element) return;
    const bounds = rail.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height));
    element.scrollTop = progress * Math.max(0, element.scrollHeight - element.clientHeight);
    setHistoryScrollProgress(progress * 100);
  }, []);
  useEffect(() => {
    const frame = window.requestAnimationFrame(syncHistoryScroll);
    window.addEventListener("resize", syncHistoryScroll);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("resize", syncHistoryScroll); };
  }, [syncHistoryScroll, visibleHistoryByDay]);

  function exportTrainingLog() {
    if (!history.length) return;
    const rows = [
      ["Datum", "Tagestotal", "Uhrzeit", "Wiederholungen", "Status", "Video-Nachweis"],
      ...history.map((entry) => [entry.entryDate, String(dailyTotals.get(entry.entryDate) || entry.reps), new Intl.DateTimeFormat(locale, { hour:"2-digit", minute:"2-digit", second:"2-digit" }).format(new Date(timestampMillis(entry.createdAt))), String(entry.reps), entry.editedAt ? "korrigiert" : "gespeichert", entry.hasEvidence ? "ja" : "nein"]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type:"text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `trainingstagebuch-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function shareTrainingProgress() {
    if (!currentAthlete) return;
    const text = `${currentAthlete.name}: ${currentAthlete.total.toLocaleString(locale)} Push-ups gesamt · ${currentAthlete.month.toLocaleString(locale)} diesen Monat · Ø ${currentAthlete.average.toLocaleString(locale)} pro Trainingstag. #TheHumanChoice #PushUps`;
    const shareData = { title:"THE.HUMAN.CHOICE – Trainingsstand", text, url:window.location.origin };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(`${text}\n${shareData.url}`); setMessage("Dein Trainingsstand wurde zum Teilen kopiert."); }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Teilen war nicht möglich. Bitte versuche es erneut.");
    }
  }

  async function shareTrainingDay(entryDate: string, total: number) {
    const formattedDate = new Intl.DateTimeFormat(locale, { day:"2-digit", month:"2-digit", year:"numeric" }).format(new Date(`${entryDate}T12:00:00Z`));
    const athleteName = currentAthlete?.name || name.trim() || "THE.HUMAN.CHOICE";
    const text = `${athleteName}: ${total.toLocaleString(locale)} Push-ups am ${formattedDate} geschafft. #TheHumanChoice #PushUps`;
    const shareData = { title:"THE.HUMAN.CHOICE – Tagestraining", text, url:window.location.origin };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(`${text}\n${shareData.url}`);
        setMessage("Dein Tagestraining wurde zum Teilen kopiert.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Teilen war nicht möglich. Bitte versuche es erneut.");
    }
  }

  async function prepareProfilePhoto(file: File): Promise<File> {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024) return file;
    if (!(file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) || file.size > 30 * 1024 * 1024) throw new Error("Bitte ein Foto bis 30 MB auswählen.");
    let bitmap: ImageBitmap;
    try { bitmap = await createImageBitmap(file); }
    catch { throw new Error("Dieses Fotoformat kann hier nicht geöffnet werden. Bitte JPG, PNG oder WebP wählen."); }
    try {
      const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Das Foto konnte nicht verarbeitet werden.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", .82));
      if (!blob || blob.size > 5 * 1024 * 1024) throw new Error("Das Foto ist zu groß. Bitte eine kleinere Aufnahme wählen.");
      return new File([blob], "profilfoto.jpg", { type:"image/jpeg" });
    } finally { bitmap.close(); }
  }

  async function uploadProfilePhoto(file?: File) {
    if (!file) return;
    if (!authUser || !athleteId) { const notice = !authUser ? "Bitte zuerst anmelden." : "Bitte zuerst dein Profil speichern."; setPhotoStatus(notice); setMessage(notice); if (authUser) setProfileOpen(true); return; }
    setUploadingPhoto(true);
    setPhotoStatus("Foto wird gespeichert …");
    try {
      const prepared = await prepareProfilePhoto(file);
      const form = new FormData();
      form.set("athleteId", athleteId);
      form.set("photo", prepared);
      form.set("realPhoto", "true");
      const response = await authorizedFetch("/api/profile-photo", { method:"POST", body:form });
      const result = await response.json() as { error?:string };
      if (!response.ok) throw new Error(result.error || "Profilfoto konnte nicht gespeichert werden.");
      setPhotoUploaded(true);
      setPhotoVersion((value) => value + 1);
      setPhotoStatus("Profilfoto gespeichert.");
      setMessage("Profilfoto wurde gespeichert.");
      await loadBoard();
    } catch (error) {
      const notice = error instanceof Error ? error.message : "Profilfoto konnte nicht gespeichert werden.";
      setPhotoStatus(notice);
      setMessage(notice);
    } finally { setUploadingPhoto(false); }
  }

  async function saveWorkout() {
    if (savingRef.current) return;
    if (!authUser) {
      setMessage("Bitte zuerst mit E-Mail und Passwort anmelden.");
      return;
    }
    if (!profileComplete) {
      setProfileOpen(true);
      setMessage("Bitte zuerst Vorname und Land eintragen. Das Geburtsdatum ist freiwillig.");
      return;
    }
    if (count < 1) {
      setMessage("Zähle oder trage zuerst deine Push-ups ein.");
      return;
    }
    if (count > MAX_SET_REPS) {
      setMessage("Pro Satz sind höchstens 121 Push-ups erlaubt.");
      return;
    }
    if (cooldownRemaining > 0) {
      setMessage(`Bitte noch ${cooldownRemaining} Sekunden bis zum nächsten Satz warten.`);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setMessage("");
    const id = athleteId || crypto.randomUUID();
    try {
      const response = await authorizedFetch("/api/leaderboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ athleteId: id, requestId: crypto.randomUUID(), name: name.trim(), lastName: lastName.trim(), country: country.trim(), gender, birthDate, reps: count, timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone }),
      });
      const result = (await response.json()) as { error?: string; athleteId?: string; entryId?: number; nextAllowedAt?: string; challengeUpdated?:boolean };
      if (result.nextAllowedAt) setCooldownUntil(Date.parse(result.nextAllowedAt));
      if (!response.ok) throw new Error(result.error || "Speichern fehlgeschlagen");
      const savedId = result.athleteId || id;
      setAthleteId(savedId);
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ id:savedId, name: name.trim(), lastName: lastName.trim(), country: country.trim(), gender, birthDate }));
      let successMessage = `${count.toLocaleString("de-CH")} Push-ups wurden ehrlich eingetragen.${result.challengeUpdated ? " Deine laufende Challenge wurde ebenfalls aktualisiert." : ""}`;
      if (video && result.entryId) {
        const form = new FormData();
        form.set("athleteId", savedId);
        form.set("entryId", String(result.entryId));
        form.set("video", video);
        const upload = await authorizedFetch("/api/evidence", { method: "POST", body: form });
        const uploadResult = await upload.json() as { error?: string };
        successMessage = upload.ok ? `${successMessage} Video-Nachweis gespeichert.` : `${successMessage} ${uploadResult.error || "Video konnte nicht gespeichert werden."}`;
      }
      setMessage(successMessage);
      navigator.vibrate?.(60);
      setCount(0);
      setManual("");
      setVideo(null);
      setSelectedHistoryPeriod(localDayKey().slice(0, 7));
      await Promise.all([loadBoard(), loadHistory(savedId)]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Speichern fehlgeschlagen.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function correctEntry(entry: HistoryEntry) {
    const value = prompt("Korrigierte Anzahl Push-ups:", String(entry.reps));
    if (value === null) return;
    const reps = Number(value);
    if (!Number.isInteger(reps) || reps < 1 || reps > MAX_SET_REPS) {
      setMessage("Bitte eine ganze Zahl zwischen 1 und 121 eingeben.");
      return;
    }
    const response = await authorizedFetch("/api/history", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ athleteId, entryId: entry.id, reps }),
    });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? "Eintrag wurde korrigiert und als bearbeitet markiert." : result.error || "Korrektur fehlgeschlagen.");
    if (response.ok) await Promise.all([loadBoard(), loadHistory(athleteId)]);
  }

  async function deleteEntry(entry: HistoryEntry) {
    if (!confirm(`Eintrag mit ${entry.reps} Push-ups wirklich löschen?`)) return;
    const response = await authorizedFetch("/api/history", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ athleteId, entryId: entry.id }),
    });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? "Eintrag wurde gelöscht." : result.error || "Löschen fehlgeschlagen.");
    if (response.ok) await Promise.all([loadBoard(), loadHistory(athleteId)]);
  }

  async function openEvidence(entryId:number) {
    try {
      const response = await authorizedFetch(`/api/evidence?entryId=${entryId}`, {cache:"no-store"});
      if (!response.ok) throw new Error("Video-Nachweis nicht verfügbar.");
      setEvidenceUrl(URL.createObjectURL(await response.blob()));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Video-Nachweis nicht verfügbar."); }
  }

  async function savePrivacy(value: boolean) {
    setPrivacySaving(true); setPrivacyError("");
    try {
      const response = await authorizedFetch("/api/privacy", {method:"PUT", headers:{"content-type":"application/json"}, body:JSON.stringify({privateMode:value})});
      const data = await response.json() as {privateMode?:boolean;error?:string};
      if (!response.ok || typeof data.privateMode !== "boolean") throw new Error(data.error || "Privacy konnte nicht gespeichert werden.");
      setPrivateMode(data.privateMode); await loadBoard();
    } catch (error) { setPrivacyError(error instanceof Error ? error.message : "Privacy konnte nicht gespeichert werden."); }
    finally { setPrivacySaving(false); }
  }

  async function saveProfile() {
    if (!authUser) { setMessage("Bitte zuerst anmelden."); return; }
    if (!profileComplete) { setMessage("Bitte Vorname und Land vollständig eintragen."); return; }
    setSaving(true);
    try {
      const response = await authorizedFetch("/api/profile", {
        method:"POST",
        headers:{ "content-type":"application/json" },
        body:JSON.stringify({ athleteId:athleteId || crypto.randomUUID(), name:name.trim(), lastName:lastName.trim(), country:country.trim(), gender, birthDate, trainingLogShareDuration, trainingLogPublicScope }),
      });
      const result = await response.json() as { error?:string; profile?:{ id:string; athleteNumber:number; name:string; lastName:string; country:string; gender:string; birthDate:string; trainingLogPublic:boolean; trainingLogPublicScope:"today"|"all"; trainingLogPublicUntil?:string|null } };
      if (!response.ok || !result.profile) throw new Error(result.error || "Profil konnte nicht gespeichert werden.");
      applyProfile(result.profile);
      const privacyResponse = await authorizedFetch("/api/privacy", {cache:"no-store"});
      if (privacyResponse.ok) { const privacy = await privacyResponse.json() as {privateMode:boolean}; setPrivateMode(privacy.privateMode); setPrivacyLoaded(true); }
      setTemporaryTrainingLogUntil(result.profile.trainingLogPublicUntil || "");
      setMessage(`Profil gespeichert · Athleten-ID ${String(result.profile.athleteNumber).padStart(4, "0")}`);
      await loadBoard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profil konnte nicht gespeichert werden.");
    } finally { setSaving(false); }
  }

  async function enableTemporaryTrainingLog() {
    const response = await authorizedFetch("/api/training-log-sharing", { method:"POST" });
    const result = await response.json() as { error?:string; until?:string };
    if (!response.ok || !result.until) { setMessage(result.error || "Die Testfreigabe konnte nicht aktiviert werden."); return; }
    setTemporaryTrainingLogUntil(result.until);
    setTrainingLogShareDuration("day");
    setTrainingLogInviteOpen(false);
    localStorage.setItem(`${TRAINING_LOG_TEST_CAMPAIGN.id}-dismissed`, "yes");
    setMessage("Dein Trainingshandbuch ist bis morgen für die Community freigegeben.");
    await loadBoard();
  }

  async function disableTemporaryTrainingLog() {
    const response = await authorizedFetch("/api/training-log-sharing", { method:"DELETE" });
    if (!response.ok) { setMessage("Die Testfreigabe konnte nicht ausgeschaltet werden."); return; }
    setTemporaryTrainingLogUntil("");
    setTrainingLogShareDuration("private");
    setMessage("Die vorübergehende Freigabe wurde ausgeschaltet.");
    await loadBoard();
  }

  async function deleteAccount() {
    if (!confirm("Konto wirklich löschen? Dein Profil, deine Statistik, alle Trainings sowie Fotos und Videos werden endgültig gelöscht.")) return;
    if (!confirm("Letzte Bestätigung: Diese Löschung kann nicht rückgängig gemacht werden.")) return;
    const response = await authorizedFetch("/api/profile", { method:"DELETE" });
    const result = await response.json() as { error?:string };
    if (!response.ok) { setMessage(result.error || "Konto konnte nicht gelöscht werden."); return; }
    localStorage.removeItem(PROFILE_KEY); clearSession(); setAuthUser(null); setAthleteId(""); setHistory([]);
    setName(""); setLastName(""); setCountry(""); setBirthDate(""); setMessage("Dein Konto und deine Trainingsdaten wurden gelöscht.");
    await loadBoard();
  }

  if (!authReady || !authUser) {
    return <main className="authGateLoading" aria-busy="true"><div className="authGateTop" /><div className="authGateCard" role="status"><span>THE.HUMAN.CHOICE</span><p>{showSlowAuthHint ? "Anmeldung wird geprüft …" : "Dashboard wird vorbereitet …"}</p></div></main>;
  }

  return (
    <main className={contextHelp ? "contextHelpOn" : ""} aria-busy={!authReady}>
      <Dialog open={Boolean(evidenceUrl)} onOpenChange={open => { if(!open) setEvidenceUrl(""); }}><DialogContent><DialogHeader><DialogTitle>Video-Nachweis</DialogTitle><DialogDescription>Dein gespeicherter Trainingsnachweis</DialogDescription></DialogHeader>{evidenceUrl && <video src={evidenceUrl} controls style={{width:"100%"}} />}</DialogContent></Dialog>
    <Dialog open={iconHelpOpen} onOpenChange={setIconHelpOpen}>
        <DialogContent className="iconHelpDialog" aria-describedby="dashboard-icon-help">
          <DialogHeader><DialogTitle>Dashboard: Icons und Funktionen</DialogTitle><DialogDescription id="dashboard-icon-help">Tippe auf ein Icon, um seine Funktion zu nutzen.</DialogDescription></DialogHeader>
          <ul className="iconHelpList">
            <li><strong>Profilfoto</strong><span>Das Foto wird hier angezeigt. Ändern kannst du es unter Einstellungen → Persönliche Daten.</span></li>
            <li><strong>Balkendiagramm</strong><span>Statistik und Rangliste öffnen.</span></li>
            <li><strong>100</strong><span>Road to 100 öffnen.</span></li>
            <li><strong>Pokal</strong><span>Deine Push-up-Challenge öffnen.</span></li>
            <li><strong>Videokamera</strong><span>Video als Nachweis zum Trainingssatz hinzufügen.</span></li>
            <li><strong>Kreispfeil</strong><span>Die aktuelle Eingabe zurücksetzen.</span></li>
            <li><strong>Sprachen</strong><span>Sprache auswählen.</span></li>
            <li><strong>Fragezeichen</strong><span>Diese Erklärung öffnen.</span></li>
            <li><strong>Menü ☰</strong><span>Module, Handbücher, Hilfe und Morgengruß öffnen.</span></li>
            <li><strong>Zahnrad</strong><span>Persönliche Daten, Stimme und Freigabe des Trainingsbuchs einstellen.</span></li>
            <li><strong>Uhr</strong><span>Lokale Uhrzeit während des Trainings anzeigen.</span></li>
          </ul>
          <button className="iconHelpContextButton" type="button" onClick={() => setContextHelp((value) => !value)}>Zusätzliche Hinweise zu Bedienelementen {contextHelp ? "ausschalten" : "einschalten"}</button>
        </DialogContent>
      </Dialog>
      <Dialog open={trainingLogInviteOpen} onOpenChange={(open) => { setTrainingLogInviteOpen(open); if (!open) localStorage.setItem(`${TRAINING_LOG_TEST_CAMPAIGN.id}-dismissed`, "yes"); }}>
        <DialogContent className="trainingLogInvite" aria-describedby="training-log-test-copy">
          <div className="announcementIcon" aria-hidden="true"><Share2 size={28}/></div>
          <DialogHeader><p className="announcementEyebrow">THE.HUMAN.CHOICE · BETA TEST</p><DialogTitle>{trainingLogCampaignCopy.title}</DialogTitle><DialogDescription id="training-log-test-copy">{trainingLogCampaignCopy.body}</DialogDescription></DialogHeader>
          <DialogFooter><button className="announcementListen" type="button" onClick={() => { localStorage.setItem(`${TRAINING_LOG_TEST_CAMPAIGN.id}-dismissed`, "yes"); setTrainingLogInviteOpen(false); }}>{trainingLogCampaignCopy.decline}</button><button className="announcementClose" type="button" onClick={enableTemporaryTrainingLog}>{trainingLogCampaignCopy.accept}</button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
        <DialogContent className="personalAnnouncement" aria-describedby="cynthia-announcement-copy">
          <div className="announcementIcon" aria-hidden="true"><BellRing size={28}/></div>
          <DialogHeader>
            <p className="announcementEyebrow">THE.HUMAN.CHOICE · Újdonság neked</p>
            <DialogTitle lang="hu">Szia Cynthia!</DialogTitle>
            <DialogDescription id="cynthia-announcement-copy" lang="hu">Mától magyarul is bemondhatod az ismétléseid számát.</DialogDescription>
          </DialogHeader>
          <div className="announcementMorning" lang="hu"><strong>Jó reggelt, Cynthia!</strong><span>A mai nap egy új lehetőség egy erős döntésre. Mi a te választásod ma?</span></div>
          <DialogFooter>
            <button className="announcementListen" type="button" onClick={speakCynthiaAnnouncement}><Volume2 size={19}/> Újra meghallgatom</button>
            <button className="announcementClose" type="button" onClick={() => setAnnouncementOpen(false)}>Kezdjük!</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={morningGreetingOpen} onOpenChange={setMorningGreetingOpen}>
        <DialogContent className="personalAnnouncement morningGreetingDialog" aria-describedby="morning-greeting-copy" dir={language === "ar" ? "rtl" : "ltr"}>
          <div className="announcementIcon morningIcon" aria-hidden="true">☀</div>
          <DialogHeader>
            <p className="announcementEyebrow">THE.HUMAN.CHOICE · {morningCopy.eyebrow}</p>
            <DialogTitle>{personalizedMorningHello}</DialogTitle>
            <DialogDescription id="morning-greeting-copy">{morningCopy.motivation}</DialogDescription>
          </DialogHeader>
          <section className="voiceSettings voiceSettingsInDialog" aria-label={voiceLabels[language].title}>
            <strong><Volume2 size={18}/>{voiceLabels[language].title}</strong>
            <label><span>{voiceLabels[language].style}</span><select value={voiceStyle} onChange={(event) => { const value = event.target.value as VoiceStyle; setVoiceStyle(value); localStorage.setItem(VOICE_STYLE_KEY, value); }}><option value="coach">{voiceLabels[language].coach}</option><option value="power">{voiceLabels[language].power}</option><option value="neutral">{voiceLabels[language].neutral}</option></select></label>
            <label><span>{voiceLabels[language].speaker}</span><select value={voiceName} onChange={(event) => { setVoiceName(event.target.value); localStorage.setItem(VOICE_NAME_KEY, event.target.value); }}><option value="">{voiceLabels[language].automatic}</option>{languageVoices.map((voice) => <option key={`${voice.name}-${voice.lang}`} value={voice.name}>{voice.name} · {voice.lang}</option>)}</select></label>
            <button type="button" onClick={speakMorningGreeting}><Volume2 size={18}/>{voiceLabels[language].preview}</button>
          </section>
          <DialogFooter>
            <button className="announcementListen" type="button" onClick={speakMorningGreeting}><Volume2 size={19}/> {morningCopy.listen}</button>
            <button className="announcementClose" type="button" onClick={() => setMorningGreetingOpen(false)}>{morningCopy.close}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <header className="topbar">
        <div className="topbarLeft">
          <nav className="moduleQuickNav" aria-label="Modulnavigation">
            <a className="headerQuickLink statisticsHeaderLink" href="/athletes" title={t("statistics")} aria-label={t("statistics")}><BarChart3 size={21} /></a>
            <span className="profilePhotoControl" title="Dein Profilfoto">
              {photoUploaded || currentAthlete?.hasProfilePhoto ? <ProfileImage src={`/api/profile-photo?athleteId=${encodeURIComponent(athleteId)}&v=${photoVersion}`} alt="Dein Profilfoto" /> : <img src="/profile-placeholder-globe.png" alt="THE.HUMAN.CHOICE Globus" />}
            </span>
            {photoStatus && <span className="photoUploadStatus" role="status">{photoStatus}</span>}
            <a className="headerQuickLink roadHeaderLink" href="/road-to-100/index.html" title="Road to 100" aria-label="Road to 100"><strong>100</strong></a>
            <a className="headerQuickLink challengeHeaderLink" href="/your-choice/index.html" title="Push-up Challenge" aria-label="Push-up Challenge"><Trophy size={21} /></a>
          </nav>
        </div>
      </header>

      <section className="counterSection" id="top">
        <div className="intro">
          <h1 className="fourWordHeadline"><span>Saubere</span><span>Technik.</span><span>Starke</span><span>Leistung.</span></h1><p>Erfassung deiner korrekten Push-Ups</p>
        </div>

        <div className="trainingEntryCard">
        <div className="inputControlRow">
        <div className="entryPanel directEntryPanel">
          <label className="compactCounter corporateEntry"><span>{t("current")}</span><input inputMode="numeric" maxLength={3} value={manual} onChange={(event) => { const value = event.target.value.replace(/\D/g, "").slice(0, 3); setManual(value); setCount(value ? Number(value) : 0); setMessage(""); }} onKeyDown={(event) => { if (event.key === "Enter" && count > 0 && count <= MAX_SET_REPS) void saveWorkout(); }} placeholder="0" aria-label={t("writeCount")} /><button className="voice-number-button" type="button" aria-label="Zahl sprechen"><Mic size={24} aria-hidden="true" /></button></label>
          <div className="entrySideActions">
            <label className={`videoQuickButton directVideoButton ${video ? "hasVideo" : ""}`} title={video ? video.name : t("chooseVideo")} aria-label={t("videoProof")}>
              <Video size={20} />
              <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => setVideo(event.target.files?.[0] || null)} />
            </label>
            <button className="entryIconButton" type="button" onClick={() => { setCount(0); setManual(""); setMessage(""); }} aria-label={t("reset")} title={t("reset")}><RotateCcw size={19}/></button>
          </div>
        </div>
        <aside className="entryUtilityTools" aria-label="Sprache und Hilfe">
          <label className="languageControl" title="Sprache wählen"><Languages size={23} aria-hidden="true"/><select className="languageSelect" value={language} onChange={(event) => setLanguage(event.target.value as typeof language)} aria-label="Sprache wählen">{languages.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
          <button className="entryHelpButton" type="button" aria-label="Icons und Funktionen erklären" title="Icons und Funktionen erklären" onClick={() => setIconHelpOpen(true)}><HelpCircle size={23}/></button>
        </aside>
        </div>

        <div className="dashboardClockAnchor" />

        {!authReady && showSlowAuthHint && <p className="dashboardAuthStatus" role="status">Anmeldung wird geprüft …</p>}
        <button className="saveButton" data-help="Speichert den Satz einmal und überträgt ihn automatisch in Trainingsbuch, Statistik und aktive Challenge." onClick={saveWorkout} disabled={!authReady || !authUser || saving || count < 1 || count > MAX_SET_REPS || cooldownRemaining > 0}>
          {saving ? t("saving") : cooldownRemaining > 0 ? `Nächster Satz in ${cooldownRemaining} s` : "Training speichern"}
        </button>
        </div>
        <div id="profile-settings" className={`profileCompact profileMenuOnly ${profileOpen ? "isOpen" : ""}`}>
          <button className="profileToggle" type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
            <span><Pencil size={17} /><strong>{t("athleteProfile")}</strong><small>{profileComplete ? `${name} · ${country}` : t("profileNeeded")}</small></span>
            <ChevronDown className={profileOpen ? "rotated" : ""} size={19} />
          </button>
          {profileOpen && <div className="profileCard">
            <details id="profile-personal" className="profileSettingsGroup" open><summary><Pencil size={19}/> Persönliche Daten <ChevronDown size={18}/></summary><div className="profileSettingsGroupBody">
            <div id="profile-photo-settings" className="profilePhotoSettings"><strong>Profilfoto</strong><div className="profilePhotoSettingsRow">{photoUploaded || currentAthlete?.hasProfilePhoto ? <ProfileImage src={`/api/profile-photo?athleteId=${encodeURIComponent(athleteId)}&v=${photoVersion}`} alt="Dein aktuelles Profilfoto" /> : <img src="/profile-placeholder-globe.png" alt="THE.HUMAN.CHOICE Globus als Profilbildplatzhalter" />}<label className="profilePhotoChange"><Camera size={18}/><span>{uploadingPhoto ? "Foto wird gespeichert …" : "Foto auswählen oder ändern"}</span><input type="file" accept="image/*,.heic,.heif" aria-label="Profilfoto auswählen oder ändern" disabled={uploadingPhoto} onClick={() => setPhotoStatus("Foto auswählen …")} onChange={(event) => { const selected = event.currentTarget.files?.[0]; event.currentTarget.value = ""; if (selected) void uploadProfilePhoto(selected); else setPhotoStatus(""); }} /></label></div><small>Nur ein echtes Foto des Athleten. Größere Handyfotos werden automatisch verkleinert.</small></div>
            <label><span>{t("firstName")}</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder={t("yourName")} autoComplete="given-name" /></label>
            <label><span>{t("lastName")}</span><input value={lastName} onChange={(event) => setLastName(event.target.value)} maxLength={60} placeholder={t("yourLastName")} autoComplete="family-name" /></label>
            <label><span>{t("country")}</span><input value={country} onChange={(event) => setCountry(event.target.value)} maxLength={56} placeholder={t("countryExample")} autoComplete="country-name" /></label>
            <label><span>{t("birthDate")} <small>({t("optional")})</small></span><input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} max={new Date().toISOString().slice(0, 10)} autoComplete="bday" /></label>
            <fieldset className="genderChoice profileGender"><legend>{t("leaderboard")}</legend><label><input type="radio" name="profile-gender" checked={gender === "male"} onChange={() => setGender("male")} /><span>{t("male")}</span></label><label><input type="radio" name="profile-gender" checked={gender === "female"} onChange={() => setGender("female")} /><span>{t("female")}</span></label></fieldset>
            </div></details>
            <details className="profileSettingsGroup" open><summary>Privacy · Community Visibility</summary><div className="profileSettingsGroupBody"><strong>PRIVATE MODE</strong><p>Hide my training activity from the community</p><label><input type="checkbox" role="switch" checked={privateMode} disabled={!privacyLoaded || privacySaving || !authUser} onChange={event => void savePrivacy(event.target.checked)} /> {privacyLoaded ? privateMode ? "ON" : "OFF" : "…"}</label><small>{privacySaving ? "Wird gespeichert …" : "Deine eigenen Daten bleiben vollständig erhalten. Private Mode hat Vorrang vor Trainingsbuch-Freigaben."}</small>{privacyError && <p role="alert">{privacyError}</p>}</div></details>
            <details id="profile-privacy" className="profileSettingsGroup"><summary><BookOpen size={19}/> Trainingsbuch und Freigabe <ChevronDown size={18}/></summary><div className="profileSettingsGroupBody">
            <div className="trainingPrivacy"><strong>Trainingsbuch: Freigabe</strong><fieldset className="trainingPrivacyScope"><legend>Was darf die Community sehen?</legend><label><input type="radio" name="training-log-scope" checked={trainingLogPublicScope === "today"} onChange={() => setTrainingLogPublicScope("today")} /><span>Nur den heutigen Tag</span></label><label><input type="radio" name="training-log-scope" checked={trainingLogPublicScope === "all"} onChange={() => setTrainingLogPublicScope("all")} /><span>Alle Trainingstage</span></label></fieldset><fieldset className="trainingPrivacyScope"><legend>Wie lange?</legend><label><input type="radio" name="training-log-duration" checked={trainingLogShareDuration === "private"} onChange={() => setTrainingLogShareDuration("private")} /><span>Privat lassen</span></label><label><input type="radio" name="training-log-duration" checked={trainingLogShareDuration === "day"} onChange={() => setTrainingLogShareDuration("day")} /><span>24 Stunden ab dem Speichern</span></label><label><input type="radio" name="training-log-duration" checked={trainingLogShareDuration === "always"} onChange={() => setTrainingLogShareDuration("always")} /><span>Dauerhaft, bis ich es beende</span></label></fieldset><small>Änderungen werden erst mit „Profil speichern“ wirksam.</small></div>
            {temporaryTrainingLogActive && <div className="temporarySharingStatus"><span><strong>24-Stunden-Freigabe aktiv</strong><small>Endet automatisch am {new Intl.DateTimeFormat(locale,{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(temporaryTrainingLogUntil))}.</small></span><button type="button" onClick={disableTemporaryTrainingLog}>Jetzt ausschalten</button></div>}
            </div></details>
            <details id="profile-voice" className="profileSettingsGroup"><summary><Volume2 size={19}/> Stimme und Morgengruß <ChevronDown size={18}/></summary><div className="profileSettingsGroupBody">
            <section className="voiceSettings" aria-label={voiceLabels[language].title}>
              <strong><Volume2 size={18}/>{voiceLabels[language].title}</strong>
              <label><span>{voiceLabels[language].style}</span><select value={voiceStyle} onChange={(event) => { const value = event.target.value as VoiceStyle; setVoiceStyle(value); localStorage.setItem(VOICE_STYLE_KEY, value); }}><option value="coach">{voiceLabels[language].coach}</option><option value="power">{voiceLabels[language].power}</option><option value="neutral">{voiceLabels[language].neutral}</option></select></label>
              <label><span>{voiceLabels[language].speaker}</span><select value={voiceName} onChange={(event) => { setVoiceName(event.target.value); localStorage.setItem(VOICE_NAME_KEY, event.target.value); }}><option value="">{voiceLabels[language].automatic}</option>{languageVoices.map((voice) => <option key={`${voice.name}-${voice.lang}`} value={voice.name}>{voice.name} · {voice.lang}</option>)}</select></label>
              <button type="button" onClick={isCynthiaAnnouncementTarget ? speakCynthiaAnnouncement : speakMorningGreeting}><Volume2 size={18}/>{voiceLabels[language].preview}</button>
            </section>
            {isCynthiaAnnouncementTarget && isCynthiaAnnouncementActive && <button className="announcementReplay" type="button" onClick={() => { announcementSpoken.current = false; setAnnouncementOpen(true); }}><BellRing size={17}/> Mai üzenet újbóli megjelenítése</button>}
            {!isCynthiaAnnouncementTarget && <button className="announcementReplay" type="button" onClick={() => { morningGreetingSpoken.current = false; setMorningGreetingOpen(true); }}><BellRing size={17}/> {morningCopy.replay}</button>}
            </div></details>
            <p>{t("profileHelp")}</p>
            <button className="saveProfileButton" type="button" onClick={saveProfile} disabled={saving}><Save size={17}/> Profil speichern</button>
            {authUser && <div className="accountDanger"><strong>{t("manageAccount")}</strong><p>{t("deleteAccountHelp")}</p><button type="button" onClick={deleteAccount}><Trash2 size={17}/> {t("deleteAccount")}</button></div>}
          </div>}
        </div>
        {message && <p className="message" role="status">{message}</p>}
      </section>

      <section className="statsStrip" aria-label={t("statistics")}>
        <div><span>DAY</span><strong>{currentAthlete?.today.toLocaleString(locale) ?? "–"}</strong><small>heute</small></div>
        <div><span>AVG/D</span><strong>{currentAthlete?.average.toLocaleString(locale) ?? "–"}</strong><small>{currentAthlete?.averagePeriodDays ? t("overDays", { days:currentAthlete.averagePeriodDays }) : "Push-ups"}</small></div>
        <div><span>MONTH</span><strong>{currentAthlete?.month.toLocaleString(locale) ?? "–"}</strong><small>{board?.monthLabel ?? "–"}</small></div>
        <div><span>TOTAL</span><strong>{currentAthlete?.total.toLocaleString(locale) ?? "–"}</strong><small>{currentAthlete ? `ID ${String(currentAthlete.athleteNumber).padStart(4, "0")}` : t("sinceStart")}</small></div>
      </section>

      {athleteId && !profileOpen && <section className="historySection">
        <div className="historyHeading">
          <div><p className="eyebrow"><CalendarDays size={16}/>{t("trainingLog")}</p><h2>{selectedHistoryLabel}</h2></div>
          <div className="historyRoundActions">
            <button className="historyCalendarButton" type="button" onClick={() => { setHistoryCalendarYear(Number(selectedHistoryPeriod.slice(0, 4))); setHistoryCalendarOpen(true); }} aria-label={`${historyCalendarText.choose}. ${selectedHistoryLabel}`} title={historyCalendarText.choose}><CalendarDays size={24}/></button>
            <button className="historyExcelButton" type="button" onClick={exportTrainingLog} disabled={!history.length} aria-label={t("exportExcel")} title={t("exportExcel")}><FileSpreadsheet size={24}/></button>
            <button className="historyShareButton" type="button" onClick={shareTrainingProgress} disabled={!currentAthlete} aria-label="Trainingsstand teilen" title="Trainingsstand teilen"><Share2 size={23}/></button>
          </div>
        </div>
        <Dialog open={historyCalendarOpen} onOpenChange={setHistoryCalendarOpen}>
          <DialogContent className="historyCalendarDialog" aria-describedby="history-calendar-description">
            <DialogHeader><DialogTitle>{historyCalendarText.title}</DialogTitle><DialogDescription id="history-calendar-description">{historyCalendarText.description}</DialogDescription></DialogHeader>
            <div className="historyYearPicker">
              <button type="button" onClick={() => setHistoryCalendarYear((year) => year - 1)} disabled={historyCalendarYear <= earliestHistoryYear} aria-label={historyCalendarText.previousYear}><ChevronLeft size={22}/></button>
              <strong>{historyCalendarYear}</strong>
              <button type="button" onClick={() => setHistoryCalendarYear((year) => year + 1)} disabled={historyCalendarYear >= currentHistoryYear} aria-label={historyCalendarText.nextYear}><ChevronRight size={22}/></button>
            </div>
            <div className="historyMonthGrid">
              {Array.from({ length:12 }, (_, monthIndex) => {
                const period = `${historyCalendarYear}-${String(monthIndex + 1).padStart(2, "0")}`;
                const enabled = period === currentHistoryPeriod || historyPeriods.has(period);
                const label = new Intl.DateTimeFormat(locale, { month:"short" }).format(new Date(Date.UTC(historyCalendarYear, monthIndex, 1)));
                return <button type="button" key={period} disabled={!enabled} className={period === selectedHistoryPeriod ? "selected" : ""} onClick={() => { setSelectedHistoryPeriod(period); setHistoryCalendarOpen(false); }}>{label}</button>;
              })}
            </div>
          </DialogContent>
        </Dialog>
        <div className="historyDaysShell">
        <div className="historyDays" ref={historyDaysRef} onScroll={syncHistoryScroll}>
          {visibleHistoryByDay.length ? visibleHistoryByDay.map(([entryDate, entries]) => (
            <details className="historyDay" key={entryDate}>
              <summary>
                <time dateTime={entryDate}>{new Intl.DateTimeFormat(locale, { day:"2-digit", month:"2-digit", year:"numeric" }).format(new Date(`${entryDate}T12:00:00Z`))}</time>
                <span className="dailyTotal"><small>Tagestotal</small><strong>{(dailyTotals.get(entryDate) || 0).toLocaleString(locale)}</strong></span>
                <ChevronDown size={20} aria-hidden="true" />
              </summary>
              <div className="historyDayActions">
                <button className="shareDayButton" type="button" onClick={() => shareTrainingDay(entryDate, dailyTotals.get(entryDate) || 0)}>
                  <Share2 size={17} />
                  {({ de:"Auf WhatsApp & Social Media teilen", en:"Share on WhatsApp & social media", fr:"Partager sur WhatsApp et les réseaux", es:"Compartir en WhatsApp y redes", it:"Condividi su WhatsApp e social", pt:"Partilhar no WhatsApp e redes", bg:"Споделяне в WhatsApp и социалните мрежи", tr:"WhatsApp ve sosyal medyada paylaş", hu:"Megosztás WhatsAppon és a közösségi médiában", ar:"المشاركة عبر واتساب والتواصل الاجتماعي" } as const)[language]}
                </button>
              </div>
              <div className="historyList">
                {entries.map((entry) => (
                  <article key={entry.id}>
                    <strong>{entry.setReps.length > 1 ? `${entry.reps.toLocaleString(locale)} (${entry.setReps.join(" + ")})` : entry.reps.toLocaleString(locale)} <small>Push-ups</small></strong>
                    <span className="entryMeta"><time dateTime={entry.createdAt}>{formatEntryTime(entry.createdAt, locale)}</time><small> · {entry.editedAt ? t("corrected") : t("stored")}{entry.hasEvidence && ` · ${t("withVideo")}`}</small></span>
                    <div>
                      {entry.hasEvidence && <button type="button" onClick={() => void openEvidence(entry.id)} aria-label="Video-Nachweis ansehen"><Video size={18} /></button>}
                      {entry.setReps.length === 1 && <button onClick={() => correctEntry(entry)} aria-label="Eintrag korrigieren"><Pencil size={18} /></button>}
                      <button className="deleteAction" onClick={() => deleteEntry(entry)} aria-label="Eintrag löschen"><Trash2 size={18} /></button>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          )) : historyStatus === "loading" ? <div className="historySkeleton" role="status" aria-label="Trainingsbuch wird geladen"><span/><span/><span/></div>
          : historyStatus === "error" || (selectedHistoryPeriod === currentHistoryPeriod && (currentAthlete?.month || 0) > 0)
          ? <div className="historyLoadNotice" role="status"><p>Die Einträge konnten gerade nicht angezeigt werden. Deine Trainingswerte bleiben gespeichert.</p><button type="button" onClick={() => void loadHistory(athleteId)}>Trainingsbuch erneut laden</button></div>
          : <p className="empty">{historyCalendarText.empty.replace("{period}", selectedHistoryLabel)}</p>}
        </div>
        <div className={`historyScrollRail ${historyScrollable ? "isScrollable" : ""}`} role="slider" aria-label="Trainingshandbuch scrollen" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(historyScrollProgress)} tabIndex={historyScrollable ? 0 : -1} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setHistoryScrollFromClientY(event.clientY,event.currentTarget); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) setHistoryScrollFromClientY(event.clientY,event.currentTarget); }} onKeyDown={(event) => { const element=historyDaysRef.current; if (!element) return; if (event.key === "ArrowDown") { event.preventDefault(); element.scrollBy({top:80,behavior:"smooth"}); } if (event.key === "ArrowUp") { event.preventDefault(); element.scrollBy({top:-80,behavior:"smooth"}); } }}><span style={{ top:`calc(${historyScrollProgress}% - 2px)` }} /></div>
        </div>
      </section>}

      {false && <><section className="rankingSection" id="ranking">
        <div className="sectionHeading">
          <div><p className="eyebrow"><Medal size={16} /> {t("currentMonth")}</p><h2>{t("monthRanking")}</h2></div>
          {myMonthRank >= 0 && <span className="myRank">Dein Monatsrang: #{myMonthRank + 1}</span>}
        </div>
        <div className="tableWrap">
          <div className="tableHead"><span>{t("rankAthlete")}</span><span>{t("month")}</span><span>{t("avgDay")}</span><span>{t("activeDays")}</span></div>
          {loading ? <p className="empty">Monatsrangliste wird geladen …</p> : monthlyLeaders.length ? monthlyLeaders.map((leader, index) => (
            <div className={`rankRow ${leader.id === athleteId ? "isMe" : ""}`} key={leader.id}>
              <span className="athlete"><b>{index + 1}</b><i>{leader.country.slice(0, 2).toUpperCase()}</i><span><strong>{leader.name}{leader.age !== null && ` (${leader.age})`}{leader.hasEvidence && <em title="Video-Nachweis vorhanden"><Video size={15} /></em>}</strong><small>{leader.country} · {leader.activeDays} aktive Tage</small></span></span>
              <strong data-label="Monat">{leader.month.toLocaleString("de-CH")}</strong>
              <span data-label="Ø / Tag">{leader.average.toLocaleString("de-CH")}</span>
              <span data-label="Aktive Tage">{leader.activeDays}</span>
            </div>
          )) : <p className="empty">{t("noMonth")}</p>}
        </div>
      </section>

      <section className="rankingSection">
        <div className="sectionHeading">
          <div><p className="eyebrow"><Trophy size={16} /> {t("allWorkouts")}</p><h2>{t("totalRanking")}</h2></div>
          {myTotalRank >= 0 && <span className="myRank">Dein Gesamtrang: #{myTotalRank + 1}</span>}
        </div>
        <div className="tableWrap">
          <div className="tableHead"><span>Rang · Athlet</span><span>Gesamt</span><span>Monat</span><span>Aktive Tage</span></div>
          {loading ? <p className="empty">Gesamtrangliste wird geladen …</p> : totalLeaders.length ? totalLeaders.map((leader, index) => (
            <div className={`rankRow ${leader.id === athleteId ? "isMe" : ""}`} key={leader.id}>
              <span className="athlete"><b>{index + 1}</b><i>{leader.country.slice(0, 2).toUpperCase()}</i><span><strong>{leader.name}{leader.age !== null && ` (${leader.age})`}{leader.hasEvidence && <em title="Video-Nachweis vorhanden"><Video size={15} /></em>}</strong><small>{leader.country}</small></span></span>
              <strong data-label="Gesamt">{leader.total.toLocaleString("de-CH")}</strong>
              <span data-label="Monat">{leader.month.toLocaleString("de-CH")}</span>
              <span data-label="Aktive Tage">{leader.activeDays}</span>
            </div>
          )) : <p className="empty">{t("noTotal")}</p>}
        </div>
      </section>

      <section className="rankingSection projectionSection">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow"><Globe2 size={16} /> {t("newcomer")}</p><h2>{t("forecast")}</h2><p className="projectionNote">{t("forecastNote")}</p>
          </div>
          {myProjectionRank >= 0 && <span className="myRank">Dein Prognose-Rang: #{myProjectionRank + 1}</span>}
        </div>
        <div className="tableWrap">
          <div className="tableHead"><span>{t("rankAthlete")}</span><span>{t("avgDay")}</span><span>{t("activeDays")}</span><span>{t("days30")}</span></div>
          {loading ? <p className="empty">Prognose wird geladen …</p> : projectionLeaders.length ? projectionLeaders.map((leader, index) => (
            <div className={`rankRow ${leader.id === athleteId ? "isMe" : ""}`} key={leader.id}>
              <span className="athlete"><b>{index + 1}</b><i>{leader.country.slice(0, 2).toUpperCase()}</i><span><strong>{leader.name}{leader.age !== null && ` (${leader.age})`}{leader.hasEvidence && <em title="Video-Nachweis vorhanden"><Video size={15} /></em>}</strong><small>{leader.country} · {leader.month.toLocaleString("de-CH")} im aktuellen Monat</small></span></span>
              <span data-label="Ø / Tag">{leader.average.toLocaleString("de-CH")}</span>
              <span data-label="Aktive Tage">{leader.activeDays}</span>
              <strong data-label="30 Tage">{(leader.average * 30).toLocaleString("de-CH")}</strong>
            </div>
          )) : <p className="empty">{t("noForecast")}</p>}
        </div>
      </section>
      </>}

      <section className="rulesSection">
        <button className="rulesToggle" onClick={() => setRulesOpen((open) => !open)} aria-expanded={rulesOpen}>
          <span><ShieldCheck size={22} /><strong>{t("rules")}</strong></span><ChevronDown className={rulesOpen ? "rotated" : ""} />
        </button>
        {rulesOpen && <div className="rulesGrid">
          <article><b>1</b><p><strong>{t("cleanLine")}</strong>{t("cleanLineText")}</p></article>
          <article><b>2</b><p><strong>{t("controlledDepth")}</strong>{t("controlledDepthText")}</p></article>
          <article><b>3</b><p><strong>{t("handPosition")}</strong>{t("handPositionText")}</p></article>
          <article><b>4</b><p><strong>{t("fullRep")}</strong>{t("fullRepText")}</p></article>
          <article><b>5</b><p><strong>{t("honestEntry")}</strong>{t("honestEntryText")}</p></article>
          <article><b>6</b><p><strong>{t("stayFair")}</strong>{t("stayFairText")}</p></article>
          <article><b>7</b><p><strong>{t("respectful")}</strong>{t("respectfulText")}</p></article>
        </div>}
      </section>

    </main>
  );
}
