<div align="center">

# 🏎️ Flashing Car
### *A Nostalgic 2000s Flash-Style Arcade Circuit Racer*

[![HTML5](https://img.shields.io/badge/HTML5-Canvas%202D-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio](https://img.shields.io/badge/Web%20Audio-Procedural%20SFX-9B59B6?style=for-the-badge&logo=audio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![No Dependencies](https://img.shields.io/badge/Dependencies-0%20Zero-brightgreen?style=for-the-badge)]()

**Flashing Car** is a fast-paced, retro 2D top-down circuit racing game inspired by classic 2000s web arcade games from the golden era of Newgrounds, Miniclip, and Shockwave. 

Built using pure **HTML5 Canvas** and **vanilla JavaScript**, it features responsive arcade driving physics, procedural Web Audio sound synthesis, smart AI competitors, and signature flashing neon aesthetics—**with 100% zero external dependencies or build tools required**.

[Play Demo](#quick-start) • [Features](#features) • [Controls](#controls) • [Architecture](#project-structure)

</div>

---

## ⚡ Features

* **Authentic Arcade Physics:** Drift mechanics, tire friction, acceleration curves, and bounce-back barrier collisions tuned for snappy, arcade-feel handling.
* **Procedural Sound Engine:** 100% asset-free audio powered by the Web Audio API—generates engine revs, tire screeches, crash impacts, and lap chimes in real time.
* **Adaptive AI Competitors:** Waypoint-based computer opponents with dynamic collision avoidance and race positioning.
* **Zero Dependencies:** No npm, Webpack, Vite, or external asset pipelines. Native ES6+ and standard Canvas API.
* **Retro Visuals:** Neon trail effects, dynamic tire marks, flashing speed boosts, and scanline CRT options.

---

## 🎮 Controls

| Action | Primary Key | Alternative |
| :--- | :--- | :--- |
| **Accelerate** | `W` | `Up Arrow` |
| **Brake / Reverse** | `S` | `Down Arrow` |
| **Steer Left** | `A` | `Left Arrow` |
| **Steer Right** | `D` | `Right Arrow` |
| **Handbrake / Drift** | `Space` | `Shift` |
| **Pause Game** | `P` | `Escape` |
| **Mute Audio** | `M` | — |

---

## 🚀 Quick Start

Because **Flashing Car** has no build step, you can run it directly in any modern web browser.

### Option 1: Direct File Launch
Double-click `index.html` or drag it into Chrome, Firefox, Edge, or Safari.

### Option 2: Local HTTP Server (Recommended for Web Audio stability)
Using Python:
```bash
# Python 3
python -m http.server 8080
