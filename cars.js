// cars.js - Vehicle definitions, physics simulation, drift model, and vector rendering

if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r = 0) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

const CAR_TYPES = [
  {
    id: "comet",
    name: "Red Comet",
    type: "Sports GT",
    color: "#e74c3c",
    accentColor: "#ffffff",
    topSpeed: 12.0,
    accel: 0.22,
    brake: 0.36,
    handling: 0.078,
    driftGrip: 0.95,
    weight: 1.0,
    nitroCapacity: 100,
    width: 26,
    length: 46
  },
  {
    id: "thunder",
    name: "Thunder V8",
    type: "Muscle",
    color: "#3498db",
    accentColor: "#f1c40f",
    topSpeed: 12.8,
    accel: 0.26,
    brake: 0.34,
    handling: 0.068,
    driftGrip: 0.92,
    weight: 1.2,
    nitroCapacity: 95,
    width: 28,
    length: 48
  },
  {
    id: "apex",
    name: "Apex Formula",
    type: "Open Wheel",
    color: "#2ecc71",
    accentColor: "#111111",
    topSpeed: 12.2,
    accel: 0.28,
    brake: 0.42,
    handling: 0.092,
    driftGrip: 0.97,
    weight: 0.85,
    nitroCapacity: 85,
    width: 26,
    length: 50
  },
  {
    id: "spectre",
    name: "Cyber Spectre",
    type: "Hypercar",
    color: "#9b59b6",
    accentColor: "#00f0ff",
    topSpeed: 12.5,
    accel: 0.24,
    brake: 0.38,
    handling: 0.082,
    driftGrip: 0.95,
    weight: 1.0,
    nitroCapacity: 140,
    width: 27,
    length: 47
  }
];

class Car {
  constructor(carConfig, x, y, angle = 0, isPlayer = false, name = "Racer") {
    this.config = carConfig;
    this.name = name;
    this.isPlayer = isPlayer;

    // Position & Orientation
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.vx = 0;
    this.vy = 0;
    this.angularVelocity = 0;

    // Physical dimensions
    this.width = carConfig.width;
    this.length = carConfig.length;
    this.collisionRadius = carConfig.length * 0.45;

    // Driving dynamic state
    this.speed = 0;
    this.driftAngle = 0;
    this.isDrifting = false;
    this.driftScore = 0;
    this.isOnRoad = true;
    this.isNearBarrier = false;

    // Nitro
    this.nitro = carConfig.nitroCapacity;
    this.maxNitro = carConfig.nitroCapacity;
    this.isNitroActive = false;

    // Spin-out & Impact state
    this.spinTimer = 0;
    this.flashTimer = 0;
    this.boostTimer = 0;

    // Race progress tracking
    this.currentLap = 1;
    this.currentSegment = 0;
    this.checkpointsPassed = 0;
    this.lapStartTime = 0;
    this.lapTimes = [];
    this.bestLapTime = Infinity;
    this.raceFinished = false;
    this.finishTime = 0;
    this.rank = 1;

    // AI Specific
    this.aiTargetWaypoint = 1;
    this.aiSteerVariance = (Math.random() - 0.5) * 20;
    this.aiSkill = 0.88 + Math.random() * 0.15; // Speed multiplier for AI
  }

