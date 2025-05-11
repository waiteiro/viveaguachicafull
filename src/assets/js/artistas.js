import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from './firebase.js';

// Variables globales
let artistasFiltrados = [];
const artistasPorPagina = 8;
let paginaActual = 1;

// Función para cargar artistas desde Firebase
async function loadArtistsFromFirebase() {
    try {
        const artistsRef = collection(db, 'artists');
        const q = query(artistsRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        const artists = [];
        querySnapshot.forEach((doc) => {
            const artist = { id: doc.id, ...doc.data() };
            artists.push(artist);
        });
        return artists;
    } catch (error) {
        console.error('Error al cargar artistas:', error);
        return [];
    }
}

async function getEventosDeArtista(artistId) {
    try {
        const response = await fetch('../data/eventos.json');
        const data = await response.json();
        // Filtrar eventos donde el artista participa
        const eventos = data.eventos.filter(ev => Array.isArray(ev.artists) && ev.artists.includes(artistId));
        // Filtrar solo eventos futuros (opcional)
        const hoy = new Date();
        const eventosProximos = eventos.filter(ev => {
            if (!ev.fechaInicio) return false;
            const fecha = new Date(ev.fechaInicio);
            return fecha >= hoy;
        });
        return eventosProximos;
    } catch (e) {
        return [];
    }
}

async function createArtistCard(artist) {
    const imageUrl = artist.imageUrl && artist.imageUrl !== '' ? artist.imageUrl : '../src/assets/images/placeholder.jpg';
    const name = artist.name || 'Sin nombre';
    const category = artist.category || 'Sin categoría';
    const bio = artist.bio || '';
    const social = artist.socialMedia || {};
    const artistId = artist.id || '';
    const eventos = await getEventosDeArtista(artistId);
    const numEventos = eventos.length;

    return `
      <div class="bg-white rounded-2xl shadow-md flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300">
        <div class="relative">
          <img src="${imageUrl}" alt="${name}" class="w-full h-48 object-cover rounded-t-2xl bg-gray-100" onerror="this.src='../src/assets/images/placeholder.jpg'">
          <span class="absolute top-2 right-2 bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs">${category}</span>
          ${numEventos > 0 ? `
            <span class="absolute bottom-2 right-2 bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
              ${numEventos} ${numEventos === 1 ? 'evento' : 'eventos'} próximos
            </span>
          ` : ''}
        </div>
        <div class="p-4 flex-1 flex flex-col">
          <h3 class="text-lg font-bold text-indigo-700 mb-1">${name}</h3>
          <p class="text-gray-600 text-sm mb-2 line-clamp-2">${bio}</p>
          <div class="flex-1"></div>
          <div class="flex gap-2 mt-2">
            ${Object.entries(social).map(([red, url]) => url ? `<a href="${url}" target="_blank" class="text-gray-400 hover:text-indigo-600"><i class="fab fa-${red}"></i></a>` : '').join('')}
          </div>
          <div class="mt-4 text-right">
            <a href="/src/views/artistas/perfil.html?id=${artistId}" 
               class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm">
              Ver perfil
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    `;
}

// Función para mostrar artistas
async function mostrarArtistas() {
    try {
        console.log('Mostrando artistas...');
        const artistasContainer = document.getElementById('artistas-container');
        if (!artistasContainer) {
            console.error('No se encontró el contenedor de artistas');
            return;
        }

        // Cargar artistas desde Firebase
        const artistas = await loadArtistsFromFirebase();
        console.log('Artistas cargados para mostrar:', artistas.length);

        if (artistas.length === 0) {
            artistasContainer.innerHTML = '<p class="text-gray-500 text-center col-span-full">No hay artistas disponibles en este momento.</p>';
            return;
        }

        // Mostrar artistas (esperar a que todas las tarjetas estén listas)
        const tarjetas = await Promise.all(artistas.map(artista => createArtistCard(artista)));
        artistasContainer.innerHTML = tarjetas.join('');
        console.log('Artistas mostrados correctamente');
    } catch (error) {
        console.error('Error al mostrar artistas:', error);
    }
}

// Función para mostrar nuevos talentos
async function mostrarNuevosTalentos() {
    try {
    console.log('Mostrando nuevos talentos...');
        const nuevosTalentosContainer = document.getElementById('nuevos-talentos');
        if (!nuevosTalentosContainer) {
        console.error('No se encontró el contenedor de nuevos talentos');
        return;
    }

        const artistas = await loadArtistsFromFirebase();
        console.log('Artistas cargados para nuevos talentos:', artistas.length);

        // Filtrar artistas destacados
        const artistasDestacados = artistas.filter(artista => artista.esNuevoTalento);

        if (artistasDestacados.length === 0) {
            nuevosTalentosContainer.innerHTML = '';
        return;
    }

        // Mostrar artistas destacados
        nuevosTalentosContainer.innerHTML = `
            <div class="swiper-container">
                <div class="swiper-wrapper">
                    ${artistasDestacados.map(artista => `
                        <div class="swiper-slide">
                            ${createArtistCard(artista, true)}
            </div>
                    `).join('')}
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            </div>
        `;

        // Inicializar Swiper
        new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
                },
            },
        });

        console.log('Nuevos talentos mostrados correctamente');
    } catch (error) {
        console.error('Error al mostrar nuevos talentos:', error);
    }
}

// Inicialización cuando el documento está listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando página de artistas...');
    
    // Mostrar artistas y nuevos talentos
    mostrarArtistas();
    mostrarNuevosTalentos();
}); 