/* COPO-IA 1.1 BÊTA — édition transactionnelle, CAO+FAO, aperçu, ordre des parcours.
 * GNU GPL-3.0-or-later. Simulation uniquement. Aucune connexion ni instruction machine.
 * Les six axes de développement sont accessibles via l'action project_11.
 */
(()=>{
 'use strict';
 const X=window.COPO_IA_FEATURES, M=window.COPO_IA_MULTI_CAM;
 const fail=s=>{throw Error(s);}, copy=x=>JSON.parse(JSON.stringify(x)), obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
 const validId=id=>typeof id==='string'&&/^[A-Za-z][\w-]{0,39}$/.test(id);
 const compatiblePath=t=>t&&['pocket','profile'].includes(t.type)&&/^COPO-IA (?:0\.9|1\.0|1\.1) · /.test(t.name||'')&&Array.isArray(t.shapeIds)&&t.shapeIds.length>=1;
 const toolDia=t=>Number(S.tools.find(x=>x.id===t.toolId)?.dia);
 const canon=o=>JSON.stringify(o);
 const stockNow=()=>({width:Number(S.stock.w),height:Number(S.stock.h),thickness:Number(S.stock.t)});
 const featureState=()=>{
   const fs=X.state(),mt=S.meta?.copoIAFeatures;
   if(fs.reason&&!fs.items.length&&S.shapes.length)fail(fs.reason);
   if(S.shapes.length&&(!mt||mt.version!==1||mt.items.length!==S.shapes.length))fail('Projet non intégralement reconnu par la géométrie libre COPO-IA.');
   if(S.dims.length||S.images.length||S.relief?.items?.length||S.stock.rotary?.on)fail('Édition automatique limitée aux projets sans cote, image, relief ni mode rotatif.');
   if(S.stock.originZ!=='top')fail('Le zéro Z doit être sur le dessus du brut.');
   return mt?.items?copy(mt.items):[];
 };
 function nativeCheck(){
   return {features:!!X?.analyze&&!!X?.geometryNodes,multiCAM:!!M?.analyze,
     snapshots:typeof snapState==='function'&&typeof restore==='function',
     nativeGeometry:typeof refresh==='function'&&typeof bbox==='function',
     nativeCAM:typeof computeTP==='function',
     persistence:typeof commit==='function'&&typeof tpDef==='function',
     host:'COPO intégré — APIs vérifiées au chargement ; la numérotation du COPO amont n’est pas une garantie de compatibilité.'};
 }
 const requireNative=()=>{const c=nativeCheck();if(Object.values(c).some(x=>x===false))fail('API native COPO manquante : '+Object.keys(c).filter(k=>c[k]===false).join(', '));};
 function fromPath(t,features){
   if(!compatiblePath(t))fail('Parcours non géré par COPO-IA ; toute modification automatique est refusée.');
   if(t.shapeIds.length!==1)fail('Parcours multi-formes sans métadonnées : modification automatique refusée.');
   const it=features.find(x=>x.shapeId===t.shapeIds[0]);
   if(!it)fail('Un parcours référence une forme sans identifiant COPO-IA.');
   const op={id:it.id,strategy:t.type==='profile'?'profile':'pocket',depth:Number(t.p?.depth),pass:Number(t.p?.pass),toolDiameter:toolDia(t),through:false};
   if(op.strategy==='profile')op.side=t.p?.side||'out';
   if(!Number.isFinite(op.depth)||!Number.isFinite(op.pass)||!Number.isFinite(op.toolDiameter))fail('Paramètres FAO existants incomplets.');
   return op;
 }
 function normalizeOrder(paths,rule){
   if(rule===undefined||rule===null||rule==='preserve')return paths;
   if(rule==='tool')return paths.map((p,i)=>({p,i})).sort((a,b)=>toolDia(a.p)-toolDia(b.p)||a.i-b.i).map(x=>x.p);
   if(rule==='depth')return paths.map((p,i)=>({p,i})).sort((a,b)=>Number(a.p.p.depth)-Number(b.p.p.depth)||a.i-b.i).map(x=>x.p);
   if(obj(rule)&&rule.mode==='explicit'){
     if(!Array.isArray(rule.ids)||rule.ids.length!==paths.length||new Set(rule.ids).size!==paths.length)fail('Ordre explicite : exactement un identifiant pour chaque parcours.');
     const byShape=new Map(paths.map(t=>[t.copoIAId,t]));
     if(rule.ids.some(id=>!byShape.has(id)))fail('Ordre explicite : identifiant de parcours inconnu.');
     return rule.ids.map(id=>byShape.get(id));
   }
   fail('Ordre des parcours inconnu : preserve, tool, depth ou {mode:"explicit",ids:[...]}.');
 }
 // Informations de prévisualisation indépendantes : aucune mutation d'un parcours en place.
 function pathPreview(t,id,status){
   const moves=Array.isArray(t.moves)?t.moves:[],segments=[];
   let previous=null,eligible=0;
   for(const m of moves){
     if(m&&Number.isFinite(m.x)&&Number.isFinite(m.y)&&Number.isFinite(m.z)){
       if(m.g===1&&m.z<-.01&&previous&&previous.z<-.01&&
          (Math.abs(previous.x-m.x)>1e-6||Math.abs(previous.y-m.y)>1e-6)){
         eligible++;
         // Prélèvement plafonné pour ne pas bloquer une fenêtre sur les grosses FAO.
         if(segments.length<900)segments.push([previous.x,previous.y,m.x,m.y]);
       }
       previous=m;
     }else previous=null;
   }
   return {id,status,type:t.type||'?',side:t.p?.side||'',depth:Number(t.p?.depth),
     pass:Number(t.p?.pass),diameter:toolDia(t),moveCount:moves.length,
     segments,displayLimited:eligible>segments.length};
 }
 function analyze(plan){
   requireNative();
   if(!obj(plan))fail('project_11 doit être un objet.');
   if(!plan.features&&!plan.cam&&!plan.order)fail('Commande 1.1 sans géométrie, FAO ni réorganisation.');
   const snapshot=snapState(),oldItems=featureState(),oldStock=stockNow();
   if(!S.tps.every(compatiblePath))fail('Le projet contient des parcours extérieurs à COPO-IA : opération refusée.');
   if(S.tps.length>30)fail('Limite de 30 parcours identifiés pour cette commande.');
   const oldTps=S.tps.slice(), oldStockRef=S.stock, oldShapes=S.shapes, oldMeta=S.meta;
   const oldById=new Map(),oldToolpaths=new Map();
   for(const p of oldTps){
     const op=fromPath(p,oldItems);
     if(oldById.has(op.id))fail('Plusieurs parcours sur une même forme : gestion sélective non disponible.');
     oldById.set(op.id,op);oldToolpaths.set(op.id,p);
   }
   let checked=null,items,stock,generated=[],paths,summary=[],preview;
   // Première validation sans aucun changement persistant : le module 0.8 est utilisé tel quel.
   try{
     S.tps=[];
     checked=plan.features?X.analyze(plan.features):null;
   }finally{S.tps=oldTps;}
   items=checked?copy(checked.items):copy(oldItems);
   stock=checked?copy(checked.stock):oldStock;
   const newIDs=new Set(items.map(x=>x.id));
   const oldMap=new Map(oldItems.map(x=>[x.id,x]));
   const changed=new Set(items.filter(x=>!oldMap.has(x.id)||canon({name:x.name,role:x.role,depth:x.depth,geometry:x.geometry})!==canon({name:oldMap.get(x.id).name,role:oldMap.get(x.id).role,depth:oldMap.get(x.id).depth,geometry:oldMap.get(x.id).geometry})).map(x=>x.id));
   const deleted=oldItems.filter(x=>!newIDs.has(x.id)).map(x=>x.id);
   const stockChanged=canon(stock)!==canon(oldStock);
   const targets=new Map(oldById);
   for(const id of deleted)targets.delete(id);
   const cam=plan.cam||{},changedCAM=new Set();
   if(!obj(cam))fail('Champ cam invalide.');
   if(cam.removeIds!==undefined){
     if(!Array.isArray(cam.removeIds)||new Set(cam.removeIds).size!==cam.removeIds.length)fail('removeIds doit être une liste sans doublons.');
     for(const id of cam.removeIds){if(!validId(id)||!targets.has(id))fail('Parcours à supprimer inconnu : '+id);targets.delete(id);}
   }
   if(cam.operations!==undefined){
     if(!Array.isArray(cam.operations)||cam.operations.length>30)fail('cam.operations : liste de 0 à 30 opérations.');
     const seen=new Set();
     for(const op of cam.operations){
       if(!obj(op)||!validId(op.id)||!newIDs.has(op.id)||seen.has(op.id))fail('Opération FAO invalide, dupliquée ou forme inexistante.');
       if(cam.removeIds?.includes(op.id))fail('Une opération ne peut pas être modifiée et supprimée simultanément.');
       seen.add(op.id);changedCAM.add(op.id);targets.set(op.id,copy(op));
     }
   }
   if(targets.size>30)fail('Maximum de 30 parcours.');
   if(stockChanged)for(const id of targets.keys())changed.add(id);
   for(const id of deleted)summary.push('Supprimer forme et parcours associé : '+id);
   for(const id of changed)summary.push((oldMap.has(id)?'Modifier forme : ':'Créer forme : ')+id);
   for(const id of changedCAM)summary.push((oldById.has(id)?'Actualiser FAO : ':'Créer FAO : ')+id);
   for(const id of cam.removeIds||[])summary.push('Supprimer parcours FAO : '+id);
   if(stockChanged)summary.push(`Changer brut : ${oldStock.width}×${oldStock.height}×${oldStock.thickness} → ${stock.width}×${stock.height}×${stock.thickness} mm (tous les parcours recalculés)`);
   const needBuild=[...targets.values()].filter(op=>changed.has(op.id)||changedCAM.has(op.id)||!oldToolpaths.has(op.id));
   // Mise en scène temporaire et calcul NATIF des trajets ; restauration des références dans finally.
   try{
     S.stock={...oldStockRef,w:stock.width,h:stock.height,t:stock.thickness};
     S.shapes=[];
     for(const it of items){
       const original=oldShapes.find(s=>s.id===it.shapeId);
       const nodes=X.geometryNodes(it.geometry,stock);
       const sh=refresh({...original,id:original?.id||uid(),layer:original?.layer||S.layerActive,
         nodes,closed:true,g:original?.g||null});
       it.shapeId=sh.id;S.shapes.push(sh);
     }
     S.meta={...oldMeta,copoIAFeatures:{version:1,items:copy(items)}};
     S.tps=[];
     // Le calcul multi-FAO historique limite chaque demande à 12 opérations : lots indépendants.
     for(let i=0;i<needBuild.length;i+=12){
       const chunk=needBuild.slice(i,i+12);
       const d=M.analyze({replaceExisting:false,operations:chunk});
       for(let j=0;j<chunk.length;j++){const tp=d.paths[j];tp.name=tp.name.replace('COPO-IA 1.0 ·','COPO-IA 1.1 ·');
         // Le champ n'est PAS persistant dans COPO ; le lien fiable est shapeIds[0].
         tp.copoIAId=chunk[j].id;generated.push(tp);
       }
     }
     // Préserver STRICTEMENT les parcours non concernés (mêmes objets, ID, outil, params et mouvements).
     const genById=new Map(generated.map(t=>[t.copoIAId,t]));
     paths=[...targets.keys()].map(id=>{
       const t=genById.get(id)||{...oldToolpaths.get(id)};
       if(!t)fail('Parcours manquant après calcul : '+id);
       if(!t.copoIAId)t.copoIAId=id;
       return t;
     });
     paths=normalizeOrder(paths,plan.order);
     const oldOrder=new Map(oldTps.map((t,i)=>[fromPath(t,oldItems).id,i]));
     preview={
       before:{stock:oldStock,items:oldItems,paths:oldTps.map(t=>{
         const id=fromPath(t,oldItems).id;
         return pathPreview(t,id,targets.has(id)?'existant':'supprimé');
       })},
       after:{stock,items,paths:paths.map((t,i)=>{
         const id=t.copoIAId;
         return pathPreview(t,id,!oldToolpaths.has(id)?'créé':genById.has(id)?'recalculé':oldOrder.get(id)!==i?'réordonné':'conservé');
       })}
     };
   }finally{
     S.stock=oldStockRef;S.shapes=oldShapes;S.meta=oldMeta;S.tps=oldTps;
   }
   const keeps=[...targets.keys()].filter(id=>!changed.has(id)&&!changedCAM.has(id)&&oldToolpaths.has(id));
   summary.push(`${generated.length} parcours recalculé(s) par COPO ; ${keeps.length} parcours conservé(s) sans recalcul.`);
   if(plan.order&&plan.order!=='preserve')summary.push('Ordre des parcours modifié selon : '+(typeof plan.order==='string'?plan.order:'séquence explicite'));
   if(!summary.length)fail('Aucune modification à appliquer.');
   return {snapshot,items:copy(items),stock,paths,preview,generated:generated.length,
     preserved:keeps.length,summary:summary.join('\n')+'\nSimulation exclusivement. Vérifie le dessin comparatif et confirme avant toute modification.'};
 }
 function apply(d){
   if(!d||d.snapshot!==snapState())fail('Projet modifié depuis le contrôle : commande annulée.');
   const before=snapState();
   try{
     requireNative();featureState();
     S.stock.w=d.stock.width;S.stock.h=d.stock.height;S.stock.t=d.stock.thickness;
     const oldMap=new Map(S.shapes.map(s=>[s.id,s]));
     S.shapes=d.items.map(it=>refresh({...oldMap.get(it.shapeId),id:it.shapeId,
       layer:oldMap.get(it.shapeId)?.layer||S.layerActive,nodes:X.geometryNodes(it.geometry,d.stock),closed:true}));
     S.meta={...S.meta,copoIAFeatures:{version:1,items:copy(d.items)},copoIAWork11:{version:1,
       operations:d.paths.map(t=>({id:t.copoIAId,type:t.type,shapeIds:t.shapeIds.slice(),depth:Number(t.p.depth),toolId:t.toolId}))}};
     S.tps=d.paths;
     S.activeTp=d.paths[0]?.id||null;S.editTp=null;S.sel.clear();
     if(typeof syncStock==='function')syncStock();
     commit(false);
     if(typeof gcDirty!=='undefined')gcDirty=true;
     if(typeof renderTpList==='function')renderTpList();
     if(typeof setTab==='function'&&S.tps.length)setTab('parcours');
     if(typeof fit==='function')fit();
     if(typeof draw==='function')draw();
     return {forms:d.items.length,paths:d.paths.length,recalculated:d.generated,preserved:d.preserved};
   }catch(e){restore(before);throw e;}
 }
 // Aperçu géométrique SVG local : DOM et primitives numériques, aucun HTML issu du plan.
 const SVG='http://www.w3.org/2000/svg';
 function renderPreview(host,p){
   if(!host||!p)return;
   host.replaceChildren();host.className='cia11-preview';
   const previous=new Map(p.before.items.map(it=>[it.id,it]));
   const next=new Map(p.after.items.map(it=>[it.id,it]));
   const changed=new Set();
   for(const id of new Set([...previous.keys(),...next.keys()])){
     if(canon(previous.get(id)?.geometry)!==canon(next.get(id)?.geometry))changed.add(id);
   }
   const header=document.createElement('div');header.className='cia11-title';
   header.textContent='État actuel à gauche · proposition à droite (aucune modification encore appliquée)';host.appendChild(header);
   const fmt=n=>Number(n).toLocaleString('fr-FR',{maximumFractionDigits:3});
   const summaries=[];
   for(const id of changed){
     const before=previous.get(id)?.geometry,after=next.get(id)?.geometry;
     if(!before){summaries.push(id+' : nouvelle forme');continue;}
     if(!after){summaries.push(id+' : forme supprimée');continue;}
     if(before.type==='slot'&&after.type==='slot'){
       summaries.push(`${id} : centre X ${fmt(before.cx)} → ${fmt(after.cx)} mm (${fmt(after.cx-before.cx)} mm) ; centre Y ${fmt(before.cy)} → ${fmt(after.cy)} mm`);
     }else if(['rectangle','rounded_rectangle'].includes(before.type)&&before.type===after.type){
       summaries.push(`${id} : X ${fmt(before.x)} → ${fmt(after.x)} mm ; Y ${fmt(before.y)} → ${fmt(after.y)} mm ; dimensions ${fmt(before.width)}×${fmt(before.height)} → ${fmt(after.width)}×${fmt(after.height)} mm`);
     }else{summaries.push(id+' : géométrie modifiée');}
   }
   const draw=(g,geo,style)=>{
     const put=(tag,attrs)=>{const el=document.createElementNS(SVG,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));g.appendChild(el);};
     if(['rectangle','rounded_rectangle'].includes(geo.type))put('rect',{x:geo.x,y:geo.y,width:geo.width,height:geo.height,rx:geo.radius||0,...style});
     else if(geo.type==='circle')put('circle',{cx:geo.cx,cy:geo.cy,r:geo.diameter/2,...style});
     else if(geo.type==='polygon')put('polygon',{points:geo.points.map(q=>q.join(',')).join(' '),...style});
     else if(geo.type==='slot')put('rect',{x:geo.cx-geo.length/2,y:geo.cy-geo.width/2,width:geo.length,height:geo.width,rx:geo.width/2,
       transform:`rotate(${geo.angle_deg||0} ${geo.cx} ${geo.cy})`,...style});
   };
   for(const [label,state] of [['AVANT',p.before],['APRÈS',p.after]]){
     const section=document.createElement('div');section.className='cia11-panel';
     const cap=document.createElement('div');cap.textContent=`${label} · Brut ${state.stock.width} × ${state.stock.height} × ${state.stock.thickness} mm`;section.appendChild(cap);
     const svg=document.createElementNS(SVG,'svg'),w=state.stock.width,h=state.stock.height;
     svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.setAttribute('role','img');svg.setAttribute('aria-label',`Géométrie ${label}`);
     const bg=document.createElementNS(SVG,'rect');Object.entries({x:0,y:0,width:w,height:h,fill:'#172a38',stroke:'#b6c3d0','stroke-width':Math.max(w,h)/250}).forEach(([k,v])=>bg.setAttribute(k,v));svg.appendChild(bg);
     const g=document.createElementNS(SVG,'g');g.setAttribute('transform',`translate(0 ${h}) scale(1 -1)`);svg.appendChild(g);
     if(label==='APRÈS')for(const id of changed){const it=previous.get(id);if(it){
       draw(g,it.geometry,{fill:'none',stroke:'#ff9e72','stroke-width':2.2,'stroke-dasharray':'3 2','vector-effect':'non-scaling-stroke',opacity:'.83'});
     }}
     for(const it of state.items){
       const selected=changed.has(it.id),normal=it.role==='contour'?'#76d0d4':it.role==='pocket'?'#f5c06a':'#a4bdf9';
       draw(g,it.geometry,{fill:'none',stroke:selected?(label==='APRÈS'?'#71f0a5':'#ffbe78'):normal,
         'stroke-width':selected?2.9:1.6,'vector-effect':'non-scaling-stroke'});
     }
     // Superposer les trajectoires XY de coupe existantes/préparées ; aucune rapide ni Z de sécurité.
     let cutCount=0;
     for(const path of state.paths||[]){
       if(!path.segments?.length)continue;
       const line=document.createElementNS(SVG,'path');
       const d=path.segments.map(q=>`M${q[0].toFixed(2)} ${q[1].toFixed(2)}L${q[2].toFixed(2)} ${q[3].toFixed(2)}`).join('');
       line.setAttribute('d',d);line.setAttribute('fill','none');
       line.setAttribute('stroke',label==='AVANT'?'#ffb97a':path.status==='conservé'||path.status==='réordonné'?'#84c5ec':'#72efac');
       line.setAttribute('stroke-width','1.1');line.setAttribute('stroke-opacity','.68');
       line.setAttribute('vector-effect','non-scaling-stroke');
       g.appendChild(line);cutCount+=path.segments.length;
     }
     const hint=document.createElement('div');hint.className='cia11-tool-hint';
     hint.textContent=cutCount?`${(state.paths||[]).length} opération(s) · ${cutCount} segments XY affichés (centre de fraise, indicatif)`:
       'Aucun segment de coupe disponible à représenter ; vérifier les paramètres FAO ci-dessous.';
     section.appendChild(svg);section.appendChild(hint);host.appendChild(section);
   }
   // Affichage des opérations AVANT / APRÈS, y compris lorsque les formes ne bougent pas.
   const report=document.createElement('div');report.className='cia11-tool-report';
   const heading=document.createElement('div');heading.className='cia11-tool-heading';
   heading.textContent='Comparaison des opérations FAO — ordre, profondeur, fraise et passes';report.appendChild(heading);
   const priorPaths=new Map((p.before.paths||[]).map(t=>[t.id,t]));
   const afterPaths=new Map((p.after.paths||[]).map(t=>[t.id,t]));
   const number=n=>Number.isFinite(n)?fmt(n):'—';
   for(const [label,state] of [['AVANT',p.before],['APRÈS',p.after]]){
     const panel=document.createElement('div');panel.className='cia11-tool-panel';
     const title=document.createElement('div');title.className='cia11-tool-title';title.textContent=label+' · '+(state.paths?.length||0)+' parcours';panel.appendChild(title);
     if(!state.paths?.length){const none=document.createElement('div');none.textContent='Aucun parcours FAO';panel.appendChild(none);}
     for(const [i,tp] of (state.paths||[]).entries()){
       const other=(label==='AVANT'?afterPaths:priorPaths).get(tp.id);
       const status=label==='AVANT'&&!other?'sera supprimé':tp.status;
       const line=document.createElement('div');line.className='cia11-tool-line';
       const primary=document.createElement('strong');primary.textContent=(i+1)+'. '+tp.id+' · '+(tp.type==='pocket'?'Poche':tp.type==='profile'?'Profil':'Opération')+' · '+status;line.appendChild(primary);
       const details=document.createElement('span');details.textContent='Profondeur '+number(tp.depth)+' mm · fraise Ø'+number(tp.diameter)+' mm · passe '+number(tp.pass)+' mm';line.appendChild(details);
       const pathStats=document.createElement('span');pathStats.textContent=tp.moveCount?tp.moveCount+' mouvements'+(tp.displayLimited?' · aperçu XY limité':''):'Trajectoire XY non disponible dans cet aperçu';line.appendChild(pathStats);
       panel.appendChild(line);
     }
     report.appendChild(panel);
   }
   host.appendChild(report);
   const change=document.createElement('div');change.className='cia11-changes';
   change.textContent=summaries.length?'Modifications géométriques :\n'+summaries.join('\n'):'Aucune modification géométrique ; seuls les paramètres FAO ou l’ordre des opérations changent.';
   host.appendChild(change);
 }
 window.COPO_IA_11={version:'1.1.4 BÊTA',analyze,apply,renderPreview,nativeCheck,pathPreview};
})();
