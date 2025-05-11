import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from './firebase.js';

// Función para obtener el slug del artista de la URL
function getArtistSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Función para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Función para obtener el enlace embebido de YouTube
function getYoutubeEmbedUrl(url) {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
}

// Función para cargar los datos del artista desde artistasData
function loadArtistData() {
    const slug = getArtistSlug();
    if (!slug) return;

    // Busca el artista en la variable artistasData
    if (typeof artistasData === 'undefined' || !artistasData.artistas) return;
    const artista = artistasData.artistas.find(a => a.id === slug);
    if (!artista) {
        if (document.getElementById('artist-name'))
            document.getElementById('artist-name').textContent = 'Artista no encontrado';
        return;
    }

    // Nombre y categoría
    if (document.getElementById('artist-name'))
        document.getElementById('artist-name').textContent = artista.nombre;
    if (document.getElementById('artist-category'))
        document.getElementById('artist-category').textContent = artista.categoria;

    // Imagen de perfil
    if (document.getElementById('profile-image')) {
        document.getElementById('profile-image').src = artista.imagen;
        document.getElementById('profile-image').alt = artista.nombre;
    }

    // Imagen de portada (usa la portada si existe, si no la de perfil)
    if (document.getElementById('cover-image')) {
        document.getElementById('cover-image').src = artista.portada || artista.imagen;
        document.getElementById('cover-image').alt = artista.nombre;
    }

    // Cargar biografía
    const bioElement = document.getElementById('artist-bio');
    if (artista.biografia) {
        // Dividir el texto en párrafos
        const paragraphs = artista.biografia.split('\n\n');
        
        // Crear HTML para cada párrafo
        bioElement.innerHTML = paragraphs.map(paragraph => {
            // Si el párrafo comienza con un título (termina en :)
            if (paragraph.trim().endsWith(':')) {
                return `<h3 class="text-xl font-semibold text-indigo-700 mb-3">${paragraph}</h3>`;
            }
            // Si el párrafo es una lista de puntos
            else if (paragraph.includes('•') || paragraph.includes('-')) {
                const items = paragraph.split(/[•-]/).filter(item => item.trim());
                return `<ul class="list-disc list-inside space-y-2 mb-4">${items.map(item => 
                    `<li class="text-gray-700">${item.trim()}</li>`
                ).join('')}</ul>`;
            }
            // Párrafo normal
            else {
                return `<p class="text-gray-700 mb-4 leading-relaxed">${paragraph}</p>`;
            }
        }).join('');
    } else {
        bioElement.innerHTML = '<p class="text-gray-500 italic">No hay biografía disponible.</p>';
    }

    // Cargar agrupaciones
    const groupsSection = document.getElementById('artist-groups-section');
    const groupsContainer = document.getElementById('artist-groups');

    if (artista.agrupaciones && artista.agrupaciones.length > 0) {
        groupsSection.classList.remove('hidden');
        groupsContainer.innerHTML = artista.agrupaciones.map(grupo =>
            `<a href="/agrupaciones/perfil.html?id=${grupo.id}" class="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-medium hover:bg-indigo-200 transition">${grupo.nombre}</a>`
        ).join('');
    } else {
        groupsSection.classList.add('hidden');
    }

    // Logros destacados
    const achievementsContainer = document.getElementById('artist-achievements');
    let achievements = artista.achievements || artista.logros || [];
    if (typeof achievements === 'string') {
        achievements = achievements.split('\n').map(a => a.trim()).filter(a => a);
    }
    if (Array.isArray(achievements) && achievements.length > 0) {
        achievementsContainer.innerHTML = achievements.map(achievement => `
            <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-gray-700">${achievement}</span>
            </div>
        `).join('');
        toggleSection('artist-achievements', true);
    } else {
        toggleSection('artist-achievements', false);
    }

    // Eventos próximos
    const upcomingEventsContainer = document.getElementById('upcoming-events');
    if (upcomingEventsContainer && artista.eventos && artista.eventos.length > 0) {
        upcomingEventsContainer.innerHTML = artista.eventos.map(evento => {
            if (evento.enlazado) {
                return `
                    <a href="/eventos/evento.html?id=${evento.id}" class="block bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow hover:bg-indigo-50">
                        <h4 class="font-medium text-gray-800">${evento.titulo}</h4>
                        <div class="flex items-center text-sm text-gray-600 mt-1">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>${new Date(evento.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                            <span class="mx-1">•</span>
                            <span>${evento.hora}</span>
                        </div>
                    </a>
                `;
            } else {
                return `
                    <div class="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <h4 class="font-medium text-gray-800">${evento.titulo}</h4>
                        <div class="flex items-center text-sm text-gray-600 mt-1">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>${new Date(evento.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                            <span class="mx-1">•</span>
                            <span>${evento.hora}</span>
                        </div>
                    </div>
                `;
            }
        }).join('');
    } else if (upcomingEventsContainer) {
        upcomingEventsContainer.innerHTML = '<p class="text-gray-500 text-sm">No hay eventos próximos.</p>';
    }

    // Galería de contenido en carrusel horizontal con modal ampliable
    const contentContainer = document.getElementById('artist-content');
    if (contentContainer) {
        let items = [];
        if (artista.galeria && artista.galeria.length > 0) {
            items = artista.galeria;
        }
        if (items.length > 0) {
            contentContainer.innerHTML = items.map((item, idx) => {
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
                        <img src="${item.url}" alt="${item.titulo || ''}" class="w-full h-48 object-cover rounded-lg shadow-md">
                        <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553 2.276A1 1 0 0120 13.118V14.88a1 1 0 01-.447.842L15 18v-8z"/></svg>
                        </div>
                    </div>`;
                }
            }).join('');

            // Modal ampliable con navegación
            contentContainer.querySelectorAll('[data-idx]').forEach(el => {
                el.addEventListener('click', function() {
                    openGalleryModal(items, parseInt(this.getAttribute('data-idx')));
                });
            });
        } else {
            contentContainer.innerHTML = '<p class="text-gray-500 text-center py-6">No hay contenido multimedia disponible.</p>';
        }
    }

    // Modal de galería ampliada con navegación
    function openGalleryModal(items, idxInicial) {
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
                modalContent.innerHTML = `<img src="${item.url}" alt="${item.titulo || ''}" class="w-full max-w-[90vw] max-h-[60vh] sm:max-h-[70vh] object-contain rounded-lg mx-auto">`;
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

    // Línea de tiempo visual de trayectoria
    const timelineSection = document.querySelector('section:has(#artist-timeline)');
    const timelineContainer = document.getElementById('artist-timeline');
    if (timelineContainer && artista.trayectoria && artista.trayectoria.length > 0) {
        timelineContainer.innerHTML = artista.trayectoria.map((item, idx) => `
            <div class="timeline-item fade-in" style="animation-delay: ${idx * 0.1}s">
                <div class="flex items-start">
                    <div class="w-20 flex-shrink-0">
                        <span class="text-indigo-600 font-bold">${item.anio}</span>
                    </div>
                    <div class="flex-1">
                        <p class="text-gray-700">${item.descripcion}</p>
                        ${item.imagen ? `<img src="${item.imagen}" alt="${item.descripcion}" class="mt-2 rounded-lg shadow-md w-full max-w-xs">` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        if (timelineSection) timelineSection.style.display = '';
    } else if (timelineSection) {
        timelineSection.style.display = 'none';
    }

    // Influencias
    const influencesSection = document.querySelector('section:has(#artist-influences)');
    const influencesContainer = document.getElementById('artist-influences');
    if (influencesContainer && artista.influencias && artista.influencias.length > 0) {
        influencesContainer.innerHTML = artista.influencias.map((influencia, idx) => `
            <div class="influencia-card fade-in" style="animation-delay: ${idx * 0.1}s">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-800">${influencia.nombre}</h3>
                    <span class="text-sm text-gray-600">${influencia.tipo}</span>
                </div>
            </div>
        `).join('');
        if (influencesSection) influencesSection.style.display = '';
    } else if (influencesSection) {
        influencesSection.style.display = 'none';
    }

    // Proyectos actuales
    const projectsSection = document.querySelector('section:has(#artist-projects)');
    const projectsContainer = document.getElementById('artist-projects');
    let projects = artista.projects || artista.proyectos || artista.currentProjects || [];
    if (typeof projects === 'object' && !Array.isArray(projects) && projects.description) {
        // Si es un solo objeto de proyecto actual
        projects = [projects];
    }
    if (Array.isArray(projects) && projects.length > 0) {
        projectsContainer.innerHTML = projects.map(project => {
            let imagesHtml = '';
            const images = project.images || project.imagenes || [];
            if (Array.isArray(images) && images.length > 0) {
                imagesHtml = `<div class='flex gap-2 mt-2'>${images.map(img => `<img src='${img}' alt='Imagen proyecto' class='w-20 h-20 object-cover rounded shadow'>`).join('')}</div>`;
            }
            return `
                <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <h4 class="font-medium text-gray-800">${project.title || project.titulo || ''}</h4>
                    <p class="text-gray-600 text-sm mt-1">${project.description || project.descripcion || ''}</p>
                    ${imagesHtml}
                    ${(project.url || project.enlace) ? `<a href="${project.url || project.enlace}" target="_blank" class="text-indigo-600 text-sm mt-2 inline-block">Ver más</a>` : ''}
                </div>
            `;
        }).join('');
        if (projectsSection) projectsSection.style.display = '';
    } else if (projectsSection) {
        projectsSection.style.display = 'none';
    }

}

document.addEventListener('DOMContentLoaded', loadArtistData);

function showError(message) {
    // Implementar manejo de errores si es necesario
    console.error(message);
}

async function cargarPerfilArtista() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        console.error('No se proporcionó ID de artista');
        return;
    }

    try {
        const ref = doc(db, 'artists', id);
        const snap = await getDoc(ref);
        
        if (!snap.exists()) {
            console.error('Artista no encontrado');
            return;
        }

        const artista = snap.data();

        // Función auxiliar para ocultar secciones vacías
        function toggleSection(sectionId, hasContent) {
            const section = document.querySelector(`section:has(#${sectionId})`);
            if (section) {
                section.style.display = hasContent ? '' : 'none';
            }
        }

        // Nombre y categoría
        document.getElementById('artist-name').textContent = artista.name || artista.nombre || 'Sin nombre';
        document.getElementById('artist-category').textContent = artista.category || artista.categoria || 'Sin categoría';

        // Imágenes
        const profileImage = document.getElementById('profile-image');
        const coverImage = document.getElementById('cover-image');
        profileImage.src = artista.imageUrl || artista.imagen || '../src/assets/images/placeholder.jpg';
        profileImage.alt = artista.name || artista.nombre || 'Imagen de perfil';
        coverImage.src = artista.coverUrl || artista.portada || artista.imageUrl || artista.imagen || '../src/assets/images/placeholder.jpg';
        coverImage.alt = `${artista.name || artista.nombre || 'Artista'} - Portada`;

        // Sobre el artista (biografía)
        const bioElement = document.getElementById('artist-bio');
        const bio = artista.bio || artista.biografia || '';
        if (bio && bio.trim() !== '') {
            bioElement.innerHTML = bio.split('\n').map(paragraph => `<p class="mb-4">${paragraph}</p>`).join('');
            toggleSection('artist-bio', true);
        } else {
            toggleSection('artist-bio', false);
        }

        // Logros
        const achievementsContainer = document.getElementById('artist-achievements');
        let achievements = artista.achievements || artista.logros || [];
        if (typeof achievements === 'string') {
            achievements = achievements.split('\n').map(a => a.trim()).filter(a => a);
        }
        if (Array.isArray(achievements) && achievements.length > 0) {
            achievementsContainer.innerHTML = achievements.map(achievement => `
                <div class="flex items-start gap-2">
                    <svg class="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span class="text-gray-700">${achievement}</span>
                </div>
            `).join('');
            toggleSection('artist-achievements', true);
        } else {
            toggleSection('artist-achievements', false);
        }

        // Redes sociales
        const socialMedia = artista.socialMedia || artista.redes_sociales || {};
        const socialLinks = document.querySelector('.flex.space-x-3');
        if (socialLinks) {
            socialLinks.style.display = (socialMedia.facebook || socialMedia.instagram || socialMedia.youtube) ? '' : 'none';
        }
        if (socialMedia.facebook) {
            document.getElementById('facebook-link').href = socialMedia.facebook;
        }
        if (socialMedia.instagram) {
            document.getElementById('instagram-link').href = socialMedia.instagram;
        }
        if (socialMedia.youtube) {
            document.getElementById('youtube-link').href = socialMedia.youtube;
        }

        // Eventos próximos
        const upcomingEventsContainer = document.getElementById('upcoming-events');
        const eventos = artista.upcomingEvents || artista.eventos_proximos || [];
        if (Array.isArray(eventos) && eventos.length > 0) {
            upcomingEventsContainer.innerHTML = eventos.map(event => `
                <div class="bg-white p-3 rounded-lg shadow-sm">
                    <h4 class="font-medium text-gray-800">${event.title || event.titulo || ''}</h4>
                    <div class="flex items-center text-sm text-gray-600 mt-1">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>${event.date ? new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : (event.fecha ? new Date(event.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '')}</span>
                        <span class="mx-1">•</span>
                        <span>${event.location || event.lugar || ''}</span>
                    </div>
                </div>
            `).join('');
            toggleSection('upcoming-events', true);
        } else {
            toggleSection('upcoming-events', false);
        }

        // Agrupaciones
        const groupsContainer = document.getElementById('artist-groups');
        const groups = artista.groups || artista.agrupaciones || [];
        if (Array.isArray(groups) && groups.length > 0) {
            groupsContainer.innerHTML = groups.map(group => `
                <a href="/src/views/agrupaciones/perfil.html?id=${group.id || ''}" 
                   class="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-medium hover:bg-indigo-200 transition">
                    ${group.name || group.nombre || ''}
                </a>
            `).join('');
            toggleSection('artist-groups', true);
        } else {
            toggleSection('artist-groups', false);
        }

        // Trayectoria
        const timelineContainer = document.getElementById('artist-timeline');
        const timeline = artista.timeline || artista.trayectoria || artista.biography || [];
        if (Array.isArray(timeline) && timeline.length > 0) {
            timelineContainer.innerHTML = timeline.map(item => `
                <div class="flex items-start gap-4 mb-6">
                    <div class="flex-shrink-0 w-24">
                        <span class="text-indigo-600 font-bold">${item.year || item.anio || ''}</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800">${item.title || ''}</h4>
                        <p class="text-gray-600 text-sm mt-1">${item.description || item.descripcion || ''}</p>
                    </div>
                </div>
            `).join('');
            toggleSection('artist-timeline', true);
        } else if (typeof timeline === 'string' && timeline.trim() !== '') {
            timelineContainer.innerHTML = `<p class='text-gray-700'>${timeline}</p>`;
            toggleSection('artist-timeline', true);
        } else {
            toggleSection('artist-timeline', false);
        }

        // Influencias
        const influencesContainer = document.getElementById('artist-influences');
        const influences = artista.influences || artista.influencias || [];
        if (Array.isArray(influences) && influences.length > 0) {
            influencesContainer.innerHTML = influences.map(influence => {
                if (typeof influence === 'string') {
                    return `<div class="bg-gray-50 p-4 rounded-lg"><h4 class="font-medium text-gray-800">${influence}</h4></div>`;
                } else {
                    return `<div class="bg-gray-50 p-4 rounded-lg"><h4 class="font-medium text-gray-800">${influence.name || influence.nombre || ''}</h4><p class="text-gray-600 text-sm mt-1">${influence.description || influence.descripcion || ''}</p></div>`;
                }
            }).join('');
            toggleSection('artist-influences', true);
        } else {
            toggleSection('artist-influences', false);
        }

        // Proyectos actuales
        const projectsContainer = document.getElementById('artist-projects');
        let projects = artista.projects || artista.proyectos || artista.currentProjects || [];
        if (typeof projects === 'object' && !Array.isArray(projects) && projects.description) {
            // Si es un solo objeto de proyecto actual
            projects = [projects];
        }
        if (Array.isArray(projects) && projects.length > 0) {
            projectsContainer.innerHTML = projects.map(project => {
                let imagesHtml = '';
                const images = project.images || project.imagenes || [];
                if (Array.isArray(images) && images.length > 0) {
                    imagesHtml = `<div class='flex gap-2 mt-2'>${images.map(img => `<img src='${img}' alt='Imagen proyecto' class='w-20 h-20 object-cover rounded shadow'>`).join('')}</div>`;
                }
                return `
                    <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
                        <h4 class="font-medium text-gray-800">${project.title || project.titulo || ''}</h4>
                        <p class="text-gray-600 text-sm mt-1">${project.description || project.descripcion || ''}</p>
                        ${imagesHtml}
                        ${(project.url || project.enlace) ? `<a href="${project.url || project.enlace}" target="_blank" class="text-indigo-600 text-sm mt-2 inline-block">Ver más</a>` : ''}
                    </div>
                `;
            }).join('');
            toggleSection('artist-projects', true);
        } else {
            toggleSection('artist-projects', false);
        }

        // Galería/contenido
        const galleryContainer = document.getElementById('artist-content');
        const gallery = artista.gallery || artista.contenido || [];
        if (Array.isArray(gallery) && gallery.length > 0) {
            galleryContainer.innerHTML = gallery.map(item => {
                if (item.type === 'video' || item.tipo === 'video') {
                    return `
                        <div class="flex-shrink-0 w-80 h-48 bg-gray-100 rounded-lg overflow-hidden">
                            <iframe src="${item.url}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
                        </div>
                    `;
                } else {
                    return `
                        <div class="flex-shrink-0 w-80 h-48 bg-gray-100 rounded-lg overflow-hidden">
                            <img src="${item.url}" alt="${item.title || item.titulo || 'Imagen de galería'}" 
                                 class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                 onclick="ampliarImagen(this.src)">
                        </div>
                    `;
                }
            }).join('');
            toggleSection('artist-content', true);
        } else {
            toggleSection('artist-content', false);
        }

    } catch (error) {
        console.error('Error al cargar el perfil del artista:', error);
    }
}

// Función para ampliar imágenes en la galería
function ampliarImagen(src) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="relative max-w-4xl max-h-[90vh]">
            <img src="${src}" alt="Imagen ampliada" class="max-w-full max-h-[90vh] object-contain">
            <button onclick="this.parentElement.parentElement.remove()" 
                    class="absolute top-4 right-4 text-white hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', cargarPerfilArtista);