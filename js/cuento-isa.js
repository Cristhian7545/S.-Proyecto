// Se conserva la letra bilingüe que se entregó para esta prueba.
// Marcas de referencia de la edición del video oficial, con el comienzo ajustado al Upscaled.
const lyrics = [
  [18.65, "Chica, cierra los ojos", "Girl, close your eyes"],
  [22.07, "Deja que ese ritmo entre en ti", "Let that rhythm get into you"],
  [26.68, "No trates de resistirlo", "Don't try to fight it"],
  [29.68, "No hay nada que puedas hacer", "There ain't nothin' that you can do"],
  [35.01, "Relaja tu mente", "Relax your mind"],
  [39.31, "Recuéstate y fluye con la mía", "Lay back and groove with mine"],
  [42.76, "Tienes que sentir ese calor", "You gotta feel that heat"],
  [45.43, "Y podemos dejarnos llevar por el ritmo", "And we can ride the boogie"],
  [47.33, "Compartir ese beat de amor", "Share that beat of love"],
  [50.69, "Quiero bailar contigo (toda la noche)", "I wanna rock with you (all night)"],
  [54.88, "Bailar contigo hasta el amanecer (la luz del Sol)", "Dance you into day (sunlight)"],
  [59.40, "Quiero bailar contigo (toda la noche)", "I wanna rock with you (all night)"],
  [64.06, "Vamos a bailar toda la noche", "We're gonna rock the night away (rock, right)"],
  [68.43, "Allí en la pista", "Out on the floor"],
  [71.40, "No hay nadie más que nosotros", "There ain't nobody there but us"],
  [76.69, "Chica, cuando bailas", "Girl, when you dance"],
  [80.10, "Hay una magia que debe ser amor", "There's a magic that must be love"],
  [85.77, "Solo tómalo con calma", "Just take it slow"],
  [89.15, "Porque tenemos mucho por recorrer", "'Cause we got so far to go"],
  [93.04, "Cuando sientas ese calor", "When you feel that heat"],
  [95.53, "Y vamos a dejarnos llevar por el ritmo", "And we gonna ride the boogie"],
  [98.09, "(Compartir ese beat) compartir ese beat de amor", "(Share that beat) share that beat of love"],
  [101.13, "Quiero bailar contigo (toda la noche)", "I wanna rock with you (all night)"],
  [106.09, "Bailar contigo hasta el amanecer (la luz del Sol)", "Dance you into day (sunlight)"],
  [109.87, "Quiero bailar contigo (toda la noche)", "I wanna rock with you (all night)"],
  [113.54, "Vamos a bailar toda la noche", "We gon' rock the night away"],
  [118.87, "Y cuando ya no suene la música (sí)", "And when the groove is dead and gone (yeah)"],
  [126.82, "Sabes que el amor sobrevive", "You know that love survives"],
  [130.56, "Así que podemos bailar por siempre", "So we can rock forever on"],
  [136.9],
  [148.20, "Quiero bailar contigo", "I wanna rock with you"],
  [150.54, "Quiero pasarla bien contigo", "I wanna groove with you"],
  [152.54, "Quiero bailar contigo", "I wanna rock with you"],
  [155.2],
  [159.60, "Quiero pasarla bien contigo", "I wanna groove with you"],
  [164.54, "Quiero bailar (toda la noche)", "Wanna rock (all night)"],
  [169.02, "Contigo, chica (la luz del Sol)", "With you, girl (sunlight)"],
  [173.64, "Bailar contigo, bailar contigo, chica, sí (toda la noche)", "Rock with you, rock with you, girl, yeah (all night)"],
  [177.22, "Bailar toda la noche", "Dance the night away"],
  [185.96, "Quiero bailar contigo, sí (toda la noche)", "I wanna rock with you, yeah (all night)"],
  [189.22, "Bailarte hasta el amanecer (la luz del Sol)", "Rock you into day (sunlight)"],
  [190.28, "Quiero bailar contigo (toda la noche)", "I wanna rock with you (all night)"],
  [191.61, "Bailar toda la noche (bailar, sí)", "Rock the night away (rock, right)"],
  [192.92, "Siente el calor, siente el beat (toda la noche)", "Feel the heat, feel the beat (all night)"],
  [195.27, "Rockearte hasta el amanecer (la luz del Sol)", "Rock you into day (sunlight)"],
  [197.24, "Quiero bailar (toda la noche)", "I wanna rock (all night)"],
  [199.31, "Bailar toda la noche", "Rock the night away"]
];

