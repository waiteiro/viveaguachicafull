import { db } from './src/views/js/firebase-init.js';
import { collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    let todosLosSitios = [];

    async function fetchSites() {
        try {
            const q = query(collection(db, 'sites'), orderBy('name', 'asc'));
            const snap = await getDocs(q);
            todosLosSitios = snap.docs.map(docu => {
                const d = docu.data();
                return {
                    id: docu.id,
                    nombre: d.name || 'Sin nombre',
                    imagen: d.featuredImageUrl || d.logoImageUrl || 'https://via.placeholder.com/300x200?text=No+Img',
                    direccion: d.exactAddress || '',
                    categoria: d.mainCategory || 'otro',
                    tags: d.subcategoriesTags || [],
                    horarios: d.hours || {},
                    descripcion: d.shortDescription || d.fullDescription || '',
                    destacado: d.tagsUseful?.recommendedByVA || false,
                    recomendadoSemana: false,
                    eventoProximo: (d.upcomingEventsRef && d.upcomingEventsRef.length) ? d.upcomingEventsRef[0] : false
                };
            });
        } catch(e){ console.error('Error cargando sitios:', e); }
    }

    // Contenedores de las grillas
    const gridDestacados = document.getElementById('gridDestacados');
    const gridRecomendadosSemana = document.getElementById('gridRecomendadosSemana');
    const gridConEventos = document.getElementById('gridConEventos');
    const gridPorCategoria = document.getElementById('gridPorCategoria');
    const gridAbiertosAhora = document.getElementById('gridAbiertosAhora');

    // Elementos de UI para filtros y búsqueda
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const categoryFilter = document.getElementById('categoryFilter');
    const categoriasTabsContainer = document.querySelector('.categorias-tabs');

    // --- FUNCIÓN PARA CREAR TARJETAS DE SITIO ---
    function crearTarjetaSitio(sitio) {
        const card = document.createElement('article');
        card.classList.add('site-card');
        card.innerHTML = `
            <img src="${sitio.imagen}" alt="${sitio.nombre}">
            <div class="card-content">
                <h3>${sitio.nombre}</h3>
                <p class="category" data-category="${sitio.categoria}">${sitio.categoria.charAt(0).toUpperCase() + sitio.categoria.slice(1)}</p>
                <p class="address">${sitio.direccion}</p>
                <p class="description">${sitio.descripcion}</p>
                <div class="tags">
                    ${sitio.tags.map(tag => `<span>${tag}</span>`).join('')}
                </div>
                <p class="hours">Horario hoy: ${obtenerHorarioHoy(sitio.horarios)}</p>
                ${sitio.eventoProximo ? `<p class="evento-proximo"><strong>Próximo Evento:</strong> ${sitio.eventoProximo}</p>` : ''}
            </div>
        `;
        return card;
    }

    // --- FUNCIÓN PARA MOSTRAR SITIOS EN UNA GRILLA ---
    function mostrarSitios(sitios, contenedor) {
        if (!contenedor) return;
        contenedor.innerHTML = ''; // Limpiar contenedor
        if (sitios.length === 0) {
            contenedor.innerHTML = '<p>No hay sitios para mostrar en esta sección.</p>';
            return;
        }
        sitios.forEach(sitio => {
            const tarjeta = crearTarjetaSitio(sitio);
            contenedor.appendChild(tarjeta);
        });
    }

    // --- LÓGICA PARA HORARIOS Y SITIOS ABIERTOS ---
    function obtenerNombreDia(date) {
        const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        return dias[date.getDay()];
    }

    function obtenerHorarioHoy(horarios) {
        if (!horarios || Object.keys(horarios).length === 0) return 'No disponible';
        const hoy = new Date();
        const nombreDiaHoy = obtenerNombreDia(hoy);
        return horarios[nombreDiaHoy] || 'Cerrado hoy / No especificado';
    }

    function estaAbiertoAhora(sitio) {
        if (!sitio.horarios || Object.keys(sitio.horarios).length === 0) return false;
        
        const ahora = new Date();
        const diaActual = obtenerNombreDia(ahora);
        const horarioDelDia = sitio.horarios[diaActual];

        if (!horarioDelDia || horarioDelDia.toLowerCase() === 'cerrado') return false;
        if (horarioDelDia.toLowerCase() === '24 horas' || horarioDelDia.toLowerCase() === 'abierto 24h') return true;

        // Asumimos formato HH:MM-HH:MM
        const partes = horarioDelDia.split('-');
        if (partes.length !== 2) return false; // Formato inválido

        try {
            const [horaAperturaStr, horaCierreStr] = partes;
            const [aperturaH, aperturaM] = horaAperturaStr.split(':').map(Number);
            const [cierreH, cierreM] = horaCierreStr.split(':').map(Number);

            const fechaApertura = new Date(ahora);
            fechaApertura.setHours(aperturaH, aperturaM, 0, 0);

            const fechaCierre = new Date(ahora);
            fechaCierre.setHours(cierreH, cierreM, 0, 0);

            // Si el cierre es al día siguiente (ej. 20:00 - 02:00)
            if (fechaCierre < fechaApertura) {
                fechaCierre.setDate(fechaCierre.getDate() + 1);
            }

            return ahora >= fechaApertura && ahora < fechaCierre;

        } catch (e) {
            console.error("Error parseando horario: ", horarioDelDia, e);
            return false; // Error en formato de hora
        }
    }

    // --- CARGAR DATOS INICIALES (DEBERÁS MODIFICAR ESTO PARA FIREBASE) ---
    function cargarDatosIniciales() {
        // Simulación de carga desde Firebase
        // Aquí llamarías a Firebase y luego ejecutarías las funciones de mostrar
        const sitiosDestacados = todosLosSitios.filter(s => s.destacado);
        const sitiosRecomendados = todosLosSitios.filter(s => s.recomendadoSemana);
        const sitiosConEventos = todosLosSitios.filter(s => s.eventoProximo);
        const sitiosAbiertos = todosLosSitios.filter(estaAbiertoAhora);
        
        mostrarSitios(sitiosDestacados, gridDestacados);
        mostrarSitios(sitiosRecomendados, gridRecomendadosSemana);
        mostrarSitios(sitiosConEventos, gridConEventos);
        mostrarSitios(sitiosAbiertos, gridAbiertosAhora);
        mostrarSitios(todosLosSitios, gridPorCategoria); // Inicialmente muestra todos en "por categoría"
    }

    // --- FILTRADO Y BÚSQUEDA ---
    function filtrarYBuscar() {
        let sitiosFiltrados = [...todosLosSitios]; // Copia para no modificar el original
        const terminoBusqueda = searchInput.value.toLowerCase();
        const categoriaSeleccionada = categoryFilter.value;
        const categoriaActivaTab = document.querySelector('.tab-categoria.active')?.dataset.category || 'todos';

        // Filtrar por búsqueda de texto
        if (terminoBusqueda) {
            sitiosFiltrados = sitiosFiltrados.filter(sitio => 
                sitio.nombre.toLowerCase().includes(terminoBusqueda) ||
                sitio.descripcion.toLowerCase().includes(terminoBusqueda) ||
                sitio.tags.some(tag => tag.toLowerCase().includes(terminoBusqueda))
            );
        }

        // Filtrar por categoría del dropdown (afecta a todas las grillas si se desea, o a una específica)
        // Por ahora, lo usamos para la sección "Por Categoría" si no hay tab activa, o para un filtro general
        if (categoriaSeleccionada !== 'todos') {
             // Si la sección "Por Categoría" es la que estamos viendo y no hay tab, usa el dropdown
            if (gridPorCategoria) { // Verificamos que el contenedor exista
                 const sitiosParaCategoria = todosLosSitios.filter(s => s.categoria === categoriaSeleccionada);
                 mostrarSitios(sitiosParaCategoria, gridPorCategoria);
            } // Podrías querer que este filtro afecte a otras secciones también.
        }
        
        // Filtrar por pestaña de categoría (para la sección "Sitios por Categoría")
        if (gridPorCategoria) { // Asegurar que el contenedor exista
            let sitiosParaGridCategoria = [...todosLosSitios];
            if (categoriaActivaTab !== 'todos') {
                sitiosParaGridCategoria = sitiosParaGridCategoria.filter(s => s.categoria === categoriaActivaTab);
            }
            // Aplicar también el término de búsqueda al grid de categorías
            if (terminoBusqueda) {
                sitiosParaGridCategoria = sitiosParaGridCategoria.filter(sitio => 
                    sitio.nombre.toLowerCase().includes(terminoBusqueda) ||
                    sitio.descripcion.toLowerCase().includes(terminoBusqueda) ||
                    sitio.tags.some(tag => tag.toLowerCase().includes(terminoBusqueda))
                );
            }
            mostrarSitios(sitiosParaGridCategoria, gridPorCategoria);
        }
        
        // Nota: La lógica de búsqueda/filtro podría necesitar refinamiento
        // para decidir cómo interactúan el search global, el filtro de dropdown y las tabs.
        // Por ahora, el searchInput afecta a la sección "Por Categoría" cuando se escribe.
        // El dropdown de categoría afecta a la sección "Por Categoría" al cambiarlo.
        // Las tabs de categoría filtran la sección "Por Categoría".
    }

    // --- EVENT LISTENERS ---
    if (searchButton) {
        searchButton.addEventListener('click', filtrarYBuscar);
    }
    if (searchInput) {
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                filtrarYBuscar();
            }
            // Podrías llamar a filtrarYBuscar() aquí directamente para búsqueda en tiempo real
            // pero puede ser costoso. Por ahora, se activa con botón o Enter.
            // Opcional: búsqueda en tiempo real tras un pequeño delay.
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filtrarYBuscar);
    }

    if (categoriasTabsContainer) {
        categoriasTabsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-categoria')) {
                // Remover clase 'active' de la pestaña anterior
                const tabActivaActual = categoriasTabsContainer.querySelector('.tab-categoria.active');
                if (tabActivaActual) tabActivaActual.classList.remove('active');
                
                // Añadir 'active' a la nueva pestaña
                e.target.classList.add('active');
                filtrarYBuscar(); // Volver a filtrar/buscar con la nueva categoría de pestaña
            }
        });
    }

    // Cargar datos cuando el DOM esté listo
    fetchSites().then(() => {
        cargarDatosIniciales();
    });

    // TODO: Integración con Firebase
    // 1. Configura tu SDK de Firebase.
    // 2. En lugar de 'todosLosSitios', obtén tus datos de Firestore o Realtime Database.
    // 3. Adapta las funciones 'cargarDatosIniciales' y 'filtrarYBuscar' para que usen los datos de Firebase.
    // 4. Considera la carga asíncrona de datos (promesas, async/await).
}); 