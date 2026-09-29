import { motivationContent } from "./content.js";
import "./challenge-sync.js";

const SUPABASE_URL = "https://tlcuogpjvckiyaommofm.supabase.co",
  SUPABASE_ANON_KEY =
    "__SUPABASE_ANON_KEY__",
  HUMAN = "https://pushup-world-ranking.roman-dossenbach.chatgpt.site";
const ACCESS = "pushup-supabase-access-token",
  REFRESH = "pushup-supabase-refresh-token",
  PROFILE = "your-choice-shared-profile",
  STATE = "your-choice-challenge-v1";
const $ = (selector) => document.querySelector(selector);
let pendingVideo = null;
const words = {
  de: {
    stats: "Statistik",
    road: "Road to 100",
    motivation: "🔥 Motivation",
    signIn: "Anmelden",
    same: "Verwende dasselbe Konto wie bei THE.HUMAN.CHOICE.",
    email: "E-Mail",
    password: "Passwort",
    health:
      "Ich habe den Gesundheitshinweis gelesen und trainiere nur schmerzfrei.",
    create: "Neues Konto erstellen",
    backSignIn: "Zur Anmeldung",
    signed: "Angemeldet als",
    logout: "Abmelden",
    delete: "Konto löschen",
    profile: "Athletenprofil vervollständigen",
    profileInfo: "Diese Angaben werden auch für THE.HUMAN.CHOICE verwendet.",
    first: "Vorname",
    last: "Nachname",
    country: "Land",
    male: "Männlich",
    female: "Weiblich",
    saveProfile: "Profil übernehmen",
    eyebrow: "DEINE CHALLENGE. DEINE ENTSCHEIDUNG.",
    hero: "Wähle dein Ziel. Dann erreiche es.",
    heroText:
      "Bestimme selbst, wie viele Push-ups du in wie vielen Tagen schaffen willst.",
    challenge: "Deine Challenge festlegen",
    days: "Anzahl Tage",
    target: "Push-up-Ziel",
    start: "Challenge starten",
    restart: "Challenge neu starten",
    confirmRestart: "Challenge wirklich neu starten? Dein bisheriger Fortschritt wird auf 0 zurückgesetzt. Diese Aktion kann nicht rückgängig gemacht werden.",
    daily: "Tagesziel",
    today: "Heute",
    total: "Gesamt",
    remaining: "Noch offen",
    daysLeft: "Verbleibende Tage",
    tap: "ZUM ZÄHLEN TIPPEN",
    pending: "Noch nicht gespeichert",
    write: "Anzahl schreiben",
    add: "Hinzufügen",
    save: "Training speichern",
    progress: "Challenge-Fortschritt",
    back: "← Zurück zum Training",
    motTitle: "Stärke beginnt im Kopf.",
    motIntro:
      "60 Gedanken für Disziplin, Geduld und deinen nächsten sauberen Push-up.",
    checking: "Wird geprüft …",
    failed: "Anmeldung fehlgeschlagen.",
    mail: "Konto erstellt. Bitte bestätige den Link in deiner E-Mail und melde dich danach an.",
    profileRequired: "Bitte Vorname und Land eintragen.",
    challengeRequired:
      "Bitte gültige Tage und ein gültiges Push-up-Ziel eintragen.",
    savedChallenge: "Deine Challenge wurde gestartet.",
    nothing: "Bitte zuerst Push-ups zählen oder eine Anzahl hinzufügen.",
    saving: "Wird gespeichert …",
    saved: "Training gespeichert und an THE.HUMAN.CHOICE übertragen.",
    saveFailed:
      "Das Training konnte nicht gespeichert werden. Bitte erneut versuchen.",
    confirmDelete: "Konto und alle Trainingsdaten wirklich löschen?",
    deleted: "Dein Konto wurde gelöscht.",
    confirmHealth: "Bitte bestätige zuerst den Gesundheitshinweis.",
    loggedOut: "Du wurdest abgemeldet.",
  },
  en: {
    stats: "Statistics",
    road: "Road to 100",
    motivation: "🔥 Motivation",
    signIn: "Sign in",
    same: "Use the same account as THE.HUMAN.CHOICE.",
    email: "Email",
    password: "Password",
    health: "I have read the health notice and train only when pain-free.",
    create: "Create account",
    backSignIn: "Back to sign in",
    signed: "Signed in as",
    logout: "Sign out",
    delete: "Delete account",
    profile: "Complete athlete profile",
    profileInfo: "These details are also used for THE.HUMAN.CHOICE.",
    first: "First name",
    last: "Last name",
    country: "Country",
    male: "Male",
    female: "Female",
    saveProfile: "Save profile",
    eyebrow: "YOUR CHALLENGE. YOUR CHOICE.",
    hero: "Choose your goal. Then achieve it.",
    heroText:
      "Decide how many push-ups you want to complete and in how many days.",
    challenge: "Set your challenge",
    days: "Number of days",
    target: "Push-up target",
    start: "Start challenge",
    restart: "Restart challenge",
    confirmRestart: "Really restart the challenge? Your current progress will be reset to 0. This cannot be undone.",
    daily: "Daily target",
    today: "Today",
    total: "Total",
    remaining: "Remaining",
    daysLeft: "Days remaining",
    tap: "TAP TO COUNT",
    pending: "Not saved yet",
    write: "Enter number",
    add: "Add",
    save: "Save workout",
    progress: "Challenge progress",
    back: "← Back to training",
    motTitle: "Strength begins in the mind.",
    motIntro:
      "60 thoughts for discipline, patience and your next clean push-up.",
    checking: "Checking …",
    failed: "Sign-in failed.",
    mail: "Account created. Confirm the link in your email, then sign in.",
    profileRequired: "Please enter your first name and country.",
    challengeRequired: "Please enter valid days and a valid push-up target.",
    savedChallenge: "Your challenge has started.",
    nothing: "Count push-ups or add a number first.",
    saving: "Saving …",
    saved: "Workout saved and transferred to THE.HUMAN.CHOICE.",
    saveFailed: "The workout could not be saved. Please try again.",
    confirmDelete: "Delete your account and all training data?",
    deleted: "Your account has been deleted.",
    confirmHealth: "Please confirm the health notice first.",
    loggedOut: "You have been signed out.",
  },
  fr: {
    stats: "Statistiques",
    road: "Objectif 100",
    motivation: "🔥 Motivation",
    signIn: "Connexion",
    same: "Utilisez le même compte que pour THE.HUMAN.CHOICE.",
    email: "E-mail",
    password: "Mot de passe",
    health: "J’ai lu l’avis de santé et je m’entraîne uniquement sans douleur.",
    create: "Créer un compte",
    backSignIn: "Retour à la connexion",
    signed: "Connecté en tant que",
    logout: "Déconnexion",
    delete: "Supprimer le compte",
    profile: "Compléter le profil de l’athlète",
    profileInfo: "Ces informations sont aussi utilisées pour THE.HUMAN.CHOICE.",
    first: "Prénom",
    last: "Nom",
    country: "Pays",
    male: "Homme",
    female: "Femme",
    saveProfile: "Enregistrer le profil",
    eyebrow: "VOTRE DÉFI. VOTRE CHOIX.",
    hero: "Choisissez votre objectif. Puis atteignez-le.",
    heroText:
      "Décidez du nombre de pompes et du nombre de jours pour les réaliser.",
    challenge: "Définir votre défi",
    days: "Nombre de jours",
    target: "Objectif de pompes",
    start: "Démarrer le défi",
    restart: "Recommencer le défi",
    confirmRestart: "Voulez-vous vraiment recommencer le défi ? Votre progression actuelle sera remise à zéro. Cette action est irréversible.",
    daily: "Objectif quotidien",
    today: "Aujourd’hui",
    total: "Total",
    remaining: "Restant",
    daysLeft: "Jours restants",
    tap: "TOUCHER POUR COMPTER",
    pending: "Pas encore enregistré",
    write: "Saisir le nombre",
    add: "Ajouter",
    save: "Enregistrer l’entraînement",
    progress: "Progression du défi",
    back: "← Retour à l’entraînement",
    motTitle: "La force commence dans la tête.",
    motIntro:
      "60 pensées pour la discipline, la patience et votre prochaine pompe bien exécutée.",
    checking: "Vérification …",
    failed: "Échec de la connexion.",
    mail: "Compte créé. Confirmez le lien reçu par e-mail, puis connectez-vous.",
    profileRequired: "Saisissez votre prénom et votre pays.",
    challengeRequired: "Saisissez un nombre de jours et un objectif valides.",
    savedChallenge: "Votre défi a commencé.",
    nothing: "Comptez d’abord des pompes ou ajoutez un nombre.",
    saving: "Enregistrement …",
    saved: "Entraînement enregistré et transféré à THE.HUMAN.CHOICE.",
    saveFailed: "Impossible d’enregistrer l’entraînement. Réessayez.",
    confirmDelete: "Supprimer le compte et tous les entraînements ?",
    deleted: "Votre compte a été supprimé.",
    confirmHealth: "Confirmez d’abord l’avis de santé.",
    loggedOut: "Vous avez été déconnecté.",
  },
  es: {
    stats: "Estadísticas",
    road: "Camino a 100",
    motivation: "🔥 Motivación",
    signIn: "Iniciar sesión",
    same: "Usa la misma cuenta que en THE.HUMAN.CHOICE.",
    email: "Correo electrónico",
    password: "Contraseña",
    health: "He leído el aviso de salud y solo entreno sin dolor.",
    create: "Crear cuenta",
    backSignIn: "Volver al inicio",
    signed: "Sesión iniciada como",
    logout: "Cerrar sesión",
    delete: "Eliminar cuenta",
    profile: "Completar perfil del atleta",
    profileInfo: "Estos datos también se usan en THE.HUMAN.CHOICE.",
    first: "Nombre",
    last: "Apellido",
    country: "País",
    male: "Hombre",
    female: "Mujer",
    saveProfile: "Guardar perfil",
    eyebrow: "TU RETO. TU ELECCIÓN.",
    hero: "Elige tu objetivo. Después alcánzalo.",
    heroText: "Decide cuántas flexiones quieres completar y en cuántos días.",
    challenge: "Define tu reto",
    days: "Número de días",
    target: "Objetivo de flexiones",
    start: "Iniciar reto",
    restart: "Reiniciar reto",
    confirmRestart: "¿Realmente quieres reiniciar el reto? Tu progreso actual se restablecerá a 0. Esta acción no se puede deshacer.",
    daily: "Objetivo diario",
    today: "Hoy",
    total: "Total",
    remaining: "Pendientes",
    daysLeft: "Días restantes",
    tap: "TOCA PARA CONTAR",
    pending: "Aún sin guardar",
    write: "Introducir número",
    add: "Añadir",
    save: "Guardar entrenamiento",
    progress: "Progreso del reto",
    back: "← Volver al entrenamiento",
    motTitle: "La fuerza comienza en la mente.",
    motIntro:
      "60 pensamientos para la disciplina, la paciencia y tu próxima flexión bien hecha.",
    checking: "Comprobando …",
    failed: "No se pudo iniciar sesión.",
    mail: "Cuenta creada. Confirma el enlace del correo y después inicia sesión.",
    profileRequired: "Introduce tu nombre y país.",
    challengeRequired: "Introduce días y un objetivo válidos.",
    savedChallenge: "Tu reto ha comenzado.",
    nothing: "Primero cuenta flexiones o añade una cantidad.",
    saving: "Guardando …",
    saved: "Entrenamiento guardado y transferido a THE.HUMAN.CHOICE.",
    saveFailed: "No se pudo guardar el entrenamiento. Inténtalo de nuevo.",
    confirmDelete: "¿Eliminar la cuenta y todos los entrenamientos?",
    deleted: "Tu cuenta se ha eliminado.",
    confirmHealth: "Confirma primero el aviso de salud.",
    loggedOut: "Has cerrado sesión.",
  },
  it: {
    stats: "Statistiche",
    road: "Verso 100",
    motivation: "🔥 Motivazione",
    signIn: "Accedi",
    same: "Usa lo stesso account di THE.HUMAN.CHOICE.",
    email: "E-mail",
    password: "Password",
    health: "Ho letto l’avviso sulla salute e mi alleno solo senza dolore.",
    create: "Crea account",
    backSignIn: "Torna all’accesso",
    signed: "Accesso come",
    logout: "Esci",
    delete: "Elimina account",
    profile: "Completa il profilo dell’atleta",
    profileInfo: "Questi dati vengono usati anche per THE.HUMAN.CHOICE.",
    first: "Nome",
    last: "Cognome",
    country: "Paese",
    male: "Uomo",
    female: "Donna",
    saveProfile: "Salva profilo",
    eyebrow: "LA TUA SFIDA. LA TUA SCELTA.",
    hero: "Scegli il tuo obiettivo. Poi raggiungilo.",
    heroText: "Decidi quanti push-up vuoi completare e in quanti giorni.",
    challenge: "Imposta la tua sfida",
    days: "Numero di giorni",
    target: "Obiettivo push-up",
    start: "Avvia sfida",
    restart: "Riavvia sfida",
    confirmRestart: "Vuoi davvero riavviare la sfida? I progressi attuali verranno azzerati. Questa azione non può essere annullata.",
    daily: "Obiettivo giornaliero",
    today: "Oggi",
    total: "Totale",
    remaining: "Rimanenti",
    daysLeft: "Giorni rimanenti",
    tap: "TOCCA PER CONTARE",
    pending: "Non ancora salvati",
    write: "Inserisci numero",
    add: "Aggiungi",
    save: "Salva allenamento",
    progress: "Progresso della sfida",
    back: "← Torna all’allenamento",
    motTitle: "La forza comincia dalla mente.",
    motIntro:
      "60 pensieri per la disciplina, la pazienza e il tuo prossimo push-up ben eseguito.",
    checking: "Verifica …",
    failed: "Accesso non riuscito.",
    mail: "Account creato. Conferma il link nell’e-mail, poi accedi.",
    profileRequired: "Inserisci nome e paese.",
    challengeRequired: "Inserisci giorni e obiettivo validi.",
    savedChallenge: "La tua sfida è iniziata.",
    nothing: "Prima conta i push-up o aggiungi un numero.",
    saving: "Salvataggio …",
    saved: "Allenamento salvato e trasferito a THE.HUMAN.CHOICE.",
    saveFailed: "Impossibile salvare l’allenamento. Riprova.",
    confirmDelete: "Eliminare account e tutti gli allenamenti?",
    deleted: "Il tuo account è stato eliminato.",
    confirmHealth: "Conferma prima l’avviso sulla salute.",
    loggedOut: "Hai effettuato la disconnessione.",
  },
  pt: {
    stats: "Estatísticas",
    road: "Rumo a 100",
    motivation: "🔥 Motivação",
    signIn: "Entrar",
    same: "Use a mesma conta de THE.HUMAN.CHOICE.",
    email: "E-mail",
    password: "Palavra-passe",
    health: "Li o aviso de saúde e treino apenas sem dores.",
    create: "Criar conta",
    backSignIn: "Voltar ao início",
    signed: "Sessão iniciada como",
    logout: "Sair",
    delete: "Eliminar conta",
    profile: "Completar perfil do atleta",
    profileInfo: "Estes dados também são usados em THE.HUMAN.CHOICE.",
    first: "Nome",
    last: "Apelido",
    country: "País",
    male: "Masculino",
    female: "Feminino",
    saveProfile: "Guardar perfil",
    eyebrow: "O SEU DESAFIO. A SUA ESCOLHA.",
    hero: "Escolha o objetivo. Depois alcance-o.",
    heroText: "Decida quantas flexões quer completar e em quantos dias.",
    challenge: "Defina o seu desafio",
    days: "Número de dias",
    target: "Objetivo de flexões",
    start: "Iniciar desafio",
    restart: "Reiniciar desafio",
    confirmRestart: "Deseja realmente reiniciar o desafio? O progresso atual será reposto a 0. Esta ação não pode ser anulada.",
    daily: "Objetivo diário",
    today: "Hoje",
    total: "Total",
    remaining: "Em falta",
    daysLeft: "Dias restantes",
    tap: "TOQUE PARA CONTAR",
    pending: "Ainda não guardado",
    write: "Introduzir número",
    add: "Adicionar",
    save: "Guardar treino",
    progress: "Progresso do desafio",
    back: "← Voltar ao treino",
    motTitle: "A força começa na mente.",
    motIntro:
      "60 pensamentos para a disciplina, a paciência e a sua próxima flexão bem executada.",
    checking: "A verificar …",
    failed: "Falha ao iniciar sessão.",
    mail: "Conta criada. Confirme o link no e-mail e depois inicie sessão.",
    profileRequired: "Introduza o nome e o país.",
    challengeRequired: "Introduza dias e um objetivo válidos.",
    savedChallenge: "O seu desafio começou.",
    nothing: "Primeiro conte flexões ou adicione uma quantidade.",
    saving: "A guardar …",
    saved: "Treino guardado e transferido para THE.HUMAN.CHOICE.",
    saveFailed: "Não foi possível guardar o treino. Tente novamente.",
    confirmDelete: "Eliminar a conta e todos os treinos?",
    deleted: "A sua conta foi eliminada.",
    confirmHealth: "Confirme primeiro o aviso de saúde.",
    loggedOut: "A sessão foi terminada.",
  },
};
words.bg = { ...words.en, stats:"Статистика", road:"Път към 100", motivation:"🔥 Мотивация", signIn:"Вход", same:"Използвайте същия акаунт като в THE.HUMAN.CHOICE.", password:"Парола", create:"Създаване на акаунт", backSignIn:"Назад към вход", signed:"Влезли сте като", logout:"Изход", profile:"Попълнете профила на атлета", profileInfo:"Тези данни се използват и в THE.HUMAN.CHOICE.", first:"Име", last:"Фамилия", country:"Държава", male:"Мъж", female:"Жена", saveProfile:"Запазване на профила", eyebrow:"ВАШЕТО ПРЕДИЗВИКАТЕЛСТВО. ВАШИЯТ ИЗБОР.", hero:"Изберете целта. После я постигнете.", heroText:"Решете колко лицеви опори искате да направите и за колко дни.", challenge:"Задайте предизвикателството", days:"Брой дни", target:"Цел за лицеви опори", start:"Старт на предизвикателството", daily:"Дневна цел", today:"Днес", total:"Общо", remaining:"Остават", daysLeft:"Оставащи дни", tap:"ДОКОСНЕТЕ, ЗА ДА БРОИТЕ", pending:"Още не е запазено", write:"Въведете брой", add:"Добавяне", save:"Запазване на тренировката", progress:"Напредък на предизвикателството", back:"← Назад към тренировката", motTitle:"Силата започва в ума.", motIntro:"60 мисли за дисциплина, търпение и следващата ви правилна лицева опора.", savedChallenge:"Предизвикателството започна.", saving:"Запазване …", saved:"Тренировката е запазена и прехвърлена към THE.HUMAN.CHOICE." };
words.tr = { ...words.en, stats:"İstatistikler", road:"100'e Giden Yol", motivation:"🔥 Motivasyon", signIn:"Giriş yap", same:"THE.HUMAN.CHOICE ile aynı hesabı kullanın.", password:"Şifre", create:"Hesap oluştur", backSignIn:"Girişe dön", signed:"Oturum açıldı", logout:"Çıkış", profile:"Sporcu profilini tamamla", profileInfo:"Bu bilgiler THE.HUMAN.CHOICE için de kullanılır.", first:"Ad", last:"Soyadı", country:"Ülke", male:"Erkek", female:"Kadın", saveProfile:"Profili kaydet", eyebrow:"MÜCADELENİZ. SEÇİMİNİZ.", hero:"Hedefi seçin. Sonra ona ulaşın.", heroText:"Kaç şınavı kaç günde tamamlamak istediğinize karar verin.", challenge:"Mücadelenizi ayarlayın", days:"Gün sayısı", target:"Şınav hedefi", start:"Mücadeleyi başlat", daily:"Günlük hedef", today:"Bugün", total:"Toplam", remaining:"Kalan", daysLeft:"Kalan gün", tap:"SAYMAK İÇİN DOKUN", pending:"Henüz kaydedilmedi", write:"Sayı girin", add:"Ekle", save:"Antrenmanı kaydet", progress:"Mücadele ilerlemesi", back:"← Antrenmana dön", motTitle:"Güç zihinde başlar.", motIntro:"Disiplin, sabır ve bir sonraki temiz şınavınız için 60 düşünce.", savedChallenge:"Mücadeleniz başladı.", saving:"Kaydediliyor …", saved:"Antrenman kaydedildi ve THE.HUMAN.CHOICE'a aktarıldı." };
words.hu = { ...words.en, stats:"Statisztika", road:"Út 100 fekvőtámaszig", motivation:"🔥 Motiváció", signIn:"Bejelentkezés", same:"Használd ugyanazt a fiókot, mint a THE.HUMAN.CHOICE alkalmazásban.", password:"Jelszó", create:"Fiók létrehozása", backSignIn:"Vissza a bejelentkezéshez", signed:"Bejelentkezve mint", logout:"Kijelentkezés", profile:"Sportolói profil kitöltése", profileInfo:"Ezeket az adatokat a THE.HUMAN.CHOICE is használja.", first:"Keresztnév", last:"Vezetéknév", country:"Ország", male:"Férfi", female:"Nő", saveProfile:"Profil mentése", eyebrow:"A TE KIHÍVÁSOD. A TE DÖNTÉSED.", hero:"Válaszd ki a célt. Majd érd el.", heroText:"Döntsd el, hány fekvőtámaszt és hány nap alatt szeretnél teljesíteni.", challenge:"Kihívás beállítása", days:"Napok száma", target:"Fekvőtámasz-cél", start:"Kihívás indítása", daily:"Napi cél", today:"Ma", total:"Összesen", remaining:"Hátralévő", daysLeft:"Hátralévő napok", tap:"ÉRINTSD MEG A SZÁMLÁLÁSHOZ", pending:"Még nincs mentve", write:"Ismétlésszám", add:"Hozzáadás", save:"Edzés mentése", progress:"Kihívás állása", back:"← Vissza az edzéshez", motTitle:"Az erő a fejben kezdődik.", motIntro:"60 gondolat a fegyelemhez, türelemhez és a következő szabályos fekvőtámaszhoz.", savedChallenge:"A kihívás elindult.", saving:"Mentés …", saved:"Az edzés mentve és átadva a THE.HUMAN.CHOICE rendszerének." };
words.ar = { ...words.en, stats:"الإحصاءات", road:"الطريق إلى 100", motivation:"🔥 التحفيز", signIn:"تسجيل الدخول", same:"استخدم الحساب نفسه في THE.HUMAN.CHOICE.", password:"كلمة المرور", create:"إنشاء حساب", backSignIn:"العودة لتسجيل الدخول", signed:"تم تسجيل الدخول باسم", logout:"تسجيل الخروج", profile:"أكمل ملف الرياضي", profileInfo:"تُستخدم هذه البيانات أيضًا في THE.HUMAN.CHOICE.", first:"الاسم الأول", last:"اسم العائلة", country:"الدولة", male:"ذكر", female:"أنثى", saveProfile:"حفظ الملف", eyebrow:"تحديك. اختيارك.", hero:"اختر الهدف، ثم حققه.", heroText:"حدد عدد تمارين الضغط والمدة بالأيام.", challenge:"حدد تحديك", days:"عدد الأيام", target:"هدف تمارين الضغط", start:"بدء التحدي", daily:"الهدف اليومي", today:"اليوم", total:"الإجمالي", remaining:"المتبقي", daysLeft:"الأيام المتبقية", tap:"اضغط للعد", pending:"لم يُحفظ بعد", write:"أدخل العدد", add:"إضافة", save:"حفظ التمرين", progress:"تقدم التحدي", back:"العودة إلى التدريب →", motTitle:"القوة تبدأ في العقل.", motIntro:"60 فكرة للانضباط والصبر وتمرين الضغط الصحيح التالي.", savedChallenge:"بدأ تحديك.", saving:"جارٍ الحفظ …", saved:"تم حفظ التدريب ونقله إلى THE.HUMAN.CHOICE." };
const currentLocalDay = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
};
let lang = localStorage.getItem("pushup-language") || "de",
  signup = false,
  profile = null,
  entries = [],
  state = JSON.parse(localStorage.getItem(STATE) || "null") || {
    days: 0,
    target: 0,
    start: null,
    total: 0,
    today: 0,
    todayDate: currentLocalDay(),
    pending: 0,
  };
