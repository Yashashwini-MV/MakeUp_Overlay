// Elements
const video   = document.getElementById('video');
const canvas  = document.getElementById('view');
const ctx     = canvas.getContext('2d');
const scanner = document.getElementById('scanner');
const result  = document.getElementById('result');

// Start camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
  .then(stream => video.srcObject = stream)
  .catch(err => {
    scanner.textContent = "Camera access failed. Please allow camera permissions.";
    console.error(err);
  });

// --- FaceMesh setup (UMD) ---
const faceMesh = new FaceMesh({
  locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

const camera = new Camera(video, {
  onFrame: async () => { await faceMesh.send({ image: video }); },
  width: 720,
  height: 540
});
camera.start();

// -------- Sampling helpers (no green lines) --------
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

// sample a disc around one landmark (fast & region-specific)
function sampleDiscStats(landmarks, idx, radiusPx) {
  const cx = Math.round(landmarks[idx].x * canvas.width);
  const cy = Math.round(landmarks[idx].y * canvas.height);
  const r2 = radiusPx * radiusPx;

  const img = ctx.getImageData(
    clamp(cx - radiusPx, 0, canvas.width - 1),
    clamp(cy - radiusPx, 0, canvas.height - 1),
    clamp(2 * radiusPx, 1, canvas.width),
    clamp(2 * radiusPx, 1, canvas.height)
  );

  let sumR = 0, sumG = 0, sumB = 0, sumBr = 0, sumBr2 = 0, n = 0;
  const w = img.width;

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const dx = x + (cx - (cx - radiusPx)) - cx;
      const dy = y + (cy - (cy - radiusPx)) - cy;
      if (dx*dx + dy*dy > r2) continue;

      const i = (y * w + x) * 4;
      const r = img.data[i], g = img.data[i+1], b = img.data[i+2];
      const br = (r + g + b) / 3;

      sumR += r; sumG += g; sumB += b; sumBr += br; sumBr2 += br*br; n++;
    }
  }
  if (!n) return { r:0, g:0, b:0, mean:0, std:0 };
  const mean = sumBr / n;
  const variance = (sumBr2 / n) - (mean * mean);
  return { r:sumR/n, g:sumG/n, b:sumB/n, mean, std: Math.sqrt(Math.max(variance, 0)) };
}

// compute a pixel radius relative to face size
function faceScale(landmarks) {
  // distance between eye corners (33 and 263)
  const a = landmarks[33], b = landmarks[263];
  const dx = (a.x - b.x) * canvas.width;
  const dy = (a.y - b.y) * canvas.height;
  return Math.hypot(dx, dy); // eye span in px
}

