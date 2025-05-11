import { collection, getDocs, query as fsQuery, limit } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from "./firebase.js";

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
  
  // Verificar si el evento ha finalizado
  const eventoFinalizado = fecha < hoy;
  if (eventoFinalizado) {
    return '<span class="text-red-600 font-medium">Finalizado</span>';
  }
  
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

function getNombreSeguro(data, tipo) {
  if (tipo === 'artist') {
    const posibles = [data.name, data.nombre];
    for (const val of posibles) {
      if (typeof val === 'string' && val.trim().length > 0) return val.trim();
    }
    return "Sin nombre";
  } else if (tipo === 'group') {
    return (typeof data.nombre === 'string' && data.nombre.trim().length > 0) ? data.nombre.trim() : "Sin nombre";
  } else {
    // event
    const posibles = [data.title, data.titulo, data.nombre];
    for (const val of posibles) {
      if (typeof val === 'string' && val.trim().length > 0) return val.trim();
    }
    return "Sin nombre";
  }
}

/**
 * Devuelve una lista de resultados que coinciden con la consulta.
 * Cada resultado tiene: { id, name, imageUrl, type }
 */
export async function searchAll(query, maxPerCollection = 20) {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  // Helper para obtener el valor de un campo, soportando notación de punto
  function getValorCampo(obj, path) {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  // Helper para filtrar documentos localmente
  const filterDocs = (snap, fields, imageField, type) => {
    const results = [];
    snap.forEach((d) => {
      const data = d.data();
      let found = false;
      
      // Buscar en campos normales
      for (const fieldName of fields) {
        const valor = getValorCampo(data, fieldName);
        if (typeof valor === 'string' && valor.toLowerCase().includes(term)) {
          found = true;
          break;
        }
      }

      // Buscar en metadatos si existe
      if (!found && data.metadata && Array.isArray(data.metadata)) {
        if (data.metadata.some(meta => meta.toLowerCase().includes(term))) {
          found = true;
        }
      }

      // Buscar en tags si existe
      if (!found && Array.isArray(data.tags)) {
        if (data.tags.some(tag => tag.toLowerCase().includes(term))) {
          found = true;
        }
      }

      if (found) {
        results.push({
          id: d.id,
          name: getNombreSeguro(data, type),
          imageUrl: data[imageField] || data.imageUrl || data.imagen || "../src/assets/images/placeholder.jpg",
          type,
          raw: data
        });
      }
    });
    return results;
  };

  // Consultas paralelas
  const [eventsSnap, artistsSnap, groupsSnap] = await Promise.all([
    getDocs(fsQuery(collection(db, "events"), limit(maxPerCollection))),
    getDocs(fsQuery(collection(db, "artists"), limit(maxPerCollection))),
    getDocs(fsQuery(collection(db, "agrupaciones"), limit(maxPerCollection))),
  ]);

  // Buscar en varios campos para eventos
  const eventsRes = filterDocs(
    eventsSnap,
    [
      "title", "titulo", "nombre", // títulos
      "description", "descripcion", // descripciones
      "location", "lugar", "address", "direccion", // direcciones
      "organizer", "organizer.nombre", "organizador", // organizadores
      "patrocina", "patrocinador", "sponsor" // patrocinadores
    ],
    "imageUrl",
    "event"
  );
  const artistsRes = filterDocs(artistsSnap, ["name", "nombre"], "imageUrl", "artist");
  const groupsRes = filterDocs(groupsSnap, ["nombre"], "imagen", "group");

  return [...eventsRes, ...artistsRes, ...groupsRes];
}

// -----------------------------------------------------------------------------
// Funcionalidad de buscador con sugerencias
// -----------------------------------------------------------------------------
const searchInput = document.querySelector("#search-input");
const searchForm = document.querySelector("#search-form");
const searchContainer = document.querySelector("#search-container");

if (searchInput && searchForm && searchContainer) {
  // Crear contenedor de sugerencias
  const suggestionsBox = document.createElement("div");
  suggestionsBox.id = "search-suggestions";
  suggestionsBox.className =
    "fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[100] max-h-[80vh] overflow-y-auto hidden";
  document.body.appendChild(suggestionsBox);

  const positionSuggestionsBox = () => {
    const rect = searchInput.getBoundingClientRect();
    const containerRect = searchContainer.getBoundingClientRect();
    
    // Calcular la posición vertical
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Si hay más espacio abajo, mostrar debajo del input
    if (spaceBelow >= 300 || spaceBelow > spaceAbove) {
      suggestionsBox.style.top = rect.bottom + 'px';
      suggestionsBox.style.maxHeight = Math.min(spaceBelow - 20, 400) + 'px';
    } else {
      // Si hay más espacio arriba, mostrar encima del input
      suggestionsBox.style.bottom = (window.innerHeight - rect.top) + 'px';
      suggestionsBox.style.maxHeight = Math.min(spaceAbove - 20, 400) + 'px';
    }
    
    // Posicionar horizontalmente
    suggestionsBox.style.left = containerRect.left + 'px';
    suggestionsBox.style.width = containerRect.width + 'px';
  };

  const hideSuggestions = () => {
    suggestionsBox.classList.add("hidden");
  };

  const showSuggestions = (items) => {
    if (!items.length) {
      hideSuggestions();
      return;
    }
    // Diccionario para traducir los tipos
    const tipoTraducido = {
      event: 'EVENTO',
      artist: 'ARTISTA',
      group: 'AGRUPACIÓN'
    };
    suggestionsBox.innerHTML = items
      .slice(0, 10)
      .map((item) => {
        let fechaHTML = '';
        if (item.type === 'event') {
          const fechaFormateada = formatEventDate(item.raw);
          if (fechaFormateada) {
            fechaHTML = `<div class="text-xs text-gray-500">${fechaFormateada}</div>`;
          }
        }
        return `
          <button class="w-full flex items-center gap-3 px-4 py-2 hover:bg-indigo-50 text-left" data-id="${item.id}" data-type="${item.type}">
            <img src="${item.imageUrl}" class="w-8 h-8 object-cover rounded-full flex-shrink-0" alt="${item.name}">
            <div class="flex-1 min-w-0">
              <div class="text-sm text-gray-800 line-clamp-1">${item.name}</div>
              ${fechaHTML}
              <span class="text-xs uppercase text-gray-400">${tipoTraducido[item.type] || item.type}</span>
            </div>
          </button>`;
      })
      .join("");
    positionSuggestionsBox();
    suggestionsBox.classList.remove("hidden");
  };

  // Navegar a la vista apropiada
  const navigateToItem = (id, type) => {
    switch (type) {
      case "event":
        window.location.href = `detalle-evento.html?id=${id}`;
        break;
      case "artist":
        window.location.href = `/src/views/artistas/perfil.html?id=${id}`;
        break;
      case "group":
        window.location.href = `/src/views/agrupaciones/perfil-agrupacion.html?id=${id}`;
        break;
    }
  };

  // Delegación de clic para sugerencias
  suggestionsBox.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    const type = btn.dataset.type;
    navigateToItem(id, type);
  });

  // Debounce helper
  let debounceTimer;
  const debounceInput = (e) => {
    const value = e.target.value;
    clearTimeout(debounceTimer);
    if (value.trim().length < 2) {
      hideSuggestions();
      showClearBtn();
      return;
    }
    debounceTimer = setTimeout(async () => {
      const results = await searchAll(value, 50);
      showSuggestions(results);
      showClearBtn();
    }, 300);
  };

  searchInput.addEventListener("input", debounceInput);
  searchInput.addEventListener("focus", () => {
    if (suggestionsBox.innerHTML.trim() !== "") {
      positionSuggestionsBox();
      suggestionsBox.classList.remove("hidden");
    }
    showClearBtn();
  });
  window.addEventListener("resize", positionSuggestionsBox);
  window.addEventListener("scroll", positionSuggestionsBox);
  document.addEventListener("click", (e) => {
    if (!searchContainer.contains(e.target) && !suggestionsBox.contains(e.target)) hideSuggestions();
  });

  // Limpiar con ESC
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      hideSuggestions();
      showClearBtn();
      searchInput.focus();
    }
  });

  // Botón X para limpiar
  let clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
  clearBtn.className = 'absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow hover:bg-gray-100 focus:outline-none z-10';
  clearBtn.style.display = 'none';
  clearBtn.setAttribute('aria-label', 'Limpiar búsqueda');
  clearBtn.onclick = () => {
    searchInput.value = "";
    hideSuggestions();
    showClearBtn();
    searchInput.focus();
  };
  searchContainer.style.position = 'relative';
  searchContainer.appendChild(clearBtn);

  function showClearBtn() {
    if (searchInput.value.trim().length > 0) {
      clearBtn.style.display = '';
    } else {
      clearBtn.style.display = 'none';
    }
  }

  // Deshabilitar enter y el botón de la lupa
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // No hacer nada
  });
  const searchBtn = searchForm.querySelector('button[type="submit"]');
  if (searchBtn) {
    searchBtn.type = 'button';
    searchBtn.tabIndex = -1;
    searchBtn.style.cursor = 'not-allowed';
    searchBtn.onclick = (e) => { e.preventDefault(); };
  }

  // Hacer el input un poco más pequeño
  searchInput.classList.add('text-sm');
  searchInput.style.paddingTop = '0.4rem';
  searchInput.style.paddingBottom = '0.4rem';
  searchInput.style.height = '2.1rem';
  searchInput.style.fontSize = '0.95rem';
} 