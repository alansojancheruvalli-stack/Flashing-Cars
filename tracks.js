// tracks.js - Circuit definitions, geometry, waypoints, hazards, and themes

const TRACKS = [
  {
    id: "emerald",
    name: "Emerald Speedway",
    description: "Classic GP circuit through lush hills. Smooth sweeping bends and wide nitro straights.",
    difficulty: "Easy",
    laps: 3,
    roadWidth: 155,
    bgColor: "#2d7a36",
    offroadColor: "#1d5c26",
    roadColor: "#33383d",
    curbColor1: "#e74c3c",
    curbColor2: "#ffffff",
    lineColor: "#f1c40f",
    ambientLight: 1.0,
    // Track centerline waypoints (loop)
    points: [
      { x: 500,  y: 350 },
      { x: 900,  y: 350 },
      { x: 1300, y: 400 },
      { x: 1650, y: 650 },
      { x: 1750, y: 1050 },
      { x: 1550, y: 1450 },
      { x: 1200, y: 1600 },
      { x: 800,  y: 1500 },
      { x: 550,  y: 1200 },
      { x: 450,  y: 850 },
      { x: 250,  y: 650 },
      { x: 250,  y: 450 }
    ],
    startPos: { x: 550, y: 350, angle: 0 },
    gridOffsets: [
      { x: 0, y: -25 },
      { x: -90, y: 25 },
      { x: -180, y: -25 },
      { x: -270, y: 25 }
    ],
    boostPads: [
      { x: 1050, y: 360, angle: 0 },
      { x: 1000, y: 1550, angle: Math.PI }
    ],
    oilSlicks: [
      { x: 1700, y: 850, radius: 28 },
      { x: 480, y: 1050, radius: 26 }
    ],
    scenery: [
      // Trees and spectator stands
      { type: "stand", x: 750, y: 230, width: 220, height: 45 },
      { type: "tree", x: 350, y: 250, radius: 22 },
      { type: "tree", x: 1100, y: 250, radius: 25 },
      { type: "tree", x: 1500, y: 300, radius: 24 },
      { type: "tree", x: 1850, y: 800, radius: 28 },
      { type: "tree", x: 1750, y: 1300, radius: 26 },
      { type: "tree", x: 1350, y: 1750, radius: 24 },
      { type: "tree", x: 950, y: 1700, radius: 25 },
      { type: "tree", x: 650, y: 1700, radius: 22 },
      { type: "tree", x: 150, y: 550, radius: 26 },
      // Infield decorations
      { type: "pond", x: 1000, y: 950, rx: 160, ry: 90 },
      { type: "tree", x: 800, y: 750, radius: 20 },
      { type: "tree", x: 1250, y: 850, radius: 22 },
      { type: "tree", x: 1150, y: 1200, radius: 24 }
    ]
  },
  {
    id: "desert",
    name: "Desert Canyon Run",
    description: "Rocky canyon hairpins and dusty desert terrain. Beware of slick oil spills on tight turns.",
    difficulty: "Medium",
    laps: 3,
    roadWidth: 145,
    bgColor: "#c28847",
    offroadColor: "#9c6830",
    roadColor: "#423832",
    curbColor1: "#d35400",
    curbColor2: "#f39c12",
    lineColor: "#ffffff",
    ambientLight: 1.0,
    points: [
      { x: 450,  y: 350 },
      { x: 950,  y: 350 },
      { x: 1350, y: 450 },
      { x: 1500, y: 800 },
      { x: 1250, y: 950 },
      { x: 1500, y: 1250 },
      { x: 1400, y: 1600 },
      { x: 950,  y: 1700 },
      { x: 600,  y: 1500 },
      { x: 700,  y: 1100 },
      { x: 400,  y: 900 },
      { x: 250,  y: 600 }
    ],
    startPos: { x: 500, y: 350, angle: 0 },
    gridOffsets: [
      { x: 0, y: -25 },
      { x: -90, y: 25 },
      { x: -180, y: -25 },
      { x: -270, y: 25 }
    ],
    boostPads: [
      { x: 750, y: 350, angle: 0 },
      { x: 1150, y: 1680, angle: Math.PI }
    ],
    oilSlicks: [
      { x: 1380, y: 880, radius: 28 },
      { x: 650, y: 1300, radius: 26 },
      { x: 330, y: 750, radius: 25 }
    ],
    scenery: [
      // Rocks and Cacti
      { type: "rock", x: 250, y: 250, radius: 35 },
      { type: "rock", x: 1200, y: 250, radius: 45 },
      { type: "rock", x: 1650, y: 650, radius: 50 },
      { type: "rock", x: 1650, y: 1450, radius: 40 },
      { type: "rock", x: 1150, y: 1850, radius: 55 },
      { type: "rock", x: 400, y: 1700, radius: 45 },
      { type: "rock", x: 150, y: 1050, radius: 50 },
      { type: "cactus", x: 750, y: 240 },
      { type: "cactus", x: 1500, y: 1050 },
      { type: "cactus", x: 800, y: 1350 },
      { type: "cactus", x: 500, y: 700 },
      { type: "cactus", x: 950, y: 750 },
      { type: "cactus", x: 1050, y: 1300 }
    ]
  },
  {
    id: "neon",
    name: "Neon Midnight City",
    description: "Cyberpunk street circuit lit by glowing holograms. Packed with turbo boost pads.",
    difficulty: "Hard",
    laps: 3,
    roadWidth: 150,
    bgColor: "#090a14",
    offroadColor: "#05060a",
    roadColor: "#181a26",
    curbColor1: "#00f0ff",
    curbColor2: "#ff0077",
    lineColor: "#ffe600",
    ambientLight: 0.9,
    points: [
      { x: 500,  y: 350 },
      { x: 1050, y: 350 },
      { x: 1450, y: 550 },
      { x: 1600, y: 950 },
      { x: 1350, y: 1250 },
      { x: 1650, y: 1550 },
      { x: 1350, y: 1800 },
      { x: 850,  y: 1750 },
      { x: 500,  y: 1500 },
      { x: 350,  y: 1150 },
      { x: 550,  y: 850 },
      { x: 300,  y: 550 }
    ],
    startPos: { x: 600, y: 350, angle: 0 },
    gridOffsets: [
      { x: 0, y: -25 },
      { x: -90, y: 25 },
      { x: -180, y: -25 },
      { x: -270, y: 25 }
    ],
    boostPads: [
      { x: 850,  y: 350,  angle: 0 },
      { x: 1500, y: 1400, angle: Math.PI * 0.75 },
      { x: 1050, y: 1780, angle: Math.PI },
      { x: 400,  y: 980,  angle: -Math.PI * 0.4 }
    ],
    oilSlicks: [
      { x: 1520, y: 750, radius: 28 },
      { x: 1480, y: 1700, radius: 26 },
      { x: 420, y: 1320, radius: 25 }
    ],
    scenery: [
      // Neon towers & billbords
      { type: "neon_tower", x: 750, y: 200, color: "#ff0077" },
      { type: "neon_tower", x: 1250, y: 220, color: "#00f0ff" },
      { type: "neon_tower", x: 1750, y: 750, color: "#ff0077" },
      { type: "neon_tower", x: 1780, y: 1350, color: "#00f0ff" },
      { type: "neon_tower", x: 1550, y: 1950, color: "#ffe600" },
      { type: "neon_tower", x: 650, y: 1900, color: "#00f0ff" },
      { type: "neon_tower", x: 200, y: 1350, color: "#ff0077" },
      { type: "neon_tower", x: 150, y: 400, color: "#00f0ff" },
      // Inner cyber buildings
      { type: "building", x: 850, y: 700, width: 140, height: 100, color: "#0d1b2a" },
      { type: "building", x: 1100, y: 900, width: 160, height: 120, color: "#1b263b" },
      { type: "building", x: 850, y: 1200, width: 180, height: 140, color: "#0d1b2a" }
    ]
  }
];

