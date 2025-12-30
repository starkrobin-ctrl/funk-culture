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