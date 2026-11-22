/* COPO-IA 0.8 BÊTA — formes indépendantes, nommées et modifiables.
 * GNU GPL-3.0-or-later. Géométrie uniquement ; aucun G-code ni FAO automatique sur ces formes.
 * Toutes les mutations sont soumises à validation et confirmation manuelle.
 */
(() => {
 'use strict';
 const fail=m=>{throw new Error(m);};
 const isObj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 const clone=x=>JSON.parse(JSON.stringify(x));
 const v=(x,label,lo=.001,hi=5000)=>{
   if(typeof x!=='number'||!Number.isFinite(x)||x<lo||x>hi)fail(`${label} : valeur numérique hors limites (${lo} à ${hi} mm).`);
   return x;
 };
 const idCheck=x=>{if(typeof x!=='string'||!/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(x))fail('Identifiant requis : 1 à 40 caractères, lettres, chiffres, tiret ou souligné, en commençant par une lettre.');return x;};
 const roleCheck=r=>{if(!['contour','hole','pocket','geometry'].includes(r))fail('Rôle invalide. Utilise contour, hole, pocket ou geometry.');return r;};
 const meta=()=>S.meta&&S.meta.copoIAFeatures;
 const shapeBy=id=>S.shapes.find(s=>s.id===id);
 const round=x=>Math.round(x*1000000)/1000000;
 const point=(x,y)=>NODE(round(x),round(y));
 const rotate=(node,cx,cy,angle)=>{
   const a=angle*Math.PI/180,co=Math.cos(a),si=Math.sin(a),dx=node.x-cx,dy=node.y-cy;
   const r=clone(node);r.x=round(cx+dx*co-dy*si);r.y=round(cy+dx*si+dy*co);
   for(const k of ['i','o'])if(r[k]){const [hx,hy]=r[k];r[k]=[round(hx*co-hy*si),round(hx*si+hy*co)];}
   return r;
 };
 function geometryNodes(g,stock){
   if(!isObj(g)||typeof g.type!=='string')fail('Chaque forme doit préciser geometry.type.');
   let nodes=[];
   if(g.type==='rectangle'||g.type==='rounded_rectangle'){
     const x=v(g.x,'X du rectangle',0),y=v(g.y,'Y du rectangle',0),w=v(g.width,'Largeur'),h=v(g.height,'Hauteur');
     if(g.type==='rectangle')nodes=rectNodes(x,y,x+w,y+h);
     else{
       const r=v(g.radius,'Rayon de coin',.001,Math.min(w,h)/2);
       if(r>=Math.min(w,h)/2)fail('Le rayon de coin doit être strictement inférieur à la moitié de chaque côté.');
       nodes=[...arcNodes([x+w-r,y+r],r,-Math.PI/2,Math.PI/2),
              ...arcNodes([x+w-r,y+h-r],r,0,Math.PI/2),
              ...arcNodes([x+r,y+h-r],r,Math.PI/2,Math.PI/2),
              ...arcNodes([x+r,y+r],r,Math.PI,Math.PI/2)];
     }
   }else if(g.type==='circle'){
     const cx=v(g.cx,'Centre X du cercle',0),cy=v(g.cy,'Centre Y du cercle',0),dia=v(g.diameter,'Diamètre');
     nodes=ellipseNodes([cx,cy],dia/2,dia/2);
   }else if(g.type==='slot'){
     const cx=v(g.cx,'Centre X oblong',0),cy=v(g.cy,'Centre Y oblong',0),l=v(g.length,'Longueur oblong'),w=v(g.width,'Largeur oblong');
     if(l<=w)fail('Un oblong doit être plus long que large.');
     const angle=g.angle_deg===undefined?0:g.angle_deg;
     if(typeof angle!=='number'||!Number.isFinite(angle)||Math.abs(angle)>3600)fail('Angle oblong invalide.');
     const half=(l-w)/2,r=w/2;
     nodes=[...arcNodes([cx-half,cy],r,Math.PI/2,Math.PI),...arcNodes([cx+half,cy],r,3*Math.PI/2,Math.PI)].map(n=>rotate(n,cx,cy,angle));
   }else if(g.type==='polygon'){
     if(!Array.isArray(g.points)||g.points.length<3||g.points.length>64)fail('Polygone : de 3 à 64 sommets requis.');
     nodes=g.points.map((p,i)=>{
       if(!Array.isArray(p)||p.length!==2)fail('Chaque sommet doit être une paire [x,y].');
       return point(v(p[0],`X sommet ${i+1}`,0),v(p[1],`Y sommet ${i+1}`,0));
     });
     const signed=nodes.reduce((sum,p,i)=>{const q=nodes[(i+1)%nodes.length];return sum+p.x*q.y-q.x*p.y;},0)/2;
     if(Math.abs(signed)<.001)fail('Le polygone a une surface nulle.');
     const ccw=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
     const on=(a,b,c)=>Math.min(a.x,b.x)-1e-8<=c.x&&c.x<=Math.max(a.x,b.x)+1e-8&&Math.min(a.y,b.y)-1e-8<=c.y&&c.y<=Math.max(a.y,b.y)+1e-8;
     const segmentsCross=(a,b,c,d)=>{const ab=ccw(a,b,c),ad=ccw(a,b,d),ca=ccw(c,d,a),cb=ccw(c,d,b);
       if(ab*ad<0&&ca*cb<0)return true;
       return (Math.abs(ab)<1e-8&&on(a,b,c))||(Math.abs(ad)<1e-8&&on(a,b,d))||(Math.abs(ca)<1e-8&&on(c,d,a))||(Math.abs(cb)<1e-8&&on(c,d,b));
     };
     const n=nodes.length;
     for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
       if(j===i+1||(i===0&&j===n-1))continue;
       if(segmentsCross(nodes[i],nodes[(i+1)%n],nodes[j],nodes[(j+1)%n]))fail('Polygone auto-croisé : refuse la modification.');
     }
   }else fail(`Type de géométrie non pris en charge : ${g.type}.`);
   if(nodes.length<3)fail('Une forme fermée doit contenir au moins trois nœuds.');
   const temp=refresh({nodes:clone(nodes),closed:true});
   const b=bbox([temp]);
   if(b.x0<-1e-5||b.y0<-1e-5||b.x1>stock.width+1e-5||b.y1>stock.height+1e-5)
     fail(`La forme ${g.type} dépasse du brut ${stock.width} × ${stock.height} mm.`);
   if(!(b.w>.001&&b.h>.001))fail('Forme de dimensions nulles.');
   return nodes;
 }
 function measuredMatch(actual,expected){
   if(actual.length!==expected.length)return false;
   return actual.every((n,i)=>{
     const q=expected[i];
     if(Math.abs(n.x-q.x)>1e-4||Math.abs(n.y-q.y)>1e-4)return false;
     for(const k of ['i','o']){const a=n[k],b=q[k];if(!!a!==!!b)return false;
       if(a&&(!Number.isFinite(a[0])||!Number.isFinite(a[1])||Math.abs(a[0]-b[0])>1e-4||Math.abs(a[1]-b[1])>1e-4))return false;}
     return true;
   });
 }
 function current(){
   if(typeof S==='undefined'||typeof mkShape!=='function'||typeof snapState!=='function')fail('COPO n’est pas prêt.');
   const m=meta();
   if(!m)return null;
   if(m.version!==1||!Array.isArray(m.items)||m.items.length>150)fail('Métadonnées de formes COPO-IA incompatibles.');
   const seen=new Set(),shapeIds=new Set();
   for(const f of m.items){
     idCheck(f.id);
     if(seen.has(f.id)||shapeIds.has(f.shapeId))fail('Éléments COPO-IA dupliqués.');
     seen.add(f.id);shapeIds.add(f.shapeId);
     const sh=shapeBy(f.shapeId);
     if(!sh||!sh.closed)fail('Une forme COPO-IA a été supprimée ou modifiée hors de la passerelle.');
     const target=geometryNodes(f.geometry,{width:S.stock.w,height:S.stock.h});
     if(!measuredMatch(sh.nodes,target))fail('Une forme COPO-IA a été modifiée manuellement. Sauvegarde une copie et rétablis-la avant une édition automatique.');
   }
   if(S.shapes.length!==m.items.length)fail('Le dessin contient des formes non gérées : modification automatique refusée.');
   return clone(m.items);
 }
 function state(){
   const m=meta();
   let items=[],editable=false,reason='';
   try{const currentItems=current();items=currentItems||[];
     editable=!S.tps.length&&!S.dims.length&&!S.images.length&&(!S.relief||!S.relief.items.length)&&(!S.stock.rotary||!S.stock.rotary.on)&&(!S.shapes.length||!!m);
     if(!editable)reason='Projet avec éléments non gérés, relief, cotes ou parcours : édition libre désactivée.';
   }catch(e){reason=e.message;}
   return {version:1,editable,reason,items:items.map(f=>({id:f.id,name:f.name,role:f.role,geometry:f.geometry}))};
 }
 function analyze(plan){
   if(!isObj(plan)||!Array.isArray(plan.operations)||plan.operations.length<1||plan.operations.length>50)
     fail('Plan de formes : 1 à 50 opérations sont requises.');
   if(S.tps.length||S.dims.length||S.images.length||(S.relief&&S.relief.items.length)||S.stock.rotary?.on)
     fail('Projet avec parcours, cotes, image, relief ou mode rotatif : édition de géométrie refusée.');
   const old=current();
   if(!old&&S.shapes.length)fail('Le projet contient des formes antérieures. Pour la géométrie libre, commence un projet vide.');
   let stock={width:Number(S.stock.w),height:Number(S.stock.h),thickness:Number(S.stock.t)};
   if(plan.stock!==undefined){
     if(!isObj(plan.stock))fail('stock doit contenir width, height et thickness.');
     stock={width:v(plan.stock.width,'Largeur du brut'),height:v(plan.stock.height,'Hauteur du brut'),thickness:v(plan.stock.thickness,'Épaisseur du brut',.1,1000)};
   }
   let items=old?clone(old):[];
   const idMap=()=>new Map(items.map((f,i)=>[f.id,i]));
   const labels=[];
   for(const op of plan.operations){
     if(!isObj(op)||!['add','edit','remove'].includes(op.action))fail('Action de forme inconnue.');
     idCheck(op.id);
     if(op.action==='remove'){
       const pos=idMap().get(op.id);if(pos===undefined)fail(`Élément ${op.id} absent.`);
       items.splice(pos,1);labels.push(`Supprimer ${op.id}`);continue;
     }
     if(op.action==='add'&&isObj(op.geometry)&&op.geometry.type==='circle_pattern'){
       if(op.role!=='hole')fail('Un motif de perçages circulaires doit avoir role="hole".');
       const g=op.geometry,count=g.count;
       if(!Number.isInteger(count)||count<2||count>32)fail('Un motif doit comporter entre 2 et 32 cercles.');
       const cx=v(g.cx,'X du centre motif',0),cy=v(g.cy,'Y du centre motif',0),pcd=v(g.pcd,'Diamètre du cercle primitif'),dia=v(g.diameter,'Diamètre des trous');
       const start=g.start_angle_deg===undefined?0:g.start_angle_deg;
       if(typeof start!=='number'||!Number.isFinite(start)||Math.abs(start)>3600)fail('Angle de départ non valide.');
       for(let j=0;j<count;j++){
         const id=`${op.id}-${String(j+1).padStart(2,'0')}`;idCheck(id);
         if(idMap().has(id))fail(`Identifiant ${id} déjà présent.`);
         const ang=(start+j*360/count)*Math.PI/180;
         const geom={type:'circle',cx:round(cx+pcd/2*Math.cos(ang)),cy:round(cy+pcd/2*Math.sin(ang)),diameter:dia};
         geometryNodes(geom,stock);
         items.push({id,name:(op.name||op.id)+` ${j+1}`,role:'hole',geometry:geom,shapeId:null});
       }
       labels.push(`Créer motif ${op.id} (${count} cercles)`);continue;
     }
     const pos=idMap().get(op.id);
     if(op.action==='add'&&pos!==undefined)fail(`Identifiant ${op.id} déjà présent.`);
     if(op.action==='edit'&&pos===undefined)fail(`Élément ${op.id} inexistant : impossible de le modifier.`);
     const prev=pos===undefined?null:items[pos];
     const geometry=op.geometry===undefined?(prev?clone(prev.geometry):null):clone(op.geometry);
     if(!geometry)fail(`Géométrie manquante pour ${op.id}.`);
     geometryNodes(geometry,stock);
     const name=op.name===undefined?(prev?prev.name:op.id):op.name;
     if(typeof name!=='string'||!name.trim()||name.length>100)fail('Nom de forme invalide.');
     const role=roleCheck(op.role===undefined?(prev?prev.role:'geometry'):op.role);
     if(role==='pocket'&&op.depth!==undefined) v(op.depth,'Profondeur de poche',.01,1000);
     const depth=role==='pocket'?(op.depth===undefined?(prev?.depth??null):op.depth):null;
     if(depth!==null&&!(depth<stock.thickness))fail('La profondeur de poche doit rester inférieure à l’épaisseur du brut.');
     const item={id:op.id,name:name.trim(),role,geometry,depth,shapeId:prev?.shapeId||null};
     if(op.action==='add')items.push(item);else items[pos]=item;
     labels.push((op.action==='add'?'Créer ':'Modifier ')+op.id);
   }
   if(items.length>150)fail('Nombre maximal de formes COPO-IA : 150.');
   for(const it of items){geometryNodes(it.geometry,stock);if(it.role==='pocket'&&it.depth!=null&&it.depth>=stock.thickness)fail('La poche dépasse l’épaisseur du brut.');}
   return {stock,items,summary:`Brut : ${stock.width} × ${stock.height} × ${stock.thickness} mm.\n${labels.join('\n')}\nTotal après confirmation : ${items.length} forme(s).\nLes profondeurs de poche sont des notes ; AUCUNE FAO générée.`,snapshot:snapState()};
 }
 function apply(checked){
   if(!checked||checked.snapshot!==snapState())fail('Projet modifié depuis la vérification. Relance la vérification.');
   const before=snapState();
   try{
     current();
     const keep=new Set(checked.items.filter(i=>i.shapeId).map(i=>i.shapeId));
     S.shapes=S.shapes.filter(s=>keep.has(s.id));
     S.sel.clear();
     for(const item of checked.items){
       const nodes=geometryNodes(item.geometry,checked.stock);
       let shape=item.shapeId&&shapeBy(item.shapeId);
       if(shape){shape.nodes=nodes;shape.closed=true;refresh(shape);}
       else{shape=mkShape(nodes,true);if(!shape)fail('COPO a refusé la création d’une forme.');item.shapeId=shape.id;}
       S.sel.add(shape.id);
     }
     S.stock.w=checked.stock.width;S.stock.h=checked.stock.height;S.stock.t=checked.stock.thickness;
     S.meta=S.meta||{};S.meta.copoIAFeatures={version:1,items:clone(checked.items)};
     if(typeof syncStock==='function')syncStock();
     if(typeof pjSummary==='function')pjSummary();
     if(typeof setTool==='function')setTool('select');
     if(typeof renderSel==='function')renderSel();
     commit();fit();draw();
     return checked.items.length;
   }catch(e){restore(before);throw e;}
 }
 window.COPO_IA_FEATURES={version:'0.8 BÊTA',analyze,apply,state,geometryNodes};
})();
