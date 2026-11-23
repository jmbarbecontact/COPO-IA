/* Tests déterministes de l'orchestrateur COPO-IA 1.1 (simulation d'API COPO native).
 * Ne remplace PAS un essai navigateur / simulation réelle sur Mac.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.resolve(__dirname,'../copo-ia11.js'),'utf8');
let count=0;
function env(){
 const S={stock:{w:260,h:200,t:12,originZ:'top',rotary:{on:false}},shapes:[],tps:[],meta:{},dims:[],images:[],relief:{items:[]},
  sel:new Set(),layerActive:'layer1',tools:[{id:'t6',dia:6,type:'flat',feed:600,plunge:180,rpm:12000},{id:'t3',dia:3,type:'flat',feed:700,plunge:160,rpm:14000}]};
 const trace={commit:0,calculations:[]};
 function refresh(s){const ns=s.nodes||[];return {...s,pts:ns.map(n=>[n.x,n.y])}};
 function geometryNodes(g,stock){
  let coords=[];
  if(g.type==='rectangle'||g.type==='rounded_rectangle')coords=[[g.x,g.y],[g.x+g.width,g.y],[g.x+g.width,g.y+g.height],[g.x,g.y+g.height]];
  else if(g.type==='circle')coords=[[g.cx-g.diameter/2,g.cy],[g.cx,g.cy-g.diameter/2],[g.cx+g.diameter/2,g.cy],[g.cx,g.cy+g.diameter/2]];
  else if(g.type==='slot')coords=[[g.cx-g.length/2,g.cy-g.width/2],[g.cx+g.length/2,g.cy-g.width/2],[g.cx+g.length/2,g.cy+g.width/2],[g.cx-g.length/2,g.cy+g.width/2]];
  else if(g.type==='polygon')coords=g.points;
  else throw Error('geometry unsupported');
  for(const [x,y] of coords)if(x<0||y<0||x>stock.width||y>stock.height)throw Error('hors brut');
  return coords.map(([x,y])=>({x,y}));
 }
 let ids=0;
 function state(){return {items:(S.meta?.copoIAFeatures?.items||[]).map(x=>({id:x.id,name:x.name,role:x.role,geometry:x.geometry})),editable:!S.tps.length,reason:!S.meta.copoIAFeatures&&S.shapes.length?'métadonnées absentes':''}};
 function analyzeFeatures(p){
  const stock=p.stock||{width:S.stock.w,height:S.stock.h,thickness:S.stock.t};
  const items=structuredClone(S.meta.copoIAFeatures?.items||[]);
  for(const op of p.operations||[]){
   const ix=items.findIndex(x=>x.id===op.id);
   if(op.action==='remove'){assert(ix>=0);items.splice(ix,1);continue}
   if(op.action==='edit'){assert(ix>=0);items[ix]={...items[ix],geometry:op.geometry||items[ix].geometry,role:op.role||items[ix].role};}
   else if(op.action==='add'){assert(ix<0);items.push({id:op.id,name:op.name||op.id,role:op.role||'geometry',geometry:op.geometry,shapeId:null});}
   else throw Error('bad op');
  }
  items.forEach(i=>geometryNodes(i.geometry,stock));
  return {items,stock,summary:'stub features'};
 }
 const X={analyze:analyzeFeatures,state,geometryNodes};
 const M={analyze(p){
   assert(!p.replaceExisting);assert.equal(S.tps.length,0);
   assert(p.operations.length<=12);
   return {paths:p.operations.map(op=>{
     const it=S.meta.copoIAFeatures.items.find(i=>i.id===op.id),sh=S.shapes.find(s=>s.id===it?.shapeId);
     assert(sh,'missing shape');
     const tool=S.tools.find(t=>t.type==='flat'&&t.dia===op.toolDiameter);assert(tool,'missing tool');
     assert(op.through===false && op.depth>0 && op.depth<S.stock.t,'invalid depth');
     trace.calculations.push(op.id);
     return {id:'tp'+(++ids),name:`COPO-IA 1.0 · Simulation [${op.id}]`,shapeIds:[sh.id],type:op.strategy,toolId:tool.id,
        p:{depth:op.depth,pass:op.pass,side:op.side||'in'},moves:[{x:1,y:1,z:-op.depth,g:1}]};
   }),summary:'stub CAM'};
 }};
 let frozen=null;
 const context={window:{COPO_IA_FEATURES:X,COPO_IA_MULTI_CAM:M},S,refresh,snapState(){return JSON.stringify({stock:S.stock,shapes:S.shapes,meta:S.meta,tps:S.tps.map(x=>({id:x.id,name:x.name,p:x.p,toolId:x.toolId,shapeIds:x.shapeIds}))})},
  restore(data){const v=JSON.parse(data);S.stock=v.stock;S.shapes=v.shapes;S.meta=v.meta;S.tps=v.tps;},uid(){return 'shape'+(++ids)},
  bbox(){},computeTP(){},tpDef(){},commit(){trace.commit++},syncStock(){},renderTpList(){},setTab(){},fit(){},draw(){}};
 vm.runInNewContext(source,context,{filename:'copo-ia11.js'});
 return {api:context.window.COPO_IA_11,S,trace,snap:context.snapState,context};
}
function test(name,fn){try{fn();console.log('✓',name);count++}catch(e){console.error('✗',name,e);process.exitCode=1}}
const newPart=(id,x,y)=>({action:'add',id,name:id,role:'pocket',geometry:{type:'rectangle',x,y,width:40,height:30}});
const cam=(id,dia=6,depth=3)=>({id,strategy:'pocket',depth,pass:1,toolDiameter:dia,through:false});
test('Création géométrie + FAO en une transaction ; état inchangé avant confirmation',()=>{
 const {api,S,trace,snap}=env(),before=snap();const d=api.analyze({features:{operations:[newPart('p1',30,30),newPart('p2',120,40)]},cam:{operations:[cam('p1'),cam('p2')]}});
 assert.equal(snap(),before);assert.equal(d.generated,2);assert.equal(d.paths.length,2);assert.equal(d.preview.after.items.length,2);
 const r=api.apply(d);assert.equal(r.forms,2);assert.equal(r.paths,2);assert.equal(trace.commit,1);
});
test('Modification d’une seule forme : FAO correspondante recalculée, second parcours conservé',()=>{
 const {api,S,trace}=env();api.apply(api.analyze({features:{operations:[newPart('p1',30,30),newPart('p2',120,40)]},cam:{operations:[cam('p1'),cam('p2',3)]}}));
 const old2=S.tps.find(x=>x.name.includes('[p2]')),oldId=old2.id,oldMoves=JSON.stringify(old2.moves),was=trace.calculations.length;
 const d=api.analyze({features:{operations:[{action:'edit',id:'p1',geometry:{type:'rectangle',x:30,y:30,width:50,height:30}}]}});
 assert.equal(d.generated,1);assert.equal(d.preserved,1);assert.deepEqual(trace.calculations.slice(was),['p1']);
 api.apply(d);
 const now2=S.tps.find(x=>x.shapeIds[0]===old2.shapeIds[0]);assert.equal(now2.id,oldId);assert.equal(JSON.stringify(now2.moves),oldMoves);
});
test('Changement de profondeur d’un seul parcours : le second n’est pas recalculé',()=>{
 const {api,S}=env();api.apply(api.analyze({features:{operations:[newPart('p1',30,30),newPart('p2',120,40)]},cam:{operations:[cam('p1'),cam('p2')]}}));
 const d=api.analyze({cam:{operations:[cam('p2',3,5)]}});
 assert.equal(d.generated,1);assert.equal(d.preserved,1);api.apply(d);
 assert.equal(S.tps.find(t=>t.name.includes('p2')).p.depth,5);
});
test('La suppression d’une forme supprime seulement son parcours associé',()=>{
 const {api,S}=env();api.apply(api.analyze({features:{operations:[newPart('p1',30,30),newPart('p2',120,40)]},cam:{operations:[cam('p1'),cam('p2')]}}));
 const d=api.analyze({features:{operations:[{action:'remove',id:'p1'}]}});assert.equal(d.paths.length,1);assert.equal(d.preserved,1);api.apply(d);assert.equal(S.shapes.length,1);
});
test('L’ordre par outil regroupe la fraise Ø3 avant la fraise Ø6',()=>{
 const {api,S}=env();api.apply(api.analyze({features:{operations:[newPart('p1',30,30),newPart('p2',120,40)]},cam:{operations:[cam('p1',6),cam('p2',3)]}}));
 const d=api.analyze({order:'tool'});assert.equal(JSON.stringify(d.paths.map(t=>t.toolId)),JSON.stringify(['t3','t6']));api.apply(d);assert.equal(JSON.stringify(S.tps.map(t=>t.toolId)),JSON.stringify(['t3','t6']));
});
test('Une modification externe invalide la proposition vérifiée',()=>{
 const {api,S}=env();const d=api.analyze({features:{operations:[newPart('p1',30,30)]}});S.stock.w=261;
 assert.throws(()=>api.apply(d),/Projet modifié/);assert.equal(S.shapes.length,0);
});
test('Refus des parcours manuels / non gérés',()=>{
 const {api,S}=env();S.tps.push({id:'manual',type:'pocket',name:'Parcours manuel',shapeIds:['x'],p:{depth:2,pass:1}});
 assert.throws(()=>api.analyze({order:'tool'}),/parcours extérieurs/);
});
test('Refus d’une profondeur traversante : aucune modification persistante',()=>{
 const {api,S,snap}=env(),before=snap();assert.throws(()=>api.analyze({features:{operations:[newPart('p1',30,30)]},cam:{operations:[cam('p1',6,12)]}}),/invalid depth/);assert.equal(snap(),before);
});
test('Ordre explicite : exige tous les identifiants et refuse les oublis',()=>{
 const {api}=env();const d=api.analyze({features:{operations:[newPart('p1',30,30),newPart('p2',120,40)]},cam:{operations:[cam('p1'),cam('p2')]}});api.apply(d);
 assert.throws(()=>api.analyze({order:{mode:'explicit',ids:['p1']}}),/exactement un identifiant/);
});
test('Aperçu FAO : création, recalcul et parcours non modifiés identifiés',()=>{
 const {api}=env();const d=api.analyze({features:{operations:[newPart('p1',30,30),newPart('p2',120,40)]},cam:{operations:[cam('p1'),cam('p2')]}});
 assert.equal(d.preview.before.paths.length,0);assert.deepEqual(Array.from(d.preview.after.paths,p=>p.status),['créé','créé']);
 api.apply(d);
 const change=api.analyze({cam:{operations:[cam('p2',3,5)]}});
 assert.deepEqual(Array.from(change.preview.after.paths,p=>p.status),['conservé','recalculé']);
 assert.equal(change.preview.before.paths.length,2);
 assert.equal(change.preview.before.paths[1].depth,3);assert.equal(change.preview.after.paths[1].depth,5);
});
test('Prévisualisation FAO : trajectoires XY de coupe sans déplacements rapides',()=>{
 const {api}=env();const t={type:'pocket',toolId:'t6',p:{depth:2,pass:1},moves:[
  {g:0,x:0,y:0,z:5},{g:0,x:20,y:20,z:0},{g:1,x:20,y:20,z:-1},
  {g:1,x:30,y:20,z:-1},{g:0,x:30,y:20,z:5},{g:0,x:100,y:100,z:5},
  {g:1,x:100,y:100,z:-1},{g:1,x:110,y:100,z:-1}]};
 const v=api.pathPreview(t,'p1','créé');assert.equal(v.segments.length,2);
 assert.deepEqual(Array.from(v.segments[0]),[20,20,30,20]);assert.deepEqual(Array.from(v.segments[1]),[100,100,110,100]);
});
test('Prévisualisation DOM : les parcours sont lisibles en comparaison AVANT/APRÈS',()=>{
 const {api,context}=env();
 function el(tag){return {tag,children:[],attrs:{},textContent:'',className:'',appendChild(c){this.children.push(c);return c;},replaceChildren(){this.children=[];},setAttribute(k,v){this.attrs[k]=v;}}}
 context.document={createElement:el,createElementNS:(_ns,tag)=>el(tag)};
 const d=api.analyze({features:{operations:[newPart('p1',30,30)]},cam:{operations:[cam('p1')]}});
 const host=el('div');api.renderPreview(host,d.preview);
 const walk=x=>[x.textContent,...x.children.flatMap(walk)].join(' ');
 const txt=walk(host);
 assert.match(txt,/Comparaison des opérations FAO/);assert.match(txt,/AVANT/);assert.match(txt,/APRÈS/);
 assert.match(txt,/p1/);assert.match(txt,/Profondeur 3 mm/);assert.match(txt,/Ø6 mm/);
});
console.log(`${count} tests réussis${process.exitCode?' avec échec(s)':''}.`);
