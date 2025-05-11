import { collection, getDocs, query, orderBy, where, limit, startAfter, doc, getDoc, addDoc, deleteDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db, auth } from './firebase.js';
import './buscador.js';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// Lista global de categorías válidas
const categoriasValidas = [
    "Cultura",
    "Deporte",
    "Religión",
    "Educación",
    "Arte",
    "Gastronomía",
    "Música",
    "Salud",
    "Entretenimiento",
    "Moda",
    "Infantil",
    "Político",
    "Mascotas",
    "Ambiental",
    "Tradición",
    "Social",
    "Alternativos",
    "Privados",
    "Otros"
];

// Variables globales
let filteredEvents = [];
let lastVisibleEvent = null;
const eventsPerPage = 8;
let currentCategoryFilter = 'todos';
let currentTimeFilter = 'todos';
let currentView = 'lista';
let calendarInstance = null;
let mapInstance = null;

// ========   CONTADOR REGRESIVO PARA EVENTOS < 24h   =========
let __vaCountdownInterval = null;
function initCountdowns() {
    if (__vaCountdownInterval) {
        clearInterval(__vaCountdownInterval);
        __vaCountdownInterval = null;
    }
    const els = document.querySelectorAll('.va-countdown[data-start]');
    if (els.length === 0) return;
    function update() {
        const now = Date.now();
        els.forEach(el => {
            const start = parseInt(el.dataset.start);
            const diff = start - now;
            if (diff <= 0) {
                el.textContent = '¡Inicia!';
                el.classList.remove('bg-indigo-600');
                el.classList.add('bg-green-600');
                return;
            }
            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            let txt = '';
            if (days > 0) {
                txt = `Comienza en: ${days} día${days > 1 ? 's' : ''} ${hours}h ${mins}m`;
            } else {
                txt = `Comienza en: ${hours}h ${mins}m`;
            }
            el.textContent = txt;
        });
    }
    update();
    __vaCountdownInterval = setInterval(update, 1000);
}

// ========   MINI SLIDER EN TARJETAS   =========
function initMiniSliders() {
    document.querySelectorAll('.va-slider-btn').forEach(btn => {
        btn.onclick = function(e) {
            const eventId = this.dataset.event;
            const imgEl = document.getElementById(`slider-${eventId}`);
            if (!imgEl) return;
            const images = imgEl.dataset.images ? JSON.parse(imgEl.dataset.images) : [];
            if (images.length <= 1) return;
            let idx = parseInt(imgEl.dataset.idx || '0');
            if (this.dataset.dir === 'prev') {
                idx = (idx - 1 + images.length) % images.length;
            } else {
                idx = (idx + 1) % images.length;
            }
            imgEl.dataset.idx = idx;
            imgEl.src = images[idx];
        };
    });
}

// Función para cargar eventos desde Firebase
async function loadEventsFromFirebase() {
    try {
        console.log('Iniciando carga de eventos desde Firebase...');
        const eventsRef = collection(db, 'events');
        console.log('Referencia a la colección creada:', eventsRef);
        
        // Aplicar filtros si existen
        if (currentCategoryFilter !== 'todos') {
            console.log('Aplicando filtro de categoría:', currentCategoryFilter);
            
            // Hacer una sola consulta que busque en ambos campos
            const q = query(
                eventsRef,
                where('category', '==', currentCategoryFilter)
            );
            
            console.log('Ejecutando consulta de categoría...');
            const snapshot = await getDocs(q);
            console.log('Resultados de la consulta:', snapshot.size);
            
            // Convertir los resultados a array
            let events = [];
            snapshot.forEach((doc) => {
                const event = { id: doc.id, ...doc.data() };
                console.log('Evento encontrado:', event);
                events.push(event);
            });
            
            console.log('Total de eventos encontrados:', events.length);
            
            // Filtrar por fecha si es necesario
            if (currentTimeFilter !== 'todos') {
                const today = new Date();
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                switch (currentTimeFilter) {
                    case 'hoy':
                        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
                        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
                        events = events.filter(event => {
                            const eventDate = event.fechaInicio.toDate();
                            return eventDate >= startOfDay && eventDate <= endOfDay;
                        });
                        console.log('Eventos filtrados por hoy:', events.length);
                        break;
                    case 'finde':
                        const { start: weekendStart, end: weekendEnd } = getWeekendRange(today);
                        events = events.filter(event => {
                            const eventDate = event.fechaInicio.toDate();
                            return eventDate >= weekendStart && eventDate <= weekendEnd;
                        });
                        console.log('Eventos filtrados por fin de semana:', events.length);
                        break;
                    case 'mes':
                        events = events.filter(event => {
                            const eventDate = event.fechaInicio.toDate();
                            return eventDate >= today && eventDate <= monthEnd;
                        });
                        console.log('Eventos filtrados por mes:', events.length);
                        break;
                }
            } else {
                // Filtrar eventos que aún están activos o por venir (incluye multi-día en curso)
                events = events.filter(isEventActivoOProximo);
                console.log('Eventos filtrados activos/próximos:', events.length);
            }
            
            // Ordenar por fecha
            events.sort((a, b) => {
                const dateA = a.fechaInicio.toDate();
                const dateB = b.fechaInicio.toDate();
                return dateA - dateB;
            });
            
            // Aplicar paginación normal (no se usa lastVisibleEvent en filtros por categoría)
            const paginatedEvents = events.slice(0, eventsPerPage);
            
            if (paginatedEvents.length > 0) {
                lastVisibleEvent = paginatedEvents[paginatedEvents.length - 1];
            }
            
            console.log('Total de eventos paginados:', paginatedEvents.length);
            return paginatedEvents;
        } else {
            // Si no hay filtro de categoría, continuar con la consulta normal
            let q = query(eventsRef, orderBy('fechaInicio', 'asc'));
            
            if (currentTimeFilter !== 'todos') {
                const today = new Date();
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                switch (currentTimeFilter) {
                    case 'hoy':
                        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
                        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
                        q = query(q, where('fechaInicio', '>=', startOfDay), where('fechaInicio', '<=', endOfDay));
                        console.log('Filtro de tiempo aplicado: hoy');
                        break;
                    case 'finde':
                        const { start: weekendStart, end: weekendEnd } = getWeekendRange(today);
                        q = query(q, where('fechaInicio', '>=', weekendStart), where('fechaInicio', '<=', weekendEnd));
                        console.log('Filtro de tiempo aplicado: fin de semana');
                        break;
                    case 'mes':
                        q = query(q, where('fechaInicio', '>=', today), where('fechaInicio', '<=', monthEnd));
                        console.log('Filtro de tiempo aplicado: mes');
                        break;
                }
            } else {
                // Si no hay filtro de tiempo, no podemos filtrar correctamente en Firestore para multi-día. Recuperamos próximos 60 días y filtramos luego.
                const today = new Date();
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 60);
                q = query(q, where('fechaInicio', '>=', new Date(today.getFullYear(), today.getMonth()-1, today.getDate())));
            }

            // Aplicar paginación: traer un bloque más grande para compensar filtrado posterior
            const batchSize = eventsPerPage * 5; // 40 si eventsPerPage=8
            if (lastVisibleEvent) {
                q = query(q, startAfter(lastVisibleEvent), limit(batchSize));
                console.log('Paginación aplicada (batch grande)');
            } else {
                q = query(q, limit(batchSize));
                console.log('Paginación inicial (batch grande)');
            }

            console.log('Ejecutando query...');
            const querySnapshot = await getDocs(q);
            console.log('Query ejecutada, número de documentos:', querySnapshot.size);
            
            let events = [];
            querySnapshot.forEach((doc) => {
                const event = { id: doc.id, ...doc.data() };
                console.log('Evento cargado:', event);
                events.push(event);
            });

            if (querySnapshot.docs.length > 0) {
                lastVisibleEvent = querySnapshot.docs[querySnapshot.docs.length - 1];
            }

            events = events.filter(isEventActivoOProximo);
            console.log('Total de eventos cargados tras filtrar activos/próximos:', events.length);

            const visibleEvents = events.slice(0, eventsPerPage);
            if (visibleEvents.length > 0) {
                // Buscar en querySnapshot el doc que corresponde al último visible para usar en paginación
                const lastVisible = querySnapshot.docs.find(d => d.id === visibleEvents[visibleEvents.length - 1].id);
                if (lastVisible) lastVisibleEvent = lastVisible;
            }

            return visibleEvents;
        }
    } catch (error) {
        console.error('Error detallado al cargar eventos:', error);
        return [];
    }
}

