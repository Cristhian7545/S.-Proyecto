const canvas = document.querySelector("#pixel-room");
const pixelRoom = canvas.getContext("2d");
const room = document.querySelector("#birthday-room");
const candle = document.querySelector("#blow-candle");
const greeting = document.querySelector("#party-greeting");
const title = document.querySelector("#party-title");
const track = document.querySelector("#candle-music");
const sound = document.querySelector("#candle-sound");
const soundLabel = document.querySelector("#candle-sound-label");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const accents = ["#fc7594", "#ffd56d", "#7fd9db", "#b99aef", "#ff9b62", "#fff0af"];
const guests = [
  { at: .115, phase: .2, hair: "#4a2b4a", skin: "#b97665", shirt: "#9b82dc", shade: "#6656a9" },
  { at: .253, phase: 1.4, hair: "#261f34", skin: "#f2b893", shirt: "#ed596f", shade: "#b73e61", longHair: true },
  { at: .747, phase: 2.65, hair: "#38243e", skin: "#e4a37d", shirt: "#f59c58", shade: "#b96446" },
  { at: .885, phase: 3.5, hair: "#5b3a50", skin: "#fac8a2", shirt: "#67bfba", shade: "#368f9a", longHair: true }
];

let width, height, scale, middle, flameY, tableY;
let phase = "dark";
let elapsed = 0;
let blownAt = 0;
let previous;
let animation;

let seed = 1641;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
const confetti = Array.from({ length: 115 }, (_, index) => ({
  x: random(), y: random(), speed: .085 + random() * .22,
  drift: (random() - .5) * .2, tilt: random() * Math.PI * 2,
  color: accents[index % accents.length], bit: 1 + random() * 2.7
}));

function rect(x, y, w, h, color) {
  pixelRoom.fillStyle = color;
  pixelRoom.fillRect(Math.round(x), Math.round(y), Math.round(x + w) - Math.round(x), Math.round(y + h) - Math.round(y));
}

function line(x, y, toX, toY, color, thick = 1) {
  const count = Math.max(1, Math.ceil(Math.max(Math.abs(toX - x), Math.abs(toY - y))));
  for (let i = 0; i <= count; i++) {
    const part = i / count;
    rect(x + (toX - x) * part, y + (toY - y) * part, thick, thick, color);
  }
}

function twinkle(x, y, radius, color) {
  rect(x - radius, y, radius * 2 + 1, 1, color);
  rect(x, y - radius, 1, radius * 2 + 1, color);
  rect(x, y, 1, 1, "#fff4bf");
}

function softLight(x, y, radius, inner, outer) {
  const light = pixelRoom.createRadialGradient(x, y, 0, x, y, radius);
  light.addColorStop(0, inner);
  light.addColorStop(.43, outer + "70");
  light.addColorStop(1, outer + "00");
  rect(x - radius, y - radius, radius * 2, radius * 2, light);
}

function drawFlame(time) {
  const flicker = Math.floor(time * 13) % 4;
  const y = flameY - (flicker === 1 ? 2 : 0);
  const x = middle + (flicker === 2 ? 1 : 0);
  softLight(middle, flameY + 2, 30 + flicker * 2, "#c9793b80", "#9e4628");
  rect(middle - 3, flameY + 8, 6, 15, "#a65e77");
  rect(middle - 3, flameY + 8, 3, 14, "#f6b69a");
  rect(middle - 3, flameY + 9, 6, 3, "#ffd9a6");
  rect(middle, flameY + 5, 1, 5, "#4b2836");
  rect(x - 3, y, 7, 7, "#f17d3f");
  rect(x - 2, y - 4, 6, 9, "#ff9948");
  rect(x, y - 7, 3, 5, "#ffbf55");
  rect(x - 1, y - 3, 4, 8, "#ffda63");
  rect(x, y, 3, 5, "#fff2af");
  if (flicker === 1 || flicker === 3) rect(x + 3, y - 11, 1, 2, "#ffb457c4");
}

