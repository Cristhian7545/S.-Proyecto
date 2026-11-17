const sky = document.querySelector("#festival");
const ink = sky.getContext("2d");
const music = document.querySelector("#festival-music");
const sound = document.querySelector("#festival-sound");
const soundLabel = document.querySelector("#festival-sound-label");
const launch = document.querySelector("#launch-firework");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const turn = Math.PI * 2;
const showLength = 24;
const interactiveFireworks = [];
let stillFirework;
const palettes = [
  ["#fff3bb", "#ffc469", "#ff895e"],
  ["#fff3ed", "#ffc0df", "#fb78b3"],
  ["#fff6d8", "#a8d7ff", "#9aabff"],
  ["#fff7cf", "#d8a8ff", "#f295ff"],
  ["#fff5bf", "#b7f5cd", "#7bdaca"]
];
const lanternPaths = [
  [0, -.22, 1.02], [.85, .19, .76], [2.15, -.33, .63],
  [3.42, .32, .83], [4.65, -.12, .89], [5.9, .27, .58],
  [7.25, -.25, .72], [8.6, .12, 1.0], [10.15, -.37, .53],
  [11.35, .38, .66], [12.4, -.15, .81]
];

let width, height, size, ground;
let elapsed = 0;
let previousFrame;
let frameId;
let seed = 1253;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}

const choreography = [
  [0, .22, .26, .173, 0, "bloom"], [.22, .33, .135, .116, 3, "ring"],
  [.35, .78, .24, .168, 1, "bloom"], [.69, .68, .12, .118, 0, "bloom"],
  [1.1, .49, .138, .18, 2, "ring"], [1.65, .12, .44, .12, 3, "willow"],
  [1.95, .9, .43, .125, 0, "bloom"], [3.65, .28, .15, .18, 4, "ring"],
  [4.25, .72, .18, .18, 0, "willow"], [5.1, .13, .32, .16, 1, "bloom"],
  [5.22, .88, .32, .15, 2, "bloom"], [6.7, .52, .115, .15, 3, "ring"],
  [7.08, .31, .24, .098, 1, "ring"], [7.23, .73, .19, .094, 0, "bloom"],
  [7.7, .23, .22, .185, 0, "willow"], [8.1, .77, .27, .167, 4, "bloom"],
  [9.35, .11, .46, .13, 2, "ring"], [9.46, .91, .45, .15, 1, "ring"],
  [10.9, .27, .29, .182, 3, "bloom"], [11.4, .7, .17, .17, 0, "bloom"],
  [12.2, .5, .12, .19, 1, "ring"], [13.7, .155, .27, .155, 4, "willow"],
  [13.82, .86, .26, .17, 2, "willow"], [14.65, .31, .165, .17, 1, "bloom"],
  [14.9, .68, .17, .17, 3, "bloom"], [16.0, .175, .27, .2, 0, "bloom"],
  [16.18, .825, .27, .2, 0, "bloom"], [16.45, .5, .13, .21, 2, "ring"],
  [16.72, .115, .44, .15, 1, "bloom"], [16.9, .885, .44, .15, 4, "bloom"],
  [17.35, .3, .2, .18, 3, "willow"], [17.5, .7, .2, .185, 1, "willow"],
  [19.25, .15, .32, .15, 2, "ring"], [19.5, .85, .34, .16, 0, "ring"],
  [20.9, .265, .19, .18, 1, "willow"], [21.35, .72, .22, .19, 4, "bloom"],
  [22.16, .48, .12, .155, 0, "ring"]
];

function createFirework([at, x, y, spread, palette, shape], index) {
  const ring = shape === "ring";
  const willow = shape === "willow";
  const count = ring ? 84 : 132;
  const sparks = Array.from({ length: count }, (_, ray) => {
    const angle = ray / count * turn + (random() - .5) * (ring ? .031 : .22);
    const distance = (ring ? .85 + random() * .14 : .28 + Math.sqrt(random()) * .72) * spread;
    return {
      vx: Math.cos(angle) * distance * (willow ? .95 : 1.1),
      vy: Math.sin(angle) * distance * (ring ? .93 : 1.07),
      life: (willow ? 2.13 : 1.48) + random() * 1.1,
      color: palettes[palette][Math.floor(random() * 3)],
      tail: willow ? .28 + random() * .23 : .16 + random() * .19,
      phase: random() * turn,
      bright: ray % 4 === 0
    };
  });
  return { at, x, y, xOrigin: clamp(x + (index % 2 ? -.105 : .11), .035, .965), flight: .78 + random() * .36, sparks, palette: palettes[palette] };
}