const scenes = [
  { at: 0, shape: "estrella", side: "center", label: "Inicio", title: "El día que llegaste, Isa", text: "Entre todos los días que tiene un año, hay uno en el que me gusta detenerme. Ese día llegaste tú." },
  { at: 5.2, shape: "retrato" },
  { at: 12.4, shape: "flores" },
  { at: 18.65, shape: "libro", side: "left", label: "Isa y sus libros", title: "Había una vez una chica llamada Isa…", text: "Abres un libro y de pronto una tarde alcanza para vivir otra vida. Me gusta imaginar qué frase subrayarías, cuál te haría sonreír y en cuál te quedarías un rato más." },
  { at: 36.1, shape: "estudio", side: "right", label: "Sus sueños", title: "Un cuaderno lleno de futuros", text: "Entre tus lentes y los apuntes hay preguntas que sigues hasta el final. Admiro tu inteligencia y el cuidado que pones incluso en lo que apenas estás aprendiendo." },
  { at: 52.8, shape: "postre", side: "left", label: "El postre", title: "Una tarde que sabe a fresa", text: "Hay tardes que se quedan en la memoria por el olor de un pastel recién hecho. O por esa sonrisa tuya cuando dices «prueba» y acercas el plato.", accent: "fresa" },
  { at: 68.42, shape: "laptop", side: "right", label: "Una partida más", title: "Una partida más", text: "Te imagino frente a la laptop, tan concentrada que se te olvida la hora. Y justo cuando creías que tocaba cerrar todo, aparece esa sonrisa de «una más»." },
  { at: 82.5, shape: "carrera", side: "left", label: "A su propio ritmo", title: "El derecho a ir despacio", text: "Algunos días pesan desde que sales del trabajo. Ojalá al llegar a casa encuentres un rato para ti. Me gusta esa fuerza tuya que sabe cuándo seguir y cuándo tomar aire." },
  { at: 96.2, shape: "baila", side: "left", label: "Isa bailando", title: "Que la alegría te encuentre bailando", text: "Hay canciones que te sorprenden moviendo un pie antes de que lo notes. Que te pase seguido, Isa. En tu cuarto, en la cocina o donde la música te alcance.", accent: "bailando" },
  { at: 109.87, shape: "blacky", side: "right", label: "Isa y Blacky", title: "Y entonces llega Blacky", text: "Con su pelito blanco y su pelota, Blacky solo quiere que juegues con él. Qué bonito que, después de un día de tantas cosas, alguien se alegre así de verte llegar." },
  { at: 124, shape: "carino", side: "left", label: "Un poquito de cariño", title: "Lo que más brilla en ti", text: "Eres bella, Isa. También me gusta esa ternura tuya que se asoma en los gestos pequeños, en cómo cuidas a los tuyos y en lo fácil que se siente conversar contigo.", accent: "brilla" },
  { at: 136.9, shape: "retrato", label: "Interludio de luces" },
  { at: 142.7, shape: "regalo" },
  { at: 148.2, shape: "musica", side: "right", label: "Su canción", title: "Que el mundo espere un ratito", text: "Ponte los audífonos y busca la canción que siempre terminas repitiendo. Me gusta imaginar tu risa cuando llega esa parte que ya te sabes de memoria." },
  { at: 155.2, shape: "estrellas" },
  { at: 159.6, shape: "cama", side: "left", label: "Al final del día", title: "Cuando el día se queda en silencio", text: "Ya acostada, la luz del celular te dibuja una sonrisa. Ojalá guardes muchas noches así, con algo bonito que leer antes de dejar el teléfono a un lado." },
  { at: 173.64, shape: "flores", side: "right", title: "Que florezca lo que sueñas", text: "Que tengas libros que te atrapen, postres para compartir y tardes para jugar con Blacky. Que encuentres tiempo para cada una de las cosas que te hacen feliz." },
  { at: 185.96, shape: "carino", side: "left", title: "Te mereces todo lo bonito", text: "Me alegra que exista alguien como tú. Si este cuento se parece un poquito a ti, que sea por su calma, por su alegría y por todo el cariño que cabe en él." },
  { at: 194.7, shape: "pareja", side: "center", label: "Dedicatoria final", title: "Feliz cumpleaños, Isa", text: "Si pudiera guardar un instante de este cuento, sería este. Tú y yo, sentados juntos, escuchando la misma canción." }
];

