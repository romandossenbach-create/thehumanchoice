import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';

const roman = '0431b2b7-b3d3-4666-b5ad-f0d53709b686';
const romanUser = '77e8d9e3-e947-4185-955f-28502e4a8deb';
const other = '33333333-3333-4333-8333-333333333333';
const otherUser = 'second-athlete-user';
function setup() {
  const db = new DatabaseSync(':memory:');
  for (const file of readdirSync('drizzle').filter(f => /^00\d\d.*sql$/.test(f)).sort()) {
    if (file.startsWith('0016')) continue;
    db.exec(readFileSync('drizzle/'+file,'utf8'));
  }
  db.prepare('INSERT INTO athletes (id,name,last_name,country,gender,athlete_number,owner_user_id,training_log_public) VALUES (?,?,?,?,?,?,?,1)').run(roman,'Roman','Dossenbach','Schweiz','male',1,romanUser);
  db.prepare('INSERT INTO athletes (id,name,last_name,country,gender,athlete_number,owner_user_id,training_log_public) VALUES (?,?,?,?,?,?,?,1)').run(other,'Second','Athlete','Germany','male',9,otherUser);
  db.prepare('INSERT INTO entries (athlete_id,request_id,reps,entry_date,evidence_key) VALUES (?,?,?,?,?)').run(roman,'roman-entry-000000000000000000',100,'2026-09-30','private-video');
  db.prepare('INSERT INTO entries (athlete_id,request_id,reps,entry_date) VALUES (?,?,?,?)').run(other,'other-entry-000000000000000000',40,'2026-09-30');
  db.prepare('UPDATE athletes SET profile_photo_key = ? WHERE id = ?').run('private-photo',roman);
  db.prepare('INSERT INTO challenges (owner_user_id,days,target,start,total,today,today_date) VALUES (?,?,?,?,?,?,?)').run(romanUser,100,100000,'2026-08-06',59646,100,'2026-09-30');
  const snapshot = () => JSON.stringify({entries:db.prepare('SELECT * FROM entries ORDER BY id').all(),challenges:db.prepare('SELECT * FROM challenges').all()});
  const before = snapshot();
  db.exec(readFileSync('drizzle/0016_private_mode.sql','utf8'));
  const DB = { prepare(sql) {
    let args=[];
    const statement={bind(...values){args=values;return statement},async first(){return db.prepare(sql).get(...args) || null},async all(){return {results:db.prepare(sql).all(...args)}},async run(){const result=db.prepare(sql).run(...args);return {meta:{changes:result.changes}}}};
    return statement;
  }};
  const env={DB,BUCKET:{async get(){return {body:'media',httpMetadata:{}}}}};
  function route(path) {
    const source=readFileSync(path,'utf8');
    const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    const exports={};
    new Function('require','exports',js)((id)=> {
      if(id==='cloudflare:workers')return {env};
      if(id.includes('supabase-server'))return {async getSupabaseUser(request){const id=request.headers.get('authorization')?.replace('Bearer ','');return id?{id}:null}};
      if(id.includes('cors'))return {roadCorsJson:(request,body,init)=>Response.json(body,init)};
      if(id.includes('local-date'))return {localDayKey:()=> '2026-09-30',localMonthKey:()=> '2026-09',validTimeZone:()=> 'Europe/Zurich'};
      if(id.includes('single-set'))return {singleSetRepetitions:(id,reps)=>[reps],COMPOSITE_SESSIONS:{}};
      throw new Error('Unexpected import '+id);
    },exports);
    return exports;
  }
  function req(path,user,method='GET',body) {return new Request('https://test.invalid'+path,{method,headers:{...(user?{authorization:'Bearer '+user}:{}),...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})})}
  return {db,snapshot,before,route,req};
}

test('Migration activates only Roman and preserves all training/challenge rows',()=> {
 const {db,snapshot,before}=setup();assert.equal(snapshot(),before);
 assert.equal(db.prepare('SELECT private_mode FROM athletes WHERE id=?').get(roman).private_mode,1);
 assert.equal(db.prepare('SELECT private_mode FROM athletes WHERE id=?').get(other).private_mode,0);
});

test('Anonymous and normal second athlete cannot receive private rankings or totals; owner receives own values separately',async()=> {
 const {route,req}=setup();const api=route('app/api/leaderboard/route.ts');
 for(const user of [undefined,otherUser,romanUser]){
  const response=await api.GET(req('/api/leaderboard',user));assert.equal(response.status,200);const data=await response.json();
  assert.deepEqual(data.leaders.map(row=>row.id),[other]);assert.equal(data.summary.total,40);assert.equal(data.summary.month,40);assert.equal(data.summary.athletes,1);
  assert.ok(!JSON.stringify(data.leaders).includes(roman));assert.ok(!JSON.stringify(data).includes('ownerUserId'));
  if(user===romanUser){assert.equal(data.ownAthlete.id,roman);assert.equal(data.ownAthlete.total,78205);assert.equal(data.ownAthlete.personalBest,111);assert.equal(data.ownAthlete.privateMode,true)}
  else assert.notEqual(data.ownAthlete?.id,roman);
  assert.match(response.headers.get('cache-control'),/no-store/);
 }
});

