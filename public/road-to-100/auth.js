const SUPABASE_URL="https://tlcuogpjvckiyaommofm.supabase.co";
const SUPABASE_ANON_KEY="__SUPABASE_ANON_KEY__";
const HUMAN_CHOICE="https://pushup-world-ranking.roman-dossenbach.chatgpt.site";
const ACCESS_KEY="pushup-supabase-access-token";
const REFRESH_KEY="pushup-supabase-refresh-token";
const ROAD_PROFILE_KEY="road-to-100-shared-profile";
const SYNC_KEY="road-to-100-synced-days";
let signupMode=false;
let currentProfile=null;
let refreshPromise=null;
const t=(key,values)=>window.RoadI18n.t(key,values);

function storeSession(data){if(data.access_token)localStorage.setItem(ACCESS_KEY,data.access_token);if(data.refresh_token)localStorage.setItem(REFRESH_KEY,data.refresh_token)}
function clearSession(){localStorage.removeItem(ACCESS_KEY);localStorage.removeItem(REFRESH_KEY)}
function tokenIsFresh(access){try{const payload=JSON.parse(atob(access.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));return Number(payload.exp||0)*1000>Date.now()+60000}catch{return false}}
async function performRefresh(){const refresh_token=localStorage.getItem(REFRESH_KEY);if(!refresh_token)return null;try{const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:"POST",headers:{apikey:SUPABASE_ANON_KEY,"content-type":"application/json"},body:JSON.stringify({refresh_token})});if(!response.ok){if((response.status===400||response.status===401)&&localStorage.getItem(REFRESH_KEY)===refresh_token)clearSession();return null}const data=await response.json();storeSession(data);return data.access_token||null}catch{return null}}
async function refreshSession(){if(!refreshPromise)refreshPromise=performRefresh().finally(()=>{refreshPromise=null});return refreshPromise}
async function token(){const access=localStorage.getItem(ACCESS_KEY);return access&&tokenIsFresh(access)?access:await refreshSession()}
async function centralFetch(path,init={}){let access=await token();const send=()=>fetch(`${HUMAN_CHOICE}${path}`,{...init,headers:{...(init.headers||{}),authorization:`Bearer ${access}`}});let response=await send();if(response.status===401&&(access=await refreshSession()))response=await send();return response}
window.centralFetch=centralFetch;
function maintainSession(){const access=localStorage.getItem(ACCESS_KEY);if(localStorage.getItem(REFRESH_KEY)&&(!access||!tokenIsFresh(access)))void refreshSession()}
addEventListener("online",maintainSession);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")maintainSession()});
setInterval(maintainSession,4*60*1000);
function localProfile(){try{return JSON.parse(localStorage.getItem(ROAD_PROFILE_KEY)||"null")}catch{return null}}
function showApp(email){window.roadUserEmail=email||"";window.dispatchEvent(new CustomEvent("road-user-ready",{detail:{email:window.roadUserEmail}}));document.querySelector("#authCard").style.display="none";document.querySelector("#app").classList.remove("locked")}
function showLogin(message=""){document.querySelector("#authCard").style.display="block";document.querySelector("#accountBar")?.style.setProperty("display","none");document.querySelector("#app").classList.add("locked");document.querySelector("#authMessage").textContent=message}
function showProfileSetup(show){document.querySelector("#profileSetup").style.display=show?"block":"none"}

async function loadProfile(){try{const response=await centralFetch("/api/profile",{cache:"no-store"});const data=await response.json();currentProfile=response.ok?data.profile:null}catch{currentProfile=null}currentProfile=currentProfile||localProfile();showProfileSetup(!currentProfile)}
async function persistRoadPlan(plan){if(!plan)return false;try{const response=await centralFetch("/api/road-plan",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify(plan)});return response.ok}catch{return false}}
async function loadRoadPlan(){try{const response=await centralFetch("/api/road-plan",{cache:"no-store"});const data=await response.json();if(response.ok&&data.plan){window.applyRoadPlan?.(data.plan);return}const local=window.getRoadPlan?.();if(local?.max)await persistRoadPlan(local)}catch{}}
window.persistRoadPlan=persistRoadPlan;
async function initializeAccount(){const hash=new URLSearchParams(location.hash.slice(1));if(hash.get("access_token")){storeSession({access_token:hash.get("access_token"),refresh_token:hash.get("refresh_token")});history.replaceState({},document.title,location.pathname)}let access=await token();if(!access)return showLogin();let response;try{response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_ANON_KEY,authorization:`Bearer ${access}`}});if(response.status===401&&(access=await refreshSession()))response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_ANON_KEY,authorization:`Bearer ${access}`}})}catch{return showLogin("Verbindung unterbrochen. Deine Anmeldung bleibt gespeichert.")}if(!response.ok){if((response.status===400||response.status===401)&&localStorage.getItem(ACCESS_KEY)===access)clearSession();return showLogin()}const user=await response.json();showApp(user.email||"");await loadProfile();await loadRoadPlan();await syncCompletedDay()}