const fireworks = choreography.map(createFirework);

function halo(x, y, radius, color, opacity) {
  const glow = ink.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, "#fff1d9");
  glow.addColorStop(.14, color);
  glow.addColorStop(1, color + "00");
  ink.globalAlpha = opacity;
  ink.fillStyle = glow;
  ink.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function rocketPosition(cue, progress) {
  const pace = progress * (2 - progress);
  return [
    (cue.xOrigin + (cue.x - cue.xOrigin) * pace + Math.sin(progress * Math.PI) * .023) * width,
    (.78 + (cue.y - .78) * pace) * height
  ];
}

function drawRocket(cue, progress) {
  const [x, y] = rocketPosition(cue, progress);
  const [tailX, tailY] = rocketPosition(cue, Math.max(0, progress - .23));
  const gradient = ink.createLinearGradient(tailX, tailY, x, y);
  gradient.addColorStop(0, "#f5ac6300");
  gradient.addColorStop(.73, cue.palette[1] + "b0");
  gradient.addColorStop(1, "#fff4c6");
  ink.globalAlpha = .91;
  ink.strokeStyle = gradient;
  ink.lineWidth = Math.max(1.4, size * .0026);
  ink.beginPath();
  ink.moveTo(tailX, tailY);
  for (let sample = 1; sample <= 6; sample++) {
    const pos = rocketPosition(cue, Math.max(0, progress - .23 * (1 - sample / 6)));
    ink.lineTo(pos[0], pos[1]);
  }
  ink.stroke();
  for (let i = 1; i <= 14; i++) {
    const back = i * .013;
    if (progress < back) break;
    const [sx, sy] = rocketPosition(cue, progress - back);
    ink.globalAlpha = (.72 - back * 2.7) * (.68 + Math.sin(i * 4.2 + progress * 63) * .31);
    ink.fillStyle = i % 3 ? "#ffd293" : cue.palette[2];
    ink.fillRect(sx + Math.sin(i * 9.4 + progress * 8) * i * size * .0017, sy + back * 97, i % 3 ? 1.4 : 2.2, 1.5);
  }
  halo(x, y, 8 + size * .012, cue.palette[0], .7);
  ink.globalAlpha = 1;
  ink.fillStyle = "#fff9da";
  ink.beginPath();
  ink.arc(x, y, Math.max(1.8, size * .003), 0, turn);
  ink.fill();
}

function drawBurst(cue, age) {
  const cx = cue.x * width;
  const cy = cue.y * height;
  if (age < .34) {
    const flash = 1 - age / .34;
    halo(cx, cy, size * (.045 + age * .23), cue.palette[0], flash * .77);
  }
  const expansion = (1 - Math.exp(-age * 1.05)) / 1.05;
  const fall = age * age * .046;
  for (const spark of cue.sparks) {
    if (age >= spark.life) continue;
    const tailAge = Math.max(0, age - spark.tail);
    const tailExpansion = (1 - Math.exp(-tailAge * 1.05)) / 1.05;
    const x = cx + spark.vx * size * expansion;
    const y = cy + (spark.vy * expansion + fall) * size;
    const tailX = cx + spark.vx * size * tailExpansion;
    const tailY = cy + (spark.vy * tailExpansion + tailAge * tailAge * .046) * size;
    const fading = (1 - age / spark.life) ** .73;
    const shine = .73 + Math.sin(age * 23 + spark.phase) * .27;
    ink.strokeStyle = spark.color;
    ink.globalAlpha = fading * shine * .84;
    ink.lineWidth = (spark.bright ? 1.55 : .86) * Math.max(.82, size / 650);
    ink.beginPath();
    ink.moveTo(tailX, tailY);
    ink.quadraticCurveTo((tailX + x) / 2, (tailY + y) / 2 - (age - tailAge) * 5, x, y);
    ink.stroke();
    ink.fillStyle = spark.bright ? "#fff4db" : spark.color;
    ink.globalAlpha = fading * shine;
    const dot = spark.bright ? 2.1 : 1.15;
    ink.fillRect(x - dot / 2, y - dot / 2, dot, dot);
    if (spark.bright && age > .5) {
      ink.globalAlpha = fading * Math.max(0, Math.sin(age * 15 + spark.phase)) * .82;
      ink.fillRect(x + Math.sin(spark.phase) * age * 7, y + age * 10, 1.1, 1.1);
    }
  }
}

