// QUIZ PINTAR VERSI MBI - main JS (FINAL VERSION)
// === GLOBAL ONLINE LEADERBOARD (SheetDB) ===
console.log('game.js loaded');

function submitScore(name, score) {
    fetch("https://sheetdb.io/api/v1/mqohml41m1yzb", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: [
                { name: name, score: score }
            ]
        })
    })
    .then(res => res.json())
    .then(data => console.log("Score saved:", data))
    .catch(err => console.error("Error saving score:", err));
}
// =============================================

// ===== BACKSOUND & SETTINGS =====
const bgMusic = new Audio("assets/sounds/bgm.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;

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

// Loader simulation
function runLoader(){
  const overlay = document.getElementById('overlay');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const landing = document.getElementById('landing');
  const bestScoreEl = document.getElementById('bestScore');
  
  if(bestScoreEl) bestScoreEl.textContent = settings.bestScore;
  
  if(overlay) overlay.classList.remove('hidden');
  let p = 0;
  const t = setInterval(()=>{
    p += 20;
    if(p > 100) p = 100;
    if(progressFill) progressFill.style.width = p + '%';
    if(progressText) progressText.textContent = p + '%';
    if(p === 100){
      clearInterval(t);
      setTimeout(()=>{
        if(overlay) overlay.classList.add('hidden');

        if(landing){
          landing.classList.remove('hidden');
          landing.classList.add('show');
        }

        playSound('start');

      }, 300);
    }
  }, 150);
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

  if(imgEl) imgEl.src = img || '';
  if(textEl) textEl.textContent = text || '';

  if(popup){
    popup.classList.remove("hidden");
    popup.classList.add("show");
  }

  if(closeBtn){
    closeBtn.onclick = () => {
      if(popup){
        popup.classList.remove("show");
        setTimeout(()=> popup.classList.add("hidden"), 300);
      }
      if(typeof callback === 'function') setTimeout(callback, 200);
    };
  } else {
    // fallback
    setTimeout(()=> { if(typeof callback === 'function') callback(); }, 300);
  }
}

// Sound Toggle: using compatible icons
function updateSoundIcon(){
  const soundIcon = document.getElementById("soundIcon");
  if(soundIcon){
    soundIcon.src = settings.sound 
      ? "assets/icons/sound_on.png" 
      : "assets/icons/sound_off.png";
  }
}

function toggleSound(){
  settings.sound = !settings.sound;
  localStorage.setItem('q_mbi_sound', settings.sound ? 'on' : 'off');
  updateSoundIcon();

  if(settings.sound){
    try{ bgMusic.play(); }catch(e){}
  } else {
    try{ bgMusic.pause(); }catch(e){}
  }

  playSound('click');
}

function initNavigation(){
  const startBtn = document.getElementById('startBtn');
  const leaderBtn = document.getElementById('leaderBtn');
  const petunjukBtn = document.getElementById('petunjukBtn'); 
  const soundToggle = document.getElementById('soundToggle');

  // START QUIZ (SUDAH DIPERBAIKI)
  if(startBtn) startBtn.addEventListener('click', ()=>{ 
    playSound('start'); 
    try{ bgMusic.play(); }catch(e){}
    openQuiz(); 
  });
  
  if(leaderBtn) leaderBtn.addEventListener('click', ()=>{ playSound('click'); openLeaderboard(); });
  // Tombol Petunjuk
  if(petunjukBtn) petunjukBtn.addEventListener('click', ()=>{ playSound('click'); openGuide(); }); 
  
  if(soundToggle) soundToggle.addEventListener('click', toggleSound);
   
  updateSoundIcon();
}

// Simple page render functions
function clearMain(){ document.querySelectorAll('.page').forEach(e=>e.remove()); }

function openGuide(){
  clearMain();
  const landing = document.getElementById('landing');
  const page = document.createElement('div'); page.className = 'page';
  page.innerHTML = `
    <div class="modal">
      <h2>Petunjuk</h2>
      <p>Di setiap pertanyaan ada 4 jawaban dan hanya 1 jawaban yang benar. Bila anda kesulitan, ada 2 bantuan (AISYAH & DENY). Perhatikan: Setiap sesi hanya boleh menggunakan 1 bantuan. Gunakan dengan bijak. Capai nilai tertinggi Anda dan tunjukkan kemampuan Anda.</p>
      <button id="backFromGuide" class="big-btn">Kembali</button>
    </div>
  `;
  if(landing) landing.appendChild(page);
  const back = document.getElementById('backFromGuide');
  if(back) back.addEventListener('click', ()=>{ playSound('click'); page.remove(); });
}
function openLeaderboard() {
    clearMain();
    const landing = document.getElementById('landing');
    const page = document.createElement('div');
    page.className = 'page';

    page.innerHTML = `
        <div class="modal">
            <h2>Leaderboard Global</h2>
            <div id="lbLoading">Memuat data...</div>
            <div class="lb-list" id="lbList"></div>
            <button id="backFromLB" class="big-btn" style="margin-top:12px">Kembali</button>
        </div>
    `;

    if (landing) landing.appendChild(page);

    const backBtn = document.getElementById('backFromLB');
    if (backBtn) backBtn.addEventListener('click', () => {
        playSound('click');
        page.remove();
    });

    // === AMBIL DATA GLOBAL DARI SHEETDB ===
    loadLeaderboard().then(data => {
        const lb = document.getElementById('lbList');
        const loading = document.getElementById('lbLoading');

        if (loading) loading.remove();

        if (!lb) return;

        if (!data || data.length === 0) {
            lb.innerHTML = '<div class="empty">Belum ada data leaderboard global.</div>';
            return;
        }

        lb.innerHTML = data
            .map((r, i) => `
                <div class="lb-row">${i + 1}. <b>${escapeHtml(r.name)}</b> - ${r.score}</div>
            `)
            .join('');
    });
}


function openQuiz(){
  const landing = document.getElementById('landing');
  if(landing) landing.classList.add('hidden'); // sembunyikan landing

  const quizPage = document.getElementById('quizPage');
  if(!quizPage) return;
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

// Di dalam fungsi openQuiz()...

  const backBtn = document.getElementById('backToHome');
  if(backBtn){
    backBtn.addEventListener('click', ()=>{
      playSound('click');
      
      // === LOGIKA BARU: SIMPAN SKOR SAAT KELUAR DAN RESET ===
      const currentScore = session.score;
      if (currentScore > 0) {
          // Hanya simpan jika skor lebih dari 0
          saveToLeaderboard(promptForName(currentScore), currentScore);
      }
      
      // Pastikan skor sesi direset setelah disimpan
      session.score = 0;
      session.usedHelp = false; 
      // =======================================================
      
      page.classList.remove('show');
      page.classList.add('fade-out');

      setTimeout(()=>{
        quizPage.classList.add('hidden');
        if(landing) landing.classList.remove('hidden');
        
        // Update tampilan Best Score di Landing Page jika diperlukan
        const bestScoreEl = document.getElementById('bestScore');
        if(bestScoreEl) bestScoreEl.textContent = settings.bestScore; 
      }, 350);
    });
  }

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
  const hw = document.getElementById('helpWoman');
  const hm = document.getElementById('helpMan');
  if(hw) hw.addEventListener('click', useHelpWoman);
  if(hm) hm.addEventListener('click', useHelpMan);
}

function renderQuestion(){
  const qbox = document.getElementById('questionBox');
  const ansbox = document.getElementById('answers');
  if(!qbox || !ansbox){
    console.warn('renderQuestion: missing DOM elements');
    return;
  }
  if(session.queue.length === 0){ endGame(); return; }
  session.current = session.queue.shift();
  qbox.textContent = session.current.q;
ansbox.innerHTML = ''; 
  
  const indexedChoices = session.current.a.map((text, index) => ({
    text,
    isCorrect: index === session.current.c
  }));

  const shuffledChoices = shuffle(indexedChoices);

  // === BLOK KODE YANG MEMBUAT TOMBOL DAN MELAMPIRKAN KLIK ===
  shuffledChoices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn big-btn'; // KRITIS: Kelas harus ada
    btn.textContent = choice.text;
    
    // KRITIS: Langsung panggil checkAnswer()
    btn.addEventListener("click", () => {
      playSound('click');
      // Menonaktifkan semua tombol setelah diklik (agar pemain tidak klik berkali-kali)
      document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
      checkAnswer(btn.textContent.trim());
    });
    
    ansbox.appendChild(btn); // Tambahkan tombol ke DOM
  });
  // ==========================================================

  const curScoreEl = document.getElementById('curScore');
  if(curScoreEl) curScoreEl.textContent = session.score;
}



