const API_URL = "https://698b94ff6c6f9ebe57bd1d99.mockapi.io/api/product";

const grid = document.getElementById("flowers-grid");
const feedback = document.getElementById("flowers-feedback");
const listView = document.getElementById("flowers-list-view");
const detailView = document.getElementById("flower-detail-view");
const titleEl = document.getElementById("flower-detail-title");
const imageEl = document.getElementById("flower-detail-image");
const listEl = document.getElementById("flower-detail-list");
const closeBtn = document.getElementById("flower-detail-close");

let flores = [];

function tarjetaHTML(flor, i) {
  return `
    <article class="flower-card" tabindex="0" data-index="${i}">
      <div class="flower-image-wrap">
        <img class="flower-image" src="${flor.imgUrl}" alt="${flor.name}" loading="lazy" />
      </div>
      <div class="flower-info">
        <h2 class="flower-name">${flor.name}</h2>
        <p class="flower-meta">${flor.binomialName}</p>
        <p class="flower-price">${flor.price} EUR</p>
      </div>
    </article>
  `;
}

function mostrarDetalle(i) {
  const flor = flores[i];

  titleEl.textContent = flor.name;
  imageEl.src = flor.imgUrl;
  imageEl.alt = flor.name;
  listEl.innerHTML = `
    <li><strong>Nombre:</strong> ${flor.name}</li>
    <li><strong>Nombre cientifico:</strong> ${flor.binomialName}</li>
    <li><strong>Precio:</strong> ${flor.price} EUR</li>
    <li><strong>Riegos por semana:</strong> ${flor.wateringsPerWeek}</li>
    <li><strong>Tipo de fertilizante:</strong> ${flor.fertilizerType}</li>
    <li><strong>Altura:</strong> ${flor.heightInCm} cm</li>
  `;

  listView.hidden = true;
  detailView.hidden = false;
}

function cerrarDetalle() {
  detailView.hidden = true;
  listView.hidden = false;
}

async function cargarFlores() {
  const respuesta = await fetch(API_URL);
  flores = await respuesta.json();

  grid.innerHTML = flores
    .slice(0, 10)
    .map((flor, i) => tarjetaHTML(flor, i))
    .join("");

  feedback.hidden = true;
}

grid.addEventListener("click", (e) => {
  const card = e.target.closest(".flower-card");
  if (card) {
    mostrarDetalle(Number(card.dataset.index));
  }
});

closeBtn.addEventListener("click", cerrarDetalle);

cargarFlores();
