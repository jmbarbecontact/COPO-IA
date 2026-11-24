/* Controle statique du portage COPO 1.453 et COPO-IA 1.1.4.
 * Ne remplace pas un essai interactif dans Chrome ni une validation de G-code.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const acorn=require('../lib/acorn.min.js');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
let passed=0;
function ok(name,fn){fn();console.log('OK '+name);passed++;}
ok('Moteur officiel COPO 1.453',()=>assert.match(html,/const COPO_VERSION\s*=\s*['"]1\.453['"]/));
ok('Codec binaire des parcours 1.453',()=>{assert.match(html,/_mvb:\s*1/);assert.match(html,/const mvUnpack\s*=/);assert.match(html,/function tpPackAll\(/);assert.match(html,/function tpUnpackAll\(/);});
ok('Sauvegarde native 1.453',()=>{assert.match(html,/function projJSON\(/);assert.match(html,/function openProjectText\(/);assert.match(html,/function relRegenOld\(/);});
ok('Passerelle de sauvegarde COPO-IA',()=>{assert.match(html,/window\.COPO_IA_PROJECT_IO\s*=/);assert.equal((html.match(/async function projSave\(as\)/g)||[]).length,1);});
ok('APIs natives requises',()=>{for(const key of ['function computeTP(', 'function mkShape(', 'const snapState =', 'function restore(', 'function refresh(', 'const newForm =', 'function commit(']) assert(html.includes(key),key);});
ok('Huit modules COPO-IA integres et identiques aux fichiers sources',()=>{
 const files=['copo-ia.js','copo-fao.js','copo-features.js','copo-fao-libre.js','copo-fao-multiformes.js','copo-ia11.js','copo-dialogue.js','copo-passerelle.js'];
 let last=0;
 for(const file of files){const tag='<script data-copo-ia-module="'+file+'">', start=html.indexOf(tag,last);assert(start>last,'module '+file);const stop=html.indexOf('</script>',start+tag.length);assert(stop>start,'fin '+file);assert.equal(html.slice(start+tag.length,stop).trim(),fs.readFileSync(path.join(root,file),'utf8').trim(),file);last=stop;}
});
ok('Syntaxe JavaScript des modules et scripts HTML',()=>{
 for(const name of fs.readdirSync(root).filter(f=>f.startsWith('copo-')&&f.endsWith('.js'))) acorn.parse(fs.readFileSync(path.join(root,name),'utf8'),{ecmaVersion:'latest',sourceType:'script'});
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 assert(scripts.length>=9);
 for(const s of scripts) if(s[1].trim())acorn.parse(s[1],{ecmaVersion:'latest',sourceType:'script',allowReturnOutsideFunction:true});
});
ok('Passerelle project_11',()=>{for(const f of ['copo-dialogue.js','copo-passerelle.js']) assert(fs.readFileSync(path.join(root,f),'utf8').includes("'project_11'"),f);});
console.log(passed+' controles statiques reussis. Validation Mac/Chrome et CNC non effectuee.');
