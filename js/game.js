// QUIZ PINTAR VERSI MBI - main JS
// Uses localStorage for settings. Replace audio/image placeholders in /assets as needed.

// ===== BACKSOUND =====
const bgMusic = new Audio("assets/sounds/bgm.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5; // optional

startBtn.addEventListener('click', ()=>{
  playSound('start');
  bgMusic.play(); // <-- Tambahkan ini tepat di sini
  openQuiz();
});

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
  bestScore: parseInt(localStorage.getItem('q_mbi_best') || '0', 10),
  lastReset: parseInt(localStorage.getItem('q_mbi_reset') || '0', 10)
};

// Score weekly reset
function weeklyResetCheck(){
  const now = Date.now();
  if(!settings.lastReset){
    settings.lastReset = now;
    localStorage.setItem('q_mbi_reset', now);
    return;
  }
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if(now - settings.lastReset >= sevenDays){
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
  if(overlay) overlay.classList.remove('hidden');
  let p = 0;
  const t = setInterval(()=>{
    p += Math.floor(Math.random() * 12) + 6;
    if(p > 100) p = 100;
    if(progressFill) progressFill.style.width = p + '%';
    if(progressText) progressText.textContent = p + '%';
    if(p >= 100){
      clearInterval(t);
      setTimeout(()=>{
        if(overlay) overlay.classList.add('hidden');

if(landing){
  landing.classList.remove('hidden');
  landing.classList.add('show');
}

playSound('start');

      }, 600);
    }
  }, 200);
}

// Sound system
const sounds = {
  start: 'assets/sounds/start.mp3',
  click: 'assets/sounds/click.mp3',
  correct: 'assets/sounds/correct.mp3',
  wrong: 'assets/sounds/wrong.mp3',
  gameover: 'assets/sounds/gameover.mp3',
  help: 'assets/sounds/help.mp3'
};
let audios = {};
for(let k in sounds){
  try{
    audios[k] = new Audio(sounds[k]);
    audios[k].preload = 'auto';
  }catch(e){
    audios[k] = null;
  }
}
function playSound(name){
  if(!settings.sound) return;
  const a = audios[name];
  if(a){
    try{ a.currentTime = 0; a.play(); }catch(e){ /* ignore */ }
  } 
}
function showHelper(img, text, callback) {
  const popup = document.getElementById('helperPopup');
  const imgEl = document.getElementById('helperImg');
  const textEl = document.getElementById('helperText');
  const closeBtn = document.getElementById('closeHelper');

  imgEl.src = img;
  textEl.textContent = text;

  popup.classList.remove("hidden");
  popup.classList.add("show");

  closeBtn.onclick = () => {
    popup.classList.remove("show");
    setTimeout(()=> popup.classList.add("hidden"), 300);
    setTimeout(callback, 200);
  };
}




// Sound Toggle: using compatible emojis
const soundIcon = document.getElementById("soundIcon");

function updateSoundIcon(){
  soundIcon.src = settings.sound 
    ? "assets/icons/sound_on.png" 
    : "assets/icons/sound_off.png";
}


function toggleSound(){
  settings.sound = !settings.sound;
  localStorage.setItem('q_mbi_sound', settings.sound ? 'on' : 'off');
  updateSoundIcon();

  if(settings.sound){
    bgMusic.play();
  } else {
    bgMusic.pause();
  }

  playSound('click');
}



// Navigation handlers
if(startBtn) startBtn.addEventListener('click', ()=>{ playSound('start'); openQuiz(); });
if(leaderBtn) leaderBtn.addEventListener('click', ()=>{ playSound('click'); openLeaderboard(); });
if(guideBtn) guideBtn.addEventListener('click', ()=>{ playSound('click'); openGuide(); });

// Simple page render functions
function clearMain(){ document.querySelectorAll('.page').forEach(e=>e.remove()); }

function openGuide(){
  clearMain();
  const page = document.createElement('div'); page.className = 'page';
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
  const page = document.createElement('div'); page.className = 'page';
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
  landing.classList.add('hidden'); // sembunyikan landing

  const quizPage = document.getElementById('quizPage');
quizPage.innerHTML = "";
quizPage.classList.remove('hidden');
quizPage.classList.add('show');

const page = document.createElement('div');
page.className = 'quiz-area page-transition';

page.innerHTML = `
 <div class="topbar">
  <button id="backToHome" class="round-btn">
  <img src="assets/icons/back.png" alt="back" id="backIcon">
</button>
   <div class="score">Score: <span id="curScore">0</span></div>
 </div>
 <div class="question-box" id="questionBox">Memuat pertanyaan...</div>
 <div class="answers" id="answers"></div>
<div class="helpers">
  <button id="helpMan" class="helper-btn">
    <img src="assets/icons/deny.png" alt="Deny">
  </button>
  <button id="helpWoman" class="helper-btn">
    <img src="assets/icons/aisyah.png" alt="Aisyah">
  </button>
</div>
`;

quizPage.appendChild(page);

setTimeout(() => {
  page.classList.add('show');
}, 50);

document.getElementById('backToHome').addEventListener('click', ()=>{
  playSound('click');
  page.classList.remove('show');
  page.classList.add('fade-out');

  setTimeout(()=>{
    quizPage.classList.add('hidden');
    landing.classList.remove('hidden');
  }, 350);
});

startQuiz();

}

// QUESTIONS (20 sample)
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

// helpers
function shuffle(arr){ let a = arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }

let session = { queue: [], current: null, score: 0, usedHelp: false };

function startQuiz(){
  session.queue = shuffle(QUESTIONS).slice(0);
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
  if(session.queue.length === 0){ endGame(); return; }
  session.current = session.queue.shift();
  qbox.textContent = session.current.q;
  ansbox.innerHTML = '';
  const choices = shuffle(session.current.a);
  choices.forEach((ch,idx)=>{
    const btn = document.createElement('button'); btn.className='answer-btn big-btn'; btn.textContent = ch;
    btn.addEventListener('click', ()=>confirmAnswer(ch));
    ansbox.appendChild(btn);
  });
  const curScoreEl = document.getElementById('curScore');
  if(curScoreEl) curScoreEl.textContent = session.score;
}

let pendingChoice = null;
function confirmAnswer(choice){
  pendingChoice = choice;
  const cm = document.getElementById('confirmModal');
  if(cm) cm.classList.remove('hidden');
  playSound('click');
  document.getElementById('waitBtn').onclick = ()=>{ if(cm) cm.classList.add('hidden'); playSound('click'); }
  document.getElementById('sureBtn').onclick = ()=>{ if(cm) cm.classList.add('hidden'); checkAnswer(pendingChoice); pendingChoice = null; }
}

function checkAnswer(choice){
  const correctText = session.current.a[session.current.c];
  const isCorrect = choice === correctText;
  if(isCorrect){
    playSound('correct');
    session.score += 10;
    flashCorrect(choice);
    setTimeout(()=>{ const curScoreEl = document.getElementById('curScore'); if(curScoreEl) curScoreEl.textContent = session.score; renderQuestion(); },900);
  } else {
    playSound('wrong');
    alert('Anda salah');
    startQuiz();
  }
}

function flashCorrect(choiceText){
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

  showAd(()=>{ 
    playSound('help'); 
    showHelper('assets/images/aisyah.png', 
      "Menurut saya jawaban yang benar adalah: " + session.current.a[session.current.c],
      () => {
        session.score = Math.max(0, session.score - 3);
        document.getElementById('curScore').textContent = session.score;
      }
    );
  });
}


function useHelpMan(){
  if(session.usedHelp){ alert('Anda sudah menggunakan bantuan pada sesi ini'); return; }
  session.usedHelp = true;

  showAd(()=>{
    playSound('help');
    showHelper('assets/images/deny.png',
      "Saya akan membantu anda untuk menghapus 2 jawaban yang salah, sekarang keputusan ada di tangan anda!",
      () => {
        session.score = Math.max(0, session.score - 2);
        document.getElementById('curScore').textContent = session.score;
        removeTwoWrongOptions();
      }
    );
  });
}


function removeTwoWrongOptions(){
  const correctText = session.current && session.current.a ? session.current.a[session.current.c] : null;
  if(!correctText) return;

  const buttons = Array.from(document.querySelectorAll('.answer-btn'));
  // Filter jawaban yang salah
  let wrongButtons = buttons.filter(b => b.textContent !== correctText);

  // Jika kurang dari 2 salah (edge-case), pakai semua yang ada
  if(wrongButtons.length === 0) return;
  wrongButtons = shuffle(wrongButtons).slice(0, 2);

  wrongButtons.forEach((btn, i) => {
    // beri jeda antar animasi agar terasa berurutan
    setTimeout(() => {
      playSound('help'); // efek suara tiap tombol hilang

      // animasi menghilang
      btn.style.transition = "transform 0.28s ease, opacity 0.28s ease";
      btn.style.transform = "scale(0.6)";
      btn.style.opacity = "0";

      // disable interaksi segera agar user tidak klik selama animasi
      btn.style.pointerEvents = "none";

      // hapus elemen setelah animasi selesai
      setTimeout(() => {
        if(btn && btn.parentNode) btn.parentNode.removeChild(btn);
      }, 320);
    }, i * 260);
  });
}



// ad simulation
function showAd(callback){
  const ad = document.createElement('div'); ad.className='ad-modal';
  ad.innerHTML = '<div class="ad-box"><p>Iklan sedang ditampilkan...</p><div id="adTimer">3</div></div>';
  document.body.appendChild(ad);
  let t = 3; const iv = setInterval(()=>{
    t--;
    const el = document.getElementById('adTimer');
    if(el) el.textContent = t;
    if(t <= 0){
      clearInterval(iv);
      ad.remove();
      callback();
    }
  },1000);
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
    if(bestScoreEl) bestScoreEl.textContent = settings.bestScore;
  }
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
function escapeHtml(s){ return (s + '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// Safety fallback if loader fails
setTimeout(()=>{
  if(overlay) overlay.classList.add("hidden");
  if(landing) {
    landing.classList.remove("hidden");
    landing.classList.add("show");
  }
}, 4000);


document.addEventListener("DOMContentLoaded", runLoader);

function saveLocalLeaderboard(name, score){
  let leaderboard = JSON.parse(localStorage.getItem('quiz_scores')) || [];
  
  leaderboard.push({ name, score });

  // Urutkan dari skor tertinggi
  leaderboard.sort((a,b)=> b.score - a.score);

  // Simpan
  localStorage.setItem('quiz_scores', JSON.stringify(leaderboard));
}
document.getElementById("backBtn").addEventListener("click", ()=>{
  location.href = "index.html";
});
