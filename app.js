/* ============================================================
   IPO LAB — app.js
   Semua logika UI + integrasi Supabase untuk leaderboard kuis
   ============================================================ */

const DATA={
 input:[
  ["Keyboard","⌨️","Digunakan untuk memasukkan karakter, angka, dan perintah ke komputer."],
  ["Mouse","🖱️","Perangkat penunjuk untuk menggerakkan kursor dan memilih objek di layar."],
  ["Microphone","🎙️","Menangkap suara dan mengubahnya menjadi data digital."],
  ["Webcam","📷","Menangkap gambar dan video untuk dimasukkan ke komputer."],
  ["Scanner","📠","Mengubah dokumen atau gambar fisik menjadi data digital."],
  ["Touchscreen","📱","Layar sentuh yang menerima perintah dari sentuhan jari."]
 ],
 process:[
  ["CPU","🧠","Otak komputer yang menjalankan instruksi dan pengolahan data."],
  ["Processor","⚙️","Komponen pemroses utama yang melakukan jutaan perhitungan per detik."],
  ["ALU","➗","Arithmetic Logic Unit melakukan operasi hitung dan logika."],
  ["Control Unit","🎛️","Mengatur dan mengarahkan aliran data di dalam komputer."],
  ["RAM","💾","Memori sementara yang menyimpan data dan instruksi yang sedang digunakan."]
 ],
 output:[
  ["Monitor","🖥️","Menampilkan hasil pengolahan berupa teks, gambar, dan video."],
  ["Speaker","🔊","Mengeluarkan hasil pengolahan dalam bentuk suara."],
  ["Printer","🖨️","Mencetak hasil pengolahan ke media kertas."],
  ["Projector","📽️","Menampilkan hasil ke layar besar melalui proyeksi cahaya."],
  ["Headphone","🎧","Mengeluarkan suara secara personal ke telinga pengguna."]
 ]
};

function $(id){return document.getElementById(id)}

/* ---------- Navigasi ---------- */
function go(page){
 document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
 $(page).classList.add('active');
 document.querySelectorAll('.navlink').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
 closeMenu();
 window.scrollTo({top:0,behavior:'smooth'});
 if(page==='materi') updateProgress();
}
function toggleMenu(){ $('navlinks').classList.toggle('open') }
function closeMenu(){ $('navlinks').classList.remove('open') }

function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>t.classList.remove('show'),2400)}

/* ---------- Materi ---------- */
function renderDevices(){
 const map={input:'inputDevices',process:'processDevices',output:'outputDevices'};
 Object.keys(map).forEach(cat=>{
  $(map[cat]).innerHTML=DATA[cat].map((d,i)=>`<button class="device" onclick="showDetail('${cat}',${i})"><span class="emoji">${d[1]}</span><b>${d[0]}</b><small>${cat.toUpperCase()}</small></button>`).join('');
 });
}
function showDetail(cat,i){
 const el=$(cat+'Detail'),d=DATA[cat][i];
 el.innerHTML='<b>'+d[1]+' '+d[0]+'</b><br>'+d[2];
 el.classList.add('show');
 const done=JSON.parse(localStorage.getItem('ipo_done')||'{}');done[cat]=true;localStorage.setItem('ipo_done',JSON.stringify(done));updateProgress();
}
function filterCategory(cat){document.querySelectorAll('#materialCards .activity').forEach(x=>x.style.display=x.dataset.cat===cat?'block':'none');toast('Menampilkan materi '+cat.toUpperCase())}
function updateProgress(){
 const done=JSON.parse(localStorage.getItem('ipo_done')||'{}');const n=['input','process','output'].filter(x=>done[x]).length;
 if($('materialProgress')) $('materialProgress').style.width=(n/3*100)+'%';
 if($('materialStatus')) $('materialStatus').textContent=n+' dari 3 aktivitas selesai';
}

