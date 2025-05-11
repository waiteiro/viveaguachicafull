// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDqXxaxQrqABTf7GkzW7GkzW7GkzW7GkzW",
    authDomain: "vive-aguachica.firebaseapp.com",
    projectId: "vive-aguachica",
    storageBucket: "vive-aguachica.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456789"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables para la paginación
let agrupacionesFiltradas = [];
const agrupacionesPorPagina = 6;
let paginaActual = 1;

// Variables globales para la galería
let currentGalleryIndex = 0;
let galleryItems = [];

// Función para cargar agrupaciones desde Firebase
async function cargarAgrupaciones() {
    try {
        const agrupacionesRef = collection(db, 'agrupaciones');
        const querySnapshot = await getDocs(agrupacionesRef);
        
        agrupacionesFiltradas = [];
        querySnapshot.forEach((doc) => {
            agrupacionesFiltradas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        mostrarAgrupaciones();
        mostrarAgrupacionesDestacadas();
    } catch (error) {
        console.error('Error al cargar agrupaciones:', error);
    }
}

// Función para crear una tarjeta de agrupación
function crearTarjetaAgrupacion(agrupacion) {
    return `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div class="relative">
                <img src="${agrupacion.imagen || 'https://via.placeholder.com/300x200?text=Sin+imagen'}" 
                     class="w-full h-48 object-cover" 
                     alt="${agrupacion.nombre}">
                ${agrupacion.esDestacada ? `
                    <div class="absolute top-4 right-4">
                        <span class="bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full">
                            Destacada
                        </span>
                    </div>
                ` : ''}
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${agrupacion.nombre}</h3>
                <p class="text-gray-600 mb-4 line-clamp-2">${agrupacion.descripcion || 'Sin descripción disponible'}</p>
                <div class="flex items-center justify-between">
                    <span class="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                        ${agrupacion.categoria}
                    </span>
                    <a href="agrupaciones/perfil-agrupacion.html?id=${agrupacion.id}" 
                       class="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2">
                        Ver más
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Función para mostrar agrupaciones con paginación
function mostrarAgrupaciones() {
    const agrupacionesContainer = document.getElementById('groupsContainer');
    if (!agrupacionesContainer) {
        console.error('No se encontró el contenedor de agrupaciones');
        return;
    }
    
    const inicio = 0;
    const fin = paginaActual * agrupacionesPorPagina;
    const agrupacionesAMostrar = agrupacionesFiltradas.slice(inicio, fin);
    
    // Limpiar el contenedor
    agrupacionesContainer.innerHTML = '';
    
    if (agrupacionesAMostrar.length === 0) {
        agrupacionesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No hay agrupaciones disponibles en este momento.</p>
            </div>
        `;
        return;
    }
    
    // Agregar agrupaciones
    agrupacionesAMostrar.forEach(agrupacion => {
        agrupacionesContainer.innerHTML += crearTarjetaAgrupacion(agrupacion);
    });
    
    // Mostrar u ocultar el botón "Cargar más"
    const cargarMasBtn = document.getElementById('cargar-mas');
    if (cargarMasBtn) {
        if (agrupacionesFiltradas.length > agrupacionesPorPagina && agrupacionesFiltradas.length > fin) {
            cargarMasBtn.classList.remove('d-none');
        } else {
            cargarMasBtn.classList.add('d-none');
        }
    }
}

// Función para mostrar agrupaciones destacadas
function mostrarAgrupacionesDestacadas() {
    const destacadasContainer = document.getElementById('agrupaciones-destacadas');
    if (!destacadasContainer) {
        console.error('No se encontró el contenedor de agrupaciones destacadas');
        return;
    }

    // Filtrar agrupaciones destacadas
    const agrupacionesDestacadas = agrupacionesFiltradas.filter(agrupacion => agrupacion.esDestacada);

    // Limpiar el contenedor
    destacadasContainer.innerHTML = '';

    if (agrupacionesDestacadas.length === 0) {
        destacadasContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No hay agrupaciones destacadas en este momento.</p>
            </div>
        `;
        return;
    }

    // Agregar agrupaciones destacadas
    agrupacionesDestacadas.forEach(agrupacion => {
        destacadasContainer.innerHTML += crearTarjetaAgrupacion(agrupacion);
    });
}

// Función para cargar más agrupaciones
function cargarMasAgrupaciones() {
    paginaActual++;
    mostrarAgrupaciones();
}

// Función para mostrar eventos de una agrupación en un modal
window.mostrarEventosAgrupacionModal = function(agrupacionId) {
    const agrupacion = agrupacionesFiltradas.find(a => a.id === agrupacionId);
    if (!agrupacion) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">Eventos de ${agrupacion.nombre}</h3>
                <button onclick="cerrarModal(this)" 
                        class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-3" id="eventos-agrupacion">
                <div class="text-center py-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p class="text-gray-500 mt-2">Cargando eventos...</p>
                </div>
            </div>
        </div>
    `;

    // Agregar evento para cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);

    // Cargar eventos de la agrupación
    cargarEventosAgrupacion(agrupacionId);
}

// Función para cargar los eventos de una agrupación
async function cargarEventosAgrupacion(agrupacionId) {
    try {
        const eventosContainer = document.getElementById('eventos-agrupacion');
        if (!eventosContainer) return;

        const eventosRef = collection(db, 'events');
        const q = query(eventosRef, where('groups', 'array-contains', agrupacionId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            eventosContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500">No hay eventos registrados para esta agrupación.</p>
                </div>
            `;
            return;
        }

        eventosContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const evento = doc.data();
            const fecha = evento.fechaInicio && evento.fechaInicio.toDate ? 
                evento.fechaInicio.toDate().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }) : '';
            
            const div = document.createElement('a');
            div.href = `/src/views/eventos/evento.html?id=${doc.id}`;
            div.className = 'flex items-center p-3 hover:bg-gray-100 rounded-lg transition';
            div.innerHTML = `
                <div class="flex-1">
                    <h4 class="font-medium">${evento.title}</h4>
                    <div class="text-sm text-gray-500">
                        <span>${fecha} ${evento.time ? `a las ${evento.time}` : ''}</span>
                    </div>
                </div>
                <i class="fas fa-chevron-right text-gray-400"></i>
            `;
            eventosContainer.appendChild(div);
        });
    } catch (error) {
        console.error('Error al cargar eventos de la agrupación:', error);
        const eventosContainer = document.getElementById('eventos-agrupacion');
        if (eventosContainer) {
            eventosContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-red-500">Error al cargar los eventos. Por favor, intenta más tarde.</p>
                </div>
            `;
        }
    }
}

// Función para formatear la fecha de los eventos
window.formatearFecha = function(fecha, hora) {
    const fechaObj = new Date(fecha);
    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return `${fechaObj.toLocaleDateString('es-ES', opciones)} a las ${hora}`;
}

// Después de mostrar agrupaciones, asignar el evento a los botones
function asignarEventosBotonesAgrupacion() {
    document.querySelectorAll('.btn-eventos-agrupacion').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-agrupacion-id');
            mostrarEventosAgrupacionModal(id);
        });
    });
}