const stage = document.querySelector("#scene");
const canvas = document.querySelector("#lights");
const ink = canvas.getContext("2d");
const song = document.querySelector("#song");
const play = document.querySelector("#play");
const seek = document.querySelector("#seek");
const timeLabel = document.querySelector("#time");
const chapters = document.querySelector("#chapter");
const story = document.querySelector("#story");
const heading = document.querySelector("#heading");
const narrative = document.querySelector("#narrative");
const subtitles = document.querySelector("#subtitles");
const es = document.querySelector("#es");
const en = document.querySelector("#en");
const error = document.querySelector("#audio-error");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const palette = ["#9c80d0", "#c8a5f2", "#ed8fa9", "#ffb191", "#ffd6aa", "#fff1d7", "#f56b83", "#9cdfff"];
const turn = Math.PI * 2;
const pointCount = 3700;
const formationSeconds = .68;
const revealSeconds = .24;
const clamp = value => Math.min(1, Math.max(0, value));
const mix = (from, to, t) => from + (to - from) * t;
const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

let seed = 864;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}

function ordering(x, y) {
  let result = 0;
  for (let i = 0; i < 8; i++) result |= ((x >> i) & 1) << (i * 2) | ((y >> i) & 1) << (i * 2 + 1);
  return result;
}

function arrange(points) {
  for (const point of points) point.order = ordering(point.x, point.y);
  points.sort((a, b) => a.order - b.order);
  const density = Math.min(1, points.length / pointCount);
  return Array.from({ length: pointCount }, (_, i) => {
    const point = points[Math.floor(i * points.length / pointCount)];
    const jitter = density < 1 ? (random() - .5) * .016 : 0;
    return { x: point.x / 255 - .5 + jitter, y: point.y / 255 - .5 - jitter,
      color: point.color, alpha: point.alpha * Math.max(.64, density) };
  });
}

function decode(source) {
  const bytes = atob(source);
  const points = [];
  for (let i = 0; i < bytes.length; i += 4) {
    points.push({ x: bytes.charCodeAt(i), y: bytes.charCodeAt(i + 1), color: bytes.charCodeAt(i + 2), alpha: bytes.charCodeAt(i + 3) / 255 });
  }
  return arrange(points);
}

function glow(color) {
  const stamp = document.createElement("canvas");
  stamp.width = stamp.height = 32;
  const brush = stamp.getContext("2d");
  const ramp = brush.createRadialGradient(16, 16, 0, 16, 16, 16);
  ramp.addColorStop(0, "#fff5e9");
  ramp.addColorStop(.22, color);
  ramp.addColorStop(.52, color + "63");
  ramp.addColorStop(1, color + "00");
  brush.fillStyle = ramp;
  brush.fillRect(0, 0, 32, 32);
  return stamp;
}

const pictures = Object.fromEntries(Object.entries(cuentoPuntos).map(([name, source]) => [name, decode(source)]));
const flares = palette.map(glow);
const drift = Array.from({ length: pointCount }, () => ({ angle: random() * turn, sway: random(), phase: random() * turn }));
const sky = Array.from({ length: 86 }, () => ({ x: random(), y: random(), r: .65 + random(), phase: random() * turn }));

