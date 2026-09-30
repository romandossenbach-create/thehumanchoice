"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, LockKeyhole } from "lucide-react";
import { useParams } from "next/navigation";
import { authorizedFetch, initializeSession } from "../../auth-client";

type Entry = { id:number; reps:number; setReps:number[]; entryDate:string; createdAt:string };

export default function SharedTrainingLogPage() {
  const params = useParams<{id:string}>();
  const athleteId = String(params.id || "");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [challenge, setChallenge] = useState<{days:number;target:number;total:number;day:number}|null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setChallenge(null);
    (async () => {
      await initializeSession();
      const allEntries: Entry[] = [];
      let offset: number | null = 0;
      while (offset !== null) {
        const response = await authorizedFetch(`/api/history?athleteId=${encodeURIComponent(athleteId)}&offset=${offset}`, { cache:"no-store" });
        const data = await response.json() as { entries?:Entry[]; nextOffset?:number|null; error?:string; challenge?:{days:number;target:number;total:number;day:number}|null };
        if (!response.ok) throw new Error(data.error || "Trainingsbuch nicht verfügbar.");
        if (offset === 0 && active) setChallenge(data.challenge || null);
        allEntries.push(...(data.entries || []));
        offset = data.nextOffset ?? null;
      }
      if (active) setEntries([...new Map(allEntries.map((entry) => [entry.id, entry])).values()]);
    })().catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Trainingsbuch nicht verfügbar."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [athleteId]);
  const days = useMemo(() => {
    const grouped = new Map<string,Entry[]>();
    for (const entry of entries) grouped.set(entry.entryDate, [...(grouped.get(entry.entryDate) || []), entry]);
    return [...grouped.entries()].sort(([a],[b]) => b.localeCompare(a));
  }, [entries]);
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone:"Europe/Zurich", year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date());
  const formatTime = (value:string) => new Intl.DateTimeFormat("de-CH", { timeZone:"Europe/Zurich", hour:"2-digit", minute:"2-digit", second:"2-digit" }).format(new Date(value.includes("T") ? value : `${value.replace(" ","T")}Z`));
  const personalBest = entries.reduce((best, entry) => Math.max(best, ...entry.setReps), 0);
  return <main className="sharedLogPage">
    <section className="sharedLogHero"><button className="leaveSharedLog" type="button" onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.href = "/athletes"; }}><ArrowLeft size={18}/> Trainingsbuch verlassen</button><p className="eyebrow">FREIGEGEBENER TRAININGSBEREICH</p>{personalBest > 0 && <p><strong>PERSONAL BEST — {personalBest} PUSH-UPS</strong></p>}</section>
    {!loading && !error && challenge && <section className="sharedChallenge" aria-label="Aktive Personal Challenge">
      <div className="pushChallengeMetric"><span aria-label="Push-ups">P</span><div className="pushChallengeTrack" role="progressbar" aria-label="Push-up Fortschritt" aria-valuenow={challenge.total} aria-valuemin={0} aria-valuemax={challenge.target}><div style={{width:`${Math.max(0,Math.min(100,challenge.total / challenge.target * 100))}%`}} /></div><strong>{challenge.total.toLocaleString("de-CH")} / {challenge.target.toLocaleString("de-CH")}</strong></div>
      <div className="pushChallengeMetric"><span aria-label="Challenge Tag">D</span><div className="pushChallengeTrack" role="progressbar" aria-label="Challenge Tage" aria-valuenow={challenge.day} aria-valuemin={0} aria-valuemax={challenge.days}><div style={{width:`${challenge.day / challenge.days * 100}%`}} /></div><strong>{challenge.day} / {Math.round(challenge.total / (challenge.day * challenge.target / challenge.days) * 100)} %</strong></div>
    </section>}
    {loading ? <p className="empty">Trainingsbuch wird geladen …</p> : error ? <section className="privateLog"><LockKeyhole size={30}/><h2>Privates Trainingsbuch</h2><p>{error}</p></section> : <section className="sharedHistory historyDays">
      {days.map(([date, sets]) => <details className="historyDay" id={date === today ? "today" : undefined} open={date === today} key={date}><summary><time dateTime={date}>{new Intl.DateTimeFormat("de-CH",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(`${date}T12:00:00Z`))}</time><span className="dailyTotal"><small>{date === today ? `Heute · ${sets.reduce((sum,set)=>sum+set.setReps.length,0)} Sätze` : `${sets.reduce((sum,set)=>sum+set.setReps.length,0)} Sätze · Tagestotal`}</small><strong>{sets.reduce((sum,set)=>sum+set.reps,0).toLocaleString("de-CH")}</strong></span><ChevronDown size={20}/></summary><div className="sharedSetLine">{sets.flatMap((set) => set.setReps.map((reps, index) => <span className="sharedSet" key={`${set.id}-${index}`}><strong>{reps} Push-ups</strong><time dateTime={set.createdAt}>{formatTime(set.createdAt)} Uhr</time></span>))}</div></details>)}
      {!days.length && <p className="empty">Noch keine Trainingssätze vorhanden.</p>}
    </section>}
  </main>;
}
