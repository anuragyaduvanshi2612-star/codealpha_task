// Apni images yahan add/replace karo (src me local path bhi de sakte ho: "images/pic1.jpg")
const images = [
  { src: "https://picsum.photos/id/1018/1000/750", title: "Mountain Lake",  cat: "Nature" },
  { src: "https://picsum.photos/id/1015/1000/750", title: "River Valley",   cat: "Nature" },
  { src: "https://picsum.photos/id/1039/1000/750", title: "Waterfall",      cat: "Nature" },
  { src: "https://picsum.photos/id/1043/1000/750", title: "Green Hills",    cat: "Nature" },
  { src: "https://picsum.photos/id/1031/1000/750", title: "City Street",    cat: "City" },
  { src: "https://picsum.photos/id/1033/1000/750", title: "Downtown",       cat: "City" },
  { src: "https://picsum.photos/id/1048/1000/750", title: "Skyline",        cat: "City" },
  { src: "https://picsum.photos/id/274/1000/750",  title: "Evening Lights", cat: "City" },
  { src: "https://picsum.photos/id/237/1000/750",  title: "Puppy",          cat: "Animals" },
  { src: "https://picsum.photos/id/1025/1000/750", title: "Pug",            cat: "Animals" },
  { src: "https://picsum.photos/id/1074/1000/750", title: "Lion",           cat: "Animals" },
  { src: "https://picsum.photos/id/1084/1000/750", title: "Wild Friend",    cat: "Animals" }
];

const gallery = document.getElementById("gallery");
const filtersEl = document.getElementById("filters");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbTitle = document.getElementById("lbTitle");
const lbCount = document.getElementById("lbCount");

let activeCat = "All";
let visible = [];   // images currently shown (after filter)
let current = 0;    // index inside `visible`

// Build gallery items
images.forEach((img, i) => {
  const div = document.createElement("div");
  div.className = "item";
  div.tabIndex = 0;
  div.dataset.cat = img.cat;
  div.innerHTML = `<img loading="lazy" src="${img.src}" alt="${img.title}">
                   <div class="caption"><strong>${img.title}</strong><br><small>${img.cat}</small></div>`;
  div.addEventListener("click", () => openLightbox(i));
  div.addEventListener("keydown", e => { if (e.key === "Enter") openLightbox(i); });
  gallery.appendChild(div);
});

// Build filter buttons
["All", ...new Set(images.map(i => i.cat))].forEach(cat => {
  const b = document.createElement("button");
  b.textContent = cat;
  if (cat === "All") b.classList.add("active");
  b.addEventListener("click", () => {
    activeCat = cat;
    document.querySelectorAll(".filters button").forEach(x => x.classList.toggle("active", x === b));
    applyFilter();
  });
  filtersEl.appendChild(b);
});

function applyFilter() {
  document.querySelectorAll(".item").forEach(el => {
    el.classList.toggle("hide", activeCat !== "All" && el.dataset.cat !== activeCat);
  });
  visible = images.filter(i => activeCat === "All" || i.cat === activeCat);
}
applyFilter();

// Lightbox
function show(index) {
  current = (index + visible.length) % visible.length;   // wrap around
  const data = visible[current];
  lbImg.classList.add("fade");
  setTimeout(() => {
    lbImg.src = data.src;
    lbImg.alt = data.title;
    lbTitle.textContent = data.title;
    lbCount.textContent = `${current + 1} / ${visible.length}`;
    lbImg.classList.remove("fade");
  }, 150);
}
function openLightbox(globalIndex) {
  const clicked = images[globalIndex];
  current = visible.indexOf(clicked);
  lbImg.src = clicked.src;
  lbImg.alt = clicked.title;
  lbTitle.textContent = clicked.title;
  lbCount.textContent = `${current + 1} / ${visible.length}`;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.getElementById("lbNext").addEventListener("click", () => show(current + 1));
document.getElementById("lbPrev").addEventListener("click", () => show(current - 1));
document.getElementById("lbClose").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", e => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "ArrowRight") show(current + 1);
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "Escape") closeLightbox();
});