const ornaments = ["regalo", "estrella", "flores", "estrellas"];
const wideShapes = new Set(["laptop", "baila", "carino", "cama", "pareja", ...ornaments]);
const portraitOutline = new Path2D("M0 675 Q76 618 201 572 L222 546 Q200 519 222 474 Q229 434 245 392 Q236 343 256 312 Q244 270 278 234 Q270 201 308 164 Q331 92 404 65 Q481 27 547 42 Q649 52 697 128 Q738 176 727 220 Q758 264 727 302 Q749 341 713 374 Q708 404 682 418 Q671 447 673 478 Q684 500 668 531 Q693 548 695 577 Q759 601 800 640 L800 924 H0 Z");
const artwork = new Map();
const rain = Array.from({ length: 38 }, (_, i) => ({
  x: random(), y: random(), size: 3.5 + random() * 7.7, speed: .027 + random() * .042, phase: random() * turn, type: i % 3
}));
const rainStamps = [
  new Path2D("M20 29 C15 25 8 20 8 14 C8 8 15 7 20 13 C25 7 32 8 32 14 C32 20 25 26 20 29Z"),
  new Path2D("M20 5 Q21 19 35 20 Q21 21 20 35 Q19 21 5 20 Q19 19 20 5Z"),
  new Path2D("M20 15 C12 3 26 2 24 15 C37 9 37 24 26 23 C33 34 18 37 19 26 C11 35 4 23 15 21 C5 16 14 7 20 15Z")
].map((shape, index) => {
  const sheet = document.createElement("canvas");
  sheet.width = sheet.height = 40;
  const brush = sheet.getContext("2d");
  brush.drawImage(flares[[2, 4, 1][index]], 0, 0, 40, 40);
  brush.fillStyle = ["#ffabc8", "#ffe4b2", "#efb6f3"][index];
  brush.fill(shape);
  return sheet;
});

let width = 0, height = 0, compact = false, frame = 0, sceneIndex = -1, lyricIndex = -2, settledScene = -1, textAnimation, accentedWord;
let preview = null;
let visibleArt = 0;

async function loadArtwork(url, columns, rows, names) {
  const source = new Image();
  source.src = url;
  await source.decode();
  const w = Math.floor(source.naturalWidth / columns);
  const h = Math.floor(source.naturalHeight / rows);
  names.forEach((name, index) => {
    const still = document.createElement("canvas");
    still.width = w;
    still.height = h;
    const brush = still.getContext("2d");
    brush.save();
    if (name === "retrato") brush.clip(portraitOutline);
    brush.drawImage(source, index % columns * w, Math.floor(index / columns) * h, w, h, 0, 0, w, h);
    brush.restore();
    brush.globalCompositeOperation = "destination-in";
    for (const [x, y] of [[w, 0], [0, h]]) {
      const fade = brush.createLinearGradient(0, 0, x, y);
      fade.addColorStop(0, "#fff0");
      fade.addColorStop(.035, "#fff");
      fade.addColorStop(name === "retrato" && y ? .82 : .965, "#fff");
      fade.addColorStop(1, "#fff0");
      brush.fillStyle = fade;
      brush.fillRect(0, 0, w, h);
    }
    artwork.set(name, still);
  });
}

for (const { at, label } of scenes) if (label) chapters.add(new Option(label, String(at)));

function locate(list, time, at) {
  let lo = 0, hi = list.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (at(list[mid]) <= time) lo = mid + 1;
    else hi = mid;
  }
  return lo - 1;
}

function updateStory(index) {
  if (index === sceneIndex) return;
  sceneIndex = index;
  const item = scenes[index];
  stage.dataset.side = item.side || "center";
  story.hidden = !item.title;
  accentedWord = null;
  if (item.title) {
    heading.textContent = item.title;
    const accentAt = item.accent ? item.title.indexOf(item.accent) : -1;
    if (accentAt >= 0) {
      accentedWord = document.createElement("span");
      accentedWord.className = "rhythm";
      accentedWord.textContent = item.accent;
      heading.replaceChildren(item.title.slice(0, accentAt), accentedWord, item.title.slice(accentAt + item.accent.length));
    }
    narrative.textContent = item.text;
    textAnimation?.cancel();
    if (!motion.matches) textAnimation = story.animate([{ opacity: .2 }, { opacity: 1 }], { duration: 550, easing: "ease-out" });
  }
  let chapter = index;
  while (chapter > 0 && !scenes[chapter].label) chapter--;
  chapters.value = String(scenes[chapter].at);
}

function updateLyrics(time) {
  const index = song.ended ? lyrics.length : locate(lyrics, time, row => row[0]);
  if (index === lyricIndex) return;
  lyricIndex = index;
  const [, spanish = "", english = ""] = lyrics[index] || [];
  es.textContent = spanish;
  en.textContent = english;
  subtitles.dataset.quiet = String(!spanish);
}