function checkAnswer(choice) {
    const correctAnswerText = session.current.a[session.current.c];

    if (choice.trim() === correctAnswerText.trim()) {
        session.score += 10; // ✅ SKOR DITAMBAHKAN
        playSound("correct");
        flashCorrect(correctAnswerText);
    } else {
        playSound("wrong");
        flashCorrect(correctAnswerText); 
    }

    const curScoreEl = document.getElementById("curScore");
    if (curScoreEl) {
        curScoreEl.textContent = session.score; 
    }

    // Lanjut ke pertanyaan berikutnya
    setTimeout(() => {
        // ✅ AKTIFKAN KEMBALI SEMUA TOMBOL
        document.querySelectorAll('.answer-btn').forEach(b => b.disabled = false);
        renderQuestion();
    }, 4000); 
}


function flashCorrect(choiceText){
  const buttons = document.querySelectorAll('.answer-btn');
  buttons.forEach(b=>{
    if(b.textContent.trim() === choiceText.trim()){
      // 1. Tambahkan kelas yang akan mendefinisikan kedipan
      b.classList.add('correct-flash');
      
      // 2. Hapus kelas setelah 600ms (agar kembali ke gaya neon semula)
      setTimeout(() => {
        b.classList.remove('correct-flash');
      }, 600);
    }
  });
}