// Mathematical helper to calculate distance from point to segment
function distToSegment(p, v, w) {
  const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = v.x + t * (w.x - v.x);
  const projY = v.y + t * (w.y - v.y);
  return {
    dist: Math.hypot(p.x - projX, p.y - projY),
    projX,
    projY,
    t
  };
}

// Track querying functions
class TrackManager {
  constructor(trackData) {
    this.data = trackData;
    this.points = trackData.points;
    this.roadWidth = trackData.roadWidth;
    this.halfWidth = this.roadWidth / 2;
    this.totalSegments = this.points.length;

    // Precalculate segment lengths and bounding boxes for camera & bounds
    this.minX = Infinity;
    this.minY = Infinity;
    this.maxX = -Infinity;
    this.maxY = -Infinity;

    for (let p of this.points) {
      if (p.x < this.minX) this.minX = p.x;
      if (p.x > this.maxX) this.maxX = p.x;
      if (p.y < this.minY) this.minY = p.y;
      if (p.y > this.maxY) this.maxY = p.y;
    }
    // Margin for off-track area
    this.minX -= 400;
    this.minY -= 400;
    this.maxX += 400;
    this.maxY += 400;
    this.worldWidth = this.maxX - this.minX;
    this.worldHeight = this.maxY - this.minY;
  }

