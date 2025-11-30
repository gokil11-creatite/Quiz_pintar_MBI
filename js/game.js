// QUIZ PINTAR VERSI MBI - main JS
// This project uses simple localStorage for settings and an optional Firebase integration.
// Placeholders:
// - assets/images/logo-placeholder.png  (your uploaded logo)
// - assets/images/bg-placeholder.jpg    (your uploaded background)
// - assets/sounds/*.mp3                 (upload sounds to assets/sounds/)

const startBtn = document.getElementById('startBtn');
const leaderBtn = document.getElementById('leaderBtn');
const guideBtn = document.getElementById('guideBtn');
const overlay = document.getElementById('overlay');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const landing = document.getElementById('landing');
const bestScoreEl = document.getElementById('bestScore');
const soundToggle = document.getElementById('soundToggle');

let settings = {
  sound: localStorage.getItem('q_mbi_sound') !== 'off',
  bestScore: parseInt(localStorage.getItem('q_mbi_best')||'0'),
  lastReset: parseInt(localStorage.getItem('q_mbi_reset')||'0')
};

// Score weekly reset
function weeklyResetCheck(){
  const now = Date.now();
  if(!settings.lastReset){
    settings.lastReset = now;
    localStorage.setItem('q_mbi_reset', now);
    return;
  }
  const sevenDays = 7*24*60*60*1000;
  if(now - settings.lastReset >= sevenDays){
    // reset best score
    settings.bestScore = 0;
    localStorage.setItem('q_mbi_best', '0');
    settings.lastReset = now;
    localStorage.setItem('q_mbi_reset', now);
  }
}
weeklyResetCheck();
bestScoreEl.textContent = settings.bestScore;

// Loader simulation
function runLoader(){
  overlay.classList.remove('hidden');
  let p = 0;
  const t = setInterval(()=>{
    p += Math.floor(Math.random()*12)+6;
    if(p>100) p=100;
    progressFill.style.width = p + '%';
    progressText.textContent = p + '%';
    // Baris 50 (di dalam fungsi runLoader)
    if(p>=100){ clearInterval(t); setTimeout(()=>{ overlay.classList.add('hidden'); landing.classList.remove('hidden'); }, 600); }
  },200);
}
document.addEventListener('DOMContentLoaded', runLoader);

// Sound system
const sounds = {
  start: 'assets/sounds/start.mp3',
  click: 'assets/sounds/click.mp3',
  correct: 'assets/sounds/correct.mp3',
  wrong: 'assets/sounds/wrong.mp3',
  gameover: 'assets/sounds/gameover.mp3',
  help: 'assets/sounds/help.mp3',
};
let audios = {};
for(let k in sounds){
  audios[k] = new Audio(sounds[k]);
  audios[k].preload = 'auto';
}
function playSound(name){
  if(!settings.sound) return;
  if(audios[name]) { try{ audios[name].currentTime = 0; audios[name].play(); }catch(e){} }
}
// Kode Diperbaiki (Menggunakan Karakter Simbol yang Lebih Kompatibel)

// Baris ~83: Sound Toggle
function toggleSound(){
  settings.sound = !settings.sound;
  localStorage.setItem('q_mbi_sound', settings.sound ? 'on':'off');
  // Mengganti karakter bermasalah 
  soundToggle.textContent = settings.sound ? '' : '';
  playSound('click');
}
soundToggle.addEventListener('click', toggleSound);
soundToggle.textContent = settings.sound ? '' : ''; // Menggunakan simbol yang sama saat inisialisasi


// Baris 90 (Navigation handlers)
startBtn.addEventListener('click', ()=>{ playSound('start'); openQuiz(); }); // Mengganti 'click' dengan 'start' untuk tombol mulai
leaderBtn.addEventListener('click', ()=>{ playSound('click'); openLeaderboard(); });
guideBtn.addEventListener('click', ()=>{ playSound('click'); openGuide(); });

// Simple page render functions (creates in-document modal pages)
function clearMain(){ document.querySelectorAll('.page').forEach(e=>e.remove()); }
function openGuide(){
  clearMain();
  const page = document.createElement('div'); page.className='page';
  page.innerHTML = `
    <div class="modal">
      <h2>Petunjuk</h2>
      <p>Di setiap pertanyaan ada 4 jawaban dan hanya 1 jawaban yang benar. Bila anda kesulitan, ada 2 bantuan (AISYAH & DENY). Perhatikan: Setiap sesi hanya boleh menggunakan 1 bantuan. Gunakan dengan bijak. Capai nilai tertinggi Anda dan tunjukkan kemampuan Anda.</p>
      <button id="backFromGuide" class="big-btn">Kembali</button>
    </div>
  `;
  landing.appendChild(page);
  document.getElementById('backFromGuide').addEventListener('click', ()=>{ playSound('click'); page.remove(); });
}

