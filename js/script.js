/* ==========================================================================
   RESUMEN GENERAL DEL SCRIPT
   ==========================================================================

   Este script se encarga de:

   1) Cargar las flores desde una API.
   2) Validar y normalizar la información recibida.
   3) Mostrar un listado principal (máx. 10) y un bloque destacado en la home (máx. 4).
   4) Permitir búsqueda dinámica.
   5) Gestionar la interacción para mostrar y cerrar el detalle de cada flor.


   ========================================================================== */





/* ==========================================================================
   1. VARIABLES GLOBALES Y CONFIGURACIÓN
   ========================================================================== */
const API_URL = "https://698b94ff6c6f9ebe57bd1d99.mockapi.io/api/product";
const MAX_FLORES_LISTADO = 10;
const MAX_FLORES_INICIO = 4;

// Para asegurarnos las url de las flores
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='650' viewBox='0 0 900 650'%3E%3Crect width='100%25' height='100%25' fill='%23ece7db'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%2375695b' font-size='36' font-family='Arial, sans-serif'%3ESin imagen%3C/text%3E%3C/svg%3E";

let floresCargadas = [];
let idActual = null;
let floresRequest = null;
let eventosDetalleActivados = false;
let busquedaActivada = false;


/* ==========================================================================
   2. FUNCIONES "JEFAS" 
   ========================================================================== */

// Primera funcin que se ejecuta al cargar la pagina
// Se encarga de iniciar la carga de las flores y configurar todo lo necesario para mostrar el listado y el detalle
window.addEventListener("DOMContentLoaded", () => {
  cargarFlores();
  cargarFloresInicio();
});



// Carga el listado completo de flores, lo mapea a un formato interno, y lo muestra en la interfaz
async function cargarFlores() {

  // bUSCAMOS LOS ELEMENTOS DONDE VAMOS A GUARDAR
  const grid = document.getElementById("flowers-grid");
  const feedback = document.getElementById("flowers-feedback");

  if (!grid || !feedback) {
    return;
  }

  // Si existe continuamos
  activarFallbackImagenes(grid);

  // Intentamos cargar las flores desde la API, y si hay un error mostramos un mensaje de error
  try {

    // peticion a la api
    const flores = await obtenerFloresApi();

    // Nos qeudamos con las 10 primeras
    floresCargadas = flores.slice(0, MAX_FLORES_LISTADO).map(mapearFlor);

    // Si no hay flores, mostramos un mensaje de que no hay flores
    if (!floresCargadas.length) {
      feedback.innerHTML = crearMensajeHtml("No hay flores disponibles en este momento.");
      return;
    }

    aplicarFiltroFlores("");
    activarEventosDetalle();
    activarBusquedaFlores();
  } catch (error) {

    // Si la pecicon falla salta aqui
    feedback.innerHTML = crearMensajeHtml("No se pudo cargar el listado de flores. Intentalo de nuevo.");
    console.error("Error cargando flores:", error);
  }
}

async function cargarFloresInicio() {
  const grid = document.getElementById("home-flowers-grid");
  const feedback = document.getElementById("home-flowers-feedback");

  if (!grid || !feedback) {
    return;
  }

  activarFallbackImagenes(grid);

  try {
    const flores = await obtenerFloresApi();
    const lista = flores.slice(0, MAX_FLORES_INICIO).map(mapearFlor);

    if (!lista.length) {
      feedback.innerHTML = crearMensajeHtml("No hay flores disponibles en este momento.");
      return;
    }

    renderizarTarjetasInicio(lista);
    feedback.hidden = true;
  } catch (error) {
    feedback.innerHTML = crearMensajeHtml("No se pudieron cargar las flores destacadas.");
    console.error("Error cargando flores de inicio:", error);
  }
}