function drawFireworks(time, still) {
  ink.save();
  ink.globalCompositeOperation = "lighter";
  for (const cue of fireworks) {
    if (time < cue.at) continue;
    const age = (time - cue.at) % showLength;
    if (age < cue.flight) drawRocket(cue, age / cue.flight);
    else if (age < cue.flight + 3.25) drawBurst(cue, age - cue.flight);
  }
  if (still) {
    if (stillFirework) drawBurst(stillFirework, .62);
  } else {
    for (let i = interactiveFireworks.length - 1; i >= 0; i--) {
      const cue = interactiveFireworks[i];
      const age = time - cue.at;
      if (age >= cue.flight + 3.25) interactiveFireworks.splice(i, 1);
      else if (age < cue.flight) drawRocket(cue, age / cue.flight);
      else drawBurst(cue, age - cue.flight);
    }
  }
  ink.restore();
}

function fireAtSky(event) {
  const box = launch.getBoundingClientRect();
  const fromKeyboard = event.detail === 0;
  const x = fromKeyboard ? .5 : clamp((event.clientX - box.left) / width, .015, .985);
  const y = fromKeyboard ? .23 : clamp((event.clientY - box.top) / height, .015, .73);
  const variety = ["bloom", "ring", "willow"];
  const palette = Math.floor(random() * palettes.length);
  const shape = variety[Math.floor(random() * variety.length)];
  const cue = createFirework([elapsed, x, y, .15 + random() * .056, palette, shape], palette);
  cue.flight = .4 + (.78 - y) * .76;
  if (motion.matches) {
    stillFirework = cue;
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(render);
  } else {
    if (interactiveFireworks.length >= 12) interactiveFireworks.shift();
    interactiveFireworks.push(cue);
  }
}

function drawSpotlights(time) {
  ink.save();
  ink.globalCompositeOperation = "screen";
  for (const side of [-1, 1]) {
    const x = width * (.5 + side * .437);
    const y = height * .748;
    const tipX = width * (.5 - side * .07 + Math.sin(time * .48 + side * .54) * .09);
    const tipY = height * (.19 + Math.cos(time * .34 + side) * .046);
    const beam = ink.createLinearGradient(x, y, tipX, tipY);
    beam.addColorStop(0, side < 0 ? "#ffda9b86" : "#cdb7ff91");
    beam.addColorStop(.25, side < 0 ? "#ffd49645" : "#a88fff48");
    beam.addColorStop(.78, side < 0 ? "#ffdbb018" : "#cab0ff1b");
    beam.addColorStop(1, "#ead5ff00");
    ink.fillStyle = beam;
    ink.beginPath();
    ink.moveTo(x - 3, y);
    ink.lineTo(tipX - width * .075, tipY);
    ink.quadraticCurveTo(tipX, tipY - 17, tipX + width * .075, tipY);
    ink.lineTo(x + 3, y);
    ink.fill();
    halo(x, y - 2, 13, side < 0 ? "#ffcf92" : "#d9bcff", .73);
    ink.globalAlpha = 1;
  }
  ink.restore();
}