function drawDark(time) {
  rect(0, 0, width, height, "#080612");
  if (phase === "dark") {
    drawFlame(time);
  } else {
    const timeSince = elapsed - blownAt;
    const rise = timeSince * 22;
    pixelRoom.save();
    pixelRoom.globalAlpha = Math.max(0, .72 - timeSince);
    for (let i = 0; i < 5; i++) {
      const dx = Math.round(Math.sin(i + timeSince * 8) * (2 + timeSince * 13));
      rect(middle + dx - 1, flameY + 5 - rise - i * 3.2, 2 + i * .54, 2, "#b8a6bd");
    }
    pixelRoom.restore();
  }
}

function drawWindow(center, top, w, h, time) {
  const x = center - w / 2;
  rect(x - 3, top - 3, w + 6, h + 6, "#302849");
  rect(x, top, w, h, "#c2889c");
  rect(x + 3, top + 3, w - 6, h - 6, "#263452");
  rect(x + 3, top + h * .52, w - 6, h * .48 - 3, "#3c4b6c");
  rect(x + 3, top + h * .77, w - 6, h * .23 - 3, "#7d597b");
  for (let i = 0; i < 6; i++) {
    const starX = x + 7 + (i * 17) % Math.max(12, w - 16);
    const starY = top + 7 + (i * 11) % Math.max(11, h - 13);
    if (i === Math.floor(time * 1.8) % 6) twinkle(starX, starY, 2, "#f9cfc8");
    else rect(starX, starY, 1, 1, "#d2b8c9");
  }
  rect(center - 1, top + 1, 3, h - 2, "#936881");
  rect(x + 2, top + Math.floor(h * .52), w - 4, 2, "#936881");
  rect(x - 6, top + h, w + 12, 4, "#f2afad");
  rect(x - 4, top + h + 4, w + 8, 3, "#664e6e");
}

function portraitSprite(background, light, blocks) {
  const sprite = document.createElement("canvas");
  sprite.width = 24;
  sprite.height = 26;
  const ink = sprite.getContext("2d");
  ink.fillStyle = background;
  ink.fillRect(0, 0, 24, 26);
  ink.fillStyle = light;
  ink.fillRect(3, 2, 18, 20);
  ink.fillRect(1, 6, 22, 13);
  for (const [color, pixels] of blocks) {
    ink.fillStyle = color;
    for (const bounds of pixels) ink.fillRect(...bounds);
  }
  return sprite;
}

