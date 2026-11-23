/* Test unitaire du sélecteur natif .copo et des erreurs de sauvegarde.
 * API de navigateur simulée, aucun accès disque réel ni boîte de dialogue Mac.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
const section=html.slice(html.indexOf('async function projSave(as) {'),html.indexOf('async function projOpen() {'));
assert(section.includes('const w=await h.createWritable()'),'fonction source introuvable');
async function runCase(name,fn){try{await fn();console.log('✓',name);return true}catch(e){console.error('✗',name,e);process.exitCode=1;return false}}
function fixture(){
 let files={},notices=[],pickerCalls=[],writes=[],linked=null,dirty=false,downloaded=[];
 function handle(name){return{name,async createWritable(){return{async write(data){writes.push({name,data});files[name]=data;},async close(){}}},async queryPermission(){return 'granted'}}}
 const ctx={window:{showSaveFilePicker:async props=>{pickerCalls.push(props);return handle('copie-test.copo')}},projHandle:null,
   projJSON:()=>'{"copo":1}',projFileName:()=> 'projet-copo.copo',COPO_TYPES:[{description:'COPO',accept:{'application/x-copo':['.copo']}}],
   projKeep:h=>{linked=h;ctx.projHandle=h},projDirty:x=>{dirty=!x},toast:x=>notices.push(x),
   trf:(_s,args)=>'Enregistré '+args.f,saveFile:async(name,data)=>{downloaded.push({name,data})}};
 vm.runInNewContext(section+'\nthis.run=projSave;',ctx,{filename:'index.html/projSave'});
 return {ctx,handle,files,notices,pickerCalls,writes,get linked(){return linked},get dirty(){return dirty},downloaded};
}
(async()=>{
 const checks=[];
 checks.push(await runCase('Enregistrer une copie : nouveau fichier sans écraser le fichier courant',async()=>{
   const f=fixture(),original=f.handle('projet-original.copo');f.ctx.projHandle=original;f.ctx.window.showSaveFilePicker=async props=>{f.pickerCalls.push(props);return f.handle('copie-test.copo')};
   const r=await f.ctx.run(true);assert(r.saved&&r.copy);assert.equal(r.name,'copie-test.copo');assert.equal(f.linked.name,'copie-test.copo');
   assert.equal(f.writes.length,1);assert.equal(f.writes[0].name,'copie-test.copo');assert.match(f.pickerCalls[0].suggestedName,/original-copie\.copo$/);assert.equal(f.pickerCalls[0].excludeAcceptAllOption,true);
 }));
 checks.push(await runCase('Enregistrer : même fichier si autorisé, sans nouveau sélecteur',async()=>{
   const f=fixture();f.ctx.projHandle=f.handle('projet-original.copo');const r=await f.ctx.run(false);
   assert(r.saved&&!r.copy);assert.equal(f.pickerCalls.length,0);assert.equal(f.writes[0].name,'projet-original.copo');
 }));
 checks.push(await runCase('Extension manquante : aucune écriture et aucun changement de fichier actif',async()=>{
   const f=fixture(),original=f.handle('base.copo');f.ctx.projHandle=original;f.ctx.window.showSaveFilePicker=async()=>f.handle('sans-extension');
   const r=await f.ctx.run(true);assert.equal(r.saved,false);assert.equal(r.reason,'extension');assert.equal(f.writes.length,0);assert.equal(f.ctx.projHandle,original);
 }));
 checks.push(await runCase('Annulation du sélecteur : fichier d’origine non modifié',async()=>{
   const f=fixture(),original=f.handle('base.copo');f.ctx.projHandle=original;f.ctx.window.showSaveFilePicker=async()=>{const e=new Error('annulé');e.name='AbortError';throw e};
   const r=await f.ctx.run(true);assert.equal(r.saved,false);assert.equal(r.reason,'cancel');assert.equal(f.writes.length,0);assert.equal(f.ctx.projHandle,original);
 }));
 checks.push(await runCase('Erreur d’écriture : aucune fausse confirmation et ancien handle conservé',async()=>{
   const f=fixture(),old=f.handle('base.copo');f.ctx.projHandle=old;f.ctx.window.showSaveFilePicker=async()=>({name:'copie.copo',async createWritable(){throw Error('disque plein')}});
   const r=await f.ctx.run(true);assert.equal(r.saved,false);assert.equal(r.reason,'error');assert.equal(f.ctx.projHandle,old);assert.equal(f.writes.length,0);
 }));
 checks.push(await runCase('Navigateur sans accès direct : téléchargement nommé .copo',async()=>{
   const f=fixture();delete f.ctx.window.showSaveFilePicker;const r=await f.ctx.run(true);
   assert(r.saved&&r.method==='download');assert.equal(f.downloaded[0].name,'projet-copo-copie.copo');
 }));
 console.log(`${checks.filter(Boolean).length}/${checks.length} tests de sauvegarde réussis.`);
})().catch(e=>{console.error(e);process.exitCode=1});
