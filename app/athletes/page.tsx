"use client";

import ProfileImage from "../profile-image";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpDown, Settings, HelpCircle, LayoutDashboard, Search, Trophy } from "lucide-react";
import { useLanguage } from "../i18n";
import { authorizedFetch, initializeSession } from "../auth-client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Leader = { id:string; athleteNumber:number; name:string; lastNameInitials:string; country:string; gender:"male"|"female"; age:number|null; today:number; personalBest:number; verifiedPersonalBest:number; total:number; verifiedAchievementMinimum?:number; month:number; average:number; averagePeriodDays?:number|null; activeDays:number; hasProfilePhoto:boolean; trainingLogPublic:boolean; isFeatured?:boolean; challenge?:{ day:number; total:number; goal:number }|null };

const achievementLevels = [
  { minimum:1_000, short:"1K", label:"1,000 · BRONZE" }, { minimum:10_000, short:"10K", label:"10,000 · SILVER" },
  { minimum:100_000, short:"100K", label:"100,000 · SAPPHIRE" }, { minimum:500_000, short:"500K", label:"500,000 · RUBY" },
  { minimum:1_000_000, short:"1M", label:"1 MILLION · DIAMOND" }, { minimum:2_000_000, short:"2M", label:"2 MILLION · GOLD" },
  { minimum:5_000_000, short:"5M+", label:"5 MILLION+ · NORTH STAR DIAMOND" },
] as const;


function AchievementBadge({ total, verifiedMinimum=0 }:{ total:number; verifiedMinimum?:number }) {
  const achievementTotal = Math.max(total, verifiedMinimum);
  const index = achievementLevels.reduce((best, level, current) => achievementTotal >= level.minimum ? current : best, -1);
  if (index < 0) return null;
  const label = achievementLevels[index].label;
  return <span className={`achievementBadge achievementLevel${index}`} data-award={achievementLevels[index].short} title={label} aria-label={label} />;
}

function achievementValue(leader: Pick<Leader,"verifiedAchievementMinimum"|"total">) {
  return Math.max(leader.total, leader.verifiedAchievementMinimum || 0);
}

function AchievementMenu() {
  return <details className="achievementMenu">
    <summary title="Achievements anzeigen" aria-label="Achievements anzeigen"><span className="achievementMenuLogo achievementLevel4" aria-hidden="true" /></summary>
    <div className="achievementMenuPanel" role="list" aria-label="Erreichbare Achievements">
      {achievementLevels.map((level, index) => <span className="achievementMenuItem" role="listitem" key={level.minimum}>
        <span className={`achievementBadge achievementMenuIcon achievementLevel${index}`} data-award={level.short} aria-hidden="true" />
        <strong>{level.short}</strong><small>{level.label.split(" · ")[1]}</small>
      </span>)}
    </div>
  </details>;
}