function openLeaderboard(){
  clearMain();
  const page = document.createElement('div'); page.className='page';
  // shows local top10 and explains online option
  const top = getLocalLeaderboard();
  let rows = top.map((r,i)=>`<div class="lb-row">${i+1}. <b>${escapeHtml(r.name)}</b> - ${r.score}</div>`).join('');
  if(!rows) rows = '<div class="empty">Belum ada skor tercatat.</div>';
  page.innerHTML = `
    <div class="modal">
      <h2>Leaderboard (Top 10)</h2>
      <div class="lb-list">${rows}</div>
      <p class="muted">Catatan: Untuk leaderboard global online, silakan konfigurasi Firebase (lihat README). Saat ini menampilkan papan skor lokal.</p>
      <div style="margin-top:12px"><button id="backFromLB" class="big-btn">Kembali</button></div>
    </div>
  `;
  landing.appendChild(page);
  document.getElementById('backFromLB').addEventListener('click', ()=>{ playSound('click'); page.remove(); });
}

function openQuiz(){
  clearMain();
  const page = document.createElement('div'); page.className='page';
  page.innerHTML = `
    <div class="quiz-area">
      <div class="topbar"><button id="backToHome" class="round-btn"><</button> <div class="score">Score: <span id="curScore">0</span></div></div>
      <div class="question-box" id="questionBox">Memuat pertanyaan...</div>
      <div class="answers" id="answers"></div>
      <div class="helpers">
        <button id="helpWoman" class="helper-btn">Aisyah</button>
        <button id="helpMan" class="helper-btn">Deny</button>
      </div>
      <div id="confirmModal" class="confirm hidden">
        <div class="confirm-box">
          <p>Apakah anda yakin?</p>
          <div><button id="waitBtn" class="big-btn">Tunggu</button> <button id="sureBtn" class="big-btn">Yakin</button></div>
        </div>
      </div>
    </div>
  `;
  landing.appendChild(page);

  document.getElementById('backToHome').addEventListener('click', ()=>{ playSound('click'); page.remove(); weeklyResetCheck(); });
  // quiz logic
  startQuiz();
}

// QUESTIONS (20 sample). You can edit or replace this array later.
const QUESTIONS = [
  {"q":"Ibukota Indonesia?","a":["Jakarta","Bandung","Surabaya","Medan"],"c":0},
  {"q":"Planet terdekat ke matahari?","a":["Bumi","Venus","Merkurius","Mars"],"c":2},
  {"q":"Hewan yang melahirkan dan menyusui anaknya?","a":["Ikan","Burung","Mamalia","Reptil"],"c":2},
  {"q":"Bahasa resmi PBB?","a":["Indonesia","Inggris","Spanyol","Inggris, Perancis, Rusia, Mandarin, Arab, Spanyol"],"c":3},
  {"q":"Siapa penemu telepon?","a":["Thomas Edison","Alexander Graham Bell","Nikola Tesla","Tim Berners-Lee"],"c":1},
  {"q":"Satu jam = ... menit?","a":["30","60","90","120"],"c":1},
  {"q":"Bendera Jepang berlambang?","a":["Bulan","Matahari","Bintang","Burung"],"c":1},
 {"q":"Suhu beku air (°C)?","a":["0","100","-10","10"],"c":0},
  {"q":"Simbol emas dalam tabel periodik?","a":["Au","Ag","Fe","G"],"c":0},
  {"q":"Benua terbesar di dunia?","a":["Afrika","Antartika","Asia","Eropa"],"c":2},
  {"q":"Alat musik tiup?","a":["Gitar","Piano","Saxophone","Drum"],"c":2},
  {"q":"Siapa yang menulis 'Hamlet'?","a":["Dante","Victor Hugo","William Shakespeare","Goethe"],"c":2},
  {"q":"Nomor telepon darurat internasional?","a":["911","112","999","000"],"c":1},
  {"q":"Bentuk bumi?","a":["Datar","Bulat","Segitiga","Persegi"],"c":1},
  {"q":"Apa itu fotosintesis?","a":["Proses pernapasan","Proses membuat makanan oleh tumbuhan","Proses pencernaan","Proses reproduksi"],"c":1},
  {"q":"Zat yang membuat benda bermagnet?","a":["Besi","Air","Kertas","Plastik"],"c":0},
  {"q":"Satuan panjang SI?","a":["Meter","Inchi","Kaki","Yard"],"c":0},
  {"q":"Siapa capres pertama RI?","a":["Soekarno","Sudirman","Soeharto","Habibie"],"c":0},
  {"q":"Angka Romawi untuk 10?","a":["V","X","L","C"],"c":1},
  {"q":"Warna campuran merah + biru?","a":["Hijau","Ungu","Kuning","Oranye"],"c":1}
];

// shuffle helper
function shuffle(arr){ let a = arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }

let session = {
  queue: [],
  current: null,
  score: 0,
  usedHelp: false
};

function startQuiz(){
  session.queue = shuffle(QUESTIONS).slice(0); // full shuffled deck
  session.score = 0;
  session.current = null;
  session.usedHelp = false;
  renderQuestion();
  document.getElementById('helpWoman').addEventListener('click', useHelpWoman);
  document.getElementById('helpMan').addEventListener('click', useHelpMan);
}

