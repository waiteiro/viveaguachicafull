// Función para obtener el ID de la agrupación de la URL
function obtenerIdAgrupacion() {
    const path = window.location.pathname;
    const match = path.match(/agrupaciones\/(\d+)\.html/);
    return match ? parseInt(match[1]) : null;
}

// Función para cargar los datos de la agrupación
function cargarDatosAgrupacion(id) {
    // En producción, esto sería una llamada a la API
    const agrupacion = agrupaciones.find(a => a.id === id);
    if (!agrupacion) {
        window.location.href = '/404.html';
        return;
    }

    // Actualizar metadatos
    document.title = `${agrupacion.nombre} | Vive Aguachica`;
    document.querySelector('meta[name="description"]').content = 
        `${agrupacion.nombre} - ${agrupacion.descripcion}`;

    // Actualizar contenido
    document.getElementById('agrupacion-imagen').src = `../${agrupacion.imagen}`;
    document.getElementById('agrupacion-imagen').alt = agrupacion.nombre;
    document.getElementById('agrupacion-nombre').textContent = agrupacion.nombre;
    document.getElementById('agrupacion-genero').textContent = agrupacion.genero;
    document.getElementById('agrupacion-descripcion').textContent = agrupacion.descripcion;

    // Cargar integrantes
    cargarIntegrantes(agrupacion.integrantes);
}

// Función para cargar los integrantes
function cargarIntegrantes(integrantesIds) {
    const container = document.getElementById('agrupacion-integrantes');
    
    // En producción, esto sería una llamada a la API
    const integrantes = integrantesIds.map(id => {
        // Simulación de datos de artistas
        return {
            id,
            nombre: `Artista ${id}`,
            imagen: `../images/artistas/artista${id}.jpg`,
            rol: 'Miembro'
        };
    });

    container.innerHTML = integrantes.map(integrante => `
        <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <img src="${integrante.imagen}" alt="${integrante.nombre}" 
                class="w-16 h-16 rounded-full object-cover">
            <div>
                <h3 class="font-medium">${integrante.nombre}</h3>
                <p class="text-sm text-gray-500">${integrante.rol}</p>
                <a href="../artistas/${integrante.id}.html" 
                    class="text-sm text-indigo-600 hover:text-indigo-800">
                    Ver perfil
                </a>
            </div>
        </div>
    `).join('');
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const id = obtenerIdAgrupacion();
    if (id) {
        cargarDatosAgrupacion(id);
    } else {
        window.location.href = '/404.html';
    }
}); 