(() => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const locales={de:"de-DE",en:"en-US",fr:"fr-FR",es:"es-ES",it:"it-IT",pt:"pt-PT",bg:"bg-BG",tr:"tr-TR",hu:"hu-HU",ar:"ar-SA"};
  const labels={de:"Zahl sprechen",en:"Speak number",fr:"Dicter le nombre",es:"Decir el número",it:"Pronuncia il numero",pt:"Dizer o número",bg:"Кажете числото",tr:"Sayıyı söyle",hu:"Mondd ki a számot",ar:"انطق الرقم"};
  const words={
    de:{null:0,ein:1,eins:1,zwei:2,drei:3,vier:4,fünf:5,sechs:6,sieben:7,acht:8,neun:9,zehn:10,elf:11,zwölf:12,dreizehn:13,vierzehn:14,fünfzehn:15,sechzehn:16,siebzehn:17,achtzehn:18,neunzehn:19,zwanzig:20,dreißig:30,vierzig:40,fünfzig:50,sechzig:60,siebzig:70,achtzig:80,neunzig:90,hundert:100,einhundert:100},
    en:{zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100},
    fr:{zéro:0,un:1,une:1,deux:2,trois:3,quatre:4,cinq:5,six:6,sept:7,huit:8,neuf:9,dix:10,onze:11,douze:12,treize:13,quatorze:14,quinze:15,seize:16,vingt:20,trente:30,quarante:40,cinquante:50,soixante:60,cent:100},
    es:{cero:0,uno:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,trece:13,catorce:14,quince:15,veinte:20,treinta:30,cuarenta:40,cincuenta:50,sesenta:60,setenta:70,ochenta:80,noventa:90,cien:100},
    it:{zero:0,uno:1,due:2,tre:3,quattro:4,cinque:5,sei:6,sette:7,otto:8,nove:9,dieci:10,undici:11,dodici:12,tredici:13,quattordici:14,quindici:15,venti:20,trenta:30,quaranta:40,cinquanta:50,sessanta:60,settanta:70,ottanta:80,novanta:90,cento:100},
    pt:{zero:0,um:1,uma:1,dois:2,duas:2,três:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10,onze:11,doze:12,treze:13,catorze:14,quinze:15,vinte:20,trinta:30,quarenta:40,cinquenta:50,sessenta:60,setenta:70,oitenta:80,noventa:90,cem:100},
    tr:{sıfır:0,bir:1,iki:2,üç:3,dört:4,beş:5,altı:6,yedi:7,sekiz:8,dokuz:9,on:10,yirmi:20,otuz:30,kırk:40,elli:50,altmış:60,yetmiş:70,seksen:80,doksan:90,yüz:100},
    bg:{нула:0,едно:1,един:1,две:2,два:2,три:3,четири:4,пет:5,шест:6,седем:7,осем:8,девет:9,десет:10,двадесет:20,тридесет:30,четиридесет:40,петдесет:50,шестдесет:60,седемдесет:70,осемдесет:80,деветдесет:90,сто:100},
    hu:{nulla:0,egy:1,kettő:2,két:2,három:3,négy:4,öt:5,hat:6,hét:7,nyolc:8,kilenc:9,tíz:10,tizenegy:11,tizenkettő:12,tizenhárom:13,tizennégy:14,tizenöt:15,tizenhat:16,tizenhét:17,tizennyolc:18,tizenkilenc:19,húsz:20,harminc:30,negyven:40,ötven:50,hatvan:60,hetven:70,nyolcvan:80,kilencven:90,száz:100,egyszáz:100},
    ar:{صفر:0,واحد:1,اثنان:2,اثنين:2,ثلاثة:3,أربعة:4,خمسة:5,ستة:6,سبعة:7,ثمانية:8,تسعة:9,عشرة:10,عشرون:20,ثلاثون:30,أربعون:40,خمسون:50,ستون:60,سبعون:70,ثمانون:80,تسعون:90,مائة:100}
  };
  const lang=()=>localStorage.getItem("pushup-language")||document.documentElement.lang?.slice(0,2)||"de";
  function parse(text,code){
    const digit=text.replace(/[.'’\s]/g,"").match(/[0-9٠-٩]+/);
    if(digit)return Number(digit[0].replace(/[٠-٩]/g,v=>String("٠١٢٣٤٥٦٧٨٩".indexOf(v))));
    const dictionary=words[code]||words.en;
    const normalized=text.toLocaleLowerCase(locales[code]||code).replace(/[,-]/g," ").replace(/\bund\b|\band\b|\bet\b|\by\b|\be\b|\bve\b|\bи\b|\bو\b/g," ");
    if(code==="de"){const joined=normalized.replace(/\s/g,"");for(const [word,value] of Object.entries(dictionary)){if(value>=20&&value<100&&joined.endsWith(word)){const prefix=joined.slice(0,-word.length).replace(/und$/,"");return value+(dictionary[prefix]||0)}}}
    if(code==="hu"){const joined=normalized.replace(/\s/g,"");if(Number.isFinite(dictionary[joined]))return dictionary[joined];const units={egy:1,kettő:2,két:2,három:3,négy:4,öt:5,hat:6,hét:7,nyolc:8,kilenc:9};const underHundred=value=>{if(Number.isFinite(dictionary[value]))return dictionary[value];for(const [stem,base] of [["tizen",10],["huszon",20],["harminc",30],["negyven",40],["ötven",50],["hatvan",60],["hetven",70],["nyolcvan",80],["kilencven",90]])if(value.startsWith(stem))return base+(units[value.slice(stem.length)]||0);return NaN};if(joined.startsWith("száz")){const rest=joined.slice(4),extra=rest?underHundred(rest):0;return Number.isFinite(extra)?100+extra:NaN}const parsed=underHundred(joined);if(Number.isFinite(parsed))return parsed}
    const values=normalized.split(/\s+/).map(word=>dictionary[word]).filter(Number.isFinite);
    return values.length?values.reduce((a,b)=>a+b,0):NaN;
  }
  function setValue(input,value){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set?.call(input,String(value));input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}));input.focus()}
  function attach(input){
    if(input.dataset.voiceReady||input.disabled)return;input.dataset.voiceReady="true";
    const parent=input.parentElement;if(!parent)return;
    const existing=parent.querySelector(":scope > .voice-number-button");
    const button=existing||document.createElement("button");button.type="button";button.className="voice-number-button";
    // On the React dashboard the button is rendered by React, so this script
    // only binds behavior and never inserts a child into React's input label.
    if(!existing){button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8"/></svg>';parent.append(button)}
    parent.classList.add("voice-number-host");
    let activeRecognition=null;
    let feedbackTimer=null;
    const feedback=(message,isError=false)=>{
      let notice=document.querySelector(".voice-number-feedback");
      if(!notice){notice=document.createElement("div");notice.className="voice-number-feedback";notice.setAttribute("role","status");notice.setAttribute("aria-live","polite");document.body.append(notice)}
      notice.textContent=message;notice.classList.toggle("is-error",isError);notice.hidden=false;
      clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>{notice.hidden=true},isError?6500:3000);
    };
    button.onclick=()=>{
      const code=lang();button.title=labels[code]||labels.en;button.setAttribute("aria-label",button.title);
      if(activeRecognition)return;
      if(!Recognition){feedback(code==="de"?"Spracherkennung ist hier nicht verfügbar. Bitte in Chrome öffnen.":"Voice recognition is unavailable here. Open in Chrome.",true);return}
      let recognized=false,failed=false;
      const recognition=new Recognition();activeRecognition=recognition;
      recognition.lang=locales[code]||locales.en;recognition.interimResults=false;recognition.maxAlternatives=3;
      button.disabled=true;button.classList.add("voice-pending");button.classList.remove("listening","voice-error");
      recognition.onstart=()=>{button.classList.remove("voice-pending");button.classList.add("listening");feedback(code==="de"?"Jetzt Zahl sprechen …":"Speak a number now …")};
      recognition.onresult=event=>{
        // SpeechRecognitionResult is array-like, not guaranteed iterable on Android Chrome.
        for(let i=0;i<event.results.length;i++){
          const result=event.results[i];
          for(let j=0;j<result.length;j++){
            const transcript=result[j]?.transcript||"";
            const value=parse(transcript,code);
            if(Number.isFinite(value)&&value>=1&&value<=121){
              recognized=true;setValue(input,Math.round(value));
              feedback(code==="de"?`Erkannt: ${Math.round(value)}. Zum Speichern drücken.`:`Recognized: ${Math.round(value)}. Tap Save.`);
              return;
            }
          }
        }
        failed=true;button.classList.add("voice-error");feedback(code==="de"?"Keine gültige Zahl zwischen 1 und 121 erkannt. Bitte erneut sprechen.":"No valid number from 1 to 121 recognized. Please try again.",true);
      };
      recognition.onerror=event=>{
        failed=true;button.classList.add("voice-error");
        const reason=event.error;
        const message=reason==="not-allowed"||reason==="service-not-allowed"?"Mikrofonzugriff nicht erlaubt. Bitte in Chrome freigeben.":reason==="network"?"Spracherkennung benötigt eine Verbindung. Bitte erneut versuchen.":reason==="no-speech"?"Keine Sprache erkannt. Bitte erneut sprechen.":"Spracherkennung fehlgeschlagen. Bitte erneut versuchen.";
        feedback(code==="de"?message:`Voice recognition failed (${reason||"unknown"}). Please try again.`,true);
      };
      recognition.onend=()=>{
        activeRecognition=null;button.disabled=false;button.classList.remove("listening","voice-pending");
        if(!recognized&&!failed)feedback(code==="de"?"Keine Zahl erkannt. Bitte erneut versuchen.":"No number recognized. Please try again.",true);
        setTimeout(()=>button.classList.remove("voice-error"),700);
      };
      try{
        window.speechSynthesis?.cancel();
        // Start directly inside the tap. A separate getUserMedia request consumed
        // the Android user gesture without starting speech recognition reliably.
        recognition.start();
      }catch(error){
        activeRecognition=null;button.disabled=false;button.classList.remove("voice-pending","listening");
        feedback(code==="de"?"Mikrofon konnte nicht gestartet werden. Browserberechtigung prüfen.":"Microphone could not start. Check browser permission.",true);
      }
    };
    button.title=labels[lang()]||labels.en;button.setAttribute("aria-label",button.title);
  }
  const scan=()=>document.querySelectorAll('input[inputmode="numeric"]:not([data-no-voice]),input[type="number"]:not([data-no-voice])').forEach(attach);
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",scan):scan();new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
})();
