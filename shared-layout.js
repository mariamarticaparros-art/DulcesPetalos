const FALLBACK_PARTIALS = {
  "partials/header.html": `
    <header class="site-header">
      <div class="container header-content">
        <a class="brand" href="index.html" aria-label="Ir al inicio">
          <img src="imgs/logo.svg" alt="Logo Dulces Petalos" />
          <p>Dulces Pétalos</p>
        </a>
        <input type="checkbox" id="menu-toggle" class="menu-toggle" aria-label="Abrir menu" />
        <label for="menu-toggle" class="menu-btn" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </label>
        <nav class="site-nav" aria-label="Menu principal">
          <a class="nav-link" data-nav="inicio" href="index.html">Inicio</a>
          <a class="nav-link" data-nav="quienes-somos" href="quienes-somos.html">Qui&eacute;nes somos</a>
          <a class="nav-link" data-nav="listado-flores" href="listado-flores.html">Listado de flores</a>
        </nav>
      </div>
    </header>
  `,
  "partials/footer.html": `
    <footer class="site-footer">
      <div class="container footer-content">
        <div class="footer-brand">
          <img src="imgs/logo.svg" alt="Logo Dulces Petalos" />
          <p>Dulces Pétalos</p>
        </div>
        <div class="footer-contact">
          <h2>Contacto</h2>
          <p>+34 600 000 000</p>
          <p>contacto@dulcespetalos.com</p>
          <p>Calle de las Flores, 10</p>
        </div>
        <div class="footer-pages">
          <h2>Paginas</h2>
          <a href="index.html">Inicio</a>
          <a href="listado-flores.html">Listado de flores</a>
          <a href="quienes-somos.html">Qui&eacute;nes somos</a>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container footer-bottom-content">
          <p>
            <a href="politica-privacidad.html" target="_blank" rel="noopener noreferrer">Aviso legal | Terminos de uso | Politica de privacidad</a>
          </p>
          <p>Copyright (c) 2025 - Dulces Petalos</p>
        </div>
      </div>
    </footer>
  `,
};

const PARTIAL_CACHE_VERSION = "v4";

async function injectInclude(containerId, partialPath) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  const fallback = FALLBACK_PARTIALS[partialPath] || "";
  const cacheKey = `dulcespetalos:partial:${PARTIAL_CACHE_VERSION}:${partialPath}`;

  if (window.location.protocol === "file:") {
    container.innerHTML = fallback;
    return;
  }

  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      container.innerHTML = cached;
      return;
    }

    const response = await fetch(partialPath, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${partialPath}: HTTP ${response.status}`);
    }
    const html = await response.text();
    container.innerHTML = html;
    sessionStorage.setItem(cacheKey, html);
  } catch (error) {
    container.innerHTML = fallback;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    injectInclude("site-header-include", "partials/header.html"),
    injectInclude("site-footer-include", "partials/footer.html"),
  ]);
});
