const canvas = document.querySelector("#landscape");
const ctx = canvas.getContext("2d");
const music = document.querySelector("#music");
const sound = document.querySelector("#sound");
const soundLabel = document.querySelector("#sound-label");
const greeting = document.querySelector("#greeting");
const scene = document.querySelector(".scene");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const walkDuration = 4.2;
const meteorStart = 4.5;
const meteorEnd = 8.3;
const meteorSparks = [0.16, .23, .31, .39, .49, .56, .64, .72, .84, .94];
const passingMeteors = [
  { at: 3.5, duration: 1.05, x: .71, y: .12, dx: .18, dy: .07 },
  { at: 16, duration: 1.3, x: .42, y: .08, dx: -.23, dy: .08 },
  { at: 26.5, duration: .95, x: .76, y: .13, dx: .16, dy: .10 }
];
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = value => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

let cycleStart = performance.now();
let greetingVisible = false;
let awaitingFirstPlayback = true;
let meadowFrame;
let width;
let height;
let portrait;
let grass = [];
let stars = [];

function resize() {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  portrait = width <= 680 && height > width;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  let seed = 197;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  stars = Array.from({ length: Math.min(160, Math.ceil(width / 8)) }, (_, index) => ({
    x: random() * width,
    y: (.035 + random() * .54) * height,
    size: .4 + random() ** 2 * 1.7,
    phase: random() * Math.PI * 2,
    speed: .65 + random() * 1.6,
    flare: index % 9 === 0,
    period: 7 + random() * 11,
    offset: random() * 17
  }));

  grass = Array.from({ length: Math.min(1000, Math.ceil(width * .7)) }, () => {
    const depth = random();
    return {
      x: random() * (width + 45) - 25,
      y: (.67 + depth * .36) * height,
      length: (.25 + random() * .75) * (12 + depth * 62) * clamp(height / 780, .55, 1.25),
      width: .6 + random() * (1 + depth * 3),
      lean: (random() - .5) * 32,
      shade: Math.floor(random() * 5)
    };
  }).sort((a, b) => a.y - b.y);
}

const grassColors = ["#0a302a", "#124135", "#1f5942", "#347451", "#40815a"];

function drawGrass(time, from, to) {
  for (const blade of grass) {
    const { x, y, length, lean, shade } = blade;
    if (y < from) continue;
    if (y >= to) break;
    const wind = Math.sin(time * 1.65 + x * .012 + y * .014);
    const tip = lean + wind * length * .31;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + tip * .16, y - length * .62, x + tip, y - length);
    ctx.quadraticCurveTo(x + tip * .39 + blade.width, y - length * .46, x + blade.width, y);
    ctx.fillStyle = grassColors[shade];
    ctx.globalAlpha = .68;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function glint(x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.quadraticCurveTo(x + size * .13, y - size * .13, x + size * .72, y);
  ctx.quadraticCurveTo(x + size * .13, y + size * .13, x, y + size);
  ctx.quadraticCurveTo(x - size * .13, y + size * .13, x - size * .72, y);
  ctx.quadraticCurveTo(x - size * .13, y - size * .13, x, y - size);
  ctx.fill();
}

function drawStars(time, afterMeteor) {
  for (const star of stars) {
    const light = .51 + Math.sin(time * star.speed + star.phase) * .45;
    ctx.globalAlpha = light;
    ctx.fillStyle = "#f7efdb";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size * (.55 + light * .45), 0, Math.PI * 2);
    ctx.fill();
    if (star.flare && afterMeteor >= 0) {
      const moment = (afterMeteor + star.offset) % star.period;
      if (moment < 1.45) {
        const shine = Math.sin(Math.PI * moment / 1.45) ** 2;
        ctx.globalAlpha = shine * .85;
        ctx.fillStyle = "#fff5d3";
        glint(star.x, star.y, 2 + 6 * shine);
      }
    }
  }
  ctx.globalAlpha = 1;
}