const portraits = [
  { x: .108, name: ["Michael", "Jackson"], sprite: portraitSprite("#35264e", "#5b3865", [
    ["#1f192d", [[5,2,14,17],[3,5,3,16],[18,5,3,14],[8,1,8,2],[4,19,5,3],[2,23,20,3],[5,21,14,2]]],
    ["#42304b", [[5,4,3,3],[6,8,2,3],[4,12,1,4],[5,17,2,3],[18,6,2,3],[18,14,2,4],[9,2,4,1]]],
    ["#a95f50", [[9,7,8,14],[8,9,10,10],[7,12,2,4],[11,20,4,3]]],
    ["#e9ab7e", [[10,7,6,4],[9,10,8,7],[10,17,6,3],[10,12,4,2]]],
    ["#f3c193", [[10,9,3,1],[13,13,1,4],[15,14,2,1],[10,15,2,1]]],
    ["#55303c", [[9,10,3,1],[14,10,3,1],[14,16,2,1]]],
    ["#ffe8cc", [[9,11,3,2],[14,11,3,2]]],
    ["#211724", [[10,11,1,2],[15,11,1,2],[13,6,2,2],[14,8,1,2],[12,9,2,1]]],
    ["#a84c58", [[11,17,5,1],[12,18,3,1]]],
    ["#f6e8d7", [[10,22,6,4],[9,21,2,2],[15,21,2,2]]],
    ["#756177", [[4,23,4,1],[17,23,4,1],[7,24,1,2],[17,24,1,2]]]
  ]) },
  { x: .25, name: ["Gustavo", "Cerati"], sprite: portraitSprite("#253c59", "#38677a", [
    ["#222338", [[6,3,13,14],[5,6,2,8],[7,1,9,4],[16,2,3,4],[18,5,2,6],[3,23,18,3],[6,21,12,2]]],
    ["#544656", [[7,5,2,4],[8,3,4,2],[11,2,4,1],[14,4,4,2],[17,5,2,2],[6,9,2,2]]],
    ["#b77866", [[8,8,10,10],[9,17,8,3],[11,19,5,3],[7,12,2,4]]],
    ["#e6ab85", [[10,7,6,4],[9,10,8,6],[11,16,5,3],[14,11,3,4]]],
    ["#f4c9a0", [[10,9,3,1],[13,12,1,3],[10,14,2,1]]],
    ["#51343b", [[9,11,3,1],[14,10,3,1],[14,15,2,1]]],
    ["#e6dfca", [[9,12,3,1],[14,11,3,1]]],
    ["#354b51", [[10,12,1,1],[15,11,1,1]]],
    ["#835553", [[9,16,1,2],[10,18,2,1],[12,19,4,1],[16,16,1,2],[11,17,5,1]]],
    ["#33465c", [[5,23,4,1],[16,22,3,1],[12,22,3,1]]]
  ]) },
  { x: .84, name: ["Adrian", "Monk"], sprite: portraitSprite("#58415c", "#866278", [
    ["#9e776c", [[4,23,16,3],[7,21,10,2],[2,24,2,2],[20,24,2,2]]],
    ["#6f4d51", [[5,23,4,3],[16,22,3,4],[4,24,1,2],[20,24,1,2]]],
    ["#f5e3cd", [[9,21,7,3],[10,24,5,2]]],
    ["#382b37", [[6,6,13,8],[7,3,10,4],[9,2,6,2],[17,5,2,4],[5,8,2,5]]],
    ["#654653", [[8,4,6,1],[7,6,4,1],[14,4,2,2],[16,6,2,1]]],
    ["#b5806b", [[7,9,11,9],[6,12,2,3],[18,12,1,3],[9,18,7,2],[10,20,5,2]]],
    ["#edb895", [[9,8,7,5],[8,13,9,4],[9,16,7,2],[11,18,4,1]]],
    ["#f9c8a3", [[10,9,4,1],[12,12,1,4],[15,14,2,1]]],
    ["#654149", [[9,11,3,1],[14,11,3,1],[13,15,2,1],[10,17,5,1]]],
    ["#f9e3d3", [[9,12,3,1],[14,12,3,1]]],
    ["#3f2e3a", [[10,12,1,1],[15,12,1,1],[12,24,1,1]]]
  ]) }
];

function drawPortraits() {
  const w = Math.floor(Math.min(width * .128, height * .156, 64));
  const artWidth = w - 8;
  const artHeight = Math.round(artWidth * 26 / 24);
  const h = artHeight + 22;
  const y = Math.round(height * .347);
  pixelRoom.save();
  pixelRoom.imageSmoothingEnabled = false;
  pixelRoom.textAlign = "center";
  pixelRoom.textBaseline = "top";
  pixelRoom.font = "bold 7px monospace";
  for (const { x, name, sprite } of portraits) {
    const left = Math.round(width * x - w / 2);
    rect(left + 2, y + 3, w, h, "#302240a6");
    rect(left, y, w, h, "#8f574d");
    rect(left + 1, y + 1, w - 2, h - 3, "#d79a63");
    rect(left + 3, y + 3, w - 6, h - 6, "#40283b");
    pixelRoom.drawImage(sprite, left + 4, y + 4, artWidth, artHeight);
    rect(left + 4, y + 5 + artHeight, artWidth, 15, "#593942");
    pixelRoom.fillStyle = "#ffe4b5";
    pixelRoom.fillText(name[0], left + w / 2, y + artHeight + 6);
    pixelRoom.fillText(name[1], left + w / 2, y + artHeight + 13);
  }
  pixelRoom.restore();
}

