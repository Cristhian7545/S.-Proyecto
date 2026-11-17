const danceCrew = (() => {
  const turn = Math.PI * 2;
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = t => {
    const n = Math.max(0, Math.min(t, 1));
    return n * n * (3 - 2 * n);
  };

  const outfits = {
    isa: { kind: "isa", fabric: "#d74763", light: "#ff7a78", shade: "#9c2b56", jeans: "#45688f", skin: "#efb294", hair: "#261c32", shoe: "#f8d8c5" },
    partner: { kind: "partner", fabric: "#e47e3c", light: "#ffb66d", shade: "#aa4e3d", jeans: "#3f618e", skin: "#e5a381", hair: "#32243c", shoe: "#eadad4" },
    michael: { kind: "michael", fabric: "#27223d", light: "#514c73", shade: "#15152a", jeans: "#29253e", skin: "#a96c59", hair: "#191625", shoe: "#251d32" },
    mint: { kind: "guest", fabric: "#418581", light: "#8bd5bd", shade: "#31546d", jeans: "#3f496c", skin: "#be8068", hair: "#352037", shoe: "#b5cbd7" },
    lilac: { kind: "guest", fabric: "#8956aa", light: "#c39bdc", shade: "#584675", jeans: "#4d4069", skin: "#e8a986", hair: "#66344a", shoe: "#a49ab6" },
    blue: { kind: "guest", fabric: "#506db1", light: "#8da5da", shade: "#3d416f", jeans: "#3e5369", skin: "#a66e60", hair: "#28263a", shoe: "#aaa9ce" }
  };

  const art = Object.fromEntries(Object.entries({
    torso: "M-20 -100 Q-15 -103-9 -103 L9 -103 Q17 -104 22 -98 L19 -77 16 -55 Q0 -50-18 -55 L-20 -77Z",
    chest: "M-17 -97 Q-10 -101 0 -101 Q12 -101 17 -96 L12 -59 Q0 -55-14 -59Z",
    hood: "M-12 -101 Q-16 -105-11 -109 Q-6 -110 0 -105 Q7 -110 13 -108 Q17 -104 10 -98 Q0 -93-12 -101Z",
    strings: "M-3 -99 L-5 -84 M4 -99 L7 -86 M-9 -68 Q0 -66 8 -68",
    lapels: "M-13 -101 L-7 -97 -9 -90 0 -81 M13 -101 L7 -97 9 -90 0 -81",
    collar: "M-8 -103 L0 -98 8 -103 4 -84 -4 -84Z",
    girlHair: "M0 -23 C-15 -29-32 -17-32 -1 C-37 9-28 19-33 27 C-37 36-41 41-36 50 Q-31 57-37 62 C-24 64-18 55-21 47 Q-24 39-16 28 L19 28 Q27 39 23 49 C21 56 27 62 37 62 Q32 57 37 49 C42 42 34 31 33 23 C32 16 39 8 34 -4 C33 -17 16 -29 0 -23Z",
    curtain: "M0 -24 C-16 -29-32 -18-33 -3 C-37 10-27 19-32 28 C-37 34-40 40-35 48 Q-29 56-35 62 C-24 59-20 52-23 44 C-26 34-18 32-19 22 Q-18 17-23 13 C-16 10-13 3-10 -3 Q-6 -12 0 -13Z M1 -24 C16 -29 33 -18 34 -3 C38 10 29 19 34 28 C39 35 42 42 36 50 Q32 56 38 62 C27 59 22 53 25 44 C28 35 20 31 21 22 Q19 16 24 12 C17 9 14 3 11 -4 Q8 -12 1 -13Z",
    waves: "M-5 -22 C-20 -18-26 -6-28 4 Q-29 10-32 13 M-28 17 C-24 24-29 30-32 37 Q-35 46-29 52 M6 -22 C21 -18 27 -6 29 4 Q30 10 33 13 M29 17 C26 23 29 30 34 38 Q38 46 32 53",
    face: "M-20 -12 Q-9 -23 10 -20 Q24 -18 25 -5 L23 12 Q18 22 4 24 Q-13 23-20 14 Q-25 5-20 -12Z",
    shortHair: "M-23 7 Q-31 -2-24 -14 L-28 -16 -19 -20 -18 -24 -10 -23 Q-5 -28 4 -24 Q14 -28 23 -18 L28 -14 Q29 -6 24 1 Q19 -3 18 -9 Q5 -8-4 -16 Q-10 -8-18 -7 L-19 4Z",
    curls: "M-22 8 Q-31 4-26 -5 Q-30 -9-24 -15 Q-25 -22-16 -22 Q-8 -28-2 -24 Q6 -30 11 -23 Q21 -25 25 -17 Q30 -12 26 -5 L22 5 L19 -9 Q10 -10 5 -14 Q-6 -8-18 -7 L-18 8Z",
    fedora: "M-29 -11 Q-13 -13-19 -19 L-14 -30 Q-4 -35 7 -31 L18 -31 24 -18 Q27 -15 34 -15 Q38 -11 33 -9 Q7 -3-29 -8Z",
    band: "M-18 -19 Q3 -23 21 -22 L23 -17 Q4 -15-19 -15Z",
    smile: "M-4 13 Q2 18 8 12",
    brows: "M-13 -4 Q-9 -7-4 -5 M8 -5 Q13 -7 17 -4"
  }).map(([key, path]) => [key, new Path2D(path)]));

  const step = (body, left, right, feet) => ({ body, left, right, feet });
  // Body offset, bounce and lean; each hand's position and elbow bend; each foot's offset and lift.
  const groove = [
    step([0, 0, -.08], [-28, -77, -10], [27, -72, 11], [-16, 0, 14, 2]),
    step([-11, 3, -.15], [-42, -111, -4], [15, -79, 10], [-27, 0, 12, 9]),
    step([4, 5, .12], [-16, -78, -11], [42, -108, 6], [-14, 8, 25, 0]),
    step([10, 2, .17], [-32, -112, -8], [33, -115, 9], [-25, 0, 21, 0]),
    step([-8, 4, -.15], [-44, -93, -3], [10, -88, 13], [-27, 0, 13, 8]),
    step([7, 3, .12], [-7, -81, -10], [46, -99, 6], [-16, 7, 26, 0]),
    step([-4, 5, -.1], [-41, -99, -4], [17, -106, 10], [-27, 0, 15, 7]),
    step([12, 3, .1], [-19, -98, -8], [46, -87, 4], [-17, 5, 26, 0]),
    step([4, 1, .03], [-27, -75, -10], [39, -91, 3], [-15, 0, 19, 4]),
    step([12, 4, 0], [-32, -112, -5], [52, -120, 8], [-18, 4, 24, 0]),
    step([15, 4, 0], [-32, -96, -10], [48, -126, 3], [-20, 0, 17, 7]),
    step([6, 2, -.07], [-37, -111, -8], [33, -82, 13], [-16, 8, 23, 0]),
    step([-11, 3, -.17], [-39, -118, 1], [19, -83, 10], [-27, 0, 16, 8]),
    step([8, 6, .14], [-25, -85, -10], [39, -116, 5], [-13, 9, 24, 0]),
    step([3, 3, -.05], [-38, -106, -6], [29, -95, 7], [-22, 0, 18, 6]),
    step([-4, 5, .06], [-37, -124, -2], [37, -122, 2], [-23, 3, 23, 0])
  ];

  function atBeat(frames, beat, hop = 2) {
    const frame = ((beat / hop) % frames.length + frames.length) % frames.length;
    const index = Math.floor(frame);
    const amount = smooth(frame - index);
    const a = frames[index];
    const b = frames[(index + 1) % frames.length];
    const interpolate = group => a[group].map((value, axis) => mix(value, b[group][axis], amount));
    return step(interpolate("body"), interpolate("left"), interpolate("right"), interpolate("feet"));
  }

  function path(ink, name, fill, stroke, thickness = 1) {
    if (fill) {
      ink.fillStyle = fill;
      ink.fill(art[name]);
    }
    if (stroke) {
      ink.strokeStyle = stroke;
      ink.lineWidth = thickness;
      ink.stroke(art[name]);
    }
  }

  function oval(ink, x, y, rx, ry, color, angle = 0) {
    ink.fillStyle = color;
    ink.beginPath();
    ink.ellipse(x, y, rx, ry, angle, 0, turn);
    ink.fill();
  }

  function limb(ink, startX, startY, midX, midY, endX, endY, color, size) {
    ink.beginPath();
    ink.moveTo(startX, startY);
    ink.lineTo(midX, midY);
    ink.lineTo(endX, endY);
    ink.strokeStyle = "#25192e";
    ink.lineWidth = size + 2;
    ink.stroke();
    ink.strokeStyle = color;
    ink.lineWidth = size;
    ink.stroke();
  }

  function shin(ink, outfit, side, footX, lift, lean, moon) {
    const hipX = side * 9;
    const kneeX = (hipX + footX) / 2 - lean * 9 + side * 3;
    const ankleY = -6 - lift;
    limb(ink, hipX, -55, kneeX, -31 - lift * .26, footX, ankleY, outfit.jeans, 14.5);
    ink.strokeStyle = outfit.kind === "michael" ? "#767092" : "#83aacf85";
    ink.lineWidth = .9;
    ink.beginPath();
    ink.moveTo(kneeX + side * 5, -30 - lift * .26);
    ink.lineTo(footX + side * 5, ankleY);
    ink.stroke();
    if (outfit.kind === "michael") oval(ink, footX, ankleY + 2, 6, 3.7, "#f7e9d5");
    ink.save();
    ink.translate(footX, -3.1 - lift);
    ink.rotate(moon ? side * Math.min(.7, lift * .082) : side * lift * .024);
    oval(ink, side * 3, 1.5, 10, 3.1, "#251b32");
    oval(ink, side * 3, -.7, 9.4, 3.5, outfit.shoe);
    oval(ink, side * 5, -1.8, 4, 1, outfit.kind === "michael" ? "#b5a9d5" : "#fff6ed");
    ink.restore();
  }

  function sleeve(ink, outfit, side, hand, pointing) {
    const [x, y, bend] = hand;
    const shoulderX = side * 17;
    const elbowX = shoulderX + (x - shoulderX) * .45 + bend;
    const elbowY = -98 + (y + 98) * .47 + 10;
    limb(ink, shoulderX, -98, elbowX, elbowY, x, y, side < 0 ? outfit.shade : outfit.fabric, 12);
    oval(ink, x, y, 5.7, 5.3, "#291d33");
    const glove = outfit.kind === "michael" && side > 0;
    oval(ink, x, y, 4.9, 4.65, glove ? "#fff5e7" : outfit.skin);
    if (pointing) {
      const direction = Math.sign(x) || 1;
      oval(ink, x + 4.7 * direction, y - 1.4, 4.6, 1.5, glove ? "#fff5e7" : outfit.skin, -.16 * direction);
    }
    if (glove) oval(ink, x - 1, y - 1.5, 1.2, 1.1, "#91dfff");
  }

  function drawHead(ink, outfit, beat, look, spin, back) {
    const girl = outfit.kind === "isa";
    const mj = outfit.kind === "michael";
    ink.save();
    ink.translate(0, -124);
    ink.rotate(look * .12 + Math.sin(beat * Math.PI / 2) * .035);
    if (girl) path(ink, "girlHair", outfit.hair, "#f090b380", .9);
    const skin = ink.createLinearGradient(-25, -17, 25, 23);
    skin.addColorStop(0, outfit.skin);
    skin.addColorStop(1, mj ? "#91525d" : "#d68f83");
    if (!back) {
      oval(ink, -21, 6, 5, 6, outfit.skin);
      oval(ink, 22, 6, 5, 6, outfit.skin);
      path(ink, "face", skin, "#482b41", .9);
    } else if (!girl) {
      oval(ink, 0, 0, 24, 25, outfit.hair);
    }
    if (girl) {
      const shine = ink.createLinearGradient(-33, -23, 28, 49);
      shine.addColorStop(0, "#574051");
      shine.addColorStop(.43, "#2b2034");
      shine.addColorStop(1, "#38293f");
      path(ink, "curtain", shine);
      path(ink, "waves", null, "#825c70", 1.2);
    } else {
      path(ink, mj ? "curls" : "shortHair", outfit.hair, "#9f607373", .85);
    }
    if (!back) {
      const offset = look * 4.25 + Math.sin(spin) * 2;
      ink.save();
      ink.translate(offset, mj ? 3.2 : 0);
      path(ink, "brows", null, "#542f40", 1.4);
      const blink = ((beat + (girl ? 2.2 : .9)) % 10) < .22;
      for (const eye of [-9, 11]) {
        if (blink) {
          oval(ink, eye, 2, 4.5, .8, "#452c43");
        } else {
          oval(ink, eye, 2, girl ? 5.25 : 4.65, 5.1, "#fff1e5");
          oval(ink, eye + look * 1.1, 2.1, 3.1, 3.8, "#422b40");
          oval(ink, eye - .82, .95, 1.05, 1.18, "#fff8e9");
        }
      }
      oval(ink, -15, 9.6, 4.4, 1.9, "#ee889693");
      oval(ink, 16, 9.5, 4.4, 1.9, "#ee889693");
      path(ink, "smile", null, "#9c5066", 1.35);
      ink.restore();
    }
    if (mj) {
      ink.rotate(-.1 - look * .1);
      path(ink, "fedora", "#241c31", "#df9fb575", .94);
      path(ink, "band", "#8a6b89");
      oval(ink, -4, -28.5, 8, 1.15, "#a18da5", -.15);
    }
    ink.restore();
  }

  function dancer(ink, x, floor, scale, outfit, pose, beat, options = {}) {
    const { direction = 1, look = 0, spin = 0, pointing = false, moon = false } = options;
    const [offset, hop, lean] = pose.body;
    const [lx, ll, rx, rl] = pose.feet;
    const pivot = Math.cos(spin);
    const px = x + offset * direction * scale;
    oval(ink, px, floor + 4 * scale, 37 * scale, 8 * scale, "#170c268c");
    oval(ink, px, floor + 5 * scale, 32 * scale, 5 * scale, outfit.light + "23");
    ink.save();
    ink.translate(px, floor - hop * scale);
    ink.scale(direction * scale * (.55 + Math.abs(pivot) * .45), scale);
    ink.lineCap = "round";
    ink.lineJoin = "round";
    shin(ink, outfit, -1, lx, ll, lean, moon);
    shin(ink, outfit, 1, rx, rl, lean, moon);
    ink.translate(0, -55);
    ink.rotate(lean);
    ink.translate(0, 55);
    if (outfit.kind === "isa") {
      ink.save();
      ink.translate(0, -124);
      path(ink, "girlHair", outfit.hair);
      ink.restore();
    }
    sleeve(ink, outfit, -1, pose.left, pointing);
    sleeve(ink, outfit, 1, pose.right, pointing);
    const fabric = ink.createLinearGradient(-22, -96, 22, -56);
    fabric.addColorStop(0, outfit.light);
    fabric.addColorStop(.31, outfit.fabric);
    fabric.addColorStop(1, outfit.shade);
    oval(ink, 0, -104, 8, 9, outfit.skin);
    path(ink, "torso", fabric, "#281c31", 1.25);
    path(ink, "chest", outfit.fabric + "64", outfit.light + "68", .74);
    if (outfit.kind === "michael") {
      path(ink, "collar", "#f1e3e3");
      path(ink, "lapels", null, "#a193b9", 1.15);
      for (let i = 0; i < 10; i++) {
        if (Math.sin(i * 11 + beat * Math.PI) < -.2) continue;
        oval(ink, (i * 19) % 33 - 16, -96 + (i * 13) % 36, .95, .85, i % 2 ? "#f4c7e2" : "#9fdbed");
      }
    } else if (outfit.kind !== "guest") {
      path(ink, "hood", outfit.shade, outfit.light + "96", .82);
      path(ink, "strings", null, "#ffd5bc8f", 1.25);
    }
    drawHead(ink, outfit, beat, look, spin, pivot < -.13);
    ink.restore();
  }

  function couple(ink, x, y, scale, beat, finale) {
    const phase = beat % 32;
    const isa = atBeat(groove, beat);
    const partner = atBeat(groove, beat + .75);
    const spacing = scale * (60 + Math.sin(beat * Math.PI / 8) * 5);
    const joined = smooth((phase - 16) / 1.5) * smooth((23.5 - phase) / 1.6);
    const spin = turn * smooth((phase - 18) / 3.5);
    const twirl = phase >= 18 && phase <= 21.5;
    const peak = Math.sin(joined * Math.PI / 2);
    const coupleY = y - 105 * scale;
    const armHeight = mix(y - 65 * scale, coupleY, peak);
    const laceArms = (pose, multiplier) => {
      pose.body[2] *= 1 - joined;
      pose.right[0] = mix(pose.right[0], (spacing / scale - pose.body[0]) / multiplier, joined);
      pose.right[1] = mix(pose.right[1], (armHeight - (y - pose.body[1] * scale)) / (scale * multiplier), joined);
    };
    if (joined > 0) {
      laceArms(isa, twirl ? .55 + Math.abs(Math.cos(spin)) * .45 : 1);
      laceArms(partner, 1);
    }
    const close = step([8, 0, 0], [-39, -126, -2], [49, -100, 7], [-24, 0, 22, 0]);
    const left = finale ? close : isa;
    const right = finale ? close : partner;
    dancer(ink, x - spacing, y, scale, outfits.isa, left, beat, {
      look: .55, spin: finale || !twirl ? 0 : spin, pointing: phase >= 8 && phase < 16
    });
    dancer(ink, x + spacing, y, scale, outfits.partner, right, beat, {
      direction: -1, look: .54, pointing: phase >= 8 && phase < 16
    });
  }

  function michael(ink, x, y, scale, beat, travel, finale) {
    const phase = beat % 24;
    const moon = phase >= 4 && phase < 13;
    const glide = smooth((phase - 4) / 9) * smooth((22 - phase) / 6);
    const stride = phase % 2;
    const slide = (stride % 1) * 34;
    const moonFeet = stride < 1
      ? [-17 + slide, 0, 17 - slide, 5.8]
      : [17 - slide, 5.8, -17 + slide, 0];
    const spinning = phase >= 13.2 && phase <= 15.2;
    const spin = spinning ? smooth((phase - 13.2) / 2) * turn : 0;
    const pose = moon
      ? step([0, .4, -.055], [-26, -77, -8], [23, -113, 8], moonFeet)
      : atBeat(groove, beat + 3.9);
    if ((phase > 15.2 && phase < 18.8) || finale) {
      pose.body = [5, 0, -.13];
      pose.left = [-37, -62, -7];
      pose.right = [13, -149, 4];
      pose.feet = [-27, 0, 16, 5];
    }
    dancer(ink, x - (finale ? 0 : glide * travel), y, scale, outfits.michael, pose, beat, { look: .36, spin, moon });
  }

  function guest(ink, x, y, scale, flavor, beat, phase) {
    const costume = outfits[flavor];
    const pose = atBeat(groove, beat + phase, 1.6);
    dancer(ink, x, y, scale, costume, pose, beat + phase, { direction: phase > 3 ? -1 : 1, look: .15, pointing: true });
  }

  return { couple, michael, guest };
})();