function drawMeteor(progress, x, y, dx, dy, main = false) {
  const tail = Math.max(1, Math.min(width * (main ? .34 : .12), main ? 450 : 130) * smooth(progress * 9));
  const core = main ? clamp(width * .009, 6, 12) : 2;
  const opacity = Math.min(smooth(progress * 15), smooth((1 - progress) * 9)) * (main ? 1 : .7);
  ctx.save();
  ctx.translate(width * (x + dx * progress), height * (y + dy * progress));
  ctx.rotate(Math.atan2(height * dy, width * dx));
  ctx.globalAlpha = opacity;
  const trail = ctx.createLinearGradient(-tail, 0, core, 0);
  trail.addColorStop(0, "#91afff00");
  trail.addColorStop(.49, "#a8a9ffa0");
  trail.addColorStop(.8, "#a5dcffdc");
  trail.addColorStop(1, "#fff1b6");
  ctx.fillStyle = trail;
  ctx.beginPath();
  ctx.moveTo(-tail, 0);
  ctx.quadraticCurveTo(-tail * .38, -core * .27, 0, -core * .49);
  ctx.quadraticCurveTo(core * 1.05, 0, 0, core * .49);
  ctx.quadraticCurveTo(-tail * .4, core * .29, -tail, 0);
  ctx.fill();

  if (main) {
    const halo = ctx.createRadialGradient(0, 0, 1, 0, 0, core * 3.4);
    halo.addColorStop(0, "#fff1b4bf");
    halo.addColorStop(.4, "#8ac7ff45");
    halo.addColorStop(1, "#8ac7ff00");
    ctx.fillStyle = halo;
    ctx.fillRect(-core * 3.4, -core * 3.4, core * 6.8, core * 6.8);

    ctx.fillStyle = "#ffe8ab";
    for (const [index, distance] of meteorSparks.entries()) {
      const flicker = .5 + Math.sin(progress * 46 + index * 3) * .35;
      const drift = Math.sin(index * 7) * distance * core * (1.4 + progress);
      ctx.globalAlpha = opacity * (1 - distance * .71) * flicker;
      glint(-tail * distance, drift, 1.4 + (1 - distance) * 2.8);
    }
  }

  ctx.globalAlpha = opacity;
  ctx.fillStyle = "#fff8e4";
  ctx.beginPath();
  ctx.ellipse(0, 0, core * .84, core * .38, 0, 0, Math.PI * 2);
  ctx.fill();
  if (main) glint(0, 0, core * 1.45);
  ctx.restore();
}

function drawPassingMeteors(afterMeteor) {
  const time = afterMeteor % 35;
  for (const { at, duration, x, y, dx, dy } of passingMeteors) {
    const progress = (time - at) / duration;
    if (progress > 0 && progress < 1) drawMeteor(progress, x, y, dx, dy);
  }
}