function drawRoom(time) {
  const floor = height * .764;
  rect(0, 0, width, height, "#31294d");
  rect(0, height * .07, width, floor, "#504166");
  rect(0, height * .35, width, floor - height * .35, "#5d4a6d");
  for (let i = 0; i < width; i += 18) {
    rect(i, height * .25, 5, floor - height * .25, "#8d63831f");
    rect(i + 5, height * .25, 1, floor - height * .25, "#352b5429");
  }
  rect(0, 0, width, height * .04, "#29203f");
  rect(0, height * .04, width, 3, "#9e6587");
  rect(0, floor - 11, width, 8, "#362b51");
  rect(0, floor - 11, width, 2, "#a77791");
  rect(0, floor, width, height - floor, "#3e344f");
  for (let y = Math.round(floor); y < height; y += 11) {
    const row = Math.round((y - floor) / 11);
    rect(0, y, width, 1, "#302a49");
    for (let x = (row % 2) * -16; x < width; x += 32) rect(x, y + 1, 16, 10, "#59435d");
  }
  const firstRow = Math.round(height * .851);
  const lastRow = Math.round(height * .981);
  for (let y = firstRow; y <= lastRow; y++) {
    const step = (y - firstRow) / Math.max(1, lastRow - firstRow);
    const half = Math.min(width * (.21 + step * .07), 110 + step * 20);
    rect(middle - half, y, half * 2, 1, "#ad6881");
    if (y > firstRow + 2 && y < lastRow - 2) rect(middle - half + 3, y, half * 2 - 6, 1, "#7e506e");
  }
  drawWindow(middle, height * .34, Math.min(118, width * .28), height * .22, time);

  for (const side of [-1, 1]) {
    const x = width * (.5 + side * .375);
    const y = height * .335;
    rect(x - 16, y - 5, 32, 2, "#f0b887");
    rect(x - 18, y - 3, 36, 5, "#a25d81");
    softLight(x, y + 3, 42, "#f2a95030", "#ef9255");
    rect(x - 13, y + 1, 26, 2, "#ffda8e");
  }
}

function drawBunting(time) {
  const count = 13;
  const from = width * .035;
  const length = width * .93;
  const span = length / count;
  const cord = t => height * (.24 + t * (1 - t) * .19) + Math.sin(time * 2.1 + t * 6) * 1.2;
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const x = from + span * i;
    const y = cord(t);
    const nextY = cord((i + 1) / count);
    line(x, y, x + span, nextY, "#ffd9b1");
    const pennant = Math.min(14, span * .68);
    const drop = Math.round(9 + Math.sin(time * 3.1 + i * .84) * 2.1);
    const color = accents[i % accents.length];
    for (let row = 1; row <= drop; row++) {
      const inset = row / drop * (pennant / 2 - .5);
      rect(x + (span - pennant) / 2 + inset, (y + nextY) / 2 + row, Math.max(1, pennant - inset * 2), 1, color);
    }
  }
}

function drawBalloon(x, y, color, shadow, time, index) {
  const r = scale * (7.5 + index % 3 * 1.05);
  const lean = Math.sin(time * 2.35 + index) * 4.5;
  line(x, y + r * 1.23, x + lean, y + r * 2.25, "#e0b8a9");
  line(x + lean, y + r * 2.25, x - lean * .46, y + r * 3.4, "#c498a3");
  rect(x - r * .52, y - r, r * 1.04, 2 * r, color);
  rect(x - r * .79, y - r * .75, r * 1.58, 1.54 * r, color);
  rect(x - r, y - r * .48, 2 * r, r, color);
  rect(x + r * .55, y - r * .39, r * .45, r * .84, shadow);
  rect(x - r * .48, y + r * .72, r * .96, r * .28, shadow);
  rect(x - r * .25, y + r, r * .5, r * .28, shadow);
  rect(x - r * .56, y - r * .47, Math.max(2, r * .2), Math.max(3, r * .47), "#fff5d5");
  rect(x - r * .46, y - r * .64, Math.max(2, r * .27), 1, "#fff1cd");
}

function drawBalloons(time) {
  const shades = ["#b84a7a", "#c58951", "#40909e", "#7654a7", "#c86b55", "#dda86c"];
  for (let i = 0; i < 6; i++) {
    const index = i % 3;
    const side = i < 3 ? -1 : 1;
    const x = width * (.5 + side * (.36 + (index - 1) * .073)) + Math.round(Math.sin(time * 1.55 + i * .85) * 4);
    const y = height * (index === 1 ? .611 : .645 + (index === 2 ? .02 : 0)) + Math.round(Math.cos(time * 1.8 + i) * 4.2);
    drawBalloon(x, y, accents[i], shades[i], time, i);
  }
}