// Función para formatear fecha
function formatDate(date) {
    if (!date) return '';
    const dateObj = date.toDate();
    return dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para verificar si un evento ha concluido
function eventoConcluido(fecha) {
    const ahora = new Date();
    const fechaEvento = new Date(fecha);
    return fechaEvento < ahora;
}

// Función para verificar si un evento está activo en una fecha específica
function eventoActivoEnFecha(fechaInicio, fechaFin, fechaEspecifica) {
    const fecha = new Date(fechaEspecifica);
    const inicio = new Date(fechaInicio);
    const fin = fechaFin ? new Date(fechaFin) : null;
    
    if (fin) {
        return fecha >= inicio && fecha <= fin;
    }
    return fecha.toDateString() === inicio.toDateString();
}

// =================== Helpers de tiempo / visibilidad ===================

function getTimestampDate(value) {
    if (!value) return null;
    if (value.toDate) return value.toDate();
    return new Date(value);
}

// Devuelve la fecha/hora "real" de finalización del evento
function getEventoDefinitiveEnd(event) {
    const start = getTimestampDate(event.fechaInicio);
    if (!start) return null;

    let base = start;
    if (event.endDate) {
        const endDateObj = getTimestampDate(event.endDate);
        if (endDateObj) base = endDateObj;
    }

    // Clonar para no mutar
    const definitive = new Date(base.getTime());

    if (event.endTime) {
        const [h, m] = event.endTime.split(':');
        definitive.setHours(parseInt(h), parseInt(m), 59, 999);
    } else {
        // Si no hay hora de fin, consideramos fin del día
        definitive.setHours(23, 59, 59, 999);
    }
    return definitive;
}

// Determina si el evento ya se considera finalizado (para mostrar etiqueta)
function isEventFinalizado(event) {
    const definitiveEnd = getEventoDefinitiveEnd(event);
    if (!definitiveEnd) return false;
    return new Date() > definitiveEnd;
}

// Determina si debemos ocultar el evento (solo se oculta al día siguiente de haber finalizado)
function shouldShowEvent(event) {
    const definitiveEnd = getEventoDefinitiveEnd(event);
    if (!definitiveEnd) return true; // si no podemos calcular, mostrar

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Mostrar si el final definitivo es hoy o en el futuro
    return definitiveEnd >= todayStart;
}

// Alias para filtros
function isEventActivoOProximo(event) {
    return shouldShowEvent(event);
}

// Determina si el evento está ocurriendo en este momento
function isEventOcurriendo(event) {
    const now = new Date();

    const startDate = getTimestampDate(event.fechaInicio);
    if (!startDate) return false;

    const endDate = event.endDate ? getTimestampDate(event.endDate) : startDate;

    // Normalizar fechas a medianoche para comparación de día
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Chequear que hoy esté dentro del rango de días del evento
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    if (dayStart < startDay || dayStart > endDay) return false;

    // Definir rango horario para HOY
    const startTimeParts = (event.time || '00:00').split(':');
    const endTimeParts = (event.endTime || '23:59').split(':');

    const todayStartDateTime = new Date(dayStart.getTime());
    todayStartDateTime.setHours(parseInt(startTimeParts[0]), parseInt(startTimeParts[1]), 0, 0);

    const todayEndDateTime = new Date(dayStart.getTime());
    todayEndDateTime.setHours(parseInt(endTimeParts[0]), parseInt(endTimeParts[1]), 59, 999);

    return now >= todayStartDateTime && now <= todayEndDateTime;
}

// === FAVORITOS Y PUNTUACIÓN ===

// Utilidad para obtener favoritos del usuario actual
async function getUserFavorites(userId) {
    const favsRef = collection(db, 'favorites');
    const q = query(favsRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data().eventId);
}

// Utilidad para saber si un evento es favorito
async function isEventFavorite(userId, eventId) {
    const favsRef = collection(db, 'favorites');
    const q = query(favsRef, where('userId', '==', userId), where('eventId', '==', eventId));
    const snap = await getDocs(q);
    return !snap.empty;
}

// Agregar favorito
async function addFavorite(userId, eventId) {
    const favsRef = collection(db, 'favorites');
    await addDoc(favsRef, { userId, eventId, createdAt: new Date() });
}
// Quitar favorito
async function removeFavorite(userId, eventId) {
    const favsRef = collection(db, 'favorites');
    const q = query(favsRef, where('userId', '==', userId), where('eventId', '==', eventId));
    const snap = await getDocs(q);
    snap.forEach(async d => await deleteDoc(doc(db, 'favorites', d.id)));
}

// Obtener promedio de estrellas y cantidad de votos
async function getEventRating(eventId) {
    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('eventId', '==', eventId));
    const snap = await getDocs(q);
    if (snap.empty) return { avg: 0, count: 0 };
    let sum = 0;
    snap.forEach(d => sum += d.data().score);
    return { avg: sum / snap.size, count: snap.size };
}

// Obtener rating propio
async function getUserRating(userId, eventId) {
    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('userId', '==', userId), where('eventId', '==', eventId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data().score;
}

// Guardar/actualizar rating
async function setUserRating(userId, eventId, score) {
    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('userId', '==', userId), where('eventId', '==', eventId));
    const snap = await getDocs(q);
    if (snap.empty) {
        await addDoc(ratingsRef, { userId, eventId, score, ratedAt: new Date() });
    } else {
        await setDoc(doc(db, 'ratings', snap.docs[0].id), { userId, eventId, score, ratedAt: new Date() });
    }
}

