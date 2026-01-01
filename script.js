// SONGS: update src names to files you have in music/ folder
const songs = [
  { title: "it ain't me", artist: "Selena Gomez", src: "song1.mp3", cover: "cover1.jpg" },
  {title: "Badli si hawa hai", artist: "various artist", src: "song3.mp3", cover: "cover1.jpg" },
    { title: "Darkhast", artist: "various artist", src: "song4.mp3", cover: "cover1.jpg" }
    { title: "Maidra", artist: "Seedhe Maut", src: "song5.mp3", cover: "cover1.jpg" }
];
 function loadSong(i) {
  document.getElementById("title").textContent = songs[i].title;
  document.getElementById("artist").textContent = songs[i].artist;
  document.getElementById("cover").src = songs[i].cover;
  audio.src = songs[i].src;
}
    
const audio = document.getElementById("audio");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const progress = document.getElementById("progress");
const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const currentTimeEl = document.getElementById("current-time");
const totalDurationEl = document.getElementById("total-duration");
const volumeEl = document.getElementById("volume");
const playlistEl = document.getElementById("playlist");
const autoplayEl = document.getElementById("autoplay");

let idx = 0;
let isPlaying = false;

// Theme: persist in localStorage
const themeCheckbox = document.getElementById("theme-checkbox");
const root = document.documentElement;
function initTheme(){
  const theme = localStorage.getItem("np-theme") || (window.matchMedia && window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
  root.setAttribute('data-theme', theme);
  themeCheckbox.checked = (theme === 'light');
}
themeCheckbox.addEventListener('change', ()=>{
  const theme = themeCheckbox.checked ? 'light' : 'dark';
  root.setAttribute('data-theme', theme);
  localStorage.setItem('np-theme', theme);
});
initTheme();

// Load playlist UI
function buildPlaylist(){
  playlistEl.innerHTML = "";
  songs.forEach((s, i) => {
    const li = document.createElement("li");
    li.dataset.index = i;
    li.innerHTML = `<span>${s.title}</span><small>${s.artist}</small>`;
    li.addEventListener('click', ()=> loadSong(i, true));
    playlistEl.appendChild(li);
  });
}
buildPlaylist();

function setActiveList(){
  document.querySelectorAll("#playlist li").forEach(li => li.classList.remove("active"));
  const sel = document.querySelector(`#playlist li[data-index="${idx}"]`);
  if(sel) sel.classList.add("active");
}

function loadSong(i, playImmediately = false){
  if(i < 0) i = songs.length - 1;
  if(i >= songs.length) i = 0;
  idx = i;
  audio.src = songs[idx].src;
  titleEl.textContent = songs[idx].title;
  artistEl.textContent = songs[idx].artist;
  setActiveList();

  // try load metadata and optionally play
  audio.load();
  if(playImmediately){
    audio.play().catch(()=>{/* autoplay may be blocked */});
    isPlaying = true; playBtn.textContent = "⏸";
  } else {
    isPlaying = false; playBtn.textContent = "▶";
  }
}

// Play / Pause
playBtn.addEventListener('click', ()=>{
  if(audio.paused){
    audio.play();
  } else {
    audio.pause();
  }
});
audio.addEventListener('play', ()=>{ isPlaying = true; playBtn.textContent = "⏸"; });
audio.addEventListener('pause', ()=>{ isPlaying = false; playBtn.textContent = "▶"; });

// Next / Prev
nextBtn.addEventListener('click', ()=> loadSong(idx+1, true));
prevBtn.addEventListener('click', ()=> loadSong(idx-1, true));

// Volume
volumeEl.addEventListener('input', ()=> audio.volume = volumeEl.value);

// Autoplay checkbox (when current ends)
audio.addEventListener('ended', ()=>{
  if(autoplayEl.checked){
    loadSong(idx+1, true);
  } else {
    playBtn.textContent = "▶";
    isPlaying = false;
  }
});

// When metadata loads, set total duration
audio.addEventListener('loadedmetadata', ()=>{
  if (!isFinite(audio.duration)) return;
  totalDurationEl.textContent = formatTime(Math.floor(audio.duration));
});

// Update progress on timeupdate
audio.addEventListener('timeupdate', ()=>{
  if(!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.value = percent;
  updateProgressBackground(percent);
  currentTimeEl.textContent = formatTime(Math.floor(audio.currentTime));
});

// Seek when user moves progress
let seeking = false;
progress.addEventListener('input', (e)=>{
  seeking = true;
  const val = e.target.value;
  updateProgressBackground(val);
});
progress.addEventListener('change', (e)=>{
  if(audio.duration){
    audio.currentTime = (progress.value / 100) * audio.duration;
  }
  seeking = false;
});

// helper to format 0:00
function formatTime(sec){
  if(!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

// Update the gradient fill of range to create Spotify-like bar
function updateProgressBackground(percent){
  // create a 3-color gradient that looks neon-ish
  const left = `linear-gradient(90deg, ${getComputedStyle(document.documentElement).getPropertyValue('--neon').trim()} 0%, ${getComputedStyle(document.documentElement).getPropertyValue('--neon-2').trim()} 100%)`;
  // We'll use background size trick
  progress.style.background = `${left}, rgba(255,255,255,0.04)`;
  progress.style.backgroundSize = `${percent}% 100%, 100% 100%`;
}

// Keyboard shortcuts: Space=play/pause, ArrowRight=next, ArrowLeft=prev
document.addEventListener('keydown', (e)=>{
  if(e.code === 'Space'){
    e.preventDefault();
    if(audio.paused) audio.play(); else audio.pause();
  } else if(e.code === 'ArrowRight'){
    loadSong(idx+1, true);
  } else if(e.code === 'ArrowLeft'){
    loadSong(idx-1, true);
  }
});

// Initialize
loadSong(0, false);
updateProgressBackground(0);
volumeEl.value = 1;

// (Optional) try to get accurate duration after metadata
audio.addEventListener('loadedmetadata', ()=>{
  updateProgressBackground(progress.value);
});


const cover = document.getElementById("cover");

audio.addEventListener("play", () => {
  cover.classList.add("cover-playing");
});

audio.addEventListener("pause", () => {
  cover.classList.remove("cover-playing");
});

audio.addEventListener("ended", () => {
  cover.classList.remove("cover-playing");
});