function drawLanterns(time) {
  ink.save();
  for (const [offset, drift, depth] of lanternPaths) {
    const age = (time + 4 + offset) % 14;
    const rise = age / 13;
    if (rise >= 1) continue;
    const alpha = Math.min(1, age * 1.35, (13 - age) * .82);
    const x = width * (.5 + drift * rise ** .75 + Math.sin(time * .56 + offset) * rise * .036);
    const y = height * (.79 - rise * .83);
    const half = clamp(size * .013 * depth * (1 - rise * .34), 2.75, 11);
    const flicker = .82 + Math.sin(time * 4.8 + offset * 5) * .12 + Math.cos(time * 8.4 + offset) * .06;

    ink.save();
    ink.translate(x, y);
    ink.rotate(Math.sin(time * .81 + offset) * .14);
    halo(0, half * .48, half * 2.9, "#ff9f50", alpha * flicker * .4);

    const paper = ink.createLinearGradient(-half, 0, half, 0);
    paper.addColorStop(0, "#c65d46");
    paper.addColorStop(.22, "#f38a50");
    paper.addColorStop(.64, "#ffcd83");
    paper.addColorStop(1, "#e58455");
    ink.globalAlpha = alpha * .93;
    ink.fillStyle = paper;
    ink.strokeStyle = "#ffd996a8";
    ink.lineWidth = .7;
    ink.beginPath();
    ink.moveTo(-half * .9, -half * 1.33);
    ink.quadraticCurveTo(0, -half * 1.66, half * .9, -half * 1.33);
    ink.quadraticCurveTo(half * 1.12, -half * .36, half * .7, half * 1.11);
    ink.quadraticCurveTo(0, half * 1.43, -half * .7, half * 1.11);
    ink.quadraticCurveTo(-half * 1.12, -half * .36, -half * .9, -half * 1.33);
    ink.fill();
    ink.stroke();

    ink.strokeStyle = "#a34a3873";
    ink.beginPath();
    ink.moveTo(half * .39, -half * 1.42);
    ink.quadraticCurveTo(half * .54, -half * .23, half * .32, half * 1.15);
    ink.stroke();
    ink.fillStyle = "#8b4335";
    ink.beginPath();
    ink.ellipse(0, half * 1.11, half * .7, half * .19, 0, 0, turn);
    ink.fill();
    halo(-half * .11, half * .78, half * .69, "#ffad43", alpha * flicker * .82);
    ink.fillStyle = "#fff6bd";
    ink.globalAlpha = alpha * flicker;
    ink.fillRect(-half * .15, half * .71, half * .18, half * .4);
    ink.restore();
  }
  ink.restore();
}

const silhouettes = {
  jeans: new Path2D("M-23 -52 Q1 -55 23 -52 L20 -27 17 -3 5 -3 1 -36 -4 -36 -8 -3 -20 -3 -23 -27Z"),
  denimSeams: new Path2D("M-18 -47 L-16 -26 -16 -6 M17 -46 L15 -26 14 -6 M-18 -7 L-9 -7 M7 -7 L16 -7"),
  shoes: new Path2D("M-19 -6 L-8 -5 -7 0 Q-14 3-27 1 Q-28 -2-19 -6Z M6 -5 L17 -6 Q25 -3 26 1 Q16 3 5 1Z"),
  jacket: new Path2D("M-20 -99 Q-28 -98-31 -88 L-33 -61 Q-32 -55-25 -55 L-22 -60 -22 -49 Q0 -44 22 -49 L23 -59 26 -55 Q32 -54 33 -60 L31 -88 Q29 -98 20 -100 L10 -105 -10 -105Z"),
  jacketSeams: new Path2D("M-23 -88 Q-24 -71-22 -60 M24 -87 Q24 -74 23 -59 M-21 -53 Q0 -49 21 -53"),
  neckline: new Path2D("M-9 -113 L-11 -101 Q0 -94 11 -101 L8 -113Z"),
  hood: new Path2D("M-18 -101 Q-17 -110-11 -108 Q0 -102 13 -109 Q20 -106 19 -99 Q16 -89 1 -85 Q-12 -88-18 -101Z"),
  hoodSeam: new Path2D("M-14 -101 Q-9 -93 1 -90 Q12 -94 15 -102"),
  girlHair: new Path2D("M0 -47 C-12 -54-29 -44-34 -27 C-39 -10-29 -4-34 9 C-38 19-44 25-38 34 Q-33 41-40 45 C-26 46-21 39-19 42 Q-12 49-4 43 Q5 48 14 42 C25 47 29 42 33 37 Q36 42 44 43 C36 36 43 28 39 21 C34 12 28 5 33 -8 C40 -22 32 -43 16 -48 Q7 -51 0 -47Z"),
  girlStrands: new Path2D("M-3 -45 C-21 -45-31 -33-31 -17 C-32 -5-25 5-33 16 Q-43 30-34 38 M-9 -39 C-22 -30-22 -15-19 -5 C-15 9-30 17-26 30 Q-24 39-29 42 M5 -45 C23 -43 30 -29 30 -15 C30 -5 22 3 29 16 Q40 29 33 36 M11 -37 C21 -25 21 -15 18 -4 C13 11 27 20 23 32 Q21 38 15 40"),
  girlPart: new Path2D("M0 -47 Q-1 -44 1 -39"),
  boyHair: new Path2D("M-23 -8 Q-34 -15-28 -32 L-31 -34 -22 -37 -24 -42 -13 -42 Q-10 -50 8 -47 Q21 -49 28 -36 L32 -31 28 -28 Q33 -13 21 -5 L20 4 13 1 7 6 -1 3 -9 5 -15 0 -21 1Z"),
  boyStrands: new Path2D("M-24 -23 Q-19 -37-9 -41 Q0 -46 13 -43 M-16 -28 Q-10 -36 3 -38 M21 -34 Q28 -26 24 -15"),
  crow: new Path2D("M-5 -13 Q-11 -21-11 -26 Q-13 -26-17 -26 L-23 -24 Q-21 -31-15 -32 Q-12 -42-3 -41 Q7 -41 8 -31 Q10 -27 17 -24 Q24 -20 26 -13 L41 1 Q31 -1 26 -4 L21 -5 Q20 -6 15 -6 Q4 -5-5 -13Z"),
  crowWing: new Path2D("M-2 -21 Q5 -26 16 -21 Q24 -17 28 -10 Q20 -9 12 -10 Q4 -11-2 -21Z"),
  crowFeathers: new Path2D("M4 -20 Q10 -17 18 -17 M8 -16 Q16 -13 23 -13 M-12 -30 Q-14 -29-17 -29 M20 -7 L34 -1"),
  crowFeet: new Path2D("M6 -9 L5 -2 Q1 0-2 -1 M5 -2 Q4 1 2 1 M12 -9 L12 -2 Q8 0 6 -1 M12 -2 Q12 1 9 1")
};

