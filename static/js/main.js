// ============================================================
// Sanfte Seitenübergänge (PJAX): echte URLs bleiben bestehen
// (wichtig für SEO, Direktaufruf, kein-JS), aber bei Klicks mit
// aktivem JavaScript wird nur der Inhalt von #page ausgetauscht
// statt die ganze Seite neu zu laden.
// ============================================================

// Browser soll die Scroll-Position NICHT selbst wiederherstellen –
// wir steuern das Scrollen nach jeder Navigation explizit selbst.
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const pageEl = document.getElementById("page");

// Berechnet die Ziel-Scroll-Position für "an den Content scrollen",
// abzüglich der Höhe der sticky Nav-Leiste, damit diese die
// Überschrift nicht verdeckt.
function getContentScrollTarget() {
  const contentEl = pageEl.querySelector('#content');
  if (!contentEl) return 0;

  const navEl = pageEl.querySelector('.main-nav');
  const navHeight = navEl ? navEl.offsetHeight : 0;

  const contentTop = contentEl.getBoundingClientRect().top + window.scrollY;
  return Math.max(contentTop - navHeight, 0);
}

// ---- Persistente Lightbox: EINMAL erstellt, überlebt jede Navigation,
// weil sie außerhalb von #page an <body> hängt ----
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <span class="close">&times;</span>
  <div class="lightbox-media">
    <img src="" alt="">
    <video muted loop playsinline style="display:none;"></video>
    <button type="button" class="mute-toggle" style="display:none;" aria-label="Ton einschalten">🔇</button>
  </div>
  <div class="caption"></div>