// Each shape has its own origin so the limbs and head can pivot independently.
const shapes = {
  leg: new Path2D("M-10 -5 Q-2 -7 9 -3 L8 24 6 48 Q0 51-8 48 L-10 27Z"),
  seam: new Path2D("M4 4 L3 24 1 46 M-7 45 Q0 47 5 45"),
  shoe: new Path2D("M-7 48 Q1 50 6 47 Q8 49 13 49 Q19 50 18 54 L-7 54 Q-9 51-7 48Z"),
  sole: new Path2D("M-7 53 Q6 55 18 53 M6 50 L10 50"),
  arm: new Path2D("M-6 0 Q0 -6 7 1 L8 14 7 34 Q3 38-5 35 L-7 15Z"),
  hand: new Path2D("M-3 32 Q2 33 6 32 L6 39 Q4 45-1 44 Q-5 43-4 38Z"),
  top: new Path2D("M-20 -91 Q-15 -101-5 -101 L8 -101 Q21 -100 23 -85 L20 -48 Q8 -41-15 -46 L-22 -64Z"),
  topLight: new Path2D("M-2 -101 Q13 -102 21 -95 Q25 -84 20 -70 L17 -48 Q11 -46 5 -45 L9 -75 Q11 -91-2 -101Z"),
  hem: new Path2D("M-17 -52 Q0 -46 19 -52"),
  hood: new Path2D("M-17 -95 Q-24 -103-17 -108 Q-7 -111 2 -103 Q11 -108 17 -102 Q19 -98 15 -94 Q3 -87-17 -95Z"),
  hoodieDetails: new Path2D("M2 -94 L4 -78 M9 -94 L11 -81 M3 -66 L16 -66 19 -57 0 -57Z"),
  neck: new Path2D("M-8 -113 L-13 -99 Q-4 -92 8 -99 L6 -114Z"),
  hairBack: new Path2D("M-31 -24 C-28 -43-12 -51 5 -49 Q28 -50 31 -29 C35 -14 22 -8 24 4 C25 14 34 21 27 32 Q22 40 27 43 C16 47 9 38 4 43 Q-6 49-15 41 C-24 44-33 40-36 34 C-43 23-32 16-35 6 C-38 -5-35 -14-31 -24Z"),
  hairStrands: new Path2D("M-29 -19 C-38 -4-29 5-34 17 Q-41 32-29 38 M-21 -16 C-28 -1-18 9-24 22 Q-30 33-22 38 M22 -6 C16 6 30 18 24 28 Q20 35 24 40"),
  face: new Path2D("M-18 -23 Q-12 -42 10 -40 Q25 -35 26 -18 L30 -12 Q32 -9 26 -7 Q25 6 12 12 Q0 17-12 11 Q-24 4-23 -11Z"),
  fringe: new Path2D("M8 -47 C-9 -55-29 -41-33 -26 C-38 -11-26 -2-28 9 C-30 21-37 27-29 37 Q-24 43-27 45 C-15 39-16 32-21 24 C-27 15-15 10-15 1 Q-15 -10-22 -13 C-13 -15-5 -21-1 -31 Q2 -36 8 -39 C16 -38 19 -30 27 -27 Q27 -36 22 -41 Q16 -48 8 -47Z"),
  hairLight: new Path2D("M5 -47 C-13 -46-26 -36-29 -22 M3 -43 C-13 -39-18 -23-27 -18 M-26 -12 C-26 -5-19 1-22 9 C-26 21-31 26-25 36 M12 -45 Q21 -41 25 -32"),
  part: new Path2D("M8 -47 Q7 -43 8 -39"),
  ear: new Path2D("M-17 -10 C-24 -16-27 -5-22 0 Q-19 3-15 -2Z"),
  brow: new Path2D("M9 -23 Q15 -27 21 -24"),
  smile: new Path2D("M18 1 Q21 3 24 0"),
  rearJeans: new Path2D("M-20 -52 Q0 -56 20 -52 Q23 -40 21 -26 L19 -4 Q12 0 5 -4 L0 -31 L-4 -4 Q-12 0 -19 -4 L-21 -27 Q-23 -39 -20 -52Z"),
  rearPockets: new Path2D("M-17 -43 L-5 -42 L-6 -35 Q-11 -31-16 -36Z M5 -42 L17 -43 L16 -36 Q11 -31 6 -35Z M0 -45 L0 -32"),
  heel: new Path2D("M-8 -7 Q0 -9 8 -7 L9 -1 Q8 2 0 2 Q-8 2-9 -1Z"),
  heelSole: new Path2D("M-8 0 Q0 2 8 0"),
  rearTop: new Path2D("M-25 -91 Q-22 -103-9 -104 L9 -104 Q22 -103 25 -91 L21 -51 Q0 -44-21 -51Z"),
  rearHood: new Path2D("M-18 -101 Q0 -108 18 -101 Q23 -94 16 -80 Q10 -68 0 -66 Q-10 -68-16 -80 Q-23 -94-18 -101Z"),
  hoodSeam: new Path2D("M-16 -86 Q-10 -72 0 -69 Q10 -72 16 -86 M0 -80 L0 -70"),
  rearHair: new Path2D("M-31 -29 C-25 -44-12 -51 0 -49 C14 -52 28 -43 32 -28 C36 -16 30 -7 33 2 C37 13 34 22 26 26 Q22 28 24 34 Q13 35 9 30 Q6 37-2 38 Q-5 34-9 32 Q-16 38-24 33 Q-20 30-28 27 C-39 22-39 11-35 2 C-31 -6-36 -16-31 -29Z"),
  rearWaves: new Path2D("M-5 -45 C-28 -40-26 -22-27 -12 C-28 -1-34 10-29 20 Q-26 26-22 27 M-15 -29 C-25 -18-18 -9-22 1 Q-29 19-16 27 M4 -45 C24 -39 25 -22 22 -9 C20 2 31 12 24 22 Q19 26 16 28 M10 -28 C16 -18 11 -5 14 4 Q21 19 10 29 M-3 -18 C-7 -7 0 1-5 13 Q-9 24-4 29")
};

function fill(shape, color) {
  ctx.fillStyle = color;
  ctx.fill(shapes[shape]);
}

function stroke(shape, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke(shapes[shape]);
}

function drawLeg(x, swing, far) {
  ctx.save();
  ctx.translate(x, -53);
  ctx.rotate(swing);
  fill("leg", far ? "#24384e" : "#3f5e7e");
  stroke("seam", far ? "#49617a" : "#7190aa", .8);
  fill("shoe", far ? "#141b2b" : "#232c40");
  stroke("sole", far ? "#928a8b" : "#ebdfd6", 1.5);
  ctx.restore();
}