function fillShape(shape, color) {
  ink.fillStyle = color;
  ink.fill(silhouettes[shape]);
}

function strokeShape(shape, color, lineWidth) {
  ink.strokeStyle = color;
  ink.lineWidth = lineWidth;
  ink.stroke(silhouettes[shape]);
}

function drawSpectator(x, scale, girl, sway, light) {
  ink.save();
  ink.translate(x, ground);
  ink.scale(scale, scale);
  ink.lineCap = "round";
  ink.lineJoin = "round";
  fillShape("shoes", "#181827");
  fillShape("jeans", girl ? "#3f5e7e" : "#324766");
  strokeShape("denimSeams", "#829db188", 1.1);
  const cloth = ink.createLinearGradient(-33, -100, 33, -54);
  cloth.addColorStop(0, girl ? "#ee766a" : "#ffab58");
  cloth.addColorStop(.47, girl ? "#b73948" : "#d66b31");
  cloth.addColorStop(1, girl ? "#6c2341" : "#913e29");
  fillShape("neckline", "#d69a7e");
  fillShape("jacket", cloth);
  strokeShape("jacket", girl ? "#eab28958" : "#ffd59b77", .85);
  strokeShape("jacketSeams", girl ? "#73283d" : "#953f2c", 1.25);
  fillShape("hood", girl ? "#8d283e" : "#b04d2c");
  strokeShape("hoodSeam", girl ? "#ed8177" : "#f69e55", 1.05);
  ink.translate(0, -108);
  ink.rotate(sway);
  if (girl) ink.scale(.87, 1);
  const hair = girl ? "girlHair" : "boyHair";
  fillShape(hair, girl ? "#211b25" : "#211923");
  strokeShape(hair, `rgba(255, 205, 144, ${.3 + light * .31})`, .95);
  strokeShape(girl ? "girlStrands" : "boyStrands", girl ? "#59454f" : "#775044", 1.3);
  if (girl) strokeShape("girlPart", "#87616b", .8);
  ink.restore();
}

function drawCrow(x, y) {
  ink.save();
  const scale = clamp(size * .002, .62, 1.45);
  ink.translate(x, y);
  ink.scale(scale, scale);
  ink.lineCap = "round";
  strokeShape("crowFeet", "#402d35", 1.8);
  const feathers = ink.createLinearGradient(-18, -38, 23, -5);
  feathers.addColorStop(0, "#3c344b");
  feathers.addColorStop(.5, "#1b1829");
  feathers.addColorStop(1, "#101320");
  fillShape("crow", feathers);
  strokeShape("crow", "#bfa2a470", .82);
  fillShape("crowWing", "#24273b");
  strokeShape("crowFeathers", "#74617a91", .88);
  ink.fillStyle = "#edcaa0";
  ink.beginPath();
  ink.arc(-9.2, -33, 1.25, 0, turn);
  ink.fill();
  ink.restore();
}

