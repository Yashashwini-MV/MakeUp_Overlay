// --- DOM / Canvas ---
const video  = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const label  = document.getElementById('stepLabel');

canvas.width = 640;
canvas.height = 480;

// --- Toggle flags (live regions) ---
let enableLipstick  = false;
let enableBlush     = false;
let enableEyeshadow = false;

// --- Colors ---
const lipstickColors = [
  'rgba(180, 76, 67, 0.55)', // soft red
  'rgba(225,170,150,0.55)',  // peach nude
  'rgba(190,115,120,0.55)'   // dusty rose
];
let lipstickIndex = 0;

const blushColor     = 'rgba(255,105,180,0.25)';
const eyeshadowColor = 'rgba(150,100,200,0.40)';

// --- State caches ---
let latestFace = null;
let gestureCooldown = false;
let feedbackUntil = 0;

// --- Camera stream ---
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

// --- Mediapipe: FaceMesh ---
const faceMesh = new FaceMesh({
  locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
});
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true });
faceMesh.onResults(onFaceResults);

// --- Mediapipe: Hands ---
const hands = new Hands({
  locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
});
hands.setOptions({ maxNumHands: 1, modelComplexity: 0 });
hands.onResults(onHandResults);

// --- Camera ticker: run BOTH models every frame ---
const cam = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
    await hands.send({ image: video });
  },
  width: 640, height: 480
});
cam.start();

// =================== Draw pipeline ===================
function onFaceResults(res) {
  // live feed
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(res.image, 0, 0, canvas.width, canvas.height);

  if (!res.multiFaceLandmarks?.length) { latestFace = null; return; }
  latestFace = res.multiFaceLandmarks[0];

  if (enableLipstick)  drawLips(latestFace);
  if (enableBlush)     drawBlush(latestFace);
  if (enableEyeshadow) drawEyeshadow(latestFace);

  // transient feedback bubble
  if (Date.now() < feedbackUntil) {
    // label already shows text; just keep background visible via CSS
  } else {
    label.textContent = statusText();
  }
}

// =================== Hand logic ===================
function onHandResults(res) {
  if (gestureCooldown || !latestFace) return;

  if (!res.multiHandLandmarks?.length) return;
  const hand = res.multiHandLandmarks[0];

  const tip = hand[8]; // index fingertip
  const fx = tip.x * canvas.width;
  const fy = tip.y * canvas.height;

  // Helper distance
  const d = (lm, x, y) => {
    const lx = lm.x * canvas.width, ly = lm.y * canvas.height;
    return Math.hypot(lx - x, ly - y);
  };

  // Face reference points
  const lipRef   = latestFace[61];
  const cheekRef = latestFace[234];
  const eyeRef   = latestFace[33];

  // Point-to-activate thresholds (pixels)
  const LIP_R   = 44;
  const CHEEK_R = 56;
  const EYE_R   = 52;

  // Open-palm reset (all 4 fingers extended)
  const palmOpen =
    hand[8].y  < hand[6].y  &&
    hand[12].y < hand[10].y &&
    hand[16].y < hand[14].y &&
    hand[20].y < hand[18].y;

  if (palmOpen) {
    enableLipstick = enableBlush = enableEyeshadow = false;
    feedback("Reset ✋ cleared all makeup");
    coolDown();
    return;
  }

  // Finger near a region → enable that region
  if (d(lipRef, fx, fy) < LIP_R) {
    enableLipstick = true;
    feedback("Lipstick on 💄 (pointed to lips)");
    coolDown();
    return;
  }
  if (d(cheekRef, fx, fy) < CHEEK_R) {
    enableBlush = true;
    feedback("Blush on 🍑 (pointed to cheek)");
    coolDown();
    return;
  }
  if (d(eyeRef, fx, fy) < EYE_R) {
    enableEyeshadow = true;
    feedback("Eyeshadow on 👁️ (pointed to eye)");
    coolDown();
    return;
  }

  // Optional: closed fist to cycle lipstick color
  const fist =
    hand[8].y  > hand[6].y &&
    hand[12].y > hand[10].y &&
    hand[16].y > hand[14].y;
  if (fist) {
    lipstickIndex = (lipstickIndex + 1) % lipstickColors.length;
    if (enableLipstick) feedback("Lipstick color changed");
    coolDown();
  }
}

function coolDown(ms = 900) {
  gestureCooldown = true;
  setTimeout(() => (gestureCooldown = false), ms);
}

function feedback(text) {
  label.textContent = text + " • ✋ reset";
  feedbackUntil = Date.now() + 1200;
}

function statusText() {
  const on = [];
  if (enableLipstick)  on.push("Lipstick");
  if (enableBlush)     on.push("Blush");
  if (enableEyeshadow) on.push("Eyeshadow");
  return (on.length ? `ON: ${on.join(", ")}` : "point to lips/cheeks/eyes • ✋ to reset");
}

// =================== Makeup painters ===================
function drawLips(lm) {
  ctx.fillStyle = lipstickColors[lipstickIndex];
  const idx = [61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146];
  ctx.beginPath();
  ctx.moveTo(lm[idx[0]].x * canvas.width, lm[idx[0]].y * canvas.height);
  for (let i = 1; i < idx.length; i++) {
    const p = lm[idx[i]];
    ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
  }
  ctx.closePath();
  ctx.fill();
}

function drawBlush(lm) {
  [234, 454].forEach(id => {
    const x = lm[id].x * canvas.width;
    const y = lm[id].y * canvas.height;
    const g = ctx.createRadialGradient(x, y, 6, x, y, 46);
    g.addColorStop(0, blushColor);
    g.addColorStop(1, 'rgba(255,105,180,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 46, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEyeshadow(lm) {
  ctx.fillStyle = eyeshadowColor;
  const left  = [33,246,161,160,159,158,157,173];
  const right = [362,398,384,385,386,387,388,466];
  [left, right].forEach(indices => {
    ctx.beginPath();
    ctx.moveTo(lm[indices[0]].x * canvas.width, lm[indices[0]].y * canvas.height);
    for (let i = 1; i < indices.length; i++) {
      const p = lm[indices[i]];
      ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
    }
    ctx.closePath();
    ctx.fill();
  });
}