// --- Analysis
faceMesh.onResults(res => {
  // Draw only the frame (no landmark lines)
  ctx.drawImage(res.image, 0, 0, canvas.width, canvas.height);

  if (!res.multiFaceLandmarks || !res.multiFaceLandmarks.length) {
    scanner.textContent = "Face not detected. Please face the camera in good light.";
    return;
  }

  const lm  = res.multiFaceLandmarks[0];
  const fpx = faceScale(lm);
  const R   = Math.max(4, Math.round(fpx * 0.08)); // sampling radius ≈ 8% of eye span

  // Regions (single landmark centers)
  const stats = {
    forehead : sampleDiscStats(lm, 10,  R),
    nose     : sampleDiscStats(lm, 1,   R),
    leftCheek: sampleDiscStats(lm, 234, R),
    rightCheek:sampleDiscStats(lm, 454, R),
    chin     : sampleDiscStats(lm, 152, R),
    underLE  : sampleDiscStats(lm, 145, Math.round(R*0.75)),
    underRE  : sampleDiscStats(lm, 374, Math.round(R*0.75)),
  };

  const cheeksMean = (stats.leftCheek.mean + stats.rightCheek.mean) / 2;
  const underEyesMean = (stats.underLE.mean + stats.underRE.mean) / 2;

  // ---- Classifications (simple, fast heuristics) ----
  let skinType = "Normal";
  const oilyAll   = [stats.forehead.mean, stats.nose.mean, cheeksMean, stats.chin.mean].every(v => v > 165);
  const dryAll    = [stats.forehead.mean, stats.nose.mean, cheeksMean, stats.chin.mean].every(v => v < 105);
  const tzoneOily = (stats.forehead.mean > cheeksMean + 18) && (stats.nose.mean > cheeksMean + 18);

  if (oilyAll) skinType = "Oily";
  else if (dryAll) skinType = "Dry";
  else if (tzoneOily) skinType = "Combination (T-zone oily)";

  // redness / acne tendency on cheeks (red dominance)
  const cheekR = (stats.leftCheek.r + stats.rightCheek.r) / 2;
  const cheekG = (stats.leftCheek.g + stats.rightCheek.g) / 2;
  const cheekB = (stats.leftCheek.b + stats.rightCheek.b) / 2;
  const rednessScore = cheekR - (cheekG + cheekB) / 2; // > 14 → notable redness

  const hasRedness = rednessScore > 14;

  // dark circles: under-eye much darker than cheeks
  const hasDarkCircles = (cheeksMean - underEyesMean) > 22;

  // texture hint via brightness std deviation
  const textureCheeks = (stats.leftCheek.std + stats.rightCheek.std) / 2;
  const textureForehead = stats.forehead.std;
  const coarseTexture = (textureCheeks + textureForehead) / 2 > 22; // heuristic

  // ---- Recommendations (professional tone) ----
  const recs = [];

  if (skinType === "Oily") {
    recs.push("Use a gentle foaming cleanser and a non-comedogenic, oil-free moisturizer.");
    recs.push("Introduce 2% salicylic acid or niacinamide (4–10%) to control sebum.");
    recs.push("Prefer mineral or gel sunscreen labeled 'oil-free' (SPF 30+).");
  } else if (skinType === "Dry") {
    recs.push("Use a low-pH hydrating cleanser; avoid harsh scrubs.");
    recs.push("Moisturize with ceramides and hyaluronic acid; consider occlusives at night.");
    recs.push("Apply broad-spectrum SPF 30+ daily to prevent further barrier stress.");
  } else if (skinType === "Combination (T-zone oily)") {
    recs.push("Use a balancing routine: gel textures on the T-zone, richer cream on cheeks.");
    recs.push("Spot-treat the T-zone with niacinamide or salicylic acid 2–3×/week.");
    recs.push("Choose a lightweight, non-comedogenic sunscreen.");
  } else {
    recs.push("Maintain a consistent routine: gentle cleanse, moisturize, and daily SPF 30+.");
  }

  if (hasRedness) {
    recs.push("Cheek redness detected: consider azelaic acid (10%) or niacinamide; avoid alcohol-heavy products.");
  }
  if (hasDarkCircles) {
    recs.push("Under-eye darkness noted: prioritize sleep/hydration; consider caffeine or vitamin K eye formulations.");
  }
  if (coarseTexture) {
    recs.push("Uneven texture observed: gentle chemical exfoliation (lactic acid 5–10% weekly) may help.");
  }

  // ---- Report UI ----
  const rows = [
    ["Forehead", stats.forehead.mean.toFixed(1)],
    ["Nose", stats.nose.mean.toFixed(1)],
    ["Left cheek", stats.leftCheek.mean.toFixed(1)],
    ["Right cheek", stats.rightCheek.mean.toFixed(1)],
    ["Chin", stats.chin.mean.toFixed(1)],
    ["Under-eyes (avg)", underEyesMean.toFixed(1)]
  ].map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");

  result.innerHTML = `
    <h2>Skin Analysis Report</h2>
    <div class="kpi">Overall skin type: <strong>${skinType}</strong></div>

    <div class="section">
      <table>
        <tr><th>Region</th><th>Mean brightness</th></tr>
        ${rows}
      </table>
    </div>

    <div class="section">
      <strong>Observations</strong>
      <ul style="margin:8px 0 0 16px">
        ${hasRedness ? "<li>Cheek redness present.</li>" : "<li>No marked cheek redness.</li>"}
        ${hasDarkCircles ? "<li>Under-eye shadows observed.</li>" : "<li>No significant under-eye darkness.</li>"}
        ${coarseTexture ? "<li>Texture appears slightly uneven.</li>" : "<li>Texture appears even.</li>"}
      </ul>
    </div>

    <div class="section">
      <strong>Recommendations</strong>
      <ul style="margin:8px 0 0 16px">
        ${recs.map(r => `<li>${r}</li>`).join("")}
      </ul>
    </div>
  `;

  scanner.style.display = "none";
  result.style.display  = "block";
});
