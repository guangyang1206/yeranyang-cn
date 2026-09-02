/* WorkBuddy Tutorial — Slide navigation + Index panel */
const slides = Array.from(document.querySelectorAll(".slide"));
const totalSlides = slides.length;

const barPage = document.getElementById("barPage");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnIndex = document.getElementById("btnIndex");
const btnIndexClose = document.getElementById("btnIndexClose");
const indexPanel = document.getElementById("indexPanel");
const indexBackdrop = document.getElementById("indexBackdrop");
const indexList = document.getElementById("indexList");

let current = 0;

// ── Build index list from slide section titles ──
function buildIndex() {
  slides.forEach((slide, i) => {
    const eyebrow = slide.querySelector(".section-eyebrow");
    const heading = slide.querySelector("h1, h2");
    const label = eyebrow
      ? eyebrow.textContent.replace(/^\d+\s*[\u2014\-]\s*/, "").trim()
      : (heading ? heading.textContent.replace(/\s+/g, " ").trim() : slide.id);
    const num = String(i + 1).padStart(2, "0");

    const btn = document.createElement("button");
    btn.className = "index-item" + (i === current ? " active" : "");
    btn.innerHTML = `<span class="index-item-num">${num}</span><span class="index-item-label">${label}</span>`;
    btn.addEventListener("click", () => {
      goTo(i);
      closeIndex();
    });
    indexList.appendChild(btn);
  });
}

function updateIndexHighlight() {
  const items = indexList.querySelectorAll(".index-item");
  items.forEach((item, i) => {
    item.classList.toggle("active", i === current);
  });
}

// ── Update bottom-bar timeline: visited pages + current = blue ──
function updateTimeline() {
  const segs = document.querySelectorAll(".btm-seg");
  const labels = document.querySelectorAll(".btm-labels span");
  segs.forEach((seg, i) => {
    seg.classList.toggle("visited", i < current);
    seg.classList.toggle("active", i === current);
  });
  labels.forEach((lbl, i) => {
    lbl.classList.toggle("visited", i < current);
    lbl.classList.toggle("active", i === current);
  });
}

// ── Index open / close ──
function openIndex() {
  indexPanel.classList.add("open");
  indexPanel.setAttribute("aria-hidden", "false");
  updateIndexHighlight();
}
function closeIndex() {
  indexPanel.classList.remove("open");
  indexPanel.setAttribute("aria-hidden", "true");
}

btnIndex.addEventListener("click", openIndex);
btnIndexClose.addEventListener("click", closeIndex);
indexBackdrop.addEventListener("click", closeIndex);

// ── Mobile mode detection ──
const mqMobile = window.matchMedia("(max-width: 768px)");
function isMobile() { return mqMobile.matches; }

// ── Navigation ──
function goTo(index) {
  if (index < 0 || index >= totalSlides) return;
  if (isMobile()) {
    // 手机：滚动到对应 slide，不切换 active 状态
    current = index;
    slides[index].scrollIntoView({ behavior: "smooth", block: "start" });
    updateUI();
    return;
  }
  slides[current].classList.remove("active");
  current = index;
  slides[current].classList.add("active");
  updateUI();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function updateUI() {
  barPage.textContent = (current + 1) + " / " + totalSlides;
  btnPrev.disabled = current === 0;
  btnNext.textContent = current === totalSlides - 1 ? "结束" : "下一页 \u203A";
  updateIndexHighlight();
  updateTimeline();
}

// ── Mobile: detect scroll position and update current slide ──
let scrollTimer = null;
window.addEventListener("scroll", () => {
  if (!isMobile()) return;
  if (scrollTimer) clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    const viewCenter = window.scrollY + window.innerHeight * 0.3;
    let best = 0;
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].offsetTop <= viewCenter) best = i;
    }
    if (best !== current) {
      current = best;
      updateUI();
    }
  }, 60);
});

// ── Mobile init: on load, activate all slides so they render, then jump to top ──
function initMobile() {
  if (!isMobile()) return;
  slides.forEach(s => s.classList.add("active"));
}
mqMobile.addEventListener("change", () => {
  if (isMobile()) {
    slides.forEach(s => s.classList.add("active"));
  } else {
    slides.forEach((s, i) => s.classList.toggle("active", i === current));
  }
});

btnNext.addEventListener("click", () => goTo(current + 1));
btnPrev.addEventListener("click", () => goTo(current - 1));

// ── Keyboard shortcuts ──
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") {
    e.preventDefault();
    goTo(current + 1);
  }
  if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
    e.preventDefault();
    goTo(current - 1);
  }
  if (e.key === "Home") {
    e.preventDefault();
    goTo(0);
  }
  if (e.key === "End") {
    e.preventDefault();
    goTo(totalSlides - 1);
  }
  if (e.key === "Escape") {
    closeIndex();
  }
});

buildIndex();
initMobile();
updateUI();
