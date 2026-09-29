"use client";

import { useEffect, useMemo, useState } from "react";
import { authorizedFetch, initializeSession } from "../../auth-client";

type Athlete = { id:string; athleteNumber:number; name:string; lastName:string|null; email:string|null; gender:string|null; birthDate:string|null; registeredAt:string; daysSinceRegistration:number; activeDays:number; sets:number; sessions:null; totalReps:number; averagePerActiveDay:number; lastActivity:string|null; trainingLogPublic:boolean; publicScope:string|null; verificationLevel1:null; verificationLevel2:null; evidenceEntries:number; futureRootA:null; futureRootB:null; hasOwnerAccountLink:boolean };
type Data = { athletes:Athlete[]; counts:{athleteProfiles:number;supabaseAccounts:number;adminRows:number};missingProfiles:{id:string;email:string|null;registeredAt:string}[];unlinkedProfiles:{athleteNumber:number;name:string;lastName:string|null;ownerUserId:string|null}[];limitations:string[] };
const columns: { key:keyof Athlete; label:string }[] = [
  {key:"athleteNumber",label:"Athlete-ID"},{key:"lastName",label:"Nachname"},{key:"name",label:"Vorname"},{key:"email",label:"E-Mail (Admin)"},
  {key:"gender",label:"M/W"},{key:"birthDate",label:"Alter"},{key:"registeredAt",label:"Eintritt"},
  {key:"daysSinceRegistration",label:"Tage seit Eintritt"},{key:"activeDays",label:"Aktive Tage"},
  {key:"sessions",label:"Sessions"},{key:"sets",label:"Sätze"},{key:"totalReps",label:"Gesamt-Reps"},
  {key:"averagePerActiveDay",label:"Ø/aktivem Tag"},{key:"lastActivity",label:"Letzte Aktivität"},
  {key:"trainingLogPublic",label:"Trainingsbuch"},{key:"verificationLevel1",label:"Level 1"},
  {key:"verificationLevel2",label:"Level 2"},{key:"evidenceEntries",label:"Evidence/Proof"},
  {key:"futureRootA",label:"Future Root A"},{key:"futureRootB",label:"Future Root B"},
];
function age(birthDate:string|null) { if (!birthDate) return null; const born=new Date(`${birthDate}T12:00:00Z`), now=new Date(); return now.getUTCFullYear()-born.getUTCFullYear()-(now.getUTCMonth()<born.getUTCMonth() || now.getUTCMonth()===born.getUTCMonth() && now.getUTCDate()<born.getUTCDate()?1:0); }
function display(row:Athlete,key:keyof Athlete) {
  if(key==="athleteNumber") return String(row.athleteNumber).padStart(4,"0");
  if(key==="birthDate") return age(row.birthDate) ?? "—";
  if(key==="gender") return row.gender==="female"?"W":row.gender==="male"?"M":"—";
  if(key==="trainingLogPublic") return row.trainingLogPublic?"Freigegeben":"Privat";
  if(key==="verificationLevel1" || key==="verificationLevel2") return "Nicht belegt";
  if(key==="sessions") return "Nicht erfasst";
  if(key==="futureRootA" || key==="futureRootB") return "Reserviert";
  if(key==="averagePerActiveDay") return row.averagePerActiveDay.toFixed(1);
  return String(row[key] ?? "—");
}
export default function AdminAthletesPage() {
  const [data,setData]=useState<Data|null>(null), [error,setError]=useState(""), [search,setSearch]=useState(""), [filters,setFilters]=useState<Record<string,string>>({});
  const [sort,setSort]=useState<keyof Athlete>("athleteNumber"), [ascending,setAscending]=useState(true);
  useEffect(()=>{let live=true;initializeSession().then(()=>authorizedFetch("/api/admin/athletes",{cache:"no-store"})).then(async response=>{const body=await response.json() as Data & {error?:string};if(!response.ok) throw new Error(body.error||"Daten nicht verfügbar.");if(live)setData(body)}).catch(e=>{if(live)setError(String(e.message||e))});return()=>{live=false}},[]);
  const rows=useMemo(()=>[...(data?.athletes||[])].filter(row=>{
    const term=search.toLocaleLowerCase("de-CH");
    return (!term || `${row.athleteNumber} ${row.name} ${row.lastName||""}`.toLocaleLowerCase("de-CH").includes(term)) && columns.every(({key})=>!filters[key] || String(display(row,key)).toLocaleLowerCase("de-CH").includes(filters[key].toLocaleLowerCase("de-CH")));
  }).sort((a,b)=>{const av=sort==="birthDate"?age(a.birthDate):a[sort], bv=sort==="birthDate"?age(b.birthDate):b[sort];const comparison=typeof av==="number"&&typeof bv==="number"?av-bv:String(av??"").localeCompare(String(bv??""),"de-CH",{numeric:true});return ascending?comparison:-comparison}),[data,search,filters,sort,ascending]);
  return <main style={{padding:"1.5rem",fontFamily:"system-ui",color:"#171717",background:"#fff",minHeight:"100vh"}}>
    <header style={{display:"flex",alignItems:"center",gap:12,borderBottom:"2px solid #111",paddingBottom:12}}><img src="/profile-placeholder-globe.png" alt="Globe/Wusch Logo-Platzhalter" width="46" height="46"/><div><strong>THE.HUMAN.CHOICE</strong><div>Athlete-Adminstatistik</div></div></header>
    {error?<p role="alert">{error}</p>:!data?<p role="status">Lädt …</p>:<>
      <p role="status">Supabase Accounts: {data.counts.supabaseAccounts} · Athlete Profiles: {data.counts.athleteProfiles} · Adminstatistik: {data.counts.adminRows} · Differenz Profile/Admin: {data.counts.athleteProfiles-data.counts.adminRows}</p>
      <section><h2>Auth-Konten ohne zugeordnetes Athletenprofil ({data.missingProfiles.length})</h2>{data.missingProfiles.length?<ul>{data.missingProfiles.map(account=><li key={account.id}>{account.email || "Ohne E-Mail"} · {account.id} · {account.registeredAt}</li>)}</ul>:<p>Keine</p>}</section>
      <section><h2>Athletenprofile ohne passendes Auth-Konto ({data.unlinkedProfiles.length})</h2>{data.unlinkedProfiles.length?<ul>{data.unlinkedProfiles.map(profile=><li key={profile.athleteNumber}>{String(profile.athleteNumber).padStart(4,"0")} · {profile.name} {profile.lastName || ""} · Verknüpfung: {profile.ownerUserId || "keine"}</li>)}</ul>:<p>Keine</p>}</section>
      <p>{data.limitations.join(" ")}</p>
      <label>Suche <input type="search" value={search} onChange={e=>setSearch(e.target.value)} /></label> <button type="button" onClick={()=>window.print()}>Drucken</button>
      <p>{rows.length} von {data.counts.athleteProfiles} Profilen sichtbar</p>
      <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",fontSize:12,width:"100%"}}><thead><tr>{columns.map(({key,label})=><th key={key} scope="col" style={{borderBottom:"1px solid",padding:5,textAlign:"left"}}><button type="button" aria-label={`${label} sortieren`} onClick={()=>{if(sort===key)setAscending(!ascending);else {setSort(key);setAscending(true)}}}>{label}</button><input style={{width:85,display:"block"}} aria-label={`${label} filtern`} value={filters[key]||""} onChange={e=>setFilters({...filters,[key]:e.target.value})}/></th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id}>{columns.map(({key})=><td key={key} style={{borderBottom:"1px solid #ddd",padding:5,whiteSpace:"nowrap"}}>{display(row,key)}</td>)}</tr>)}</tbody></table></div>
    </>}
  </main>;
}