function renderQuestion(){
  const qbox = document.getElementById('questionBox');
  const ansbox = document.getElementById('answers');
  if(session.queue.length===0){ endGame(); return; }
  session.current = session.queue.shift();
  qbox.textContent = session.current.q;
  ansbox.innerHTML = '';
  const choices = shuffle(session.current.a);
  choices.forEach((ch,idx)=>{
    const btn = document.createElement('button'); btn.className='answer-btn big-btn'; btn.textContent = ch;
    btn.addEventListener('click', ()=>confirmAnswer(ch));
    ansbox.appendChild(btn);
  });
  document.getElementById('curScore').textContent = session.score;
}

let pendingChoice = null;
function confirmAnswer(choice){
  pendingChoice = choice;
  const cm = document.getElementById('confirmModal');
  cm.classList.remove('hidden');
  playSound('click');
  document.getElementById('waitBtn').onclick = ()=>{ cm.classList.add('hidden'); playSound('click'); }
  document.getElementById('sureBtn').onclick = ()=>{ cm.classList.add('hidden'); checkAnswer(pendingChoice); pendingChoice = null; }
}

function checkAnswer(choice){
  // find index of choice in original current.a to determine correctness
  const correctText = session.current.a[session.current.c];
  const isCorrect = choice === correctText;
  if(isCorrect){
    playSound('correct');
    session.score += 10;
    flashCorrect(choice);
    setTimeout(()=>{ document.getElementById('curScore').textContent = session.score; renderQuestion(); },900);
  } else {
    playSound('wrong');
    alert('Anda salah'); // simple feedback
    // reset to initial position: restart session with fresh random
    startQuiz();
  }
}

function flashCorrect(choiceText){
  // visually highlight correct answer in answers area
  const buttons = document.querySelectorAll('.answer-btn');
  buttons.forEach(b=>{
    if(b.textContent === choiceText){
      b.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:600});
      b.style.boxShadow = '0 8px 18px rgba(0,200,150,0.18)';
    }
  });
}

// helper actions
function useHelpWoman(){
  if(session.usedHelp){ alert('Anda sudah menggunakan bantuan pada sesi ini'); return; }
  session.usedHelp = true;
  // show ad placeholder and deduct points
  showAd(()=>{ // after ad finishes
    playSound('help');
    // Display AISYAH (the real assets should be uploaded by you)
    alert('AISYAH: (memberikan jawaban yang tepat) - jawaban: ' + session.current.a[session.current.c]);
    session.score = Math.max(0, session.score - 3);
    document.getElementById('curScore').textContent = session.score;
  });
}

function useHelpMan(){
  if(session.usedHelp){ alert('Anda sudah menggunakan bantuan pada sesi ini'); return; }
  session.usedHelp = true;
  showAd(()=>{ playSound('help'); alert('DENY: Aku akan menghilangkan 2 jawaban yang salah. Sekarang ku serahkan sisanya padamu.'); session.score = Math.max(0, session.score - 2); document.getElementById('curScore').textContent = session.score; removeTwoWrongOptions(); });
}

function removeTwoWrongOptions(){
  const correctText = session.current.a[session.current.c];
  const buttons = Array.from(document.querySelectorAll('.answer-btn'));
  let wrongButtons = buttons.filter(b=>b.textContent !== correctText);
  wrongButtons = shuffle(wrongButtons).slice(0,2);
  wrongButtons.forEach(b=>{ b.disabled = true; b.style.opacity = 0.45; });
}

// ad simulation
function showAd(callback){
  // simulate ad by a modal 3-second timer. In production, integrate Ad SDK here.
  const ad = document.createElement('div'); ad.className='ad-modal';
  ad.innerHTML = '<div class="ad-box"><p>Iklan sedang ditampilkan...</p><div id="adTimer">3</div></div>';
  document.body.appendChild(ad);
  let t=3; const iv = setInterval(()=>{ t--; document.getElementById('adTimer').textContent = t; if(t<=0){ clearInterval(iv); ad.remove(); callback(); } },1000);
}

// end game
function endGame(){
  playSound('gameover');
  alert('Permainan selesai! Skor Anda: ' + session.score);
  if(session.score > settings.bestScore){
    const name = prompt('Skor baru! Masukkan nama Anda untuk disimpan di leaderboard (maks 20 char):') || 'Player';
    saveLocalLeaderboard(name.substring(0,20), session.score);
    settings.bestScore = session.score;
    localStorage.setItem('q_mbi_best', settings.bestScore);
    bestScoreEl.textContent = settings.bestScore;
  }
  // return to landing
  document.querySelectorAll('.page').forEach(e=>e.remove());
}

// Local leaderboard (fallback)
function getLocalLeaderboard(){
  const raw = localStorage.getItem('q_mbi_lb');
  if(!raw) return [];
  try{ return JSON.parse(raw); }catch(e){ return []; }
}
function saveLocalLeaderboard(name, score){
  const lb = getLocalLeaderboard();
  lb.push({name,score});
  lb.sort((a,b)=>b.score-a.score);
  const top10 = lb.slice(0,10);
  localStorage.setItem('q_mbi_lb', JSON.stringify(top10));
}

// small util
function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// Allow developer to programmatically update QUESTIONS by editing js/game.js or loading an external questions.json
