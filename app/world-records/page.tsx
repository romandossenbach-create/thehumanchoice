"use client";

import { useEffect, useState } from "react";
import { authorizedFetch, initializeSession } from "../auth-client";

import { Medal, Trophy } from "lucide-react";
import { useLanguage } from "../i18n";
import { SubpageHeader } from "../subpage-header";

type RecordEntry = { date:string; name:string; country:string; place:string; value:number; current?:boolean };
type RecordCategory = { title:string; unit:string; note?:string; entries:RecordEntry[] };


export default function WorldRecordsPage() {
  const [categories, setCategories] = useState<RecordCategory[]>([]);
  useEffect(() => { let active=true; initializeSession().then(() => authorizedFetch("/api/world-records", {cache:"no-store"})).then(async response => { if (!response.ok) return; const data = await response.json() as {categories:RecordCategory[]}; if(active) setCategories(data.categories); }).catch(()=>{}); return () => {active=false}; }, []);
  const { language, setLanguage, t, locale } = useLanguage();
  return <main className="worldRecordsPage">
    <SubpageHeader language={language} setLanguage={setLanguage} loginLabel={t("login")} logoutLabel={t("logout")} />
    <section className="worldRecordsHero">
      <p className="eyebrow"><Trophy size={17}/> Guinness World Records</p>
      <h1>{t("recordsTitle")}</h1>
      <p>{t("recordsIntro")}</p>
    </section>
    <section className="recordCategories" aria-label="Push-up Weltrekorde">
      {categories.map((category) => <article className="recordCategory" key={category.title}>
        <header className="recordCategoryHeader"><h2>{category.title}</h2><span><Medal size={13}/> {category.unit === "1 Stunde" ? t("hour") : t("minute")}</span></header>
        <div className="recordsTableHead"><span>{t("date")}</span><span>{t("recordHolder")}</span><span>{t("nationality")}</span><span>{t("place")}</span><span>{t("countLabel")}</span></div>
        {category.entries.map((entry,index) => <div className={`recordRow ${entry.current ? "current" : ""}`} key={`${category.title}-${entry.date}-${index}`}>
          <span className="recordDate">{entry.date}</span>
          <span className="recordHolder"><strong>{entry.name}</strong>{entry.current && <small>{t("currentRecord")}</small>}</span>
          <span>{entry.country}</span>
          <span className="recordPlace">{entry.place}</span>
          <strong className="recordValue">{entry.value.toLocaleString(locale)}</strong>
        </div>)}
        {category.note && <p className="recordNote">{category.note}</p>}
      </article>)}
    </section>
  </main>;
}