  // Find closest segment and distance to track centerline
  getTrackDistance(pos) {
    let minDist = Infinity;
    let closestSegment = 0;
    let closestProj = null;

    for (let i = 0; i < this.points.length; i++) {
      const p1 = this.points[i];
      const p2 = this.points[(i + 1) % this.points.length];
      const res = distToSegment(pos, p1, p2);
      if (res.dist < minDist) {
        minDist = res.dist;
        closestSegment = i;
        closestProj = res;
      }
    }

    return {
      dist: minDist,
      segment: closestSegment,
      isOnRoad: minDist <= this.halfWidth,
      isNearBarrier: minDist > this.halfWidth && minDist <= this.halfWidth + 20,
      proj: closestProj
    };
  }

  // Render static track onto canvas
  drawTrack(ctx) {
    const pts = this.points;
    const len = pts.length;

    // Draw grass / background terrain
    ctx.fillStyle = this.data.bgColor;
    ctx.fillRect(this.minX, this.minY, this.worldWidth, this.worldHeight);

    // Subtle offroad terrain pattern/shading
    ctx.strokeStyle = this.data.offroadColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = this.minX; x < this.maxX; x += 120) {
      ctx.moveTo(x, this.minY);
      ctx.lineTo(x + 60, this.maxY);
    }
    ctx.stroke();

