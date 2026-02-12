const API_URL = "https://698b94ff6c6f9ebe57bd1d99.mockapi.io/api/product";
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='650'%3E%3Crect width='100%25' height='100%25' fill='%23ece7db'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%2375695b' font-size='36' font-family='Arial'%3ESin imagen%3C/text%3E%3C/svg%3E";

let floresCargadas = [];
let indiceActual = null;

function getCampo(flor, posiblesClaves) {
  for (const clave of posiblesClaves) {
    if (flor[clave] !== undefined && flor[clave] !== null && String(flor[clave]).trim() !== "") {
      return flor[clave];
    }
  }
  return null;
}

function normalizarTexto(valor, fallback = "No disponible") {
  if (valor === null || valor === undefined) {
    return fallback;
  }
  const limpio = String(valor).trim();
  return limpio ? limpio : fallback;
}

function precioEnTexto(valor) {
  const precio = Number(valor);
  return Number.isFinite(precio) ? `${precio}\u20AC` : "Consultar";
}

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizarBusqueda(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function obtenerDatosFlor(flor) {
  return {
    nombre: normalizarTexto(getCampo(flor, ["name"])),
    cientifico: normalizarTexto(getCampo(flor, ["binomialName"])),
    precio: precioEnTexto(getCampo(flor, ["price"])),
    imagen: normalizarTexto(getCampo(flor, ["imgUrl"]), PLACEHOLDER_IMG),
    riegos: normalizarTexto(getCampo(flor, ["wateringsPerWeek"])),
    fertilizante: normalizarTexto(getCampo(flor, ["fertilizerType"])),
    altura: normalizarTexto(getCampo(flor, ["heightInCm"])),
  };
}

function renderizarTarjetas(lista) {
  const grid = document.getElementById("flowers-grid");
  if (!grid) {
    return;
  }

  grid.innerHTML = lista
    .map(({ flor, index }) => {
      const datos = obtenerDatosFlor(flor);

      return `
        <article class="flower-card" tabindex="0" role="button" data-index="${index}" aria-label="Ver detalle de ${datos.nombre}">
          <div class="flower-image-wrap">
            <img class="flower-image" src="${datos.imagen}" alt="${datos.nombre}" loading="lazy" />
          </div>
          <div class="flower-info">
            <h2 class="flower-name">${datos.nombre}</h2>
            <p class="flower-meta">${datos.cientifico}</p>
            <p class="flower-price">${datos.precio}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function filtrarFlores(termino) {
  const terminoNormalizado = normalizarBusqueda(termino);

  const base = floresCargadas.map((flor, index) => ({ flor, index }));
  if (!terminoNormalizado) {
    return base;
  }

  return base.filter(({ flor }) => {
    const datos = obtenerDatosFlor(flor);
    const nombre = normalizarBusqueda(datos.nombre);
    const cientifico = normalizarBusqueda(datos.cientifico);

    return nombre.includes(terminoNormalizado) || cientifico.includes(terminoNormalizado);
  });
}

function aplicarFiltroFlores(termino) {
  const grid = document.getElementById("flowers-grid");
  const feedback = document.getElementById("flowers-feedback");

  if (!grid || !feedback) {
    return;
  }

  const listaFiltrada = filtrarFlores(termino);

  if (!listaFiltrada.length) {
    grid.innerHTML = "";
    feedback.innerHTML = "<p>No se encontraron flores para esa busqueda.</p>";
    feedback.hidden = false;
    return;
  }

  renderizarTarjetas(listaFiltrada);
  feedback.hidden = true;
}

function renderizarTarjetasInicio(lista) {
  const grid = document.getElementById("home-flowers-grid");
  if (!grid) {
    return;
  }

  grid.innerHTML = lista
    .map((flor) => {
      const datos = obtenerDatosFlor(flor);
      const nombreSeguro = escaparHtml(datos.nombre);

      return `
        <article class="home-flower-card" aria-label="${nombreSeguro}">
          <div class="flower-image-wrap home-flower-image-wrap">
            <img class="flower-image" src="${datos.imagen}" alt="${nombreSeguro}" loading="lazy" />
            <div class="home-flower-overlay">
              <p class="home-flower-name">${nombreSeguro}</p>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function mostrarDetalle(index) {
  const listView = document.getElementById("flowers-list-view");
  const detailView = document.getElementById("flower-detail-view");
  const titleEl = document.getElementById("flower-detail-title");
  const imageEl = document.getElementById("flower-detail-image");
  const listEl = document.getElementById("flower-detail-list");

  if (!listView || !detailView || !titleEl || !imageEl || !listEl) {
    return;
  }

  const flor = floresCargadas[index];
  if (!flor) {
    return;
  }

  const datos = obtenerDatosFlor(flor);
  indiceActual = index;

  titleEl.textContent = datos.nombre;
  imageEl.src = datos.imagen;
  imageEl.alt = datos.nombre;
  listEl.innerHTML = `
    <li><strong>Nombre:</strong> ${datos.nombre}</li>
    <li><strong>Nombre cientifico:</strong> ${datos.cientifico}</li>
    <li><strong>Precio:</strong> ${datos.precio}</li>
    <li><strong>Riegos por semana:</strong> ${datos.riegos}</li>
    <li><strong>Tipo de fertilizante:</strong> ${datos.fertilizante}</li>
    <li><strong>Altura:</strong> ${datos.altura}</li>
  `;

  listView.hidden = true;
  detailView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cerrarDetalle() {
  const listView = document.getElementById("flowers-list-view");
  const detailView = document.getElementById("flower-detail-view");

  if (!listView || !detailView) {
    return;
  }

  detailView.hidden = true;
  listView.hidden = false;

  if (Number.isInteger(indiceActual)) {
    const tarjeta = document.querySelector(`.flower-card[data-index="${indiceActual}"]`);
    tarjeta?.focus();
  }
}

function activarEventosDetalle() {
  const grid = document.getElementById("flowers-grid");
  const closeBtn = document.getElementById("flower-detail-close");

  if (grid) {
    grid.addEventListener("click", (event) => {
      const card = event.target.closest(".flower-card");
      if (!card) {
        return;
      }
      mostrarDetalle(Number(card.dataset.index));
    });

    grid.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      const card = event.target.closest(".flower-card");
      if (!card) {
        return;
      }
      event.preventDefault();
      mostrarDetalle(Number(card.dataset.index));
    });
  }

  closeBtn?.addEventListener("click", cerrarDetalle);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const detailView = document.getElementById("flower-detail-view");
      if (detailView && !detailView.hidden) {
        cerrarDetalle();
      }
    }
  });
}

