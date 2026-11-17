{
  const galaxy = document.querySelector("#galaxy");
  const sky = document.querySelector("#galaxy-sky");
  const ink = sky.getContext("2d");
  const menu = document.querySelector("#galaxy-menu");
  const meadow = document.querySelector("#meadow");
  const entrance = document.querySelector("#begin");
  const title = document.querySelector("#galaxy-title");
  const flash = document.querySelector("#galaxy-flash");
  const orbit = document.querySelector("#orbit");
  const records = [...orbit.querySelectorAll(".record")];
  const notes = [...document.querySelectorAll(".galaxy-notes li")];
  const core = document.querySelector("#galaxy-core");
  const coreMessage = document.querySelector("#core-message");
  const fullTurn = Math.PI * 2;
  const tripDuration = 2.45;
  const colors = ["#fff5fa", "#ffd9ee", "#ffbce0", "#dcd5ff"];
  const armColors = ["#ff9ccc", "#ba9eff", "#ea82bb"];
  const armSprites = armColors.map(createGlow);
  const tunnelSprites = colors.map(createGlow);

  let width, height, centerX, centerY, ringX, ringY, discSize;
  let animation;
  let started = 0;
  let previous = 0;
  let traveling = false;
  let angle = .48;
  let velocity = 0;
  let drag = null;
  let suppressClick = false;
  let messageAnimation;

  let seed = 428;
  function random() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const backgroundStars = Array.from({ length: 220 }, () => ({
    x: random(), y: random(), light: random(), phase: random() * fullTurn
  }));
  const spiralStars = Array.from({ length: 2500 }, (_, index) => ({
    radius: .035 + random() ** .75 * .99,
    spread: (random() + random() + random() - 1.5) * (index % 5 === 0 ? 1.15 : .38),
    arm: index % armColors.length,
    color: index % colors.length,
    sparkle: random(),
    size: .45 + random() ** 3 * 1.7
  }));
  const tunnelStars = Array.from({ length: 610 }, (_, index) => ({
    depth: random(),
    phase: random() * fullTurn,
    radius: .015 + random() ** 1.9 * .98,
    size: .55 + random() ** 2 * 1.6,
    color: index % colors.length
  }));

  function fit() {
    width = sky.clientWidth;
    height = sky.clientHeight;
    const dpi = Math.min(devicePixelRatio || 1, 2);
    sky.width = Math.round(width * dpi);
    sky.height = Math.round(height * dpi);
    ink.setTransform(dpi, 0, 0, dpi, 0, 0);
    centerX = width / 2;
    centerY = height * .53;
    discSize = records[0].offsetWidth;
    ringX = Math.min(width * .35, width / 2 - discSize * .62, 460);
    ringY = Math.min(height * .223, Math.max(32, height * .36 - discSize * .52 - 30), 225);
  }

  function diamond(x, y, radius, stretch = .6) {
    ink.beginPath();
    ink.moveTo(x, y - radius);
    ink.quadraticCurveTo(x + radius * .16, y - radius * .17, x + radius * stretch, y);
    ink.quadraticCurveTo(x + radius * .16, y + radius * .17, x, y + radius);
    ink.quadraticCurveTo(x - radius * .16, y + radius * .17, x - radius * stretch, y);
    ink.quadraticCurveTo(x - radius * .16, y - radius * .17, x, y - radius);
    ink.fill();
  }

  function createGlow(color) {
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 48;
    const brush = sprite.getContext("2d");
    const glow = brush.createRadialGradient(24, 24, 0, 24, 24, 24);
    glow.addColorStop(0, color);
    glow.addColorStop(.27, color + "99");
    glow.addColorStop(.60, color + "30");
    glow.addColorStop(1, color + "00");
    brush.fillStyle = glow;
    brush.fillRect(0, 0, 48, 48);
    return sprite;
  }

  function stamp(sprite, x, y, radius) {
    ink.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
  }

  function drawCore(time, size) {
    const glow = ink.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 3.8);
    glow.addColorStop(0, "#fff7dde6");
    glow.addColorStop(.26, "#ebc5ff81");
    glow.addColorStop(1, "#9774ff00");
    ink.fillStyle = glow;
    ink.fillRect(centerX - size * 4, centerY - size * 4, size * 8, size * 8);
    ink.fillStyle = "#ddb6ffad";
    diamond(centerX, centerY, size * 1.45, .76);
    ink.fillStyle = "#fff6de";
    diamond(centerX, centerY, size * (1 + Math.sin(time * 1.8) * .065));
  }

  function drawTunnel(elapsed) {
    const progress = Math.min(elapsed / tripDuration, 1);
    const advance = progress * (.52 + progress * .64);
    const distance = Math.hypot(width, height) * .42;
    const pulse = Math.max(0, (progress - .68) / .32);
    ink.globalCompositeOperation = "lighter";
    for (const star of tunnelStars) {
      const depth = (star.depth + 2 - advance) % 1;
      const twist = star.phase + depth * 2.9 + progress * 4.6;
      const reach = distance * star.radius / (.11 + depth);
      const x = centerX + Math.cos(twist) * reach;
      const y = centerY + Math.sin(twist) * reach * .83;
      if (x < -24 || x > width + 24 || y < -24 || y > height + 24) continue;

      const size = star.size * (.6 + (1 - depth) ** 2 * 2.5);
      const brightness = Math.min(depth * 9, (1 - depth) * 3, 1) * (.55 + progress * .39);
      if (star.size > 1.53) {
        const streak = .025 + progress * .105;
        const tailReach = reach * (1 - streak);
        const trailAngle = twist - streak * 1.2;
        ink.globalAlpha = brightness * .25;
        ink.strokeStyle = colors[star.color];
        ink.lineWidth = Math.max(.55, size * .4);
        ink.beginPath();
        ink.moveTo(centerX + Math.cos(trailAngle) * tailReach, centerY + Math.sin(trailAngle) * tailReach * .83);
        ink.lineTo(x, y);
        ink.stroke();
        ink.globalAlpha = brightness * .65;
        stamp(tunnelSprites[star.color], x, y, size * 3);
      }
      ink.globalAlpha = brightness;
      ink.fillStyle = colors[star.color];
      ink.beginPath();
      ink.arc(x, y, size, 0, fullTurn);
      ink.fill();
    }
    ink.globalAlpha = 1;
    ink.globalCompositeOperation = "source-over";
    drawCore(elapsed, 6 + pulse ** 2 * 42);
  }

  function drawSpiralGlow(rotation, spreadX, spreadY) {
    ink.save();
    ink.globalCompositeOperation = "lighter";
    const glowSize = Math.min(62, Math.max(22, spreadX * .092));
    armSprites.forEach((sprite, arm) => {
      for (let point = 0; point < 64; point++) {
        const radius = .06 + point * .0152;
        const swirl = rotation + arm * fullTurn / armSprites.length + radius * 6.1;
        const x = Math.cos(swirl) * radius * spreadX;
        const y = Math.sin(swirl) * radius * spreadY - x * .12;
        ink.globalAlpha = .072 * (1 - radius * .75) * (.7 + Math.cos(point * .37 + arm) * .3);
        stamp(sprite, centerX + x, centerY + y, glowSize * (1 - radius * .49));
      }
    });
    ink.restore();
  }

  function drawGalaxy(time, rotation) {
    const spreadX = width * .68;
    const spreadY = height * .36;
    ink.fillStyle = "#e7ddff";
    for (const star of backgroundStars) {
      ink.globalAlpha = .2 + star.light * (.43 + .24 * Math.sin(time * .9 + star.phase));
      const size = .45 + star.light * 1.2;
      ink.fillRect(star.x * width, star.y * height, size, size);
    }

    drawSpiralGlow(rotation, spreadX, spreadY);
    for (const star of spiralStars) {
      const { radius, arm, spread, size, sparkle, color } = star;
      const swirl = rotation + arm * fullTurn / armColors.length + radius * 6.1 + spread * (1.1 - radius * .53);
      const x = Math.cos(swirl) * radius;
      const y = Math.sin(swirl) * radius;
      const px = centerX + x * spreadX;
      const py = centerY + y * spreadY - x * spreadX * .12;
      const shimmer = Math.sin(time * 1.8 + sparkle * 47 + radius * 11);
      ink.globalAlpha = (.28 + sparkle * .55 + shimmer * .13) * (1 - radius * .43);
      ink.fillStyle = colors[color];
      ink.fillRect(px, py, size, size);
      if (sparkle > .98 && shimmer > .15) {
        ink.globalAlpha = (shimmer - .15) * .85;
        stamp(armSprites[arm], px, py, 7 + size * 3);
        diamond(px, py, 4 + size * shimmer * 2);
      }
    }

    ink.globalAlpha = 1;
    ink.setLineDash([2, 6]);
    ink.strokeStyle = "#d8bcff4f";
    ink.lineWidth = 1;
    ink.beginPath();
    ink.ellipse(centerX, centerY, ringX, ringY, 0, 0, fullTurn);
    ink.stroke();
    ink.setLineDash([]);
    drawCore(time, Math.min(44, 19 + width * .022));
  }

  function placeRecords() {
    const step = fullTurn / records.length;
    records.forEach((record, index) => {
      const position = angle + index * step;
      const depth = (Math.sin(position) + 1) / 2;
      const scale = .73 + depth * .3;
      const x = centerX + ringX * Math.cos(position) - discSize / 2;
      const y = centerY + ringY * Math.sin(position) - discSize * scale / 2;
      record.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      record.style.zIndex = Math.round(depth * 100);
      record.style.opacity = .83 + depth * .17;
    });
  }

  function placeNotes(rotation) {
    const spacing = fullTurn / notes.length;
    notes.forEach((note, index) => {
      const position = .54 + rotation * 2.3 + index * spacing;
      const side = Math.cos(position);
      const depth = Math.sin(position);
      const brightness = Math.min((depth + .04) * 3, (Math.abs(side) - .45) * 5, 1);
      const x = centerX + side * ringX * .72;
      const y = centerY + depth * ringY * .58;
      note.style.opacity = Math.max(0, brightness) * .94;
      note.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });
  }

  function revealCoreMessage() {
    messageAnimation?.cancel();
    coreMessage.textContent = "Eres bella, ¿lo sabías?";
    const still = reducedMotion.matches;
    const zoom = scale => `translate(-50%, -50%) scale(${still ? 1 : scale})`;
    const keyframes = [
      { transform: zoom(.06), opacity: 0, offset: 0 },
      { transform: zoom(.48), opacity: 1, offset: .19 },
      { transform: zoom(1), opacity: 1, offset: .48 },
      { transform: zoom(1.13), opacity: 1, offset: .72 },
      { transform: zoom(2.35), opacity: 0, offset: 1 }
    ];
    messageAnimation = coreMessage.animate(keyframes, { duration: 2900, easing: "ease-in-out" });
    messageAnimation.onfinish = () => { coreMessage.textContent = ""; };
  }

  function finishTravel(shouldFlash) {
    traveling = false;
    meadow.hidden = true;
    galaxy.classList.remove("is-traveling");
    flash.classList.toggle("is-lit", shouldFlash);
    menu.inert = false;
    menu.classList.add("is-visible");
    title.focus();
  }

  function render(now) {
    const time = (now - started) / 1000;
    const dt = Math.max(0, Math.min((now - previous) / 1000, .035));
    previous = now;
    const still = reducedMotion.matches;
    ink.clearRect(0, 0, width, height);
    if (traveling && time < tripDuration && !still) {
      drawTunnel(time);
    } else {
      if (traveling) finishTravel(!still);
      if (!drag && !orbit.contains(document.activeElement) && !orbit.querySelector(".record:hover")) {
        angle += ((still ? 0 : .12) + velocity) * dt;
      }
      velocity *= Math.exp(-dt * 3.6);
      const skyTime = still ? 0 : time;
      const rotation = skyTime * .073 + angle * .16;
      drawGalaxy(skyTime, rotation);
      placeNotes(rotation);
      placeRecords();
    }
    animation = requestAnimationFrame(render);
  }

  function showGalaxy(animate) {
    galaxy.hidden = false;
    meadow.inert = true;
    traveling = animate && !reducedMotion.matches;
    galaxy.classList.toggle("is-traveling", traveling);
    angle = .48;
    velocity = 0;
    changeScene("galaxy");
    history.replaceState(null, "", "#galaxia");
    fit();
    started = previous = performance.now();
    if (!traveling) finishTravel(false);
    animation = requestAnimationFrame(render);
  }

  function showMeadow() {
    cancelAnimationFrame(animation);
    messageAnimation?.cancel();
    coreMessage.textContent = "";
    menu.classList.remove("is-visible");
    menu.inert = true;
    flash.classList.remove("is-lit");
    galaxy.hidden = true;
    meadow.hidden = false;
    meadow.inert = false;
    const url = new URL(location.href);
    url.hash = "";
    history.replaceState(null, "", url);
    changeScene("meadow");
    entrance.focus();
  }

  orbit.addEventListener("pointerdown", event => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick = false;
    velocity = 0;
    drag = { id: event.pointerId, originX: event.clientX, x: event.clientX, time: event.timeStamp, moved: false };
  });
  orbit.addEventListener("pointermove", event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.moved) {
      if (Math.abs(event.clientX - drag.originX) < 5) return;
      drag.moved = true;
      orbit.setPointerCapture(event.pointerId);
      orbit.classList.add("is-dragging");
    }
    const delta = (event.clientX - drag.x) * .012;
    angle += delta;
    const speed = delta / Math.max((event.timeStamp - drag.time) / 1000, .016);
    velocity = Math.max(-3.5, Math.min(speed, 3.5));
    drag.x = event.clientX;
    drag.time = event.timeStamp;
  });
  function releaseDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    suppressClick = drag.moved;
    if (reducedMotion.matches || event.timeStamp - drag.time > 115) velocity = 0;
    drag = null;
    orbit.classList.remove("is-dragging");
  }
  window.addEventListener("pointerup", releaseDrag);
  window.addEventListener("pointercancel", releaseDrag);
  orbit.addEventListener("click", event => {
    if (suppressClick && event.detail > 0) {
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }
  }, true);
  orbit.addEventListener("dragstart", event => event.preventDefault());

  core.addEventListener("click", revealCoreMessage);
  document.querySelector("#orbit-prev").addEventListener("click", () => { angle -= fullTurn / records.length; });
  document.querySelector("#orbit-next").addEventListener("click", () => { angle += fullTurn / records.length; });
  window.addEventListener("resize", () => {
    if (!galaxy.hidden) fit();
  });
  entrance.addEventListener("click", () => showGalaxy(true));
  document.querySelector("#back-to-meadow").addEventListener("click", showMeadow);
  if (location.hash === "#galaxia") showGalaxy(false);
}
