/* Contrôles statiques de compatibilité COPO 1.418 + syntaxe JS et ordre d'injection.
 * Pas un test d'exécution en navigateur (exécution sur Mac encore nécessaire).
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const acorn=require('../lib/acorn.min.js');
const dir=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
let total=0;
function check(label,fn){fn();console.log('✓',label);total++}
check('COPO natif identifié comme 1.418',()=>assert.match(html,/const COPO_VERSION = '1\.418'/));
check('Champ thClear 1.418 / calcul du filetage / sauvegarde',()=>{assert.match(html,/data-f="thClear"/);assert.match(html,/const j = Math\.max\(0, Math\.min\(P, \+p\.thClear/);assert.match(html,/thStarts: 1, thClear: 0/);assert.match(html,/thClear: Math\.max\(0, \+F\.thClear/)});
check('API COPO conservées',()=>{for(const name of ['function computeTP(', 'function mkShape(', 'const snapState =', 'function restore(', 'function refresh(', 'const newForm =', 'function commit('])assert(html.includes(name),name)});
check('Les huit modules intégrés dans le bon ordre et égaux aux sources séparées',()=>{
 const scripts=['copo-ia.js','copo-fao.js','copo-features.js','copo-fao-libre.js','copo-fao-multiformes.js','copo-ia11.js','copo-dialogue.js','copo-passerelle.js'];
 let pos=0;
 for(const file of scripts){
   const tag='<script data-copo-ia-module="'+file+'">';
   const index=html.indexOf(tag,pos);
   assert(index>pos,file+' : module intégré introuvable ou mal ordonné');
   const finish=html.indexOf('</script>',index+tag.length);
   assert(finish>index,file+' : fin manquante');
   const embedded=html.substring(index+tag.length,finish).trim();
   const separate=fs.readFileSync(path.join(dir,file),'utf8').trim();
   assert.equal(embedded,separate,file+' : les deux variantes divergent');
   pos=finish;
 }
});
check('Syntaxe JavaScript de tous les modules de l’extension',()=>{
 for(const fn of fs.readdirSync(dir).filter(f=>f.startsWith('copo-')&&f.endsWith('.js'))){acorn.parse(fs.readFileSync(path.join(dir,fn),'utf8'),{ecmaVersion:'latest',sourceType:'script'});}
});
check('Syntaxe des scripts natifs intégrés à index.html',()=>{
 const sections=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];assert(sections.length>0);
 for(const s of sections){if(s[1].trim())acorn.parse(s[1],{ecmaVersion:'latest',sourceType:'script',allowReturnOutsideFunction:true});}
});
check('Contrat project_11 disponible dans le dialogue et la passerelle',()=>{
 for(const filename of ['copo-dialogue.js','copo-passerelle.js'])assert(fs.readFileSync(path.join(dir,filename),'utf8').includes("'project_11'"),filename);
});
console.log(`${total} contrôles statiques réussis. Le contrôle navigateur indépendant reste requis.`);