// Función para crear una tarjeta de evento
function createEventCard(event) {
    // Formatea la fecha de inicio
    const formattedDate = event.fechaInicio && event.fechaInicio.toDate ? event.fechaInicio.toDate().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
    // Formatea la fecha de fin si existe y es diferente a la de inicio
    let formattedDateRange = formattedDate;
    if (event.endDate && event.endDate.toDate && event.fechaInicio && event.fechaInicio.toDate) {
        const endDateObj = event.endDate.toDate();
        const startDateObj = event.fechaInicio.toDate();
        // Solo mostrar el rango si las fechas son diferentes
        if (endDateObj.toDateString() !== startDateObj.toDateString()) {
            const formattedEndDate = endDateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            formattedDateRange = `${formattedDate} a ${formattedEndDate}`;
        }
    }
    const eventoFinalizado = isEventFinalizado(event);
    const eventoOcurriendo = !eventoFinalizado && isEventOcurriendo(event);
    const mainImageFallback = event.imageUrl && event.imageUrl !== '' ? event.imageUrl : '../src/assets/images/placeholder.jpg';
    const title = event.title || 'Sin título';
    const description = event.description || '';
    const category = event.category || event.categoria || 'Sin categoría';
    const location = event.location || 'Sin ubicación'; // Usado si no hay siteDetails
    const siteDetails = event.siteDetails; // siteDetails será adjuntado en displayEvents/loadMoreEvents
    const tags = event.tags && event.tags.length ? event.tags : [];
    const time = event.time || '';
    // Compatibilidad para ORGANIZA
    let organizer = '';
    if (event.organizer && typeof event.organizer === 'object' && event.organizer.nombre) {
        organizer = event.organizer.nombre;
    } else if (typeof event.organizer === 'string') {
        organizer = event.organizer;
    } else if (event.organizador) {
        organizer = event.organizador;
    }
    // Compatibilidad para PATROCINA
    let patrocinador = '';
    if (event.patrocina) {
        patrocinador = event.patrocina;
    } else if (event.patrocinador) {
        patrocinador = event.patrocinador;
    } else if (event.sponsor && typeof event.sponsor === 'string') {
        patrocinador = event.sponsor;
    } else if (event.sponsor && typeof event.sponsor === 'object' && event.sponsor.nombre) {
        patrocinador = event.sponsor.nombre;
    }
    const artists = event.artists && event.artists.length ? event.artists : [];
    const groups = event.groups && event.groups.length ? event.groups : [];
    const totalParticipants = artists.length + groups.length;
    // Compatibilidad: buscar redes sociales en event.socialMedia o directamente en el evento
    const social = event.socialMedia || {
        facebook: event.facebook || '',
        instagram: event.instagram || '',
        youtube: event.youtube || ''
    };

    let locationDisplayHTML = '';
    if (siteDetails && siteDetails.name && siteDetails.slug) {
        // URL actualizada según la indicación del usuario
        const sitePageURL = `/src/views/sitio.html?slug=${siteDetails.slug}`;
        locationDisplayHTML = `<a href="${sitePageURL}" class="text-indigo-600 hover:underline hover:text-indigo-800 transition-colors duration-200 line-clamp-1" title="Ir a ${siteDetails.name}">${siteDetails.name}</a>`;
    } else {
        locationDisplayHTML = `<span class="line-clamp-1" title="${location}">${location}</span>`;
    }
    
    // Preparar datos para posible countdown
    let countdownHTML = '';
    if (!eventoOcurriendo && !eventoFinalizado && event.fechaInicio && event.fechaInicio.toDate) {
        const startDate = event.fechaInicio.toDate();
        if (event.time) {
            const [hh,mm] = event.time.split(':');
            startDate.setHours(parseInt(hh), parseInt(mm), 0, 0);
        }
        const diff = startDate.getTime() - Date.now();
        if (diff > 0 && diff <= 86400000) {
            countdownHTML = `<div class="va-countdown absolute bottom-2 right-2 bg-indigo-600 bg-opacity-90 text-white text-xs font-semibold px-2 py-1 rounded-lg" data-start="${startDate.getTime()}"></div>`;
        }
    }

    let imageHTML = '';
    if (event.miniSliderUrls && Array.isArray(event.miniSliderUrls) && event.miniSliderUrls.length > 0) {
        const imgs = event.miniSliderUrls;
        const dataImages = JSON.stringify(imgs).replace(/"/g,'&quot;');
        imageHTML = `
        <div class="relative aspect-w-16 aspect-h-9 group">
            <img id="slider-${event.id}" data-images='${dataImages}' data-idx="0" src="${imgs[0]}" alt="${title}" class="w-full h-48 object-cover ${eventoFinalizado ? 'grayscale blur-[1.5px]' : ''}">
            <button class="va-slider-btn absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition" data-event="${event.id}" data-dir="prev">&#10094;</button>
            <button class="va-slider-btn absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition" data-event="${event.id}" data-dir="next">&#10095;</button>
            ${eventoFinalizado ? '<div class="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 rounded-br-lg text-xs font-bold shadow-lg z-10">Finalizado</div>' : ''}
            ${eventoOcurriendo ? '<div class="absolute top-0 left-0 bg-green-600 text-white px-3 py-1 rounded-br-lg text-xs font-bold shadow-lg z-10">Ocurriendo ahora</div>' : ''}
            <span class="absolute top-0 right-0 bg-indigo-100 text-indigo-600 px-2 py-1 rounded-bl-lg text-xs">${category}</span>
            ${countdownHTML}
        </div>`;
    } else {
        imageHTML = `
        <div class="relative aspect-w-16 aspect-h-9">
            <img src="${mainImageFallback}" alt="${title}" class="w-full h-48 object-cover ${eventoFinalizado ? 'grayscale blur-[1.5px]' : ''}">
            ${eventoFinalizado ? '<div class="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 rounded-br-lg text-xs font-bold shadow-lg z-10">Finalizado</div>' : ''}
            ${eventoOcurriendo ? '<div class="absolute top-0 left-0 bg-green-600 text-white px-3 py-1 rounded-br-lg text-xs font-bold shadow-lg z-10">Ocurriendo ahora</div>' : ''}
            <span class="absolute top-0 right-0 bg-indigo-100 text-indigo-600 px-2 py-1 rounded-bl-lg text-xs">${category}</span>
            ${countdownHTML}
        </div>`;
    }

    // Añadir corazón y estrellas
    let favBtnHTML = '';
    let ratingHTML = '';
    favBtnHTML = `<button class="va-fav-btn" data-event-id="${event.id}" title="Agregar a favoritos"><i class="fa-regular fa-heart text-xl text-gray-400 hover:text-red-500"></i></button>`;
    ratingHTML = `<span class="va-rating-interactive" data-event-id="${event.id}"></span> <span class='va-rating-info' data-event-id='${event.id}'></span>`;

    return `
        <div class="bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 flex flex-col h-full ${eventoFinalizado ? 'opacity-80 grayscale blur-[0.2px] pointer-events-none' : ''}">
            ${imageHTML}
            <div class="p-6 flex-1 flex flex-col">
                <div class="flex items-center gap-2 mb-2">
                    ${favBtnHTML}
                    ${ratingHTML}
                </div>
                <h3 class="text-lg font-bold mb-1 text-indigo-600 line-clamp-2">${title}</h3>
                <p class="text-gray-600 mb-2 line-clamp-2 text-sm">${description}</p>
                <div class="flex flex-wrap gap-1 mb-2">
                    ${tags.map(tag => `<span class='bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs'>${tag}</span>`).join('')}
                </div>
                <div class="flex items-center text-gray-500 mb-1 text-sm">
                    <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span class="line-clamp-1">${formattedDateRange}</span>
                </div>
                ${time ? `<div class="flex items-center text-gray-500 mb-1 text-sm">
                    <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg> 
                    <span>${time}</span>
                </div>` : ''}
                <div class="flex items-center text-gray-500 mb-1 text-sm">
                    <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    ${locationDisplayHTML}
                </div>
                ${organizer ? `<div class='mb-1 text-gray-500 text-sm line-clamp-1'><span class='font-semibold'>Organiza:</span> ${organizer}</div>` : ''}
                ${patrocinador ? `<div class='mb-1 text-gray-500 text-sm line-clamp-1'><span class='font-semibold'>Patrocina:</span> ${patrocinador}</div>` : ''}
                ${totalParticipants > 0 ? `<div class='mb-1 text-gray-500 text-sm'><span class='font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1' onclick='openParticipantsModal("${event.id}")'>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    ${totalParticipants === 1 ? '1 participante' : totalParticipants + ' participantes'}
                </span></div>` : ''}
                <div class="flex gap-2 mt-auto pt-2">
                    ${social.facebook ? `<a href="${social.facebook}" target="_blank"><i class="fab fa-facebook text-gray-400 hover:text-blue-600"></i></a>` : ''}
                    ${social.instagram ? `<a href="${social.instagram}" target="_blank"><i class="fab fa-instagram text-gray-400 hover:text-pink-600"></i></a>` : ''}
                    ${social.youtube ? `<a href="${social.youtube}" target="_blank"><i class="fab fa-youtube text-gray-400 hover:text-red-600"></i></a>` : ''}
                </div>
                <div class="mt-2 text-right">
                    <a href="detalle-evento.html?id=${event.id}" class="text-indigo-600 hover:underline font-medium text-sm">Ver detalles</a>
                </div>
            </div>
        </div>
    `;
}

// Función para mostrar eventos
export async function displayEvents() {
    try {
        const eventsContainer = document.getElementById('eventos-container');
        const loadMoreBtn = document.getElementById('cargar-mas');
        if (!eventsContainer) {
            console.error('No se encontró el contenedor de eventos');
            return;
        }

        const events = await loadEventsFromFirebase();
        
        // Manejo de contenedor vacío o sin resultados
        if (events.length === 0) {
            // Solo mostrar "no hay eventos" si es la carga inicial o si no hay eventos tras un filtro
            // y el contenedor no está ya mostrando eventos de una carga anterior.
             if (!lastVisibleEvent || (eventsContainer.innerHTML === '' || eventsContainer.firstElementChild?.classList.contains('col-span-full'))) {
                eventsContainer.innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <p class="text-gray-500">No hay eventos disponibles con los filtros actuales.</p>
                    </div>
                `;
            }
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return; // No continuar si no hay eventos que procesar
        }

        // Cachés para optimizar lecturas de Firestore
        const siteCache = {};
        const artistCache = {};
        const groupCache = {};

        async function fetchSiteDetails(siteRefId) {
            if (!siteRefId) return null;
            if (siteCache[siteRefId]) return siteCache[siteRefId];
            try {
                const siteDocRef = doc(db, 'sites', siteRefId);
                const siteSnap = await getDoc(siteDocRef);
                if (siteSnap.exists()) {
                    const siteData = { id: siteSnap.id, ...siteSnap.data() };
                    siteCache[siteRefId] = siteData;
                    return siteData;
                }
                return null;
            } catch (error) {
                console.error(`Error fetching site (ref: ${siteRefId}):`, error);
                return null;
            }
        }

        async function fetchArtist(artistId) {
            if (!artistId) return null;
            if (artistCache[artistId]) return artistCache[artistId];
            try {
                const artistRef = doc(db, 'artists', artistId);
                const artistSnap = await getDoc(artistRef);
                if (artistSnap.exists()) {
                    const artistData = { id: artistSnap.id, ...artistSnap.data() };
                    artistCache[artistId] = artistData;
                    return artistData;
                }
            } catch (error) {
                console.error(`Error fetching artist (id: ${artistId}):`, error);
            }
            return null;
        }

        async function fetchGroup(groupId) {
            if (!groupId) return null;
            if (groupCache[groupId]) return groupCache[groupId];
            try {
                const groupRef = doc(db, 'agrupaciones', groupId);
                const groupSnap = await getDoc(groupRef);
                if (groupSnap.exists()) {
                    const groupData = { id: groupSnap.id, ...groupSnap.data() };
                    groupCache[groupId] = groupData;
                    return groupData;
                }
            } catch (error) {
                console.error(`Error fetching group (id: ${groupId}):`, error);
            }
            return null;
        }

        for (const event of events) {
            event.siteDetails = await fetchSiteDetails(event.siteRef);
            
            if (Array.isArray(event.artistsRef) && event.artistsRef.length > 0) {
                event.artists = (await Promise.all(event.artistsRef.map(ref => fetchArtist(ref.id || ref)))).filter(Boolean);
            } else {
                event.artists = []; // Asegurar que sea un array
            }
            if (Array.isArray(event.groupsRef) && event.groupsRef.length > 0) {
                event.groups = (await Promise.all(event.groupsRef.map(ref => fetchGroup(ref.id || ref)))).filter(Boolean);
            } else {
                event.groups = []; // Asegurar que sea un array
            }
        }

        const eventsHTML = events.map(event => createEventCard(event)).join('');
        
        // Limpiar contenedor solo si es una nueva carga/filtro (no "cargar más")
        // o si actualmente muestra el mensaje de "no hay eventos".
        if (eventsContainer.innerHTML === '' || eventsContainer.firstElementChild?.classList.contains('col-span-full')) {
            eventsContainer.innerHTML = eventsHTML;
        } else {
             // Para displayEvents, que se llama con filtros, siempre reemplazamos.
            eventsContainer.innerHTML = eventsHTML;
        }


        if (loadMoreBtn) {
            loadMoreBtn.style.display = events.length < eventsPerPage ? 'none' : 'flex';
        }

        // Iniciar / actualizar countdowns
        initCountdowns();
        initMiniSliders();

        // Después de renderizar:
        auth.onAuthStateChanged(async user => {
            const favs = user ? await getUserFavorites(user.uid) : [];
            document.querySelectorAll('.va-fav-btn').forEach(btn => {
                const eventId = btn.dataset.eventId;
                if (user && favs.includes(eventId)) {
                    btn.innerHTML = '<i class="fa-solid fa-heart text-xl text-red-500"></i>';
                    btn.title = 'Quitar de favoritos';
                }
                btn.onclick = async () => {
                    if (!user) {
                        if (window.showCustomLoginModal) window.showCustomLoginModal();
                        return;
                    }
                    if (favs.includes(eventId)) {
                        await removeFavorite(user.uid, eventId);
                        btn.innerHTML = '<i class="fa-regular fa-heart text-xl text-gray-400 hover:text-red-500"></i>';
                        btn.title = 'Agregar a favoritos';
                    } else {
                        await addFavorite(user.uid, eventId);
                        btn.innerHTML = '<i class="fa-solid fa-heart text-xl text-red-500"></i>';
                        btn.title = 'Quitar de favoritos';
                    }
                };
            });
            // Estrellas interactivas y promedio
            document.querySelectorAll('.va-rating-interactive').forEach(async span => {
                const eventId = span.dataset.eventId;
                let avg = 0, count = 0, userScore = 0;
                const ratingInfoSpan = document.querySelector(`.va-rating-info[data-event-id='${eventId}']`);
                const ratingData = await getEventRating(eventId);
                avg = ratingData.avg;
                count = ratingData.count;
                if (user) userScore = await getUserRating(user.uid, eventId) || 0;
                span.innerHTML = renderStarsInput(userScore);
                if (ratingInfoSpan) ratingInfoSpan.innerHTML = `<span class='text-xs text-gray-500 ml-1'>${avg.toFixed(1)} (${count})</span>`;
                span.querySelectorAll('.va-star-btn').forEach(btn => {
                    btn.onclick = async () => {
                        if (!user) {
                            if (window.showCustomLoginModal) window.showCustomLoginModal();
                            return;
                        }
                        const score = parseInt(btn.dataset.score);
                        await setUserRating(user.uid, eventId, score);
                        userScore = score;
                        span.innerHTML = renderStarsInput(userScore);
                        // Actualizar promedio
                        const ratingData = await getEventRating(eventId);
                        if (ratingInfoSpan) ratingInfoSpan.innerHTML = `<span class='text-xs text-gray-500 ml-1'>${ratingData.avg.toFixed(1)} (${ratingData.count})</span>`;
                    };
                });
            });
        });

    } catch (error) {
        console.error('Error al mostrar eventos:', error);
        const eventsContainer = document.getElementById('eventos-container');
        if (eventsContainer) {
            eventsContainer.innerHTML = `<div class="col-span-full text-center py-8"><p class="text-red-500">Error al cargar eventos. Intenta de nuevo más tarde.</p></div>`;
        }
    }
}

// Función para cargar más eventos
export async function loadMoreEvents() {
    try {
        const events = await loadEventsFromFirebase(); // Obtiene los siguientes eventos
        const loadMoreBtn = document.getElementById('cargar-mas');

        if (events.length > 0) {
            // Mismas cachés y funciones de obtención que en displayEvents.
            // Considerar refactorizar para no duplicar.
            const siteCache = {}; 
            const artistCache = {};
            const groupCache = {};

            async function fetchSiteDetails(siteRefId) {
                if (!siteRefId) return null;
                if (siteCache[siteRefId]) return siteCache[siteRefId];
                try {
                    const siteDocRef = doc(db, 'sites', siteRefId);
                    const siteSnap = await getDoc(siteDocRef);
                    if (siteSnap.exists()) {
                        const siteData = { id: siteSnap.id, ...siteSnap.data() };
                        siteCache[siteRefId] = siteData;
                        return siteData;
                    }
                    return null;
                } catch (error) {
                    console.error(`Error fetching site (ref: ${siteRefId}):`, error);
                    return null;
                }
            }
    
            async function fetchArtist(artistId) {
                if (!artistId) return null;
                if (artistCache[artistId]) return artistCache[artistId];
                try {
                    const artistRef = doc(db, 'artists', artistId);
                    const artistSnap = await getDoc(artistRef);
                    if (artistSnap.exists()) {
                        const artistData = { id: artistSnap.id, ...artistSnap.data() };
                        artistCache[artistId] = artistData;
                        return artistData;
                    }
                } catch (error) {
                    console.error(`Error fetching artist (id: ${artistId}):`, error);
                }
                return null;
            }
    
            async function fetchGroup(groupId) {
                if (!groupId) return null;
                if (groupCache[groupId]) return groupCache[groupId];
                try {
                    const groupRef = doc(db, 'agrupaciones', groupId);
                    const groupSnap = await getDoc(groupRef);
                    if (groupSnap.exists()) {
                        const groupData = { id: groupSnap.id, ...groupSnap.data() };
                        groupCache[groupId] = groupData;
                        return groupData;
                    }
                } catch (error) {
                    console.error(`Error fetching group (id: ${groupId}):`, error);
                }
                return null;
            }

            for (const event of events) {
                event.siteDetails = await fetchSiteDetails(event.siteRef);

                if (Array.isArray(event.artistsRef) && event.artistsRef.length > 0) {
                    event.artists = (await Promise.all(event.artistsRef.map(ref => fetchArtist(ref.id || ref)))).filter(Boolean);
                } else {
                    event.artists = [];
                }
                if (Array.isArray(event.groupsRef) && event.groupsRef.length > 0) {
                    event.groups = (await Promise.all(event.groupsRef.map(ref => fetchGroup(ref.id || ref)))).filter(Boolean);
                } else {
                    event.groups = [];
                }
            }

            const eventsContainer = document.getElementById('eventos-container');
            const eventsHTML = events.map(event => createEventCard(event)).join('');
            eventsContainer.insertAdjacentHTML('beforeend', eventsHTML); // Añadir al final

            if (loadMoreBtn) {
                loadMoreBtn.style.display = events.length < eventsPerPage ? 'none' : 'flex';
            }

            initCountdowns();
            initMiniSliders();

            // Inicializar corazones y estrellas en las nuevas tarjetas
            auth.onAuthStateChanged(async user => {
                const favs = user ? await getUserFavorites(user.uid) : [];
                // Solo inicializar en las nuevas tarjetas (las recién agregadas)
                const newFavBtns = Array.from(eventsContainer.querySelectorAll('.va-fav-btn')).slice(-events.length);
                const newRatingSpans = Array.from(eventsContainer.querySelectorAll('.va-rating-interactive')).slice(-events.length);
                const newRatingInfos = Array.from(eventsContainer.querySelectorAll('.va-rating-info')).slice(-events.length);
                newFavBtns.forEach(btn => {
                    const eventId = btn.dataset.eventId;
                    if (user && favs.includes(eventId)) {
                        btn.innerHTML = '<i class="fa-solid fa-heart text-xl text-red-500"></i>';
                        btn.title = 'Quitar de favoritos';
                    }
                    btn.onclick = async () => {
                        if (!user) {
                            if (window.showCustomLoginModal) window.showCustomLoginModal();
                            return;
                        }
                        if (favs.includes(eventId)) {
                            await removeFavorite(user.uid, eventId);
                            btn.innerHTML = '<i class="fa-regular fa-heart text-xl text-gray-400 hover:text-red-500"></i>';
                            btn.title = 'Agregar a favoritos';
                        } else {
                            await addFavorite(user.uid, eventId);
                            btn.innerHTML = '<i class="fa-solid fa-heart text-xl text-red-500"></i>';
                            btn.title = 'Quitar de favoritos';
                        }
                    };
                });
                newRatingSpans.forEach(async (span, idx) => {
                    const eventId = span.dataset.eventId;
                    let avg = 0, count = 0, userScore = 0;
                    const ratingInfoSpan = newRatingInfos[idx];
                    const ratingData = await getEventRating(eventId);
                    avg = ratingData.avg;
                    count = ratingData.count;
                    if (user) userScore = await getUserRating(user.uid, eventId) || 0;
                    span.innerHTML = renderStarsInput(userScore);
                    if (ratingInfoSpan) ratingInfoSpan.innerHTML = `<span class='text-xs text-gray-500 ml-1'>${avg.toFixed(1)} (${count})</span>`;
                    span.querySelectorAll('.va-star-btn').forEach(btn => {
                        btn.onclick = async () => {
                            if (!user) {
                                if (window.showCustomLoginModal) window.showCustomLoginModal();
                                return;
                            }
                            const score = parseInt(btn.dataset.score);
                            await setUserRating(user.uid, eventId, score);
                            userScore = score;
                            span.innerHTML = renderStarsInput(userScore);
                            // Actualizar promedio
                            const ratingData = await getEventRating(eventId);
                            if (ratingInfoSpan) ratingInfoSpan.innerHTML = `<span class='text-xs text-gray-500 ml-1'>${ratingData.avg.toFixed(1)} (${ratingData.count})</span>`;
                        };
                    });
                });
            });
        } else {
            if (loadMoreBtn) loadMoreBtn.style.display = 'none'; // No hay más eventos
        }
    } catch (error) {
        console.error('Error al cargar más eventos:', error);
        // Opcionalmente, informar al usuario de alguna manera
    }
}

// Función para aplicar filtros
export async function applyFilters(category, time) {
    try {
        console.log('Aplicando filtros:', { category, time });
        
        // Validar la categoría
        if (category !== 'todos' && !categoriasValidas.includes(category)) {
            console.warn('Categoría inválida:', category);
            category = 'todos';
        }

        currentCategoryFilter = category;
        currentTimeFilter = time;
        lastVisibleEvent = null; // Resetear la paginación

        // Limpiar el contenedor de eventos
        const eventsContainer = document.getElementById('eventos-container');
        if (eventsContainer) {
            eventsContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">Cargando eventos...</p></div>';
        }

        // Cargar y mostrar los eventos filtrados
        await displayEvents();

        // Actualizar el estado visual de los botones
        updateFilterButtons(category, time);
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
        showError('Error al aplicar los filtros. Por favor, intenta de nuevo.');
    }
}

// Función para actualizar el estado visual de los botones de filtro
function updateFilterButtons(category, time) {
    // Actualizar botones de categoría
    document.querySelectorAll('.category-btn').forEach(btn => {
        const btnCategory = btn.getAttribute('data-category');
        if (btnCategory === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Actualizar botones de tiempo
    const timeBtns = document.querySelectorAll('.time-filter-btn');
    timeBtns.forEach(btn => {
        const btnTime = btn.getAttribute('data-time');
        if (btnTime === time) {
            btn.classList.add('active', 'bg-indigo-100', 'text-indigo-600');
            btn.classList.remove('bg-gray-100', 'text-gray-700');
        } else {
            btn.classList.remove('active', 'bg-indigo-100', 'text-indigo-600');
            btn.classList.add('bg-gray-100', 'text-gray-700');
        }
    });
}

// Función para mostrar mensaje de error
function showError(message) {
    const eventsContainer = document.getElementById('eventos-container');
    if (eventsContainer) {
        eventsContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-red-500">${message}</p>
            </div>
        `;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando página de eventos...');
    // Mostrar eventos iniciales
    displayEvents();

    // Configurar botón de cargar más
    const loadMoreBtn = document.getElementById('cargar-mas');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreEvents);
    }

    // Filtros de categoría (scroll horizontal)
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Quitar estado activo de todos
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Activar el que fue clicado
            btn.classList.add('active');
            const category = btn.getAttribute('data-category');
            currentCategoryFilter = category;
            lastVisibleEvent = null;
            // Actualizar sólo la vista actual
            if (currentView === 'lista') {
                displayEvents();
            } else if (currentView === 'calendario') {
                renderCalendar();
            } else if (currentView === 'mapa') {
                renderMap();
            }
            // Actualizar estado visual de los botones
            updateFilterButtons(category, currentTimeFilter);
        });
    });

    // Filtros de tiempo (scroll horizontal)
    const timeBtns = document.querySelectorAll('.time-filter-btn');
    timeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            timeBtns.forEach(b => {
                b.classList.remove('active', 'bg-indigo-100', 'text-indigo-600');
                b.classList.add('bg-gray-100', 'text-gray-700');
            });
            btn.classList.remove('bg-gray-100', 'text-gray-700');
            btn.classList.add('active', 'bg-indigo-100', 'text-indigo-600');
            const time = btn.getAttribute('data-time');
            currentTimeFilter = time;
            lastVisibleEvent = null;
            // Solo actualizar lista y mapa
            if (currentView === 'lista') {
                displayEvents();
            } else if (currentView === 'mapa') {
                renderMap();
            }
            // Actualizar estado visual de los botones
            updateFilterButtons(currentCategoryFilter, time);
        });
    });

    // Configurar botones de modo de vista
    const viewBtns = document.querySelectorAll('.view-mode-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-view');
            switchView(mode);
        });
    });

    // --- Flechas de desplazamiento en filtros de categoría ---
    const catContainer = document.getElementById('cat-scroll-wrap');
    const scrollLeftBtn = document.getElementById('cat-scroll-left');
    const scrollRightBtn = document.getElementById('cat-scroll-right');
    const scrollStep = 220; // px por clic

    if (catContainer && scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            catContainer.scrollBy({ left: -scrollStep, behavior: 'smooth' });
        });
        scrollRightBtn.addEventListener('click', () => {
            catContainer.scrollBy({ left: scrollStep, behavior: 'smooth' });
        });
    }

    // Asegurar clase para el contenedor de filtros de tiempo
    const timeFiltersRow = document.querySelector('.time-filters-row') || document.querySelector('#time-filters-row');
    if (timeFiltersRow) {
        timeFiltersRow.classList.add('time-filters-row');
    }

    // --- Desplazamiento horizontal con clic sostenido (drag to scroll) ---
    let isDown = false;
    let startX, scrollLeft;
    if (catContainer) {
        catContainer.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Solo botón izquierdo
            isDown = true;
            catContainer.classList.add('cursor-grabbing');
            startX = e.pageX - catContainer.offsetLeft;
            scrollLeft = catContainer.scrollLeft;
        });
        catContainer.addEventListener('mouseleave', () => {
            isDown = false;
            catContainer.classList.remove('cursor-grabbing');
        });
        catContainer.addEventListener('mouseup', () => {
            isDown = false;
            catContainer.classList.remove('cursor-grabbing');
        });
        catContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - catContainer.offsetLeft;
            const walk = (x - startX) * 1.5; // velocidad
            catContainer.scrollLeft = scrollLeft - walk;
        });
        // Prevenir selección de texto accidental
        catContainer.addEventListener('dragstart', e => e.preventDefault());
    }
});

