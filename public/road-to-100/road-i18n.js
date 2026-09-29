(function () {
  const copy = {
    de: {
      language: "Sprache",
      openHuman: "THE.HUMAN.CHOICE öffnen",
      signIn: "Anmelden",
      sameAccount: "Verwende dasselbe Konto wie bei THE.HUMAN.CHOICE.",
      email: "E-Mail",
      password: "Passwort",
      health:
        "Ich habe den Gesundheitshinweis gelesen und trainiere nur schmerzfrei.",
      create: "Neues Konto erstellen",
      backSignIn: "Zur Anmeldung",
      checking: "Wird geprüft …",
      healthRequired: "Bitte bestätige zuerst den Gesundheitshinweis.",
      signInFailed: "Anmeldung fehlgeschlagen.",
      confirmMail:
        "Konto erstellt. Bitte bestätige den Link in deiner E-Mail und melde dich danach an.",
      signedIn: "Angemeldet als",
      logout: "Abmelden",
      deleteAccount: "Konto und Trainingsdaten löschen",
      loggedOut: "Du wurdest abgemeldet.",
      deleteFirst:
        "Konto wirklich löschen? Profil und alle Trainingsdaten werden endgültig gelöscht.",
      deleteLast:
        "Letzte Bestätigung: Diese Löschung kann nicht rückgängig gemacht werden.",
      deleteFailed: "Das Konto konnte nicht gelöscht werden.",
      deleted: "Dein Profil und deine Trainingsdaten wurden gelöscht.",
      profile: "Athletenprofil vervollständigen",
      profileInfo: "Diese Angaben werden auch für THE.HUMAN.CHOICE verwendet.",
      firstName: "Vorname",
      lastName: "Nachname",
      country: "Land",
      male: "Männlich",
      female: "Weiblich",
      saveProfile: "Profil übernehmen",
      profileRequired: "Bitte Vorname und Land eintragen.",
      trainWith: "Trainiere mit Roman Dossenbach",
      hero: "100 Push-ups am Stück.",
      heroSub: "Technik. Geduld. Zehn ehrliche Sätze pro Tag.",
      currentMax: "Aktuelles Maximum",
      yourSet: "Dein Satz",
      todayDone: "Heute abgeschlossen",
      maxTitle: "1. Starte mit deinem MAX-Test",
      maxPlaceholder: "Saubere Push-ups am Stück",
      startPlan: "Plan starten",
      maxInfo:
        "Dein Trainingssatz beträgt 60 % deines Maximums. Teste dein Maximum alle 7 Tage neu und passe den Plan an.",
      setsTitle: "2. Deine 10 Sätze heute",
      setsInfo:
        "Tippe auf einen Satz und trage die tatsächlich geschafften Wiederholungen ein. Unter 82 % der Vorgabe gilt als nicht erreicht, ab 82 % als erreicht.",
      rewardTitle: "Belohnung des Tages",
      hidden: "🔒 Noch verborgen",
      rewardHidden:
        "Dein Motivationsspruch erscheint erst, wenn alle 10 Sätze erreicht sind.",
      technique: "Korrekte Technik",
      tech1: "Körper von Kopf bis Ferse in einer geraden Linie halten.",
      tech2:
        "Absenken, bis der Ellbogen mit dem Unterarm ca. 90 Grad bildet. Hände schulterbreit aufsetzen, Handflächen leicht nach innen drehen.",
      tech3: "Vollständig hochdrücken und jede Wiederholung ehrlich zählen.",
      principle: "Romans Prinzip",
      principleText:
        "„Du brauchst kein Equipment und keine Trainingskleider. Nur den Willen, Geduld – und die Ehrlichkeit, jeden Satz aufzuschreiben.“",
      recordHolder: "Fünffacher Guinness-Weltrekordhalter · Roman Dossenbach",
      reset: "Plan zurücksetzen",
      motivation: "🔥 Motivation",
      day: "Tag {day} von 60",
      set: "Satz {set}",
      doneDay: "✓ Tag {day} geschafft",
      enterSet:
        "Satz {set}: Wie viele Wiederholungen hast du geschafft?\nVorgabe: {target} · Mindestwert: {minimum} (82 %)",
      invalidNumber: "Bitte eine gültige Zahl eingeben.",
      notReached: "Nicht erreicht: Mindestens {minimum} Wiederholungen nötig.",
      invalidMax: "Bitte gib 1 bis 100 saubere Push-ups ein.",
      confirmReset: "Den gesamten 60-Tage-Plan zurücksetzen?",
      complete: "Training abgeschlossen",
      strong: "Stark gemacht!",
      finishDay: "Tag abschließen",
    },
    en: {
      language: "Language",
      openHuman: "Open THE.HUMAN.CHOICE",
      signIn: "Sign in",
      sameAccount: "Use the same account as THE.HUMAN.CHOICE.",
      email: "Email",
      password: "Password",
      health: "I have read the health notice and train only when pain-free.",
      create: "Create account",
      backSignIn: "Back to sign in",
      checking: "Checking …",
      healthRequired: "Please confirm the health notice first.",
      signInFailed: "Sign-in failed.",
      confirmMail:
        "Account created. Please confirm the link in your email, then sign in.",
      signedIn: "Signed in as",
      logout: "Sign out",
      deleteAccount: "Delete account and training data",
      loggedOut: "You have been signed out.",
      deleteFirst:
        "Delete your account? Your profile and all training data will be permanently deleted.",
      deleteLast: "Final confirmation: This deletion cannot be undone.",
      deleteFailed: "The account could not be deleted.",
      deleted: "Your profile and training data have been deleted.",
      profile: "Complete athlete profile",
      profileInfo: "These details are also used for THE.HUMAN.CHOICE.",
      firstName: "First name",
      lastName: "Last name",
      country: "Country",
      male: "Male",
      female: "Female",
      saveProfile: "Save profile",
      profileRequired: "Please enter your first name and country.",
      trainWith: "Train with Roman Dossenbach",
      hero: "100 push-ups in one set.",
      heroSub: "Technique. Patience. Ten honest sets a day.",
      currentMax: "Current maximum",
      yourSet: "Your set",
      todayDone: "Completed today",
      maxTitle: "1. Start with your MAX test",
      maxPlaceholder: "Clean push-ups in one set",
      startPlan: "Start plan",
      maxInfo:
        "Your training set is 60% of your maximum. Retest your maximum every 7 days and adjust the plan.",
      setsTitle: "2. Your 10 sets today",
      setsInfo:
        "Tap a set and enter the repetitions you actually completed. Below 82% of the target is not reached; 82% or more is reached.",
      rewardTitle: "Reward of the day",
      hidden: "🔒 Still hidden",
      rewardHidden:
        "Your motivational quote appears after all 10 sets have been completed.",
      technique: "Correct technique",
      tech1: "Keep your body in a straight line from head to heel.",
      tech2:
        "Lower until the elbow forms an angle of about 90 degrees with the forearm. Place hands shoulder-width apart and turn palms slightly inward.",
      tech3: "Push all the way up and count every repetition honestly.",
      principle: "Roman’s principle",
      principleText:
        "“You need no equipment or training clothes. Only willpower, patience – and the honesty to record every set.”",
      recordHolder: "Five-time Guinness World Record holder · Roman Dossenbach",
      reset: "Reset plan",
      motivation: "🔥 Motivation",
      day: "Day {day} of 60",
      set: "Set {set}",
      doneDay: "✓ Day {day} completed",
      enterSet:
        "Set {set}: How many repetitions did you complete?\nTarget: {target} · Minimum: {minimum} (82%)",
      invalidNumber: "Please enter a valid number.",
      notReached: "Not reached: At least {minimum} repetitions are required.",
      invalidMax: "Please enter 1 to 100 clean push-ups.",
      confirmReset: "Reset the entire 60-day plan?",
      complete: "Workout completed",
      strong: "Great work!",
      finishDay: "Finish day",
    },
    fr: {
      language: "Langue",
      openHuman: "Ouvrir THE.HUMAN.CHOICE",
      signIn: "Connexion",
      sameAccount: "Utilisez le même compte que pour THE.HUMAN.CHOICE.",
      email: "E-mail",
      password: "Mot de passe",
      health:
        "J’ai lu l’avis de santé et je m’entraîne uniquement sans douleur.",
      create: "Créer un compte",
      backSignIn: "Retour à la connexion",
      checking: "Vérification …",
      healthRequired: "Veuillez d’abord confirmer l’avis de santé.",
      signInFailed: "Échec de la connexion.",
      confirmMail:
        "Compte créé. Confirmez le lien reçu par e-mail, puis connectez-vous.",
      signedIn: "Connecté en tant que",
      logout: "Déconnexion",
      deleteAccount: "Supprimer le compte et les entraînements",
      loggedOut: "Vous avez été déconnecté.",
      deleteFirst:
        "Supprimer le compte ? Le profil et tous les entraînements seront définitivement supprimés.",
      deleteLast: "Dernière confirmation : cette suppression est irréversible.",
      deleteFailed: "Le compte n’a pas pu être supprimé.",
      deleted: "Votre profil et vos entraînements ont été supprimés.",
      profile: "Compléter le profil de l’athlète",
      profileInfo:
        "Ces informations sont également utilisées pour THE.HUMAN.CHOICE.",
      firstName: "Prénom",
      lastName: "Nom",
      country: "Pays",
      male: "Homme",
      female: "Femme",
      saveProfile: "Enregistrer le profil",
      profileRequired: "Veuillez saisir votre prénom et votre pays.",
      trainWith: "Entraînez-vous avec Roman Dossenbach",
      hero: "100 pompes d’affilée.",
      heroSub: "Technique. Patience. Dix séries honnêtes par jour.",
      currentMax: "Maximum actuel",
      yourSet: "Votre série",
      todayDone: "Terminé aujourd’hui",
      maxTitle: "1. Commencez par votre test MAX",
      maxPlaceholder: "Pompes correctes d’affilée",
      startPlan: "Démarrer le programme",
      maxInfo:
        "Votre série d’entraînement correspond à 60 % de votre maximum. Retestez votre maximum tous les 7 jours et adaptez le programme.",
      setsTitle: "2. Vos 10 séries du jour",
      setsInfo:
        "Touchez une série et saisissez les répétitions réellement effectuées. En dessous de 82 % de l’objectif, la série n’est pas validée ; à partir de 82 %, elle l’est.",
      rewardTitle: "Récompense du jour",
      hidden: "🔒 Encore cachée",
      rewardHidden:
        "Votre phrase de motivation apparaît lorsque les 10 séries sont terminées.",
      technique: "Technique correcte",
      tech1: "Gardez le corps aligné de la tête aux talons.",
      tech2:
        "Descendez jusqu’à ce que le coude forme un angle d’environ 90 degrés avec l’avant-bras. Placez les mains à largeur d’épaules, légèrement tournées vers l’intérieur.",
      tech3: "Remontez complètement et comptez chaque répétition honnêtement.",
      principle: "Le principe de Roman",
      principleText:
        "« Pas besoin d’équipement ni de tenue de sport. Seulement de volonté, de patience – et de l’honnêteté pour noter chaque série. »",
      recordHolder:
        "Quintuple détenteur d’un record Guinness · Roman Dossenbach",
      reset: "Réinitialiser le programme",
      motivation: "🔥 Motivation",
      day: "Jour {day} sur 60",
      set: "Série {set}",
      doneDay: "✓ Jour {day} terminé",
      enterSet:
        "Série {set} : combien de répétitions avez-vous effectuées ?\nObjectif : {target} · Minimum : {minimum} (82 %)",
      invalidNumber: "Veuillez saisir un nombre valide.",
      notReached:
        "Non validé : au moins {minimum} répétitions sont nécessaires.",
      invalidMax: "Veuillez saisir de 1 à 100 pompes correctes.",
      confirmReset: "Réinitialiser tout le programme de 60 jours ?",
      complete: "Entraînement terminé",
      strong: "Bravo !",
      finishDay: "Terminer la journée",
    },
    es: {
      language: "Idioma",
      openHuman: "Abrir THE.HUMAN.CHOICE",
      signIn: "Iniciar sesión",
      sameAccount: "Usa la misma cuenta que en THE.HUMAN.CHOICE.",
      email: "Correo electrónico",
      password: "Contraseña",
      health: "He leído el aviso de salud y solo entreno sin dolor.",
      create: "Crear cuenta",
      backSignIn: "Volver al inicio de sesión",
      checking: "Comprobando …",
      healthRequired: "Confirma primero el aviso de salud.",
      signInFailed: "No se pudo iniciar sesión.",
      confirmMail:
        "Cuenta creada. Confirma el enlace del correo y después inicia sesión.",
      signedIn: "Sesión iniciada como",
      logout: "Cerrar sesión",
      deleteAccount: "Eliminar cuenta y entrenamientos",
      loggedOut: "Has cerrado sesión.",
      deleteFirst:
        "¿Eliminar la cuenta? El perfil y todos los entrenamientos se borrarán definitivamente.",
      deleteLast: "Confirmación final: esta eliminación no se puede deshacer.",
      deleteFailed: "No se pudo eliminar la cuenta.",
      deleted: "Tu perfil y tus entrenamientos se han eliminado.",
      profile: "Completar perfil del atleta",
      profileInfo: "Estos datos también se usan en THE.HUMAN.CHOICE.",
      firstName: "Nombre",
      lastName: "Apellido",
      country: "País",
      male: "Hombre",
      female: "Mujer",
      saveProfile: "Guardar perfil",
      profileRequired: "Introduce tu nombre y país.",
      trainWith: "Entrena con Roman Dossenbach",
      hero: "100 flexiones seguidas.",
      heroSub: "Técnica. Paciencia. Diez series honestas al día.",
      currentMax: "Máximo actual",
      yourSet: "Tu serie",
      todayDone: "Completado hoy",
      maxTitle: "1. Empieza con tu prueba MAX",
      maxPlaceholder: "Flexiones correctas seguidas",
      startPlan: "Iniciar plan",
      maxInfo:
        "Tu serie de entrenamiento es el 60 % de tu máximo. Repite la prueba cada 7 días y adapta el plan.",
      setsTitle: "2. Tus 10 series de hoy",
      setsInfo:
        "Toca una serie e introduce las repeticiones realizadas. Menos del 82 % no cuenta como logrado; desde el 82 % sí.",
      rewardTitle: "Recompensa del día",
      hidden: "🔒 Aún oculta",
      rewardHidden:
        "Tu frase de motivación aparece al completar las 10 series.",
      technique: "Técnica correcta",
      tech1:
        "Mantén el cuerpo en línea recta desde la cabeza hasta los talones.",
      tech2:
        "Baja hasta que el codo forme unos 90 grados con el antebrazo. Coloca las manos al ancho de los hombros y gíralas ligeramente hacia dentro.",
      tech3: "Sube por completo y cuenta cada repetición con honestidad.",
      principle: "El principio de Roman",
      principleText:
        "«No necesitas equipo ni ropa deportiva. Solo voluntad, paciencia y la honestidad de anotar cada serie.»",
      recordHolder: "Cinco veces plusmarquista Guinness · Roman Dossenbach",
      reset: "Reiniciar plan",
      motivation: "🔥 Motivación",
      day: "Día {day} de 60",
      set: "Serie {set}",
      doneDay: "✓ Día {day} completado",
      enterSet:
        "Serie {set}: ¿cuántas repeticiones has hecho?\nObjetivo: {target} · Mínimo: {minimum} (82 %)",
      invalidNumber: "Introduce un número válido.",
      notReached: "No logrado: se necesitan al menos {minimum} repeticiones.",
      invalidMax: "Introduce entre 1 y 100 flexiones correctas.",
      confirmReset: "¿Reiniciar todo el plan de 60 días?",
      complete: "Entrenamiento completado",
      strong: "¡Gran trabajo!",
      finishDay: "Terminar el día",
    },
    it: {
      language: "Lingua",
      openHuman: "Apri THE.HUMAN.CHOICE",
      signIn: "Accedi",
      sameAccount: "Usa lo stesso account di THE.HUMAN.CHOICE.",
      email: "E-mail",
      password: "Password",
      health: "Ho letto l’avviso sulla salute e mi alleno solo senza dolore.",
      create: "Crea account",
      backSignIn: "Torna all’accesso",
      checking: "Verifica …",
      healthRequired: "Conferma prima l’avviso sulla salute.",
      signInFailed: "Accesso non riuscito.",
      confirmMail: "Account creato. Conferma il link nell’e-mail, poi accedi.",
      signedIn: "Accesso come",
      logout: "Esci",
      deleteAccount: "Elimina account e allenamenti",
      loggedOut: "Hai effettuato la disconnessione.",
      deleteFirst:
        "Eliminare l’account? Il profilo e tutti gli allenamenti saranno eliminati definitivamente.",
      deleteLast: "Conferma finale: l’eliminazione non può essere annullata.",
      deleteFailed: "Impossibile eliminare l’account.",
      deleted: "Il profilo e gli allenamenti sono stati eliminati.",
      profile: "Completa il profilo dell’atleta",
      profileInfo: "Questi dati vengono usati anche per THE.HUMAN.CHOICE.",
      firstName: "Nome",
      lastName: "Cognome",
      country: "Paese",
      male: "Uomo",
      female: "Donna",
      saveProfile: "Salva profilo",
      profileRequired: "Inserisci nome e paese.",
      trainWith: "Allenati con Roman Dossenbach",
      hero: "100 push-up di fila.",
      heroSub: "Tecnica. Pazienza. Dieci serie oneste al giorno.",
      currentMax: "Massimo attuale",
      yourSet: "La tua serie",
      todayDone: "Completato oggi",
      maxTitle: "1. Inizia con il test MAX",
      maxPlaceholder: "Push-up corretti di fila",
      startPlan: "Avvia il piano",
      maxInfo:
        "La serie di allenamento è il 60% del tuo massimo. Ripeti il test ogni 7 giorni e adatta il piano.",
      setsTitle: "2. Le tue 10 serie di oggi",
      setsInfo:
        "Tocca una serie e inserisci le ripetizioni realmente completate. Sotto l’82% l’obiettivo non è raggiunto; dall’82% è raggiunto.",
      rewardTitle: "Premio del giorno",
      hidden: "🔒 Ancora nascosto",
      rewardHidden:
        "La frase motivazionale appare quando hai completato tutte le 10 serie.",
      technique: "Tecnica corretta",
      tech1: "Mantieni il corpo in linea retta dalla testa ai talloni.",
      tech2:
        "Scendi finché il gomito forma un angolo di circa 90 gradi con l’avambraccio. Mani alla larghezza delle spalle e palmi leggermente verso l’interno.",
      tech3: "Spingi fino in alto e conta ogni ripetizione con onestà.",
      principle: "Il principio di Roman",
      principleText:
        "«Non servono attrezzi né abbigliamento sportivo. Solo volontà, pazienza e l’onestà di annotare ogni serie.»",
      recordHolder:
        "Cinque volte detentore di record Guinness · Roman Dossenbach",
      reset: "Azzera il piano",
      motivation: "🔥 Motivazione",
      day: "Giorno {day} di 60",
      set: "Serie {set}",
      doneDay: "✓ Giorno {day} completato",
      enterSet:
        "Serie {set}: quante ripetizioni hai completato?\nObiettivo: {target} · Minimo: {minimum} (82%)",
      invalidNumber: "Inserisci un numero valido.",
      notReached: "Non raggiunto: servono almeno {minimum} ripetizioni.",
      invalidMax: "Inserisci da 1 a 100 push-up corretti.",
      confirmReset: "Azzerare l’intero piano di 60 giorni?",
      complete: "Allenamento completato",
      strong: "Ottimo lavoro!",
      finishDay: "Concludi il giorno",
    },
    pt: {
      language: "Idioma",
      openHuman: "Abrir THE.HUMAN.CHOICE",
      signIn: "Entrar",
      sameAccount: "Use a mesma conta de THE.HUMAN.CHOICE.",
      email: "E-mail",
      password: "Palavra-passe",
      health: "Li o aviso de saúde e treino apenas sem dores.",
      create: "Criar conta",
      backSignIn: "Voltar ao início de sessão",
      checking: "A verificar …",
      healthRequired: "Confirme primeiro o aviso de saúde.",
      signInFailed: "Falha ao iniciar sessão.",
      confirmMail:
        "Conta criada. Confirme o link no e-mail e depois inicie sessão.",
      signedIn: "Sessão iniciada como",
      logout: "Sair",
      deleteAccount: "Eliminar conta e treinos",
      loggedOut: "A sessão foi terminada.",
      deleteFirst:
        "Eliminar a conta? O perfil e todos os treinos serão eliminados definitivamente.",
      deleteLast: "Confirmação final: esta eliminação não pode ser anulada.",
      deleteFailed: "Não foi possível eliminar a conta.",
      deleted: "O perfil e os treinos foram eliminados.",
      profile: "Completar perfil do atleta",
      profileInfo: "Estes dados também são usados em THE.HUMAN.CHOICE.",
      firstName: "Nome",
      lastName: "Apelido",
      country: "País",
      male: "Masculino",
      female: "Feminino",
      saveProfile: "Guardar perfil",
      profileRequired: "Introduza o nome e o país.",
      trainWith: "Treine com Roman Dossenbach",
      hero: "100 flexões seguidas.",
      heroSub: "Técnica. Paciência. Dez séries honestas por dia.",
      currentMax: "Máximo atual",
      yourSet: "A sua série",
      todayDone: "Concluído hoje",
      maxTitle: "1. Comece com o teste MAX",
      maxPlaceholder: "Flexões corretas seguidas",
      startPlan: "Iniciar plano",
      maxInfo:
        "A série de treino corresponde a 60% do seu máximo. Repita o teste a cada 7 dias e ajuste o plano.",
      setsTitle: "2. As suas 10 séries de hoje",
      setsInfo:
        "Toque numa série e introduza as repetições realizadas. Abaixo de 82% não é atingido; a partir de 82% é atingido.",
      rewardTitle: "Recompensa do dia",
      hidden: "🔒 Ainda oculta",
      rewardHidden:
        "A frase motivacional aparece depois de concluir as 10 séries.",
      technique: "Técnica correta",
      tech1: "Mantenha o corpo em linha reta da cabeça aos calcanhares.",
      tech2:
        "Desça até o cotovelo formar cerca de 90 graus com o antebraço. Mãos à largura dos ombros e palmas ligeiramente viradas para dentro.",
      tech3: "Suba completamente e conte cada repetição com honestidade.",
      principle: "O princípio de Roman",
      principleText:
        "«Não precisa de equipamento nem de roupa de treino. Apenas vontade, paciência e honestidade para registar cada série.»",
      recordHolder:
        "Cinco vezes recordista mundial Guinness · Roman Dossenbach",
      reset: "Repor plano",
      motivation: "🔥 Motivação",
      day: "Dia {day} de 60",
      set: "Série {set}",
      doneDay: "✓ Dia {day} concluído",
      enterSet:
        "Série {set}: quantas repetições concluiu?\nObjetivo: {target} · Mínimo: {minimum} (82%)",
      invalidNumber: "Introduza um número válido.",
      notReached:
        "Não atingido: são necessárias pelo menos {minimum} repetições.",
      invalidMax: "Introduza entre 1 e 100 flexões corretas.",
      confirmReset: "Repor todo o plano de 60 dias?",
      complete: "Treino concluído",
      strong: "Excelente trabalho!",
      finishDay: "Concluir o dia",
    },
  };

  copy.bg = { ...copy.en, language:"Език", openHuman:"Отвори THE.HUMAN.CHOICE", signIn:"Вход", sameAccount:"Използвайте същия акаунт като в THE.HUMAN.CHOICE.", password:"Парола", create:"Създаване на акаунт", backSignIn:"Назад към вход", signedIn:"Влезли сте като", logout:"Изход", profile:"Попълнете профила на атлета", profileInfo:"Тези данни се използват и в THE.HUMAN.CHOICE.", firstName:"Име", lastName:"Фамилия", country:"Държава", male:"Мъж", female:"Жена", saveProfile:"Запазване на профила", trainWith:"Тренирайте с Roman Dossenbach", hero:"100 лицеви опори наведнъж.", heroSub:"Техника. Търпение. Десет честни серии на ден.", currentMax:"Текущ максимум", yourSet:"Вашата серия", todayDone:"Завършено днес", maxTitle:"1. Започнете с MAX тест", startPlan:"Старт на плана", setsTitle:"2. Вашите 10 серии днес", rewardTitle:"Награда за деня", technique:"Правилна техника", reset:"Нулиране на плана", motivation:"🔥 Мотивация", day:"Ден {day} от 60", set:"Серия {set}", complete:"Тренировката завърши", strong:"Отлична работа!", finishDay:"Завършване на деня" };
  copy.tr = { ...copy.en, language:"Dil", openHuman:"THE.HUMAN.CHOICE'ı aç", signIn:"Giriş yap", sameAccount:"THE.HUMAN.CHOICE ile aynı hesabı kullanın.", password:"Şifre", create:"Hesap oluştur", backSignIn:"Girişe dön", signedIn:"Oturum açıldı", logout:"Çıkış", profile:"Sporcu profilini tamamla", profileInfo:"Bu bilgiler THE.HUMAN.CHOICE için de kullanılır.", firstName:"Ad", lastName:"Soyadı", country:"Ülke", male:"Erkek", female:"Kadın", saveProfile:"Profili kaydet", trainWith:"Roman Dossenbach ile antrenman yap", hero:"Tek sette 100 şınav.", heroSub:"Teknik. Sabır. Günde on dürüst set.", currentMax:"Güncel maksimum", yourSet:"Setiniz", todayDone:"Bugün tamamlandı", maxTitle:"1. MAX testiyle başlayın", startPlan:"Planı başlat", setsTitle:"2. Bugünkü 10 setiniz", rewardTitle:"Günün ödülü", technique:"Doğru teknik", reset:"Planı sıfırla", motivation:"🔥 Motivasyon", day:"60 günün {day}. günü", set:"Set {set}", complete:"Antrenman tamamlandı", strong:"Harika iş!", finishDay:"Günü bitir" };
  copy.hu = { ...copy.en, language:"Nyelv", openHuman:"THE.HUMAN.CHOICE megnyitása", signIn:"Bejelentkezés", sameAccount:"Használd ugyanazt a fiókot, mint a THE.HUMAN.CHOICE alkalmazásban.", email:"E-mail", password:"Jelszó", health:"Elolvastam az egészségügyi figyelmeztetést, és csak fájdalommentesen edzek.", create:"Fiók létrehozása", backSignIn:"Vissza a bejelentkezéshez", checking:"Ellenőrzés …", healthRequired:"Először erősítsd meg az egészségügyi figyelmeztetést.", signInFailed:"A bejelentkezés sikertelen.", confirmMail:"A fiók elkészült. Erősítsd meg az e-mailben kapott hivatkozást, majd jelentkezz be.", signedIn:"Bejelentkezve mint", logout:"Kijelentkezés", deleteAccount:"Fiók és edzésadatok törlése", loggedOut:"Kijelentkeztél.", deleteFirst:"Törlöd a fiókot? A profil és minden edzésadat véglegesen törlődik.", deleteLast:"Végső megerősítés: a törlés nem vonható vissza.", deleteFailed:"A fiók nem törölhető.", deleted:"A profilod és edzésadataid törölve.", profile:"Sportolói profil kitöltése", profileInfo:"Ezeket az adatokat a THE.HUMAN.CHOICE is használja.", firstName:"Keresztnév", lastName:"Vezetéknév", country:"Ország", male:"Férfi", female:"Nő", saveProfile:"Profil mentése", profileRequired:"Add meg a keresztnevedet és az országot.", trainWith:"Edzés Roman Dossenbachhal", hero:"100 fekvőtámasz egy sorozatban.", heroSub:"Technika. Türelem. Napi tíz becsületes sorozat.", currentMax:"Aktuális maximum", yourSet:"A sorozatod", todayDone:"Ma teljesítve", maxTitle:"1. Kezdd a MAX-teszttel", maxPlaceholder:"Szabályos fekvőtámaszok egy sorozatban", startPlan:"Terv indítása", maxInfo:"Az edzéssorozat a maximumod 60%-a. Hétnaponta teszteld újra a maximumot, és igazítsd a tervet.", setsTitle:"2. A mai 10 sorozatod", setsInfo:"Érints meg egy sorozatot, és add meg a tényleges ismétlésszámot. A cél 82%-a alatt nem teljesített, 82%-tól teljesített.", rewardTitle:"A nap jutalma", hidden:"🔒 Még rejtve", rewardHidden:"A motivációs idézet mind a 10 sorozat teljesítése után jelenik meg.", technique:"Helyes technika", tech1:"Tartsd a tested egyenes vonalban a fejtől a sarokig.", tech2:"Engedd le magad, amíg a könyök és az alkar körülbelül 90 fokos szöget zár be. A kezek vállszélességben, a tenyerek enyhén befelé fordítva legyenek.", tech3:"Nyomd ki magad teljesen, és minden ismétlést becsületesen számolj.", principle:"Roman alapelve", principleText:"Nincs szükséged felszerelésre vagy edzőruhára. Csak akaratra, türelemre és becsületességre, hogy minden sorozatot feljegyezz.", recordHolder:"Ötszörös Guinness-világrekorder · Roman Dossenbach", reset:"Terv visszaállítása", motivation:"🔥 Motiváció", day:"{day}. nap a 60-ból", set:"{set}. sorozat", doneDay:"✓ {day}. nap teljesítve", enterSet:"{set}. sorozat: hány ismétlést teljesítettél?\nCél: {target} · Minimum: {minimum} (82%)", invalidNumber:"Adj meg érvényes számot.", notReached:"Nem teljesült: legalább {minimum} ismétlés szükséges.", invalidMax:"Adj meg 1 és 100 közötti szabályos fekvőtámaszt.", confirmReset:"Visszaállítod a teljes 60 napos tervet?", complete:"Edzés befejezve", strong:"Nagyszerű munka!", finishDay:"Nap befejezése" };
  copy.ar = { ...copy.en, language:"اللغة", openHuman:"فتح THE.HUMAN.CHOICE", signIn:"تسجيل الدخول", sameAccount:"استخدم الحساب نفسه في THE.HUMAN.CHOICE.", password:"كلمة المرور", create:"إنشاء حساب", backSignIn:"العودة لتسجيل الدخول", signedIn:"تم تسجيل الدخول باسم", logout:"تسجيل الخروج", profile:"أكمل ملف الرياضي", profileInfo:"تُستخدم هذه البيانات أيضًا في THE.HUMAN.CHOICE.", firstName:"الاسم الأول", lastName:"اسم العائلة", country:"الدولة", male:"ذكر", female:"أنثى", saveProfile:"حفظ الملف", trainWith:"تدرّب مع Roman Dossenbach", hero:"100 تمرين ضغط في مجموعة واحدة.", heroSub:"تقنية. صبر. عشر مجموعات صادقة يوميًا.", currentMax:"الحد الأقصى الحالي", yourSet:"مجموعتك", todayDone:"المكتمل اليوم", maxTitle:"1. ابدأ باختبار الحد الأقصى", startPlan:"بدء الخطة", setsTitle:"2. مجموعاتك العشر اليوم", rewardTitle:"مكافأة اليوم", technique:"التقنية الصحيحة", reset:"إعادة ضبط الخطة", motivation:"🔥 التحفيز", day:"اليوم {day} من 60", set:"المجموعة {set}", complete:"اكتمل التدريب", strong:"عمل رائع!", finishDay:"إنهاء اليوم" };

  const replacements = {
    "#authTitle": "signIn",
    "#authCard>p": "sameAccount",
    "#authForm label:nth-of-type(1)>span": "email",
    "#authForm label:nth-of-type(2)>span": "password",
    "#healthRow>span": "health",
    "#authSubmit": "signIn",
    "#authSwitch": "create",
    ".account-bar>span": "signedIn",
    "#logout": "logout",
    "#profileSetup .label": "profile",
    "#profileSetup .sub": "profileInfo",
    "#saveProfile": "saveProfile",
    ".hero .eyebrow": "trainWith",
    ".hero h1": "hero",
    ".hero p": "heroSub",
    ".grid .card:nth-child(1) .label": "currentMax",
    ".grid .card:nth-child(2) .label": "yourSet",
    ".grid .card:nth-child(3) .label": "todayDone",
    ".section-title:nth-of-type(1)": "maxTitle",
    "#saveMax": "startPlan",
    ".setup+.sub": "maxInfo",
    ".section-title:nth-of-type(2)": "setsTitle",
    "#sets+.sub": "setsInfo",
    ".section-title:nth-of-type(3)": "rewardTitle",
    ".section-title:nth-of-type(4)": "technique",
    ".tech .rule:nth-child(1) p": "tech1",
    ".tech .rule:nth-child(2) p": "tech2",
    ".tech .rule:nth-child(3) p": "tech3",
    ".section-title:nth-of-type(5)": "principle",
    ".section-title:nth-of-type(5)+.card>div:first-child": "principleText",
    ".section-title:nth-of-type(5)+.card .sub": "recordHolder",
    "#reset": "reset",
    "#openMotivation": "motivation",
    "#celebrate .eyebrow": "complete",
    "#celebrate h2": "strong",
    "#closeModal": "finishDay",
  };
  const placeholders = {
    "#profileName": "firstName",
    "#profileLastName": "lastName",
    "#profileCountry": "country",
    "#maxInput": "maxPlaceholder",
  };
  function language() {
    const saved = localStorage.getItem("pushup-language");
    return copy[saved] ? saved : "de";
  }
  function t(key, values = {}) {
    let value = (copy[language()] || copy.de)[key] || copy.de[key] || key;
    for (const [name, replacement] of Object.entries(values))
      value = value.replaceAll(`{${name}}`, String(replacement));
    return value;
  }
  function apply() {
    document.documentElement.lang = language();
    document.documentElement.dir = language() === "ar" ? "rtl" : "ltr";
    for (const [selector, key] of Object.entries(replacements)) {
      const el = document.querySelector(selector);
      if (el) {
        if (selector === ".account-bar>span") {
          const strong = el.querySelector("strong");
          el.firstChild.textContent = t(key) + " ";
          if (strong) el.append(strong);
        } else if (selector === "#healthRow>span") {
          const input = el.querySelector("input");
          el.textContent = " " + t(key);
          if (input) el.prepend(input);
        } else el.textContent = t(key);
      }
    }
    for (const [selector, key] of Object.entries(placeholders)) {
      const el = document.querySelector(selector);
      if (el) el.placeholder = t(key);
    }
    const gender = document.querySelector("#profileGender");
    if (gender) {
      gender.options[0].text = t("male");
      gender.options[1].text = t("female");
    }
    const picker = document.querySelector("#appLanguage");
    if (picker) picker.value = language();
    document
      .querySelector("#appLanguageLabel")
      ?.setAttribute("aria-label", t("language"));
    const humanLink = document.querySelector("#humanChoiceLink");
    if (humanLink) {
      const label = humanLink.querySelector("span");
      if (label) label.textContent = "THE.HUMAN.CHOICE";
      humanLink.title = t("openHuman");
    }
    if(language()==="hu"){
      const title=document.querySelector("#helpTitle"),body=document.querySelector("#helpDialog .help-dialog-body");
      if(title)title.textContent="Út 100 fekvőtámaszig – Súgó";
      if(body)body.innerHTML="<ol><li>Végezd el szabályosan a MAX-tesztet, és add meg az eredményt.</li><li>Őszintén válaszd ki a regenerációt, erőfeszítést és fájdalmat.</li><li>Nyisd meg a következő sorozatot, majd írd be vagy mondd ki magyarul a tényleges ismétlésszámot.</li><li>Tartsd be a kijelzett pihenőt.</li><li>Az utolsó sorozat után az edzés automatikusan bekerül a THE.HUMAN.CHOICE rendszerébe.</li></ol>";
    }
    if (typeof window.render === "function") window.render();
  }
  function setLanguage(code) {
    if (!copy[code]) return;
    localStorage.setItem("pushup-language", code);
    apply();
    window.dispatchEvent(
      new CustomEvent("road-language-change", { detail: code }),
    );
  }
  window.RoadI18n = { copy, t, apply, setLanguage, language };
  addEventListener("DOMContentLoaded", () => {
    document
      .querySelector("#appLanguage")
      ?.addEventListener("change", (e) => setLanguage(e.target.value));
    apply();
  });
})();