function drawLookout(time) {
  const rail = height * .755;
  const floor = height * .95;
  const bars = Math.max(24, Math.min(48, width * .044));
  const deck = ink.createLinearGradient(0, floor - 8, 0, height);
  deck.addColorStop(0, "#2b2330");
  deck.addColorStop(1, "#120f1e");
  ink.fillStyle = deck;
  ink.fillRect(0, floor - 5, width, height - floor + 5);
  ink.fillStyle = "#202030";
  for (let x = bars * .5; x < width; x += bars) {
    ink.fillRect(x, rail, 3, floor - rail);
    ink.fillStyle = "#eab48236";
    ink.fillRect(x, rail, 1, floor - rail);
    ink.fillStyle = "#202030";
  }
  ink.fillRect(0, rail - 3, width, 8);
  ink.fillRect(0, floor - 10, width, 4);
  ink.fillStyle = "#f1ba8591";
  ink.fillRect(0, rail - 3, width, 1.35);
  for (const side of [-1, 1]) {
    const x = width * (.5 + side * .437);
    ink.fillStyle = "#302840";
    ink.fillRect(x - 6, rail - 9, 12, 6);
    ink.fillStyle = side < 0 ? "#ffd092" : "#e4c4ff";
    ink.fillRect(x - 4, rail - 9, 8, 1.5);
  }

  const scale = Math.max(.58, Math.min(height * .00218, width * .0038, 2.08));
  const spacing = scale * 38;
  ink.fillStyle = "#100d1a83";
  ink.beginPath();
  ink.ellipse(width / 2, ground + 2, spacing * 1.95, scale * 4.2, 0, 0, turn);
  ink.fill();
  drawSpectator(width / 2 - spacing, scale, true, Math.sin(time * .82) * .038, (1 + Math.sin(time * 2.1)) / 2);
  drawSpectator(width / 2 + spacing, scale * 1.095, false, Math.sin(time * .71 + 1) * .031, (1 + Math.cos(time * 1.67)) / 2);
  drawCrow(width * .79, rail - 3);
}

function render(now) {
  const still = motion.matches;
  if (previousFrame !== undefined) elapsed += Math.min(.05, (now - previousFrame) / 1000);
  previousFrame = now;
  const time = still ? 2.26 : elapsed;
  ink.clearRect(0, 0, width, height);
  drawSpotlights(time);
  drawLanterns(time);
  drawFireworks(time, still);
  drawLookout(time);
  if (!still) frameId = requestAnimationFrame(render);
}

function fitSky() {
  width = sky.clientWidth;
  height = sky.clientHeight;
  size = Math.min(width, height) * (width < 650 ? 1.16 : 1);
  ground = height * .973;
  const pixelRatio = Math.min(devicePixelRatio || 1, 1.75);
  sky.width = Math.round(width * pixelRatio);
  sky.height = Math.round(height * pixelRatio);
  ink.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  cancelAnimationFrame(frameId);
  previousFrame = undefined;
  frameId = requestAnimationFrame(render);
}

function syncSound() {
  const playing = !music.paused;
  sound.setAttribute("aria-pressed", String(playing));
  soundLabel.textContent = playing ? "Pausar música" : "Activar música";
}

function playMusic() {
  music.play().catch(syncSound);
}

function startOnInteraction(event) {
  if (!sound.contains(event.target) && music.paused) playMusic();
}

document.addEventListener("click", startOnInteraction, true);
music.addEventListener("play", () => {
  document.removeEventListener("click", startOnInteraction, true);
  syncSound();
});
music.addEventListener("pause", syncSound);
sound.addEventListener("click", () => {
  if (music.paused) playMusic();
  else music.pause();
});

window.addEventListener("resize", fitSky);
motion.addEventListener("change", fitSky);
launch.addEventListener("click", fireAtSky);
fitSky();
syncSound();
playMusic();