test('Private history is blocked even when sharing is permanent; owner retains all sets',async()=> {
 const {route,req}=setup();const api=route('app/api/history/route.ts');
 for(const user of [undefined,otherUser]){const response=await api.GET(req('/api/history?athleteId='+roman,user));assert.equal(response.status,404);assert.ok(!JSON.stringify(await response.json()).includes('100'))}
 const response=await api.GET(req('/api/history?athleteId='+roman,romanUser));assert.equal(response.status,200);const data=await response.json();assert.equal(data.entries[0].reps,100);assert.equal(data.readOnly,false);
});

test('Direct private evidence and profile-photo URLs deny second account and anonymous requests',async()=> {
 const {route,req}=setup();
 for(const [file,path] of [['evidence','/api/evidence?entryId=1'],['profile-photo','/api/profile-photo?athleteId='+roman]]){
  const api=route('app/api/'+file+'/route.ts');
  for(const user of [undefined,otherUser])assert.equal((await api.GET(req(path,user))).status,404);
  const owner=await api.GET(req(path,romanUser));assert.equal(owner.status,200);assert.equal(await owner.text(),'media');assert.match(owner.headers.get('cache-control'),/no-store/);
 }
});

test('Privacy is persisted per account, rejects invalid/anonymous writes, and ignores target athlete IDs',async()=> {
 const {route,req,snapshot,before}=setup();const api=route('app/api/privacy/route.ts');
 assert.equal((await api.PUT(req('/api/privacy',undefined,'PUT',{privateMode:false}))).status,401);
 assert.equal((await api.PUT(req('/api/privacy',romanUser,'PUT',{privateMode:'false'}))).status,400);
 await api.PUT(req('/api/privacy',otherUser,'PUT',{privateMode:false,athleteId:roman}));
 assert.equal((await (await api.GET(req('/api/privacy',romanUser))).json()).privateMode,true);
 await api.PUT(req('/api/privacy',romanUser,'PUT',{privateMode:false}));
 // A separate request represents a new session/device, with no process-local privacy state.
 assert.equal((await (await api.GET(req('/api/privacy',romanUser))).json()).privateMode,false);
 const board=await (await route('app/api/leaderboard/route.ts').GET(req('/api/leaderboard',otherUser))).json();assert.ok(board.leaders.some(row=>row.id===roman));
 await api.PUT(req('/api/privacy',romanUser,'PUT',{privateMode:true}));
 assert.equal((await (await api.GET(req('/api/privacy',romanUser))).json()).privateMode,true);assert.equal(snapshot(),before);
});

test('Legacy profile updates preserve private mode; profile ID cannot be used to take over Roman',async()=> {
 const {route,req}=setup();const api=route('app/api/profile/route.ts');
 const body={athleteId:roman,name:'Second',lastName:'Athlete',country:'Germany',gender:'male'};
 assert.equal((await api.POST(req('/api/profile',otherUser,'POST',body))).status,200);
 const profile=await (await api.GET(req('/api/profile',romanUser))).json();assert.equal(profile.profile.name,'Roman');assert.equal(profile.profile.privateMode,1);
 await api.POST(req('/api/profile',romanUser,'POST',{name:'Roman',lastName:'Dossenbach',country:'Schweiz',gender:'male'}));
 assert.equal((await (await api.GET(req('/api/profile',romanUser))).json()).profile.privateMode,1);
});

test('Public archive and historical performance omit Roman; owner retains preserved archive and record history',async()=> {
 const {route,req}=setup();
 for(const user of [undefined,otherUser,romanUser]) {
  const archive=await (await route('app/api/world-archive/route.ts').GET(req('/api/world-archive',user))).json();assert.equal(archive.points.length,user===romanUser?1:0);
  const records=await (await route('app/api/world-records/route.ts').GET(req('/api/world-records',user))).json();assert.equal(JSON.stringify(records).includes('Roman'),user===romanUser);
 }
});

test('Public globe assets do not embed private training, and Creator credits remain independent',()=> {
 for(const file of ['public/push-your-world/index.html','public/push-your-world/world.js']){
  const s=readFileSync(file,'utf8');assert.ok(!s.includes('Dossenbach'));assert.ok(!s.includes('PYW-000005'));assert.ok(!s.includes('7.8929'));
 }
 const credits=readFileSync('public/shared-menu.js','utf8');assert.match(credits,/Creator · Roman Dossenbach/);
});