// Función para mostrar eventos en la página principal
async function displayUpcomingEvents() {
    const container = document.getElementById('upcoming-events');
    if (!container) return;

    try {
        const events = await loadEventsFromFirebase();
        
        if (!events || events.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No hay eventos próximos disponibles.</p>';
            return;
        }

        // Ordenar eventos por fecha
        const sortedEvents = events.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
        
        // Filtrar solo eventos futuros
        const upcomingEvents = sortedEvents.filter(event => new Date(event.fechaInicio) >= new Date());
        
        if (upcomingEvents.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No hay eventos próximos disponibles.</p>';
            return;
        }

        // Mostrar solo los primeros 4 eventos
        const eventsToShow = upcomingEvents.slice(0, 4);
        
        container.innerHTML = eventsToShow.map(event => `
            <article class="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div class="relative">
                    <img src="${event.imagen}" alt="${event.titulo}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                    <span class="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-bl-lg">${event.categoria}</span>
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-2 text-gray-800 group-hover:text-indigo-600 transition-colors">${event.titulo}</h3>
                    <p class="text-gray-600 mb-4 line-clamp-2">${event.descripcion}</p>
                    
                    <div class="flex flex-wrap gap-2 mb-4">
                        <div class="flex items-center text-sm text-gray-500">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>${new Date(event.fechaInicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <div class="flex items-center text-sm text-gray-500">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>${event.hora}</span>
                        </div>
                        <div class="flex items-center text-sm text-gray-500">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>${event.lugar}</span>
                        </div>
                    </div>

                    <a href="eventos/evento.html?id=${event.id}" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        Ver detalles
                        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error al mostrar eventos:', error);
        container.innerHTML = '<p class="text-red-500 text-center">Error al cargar los eventos.</p>';
    }
}

// Asegurarse de que la función se ejecute cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    displayUpcomingEvents();
});

// Función para abrir el modal de participantes
window.openParticipantsModal = async function(eventId) {
    const modal = document.getElementById('participants-modal');
    const modalContent = document.getElementById('participants-modal-content');
    const modalClose = document.getElementById('participants-modal-close');
    
    modalContent.innerHTML = '<div class="text-center py-4"><p class="text-gray-600">Cargando participantes...</p></div>';
    modal.classList.remove('hidden');
    try {
        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
            const event = eventSnap.data();
            let participants = [];
            // Buscar IDs de artistas y grupos (soportar artistsRef/groupsRef y artists/groups)
            const artistIds = Array.isArray(event.artistsRef) && event.artistsRef.length > 0 ? event.artistsRef : (Array.isArray(event.artists) ? event.artists : []);
            const groupIds = Array.isArray(event.groupsRef) && event.groupsRef.length > 0 ? event.groupsRef : (Array.isArray(event.groups) ? event.groups : []);
            // Cargar artistas
            for (const artistId of artistIds) {
                const artistRef = doc(db, 'artists', artistId);
                const artistSnap = await getDoc(artistRef);
                if (artistSnap.exists()) {
                    const artist = artistSnap.data();
                    participants.push({
                        id: artistId,
                        name: artist.name,
                        imageUrl: artist.imageUrl || '../src/assets/images/placeholder.jpg',
                        type: 'artist'
                    });
                }
            }
            // Cargar agrupaciones
            for (const groupId of groupIds) {
                const groupRef = doc(db, 'agrupaciones', groupId);
                const groupSnap = await getDoc(groupRef);
                if (groupSnap.exists()) {
                    const group = groupSnap.data();
                    participants.push({
                        id: groupId,
                        name: group.nombre,
                        imageUrl: group.imagen || '../src/assets/images/placeholder.jpg',
                        type: 'group'
                    });
                }
            }
            if (participants.length === 0) {
                modalContent.innerHTML = '<div class="text-center py-4"><p class="text-gray-600">No hay participantes registrados.</p></div>';
            } else {
                modalContent.innerHTML = `
                    <div class="space-y-2">
                        ${participants.map(p => `
                            <a href="${p.type === 'artist' ? '/src/views/artistas/perfil.html?id=' + p.id : '/src/views/agrupaciones/perfil-agrupacion.html?id=' + p.id}" 
                               class="flex items-center p-2 hover:bg-indigo-50 rounded-lg transition-colors duration-200">
                                <img src="${p.imageUrl}" alt="${p.name}" class="w-10 h-10 object-cover rounded-full">
                                <div class="ml-3">
                                    <p class="text-gray-800 font-medium">${p.name}</p>
                                    <p class="text-sm text-gray-500">${p.type === 'artist' ? 'Artista' : 'Agrupación'}</p>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                `;
            }
        } else {
            modalContent.innerHTML = '<div class="text-center py-4"><p class="text-gray-600">Evento no encontrado.</p></div>';
        }
    } catch (error) {
        console.error('Error al cargar participantes:', error);
        modalContent.innerHTML = '<div class="text-center py-4"><p class="text-red-500">Error al cargar los participantes.</p></div>';
    }
    // Cerrar modal al hacer clic en el botón de cerrar
    modalClose.onclick = () => {
        modal.classList.add('hidden');
    };
    // Cerrar modal al hacer clic fuera del contenido
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    };
};

