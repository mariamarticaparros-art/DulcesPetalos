const API_URL = 'https://698b94ff6c6f9ebe57bd1d99.mockapi.io/api/flores';

const contenedor = document.getElementById('contenedor-flores');
const buscador = document.getElementById('buscador');
let todasLasFlores = [];

async function cargarAPI() {
    try {
        const res = await fetch(API_URL);
        todasLasFlores = await res.json();
        mostrarPortada(todasLasFlores);
    } catch (e) {
        contenedor.innerHTML = "<p class='text-center col-span-full py-10'>Error al conectar con el jardín...</p>";
    }
}

function mostrarPortada(lista) {
    // Volver a mostrar header y buscador por si venimos de "detalle"
    document.querySelector('header').style.display = "block";
    document.querySelector('section').style.display = "block";
    contenedor.className = "flex-grow p-6 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8";
    
    contenedor.innerHTML = '';
    lista.forEach(flor => {
        contenedor.innerHTML += `
            <div class="flor-card group cursor-pointer animate-fade-in" onclick="verDetalle('${flor.id}')">
                <div class="flor-img-container shadow-sm">
                    <img src="${flor.imgUrl}" alt="${flor.name}">
                </div>
                <div class="text-center mt-4">
                    <h3 class="text-lg font-serif font-bold text-stone-800">${flor.name}</h3>
                    <p class="text-[10px] tracking-widest text-rose-300 uppercase">${flor.binomialName}</p>
                    <p class="text-sm text-stone-400 mt-2">${flor.price}€</p>
                </div>
            </div>
        `;
    });
}

function verDetalle(id) {
    const flor = todasLasFlores.find(f => f.id == id);
    if(!flor) return;
    
    window.scrollTo({top: 0, behavior: 'smooth'});
    document.querySelector('section').style.display = "none";
    
    contenedor.className = "flex-grow p-6 max-w-4xl mx-auto";
    contenedor.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-8 animate-fade-in">
            <img src="${flor.imgUrl}" class="w-full md:w-1/2 h-80 object-cover rounded-lg">
            <div class="flex flex-col justify-center">
                <button onclick="mostrarPortada(todasLasFlores)" class="text-rose-300 text-xs uppercase tracking-widest mb-4 hover:underline">← Volver</button>
                <h2 class="text-4xl font-serif italic text-stone-800 mb-2">${flor.name}</h2>
                <p class="text-stone-400 italic mb-4">${flor.binomialName}</p>
                <p class="text-stone-500 mb-6 leading-relaxed">${flor.wateringsPerWeek} riegos por semana</p>
                <div class="flex justify-between items-center border-t border-stone-100 pt-6">
                    <span class="text-2xl font-light text-stone-800">${flor.price}€</span>
                    <button class="bg-[#fce4ec] text-rose-500 px-6 py-2 rounded-full font-bold hover:bg-rose-100 transition">Comprar</button>
                </div>
            </div>
        </div>
    `;
}

buscador.addEventListener('input', (e) => {
    const t = e.target.value.toLowerCase();
    const f = todasLasFlores.filter(fl => fl.nombre.toLowerCase().includes(t));
    mostrarPortada(f);
});

// Variable global para filtrar sin perder los datos originales
let floresFiltradas = [];

// Lógica de búsqueda en tiempo real
buscador.addEventListener('input', (e) => {
    const textoUsuario = e.target.value.toLowerCase();

    // Filtra productos por nombre o nombre científico
    floresFiltradas = todasLasFlores.filter(flor => {
        const nombre = flor.nombre ? flor.nombre.toLowerCase() : "";
        const cientifico = flor.nombre_ci ? flor.nombre_ci.toLowerCase() : "";
        
        return nombre.includes(textoUsuario) || cientifico.includes(textoUsuario);
    });

    // Vuelve a pintar las flores con el resultado del filtro
    mostrarPortada(floresFiltradas);
});


cargarAPI();