function drawGuest(guest, time) {
  const wave = Math.round(Math.sin(time * 5 + guest.phase) * 2);
  const bounce = Math.round(Math.abs(Math.sin(time * 3.25 + guest.phase)) * 3.5);
  const x = width * guest.at;
  const y = Math.min(height * .9, height * .764 + 19 * scale) - bounce;
  const s = scale;
  const put = (dx, dy, w, h, color) => rect(x + dx * s, y + dy * s, w * s, h * s, color);
  put(-13, -2, 26, 3, "#261f4177");
  put(-8, -12, 7, 11, "#465571");
  put(2, -12, 7, 11, "#3c4464");
  put(-9, -4, 9, 2, "#91a2ac");
  put(2, -4, 9, 2, "#91a2ac");
  put(-10, -2, 11, 3, "#241f36");
  put(1, -2, 11, 3, "#241f36");
  put(-12, -34, 24, 23, guest.shade);
  put(-10, -35, 20, 20, guest.shirt);
  put(-9, -14, 18, 2, guest.shade);
  const direction = guest.at < .5 ? -1 : 1;
  put(direction < 0 ? -16 : 11, -38 + wave, 6, 15, guest.shade);
  put(direction < 0 ? -19 : 14, -42 + wave, 5, 7, guest.shirt);
  put(direction < 0 ? -20 : 15, -47 + wave, 5, 6, guest.skin);
  put(direction < 0 ? 10 : -15, -33, 6, 14, guest.shade);
  put(direction < 0 ? 11 : -15, -23, 4, 5, guest.skin);
  put(-4, -38, 8, 6, guest.skin);
  if (guest.longHair) {
    put(-13, -51, 6, 29, guest.hair);
    put(7, -51, 6, 28, guest.hair);
    put(-15, -28, 6, 6, guest.hair);
    put(9, -30, 5, 7, guest.hair);
  }
  put(-11, -55, 22, 18, guest.hair);
  put(-9, -58, 18, 4, guest.hair);
  put(-8, -51, 16, 14, guest.skin);
  put(-7, -38, 14, 2, guest.skin);
  if (guest.longHair) {
    put(-9, -53, 6, 6, guest.hair);
    put(3, -53, 6, 6, guest.hair);
    put(-1, -55, 2, 3, guest.skin);
    put(-8, -31, 1, 8, "#77505e");
    put(8, -31, 1, 8, "#77505e");
  } else {
    put(-10, -54, 13, 4, guest.hair);
    put(-8, -55, 9, 1, "#926678");
  }
  const blinking = (time + guest.phase) % 4.6 < .16;
  put(-5, -46, 2, blinking ? 1 : 3, "#442740");
  put(3, -46, 2, blinking ? 1 : 3, "#442740");
  put(-6, -42, 2, 1, "#e78382");
  put(4, -42, 2, 1, "#e78382");
  put(-2, -42, 4, 2, "#874956");
  put(-1, -42, 2, 1, "#ffe0ae");
}

