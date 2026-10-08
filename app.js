let photos=[], currentOrderId=null; const ORDERS_KEY='dw_preview_orders_v3', MAT_KEY='dw_preview_materials_v3', SET_KEY='dw_preview_setup_v3';
const $=id=>document.getElementById(id), uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function read(k,f){try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}} function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
const defaultM=[['02 ATTIKA ABDECKUNG Aluminium','m'],['02 Alublech 0,7mm','m²'],['02 Alublech Anthrazit 0,7 mm','m²'],['02 Kehldichtstreifen','m'],['02 Kehlabdeckung Zinkblech','m'],['02 Zinkblech 0,7 mm','m²'],['03 Fallrohr Waschbär Abwehrschutz','Stück'],['03 Standrohr LORO X mit Klappe 1000 mm','Stück'],['03 Standrohr LORO X mit Klappe 2000 mm','Stück'],['03-LORO-X Rohrschelle','Stück'],['03 Zink Dachrinne 6-teilig','m'],['03 Zink Dachrinne komplett','m'],['03 Zink Dachrinneneisen','Stück'],['03 Zink Dachrinnenzubehör','Stück'],['03 Zink Fallrohr 100er','m'],['03 Zink Fallrohrschellen 100er','Stück'],['04 Kemperol 1K Flüssigkunststoff','kg'],['04 Kemperol 1K Grundierung','kg'],['04 Kemperol Notpflaster','Stück'],['04 Kemperol Vlies','m²'],['05 ALWITRA VGSK Evalon KS Bahnen','m²'],['05 ALWITRA Verbundblech Evalon','m'],['05 ALWITRA Wandanschlüsse','m'],['06 Allwetter Dichtmasse','Stück'],['06 Bitu-Dicht Spezial 310 ml Kartusche','Stück'],['06 Bornit Kaltspachtel','kg'],['06 Acryl','Stück'],['06 EPDM Notpflaster','Stück'],['06 IWETEC Alles Dicht','Stück'],['06 Wand-Kaminanschluss Band','m'],['07 Alu Wandanschlussschiene','m'],['07 Dachausstiegfenster','Stück'],['07 Fugendichtmasse','Stück'],['07 Kaminkopfabdeckung','Stück'],['07 Kaminsanierung komplett','Stück'],['07 Wand-Kaminanschlüsse erneuern','m'],['08 Antennenziegel Blei','Stück'],['08 Dachtritte aus verzinktem Stahl','m'],['08 Eternit Wabenziegel','Stück'],['08 Frankfurter Pfanne','Stück'],['08 Greaton Ziegel Harmonie','Stück'],['08 Jakobi Hohlpfanne','Stück'],['08 Lüftungsrohr auf Frankfurter Pfanne','Stück'],['08 Schiefer Schindeln','Stück'],['09 DACH Laubfang Gully 100er Edelstahl','Stück'],['09 DACH Laubfangkorb','Stück'],['09 DACH Laubstopp Dachrinnenschutz','Stück'],['09 Walz Blei','kg'],['10 Bitumen Voranstrich','Liter'],['10 Bitumenschweißbahn VEDAC PYE PV 200 S 5 EN','m²'],['11 Dachlatten F/T','m'],['11 Edelstahl Spengler Schrauben','Stück'],['12 ABS Dachsicherungshaken','Stück'],['12 Dachsicherungshaken','Stück']];
const defaultS=[['12 Hubsteiger Stunden','Stunden'],['12 Gerüst - Leihdauer 4 Wochen','m²'],['12 Rollgerüst','Stück'],['12 Bockgerüst','Stück'],['12 Dachbockgerüst','Stück']];
let materials=read(MAT_KEY,defaultM.map(x=>({id:uid(),name:x[0],unit:x[1]}))), setups=read(SET_KEY,defaultS.map(x=>({id:uid(),name:x[0],unit:x[1]}))), orders=read(ORDERS_KEY,[]);
function showView(n){document.querySelectorAll('.appview').forEach(v=>v.hidden=true);$('view-'+n).hidden=false;document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.view===n));if(n==='auftraege')renderOrders();if(n==='stammdaten'){renderMasters()}}
function nextNo(dateValue){let d=dateValue||new Date().toISOString().slice(0,10);let nums=orders.map(o=>String(o.auftragsnr||'')).filter(x=>x.startsWith(d+'-')).map(x=>parseInt(x.split('-').pop(),10)||0);return d+'-'+(Math.max(0,...nums)+1)}
function newOrder(){currentOrderId=null;resetForm();showView('auftrag')}
function resetForm(){['angebotsnr','kunde','kontakt','objekt','montageHinweis','fahrtKm','fahrtKosten','fahrtHinweis','arbeiten','signOrt'].forEach(i=>$(i).value='');let d=new Date().toISOString().slice(0,10);$('datum').value=d;$('auftragsnr').value=nextNo(d);$('terminArt').value='Montagetermin';$('montageDatum').value=d;$('montageZeit').value='08:00';$('signDatum').value=d;$('status').value='offen';$('addressStatus').textContent='';photos=[];renderPhotos();$('employeeRows').innerHTML='';addEmployeeRow();$('material').innerHTML='';addMaterial();$('baustellenkosten').innerHTML='';addSetupRow();clearSig('sigKunde');clearSig('sigFirma');updateLabel()}
function updateLabel(){let o=orders.find(x=>x.id===currentOrderId);$('currentOrderLabel').textContent=o?(o.auftragsnr+' · '+(o.kunde||o.objekt||'Auftrag')):'Neuer Auftrag'}
function input(ph,val,cls=''){let i=document.createElement('input');i.placeholder=ph;i.value=val||'';i.className=cls;return i}
function updateEmployeeSummary(){
  let total=0;
  document.querySelectorAll('#employeeRows .hours').forEach(x=>{
    const n=parseFloat(String(x.value||'').replace(',','.'));
    if(Number.isFinite(n)) total+=n;
  });
  const box=$('employeeSummary');
  if(box) box.textContent='Summe Arbeitsstunden: '+total.toFixed(2).replace('.',',')+' h';
}
function addEmployeeRow(d={}){
  let r=document.createElement('div');
  r.className='employee-row';
  r.innerHTML='<input placeholder="Mitarbeiter" class="ename" aria-label="Mitarbeiter"><input type="time" class="beg" aria-label="Beginn"><input type="time" class="end" aria-label="Ende"><input type="number" min="0" class="pause" placeholder="0" aria-label="Pause in Minuten"><input class="hours" readonly aria-label="Arbeitsstunden"><button type="button" aria-label="Mitarbeiter entfernen">×</button>';
  r.querySelector('.ename').value=d.name||'';
  r.querySelector('.beg').value=d.beg||'';
  r.querySelector('.end').value=d.end||'';
  r.querySelector('.pause').value=d.pause??'';
  let calc=()=>{
    let a=r.querySelector('.beg').value,b=r.querySelector('.end').value,p=Number(r.querySelector('.pause').value)||0;
    if(a&&b){
      let [ah,am]=a.split(':').map(Number),[bh,bm]=b.split(':').map(Number);
      let mins=(bh*60+bm)-(ah*60+am)-p;
      if(mins<0) mins+=1440;
      r.querySelector('.hours').value=(Math.max(0,mins)/60).toFixed(2).replace('.',',');
    } else r.querySelector('.hours').value='';
    updateEmployeeSummary();
  };
  r.querySelectorAll('input').forEach(x=>x.addEventListener('input',calc));
  r.querySelector('button').onclick=()=>{r.remove();updateEmployeeSummary()};
  $('employeeRows').appendChild(r);
  calc();
}
function addMaterial(d={}){let r=document.createElement('div');r.className='matrow';let sel=document.createElement('select');sel.innerHTML='<option value="">Material auswählen …</option>'+materials.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');sel.value=d.id||'';let q=input('Verbrauch',d.qty,'qty'),u=input('Einheit',d.unit,'unit');u.readOnly=true;sel.onchange=()=>{let m=materials.find(x=>x.id===sel.value);u.value=m?.unit||''};let b=document.createElement('button');b.type='button';b.textContent='×';b.onclick=()=>r.remove();r.append(sel,q,u,b);$('material').appendChild(r);if(d.id)sel.onchange()}
function addSetupRow(d={}){let r=document.createElement('div');r.className='setuprow';let sel=document.createElement('select');sel.innerHTML='<option value="">Position auswählen …</option>'+setups.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');sel.value=d.id||'';let q=input('Verbrauch',d.qty,'qty'),u=input('Einheit',d.unit,'unit');u.readOnly=true;sel.onchange=()=>{let m=setups.find(x=>x.id===sel.value);u.value=m?.unit||''};let b=document.createElement('button');b.type='button';b.textContent='×';b.onclick=()=>r.remove();r.append(sel,q,u,b);$('baustellenkosten').appendChild(r);if(d.id)sel.onchange()}
function addMaterialMaster(){materials.push({id:uid(),name:'',unit:'Stück'});write(MAT_KEY,materials);renderMasters()}
function addSetupMaster(){setups.push({id:uid(),name:'',unit:'Stück'});write(SET_KEY,setups);renderMasters()}
function renderMasters(){let mbox=$('materialMaster');mbox.innerHTML='';materials.forEach((m,i)=>{let r=document.createElement('div');r.className='masterrow';r.innerHTML='<input class="mname"><input class="munit"><button>×</button>';r.querySelector('.mname').value=m.name;r.querySelector('.munit').value=m.unit;r.querySelectorAll('input').forEach(x=>x.oninput=()=>{m.name=r.querySelector('.mname').value;m.unit=r.querySelector('.munit').value;write(MAT_KEY,materials)});r.querySelector('button').onclick=()=>{materials.splice(i,1);write(MAT_KEY,materials);renderMasters()};mbox.appendChild(r)});let sbox=$('setupMaster');sbox.innerHTML='';setups.forEach((m,i)=>{let r=document.createElement('div');r.className='masterrow';r.innerHTML='<input class="mname"><input class="munit"><button>×</button>';r.querySelector('.mname').value=m.name;r.querySelector('.munit').value=m.unit;r.querySelectorAll('input').forEach(x=>x.oninput=()=>{m.name=r.querySelector('.mname').value;m.unit=r.querySelector('.munit').value;write(SET_KEY,setups)});r.querySelector('button').onclick=()=>{setups.splice(i,1);write(SET_KEY,setups);renderMasters()};sbox.appendChild(r)})}
function collect(){return{id:currentOrderId||uid(),auftragsnr:$('auftragsnr').value,angebotsnr:$('angebotsnr').value,kunde:$('kunde').value,kontakt:$('kontakt').value,datum:$('datum').value,objekt:$('objekt').value,status:$('status').value,arbeiten:$('arbeiten').value,montage:{art:$('terminArt').value,datum:$('montageDatum').value,zeit:$('montageZeit').value,hinweis:$('montageHinweis').value},fahrt:{km:$('fahrtKm').value,kosten:$('fahrtKosten').value,hinweis:$('fahrtHinweis').value},updatedAt:new Date().toISOString(),materials:[...document.querySelectorAll('#material .matrow')].map(r=>({id:r.querySelector('select').value,qty:r.querySelector('.qty').value,unit:r.querySelector('.unit').value})).filter(x=>x.id),setup:[...document.querySelectorAll('#baustellenkosten .setuprow')].map(r=>({id:r.querySelector('select').value,qty:r.querySelector('.qty').value,unit:r.querySelector('.unit').value})).filter(x=>x.id),employees:[...document.querySelectorAll('.employee-row')].map(r=>({name:r.querySelector('.ename').value,beg:r.querySelector('.beg').value,end:r.querySelector('.end').value,pause:r.querySelector('.pause').value,hours:r.querySelector('.hours').value})).filter(x=>x.name),photos:photos.map(p=>({name:p.name,src:p.src,origSrc:p.origSrc||p.src,size:p.size}))}}
function saveOrder(){let d=collect();if(!d.kunde&&!d.objekt){alert('Bitte Auftraggeber oder Objektadresse eintragen.');return}let i=orders.findIndex(x=>x.id===d.id);if(i<0)orders.push(d);else orders[i]=d;write(ORDERS_KEY,orders);currentOrderId=d.id;updateLabel();alert('Auftrag gespeichert – nur lokal in dieser Vorschau.');}
function openOrder(id){let d=orders.find(x=>x.id===id);if(!d)return;currentOrderId=id;showView('auftrag');['auftragsnr','angebotsnr','kunde','kontakt','datum','objekt','arbeiten','status'].forEach(k=>$(k).value=d[k]||'');$('terminArt').value=d.montage?.art||'Montagetermin';$('montageDatum').value=d.montage?.datum||'';$('montageZeit').value=d.montage?.zeit||'';$('montageHinweis').value=d.montage?.hinweis||'';updateTerminArt();$('fahrtKm').value=d.fahrt?.km||'';$('fahrtKosten').value=d.fahrt?.kosten||'';$('fahrtHinweis').value=d.fahrt?.hinweis||'';$('employeeRows').innerHTML='';(d.employees||[]).forEach(addEmployeeRow);$('material').innerHTML='';(d.materials||[]).forEach(addMaterial);$('baustellenkosten').innerHTML='';(d.setup||[]).forEach(addSetupRow);photos=(d.photos||[]).map(x=>({...x}));renderPhotos();updateLabel()}
function deleteOrder(id){if(!confirm('Auftrag inklusive aller Baustellenfotos wirklich löschen?'))return;orders=orders.filter(x=>x.id!==id);write(ORDERS_KEY,orders);renderOrders();updateStorage()}
function renderOrders(){let box=$('orderList');box.innerHTML='';if(!orders.length){box.innerHTML='<p class="empty-state">Noch keine Aufträge. Lege einen Testauftrag an.</p>';return}orders.slice().sort((a,b)=>String(a.montage?.datum||'').localeCompare(String(b.montage?.datum||''))).forEach(o=>{let d=document.createElement('article');d.className='order-card';let m=o.montage||{};d.innerHTML=`<div class="order-main"><div><span class="eyebrow">${o.status||'offen'}</span><h3>${o.auftragsnr||''} · ${o.kunde||'Ohne Auftraggeber'}</h3><p>📅 <b>Montagetermin:</b> ${m.datum?new Date(m.datum+'T12:00').toLocaleDateString('de-DE'): 'nicht geplant'} ${m.zeit?'· '+m.zeit+' Uhr':''}</p><p>📍 ${o.objekt||'Keine Adresse hinterlegt'}</p>${o.angebotsnr?`<p>🏷️ Angebot: ${o.angebotsnr}</p>`:''}</div><div class="order-actions"><button onclick="openOrder('${o.id}')">Öffnen</button><button onclick="navigateTo('${encodeURIComponent(o.objekt||'')}')">🧭 Ab zur Baustelle</button><button onclick="addOrderToCalendar('${o.id}')">📅 Kalender</button><button class="danger" onclick="deleteOrder('${o.id}')">🗑 Löschen</button></div></div>`;box.appendChild(d)})}
function navigateTo(addr){if(!addr){alert('Keine Objektadresse hinterlegt.');return}window.open('https://www.google.com/maps/search/?api=1&query='+addr,'_blank')}
function addOrderToCalendar(id){let o=orders.find(x=>x.id===id);if(!o)return;downloadICS(o)}
function updateTerminArt(){let v=$('terminArt')?.value||'Montagetermin';if($('terminTitle'))$('terminTitle').textContent=v}
function addToCalendar(){let d=collect();if(!d.montage.datum||!d.montage.zeit){alert('Bitte Montagetermin mit Datum und Uhrzeit eintragen.');return}downloadICS(d)}
function downloadICS(o){let dt=o.montage?.datum, tm=o.montage?.zeit||'08:00';if(!dt)return;let [y,m,day]=dt.split('-'),[hh,mm]=tm.split(':');let start=`${y}${m}${day}T${hh}${mm}00`;let endMin=(Number(hh)*60+Number(mm)+120)%1440, ey=y,em=m,ed=day;if(Number(hh)*60+Number(mm)+120>=1440){let x=new Date(dt+'T'+tm);x.setMinutes(x.getMinutes()+120);ey=x.getFullYear();em=String(x.getMonth()+1).padStart(2,'0');ed=String(x.getDate()).padStart(2,'0')}let end=`${ey}${em}${ed}T${String(Math.floor(endMin/60)).padStart(2,'0')}${String(endMin%60).padStart(2,'0')}00`;let esc=s=>String(s||'').replace(/[\\;,]/g,c=>'\\'+c).replace(/\n/g,'\\n');let ics=`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//DACHWERK//DE\r\nBEGIN:VEVENT\r\nUID:${o.id}@dachwerk\r\nDTSTART:${start}\r\nDTEND:${end}\r\nSUMMARY:${esc('DACHWERK '+(o.montage?.art||'Montagetermin')+' – '+(o.kunde||o.objekt))}\r\nLOCATION:${esc(o.objekt)}\r\nDESCRIPTION:${esc('Auftrag '+o.auftragsnr+(o.angebotsnr?' | Angebot '+o.angebotsnr:'')+(o.montage?.hinweis?' | '+o.montage.hinweis:''))}\r\nEND:VEVENT\r\nEND:VCALENDAR`;let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download=(o.auftragsnr||'DACHWERK')+'_Montagetermin.ics';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function checkAddress(){let raw=$('objekt').value.trim(), st=$('addressStatus');if(!raw){st.textContent='⚠ Adresse fehlt';return}st.textContent='Prüfe Adresse …';try{let r=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=de&q='+encodeURIComponent(raw),{headers:{'Accept':'application/json'}});let a=await r.json();if(a.length){let x=a[0].address||{};let street=[x.road,x.house_number].filter(Boolean).join(' ');let city=x.city||x.town||x.village||x.municipality||'';let short=[street,[x.postcode,city].filter(Boolean).join(' ')].filter(Boolean).join(', ');$('objekt').value=short||raw;st.textContent='✓ Adresse gefunden'}else{st.textContent='⚠ Adresse nicht gefunden – bitte prüfen'}}catch(e){st.textContent='ℹ Prüfung gerade nicht erreichbar'}}
function compress(file){return new Promise(res=>{let img=new Image();img.onload=()=>{let max=1800,s=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);c.toBlob(b=>{let rd=new FileReader();rd.onload=()=>res({src:rd.result,origSrc:rd.result,size:b.size,name:file.name});rd.readAsDataURL(b)},'image/jpeg',.78)};img.src=URL.createObjectURL(file)})}
async function addPhotos(e){let existing=new Set(photos.map(p=>p.name+'|'+p.size));for(const f of [...e.target.files]){let key=f.name+'|'+f.size;if(existing.has(key))continue;let p=await compress(f);photos.push(p);existing.add(key)}e.target.value='';renderPhotos();updateStorage()}
let photoEditIndex=-1,photoEditOriginal='';
function openPhotoEditor(i){photoEditIndex=i;let p=photos[i];if(!p)return;photoEditOriginal=p.origSrc||p.src;let img=new Image();img.onload=()=>{let c=$('photoCanvas'),max=900,s=Math.min(1,max/img.width,max/img.height);c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);let ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);ctx.strokeStyle='#d40000';ctx.lineWidth=Math.max(5,c.width/140);ctx.lineCap='round';ctx.lineJoin='round';photoEditorDraw(c,ctx);$('photoEditor').hidden=false;$('photoEditor').setAttribute('aria-hidden','false')};img.src=p.src}
function photoEditorDraw(c,ctx){let drawing=false,last=null; if(c._bound){c.removeEventListener('pointerdown',c._pd);c.removeEventListener('pointermove',c._pm);c.removeEventListener('pointerup',c._pu);c.removeEventListener('pointercancel',c._pu)};c._pd=e=>{drawing=true;c.setPointerCapture(e.pointerId);last=[e.offsetX,e.offsetY]};c._pm=e=>{if(!drawing)return;let x=e.offsetX,y=e.offsetY;ctx.beginPath();ctx.moveTo(last[0],last[1]);ctx.lineTo(x,y);ctx.stroke();last=[x,y]};c._pu=()=>{drawing=false;last=null};c.addEventListener('pointerdown',c._pd);c.addEventListener('pointermove',c._pm);c.addEventListener('pointerup',c._pu);c.addEventListener('pointercancel',c._pu);c._bound=true}
function resetPhotoMarking(){let i=photoEditIndex,p=photos[i];if(!p)return;let img=new Image();img.onload=()=>{let c=$('photoCanvas'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height)};img.src=photoEditOriginal}
function savePhotoMarking(){if(photoEditIndex<0)return;let c=$('photoCanvas');photos[photoEditIndex].src=c.toDataURL('image/jpeg',.82);photos[photoEditIndex].size=Math.round(photos[photoEditIndex].src.length*.75);renderPhotos();updateStorage();closePhotoEditor()}
function closePhotoEditor(){photoEditIndex=-1;$('photoEditor').hidden=true;$('photoEditor').setAttribute('aria-hidden','true')}
function renderPhotos(){let box=$('photoPreview');box.innerHTML='';photos.forEach((p,i)=>{let d=document.createElement('div');d.className='photoitem';d.innerHTML=`<img src="${p.src}" alt="${p.name}"><button type="button" onclick="photos.splice(${i},1);renderPhotos();updateStorage()">×</button><small>${p.name}</small></div>`;box.appendChild(d)})}
function updateStorage(){let bytes=orders.reduce((s,o)=>s+(o.photos||[]).reduce((a,p)=>a+(p.size||0),0),0)+photos.reduce((s,p)=>s+(p.size||0),0);let mb=bytes/1024/1024, pct=Math.min(100,mb/500*100);$('storageText').textContent=`${mb.toFixed(1)} MB / 500 MB · noch ${Math.max(0,500-mb).toFixed(1)} MB frei`;$('storageBar').style.width=pct+'%'}
function refreshDemo(){materials=read(MAT_KEY,materials);setups=read(SET_KEY,setups);orders=read(ORDERS_KEY,orders);renderOrders();renderMasters();updateStorage();alert('Aktualisiert – Vorschau lädt die lokalen Daten neu.')}
function voiceInput(){if(!('webkitSpeechRecognition'in window||'SpeechRecognition'in window)){alert('Spracheingabe wird von diesem Browser nicht unterstützt.');return}let R=window.SpeechRecognition||window.webkitSpeechRecognition,r=new R();r.lang='de-DE';r.interimResults=false;r.onresult=e=>{$('arbeiten').value+=($('arbeiten').value?'\n':'')+e.results[0][0].transcript};r.start()}
function canvasSetup(id){let c=$(id),ctx=c.getContext('2d'),draw=false;function size(){let d=window.devicePixelRatio||1,w=c.clientWidth||420,h=160;c.width=w*d;c.height=h*d;ctx.scale(d,d);ctx.lineWidth=2;ctx.strokeStyle='#174a83';ctx.lineCap='round'}size();let pos=e=>{let r=c.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};c.addEventListener('pointerdown',e=>{draw=true;c.setPointerCapture(e.pointerId);let [x,y]=pos(e);ctx.beginPath();ctx.moveTo(x,y)});c.addEventListener('pointermove',e=>{if(!draw)return;let[x,y]=pos(e);ctx.lineTo(x,y);ctx.stroke()});['pointerup','pointercancel'].forEach(x=>c.addEventListener(x,()=>draw=false))}
function clearSig(id){let c=$(id),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height)}
function escPdf(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function fmtDate(v){if(!v)return '';let p=v.split('-');return p.length===3?p[2]+'.'+p[1]+'.'+p[0]:v}
function sigData(id){let c=$(id);try{return c&&c.toDataURL('image/png')}catch(e){return ''}}
function pdfRows(items, names){
  return items.length ? items.map(x=>'<tr>'+names.map(n=>'<td>'+escPdf(x[n]||'')+'</td>').join('')+'</tr>').join('') : '<tr><td colspan="'+names.length+'" class="pdf-empty">Keine Positionen eingetragen.</td></tr>';
}
function createAndSendPDF(){
  let d=collect(), t=$('pdfTemplate');
  t.querySelector('[data-p="auftragsnr"]').textContent=d.auftragsnr||'';
  t.querySelector('[data-p="angebotsnr"]').textContent=d.angebotsnr||'';
  t.querySelector('[data-p="kunde"]').textContent=d.kunde||'';
  t.querySelector('[data-p="datum"]').textContent=fmtDate(d.datum);
  t.querySelector('[data-p="kontakt"]').textContent=d.kontakt||'';
  t.querySelector('[data-p="objekt"]').textContent=d.objekt||'';
  t.querySelector('[data-p="arbeiten"]').innerHTML=escPdf(d.arbeiten||'').replace(/\n/g,'<br>');
  let erows=d.employees||[];
  $('pdfEmployees').innerHTML=pdfRows(erows,['name','beg','end','pause','hours']);
  $('pdfEmployeeSum').textContent=erows.reduce((a,x)=>a+(parseFloat(String(x.hours||'0').replace(',','.'))||0),0).toFixed(2).replace('.',',')+' h';
  $('pdfFahrtHinweis').textContent=d.fahrt?.hinweis||'';
  $('pdfFahrtKm').textContent=d.fahrt?.km ? d.fahrt.km+' km':'';
  $('pdfFahrtKosten').textContent=d.fahrt?.kosten ? Number(d.fahrt.kosten).toFixed(2).replace('.',',')+' €':'';
  $('pdfSetup').innerHTML=pdfRows((d.setup||[]).map(x=>{let m=setups.find(z=>z.id===x.id);return {name:m?.name||'',qty:x.qty,unit:x.unit}}),['name','qty','unit']);
  $('pdfMaterial').innerHTML=pdfRows((d.materials||[]).map(x=>{let m=materials.find(z=>z.id===x.id);return {name:m?.name||'',qty:x.qty,unit:x.unit}}),['name','qty','unit']);
  $('pdfOrt').textContent=$('signOrt').value||'';
  $('pdfDatum2').textContent=fmtDate($('signDatum').value||d.datum);
  $('pdfSigKunde').src=sigData('sigKunde')||'';
  $('pdfSigFirma').src=sigData('sigFirma')||'';
  const pp=$('pdfPhotoPages');
  pp.innerHTML='';
  const plist=d.photos||[];
  for(let start=0; start<plist.length; start+=4){
    const group=plist.slice(start,start+4);
    const page=document.createElement('div');
    page.className='pdf-photo-page';
    page.innerHTML='<div class=\"pdf-photo-head\"><img src=\"dachwerk-logo.jpg\"><div><b>DACHWERK – BAUSTELLENFOTOS</b><br>Auftragsnummer: '+escPdf(d.auftragsnr||'')+'</div><div class=\"pdf-photo-count\">Fotos '+(start+1)+'–'+(start+group.length)+' / '+plist.length+'</div></div><div class=\"pdf-photo-grid\"></div>';
    const grid=page.querySelector('.pdf-photo-grid');
    group.forEach((p,j)=>{const n=start+j+1;const cell=document.createElement('div');cell.className='pdf-photo-cell';cell.innerHTML='<div class=\"pdf-photo-frame\"><img src=\"'+p.src+'\" alt=\"\"></div><div class=\"pdf-photo-caption\">Foto '+n+' · '+escPdf(p.name||'Baustellenfoto')+'</div>';grid.appendChild(cell)});
    pp.appendChild(page);
  }
  t.classList.add('printing');
  void t.offsetHeight;
  window.print();
  window.addEventListener('afterprint',()=>t.classList.remove('printing'),{once:true});
}
window.addEventListener('load',()=>{canvasSetup('sigKunde');canvasSetup('sigFirma');resetForm();renderOrders();renderMasters();updateStorage()});
