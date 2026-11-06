const fs=require('fs'),vm=require('vm'),path=require('path');
const D=path.join(__dirname,'../src/app/');const c={};vm.createContext(c);
for(const f of ['q-hist-read.js','q-hist2.js','q-gen.js','q-gen2.js','bank.js'])vm.runInContext(fs.readFileSync(D+f,'utf8'),c,{filename:f});
const B=vm.runInContext('BANK',c);
const L=(x,i)=>Array.isArray(x)?x[i]:x;
const lang=+(process.argv[2]||0), from={l:+(process.argv[3]||0),m:+(process.argv[4]||0),p:+(process.argv[5]||0)};
const seen={};
for(const q of B.all){ if(!/^[lmp]/.test(q.id))continue; const g=q.id.split('-')[0]; if(seen[g])continue; seen[g]=1; if(+g.slice(1)<from[g[0]])continue;
 const right=Array.isArray(q.ans)?q.ans.map(i=>L(q.opts[i],lang)).join(' + '):L(q.opts[q.ans],lang);
 const wrong=q.opts.map((o,i)=>(Array.isArray(q.ans)?q.ans.includes(i):q.ans===i)?null:L(o,lang)).filter(Boolean).join(' / ');
 console.log(`${g}[${q.tp}${q.type[0]}] ${q.list?L(q.list,lang).replace(/\n/g,' ¦ ')+' >> ':''}${L(q.text,lang)} => ${right} || ${wrong} || ${L(q.why,lang)}`);
}
