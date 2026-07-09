const content = document.getElementById("content");
const links = document.querySelectorAll(".nav-links a");
const mainContent = document.getElementById('content');

async function loadPage(page) {
  try {
    const response = await fetch(`partials/${page}.html`);
    const html = await response.text();
    content.innerHTML = html;
    setActiveLink(page);
    runFadeIns();
    initGalleryVideos();
  } catch (err) {
    content.innerHTML = "<p>Seite konnte nicht geladen werden.</p>";
  }
}

function setActiveLink(page) {
  links.forEach(link => link.classList.toggle("active", link.dataset.page === page));
}

function runFadeIns() {
  document.querySelectorAll(".fade-in").forEach(el => el.classList.add("visible"));
}

// Klicks abfangen
links.forEach(link => link.addEventListener("click", e => {
  e.preventDefault();
  loadPage(link.dataset.page);
}));

// Initial load
loadPage("aktuelles");

// Scroll down button functionality
document.querySelector('.scroll-down').addEventListener('click', () => {
  document.querySelector('#content').scrollIntoView({ behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  const scrollIcon = document.querySelector('.scroll-down');
  if (window.scrollY > 50) {
    scrollIcon.style.opacity = '0';
    scrollIcon.style.pointerEvents = 'none';
  } else {
    scrollIcon.style.opacity = '1';
    scrollIcon.style.pointerEvents = 'auto';
  }
});

// ---- Lightbox: EINMAL aufbauen (img + video + caption + close) ----
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <span class="close">&times;</span>
  <img src="" alt="">
  <video muted loop playsinline style="display:none;"></video>
  <div class="caption"></div>
`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector('img');
const lightboxVideo = lightbox.querySelector('video');
const lightboxCaption = lightbox.querySelector('.caption');
const lightboxClose = lightbox.querySelector('.close');

function closeLightbox() {
  lightbox.classList.remove('active');
  lightboxVideo.pause();
  lightboxVideo.removeAttribute('src');
  lightboxVideo.load();
  lightboxVideo.style.display = 'none';
  lightboxImg.style.display = 'block';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Delegierter Klick auf Gallery-Items (nur EIN Handler)
mainContent.addEventListener('click', e => {
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
  } else {
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.style.display = 'none';
    lightboxImg.style.display = 'block';
    lightboxImg.src = media.src;
    lightboxImg.alt = media.alt;
  }

  lightboxCaption.innerHTML = caption;
  lightbox.classList.add('active');
});

// Bild-Popup (Schlagzeug-Klick auf "Über uns")
function openPopup() {
  document.getElementById("imagePopup").style.display = "block";
}

function closePopup() {
  document.getElementById("imagePopup").style.display = "none";
}

// Autoplay der Gallery-Videos beim Scrollen
function initGalleryVideos() {
  const videos = mainContent.querySelectorAll('.gallery-item video');
  if (!videos.length) return;

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.4 });

  videos.forEach(video => videoObserver.observe(video));
}