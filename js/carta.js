const room = document.querySelector("#reading-room");
const bookstand = document.querySelector("#bookstand");
const cover = document.querySelector(".book-cover");
const letter = document.querySelector("#letter");
const rightPage = document.querySelector(".letter__leaf--right");
const title = document.querySelector("#letter-title");
const openBook = document.querySelector("#open-letter");
const closeBook = document.querySelector("#close-letter");
const track = document.querySelector("#letter-music");
const musicButton = document.querySelector("#letter-sound");
const musicLabel = document.querySelector("#letter-sound-label");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const openCoverFrames = [
  { transform: "rotateY(0)", opacity: 1 },
  { transform: "rotateY(-55deg)", opacity: 1, offset: .64 },
  { transform: "rotateY(-96deg)", opacity: 0 }
];
let inkWords = [];
let writingFrame;

function syncMusic() {
  const playing = !track.paused;
  const label = playing ? "Pausar música" : "Activar música";
  musicButton.setAttribute("aria-pressed", String(playing));
  musicButton.setAttribute("aria-label", label);
  musicLabel.textContent = label;
}

function startMusic() {
  track.play().catch(syncMusic);
}

function startOnInteraction(event) {
  if (musicButton.contains(event.target) || !track.paused) return;
  startMusic();
}

document.addEventListener("click", startOnInteraction, true);
track.addEventListener("play", () => {
  document.removeEventListener("click", startOnInteraction, true);
  syncMusic();
});
track.addEventListener("pause", syncMusic);
musicButton.addEventListener("click", () => {
  if (track.paused) startMusic();
  else track.pause();
});

function collectInkWords() {
  const words = [];
  for (const paragraph of letter.querySelectorAll("h2, p, blockquote")) {
    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const node of textNodes) {
      const line = document.createDocumentFragment();
      for (const chunk of node.data.match(/\s+|\S+/g) ?? []) {
        if (/^\s+$/.test(chunk)) {
          line.append(chunk);
        } else {
          const word = document.createElement("span");
          word.className = "ink-word";
          word.textContent = chunk;
          words.push(word);
          line.append(word);
        }
      }
      node.replaceWith(line);
    }
  }
  return words;
}

function startWriting() {
  if (!inkWords.length) inkWords = collectInkWords();
  for (const word of inkWords) {
    word.classList.remove("ink-fresh", "ink-tip");
    word.classList.add("ink-pending");
  }

  const duration = 7900;
  let start;
  let written = 0;
  let nextSpark = 2;
  function write(now) {
    start ??= now - 75;
    const still = motionPreference.matches;
    const fraction = still ? 1 : Math.min((now - start) / duration, 1);
    const visible = Math.floor(fraction * inkWords.length);
    while (written < visible) {
      const word = inkWords[written++];
      word.classList.remove("ink-pending");
      if (!still) {
        word.classList.add("ink-fresh");
        if (written === nextSpark) {
          word.classList.add("ink-tip");
          nextSpark += 6;
        }
      }
    }
    if (written < inkWords.length) writingFrame = requestAnimationFrame(write);
  }
  writingFrame = requestAnimationFrame(write);
}

openBook.addEventListener("click", async () => {
  openBook.disabled = true;
  if (!motionPreference.matches) {
    await cover.animate(openCoverFrames, { duration: 490, easing: "ease-in-out" }).finished;
    startWriting();
  } else {
    for (const word of inkWords) word.classList.remove("ink-pending", "ink-fresh", "ink-tip");
  }
  bookstand.hidden = true;
  letter.hidden = false;
  room.classList.add("reading-room--open");
  closeBook.disabled = false;
  title.focus();
});

closeBook.addEventListener("click", async () => {
  closeBook.disabled = true;
  cancelAnimationFrame(writingFrame);
  const shouldAnimate = !motionPreference.matches;
  if (shouldAnimate) {
    const options = { duration: 430, easing: "ease-in", fill: "forwards" };
    const fold = letter.animate([
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(.78) translateY(12px)", opacity: 0 }
    ], options);
    const pageTurn = matchMedia("(min-width: 760px)").matches
      ? rightPage.animate([{ transform: "rotateY(0)" }, { transform: "rotateY(-94deg)" }], options)
      : null;
    await fold.finished;
    letter.hidden = true;
    fold.cancel();
    pageTurn?.cancel();
  } else {
    letter.hidden = true;
  }
  room.classList.remove("reading-room--open");
  bookstand.hidden = false;
  window.scrollTo(0, 0);
  if (shouldAnimate) {
    await cover.animate(openCoverFrames, { duration: 480, direction: "reverse", easing: "ease-out" }).finished;
  }
  openBook.disabled = false;
  openBook.focus();
});

syncMusic();
startMusic();
