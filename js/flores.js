const canvas = document.querySelector("#flower-field");
const brush = canvas.getContext("2d");
const tree = document.querySelector("#cherry-tree");
const music = document.querySelector("#flower-music");
const sound = document.querySelector("#flower-sound");
const soundLabel = document.querySelector("#flower-sound-label");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const turn = Math.PI * 2;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const varieties = [
  { petals: 8, bright: "#fff9dd", shade: "#f4dfb1", center: "#e2a74b" },
  { petals: 6, bright: "#ffb7c8", shade: "#f085ac", center: "#ffe6aa" },
  { petals: 7, bright: "#d6c4ff", shade: "#a989e0", center: "#fff0b0" },
  { petals: 6, bright: "#ffd772", shade: "#f3ae47", center: "#a96740" },
  { petals: 5, bright: "#8ed7ef", shade: "#6db2dc", center: "#fff7c8" },
  { petals: 0, bright: "#ff9984", shade: "#d9546f", center: "#ffc09a" },
  { petals: 0, bright: "#f5bfeb", shade: "#b771b6", center: "#ffe3ed" }
];

const plantShapes = {
  leaf: new Path2D("M0 0 Q.28-.64 1-.67 Q.8-.08 0 0Z"),
  petal: new Path2D("M0 .14 C-.67-.07-.62-1.02-.14-1.22 C.49-1.5.71-.66.29-.1Z"),
  tulip: new Path2D("M0 .52 Q-1 .28-.91-1.07 Q-.52-.99-.33-.57 Q-.05-1.2.22-1.25 Q.32-.87.55-.64 Q.73-.97.99-1.06 Q1.06.34 0 .52Z"),
  fold: new Path2D("M-.46-.86 Q-.45.14.05.44 Q.44.22.52-.8 Q.22-.53.01-.79 Q-.21-.58-.46-.86Z"),
  falling: new Path2D("M-1.06 .2 Q-.65-1.06.39-.66 Q.79-.61.65-.24 Q1.2-.29 1 .23 Q.52.77-1.06 .2Z")
};

const dress = {
  hair: new Path2D("M0 -130 C-18 -135-32 -124-36 -106 C-41 -90-33 -76-38 -65 C-43 -53-48 -48-42 -38 C-38 -29-42 -24-46 -21 C-31 -21-29 -32-29 -42 L29 -42 C32 -32 35 -27 45 -23 C40 -30 47 -41 43 -49 C40 -58 33 -62 37 -76 C42 -90 39 -108 31 -119 C23 -130 9 -133 0 -130Z"),
  strands: new Path2D("M-37 -89 C-40 -76-32 -72-39 -59 Q-48 -45-40 -36 M37 -88 Q34 -74 38 -64 Q48 -50 40 -38"),
  head: new Path2D("M-23 -103 Q-15 -121 9 -119 Q24 -116 27 -101 L27 -82 Q26 -69 9 -65 Q0 -62-12 -66 Q-29 -71-28 -87Z"),
  frontHair: new Path2D("M0 -129 C-15 -135-32 -122-36 -104 C-40 -90-29 -81-34 -69 C-40 -58-43 -52-37 -42 Q-31 -32-39 -24 C-26 -26-21 -36-26 -46 C-31 -55-27 -62-23 -72 Q-20 -81-25 -88 Q-29 -91-31 -88 C-24 -92-20 -99-16 -107 Q-10 -117 0 -118Z M1 -129 C15 -134 32 -123 36 -104 C40 -90 30 -81 35 -69 C39 -56 44 -52 39 -42 Q34 -33 41 -25 C29 -28 23 -38 28 -47 C33 -57 26 -63 25 -72 Q22 -81 26 -88 Q29 -92 32 -89 C24 -94 21 -102 16 -109 Q9 -118 1 -118Z"),
  frontStrands: new Path2D("M-4 -126 C-18 -124-26 -113-31 -100 M-7 -121 C-17 -117-22 -108-24 -100 Q-28 -92-34 -90 M-29 -88 C-25 -80-24 -75-29 -65 C-36 -54-36 -48-31 -41 Q-27 -34-34 -29 M5 -126 C18 -124 27 -115 32 -102 M8 -121 C18 -117 22 -109 25 -101 Q28 -93 35 -91 M30 -88 C27 -79 25 -77 31 -66 C37 -56 38 -50 34 -44 Q31 -35 37 -30"),
  part: new Path2D("M0 -129 Q-1 -124 .5 -118"),
  neck: new Path2D("M-8 -72 L-10 -61 Q0 -56 9 -61 L7 -72Z"),
  hoodie: new Path2D("M-13 -67 Q-20 -65-27 -57 Q-30 -49-31 -30 Q-17 -23 0 -32 Q17 -22 32 -30 L29 -55 Q23 -64 12 -67Z"),
  hood: new Path2D("M-14 -66 Q-10 -74-5 -68 Q1 -63 6 -69 Q12 -72 16 -66 Q11 -57 1 -57 Q-10 -57-14 -66Z"),
  strings: new Path2D("M-4 -59 L-6 -48 M5 -59 L7 -49 M-7 -44 Q0 -43 8 -45"),
  foldedLegs: new Path2D("M-11 -30 Q-21 -42-32 -37 Q-48 -31-39 -18 Q-32 -10-8 -6 L16 -7 Q35 -10 42 -19 Q46 -25 39 -31 Q28 -43 11 -31 Q0 -20-11 -30Z"),
  seams: new Path2D("M-34 -32 Q-25 -33-15 -26 Q-3 -18 20 -14 M29 -31 Q20 -26 10 -20 M-25 -15 Q-14 -13-6 -11"),
  shoes: new Path2D("M-5 -12 Q-16 -18-24 -12 Q-28 -9-23 -5 Q-17 -1-7 -2 L5 -5Z M8 -11 Q17 -16 26 -12 Q32 -9 26 -4 Q13 0 5 -4Z"),
  sleeves: new Path2D("M-25 -56 Q-30 -48-31 -36 Q-31 -32-24 -28 L-13 -23 -8 -29 -21 -39 -18 -51Z M24 -56 Q29 -47 30 -36 Q30 -31 23 -28 L12 -23 8 -29 20 -39 18 -51Z"),
  hands: new Path2D("M-14 -25 Q-9 -31-4 -28 Q0 -26-4 -23 Q-9 -21-14 -22Z M15 -25 Q9 -30 4 -28 Q0 -25 4 -23 Q11 -20 15 -22Z"),
  brows: new Path2D("M-19 -98 Q-14 -101-9 -99 M8 -99 Q13 -101 18 -97"),
  eyesClosed: new Path2D("M-18 -88 Q-13 -85-8 -88 M8 -88 Q13 -85 18 -88"),
  smile: new Path2D("M-3 -79 Q1 -75 5 -79")
};

