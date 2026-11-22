/* COPO-IA 0.9 bêta — FAO circulaire par identifiants de géométrie.
 * GPL-3.0-or-later. Simulation exclusivement. Aucune génération / émission de G-code.
 * Opérations en poches fermées, à fond plat, sur des cercles natifs identifiés.
 */
(() => {
  'use strict';
  const X=window.COPO_IA_FEATURES;
  const fail=t=>{throw Error(t);};
  const finite=(n,label,min,max)=>{
    if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)fail(`${label} : nombre requis entre ${min} et ${max}.`);
    return n;
  };
  const state=()=>{
    if(!X||typeof S==='undefined'||typeof computeTP!=='function'||typeof snapState!=='function')fail('Le moteur COPO ou les formes libres ne sont pas chargés.');
    const data=X.state();
    if(data.reason && !data.items.length)fail('Formes libres non reconnues : '+data.reason);
    const m=S.meta?.copoIAFeatures;
    if(!m||!Array.isArray(m.items)||!data.items.length||m.items.length!==S.shapes.length)fail('Le dessin ne contient pas exclusivement des formes libres COPO-IA validées.');
    if(S.dims.length||S.images.length||S.relief?.items?.length||S.stock.rotary?.on)fail('Les cotes, images, reliefs et le mode rotatif ne sont pas gérés.');
    if(S.stock.originZ!=='top')fail('Règle obligatoire : zéro Z sur le dessus du brut.');
    if(!(Number(S.machine.safeZ)>Number(S.machine.clearZ)&&Number(S.machine.clearZ)>0))fail('Hauteurs de dégagement et de sécurité invalides.');
    if(!(Number(S.stock.t)>0))fail('Épaisseur de brut invalide.');
    return {m,items:data.items};
  };
  const hasOwned=()=>S.tps.every(t=>t?.type==='pocket'&&/^COPO-IA 0\.9 ·/.test(t.name||'')&&Array.isArray(t.shapeIds)&&t.shapeIds.length===1);
  const intoPath=(o,tool,it,shapeId)=>{
    const p={...newForm(),type:'pocket',depth:o.depth,pass:o.pass,toolId:tool.id,allow:0,finish:'last',dir:'climb',entry:'rampzz',rampLen:20,strategy:'rings',rest:false,vstart:0,zrel:1};
    return {id:uid(),name:`COPO-IA 0.9 · ${it.name} (${it.id}) · SIMULATION`,type:'pocket',toolId:tool.id,shapeIds:[shapeId],relIds:[],p,visible:true,face:1};
  };
  function analyze(plan){
    const s=state();
    if(!plan||typeof plan!=='object'||Array.isArray(plan))fail('Paramètres de FAO libre manquants.');
    if(!Array.isArray(plan.operations)||plan.operations.length<1||plan.operations.length>20)fail('De 1 à 20 opérations circulaires sont autorisées par demande.');
    if(S.tps.length&&!hasOwned())fail('Parcours non produits par COPO-IA 0.9 : remplacement automatique interdit.');
    if(S.tps.length&&plan.replaceExisting!==true)fail('Des parcours existent. Pour les remplacer, demande explicitement replaceExisting:true et inclus toutes les opérations à conserver.');
    if(!S.tps.length&&plan.replaceExisting===true)fail('Aucun parcours existant à remplacer : utilise replaceExisting:false.');
    const selected=new Set(),paths=[],summary=[],diameters=[];
    for(const o of plan.operations){
      if(!o||typeof o!=='object'||Array.isArray(o)||o.strategy!=='pocket')fail('Stratégie autorisée : pocket uniquement (fraisage intérieur).');
      if(typeof o.id!=='string'||!/^[A-Za-z][\w-]{0,39}$/.test(o.id)||selected.has(o.id))fail('Identifiant de forme absent, invalide ou répété.');
      selected.add(o.id);
      const item=s.items.find(it=>it.id===o.id),raw=s.m.items.find(it=>it.id===o.id);
      if(!item||!raw||!raw.shapeId)fail(`Forme ${o.id} absente ou non reconnue.`);
      if(item.geometry.type!=='circle'||item.role!=='hole')fail(`La forme ${o.id} n'est pas un trou circulaire. Seuls les cercles sont gérés en 0.9.`);
      if(o.through!==false)fail(`Profondeur traversante refusée pour ${o.id} : la 0.9 nécessite une profondeur borgne explicite et through:false.`);
      const depth=finite(o.depth,`Profondeur ${o.id}`,0.01,Number(S.stock.t)-0.01);
      const pass=finite(o.pass,`Passe ${o.id}`,0.1,5);
      if(pass>depth)fail(`La passe de ${o.id} dépasse la profondeur demandée.`);
      const toolDiameter=finite(o.toolDiameter,`Diamètre de fraise ${o.id}`,0.1,50);
      const matching=S.tools.filter(t=>t.type==='flat'&&Math.abs(Number(t.dia)-toolDiameter)<.0001);
      if(matching.length!==1)fail(`Une fraise droite Ø${toolDiameter} mm doit exister exactement une fois dans la bibliothèque COPO.`);
      const tool=matching[0];
      if(![tool.feed,tool.plunge,tool.rpm].every(n=>Number.isFinite(+n)&&+n>0))fail(`Conditions de coupe incomplètes pour la fraise Ø${toolDiameter}.`);
      const circleDiameter=Number(item.geometry.diameter);
      if(circleDiameter<=toolDiameter+0.05)fail(`La fraise Ø${toolDiameter} est trop grande pour le trou ${o.id} (Ø${circleDiameter}).`);
      const cx=Number(item.geometry.cx),cy=Number(item.geometry.cy),r=circleDiameter/2,toolR=toolDiameter/2;
      // Les coordonnées XY du centre de fraise doivent rester à l'intérieur de la forme avec compensation de rayon.
      if(cx-r<0||cy-r<0||cx+r>S.stock.w||cy+r>S.stock.h)fail(`Le cercle ${o.id} dépasse du brut.`);
      const tp=intoPath(o,tool,item,raw.shapeId);
      computeTP(tp);
      if(tp.err)fail(`${o.id} : erreur du moteur COPO : ${tp.err}`);
      if(tp.warns?.length)fail(`${o.id} : avertissement du moteur COPO : ${tp.warns.join(' ; ')}`);
      if(!Array.isArray(tp.moves)||tp.moves.length<2||tp.moves.length>35000)fail(`${o.id} : parcours absent ou trop complexe.`);
      let bottom=0,cutCount=0;
      for(const move of tp.moves){
        if(!Number.isFinite(move.x)||!Number.isFinite(move.y)||!Number.isFinite(move.z))fail(`${o.id} : coordonnées non finies.`);
        bottom=Math.min(bottom,move.z);
        if(move.z<-.015){
          cutCount++;
          const d=Math.hypot(move.x-cx,move.y-cy);
          if(d>r-toolR+0.2)fail(`${o.id} : une trajectoire de fraise sort de la zone circulaire. Calcul refusé.`);
          if(move.z < -depth-.02)fail(`${o.id} : mouvement sous la profondeur maximale.`);
        }
      }
      if(!cutCount||Math.abs(bottom+depth)>.02)fail(`${o.id} : profondeur calculée incohérente (${bottom}).`);
      paths.push(tp);diameters.push(circleDiameter);
      summary.push(`${item.name} [${o.id}] : Ø${circleDiameter} mm, profondeur ${depth} mm, fraise Ø${toolDiameter} mm, passes ${pass} mm, ${tp.moves.length} mouvements.`);
    }
    const existing=S.tps.length;
    if(existing&&plan.replaceExisting===true){
      const old=new Set(S.tps.flatMap(t=>t.shapeIds||[]));
      const next=new Set(paths.flatMap(t=>t.shapeIds||[]));
      if(old.size!==next.size||[...old].some(x=>!next.has(x)))fail('Le remplacement supprimerait une opération existante. Fournis toutes les géométries déjà usinées.');
    }
    return {snapshot:snapState(),paths,replaceExisting:!!plan.replaceExisting,summary:`${summary.length} parcours circulaire(s) vérifié(s) :\n${summary.join('\n')}\n${existing?'Remplacement total des anciens parcours COPO-IA 0.9.\n':''}Simulation uniquement, conditions de coupe non validées. Aucun G-code envoyé ou exporté.`};
  }
  function apply(draft){
    if(!draft||draft.snapshot!==snapState())fail('Le projet a changé depuis la vérification. Relance l’analyse.');
    const before=snapState();
    try{
      state();
      if(S.tps.length&&(!draft.replaceExisting||!hasOwned()))fail('Le projet possède désormais des parcours incompatibles.');
      if(draft.replaceExisting){S.tps=[];S.activeTp=null;S.editTp=null;}
      else if(S.tps.length)fail('Création refusée sur des parcours existants.');
      S.tps.push(...draft.paths);
      S.activeTp=draft.paths[0].id;S.editTp=null;S.sel.clear();
      commit(false);gcDirty=true;renderTpList();setTab('parcours');draw();
      return {count:draft.paths.length,moves:draft.paths.map(tp=>tp.moves.length)};
    }catch(e){restore(before);throw e;}
  }
  window.COPO_IA_FREE_CAM={version:'0.9 BÊTA',analyze,apply};
})();
