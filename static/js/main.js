const content = document.getElementById("content");
const links = document.querySelectorAll(".nav-links a");

async function loadPage(page) {
  try {
    const response = await fetch(`partials/${page}.html`);
    const html = await response.text();
    content.innerHTML = html;
    setActiveLink(page);
    runFadeIns();
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
  document.querySelector('#content').scrollIntoView({
    behavior: 'smooth'
  });
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

// Lightbox functionality for gallery

const mainContent = document.getElementById('content');
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <span class="close">&times;</span>
  <img src="" alt="">
  <div class="caption"></div>
`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('.caption');
const lightboxClose = lightbox.querySelector('.close');

// Klick auf Lightbox schließen
lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) lightbox.classList.remove('active');
});

// Delegierter Klick auf Gallery-Items
mainContent.addEventListener('click', e => {
  const galleryItem = e.target.closest('.gallery-item');
  if (!galleryItem) return;

  const img = galleryItem.querySelector('img');
  const captionElem = galleryItem.querySelector('.caption-content');
  const caption = captionElem ? captionElem.innerHTML : '';

  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.innerHTML = caption;

  lightbox.classList.add('active');
});