if (!words[lang]) lang = "de";
if (state.todayDate !== currentLocalDay()) {
  state.today = 0;
  state.todayDate = currentLocalDay();
  saveState();
}
const t = (key) => words[lang][key] || words.de[key] || key;
function saveState() {
  localStorage.setItem(STATE, JSON.stringify(state));
}
async function refreshChallengeState() {
  const response = await central("/api/challenge", { cache: "no-store" });
  if (!response.ok) return;
  const data = await response.json();
  if (data.challenge) {
    state = { ...state, ...data.challenge, pending: state.pending || 0 };
    saveState();
    render();
  }
}
function renderEntries() {
  const list = $("#entriesList"), empty = $("#entriesEmpty");
  if (!list || !empty) return;
  empty.hidden = entries.length > 0;
  list.innerHTML = entries.slice(0, 20).map((entry) => {
    const date = new Date(String(entry.createdAt).replace(" ", "T") + "Z");
    const stamp = Number.isNaN(date.getTime()) ? entry.entryDate : date.toLocaleString(lang, { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
    return `<div class="entry-item"><span><strong>${Number(entry.reps).toLocaleString(lang)} Push-ups</strong><small>${stamp}${entry.editedAt ? " · korrigiert" : ""}</small></span><button class="edit-entry" data-id="${entry.id}" data-reps="${entry.reps}" type="button">Korrigieren</button><button class="delete-entry" data-id="${entry.id}" type="button">Löschen</button></div>`;
  }).join("");
  list.querySelectorAll(".edit-entry").forEach((button) => button.onclick = async () => {
    const value = prompt("Neue Anzahl Push-ups:", button.dataset.reps);
    if (value === null) return;
    const reps = Math.round(Number(value));
    if (!Number.isInteger(reps) || reps < 1 || reps > 121) return alert("Bitte eine ganze Zahl zwischen 1 und 121 eingeben.");
    const response = await central("/api/history", { method:"PATCH", headers:{"content-type":"application/json"}, body:JSON.stringify({ athleteId:profile.id || profile.athleteId, entryId:Number(button.dataset.id), reps }) });
    if (!response.ok) return alert("Der Eintrag konnte nicht korrigiert werden.");
    await Promise.all([loadEntries(), refreshChallengeState()]);
  });
  list.querySelectorAll(".delete-entry").forEach((button) => button.onclick = async () => {
    if (!confirm("Diesen gespeicherten Eintrag wirklich löschen?")) return;
    const response = await central("/api/history", { method:"DELETE", headers:{"content-type":"application/json"}, body:JSON.stringify({ athleteId:profile.id || profile.athleteId, entryId:Number(button.dataset.id) }) });
    if (!response.ok) return alert("Der Eintrag konnte nicht gelöscht werden.");
    await Promise.all([loadEntries(), refreshChallengeState()]);
  });
}
async function loadEntries() {
  if (!profile?.id && !profile?.athleteId) return;
  const response = await central(`/api/history?athleteId=${encodeURIComponent(profile.id || profile.athleteId)}`, { cache:"no-store" });
  if (!response.ok) return;
  const data = await response.json();
  entries = data.entries || [];
  renderEntries();
}
function session(data) {
  if (data.access_token) localStorage.setItem(ACCESS, data.access_token);
  if (data.refresh_token) localStorage.setItem(REFRESH, data.refresh_token);
}
function clearSession() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}
function tokenIsFresh(access) {
  try {
    const payload = JSON.parse(
      atob(access.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return Number(payload.exp || 0) * 1000 > Date.now() + 60000;
  } catch {
    return false;
  }
}
async function refresh() {
  const refresh_token = localStorage.getItem(REFRESH);
  if (!refresh_token) return null;
  try {
    const r = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({ refresh_token }),
      },
    );
    if (!r.ok) {
      if ((r.status === 400 || r.status === 401) && localStorage.getItem(REFRESH) === refresh_token) clearSession();
      return null;
    }
    const d = await r.json();
    session(d);
    return d.access_token;
  } catch {
    return null;
  }
}
async function token() {
  const access = localStorage.getItem(ACCESS);
  return access && tokenIsFresh(access) ? access : await refresh();
}
async function central(path, init = {}) {
  let access = await token();
  const send = () =>
    fetch(HUMAN + path, {
      ...init,
      headers: { ...(init.headers || {}), authorization: `Bearer ${access}` },
    });
  let r = await send();
  if (r.status === 401 && (access = await refresh())) r = await send();
  return r;
}
const ids = {
  statsLink: "stats",
  roadLink: "road",
  motivationButton: "motivation",
  authTitle: "signIn",
  sameAccount: "same",
  emailLabel: "email",
  passwordLabel: "password",
  healthText: "health",
  signedIn: "signed",
  logout: "logout",
  profileTitle: "profile",
  profileInfo: "profileInfo",
  saveProfile: "saveProfile",
  eyebrow: "eyebrow",
  heroTitle: "hero",
  heroText: "heroText",
  challengeTitle: "challenge",
  daysLabel: "days",
  targetLabel: "target",
  saveChallenge: "start",
  dailyTargetLabel: "daily",
  todayLabel: "today",
  totalLabel: "total",
  remainingLabel: "remaining",
  daysLeftLabel: "daysLeft",
  tapLabel: "tap",
  saveWorkout: "save",
  progressLabel: "progress",
  backTraining: "back",
  motivationTitle: "motTitle",
  motivationIntro: "motIntro",
};
function applyLanguage() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  $("#language").value = lang;
  for (const [id, key] of Object.entries(ids)) {
    const el = $("#" + id);
    if (el) el.textContent = t(key);
  }
  $("#authTitle").textContent = signup ? t("create") : t("signIn");
  $("#authSubmit").textContent = signup ? t("create") : t("signIn");
  $("#authSwitch").textContent = signup ? t("backSignIn") : t("create");
  $("#firstName").placeholder = t("first");
  $("#lastName").placeholder = t("last");
  $("#country").placeholder = t("country");
  $("#manualCount").placeholder = "0";
  $("#pendingLabel").textContent = ({de:"Aktuell",en:"Current",fr:"Actuel",es:"Actual",it:"Attuale",pt:"Atual",bg:"Текущо",tr:"Güncel",hu:"Aktuális",ar:"الحالي"})[lang] || "Current";
  if(lang==="hu"){$("#helpTitle").textContent="Fekvőtámasz-kihívás – Súgó";$("#helpDialog .help-dialog-body").innerHTML="<ol><li>Határozd meg a napok számát és a fekvőtámasz-célt.</li><li>Írd be vagy mondd ki magyarul a kész sorozat ismétlésszámát.</li><li>Mentsd az edzést; az érték automatikusan bekerül a központi statisztikába.</li><li>A mentett sorozatok külön javíthatók vagy törölhetők.</li><li>Az elindított kihívás nem módosítható, csak két megerősítés után törölhető.</li></ol>"}
  $("#gender").options[0].text = t("male");
  $("#gender").options[1].text = t("female");
  paintMotivation();
  render();
}
function render() {
  const elapsed = state.start
      ? Math.max(
          0,
          Math.floor((Date.now() - new Date(state.start).getTime()) / 86400000),
        )
      : 0,
    left = state.days ? Math.max(0, state.days - elapsed) : 0,
    daily = state.days ? Math.ceil(state.target / state.days) : 0,
    remaining = Math.max(0, state.target - state.total),
    pct = state.target ? Math.min(100, (state.total / state.target) * 100) : 0;
  $("#dailyTarget").textContent = daily || "–";
  $("#today").textContent = state.today;
  $("#total").textContent = state.total;
  $("#remaining").textContent = state.target ? remaining : "–";
  $("#daysLeft").textContent = state.days ? left : "–";
  $("#pending").textContent = state.pending;
  if (document.activeElement !== $("#manualCount")) $("#manualCount").value = state.pending || "";
  $("#progressText").textContent = `${pct.toFixed(pct < 10 ? 1 : 0)} %`;
  $("#progressBar").style.width = pct + "%";
  const challengeSection = $(".challenge");
  challengeSection.hidden = Boolean(state.start);
  $("#saveChallenge").textContent = t("start");
  $("#startDateRow").hidden = true;
  $("#resetChallenge").hidden = !state.start;
  $("#resetChallenge").textContent = lang === "hu" ? "Kihívás törlése" : "Challenge löschen";
  $("#days").value = state.days || "";
  $("#target").value = state.target || "";
  $("#startDate").value = state.start ? new Date(state.start).toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
}
function paintMotivation() {
  const c = motivationContent[lang];
  $("#goldenTitle").textContent = c.goldenRulesTitle;
  $("#goldenList").innerHTML = c.goldenRules
    .map(([a, b]) => `<li><p><strong>${a}</strong>${b}</p></li>`)
    .join("");
  $("#motivationGrid").innerHTML = c.quotes
    .map(
      (q, i) =>
        `<article class="quote"><span>${String(i + 1).padStart(2, "0")}</span><p>${q}</p></article>`,
    )
    .join("");
}
function updateHeroPhoto(athleteProfile) {
  const hero = $(".hero");
  if (!hero) return;
  hero.classList.remove("has-profile-photo");
  hero.style.backgroundImage =
    "linear-gradient(0deg,rgba(5,12,8,.94),rgba(5,12,8,.16))";
  if (!athleteProfile?.id) return;
  const photoUrl = `${HUMAN}/api/profile-photo?athleteId=${encodeURIComponent(athleteProfile.id)}&v=${Date.now()}`;
  const image = new Image();
  image.onload = () => {
    hero.style.backgroundImage =
      `linear-gradient(0deg,rgba(5,12,8,.94),rgba(5,12,8,.16)),url("${photoUrl}")`;
    hero.classList.add("has-profile-photo");
  };
  image.onerror = () => hero.classList.remove("has-profile-photo");
  image.src = photoUrl;
}
async function init() {
  let access = await token();
  if (!access) return;
  let r;
  try {
    r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, authorization: `Bearer ${access}` },
    });
    if (r.status === 401 && (access = await refresh()))
      r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          authorization: `Bearer ${access}`,
        },
      });
  } catch {
    return;
  }
  if (!r.ok) {
    if ((r.status === 400 || r.status === 401) && localStorage.getItem(ACCESS) === access) clearSession();
    return;
  }
  const user = await r.json();
  $("#authCard").hidden = true;
  $("#account").hidden = false;
  $("#training").hidden = false;
  $("#accountEmail").textContent = user.email || "";
  try {
    const p = await central("/api/profile", { cache: "no-store" }),
      d = await p.json();
    profile = p.ok ? d.profile : null;
  } catch {}
  profile = profile || JSON.parse(localStorage.getItem(PROFILE) || "null");
  $("#profile").hidden = !!profile;
  updateHeroPhoto(profile);
  render();
  await loadEntries();
}
$("#language").onchange = (e) => {
  lang = e.target.value;
  localStorage.setItem("pushup-language", lang);
  applyLanguage();
};
$("#openHelp").onclick = () => $("#helpDialog").showModal();
$("#closeHelp").onclick = () => $("#helpDialog").close();
$("#helpDialog").onclick = (event) => {
  if (event.target === $("#helpDialog")) $("#helpDialog").close();
};
$("#authSwitch").onclick = () => {
  signup = !signup;
  $("#healthRow").hidden = !signup;
  applyLanguage();
};
$("#authForm").onsubmit = async (e) => {
  e.preventDefault();
  if (signup && !$("#health").checked)
    return ($("#authMessage").textContent = t("confirmHealth"));
  $("#authMessage").textContent = t("checking");
  const endpoint = signup
      ? "/auth/v1/signup"
      : "/auth/v1/token?grant_type=password",
    r = await fetch(SUPABASE_URL + endpoint, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: $("#email").value.trim(),
        password: $("#password").value,
        ...(signup ? { options: { emailRedirectTo: location.origin } } : {}),
      }),
    }),
    d = await r.json();
  if (!r.ok)
    return ($("#authMessage").textContent =
      d.error_description || d.msg || t("failed"));
  if (d.access_token) {
    session(d);
    await init();
  } else $("#authMessage").textContent = t("mail");
};
$("#logout").onclick = () => {
  clearSession();
  location.reload();
};
$("#saveProfile").onclick = async () => {
  const name = $("#firstName").value.trim(),
    lastName = $("#lastName").value.trim(),
    country = $("#country").value.trim(),
    gender = $("#gender").value;
  if (name.length < 2 || country.length < 2) return alert(t("profileRequired"));
  const athleteId = profile?.id || profile?.athleteId || crypto.randomUUID();
  const response = await central("/api/profile", {
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({ athleteId, name, lastName, country, gender, birthDate:"" }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.profile) return alert(result.error || t("failed"));
  profile = result.profile;
  localStorage.setItem(PROFILE, JSON.stringify(profile));
  $("#profile").hidden = true;
};
$("#saveChallenge").onclick = () => {
  const days = Number($("#days").value),
    target = Number($("#target").value);
  if (
    !Number.isInteger(days) ||
    days < 1 ||
    !Number.isInteger(target) ||
    target < 1
  )
    return alert(t("challengeRequired"));
  if (state.start) return alert("Eine gestartete Challenge kann nicht verändert werden.");
  state = { ...state, days, target, start:new Date().toISOString(), total:0, today:0, pending:0, todayDate:currentLocalDay() };
  saveState();
  render();
  $("#saveMessage").textContent = t("savedChallenge");
};
$("#manualCount").addEventListener("input", (event) => {
  const n = Number(event.currentTarget.value);
  state.pending = Number.isInteger(n) && n > 0 ? n : 0;
  saveState();
  $("#pending").textContent = state.pending;
});
$("#videoProof").addEventListener("change", (event) => {
  pendingVideo = event.currentTarget.files?.[0] || null;
  $("#videoProofButton").classList.toggle("has-video", Boolean(pendingVideo));
  $("#videoProofButton").title = pendingVideo ? pendingVideo.name : "Video-Nachweis hinzufügen";
});
$("#resetPending").onclick = () => {
  if (state.pending < 1 || confirm("Die noch nicht gespeicherte Eingabe zurücksetzen?")) {
    state.pending = 0;
    saveState();
    render();
    $("#saveMessage").textContent = "Eingabe wurde zurückgesetzt.";
  }
};
$("#resetChallenge").onclick = async () => {
  if (!state.start || !confirm("Challenge wirklich löschen?")) return;
  if (!confirm("Challenge endgültig löschen? Dieser Schritt kann nicht rückgängig gemacht werden.")) return;
  const response = await central("/api/challenge", { method:"DELETE" });
  if (!response.ok) return ($("#saveMessage").textContent = "Challenge konnte nicht gelöscht werden.");
  state = { days:0, target:0, start:null, total:0, today:0, pending:0, todayDate:currentLocalDay() };
  saveState(); render();
  $("#saveMessage").textContent = "Challenge wurde gelöscht.";
};
$("#saveWorkout").onclick = async () => {
  if (state.pending < 1) return ($("#saveMessage").textContent = t("nothing"));
  if (!profile) return ($("#profile").hidden = false);
  $("#saveMessage").textContent = t("saving");
  const reps = state.pending,
    requestId = crypto.randomUUID(),
    athleteId = profile.id || profile.athleteId || crypto.randomUUID(),
    r = await central("/api/leaderboard", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        athleteId,
        requestId,
        name: profile.name,
        lastName: profile.lastName || "",
        country: profile.country,
        gender: profile.gender || "male",
        birthDate: profile.birthDate || "",
        reps,
        timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });
  if (!r.ok) return ($("#saveMessage").textContent = t("saveFailed"));
  const d = await r.json();
  let videoMessage = "";
  if (pendingVideo && d.entryId) {
    const form = new FormData();
    form.set("athleteId", d.athleteId || athleteId);
    form.set("entryId", String(d.entryId));
    form.set("video", pendingVideo);
    const upload = await central("/api/evidence", { method:"POST", body:form });
    videoMessage = upload.ok ? " Video-Nachweis gespeichert." : " Video-Nachweis konnte nicht gespeichert werden.";
  }
  profile = { ...profile, id: d.athleteId || athleteId };
  localStorage.setItem(PROFILE, JSON.stringify(profile));
  state = d.challenge
    ? { ...state, ...d.challenge, pending: 0 }
    : { ...state, total: state.total + reps, today: state.today + reps, pending: 0 };
  saveState();
  render();
  pendingVideo = null;
  $("#videoProof").value = "";
  $("#videoProofButton").classList.remove("has-video");
  await loadEntries();
  $("#saveMessage").textContent = t("saved") + videoMessage;
  navigator.vibrate?.(60);
};
$("#motivationButton").onclick = () => {
  $("#training").hidden = true;
  $("#motivationPage").hidden = false;
  scrollTo({ top: 0, behavior: "smooth" });
};
$("#backTraining").onclick = () => {
  $("#motivationPage").hidden = true;
  $("#training").hidden = false;
  scrollTo({ top: 0, behavior: "smooth" });
};
if (document.modelContext?.registerTool) {
  const signal = new AbortController().signal;
  void document.modelContext.registerTool(
    {
      name: "configure_pushup_challenge",
      title: "Configure push-up challenge",
      description:
        "Set the number of days and total push-up target for the visible challenge.",
      inputSchema: {
        type: "object",
        properties: {
          days: { type: "integer", minimum: 1, maximum: 3650 },
          target: { type: "integer", minimum: 1, maximum: 100000000 },
        },
        required: ["days", "target"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (
          !Number.isInteger(input?.days) ||
          input.days < 1 ||
          !Number.isInteger(input?.target) ||
          input.target < 1
        )
          throw new Error("Invalid challenge values");
        state = {
          ...state,
          days: input.days,
          target: input.target,
          start: new Date().toISOString(),
          total: 0,
          today: 0,
          pending: 0,
          todayDate: currentLocalDay(),
        };
        saveState();
        render();
        return {
          days: state.days,
          target: state.target,
          dailyTarget: Math.ceil(state.target / state.days),
        };
      },
    },
    { signal },
  );
  void document.modelContext.registerTool(
    {
      name: "stage_pushup_repetitions",
      title: "Stage push-up repetitions",
      description:
        "Set the completed repetitions shown in the visible unsaved workout counter. This does not save them to the account.",
      inputSchema: {
        type: "object",
        properties: {
          repetitions: { type: "integer", minimum: 1, maximum: 5000 },
        },
        required: ["repetitions"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (
          !Number.isInteger(input?.repetitions) ||
          input.repetitions < 1 ||
          input.repetitions > 5000
        )
          throw new Error("Invalid repetition count");
        state.pending = input.repetitions;
        saveState();
        render();
        return { pendingRepetitions: state.pending };
      },
    },
    { signal },
  );
}
applyLanguage();
init();