function placement(item) {
  const side = item.title && item.side && item.side !== "center";
  const image = artwork.get(item.shape);
  const aspect = image ? image.width / image.height : wideShapes.has(item.shape) ? 1.5 : item.shape === "retrato" ? 800 / 924 : 1;
  if (compact) {
    return { x: width / 2, y: height * (item.title ? .31 : .5), aspect,
      size: Math.min(width * .97 / aspect, height * (item.shape === "pareja" ? .60 : item.title ? .64 : .91)) };
  }
  return {
    x: width * (side ? item.side === "left" ? .72 : .28 : .5),
    y: height * (item.title && !side ? .38 : .5), aspect,
    size: Math.min(width * (side ? .47 : item.shape === "pareja" ? .79 : .67) / aspect,
      height * (item.title && !side ? .77 : .98), 590)
  };
}

function drawRain(time) {
  const t = motion.matches ? 2 : time;
  for (const item of rain) {
    const fall = (item.y + t * item.speed) % 1;
    const x = (item.x + Math.sin(t * .53 + item.phase) * .037) * width;
    const y = fall * (height + 20) - 10;
    const size = item.size * (compact ? .94 : 1.27);
    ink.globalAlpha = (.16 + (Math.sin(t * 2.1 + item.phase) + 1) * .14) * Math.min(fall * 10, 1, (1 - fall) * 9);
    ink.drawImage(rainStamps[item.type], x - size / 2, y, size, size);
  }
  ink.globalAlpha = 1;
}

function showArtwork(name, place, lift, tilt, opacity) {
  const still = artwork.get(name);
  if (!still || opacity < .01) return 0;
  const w = place.size * place.aspect;
  ink.save();
  ink.globalCompositeOperation = "screen";
  ink.globalAlpha = opacity;
  ink.translate(place.x, place.y + lift);
  ink.rotate(tilt);
  ink.drawImage(still, -w / 2, -place.size / 2, w, place.size);
  ink.restore();
  return opacity;
}

