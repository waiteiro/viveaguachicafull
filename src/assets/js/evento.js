// Función para obtener el ID del evento de la URL
function getEventId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Función para formatear fechas
function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Variables globales para la galería
let currentGalleryIndex = 0;
let galleryItems = [];

// Función para abrir el modal de la galería
function openGalleryModal(index) {
    currentGalleryIndex = index;
    const modal = document.getElementById('gallery-modal');
    const modalContent = document.getElementById('modal-content');
    const modalCaption = document.getElementById('modal-caption');
    const item = galleryItems[currentGalleryIndex];

    if (item.tipo === 'imagen') {
        modalContent.innerHTML = `<img src="../${item.url}" alt="${item.titulo}" class="w-full h-auto max-h-[80vh] object-contain">`;
    } else if (item.tipo === 'video') {
        modalContent.innerHTML = `<iframe src="${item.url}" class="w-full aspect-video" frameborder="0" allowfullscreen></iframe>`;
    }

    modalCaption.innerHTML = `
        <h3 class="text-xl font-bold">${item.titulo}</h3>
        <p class="text-gray-300 mt-2">${item.descripcion}</p>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Función para cerrar el modal
function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Función para navegar entre imágenes
function navigateGallery(direction) {
    currentGalleryIndex = (currentGalleryIndex + direction + galleryItems.length) % galleryItems.length;
    openGalleryModal(currentGalleryIndex);
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
        }
    });

    // Cerrar modal al hacer clic fuera del contenido central
    if (galleryModal) {
        galleryModal.addEventListener('click', function(e) {
            // Si el clic es directamente en el fondo (no en los hijos)
            if (e.target === galleryModal) {
                closeGalleryModal();
            }
        });
    }
});

// Función para cargar los datos del evento
function loadEventData() {
    const eventId = getEventId();
    if (!eventId) return;

    // Buscar el evento en los datos
    let evento = null;
    if (typeof eventosData !== 'undefined' && eventosData.eventos) {
        evento = eventosData.eventos.find(e => e.id === eventId);
    }
    if (!evento) {
        if (document.getElementById('event-title'))
            document.getElementById('event-title').textContent = 'Evento no encontrado';
        return;
    }

    // Cargar datos básicos
    if (document.getElementById('event-title'))
        document.getElementById('event-title').textContent = evento.titulo;
    
    // Información básica con íconos (sin repetir en la portada)
    const infoContainer = document.createElement('div');
    infoContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6';
    
    // Fecha
    if (evento.fechaInicio) {
        const fechaElement = document.createElement('div');
        fechaElement.className = 'flex items-center space-x-2 text-gray-700';
        fechaElement.innerHTML = `
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>${formatDate(evento.fechaInicio)}</span>
        `;
        infoContainer.appendChild(fechaElement);
    }
    
    // Hora
    if (evento.hora) {
        const horaElement = document.createElement('div');
        horaElement.className = 'flex items-center space-x-2 text-gray-700';
        horaElement.innerHTML = `
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>${evento.hora}</span>
        `;
        infoContainer.appendChild(horaElement);
    }
    
    // Lugar
    if (evento.lugar) {
        const lugarElement = document.createElement('div');
        lugarElement.className = 'flex items-center space-x-2 text-gray-700';
        lugarElement.innerHTML = `
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>${evento.lugar}</span>
        `;
        infoContainer.appendChild(lugarElement);
    }
    
    // Precio (solo aquí, no en sección aparte)
    if (evento.precio) {
        const precioElement = document.createElement('div');
        precioElement.className = 'flex items-center space-x-2 text-gray-700';
        precioElement.innerHTML = `
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>${evento.precio}</span>
        `;
        infoContainer.appendChild(precioElement);
    }
    
    document.querySelector('.max-w-4xl').insertBefore(infoContainer, document.getElementById('event-description').parentElement);

    // Botón elegante para agregar a Google Calendar
    if (!document.getElementById('btn-google-calendar')) {
        const calendarBtn = document.createElement('button');
        calendarBtn.id = 'btn-google-calendar';
        calendarBtn.className = 'flex items-center gap-2 px-5 py-2 mb-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition-colors duration-200';
        calendarBtn.innerHTML = `
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z"/></svg>
            Agregar a Google Calendar
        `;
        calendarBtn.onclick = function() {
            const start = evento.fechaInicio ? new Date(evento.fechaInicio + 'T' + (evento.hora || '00:00')).toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, 15) : '';
            const end = evento.fechaFin ? new Date(evento.fechaFin + 'T' + (evento.hora || '00:00')).toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, 15) : start;
            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento.titulo)}&dates=${start}/${end}&details=${encodeURIComponent(evento.descripcion || '')}&location=${encodeURIComponent(evento.lugar || '')}`;
            window.open(url, '_blank');
        };
        // Insertar el botón antes de la descripción del evento
        const descSection = document.getElementById('event-description').parentElement;
        descSection.parentElement.insertBefore(calendarBtn, descSection);
    }

    // Eliminar sección de precios si existe
    const preciosSection = document.getElementById('event-prices');
    if (preciosSection) {
        preciosSection.parentElement.style.display = 'none';
    }

    // Imagen de portada
    if (document.getElementById('event-cover')) {
        document.getElementById('event-cover').src = '../' + evento.imagen;
        document.getElementById('event-cover').alt = evento.titulo;
    }

    // Descripción del evento
    const descriptionElement = document.getElementById('event-description');
    if (descriptionElement && evento.descripcion) {
        descriptionElement.innerHTML = `<p class="text-gray-700">${evento.descripcion}</p>`;
    }

    // Organizador
    if (evento.organizador) {
        const organizadorSection = document.createElement('section');
        organizadorSection.className = 'bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8';
        organizadorSection.innerHTML = `
            <h2 class="text-2xl font-bold mb-4 text-gray-800">Organizador</h2>
            <div class="space-y-4">
                <div class="flex items-center space-x-2 text-gray-700">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>${evento.organizador.nombre}</span>
                </div>
                <div class="flex items-center space-x-2 text-gray-700">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>${evento.organizador.contacto}</span>
                </div>
                <div class="flex items-center space-x-2 text-gray-700">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>${evento.organizador.telefono}</span>
                </div>
            </div>
        `;
        document.querySelector('.max-w-4xl').appendChild(organizadorSection);
    }

    // Público dirigido e invitación
    if (evento.publicoDirigido || evento.invitacion) {
        const publicoSection = document.createElement('section');
        publicoSection.className = 'bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8';
        publicoSection.innerHTML = `
            <h2 class="text-2xl font-bold mb-4 text-gray-800">Información Adicional</h2>
            <div class="space-y-4">
                ${evento.publicoDirigido ? `
                    <div class="flex items-center space-x-2 text-gray-700">
                        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Público dirigido: ${evento.publicoDirigido}</span>
                    </div>
                ` : ''}
                ${evento.invitacion ? `
                    <div class="flex items-start space-x-2 text-gray-700">
                        <svg class="w-5 h-5 text-indigo-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span>${evento.invitacion}</span>
                    </div>
                ` : ''}
            </div>
        `;
        document.querySelector('.max-w-4xl').appendChild(publicoSection);
    }

    // Artistas participantes (clicables)
    const artistsSection = document.getElementById('event-artists-section');
    const artistsContainer = document.getElementById('event-artists');
    if (artistsContainer && evento.artistas && evento.artistas.length > 0) {
        artistsContainer.innerHTML = evento.artistas.map(artista => `
            <a href="../artistas/perfil.html?id=${artista.id}" class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img src="../${artista.imagen}" alt="${artista.nombre}" class="w-full h-48 object-cover">
                    <div class="p-4">
                    <h3 class="font-bold text-lg text-gray-800">${artista.nombre}</h3>
                    <p class="text-sm text-gray-600">${artista.rol || artista.tipo}</p>
                </div>
            </a>
        `).join('');
    } else if (artistsSection) {
        artistsSection.style.display = 'none';
    }

    // Galería
    const gallerySection = document.getElementById('event-gallery-section');
    const galleryContainer = document.getElementById('event-gallery');
    if (galleryContainer && evento.galeria && evento.galeria.length > 0) {
        setupEventGalleryModal(evento.galeria);
    } else if (gallerySection) {
        gallerySection.style.display = 'none';
    }

    // Requisitos
    const requirementsContainer = document.getElementById('event-requirements').querySelector('.space-y-2');
    if (requirementsContainer && evento.requisitos && evento.requisitos.length > 0) {
        requirementsContainer.innerHTML = evento.requisitos.map(req => `
            <div class="flex items-start space-x-2">
                <svg class="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-gray-700">${req}</span>
            </div>
        `).join('');
    } else {
        document.getElementById('event-requirements').parentElement.style.display = 'none';
    }

    // Mapa
    const mapSection = document.getElementById('event-map-section');
    const mapContainer = document.getElementById('event-map');
    if (mapContainer) {
        let mapaHTML = '';
        if (evento.latitud && evento.longitud) {
            // Usar coordenadas
            mapaHTML = `<iframe width="100%" height="100%" style="border:0" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${evento.latitud},${evento.longitud}&output=embed"></iframe>`;
        } else if (evento.lugar) {
            // Usar dirección textual
            const direccion = encodeURIComponent(evento.lugar);
            mapaHTML = `<iframe width="100%" height="100%" style="border:0" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${direccion}&output=embed"></iframe>`;
        }
        mapContainer.innerHTML = mapaHTML;
    } else if (mapSection) {
        mapSection.style.display = 'none';
    }

    // Mostrar fecha y dirección como botones clicables
    const dateBtn = document.getElementById('event-date-btn');
    const locationBtn = document.getElementById('event-location-btn');
    if (dateBtn) {
        // Mostrar fecha formateada
        dateBtn.textContent = evento.fechaInicio ? formatDate(evento.fechaInicio) : '';
        dateBtn.onclick = function() {
            // Crear enlace para Google Calendar
            const start = evento.fechaInicio ? new Date(evento.fechaInicio + 'T' + (evento.hora || '00:00')).toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, 15) : '';
            const end = evento.fechaFin ? new Date(evento.fechaFin + 'T' + (evento.hora || '00:00')).toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, 15) : start;
            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento.titulo)}&dates=${start}/${end}&details=${encodeURIComponent(evento.descripcion || '')}&location=${encodeURIComponent(evento.lugar || '')}`;
            window.open(url, '_blank');
        };
    }
    if (locationBtn) {
        locationBtn.textContent = evento.lugar || '';
        locationBtn.onclick = function() {
            // Crear modal para el mapa
            let modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-lg p-4 max-w-lg w-full relative">
                    <button class="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold" id="close-map-modal">&times;</button>
                    <div id="modal-map" style="height:300px;"></div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('close-map-modal').onclick = () => modal.remove();
            // Inicializar Leaflet en el modal
            setTimeout(() => {
                if (typeof L !== 'undefined' && evento.latitud && evento.longitud) {
                    const map = L.map('modal-map').setView([evento.latitud, evento.longitud], 16);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(map);
                    L.marker([evento.latitud, evento.longitud]).addTo(map)
                        .bindPopup(evento.lugar || 'Ubicación del evento')
                        .openPopup();
                } else {
                    document.getElementById('modal-map').innerHTML = '<div class="text-gray-500 text-center py-12">Ubicación no disponible</div>';
                }
            }, 100);
        };
    }
}

// Cargar los datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadEventData);

// Función para obtener el enlace embebido de YouTube
function getYoutubeEmbedUrl(url) {
    if (!url) return '';
    // Si ya es embed, lo dejamos igual
    if (url.includes('youtube.com/embed/')) return url;
    // Si es un enlace normal de YouTube
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
}

// --- GALERÍA AMPLIABLE IGUAL QUE EN ARTISTAS ---
function setupEventGalleryModal(galeria) {
    const galleryContainer = document.getElementById('event-gallery');
    if (!galleryContainer || !galeria || galeria.length === 0) return;
    galleryContainer.innerHTML = galeria.map((item, idx) => {
        if (item.tipo === 'video') {
            const embedUrl = getYoutubeEmbedUrl(item.url);
            return `<div class="snap-center min-w-[300px] max-w-xs cursor-pointer group relative" data-idx="${idx}">
                <div class="aspect-w-16 aspect-h-9 w-full h-48 bg-black rounded-lg overflow-hidden">
                    <iframe src="${embedUrl}" width="400" height="225" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen onerror="this.parentNode.innerHTML='<div class=\'flex flex-col items-center justify-center h-full\'><p class=\'text-white mb-2\'>Video no disponible para inserción.</p><a href='${item.url}' target='_blank' class=\'bg-red-600 text-white px-4 py-2 rounded\'>Ver en YouTube</a></div>';"></iframe>
                </div>
                <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553 2.276A1 1 0 0120 13.118V14.88a1 1 0 01-.447.842L15 18v-8z"/></svg>
                </div>
            </div>`;
        } else {
            return `<div class="snap-center min-w-[300px] max-w-xs cursor-pointer group relative" data-idx="${idx}">
                <img src="../${item.url}" alt="${item.titulo || ''}" class="w-full h-48 object-cover rounded-lg shadow-md">
                <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553 2.276A1 1 0 0120 13.118V14.88a1 1 0 01-.447.842L15 18v-8z"/></svg>
                </div>
            </div>`;
        }
    }).join('');
    galleryContainer.querySelectorAll('[data-idx]').forEach(el => {
        el.addEventListener('click', function() {
            openEventGalleryModal(galeria, parseInt(this.getAttribute('data-idx')));
        });
    });
}

function openEventGalleryModal(items, idxInicial) {
    let idx = idxInicial;
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
    modal.innerHTML = `
        <button id="close-modal" class="absolute top-4 right-4 text-white text-3xl font-bold z-50">&times;</button>
        <button id="prev-modal" class="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl font-bold z-50">&#8592;</button>
        <button id="next-modal" class="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl font-bold z-50">&#8594;</button>
        <div class="w-full max-w-2xl flex flex-col items-center px-2">
            <div id="modal-content" class="w-full flex flex-col items-center"></div>
            <div class="mt-4 text-white text-center">
                <div id="modal-title" class="font-semibold text-lg"></div>
                <div id="modal-desc" class="text-sm mt-1"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    function renderModal(idx) {
        const item = items[idx];
        const modalContent = modal.querySelector('#modal-content');
        if (item.tipo === 'video') {
            const embedUrl = getYoutubeEmbedUrl(item.url);
            modalContent.innerHTML = `<div class="aspect-w-16 aspect-h-9 w-full max-w-[90vw] max-h-[60vh] sm:max-h-[70vh] mx-auto"><iframe src="${embedUrl}" width="880" height="495" class="w-full h-[495px] rounded-lg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen onerror="this.parentNode.innerHTML='<div class=\'flex flex-col items-center justify-center h-full\'><p class=\'text-white mb-2\'>Video no disponible para inserción.</p><a href='${item.url}' target='_blank' class=\'bg-red-600 text-white px-4 py-2 rounded\'>Ver en YouTube</a></div>';"></iframe></div>`;
        } else {
            modalContent.innerHTML = `<img src="../${item.url}" alt="${item.titulo || ''}" class="w-full max-w-[90vw] max-h-[60vh] sm:max-h-[70vh] object-contain rounded-lg mx-auto">`;
        }
        modal.querySelector('#modal-title').textContent = item.titulo || '';
        modal.querySelector('#modal-desc').textContent = item.descripcion || '';
    }

    renderModal(idx);

    modal.querySelector('#close-modal').onclick = () => modal.remove();
    modal.querySelector('#prev-modal').onclick = () => {
        idx = (idx - 1 + items.length) % items.length;
        renderModal(idx);
    };
    modal.querySelector('#next-modal').onclick = () => {
        idx = (idx + 1) % items.length;
        renderModal(idx);
    };
    // Cerrar con Escape y navegación con flechas
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.remove();
        if (e.key === 'ArrowLeft') {
            idx = (idx - 1 + items.length) % items.length;
            renderModal(idx);
        }
        if (e.key === 'ArrowRight') {
            idx = (idx + 1) % items.length;
            renderModal(idx);
        }
    });
    // Permitir cerrar haciendo clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    // Enfocar para que funcione el escape y flechas
    modal.tabIndex = -1;
    modal.focus();
} 