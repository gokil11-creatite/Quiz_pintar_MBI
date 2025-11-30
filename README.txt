QUIZ PINTAR VERSI MBI
=====================

Isi paket:
- index.html               -> Landing + loader + quiz rendering
- style.css                -> Styling
- js/game.js               -> Semua logika quiz, loader, sounds, leaderboard local
- assets/images/logo-placeholder.png  -> placeholder image (upload your logo here)
- assets/images/bg-placeholder.jpg    -> placeholder background (upload your background here)
- assets/sounds/ (place your sound files here with these names:)
    - start.mp3
    - click.mp3
    - correct.mp3
    - wrong.mp3
    - gameover.mp3
    - help.mp3

Fitur penting:
- Overlay loader with rotating logo and progress bar.
- Landing page with replaceable background and circular logo.
- 3D hologram heading text.
- Sound on/off toggle (persists in localStorage).
- Buttons: AYO MULAI, LEADERBOARD, PETUNJUK.
- Ad banner placeholder.
- Best score tracked locally and reset every 7 days automatically.
- In-quiz: question box, 4 answers, two helper buttons (AISYAH & DENY).
  - Using a helper triggers an ad simulation and reduces score.
  - AISYAH will provide the exact answer (simulated by an alert).
  - DENY will remove 2 wrong answers.
- Local leaderboard (top 10) stored in localStorage, with prompt to save name when achieving new high score.
- Questions randomized each session (20 sample questions provided in js/game.js).

How to enable online/global leaderboard (optional):
1. Create a Firebase project and enable Realtime Database or Firestore.
2. Create a file named firebase-config.js in /js/ with your Firebase config and helper functions.
3. Modify js/game.js where indicated to use Firebase to read/write leaderboard.

How to update questions:
- Edit the QUESTIONS array in js/game.js or change the script to load an external questions.json.

Packaging:
This zip contains a ready-to-run single-page game. Open index.html in a browser (best on a web server or using a file manager that allows local audio).

Notes & next steps:
- Replace placeholder images in assets/images with your uploads (logo & background).
- Upload your sound files to assets/sounds as named above.
- If you'd like, I can add Firebase integration boilerplate with instructions for your Firebase config (you'll need to supply your API keys/config).
