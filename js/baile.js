const canvas = document.querySelector("#dance-floor");
const ink = canvas.getContext("2d");
const track = document.querySelector("#dance-music");
const sound = document.querySelector("#dance-sound");
const soundLabel = document.querySelector("#dance-sound-label");
const dial = document.querySelector("#next-dedication");
const display = document.querySelector("#dance-message");
const replay = document.querySelector("#replay-dance");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const turn = Math.PI * 2;
const tempo = 114;
const secondsPerMessage = 8;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const messages = [
  "Hay algo muy tuyo en la forma de iluminar un lugar.",
  "Eres preciosa, incluso cuando no te das cuenta.",
  "Admiro tu inteligencia y tu forma de ver el mundo.",
  "Tu risa es de mis cosas favoritas.",
  "Mereces que te quieran bonito, todos los días.",
  "Me encanta que encuentres historias en las cosas pequeñas.",
  "Ojalá este año te devuelva toda la luz que das.",
  "Qué suerte poder celebrar otro año contigo.",
  "Que tengas mil razones para sonreír.",
  "Lo bonito de estar contigo es que hasta lo simple se vuelve especial.",
  "Que nunca te falten libros, música ni ganas de soñar.",
  "Sigue bailando a tu manera, Isa."
];

const neon = ["#ff68a9", "#9a83ff", "#6be6f1", "#ffbb76", "#ffe3ab"];
const beams = [
  [.085, .075, .32, "#fe67b2", .19],
  [.20, .065, .67, "#66e9ff", 1.7],
  [.80, .065, .37, "#b194ff", 2.8],
  [.915, .075, .65, "#ff8eae", 4.1]
];

let seed = 407;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}

const confetti = Array.from({ length: 115 }, (_, index) => ({
  offset: random() * 12, x: random(), speed: .052 + random() * .108,
  drift: (random() - .5) * .18, size: 1.7 + random() * 4.7, spin: random() * turn,
  color: neon[index % neon.length], ribbon: index % 8 === 0
}));
const reflections = Array.from({ length: 44 }, (_, index) => ({
  x: random(), y: random(), phase: random() * turn, radius: .9 + random() * 2.3,
  color: neon[index % neon.length]
}));

let width, height, portrait, ballSize;
let previous;
let frame;
let clock = 0;
let started = false;
let finished = false;
let finishClock = 0;
let manualOffset = 0;
let lastMessage = 0;
let screenFlicker;

function path(points) {
  ink.beginPath();
  ink.moveTo(points[0][0], points[0][1]);
  for (const [x, y] of points.slice(1)) ink.lineTo(x, y);
  ink.closePath();
}

function glow(x, y, radius, color, opacity) {
  const light = ink.createRadialGradient(x, y, 0, x, y, radius);
  light.addColorStop(0, color);
  light.addColorStop(.36, color + "72");
  light.addColorStop(1, color + "00");
  ink.globalAlpha = opacity;
  ink.fillStyle = light;
  ink.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ink.globalAlpha = 1;
}

function glint(x, y, radius, color) {
  ink.fillStyle = color;
  path([[x, y - radius], [x + radius * .2, y - radius * .2], [x + radius * .8, y], [x + radius * .2, y + radius * .2],
    [x, y + radius], [x - radius * .2, y + radius * .2], [x - radius * .8, y], [x - radius * .2, y - radius * .2]]);
  ink.fill();
}

function lighting(time, beat) {
  ink.save();
  ink.globalCompositeOperation = "screen";
  for (const [left, top, aim, color, phase] of beams) {
    const x = width * left;
    const y = height * top;
    const targetX = width * (aim + Math.sin(time * .55 + phase) * .2);
    const targetY = height * (.80 + Math.cos(time * .43 + phase) * .075);
    const spread = width * (.056 + Math.sin(time * .54 + phase) * .019);
    const beam = ink.createLinearGradient(x, y, targetX, targetY);
    beam.addColorStop(0, color + "73");
    beam.addColorStop(.4, color + "36");
    beam.addColorStop(.85, color + "10");
    beam.addColorStop(1, color + "00");
    ink.fillStyle = beam;
    path([[x - 5, y], [x + 5, y], [targetX + spread, targetY], [targetX - spread, targetY]]);
    ink.fill();
    glow(x, y, Math.max(13, Math.min(width, height) * .042), color, .37 + Math.cos(beat * Math.PI * .5 + phase) * .12);
  }
  for (const dot of reflections) {
    const pulse = Math.sin(time * 1.48 + dot.phase) * .38 + .38;
    if (pulse < .2) continue;
    const x = width * (dot.x + Math.sin(time * .32 + dot.phase) * .079);
    const y = height * (.13 + dot.y * .62 + Math.cos(time * .42 + dot.phase) * .027);
    ink.globalAlpha = pulse * .69;
    if (dot.radius > 2.6) glint(x, y, dot.radius * 2.4, dot.color);
    else {
      ink.fillStyle = dot.color;
      ink.fillRect(x, y, dot.radius, dot.radius);
    }
  }
  ink.restore();
}

