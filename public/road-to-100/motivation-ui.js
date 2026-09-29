import { motivationContent } from "./content.js";

const ui = {
  de: {
    back: "← Zurück zum Training",
    eyebrow: "Motivation",
    title: "Stärke beginnt im Kopf.",
    intro:
      "60 Gedanken für Disziplin, Geduld und deinen nächsten sauberen Push-up.",
  },
  en: {
    back: "← Back to training",
    eyebrow: "Motivation",
    title: "Strength begins in the mind.",
    intro: "60 thoughts for discipline, patience and your next clean push-up.",
  },
  fr: {
    back: "← Retour à l’entraînement",
    eyebrow: "Motivation",
    title: "La force commence dans la tête.",
    intro:
      "60 pensées pour la discipline, la patience et votre prochaine pompe bien exécutée.",
  },
  es: {
    back: "← Volver al entrenamiento",
    eyebrow: "Motivación",
    title: "La fuerza comienza en la mente.",
    intro:
      "60 pensamientos para la disciplina, la paciencia y tu próxima flexión bien hecha.",
  },
  it: {
    back: "← Torna all’allenamento",
    eyebrow: "Motivazione",
    title: "La forza comincia dalla mente.",
    intro:
      "60 pensieri per la disciplina, la pazienza e il tuo prossimo push-up ben eseguito.",
  },
  pt: {
    back: "← Voltar ao treino",
    eyebrow: "Motivação",
    title: "A força começa na mente.",
    intro:
      "60 pensamentos para a disciplina, a paciência e a sua próxima flexão bem executada.",
  },
  bg: {
    back: "← Назад към тренировката",
    eyebrow: "Мотивация",
    title: "Силата започва в ума.",
    intro:
      "60 мисли за дисциплина, търпение и следващата ви правилна лицева опора.",
  },
  tr: {
    back: "← Antrenmana dön",
    eyebrow: "Motivasyon",
    title: "Güç zihinde başlar.",
    intro: "Disiplin, sabır ve bir sonraki temiz şınavınız için 60 düşünce.",
  },
  hu: {
    back: "← Vissza az edzéshez",
    eyebrow: "Motiváció",
    title: "Az erő a fejben kezdődik.",
    intro: "60 gondolat a fegyelemhez, a türelemhez és a következő szabályos fekvőtámaszodhoz.",
  },
  ar: {
    back: "العودة إلى التدريب →",
    eyebrow: "التحفيز",
    title: "القوة تبدأ في العقل.",
    intro: "60 فكرة للانضباط والصبر وتمرين الضغط الصحيح التالي.",
  },
};

const language = document.querySelector("#motivationLanguage");

function paintMotivation() {
  const code = language.value;
  const content = motivationContent[code];
  const labels = ui[code];
  document.documentElement.lang = code;
  document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
  document.querySelector("#backTraining").textContent = labels.back;
  document.querySelector("#motivationEyebrow").textContent = labels.eyebrow;
  document.querySelector("#motivationTitle").textContent = labels.title;
  document.querySelector("#motivationIntro").textContent = labels.intro;
  document.querySelector("#goldenTitle").textContent = content.goldenRulesTitle;
  document.querySelector("#goldenList").innerHTML = content.goldenRules
    .map(([title, text]) => `<li><p><strong>${title}</strong>${text}</p></li>`)
    .join("");
  document.querySelector("#motivationGrid").innerHTML = content.quotes
    .map(
      (quote, index) =>
        `<article class="quote-card"><span>${String(index + 1).padStart(2, "0")}</span><p>${quote}</p></article>`,
    )
    .join("");
}

function openMotivation() {
  document.body.classList.add("show-motivation");
  paintMotivation();
  scrollTo({ top: 0, behavior: "smooth" });
  history.replaceState(null, "", "#motivation");
}

function closeMotivation() {
  document.body.classList.remove("show-motivation");
  document.documentElement.lang = "de";
  scrollTo({ top: 0, behavior: "smooth" });
  history.replaceState(null, "", location.pathname);
}

const savedLanguage = localStorage.getItem("pushup-language");
language.value = motivationContent[savedLanguage] ? savedLanguage : "de";
window.getRoadQuote = (index) =>
  motivationContent[window.RoadI18n.language()].quotes[index];
language.addEventListener("change", () =>
  window.RoadI18n.setLanguage(language.value),
);
addEventListener("road-language-change", (event) => {
  language.value = event.detail;
  paintMotivation();
});
document
  .querySelector("#openMotivation")
  .addEventListener("click", openMotivation);
document
  .querySelector("#backTraining")
  .addEventListener("click", closeMotivation);
if (location.hash === "#motivation") openMotivation();