async function syncCompletedDay(){const plan=JSON.parse(localStorage.getItem("road-to-100-v1")||"null");if(!plan||!plan.actuals||!currentProfile)return;const date=plan.date||new Date().toDateString();const synced=JSON.parse(localStorage.getItem(SYNC_KEY)||"{}");for(const [setIndex,value] of Object.entries(plan.actuals)){const reps=Math.round(Number(value||0));if(!Number.isInteger(reps)||reps<1||reps>5000)continue;const key=`${date}:${setIndex}`;if(synced[key]?.complete)continue;const requestId=synced[key]?.requestId||crypto.randomUUID();synced[key]={requestId,reps,complete:false};localStorage.setItem(SYNC_KEY,JSON.stringify(synced));const athleteId=currentProfile.id||currentProfile.athleteId||crypto.randomUUID();const response=await centralFetch("/api/leaderboard",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({athleteId,requestId,name:currentProfile.name,lastName:currentProfile.lastName||"",country:currentProfile.country,gender:currentProfile.gender||"male",birthDate:currentProfile.birthDate||"",reps})});if(response.ok){const result=await response.json();currentProfile={...currentProfile,id:result.athleteId||athleteId};localStorage.setItem(ROAD_PROFILE_KEY,JSON.stringify(currentProfile));synced[key]={requestId,reps,complete:true};localStorage.setItem(SYNC_KEY,JSON.stringify(synced))}}}
window.syncCompletedDay=syncCompletedDay;

async function recordRoadSet(setIndex,reps,date){
  if(!currentProfile)return {ok:false,error:"Athletenprofil fehlt."};
  const synced=JSON.parse(localStorage.getItem(SYNC_KEY)||"{}");
  const key=`${date}:${setIndex}`;
  const previous=synced[key];
  const athleteId=currentProfile.id||currentProfile.athleteId||crypto.randomUUID();
  const method=previous?.entryId?"PATCH":"POST";
  const requestId=previous?.requestId||crypto.randomUUID();
  const response=await centralFetch("/api/leaderboard",{method,headers:{"content-type":"application/json"},body:JSON.stringify({entryId:previous?.entryId,athleteId,requestId,name:currentProfile.name,lastName:currentProfile.lastName||"",country:currentProfile.country,gender:currentProfile.gender||"male",birthDate:currentProfile.birthDate||"",reps,source:"road-to-100"})});
  const result=await response.json().catch(()=>({}));
  if(!response.ok)return {ok:false,error:result.error||"Satz konnte nicht gespeichert werden.",retryAfterSeconds:result.retryAfterSeconds};
  navigator.vibrate?.(60);
  currentProfile={...currentProfile,id:result.athleteId||athleteId};
  localStorage.setItem(ROAD_PROFILE_KEY,JSON.stringify(currentProfile));
  synced[key]={requestId,reps,entryId:result.entryId,complete:true,createdAt:result.createdAt};
  localStorage.setItem(SYNC_KEY,JSON.stringify(synced));
  return {ok:true,...result};
}
window.recordRoadSet=recordRoadSet;

addEventListener("DOMContentLoaded",()=>{
  addEventListener("road-language-change",()=>{document.querySelector("#authTitle").textContent=signupMode?t("create"):t("signIn");document.querySelector("#authSubmit").textContent=signupMode?t("create"):t("signIn");document.querySelector("#authSwitch").textContent=signupMode?t("backSignIn"):t("create")});
  document.querySelector("#authSwitch").onclick=()=>{signupMode=!signupMode;document.querySelector("#authTitle").textContent=signupMode?t("create"):t("signIn");document.querySelector("#authSubmit").textContent=signupMode?t("create"):t("signIn");document.querySelector("#authSwitch").textContent=signupMode?t("backSignIn"):t("create");document.querySelector("#healthRow").hidden=!signupMode;document.querySelector("#authMessage").textContent=""};
  document.querySelector("#authForm").onsubmit=async event=>{event.preventDefault();const email=document.querySelector("#authEmail").value.trim();const password=document.querySelector("#authPassword").value;const message=document.querySelector("#authMessage");if(signupMode&&!document.querySelector("#healthAccepted").checked){message.textContent=t("healthRequired");return}message.textContent=t("checking");const endpoint=signupMode?"/auth/v1/signup":"/auth/v1/token?grant_type=password";const response=await fetch(`${SUPABASE_URL}${endpoint}`,{method:"POST",headers:{apikey:SUPABASE_ANON_KEY,"content-type":"application/json"},body:JSON.stringify({email,password,...(signupMode?{options:{emailRedirectTo:location.origin}}:{})})});const data=await response.json();if(!response.ok){message.textContent=data.error_description||data.msg||t("signInFailed");return}if(data.access_token){storeSession(data);showApp(email);await loadProfile();await loadRoadPlan();await syncCompletedDay()}else message.textContent=t("confirmMail")};
  document.querySelector("#saveProfile").onclick=async()=>{const name=document.querySelector("#profileName").value.trim(),lastName=document.querySelector("#profileLastName").value.trim(),country=document.querySelector("#profileCountry").value.trim(),gender=document.querySelector("#profileGender").value;if(name.length<2||country.length<2)return alert(t("profileRequired"));const athleteId=currentProfile?.id||currentProfile?.athleteId||crypto.randomUUID();const response=await centralFetch("/api/profile",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({athleteId,name,lastName,country,gender,birthDate:""})});const result=await response.json().catch(()=>({}));if(!response.ok||!result.profile)return alert(result.error||t("signInFailed"));currentProfile=result.profile;localStorage.setItem(ROAD_PROFILE_KEY,JSON.stringify(currentProfile));showProfileSetup(false);await syncCompletedDay()};
  const sets=document.querySelector("#sets");if(sets)new MutationObserver(()=>syncCompletedDay()).observe(sets,{childList:true,subtree:true});
  initializeAccount();
});