/* ---------- Simulasi perangkat ---------- */
const inputOpts=[['Keyboard','⌨️'],['Mouse','🖱️'],['Microphone','🎙️'],['Webcam','📷'],['Scanner','📠'],['Touchscreen','📱']];
const outputOpts=[['Monitor','🖥️'],['Speaker','🔊'],['Printer','🖨️'],['Projector','📽️'],['Headphone','🎧']];
function initSelects(){
 $('inputSelect').innerHTML=inputOpts.map((x,i)=>`<option value="${i}">${x[0]}</option>`).join('');
 $('outputSelect').innerHTML=outputOpts.map((x,i)=>`<option value="${i}">${x[0]}</option>`).join('');
 $('inputSelect').onchange=updateStage;$('outputSelect').onchange=updateStage;updateStage();
}
function updateStage(){
 const a=inputOpts[$('inputSelect').value],b=outputOpts[$('outputSelect').value];
 $('stageInIcon').textContent=a[1];$('stageInName').textContent=a[0];$('stageOutIcon').textContent=b[1];$('stageOutName').textContent=b[0];
}
function runDeviceSimulation(){
 const a=inputOpts[$('inputSelect').value][0],b=outputOpts[$('outputSelect').value][0];
 const msg=$('deviceSimMessage');let n=0;msg.textContent='⏳ Mengirim data dari '+a+'…';
 const phases=['📥 INPUT: data diterima dari '+a,'⚙️ PROSES: CPU mengolah data…','📤 OUTPUT: hasil dikirim ke '+b,'✅ Simulasi selesai!'];
 const timer=setInterval(()=>{msg.textContent=phases[n++];if(n>=phases.length)clearInterval(timer)},650);
 toast('Simulasi perangkat selesai');
}
function resetDeviceSimulation(){updateStage();$('deviceSimMessage').textContent='Siap. Pilih perangkat lalu jalankan simulasi.'}

/* ---------- Simulasi CPU ---------- */
function parseCpu(v){
 const s=v.trim().slice(0,12);
 const m=s.match(/^(-?\d+(?:\.\d+)?)([+\-*\/])(-?\d+(?:\.\d+)?)$/);
 if(!m)return {display:s,result:s};
 const a=+m[1],op=m[2],b=+m[3];let r;
 if(op==='+')r=a+b;if(op==='-')r=a-b;if(op==='*')r=a*b;if(op==='/')r=b===0?'Tidak dapat dibagi 0':a/b;
 return {display:s,result:String(r)};
}
function runCpu(){
 const val=$('cpuInput').value;if(!val.trim()){toast('Masukkan data terlebih dahulu');return}
 const p=parseCpu(val);let i=0;$('monitor').textContent='⏳';
 const ids=['s1','s2','s3','s4'];ids.forEach(x=>$(x).classList.remove('on'));
 const timer=setInterval(()=>{if(i>0)$(ids[i-1]).classList.remove('on');$(ids[i]).classList.add('on');$('stepCount').textContent=(i+1)+'/4 langkah';i++;if(i===4){clearInterval(timer);setTimeout(()=>{$('monitor').textContent=p.result;toast('CPU selesai memproses data')},250)}},650);
}
function resetCpu(){ $('cpuInput').value='';$('monitor').textContent='_';$('stepCount').textContent='0/4 langkah';['s1','s2','s3','s4'].forEach(x=>$(x).classList.remove('on')) }

/* ---------- Kuis ---------- */
const questions=[
 ['Perangkat manakah yang termasuk INPUT?',['Monitor','Keyboard','Speaker','Printer'],1],
 ['Komponen yang menjalankan instruksi dan pengolahan data adalah…',['CPU','Monitor','Printer','Speaker'],0],
 ['Perangkat yang menampilkan teks, gambar, dan video adalah…',['Mouse','Scanner','Monitor','Microphone'],2],
 ['ALU digunakan untuk…',['Mencetak dokumen','Operasi hitung dan logika','Menampilkan video','Merekam suara'],1],
 ['RAM menyimpan…',['Data dan instruksi sementara','Hasil cetak','Suara pengguna secara permanen','Gambar di monitor'],0],
 ['Perangkat yang menangkap suara adalah…',['Projector','Speaker','Microphone','Monitor'],2],
 ['Printer termasuk perangkat…',['Input','Proses','Output','Memori'],2],
 ['Urutan IPO yang benar adalah…',['Output-Proses-Input','Input-Proses-Output','Proses-Input-Output','Input-Output-Proses'],1]
];
let qIndex=0,qScore=0,qAnswered=false,student='';

