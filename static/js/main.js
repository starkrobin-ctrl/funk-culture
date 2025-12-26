const content = document.getElementById("content");
const links = document.querySelectorAll(".main-nav a");

async function loadPage(page, pushState = true) {
  try {
    const response = await fetch(`partials/${page}.html`);
    const html = await response.text();
    content.innerHTML = html;

    setActiveLink(page);

    if (pushState) {
      history.pushState({ page }, "", page === "aktuelles" ? "/" : `/${page}`);
    }

    runFadeIns();
  } catch (err) {
    content.innerHTML = "<p>Seite konnte nicht geladen werden.</p>";
  }
}

function setActiveLink(page) {
  links.forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });
}

function runFadeIns() {
  document.querySelectorAll(".fade-in").forEach(el => {
    el.classList.add("visible");
  });
}

// Klicks abfangen
links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    loadPage(link.dataset.page);
  });
});

// Browser Zurück / Vor
window.addEventListener("popstate", e => {
  const page = e.state?.page || "aktuelles";
  loadPage(page, false);
});

// Initial Load
function getInitialPage() {
  const path = location.pathname
    .replace("/", "")
    .replace(".html", "");

  if (path === "" || path === "index") {
    return "aktuelles";
  }

  return path;
}

loadPage(getInitialPage(), false);
loadPage(path);