// Visuales para la pagina de inicio, en este caso slo 4 visuales
function renderizarTarjetasInicio(lista) {
  const grid = document.getElementById("home-flowers-grid");
  if (!grid) {
    return;
  }

  grid.innerHTML = lista
    .map((flor) => {
      // Extraemos id y datos para seguir el mismo esquema que en el listado
      const id = flor.id;
      const datos = flor.datos;
      
      const nombre = escaparHtml(datos.nombre);
      const imagen = escaparHtml(datos.imagen);

      return `
        <article class="home-flower-card" data-id="${id}" aria-label="${nombre}">
          <div class="flower-image-wrap home-flower-image-wrap">
            <img class="flower-image" src="${imagen}" alt="${nombre}" loading="lazy" />
            <div class="home-flower-overlay">
              <p class="home-flower-name">${nombre}</p>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}


// Funcin que se encarga de hacer la peticin a la API para obtener el listado de flores, y cachear el resultado para evitar peticiones innecesarias
// Si todo va bien, obtenerFloresApi() te devuelve el array de flores en formato JavaScript, ya convertido desde JSON.
async function obtenerFloresApi() {
  
  // Si todavía no existe una petición guardada, entonces hazla.
  if (!floresRequest) {
    // Enviamops a nuestro mensajero fetch 
    // Comprobamos si hay o no error 
    floresRequest = fetch(API_URL)
      .then((response) => {
        if (!response.ok) {

          // SI nos da error, y salta al catch
          throw new Error(`HTTP ${response.status}`);
        }

        // Aqui todo ok
        return response.json();
      })
      .then((flores) => (Array.isArray(flores) ? flores : [])) // Aseguramos que lo que nos devuelve es un array, si no lo es, devolvemos un array vacio
      .catch((error) => {
        floresRequest = null;
        throw error;
      });
  }

  return floresRequest;
}



////////////////////////////////////////////////////////////////////////////


// Fallnack para las imagenes
// por si alguna url no funciona, o no es una imagen, o lo que sea
// en vez de mostrar la imagen rota, mostramos una imagen de placeholder que tenemos guardada en la variable PLACEHOLDER_IMG
function activarFallbackImagenes(contenedor) {

  // Si no existe ese contenedor, o ya lo hemos creado, no hacemos nada
  if (!contenedor || contenedor.dataset.imgFallbackActivado === "1") {
    return;
  }

  // Primera vez, le damos la activacion, y guardamos que ya lo hemos hecho para no repetirlo
  contenedor.dataset.imgFallbackActivado = "1";

  // para cada error que ocurra en una imagen dentro de ese contenedor, hacemos lo siguiente
  // Si en algún momento una imagen falla al cargarse, entonces carga tu imagen placeholder.
  contenedor.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) {
        return;
      }
      if (target.dataset.fallbackAplicado === "1") {
        return;
      }
      target.dataset.fallbackAplicado = "1";
      target.src = PLACEHOLDER_IMG;
    },
    true
  );
}

// Convertimos la flro qeu ns lelga en un ormato compatuble
// Gurdamos un objeto con 3 cosas: index, datos y nombres de busqueda
function mapearFlor(flor, index) {
  // 1. Extraemos los datos limpios usando la función de abajo
  const datos = obtenerDatosFlor(flor);
  
  return {
    // 2. LA CLAVE: Guardamos el ID real que viene de la API (flor.id)
    // Si por algún error la API no trae ID, usamos el index como fallback
    id: flor.id || index.toString(), 
    
    datos: datos,
    
    // 3. Preparamos el término de búsqueda para que el buscador funcione rápido
    terminoBusqueda: normalizarBusqueda(`${datos.nombre} ${datos.cientifico}`),
  };
}
// Convierte el texto a minúsculas, elimina los acentos (diacríticos)
// y recorta espacios al inicio y al final.
// Ejemplo: "RÓSA Gallica " → "rosa gallica"
// Se usa para que la búsqueda no dependa de mayúsculas ni acentos.
function normalizarBusqueda(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}


// Le pasamos cada flor individualmente
// Nos devuelve un objeto con los datos que necesitamos para mostrar en la interfaz,
// Obtenemos formato adecuado
function obtenerDatosFlor(flor) {
  return {
    // Aseguramos que el ID se procese como texto para evitar errores de tipo
    id: flor.id ? String(flor.id) : null,
    
    // Los campos deben coincidir con tu JSON de MockAPI
    nombre: normalizarTexto(getCampo(flor, ["name"])),
    cientifico: normalizarTexto(getCampo(flor, ["binomialName"])),
    precio: precioEnTexto(getCampo(flor, ["price"])),
    imagen: normalizarTexto(getCampo(flor, ["imgUrl"]), PLACEHOLDER_IMG),
    
    // Estos campos suelen venir en el detalle (id), asegúrate que los nombres sean iguales
    riegos: normalizarTexto(getCampo(flor, ["wateringsPerWeek"])),
    fertilizante: normalizarTexto(getCampo(flor, ["fertilizerType"])),
    altura: normalizarTexto(getCampo(flor, ["heightInCm"])),
  };
}


// Para asegurar que todos los campos tengan algn nombre, sean string, y no tengan datos feos
function normalizarTexto(valor, fallback = "No disponible") {

  // Si es null o undefined, devolvera "No disponible"
  if (valor === null || valor === undefined) {
    return fallback;
  }

  // lo pasamos  a texto u le qeuitamos  espacio
  const limpio = String(valor).trim();

  // le pasa limi, si esta vacio fallback
  return limpio || fallback;
}


// Si es un numero lo apsa a texto, si es una cosa rara pasa "consulñtar"
// EJ: "abc" --> "Consultar", 123 --> "123€"
function precioEnTexto(valor) {
  const precio = Number(valor);
  return Number.isFinite(precio) ? `${precio}\u20AC` : "Consultar";
}



// Buscar un campo dentro del objeto flor usando varias posibles claves y devolver la primera válida.
// (Yo solo le he pasaso un valor, el nomrbe tal cual de la api)
function getCampo(flor, posiblesClaves) {

  // mas comprobaciones
  if (!flor || typeof flor !== "object") {
    return null;
  }

  // El la key esta bien defindia para las posibles claves qeu le he pasado, y no es null, ni undefined, ni una cadena vacia, entonces devuelve ese valor
  for (const clave of posiblesClaves) {
    if (flor[clave] !== undefined && flor[clave] !== null && String(flor[clave]).trim() !== "") {
      return flor[clave];
    }
  }
  return null;
}



function aplicarFiltroFlores(termino) {
  // Buscamos los elementos donde vamos a mostrar el resultado, y si no existen, no hacemos nada
  const grid = document.getElementById("flowers-grid");
  const feedback = document.getElementById("flowers-feedback");

  // check
  if (!grid || !feedback) {
    return;
  }

  // Filtrar las lfores
  const listaFiltrada = filtrarFlores(termino);

  // Sin resultados despeus del filtro
  if (!listaFiltrada.length) {
    grid.innerHTML = "";
    feedback.innerHTML = crearMensajeHtml("No se encontraron flores para esa busqueda.");
    feedback.hidden = false;
    return;
  }

  renderizarTarjetas(listaFiltrada);
  feedback.hidden = true;
}

// Recibe una lista de flores, y las muestra en la interfaz creando las tarjetas correspondientes
function renderizarTarjetas(lista) {
 const grid = document.getElementById("flowers-grid");
  if (!grid) {
    return;
  }

  grid.innerHTML = lista
    .map((flor) => { // <-- Pasamos 'flor' como argumento
      const id = flor.id; // <-- Extraemos el ID real
      const datos = flor.datos; // <-- Extraemos los datos normalizados
      
      const nombre = escaparHtml(datos.nombre);
      const cientifico = escaparHtml(datos.cientifico);
      const precio = escaparHtml(datos.precio);
      const imagen = escaparHtml(datos.imagen);

      return `
        <article class="flower-card" tabindex="0" role="button" data-id="${id}" aria-label="Ver detalle de ${nombre}">
          <div class="flower-image-wrap">
            <img class="flower-image" src="${imagen}" alt="${nombre}" loading="lazy" />
          </div>
          <div class="flower-info">
            <h2 class="flower-name">${nombre}</h2>
            <p class="flower-meta">${cientifico}</p>
            <p class="flower-price">${precio}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

//Recibe lo que el usuario escribe en el buscador y devuelve solo las flores que coinciden.
function filtrarFlores(termino) {
  const terminoNormalizado = normalizarBusqueda(termino);
  if (!terminoNormalizado) {
    return floresCargadas;
  }

  return floresCargadas.filter(({ terminoBusqueda }) => terminoBusqueda.includes(terminoNormalizado));
}


// Para quitar caracteres especiales o peligrosos
// &, <, >, ", '
function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}




// Cuando escribe el usuario en el inut, se filtr automaticmente las flores
function activarBusquedaFlores() {

  // Para no poner varias veces el addlistener, tenemso eta variale true o false para saber si ya lo hemos hecho, y si es así no hacemos nada
  if (busquedaActivada) {
    return;
  }

  const searchInput = document.getElementById("flowers-search-input");
  if (!searchInput) {
    return;
  }

  // Cada vez que el usuario escribe, borra o cambia el contenido
  busquedaActivada = true;
  searchInput.addEventListener("input", () => {
    aplicarFiltroFlores(searchInput.value);
  });
}



// Para mostrar el detalle de cada flor, y para cerrar ese detalle, y para navegar con el teclado
function activarEventosDetalle() {

  // la primera vez se llama, leugo no hace falta vovler a llamar
  if (eventosDetalleActivados) {
    return;
  }

  // Chequeo
  const grid = document.getElementById("flowers-grid");
  const closeBtn = document.getElementById("flower-detail-close");

  if (!grid) {
    return;
  }

  eventosDetalleActivados = true;

  // Cuando el usuario hace click en una tarjeta, mostramos el detalle de esa flor
  grid.addEventListener("click", (event) => {
    const origen = event.target instanceof Element ? event.target : null;
    const card = origen?.closest(".flower-card");
    if (!card) {
      return;
    }
    mostrarDetalle(card.dataset.id);
  });


  // Es lo mismo que el click… pero pensado para personas que no usan ratón.
  grid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") {
      return;
    }
    const origen = event.target instanceof Element ? event.target : null;
    const card = origen?.closest(".flower-card");
    if (!card) {
      return;
    }
    event.preventDefault();
    mostrarDetalle(card.dataset.id);
  });

  // Creramos el detalle de la flor, y cuando el usuario hace click en el botón de cerrar, volvemos al listado
  closeBtn?.addEventListener("click", cerrarDetalle);

  // Lo mismo para cerrar pero con keydown, para personas que no usan ratón
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    const detailView = document.getElementById("flower-detail-view");
    if (detailView && !detailView.hidden) {
      cerrarDetalle();
    }
  });
}