export default function AthletesPage() {
  const { t, locale } = useLanguage();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [ownPerformance, setOwnPerformance] = useState<Leader | null>(null);
  const [ownAthleteId, setOwnAthleteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [iconHelpOpen, setIconHelpOpen] = useState(false);
  const [sharingOpen, setSharingOpen] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [sharingLoaded, setSharingLoaded] = useState(false);
  const [sharingSaving, setSharingSaving] = useState(false);
  const [sharingError, setSharingError] = useState("");
  const [sharingDuration, setSharingDuration] = useState<"private"|"day"|"week"|"always">("private");
  const [sharingScope, setSharingScope] = useState<"today"|"all">("all");
  const [sharingUntil, setSharingUntil] = useState<string|null>(null);
  const [sort, setSort] = useState<"age"|"achievement"|"today"|"personalBest"|"average"|"month"|"total">("total");
  const [sortDirection, setSortDirection] = useState<"desc"|"asc">("desc");
  const [genderFilter, setGenderFilter] = useState<"all"|"male"|"female">("all");
  useEffect(() => {
    let active = true;
    const refresh = () => authorizedFetch("/api/leaderboard?owner=1", { cache:"no-store" }).then(async (r) => await r.json() as {leaders?:Leader[];ownerPerformance?:Leader|null}).then((d) => { if (active) { setLeaders(d.leaders || []); setOwnPerformance(d.ownerPerformance || null); } }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    void initializeSession().then(refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  useEffect(() => { let live=true; initializeSession().then(async(user)=>{if(!user)return;const response=await authorizedFetch("/api/profile",{cache:"no-store"});if(response.ok){const data=await response.json() as {profile?:{id:string}};if(live)setOwnAthleteId(data.profile?.id || "")}}).catch(()=>{});return()=>{live=false}},[]);
  const filtered = useMemo(() => leaders.filter((leader) => genderFilter === "all" || leader.gender === genderFilter), [leaders, genderFilter]);
  const featured = useMemo(() => filtered.find((leader) => leader.athleteNumber === 1), [filtered]);
  const ownAthlete = useMemo(() => ownPerformance?.id === ownAthleteId ? ownPerformance : leaders.find((leader) => leader.id === ownAthleteId), [leaders, ownAthleteId, ownPerformance]);
  const ranked = useMemo(() => filtered.filter((leader) => leader.athleteNumber !== 1).sort((a,b) => {
    const aValue = sort === "achievement" ? achievementValue(a) : sort === "age" ? (a.age ?? -1) : a[sort];
    const bValue = sort === "achievement" ? achievementValue(b) : sort === "age" ? (b.age ?? -1) : b[sort];
    const difference = (bValue - aValue) * (sortDirection === "desc" ? 1 : -1);
    return difference || b.total-a.total || b.month-a.month || a.name.localeCompare(b.name);
  }), [filtered, sort, sortDirection]);
  const visibleLeaders = useMemo(() => {
    const search = query.trim().toLocaleLowerCase(locale);
    return ranked.map((leader, index) => ({ leader, rank:index + 1 })).filter(({ leader }) => {
      if (!search) return true;
      const fullName = `${leader.name} ${leader.lastNameInitials}`.toLocaleLowerCase(locale);
      return fullName.includes(search);
    });
  }, [ranked, query, locale]);
  function changeSort(key:"age"|"achievement"|"today"|"personalBest"|"average"|"month"|"total") {
    if (sort === key) setSortDirection((direction) => direction === "desc" ? "asc" : "desc");
    else { setSort(key); setSortDirection("desc"); }
  }
  async function openSharing() {
    setSharingOpen(true); setSharingLoading(true); setSharingLoaded(false); setSharingError("");
    try {
      await initializeSession();
      const response=await authorizedFetch("/api/training-log-access",{cache:"no-store"});
      const data=await response.json() as {error?:string;duration?:"private"|"day"|"week"|"always";scope?:"today"|"all";until?:string|null};
      if(!response.ok) throw new Error(data.error || "Freigabe konnte nicht geladen werden.");
      setSharingDuration(data.duration || "private"); setSharingScope(data.scope || "all"); setSharingUntil(data.until || null); setSharingLoaded(true);
    } catch(error) { setSharingError(error instanceof Error ? error.message : "Freigabe konnte nicht geladen werden."); }
    finally { setSharingLoading(false); }
  }
  async function saveSharing(duration: "private"|"day"|"week"|"always") {
    setSharingSaving(true); setSharingError("");
    try {
      const response=await authorizedFetch("/api/training-log-access",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({duration,scope:sharingScope})});
      const data=await response.json() as {error?:string;until?:string|null};
      if(!response.ok) throw new Error(data.error || "Freigabe konnte nicht gespeichert werden.");
      setSharingUntil(data.until || null); setSharingDuration(duration);
      const board=await authorizedFetch("/api/leaderboard",{cache:"no-store"});
      if(board.ok) setLeaders((await board.json() as {leaders?:Leader[]}).leaders || []);
      setSharingOpen(false);
    } catch(error) { setSharingError(error instanceof Error ? error.message : "Freigabe konnte nicht gespeichert werden."); }
    finally { setSharingSaving(false); }
  }
  const rankLabel = sort === "age" ? "Alter" : sort === "achievement" ? "Achievement" : sort === "today" ? "Heute" : sort === "personalBest" ? "Personal Best" : sort === "average" ? t("rankAverage") : sort === "month" ? t("rankMonth") : t("rankTotal");
  return <main className="athletesPage">
    <header className="statisticsPageTopbar" aria-label="Seitennavigation">
      {ownAthlete && <a className="statisticsOwnPhoto" href="/" title="Zur Startseite" aria-label="Zur Startseite">{ownAthlete.hasProfilePhoto ? <ProfileImage src={`/api/profile-photo?athleteId=${encodeURIComponent(ownAthlete.id)}`} alt={t("profilePhotoOf", { name:ownAthlete.name })} /> : <img src="/profile-placeholder-globe.png" alt="" />}</a>}
      <nav className="statisticsPageNav">
        <a className="statisticsModuleButton dashboardModuleButton" href="/" title="Dashboard · Startseite" aria-label="Dashboard · Startseite"><LayoutDashboard size={22}/></a>
        <span className="statisticsModuleSlot" aria-hidden="true" />
        <a className="statisticsModuleButton roadModuleButton" href="/road-to-100/index.html" title="Road to 100" aria-label="Road to 100"><strong>100</strong></a>
        <a className="statisticsModuleButton challengeModuleButton" href="/your-choice/index.html" title="Push-up Challenge" aria-label="Push-up Challenge"><Trophy size={22}/></a>
        <button className="statisticsHelpButton statisticsBookButton" type="button" aria-expanded={sharingOpen} aria-label="Mein Trainingsbuch: Freigabe und Dauer einstellen" title="Mein Trainingsbuch: Freigabe und Dauer einstellen" onClick={() => sharingOpen ? setSharingOpen(false) : void openSharing()}><Settings size={21}/></button>
      </nav>
      <div className="statisticsTopActions"><button className="statisticsHelpButton" type="button" aria-label="Icons und Funktionen erklären" title="Icons und Funktionen erklären" onClick={() => setIconHelpOpen(true)}><HelpCircle size={22}/></button></div>
    </header>
    {sharingOpen && <section className="trainingSharingDropdown" aria-label="Trainingsbuch-Vorschau freigeben">
      <button className="sharingBackButton" type="button" onClick={() => setSharingOpen(false)}><ArrowLeft size={18}/> Zur Statistik</button>
      <strong>Trainingsbuch-Vorschau · Freigabe</strong>
      {sharingLoading ? <p role="status">Lädt …</p> : sharingLoaded ? <>
        <div className="sharingScopeCompact" role="group" aria-label="Sichtbarer Umfang"><button type="button" className={sharingScope === "today" ? "selected" : ""} onClick={()=>setSharingScope("today")}>Nur heute</button><button type="button" className={sharingScope === "all" ? "selected" : ""} onClick={()=>setSharingScope("all")}>Alle Tage</button></div>
        <div className="sharingDurationCompact" role="group" aria-label="Freigabedauer">
          {([ ["day","1 Tag"], ["week","7 Tage"], ["always","Immer"], ["private","X"] ] as const).map(([duration,label])=><button key={duration} type="button" className={sharingDuration === duration ? "selected" : ""} aria-label={duration === "private" ? "Freigabe entfernen" : `Freigabe ${label}`} title={duration === "private" ? "Freigabe entfernen" : label} disabled={sharingSaving} onClick={()=>void saveSharing(duration)}>{label}</button>)}
        </div>
        {sharingUntil && <small>Freigabe bis {new Intl.DateTimeFormat("de-CH",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/Zurich"}).format(new Date(sharingUntil))}</small>}
        {sharingError && <p role="alert" className="sharingError">{sharingError}</p>}
      </> : <p role="alert" className="sharingError">{sharingError || "Freigabe konnte nicht geladen werden."} {sharingError.includes("anmelden") && <a href="/login">Zur Anmeldung</a>}</p>}
    </section>}
    <Dialog open={iconHelpOpen} onOpenChange={setIconHelpOpen}>
      <DialogContent className="iconHelpDialog" aria-describedby="statistics-icon-help">
        <DialogHeader><DialogTitle>Statistik: Icons und Funktionen</DialogTitle><DialogDescription id="statistics-icon-help">Tippe auf ein Icon oder eine Spaltenüberschrift, um die Ansicht zu ändern.</DialogDescription></DialogHeader>
        <ul className="iconHelpList">
          <li><strong>Dashboard-Symbol</strong><span>Zur Startseite und Push-up-Eingabe.</span></li>
          <li><strong>Leerer Platz</strong><span>Du bist auf der Statistikseite.</span></li>
          <li><strong>100</strong><span>Road to 100 öffnen.</span></li>
          <li><strong>Pokal</strong><span>Deine Push-up-Challenge öffnen.</span></li>
          <li><strong>Zahnrad</strong><span>Vorschau des eigenen Trainingsbuchs für 1 Tag, 7 Tage oder dauerhaft freigeben oder entfernen.</span></li>
          <li><strong>Fragezeichen</strong><span>Diese Erklärung öffnen.</span></li>
          <li><strong>Lupe</strong><span>Athleten nach Namen suchen.</span></li>
          <li><strong>Auszeichnung</strong><span>Die erreichbaren Achievement-Stufen anzeigen.</span></li>
          <li><strong>Pfeile in Spalten</strong><span>Nach dem jeweiligen Wert sortieren; erneutes Tippen kehrt die Reihenfolge um. Die Rangzahlen links folgen der Sortierung.</span></li>
          <li><strong>Graues ? im Fotofeld</strong><span>Für diesen Athleten ist kein Profilfoto vorhanden.</span></li>
        </ul>
      </DialogContent>
    </Dialog>
    <section className="athletesHero"><p className="eyebrow"><Trophy size={17}/>{t("communityRanking")}</p></section>
    <label className="athleteSearch"><Search size={17}/><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchAthlete")} aria-label={t("searchAthlete")} /></label>
    <div className="athleteFilterBar"><div className="genderFilters" role="group" aria-label={t("leaderboard")}><button className={genderFilter === "all" ? "active" : ""} onClick={() => setGenderFilter("all")}>{t("all")}</button><button className={genderFilter === "male" ? "active" : ""} onClick={() => setGenderFilter("male")}>{t("men")}</button><button className={genderFilter === "female" ? "active" : ""} onClick={() => setGenderFilter("female")}>{t("women")}</button></div><AchievementMenu /></div>
    <p className="rankingMode">{t("currentRanking")}: <strong>{rankLabel}</strong> · {genderFilter === "female" ? t("women") : genderFilter === "male" ? t("men") : t("allAthletes")}</p>
    <section className="athletesTable" aria-label={t("allAthletes")}>
      <div className="athletesTableHead"><span title={t("rank")}>#</span><span aria-label={t("photo")} title={t("photo")}>PIC</span><span title={t("athlete")}>ATHLETE</span><button className="ageSort" type="button" title="Alter sortieren" aria-label="Alter sortieren" onClick={() => changeSort("age")} aria-pressed={sort === "age"}><span>AGE</span><ArrowUpDown size={11}/></button><button className="awardSort" type="button" title="Achievement sortieren" aria-label="Achievement sortieren" onClick={() => changeSort("achievement")} aria-pressed={sort === "achievement"}><span>AWD</span><ArrowUpDown size={11}/></button><button className="daySort" type="button" title="Heute" aria-label="Heute sortieren" onClick={() => changeSort("today")} aria-pressed={sort === "today"}><span>DAY</span><ArrowUpDown size={11}/></button><button type="button" title="Personal Best – Max Push-ups in One Set" aria-label="Personal Best sortieren" onClick={() => changeSort("personalBest")} aria-pressed={sort === "personalBest"}><span>PB</span><ArrowUpDown size={11}/></button><button className="averageSort" type="button" title={t("avgDay")} aria-label={t("avgDay")+" sortieren"} onClick={() => changeSort("average")} aria-pressed={sort === "average"}><span>AVG/D</span><ArrowUpDown size={11}/></button><button type="button" title={t("thisMonth")} aria-label={t("thisMonth")+" sortieren"} onClick={() => changeSort("month")} aria-pressed={sort === "month"}><span>MON</span><ArrowUpDown size={11}/></button><button type="button" title={t("total")} aria-label={t("total")+" sortieren"} onClick={() => changeSort("total")} aria-pressed={sort === "total"}><span>TOTAL</span><ArrowUpDown size={11}/></button></div>
      {featured && <div className="athletesTableRow featuredAthlete">
        <span aria-hidden="true" />
        <span className={`athletePhoto ${(featured.trainingLogPublic || featured.id === ownAthleteId) ? "isTrainingLogLink" : ""}`}>{featured.hasProfilePhoto ? ((featured.trainingLogPublic || featured.id === ownAthleteId) ? <a href={`/athletes/${featured.id}#today`} title={`Heutiges Trainingsbuch von ${featured.name}`} aria-label={`Heutiges Trainingsbuch von ${featured.name} öffnen`}><ProfileImage src={`/api/profile-photo?athleteId=${encodeURIComponent(featured.id)}`} alt={t("profilePhotoOf", { name:featured.name })} /></a> : <ProfileImage src={`/api/profile-photo?athleteId=${encodeURIComponent(featured.id)}`} alt={t("profilePhotoOf", { name:featured.name })} />) : <img className="athletePhotoFallback" src="/profile-placeholder-globe.png" alt="THE.HUMAN.CHOICE Globus als Profilbildplatzhalter" />}</span>
        <span className="athleteName"><span><strong className="athleteIdentity">{featured.trainingLogPublic ? <a href={`/athletes/${featured.id}`}>{featured.name}{featured.lastNameInitials ? ` ${featured.lastNameInitials}.` : ""}</a> : <>{featured.name}{featured.lastNameInitials ? ` ${featured.lastNameInitials}.` : ""}</>}</strong><small className="athleteIdLabel">ID {String(featured.athleteNumber).padStart(4, "0")}</small><small className="athleteMeta">TOP · CREATOR · {featured.averagePeriodDays} {t("activeDays")} · {featured.trainingLogPublic ? "TRAININGSBUCH FREIGEGEBEN" : "TRAININGSBUCH PRIVAT"}</small></span></span>
        <span className="birthYear">{featured.age ?? "–"}</span>
        <span className="athleteAward"><AchievementBadge total={featured.total} verifiedMinimum={featured.verifiedAchievementMinimum}/></span>
        <strong data-label="Heute">{featured.today.toLocaleString(locale)}</strong>
        <span className="athletePb"><strong>{featured.personalBest || "–"}</strong></span>
        <strong data-label={t("avgDay")}>{featured.average.toLocaleString(locale)}</strong>
        <strong data-label={t("thisMonth")}>{featured.month.toLocaleString(locale)}</strong>
        <span className="athleteTotal"><strong>{featured.total.toLocaleString(locale)}</strong></span>
      </div>}
      {loading ? <p className="empty">{t("loading")}</p> : visibleLeaders.length ? visibleLeaders.map(({ leader, rank }) => <div className={`athletesTableRow ${rank <= 3 ? "podium" : ""}`} key={leader.id}>
        <strong className="place">{rank}</strong>
        <span className={`athletePhoto ${(leader.trainingLogPublic || leader.id === ownAthleteId) ? "isTrainingLogLink" : ""}`}>{leader.hasProfilePhoto ? ((leader.trainingLogPublic || leader.id === ownAthleteId) ? <a href={`/athletes/${leader.id}#today`} title={`Heutiges Trainingsbuch von ${leader.name}`} aria-label={`Heutiges Trainingsbuch von ${leader.name} öffnen`}><ProfileImage loading="lazy" src={`/api/profile-photo?athleteId=${encodeURIComponent(leader.id)}`} alt={t("profilePhotoOf", { name:leader.name })} /></a> : <ProfileImage loading="lazy" src={`/api/profile-photo?athleteId=${encodeURIComponent(leader.id)}`} alt={t("profilePhotoOf", { name:leader.name })} />) : <img className="athletePhotoFallback" src="/profile-placeholder-globe.png" alt="THE.HUMAN.CHOICE Globus als Profilbildplatzhalter" />}</span>
        <span className="athleteName"><span><strong className="athleteIdentity">{leader.trainingLogPublic ? <a href={`/athletes/${leader.id}`}>{leader.name}{leader.lastNameInitials ? ` ${leader.lastNameInitials}.` : ""}</a> : <>{leader.name}{leader.lastNameInitials ? ` ${leader.lastNameInitials}.` : ""}</>}</strong><small className="athleteIdLabel">ID {String(leader.athleteNumber).padStart(4, "0")}</small><small className="athleteMeta">{leader.country} · {leader.gender === "female" ? "F" : "M"} · {leader.trainingLogPublic ? "Trainingsbuch ansehen" : leader.id === ownAthleteId ? "Eigenes Trainingsbuch ansehen · privat" : "Privat"}</small></span></span>
        <span className="birthYear">{leader.age ?? "–"}</span>
        <span className="athleteAward"><AchievementBadge total={leader.total} verifiedMinimum={leader.verifiedAchievementMinimum}/></span>
        <strong data-label="Heute">{leader.today.toLocaleString(locale)}</strong>
        <span className="athletePb"><strong>{leader.personalBest || "–"}</strong></span>
        <strong data-label={t("avgDay")}>{leader.average.toLocaleString(locale)}</strong>
        <strong data-label={t("thisMonth")}>{leader.month.toLocaleString(locale)}</strong>
        <span className="athleteTotal"><strong>{leader.total.toLocaleString(locale)}</strong></span>
      </div>) : <p className="empty">{t("noAthlete")}</p>}
    </section>
  </main>;
}