  update(inputs, dt, trackManager, particles) {
    if (this.spinTimer > 0) {
      this.spinTimer -= dt;
      this.angle += 8 * dt;
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.x += this.vx;
      this.y += this.vy;
      this.speed = Math.hypot(this.vx, this.vy);
      if (particles) particles.addSkid(this.x, this.y, this.angle, 0.8);
      return;
    }

    // 1. Query track surface (forgiving offroad so players don't get stuck)
    const trackInfo = trackManager.getTrackDistance({ x: this.x, y: this.y });
    this.isOnRoad = trackInfo.isOnRoad;
    this.isNearBarrier = trackInfo.isNearBarrier;

    // Forgiving off-road penalty
    const surfaceGrip = this.isOnRoad ? 1.0 : 0.82;
    const surfaceMaxSpeedMult = this.isOnRoad ? 1.0 : 0.75;

    // 2. Handle Nitro Boost
    let nitroMultiplier = 1.0;
    if (inputs.nitro && this.nitro > 0 && inputs.throttle) {
      this.isNitroActive = true;
      this.nitro = Math.max(0, this.nitro - 25 * dt);
      nitroMultiplier = 1.4;
      if (particles) {
        particles.addNitroFlame(this.x, this.y, this.angle, this.width);
      }
    } else {
      this.isNitroActive = false;
    }

    // Boost Pad bonus
    if (this.boostTimer > 0) {
      this.boostTimer -= dt;
      nitroMultiplier = Math.max(nitroMultiplier, 1.5);
      if (particles) {
        particles.addNitroFlame(this.x, this.y, this.angle, this.width);
      }
    }

    // 3. Acceleration & Braking
    const maxSpeed = this.config.topSpeed * surfaceMaxSpeedMult * nitroMultiplier;
    let forwardAccel = 0;

    if (inputs.throttle) {
      forwardAccel += this.config.accel * surfaceGrip * (this.isNitroActive ? 1.6 : 1.0);
    }
    if (inputs.brake) {
      // Responsive brake & smooth reverse
      const currentFwd = this.vx * Math.cos(this.angle) + this.vy * Math.sin(this.angle);
      if (currentFwd > 0.4) {
        forwardAccel -= this.config.brake;
      } else {
        forwardAccel -= this.config.accel * 0.7; // Smooth reverse
      }
    }

    // 4. Steering and Drift Dynamics
    const forwardX = Math.cos(this.angle);
    const forwardY = Math.sin(this.angle);
    const sideX = -Math.sin(this.angle);
    const sideY = Math.cos(this.angle);

    const currentForwardSpeed = this.vx * forwardX + this.vy * forwardY;
    const currentLateralSpeed = this.vx * sideX + this.vy * sideY;

    // Responsive steering even at low speeds (easy to maneuver!)
    const speedRatio = Math.max(0.65, Math.min(1.0, (Math.abs(currentForwardSpeed) + 1.5) / 4.0));
    let steerAmount = inputs.steer * this.config.handling * speedRatio;

    // Drift activation - high grip by default, drifts only on handbrake
    const handbrake = inputs.handbrake;
    let grip = this.config.driftGrip;

    if (handbrake && Math.abs(currentForwardSpeed) > 2.5) {
      grip = 0.58; // Controlled slide
      this.isDrifting = true;
      steerAmount *= 1.25;
      this.nitro = Math.min(this.maxNitro, this.nitro + 22 * dt);
      this.driftScore += Math.abs(currentLateralSpeed) * dt * 100;

      if (particles) {
        particles.addSkid(this.x, this.y, this.angle, 0.7);
        particles.addSmoke(this.x, this.y, this.angle, this.width);
      }
    } else {
      this.isDrifting = false;
    }

    // Apply steering
    if (Math.abs(currentForwardSpeed) > 0.05 || Math.abs(inputs.steer) > 0.01) {
      const dir = currentForwardSpeed >= -0.2 ? 1 : -1;
      this.angle += steerAmount * dir;
    }

    // 5. Physics Velocity integration
    let newForwardSpeed = currentForwardSpeed + forwardAccel;
    newForwardSpeed = Math.max(-this.config.topSpeed * 0.4, Math.min(maxSpeed, newForwardSpeed));

    // Natural drag
    const drag = this.isOnRoad ? 0.99 : 0.95;
    newForwardSpeed *= drag;

    // Lateral friction dampening: heavily stabilize car unless actively drifting
    let newLateralSpeed = currentLateralSpeed * grip;
    if (!this.isDrifting) {
      newLateralSpeed *= 0.70; // Eliminates fishtailing completely!
    }

    // Recompose velocity vector
    const updatedForwardX = Math.cos(this.angle);
    const updatedForwardY = Math.sin(this.angle);
    const updatedSideX = -Math.sin(this.angle);
    const updatedSideY = Math.cos(this.angle);

    this.vx = updatedForwardX * newForwardSpeed + updatedSideX * newLateralSpeed;
    this.vy = updatedForwardY * newForwardSpeed + updatedSideY * newLateralSpeed;

    this.speed = Math.hypot(this.vx, this.vy);
    this.driftAngle = Math.atan2(currentLateralSpeed, Math.abs(currentForwardSpeed) + 0.001);

    // Move car
    this.x += this.vx;
    this.y += this.vy;

    // Dust particles when offroad
    if (!this.isOnRoad && this.speed > 2.0 && particles) {
      particles.addDust(this.x, this.y, trackManager.data.offroadColor);
    }

    // 6. Barrier Collision - Smooth cushion glide along curve instead of bouncing back!
    const barrierDistance = trackManager.halfWidth + 24;
    if (trackInfo.dist > barrierDistance) {
      if (trackInfo.proj) {
        const toRoadX = trackInfo.proj.projX - this.x;
        const toRoadY = trackInfo.proj.projY - this.y;
        const len = Math.hypot(toRoadX, toRoadY) || 1;
        
        // Push gently back towards road
        this.x = trackInfo.proj.projX - (toRoadX / len) * barrierDistance;
        this.y = trackInfo.proj.projY - (toRoadY / len) * barrierDistance;

        // Realign gently with track direction
        const pts = trackManager.points;
        const p1 = pts[trackInfo.segment];
        const p2 = pts[(trackInfo.segment + 1) % pts.length];
        const trackAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        let angleDiff = trackAngle - this.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        this.angle += angleDiff * 0.20;

        // Maintain forward speed with gentle cushion dampening
        this.vx *= 0.85;
        this.vy *= 0.85;

        if (particles) {
          particles.addSparks(this.x, this.y, 5);
        }
        if (this.isPlayer && window.audio) {
          window.audio.playCrash(0.3);
        }
      }
    }

    // 7. Hazard and Boost Pad interactions
    for (let pad of trackManager.data.boostPads) {
      if (Math.hypot(this.x - pad.x, this.y - pad.y) < 32) {
        if (this.boostTimer <= 0) {
          this.boostTimer = 1.2;
          if (this.isPlayer && window.audio) {
            window.audio.playBoostPad();
          }
        }
      }
    }

    for (let oil of trackManager.data.oilSlicks) {
      if (Math.hypot(this.x - oil.x, this.y - oil.y) < oil.radius + 10) {
        if (this.spinTimer <= 0) {
          this.spinTimer = 0.35; // Shorter, fun recovery
          if (this.isPlayer && window.audio) {
            window.audio.playCrash(0.3);
          }
        }
      }
    }

    // 8. Progress and Lap Counter
    this.updateRaceProgress(trackManager);
  }