// Exportar para uso en otros módulos (ej. resultados de búsqueda)
export { createEventCard };

// ====================  NUEVAS FUNCIONES DE MODO DE VISTA  ====================

function switchView(mode) {
    if (mode === currentView) return;

    // Actualizar clases de botones
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        const isActive = btn.getAttribute('data-view') === mode;
        btn.classList.toggle('bg-indigo-100', isActive);
        btn.classList.toggle('text-indigo-600', isActive);
        btn.classList.toggle('bg-gray-100', !isActive);
        btn.classList.toggle('text-gray-700', !isActive);
    });

    // Mostrar / ocultar contenedores
    document.getElementById('vista-lista').classList.toggle('hidden', mode !== 'lista');
    document.getElementById('vista-calendario').classList.toggle('hidden', mode !== 'calendario');
    document.getElementById('vista-mapa').classList.toggle('hidden', mode !== 'mapa');

    if (mode === 'calendario' && !calendarInstance) {
        renderCalendar();
    }
    if (mode === 'mapa' && !mapInstance) {
        renderMap();
    }

    currentView = mode;
}

function mapFirebaseEventToCalendar(event) {
    const start = event.fechaInicio && event.fechaInicio.toDate ? event.fechaInicio.toDate() : null;
    const end = event.endDate && event.endDate.toDate ? event.endDate.toDate() : null;
    if (!start) return null;
    return {
        id: event.id,
        title: event.title || 'Evento',
        start: start,
        end: end || undefined,
        url: `detalle-evento.html?id=${event.id}`,
        extendedProps: {
            time: event.time || event.hora || '',
            location: event.location || event.lugar || '',
            tags: event.tags || event.etiquetas || [],
            artistaDestacado: event.artistaDestacado || (event.artists && event.artists.length ? event.artists[0] : '')
        }
    };
}