let width, height, unit, treeBounds, girlX, girlY, girlScale;
let flowers = [];
let blades = [];
let driftingPetals = [];
let elapsed = 0;
let previousFrame;
let frameId;

function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function fitScene() {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  unit = Math.min(width, height);
  const ratio = Math.min(devicePixelRatio || 1, 1.75);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  brush.setTransform(ratio, 0, 0, ratio, 0, 0);
  treeBounds = tree.getBoundingClientRect();
  girlScale = clamp(unit * .00245, .67, 1.46);
  girlX = treeBounds.left + treeBounds.width * .5 - girlScale * 43;
  girlY = treeBounds.bottom + height * .055;

  const photoScale = Math.max(width / 1672, height / 941);
  const photoWidth = 1672 * photoScale;
  const random = seededRandom(1987);
  function hillAt(x) {
    const photoX = (x + (photoWidth - width) / 2) / photoWidth;
    return height - 941 * photoScale * (.382 - (photoX - .58) ** 2 * .34);
  }

  flowers = Array.from({ length: clamp(Math.round(width * .34), 148, 380) }, (_, index) => {
    const x = random() * (width + 32) - 16;
    const depth = random();
    const crest = hillAt(x);
    const y = crest + (height - crest + 17) * depth;
    const variety = index % varieties.length;
    const delay = .14 + random() * 3.05 + Math.abs(x - girlX) / width * .53;
    return {
      x, y, depth, variety, delay,
      stem: (10 + depth * 45 + random() * 24) * clamp(unit / 500, .65, 1.3),
      radius: (2.3 + depth * 6.8 + random() * 2.7) * clamp(unit / 500, .65, 1.32),
      leaning: (random() - .5) * (9 + depth * 23),
      phase: random() * turn
    };
  }).sort((a, b) => a.y - b.y);

  blades = Array.from({ length: clamp(Math.round(width * .24), 85, 265) }, () => {
    const x = random() * width;
    const depth = random() ** .66;
    const hill = hillAt(x);
    return {
      x, y: hill + depth * (height - hill + 10),
      tall: (9 + depth * 27) * random(),
      phase: random() * turn,
      bright: random() > .58
    };
  });

  driftingPetals = Array.from({ length: 55 }, () => ({
    age: random() * 16,
    x: (random() - .5) * .74,
    y: .17 + random() * .46,
    size: .9 + random() * 3.8,
    phase: random() * turn,
    speed: 12 + random() * 21,
    color: random() > .5 ? "#fff1ee" : "#ffb5cb"
  }));
  cancelAnimationFrame(frameId);
  previousFrame = undefined;
  frameId = requestAnimationFrame(render);
}

