/* COPO-IA 0.6 PASSERELLE — dialogue à plan structuré, contrôles et confirmation obligatoire.
 * GNU GPL-3.0-or-later. Aucun envoi de G-code ni connexion machine.
 */
(() => {
 'use strict';
 const G=window.COPO_IA_TEST, F=window.COPO_IA_FAO_TEST, X=window.COPO_IA_FEATURES, H=window.COPO_IA_FREE_CAM, M=window.COPO_IA_MULTI_CAM;
 const root=document.getElementById('cia-root');
 if(!G||!F||!root)return;
 const section=document.createElement('section');section.className='cia-dialogue';
 section.innerHTML=`<details id="cia-dialogue-details">
  <summary>✦ Démonstrations et vérification FAO (facultatif)</summary>
  <p>Utilise les deux démonstrations ou importe une proposition préparée avec ChatGPT. <b>Rien ne change sans ton accord</b>.</p>
  <label for="cia-chat-text">Texte de démonstration (non envoyé automatiquement à ChatGPT)</label>
  <textarea id="cia-chat-text" rows="4" spellcheck="true" aria-label="Texte de démonstration, vide par défaut"></textarea>
  <div class="cia-actions">
    <button type="button" id="cia-chat-read">Lire le projet</button>
    <button type="button" id="cia-chat-demo-cam">Démo : 2 parcours</button>
    <button type="button" id="cia-chat-demo-revise">Démo : modifier + recalculer</button>
    <button type="button" id="cia-chat-clear">Vider tous les champs</button>
  </div>
  <div class="cia-actions">
    <button type="button" id="cia-chat-apply" class="cia-primary" disabled>Confirmer dans COPO</button>
  </div>
  <div id="cia-chat-status" class="cia-note">Aucun service API : les propositions de ChatGPT sont importées explicitement dans « Passerelle ChatGPT » ci-dessous.</div>
  <div id="cia-chat-report" class="cia-report" role="status" aria-live="polite">Commence par « Lire le projet ». Les démonstrations restent disponibles gratuitement.</div>
  <p class="cia-note"><b>SIMULATION UNIQUEMENT.</b> Les parcours ne sont pas validés pour une machine réelle. Seuls les projets COPO-IA reconnus sont modifiables automatiquement.</p>
 </details>`;
 root.querySelector('.cia-body').insertBefore(section,root.querySelector('.cia-body').firstChild);
 const style=document.createElement('style');style.textContent=`#cia-root .cia-dialogue details>summary{cursor:pointer;font-size:14px;font-weight:700;color:#cbe5ff;padding:3px 0 8px}#cia-root .cia-dialogue p{margin:4px 0 9px}#cia-root .cia-dialogue label{display:block;margin-bottom:6px}#cia-root .cia-dialogue textarea{margin-bottom:8px;min-height:105px}#cia-root .cia-dialogue .cia-report{margin-top:7px}#cia-root .cia-dialogue .cia-note{margin-top:7px}`;document.head.appendChild(style);
 const $=id=>document.getElementById(id),field=$('cia-chat-text'),report=$('cia-chat-report'),approve=$('cia-chat-apply');
 let draft=null;
 const fail=m=>{throw new Error(m);};
 const nice=x=>String(Number(Number(x).toFixed(3))).replace('.',',');
 const abs=n=>Number.isFinite(Number(n))?Number(n):null;
 function msg(s,err=false){report.textContent=s;report.classList.toggle('cia-error',!!err);}
 function invalidate(){draft=null;approve.disabled=true;}
 field.addEventListener('input',()=>{invalidate();msg('Instruction modifiée. Relance l’analyse avant de confirmer.');});
 function checkProject(){if(typeof S==='undefined'||typeof snapState!=='function')fail('COPO n’est pas encore chargé.');}
 function ownedToolpaths(){return S.tps.every(t=>t&&t.type==='pocket'&&/^COPO-IA 0\.[3457] · /.test(t.name||'')&&Array.isArray(t.shapeIds));}
 function state(){
   checkProject();const c=G.context();return {...c,features:X?X.state():null,
     toolLibrary:S.tools.filter(t=>t.type==='flat').map(t=>({diameter:t.dia,name:t.name})),
     paths:S.tps.map(t=>({name:t.name,depth:t.p?.depth??null,pass:t.p?.pass??null,diameter:S.tools.find(v=>v.id===t.toolId)?.dia??null,shapes:t.shapeIds?.length||0})),
     editability:ownedToolpaths()?'Parcours COPO-IA uniquement':'Parcours étrangers ou manuels : modification automatique interdite'
   };
 }
 function desc(){let text=G.describe();if(X){const fs=X.state();if(fs.items.length)text+='\n\nFormes libres COPO-IA 0.8 : '+fs.items.length+' élément(s).'+fs.items.map(f=>'\n• '+f.id+' ('+f.role+') : '+f.geometry.type).join('');} if(S.tps.length&&ownedToolpaths()&&!S.dims.length&&!S.images.length)text=text.replace('⚠ Édition IA interdite tant que des parcours ou éléments liés existent.','⚠ Les commandes de dessin classiques sont verrouillées ; la passerelle peut remplacer les parcours COPO-IA après confirmation.');return text+`\n\nParcours d'outil : ${S.tps.length}.`+
   S.tps.map(t=>`\n• ${t.name} — profondeur ${nice(t.p.depth)} mm ; fraise Ø${nice(S.tools.find(v=>v.id===t.toolId)?.dia||0)} mm.`).join('')+
   `\nFraises droites disponibles : ${S.tools.filter(t=>t.type==='flat').map(t=>'Ø'+nice(t.dia)).join(', ')} mm.`;
 }
 function stripPaths(fn){const paths=S.tps;S.tps=[];try{return fn();}finally{S.tps=paths;}}
 function geometryPlan(p){
  if(!p||typeof p!=='object'||!['create','edit'].includes(p.action))fail('Plan géométrique invalide.');
  if(p.action==='edit'&&(!G.managed()))fail('Seuls les dessins reconnus COPO-IA sont éditables.');
  let geom={action:p.action,contour:p.contour||null,stock_thickness:p.stock_thickness??null,stockFull:!!p.stockFull,
    holes:p.holes||null,pocket:p.pocket||null};
  const m=G.managed();
  if(p.pocket_width_delta!=null||p.pocket_height_delta!=null){
    if(!m?.pocket)fail('Aucune poche existante pour une modification relative.');
    if(p.pocket?.mode==='remove')fail('Une poche supprimée ne peut pas être agrandie.');
    geom.pocket={mode:'change',width:m.pocket.width+Number(p.pocket_width_delta||0),height:m.pocket.height+Number(p.pocket_height_delta||0),depth:p.pocket?.depth??m.pocket.depth};
  }
  return stripPaths(()=>G.validateTarget(geom));
 }
 function normalizedCam(c,geo){
  if(!c||typeof c!=='object')fail('Aucune instruction FAO structurée.');
  const m=G.managed(),old=S.tps;
  const pocket=c.pocket===true,slots=c.slots===true;
  if(!pocket&&!slots)fail('Aucune opération FAO sélectionnée.');
  const source=old.find(t=>t?.p?.depth!=null);
  const tool=S.tools.find(t=>t.id===source?.toolId);
  const defaultDepth=geo?.pocket?.depth??m?.pocket?.depth;
  const pocketDepth=c.pocketDepth??defaultDepth;
  const dia=c.toolDiameter??tool?.dia;
  const pass=c.pass??source?.p?.pass;
  if(pocket&&!(Number(pocketDepth)>0))fail('Indique explicitement la profondeur de poche dans le dessin.');
  if(!(Number(dia)>0))fail('Indique le diamètre de fraise, par exemple Ø6 mm.');
  if(!S.tools.some(t=>t.type==='flat'&&Math.abs(Number(t.dia)-Number(dia))<.01))fail('La fraise Ø'+nice(dia)+' mm est absente de la bibliothèque COPO. Ajoute-la avant de recalculer.');
  if(old.length){const containsPocket=old.some(t=>t.shapeIds?.length===1),containsSlots=old.some(t=>t.shapeIds?.length===4);
   if((containsPocket&&!pocket)||(containsSlots&&!slots))fail('Le projet contient des parcours qui seraient supprimés par ce remplacement. Demande explicitement le recalcul de toutes les opérations existantes.');}
  if(!(Number(pass)>0))fail('Indique la profondeur par passe, par exemple 1 mm.');
  const oldSlots=old.find(t=>t?.shapeIds?.length===4);
  let through=c.slotsThrough===true;
  let depth=c.slotsDepth;
  if(slots&&!through&&depth==null&&oldSlots){
    if(Math.abs(Number(oldSlots.p.depth)-Number(S.stock.t))<.01)through=true;
    else depth=oldSlots.p.depth;
  }
  if(slots&&!through&&!(Number(depth)>0))fail('Précise la profondeur des oblongs ou demande « traversants ».');
  if(slots&&c.slotsThrough===true&&c.slotsDepth!=null)fail('Oblongs à la fois traversants et profondeur fixe : ambigu.');
  return {pocket,slots,pocketDepth:Number(pocketDepth),slotsDepth:depth==null?null:Number(depth),slotsThrough:through,toolDiameter:Number(dia),pass:Number(pass)};
 }
 function camSummary(c,geo){
  const thickness=geo?.thickness??Number(S.stock.t), depth=c.slotsThrough?thickness:c.slotsDepth;
  return `${c.pocket?'Poche centrale : profondeur '+nice(c.pocketDepth)+' mm.\n':''}${c.slots?'Quatre oblongs : '+(c.slotsThrough?'traversants':'profondeur '+nice(depth)+' mm')+'.\n':''}Fraise Ø${nice(c.toolDiameter)} mm ; passes de ${nice(c.pass)} mm.\nConditions de coupe de la bibliothèque COPO NON validées pour la machine.`;
 }
 function analyze(plan,source){
  invalidate();checkProject();
  if(!plan||typeof plan!=='object'||!['read','geometry','fao','revise','clarify','features','feature_cam','multi_cam'].includes(plan.action))fail('Type de demande non reconnu : aucun changement.');
  if(plan.action==='read'){msg(desc());return;}
  if(plan.action==='clarify'){msg('Précision nécessaire : '+(plan.message||'La demande doit être reformulée.'));return;}
  if(plan.action==='multi_cam'){
    if(!M)fail('Module multi-FAO 1.0 indisponible.');
    const multiChecked=M.analyze(plan.multi_cam);
    draft={signature:snapState(),plan,multiChecked,source};
    approve.disabled=false;
    msg('Proposition de FAO multi-géométrique vérifiée par COPO :\n'+multiChecked.summary+'\n\nAucun parcours ajouté avant confirmation.');
    return;
  }
  if(plan.action==='feature_cam'){
    if(!H)fail('Module FAO des formes libres non chargé.');
    const camChecked=H.analyze(plan.feature_cam);
    draft={signature:snapState(),plan,camChecked,source};
    approve.disabled=false;
    msg('Proposition de FAO libre vérifiée par COPO :\n'+camChecked.summary+'\n\nAucun parcours ajouté avant confirmation.');
    return;
  }
  if(plan.action==='features'){
    if(!X)fail('Module de formes libres indisponible.');
    const featureChecked=X.analyze(plan.features);
    draft={signature:snapState(),plan,featureChecked,source};
    approve.disabled=false;
    msg('Proposition de géométrie libre contrôlée par COPO :\n'+featureChecked.summary+'\n\nAucune modification avant confirmation. Aucun parcours FAO créé.');
    return;
  }
  if(['geometry','revise'].includes(plan.action)&&!plan.geometry)fail('La proposition ne contient aucune géométrie exploitable.');
  if(['fao','revise'].includes(plan.action)&&!plan.cam)fail('La proposition ne contient aucun paramètre FAO exploitable.');
  const hasPaths=S.tps.length>0;
  if(hasPaths&&!ownedToolpaths())fail('Le projet contient un parcours non créé par COPO-IA. Remplacement automatique interdit.');
  if(hasPaths&&plan.action==='geometry')fail('Ce projet possède des parcours. Pour modifier les formes, il faut explicitement demander leur recalcul en même temps.');
  if(plan.action==='revise'&&S.tps.length===0)fail('Pour un premier dessin, utilise une instruction de dessin puis une préparation FAO, séparément.');
  const geo=['geometry','revise'].includes(plan.action)?geometryPlan(plan.geometry):null;
  const cam=['fao','revise'].includes(plan.action)?normalizedCam(plan.cam,geo):null;
  const wasPaths=hasPaths;
  let checked=null;
  if(cam&&!geo){checked=stripPaths(()=>F.calcStructured(cam));}
  const txt=(geo?G.summary(geo).split('\n\n⚠')[0]+'\n\n':'')+
    (cam?'FAO à calculer / remplacer :\n'+camSummary(cam,geo)+'\n':'')+
    (checked?`Parcours calculés en prévisualisation : ${checked.paths.map(p=>p.moves.length).join(' + ')} mouvements.\n`:'Le calcul définitif des parcours se fera après la modification de la géométrie.\n')+
    (wasPaths?'⚠ Les anciens parcours COPO-IA seront SUPPRIMÉS et remplacés, après confirmation.\n':'')+
    'AUCUN G-code envoyé ni exporté. Clique sur « Confirmer dans COPO » pour appliquer.';
  draft={signature:snapState(),plan,geo,cam,checked,wasPaths,source};
  approve.disabled=false;msg((source==='ChatGPT'?'Proposition ChatGPT contrôlée par COPO :\n':'Proposition de démonstration vérifiée localement :\n')+txt);
 }
 function commitDraft(){
   if(!draft)fail('Commence par analyser la demande.');
   if(draft.signature!==snapState())fail('Le projet a changé depuis la vérification. Relance l’analyse.');
   const d=draft,before=snapState();
   if(d.multiChecked){
     try{const result=M.apply(d.multiChecked);invalidate();msg(`✓ ${result.count} parcours multi-géométriques enregistrés dans COPO (${result.moves.join(' + ')} mouvements).\nEnregistre en .copo pour conserver les parcours.\nSIMULATION UNIQUEMENT — G-code non validé.`);return;}
     catch(e){restore(before);invalidate();throw Error('Aucune modification conservée : '+(e.message||String(e)));}
   }
   if(d.camChecked){
     try{const result=H.apply(d.camChecked);invalidate();msg(`✓ ${result.count} parcours circulaire(s) enregistré(s) dans COPO (${result.moves.join(' + ')} mouvements).\nEnregistre en .copo pour conserver les parcours.\nSIMULATION UNIQUEMENT — G-code non validé.`);return;}
     catch(e){restore(before);invalidate();throw Error('Aucune modification conservée : '+(e.message||String(e)));}
   }
   if(d.featureChecked){
     try{const n=X.apply(d.featureChecked);invalidate();msg('✓ '+n+' formes indépendantes enregistrées dans COPO.\nEnregistre le fichier .copo pour conserver le résultat.\nAucune FAO automatique pour ces nouvelles formes.');return;}
     catch(e){restore(before);invalidate();throw Error('Aucune modification conservée : '+(e.message||String(e)));}
   }
   if(d.wasPaths&&!ownedToolpaths())fail('Parcours non reconnus : refus.');
   try{
     if(d.wasPaths){S.tps=[];S.activeTp=null;S.editTp=null;}
     if(d.geo){
       const p={...d.geo,snapshot:snapState()};
       G.apply(p);
     }
     let summary='';
     if(d.cam){const calc=F.calcStructured(d.cam);F.applyStructured(calc);
       summary=`\n${calc.paths.length} parcours natif(s) créé(s) : ${calc.paths.map(t=>t.moves.length).join(' + ')} mouvements.`;}
     invalidate();
     msg(`✓ Modifications enregistrées dans le projet COPO. ${d.geo?'Géométrie actualisée.':''}${summary}\nClique sur « Enregistrer .copo » pour conserver le résultat.\n⚠ Simulation uniquement — NE PAS exécuter le G-code sur une CNC.`);
   }catch(e){restore(before);invalidate();throw Error('Aucune modification conservée : '+(e.message||String(e)));}
 }
 const doDemo=(mode)=>{
   checkProject();const m=G.managed();if(!m)fail('Ouvre le fichier Exemple-plaque-COPO-IA.copo avant de tester la FAO.');
   if(mode==='cam'){
     field.value='Usine la poche centrale sur 5 mm, puis les quatre oblongs traversants. Fraise Ø6 mm, passes de 1 mm. Simulation.';
     analyze({action:'fao',geometry:null,cam:{pocket:true,slots:true,pocketDepth:5,slotsDepth:null,slotsThrough:true,toolDiameter:6,pass:1}},'démo');
   }else{
     field.value='Agrandis la poche centrale à 90 × 50 mm, puis recalcule la poche et les oblongs avec une fraise Ø3,175 mm et des passes de 1 mm.';
     analyze({action:'revise',geometry:{action:'edit',contour:null,stock_thickness:null,stockFull:false,holes:null,pocket:{mode:'change',width:90,height:50,depth:5},pocket_width_delta:null,pocket_height_delta:null},
       cam:{pocket:true,slots:true,pocketDepth:5,slotsDepth:null,slotsThrough:true,toolDiameter:3.175,pass:1}},'démo');
   }
 };
 $('cia-chat-read').onclick=()=>{invalidate();try{msg(desc());}catch(e){msg(e.message,true);}};
 $('cia-chat-clear').onclick=()=>{if(typeof window.COPO_IA_CLEAR_FIELDS==='function')window.COPO_IA_CLEAR_FIELDS();else resetFields();};
 $('cia-chat-demo-cam').onclick=()=>{try{doDemo('cam');}catch(e){invalidate();msg(e.message,true);}};
 $('cia-chat-demo-revise').onclick=()=>{try{doDemo('revise');}catch(e){invalidate();msg(e.message,true);}};
 $('cia-chat-apply').onclick=()=>{try{commitDraft();}catch(e){invalidate();msg(e.message,true);}};
 function resetFields(){invalidate();field.value='';msg('Aucune commande en attente. Le projet COPO reste intact.');}
 window.COPO_IA_DIALOGUE_TEST={version:'1.0 BÊTA PASSERELLE',state,analyze,commitDraft,normalizedCam,geometryPlan,desc,doDemo,resetFields};
})();
