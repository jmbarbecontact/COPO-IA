/* COPO-IA 0.6 PASSERELLE — échange contrôlé avec ChatGPT. GNU GPL-3.0-or-later.
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
  <p><b>1.</b> Décris ta demande, copie le dossier du projet dans ChatGPT. <b>2.</b> Colle la commande JSON reçue ici, puis vérifie et confirme.</p>
  <label for="cia-bridge-request">Ce que tu souhaites demander à ChatGPT</label>
  <textarea id="cia-bridge-request" rows="3" spellcheck="true" placeholder="Agrandis la poche à 90 × 50 mm, puis recalcule les deux parcours avec une fraise Ø3,175 mm, passes de 1 mm."></textarea>
  <div class="cia-actions"><button type="button" id="cia-bridge-copy" class="cia-primary">Copier le projet pour ChatGPT</button><button type="button" id="cia-bridge-preview">Afficher le texte à copier</button></div>
  <textarea id="cia-bridge-export" rows="4" readonly spellcheck="false" hidden aria-label="Dossier du projet à copier"></textarea>
  <div class="cia-divider"></div>
  <label for="cia-bridge-import">Commande JSON préparée par ChatGPT</label>
  <textarea id="cia-bridge-import" rows="6" spellcheck="false" placeholder='{ "bridge": "COPO_CHATGPT_PLAN_V1", "project_signature": "…", "plan": { "action": "read" } }'></textarea>
  <div class="cia-actions"><button type="button" id="cia-bridge-verify" class="cia-primary">Vérifier la commande</button><button type="button" id="cia-bridge-reset">Effacer la commande</button></div>
  <div id="cia-bridge-status" class="cia-report" role="status" aria-live="polite">Aucune donnée envoyée automatiquement : tu décides ce que tu copies dans ChatGPT. Vérification et confirmation obligatoires.</div>
  <p class="cia-note">La commande doit correspondre à l'état exact du projet. Si le projet change, recopie son état et demande une nouvelle commande. Simulation uniquement ; aucun G-code validé pour la machine.</p>
 </details>`;
 root.querySelector('.cia-dialogue').after(sec);
 const style=document.createElement('style');style.textContent=`
 #cia-root .cia-bridge details>summary{font-size:14px;font-weight:700;cursor:pointer;color:#cbe5ff;padding:3px 0 9px}
 #cia-root .cia-bridge p{margin:5px 0 10px}
 #cia-root .cia-bridge label{display:block;margin:8px 0 5px}
 #cia-root #cia-bridge-export{max-height:180px;min-height:90px}
 #cia-root #cia-bridge-import{min-height:116px;max-height:235px}
 #cia-root .cia-bridge .cia-report{margin-top:8px}
 `;document.head.appendChild(style);
 const $=id=>document.getElementById(id),request=$('cia-bridge-request'),exportField=$('cia-bridge-export'),inField=$('cia-bridge-import'),status=$('cia-bridge-status');
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
 function exportText(){const project=currentContext(),s=signature(),requestText=request.value.trim();
  const context={bridge:'COPO_CHATGPT_PROJECT_V1',project_signature:s,request:requestText||'Décris le projet courant sans le modifier.',project,description:D.desc()};
  return `COPO-IA — DEMANDE À CHATGPT (copiée volontairement par l’utilisateur)\n\n${JSON.stringify(context,null,2)}\n\n`+
`INSTRUCTIONS POUR LA RÉPONSE :\n`+
`Analyse la demande en tenant compte uniquement des caractéristiques du projet ci-dessus. Les opérations prises en charge sont : lecture (read), création ou modification d'une plaque (geometry), préparation de FAO (fao), modification suivie d'un recalcul complet (revise), ou demande de précision (clarify).\n`+
`Si tu n'es pas certain de la sécurité ou des dimensions, utilise clarify et ne propose aucune modification. Ne crée ni G-code, ni code JavaScript.\n`+
`Réponds avec UN SEUL bloc JSON, selon ce contrat :\n`+
`{ "bridge": "COPO_CHATGPT_PLAN_V1", "project_signature": "${s}", "plan": { "action": "read", "message": "Description du projet" } }\n`+
`Pour geometry : plan.geometry = {action:"create"|"edit", contour:{width,height}|null, stock_thickness:number|null, stockFull:boolean, holes:{mode:"round"|"slot"|"remove",diameter?,length?,width?,margin?}|null, pocket:{mode:"add"|"change"|"remove",width?,height?,depth?}|null}.\n`+
`Pour fao : plan.cam = {pocket:boolean,slots:boolean,pocketDepth:number|null,slotsDepth:number|null,slotsThrough:boolean,toolDiameter:number,pass:number}.\n`+
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
  if(!['read','geometry','fao','revise','clarify'].includes(obj.plan.action))fail('Action inconnue. Aucun changement appliqué.');
  if(obj.plan.action==='clarify'){if(typeof obj.plan.message!=='string'||!obj.plan.message.trim())fail('La question de précision manque.');return obj.plan;}
  // No evaluation, direct DOM operations or G-code support; native validators are authoritative.
  return obj.plan;
 }
 $('cia-bridge-copy').addEventListener('click',async()=>{try{await copyOut();}catch(e){info(e.message,true);}});
 $('cia-bridge-preview').addEventListener('click',()=>{try{exportField.value=exportText();exportField.hidden=false;info('Dossier affiché. Utilise « Copier le projet pour ChatGPT » ou sélectionne et copie manuellement ce texte.');}catch(e){info(e.message,true);}});
 $('cia-bridge-verify').addEventListener('click',()=>{try{
  const plan=parsePlan(inField.value);D.analyze(plan,'ChatGPT');
  const mainReport=$('cia-chat-report');const isReadOnly=['read','clarify'].includes(plan.action);info((isReadOnly?'✓ Commande de lecture vérifiée : aucun changement à confirmer.':'✓ Format, signature et cohérence contrôlés. Lis la proposition ci-dessus dans « Dialogue et FAO ». Si elle est correcte, clique sur « Confirmer dans COPO ». Aucun changement n’a encore été appliqué.')+'\n\n'+(mainReport?.textContent||''));
  $('cia-dialogue-details').open=true;
 }catch(e){$('cia-chat-apply').disabled=true;info('Commande refusée : '+(e.message||String(e)),true);}});
 $('cia-bridge-reset').addEventListener('click',()=>{inField.value='';$('cia-chat-apply').disabled=true;info('Commande effacée. Le projet n’a pas été modifié.');});
 // Exposed for browser regression tests only: keeps the same verified path as UI.
 window.COPO_IA_BRIDGE_TEST={signature,exportText,parsePlan};
})();