async function renderCalendar() {
    const container = document.getElementById('calendar');
    if (!container) return;

    // Obtener todos los eventos y aplicar solo filtro de categoría
    const allEvents = await fetchAllEvents();
    const filteredEvents = allEvents.filter(event => {
        // Filtrar por categoría únicamente
        if (currentCategoryFilter !== 'todos' && event.category !== currentCategoryFilter && event.categoria !== currentCategoryFilter) {
            return false;
        }
        return true; // Mostrar todos los eventos, pasados y futuros
    });

    const eventsForCalendar = filteredEvents.map(mapFirebaseEventToCalendar).filter(Boolean);

    if (calendarInstance) {
        calendarInstance.removeAllEvents();
        calendarInstance.addEventSource(eventsForCalendar);
    } else {
        calendarInstance = new FullCalendar.Calendar(container, {
            initialView: 'dayGridMonth',
            locale: 'es',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: ''
            },
            dayMaxEvents: 3,
            dayMaxEventRows: true,
            moreLinkText: (n) => `+${n} más`,
            height: 'auto',
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false },
            eventContent: function(arg) {
                return { html: `<div class='fc-event-inner'>${arg.event.title}</div>` };
            },
            events: eventsForCalendar,
            eventClick: function(info) {
                info.jsEvent.preventDefault();
                if (info.event.url) {
                    window.location.href = info.event.url;
                }
            },
            eventDidMount: function(info) {
                const { time, location, tags } = info.event.extendedProps;
                let tooltip = '';
                if (time) tooltip += `🕒 <b>Hora:</b> ${time}<br>`;
                if (location) tooltip += `📍 <b>Lugar:</b> ${location}<br>`;
                if (tags && tags.length) tooltip += `${tags.map(t => `<span style='background:#6969FF;border-radius:4px;padding:1px 4px;margin-right:2px;'>${t}</span>`).join(' ')}<br>`;

                // Marcar eventos finalizados con clase especial
                let isFinalizado = false;
                if (window.isEventFinalizado) {
                    const original = (window.__allEvents || []).find(e => e.id === info.event.id);
                    if (original) {
                        isFinalizado = window.isEventFinalizado(original);
                    }
                }
                if (isFinalizado) {
                    info.el.classList.add('evento-finalizado');
                }

                // Tooltip al hacer hover
                if (tooltip) {
                    let calendarRoot = info.el.closest('.fc');
                    if (calendarRoot) {
                        calendarRoot.style.position = 'relative';
                    }
                    info.el.setAttribute('data-tooltip', tooltip);
                    info.el.style.position = 'relative';

                    // Mostrar tooltip al hacer hover
                    info.el.addEventListener('mouseenter', function(e) {
                        let tip = document.createElement('div');
                        tip.className = 'fc-custom-tooltip';
                        tip.innerHTML = tooltip;
                        tip.style.position = 'fixed';
                        tip.style.zIndex = '2147483647';
                        tip.style.background = 'rgba(30,30,30,0.97)';
                        tip.style.color = '#fff';
                        tip.style.border = '2px solid #222';
                        tip.style.padding = '10px 14px';
                        tip.style.borderRadius = '8px';
                        tip.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)';
                        tip.style.whiteSpace = 'normal';
                        tip.style.minWidth = '180px';
                        tip.style.fontSize = '13px';
                        tip.style.pointerEvents = 'auto';
                        tip.style.textAlign = 'left';
                        tip.style.fontWeight = '400';
                        tip.style.lineHeight = '1.5';
                        tip.style.maxWidth = '260px';
                        tip.style.wordBreak = 'break-word';
                        tip.style.margin = '0';
                        tip.style.display = 'block';
                        tip.style.filter = 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))';
                        document.body.appendChild(tip);
                        const mouseMove = (ev) => {
                            tip.style.left = (ev.clientX) + 'px';
                            tip.style.top = (ev.clientY - tip.offsetHeight - 10) + 'px';
                        };
                        mouseMove(e);
                        document.addEventListener('mousemove', mouseMove);
                        info.el._fcTooltipMove = mouseMove;
                    });
                    info.el.addEventListener('mouseleave', function() {
                        const tip = document.querySelector('.fc-custom-tooltip');
                        if (tip) tip.remove();
                        if (info.el._fcTooltipMove) {
                            document.removeEventListener('mousemove', info.el._fcTooltipMove);
                            delete info.el._fcTooltipMove;
                        }
                    });
                }
            }
        });
        calendarInstance.render();
    }
}