function startQuiz(){
 student=$('studentName').value.trim()||'Siswa';
 qIndex=0;qScore=0;qAnswered=false;$('quizStart').style.display='none';$('quizResult').style.display='none';$('quizGame').style.display='block';renderQuestion();
}
function renderQuestion(){
 const q=questions[qIndex];qAnswered=false;$('qNumber').textContent='Soal '+(qIndex+1)+' dari '+questions.length;$('qScore').textContent='Skor: '+qScore;$('quizProgress').style.width=(qIndex/questions.length*100)+'%';$('question').textContent=q[0];$('quizFeedback').textContent='';$('nextBtn').style.display='none';
 $('options').innerHTML=q[1].map((x,i)=>`<button class="option" onclick="choose(${i},this)">${String.fromCharCode(65+i)}. ${x}</button>`).join('');
}
function choose(i,el){
 if(qAnswered)return;qAnswered=true;const q=questions[qIndex];document.querySelectorAll('.option').forEach(x=>x.disabled=true);
 if(i===q[2]){qScore++;el.classList.add('correct');$('quizFeedback').textContent='✅ Benar!'}else{el.classList.add('wrong');document.querySelectorAll('.option')[q[2]].classList.add('correct');$('quizFeedback').textContent='❌ Belum tepat. Jawaban benar: '+q[1][q[2]]}
 $('qScore').textContent='Skor: '+qScore;$('nextBtn').style.display='inline-block';
}
function nextQuestion(){qIndex++;if(qIndex>=questions.length){finishQuiz()}else renderQuestion()}

async function finishQuiz(){
 $('quizGame').style.display='none';$('quizResult').style.display='block';const pct=Math.round(qScore/questions.length*100);
 $('finalScore').textContent=pct+'%';$('finalTitle').textContent=pct>=80?'Hebat!':'Tetap Semangat!';
 $('finalText').textContent=student+', kamu menjawab '+qScore+' dari '+questions.length+' soal dengan benar.';
 await saveScore({name:student,score:pct,correct:qScore});
 await renderLeaderboard();
}
function restartQuiz(){$('quizResult').style.display='none';$('quizStart').style.display='block';$('studentName').value='';renderLeaderboard()}

/* ---------- Leaderboard (Supabase, dengan fallback localStorage) ---------- */
const LEADERBOARD_TABLE='leaderboard';
let _supabaseWarned=false;

function isSupabaseConfigured(){
 return typeof SUPABASE_URL==='string' && typeof SUPABASE_ANON_KEY==='string'
  && !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR-ANON');
}

function getSupabaseClient(){
 if(!isSupabaseConfigured()) return null;
 if(!window._sbClient && window.supabase){
  window._sbClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
 }
 return window._sbClient||null;
}

async function saveScore(entry){
 const sb=getSupabaseClient();
 if(sb){
  const {error}=await sb.from(LEADERBOARD_TABLE).insert({
   name:entry.name,score:entry.score,correct:entry.correct
  });
  if(error){ console.error('Supabase insert error:',error); toast('Gagal menyimpan skor ke Supabase'); }
  return;
 }
 // Fallback: localStorage (dipakai jika kredensial Supabase belum diisi)
 if(!_supabaseWarned){ toast('Supabase belum dikonfigurasi, skor disimpan lokal'); _supabaseWarned=true; }
 const scores=JSON.parse(localStorage.getItem('ipo_scores')||'[]');
 scores.push(entry);
 scores.sort((a,b)=>b.score-a.score);
 localStorage.setItem('ipo_scores',JSON.stringify(scores.slice(0,10)));
}