function drawMinecraftPair(center, floor, s, time) {
  const y = floor - Math.round((1 + Math.sin(time * 3.2)) * 1.15);
  rect(center - 23 * s, floor - 2 * s, 46 * s, 4 * s, "#231d3885");
  for (const side of [-1, 1]) {
    const steve = side < 0;
    const x = center + side * 12 * s;
    const put = (dx, dy, w, h, color) => rect(x + dx * s, y + dy * s, w * s, h * s, color);
    const shirt = steve ? "#44bebc" : "#92b961";
    const sleeve = steve ? "#33868f" : "#617f49";
    const skin = steve ? "#c58c69" : "#f6c397";
    const hair = steve ? "#4b3040" : "#d68038";
    put(-6, -12, 12, 10, steve ? "#55498a" : "#765746");
    put(-1, -10, 2, 8, "#392b4d");
    put(-6, -3, 5, 3, "#332f49");
    put(1, -3, 5, 3, "#332f49");
    put(-7, -23, 14, 12, shirt);
    put(-7, -14, 14, 2, sleeve);
    put(side < 0 ? 6 : -11, -22, 5, 6, sleeve);
    put(side < 0 ? -11 : 7, -22, 4, 6, sleeve);
    put(side < 0 ? -11 : 7, -16, 4, 6, skin);
    put(-8, -39, 16, 16, hair);
    put(-7, -35, 14, 11, skin);
    put(-6, -35, 12, 2, steve ? "#a86b57" : "#e39d6d");
    put(-6, -38, 10, 1, steve ? "#79504a" : "#f7ae55");
    put(-5, -32, 4, 2, "#fff0de");
    put(1, -32, 4, 2, "#fff0de");
    put(-3, -32, 2, 2, steve ? "#43538f" : "#4e8446");
    put(1, -32, 2, 2, steve ? "#43538f" : "#4e8446");
    if (steve) {
      put(-3, -28, 6, 4, hair);
      put(-2, -28, 4, 1, "#a36a58");
    } else {
      put(5, -36, 3, 8, hair);
      put(4, -28, 3, 9, hair);
      put(5, -27, 1, 6, "#f7ae55");
      put(-3, -27, 4, 1, "#b06559");
    }
  }
  rect(center - 3 * s, y - 18 * s, 3 * s, 4 * s, "#c58c69");
  rect(center, y - 18 * s, 3 * s, 4 * s, "#f6c397");
  rect(center - s, y - 18 * s, 2 * s, s, "#ffe0ad");
}

function drawMinecraftWolf(x, y, s, time) {
  const put = (dx, dy, w, h, color) => rect(x + dx * s, y + dy * s, w * s, h * s, color);
  const wag = Math.round(Math.sin(time * 7) * 2);
  put(-15, -2, 30, 4, "#231d3885");
  put(-15, -10 - wag, 8, 3, "#a4a7b0");
  put(-11, -13, 20, 9, "#bec1c4");
  put(-10, -6, 5, 6, "#aaaab4");
  put(5, -6, 5, 6, "#d2cfd1");
  put(-1, -14, 8, 7, "#ce5160");
  put(1, -21, 14, 12, "#d8d5d3");
  put(1, -24, 3, 4, "#adabb3");
  put(11, -24, 3, 4, "#adabb3");
  put(4, -17, 2, 2, "#353047");
  put(10, -17, 2, 2, "#353047");
  put(5, -14, 11, 4, "#eeeeea");
  put(10, -14, 4, 2, "#302a3d");
}

function drawBlacky(x, y, s, time) {
  const put = (dx, dy, w, h, color) => rect(x + dx * s, y + dy * s, w * s, h * s, color);
  const wag = Math.round(Math.sin(time * 6.2) * 2);
  const eyeHeight = time % 4.8 < .14 ? 1 : 2;
  put(-15, -2, 31, 4, "#231d3885");
  put(8, -8, 7, 4, "#d8d3e0");
  put(13, -12 - wag, 4, 7 + wag, "#f6ecd9");
  put(-9, -13, 18, 12, "#d8d2df");
  put(-5, -13, 10, 12, "#f6eee9");
  put(-9, -4, 7, 4, "#f4e9e4");
  put(2, -4, 7, 4, "#fff5e7");
  put(-11, -22, 4, 9, "#d5c6d2");
  put(7, -22, 4, 9, "#d5c6d2");
  put(-8, -24, 16, 12, "#fff3e7");
  put(-5, -26, 10, 3, "#fff3e7");
  put(-5, -20, 2, eyeHeight, "#30273e");
  put(3, -20, 2, eyeHeight, "#30273e");
  put(-4, -17, 8, 5, "#e7d8de");
  put(-2, -17, 4, 2, "#3c3043");
  put(-1, -14, 2, 2, "#e68696");
}

