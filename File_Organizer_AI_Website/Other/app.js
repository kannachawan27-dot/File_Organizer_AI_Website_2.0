const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const state = { files: [], root: null, demo: false, currentView: 'overview', language: 'en' };
const categories = {
  Documents: ['pdf','doc','docx','txt','rtf','odt','ppt','pptx'],
  Images: ['jpg','jpeg','png','gif','webp','svg','bmp','heic'],
  Videos: ['mp4','mov','avi','mkv','webm'],
  Audio: ['mp3','wav','aac','flac','m4a','ogg'],
  Spreadsheets: ['xls','xlsx','csv','ods'],
  Archives: ['zip','rar','7z','tar','gz']
};
const colors = {Documents:'#8879ee',Images:'#58a6dc',Videos:'#e8a45f',Audio:'#58b99a',Spreadsheets:'#4bb99b',Archives:'#d58ab1',Other:'#a0a0b5'};
const extOf = name => (name.includes('.') ? name.split('.').pop().toLowerCase() : 'no extension');
const categoryOf = ext => Object.keys(categories).find(k => categories[k].includes(ext)) || 'Other';
const formatSize = n => n < 1024 ? n+' B' : n < 1048576 ? (n/1024).toFixed(1)+' KB' : n < 1073741824 ? (n/1048576).toFixed(1)+' MB' : (n/1073741824).toFixed(2)+' GB';
const formatDate = d => d ? new Date(d).toLocaleDateString() : '—';
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3200)}
function setView(view){state.currentView=view;$$('.page').forEach(p=>p.classList.remove('active-page'));$('#'+view+'View').classList.add('active-page');$$('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('#crumb').textContent=({overview:'Overview',files:'All files',organize:'Smart organize',insights:'Insights'})[view];}
$$('.nav-item[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.goto)));
$('#themeToggle').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('foai-theme',document.body.classList.contains('dark')?'dark':'light')});
if(localStorage.getItem('foai-theme')==='dark')document.body.classList.add('dark');
$('#helpBtn').onclick=()=>$('#helpDialog').showModal();$('#closeHelp').onclick=$('#gotIt').onclick=()=>$('#helpDialog').close();
async function chooseFolder(){
  if(!('showDirectoryPicker' in window)){toast('Folder access is not supported in this browser. Try recent Chrome or Edge.');return}
  try{const handle=await window.showDirectoryPicker({mode:'readwrite'});state.root=handle;state.demo=false;$('#folderLabel').textContent=handle.name;$('#scanStatus').textContent='Scanning folder…';await scanDirectory(handle);toast('Folder scanned successfully.');}
  catch(e){if(e.name!=='AbortError')toast('Could not open folder: '+e.message)}
}
$('#chooseFolderBtn').onclick=$('#heroChoose').onclick=$('#filesChoose').onclick=chooseFolder;
async function scanDirectory(dir, prefix=''){
  const collected=[];
  async function walk(handle,path=''){
    for await(const [name,entry] of handle.entries()){
      if(name.startsWith('.') || name==='System Volume Information')continue;
      if(entry.kind==='file'){
        try{const f=await entry.getFile();collected.push({name,path:path?path+'/'+name:name,size:f.size,modified:f.lastModified,type:extOf(name),category:categoryOf(extOf(name)),handle:entry,file:f,kind:'real'});}catch{}
      }else if(entry.kind==='directory'){await walk(entry,path?path+'/'+name:name)}
    }
  }
  await walk(dir);state.files=collected;renderAll();$('#scanStatus').textContent='Last scanned just now';
}
function loadDemo(){
  const now=Date.now();const samples=[
    ['Project_Proposal.pdf',2450000,1],['Meeting_Notes.docx',82000,2],['Budget_2026.xlsx',530000,3],['Team_Photo.jpg',4200000,4],['Product_Mockup.png',1900000,5],['Demo_Video.mp4',145000000,6],['Podcast_Intro.mp3',8200000,7],['Backup_Archive.zip',78000000,8],['Research_Paper.pdf',1250000,9],['Presentation.pptx',9200000,10],['Old_Logo.png',1900000,11],['Dataset.csv',12500000,12],['Design_Export.zip',220000000,13],['Voice_Note.wav',4500000,14],['Readme.txt',4200,15],['Class_Notes.pdf',2450000,16]
  ];
  state.files=samples.map(([name,size,days],i)=>({name,path:name,size,modified:now-days*86400000,type:extOf(name),category:categoryOf(extOf(name)),kind:'demo',handle:null,file:null}));
  state.root=null;state.demo=true;$('#folderLabel').textContent='Demo workspace';$('#scanStatus').textContent='Demo data loaded';renderAll();toast('Demo workspace loaded. No real files were changed.');
}
$('#demoBtn').onclick=loadDemo;
function duplicates(){const map=new Map();state.files.forEach(f=>{const k=f.name.toLowerCase()+'|'+f.size;map.set(k,(map.get(k)||0)+1)});return state.files.filter(f=>map.get(f.name.toLowerCase()+'|'+f.size)>1).length}
function renderAll(){renderStats();renderCategories();renderTable();renderPlan();renderInsights()}
function renderStats(){$('#totalFiles').textContent=state.files.length;$('#categoryCount').textContent=new Set(state.files.map(f=>f.category)).size;$('#duplicateCount').textContent=duplicates();$('#largeCount').textContent=state.files.filter(f=>f.size>100*1048576).length;$('#insDup').textContent=duplicates();$('#insLarge').textContent=state.files.filter(f=>f.size>100*1048576).length;$('#insOther').textContent=state.files.filter(f=>f.category==='Other').length}
function renderCategories(){const el=$('#categoryList');if(!state.files.length){el.className='category-list empty-state';el.innerHTML='<div class="empty-graphic">▤</div><strong>Your file overview will appear here</strong><span>Select a folder or explore the demo.</span>';return}el.className='category-list';el.innerHTML=Object.keys(categories).concat('Other').map(c=>{const n=state.files.filter(f=>f.category===c).length;if(!n)return '';return `<div class="category-row"><div class="category-symbol" style="color:${colors[c]}">▤</div><div class="category-info"><strong>${c}</strong><small>${state.files.filter(f=>f.category===c).length} files · ${formatSize(state.files.filter(f=>f.category===c).reduce((a,f)=>a+f.size,0))}</small></div><span class="category-count">${n}</span></div>`}).join('')}
function renderTable(){let files=[...state.files];const q=$('#fileSearch').value.toLowerCase();const type=$('#typeFilter').value;const sort=$('#sortSelect').value;files=files.filter(f=>(f.name.toLowerCase().includes(q)||f.type.includes(q))&&(type==='all'||f.category===type));if(sort==='newest')files.sort((a,b)=>b.modified-a.modified);else if(sort==='largest')files.sort((a,b)=>b.size-a.size);else files.sort((a,b)=>a.name.localeCompare(b.name));$('#fileCountLabel').textContent=files.length+' files';$('#fileTable').innerHTML=files.length?files.map((f)=>`<tr><td><div class="file-cell"><span class="file-icon">${f.type.slice(0,4).toUpperCase()}</span><span>${escapeHtml(f.name)}</span></div></td><td><span class="file-type">${f.category}</span></td><td>${formatSize(f.size)}</td><td>${formatDate(f.modified)}</td><td><button class="open-file" data-open="${encodeURIComponent(f.path)}">Open ↗</button></td></tr>`).join(''):'<tr><td colspan="5" class="table-empty">No matching files found.</td></tr>'}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('#fileSearch').oninput=renderTable;$('#typeFilter').onchange=renderTable;$('#sortSelect').onchange=renderTable;
$('#fileTable').addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(!b)return;const f=state.files.find(x=>x.path===decodeURIComponent(b.dataset.open));if(f)openFile(f)});
async function openFile(f){if(f.kind==='demo'){toast('Demo files are examples and cannot be opened.');return}try{const file=await f.handle.getFile();const url=URL.createObjectURL(file);const w=window.open(url,'_blank');if(!w){const a=document.createElement('a');a.href=url;a.download=f.name;a.click()}setTimeout(()=>URL.revokeObjectURL(url),60000)}catch(e){toast('Unable to open this file in the browser.')} }
function buildGroups(){const groups={};state.files.forEach(f=>(groups[f.category]??=[]).push(f));return groups}
function renderPlan(){const groups=buildGroups();const keys=Object.keys(groups);$('#planDescription').textContent=state.files.length?`${state.files.length} files will be grouped into ${keys.length} folders.`:'Choose a folder to create your plan.';$('#planSummary').textContent=state.files.length?`${state.files.length} files · ${keys.length} destination folders`:'No changes planned';$('#organizeBtn').disabled=!state.files.length||state.demo||!state.root;$('#planList').innerHTML=keys.length?keys.map(k=>`<div class="plan-group"><div class="plan-group-head"><span>▰ ${k}</span><span>${groups[k].length} files → /${k}/</span></div>${groups[k].slice(0,4).map(f=>`<div class="plan-file"><b>${escapeHtml(f.name)}</b><span>${formatSize(f.size)}</span></div>`).join('')}${groups[k].length>4?`<div class="plan-file">+ ${groups[k].length-4} more files</div>`:''}</div>`).join(''):'<div class="empty-state"><div class="empty-graphic">✣</div><strong>Your plan will show here</strong><span>Choose a folder or load demo data.</span></div>'}
$('#refreshPlan').onclick=renderPlan;$('#organizeBtn').onclick=()=>{if(!state.root)return;$('#confirmText').textContent=`The app will move ${state.files.length} files into category folders inside “${state.root.name}”. Existing files with the same name will not be overwritten.`;$('#confirmDialog').showModal()};
$('#cancelOrganize').onclick=()=>$('#confirmDialog').close();
$('#confirmOrganize').onclick=async()=>{const btn=$('#confirmOrganize');btn.disabled=true;btn.textContent='Organizing…';let moved=0,failed=0;try{for(const f of [...state.files]){try{const folder=await state.root.getDirectoryHandle(f.category,{create:true});if(typeof f.handle.move!=='function')throw new Error('Browser does not support safe file move');await f.handle.move(folder,f.name);moved++}catch(e){failed++}}await scanDirectory(state.root);toast(`Organizing finished: ${moved} moved, ${failed} could not be moved.`)}finally{btn.disabled=false;btn.textContent='Yes, organize files';$('#confirmDialog').close()}};
function renderInsights(){const totals={};state.files.forEach(f=>totals[f.category]=(totals[f.category]||0)+f.size);const entries=Object.entries(totals).sort((a,b)=>b[1]-a[1]);const max=Math.max(1,...entries.map(x=>x[1]));$('#storageBars').innerHTML=entries.length?entries.map(([k,v])=>`<div class="bar-row"><span>${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%;background:${colors[k]}"></div></div><b>${formatSize(v)}</b></div>`).join(''):'<div class="empty-state"><strong>No insights yet</strong><span>Select a folder or explore demo data.</span></div>'}
const speechLang = {en:'en-IN',hi:'hi-IN',te:'te-IN'};
let speakReplies = true;
let activeRecognition = null;
function localized(key, fallback='') {
  const words = {
    en:{noFolder:'Select an approved folder first. I only search the folder you choose.',notFound:'I could not find a matching file. Try a file name, extension such as PDF, or ask for large files.',found:'I found',matches:'matching file(s)',large:'Large files',latest:'Latest matching files',duplicates:'Potential duplicate files',openHint:'Choose Open in the file list to preview or download a file.'},
    hi:{noFolder:'पहले अपनी अनुमति वाला फ़ोल्डर चुनें। मैं केवल चुने हुए फ़ोल्डर में खोजता हूँ।',notFound:'मुझे मिलती-जुलती फ़ाइल नहीं मिली। फ़ाइल का नाम या PDF जैसा प्रकार आज़माएँ।',found:'मुझे मिले',matches:'मिलती हुई फ़ाइलें',large:'बड़ी फ़ाइलें',latest:'सबसे नई मिलती हुई फ़ाइलें',duplicates:'संभावित डुप्लिकेट फ़ाइलें',openHint:'फ़ाइल सूची में Open चुनकर फ़ाइल का प्रीव्यू या डाउनलोड करें।'},
    te:{noFolder:'ముందుగా మీరు అనుమతించిన ఫోల్డర్‌ను ఎంచుకోండి. మీరు ఎంచుకున్న ఫోల్డర్‌లో మాత్రమే వెతుకుతాను.',notFound:'సరిపోలే ఫైల్ కనబడలేదు. ఫైల్ పేరు లేదా PDF వంటి రకాన్ని ప్రయత్నించండి.',found:'కనిపించాయి',matches:'సరిపోలిన ఫైళ్లు',large:'పెద్ద ఫైళ్లు',latest:'తాజా సరిపోలిన ఫైళ్లు',duplicates:'డూప్లికేట్ అయ్యే ఫైళ్లు',openHint:'ఫైల్ జాబితాలో Open ఎంచుకుని ప్రివ్యూ లేదా డౌన్‌లోడ్ చేయండి.'}
  };
  return (words[state.language]||words.en)[key] || fallback;
}
function assistantReply(query){
  const q=query.toLowerCase();
  if(!state.files.length)return localized('noFolder');
  let matches=[];
  const asksLarge=/large|big|బri|పెద్ద|बड़ी|बड़े/i.test(q);
  const asksDuplicate=/duplicate|డూప్లికేట్|डुप्लिकेट/i.test(q);
  const asksLatest=/latest|newest|recent|తాజా|नवीनतम|सबसे नई/i.test(q);
  const ext=q.match(/pdf|docx?|xlsx?|pptx?|png|jpe?g|mp4|csv|డాక్యుమెంట్|पीडीएफ/i);
  if(asksLarge) matches=state.files.filter(f=>f.size>100*1048576).sort((a,b)=>b.size-a.size);
  else if(asksDuplicate){const seen=new Set();matches=state.files.filter(f=>{const k=f.name.toLowerCase()+'|'+f.size;if(seen.has(k))return true;seen.add(k);return false});}
  else if(asksLatest) matches=state.files.filter(f=>!ext||f.type===ext[0]||f.type===ext[0].replace('jpeg','jpg')).sort((a,b)=>b.modified-a.modified).slice(0,5);
  else {
    const stop=/\b(find|search|show|open|my|the|file|please|from|folder|latest|latest|నాకు|ఫైల్|చూపించు|వెతుకు|खोजो|दिखाओ|मेरी|फ़ाइल|खोलो|से)\b/gi;
    const terms=q.replace(stop,'').trim().split(/[\s,]+/).filter(t=>t.length>1);
    matches=state.files.filter(f=>terms.some(t=>f.name.toLowerCase().includes(t)||f.type.includes(t)||f.category.toLowerCase().includes(t))).slice(0,8);
  }
  if(!matches.length)return localized('notFound');
  const title=asksLarge?localized('large'):asksLatest?localized('latest'):asksDuplicate?localized('duplicates'):localized('found');
  return `${title}: ${matches.slice(0,6).map(f=>`${f.name} (${formatSize(f.size)}) — ${f.path}`).join('; ')}. ${localized('openHint')}`;
}
function speak(text){
  if(!speakReplies || !('speechSynthesis' in window))return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang=speechLang[state.language]||'en-IN';
  const voices=window.speechSynthesis.getVoices();
  const voice=voices.find(v=>v.lang.toLowerCase()===utterance.lang.toLowerCase()) || voices.find(v=>v.lang.toLowerCase().startsWith(state.language+'-'));
  if(voice)utterance.voice=voice;
  window.speechSynthesis.speak(utterance);
}
function ask(q){
  if(!q.trim())return;
  const answer=assistantReply(q);
  $('#assistantWelcome').textContent=answer;
  $('#chatInput').value='';
  const wantsOpen=/\b(open|launch)\b|खोलो|తెరువు/i.test(q);
  if(wantsOpen && state.files.length){
    const found=state.files.find(f=>answer.includes(f.name));
    if(found && found.kind!=='demo')openFile(found);
    else if(found && found.kind==='demo')toast('Demo files are examples and cannot be opened.');
  }
  speak(answer);
}
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();ask($('#chatInput').value)});
$$('.suggestion').forEach(b=>b.onclick=()=>ask(b.textContent));
$('#voiceBtn').onclick=()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){toast('Speech recognition is not available in this browser. Try current Edge or Chrome, or type your request.');$('#voiceStatus').textContent='Voice input unavailable in this browser';return;}
  if(activeRecognition){activeRecognition.stop();return;}
  const rec=new SR();activeRecognition=rec;rec.lang=speechLang[state.language]||'en-IN';rec.continuous=false;rec.interimResults=false;
  rec.onstart=()=>{$('#voiceStatus').textContent='Listening… speak now';$('#voiceBtn').classList.add('listening')};
  rec.onresult=e=>{const transcript=e.results[0][0].transcript;$('#chatInput').value=transcript;ask(transcript)};
  rec.onerror=e=>{toast('Voice input error: '+(e.error||'please check microphone permission'));};
  rec.onend=()=>{activeRecognition=null;$('#voiceBtn').classList.remove('listening');$('#voiceStatus').textContent=`Voice: ready · Spoken replies: ${speakReplies?'on':'off'}`};
  try{rec.start()}catch(e){toast('Could not start microphone. Check browser permission.');activeRecognition=null;}
};
$('#speakToggle').onclick=()=>{speakReplies=!speakReplies;$('#speakToggle').textContent=speakReplies?'🔊':'🔇';$('#voiceStatus').textContent=`Voice: ready · Spoken replies: ${speakReplies?'on':'off'}`;if(!speakReplies&&'speechSynthesis'in window)window.speechSynthesis.cancel();toast(speakReplies?'Spoken replies enabled.':'Spoken replies disabled.');};
const translations={en:{},hi:{'Overview':'अवलोकन','All files':'सभी फ़ाइलें','Smart organize':'स्मार्ट व्यवस्था','Insights':'जानकारी','Select folder':'फ़ोल्डर चुनें'},te:{'Overview':'సారాంశం','All files':'అన్ని ఫైళ్లు','Smart organize':'స్మార్ట్ అమరిక','Insights':'విశ్లేషణ','Select folder':'ఫోల్డర్ ఎంచుకోండి'}};
$('#languageSelect').onchange=e=>{state.language=e.target.value;const t=translations[state.language];if('speechSynthesis' in window)window.speechSynthesis.cancel();$$('.nav-item[data-view]').forEach(b=>{const label=b.textContent.trim().replace(/^[▦▤✣◷]\s*/, '');b.innerHTML=`<span>${b.dataset.view==='overview'?'▦':b.dataset.view==='files'?'▤':b.dataset.view==='organize'?'✣':'◷'}</span> ${t[label]||label}`});toast(state.language==='en'?'Language set to English':state.language==='hi'?'कुछ लेबल हिंदी में दिखाए गए हैं':'కొన్ని లేబుల్‌లు తెలుగులో చూపబడతాయి')};
renderAll();