// Inicialización cuando el documento está listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando página de agrupaciones...');
    
    // Verificar si estamos en la página de perfil o en la lista de agrupaciones
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        // Estamos en la página de perfil
        cargarDatosAgrupacion(id);
    } else {
        // Estamos en la página de lista de agrupaciones
        cargarAgrupaciones();
        
        // Configurar botón de cargar más
        const cargarMasBtn = document.getElementById('cargar-mas');
        if (cargarMasBtn) {
            cargarMasBtn.addEventListener('click', cargarMasAgrupaciones);
        }
    }
});

// Función para abrir el modal de la galería
function openGalleryModal(index) {
    currentGalleryIndex = index;
    const modal = document.getElementById('gallery-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalImageContainer = document.getElementById('modal-image-container');
    const item = galleryItems[currentGalleryIndex];

    if (item.tipo === 'video') {
        const embedUrl = getYoutubeEmbedUrl(item.url);
        modalImageContainer.innerHTML = `<iframe src="${embedUrl}" class="w-full h-full rounded-lg object-cover aspect-video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    } else {
        modalImageContainer.innerHTML = `<img src="${item.url}" alt="${item.titulo || ''}" class="w-full h-full object-contain rounded-lg">`;
    }

    modalTitle.textContent = item.titulo || '';
    modalDesc.textContent = item.descripcion || '';

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Función para cerrar el modal de la galería
function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    const modalImageContainer = document.getElementById('modal-image-container');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    // Limpiar el contenido del contenedor para pausar el video
    if (modalImageContainer) {
        modalImageContainer.innerHTML = '';
    }
}

// Función para navegar en la galería
function navigateGallery(direction) {
    currentGalleryIndex = (currentGalleryIndex + direction + galleryItems.length) % galleryItems.length;
    openGalleryModal(currentGalleryIndex);
}

// Función para obtener la URL de embed de YouTube
function getYoutubeEmbedUrl(url) {
    // Patrones comunes de URLs de YouTube
    const patterns = [
        // Formato: https://www.youtube.com/watch?v=VIDEO_ID
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^#&?]*).*/,
        // Formato: https://youtu.be/VIDEO_ID
        /youtu\.be\/([^#&?]*)/,
        // Formato: https://www.youtube.com/embed/VIDEO_ID
        /youtube\.com\/embed\/([^#&?]*)/
    ];

    // Intentar cada patrón
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
    }

    // Si no se encuentra un patrón válido, devolver la URL original
    console.warn('URL de YouTube no válida:', url);
    return url;
}

// Event listeners para la galería
document.addEventListener('DOMContentLoaded', function() {
    const closeButton = document.getElementById('close-gallery');
    const prevButton = document.getElementById('prev-image');
    const nextButton = document.getElementById('next-image');
    const galleryModal = document.getElementById('gallery-modal');

    if (closeButton) {
        closeButton.addEventListener('click', closeGalleryModal);
    }
    if (prevButton) {
        prevButton.addEventListener('click', () => navigateGallery(-1));
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => navigateGallery(1));
    }

    // Cerrar modal con la tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeGalleryModal();
        } else if (e.key === 'ArrowLeft') {
            navigateGallery(-1);
        } else if (e.key === 'ArrowRight') {
            navigateGallery(1);
        }
    });

    // Cerrar modal al hacer clic fuera del contenido central
    if (galleryModal) {
        galleryModal.addEventListener('click', function(e) {
            if (e.target === galleryModal) {
                closeGalleryModal();
            }
        });
    }
});

// Función para cargar los datos de una agrupación específica
async function cargarDatosAgrupacion(id) {
    try {
        const agrupacionDoc = await getDoc(doc(db, 'agrupaciones', id));
        if (agrupacionDoc.exists()) {
            const agrupacion = agrupacionDoc.data();
            
            // Actualizar el título y la descripción
            document.getElementById('groupName').textContent = agrupacion.nombre;
            document.getElementById('groupDescription').textContent = agrupacion.descripcion;
            
            // Actualizar la imagen de portada
            const heroSection = document.getElementById('heroSection');
            if (heroSection && agrupacion.portada) {
                heroSection.style.backgroundImage = `url(${agrupacion.portada})`;
            }
            
            // Actualizar la galería
            const galleryContainer = document.getElementById('galleryContainer');
            if (galleryContainer && agrupacion.galeria) {
                galleryContainer.innerHTML = agrupacion.galeria.map(imagen => `
                    <div class="col-md-4 mb-4">
                        <img src="${imagen}" class="img-fluid rounded" alt="Imagen de ${agrupacion.nombre}">
                    </div>
                `).join('');
            }
            
            // Actualizar información adicional
            const additionalInfo = document.getElementById('additionalInfo');
            if (additionalInfo) {
                additionalInfo.innerHTML = `
                    ${agrupacion.biografia ? `
                        <div class="mb-4">
                            <h4>Biografía</h4>
                            <p>${agrupacion.biografia}</p>
                        </div>
                    ` : ''}
                    
                    ${agrupacion.anioFundacion ? `
                        <div class="mb-4">
                            <h4>Año de Fundación</h4>
                            <p>${agrupacion.anioFundacion}</p>
                        </div>
                    ` : ''}
                    
                    ${agrupacion.email || agrupacion.telefono ? `
                        <div class="mb-4">
                            <h4>Contacto</h4>
                            ${agrupacion.email ? `<p>Email: ${agrupacion.email}</p>` : ''}
                            ${agrupacion.telefono ? `<p>Teléfono: ${agrupacion.telefono}</p>` : ''}
                        </div>
                    ` : ''}
                    
                    ${agrupacion.logros && agrupacion.logros.length > 0 ? `
                        <div class="mb-4">
                            <h4>Logros</h4>
                            <ul>
                                ${agrupacion.logros.map(logro => `<li>${logro}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                `;
            }
            
            // Actualizar redes sociales
            const socialLinks = document.getElementById('socialLinks');
            if (socialLinks && agrupacion.redes) {
                socialLinks.innerHTML = `
                    ${agrupacion.redes.facebook ? `
                        <a href="${agrupacion.redes.facebook}" target="_blank" class="btn btn-outline-light me-2">
                            <i class="fab fa-facebook"></i>
                        </a>
                    ` : ''}
                    
                    ${agrupacion.redes.instagram ? `
                        <a href="${agrupacion.redes.instagram}" target="_blank" class="btn btn-outline-light me-2">
                            <i class="fab fa-instagram"></i>
                        </a>
                    ` : ''}
                    
                    ${agrupacion.redes.youtube ? `
                        <a href="${agrupacion.redes.youtube}" target="_blank" class="btn btn-outline-light">
                            <i class="fab fa-youtube"></i>
                        </a>
                    ` : ''}
                `;
            }
        }
    } catch (error) {
        console.error('Error al cargar los datos de la agrupación:', error);
    }
} 