function drawGrassBlock(x, y, s) {
  rect(x - 7 * s, y - 13 * s, 14 * s, 13 * s, "#926345");
  rect(x - 7 * s, y - 13 * s, 14 * s, 4 * s, "#87b759");
  rect(x - 6 * s, y - 10 * s, 3 * s, 3 * s, "#6f974c");
  rect(x + 2 * s, y - 10 * s, 4 * s, 2 * s, "#6f974c");
  rect(x - 2 * s, y - 6 * s, 3 * s, 2 * s, "#bd8a5c");
  rect(x + 3 * s, y - 3 * s, 3 * s, 2 * s, "#674751");
}

function drawGift(x, y, w, body, ribbon) {
  rect(x - w / 2, y - w * .58, w, w * .58, body);
  rect(x - w / 2, y - 2, w, 2, "#31264371");
  rect(x - w / 2 - 1, y - w * .66, w + 2, w * .18, body);
  rect(x - 1, y - w * .66, 3, w * .66, ribbon);
  line(x, y - w * .69, x - w * .19, y - w * .84, ribbon, 2);
  line(x + 1, y - w * .7, x + w * .19, y - w * .86, ribbon, 2);
}

function drawCakeAndTable(time) {
  const table = Math.min(width * .43, 180);
  const left = middle - table / 2;
  const cake = Math.min(table * .47, 72);
  const cakeTop = flameY + 22;
  const leg = Math.max(8, Math.min(height * .947, height * .764 + 37 * scale) - tableY);
  rect(left + 8, tableY + 6, 6, leg, "#2d233e");
  rect(left + table - 14, tableY + 6, 6, leg, "#2d233e");
  rect(left, tableY, table, 9, "#e29493");
  rect(left + 4, tableY + 8, table - 8, 19 * scale, "#c36b89");
  for (let i = 0; i < table - 11; i += 12) rect(left + 7 + i, tableY + 8, 4, 18 * scale, "#e48299");
  rect(left - 3, tableY, table + 6, 3, "#ffd2a4");
  rect(middle - cake * .53 - 4, tableY - 3, cake * 1.06 + 8, 3, "#b4cfce");
  const lowerTop = cakeTop + (tableY - cakeTop) * .46;
  rect(middle - cake / 2, lowerTop, cake, tableY - lowerTop - 3, "#e3838d");
  rect(middle - cake / 2, lowerTop + 3, cake, 4, "#ffd1aa");
  rect(middle - cake / 2, tableY - 7, cake, 3, "#bd5874");
  const small = cake * .73;
  rect(middle - small / 2, cakeTop, small, lowerTop - cakeTop, "#f3ac93");
  rect(middle - small / 2 - 1, cakeTop, small + 2, 4, "#fff0c8");
  for (let x = middle - small / 2 + 2; x < middle + small / 2; x += Math.max(4, scale * 5)) {
    rect(x, cakeTop + 3, 2.7, 2 + (Math.round(x) % 2), "#ffe5b7");
    rect(x, lowerTop - 2, 2, 1, "#d46e85");
  }
  rect(middle - 3, flameY + 9, 6, cakeTop - flameY - 9, "#ee9f9d");
  rect(middle - 3, flameY + 9, 2, cakeTop - flameY - 9, "#ffd1b4");
  rect(middle, flameY + 5, 1, 5, "#473246");
  for (const side of [-1, 1]) {
    const berryX = middle + side * small * .33;
    rect(berryX - 2, cakeTop - 3, 5, 3, "#ee637a");
    rect(berryX - 1, cakeTop - 4, 3, 1, "#ff9690");
    rect(berryX + 1, cakeTop - 5, 1, 2, "#82b787");
    const dessertX = middle + side * table * .36;
    rect(dessertX - 6, tableY - 2, 12, 2, "#b5cdd2");
    rect(dessertX - 4, tableY - 7, 8, 5, "#b788ac");
    rect(dessertX - 5, tableY - 9, 10, 2, "#fff1ba");
    rect(dessertX - 1, tableY - 11, 3, 2, "#f36e84");
    if (Math.floor(time * 2.4) % 3 === 0) twinkle(berryX + side * 4, cakeTop - 8, 2, "#ffd786");
  }
}