// helper actions
function useHelpWoman(){
  if(session.usedHelp){ alert('Anda sudah menggunakan bantuan pada sesi ini'); return; }
  if(!session.current) return;
  session.usedHelp = true;

  showAd(()=>{ 
    playSound('help'); 
    showHelper('assets/images/aisyah.png', 
      "Menurut saya jawaban yang benar adalah: " + session.current.a[session.current.c],
      () => {
        session.score = Math.max(0, session.score - 3);
        const curScoreEl = document.getElementById('curScore');
        if(curScoreEl) curScoreEl.textContent = session.score;
      }
    );
  });
}

function useHelpMan(){
  if(session.usedHelp){ alert('Anda sudah menggunakan bantuan pada sesi ini'); return; }
  if(!session.current) return;
  session.usedHelp = true;

  showAd(()=>{
    playSound('help');
    showHelper('assets/images/deny.png',
      "Saya akan membantu anda untuk menghapus 2 jawaban yang salah, sekarang keputusan ada di tangan anda!",
      () => {
        session.score = Math.max(0, session.score - 2);
        const curScoreEl = document.getElementById('curScore');
        if(curScoreEl) curScoreEl.textContent = session.score;
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
      if(ad && ad.parentNode) ad.parentNode.removeChild(ad);
      if(typeof callback === 'function') callback();
    }
  },1000);
}

function endGame(){
function endGame(){
  playSound('gameover');

  const finalScore = session.score;
  alert('Permainan selesai! Skor Anda: ' + finalScore);

  // update best score
  if(finalScore > settings.bestScore){
    settings.bestScore = finalScore;
    localStorage.setItem('q_mbi_best', String(settings.bestScore));
    const bestScoreEl = document.getElementById('bestScore');
    if(bestScoreEl) bestScoreEl.textContent = settings.bestScore;
  }

  // simpan ke leaderboard lokal
  const playerName = promptForName(finalScore);
  saveToLeaderboard(playerName, finalScore);

  // === SIMPAN JUGA KE LEADERBOARD GLOBAL (ONLINE) ===
  submitScore(playerName, finalScore);

  // Kembali ke menu (komentar: hanya catatan)
  // Kembali ke menu

  // Kembalikan tampilan ke menu / landing
  const quizPage = document.getElementById('quizPage');
  const landing = document.getElementById('landing');
  if(quizPage) quizPage.classList.add('hidden');
  if(landing) landing.classList.remove('hidden');

  // === TAMBAHAN: RESET SESI SAAT GAME OVER ===
  session.score = 0;
  session.usedHelp = false;
}

// helper for prompting name safely
function promptForName(finalScore){
  try{
    const defaultName = "Pemain";
    const raw = prompt("Skor Anda: " + finalScore + "\\nMasukkan nama untuk leaderboard (maks 20 char):", defaultName) || defaultName;
    return String(raw).substring(0,20);
  }catch(e){
    return "Pemain";
  }
}

// Local leaderboard (fallback)
function getLocalLeaderboard(){
  const raw = localStorage.getItem('q_mbi_lb');
  if(!raw) return [];
  try{ return JSON.parse(raw); }catch(e){ return []; }
}
function saveToLeaderboard(name, score){
  if(!name) name = "Pemain";
  try{
    let lb = getLocalLeaderboard();
    lb.push({name: name, score: Number(score) || 0});
    lb.sort((a,b)=>b.score-a.score);
    lb = lb.slice(0,10);
    localStorage.setItem('q_mbi_lb', JSON.stringify(lb));
  }catch(e){ console.error('saveToLeaderboard', e); }
}

// small util
function escapeHtml(s){ return (s + '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// Safety fallback if loader fails
setTimeout(()=>{
  const overlay = document.getElementById('overlay');
  const landing = document.getElementById('landing');
  if(overlay) overlay.classList.add("hidden");
  if(landing) {
    landing.classList.remove("hidden");
    landing.classList.add("show");
  }
}, 4000);

document.addEventListener("DOMContentLoaded", ()=>{
  initNavigation();
  runLoader();
});

// Akhir dari file js/game.js