// creamos una lsita conlso detalles
function crearItemDetalle(etiqueta, valor) {
  const item = document.createElement("li");
  const destacado = document.createElement("strong");
  destacado.textContent = `${etiqueta}: `;
  item.append(destacado, valor);
  return item;
}


async function mostrarDetalle(id) {
  idActual = id;

  const listView = document.getElementById("flowers-list-view");
  const detailView = document.getElementById("flower-detail-view");
  const titleEl = document.getElementById("flower-detail-title");
  const imageEl = document.getElementById("flower-detail-image");
  const listEl = document.getElementById("flower-detail-list");

  // 1. Comprobaciones de seguridad para los elementos de la interfaz
  if (!listView || !detailView || !titleEl || !imageEl || !listEl) {
    return;
  }

  // 2. Mostrar estado de carga (opcional pero profesional)
  titleEl.textContent = "Cargando detalles...";
  listEl.replaceChildren(); 

  try {
    // Detalle del producto --> GET /api/product/:id 
    // EJ: https://.../api/product/4
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      throw new Error(`Error al obtener el producto: ${response.status}`);
    }

    // 4. Recibimos el objeto de la flor individual
    const florApi = await response.json();

    // 5. Usamos tu función obtenerDatosFlor para normalizar los campos
    const datos = obtenerDatosFlor(florApi);

    // 6. Rellenamos los elementos visuales con la info de la API
    titleEl.textContent = datos.nombre;
    imageEl.src = datos.imagen;
    imageEl.alt = datos.nombre;

    // 7. Creamos la lista de detalles técnicos
   const fragment = document.createDocumentFragment();

    fragment.append(
      crearItemDetalle("Nombre común", datos.nombre),
      crearItemDetalle("Nombre científico", datos.cientifico),
      crearItemDetalle("Precio", datos.precio)
    );

    const riegosTxt = /^\d+/.test(datos.riegos)
      ? `${datos.riegos} veces`
      : datos.riegos;

    const alturaTxt = /^\d+/.test(datos.altura)
      ? `${datos.altura} cm`
      : datos.altura;

    fragment.append(
      crearItemDetalle("Riegos por semana", riegosTxt),
      crearItemDetalle("Tipo de fertilizante", datos.fertilizante),
      crearItemDetalle("Altura", alturaTxt)
    );

    // Limpiamos la lista anterior y añadimos la nueva
    listEl.replaceChildren(fragment);

    // 8. Gestión de vistas
    listView.hidden = true;
    detailView.hidden = false;
    
    // Subimos el scroll arriba para que el usuario vea el inicio de la ficha
    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (error) {
    console.error("Error en la petición de detalle:", error);
    // alert("No se pudo cargar la información de esta flor.");
    titleEl.textContent = "No se pudo cargar el detalle";
    listEl.replaceChildren(crearItemDetalle("Error", "Inténtalo de nuevo más tarde."));

  }
}

// funcion de cerrar el detalle
function cerrarDetalle() {
  const listView = document.getElementById("flowers-list-view");
  const detailView = document.getElementById("flower-detail-view");

  if (!listView || !detailView) {
    return;
  }

  detailView.hidden = true;
  listView.hidden = false;

  if (idActual!== null && idActual  !== undefined){
    const tarjeta = document.querySelector(`.flower-card[data-id="${idActual }"]`);
    tarjeta?.focus();
  }
}







//////////////
//////////////
//////////////



function crearMensajeHtml(texto) {
  return `<p>${escaparHtml(texto)}</p>`;
}





//////////////
////////////// COMENTARIOS
//////////////

// 1. antes usaba la id de index de posicion de la flor
// ahora uso el id real, porque por ejemplo podria ser que la flor 1 tenga valor id 20, y no 0
// todas las funcioens qeu usaban el indez de posicion, ahora usan el id real, y el id real se lo paso a cada tarjeta en el data-id, y luego lo uso para mostrar el detalle
// 2. antes no definia el detalle dle producto con GET /api/product/:id, ahroa si