async function renderLeaderboard(){
 const sb=getSupabaseClient();
 let scores=[];
 if(sb){
  const {data,error}=await sb.from(LEADERBOARD_TABLE)
   .select('name,score,correct')
   .order('score',{ascending:false})
   .order('created_at',{ascending:true})
   .limit(10);
  if(error){ console.error('Supabase select error:',error); }
  else scores=data||[];
 } else {
  scores=JSON.parse(localStorage.getItem('ipo_scores')||'[]');
 }
 $('leaderBody').innerHTML=scores.length?scores.map((s,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(s.name)}</td><td>${s.score}</td><td>${s.correct}/${questions.length}</td></tr>`).join(''):'<tr><td colspan="4">Belum ada skor.</td></tr>';
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

/* ---------- Mode kuis ---------- */
function setQuizMode(mode){
 document.querySelectorAll('.modebtn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
 $('mcMode').style.display = mode==='mc' ? 'block' : 'none';
 $('dragMode').style.display = mode==='drag' ? 'block' : 'none';
}

/* ---------- Kuis Drag & Drop (klasifikasi perangkat) ---------- */
let dragScore=0,dragTotal=0,dragStartTime=null,dragTimerInterval=null,dragState=null;
const CAT_LABEL={input:'Input',process:'Proses',output:'Output'};

function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1)}

function buildDragPool(){
 const pool=$('dragPool'); if(!pool) return;
 clearInterval(dragTimerInterval);
 ['input','process','output'].forEach(cat=>{ const c=$('zone'+capitalize(cat)+'Chips'); if(c) c.innerHTML=''; });
 const picks=[];
 ['input','process','output'].forEach(cat=>{
  const items=[...DATA[cat]].sort(()=>Math.random()-0.5).slice(0,3);
  items.forEach(d=>picks.push({cat,name:d[0],emoji:d[1]}));
 });
 picks.sort(()=>Math.random()-0.5);
 dragTotal=picks.length; dragScore=0;
 pool.innerHTML=picks.map((d,i)=>`<div class="dragchip" data-cat="${d.cat}" data-idx="${i}"><span class="chipemoji">${d.emoji}</span><span>${d.name}</span></div>`).join('');
 $('dragResult').classList.remove('show');
 $('dragResult').style.display='none';
 document.querySelectorAll('.dropzone').forEach(z=>z.classList.remove('flash-correct','flash-wrong'));
 updateDragStats();
 dragStartTime=Date.now();
 $('dragTimer').textContent='00:00';
 dragTimerInterval=setInterval(()=>{
  const s=Math.floor((Date.now()-dragStartTime)/1000);
  $('dragTimer').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
 },1000);
}
function resetDragGame(){ buildDragPool(); }

function updateDragStats(){
 $('dragScoreTag').textContent=dragScore+'/'+dragTotal+' benar';
 $('dragProgress').style.width=(dragTotal?dragScore/dragTotal*100:0)+'%';
 ['input','process','output'].forEach(cat=>{
  const el=$('zone'+capitalize(cat)+'Count');
  const list=$('zone'+capitalize(cat)+'Chips');
  if(el&&list) el.textContent=list.children.length;
 });
}

function onChipPointerDown(e){
 const chip=e.target.closest('.dragchip');
 if(!chip || chip.classList.contains('placed') || chip.closest('.zonechips')) return;
 e.preventDefault();
 const rect=chip.getBoundingClientRect();
 dragState={chip,offsetX:e.clientX-rect.left,offsetY:e.clientY-rect.top};
 chip.setPointerCapture(e.pointerId);
 chip.classList.add('dragging');
 chip.style.width=rect.width+'px';
 chip.style.position='fixed';
 chip.style.left=rect.left+'px';
 chip.style.top=rect.top+'px';
 chip.style.zIndex=999;
 document.addEventListener('pointermove',onChipPointerMove);
 document.addEventListener('pointerup',onChipPointerUp);
 document.addEventListener('pointercancel',onChipPointerUp);
}
function onChipPointerMove(e){
 if(!dragState) return;
 const {chip,offsetX,offsetY}=dragState;
 chip.style.left=(e.clientX-offsetX)+'px';
 chip.style.top=(e.clientY-offsetY)+'px';
 document.querySelectorAll('.dropzone').forEach(z=>{
  const r=z.getBoundingClientRect();
  const over=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
  z.classList.toggle('dragover',over);
 });
}
function onChipPointerUp(e){
 if(!dragState) return;
 const {chip}=dragState;
 chip.classList.remove('dragging');
 let landedZone=null;
 document.querySelectorAll('.dropzone').forEach(z=>{
  if(z.classList.contains('dragover')) landedZone=z;
  z.classList.remove('dragover');
 });
 document.removeEventListener('pointermove',onChipPointerMove);
 document.removeEventListener('pointerup',onChipPointerUp);
 document.removeEventListener('pointercancel',onChipPointerUp);
 if(landedZone) handleDrop(chip,landedZone);
 else clearChipInlineStyle(chip);
 dragState=null;
}
function clearChipInlineStyle(chip){
 chip.style.position='';chip.style.left='';chip.style.top='';chip.style.width='';chip.style.zIndex='';
}
function handleDrop(chip,zone){
 const correctCat=chip.dataset.cat, zoneCat=zone.dataset.cat;
 if(correctCat===zoneCat){
  clearChipInlineStyle(chip);
  chip.classList.add('placed');
  chip.style.pointerEvents='none';
  zone.querySelector('.zonechips').appendChild(chip);
  zone.classList.add('flash-correct');
  setTimeout(()=>zone.classList.remove('flash-correct'),500);
  dragScore++;
  spawnConfetti(zone,10);
  updateDragStats();
  if(dragScore===dragTotal) finishDragGame();
 } else {
  zone.classList.add('flash-wrong');
  chip.classList.add('shake');
  toast('Belum tepat, ini bukan perangkat '+CAT_LABEL[zoneCat]);
  setTimeout(()=>{
   zone.classList.remove('flash-wrong');
   chip.classList.remove('shake');
   clearChipInlineStyle(chip);
  },400);
 }
}
function spawnConfetti(anchorEl,count){
 const rect=anchorEl.getBoundingClientRect();
 const colors=['#16c8ec','#8b5cf6','#16c79a','#f4b942','#2d7cff'];
 for(let i=0;i<count;i++){
  const el=document.createElement('div');
  el.className='confetti';
  el.style.left=(rect.left+rect.width/2+(Math.random()*70-35))+'px';
  el.style.top=(rect.top+rect.height/2)+'px';
  el.style.background=colors[Math.floor(Math.random()*colors.length)];
  el.style.setProperty('--dx',(Math.random()*170-85)+'px');
  el.style.setProperty('--rot',(Math.random()*360)+'deg');
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),900);
 }
}
function finishDragGame(){
 clearInterval(dragTimerInterval);
 $('dragResult').style.display='block';
 $('dragFinalText').textContent='Kamu berhasil mengklasifikasikan '+dragTotal+' perangkat dalam '+$('dragTimer').textContent+'.';
 spawnConfetti(document.body.querySelector('.quizbox#dragMode'),26);
 toast('🎉 Semua perangkat berhasil diklasifikasikan!');
}
function initDragGame(){
 const pool=$('dragPool'); if(!pool) return;
 pool.addEventListener('pointerdown',onChipPointerDown);
 buildDragPool();
}

/* ---------- Aksesibilitas ---------- */
function toggleMotion(){document.body.classList.toggle('reduce');$('motionText').textContent=document.body.classList.contains('reduce')?'Motion Reduced':'Reduce Motion'}

/* ---------- Init ---------- */
renderDevices();
initSelects();
updateProgress();
renderLeaderboard();
initDragGame();
