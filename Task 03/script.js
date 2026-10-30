// Apne songs yahan add/replace karo. Local file ke liye: src: "songs/song1.mp3"
const songs = [
  { title: "Sunrise Drive",  artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Night Pulse",    artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Open Roads",     artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "Golden Hour",    artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" }
];

const audio = document.getElementById("audio");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const disc = document.getElementById("disc");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volume = document.getElementById("volume");
const volIcon = document.getElementById("volIcon");
const autoplay = document.getElementById("autoplay");
const playlistEl = document.getElementById("playlist");

let index = 0;
let lastVolume = 0.7;

/* ---------- Helpers ---------- */
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function setFill(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty("--fill", pct + "%");
}

/* ---------- Playlist ---------- */
function buildPlaylist() {
  playlistEl.innerHTML = "";
  songs.forEach((song, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${song.title}<small>${song.artist}</small></span>`;
    li.addEventListener("click", () => {
      loadSong(i);
      playSong();
    });
    playlistEl.appendChild(li);
  });
}

function highlightActive() {
  [...playlistEl.children].forEach((li, i) => {
    li.classList.toggle("active", i === index);
  });
}

/* ---------- Core controls ---------- */
function loadSong(i) {
  index = (i + songs.length) % songs.length;   // wrap around
  const song = songs[index];
  audio.src = song.src;
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  progress.value = 0;
  setFill(progress);
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  highlightActive();
}

function playSong() {
  audio.play().catch(() => {});   // browser may block until user clicks
}

function pauseSong() {
  audio.pause();
}

function togglePlay() {
  if (audio.paused) playSong();
  else pauseSong();
}

function nextSong() {
  loadSong(index + 1);
  playSong();
}

function prevSong() {
  // if song played more than 3 seconds, restart it instead of going back
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  loadSong(index - 1);
  playSong();
}

/* ---------- Audio events ---------- */
audio.addEventListener("play", () => {
  playBtn.innerHTML = "&#10074;&#10074;";
  playBtn.setAttribute("aria-label", "Pause");
  disc.classList.add("playing");
});

audio.addEventListener("pause", () => {
  playBtn.innerHTML = "&#9654;";
  playBtn.setAttribute("aria-label", "Play");
  disc.classList.remove("playing");
});

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  progress.value = (audio.currentTime / audio.duration) * 100;
  setFill(progress);
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("ended", () => {
  if (autoplay.checked) nextSong();      // autoplay feature
  else {
    audio.currentTime = 0;
    pauseSong();
  }
});

/* ---------- User controls ---------- */
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

// Seek using progress bar
progress.addEventListener("input", () => {
  if (!audio.duration) return;
  audio.currentTime = (progress.value / 100) * audio.duration;
  setFill(progress);
});

// Volume control
volume.addEventListener("input", () => {
  audio.volume = volume.value;
  setFill(volume);
  updateVolIcon();
});

volIcon.addEventListener("click", () => {
  if (audio.volume > 0) {
    lastVolume = audio.volume;
    audio.volume = 0;
    volume.value = 0;
  } else {
    audio.volume = lastVolume || 0.7;
    volume.value = audio.volume;
  }
  setFill(volume);
  updateVolIcon();
});

function updateVolIcon() {
  const v = audio.volume;
  volIcon.innerHTML = v === 0 ? "&#128263;" : v < 0.5 ? "&#128265;" : "&#128266;";
}

// Keyboard shortcuts (Space = play/pause, arrows = next/prev)
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" && e.target.type !== "checkbox") return;
  if (e.code === "Space") { e.preventDefault(); togglePlay(); }
  else if (e.code === "ArrowRight") nextSong();
  else if (e.code === "ArrowLeft") prevSong();
});

/* ---------- Init ---------- */
audio.volume = volume.value;
setFill(volume);
buildPlaylist();
loadSong(0);