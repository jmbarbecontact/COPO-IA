/* COPO-IA 1.0 BÊTA — Multi-FAO sur géométries libres identifiées.
 * GNU GPL-3.0-or-later — basé sur le logiciel COPO libre.
 * Simulation UNIQUEMENT ; aucune validation machine ni génération de G-code par l'extension.
 * Les profils extérieurs sont limités à des passes borgnes SANS découpe traversante.
 */
(()=>{
 'use strict';
 const X=window.COPO_IA_FEATURES;
 const fail=m=>{throw Error(m);};
 const finite=(n,label,lo,hi)=>{
  if(typeof n!=='number'||!Number.isFinite(n)||n<lo||n>hi)fail(`${label} : valeur numérique entre ${lo} et ${hi} requise.`);
  return n;
 };
 const allowedTypes=new Set(['rectangle','rounded_rectangle','slot','circle','polygon']);
 const bboxGeom=(g,sh)=>{
  const pts=sh.pts||[];
  if(!pts.length)fail('Géométrie sans contour calculable.');
  return {x0:Math.min(...pts.map(p=>p[0])),x1:Math.max(...pts.map(p=>p[0])),
          y0:Math.min(...pts.map(p=>p[1])),y1:Math.max(...pts.map(p=>p[1]))};
 };
 function current(){
  if(!X||typeof S==='undefined'||typeof computeTP!=='function'||typeof snapState!=='function')fail('Moteur COPO indisponible.');
  const fs=X.state(),meta=S.meta?.copoIAFeatures;
  if(fs.reason && !fs.items.length)fail('Métadonnées géométriques indisponibles : '+fs.reason);
  if(!meta||meta.version!==1||!Array.isArray(meta.items)||!fs.items.length||meta.items.length!==S.shapes.length)
   fail('Ce projet n’est pas une géométrie libre entièrement reconnue par COPO-IA.');
  if(S.dims.length||S.images.length||S.relief?.items?.length||S.stock.rotary?.on)fail('Reliefs, cotes, images et mode rotatif non pris en charge.');
  if(S.stock.originZ!=='top')fail('Zéro Z obligatoire sur le dessus du brut.');
  if(!(Number(S.machine.safeZ)>Number(S.machine.clearZ)&&Number(S.machine.clearZ)>0))fail('Dégagement Z invalide.');
  if(!(Number(S.stock.t)>.1))fail('Épaisseur de brut invalide.');
  return {items:fs.items,meta};
 }
 const owned=t=>{
  const name=t?.name||'';
  return (t?.type==='pocket'||t?.type==='profile')&&
   (/^COPO-IA 1\.0 ·/.test(name)||/^COPO-IA 0\.9 ·/.test(name))&&
   Array.isArray(t.shapeIds)&&t.shapeIds.length===1&&t.shapeIds[0];
 };
 function newTP(o,it,raw,tool){
  const profile=o.strategy==='profile';
  const p={...newForm(),type:profile?'profile':'pocket',depth:o.depth,pass:o.pass,toolId:tool.id,
    side:profile?'out':'in',tabs:false,allow:0,finish:'last',dir:'climb',entry:'rampzz',rampLen:20,
    strategy:'rings',rest:false,vstart:0,zrel:1,proj:false,npass:1};
  return {id:uid(),name:`COPO-IA 1.0 · ${profile?'Profil extérieur':'Poche'} · ${it.name} [${it.id}] · SIMULATION`,
    type:profile?'profile':'pocket',toolId:tool.id,shapeIds:[raw.shapeId],relIds:[],p,visible:true,face:1};
 }
 function analyze(plan){
  const s=current();
  if(!plan||typeof plan!=='object'||Array.isArray(plan))fail('Commande multi-FAO manquante.');
  if(!Array.isArray(plan.operations)||plan.operations.length<1||plan.operations.length>12)fail('Il faut entre 1 et 12 opérations d’usinage.');
  if(typeof plan.replaceExisting!=='boolean')fail('replaceExisting doit être explicitement true ou false.');
  const prior=S.tps;
  if(prior.length){
   if(!prior.every(owned))fail('Le projet possède des parcours non gérés par COPO-IA : remplacement interdit.');
   if(!plan.replaceExisting)fail('Des parcours existent : utilise replaceExisting:true et réinclus toutes les opérations à conserver.');
  } else if(plan.replaceExisting)fail('Aucun parcours à remplacer : utilise replaceExisting:false.');
  const seen=new Set(),paths=[],messages=[];
  for(const o of plan.operations){
   if(!o||typeof o!=='object'||Array.isArray(o)||!['pocket','profile'].includes(o.strategy))fail('Stratégie permise : pocket ou profile.');
   if(typeof o.id!=='string'||!/^[A-Za-z][\w-]{0,39}$/.test(o.id)||seen.has(o.id))fail('Identifiant absent, invalide ou répété.');
   seen.add(o.id);
   const item=s.items.find(x=>x.id===o.id),raw=s.meta.items.find(x=>x.id===o.id);
   if(!item||!raw?.shapeId)fail(`Forme ${o.id} introuvable.`);
   const shape=S.shapes.find(x=>x.id===raw.shapeId);
   if(!shape||!shape.closed||!allowedTypes.has(item.geometry?.type))fail(`Contour fermé inconnu pour ${o.id}.`);
   const g=item.geometry,kind=g.type,profile=o.strategy==='profile';
   if(profile){
    if(item.role!=='contour'||!['rectangle','rounded_rectangle','polygon'].includes(kind))
     fail(`${o.id} : profil extérieur autorisé uniquement sur contour rectangle, rectangle arrondi ou polygone.`);
    if(o.side!=='out')fail(`${o.id} : le profil extérieur exige side:"out".`);
   } else {
    if(!['hole','pocket'].includes(item.role)||!['circle','rectangle','rounded_rectangle','slot'].includes(kind))
     fail(`${o.id} : poche autorisée sur cercle, rectangle, rectangle arrondi ou oblong de rôle hole/pocket.`);
    if(o.side!==undefined)fail(`${o.id} : « side » réservé aux profils.`);
   }
   if(o.through!==false)fail(`${o.id} : through:false obligatoire ; aucun usinage traversant automatique.`);
   const depth=finite(o.depth,`Profondeur ${o.id}`,.01,Number(S.stock.t)-.01);
   const pass=finite(o.pass,`Passe ${o.id}`,.1,5);
   if(pass>depth)fail(`${o.id} : passe plus profonde que l’usinage.`);
   const toolDia=finite(o.toolDiameter,`Diamètre de fraise ${o.id}`,.1,50);
   const tools=S.tools.filter(t=>t.type==='flat'&&Math.abs(Number(t.dia)-toolDia)<1e-4);
   if(tools.length!==1)fail(`${o.id} : fraise droite Ø${toolDia} absente ou ambiguë dans la bibliothèque.`);
   const tool=tools[0];
   if(![tool.feed,tool.plunge,tool.rpm].every(n=>Number.isFinite(+n)&&+n>0))fail(`${o.id} : conditions de coupe de la bibliothèque incomplètes.`);
   const bb=bboxGeom(g,shape),r=toolDia/2;
   if(profile){
    if(bb.x0<r+.5||bb.y0<r+.5||bb.x1>S.stock.w-r-.5||bb.y1>S.stock.h-r-.5)
     fail(`${o.id} : espace insuffisant entre contour et limites du brut pour le rayon de la fraise.`);
   }else{
    const narrow=kind==='circle'?Number(g.diameter):kind==='slot'?Number(g.width):Math.min(bb.x1-bb.x0,bb.y1-bb.y0);
    if(!Number.isFinite(narrow)||toolDia>=narrow-.05)fail(`${o.id} : fraise Ø${toolDia} trop grande pour la largeur minimale ${narrow} mm.`);
    if(bb.x0<-.01||bb.y0<-.01||bb.x1>S.stock.w+.01||bb.y1>S.stock.h+.01)fail(`${o.id} : forme hors brut.`);
   }
   const tp=newTP(o,item,raw,tool);
   computeTP(tp);
   if(tp.err)fail(`${o.id} : erreur native COPO : ${tp.err}`);
   if(tp.warns?.length)fail(`${o.id} : avertissement natif : ${tp.warns.join(' ; ')}`);
   if(!Array.isArray(tp.moves)||tp.moves.length<3||tp.moves.length>50000)fail(`${o.id} : trajectoire absente ou trop complexe.`);
   let bottom=0, cuts=0;
   for(const m of tp.moves){
    if(!Number.isFinite(m.x)||!Number.isFinite(m.y)||!Number.isFinite(m.z))fail(`${o.id} : mouvement avec coordonnées non finies.`);
    bottom=Math.min(bottom,m.z);
    if(m.z<-.015){
     if(m.z<-depth-.02)fail(`${o.id} : trajectoire sous la profondeur demandée.`);
     if(m.g===1){
      cuts++;
      if(m.x-r<-.20||m.y-r<-.20||m.x+r>S.stock.w+.20||m.y+r>S.stock.h+.20)
       fail(`${o.id} : la fraise sortirait du brut ; parcours refusé.`);
     }
    }
   }
   if(!cuts||Math.abs(bottom+depth)>.02)fail(`${o.id} : profondeur finale ou coupe non conforme (${bottom}).`);
   paths.push(tp);
   messages.push(`${item.name} [${o.id}] · ${profile?'Profil extérieur':'Poche'} ${kind} · profondeur ${depth} mm · fraise Ø${toolDia} mm · passe ${pass} mm · ${tp.moves.length} mouvements.`);
  }
  if(prior.length){
   const old=new Set(prior.map(t=>t.shapeIds[0])),next=new Set(paths.map(t=>t.shapeIds[0]));
   if(old.size!==next.size||[...old].some(x=>!next.has(x)))fail('Le remplacement supprimerait un parcours existant. Réinclus toutes les formes déjà usinées.');
  }
  return {snapshot:snapState(),paths,replaceExisting:plan.replaceExisting,
   summary:`${paths.length} parcours natif(s) préparé(s) :\n${messages.join('\n')}\n${prior.length?'Tous les parcours existants seront remplacés après confirmation.\n':''}Aucune trajectoire appliquée avant confirmation. Simulation uniquement. Aucun usinage traversant ni G-code machine validé.`};
 }
 function apply(draft){
  if(!draft||draft.snapshot!==snapState())fail('Le projet a changé depuis la vérification : recommence l’export.');
  const before=snapState();
  try{
   current();
   if(S.tps.length&&(!draft.replaceExisting||!S.tps.every(owned)))fail('Parcours existants incompatibles.');
   if(draft.replaceExisting){S.tps=[];S.activeTp=null;S.editTp=null;}
   else if(S.tps.length)fail('Des parcours ont été ajoutés : recommence la vérification.');
   S.tps.push(...draft.paths);
   S.activeTp=draft.paths[0].id;S.editTp=null;S.sel.clear();
   commit(false);gcDirty=true;renderTpList();setTab('parcours');draw();
   return {count:draft.paths.length,moves:draft.paths.map(t=>t.moves.length)};
  }catch(e){restore(before);throw e;}
 }
 window.COPO_IA_MULTI_CAM={version:'1.0 BÊTA',analyze,apply};
})();