`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector('img');
const lightboxVideo = lightbox.querySelector('video');
const muteToggleBtn = lightbox.querySelector('.mute-toggle');
const lightboxCaption = lightbox.querySelector('.caption');
const lightboxClose = lightbox.querySelector('.close');

function closeLightbox() {
  lightbox.classList.remove('active');
  lightboxVideo.pause();
  lightboxVideo.removeAttribute('src');
  lightboxVideo.load();
  lightboxVideo.style.display = 'none';
  lightboxImg.style.display = 'block';
  muteToggleBtn.style.display = 'none';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Ton der Lightbox-Videos an-/ausschalten
function updateMuteIcon() {
  muteToggleBtn.textContent = lightboxVideo.muted ? '🔇' : '🔊';
  muteToggleBtn.setAttribute('aria-label', lightboxVideo.muted ? 'Ton einschalten' : 'Ton ausschalten');
}

muteToggleBtn.addEventListener('click', e => {
  e.stopPropagation();
  lightboxVideo.muted = !lightboxVideo.muted;
  updateMuteIcon();
});

// ---- Bild-Popup (Schlagzeug-Klick auf "Über uns") ----
// bleibt global, da per onclick="" aus dem HTML aufgerufen
function openPopup() {
  const popup = document.getElementById("imagePopup");
  if (popup) popup.style.display = "block";
}

function closePopup() {
  const popup = document.getElementById("imagePopup");
  if (popup) popup.style.display = "none";
}
window.openPopup = openPopup;
window.closePopup = closePopup;

// ---- Alles, was pro Seiteninhalt neu aufgesetzt werden muss ----
function initPage() {
  // Aktiven Nav-Link markieren
  const currentPage = location.pathname.split("/").pop() || "index.html";
  pageEl.querySelectorAll(".nav-links a").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === currentPage);
  });

  // Scroll-Fade-In Animation
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  pageEl.querySelectorAll(".fade-in").forEach(el => {
    el.classList.remove("visible"); // sauberer Start bei jeder Navigation
    fadeObserver.observe(el);

    const rect = el.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (isInViewport) {
      el.classList.add("visible");
    }
  });

  // Scroll-Down-Button (Hero ist jetzt auf jeder Seite vorhanden)
  const scrollBtn = pageEl.querySelector('.scroll-down');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: getContentScrollTarget(), left: 0, behavior: 'smooth' });
    });
  }

  // Klick auf Gallery-Items öffnet die Lightbox
  pageEl.querySelector('#content')?.addEventListener('click', e => {
    const galleryItem = e.target.closest('.gallery-item');
    if (!galleryItem) return;

    const media = galleryItem.querySelector('img, video');
    const captionElem = galleryItem.querySelector('.caption-content');
    const caption = captionElem ? captionElem.innerHTML : '';

    if (media.tagName === 'VIDEO') {
      lightboxImg.style.display = 'none';
      lightboxImg.src = '';
      lightboxVideo.style.display = 'block';
      lightboxVideo.src = media.currentSrc;
      lightboxVideo.play();
      muteToggleBtn.style.display = 'flex';
      updateMuteIcon();
    } else {
      lightboxVideo.pause();
      lightboxVideo.removeAttribute('src');
      lightboxVideo.style.display = 'none';
      lightboxImg.style.display = 'block';
      lightboxImg.src = media.src;
      lightboxImg.alt = media.alt;
      muteToggleBtn.style.display = 'none';
    }

    lightboxCaption.innerHTML = caption;
    lightbox.classList.add('active');
  });

  // Autoplay der Gallery-Videos beim Scrollen
  const videos = pageEl.querySelectorAll('.gallery-item video');
  if (videos.length) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.play().catch(() => {});
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.4 });
    videos.forEach(video => videoObserver.observe(video));
  }
}

// ---- Ein einziger, global gebundener Scroll-Handler für den
// Scroll-Down-Button (fragt sich das aktuelle Element jedes Mal frisch) ----
window.addEventListener('scroll', () => {
  const scrollBtn = document.querySelector('.scroll-down');
  if (!scrollBtn) return;
  if (window.scrollY > 50) {
    scrollBtn.style.opacity = '0';
    scrollBtn.style.pointerEvents = 'none';
  } else {
    scrollBtn.style.opacity = '1';
    scrollBtn.style.pointerEvents = 'auto';
  }
});

// ============================================================
// PJAX-Navigation
// ============================================================

async function navigateTo(url, addToHistory = true) {
  try {
    const currentScrollY = window.scrollY;

    pageEl.classList.add('is-loading');

    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch fehlgeschlagen: ' + response.status);
    const html = await response.text();

    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');
    const newPage = newDoc.getElementById('page');
    if (!newPage) throw new Error('Kein #page-Element in geladener Seite gefunden');

    document.title = newDoc.title;
    pageEl.innerHTML = newPage.innerHTML;
    pageEl.classList.remove('is-loading');

    if (addToHistory) {
      history.pushState({ url }, '', url);
    }

    // Zielposition: dort, wo auch der Hero-Scroll-Pfeil hinscrollt
    // (Beginn von #content, abzüglich Nav-Höhe). Ist der Nutzer schon
    // an dieser Stelle oder weiter unten, bleibt die aktuelle
    // Scroll-Höhe erhalten.
    const contentTop = getContentScrollTarget();

    const targetScrollY = currentScrollY > contentTop ? contentTop : currentScrollY;

    window.scrollTo({ top: targetScrollY, left: 0, behavior: 'instant' });
    initPage();
  } catch (err) {
    // Fallback: normale, vollständige Navigation
    window.location.href = url;
  }
}

// Klicks auf interne Nav-Links abfangen
document.addEventListener('click', e => {
  const link = e.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href) return;

  // Nur eigene .html-Links im selben Ordner abfangen, keine externen/mailto/anchor Links
  const isInternalPage = /^[a-zA-Z0-9_-]+\.html$/.test(href);
  if (!isInternalPage) return;

  // Modifizierte Klicks (Strg/Cmd/Shift/mittlere Maustaste) normal behandeln
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

  e.preventDefault();
  if (href === location.pathname.split('/').pop()) return; // schon auf dieser Seite
  navigateTo(href);
});

// Browser-Zurück/Vor-Buttons
window.addEventListener('popstate', () => {
  navigateTo(location.pathname.split('/').pop() || 'index.html', false);
});

// ---- Initialer Aufruf beim ersten Laden der Seite ----
initPage();
