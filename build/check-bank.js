// Checks every task: options distinct, right answer among them, text in both languages.
const fs=require('fs'),vm=require('vm'),path=require('path');
const D=path.join(__dirname,'../src/app/');const c={};vm.createContext(c);
for(const f of ['q-hist-read.js','q-hist2.js','q-gen.js','q-gen2.js','bank.js'])vm.runInContext(fs.readFileSync(D+f,'utf8'),c,{filename:f});
const B=vm.runInContext('BANK',c);
let bad=0;const L=(x,i)=>Array.isArray(x)?x[i]:x;const by={},types={};
for(const q of B.all){
 const key=q.s;by[key]=by[key]||{};by[key][q.tp]=(by[key][q.tp]||0)+1;types[q.s+':'+q.type]=(types[q.s+':'+q.type]||0)+1;
 for(const i of [0,1]){
  const texts=q.opts.map(o=>L(o,i));
  const problems=[];
  if(!L(q.text,i))problems.push('no text');
  if(!L(q.why,i))problems.push('no why');
  if(new Set(texts).size!==texts.length)problems.push('duplicate options '+JSON.stringify(texts));
  if(texts.some(t=>t===undefined||t===''||/NaN|undefined|Infinity/.test(String(t))))problems.push('bad option '+JSON.stringify(texts));
  if(/NaN|undefined|Infinity/.test(L(q.text,i)+' '+L(q.why,i)+(q.list?L(q.list,i):'')))problems.push('bad number in text');
  const ans=Array.isArray(q.ans)?q.ans:[q.ans];
  if(!ans.length||ans.some(a=>a<0||a>=q.opts.length||a===undefined))problems.push('bad ans '+JSON.stringify(q.ans));
  if(q.type==='multi'&&ans.length===q.opts.length)problems.push('all options right');
  if(q.opts.length<(q.type==='multi'?3:4))problems.push('too few options '+q.opts.length);
  const pts=/\d/.test(L(q.why,i));
  if(problems.length){bad++;console.log(q.id,i,problems.join('; '),'|',L(q.text,i).slice(0,70));}
 }
}
console.log('tasks',B.all.length,'problems',bad);console.log(JSON.stringify(by));console.log(JSON.stringify(types));
// sample for reading
for(const id of ['m0-1','m7-1','m22-1','m24-1','p21-1','p23-1','l4-1']){const q=B.byId[id];if(q)console.log(id,L(q.text,0),'|',q.opts.map(o=>L(o,0)).join(' / '),'| ans',q.ans,'|',L(q.why,0));}