function render(time) {
  const index = Math.max(0, locate(scenes, time, scene => scene.at));
  updateStory(index);
  updateLyrics(time);
  const current = scenes[index];
  const transition = preview?.to === index ? preview : null;
  const previous = scenes[transition?.from ?? Math.max(0, index - 1)];
  const age = transition ? (performance.now() - transition.start) / 1000 : time - current.at;
  if (transition && age >= formationSeconds + revealSeconds) {
    settledScene = index;
    preview = null;
  }
  const settled = motion.matches || index === settledScene;
  const journey = settled ? 1 : ease(age / formationSeconds);
  const curve = Math.sin(journey * Math.PI);
  const a = pictures[previous.shape], b = pictures[current.shape];
  const from = placement(previous), to = placement(current);
  const centerX = mix(from.x, to.x, journey), centerY = mix(from.y, to.y, journey);
  const size = mix(from.size, to.size, journey);
  const pulse = motion.matches ? .84 : .94 + Math.cos(time * turn * 114 / 60) * .085;
  const beat = time * 114 / 60;
  const isDancing = current.shape === "baila";
  const float = motion.matches ? 0 : isDancing ? Math.sin(beat * Math.PI) * 5.8 : Math.sin(time * 2.7) * (current.shape === "carrera" ? 6.3 : 2.6);
  const rock = motion.matches ? 0 : isDancing ? Math.sin(beat * Math.PI / 2) * .033 : Math.sin(time * 3.4) * (current.shape === "musica" ? .05 : current.shape === "carrera" ? .029 : .012);
  if (accentedWord) {
    const captionAge = time - current.at;
    const active = !motion.matches && captionAge > .6 && captionAge < 5.7;
    const lift = active ? Math.max(0, Math.cos(beat * turn)) ** 3 * (compact ? 3 : 5) : 0;
    accentedWord.style.setProperty("--lift", `${-lift}px`);
  }
  ink.clearRect(0, 0, width, height);
  for (const star of sky) {
    ink.globalAlpha = .13 + Math.sin(time * 1.2 + star.phase) * .095;
    ink.fillStyle = "#cabde9";
    ink.fillRect(star.x * width, star.y * height, star.r, star.r);
  }
  drawRain(time);
  const fadingArt = settled || (!transition && index === 0) ? 0
    : showArtwork(previous.shape, from, 0, 0, (transition?.opacity ?? 1) * (1 - ease(age / .15)));
  const opacity = settled ? 1 : ease((age - formationSeconds) / revealSeconds);
  visibleArt = showArtwork(current.shape, to, float, rock, opacity);
  const shimmer = 1 - Math.max(visibleArt * (current.shape === "retrato" ? .91 : .83), fadingArt * .83);
  ink.globalCompositeOperation = "lighter";
  const pinScale = Math.max(.78, Math.min(size / 365, 1.58));
  for (let i = 0; i < pointCount; i++) {
    const p = a[i], q = b[i], wind = drift[i];
    const angle = wind.angle + journey * 1.6;
    const x = mix(p.x * from.aspect, q.x * to.aspect, journey);
    const y = mix(p.y, q.y, journey);
    const xPos = centerX + (x - y * rock + Math.cos(angle) * curve * wind.sway * .23) * size;
    const yPos = centerY + float + (y + x * rock + Math.sin(angle) * curve * wind.sway * .21) * size;
    const color = journey < .48 ? p.color : q.color;
    const alpha = mix(p.alpha, q.alpha, journey);
    ink.globalAlpha = clamp(alpha * pulse * shimmer * (.87 + Math.sin(time * 2.6 + wind.phase) * .15));
    ink.fillStyle = palette[color];
    const radius = (alpha > .64 ? 2.18 : 1.6) * pinScale;
    ink.fillRect(xPos - radius / 2, yPos - radius / 2, radius, radius);
    if (i % 6 === 0) {
      const flare = 6.65 * pinScale;
      ink.globalAlpha *= .72;
      ink.drawImage(flares[color], xPos - flare / 2, yPos - flare / 2, flare, flare);
    }
  }
  ink.globalCompositeOperation = "source-over";
  ink.globalAlpha = 1;
  seek.value = time;
  const seconds = Math.floor(time);
  timeLabel.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function resize() {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  compact = window.innerWidth <= 650;
  const ratio = Math.min(devicePixelRatio || 1, 1.65);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ink.setTransform(ratio, 0, 0, ratio, 0, 0);
  render(song.currentTime);
}

function tick() {
  render(song.currentTime);
  if (!song.paused || preview) frame = requestAnimationFrame(tick);
}
function syncTransport() {
  play.textContent = song.ended ? "Repetir" : song.paused ? "Reproducir" : "Pausar";
  cancelAnimationFrame(frame);
  tick();
}
function jump(time, animate = false) {
  const target = Math.min(time, Number.isFinite(song.duration) ? song.duration : time);
  const to = locate(scenes, target, scene => scene.at);
  preview = animate && !motion.matches && sceneIndex >= 0 && sceneIndex !== to
    ? { from: sceneIndex, to, start: performance.now(), opacity: visibleArt } : null;
  settledScene = preview || time === 0 ? -1 : to;
  song.currentTime = target;
  cancelAnimationFrame(frame);
  tick();
}
play.addEventListener("click", async () => {
  if (!song.paused) { song.pause(); return; }
  if (song.ended) jump(0);
  try { await song.play(); }
  catch { error.hidden = false; }
});
seek.addEventListener("input", () => jump(Number(seek.value)));
chapters.addEventListener("change", () => jump(Number(chapters.value), true));
song.addEventListener("loadedmetadata", () => { seek.max = song.duration; });
song.addEventListener("seeked", () => render(song.currentTime));
for (const name of ["play", "pause", "ended"]) song.addEventListener(name, syncTransport);
song.addEventListener("error", () => { error.hidden = false; play.disabled = true; });
window.addEventListener("resize", resize);
resize();
Promise.allSettled([
  loadArtwork("../assets/imagenes/cuento-isa.png", 3, 2, ["libro", "estudio", "postre", "carrera", "musica", "blacky"]),
  loadArtwork("../assets/imagenes/cuento-isa-escenas.png", 2, 2, ["baila", "laptop", "carino", "cama"]),
  loadArtwork("../assets/imagenes/isa-compartiendo-musica.png", 1, 1, ["pareja"]),
  loadArtwork("../assets/imagenes/retrato-cuento.png", 1, 1, ["retrato"]),
  loadArtwork("../assets/imagenes/cuento-ornamentos.png", 2, 2, ornaments)
]).then(() => {
  chapters.disabled = seek.disabled = false;
  play.disabled = Boolean(song.error);
  syncTransport();
});
