# 💄 Virtual Lip-Shades & Blush Try-ons using Gestures  

A fun and interactive web app that lets users virtually try on **lipstick, blush, and eyeshadow** in real-time using their webcam. Makeup overlays are controlled with simple hand gestures for a completely touch-free experience.  

---

## ✨ Features  
- Real-time face landmark detection using **MediaPipe**  
- Virtual makeup overlays (lipstick, blush, eyeshadow)  
- Gesture-based activation and control  
- Smooth blending for a natural effect  
- Lightweight, browser-based implementation  

---

## 🖐️ Gesture-Based Control  
- 👉 **Point to Lips** → Enable lipstick  
- 👉 **Point to Cheeks** → Enable blush  
- 👉 **Point to Eyes** → Enable eyeshadow  
- ✊ **Closed Fist** → Change lipstick shade  
- ✋ **Open Hand** → Clear all makeup  

---

## 💋 Makeup Overlay  
- **Lipstick**: Applies color with soft blending for natural look  
- **Blush**: Adds color to cheeks with smooth fade  
- **Eyeshadow**: Overlays vibrant or subtle shades on eyelids  
- **Custom Colors**: Multiple shades available with gesture control  
- **Reset Option**: Remove all overlays instantly with open hand  

---

## 🚀 Usage  
1. Open `index.html` in your browser  
2. Allow **webcam access**  
3. Use gestures to enable makeup effects  
4. Switch shades with a fist ✊, reset with open hand ✋  

---

## 🛠 Tech Stack  
- **HTML5**  
- **CSS3**  
- **JavaScript**  
- **MediaPipe (Hand & Face Landmarks)**  
- **Canvas API**
  

# 🧴 Skin Brightness & Type Analysis  

A **real-time skin analysis web app** powered by **MediaPipe FaceMesh** and **OpenCV.js**.  
The app detects facial regions, computes brightness and texture statistics, and provides insights on **skin type** (Oily, Dry, Combination, Normal), while also flagging conditions such as **redness, dark circles, and uneven texture**. Personalized **skincare recommendations** are generated instantly.  

---

## ✨ Features  

- 📷 **Live Camera Analysis** – Uses webcam feed for real-time results.  
- 🌞 **Skin Brightness Detection** – Computes mean brightness across multiple face regions.  
- 💧 **Skin Type Classification** – Identifies Oily, Dry, Combination, or Normal skin types.  
- 🩸 **Redness Check** – Detects cheek redness (possible irritation/acne-prone tendency).  
- 😴 **Dark Circles Detection** – Identifies under-eye shadows relative to cheeks.  
- 🌸 **Texture Analysis** – Detects uneven texture via pixel variance.  
- 🧾 **Personalized Recommendations** – Provides skincare tips based on findings.  

---

## 🛠️ Tech Stack  

- **JavaScript** (frontend logic)  
- **MediaPipe FaceMesh** – Landmark detection  
- **MediaPipe Camera Utils** – Webcam handling  
- **OpenCV.js** – Image sampling & brightness calculations  
- **HTML5 + CSS3** – UI  

---

## 🚀 How It Works  

1. **Face Detection**  
   - MediaPipe FaceMesh tracks 468 face landmarks.  

2. **Region Sampling**  
   - Brightness & color sampled from key regions:  
     - Forehead  
     - Nose  
     - Cheeks  
     - Chin  
     - Under-eyes  

3. **Metrics Calculation**  
   - Mean brightness  
   - Color balance (R/G/B ratios)  
   - Standard deviation for texture  

4. **Classification**  
   - **Skin Type:** Oily, Dry, Combination (T-zone oily), Normal  
   - **Conditions:** Redness, Dark circles, Uneven texture  

5. **Recommendations**  
   - Generates tailored skincare advice using simple heuristics.  

---

## 📂 Project Structure  

skin-analysis:
  - index.html: "Main UI"
  - style.css: "Styling"
  - script.js: "Face analysis logic"
  - README.md: "Documentation"

---

## 👩‍💻 Contributors

Yashashwini MV – Developer  