  updateRaceProgress(trackManager) {
    if (this.raceFinished) return;

    const totalPts = trackManager.points.length;
    // Check distance to next expected waypoint
    const targetPt = trackManager.points[this.aiTargetWaypoint];
    const distToTarget = Math.hypot(this.x - targetPt.x, this.y - targetPt.y);

    // Also check distance to subsequent waypoint to prevent getting stuck
    const nextTargetPt = trackManager.points[(this.aiTargetWaypoint + 1) % totalPts];
    const distToNextTarget = Math.hypot(this.x - nextTargetPt.x, this.y - nextTargetPt.y);

    if (distToTarget < trackManager.roadWidth * 1.5 || (distToNextTarget < distToTarget && distToNextTarget < trackManager.roadWidth * 2.0)) {
      this.checkpointsPassed++;
      this.currentSegment = this.aiTargetWaypoint;
      this.aiTargetWaypoint = (this.aiTargetWaypoint + 1) % totalPts;

      // Crossing finish line: waypoint 0 after completing the circuit loop
      if (this.aiTargetWaypoint === 1 && this.checkpointsPassed >= Math.floor(totalPts * 0.75)) {
        const now = performance.now();
        if (this.lapStartTime > 0) {
          const lapDuration = (now - this.lapStartTime) / 1000;
          this.lapTimes.push(lapDuration);
          if (lapDuration < this.bestLapTime) {
            this.bestLapTime = lapDuration;
          }
          if (this.isPlayer && window.audio) {
            window.audio.playLapBeep();
          }
        }
        this.lapStartTime = now;
        this.checkpointsPassed = 0;

        if (this.currentLap >= trackManager.data.laps) {
          this.raceFinished = true;
          this.finishTime = performance.now();
        } else {
          this.currentLap++;
        }
      }
    }
  }

  // --- RENDERING ---
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const halfW = this.width / 2;
    const halfL = this.length / 2;

