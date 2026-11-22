/*
 * COPO-IA 0.7 BÊTA — portage expérimental sur COPO 1.415
 * Copyright (C) 2026. Redistribution sous GNU GPL v3 ou ultérieure.
 * Dessin et édition par ce module ; la FAO de simulation est dans copo-fao.js.
 * Aucune exportation ni envoi de G-code par l'extension.
 * Echange ChatGPT manuel : aucune API, aucun serveur, aucune cle.
 */
(() => {
 'use strict';
 const css = `
#cia-launch{position:fixed;right:19px;bottom:18px;z-index:37;border:1px solid #5d96ed;background:#1d4f86;color:white;box-shadow:0 5px 20px #0005;padding:10px 15px;border-radius:99px;font:600 13px system-ui,sans-serif;cursor:pointer}
#cia-root{position:fixed;right:18px;bottom:68px;z-index:38;width:min(430px,calc(100vw - 36px));max-height:min(720px,calc(100vh - 105px));display:none;flex-direction:column;border:1px solid #4d6a89;background:#1e2630;color:#f1f6ff;border-radius:12px;box-shadow:0 12px 44px #0008;font:13px/1.45 system-ui,sans-serif;overflow:hidden}
#cia-root.cia-open{display:flex}#cia-root *{box-sizing:border-box}#cia-root .cia-head{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#233851;padding:11px 13px;border-bottom:1px solid #45566d}
#cia-root .cia-head strong{font-size:15px}#cia-root .cia-flag{font:600 10px system-ui;background:#41536a;color:#d5e6ff;border-radius:12px;padding:3px 7px;white-space:nowrap}
#cia-root .cia-body{padding:13px;display:grid;grid-auto-rows:max-content;gap:10px;min-height:0;overflow-x:hidden;overflow-y:auto}#cia-root p{margin:0;color:#c5d2e1}#cia-root label{font-weight:600}
#cia-root textarea{width:100%;min-height:88px;max-height:165px;padding:10px;background:#111923;border:1px solid #6c819a;border-radius:7px;color:white;font:13px/1.45 system-ui;resize:vertical}
#cia-root input[type=password]{width:100%;padding:9px;background:#111923;border:1px solid #6c819a;border-radius:7px;color:white;font:13px system-ui}
#cia-root button{cursor:pointer;border:1px solid #6785a6;color:#fff;border-radius:7px;background:#33475b;padding:8px 10px;font:600 12px system-ui}#cia-root button:disabled{opacity:.42;cursor:not-allowed}
#cia-root button.cia-primary{background:#235a91;border-color:#67b1ff}#cia-root button.cia-plain{padding:4px 9px;background:transparent}
#cia-root .cia-actions{display:flex;gap:6px;flex-wrap:wrap}#cia-root .cia-report{border:1px solid #536b80;background:#17212d;padding:10px;border-radius:8px;white-space:pre-line;overflow-wrap:anywhere;min-height:55px;height:auto;color:#dfe9f9}
#cia-root .cia-report.cia-error{border-color:#b87070;color:#ffd7d7}#cia-root .cia-note{font-size:11px;color:#b8c8da}#cia-root .cia-divider{border-top:1px solid #425064}
#cia-root #cia-config-panel{border:1px solid #536b80;padding:10px;border-radius:8px;display:grid;gap:8px}#cia-root [hidden]{display:none!important}
@media(max-width:700px){#cia-root{bottom:62px;max-height:73vh}}
 `;
 const style=document.createElement('style'); style.textContent=css;document.head.appendChild(style);
 const wrap=document.createElement('div');wrap.innerHTML=`
<button id="cia-launch" data-notr type="button" aria-controls="cia-root" aria-expanded="false">✦ Assistant COPO-IA</button>
<section id="cia-root" data-notr role="region" aria-label="Assistant COPO-IA">
 <header class="cia-head"><strong>COPO-IA · Dessin, modifications & FAO</strong><span class="cia-flag">VERSION 1.0 BÊTA</span><button class="cia-plain" id="cia-close" type="button" aria-label="Fermer">×</button></header>
 <div class="cia-body">
  <p>Passerelle ChatGPT : crée et modifie des formes <b>indépendantes</b> (contours, cercles, oblongs, polygones). Les démonstrations locales de plaques restent disponibles. Unités : mm.</p>
  <label for="cia-prompt">Ta demande</label>
  <textarea id="cia-prompt" spellcheck="true" aria-label="Demande locale à analyser, vide par défaut"></textarea>
  <div class="cia-note">Zone locale facultative : un champ vide ne contient aucune instruction. Pour discuter avec ChatGPT, utilise la section « Passerelle ChatGPT ».</div>
  <div class="cia-actions"><button id="cia-ex-create" type="button">Exemple : créer</button><button id="cia-ex-edit" type="button">Exemple : modifier</button><button id="cia-read" type="button">Lire le dessin</button><button id="cia-clear-all" type="button">Vider tous les champs</button></div>
  <div class="cia-actions"><button id="cia-parse" type="button">Analyser (local)</button><button id="cia-apply" type="button" class="cia-primary" disabled>Appliquer dans COPO</button></div>
  <div id="cia-report" class="cia-report" role="status" aria-live="polite">Clique sur « Lire le dessin » pour voir ce que COPO contient.</div>
  <div class="cia-actions"><button id="cia-save" type="button">Enregistrer .copo</button><button id="cia-open" type="button">Ouvrir .copo</button><button id="cia-new" type="button">Nouveau projet vide</button></div>
  <div class="cia-divider"></div>
  <div class="cia-note">Passerelle ChatGPT : communication par copier-coller, sans clé API, logiciel externe ni frais supplémentaires liés à COPO-IA.</div>
  <div class="cia-note">Les modifications sont prévisualisées en texte et exigent ton clic pour être appliquées. L’édition locale classique protège les projets contenant des parcours ; le dialogue 0.5 peut proposer leur remplacement après confirmation et contrôles. Les profondeurs de poche sont des <b>notes de projet</b>, pas des usinages. Les parcours FAO éventuels sont uniquement destinés à la simulation. Ne jamais exécuter de G-code non vérifié.</div>
 </div>
</section>`;
 document.body.append(...wrap.children);
 const el=id=>document.getElementById(id);
 const launch=el('cia-launch'),root=el('cia-root'),prompt=el('cia-prompt'),report=el('cia-report'),applyButton=el('cia-apply');
 let preview=null;
 function show(v){root.classList.toggle('cia-open',v);launch.setAttribute('aria-expanded',String(v));if(v)prompt.focus();}
 launch.addEventListener('click',()=>show(!root.classList.contains('cia-open')));
 el('cia-close').addEventListener('click',()=>show(false));
 const norm=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[×✕]/g,'x').replace(/[øØ]/g,'diametre ').replace(/\s+/g,' ').trim();
 const n=v=>Number(String(v).replace(',','.'));
 const nice=v=>String(Number(Number(v).toFixed(3))).replace('.',',');
 const fail=t=>{throw new Error(t);};
 const value=(v,name,low=0.01,high=5000)=>{const x=Number(v);if(v==null||!Number.isFinite(x)||x<low||x>high)fail(`${name} : nombre invalide ou hors limites (${low} à ${high} mm).`);return x;};
 function setReport(m,bad=false){report.textContent=m;report.classList.toggle('cia-error',bad);}
 function invalidate(){preview=null;applyButton.disabled=true;}
 prompt.addEventListener('input',()=>{invalidate();setReport('Demande modifiée. Clique sur « Analyser (local) ».');});
 // La lecture utilise les véritables objets du document COPO.
 function checkLoaded(){if(typeof S==='undefined'||typeof mkShape!=='function'||typeof commit!=='function'||typeof snapState!=='function')fail('COPO n’est pas encore chargé. Recharge la page.');}
 function bb(s){return bbox([s]);}
 function rect(s){return !!(s&&s.closed&&s.nodes.length===4&&s.nodes.every(q=>!q.i&&!q.o));}
 function circle(s){if(!s||!s.closed||s.nodes.length!==4||!s.nodes.some(q=>q.i||q.o))return false;const b=bb(s);return b.w>0&&Math.abs(b.w-b.h)<Math.max(.1,b.w*.01);}
 function shape(id){return S.shapes.find(s=>s.id===id);}
 function managed(){
   checkLoaded();
   const m=S.meta&&S.meta.copoIA;
   if(m&&m.version===2&&m.contourId){
     const ids=[m.contourId,...(m.holeIds||[]),...(m.pocketId?[m.pocketId]:[])];
     if(ids.length===S.shapes.length&&ids.every(id=>shape(id))&&rect(shape(m.contourId))) {
       const b=bb(shape(m.contourId));
       return {source:'COPO-IA 0.2',x:b.x0,y:b.y0,w:b.w,h:b.h,contourId:m.contourId,holeIds:[...(m.holeIds||[])],hole:m.hole||null,pocketId:m.pocketId||null,pocket:m.pocket||null,stockFull:Math.abs(S.stock.w-b.w)<.1&&Math.abs(S.stock.h-b.h)<.1};
     }
     return null; // Méta présente, mais les formes ont été modifiées manuellement.
   }
   // Récupération prudente d'une plaque issue du prototype v0.1.
   const rs=S.shapes.filter(rect),cs=S.shapes.filter(circle);
   if(!rs.length||rs.length>2||(cs.length!==0&&cs.length!==4)||rs.length+cs.length!==S.shapes.length)return null;
   const contour=rs.slice().sort((a,b)=>bb(b).w*bb(b).h-bb(a).w*bb(a).h)[0];
   const b=bb(contour),pocketShape=rs.find(s=>s!==contour);
   if(pocketShape){const p=bb(pocketShape);if(!(p.x0>=b.x0&&p.y0>=b.y0&&p.x1<=b.x1&&p.y1<=b.y1))return null;}
   let hole=null;
   if(cs.length===4){
     const c=cs.map(s=>{const d=bb(s);return {x:(d.x0+d.x1)/2,y:(d.y0+d.y1)/2,d:d.w};});
     const dia=c[0].d, xs=c.map(q=>q.x),ys=c.map(q=>q.y),mx=Math.min(...xs)-b.x0,my=Math.min(...ys)-b.y0;
     const corners=[[b.x0+mx,b.y0+my],[b.x1-mx,b.y0+my],[b.x0+mx,b.y1-my],[b.x1-mx,b.y1-my]];
     const ok=Math.abs(mx-my)<.15&&c.every(q=>Math.abs(q.d-dia)<.15&&corners.some(([x,y])=>Math.hypot(q.x-x,q.y-y)<.2));
     if(!ok)return null;
     hole={mode:'round',diameter:dia,margin:mx};
   }
   return {source:'COPO 0.1 ou dessin simple',x:b.x0,y:b.y0,w:b.w,h:b.h,contourId:contour.id,holeIds:cs.map(s=>s.id),hole,pocketId:pocketShape?pocketShape.id:null,pocket:pocketShape?{width:bb(pocketShape).w,height:bb(pocketShape).h,depth:null}:null,stockFull:Math.abs(S.stock.w-b.w)<.1&&Math.abs(S.stock.h-b.h)<.1};
 }
 function context(){checkLoaded();const m=managed();return {shapeCount:S.shapes.length,tpCount:S.tps.length,stock:{width:S.stock.w,height:S.stock.h,thickness:S.stock.t},managed:m?{width:m.w,height:m.h,holes:m.hole,pocket:m.pocket,stockFull:m.stockFull}:null,editable:!!m&&S.tps.length===0&&S.dims.length===0&&S.images.length===0&&(!S.relief||S.relief.items.length===0)};}
 function describe(){
  checkLoaded();const c=context(),m=managed();
  let t=`Dessin COPO : ${c.shapeCount} forme(s) ; ${c.tpCount} parcours d'outil.\nBrut : ${nice(S.stock.w)} × ${nice(S.stock.h)} × ${nice(S.stock.t)} mm.`;
  if(m){t+=`\nPlaque reconnue (${m.source}) : ${nice(m.w)} × ${nice(m.h)} mm.`;
   if(m.hole){const h=m.hole;t+=h.mode==='round'?`\n4 trous ronds Ø${nice(h.diameter)} mm, centres à ${nice(h.margin)} mm des bords.`:`\n4 trous oblongs ${nice(h.length)} × ${nice(h.width)} mm, orientation horizontale, centres à ${nice(h.margin)} mm des bords.`;}
   if(m.pocket)t+=`\nPoche géométrique centrale : ${nice(m.pocket.width)} × ${nice(m.pocket.height)} mm${m.pocket.depth?' ; profondeur prévue '+nice(m.pocket.depth)+' mm (non usinée)':''}.`;
   t+=c.editable?'\n✓ Dessin modifiable par COPO-IA.':'\n⚠ Édition IA interdite tant que des parcours ou éléments liés existent.';
  }else if(c.shapeCount)t+='\nDessin non reconnu comme une plaque COPO-IA : lecture possible, mais modification automatique refusée.';
  else t+='\nLe projet est vide : tu peux créer une plaque.';
  return t+'\nAucun G-code créé par l’assistant.';
 }
 function localPlan(text){
  const s=norm(text);if(!s)fail('Écris une demande.');
  if(/(?:oblong|lumiere)/.test(s)&&/vertical|rotation|incline|inclinaison/.test(s))fail('Cette version ne crée que des trous oblongs horizontaux. Précise une géométrie prise en charge.');
  if(/^(decris|resume|lis|lire|que vois|qu.y a|analyse le dessin|montre les cotes)/.test(s))return {action:'read'};
  const create=/\b(cree|creer|dessine|dessiner|nouveau)\b/.test(s)&&/\b(rectangle|plaque|panneau|brut)\b/.test(s);
  const action=create?'create':'edit';
  let cd=null;
  const dm=s.match(/(?:rectangle|plaque|panneau|brut)[^\d]{0,44}(\d+(?:[.,]\d+)?)\s*(?:mm\s*)?[x*]\s*(\d+(?:[.,]\d+)?)/) || s.match(/(?:dimensions?|taille)\s*(?:a|de)?\s*(\d+(?:[.,]\d+)?)\s*[x*]\s*(\d+(?:[.,]\d+)?)/);
  if(dm)cd={width:n(dm[1]),height:n(dm[2])};
  if(action==='create'&&!cd)fail('Commence par « Crée une plaque de 150 x 100 mm ».');
  let thick=null;
  const tm=s.match(/(?:epaisseur|epais)\s*(?:du brut\s*)?(?:a|de|=)?\s*(\d+(?:[.,]\d+)?)/);
  if(tm)thick=n(tm[1]);
  let holes=null;
  const mentionsH=/\b(trous?|percages?|oblongs?|lumieres?)\b/.test(s);
  const four=/(?:4|quatre)\s+(?:trous?|percages?|oblongs?|lumieres?)/.test(s);
  if(mentionsH){
    if(/\b(supprime|retire|enleve)\b/.test(s)&&/\b(trous?|percages?|oblongs?|lumieres?)\b/.test(s))holes={mode:'remove'};
    else if(/\b(oblongs?|lumieres?)\b/.test(s)){
      const sm=s.match(/(?:oblongs?|lumieres?)[^\d]{0,36}(\d+(?:[.,]\d+)?)\s*(?:mm\s*)?[x*]\s*(\d+(?:[.,]\d+)?)/);
      if(!sm)fail('Dimensions manquantes pour les trous oblongs : précise leur longueur et leur largeur (ex. 16 x 8 mm).');
      holes={mode:'slot',length:n(sm[1]),width:n(sm[2])};
    }else {
      if(!four)fail('COPO-IA gère quatre trous identiques, pas d’autre quantité.');
      const hm=s.match(/(?:diametre|diam|\bd\s*=)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/) || s.match(/(?:trous?|percages?)\s+de\s+(\d+(?:[.,]\d+)?)\s*mm/);
      if(!hm)fail('Précise le diamètre des quatre trous : exemple « diamètre 8 mm ».');
      holes={mode:'round',diameter:n(hm[1])};
    }
    const mm=s.match(/(?:a|aux?)\s+(\d+(?:[.,]\d+)?)\s*mm\s+des?\s+bords?/);
    if(mm&&holes&&holes.mode!=='remove')holes.margin=n(mm[1]);
  }
  let pocket=null;
  if(/\bpoche\b/.test(s)){
    if(/\b(supprime|retire|enleve)\s+(?:la\s+)?poche\b/.test(s))pocket={mode:'remove'};
    else{
      if(!/poche\s+centrale/.test(s))fail('Seule une « poche centrale » est prise en charge.');
      const pm=s.match(/poche[^\d]{0,42}(\d+(?:[.,]\d+)?)\s*(?:mm\s*)?[x*]\s*(\d+(?:[.,]\d+)?)/);
      if(!pm)fail('Précise les dimensions de la poche centrale, par exemple « poche centrale de 80 x 40 mm ».');
      const dep=s.match(/(?:profondeur|profond(?:eur)?)\s*(?:de|a|=)?\s*(\d+(?:[.,]\d+)?)/);
      pocket={mode:'add',width:n(pm[1]),height:n(pm[2]),depth:dep?n(dep[1]):null};
    }
  }
  if(action==='edit'&&!cd&&!holes&&!pocket&&thick==null)fail('Je n’ai reconnu aucune modification. Exemples : « Épaisseur 15 mm » ou « Ajoute une poche centrale de 80 x 40 mm ».');
  return {action,contour:cd,stock_thickness:thick,holes,pocket,stockFull:/\b(plaque|brut|panneau)\b/.test(s)&&action==='create'};
 }
 function validateTarget(raw){
  checkLoaded();if(!raw||!['create','edit','read','clarify'].includes(raw.action))fail('Instruction non reconnue.');
  if(raw.action==='read')return {action:'read'};
  if(raw.action==='clarify')fail(raw.question||'La demande manque de précisions.');
  if(S.stock.rotary&&S.stock.rotary.on)fail('Mode rotatif actif : désactive-le avant de dessiner.');
  if(S.tps.length)fail('Un ou plusieurs parcours d’usinage existent. Pour préserver ces parcours, COPO-IA refuse toute modification automatique.');
  const existing=managed();
  if(raw.action==='create'&&S.shapes.length)fail('Le projet contient déjà des formes. Pour créer une nouvelle plaque, commence un projet vide. Pour la pièce existante, demande une modification.');
  if(raw.action==='edit'&&!existing)fail('Aucune plaque COPO-IA reconnue. Pour modifier, charge un projet COPO-IA ou crée une plaque.');
  if(raw.action==='edit'&&(S.dims.length||S.images.length||(S.relief&&S.relief.items.length)))fail('Édition refusée : le dessin contient des éléments liés (cotes, images ou relief).');
  const base=existing;
  const p={action:raw.action,existing:base,w:null,h:null,thickness:null,hole:null,pocket:null,stockFull:raw.action==='create'?!!raw.stockFull:base.stockFull};
  p.w=value(raw.contour&&raw.contour.width!=null?raw.contour.width:base&&base.w,'Largeur du contour');
  p.h=value(raw.contour&&raw.contour.height!=null?raw.contour.height:base&&base.h,'Hauteur du contour');
  p.thickness=value(raw.stock_thickness!=null?raw.stock_thickness:raw.action==='create'?S.stock.t:S.stock.t,'Épaisseur',.1,1000);
  p.hole=base&&base.hole?{...base.hole}:null;
  const h=raw.holes;
  if(h&&h.mode&&h.mode!=='keep'){
    if(h.mode==='remove')p.hole=null;
    else if(h.mode==='round')p.hole={mode:'round',diameter:value(h.diameter,'Diamètre du trou'),margin:value(h.margin!=null?h.margin:p.hole&&p.hole.margin!=null?p.hole.margin:15,'Distance des centres aux bords')};
    else if(h.mode==='slot')p.hole={mode:'slot',length:value(h.length,'Longueur du trou oblong'),width:value(h.width,'Largeur du trou oblong'),margin:value(h.margin!=null?h.margin:p.hole&&p.hole.margin!=null?p.hole.margin:15,'Distance des centres aux bords')};
    else fail('Type de trou non pris en charge.');
  }
  p.pocket=base&&base.pocket?{...base.pocket}:null;
  const k=raw.pocket;
  if(k&&k.mode&&k.mode!=='keep'){
    if(k.mode==='remove')p.pocket=null;
    else if(k.mode==='add'||k.mode==='change'){
      const old=p.pocket||{};
      p.pocket={width:value(k.width!=null?k.width:old.width,'Largeur de poche'),height:value(k.height!=null?k.height:old.height,'Hauteur de poche'),depth:k.depth!=null?value(k.depth,'Profondeur prévue',.01,1000):old.depth||null};
    }else fail('Opération de poche non reconnue.');
  }
  if(p.pocket&&!(p.pocket.width<p.w&&p.pocket.height<p.h))fail('La poche doit tenir entièrement dans le contour.');
  if(p.pocket&&p.pocket.depth!=null&&p.pocket.depth>=p.thickness)fail('La profondeur de poche doit rester inférieure à l’épaisseur du brut.');
  if(p.hole){
    const r=p.hole.mode==='round'?p.hole.diameter/2:p.hole.width/2;
    if(p.hole.mode==='slot'&&p.hole.length<=p.hole.width)fail('Un trou oblong doit avoir une longueur strictement supérieure à sa largeur.');
    if(p.hole.margin<=0||p.hole.margin*2>=Math.min(p.w,p.h))fail('La distance des centres aux bords est incompatible avec la plaque.');
    const hx=p.hole.mode==='round'?r:p.hole.length/2;
    if(p.hole.margin<hx||p.hole.margin<r||p.w-p.hole.margin<hx||p.h-p.hole.margin<r)fail('Un trou dépasserait du contour. Augmente la marge ou réduis ses dimensions.');
    if(p.pocket){
      const px=(p.w-p.pocket.width)/2,py=(p.h-p.pocket.height)/2;
      for(const cx of [p.hole.margin,p.w-p.hole.margin])for(const cy of [p.hole.margin,p.h-p.hole.margin]){
        // Distance entre la poche et le segment central d'une capsule (ou un point pour un cercle).
        const seg=p.hole.mode==='slot'?(p.hole.length-p.hole.width)/2:0;
        const dx=Math.max(px-(cx+seg),0,(cx-seg)-(px+p.pocket.width));
        const dy=Math.max(py-cy,0,cy-(py+p.pocket.height));
        if(Math.hypot(dx,dy)<r-1e-8)fail('La poche recouperait un trou : modifie la poche, les trous ou leurs marges.');
      }
    }
  }
  p.stockW=p.stockFull?p.w:p.w+40;p.stockH=p.stockFull?p.h:p.h+40;
  p.x=p.stockFull?0:20;p.y=p.stockFull?0:20;
  if(raw.action==='edit'&&raw.contour&&raw.contour.width==null&&raw.contour.height==null)fail('Aucune nouvelle dimension de contour fournie.');
  if(raw.action==='edit'&&raw.contour&&!p.hole&&!p.pocket){} // modification de contour seule autorisée
  if(raw.action==='edit'&&raw.stock_thickness==null&&!h&&!k&&!raw.contour)fail('Aucune modification à appliquer.');
  return p;
 }
 function summary(p){
  if(p.action==='read')return describe();
  let t=`${p.action==='create'?'CRÉATION':'MODIFICATION'} — vérification avant application\nContour : ${nice(p.w)} × ${nice(p.h)} mm ; brut : ${nice(p.stockW)} × ${nice(p.stockH)} × ${nice(p.thickness)} mm.`;
  if(p.hole){t+=p.hole.mode==='round'?`\n4 trous Ø${nice(p.hole.diameter)} mm, centres à ${nice(p.hole.margin)} mm des bords.`:`\n4 trous oblongs ${nice(p.hole.length)} × ${nice(p.hole.width)} mm, horizontaux, centres à ${nice(p.hole.margin)} mm des bords.`;}
  if(p.pocket)t+=`\nPoche centrale ${nice(p.pocket.width)} × ${nice(p.pocket.height)} mm${p.pocket.depth!=null?' ; profondeur prévue '+nice(p.pocket.depth)+' mm':''}.`;
  return t+'\n\n⚠ Géométrie uniquement. La profondeur est une note ; aucun parcours ni G-code n’est généré.\nClique sur « Appliquer dans COPO » pour confirmer.';
 }
 function capsuleNodes(cx,cy,length,width){
  const r=width/2,half=(length-width)/2;
  const a=arcNodes([cx-half,cy],r,Math.PI/2,Math.PI); // bord gauche
  const b=arcNodes([cx+half,cy],r,3*Math.PI/2,Math.PI); // bord droit
  return [...a,...b]; // segments horizontaux entre les deux arcs
 }
 function apply(p){
  if(!p||p.action==='read')fail('Aucune modification à appliquer.');
  if(p.snapshot&&p.snapshot!==snapState())fail('Le dessin a changé depuis l’analyse : relance « Analyser ».');
  checkLoaded();const check=validateTarget({...p,contour:{width:p.w,height:p.h},stock_thickness:p.thickness,holes:p.hole,pocket:p.pocket?{mode:'change',...p.pocket}:null,stockFull:p.stockFull});
  // 'check' ré-évalue les contraintes sur l'état actuel ; le plan initial demeure la source des paramètres.
  void check;
  const before=snapState();
  try{
    const m=p.existing||null,ids=[];
    if(p.action==='edit'){
      const current=managed();if(!current||current.contourId!==m.contourId)fail('Le dessin a changé depuis l’analyse. Relance « Analyser ».');
    }
    S.stock.w=p.stockW;S.stock.h=p.stockH;S.stock.t=p.thickness;
    function upsert(id,nodes){let sh=id&&shape(id);if(sh){sh.nodes=nodes;sh.closed=true;refresh(sh);}else{sh=mkShape(nodes,true);if(!sh)fail('COPO a refusé une forme.');}ids.push(sh.id);return sh.id;}
    function remove(id){if(id){S.shapes=S.shapes.filter(sh=>sh.id!==id);S.sel.delete(id);}}
    const contourId=upsert(m&&m.contourId,rectNodes(p.x,p.y,p.x+p.w,p.y+p.h));
    const oldHoleIds=m?m.holeIds:[];let holeIds=[];
    if(p.hole){let j=0;for(const dx of [p.hole.margin,p.w-p.hole.margin])for(const dy of [p.hole.margin,p.h-p.hole.margin]){
      const cx=p.x+dx,cy=p.y+dy;
      const nodes=p.hole.mode==='round'?ellipseNodes([cx,cy],p.hole.diameter/2,p.hole.diameter/2):capsuleNodes(cx,cy,p.hole.length,p.hole.width);
      holeIds.push(upsert(oldHoleIds[j++]||null,nodes));
    }}
    for(const id of oldHoleIds.slice(holeIds.length))remove(id);
    let pocketId=null;
    if(p.pocket){const x=p.x+(p.w-p.pocket.width)/2,y=p.y+(p.h-p.pocket.height)/2;pocketId=upsert(m&&m.pocketId,rectNodes(x,y,x+p.pocket.width,y+p.pocket.height));}
    else if(m&&m.pocketId)remove(m.pocketId);
    S.meta=S.meta||{};S.meta.copoIA={version:2,contourId,holeIds,hole:p.hole,pocketId,pocket:p.pocket};
    if(typeof setTool==='function')setTool('select');
    S.sel.clear();ids.forEach(id=>S.sel.add(id));
    if(typeof syncStock==='function')syncStock();
    if(typeof pjSummary==='function')pjSummary();
    commit();renderSel();fit();draw();
    return ids.length;
  }catch(e){restore(before);throw e;}
 }
 function analyzeRaw(raw,origin){
  invalidate();try{const p=validateTarget(raw);if(p.action==='read'){setReport(describe());return;}preview=p;preview.snapshot=snapState();applyButton.disabled=false;setReport((origin?'Analyse IA :\n':'Analyse locale :\n')+summary(p));}
  catch(e){setReport(e.message,true);}
 }
 el('cia-parse').onclick=()=>{try{analyzeRaw(localPlan(prompt.value),false);}catch(e){invalidate();setReport(e.message,true);}};
 el('cia-read').onclick=()=>{invalidate();try{setReport(describe());}catch(e){setReport(e.message,true);}};
 el('cia-clear-all').onclick=()=>{if(typeof window.COPO_IA_CLEAR_FIELDS==='function')window.COPO_IA_CLEAR_FIELDS();else{prompt.value='';invalidate();setReport('Champ vidé. Le projet COPO est intact.');}};
 el('cia-ex-create').onclick=()=>{prompt.value='Crée une plaque de 150 x 100 mm, épaisseur 12 mm, avec quatre trous de diamètre 8 mm à 15 mm des bords.';invalidate();el('cia-parse').click();};
 el('cia-ex-edit').onclick=()=>{prompt.value='Remplace les quatre trous par des trous oblongs de 16 x 8 mm et ajoute une poche centrale de 80 x 40 mm, profondeur 5 mm. Épaisseur 15 mm.';invalidate();el('cia-parse').click();};
 el('cia-apply').onclick=()=>{if(!preview)return;try{
    const count=apply(preview);invalidate();setReport(`✓ ${count} forme(s) créées ou mises à jour dans COPO.\n${describe()}\n\nEnregistre le projet avec « Enregistrer .copo ».\nPour annuler : ⌘Z (Mac) ou Ctrl+Z.`);
  }catch(e){invalidate();setReport(e.message,true);}};
 el('cia-save').onclick=()=>{try{checkLoaded();projSave(false);}catch(e){setReport(e.message,true);}};
 el('cia-open').onclick=()=>{try{checkLoaded();projOpen();invalidate();setReport('Une fois le fichier ouvert, clique sur « Lire le dessin ».');}catch(e){setReport(e.message,true);}};
 el('cia-new').onclick=()=>{
  try{checkLoaded();if(!confirm('Créer un projet vide ? Tout projet non enregistré sera perdu. Enregistre-le avant de continuer.'))return;
    act('new');act('new');invalidate();setReport('✓ Nouveau projet vide. Clique sur « Exemple : créer » puis « Appliquer dans COPO ».');}
  catch(e){setReport(e.message,true);}
 };
 // Exposé pour tests automatiques locaux ; aucune clé, aucun accès externe.
 window.COPO_IA_TEST={version:'0.8 BÊTA PASSERELLE',localPlan,validateTarget,context,describe,managed,apply,summary,snapshot:()=>snapState(),resetFields:()=>{prompt.value='';invalidate();setReport('Aucune demande locale. Le projet COPO est intact.');}};
})();