function floorLights(beat) {
  const start = height * .64;
  const distance = height - start;
  const pulse = Math.sin(beat * Math.PI) * .5 + .5;
  const rowY = row => start + distance * (row / 8) ** 1.53;
  const edgeX = (column, row) => width * (.5 + column * (.058 + row * .0125));
  ink.save();
  ink.globalCompositeOperation = "screen";
  for (let row = 0; row < 8; row++) {
    for (let column = -7; column < 7; column++) {
      const choice = Math.abs(row * 9 - column * 5);
      if ((choice + Math.floor(beat / 2)) % 4 > 1) continue;
      const color = neon[choice % neon.length];
      ink.globalAlpha = .09 + .13 * pulse + row * .008;
      ink.fillStyle = color;
      path([[edgeX(column, row), rowY(row)], [edgeX(column + 1, row), rowY(row)],
        [edgeX(column + 1, row + 1) - 2, rowY(row + 1) - 2], [edgeX(column, row + 1) + 2, rowY(row + 1) - 2]]);
      ink.fill();
    }
  }
  ink.restore();
}

function mirrorBall(time) {
  const x = width * .5;
  const y = Math.min(height * .106, 89);
  const r = ballSize;
  const silver = ink.createRadialGradient(x - r * .35, y - r * .4, r * .06, x, y, r);
  silver.addColorStop(0, "#fff1f5");
  silver.addColorStop(.46, "#aabbde");
  silver.addColorStop(1, "#4e3b6e");
  glow(x, y, r * 2.9, "#e4a6eb", .26);
  ink.fillStyle = "#a979aa";
  ink.fillRect(x - .85, 0, 1.7, y - r);
  ink.save();
  ink.beginPath();
  ink.arc(x, y, r, 0, turn);
  ink.clip();
  ink.fillStyle = silver;
  ink.fillRect(x - r, y - r, r * 2, r * 2);
  const tile = Math.max(3.5, r * .23);
  const spin = time * 12 % tile;
  for (let row = -5; row < 5; row++) {
    for (let col = -6; col < 5; col++) {
      const light = (Math.sin(col * 22 + row * 17 + time * 2.8) + 1) / 2;
      ink.globalAlpha = .32 + light * .48;
      ink.fillStyle = light > .73 ? "#fff2ed" : light > .42 ? "#ad9ccf" : "#746f9a";
      ink.fillRect(x + col * tile + spin, y + row * tile, tile - .9, tile - .9);
    }
  }
  ink.restore();
  glint(x - r * .6, y - r * .43, r * .3, "#fff5f7");
  glint(x + r * .73, y + r * .17, r * (.13 + Math.abs(Math.sin(time)) * .16), "#fbe6ff");
}

function celebrations(time, finale) {
  const count = finale ? confetti.length : Math.floor(confetti.length * .61);
  const speedUp = finale ? 1.45 : 1;
  for (let i = 0; i < count; i++) {
    const bit = confetti[i];
    const span = (bit.offset + time * speedUp) % 12;
    const rise = span * bit.speed;
    if (rise > 1.12) continue;
    const x = width * (bit.x + Math.sin(span * .8 + bit.spin) * .043 + rise * bit.drift);
    const y = height * (rise - .1);
    const scale = clamp(width / 650, .69, 1.23);
    const size = bit.size * scale;
    ink.save();
    ink.translate(x, y);
    ink.rotate(bit.spin + span * (bit.ribbon ? .58 : 1.15));
    ink.globalAlpha = .42 + Math.sin(span + bit.spin) * .2 + (finale ? .19 : 0);
    if (bit.ribbon) {
      ink.strokeStyle = bit.color;
      ink.lineWidth = Math.max(.9, size * .3);
      ink.lineCap = "round";
      ink.beginPath();
      ink.moveTo(0, -size * 2.4);
      ink.bezierCurveTo(size * 1.75, -size * 1.5, -size * 1.8, -size * .11, 0, size * .2);
      ink.bezierCurveTo(size * 1.45, size * .59, -size * .97, size * 1.5, size * .38, size * 2.14);
      ink.stroke();
    } else {
      ink.fillStyle = bit.color;
      ink.fillRect(-size, -.55, size * 1.5, Math.max(1, size * .41));
    }
    ink.restore();
  }
}

