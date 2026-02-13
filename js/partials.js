// Mis texztos de header y footer
// Los cargo en una variable global 

window.PARTIALS = {
  header: `
<header class="site-header">
  <div class="container header-content">
    <a class="brand" href="index.html" aria-label="Ir al inicio">
      <img src="imgs/logo.svg" alt="Logo Dulces Pétalos" />
      <p>Dulces Pétalos</p>
    </a>

    <input type="checkbox" id="menu-toggle" class="menu-toggle" aria-label="Abrir menú" />
    <label for="menu-toggle" class="menu-btn" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </label>

    <nav class="site-nav" aria-label="Menú principal">
      <a class="nav-link" data-nav="inicio" href="index.html">Inicio</a>
      <a class="nav-link" data-nav="quienes-somos" href="quienes-somos.html">Quiénes somos</a>
      <a class="nav-link" data-nav="listado-flores" href="listado-flores.html">Listado de flores</a>
    </nav>
  </div>
</header>
`.trim(),
  footer: `
<footer class="site-footer">
  <div class="container footer-content">
    <div class="footer-brand">
      <img src="imgs/logo.svg" alt="Logo Dulces Pétalos" />
      <p>Dulces Pétalos</p>
    </div>

    <div class="footer-contact">
      <h2>Contacto</h2>
      <p>+34 600 000 000</p>
      <p>contacto@dulcespetalos.com</p>
      <p>Calle de las Flores, 10</p>
    </div>

    <div class="footer-pages">
      <h2>Páginas</h2>
      <a href="index.html">Inicio</a>
      <a href="quienes-somos.html">Quiénes somos</a>
      <a href="listado-flores.html">Listado de flores</a>
    </div>
  </div>

  <div class="footer-bottom">
    <div class="container footer-bottom-content">
      <p>
        <a href="politica-privacidad.html" target="_blank" rel="noopener noreferrer">Aviso legal | Términos de uso | Política de privacidad</a>
      </p>
      <p>Copyright (c) 2025 - Dulces Pétalos</p>
    </div>
  </div>
</footer>
`.trim()
};
