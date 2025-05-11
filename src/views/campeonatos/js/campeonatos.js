// Datos de ejemplo para los campeonatos
const campeonatosData = [
    {
        id: 1,
        titulo: "Liga Municipal de Fútbol 8",
        categoria: "micro",
        organizador: "Alcaldía de Aguachica",
        imagen: "../images/campeonatos/liga-municipal.jpg",
        fechaInicio: "2024-05-01",
        fechaFin: "2024-07-30",
        estado: "activo",
        equipos: [
            { id: 1, nombre: "Los Tigres", logo: "../images/equipos/tigres.png" },
            { id: 2, nombre: "Los Leones", logo: "../images/equipos/leones.png" },
            { id: 3, nombre: "Los Águilas", logo: "../images/equipos/aguilas.png" },
            { id: 4, nombre: "Los Toros", logo: "../images/equipos/toros.png" }
        ],
        partidos: [
            {
                id: 1,
                fecha: "2024-05-15",
                hora: "15:00",
                lugar: "Cancha Municipal",
                local: 1,
                visitante: 2,
                marcador: "2-1",
                estado: "finalizado"
            },
            {
                id: 2,
                fecha: "2024-05-15",
                hora: "17:00",
                lugar: "Cancha Municipal",
                local: 3,
                visitante: 4,
                marcador: "1-1",
                estado: "finalizado"
            },
            {
                id: 3,
                fecha: "2024-05-22",
                hora: "15:00",
                lugar: "Cancha Municipal",
                local: 1,
                visitante: 3,
                estado: "pendiente"
            }
        ],
        tablaPosiciones: [
            { equipo: 1, puntos: 6, pj: 2, pg: 2, pe: 0, pp: 0, gf: 5, gc: 2 },
            { equipo: 2, puntos: 3, pj: 2, pg: 1, pe: 0, pp: 1, gf: 3, gc: 3 },
            { equipo: 3, puntos: 1, pj: 2, pg: 0, pe: 1, pp: 1, gf: 2, gc: 4 },
            { equipo: 4, puntos: 1, pj: 2, pg: 0, pe: 1, pp: 1, gf: 2, gc: 3 }
        ]
    },
    {
        id: 2,
        titulo: "Torneo Interbarrios de Fútbol",
        categoria: "futbol",
        organizador: "Comité Deportivo Local",
        imagen: "../images/campeonatos/interbarrios.jpg",
        fechaInicio: "2024-06-01",
        fechaFin: "2024-08-30",
        estado: "proximamente",
        equipos: [
            { id: 5, nombre: "Barrio Centro", logo: "../images/equipos/centro.png" },
            { id: 6, nombre: "Barrio Norte", logo: "../images/equipos/norte.png" },
            { id: 7, nombre: "Barrio Sur", logo: "../images/equipos/sur.png" },
            { id: 8, nombre: "Barrio Este", logo: "../images/equipos/este.png" }
        ],
        partidos: [],
        tablaPosiciones: []
    }
];