function drawConfetti(time) {
  for (const [index, bit] of confetti.entries()) {
    const cycle = (bit.y + time * bit.speed) % 1;
    const burst = Math.min(time / 2.8, 1);
    const x = width * (.5 + (bit.x - .5) * Math.min(1, .4 + burst) + Math.sin(time * 2 + bit.tilt) * bit.drift * .17);
    const y = height * (cycle * 1.16 - .08);
    const turn = Math.floor(time * 8 + bit.tilt) % 3;
    if (index % 17 === 0) twinkle(x, y, turn + 1, bit.color);
    else rect(x, y, turn === 1 ? 1 : bit.bit, turn === 2 ? 1 : bit.bit, bit.color);
  }
}

function drawParty(time, visibleFor) {
  drawRoom(time);
  drawPortraits();
  drawBunting(time);
  drawBalloons(time);
  for (const guest of guests) drawGuest(guest, time);
  drawGift(width * .73, height * .963, 24 * scale, "#50a8ae", "#f7b890");
  drawGift(width * .8, height * .964, 15 * scale, "#e47794", "#ffe6a5");
  drawCakeAndTable(time);
  const ground = height * .966;
  const spriteScale = Math.min(scale * 1.26, width / 280, 1.55);
  drawGrassBlock(width * .06, ground - 2, spriteScale);
  drawMinecraftPair(width * .19, ground, spriteScale, time);
  drawMinecraftWolf(width * .334, ground, spriteScale * .94, time);
  drawBlacky(width * .929, ground, spriteScale * 1.12, time);
  drawConfetti(time);
  if (visibleFor < .22) {
    pixelRoom.save();
    pixelRoom.globalAlpha = (.22 - visibleFor) * 1.5;
    rect(0, 0, width, height, "#20132d");
    pixelRoom.restore();
  }
}

function reveal() {
  phase = "party";
  room.dataset.phase = phase;
  greeting.hidden = false;
  title.focus({ preventScroll: true });
}

function render(now) {
  if (previous !== undefined) elapsed += Math.min(.05, (now - previous) / 1000);
  previous = now;
  const still = motion.matches;
  const timeSince = elapsed - blownAt;
  if (phase === "blown" && (still || timeSince >= .62)) reveal();
  if (phase === "party") drawParty(still ? .88 : Math.max(0, timeSince - .62), still ? 1 : Math.max(0, timeSince - .62));
  else drawDark(still ? 0 : elapsed);
  if (!still) animation = requestAnimationFrame(render);
}

function fit() {
  const zoom = Math.max(1.25, Math.min(canvas.clientWidth / 405, canvas.clientHeight / 252, 3.4));
  width = Math.round(canvas.clientWidth / zoom);
  height = Math.round(canvas.clientHeight / zoom);
  canvas.width = width;
  canvas.height = height;
  middle = Math.round(width / 2);
  scale = Math.max(.85, Math.min(width / 287, height / 224, 1.65));
  tableY = Math.round(height * .725);
  flameY = Math.round(tableY - 22 - 23 * scale);
  room.style.setProperty("--candle-top", `${flameY / height * 100}%`);
  cancelAnimationFrame(animation);
  previous = undefined;
  animation = requestAnimationFrame(render);
}

function syncSound() {
  const playing = !track.paused;
  sound.setAttribute("aria-pressed", String(playing));
  soundLabel.textContent = playing ? "Pausar música" : "Activar música";
}

function playMusic() {
  track.play().catch(syncSound);
}

function startOnInteraction(event) {
  if (!sound.contains(event.target) && track.paused) playMusic();
}

document.addEventListener("click", startOnInteraction, true);
track.addEventListener("play", () => {
  document.removeEventListener("click", startOnInteraction, true);
  syncSound();
});
track.addEventListener("pause", syncSound);
sound.addEventListener("click", () => {
  if (track.paused) playMusic();
  else track.pause();
});

candle.addEventListener("click", () => {
  if (phase !== "dark") return;
  phase = "blown";
  room.dataset.phase = phase;
  candle.hidden = true;
  blownAt = elapsed;
  if (motion.matches) {
    cancelAnimationFrame(animation);
    animation = requestAnimationFrame(render);
  }
});

window.addEventListener("resize", fit);
motion.addEventListener("change", fit);
fit();
syncSound();
playMusic();