    // 1. Outer curb border
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = this.roadWidth + 24;
    ctx.strokeStyle = this.data.curbColor1;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i <= len; i++) {
      const p = pts[i % len];
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Alternating curb teeth (dashed stripe)
    ctx.lineWidth = this.roadWidth + 18;
    ctx.strokeStyle = this.data.curbColor2;
    ctx.setLineDash([25, 25]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Asphalt road surface
    ctx.lineWidth = this.roadWidth;
    ctx.strokeStyle = this.data.roadColor;
    ctx.stroke();

    // 3. Centerline dashed racing markings
    ctx.lineWidth = 4;
    ctx.strokeStyle = this.data.lineColor;
    ctx.setLineDash([20, 25]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Start / Finish Line
    const pStart = pts[0];
    const pNext = pts[1];
    const angle = Math.atan2(pNext.y - pStart.y, pNext.x - pStart.x);
    const normX = -Math.sin(angle);
    const normY = Math.cos(angle);

    ctx.save();
    ctx.translate(pStart.x, pStart.y);
    ctx.rotate(angle);

    // Checkerboard finish line
    const checkerRows = 3;
    const checkerCols = 8;
    const cw = 8;
    const ch = this.roadWidth / checkerCols;
    for (let r = 0; r < checkerRows; r++) {
      for (let c = 0; c < checkerCols; c++) {
        ctx.fillStyle = ((r + c) % 2 === 0) ? "#ffffff" : "#111111";
        ctx.fillRect(-12 + r * cw, -this.halfWidth + c * ch, cw, ch);
      }
    }
    // Gantry arches
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(-16, -this.halfWidth - 15, 32, 12);
    ctx.fillRect(-16, this.halfWidth + 3, 32, 12);
    ctx.restore();

    // 5. Boost Pads
    for (let pad of this.data.boostPads) {
      ctx.save();
      ctx.translate(pad.x, pad.y);
      ctx.rotate(pad.angle);
      // Glowing chevron pad
      ctx.fillStyle = "rgba(0, 230, 255, 0.85)";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 15;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-15 + i * 14, -18);
        ctx.lineTo(5 + i * 14, 0);
        ctx.lineTo(-15 + i * 14, 18);
        ctx.lineTo(-8 + i * 14, 18);
        ctx.lineTo(12 + i * 14, 0);
        ctx.lineTo(-8 + i * 14, -18);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 6. Oil Slicks
    for (let oil of this.data.oilSlicks) {
      ctx.save();
      ctx.translate(oil.x, oil.y);
      ctx.fillStyle = "rgba(20, 20, 25, 0.85)";
      ctx.shadowColor = "#7928ca";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      // Organic blob
      for (let a = 0; a < Math.PI * 2; a += 0.4) {
        const rad = oil.radius * (0.8 + 0.3 * Math.sin(a * 4));
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      // Iridescent rainbow reflection
      ctx.strokeStyle = "rgba(255, 0, 180, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 7. Scenery Objects
    this.drawScenery(ctx);
  }

  drawScenery(ctx) {
    ctx.shadowBlur = 0;
    for (let item of this.data.scenery) {
      if (item.type === "tree") {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.arc(item.x + 4, item.y + 6, item.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#1b4d1b";
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#2ecc71";
        ctx.beginPath();
        ctx.arc(item.x - 3, item.y - 3, item.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (item.type === "stand") {
        ctx.save();
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(item.x, item.y, item.width, item.height);
        // Roof
        ctx.fillStyle = "#e74c3c";
        ctx.fillRect(item.x - 5, item.y - 4, item.width + 10, 8);
        // Crowd dots
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < item.width / 12; col++) {
            ctx.fillStyle = (col + row) % 3 === 0 ? "#f1c40f" : (col % 2 === 0 ? "#3498db" : "#ecf0f1");
            ctx.fillRect(item.x + 5 + col * 12, item.y + 12 + row * 10, 5, 5);
          }
        }
        ctx.restore();
      } else if (item.type === "rock") {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(item.x + 5, item.y + 5, item.radius, item.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7f6a55";
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#a88e74";
        ctx.beginPath();
        ctx.arc(item.x - 4, item.y - 4, item.radius * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (item.type === "cactus") {
        ctx.save();
        ctx.fillStyle = "#27ae60";
        ctx.beginPath();
        ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(item.x - 14, item.y - 3, 28, 6);
        ctx.restore();
      } else if (item.type === "neon_tower") {
        ctx.save();
        ctx.fillStyle = "#111424";
        ctx.fillRect(item.x - 16, item.y - 16, 32, 32);
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(item.x - 16, item.y - 16, 32, 32);
        // Beacon dot
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(item.x, item.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (item.type === "building") {
        ctx.save();
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x, item.y, item.width, item.height);
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(item.x, item.y, item.width, item.height);
        // Window grids
        ctx.fillStyle = "rgba(255, 230, 0, 0.4)";
        for (let bx = item.x + 10; bx < item.x + item.width - 10; bx += 18) {
          for (let by = item.y + 10; by < item.y + item.height - 10; by += 18) {
            ctx.fillRect(bx, by, 8, 8);
          }
        }
        ctx.restore();
      } else if (item.type === "pond") {
        ctx.save();
        ctx.fillStyle = "#2980b9";
        ctx.beginPath();
        ctx.ellipse(item.x, item.y, item.rx, item.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#3498db";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}
