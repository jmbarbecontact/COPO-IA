"""Test d'interface de l'aperçu 1.1.1 dans Chromium via page.set_content.
Ce test exerce la vraie passerelle et le vrai rendu SVG, avec APIs de calcul simulées.
Il ne constitue PAS une validation des vrais parcours de fraisage.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1440,'height':900})
 page.set_content('''<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body>
 <div id="cia-root" class="cia-open"><div class="cia-body"></div></div>
 </body></html>''')
 page.add_script_tag(content='''
 var S={stock:{w:260,h:200,t:12,originZ:'top'},tps:[],shapes:[],meta:{},tools:[],dims:[],images:[],relief:{items:[]}};
 function snapState(){return 'test-snapshot-unchanged';}
 window.COPO_IA_TEST={snapshot:()=> 'TEST_PROJECT_RAW',context:()=>({stock:{width:260,height:200,thickness:12}}),
 describe:()=> 'Projet test',managed:()=>null,resetFields:()=>{}};
 window.COPO_IA_FAO_TEST={};
 window.COPO_IA_FEATURES={state:()=>({items:[]})};
 ''')
 page.add_script_tag(content=(root/'copo-ia11.js').read_text())
 page.add_script_tag(content='''
 window.__applies=0;
 window.COPO_IA_11.analyze=()=>({snapshot:snapState(),summary:'Modifier oblong X 178 → 188 mm ; 1 parcours recalculé, 2 conservés.',
 preview:{before:{stock:{width:260,height:200,thickness:12},items:[
  {id:'oblong',name:'oblong',role:'pocket',geometry:{type:'slot',cx:178,cy:100,length:26,width:12,angle_deg:0}}]},
 after:{stock:{width:260,height:200,thickness:12},items:[
  {id:'oblong',name:'oblong',role:'pocket',geometry:{type:'slot',cx:188,cy:100,length:26,width:12,angle_deg:0}}]}}});
 window.COPO_IA_11.apply=()=>{window.__applies++;return {forms:1,paths:3,recalculated:1,preserved:2}};
 ''')
 page.add_script_tag(content=(root/'copo-dialogue.js').read_text())
 page.add_script_tag(content=(root/'copo-passerelle.js').read_text())
 signature=page.evaluate('window.COPO_IA_BRIDGE_TEST.signature()')
 page.locator('#cia-bridge-import').fill('''{"bridge":"COPO_CHATGPT_PLAN_V1","project_signature":"'''+signature+'''","plan":{"action":"project_11","project_11":{"order":"preserve"}}}''')
 page.locator('#cia-bridge-verify').click()
 assert page.locator('#cia11-preview-overlay').is_visible(), 'La fenêtre avant/après ne s’affiche pas'
 assert page.locator('#cia11-preview-overlay svg').count()==2, 'Deux panneaux SVG requis'
 assert page.locator('#cia11-preview-overlay').get_attribute('role')=='dialog'
 assert '178' in page.locator('.cia11-changes').inner_text() and '188' in page.locator('.cia11-changes').inner_text()
 assert page.locator('#cia-chat-apply').is_disabled(), 'Confirmer est actif avant validation de l’aperçu'
 assert page.evaluate('window.__applies')==0, 'Le projet a été modifié lors de Vérifier'
 page.locator('#cia11-preview-overlay .cia11-proceed').click()
 assert page.locator('#cia11-preview-overlay').count()==0
 assert page.locator('#cia-chat-apply').is_enabled()
 page.locator('#cia-chat-apply').click()
 assert page.evaluate('window.__applies')==1
 assert page.locator('#cia-chat-apply').is_disabled()
 # Nouvelle vérification : Annuler n'applique rien et interdit la confirmation.
 page.locator('#cia-bridge-verify').click()
 assert page.locator('#cia11-preview-overlay').is_visible()
 page.locator('#cia11-preview-overlay .cia11-actions button').first.click()
 assert page.locator('#cia11-preview-overlay').count()==0
 assert page.locator('#cia-chat-apply').is_disabled()
 assert page.evaluate('window.__applies')==1
 print('✓ Aperçu modal visible ; 2 SVG ; déplacement X mis en évidence')
 print('✓ Aucune application pendant Vérifier ; confirmation verrouillée avant examen')
 print('✓ Accepter débloque Confirmer ; Annuler empêche toute modification')
 browser.close()
