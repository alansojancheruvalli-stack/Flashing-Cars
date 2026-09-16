// game.js - Core Game Engine, AI navigation, Camera, Particle System, HUD, and Loop

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.skids = [];
    this.maxSkids = 450;
  }

  addSkid(x, y, angle, intensity = 0.6) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const w = 11;
    // Left & right wheel positions
    this.skids.push({
      x1: x - sin * w,
      y1: y + cos * w,
      x2: x + sin * w,
      y2: y - cos * w,
      alpha: Math.min(0.7, 0.3 * intensity),
      life: 600 // Frames until fading
    });
    if (this.skids.length > this.maxSkids) {
      this.skids.shift();
    }
  }

  addSmoke(x, y, angle, width) {
    const rearX = x - Math.cos(angle) * 20;
    const rearY = y - Math.sin(angle) * 20;
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: rearX + (Math.random() - 0.5) * width,
        y: rearY + (Math.random() - 0.5) * width,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 4 + Math.random() * 5,
        growth: 0.35,
        color: "rgba(220, 220, 220, 0.45)",
        alpha: 0.45,
        decay: 0.02
      });
    }
  }

  addDust(x, y, baseColor) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 16,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: 3 + Math.random() * 4,
      growth: 0.2,
      color: baseColor || "rgba(180, 140, 80, 0.4)",
      alpha: 0.4,
      decay: 0.025
    });
  }

  addSparks(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 1.5,
        growth: -0.05,
        color: Math.random() > 0.5 ? "#ffe600" : "#ff5722",
        alpha: 1.0,
        decay: 0.05
      });
    }
  }

  addNitroFlame(x, y, angle, width) {
    const rearX = x - Math.cos(angle) * 24;
    const rearY = y - Math.sin(angle) * 24;
    const offsetSide = (Math.random() - 0.5) * (width * 0.4);
    const sideX = -Math.sin(angle) * offsetSide;
    const sideY = Math.cos(angle) * offsetSide;

    this.particles.push({
      x: rearX + sideX,
      y: rearY + sideY,
      vx: -Math.cos(angle) * (6 + Math.random() * 4),
      vy: -Math.sin(angle) * (6 + Math.random() * 4),
      radius: 4 + Math.random() * 3,
      growth: -0.15,
      color: Math.random() > 0.4 ? "#00f0ff" : "#ffffff",
      alpha: 0.9,
      decay: 0.07
    });
  }

  update() {
    // Update active particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.radius += p.growth;
      p.alpha -= p.decay;
      if (p.alpha <= 0 || p.radius <= 0) {
        this.particles.splice(i, 1);
      }
    }
    // Fade skids
    for (let i = this.skids.length - 1; i >= 0; i--) {
      this.skids[i].life--;
      if (this.skids[i].life <= 0) {
        this.skids[i].alpha -= 0.005;
        if (this.skids[i].alpha <= 0) {
          this.skids.splice(i, 1);
        }
      }
    }
  }

  drawSkids(ctx) {
    ctx.save();
    for (let s of this.skids) {
      ctx.fillStyle = `rgba(15, 15, 18, ${s.alpha})`;
      ctx.fillRect(s.x1 - 2, s.y1 - 2, 4, 4);
      ctx.fillRect(s.x2 - 2, s.y2 - 2, 4, 4);
    }
    ctx.restore();
  }

  drawParticles(ctx) {
    ctx.save();
    for (let p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // Dimensions
    this.width = canvas.width;
    this.height = canvas.height;

    // Subsystems
    this.particles = new ParticleSystem();
    this.trackManager = null;
    this.cars = [];
    this.playerCar = null;

    // Camera
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.0,
      shake: 0
    };

    // State Machine: "MENU", "COUNTDOWN", "RACING", "PAUSED", "FINISH"
    this.state = "MENU";
    this.countdownTimer = 3.99;
    this.raceStartTime = 0;
    this.selectedCarIndex = 0;
    this.selectedTrackIndex = 0;

    // Inputs
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      handbrake: false,
      nitro: false
    };

    this.setupInputs();
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  setupInputs() {
    window.addEventListener("keydown", (e) => {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
      if (window.audio) window.audio.init();

      if (e.code === "ArrowUp" || e.code === "KeyW") this.keys.up = true;
      if (e.code === "ArrowDown" || e.code === "KeyS") this.keys.down = true;
      if (e.code === "ArrowLeft" || e.code === "KeyA") this.keys.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") this.keys.right = true;
      if (e.code === "Space") this.keys.handbrake = true;
      if (e.code === "ShiftLeft" || e.code === "ShiftRight" || e.code === "KeyN") this.keys.nitro = true;

      // Pause toggle
      if (e.code === "KeyP" || e.code === "Escape") {
        this.togglePause();
      }
      // Reset car on track
      if (e.code === "KeyR" && this.playerCar && this.state === "RACING") {
        this.resetCarToTrack(this.playerCar);
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "ArrowUp" || e.code === "KeyW") this.keys.up = false;
      if (e.code === "ArrowDown" || e.code === "KeyS") this.keys.down = false;
      if (e.code === "ArrowLeft" || e.code === "KeyA") this.keys.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") this.keys.right = false;
      if (e.code === "Space") this.keys.handbrake = false;
      if (e.code === "ShiftLeft" || e.code === "ShiftRight" || e.code === "KeyN") this.keys.nitro = false;
    });

    // Mobile / Touch controls support
    const bindBtn = (id, keyName) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const start = (e) => {
        e.preventDefault();
        if (window.audio) window.audio.init();
        this.keys[keyName] = true;
      };
      const end = (e) => {
        e.preventDefault();
        this.keys[keyName] = false;
      };
      btn.addEventListener("mousedown", start);
      btn.addEventListener("mouseup", end);
      btn.addEventListener("touchstart", start);
      btn.addEventListener("touchend", end);
    };

    bindBtn("btn-gas", "up");
    bindBtn("btn-brake", "down");
    bindBtn("btn-left", "left");
    bindBtn("btn-right", "right");
    bindBtn("btn-drift", "handbrake");
    bindBtn("btn-nitro", "nitro");
  }

  togglePause() {
    if (this.state === "RACING") {
      this.state = "PAUSED";
      document.getElementById("pause-screen").classList.remove("hidden");
    } else if (this.state === "PAUSED") {
      this.state = "RACING";
      document.getElementById("pause-screen").classList.add("hidden");
    }
  }

  resetCarToTrack(car) {
    const trackInfo = this.trackManager.getTrackDistance({ x: car.x, y: car.y });
    if (trackInfo.proj) {
      car.x = trackInfo.proj.projX;
      car.y = trackInfo.proj.projY;
      const nextPt = this.trackManager.points[(trackInfo.segment + 1) % this.trackManager.points.length];
      car.angle = Math.atan2(nextPt.y - car.y, nextPt.x - car.x);
      car.vx = 0;
      car.vy = 0;
      car.speed = 0;
      car.spinTimer = 0;
    }
  }

  startRace(carIndex = 0, trackIndex = 0) {
    this.selectedCarIndex = carIndex;
    this.selectedTrackIndex = trackIndex;

    const trackData = TRACKS[trackIndex];
    this.trackManager = new TrackManager(trackData);
    this.particles = new ParticleSystem();
    this.cars = [];

    // Player Car Setup
    const playerConfig = CAR_TYPES[carIndex];
    const pGrid = trackData.gridOffsets[0];
    this.playerCar = new Car(
      playerConfig,
      trackData.startPos.x + pGrid.x,
      trackData.startPos.y + pGrid.y,
      trackData.startPos.angle,
      true,
      "YOU"
    );
    this.cars.push(this.playerCar);

    // 3 AI Opponent Cars with randomized profiles
    const aiNames = ["Blaze", "Viper", "Phantom", "Apex", "Nova"];
    const otherCars = CAR_TYPES.filter((_, idx) => idx !== carIndex);
    for (let i = 1; i <= 3; i++) {
      const grid = trackData.gridOffsets[i];
      const aiConfig = otherCars[(i - 1) % otherCars.length];
      const aiCar = new Car(
        aiConfig,
        trackData.startPos.x + grid.x,
        trackData.startPos.y + grid.y,
        trackData.startPos.angle,
        false,
        aiNames[i - 1]
      );
      this.cars.push(aiCar);
    }

    // Camera initialize
    this.camera.x = this.playerCar.x;
    this.camera.y = this.playerCar.y;

    // Start countdown
    this.state = "COUNTDOWN";
    this.countdownTimer = 3.99;
    this.countdownLastSec = 4;

    // UI transitions
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("finish-screen").classList.add("hidden");
    document.getElementById("pause-screen").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");

    if (window.audio) {
      window.audio.init();
      window.audio.resume();
      window.audio.startMusic();
    }
  }

  updateAI(car, dt) {
    if (this.state !== "RACING") return;

    // Target waypoint
    const pts = this.trackManager.points;
    const target = pts[car.aiTargetWaypoint];

    // Compute angle to target
    const dx = (target.x + car.aiSteerVariance) - car.x;
    const dy = (target.y + car.aiSteerVariance) - car.y;
    let desiredAngle = Math.atan2(dy, dx);

    // Normalize angle difference
    let diff = desiredAngle - car.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    // Steer towards target
    const steer = Math.max(-1, Math.min(1, diff * 3.0));

    // Throttle: brake on sharp hairpins, boost on straights
    const isSharpTurn = Math.abs(diff) > 0.65;
    const throttle = !isSharpTurn;
    const brake = isSharpTurn && car.speed > car.config.topSpeed * 0.6;
    const handbrake = isSharpTurn && car.speed > car.config.topSpeed * 0.75;
    const nitro = !isSharpTurn && car.nitro > 40 && Math.random() < 0.08;

    car.update(
      {
        throttle: throttle,
        brake: brake,
        steer: steer,
        handbrake: handbrake,
        nitro: nitro
      },
      dt,
      this.trackManager,
      this.particles
    );
  }

  checkCarCollisions() {
    const len = this.cars.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const c1 = this.cars[i];
        const c2 = this.cars[j];

        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = c1.collisionRadius + c2.collisionRadius;

        if (dist < minDist && dist > 0.001) {
          // Overlap separation
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          c1.x -= nx * overlap * 0.5;
          c1.y -= ny * overlap * 0.5;
          c2.x += nx * overlap * 0.5;
          c2.y += ny * overlap * 0.5;

          // Velocity impulse exchange
          const relVx = c1.vx - c2.vx;
          const relVy = c1.vy - c2.vy;
          const impulse = (relVx * nx + relVy * ny) * 0.7;

          if (impulse > 0) {
            c1.vx -= nx * impulse;
            c1.vy -= ny * impulse;
            c2.vx += nx * impulse;
            c2.vy += ny * impulse;

            // Sparks & sound
            const midX = (c1.x + c2.x) * 0.5;
            const midY = (c1.y + c2.y) * 0.5;
            this.particles.addSparks(midX, midY, 10);

            if ((c1.isPlayer || c2.isPlayer) && window.audio) {
              window.audio.playCrash(Math.min(1.0, impulse * 0.3));
              this.camera.shake = Math.min(14, impulse * 2.5);
            }
          }
        }
      }
    }
  }

  updateRankings() {
    // Score based on lap, checkpoint index, and distance to next checkpoint
    for (let car of this.cars) {
      const nextPt = this.trackManager.points[car.aiTargetWaypoint];
      const dist = Math.hypot(car.x - nextPt.x, car.y - nextPt.y);
      car.raceScore = car.currentLap * 100000 + car.checkpointsPassed * 1000 - dist;
    }

    // Sort descending
    const sorted = [...this.cars].sort((a, b) => b.raceScore - a.raceScore);
    sorted.forEach((car, index) => {
      car.rank = index + 1;
    });
  }

  update(dt) {
    if (this.state === "PAUSED") return;

    // --- COUNTDOWN STATE ---
    if (this.state === "COUNTDOWN") {
      this.countdownTimer -= dt;
      const currentSec = Math.ceil(this.countdownTimer);

      if (currentSec !== this.countdownLastSec && currentSec > 0 && currentSec <= 3) {
        this.countdownLastSec = currentSec;
        if (window.audio) window.audio.playCountdown(false);
      }

      if (this.countdownTimer <= 0) {
        this.state = "RACING";
        this.raceStartTime = performance.now();
        for (let car of this.cars) {
          car.lapStartTime = performance.now();
        }
        if (window.audio) window.audio.playCountdown(true);
      }
    }

    // --- RACING STATE ---
    if (this.state === "RACING" || this.state === "FINISH") {
      // 1. Update Player Car
      const playerInputs = {
        throttle: this.keys.up,
        brake: this.keys.down,
        steer: (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0),
        handbrake: this.keys.handbrake,
        nitro: this.keys.nitro
      };

      this.playerCar.update(playerInputs, dt, this.trackManager, this.particles);

      // Audio engine updates
      if (window.audio) {
        const speedRatio = this.playerCar.speed / this.playerCar.config.topSpeed;
        window.audio.updateEngine(speedRatio, this.keys.up);
        window.audio.setDriftIntensity(this.playerCar.isDrifting ? 1.0 : 0);
        window.audio.setNitroActive(this.playerCar.isNitroActive);
      }

      // 2. Update AI Rivals
      for (let car of this.cars) {
        if (!car.isPlayer) {
          this.updateAI(car, dt);
        }
      }

      // 3. Collision Resolution
      this.checkCarCollisions();

      // 4. Update Rankings
      this.updateRankings();

      // 5. Check Race Completion
      if (this.playerCar.raceFinished && this.state !== "FINISH") {
        this.state = "FINISH";
        setTimeout(() => {
          this.showFinishScreen();
        }, 1200);
      }
    }

    // Particles update
    this.particles.update();

    // Smooth Camera Follow with Speed Zoom and Screen Shake
    if (this.playerCar) {
      const targetX = this.playerCar.x;
      const targetY = this.playerCar.y;
      this.camera.x += (targetX - this.camera.x) * 0.12;
      this.camera.y += (targetY - this.camera.y) * 0.12;

      // Dynamic zoom based on speed
      const speedNorm = this.playerCar.speed / this.playerCar.config.topSpeed;
      const targetZoom = 1.0 - speedNorm * 0.14;
      this.camera.zoom += (targetZoom - this.camera.zoom) * 0.05;

      // Shake decay
      if (this.playerCar.isNitroActive) {
        this.camera.shake = Math.max(this.camera.shake, 2.5);
      }
      if (this.camera.shake > 0) {
        this.camera.shake *= 0.90;
        if (this.camera.shake < 0.1) this.camera.shake = 0;
      }
    }

    // Update HTML HUD
    this.updateHUD();
  }

  showFinishScreen() {
    document.getElementById("finish-screen").classList.remove("hidden");
    const rankEl = document.getElementById("finish-rank");
    const timeEl = document.getElementById("finish-time");
    const bestLapEl = document.getElementById("finish-best-lap");
    const driftEl = document.getElementById("finish-drift");

    const totalSeconds = ((this.playerCar.finishTime - this.raceStartTime) / 1000).toFixed(2);
    const bestLapSec = this.playerCar.bestLapTime === Infinity ? "--" : this.playerCar.bestLapTime.toFixed(2) + "s";

    const suffixes = ["th", "st", "nd", "rd", "th"];
    const rankStr = this.playerCar.rank + (suffixes[this.playerCar.rank] || "th");

    rankEl.textContent = rankStr + " PLACE!";
    rankEl.className = this.playerCar.rank === 1 ? "gold" : (this.playerCar.rank === 2 ? "silver" : "bronze");
    timeEl.textContent = "Total Time: " + totalSeconds + "s";
    bestLapEl.textContent = "Best Lap: " + bestLapSec;
    driftEl.textContent = "Drift Points: " + Math.floor(this.playerCar.driftScore);
  }

  updateHUD() {
    if (!this.playerCar || this.state === "MENU") return;

    // Speedometer
    const speedKmh = Math.floor(this.playerCar.speed * 18);
    const speedVal = document.getElementById("hud-speed-val");
    if (speedVal) speedVal.textContent = speedKmh;

    // Nitro gauge
    const nitroFill = document.getElementById("hud-nitro-fill");
    if (nitroFill) {
      const pct = (this.playerCar.nitro / this.playerCar.maxNitro) * 100;
      nitroFill.style.width = pct + "%";
    }

    // Lap
    const lapEl = document.getElementById("hud-lap");
    if (lapEl) {
      const displayLap = Math.min(this.playerCar.currentLap, this.trackManager.data.laps);
      lapEl.textContent = `LAP ${displayLap}/${this.trackManager.data.laps}`;
    }

    // Position / Rank
    const posEl = document.getElementById("hud-pos");
    if (posEl) {
      const suffixes = ["", "1ST", "2ND", "3RD", "4TH"];
      posEl.textContent = suffixes[this.playerCar.rank] || "4TH";
    }

    // Lap timer
    const timerEl = document.getElementById("hud-time");
    if (timerEl && this.state === "RACING") {
      const elapsed = ((performance.now() - this.raceStartTime) / 1000).toFixed(1);
      timerEl.textContent = elapsed + "s";
    }
  }

  drawMiniMap() {
    const mmCanvas = document.getElementById("minimap");
    if (!mmCanvas || !this.trackManager) return;
    const mctx = mmCanvas.getContext("2d");
    mctx.clearRect(0, 0, mmCanvas.width, mmCanvas.height);

    // Calculate bounding box and scale
    const tw = this.trackManager.worldWidth;
    const th = this.trackManager.worldHeight;
    const scale = Math.min(mmCanvas.width / tw, mmCanvas.height / th) * 0.9;
    const offsetX = (mmCanvas.width - tw * scale) / 2 - this.trackManager.minX * scale;
    const offsetY = (mmCanvas.height - th * scale) / 2 - this.trackManager.minY * scale;

    // Draw track path
    mctx.beginPath();
    mctx.lineWidth = 14 * scale;
    mctx.strokeStyle = "#555";
    mctx.lineJoin = "round";
    const pts = this.trackManager.points;
    mctx.moveTo(pts[0].x * scale + offsetX, pts[0].y * scale + offsetY);
    for (let i = 1; i <= pts.length; i++) {
      const p = pts[i % pts.length];
      mctx.lineTo(p.x * scale + offsetX, p.y * scale + offsetY);
    }
    mctx.stroke();

    // Draw AI dots
    for (let car of this.cars) {
      if (!car.isPlayer) {
        mctx.fillStyle = "#e74c3c";
        mctx.beginPath();
        mctx.arc(car.x * scale + offsetX, car.y * scale + offsetY, 4, 0, Math.PI * 2);
        mctx.fill();
      }
    }

    // Draw Player dot (blinking yellow)
    if (this.playerCar) {
      const blink = Math.floor(performance.now() / 200) % 2 === 0;
      mctx.fillStyle = blink ? "#ffff00" : "#ffffff";
      mctx.beginPath();
      mctx.arc(this.playerCar.x * scale + offsetX, this.playerCar.y * scale + offsetY, 6, 0, Math.PI * 2);
      mctx.fill();
    }
  }

  drawCountdown() {
    if (this.state !== "COUNTDOWN") return;
    this.ctx.save();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = "900 84px 'Impact', 'Arial Black', sans-serif";

    let text = "";
    let color = "#fff";
    if (this.countdownTimer > 3.0) {
      text = "READY";
      color = "#e74c3c";
    } else if (this.countdownTimer > 2.0) {
      text = "3";
      color = "#e67e22";
    } else if (this.countdownTimer > 1.0) {
      text = "2";
      color = "#f1c40f";
    } else if (this.countdownTimer > 0.0) {
      text = "1";
      color = "#2ecc71";
    }

    this.ctx.shadowColor = "#000";
    this.ctx.shadowBlur = 20;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, this.width / 2, this.height / 2 - 20);

    this.ctx.restore();
  }

  render() {
    // Clear viewport
    this.ctx.fillStyle = "#111";
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (!this.trackManager) return;

    this.ctx.save();

    // Screen Shake
    let shakeX = 0;
    let shakeY = 0;
    if (this.camera.shake > 0) {
      shakeX = (Math.random() - 0.5) * this.camera.shake;
      shakeY = (Math.random() - 0.5) * this.camera.shake;
    }

    // Camera transform
    this.ctx.translate(this.width / 2 + shakeX, this.height / 2 + shakeY);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Draw Track Surface & Scenery
    this.trackManager.drawTrack(this.ctx);

    // 2. Persistent Tire Skidmarks
    this.particles.drawSkids(this.ctx);

    // 3. Draw All Cars
    for (let car of this.cars) {
      car.draw(this.ctx);
    }

    // 4. Dynamic Particles (smoke, sparks, dust, nitro flames)
    this.particles.drawParticles(this.ctx);

    this.ctx.restore();

    // 5. Mini-map
    this.drawMiniMap();

    // 6. Countdown Overlay
    this.drawCountdown();
  }

  loop(timestamp) {
    const dt = Math.min(0.06, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop);
  }
}

// Instantiate engine when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  window.game = new GameEngine(canvas);
});