function ease(value) {
  const n = clamp(value);
  return n * n * (3 - 2 * n);
}

function oval(x, y, rx, ry, color) {
  brush.fillStyle = color;
  brush.beginPath();
  brush.ellipse(x, y, rx, ry, 0, 0, turn);
  brush.fill();
}

function drawGrass(time) {
  for (const blade of blades) {
    const sway = Math.sin(time * 1.6 + blade.phase) * blade.tall * .58;
    brush.fillStyle = blade.bright ? "#d5df6877" : "#337c3d77";
    brush.beginPath();
    brush.moveTo(blade.x, blade.y);
    brush.quadraticCurveTo(blade.x + sway * .25, blade.y - blade.tall * .68, blade.x + sway, blade.y - blade.tall);
    brush.quadraticCurveTo(blade.x + sway * .72 + 2.1, blade.y - blade.tall * .56, blade.x + 1.8, blade.y);
    brush.fill();
  }
}

function drawBloom(flower, x, y, progress, time) {
  const colors = varieties[flower.variety];
  const r = flower.radius * progress;
  if (r <= .05) return;
  brush.save();
  brush.translate(x, y);
  brush.scale(r, r);
  brush.rotate(Math.sin(time * 1.46 + flower.phase) * .17);
  if (flower.variety === 5) {
    brush.fillStyle = colors.shade;
    brush.fill(plantShapes.tulip);
    brush.fillStyle = colors.bright;
    brush.fill(plantShapes.fold);
  } else if (flower.variety === 6) {
    for (let i = 0; i < 7; i++) {
      const side = i % 2 ? -.23 : .25;
      oval(side * (1 - i * .08), .34 - i * .22, .39 - i * .031, .22 - i * .012, i % 2 ? colors.shade : colors.bright);
    }
    oval(0, -1.16, .14, .18, colors.center);
  } else {
    const angle = turn / colors.petals;
    for (let petal = 0; petal < colors.petals; petal++) {
      brush.fillStyle = petal % 2 ? colors.shade : colors.bright;
      brush.fill(plantShapes.petal);
      brush.rotate(angle);
    }
    oval(0, 0, .29, .26, colors.center);
    oval(-.1, -.085, .082, .071, "#fff6c7b0");
  }
  brush.restore();
}

function drawFlower(flower, growthTime, windTime) {
  const age = (growthTime - flower.delay) / (1.7 + flower.depth * .5);
  const growth = ease(age / .72);
  if (growth <= 0) return;
  const { x, y, leaning, phase } = flower;
  const lift = flower.stem * growth;
  const sway = (Math.sin(windTime * 1.58 + x * .012 + phase) * (4 + flower.depth * 8) + leaning) * growth;
  const tipX = x + sway;
  const tipY = y - lift;

  brush.beginPath();
  brush.moveTo(x, y);
  brush.quadraticCurveTo(x + sway * .23, y - lift * .56, tipX, tipY);
  brush.strokeStyle = flower.depth > .65 ? "#367147" : "#468c49";
  brush.lineWidth = .8 + flower.depth * 1.5;
  brush.lineCap = "round";
  brush.stroke();

  const leafSize = lift * .29;
  for (const side of [-1, 1]) {
    brush.save();
    brush.translate(x + sway * .28, y - lift * (side === 1 ? .42 : .6));
    brush.scale(leafSize * side, leafSize * .83);
    brush.fillStyle = side === 1 ? "#78ab56" : "#40934d";
    brush.fill(plantShapes.leaf);
    brush.restore();
  }
  drawBloom(flower, tipX, tipY, ease((age - .46) / .56), windTime);
}

function fillDress(shape, color) {
  brush.fillStyle = color;
  brush.fill(dress[shape]);
}

function strokeDress(shape, color, lineWidth) {
  brush.strokeStyle = color;
  brush.lineWidth = lineWidth;
  brush.stroke(dress[shape]);
}