// ====================  Cargar Google Maps dinámicamente  ====================
function ensureGoogleMaps() {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve();
            return;
        }
        window.initGoogleMaps = () => resolve();
        // El script se inyecta en el HTML con callback=initGoogleMaps
    });
}

async function renderMap() {
    const container = document.getElementById('map');
    if (!container) return;

    await ensureGoogleMaps();

    // Obtener todos los eventos y aplicar filtros de categoría y tiempo
    const allEvents = await fetchAllEvents();
    const filteredEvents = allEvents.filter(event => {
        // Filtrar por categoría
        if (currentCategoryFilter !== 'todos' && event.category !== currentCategoryFilter && event.categoria !== currentCategoryFilter) {
            return false;
        }
        // Filtrar por tiempo
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = event.fechaInicio.toDate();
        switch (currentTimeFilter) {
            case 'hoy':
                const startOfDay = new Date(today);
                const endOfDay = new Date(today);
                endOfDay.setHours(23, 59, 59, 999);
                return eventDate >= startOfDay && eventDate <= endOfDay;
            case 'finde':
                const { start: weekendStart, end: weekendEnd } = getWeekendRange(today);
                return eventDate >= weekendStart && eventDate <= weekendEnd;
            case 'mes':
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                return eventDate >= today && eventDate <= monthEnd;
            default:
                return shouldShowEvent(event);
        }
    });

    // Siempre usar un mapId válido
    const MAP_ID = '975467a7270066f7d8b4e734'; // Reemplaza por tu Map ID real
    if (!mapInstance) {
        mapInstance = new google.maps.Map(container, {
            center: { lat: 8.3189, lng: -73.6139 },
            zoom: 13,
            mapId: MAP_ID,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                }
            ]
        });
    }

    // Limpiar marcadores existentes
    if (window.markers) {
        window.markers.forEach(marker => marker.setMap(null));
    }
    window.markers = [];

    // Agregar marcadores para los eventos filtrados
    filteredEvents.forEach(event => {
        let latRaw = event.latitud ?? event.latitude ?? event.locationLat;
        let lngRaw = event.longitud ?? event.longitude ?? event.locationLng;

        if (typeof latRaw === 'string') latRaw = parseFloat(latRaw.replace(',', '.'));
        if (typeof lngRaw === 'string') lngRaw = parseFloat(lngRaw.replace(',', '.'));

        const lat = latRaw;
        const lng = lngRaw;

        if (!isNaN(lat) && !isNaN(lng)) {
            const bubble = document.createElement('div');
            bubble.className = 'map-bubble';
            const fecha = event.fechaInicio && event.fechaInicio.toDate ? event.fechaInicio.toDate().toLocaleDateString('es-ES', { day:'numeric', month:'short'}) : '';
            let etiqueta = '';
            let burbujaStyle = '';
            if (isEventFinalizado(event)) {
                etiqueta = `<span style=\"display:inline-block;background:#6b7280;color:white;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:6px;line-height:1;margin:0;\">Finalizado</span>`;
                burbujaStyle = 'background:#e5e7eb;color:#6b7280;'; // gris claro y texto gris oscuro
            } else if (isEventOcurriendo(event)) {
                etiqueta = `<span style=\"display:inline-block;background:#22c55e;color:white;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:6px;line-height:1;margin:0;\">Ocurriendo ahora</span>`;
            }
            bubble.innerHTML = `
                <div style=\"text-align:center;margin:0;padding:0;line-height:1.2;${burbujaStyle}\">
                    ${etiqueta}
                    <div style=\"font-weight:bold;margin:0;padding:0;\">${event.title || ''}</div>
                    <span style=\"font-size:10px;font-weight:400;color:#6b7280;margin:0;padding:0;\">${fecha}</span>
                </div>
            `;

            const advMarker = new google.maps.marker.AdvancedMarkerElement({
                map: mapInstance,
                position: { lat, lng },
                content: bubble
            });

            advMarker.addListener('gmp-click', () => {
                window.location.href = `detalle-evento.html?id=${event.id}`;
            });

            window.markers.push(advMarker);
        }
    });
}

