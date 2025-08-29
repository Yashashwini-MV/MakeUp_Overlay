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