function drawArm(x, y, swing, far) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(swing);
  fill("hand", far ? "#a97061" : "#dfaa90");
  fill("arm", far ? "#8c273a" : "#c73b45");
  ctx.restore();
}

function faceDetail(x, y, radiusX, radiusY, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawGirlFromBehind(elapsed, time, still) {
  const follow = smooth((elapsed - meteorStart) / (meteorEnd - meteorStart));
  const scanning = smooth((elapsed - meteorEnd) / 1.8);
  const glance = still ? 0 : (.76 * (2 * follow - 1)) * (1 - scanning) + Math.sin(time * .64) * scanning;
  const gazeUp = still ? 1 : smooth((elapsed - 4.12) / (meteorStart - 4.12));

  fill("rearJeans", "#395676");
  stroke("rearPockets", "#7891a8", .85);
  for (const x of [-12, 12]) {
    ctx.save();
    ctx.translate(x, 0);
    fill("heel", "#222b40");
    stroke("heelSole", "#dfd4d1", 1.55);
    ctx.restore();
  }
  const sway = still ? 0 : Math.sin(time * 1.7) * .026;
  drawArm(-22, -89, .14 + sway, true);
  drawArm(22, -89, -.14 + sway, false);
  const hoodie = ctx.createLinearGradient(-27, -100, 24, -46);
  hoodie.addColorStop(0, "#8f283b");
  hoodie.addColorStop(.53, "#b73343");
  hoodie.addColorStop(1, "#d0464f");
  fill("rearTop", hoodie);
  fill("rearHood", "#8e2a3c");
  stroke("hoodSeam", "#d35b60", 1);
  stroke("hem", "#e27871", 1.05);

  ctx.save();
  ctx.translate(glance * 3.5, -108 - gazeUp * 3);
  ctx.rotate(glance * .125);
  ctx.scale(1 - Math.abs(glance) * .045, 1 - gazeUp * .07);
  const hair = ctx.createLinearGradient(-32, -44, 30, 32);
  hair.addColorStop(0, "#403641");
  hair.addColorStop(.52, "#211b25");
  hair.addColorStop(1, "#332832");
  fill("rearHair", hair);
  stroke("rearWaves", "#655260", 1.25);
  ctx.restore();
}

function drawGirl(elapsed, time, still) {
  const arrival = still ? 1 : smooth(elapsed / walkDuration);
  const target = width * (portrait ? .42 : .33);
  const scale = clamp(height / 530, .54, 1.9);
  const x = -55 * scale + (target + 55 * scale) * arrival;
  const floor = height * (portrait ? .9 : .87);
  const walking = still ? 0 : smooth(elapsed * 3) * (1 - smooth((elapsed - 3.63) / .57));
  const step = Math.sin(elapsed * 8.8) * walking;
  const bob = Math.abs(step) * 4 + Math.sin(time * 1.75) * .62;
  const turnStart = 3.82;
  const turn = still ? 1 : smooth((elapsed - turnStart) / (meteorStart - turnStart));

  ctx.save();
  ctx.translate(x, floor);
  ctx.scale(scale, scale);
  const shadow = ctx.createRadialGradient(1, 0, 2, 1, 0, 35);
  shadow.addColorStop(0, "#030c14aa");
  shadow.addColorStop(1, "#030c1400");
  ctx.save();
  ctx.scale(1, .23);
  ctx.fillStyle = shadow;
  ctx.fillRect(-36, -35, 72, 70);
  ctx.restore();
  ctx.translate(0, -bob);
  ctx.lineCap = "round";
  ctx.scale(1 - Math.sin(turn * Math.PI) * .16, 1);
  if (turn >= .5) {
    drawGirlFromBehind(elapsed, time, still);
    ctx.restore();
    return;
  }

  const gaze = smooth((elapsed - turnStart) / .56);
  const headAngle = -gaze * .34;
  const headX = -2;
  ctx.save();
  ctx.translate(headX, -108);
  ctx.rotate(headAngle * .72 + Math.sin(time * 2.05) * .065 + step * .075);
  fill("hairBack", "#211c26");
  stroke("hairStrands", "#493944", 1.2);
  ctx.restore();

  drawLeg(8, step * .48, true);
  drawArm(14, -88, -step * .42, true);
  drawLeg(-7, -step * .48, false);
  fill("top", "#ac2838");
  fill("topLight", "#d3444b");
  fill("hood", "#94283a");
  stroke("hoodieDetails", "#ee7771", .85);
  stroke("hem", "#e27871", 1.05);
  fill("neck", "#d19580");
  drawArm(-15, -89, step * .43 + .12, false);

  ctx.save();
  ctx.translate(headX, -108);
  ctx.rotate(headAngle);
  fill("face", "#edb495");
  fill("ear", "#d58e79");
  const hair = ctx.createLinearGradient(-34, -43, 27, 35);
  hair.addColorStop(0, "#3c3039");
  hair.addColorStop(.48, "#211b25");
  hair.addColorStop(1, "#30262f");
  fill("fringe", hair);
  stroke("hairLight", "#59454f", 1.35);
  stroke("part", "#a2746b", .8);
  stroke("brow", "#382731", 1.65);
  faceDetail(18, -15, 6.3, 6.7, "#fff2de");
  faceDetail(19 + gaze * .8, -15 - gaze * 1.2, 4.05, 5.5, "#32242e");
  faceDetail(19 + gaze * .8, -17 - gaze * 1.2, 1.6, 1.75, "#fff8eb");
  faceDetail(15, -5, 5.3, 2.4, "#e39483");
  stroke("smile", "#a45958", 1);
  ctx.restore();
  ctx.restore();
}

function updateText(visible) {
  greeting.classList.toggle("is-visible", visible);
  greeting.inert = !visible;
}

function changeScene(view) {
  scene.dataset.view = view;
  awaitingFirstPlayback = true;
  if (view === "galaxy") {
    cancelAnimationFrame(meadowFrame);
    music.src = "assets/musica/Coleccionista de Canciones.mp3";
    music.loop = true;
  } else {
    music.src = "assets/musica/Alpaquitay.mp3";
    music.loop = false;
    cycleStart = performance.now() - meteorEnd * 1000;
    greetingVisible = true;
    updateText(true);
    resize();
    meadowFrame = requestAnimationFrame(frame);
  }
  syncSound();
  playMusic();
}

function frame(now) {
  const elapsed = Math.max(0, (now - cycleStart) / 1000);
  const still = reducedMotion.matches;
  const time = still ? 0 : elapsed;
  ctx.clearRect(0, 0, width, height);
  const afterMeteor = elapsed - meteorEnd;
  drawStars(time, still ? -1 : afterMeteor);
  if (!still && elapsed > meteorStart && elapsed < meteorEnd) {
    drawMeteor((elapsed - meteorStart) / (meteorEnd - meteorStart), -.035, .115, 1.11, .26, true);
  }
  if (!still && afterMeteor >= 0) {
    drawPassingMeteors(afterMeteor);
  }
  const floor = height * (portrait ? .9 : .87);
  drawGrass(time, 0, floor);
  drawGirl(elapsed, time, still);
  drawGrass(time, floor, Infinity);

  const reveal = still || elapsed >= meteorEnd;
  if (reveal !== greetingVisible) {
    greetingVisible = reveal;
    updateText(reveal);
  }
  meadowFrame = requestAnimationFrame(frame);
}

function syncSound() {
  const playing = !music.paused && !music.ended;
  sound.setAttribute("aria-pressed", String(playing));
  sound.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
  soundLabel.textContent = playing ? "Pausar música" : "Activar música";
}

function playMusic() {
  music.play().catch(syncSound);
}

sound.addEventListener("click", () => {
  if (music.paused || music.ended) playMusic();
  else music.pause();
});

function startOnInteraction(event) {
  if (!awaitingFirstPlayback || sound.contains(event.target)) return;
  if (event.type === "keydown" && (event.repeat || !["Enter", " "].includes(event.key))) return;
  if (music.paused) playMusic();
}

document.addEventListener("click", startOnInteraction, true);
document.addEventListener("keydown", startOnInteraction, true);
music.addEventListener("play", () => {
  awaitingFirstPlayback = false;
  syncSound();
});
music.addEventListener("pause", syncSound);
music.addEventListener("ended", () => {
  cycleStart = performance.now();
  greetingVisible = reducedMotion.matches;
  updateText(greetingVisible);
  music.currentTime = 0;
  playMusic();
});

window.addEventListener("resize", () => {
  if (scene.dataset.view === "meadow") resize();
});
resize();
syncSound();
playMusic();
meadowFrame = requestAnimationFrame(frame);