// Obtener todos los eventos sin límite (para calendario y mapa)
async function fetchAllEvents() {
    try {
        const eventsRef = collection(db, 'events');
        let q = query(eventsRef, orderBy('fechaInicio', 'asc'));
        const snapshot = await getDocs(q);
        const events = [];
        snapshot.forEach(docu => events.push({ id: docu.id, ...docu.data() }));
        return events;
    } catch (e) {
        console.error('Error obteniendo todos los eventos:', e);
        return [];
    }
}

// Configurar listeners para los filtros
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para los botones de filtro de tiempo
    document.querySelectorAll('.time-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Actualizar clases de botones
            document.querySelectorAll('.time-filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-indigo-100', 'text-indigo-600');
                b.classList.add('bg-gray-100', 'text-gray-700');
            });
            btn.classList.remove('bg-gray-100', 'text-gray-700');
            btn.classList.add('active', 'bg-indigo-100', 'text-indigo-600');

            // Actualizar filtro actual
            currentTimeFilter = this.getAttribute('data-time');

            // Recargar la vista actual
            if (currentView === 'lista') {
                loadEventsFromFirebase();
            } else if (currentView === 'calendario') {
                renderCalendar();
            } else if (currentView === 'mapa') {
                renderMap();
            }
        });
    });

    // Event listeners para los botones de modo de vista
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });
});

window.isEventFinalizado = isEventFinalizado;
const allEvents = await fetchAllEvents();
window.__allEvents = allEvents;

// Devuelve objeto {start, end} para el fin de semana pertinente
function getWeekendRange(referenceDate = new Date()) {
    const today = new Date(referenceDate);
    today.setHours(0,0,0,0);
    const dow = today.getDay(); // 0 domingo, 6 sábado

    let weekendStart = new Date(today);

    if (dow === 6) {
        // Sábado
        // weekendStart ya es hoy
    } else if (dow === 0) {
        // Domingo: retroceder al sábado anterior (ayer)
        weekendStart.setDate(today.getDate() - 1);
    } else {
        // De lunes a viernes: avanzar al siguiente sábado
        const daysUntilSaturday = 6 - dow;
        weekendStart.setDate(today.getDate() + daysUntilSaturday);
    }

    weekendStart.setHours(0,0,0,0);
    const weekendEnd = new Date(weekendStart);
    weekendEnd.setDate(weekendStart.getDate() + 2); // lunes 00:00
    weekendEnd.setMilliseconds(-1); // último ms del domingo

    return { start: weekendStart, end: weekendEnd };
}

// Renderizar estrellas
function renderStars(avg) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<i class="fa-star${i <= Math.round(avg) ? ' fa-solid text-yellow-400' : ' fa-regular text-gray-300'}"></i>`;
    }
    return html;
}

function renderStarsInput(userScore) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<button class='va-star-btn' data-score='${i}' type='button'>` +
            `<i class="fa-star${i <= userScore ? ' fa-solid text-yellow-400' : ' fa-regular text-gray-300'}"></i></button>`;
    }
    return html;
}

// MODAL DE LOGIN DESDE CERO (corregido para usar auth y GoogleAuthProvider ya importados)
function ensureCustomLoginModal() {
    if (document.getElementById('customLoginModal')) return;
    const modal = document.createElement('div');
    modal.id = 'customLoginModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 hidden';
    modal.innerHTML = `
      <div id="customLoginModalContent" class="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
        <button id="closeCustomLoginModal" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl">&times;</button>
        <h2 id="customLoginTitle" class="text-2xl font-bold mb-4 text-indigo-700 text-center">Iniciar Sesión</h2>
        <button id="googleLoginBtn" class="w-full flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-2 rounded mb-4">
          <i class="fab fa-google"></i> Iniciar sesión con Google
        </button>
        <div class="flex items-center my-4"><hr class="flex-1"><span class="mx-2 text-gray-400 text-xs">o</span><hr class="flex-1"></div>
        <form id="customLoginForm" class="space-y-3">
          <input type="text" id="customLoginName" class="w-full border rounded px-3 py-2" placeholder="Nombre completo" style="display:none" autocomplete="name" />
          <input type="email" id="customLoginEmail" class="w-full border rounded px-3 py-2" placeholder="Correo electrónico" required autocomplete="email" />
          <input type="password" id="customLoginPassword" class="w-full border rounded px-3 py-2" placeholder="Contraseña" required autocomplete="current-password" />
          <button type="submit" id="customLoginSubmit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded">Iniciar sesión</button>
        </form>
        <div class="text-center mt-2">
          <button id="toggleCustomAuthMode" class="text-indigo-600 hover:underline text-sm">¿No tienes cuenta? Regístrate</button>
        </div>
        <div id="customLoginError" class="text-red-500 text-sm mt-2 text-center"></div>
      </div>
    `;
    document.body.appendChild(modal);
    // Cerrar modal con botón
    document.getElementById('closeCustomLoginModal').onclick = () => {
      modal.classList.add('hidden');
    };
    // Cerrar modal al hacer clic fuera del contenido
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    };
    // Google login
    document.getElementById('googleLoginBtn').onclick = async () => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        modal.classList.add('hidden');
      } catch (e) {
        document.getElementById('customLoginError').textContent = e.message;
      }
    };
    // Login/Registro con email
    let isLoginMode = true;
    const form = document.getElementById('customLoginForm');
    const title = document.getElementById('customLoginTitle');
    const submitBtn = document.getElementById('customLoginSubmit');
    const toggleBtn = document.getElementById('toggleCustomAuthMode');
    const nameField = document.getElementById('customLoginName');
    toggleBtn.onclick = () => {
      isLoginMode = !isLoginMode;
      if (isLoginMode) {
        title.textContent = 'Iniciar Sesión';
        submitBtn.textContent = 'Iniciar sesión';
        toggleBtn.textContent = '¿No tienes cuenta? Regístrate';
        nameField.style.display = 'none';
        nameField.required = false;
      } else {
        title.textContent = 'Crear Cuenta';
        submitBtn.textContent = 'Registrarse';
        toggleBtn.textContent = '¿Ya tienes cuenta? Inicia sesión';
        nameField.style.display = '';
        nameField.required = true;
      }
      document.getElementById('customLoginError').textContent = '';
    };
    form.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('customLoginEmail').value;
      const password = document.getElementById('customLoginPassword').value;
      const displayName = nameField.value;
      try {
        if (isLoginMode) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          if (displayName) {
            // Actualizar el nombre en el perfil
            await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js').then(mod =>
              mod.updateProfile(userCredential.user, { displayName })
            );
          }
        }
        modal.classList.add('hidden');
      } catch (e) {
        document.getElementById('customLoginError').textContent = e.message;
      }
    };
}
window.showCustomLoginModal = function() {
    ensureCustomLoginModal();
    document.getElementById('customLoginModal').classList.remove('hidden');
};

// Inyectar CSS responsivo para los filtros de tiempo
(function injectTimeFilterResponsiveCSS() {
    if (document.getElementById('time-filter-responsive-css')) return;
    const style = document.createElement('style');
    style.id = 'time-filter-responsive-css';
    style.innerHTML = `
    @media (max-width: 600px) {
      .time-filters-row {
        display: flex !important;
        flex-wrap: nowrap !important;
        overflow-x: visible !important;
        gap: 0.25rem !important;
        justify-content: flex-start !important;
      }
      .time-filter-btn {
        padding: 0.25rem 0.5rem !important;
        font-size: 0.85rem !important;
        margin-right: 0.25rem !important;
        min-width: unset !important;
        white-space: nowrap !important;
      }
    }
    `;
    document.head.appendChild(style);
})();
 