// Función para renderizar los campeonatos
function renderCampeonatos(campeonatos) {
    const container = document.getElementById('campeonatos-container');
    container.innerHTML = '';

    campeonatos.forEach(campeonato => {
        const card = document.createElement('div');
        card.className = 'campeonato-card';
        card.innerHTML = `
            <div class="campeonato-header">
                <img src="${campeonato.imagen}" alt="${campeonato.titulo}">
                <span class="campeonato-category">${campeonato.categoria === 'micro' ? 'Fútbol 8' : 'Fútbol'}</span>
            </div>
            <div class="campeonato-content">
                <h3 class="campeonato-title">${campeonato.titulo}</h3>
                <p class="campeonato-organizer">Organizado por: ${campeonato.organizador}</p>
                <div class="campeonato-dates">
                    <span>Inicio: ${formatDate(campeonato.fechaInicio)}</span>
                    <span>Fin: ${formatDate(campeonato.fechaFin)}</span>
                </div>
                <div class="campeonato-teams">
                    ${campeonato.equipos.map(equipo => `
                        <span class="team-badge">${equipo.nombre}</span>
                    `).join('')}
                </div>
                <button class="ver-detalles-btn" data-id="${campeonato.id}">
                    Ver Detalles
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    // Agregar event listeners a los botones de detalles
    document.querySelectorAll('.ver-detalles-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const campeonatoId = parseInt(btn.dataset.id);
            const campeonato = campeonatosData.find(c => c.id === campeonatoId);
            showCampeonatoDetails(campeonato);
        });
    });
}

// Función para mostrar los detalles de un campeonato
function showCampeonatoDetails(campeonato) {
    const modal = document.getElementById('campeonato-modal');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
        <div class="modal-section">
            <h2 class="modal-section-title">${campeonato.titulo}</h2>
            <div class="flex items-center gap-4 mb-4">
                <span class="estado-badge estado-${campeonato.estado}">
                    ${getEstadoText(campeonato.estado)}
                </span>
                <span class="text-gray-600">Organizado por: ${campeonato.organizador}</span>
            </div>
            <p class="text-gray-600 mb-4">
                Del ${formatDate(campeonato.fechaInicio)} al ${formatDate(campeonato.fechaFin)}
            </p>
        </div>

        <div class="modal-section">
            <h3 class="modal-section-title">Tabla de Posiciones</h3>
            <table class="posiciones-table">
                <thead>
                    <tr>
                        <th>Equipo</th>
                        <th>PJ</th>
                        <th>PG</th>
                        <th>PE</th>
                        <th>PP</th>
                        <th>GF</th>
                        <th>GC</th>
                        <th>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    ${campeonato.tablaPosiciones.map(pos => `
                        <tr>
                            <td>${getEquipoNombre(campeonato.equipos, pos.equipo)}</td>
                            <td>${pos.pj}</td>
                            <td>${pos.pg}</td>
                            <td>${pos.pe}</td>
                            <td>${pos.pp}</td>
                            <td>${pos.gf}</td>
                            <td>${pos.gc}</td>
                            <td>${pos.puntos}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="modal-section">
            <h3 class="modal-section-title">Próximos Partidos</h3>
            <div class="calendario-grid">
                ${groupPartidosByDate(campeonato.partidos).map(grupo => `
                    <div class="dia-partidos">
                        <h4 class="dia-titulo">${formatDate(grupo.fecha)}</h4>
                        ${grupo.partidos.map(partido => `
                            <div class="partido-card">
                                <div class="partido-header">
                                    <span class="partido-fecha">${partido.hora}</span>
                                    <span class="partido-estado">${getEstadoPartido(partido.estado)}</span>
                                </div>
                                <div class="partido-equipos">
                                    <div class="partido-equipo">
                                        <img src="${getEquipoLogo(campeonato.equipos, partido.local)}" alt="Local">
                                        <span>${getEquipoNombre(campeonato.equipos, partido.local)}</span>
                                    </div>
                                    <span class="partido-marcador">${partido.marcador || 'vs'}</span>
                                    <div class="partido-equipo">
                                        <span>${getEquipoNombre(campeonato.equipos, partido.visitante)}</span>
                                        <img src="${getEquipoLogo(campeonato.equipos, partido.visitante)}" alt="Visitante">
                                    </div>
                                </div>
                                <p class="partido-info">Lugar: ${partido.lugar}</p>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

// Función para cerrar el modal
function closeModal() {
    const modal = document.getElementById('campeonato-modal');
    modal.classList.add('hidden');
}

// Función para filtrar campeonatos por categoría
function filterCampeonatos(category) {
    if (category === 'todos') {
        renderCampeonatos(campeonatosData);
    } else {
        const filtered = campeonatosData.filter(c => c.categoria === category);
        renderCampeonatos(filtered);
    }
}

// Funciones auxiliares
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function getEstadoText(estado) {
    const estados = {
        activo: 'En Curso',
        finalizado: 'Finalizado',
        proximamente: 'Próximamente'
    };
    return estados[estado] || estado;
}

function getEstadoPartido(estado) {
    const estados = {
        finalizado: 'Finalizado',
        pendiente: 'Pendiente',
        en_curso: 'En Curso'
    };
    return estados[estado] || estado;
}

function getEquipoNombre(equipos, equipoId) {
    const equipo = equipos.find(e => e.id === equipoId);
    return equipo ? equipo.nombre : 'Desconocido';
}

function getEquipoLogo(equipos, equipoId) {
    const equipo = equipos.find(e => e.id === equipoId);
    return equipo ? equipo.logo : '../images/equipos/default.png';
}

function groupPartidosByDate(partidos) {
    const grupos = {};
    partidos.forEach(partido => {
        if (!grupos[partido.fecha]) {
            grupos[partido.fecha] = {
                fecha: partido.fecha,
                partidos: []
            };
        }
        grupos[partido.fecha].partidos.push(partido);
    });
    return Object.values(grupos);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Renderizar campeonatos iniciales
    renderCampeonatos(campeonatosData);

    // Event listeners para los botones de categoría
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active', 'bg-indigo-100', 'text-indigo-600'));
            btn.classList.add('active', 'bg-indigo-100', 'text-indigo-600');
            filterCampeonatos(btn.dataset.category);
        });
    });

    // Event listener para cerrar el modal
    document.getElementById('close-modal').addEventListener('click', closeModal);
}); 