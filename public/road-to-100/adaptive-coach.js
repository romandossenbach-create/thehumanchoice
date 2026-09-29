(function () {
  const KEY = "road-to-100-v1";
  const today = () => new Date().toDateString();
  const $ = (selector) => document.querySelector(selector);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const numberValues = (object = {}) => Object.keys(object).sort((a, b) => Number(a) - Number(b)).map((key) => Number(object[key] || 0));

  var state = JSON.parse(localStorage.getItem(KEY) || "null") || {
    day: 1, max: 0, done: [], actuals: {}, date: today(), actualDay: today(), celebrated: false,
  };
  window.state = state;

  function adaptiveDefaults() {
    return {
      mode: "standard",
      history: [],
      timestamps: {},
      readiness: { sleep: 4, effort: 3, pain: 0 },
      lastArchivedDate: "",
    };
  }

  function ensureAdaptive() {
    state.actuals = state.actuals || {};
    state.done = Array.isArray(state.done) ? state.done : [];
    state.adaptive = { ...adaptiveDefaults(), ...(state.adaptive || {}) };
    state.adaptive.history = Array.isArray(state.adaptive.history) ? state.adaptive.history.slice(-60) : [];
    state.adaptive.timestamps = state.adaptive.timestamps || {};
    state.adaptive.readiness = { sleep: 4, effort: 3, pain: 0, ...(state.adaptive.readiness || {}) };
  }

  function isRoman() {
    const email = String(window.roadUserEmail || "").toLowerCase();
    return email === "roman.dossenbach@gmail.com" || email === "roma.ossenbach@gmail.com";
  }

  function archiveDay() {
    ensureAdaptive();
    const values = numberValues(state.actuals);
    if (!values.length || state.adaptive.lastArchivedDate === state.date) return;
    const target = Number(state.adaptive.todayPlan?.target || Math.max(1, Math.round(state.max * 0.6)));
    const total = values.reduce((sum, value) => sum + value, 0);
    const first = values[0] || 1;
    const last = values[values.length - 1] || 0;
    const dropoff = clamp((first - last) / first, -1, 1);
    state.adaptive.history.push({
      date: state.date,
      day: Number(state.day || 1),
      max: Number(state.max || 0),
      target,
      sets: values.length,
      actuals: values,
      total,
      completion: target ? total / (target * values.length) : 0,
      dropoff,
      sleep: Number(state.adaptive.readiness.sleep || 4),
      effort: Number(state.adaptive.readiness.effort || 3),
      pain: Number(state.adaptive.readiness.pain || 0),
      workout: state.adaptive.todayPlan?.type || "Volumen",
    });
    state.adaptive.history = state.adaptive.history.slice(-60);
    state.adaptive.lastArchivedDate = state.date;
  }

  function rollToToday() {
    ensureAdaptive();
    if (state.date === today()) return;
    archiveDay();
    state.day = Math.min(60, Number(state.day || 1) + 1);
    state.done = [];
    state.actuals = {};
    state.date = today();
    state.actualDay = today();
    state.celebrated = false;
    state.adaptive.timestamps = {};
    delete state.adaptive.todayPlan;
  }

  function trendPercent(history) {
    const recent = history.slice(-7);
    if (recent.length < 2) return 0;
    const first = recent[0].total || 1;
    return ((recent[recent.length - 1].total - first) / first) * 100;
  }

  function makePlan() {
    ensureAdaptive();
    if (state.adaptive.todayPlan && state.adaptive.todayPlanDate === state.date) return state.adaptive.todayPlan;
    if (isRoman()) state.adaptive.mode = "advanced";
    const advanced = state.adaptive.mode === "advanced";
    const history = state.adaptive.history;
    const last = history[history.length - 1];
    const previous = history[history.length - 2];
    const pain = Number(state.adaptive.readiness.pain || 0);
    const twoDrops = last && previous && last.completion < 0.8 && previous.completion < 0.8;
    const standardRecovery = !advanced && (pain >= 4 || twoDrops || Number(state.day || 1) % 7 === 4);
    const advancedRecovery = advanced && (pain >= 4 || (twoDrops && last.dropoff > 0.2 && previous.dropoff > 0.2));

    let type, sets, factor, pause;
    if (standardRecovery || advancedRecovery) {
      type = "Erholung"; sets = 0; factor = 0; pause = 0;
    } else {
      const cycle = advanced
        ? [
            ["Volumen", 10, 0.55, 75], ["Lange Sätze", 5, 0.68, 150],
            ["Dichte", 12, 0.38, 45], ["Technik", 8, 0.45, 90],
          ]
        : [
            ["Volumen", 8, 0.5, 90], ["Technik", 6, 0.35, 90],
            ["Lange Sätze", 4, 0.62, 150], ["Dichte", 10, 0.35, 60],
          ];
      [type, sets, factor, pause] = cycle[(Number(state.day || 1) - 1) % cycle.length];
    }

    let target = state.max ? Math.max(1, Math.round(state.max * factor)) : 0;
    let reason = "Der Startwert basiert auf deinem MAX-Test. Nach jedem Training lernt der Coach aus deinen Sätzen.";
    if (last && target) {
      if (last.completion >= 0.95 && last.dropoff <= 0.1 && last.effort <= 4 && last.pain <= 2) {
        target += 1;
        reason = "Stabile Satzleistung: heute eine Wiederholung mehr pro Satz. Nur ein Faktor wird erhöht.";
      } else if (last.completion < 0.85 || last.dropoff > 0.2) {
        target = Math.max(1, Math.round(target * 0.9));
        pause += 30;
        reason = "Die letzte Einheit zeigte deutliche Ermüdung. Umfang reduziert, Pause verlängert.";
      } else {
        reason = "Die Belastung war passend. Ziel und Pause bleiben stabil, damit die Ausdauer sich festigt.";
      }
      const seven = history.slice(-7);
      if (seven.length >= 2) {
        const averageSet = seven.reduce((sum, item) => sum + item.total / Math.max(1, item.sets), 0) / seven.length;
        target = Math.min(target, Math.max(1, Math.ceil(averageSet * 1.08)));
      }
    }
    if (type === "Erholung") reason = advanced
      ? "Außergewöhnlicher Leistungsabfall oder Schmerzsignal: heute Erholung. Dein Advanced-Profil plant sonst keine automatischen Ruhetage."
      : "Heute ist ein sinnvoller Erholungstag. Die Lernkurve wird dadurch nicht unterbrochen.";

    const plan = { type, sets, target, pause, factor, reason, advanced };
    state.adaptive.todayPlan = plan;
    state.adaptive.todayPlanDate = state.date;
    return plan;
  }

  async function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
    render();
    const persisted = window.persistRoadPlan ? await window.persistRoadPlan(state) : true;
    window.syncCompletedDay?.();
    return persisted;
  }

  function setReps() { return makePlan().target; }
  window.getRoadPlan = () => state;
  window.applyRoadPlan = (plan) => {
    if (!plan || typeof plan !== "object") return;
    const localAdaptive = state.adaptive;
    state = { ...state, ...plan, adaptive: plan.adaptive || localAdaptive || adaptiveDefaults(), done: Array.isArray(plan.done) ? plan.done : [], actuals: plan.actuals || {} };
    window.state = state;
    ensureAdaptive();
    rollToToday();
    localStorage.setItem(KEY, JSON.stringify(state));
    render();
    window.persistRoadPlan?.(state);
  };

  function renderCurve() {
    const history = state.adaptive.history.slice(-14);
    const host = $("#curveChart");
    if (!history.length) {
      host.className = "curve-empty";
      host.textContent = "Die Kurve entsteht aus deinen täglichen Trainingswerten.";
      $("#curveCaption").textContent = "Noch keine abgeschlossenen Tage";
      return;
    }
    const values = history.map((item) => item.total);
    const min = Math.min(...values), max = Math.max(...values), range = Math.max(1, max - min);
    const points = values.map((value, index) => `${10 + index * (280 / Math.max(1, values.length - 1))},${82 - ((value - min) / range) * 66}`).join(" ");
    host.className = "";
    host.innerHTML = `<svg viewBox="0 0 300 96" role="img" aria-label="Ausdauerentwicklung der letzten ${history.length} Trainingstage"><path class="curve-grid" d="M10 16H290M10 49H290M10 82H290"/><polyline class="curve-line" points="${points}"/></svg>`;
    $("#curveCaption").textContent = `${history.length} Tage · ${min} bis ${max} Wiederholungen`;
  }

  function render() {
    ensureAdaptive();
    const plan = makePlan();
    const actualCount = Object.keys(state.actuals).length;
    const complete = plan.sets > 0 && actualCount >= plan.sets;
    $("#day").textContent = RoadI18n.t("day", { day: state.day });
    $("#maxView").textContent = state.max || "–";
    $("#maxSetupBlock").hidden = Boolean(state.max);
    $("#setView").textContent = state.max ? (plan.target || "Pause") : "–";
    $("#doneView").textContent = actualCount;
    $("#doneView").parentElement.lastChild.textContent = `/${plan.sets}`;
    $("#progress").style.width = (plan.sets ? Math.min(100, actualCount / plan.sets * 100) : 100) + "%";
    $("#trainingProfile").textContent = plan.advanced ? "ADVANCED ATHLETE" : "ADAPTIV";
    $("#workoutType").textContent = plan.type;
    $("#setCountView").textContent = plan.sets || "Ruhetag";
    $("#pauseView").textContent = plan.pause ? `${plan.pause} s` : "–";
    const trend = trendPercent(state.adaptive.history);
    $("#trendView").textContent = trend ? `${trend > 0 ? "+" : ""}${Math.round(trend)} %` : "Start";
    $("#coachReason").textContent = plan.reason;
    $("#setsTitle").textContent = plan.sets ? `2. Deine ${plan.sets} Sätze heute` : "2. Erholung heute";
    $("#sets").innerHTML = plan.sets ? Array.from({ length: plan.sets }, (_, index) => {
      const actual = state.actuals[index];
      const entered = actual !== undefined;
      const reached = state.done.includes(index);
      const stamp = state.adaptive.timestamps[index] ? new Date(state.adaptive.timestamps[index]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
      return `<button class="set ${reached ? "done" : ""}" data-i="${index}" ${state.max ? "" : "disabled"}><span><small>${RoadI18n.t("set", { set: index + 1 })}${stamp ? ` · ${stamp}` : ""}</small><br><strong>${entered ? actual : state.max ? plan.target : "–"}</strong><small>${entered ? " / " + plan.target : ""}</small></span><span class="check">${entered ? (reached ? "✓" : "✕") : ""}</span></button>`;
    }).join("") : `<div class="card wide" style="text-align:center;color:#dfffa0"><strong>Regeneration ist heute dein Training.</strong><div class="sub">Morgen berechnet der Coach die nächste Einheit neu.</div></div>`;
    $("#reward").className = "card reward " + (complete ? "" : "locked");
    $("#rewardLabel").textContent = complete ? RoadI18n.t("doneDay", { day: state.day }) : RoadI18n.t("hidden");
    $("#rewardText").textContent = complete ? (window.getRoadQuote?.(state.day - 1) || "Heute trainieren. Morgen stolz sein.") : RoadI18n.t("rewardHidden");
    document.querySelectorAll(".set").forEach((button) => button.onclick = () => enterActual(Number(button.dataset.i)));
    $("#sleepInput").value = String(state.adaptive.readiness.sleep);
    $("#effortInput").value = String(state.adaptive.readiness.effort);
    $("#painInput").value = String(Math.min(4, state.adaptive.readiness.pain));
    renderCurve();
  }

  let pauseTimer;
  function startPause(seconds) {
    clearInterval(pauseTimer);
    const banner = $("#pauseBanner"), count = $("#pauseCountdown");
    let remaining = seconds;
    banner.classList.remove("ready");
    banner.classList.add("show"); count.textContent = remaining;
    pauseTimer = setInterval(() => {
      remaining -= 1; count.textContent = Math.max(0, remaining);
      if (remaining <= 0) {
        clearInterval(pauseTimer);
        count.textContent = "GO";
        banner.classList.add("ready");
      }
    }, 1000);
  }

  function finishTraining() {
    clearInterval(pauseTimer);
    const banner = $("#pauseBanner"), count = $("#pauseCountdown");
    const messages = ["Bravo! 💪", "Stark gemacht! 🔥", "Geschafft! 👏", "Training abgeschlossen! ⭐"];
    banner.classList.add("show", "ready");
    count.textContent = messages[(Number(state.day || 1) + Object.keys(state.actuals).length) % messages.length];
  }

  async function enterActual(index) {
    const plan = makePlan();
    const old = state.actuals[index] ?? plan.target;
    const value = prompt(RoadI18n.t("enterSet", { set: index + 1, target: plan.target, minimum: Math.ceil(plan.target * 0.82) }), old);
    if (value === null) return;
    const actual = Math.round(Number(value));
    if (!Number.isFinite(actual) || actual < 0 || actual > 121) return alert(RoadI18n.t("invalidNumber"));
    const result = await window.recordRoadSet?.(index, actual, state.date);
    if (!result?.ok) return alert(result?.error || "Satz konnte nicht gespeichert werden.");
    state.actuals[index] = actual;
    state.adaptive.timestamps[index] = result.createdAt || new Date().toISOString();
    state.done = state.done.filter((item) => item !== index);
    const reached = actual >= plan.target * 0.82;
    if (reached) state.done.push(index);
    state.done.sort((a, b) => a - b);
    const values = numberValues(state.actuals);
    const currentDrop = values.length > 1 ? (values[0] - values[values.length - 1]) / Math.max(1, values[0]) : 0;
    const completed = Object.keys(state.actuals).length >= plan.sets;
    if (completed) finishTraining();
    else startPause(plan.pause + (currentDrop > 0.15 ? 30 : 0));
    const persisted = await save();
    if (persisted && navigator.vibrate) navigator.vibrate(45);
    if (completed && !state.celebrated) {
      state.celebrated = true; save();
      $("#modalQuote").textContent = window.getRoadQuote?.(state.day - 1) || "Stark gemacht. Der Coach hat deine Lernkurve aktualisiert.";
      $("#celebrate").classList.add("show");
    } else if (!reached) alert(RoadI18n.t("notReached", { minimum: Math.ceil(plan.target * 0.82) }));
  }

  $("#saveMax").onclick = () => {
    const value = Math.round(Number($("#maxInput").value));
    if (value < 1 || value > 100) return alert(RoadI18n.t("invalidMax"));
    if (state.max && value !== state.max && !confirm("Aktuelles Maximum " + state.max + " durch " + value + " ersetzen und alle Empfehlungen neu berechnen?")) return;
    state.max = value; state.celebrated = false; delete state.adaptive.todayPlan; delete state.adaptive.todayPlanDate;
    $("#maxInput").value = ""; save();
  };

  function renderHistory(){
    const host=$("#trainingHistory"); if(!host)return;
    const rows=[...state.adaptive.history].slice(-30).reverse();
    host.innerHTML=rows.length?rows.map(item=>`<article class="history-row"><div><strong>${new Date(item.date).toLocaleDateString()}</strong><small>Tag ${item.day} · ${item.workout}</small></div><div><b>${item.total}</b><small>${item.sets} Sätze · MAX ${item.max}</small></div></article>`).join(""):`<p class="sub">Nach dem ersten abgeschlossenen Trainingstag erscheint hier deine Historie.</p>`;
  }
  const oldRender=render;
  render=function(){oldRender();renderHistory()};
  $("#shareProgress")?.addEventListener("click",async()=>{
    const plan=makePlan(); const total=numberValues(state.actuals).reduce((a,b)=>a+b,0);
    const text=`Road to 100 · Tag ${state.day}\nHeute: ${total} Push-ups\nAktuelles Maximum: ${state.max||"–"}\nNächster Satz: ${plan.target||"Regeneration"}\n${location.origin}/road-to-100/index.html`;
    if(navigator.share)await navigator.share({title:"Road to 100",text});else{await navigator.clipboard.writeText(text);alert("Trainingsstand wurde kopiert.")}
  });
  $("#editMax").onclick = () => {
    $("#maxSetupBlock").hidden = false;
    $("#maxInput").value = state.max || "";
    $("#saveMax").textContent = "Maximum ersetzen";
    $("#maxInput").focus();
  };
  $("#closeModal").onclick = () => $("#celebrate").classList.remove("show");
  $("#reset").onclick = async () => {
    if (!confirm(RoadI18n.t("confirmReset"))) return;
    await window.centralFetch?.("/api/road-plan", { method: "DELETE" });
    localStorage.removeItem(KEY); location.reload();
  };
  ["sleepInput", "effortInput", "painInput"].forEach((id) => {
    $("#" + id).onchange = () => {
      state.adaptive.readiness = {
        sleep: Number($("#sleepInput").value), effort: Number($("#effortInput").value), pain: Number($("#painInput").value),
      };
      delete state.adaptive.todayPlan; delete state.adaptive.todayPlanDate; save();
    };
  });
  window.addEventListener("road-user-ready", () => { render(); });
  rollToToday();
  localStorage.setItem(KEY, JSON.stringify(state));
  render();
})();
