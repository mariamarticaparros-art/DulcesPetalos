// layout.js - Cargamso dinamicamente el header y footer, asi no lo teneos repetido en cada html

// Función para cargar el gragmento
// 1. Comprobamos que esa etiqeuta exista
// 2. mirosi ya tengo ese contenido
// 3. Buscamos elfragmento y olo cargamos 
async function cargarFragmento(urlModulo, targetId, contenidoPartials) {
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  if (typeof contenidoPartials === "string" && contenidoPartials.trim()) {
    target.innerHTML = contenidoPartials;
    return;
  }

  try {
    const response = await fetch(urlModulo);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    target.innerHTML = await response.text();
  } catch (error) {
    console.error(`No se pudo cargar ${ururlModulol}:`, error);
  }
}

// Para resaltar en el menu en que aprtado estamos
// 1. Leemos la etiqueta del body 
// 2. Cogemos todos los enlaces y los comparamos con el page
// 3. ACtivamos o desactivamso segun toque
function marcarNavActiva() {
  const paginaActual = document.body?.dataset.page;
  if (!paginaActual) {
    return;
  }

  const links = document.querySelectorAll(".nav-link[data-nav]");
  links.forEach((link) => {
    const esActiva = link.dataset.nav === paginaActual;
    link.classList.toggle("is-active", esActiva);
    if (esActiva) {
      link.setAttribute("aria-current", "page");
      return;
    }
    link.removeAttribute("aria-current");
  });
}

// Cargamos el header y footer
window.addEventListener("DOMContentLoaded", async () => {
  const headerHtml = window.PARTIALS?.header || "";
  const footerHtml = window.PARTIALS?.footer || "";

  // Cargamos el header y el footer, le damos la div donde se encuentra, y e pasamos el contenido que hemos cargado arriba
  await Promise.all([
    cargarFragmento("modulos/header.html", "site-header", headerHtml),
    cargarFragmento("modulos/footer.html", "site-footer", footerHtml),
  ]);
  marcarNavActiva();
});