function activarBusquedaFlores() {
  const searchInput = document.getElementById("flowers-search-input");
  if (!searchInput) {
    return;
  }

  searchInput.addEventListener("input", () => {
    aplicarFiltroFlores(searchInput.value);
  });
}

async function cargarFlores() {
  const grid = document.getElementById("flowers-grid");
  const feedback = document.getElementById("flowers-feedback");

  if (!grid || !feedback) {
    return;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const flores = await response.json();
    const lista = Array.isArray(flores) ? flores.slice(0, 10) : [];
    floresCargadas = lista;

    if (!lista.length) {
      feedback.innerHTML = "<p>No hay flores disponibles en este momento.</p>";
      return;
    }

    aplicarFiltroFlores("");
    activarEventosDetalle();
    activarBusquedaFlores();
  } catch (error) {
    feedback.innerHTML = "<p>No se pudo cargar el listado de flores. Intentalo de nuevo.</p>";
    console.error("Error cargando flores:", error);
  }
}

async function cargarFloresInicio() {
  const grid = document.getElementById("home-flowers-grid");
  const feedback = document.getElementById("home-flowers-feedback");

  if (!grid || !feedback) {
    return;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const flores = await response.json();
    const lista = Array.isArray(flores) ? flores.slice(0, 4) : [];

    if (!lista.length) {
      feedback.innerHTML = "<p>No hay flores disponibles en este momento.</p>";
      return;
    }

    renderizarTarjetasInicio(lista);
    feedback.hidden = true;
  } catch (error) {
    feedback.innerHTML = "<p>No se pudieron cargar las flores destacadas.</p>";
    console.error("Error cargando flores de inicio:", error);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  cargarFlores();
  cargarFloresInicio();
});