function drawGirl(time, still) {
  brush.save();
  brush.translate(girlX, girlY);
  brush.scale(girlScale, girlScale);
  const shade = brush.createRadialGradient(0, 0, 3, 0, 0, 46);
  shade.addColorStop(0, "#263d249c");
  shade.addColorStop(1, "#2f5c2200");
  brush.save();
  brush.scale(1, .245);
  brush.fillStyle = shade;
  brush.fillRect(-47, -47, 94, 94);
  brush.restore();

  brush.translate(0, Math.sin(time * 2.15) * .65);
  brush.lineCap = "round";
  brush.lineJoin = "round";
  fillDress("hair", "#211c26");
  strokeDress("strands", "#493944", 1.4);
  fillDress("neck", "#d99176");
  const fabric = brush.createLinearGradient(-29, -58, 30, -21);
  fabric.addColorStop(0, "#e45956");
  fabric.addColorStop(.53, "#ba3544");
  fabric.addColorStop(1, "#a32f47");
  fillDress("hoodie", fabric);
  fillDress("hood", "#a63342");
  strokeDress("strings", "#f39384", 1.1);
  fillDress("foldedLegs", "#426687");
  strokeDress("foldedLegs", "#294960", 1.2);
  strokeDress("seams", "#7496aa", 1.35);
  fillDress("shoes", "#282737");
  strokeDress("shoes", "#e9dcca", .94);
  fillDress("sleeves", fabric);
  fillDress("hands", "#e9aa88");

  brush.save();
  brush.translate(0, -72);
  brush.rotate(still ? 0 : Math.sin(time * .84) * .045);
  brush.translate(0, 72);
  oval(-27, -88, 5, 6, "#de927b");
  oval(26, -88, 5, 6, "#e6a285");
  const skin = brush.createLinearGradient(-26, -101, 25, -76);
  skin.addColorStop(0, "#f6c7a0");
  skin.addColorStop(1, "#e9a88e");
  fillDress("head", skin);
  const hair = brush.createLinearGradient(-36, -115, 30, -46);
  hair.addColorStop(0, "#3c3039");
  hair.addColorStop(.48, "#211b25");
  hair.addColorStop(1, "#30262f");
  fillDress("frontHair", hair);
  strokeDress("frontStrands", "#59454f", 1.35);
  strokeDress("part", "#a2746b", .85);
  strokeDress("brows", "#492d37", 1.4);
  const blink = !still && (time + .41) % 5.15 < .135;
  if (blink) {
    strokeDress("eyesClosed", "#55343d", 1.5);
  } else {
    for (const x of [-13, 13]) {
      oval(x, -89, 6.15, 6.5, "#fff6e7");
      oval(x + .6, -89, 4.15, 5.35, "#402c39");
      oval(x - .48, -91.1, 1.45, 1.53, "#fffbef");
    }
  }
  oval(-19, -81.5, 4.5, 2.15, "#ed8e831a");
  oval(18, -81.4, 4.8, 2.15, "#ea887e80");
  strokeDress("smile", "#aa5357", 1.35);
  brush.restore();
  brush.restore();
}

function drawPetals(time) {
  for (const petal of driftingPetals) {
    const t = (time + petal.age) % 16;
    const x = treeBounds.left + treeBounds.width * (.5 + petal.x) + t * petal.speed + Math.sin(t * 1.42 + petal.phase) * 23;
    const y = treeBounds.top + treeBounds.height * petal.y + t * (11 + petal.size * 2.2) + Math.sin(t * 2 + petal.phase) * 7;
    if (x < -12 || x > width + 12 || y < -12 || y > height + 12) continue;
    brush.save();
    brush.translate(x, y);
    brush.rotate(t * .84 + petal.phase);
    const r = petal.size * clamp(unit / 460, .75, 1.45);
    brush.scale(r, r * (.48 + Math.abs(Math.sin(t * 2.23 + petal.phase)) * .5));
    brush.globalAlpha = Math.min(t, 1, (16 - t) * .7) * .84;
    brush.fillStyle = petal.color;
    brush.fill(plantShapes.falling);
    brush.restore();
  }
}

function render(now) {
  const still = motion.matches;
  if (previousFrame !== undefined) elapsed += Math.min(.05, (now - previousFrame) / 1000);
  previousFrame = now;
  const wind = still ? 0 : elapsed;
  const growth = still ? 8 : elapsed;
  brush.clearRect(0, 0, width, height);
  drawGrass(wind);
  let seated = false;
  for (const flower of flowers) {
    if (!seated && flower.y > girlY + 2) {
      drawGirl(wind, still);
      seated = true;
    }
    drawFlower(flower, growth, wind);
  }
  if (!seated) drawGirl(wind, still);
  drawPetals(wind);
  if (!still) frameId = requestAnimationFrame(render);
}

function syncMusic() {
  const playing = !music.paused;
  sound.setAttribute("aria-pressed", String(playing));
  soundLabel.textContent = playing ? "Pausar música" : "Activar música";
}

function playMusic() {
  music.play().catch(syncMusic);
}

function startOnInteraction(event) {
  if (!sound.contains(event.target) && music.paused) playMusic();
}

document.addEventListener("click", startOnInteraction, true);
music.addEventListener("play", () => {
  document.removeEventListener("click", startOnInteraction, true);
  syncMusic();
});
music.addEventListener("pause", syncMusic);
sound.addEventListener("click", () => {
  if (music.paused) playMusic();
  else music.pause();
});

window.addEventListener("resize", fitScene);
motion.addEventListener("change", fitScene);
fitScene();
syncMusic();
playMusic();
