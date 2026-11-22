/* COPO-IA 0.5 — Simulation de deux parcours natifs depuis une demande française.
   Dérivé de COPO, sous GPL-3.0-or-later.
   La demande ne pilote jamais une machine, n'exporte aucun G-code.
*/
(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const root = get('cia-root');
  if (!root || !window.COPO_IA_TEST) return;
  const ui = document.createElement('section');
  ui.className = 'cia-fao';
  ui.innerHTML = `
    <div class="cia-divider"></div>
    <details id="cia-fao-details" open>
      <summary>FAO en français · simulation de 2 opérations</summary>
      <p>Une seule demande pour <b>la poche centrale</b> puis <b>les quatre oblongs</b>. COPO calculera deux parcours distincts, après vérification et confirmation.</p>
      <label for="cia-fao-prompt">Instruction d'usinage (simulation uniquement)</label>
      <textarea id="cia-fao-prompt" rows="4" spellcheck="true" aria-label="Instruction FAO"></textarea>
      <div class="cia-actions">
        <button id="cia-fao-example" type="button">Exemple de commande</button>
        <button id="cia-fao-check" type="button">Vérifier les 2 opérations</button>
        <button id="cia-fao-apply" type="button" class="cia-primary" disabled>Confirmer les 2 parcours</button>
      </div>
      <div id="cia-fao-result" class="cia-report" role="status" aria-live="polite">Ouvre d'abord le projet d'exemple, puis clique sur « Exemple de commande ».</div>
      <p class="cia-note"><b>SIMULATION SEULEMENT.</b> Les oblongs traversants atteignent Z = −épaisseur du brut : une machine réelle exigerait un martyr, un bridage et des réglages validés. Aucun G-code n'est exporté ou envoyé par COPO-IA.</p>
    </details>`;
  root.querySelector('.cia-body').insertBefore(ui, get('cia-server-status'));
  const css=document.createElement('style');
  css.textContent=`#cia-root .cia-fao details>summary{font-weight:700;cursor:pointer;margin:9px 0}#cia-root .cia-fao p{margin:8px 0}#cia-root #cia-fao-prompt{min-height:94px}#cia-root #cia-fao-result{white-space:pre-line}`;
  document.head.appendChild(css);
  const field=get('cia-fao-prompt'),out=get('cia-fao-result'),apply=get('cia-fao-apply');
  const EXAMPLE='Usine la poche centrale à 5 mm de profondeur avec une fraise Ø6 mm, par passes de 1 mm. Puis usine les quatre oblongs traversants avec la même fraise. Simulation seulement.';
  let draft=null;
  const norm=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[×✕]/g,'x').replace(/[øØ]/g,'diametre ').replace(/\s+/g,' ').trim();
  const mm=t=>Number(String(t).replace(',','.'));
  const fm=t=>Number(Number(t).toFixed(3)).toString().replace('.',',');
  const fail=t=>{throw Error(t);};
  function show(message,bad=false){out.textContent=message;out.classList.toggle('cia-error',bad);}
  function invalidate(message){draft=null;apply.disabled=true;if(message)show(message);}
  function parse(instruction){
    const s=norm(instruction);
    if(!s)fail('Écris une instruction ou clique sur « Exemple de commande ».');
    if(/g-?code|postprocesseur|envoi|envoyer|demarre la machine|lancer la machine/.test(s))fail('La v0.4 refuse les commandes machine et la génération de G-code. Simulation seulement.');
    if(/detourage|contour exterieur|surfacage|percage|filetage|chanfrein|rainure/.test(s))fail('La v0.4 ne programme que la poche et les quatre oblongs. Sépare les autres opérations.');
    if(!/\bpoche\b/.test(s)||!/\boblong/.test(s))fail('Cette version attend une poche centrale puis les quatre oblongs.');
    if(!/(?:quatre|4) (?:trous )?oblongs/.test(s))fail('Précise explicitement « les quatre oblongs ».');
    if(!/poche centrale/.test(s))fail('La commande doit viser explicitement la poche centrale.');
    const p=s.match(/poche centrale.{0,30}?\b(?:a|de|profondeur(?: de)?)\s*(\d+(?:[.,]\d+)?)\s*mm(?:\s+de\s+profondeur)?/);
    if(!p)fail('Indique la profondeur de la poche : « poche centrale à 5 mm de profondeur ».');
    const tool=s.match(/fraise\s*(?:de\s*)?(?:diametre\s*)?(\d+(?:[.,]\d+)?)\s*mm/);
    if(!tool)fail('Indique le diamètre de fraise : « fraise Ø6 mm ».');
    const pass=s.match(/\bpasses?\s+(?:de\s*)?(\d+(?:[.,]\d+)?)\s*mm/);
    if(!pass)fail('Indique la profondeur par passe : « par passes de 1 mm ».');
    const slot=s.slice(s.search(/\boblong/));
    if(/non[ -]traversant/.test(slot))fail('Pour un oblong non traversant, précise sa profondeur en mm, sans le mot « traversant ».');
    const through=/\btraversant/.test(slot);
    const blind=slot.match(/(?:profondeur\s*(?:de|a)?|\ba)\s*(\d+(?:[.,]\d+)?)\s*mm/);
    if(!through&&!blind)fail('Précise la profondeur des oblongs, ou écris « oblongs traversants ».');
    if(through&&blind)fail('Demande ambiguë : « traversants » et une profondeur chiffrée sont tous deux présents.');
    const pocketDepth=mm(p[1]),dia=mm(tool[1]),step=mm(pass[1]);
    if(!(pocketDepth>0&&pocketDepth<=30))fail('La profondeur de poche doit être entre 0 et 30 mm.');
    if(!(dia>0&&dia<=50))fail('Diamètre d’outil invalide.');
    if(!(step>=0.1&&step<=5))fail('La passe doit être entre 0,1 et 5 mm.');
    const slotDepth=through?null:mm(blind[1]);
    if(!through&&!(slotDepth>0&&slotDepth<=30))fail('Profondeur des oblongs invalide.');
    return {pocketDepth,dia,pass:step,through,slotDepth};
  }
  function prepared(requireSlots=true){
    if(typeof S==='undefined'||typeof computeTP!=='function'||typeof snapState!=='function')fail('COPO n’est pas chargé.');
    const meta=window.COPO_IA_TEST.managed();
    if(!meta || !meta.pocketId || !meta.pocket)fail('Charge une plaque COPO-IA avec une poche centrale.');
    if(requireSlots && (!meta.hole||meta.hole.mode!=='slot'||!Array.isArray(meta.holeIds)||meta.holeIds.length!==4))
      fail('Pour usiner les oblongs, la pièce doit posséder exactement quatre oblongs COPO-IA.');
    if(meta.hole && (!['slot','round'].includes(meta.hole.mode)||!Array.isArray(meta.holeIds)||meta.holeIds.length!==4))
      fail('Les trous déclarés dans la pièce ne correspondent pas aux quatre formes attendues.');
    if(!meta.hole && Array.isArray(meta.holeIds) && meta.holeIds.length)
      fail('Les trous présents ne sont pas identifiés par COPO-IA.');
    const ids=[meta.contourId,meta.pocketId,...(meta.holeIds||[])];
    if(ids.some(id=>!S.shapes.some(sh=>sh.id===id)))fail('Géométrie modifiée ou incomplète : opération refusée.');
    // Ne pas faire confiance seulement aux métadonnées : comparer les contours réels.
    const b0=bboxOf(meta.contourId);
    if(Math.abs((b0.x1-b0.x0)-meta.w)>.15||Math.abs((b0.y1-b0.y0)-meta.h)>.15)fail('Dimensions réelles de la plaque modifiées : recharge le projet de référence.');
    const bp=bboxOf(meta.pocketId);
    if(Math.abs((bp.x1-bp.x0)-meta.pocket.width)>.15||Math.abs((bp.y1-bp.y0)-meta.pocket.height)>.15)fail('La poche réelle ne correspond plus au projet enregistré.');
    for(const id of (meta.holeIds||[])){const b=bboxOf(id);
      if(meta.hole.mode==='slot'){
        if(Math.abs((b.x1-b.x0)-meta.hole.length)>.15||Math.abs((b.y1-b.y0)-meta.hole.width)>.15)fail('Un oblong ne correspond plus aux dimensions déclarées.');
      }else if(meta.hole.mode==='round'){
        if(Math.abs((b.x1-b.x0)-meta.hole.diameter)>.15||Math.abs((b.y1-b.y0)-meta.hole.diameter)>.15)fail('Un trou rond ne correspond plus au diamètre déclaré.');
      }
      if(b.x0<b0.x0-.05||b.x1>b0.x1+.05||b.y0<b0.y0-.05||b.y1>b0.y1+.05)fail('Un trou sort du contour de la plaque.');
      if(b.x0<bp.x1+.05&&b.x1>bp.x0-.05&&b.y0<bp.y1+.05&&b.y1>bp.y0-.05)fail('Un trou recoupe la poche centrale.');
    }
    if(S.tps.length)fail('Un parcours existe déjà dans COPO. Pour éviter les doublons, ouvre le fichier de dessin sans parcours.');
    if(S.dims.length||S.images.length||(S.relief&&S.relief.items.length))fail('Cette démonstration n’usine pas un projet contenant cotes, images ou relief.');
    if(S.stock.rotary&&S.stock.rotary.on)fail('Le mode rotatif n’est pas pris en charge.');
    if(S.stock.originZ!=='top')fail('Le zéro Z doit être réglé sur le dessus du brut.');
    if(!(Number(S.stock.t)>0&&Number(S.stock.t)<=50))fail('Épaisseur de brut invalide.');
    if(!(Number(S.machine.safeZ)>Number(S.machine.clearZ) && Number(S.machine.clearZ)>0))fail('Vérifie les hauteurs de sécurité et de dégagement.');
    return meta;
  }
  function validate(q){
    const m=prepared();
    if(Math.abs(q.pocketDepth-Number(m.pocket.depth))>0.001)fail(`Le dessin prévoit une poche de ${fm(m.pocket.depth)} mm, pas ${fm(q.pocketDepth)} mm. Modifie d’abord le dessin.`);
    if(!(q.pocketDepth<S.stock.t))fail('Une poche non traversante doit rester moins profonde que le brut.');
    const depth=q.through?Number(S.stock.t):q.slotDepth;
    if(depth>S.stock.t)fail('La profondeur des oblongs dépasse le brut.');
    if(!(depth>0))fail('Profondeur des oblongs absente.');
    if(q.pass>q.pocketDepth||q.pass>depth)fail('La profondeur de passe doit être inférieure ou égale à chacune des profondeurs.');
    const tool=S.tools.find(t=>t.type==='flat'&&Math.abs(Number(t.dia)-q.dia)<.01);
    if(!tool)fail(`Aucune fraise droite Ø${fm(q.dia)} mm dans la bibliothèque du projet. Utilise une fraise existante.`);
    if(![tool.feed,tool.plunge,tool.rpm].every(v=>Number.isFinite(+v)&&+v>0))fail('Paramètres de fraise incomplets.');
    if(!(q.dia<Math.min(m.pocket.width,m.pocket.height)))fail('Fraise trop grosse pour la poche.');
    if(!(q.dia<m.hole.width))fail(`Fraise Ø${fm(q.dia)} trop grosse pour les oblongs de largeur ${fm(m.hole.width)} mm.`);
    return {m,depth,tool,q};
  }
  function tpOf(t,label,shapeIds,depth,pass){
    const p={...newForm(),type:'pocket',depth,pass,toolId:t.tool.id,allow:0,finish:'last',dir:'climb',entry:'rampzz',rampLen:20,strategy:'rings',rest:false,vstart:0,zrel:1};
    return {id:uid(),name:`COPO-IA 0.4 · ${label} · SIMULATION`,type:'pocket',toolId:t.tool.id,shapeIds,relIds:[],p,visible:true,face:1};
  }
  function checkMoves(tp,depth,radius,inside){
    if(tp.err)fail(`COPO refuse le parcours « ${tp.name} » : ${tp.err}`);
    if(!Array.isArray(tp.moves)||tp.moves.length<2)fail(`COPO n'a produit aucun mouvement pour « ${tp.name} ».`);
    if(tp.moves.length>30000)fail('Parcours trop complexe pour cette démonstration.');
    if(tp.moves.some(v=>![v.x,v.y,v.z].every(Number.isFinite)))fail('Un mouvement contient une coordonnée invalide.');
    const lower=Math.min(...tp.moves.map(v=>v.z));
    if(Math.abs(lower+depth)>.015)fail(`Profondeur incohérente : attendu -${fm(depth)} mm, obtenu ${fm(lower)} mm.`);
    const tol=.18;
    for(const v of tp.moves){if(v.z>=-.015)continue;if(!inside(v.x,v.y,radius,tol))fail(`Une trajectoire de coupe sort de la géométrie prévue dans « ${tp.name} ». Parcours refusé.`);}
  }
  function bboxOf(id){const sh=S.shapes.find(s=>s.id===id);if(!sh||!sh.closed||!sh.pts||!sh.pts.length)fail('Forme fermée introuvable.');const X=sh.pts.map(p=>p[0]),Y=sh.pts.map(p=>p[1]);return {x0:Math.min(...X),x1:Math.max(...X),y0:Math.min(...Y),y1:Math.max(...Y)};}
  function calc(raw){
    const q=parse(raw),t=validate(q),r=Number(t.tool.dia)/2;
    const pocket=tpOf(t,'Poche centrale 5 mm',[t.m.pocketId],q.pocketDepth,q.pass);
    computeTP(pocket);
    const b=bboxOf(t.m.pocketId);
    checkMoves(pocket,q.pocketDepth,r,(x,y,R,tol)=>x>=b.x0+R-tol&&x<=b.x1-R+tol&&y>=b.y0+R-tol&&y<=b.y1-R+tol);
    const slots=tpOf(t,`4 oblongs ${q.through?'traversants':'profondeur '+fm(t.depth)+' mm'}`,t.m.holeIds,t.depth,q.pass);
    // Les oblongs très étroits génèrent beaucoup de segments en anneaux.
    // Balayage avec tour de finition, prévu par le moteur natif de COPO.
    slots.p.strategy='raster'; slots.p.rasterAng=0;
    computeTP(slots);
    const boxes=t.m.holeIds.map(bboxOf);
    checkMoves(slots,t.depth,r,(x,y,R,tol)=>boxes.some(b=>{
      const center=(b.y0+b.y1)/2,rad=(b.y1-b.y0)/2,from=b.x0+rad,to=b.x1-rad;
      const dd=Math.hypot(x-Math.max(from,Math.min(to,x)),y-center);
      return dd<=rad-R+tol;
    }));
    if(pocket.warns&&pocket.warns.length)fail('Avertissement COPO sur la poche : '+pocket.warns.join(' ; '));
    if(slots.warns&&slots.warns.length)fail('Avertissement COPO sur les oblongs : '+slots.warns.join(' ; '));
    return {q,t,pocket,slots,snapshot:snapState()};
  }
  get('cia-fao-example').onclick=()=>{field.value=EXAMPLE;invalidate('Exemple chargé. Clique sur « Vérifier les 2 opérations ».');};
  field.addEventListener('input',()=>invalidate('Commande modifiée : relance la vérification.'));
  get('cia-fao-check').onclick=()=>{try{
    const v=calc(field.value);draft=v;apply.disabled=false;
    show(`✓ 2 parcours calculés par COPO, non encore appliqués.\n1. Poche centrale ${fm(v.t.m.pocket.width)} × ${fm(v.t.m.pocket.height)} mm — profondeur ${fm(v.q.pocketDepth)} mm — ${Math.ceil(v.q.pocketDepth/v.q.pass)} passes, ${v.pocket.moves.length} mouvements.\n2. Quatre oblongs ${fm(v.t.m.hole.length)} × ${fm(v.t.m.hole.width)} mm — ${v.q.through?'TRAVERSANTS':('profondeur '+fm(v.t.depth)+' mm')} — ${Math.ceil(v.t.depth/v.q.pass)} passes, ${v.slots.moves.length} mouvements.\nFraise : ${v.t.tool.name} (Ø${fm(v.q.dia)} mm) ; passe ${fm(v.q.pass)} mm.\nParamètres enregistrés pour simulation : broche ${fm(v.t.tool.rpm)} tr/min, avance ${fm(v.t.tool.feed)} mm/min — NON VALIDÉS POUR LA MACHINE.\n${v.q.through?'⚠ Les oblongs atteignent Z = −'+fm(v.t.depth)+' mm (fond du brut). Pour une machine réelle, prévoir martyr et bridage adaptés.\n':''}Clique sur « Confirmer les 2 parcours » pour les intégrer au projet de simulation. Aucune commande machine.`);
  }catch(e){invalidate();show(e.message||String(e),true);}};
  get('cia-fao-apply').onclick=()=>{try{
    if(!draft)fail('Commence par vérifier les parcours.');
    if(draft.snapshot!==snapState())fail('Le projet a changé depuis l’analyse. Relance la vérification.');
    const parsed=parse(field.value);const cur=validate(parsed);
    if(cur.m.pocketId!==draft.t.m.pocketId||cur.m.holeIds.join('|')!==draft.t.m.holeIds.join('|'))fail('Les formes ont changé depuis le calcul.');
    const before=snapState();
    try{
      if(S.tps.length)fail('Un parcours existe déjà.');
      S.tps.push(draft.pocket,draft.slots);S.activeTp=draft.pocket.id;S.editTp=null;S.sel.clear();
      commit(false);gcDirty=true;renderTpList();setTab('parcours');draw();
    }catch(err){restore(before);throw err;}
    show(`✓ Deux parcours natifs ajoutés au projet COPO.\n1. Poche : ${draft.pocket.moves.length} mouvements.\n2. Quatre oblongs : ${draft.slots.moves.length} mouvements.\nOuvre « Simulation de l’usinage » pour observer leur exécution successive.\nEnregistre le projet en .copo pour conserver les deux opérations.\n⚠ SIMULATION SEULEMENT : zéro pièce/machine, bridage, martyr, outil, matière, avance, vitesses et postprocesseur non validés. NE PAS exécuter de G-code.`);
    invalidate();
  }catch(e){invalidate();show(e.message||String(e),true);}};
  // API FAO structurée et contrôlée, exclusivement pour les simulations du dialogue 0.5.
  // Cette voie ne transforme jamais une phrase reçue de l'IA en code exécutable.
  function calcStructured(input) {
    const q={pocket:input.pocket===true,slots:input.slots===true,
      pocketDepth:Number(input.pocketDepth),slotDepth:input.slotsDepth==null?null:Number(input.slotsDepth),
      through:input.slotsThrough===true,dia:Number(input.toolDiameter),pass:Number(input.pass)};
    if(!q.pocket&&!q.slots)fail('Aucune opération à simuler : précise poche et/ou oblongs.');
    const m=prepared(q.slots);
    if(!Number.isFinite(q.dia)||q.dia<=0||q.dia>50)fail('Diamètre de fraise invalide.');
    if(!Number.isFinite(q.pass)||q.pass<.1||q.pass>5)fail('Passe invalide (entre 0,1 et 5 mm).');
    if(q.pocket){
      if(!Number.isFinite(q.pocketDepth)||q.pocketDepth<=0||q.pocketDepth>=S.stock.t)fail('Profondeur de poche incorrecte par rapport au brut.');
      if(Math.abs(q.pocketDepth-Number(m.pocket.depth))>.001)fail('La profondeur de poche demandée diffère de la géométrie COPO-IA. Modifie d’abord le dessin.');
      if(q.pass>q.pocketDepth)fail('La passe dépasse la profondeur de poche.');
    }
    let slotDepth=null;
    if(q.slots){
      slotDepth=q.through?Number(S.stock.t):q.slotDepth;
      if(!(slotDepth>0&&slotDepth<=Number(S.stock.t)))fail('Profondeur des oblongs absente ou invalide.');
      if(q.pass>slotDepth)fail('La passe dépasse la profondeur des oblongs.');
      if(!q.through&&q.slotDepth==null)fail('Précise la profondeur des oblongs non traversants.');
    }
    const tool=S.tools.find(t=>t.type==='flat'&&Math.abs(Number(t.dia)-q.dia)<.01);
    if(!tool)fail(`Fraise droite Ø${fm(q.dia)} mm absente de la bibliothèque COPO.`);
    if(![tool.feed,tool.plunge,tool.rpm].every(v=>Number.isFinite(+v)&&+v>0))fail('Paramètres de fraise incomplets.');
    if(q.pocket&&!(q.dia<Math.min(m.pocket.width,m.pocket.height)))fail('Fraise trop grosse pour la poche.');
    if(q.slots&&!(q.dia<m.hole.width))fail('Fraise trop grosse pour la largeur des oblongs.');
    const radius=q.dia/2,paths=[];
    if(q.pocket){
      const obj=tpOf({tool},`Poche centrale ${fm(q.pocketDepth)} mm`,[m.pocketId],q.pocketDepth,q.pass);
      obj.name=obj.name.replace('COPO-IA 0.4', 'COPO-IA 0.5');
      computeTP(obj);
      const b=bboxOf(m.pocketId);
      checkMoves(obj,q.pocketDepth,radius,(x,y,R,tol)=>x>=b.x0+R-tol&&x<=b.x1-R+tol&&y>=b.y0+R-tol&&y<=b.y1-R+tol);
      if(obj.warns?.length)fail('COPO signale un problème de poche : '+obj.warns.join(' ; '));
      paths.push(obj);
    }
    if(q.slots){
      const obj=tpOf({tool},`4 oblongs ${q.through?'traversants':fm(slotDepth)+' mm'}`,m.holeIds,slotDepth,q.pass);
      obj.name=obj.name.replace('COPO-IA 0.4', 'COPO-IA 0.5');
      obj.p.strategy='raster';obj.p.rasterAng=0;
      computeTP(obj);
      const boxes=m.holeIds.map(bboxOf);
      checkMoves(obj,slotDepth,radius,(x,y,R,tol)=>boxes.some(b=>{
        const y0=(b.y0+b.y1)/2,r0=(b.y1-b.y0)/2,x0=b.x0+r0,x1=b.x1-r0;
        return Math.hypot(x-Math.max(x0,Math.min(x1,x)),y-y0)<=r0-R+tol;
      }));
      if(obj.warns?.length)fail('COPO signale un problème sur les oblongs : '+obj.warns.join(' ; '));
      paths.push(obj);
    }
    return {q,paths,meta:m,tool,snapshot:snapState()};
  }
  function applyStructured(calcResult){
    if(!calcResult||!calcResult.paths?.length)fail('Aucun parcours vérifié.');
    if(calcResult.snapshot!==snapState())fail('Le projet a changé depuis le calcul. Relance la vérification.');
    if(S.tps.length)fail('Des parcours sont déjà présents : remplacement non préparé.');
    const before=snapState();
    try{
      S.tps.push(...calcResult.paths);S.activeTp=calcResult.paths[0].id;S.editTp=null;S.sel.clear();
      commit(false);gcDirty=true;renderTpList();setTab('parcours');draw();
    }catch(e){restore(before);throw e;}
    return calcResult.paths.length;
  }
  window.COPO_IA_FAO_TEST={version:'0.7.2',parse,prepared,validate,calc,calcStructured,applyStructured,EXAMPLE};
})();