    // 1. Headlight Cones
    ctx.save();
    const grad = ctx.createRadialGradient(halfL, 0, 5, halfL + 120, 0, 140);
    grad.addColorStop(0, "rgba(255, 255, 220, 0.45)");
    grad.addColorStop(1, "rgba(255, 255, 220, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(halfL, -halfW * 0.7);
    ctx.lineTo(halfL + 120, -50);
    ctx.lineTo(halfL + 120, 50);
    ctx.lineTo(halfL, halfW * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Car Shadow & Pulsing Neon Underglow ("Flashing Car" signature)
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.roundRect(-halfL + 4, -halfW + 4, this.length, this.width, 6);
    ctx.fill();

    // Flashing neon underglow
    if (this.isPlayer) {
      ctx.save();
      const flashPhase = performance.now() * 0.009;
      const flashVal = 0.5 + 0.5 * Math.sin(flashPhase);
      const glowCol = this.isNitroActive ? "#ff0077" : (this.config.accentColor || "#00f0ff");
      ctx.shadowColor = glowCol;
      ctx.shadowBlur = 16 + flashVal * 14;
      ctx.fillStyle = glowCol;
      ctx.globalAlpha = 0.55 + flashVal * 0.35;
      ctx.beginPath();
      ctx.roundRect(-halfL + 1, -halfW + 1, this.length - 2, this.width - 2, 8);
      ctx.fill();
      ctx.restore();
    }

    // 3. Wheels / Tires
    const wheelW = 6;
    const wheelL = 12;
    ctx.fillStyle = "#151515";
    // Front-left
    ctx.fillRect(halfL - 14, -halfW - 3, wheelL, wheelW);
    // Front-right
    ctx.fillRect(halfL - 14, halfW - 3, wheelL, wheelW);
    // Rear-left
    ctx.fillRect(-halfL + 4, -halfW - 3, wheelL, wheelW);
    // Rear-right
    ctx.fillRect(-halfL + 4, halfW - 3, wheelL, wheelW);

    // Rim accents
    ctx.fillStyle = "#aaaaaa";
    ctx.fillRect(halfL - 11, -halfW - 2, 6, 4);
    ctx.fillRect(halfL - 11, halfW - 2, 6, 4);
    ctx.fillRect(-halfL + 7, -halfW - 2, 6, 4);
    ctx.fillRect(-halfL + 7, halfW - 2, 6, 4);

    // 4. Main Car Body
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.roundRect(-halfL, -halfW, this.length, this.width, 6);
    ctx.fill();

    // 5. Racing Stripe / Bodywork Accent
    ctx.fillStyle = this.config.accentColor;
    ctx.fillRect(-halfL + 2, -3, this.length - 4, 6);

    // 6. Cockpit / Windshield Glass
    ctx.fillStyle = "#1a252f";
    ctx.beginPath();
    ctx.roundRect(-halfL * 0.2, -halfW * 0.7, halfL * 0.8, this.width * 0.7, 4);
    ctx.fill();

    // Windshield glare
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-halfL * 0.1, -halfW * 0.5);
    ctx.lineTo(halfL * 0.4, halfW * 0.4);
    ctx.stroke();

    // 7. Rear Spoiler / Wing
    ctx.fillStyle = "#111111";
    ctx.fillRect(-halfL - 3, -halfW - 2, 5, this.width + 4);

    // 8. Brake Lights / Taillights
    const isBraking = Math.hypot(this.vx, this.vy) > 0.5 && this.isDrifting;
    ctx.fillStyle = isBraking ? "#ff0000" : "#990000";
    ctx.shadowColor = isBraking ? "#ff0000" : "transparent";
    ctx.shadowBlur = isBraking ? 8 : 0;
    ctx.fillRect(-halfL - 1, -halfW + 2, 3, 5);
    ctx.fillRect(-halfL - 1, halfW - 7, 3, 5);
    ctx.shadowBlur = 0;

    // 9. Dual Headlight Lamps with Flashing Strobe
    const isStrobe = this.isPlayer && (Math.sin(performance.now() * 0.02) > 0.2);
    ctx.fillStyle = isStrobe ? "#00f0ff" : "#ffffcc";
    ctx.shadowColor = isStrobe ? "#00f0ff" : "transparent";
    ctx.shadowBlur = isStrobe ? 10 : 0;
    ctx.fillRect(halfL - 2, -halfW + 3, 3, 5);
    ctx.fillRect(halfL - 2, halfW - 8, 3, 5);
    ctx.shadowBlur = 0;

    // 10. Racer Tag above car (for AI/Player distinction)
    ctx.restore(); // Exit car rotation space

    // Tag in screen-upright orientation
    ctx.save();
    ctx.font = "bold 11px 'Segoe UI', Tahoma, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = this.isPlayer ? "#f1c40f" : "#ecf0f1";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 4;
    ctx.fillText(this.name, this.x, this.y - this.length * 0.65 - 4);
    ctx.restore();
  }
}