function dance(beat) {
  const dancerScale = clamp(Math.min(height * .31, width * (portrait ? .35 : .27)) / 153, .36, 1.84);
  const guestScale = dancerScale * (portrait ? .47 : .61);
  const guestFloor = height * (portrait ? .73 : .755);
  danceCrew.guest(ink, width * .101, guestFloor, guestScale, "mint", beat, 1.3);
  danceCrew.guest(ink, width * .226, guestFloor - height * .023, guestScale * .86, "lilac", beat, 3.6);
  danceCrew.guest(ink, width * .927, guestFloor - height * .013, guestScale, "blue", beat, 5.15);
  danceCrew.michael(ink, width * (portrait ? .81 : .808), height * (portrait ? .762 : .844), dancerScale * (portrait ? .82 : 1),
    beat, width * (portrait ? .082 : .096), finished);
  danceCrew.couple(ink, width * (portrait ? .435 : .43), height * (portrait ? .909 : .895), dancerScale, beat, finished);
}

function displayText(text, animate = true) {
  display.textContent = text;
  screenFlicker?.cancel();
  if (animate && !reduced.matches) {
    screenFlicker = display.animate([
      { opacity: .37, transform: "translateY(3px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], { duration: 290, easing: "ease-out" });
  }
}

function sceneTime() {
  return started ? track.currentTime : clock;
}

function syncMessage() {
  if (finished) return;
  const index = (Math.floor(sceneTime() / secondsPerMessage) + manualOffset) % messages.length;
  if (index === lastMessage) return;
  lastMessage = index;
  displayText(messages[index]);
}

function render(now) {
  if (previous !== undefined) clock += Math.min(.06, (now - previous) / 1000);
  previous = now;
  const calm = reduced.matches;
  const seconds = sceneTime();
  const beat = calm ? 3 : seconds * (tempo / 60);
  const atmosphere = calm ? .77 : clock;
  ink.clearRect(0, 0, width, height);
  floorLights(beat);
  lighting(atmosphere, beat);
  mirrorBall(atmosphere);
  dance(beat);
  celebrations(finished && !calm ? clock - finishClock + 1 : atmosphere, finished);
  syncMessage();
  if (!calm) frame = requestAnimationFrame(render);
}

function fit() {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  portrait = height > width * 1.16;
  ballSize = clamp(Math.min(width, height) * .043, 10, 34);
  const ratio = Math.min(devicePixelRatio || 1, 1.75);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ink.setTransform(ratio, 0, 0, ratio, 0, 0);
  cancelAnimationFrame(frame);
  previous = undefined;
  frame = requestAnimationFrame(render);
}

function syncSound() {
  const playing = !track.paused && !track.ended;
  sound.setAttribute("aria-pressed", String(playing));
  soundLabel.textContent = playing ? "Pausar música" : "Activar música";
}

function playMusic() {
  track.play().catch(syncSound);
}

function playAgain() {
  finished = false;
  track.currentTime = 0;
  replay.hidden = true;
  dial.disabled = false;
  lastMessage = 0;
  manualOffset = 0;
  displayText(messages[0]);
  playMusic();
  if (reduced.matches) fit();
}

function startOnInteraction(event) {
  if (!started && track.paused && !sound.contains(event.target)) playMusic();
}

document.addEventListener("click", startOnInteraction, true);
track.addEventListener("play", () => {
  started = true;
  document.removeEventListener("click", startOnInteraction, true);
  syncSound();
});
track.addEventListener("pause", syncSound);
track.addEventListener("timeupdate", syncMessage);
track.addEventListener("ended", () => {
  finished = true;
  finishClock = clock;
  dial.disabled = true;
  replay.hidden = false;
  displayText("Gracias por compartir este baile conmigo. Feliz cumpleaños, Isa.");
  syncSound();
  if (reduced.matches) fit();
});

sound.addEventListener("click", () => {
  if (finished) playAgain();
  else if (track.paused) playMusic();
  else track.pause();
});
dial.addEventListener("click", () => {
  manualOffset = (manualOffset + 1) % messages.length;
  syncMessage();
});
replay.addEventListener("click", () => {
  playAgain();
  sound.focus({ preventScroll: true });
});

window.addEventListener("resize", fit);
reduced.addEventListener("change", fit);
fit();
syncSound();
playMusic();
