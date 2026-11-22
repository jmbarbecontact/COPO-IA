/* COPO-IA 0.8 PASSERELLE — échange contrôlé avec ChatGPT. GNU GPL-3.0-or-later.
 * Aucune requête réseau, clé API, exécution de code fourni par le modèle, ou commande CNC.
 */
(() => {
 'use strict';
 const D=window.COPO_IA_DIALOGUE_TEST;
 const G=window.COPO_IA_TEST;
 const root=document.getElementById('cia-root');
 if(!D||!G||!root)return;
 const sec=document.createElement('section');
 sec.className='cia-bridge';
 sec.innerHTML=`<details id="cia-bridge-details" open>
  <summary>↔ Passerelle ChatGPT · gratuite</summary>
  <p><b>1.</b> Saisis ici ta demande en français (champ vide = aucune demande). <b>2.</b> Copie le dossier dans ChatGPT. <b>3.</b> Colle ici le JSON reçu, vérifie puis confirme.</p>
  <label for="cia-bridge-request">Ce que tu souhaites demander à ChatGPT</label>
  <textarea id="cia-bridge-request" rows="3" spellcheck="true" aria-label="Demande à ChatGPT, vide par défaut"></textarea>
  <div class="cia-actions"><button type="button" id="cia-bridge-copy" class="cia-primary">Copier le projet pour ChatGPT</button><button type="button" id="cia-bridge-preview">Afficher le texte à copier</button></div>
  <textarea id="cia-bridge-export" rows="4" readonly spellcheck="false" hidden aria-label="Dossier du projet à copier"></textarea>
  <div class="cia-divider"></div>
  <label for="cia-bridge-import">Commande JSON préparée par ChatGPT</label>
  <textarea id="cia-bridge-import" rows="6" spellcheck="false" aria-label="Commande JSON ChatGPT, vide par défaut"></textarea>
  <div class="cia-actions cia-main-actions"><button type="button" id="cia-bridge-verify" class="cia-primary">1 · Vérifier la commande</button><button type="button" id="cia-bridge-reset">Vider tous les champs</button></div>
  <div id="cia-bridge-phase" class="cia-note" role="status" aria-live="polite">Aucune commande vérifiée. La confirmation sera disponible ici après validation.</div>
  <div id="cia-bridge-status" class="cia-report" role="status" aria-live="polite">Aucune donnée envoyée automatiquement : tu décides ce que tu copies dans ChatGPT. Vérification et confirmation obligatoires.</div>
  <p class="cia-note">La commande doit correspondre à l'état exact du projet. Si le projet change, recopie son état et demande une nouvelle commande. Simulation uniquement ; aucun G-code validé pour la machine.</p>
 </details>`;
 root.querySelector('.cia-dialogue').before(sec);
 const style=document.createElement('style');style.textContent=`
 #cia-root .cia-bridge details>summary{font-size:14px;font-weight:700;cursor:pointer;color:#cbe5ff;padding:3px 0 9px}
 #cia-root .cia-bridge p{margin:5px 0 10px}
 #cia-root .cia-bridge label{display:block;margin:8px 0 5px}
 #cia-root #cia-bridge-export{max-height:180px;min-height:90px}
 #cia-root #cia-bridge-import{min-height:116px;max-height:235px}
 #cia-root .cia-bridge .cia-report{margin-top:8px}
 `;document.head.appendChild(style);
 const $=id=>document.getElementById(id),request=$('cia-bridge-request'),exportField=$('cia-bridge-export'),inField=$('cia-bridge-import'),status=$('cia-bridge-status');
 // Déplacer le VRAI bouton de confirmation du module historique, sans dupliquer sa logique ni son événement.
 const confirm=$('cia-chat-apply'),actions=$('cia-bridge-verify').parentElement,phase=$('cia-bridge-phase');
 if(!confirm)throw Error('Bouton natif de confirmation indisponible.');
 actions.insertBefore(confirm,$('cia-bridge-reset'));
 confirm.textContent='2 · Confirmer dans COPO';
 const setPhase=(value,bad=false)=>{phase.textContent=value;phase.classList.toggle('cia-error',!!bad);};
 confirm.addEventListener('click',()=>{ // L'implémentation du module Dialogue effectue toute mutation et désactive elle-même le bouton.
   const result=$('cia-chat-report')?.textContent||'';
   if(confirm.disabled){const ok=result.trim().startsWith('✓');setPhase(ok?'✓ Commande appliquée. Enregistre le fichier .copo pour conserver le résultat.':'Confirmation terminée : vérifie le message de COPO ci-dessous.',!ok);info(result,!ok);}
 });

 const fail=m=>{throw Error(m);};
 const info=(message,bad=false)=>{status.textContent=message;status.classList.toggle('cia-error',!!bad);};
 // Fingerprint of full COPO project data without leaking full internal state.
 function signature(){const src=G.snapshot();if(typeof src!=='string')fail('État interne COPO indisponible.');
  let a=2166136261,b=0x811c9dc5;for(let i=0;i<src.length;i++){
   const c=src.charCodeAt(i);a=Math.imul(a^c,16777619)>>>0;b=Math.imul(b^(c+(i&255)),2246822519)>>>0;
  }return a.toString(16).padStart(8,'0')+b.toString(16).padStart(8,'0');
 }
 const finite=(x)=>typeof x==='number'&&Number.isFinite(x);
 function currentContext(){const p=D.state();if(!p||!p.stock)fail('Le projet COPO n’est pas lisible.');return p;}
 function exportText(){const requestText=request.value.trim();if(!requestText)fail('La demande en français est vide. Écris ton instruction dans « Ce que tu souhaites demander à ChatGPT », puis copie le projet.');const project=currentContext(),s=signature();
  const context={bridge:'COPO_CHATGPT_PROJECT_V1',project_signature:s,request:requestText,project,description:D.desc()};
  return `COPO-IA — DEMANDE À CHATGPT (copiée volontairement par l’utilisateur)\n\n${JSON.stringify(context,null,2)}\n\n`+
`INSTRUCTIONS POUR LA RÉPONSE :\n`+
`Analyse la demande en tenant compte uniquement des caractéristiques du projet ci-dessus. Les opérations prises en charge sont : lecture (read), création ou modification d'une plaque (geometry), préparation de FAO historique (fao), modification suivie d'un recalcul complet (revise), ou formes libres indépendantes (features), FAO sur formes circulaires (feature_cam), FAO multi-géométrique (multi_cam), ou demande de précision (clarify).\n`+
`Si tu n'es pas certain de la sécurité ou des dimensions, utilise clarify et ne propose aucune modification. Ne crée ni G-code, ni code JavaScript.\n`+
`Réponds avec UN SEUL bloc JSON, selon ce contrat :\n`+
`{ "bridge": "COPO_CHATGPT_PLAN_V1", "project_signature": "${s}", "plan": { "action": "read", "message": "Description du projet" } }\n`+
`Pour geometry : plan.geometry = {action:"create"|"edit", contour:{width,height}|null, stock_thickness:number|null, stockFull:boolean, holes:{mode:"round"|"slot"|"remove",diameter?,length?,width?,margin?}|null, pocket:{mode:"add"|"change"|"remove",width?,height?,depth?}|null}.\n`+
`Pour fao : plan.cam = {pocket:boolean,slots:boolean,pocketDepth:number|null,slotsDepth:number|null,slotsThrough:boolean,toolDiameter:number,pass:number}.\n`+
`Pour features : plan.features = {stock?:{width,height,thickness},operations:[{action:"add"|"edit"|"remove",id:"IdentifiantStable",name?:"Nom",role?:"contour"|"hole"|"pocket"|"geometry",depth?:number,geometry?:{type:"rectangle",x,y,width,height}|{type:"rounded_rectangle",x,y,width,height,radius}|{type:"circle",cx,cy,diameter}|{type:"slot",cx,cy,length,width,angle_deg?}|{type:"polygon",points:[[x,y],...]}|{type:"circle_pattern",cx,cy,pcd,count,diameter,start_angle_deg?}}]}.\n`+
`Les opérations features utilisent des coordonnées absolues XY en mm depuis le coin inférieur gauche du brut. Les identifiants sont uniques et stables ; pour modifier, reprendre l'identifiant de l'état exporté. circle_pattern est autorisé uniquement avec action add et role hole ; il crée des identifiants suffixés -01, -02, etc. Aucun parcours FAO n'est automatiquement créé pour les formes libres. Ne pas mélanger features et geometry/fao/revise dans une même commande.\n`+
`Pour feature_cam (FAO libre 0.9) : plan.feature_cam = {replaceExisting:false,operations:[{id:"identifiant d'une forme circulaire de rôle hole",strategy:"pocket",depth:number,through:false,toolDiameter:number,pass:number}]}. Chaque profondeur est une valeur explicite, strictement inférieure à l'épaisseur du brut. Fraise droite obligatoirement présente dans toolLibrary et plus petite que le trou. Un parcours distinct par trou ; simulation uniquement. Si des parcours COPO-IA 0.9 existent, replaceExisting:true exige de réinclure TOUS les identifiants déjà usinés. Aucune FAO pour profils, polygones ou contours en 0.9.\n`+
`Pour multi_cam (FAO multi-géométrique 1.0) : plan.multi_cam = {replaceExisting:false,operations:[{id:"Identifiant de forme COPO-IA 0.8",strategy:"pocket"|"profile",depth:number,through:false,toolDiameter:number,pass:number,side?:"out"}]}. Pocket autorisé pour cercles, rectangles, rectangles arrondis et oblongs avec role hole/pocket ; profile autorisé seulement sur les contours rectangles, rectangles arrondis et polygones avec role contour et side:"out". Chaque profondeur DOIT rester strictement inférieure à l'épaisseur du brut ; profil extérieur uniquement en passe borgne, jamais traversant, avec une marge suffisante autour de la pièce. La fraise doit exister en bibliothèque. Aucun usinage de machine réelle. S'il existe des parcours COPO-IA, remplacer exige replaceExisting:true ET toutes les formes déjà usinées ; autrement refus. Ne mélange pas multi_cam avec les autres actions.\n`+
`Pour revise : plan.geometry ET plan.cam sont obligatoires ; recalculer TOUTES les opérations déjà présentes. Pour clarify : plan.message contient la question.\n`+
`Important : ne suppose pas qu'une fraise absente de la bibliothèque est disponible. Ne propose jamais une opération d'usinage non définie ou une profondeur traversante par défaut.`;
 }
 async function copyOut(){const text=exportText();exportField.value=text;exportField.hidden=false;
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);info('✓ Dossier copié. Reviens dans cette conversation ChatGPT et colle-le avec ⌘V.');return;}}
  catch(e){}exportField.focus();exportField.select();let copied=false;
  try{copied=document.execCommand('copy');}catch(e){}
  info(copied?'✓ Dossier copié. Colle-le dans ChatGPT avec ⌘V.':'Le texte est affiché et sélectionné : appuie sur ⌘C, puis colle-le dans ChatGPT.');
 }
 function parsePlan(raw){if(typeof raw!=='string'||!raw.trim())fail('Colle une commande JSON fournie par ChatGPT.');if(raw.length>50000)fail('Commande trop longue (limite : 50 000 caractères).');
  let text=raw.trim();const code=text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);if(code)text=code[1].trim();
  let obj;try{obj=JSON.parse(text);}catch{fail('Le JSON n’est pas valide. Copie uniquement le bloc JSON donné par ChatGPT, sans explications autour.');}
  if(!obj||typeof obj!=='object'||Array.isArray(obj)||obj.bridge!=='COPO_CHATGPT_PLAN_V1')fail('Ce texte n’est pas une commande COPO-IA compatible.');
  if(typeof obj.project_signature!=='string'||!/^[0-9a-f]{16}$/.test(obj.project_signature))fail('Signature du projet manquante ou incorrecte.');
  if(obj.project_signature!==signature())fail('Le projet a changé depuis son export. Copie de nouveau son état dans ChatGPT et demande une nouvelle commande.');
  if(!obj.plan||typeof obj.plan!=='object'||Array.isArray(obj.plan))fail('Le plan de modification est absent.');
  if(!['read','geometry','fao','revise','clarify','features','feature_cam','multi_cam'].includes(obj.plan.action))fail('Action inconnue. Aucun changement appliqué.');
  if(obj.plan.action==='clarify'){if(typeof obj.plan.message!=='string'||!obj.plan.message.trim())fail('La question de précision manque.');return obj.plan;}
  // No evaluation, direct DOM operations or G-code support; native validators are authoritative.
  return obj.plan;
 }
 $('cia-bridge-copy').addEventListener('click',async()=>{try{await copyOut();}catch(e){info(e.message,true);}});
 $('cia-bridge-preview').addEventListener('click',()=>{try{exportField.value=exportText();exportField.hidden=false;info('Dossier affiché. Utilise « Copier le projet pour ChatGPT » ou sélectionne et copie manuellement ce texte.');}catch(e){info(e.message,true);}});
 $('cia-bridge-verify').addEventListener('click',()=>{try{
  const plan=parsePlan(inField.value);D.analyze(plan,'ChatGPT');
  const mainReport=$('cia-chat-report');const isReadOnly=['read','clarify'].includes(plan.action);
  const message=mainReport?.textContent||'';
  info((isReadOnly?'✓ Lecture vérifiée : aucun changement à appliquer.':'✓ Proposition contrôlée. Lis les détails, puis utilise le bouton « 2 · Confirmer dans COPO » placé juste à côté de « Vérifier ».')+'\n\n'+message);
  setPhase(isReadOnly?'✓ Aucune confirmation nécessaire.':'✓ Commande vérifiée. Tu peux confirmer dans COPO si la proposition est correcte.');
 }catch(e){if(D.resetFields)D.resetFields();info('Commande refusée : '+(e.message||String(e)),true);setPhase('Commande refusée : aucune confirmation possible.',true);}});
 function clearFields(){
  // Ne modifie jamais les formes, le brut, la bibliothèque ni les parcours dans COPO.
  request.value='';inField.value='';exportField.value='';exportField.hidden=true;
  if(G.resetFields)G.resetFields();
  if(D.resetFields)D.resetFields();
  info('Tous les champs sont vides. Aucune commande en attente. Le projet COPO est intact.');setPhase('Aucune commande vérifiée. Le dessin est intact.');
 }
 window.COPO_IA_CLEAR_FIELDS=clearFields;
 $('cia-bridge-reset').addEventListener('click',clearFields);
 inField.addEventListener('input',()=>{if(D.resetFields)D.resetFields();setPhase('JSON modifié. Vérifie à nouveau avant toute confirmation.');});
 request.addEventListener('input',()=>{
  // Toute nouvelle demande invalide la réponse JSON éventuellement préparée précédemment.
  inField.value='';exportField.value='';exportField.hidden=true;
  if(D.resetFields)D.resetFields();
  info('Demande modifiée : exporte de nouveau le projet vers ChatGPT. L’ancienne réponse JSON a été effacée.');setPhase('Demande modifiée. Nouvelle vérification nécessaire.');
 });
 // Exposed for browser regression tests only: keeps the same verified path as UI.
 window.COPO_IA_BRIDGE_TEST={signature,exportText,parsePlan,clearFields};
})();
