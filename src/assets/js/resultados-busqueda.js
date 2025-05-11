import { searchAll } from "./buscador.js";
import { createEventCard } from "./eventos.js";

// Obtener query param
function getQueryParam(name) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return urlSearchParams.get(name) || "";
}

// Función para verificar si un evento está ocurriendo ahora
function isEventOcurriendo(event) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Verificar si el evento tiene fecha de inicio
  if (!event.fechaInicio) return false;
  
  // Convertir la fecha de inicio a objeto Date
  const fechaInicio = event.fechaInicio.toDate();
  
  // Verificar si es el día del evento
  const esHoy = fechaInicio.getFullYear() === today.getFullYear() &&
                fechaInicio.getMonth() === today.getMonth() &&
                fechaInicio.getDate() === today.getDate();
  
  if (!esHoy) return false;
  
  // Verificar si tiene hora de inicio y hora de fin
  if (!event.time || !event.endTime) return false;
  
  // Obtener las horas de inicio y fin
  const [horaInicio, minutoInicio] = event.time.split(':').map(Number);
  const [horaFin, minutoFin] = event.endTime.split(':').map(Number);
  
  // Crear objetos Date para las horas de inicio y fin
  const horaInicioEvento = new Date(today);
  horaInicioEvento.setHours(horaInicio, minutoInicio, 0);
  
  const horaFinEvento = new Date(today);
  horaFinEvento.setHours(horaFin, minutoFin, 0);
  
  // Verificar si la hora actual está entre la hora de inicio y fin
  return now >= horaInicioEvento && now <= horaFinEvento;
}

// Función para formatear la fecha
function formatEventDate(event) {
  if (!event.fechaInicio) return '';
  
  const fecha = event.fechaInicio.toDate();
  const hoy = new Date();
  const esHoy = fecha.toDateString() === hoy.toDateString();
  
  if (isEventOcurriendo(event)) {
    return '<span class="text-green-600 font-medium">Ocurriendo ahora</span>';
  }
  
  if (esHoy) {
    return '<span class="text-blue-600 font-medium">Hoy</span>';
  }
  
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function createSimpleCard(item) {
  return `
    <div class="bg-white rounded-2xl shadow-md overflow-hidden transform hover:scale-105 transition-all duration-300 flex flex-col">
      <div class="relative aspect-w-16 aspect-h-9">
        <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-48 object-cover">
        <span class="absolute top-0 right-0 bg-indigo-100 text-indigo-600 px-2 py-1 rounded-bl-lg text-xs uppercase">${item.type}</span>
      </div>
      <div class="p-4 flex-1 flex flex-col">
        <h3 class="text-lg font-bold mb-2 text-gray-800 line-clamp-2">${item.name}</h3>
        <a href="${item.link}" class="mt-auto text-indigo-600 hover:underline text-sm font-medium">Ver más</a>
      </div>
    </div>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const resultsContainer = document.getElementById("search-results-container");
  const query = getQueryParam("query");
  const titleEl = document.getElementById("search-results-title");

  if (titleEl) titleEl.textContent = `Resultados de \"${query}\"`;

  if (!query || !resultsContainer) return;

  resultsContainer.innerHTML = `<p class="text-gray-500 text-center col-span-full">Buscando...</p>`;

  try {
    const results = await searchAll(query, 50);
    if (!results.length) {
      resultsContainer.innerHTML = `<p class="text-gray-500 text-center col-span-full">No se encontraron resultados.</p>`;
      return;
    }

    const cardsHTML = results
      .map((item) => {
        if (item.type === "event") {
          // Reutilizar createEventCard
          const eventCard = createEventCard({ id: item.id, ...item.raw });
          
          // Crear HTML para metadatos y tags
          let additionalInfo = '';
          
          // Agregar fecha formateada
          const fechaFormateada = formatEventDate(item.raw);
          if (fechaFormateada) {
            additionalInfo += `
              <div class="mt-2 text-sm">
                <span class="font-medium text-gray-600">Fecha:</span> ${fechaFormateada}
              </div>
            `;
          }
          
          // Agregar fragmento de descripción si la búsqueda coincide con ella
          const query = getQueryParam("query").toLowerCase();
          if (item.raw.description && item.raw.description.toLowerCase().includes(query)) {
            const description = item.raw.description;
            const index = description.toLowerCase().indexOf(query);
            const start = Math.max(0, index - 50);
            const end = Math.min(description.length, index + query.length + 50);
            let excerpt = description.slice(start, end);
            if (start > 0) excerpt = '...' + excerpt;
            if (end < description.length) excerpt += '...';
            
            additionalInfo += `
              <div class="mt-2 text-sm text-gray-600">
                <span class="font-medium">Descripción:</span> ${excerpt}
              </div>
            `;
          }
          
          // Agregar metadatos si existen
          if (Array.isArray(item.raw.metadata) && item.raw.metadata.length > 0) {
            additionalInfo += `
              <div class="mt-2">
                <span class="text-sm font-medium text-gray-600">Metadatos:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  ${item.raw.metadata.map(meta => `
                    <span class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                      ${meta}
                    </span>
                  `).join('')}
                </div>
              </div>
            `;
          }
          
          // Agregar tags si existen
          if (Array.isArray(item.raw.tags) && item.raw.tags.length > 0) {
            additionalInfo += `
              <div class="mt-2">
                <span class="text-sm font-medium text-gray-600">Etiquetas:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  ${item.raw.tags.map(tag => `
                    <span class="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                      ${tag}
                    </span>
                  `).join('')}
                </div>
              </div>
            `;
          }
          
          // Insertar la información adicional antes del cierre de la tarjeta
          if (additionalInfo) {
            return eventCard.replace('</div>', `${additionalInfo}</div>`);
          }
          
          return eventCard;
        }
        // Para artist o group crear tarjeta simple
        const link =
          item.type === "artist"
            ? `/src/views/artistas/perfil.html?id=${item.id}`
            : `/src/views/agrupaciones/perfil-agrupacion.html?id=${item.id}`;
        return createSimpleCard({ ...item, link });
      })
      .join("");

    resultsContainer.innerHTML = cardsHTML;
  } catch (err) {
    console.error("Error buscando:", err);
    resultsContainer.innerHTML = `<p class="text-red-500 text-center col-span-full">Error al cargar los resultados.</p>`;
  }
}); 