import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";
type RecordEntry = { date:string; name:string; country:string; place:string; value:number; current?:boolean };
type RecordCategory = { title:string; unit:string; note?:string; entries:RecordEntry[] };
const categories: RecordCategory[] = [
  {
    title:"Most Push Ups in One Hour (Male)", unit:"1 Stunde",
    entries:[
      {date:"2014",name:"Carlton Williams",country:"UK",place:"Margaret River, Australien",value:1874},
      {date:"25.07.2015",name:"Carlton Williams",country:"UK",place:"Margaret River, Australien",value:2220},
      {date:"Juni 2016",name:"Charles Shepherd",country:"UK",place:"Carlisle, UK",value:2325},
      {date:"29.11.2016",name:"Roman Dossenbach",country:"Schweiz",place:"Basel, Schweiz",value:2392},
      {date:"2017",name:"Carlton Williams",country:"UK",place:"Margaret River, Australien",value:2682},
      {date:"31.08.2018",name:"Jarrad Young",country:"Australien",place:"Queensland, Australien",value:2806},
      {date:"2020",name:"Jarrad Young",country:"Australien",place:"Queensland, Australien",value:2919},
      {date:"2021",name:"Jarrad Young",country:"Australien",place:"Australien",value:3054},
      {date:"April 2022",name:"Daniel Scali",country:"Australien",place:"Australien",value:3182},
      {date:"November 2022",name:"Lucas Helmke",country:"Australien",place:"Brisbane, Australien",value:3206},
      {date:"2023",name:"Daniel Scali",country:"Australien",place:"Australien",value:3249},
      {date:"30.06.2023",name:"Laurentiu Pop",country:"UK / Rumänien",place:"London, UK",value:3378,current:true},
    ],
  },
  {
    title:"Most Knuckle Push Ups in One Hour (Male)", unit:"1 Stunde",
    note:"Beim von Guinness bestätigten Zwischenstand von 2.245 ist der Rekordhalter in den ausgewerteten Quellen noch nicht eindeutig ermittelt.",
    entries:[
      {date:"27.08.2015",name:"Roman Dossenbach",country:"Schweiz",place:"Basel, Schweiz",value:1796},
      {date:"20.03.2016",name:"Syed Taj Muhammad",country:"Pakistan",place:"Karachi, Pakistan",value:2175},
      {date:"vor 09/2024",name:"Nicht ermittelt",country:"–",place:"–",value:2245},
      {date:"21.09.2024",name:"Daniel Krobath",country:"Österreich",place:"Wien, Österreich",value:2400,current:true},
    ],
  },
  {
    title:"Most Knuckle Push Ups in One Minute (Male)", unit:"1 Minute",
    note:"Romans Leistungen mit 66, 85 und 101 Wiederholungen sind durch Original-Guinness-Zertifikate belegt.",
    entries:[
      {date:"04.03.2015",name:"Roman Dossenbach",country:"Schweiz",place:"Basel, Schweiz",value:66},
      {date:"27.06.2015",name:"Ron Cooper",country:"USA",place:"Salem, Massachusetts",value:79},
      {date:"21.12.2016",name:"Roman Dossenbach",country:"Schweiz",place:"Basel, Schweiz",value:85},
      {date:"2017",name:"Ron Cooper",country:"USA",place:"New York City, USA",value:91},
      {date:"25.03.2017",name:"Roman Dossenbach",country:"Schweiz",place:"Wien, Österreich",value:101},
      {date:"02.11.2017",name:"Andrey Lobkov",country:"Russland",place:"Moskau, Russland",value:107},
      {date:"01.03.2018",name:"Ron Cooper",country:"USA",place:"Marblehead, Massachusetts",value:107},
      {date:"03.03.2019",name:"Jagdishram B. Midle",country:"Indien",place:"Indien",value:113},
      {date:"04.12.2024",name:"Hong Zhongtao",country:"China",place:"Guangzhou, China",value:136},
      {date:"27.04.2026",name:"Hiroshi Narushima",country:"Japan",place:"Kashiwa, Chiba, Japan",value:141,current:true},
    ],
  },
];

export async function GET(request:Request) {
  const user = await getSupabaseUser(request);
  const visible = await env.DB!.prepare("SELECT id FROM athletes WHERE id = ? AND (private_mode = 0 OR owner_user_id = ?)").bind("0431b2b7-b3d3-4666-b5ad-f0d53709b686", user?.id || "").first();
  const result = categories.map(category => ({...category,
    entries:category.entries.filter(entry => visible || entry.name !== "Roman Dossenbach"),
    note:!visible && category.note?.includes("Romans") ? undefined : category.note,
  }));
  return Response.json({categories:result}, {headers:{"cache-control":"private, no-store", "vary":"Authorization"}});
}

