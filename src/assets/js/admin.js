// Funciones de utilidad
async function loadJSON(file) {
    try {
        const response = await fetch(`../data/${file}`);
        if (!response.ok) {
            // Si el archivo no existe, creamos una estructura básica
            if (file === 'artistas.json') {
                return { artistas: [] };
            } else if (file === 'eventos.json') {
                return { eventos: [] };
            }
            throw new Error(`Error al cargar ${file}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al cargar ${file}:`, error);
        // Retornamos una estructura vacía si hay error
        if (file === 'artistas.json') {
            return { artistas: [] };
        } else if (file === 'eventos.json') {
            return { eventos: [] };
        }
        return null;
    }
}

async function saveJSON(file, data) {
    try {
        // Convertimos los datos a JSON
        const jsonString = JSON.stringify(data, null, 2);
        
        // Creamos un objeto Blob con los datos
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Creamos un enlace temporal para descargar el archivo
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file;
        
        // Simulamos un clic para descargar el archivo
        document.body.appendChild(a);
        a.click();
        
        // Limpiamos
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error(`Error al guardar ${file}:`, error);
        return false;
    }
}

// Gestión del Modal
const modal = document.getElementById('formModal');
const formContainer = document.getElementById('formContainer');
const closeModal = document.querySelector('.close-modal');

function showModal() {
    modal.style.display = 'block';
}

function hideModal() {
    modal.style.display = 'none';
    formContainer.innerHTML = '';
}

closeModal.onclick = hideModal;
window.onclick = (event) => {
    if (event.target === modal) {
        hideModal();
    }
};

// Formulario de Artista
function createArtistaForm(artista = null) {
    const isEdit = artista !== null;
    return `
        <h2 class="text-xl font-bold mb-4">${isEdit ? 'Editar' : 'Agregar'} Artista</h2>
        <form id="artistaForm" class="space-y-4">
            <input type="hidden" name="id" value="${isEdit ? artista.id : ''}">
            <div class="form-group">
                <label for="nombre">Nombre</label>
                <input type="text" id="nombre" name="nombre" value="${isEdit ? artista.nombre : ''}">
            </div>
            <div class="form-group">
                <label for="categoria">Categoría</label>
                <input type="text" id="categoria" name="categoria" value="${isEdit ? artista.categoria : ''}">
            </div>
            <div class="form-group">
                <label for="descripcion">Descripción</label>
                <textarea id="descripcion" name="descripcion">${isEdit ? artista.descripcion : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="imagen">URL de la Imagen</label>
                <input type="text" id="imagen" name="imagen" value="${isEdit ? artista.imagen : ''}">
            </div>
            <div class="form-group">
                <label>Redes Sociales</label>
                <div id="redesContainer">
                    ${isEdit && artista.redes ? Object.entries(artista.redes).map(([red, url]) => `
                        <div class="redes-sociales-input">
                            <input type="text" name="redes_${red}" placeholder="${red}" value="${url}">
                            <button type="button" onclick="this.parentElement.remove()">Eliminar</button>
                        </div>
                    `).join('') : ''}
                </div>
                <button type="button" onclick="addRedSocial()" class="btn btn-primary mt-2">Agregar Red Social</button>
            </div>
            <div class="form-group">
                <label for="esNuevoTalento">¿Es nuevo talento?</label>
                <input type="checkbox" id="esNuevoTalento" name="esNuevoTalento" ${isEdit && artista.esNuevoTalento ? 'checked' : ''}>
            </div>
            <div class="form-group">
                <label for="artistGallery">Galería de Imágenes</label>
                <input type="text" id="artistGallery" name="artistGallery" value="${isEdit ? JSON.stringify(artista.gallery) : ''}">
            </div>
            <div class="form-group">
                <label for="artistGalleryPreview">Vista Previa</label>
                <div id="artistGalleryPreview"></div>
            </div>
            <div class="flex justify-end space-x-2">
                <button type="button" onclick="hideModal()" class="btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>
    `;
}

// Formulario de Evento
function createEventoForm(evento = null) {
    const isEdit = evento !== null;
    return `
        <h2 class="text-xl font-bold mb-4">${isEdit ? 'Editar' : 'Agregar'} Evento</h2>
        <form id="eventoForm" class="space-y-4">
            <input type="hidden" name="id" value="${isEdit ? evento.id : ''}">
            <div class="form-group">
                <label for="titulo">Título</label>
                <input type="text" id="titulo" name="titulo" value="${isEdit ? evento.titulo : ''}">
            </div>
            <div class="form-group">
                <label for="categoria">Categoría</label>
                <input type="text" id="categoria" name="categoria" value="${isEdit ? evento.categoria : ''}">
            </div>
            <div class="form-group">
                <label for="descripcion">Descripción</label>
                <textarea id="descripcion" name="descripcion">${isEdit ? evento.descripcion : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="imagen">URL de la Imagen</label>
                <input type="text" id="imagen" name="imagen" value="${isEdit ? evento.imagen : ''}">
            </div>
            <div class="form-group">
                <label for="fecha">Fecha</label>
                <input type="date" id="fecha" name="fecha" value="${isEdit ? evento.fecha : ''}">
            </div>
            <div class="form-group">
                <label for="hora">Hora</label>
                <input type="time" id="hora" name="hora" value="${isEdit ? evento.hora : ''}">
            </div>
            <div class="form-group">
                <label for="lugar">Lugar</label>
                <input type="text" id="lugar" name="lugar" value="${isEdit ? evento.lugar : ''}">
            </div>
            <div class="form-group">
                <label for="patrocina">Patrocina</label>
                <input type="text" id="patrocina" name="patrocina" value="${isEdit ? evento.patrocina : ''}">
            </div>
            <div class="form-group">
                <label for="precio">Precio</label>
                <input type="text" id="precio" name="precio" value="${isEdit ? evento.precio : ''}">
            </div>
            <div class="form-group">
                <label for="capacidad">Capacidad</label>
                <input type="number" id="capacidad" name="capacidad" value="${isEdit ? evento.capacidad : ''}">
            </div>
            <div class="form-group">
                <label>Redes Sociales</label>
                <div id="redesContainer">
                    ${isEdit && evento.redes ? Object.entries(evento.redes).map(([red, url]) => `
                        <div class="redes-sociales-input">
                            <input type="text" name="redes_${red}" placeholder="${red}" value="${url}">
                            <button type="button" onclick="this.parentElement.remove()">Eliminar</button>
                        </div>
                    `).join('') : ''}
                </div>
                <button type="button" onclick="addRedSocial()" class="btn btn-primary mt-2">Agregar Red Social</button>
            </div>
            <div class="form-group">
                <label for="eventArtists">Artistas</label>
                <select id="eventArtists" name="eventArtists" multiple>
                    ${isEdit && evento.artists ? evento.artists.map(artistId => `
                        <option value="${artistId}" selected>${artistId}</option>
                    `).join('') : ''}
                </select>
            </div>
            <div class="flex justify-end space-x-2">
                <button type="button" onclick="hideModal()" class="btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>
    `;
}

// Formulario de Organizador
function createOrganizadorForm(org = null) {
    const isEdit = org !== null;
    return `
        <h2 class="text-xl font-bold mb-4">${isEdit ? 'Editar' : 'Agregar'} Organizador</h2>
        <form id="organizadorForm" class="space-y-4">
            <input type="hidden" name="id" value="${isEdit ? org.id : ''}">
            <div class="form-group">
                <label for="nombre">Nombre</label>
                <input type="text" id="nombre" name="nombre" required value="${isEdit ? org.nombre : ''}">
            </div>
            <div class="form-group">
                <label for="descripcion">Descripción</label>
                <textarea id="descripcion" name="descripcion" required>${isEdit ? org.descripcion : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="imagen">URL de la Imagen</label>
                <input type="text" id="imagen" name="imagen" required value="${isEdit ? org.imagen : ''}">
            </div>
            <div class="form-group">
                <label for="direccion">Dirección</label>
                <input type="text" id="direccion" name="direccion" required value="${isEdit ? org.direccion : ''}">
            </div>
            <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input type="tel" id="telefono" name="telefono" required value="${isEdit ? org.telefono : ''}">
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required value="${isEdit ? org.email : ''}">
            </div>
            <div class="form-group">
                <label>Redes Sociales</label>
                <div id="redesContainer">
                    ${isEdit ? Object.entries(org.redes_sociales).map(([red, url]) => `
                        <div class="redes-sociales-input">
                            <input type="text" name="redes_${red}" placeholder="${red}" value="${url}">
                            <button type="button" onclick="this.parentElement.remove()">Eliminar</button>
                        </div>
                    `).join('') : ''}
                </div>
                <button type="button" onclick="addRedSocial()" class="btn btn-primary mt-2">Agregar Red Social</button>
            </div>
            <div class="flex justify-end space-x-2">
                <button type="button" onclick="hideModal()" class="btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>
    `;
}

// Funciones para mostrar formularios
function showArtistaForm(artista = null) {
    formContainer.innerHTML = createArtistaForm(artista);
    showModal();
    setupArtistaForm(artista);
    
    // Cargar galería si existe
    if (artista && artista.gallery) {
        const artistGalleryInput = document.getElementById('artistGallery');
        const artistGalleryPreview = document.getElementById('artistGalleryPreview');
        if (artistGalleryInput && artistGalleryPreview) {
            artistGalleryInput.value = JSON.stringify(artista.gallery);
            renderGalleryPreview(artista.gallery);
        }
    }
}

function showEventoForm(evento = null) {
    formContainer.innerHTML = createEventoForm(evento);
    showModal();
    setupEventoForm(evento);
    
    // Cargar artistas seleccionados si existen
    if (evento && evento.artists) {
        const artistsSelect = document.getElementById('eventArtists');
        if (artistsSelect) {
            evento.artists.forEach(artistId => {
                const option = artistsSelect.querySelector(`option[value="${artistId}"]`);
                if (option) option.selected = true;
            });
        }
    }
}

function showOrganizadorForm(org = null) {
    formContainer.innerHTML = createOrganizadorForm(org);
    showModal();
    setupOrganizadorForm(org);
}

// Configuración de formularios
function setupArtistaForm(artista) {
    const form = document.getElementById('artistaForm');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        // Validar campos requeridos
        if (!formData.get('nombre') || !formData.get('categoria')) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        const redes = {};
        formData.forEach((value, key) => {
            if (key.startsWith('redes_') && value.trim() !== '') {
                const red = key.replace('redes_', '');
                redes[red] = value;
            }
        });

        const galleryInput = document.getElementById('artistGallery');
        const gallery = galleryInput ? JSON.parse(galleryInput.value || '[]') : [];

        const data = {
            id: formData.get('id') || generateId(formData.get('nombre')),
            nombre: formData.get('nombre'),
            categoria: formData.get('categoria'),
            descripcion: formData.get('descripcion') || '',
            imagen: formData.get('imagen') || 'images/artistas/default.jpg',
            redes: redes,
            esNuevoTalento: formData.get('esNuevoTalento') === 'on',
            gallery: gallery
        };

        try {
            const jsonData = await loadJSON('artistas.json');
            if (artista) {
                const index = jsonData.artistas.findIndex(a => a.id === artista.id);
                if (index !== -1) {
                    jsonData.artistas[index] = data;
                }
            } else {
                jsonData.artistas.push(data);
            }

            if (await saveJSON('artistas.json', jsonData)) {
                loadArtistas();
                hideModal();
                if (window.location.pathname.includes('artistas.html')) {
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error('Error al guardar el artista:', error);
            alert('Error al guardar el artista. Por favor intente nuevamente.');
        }
    };

    // Configurar galería de imágenes
    const artistGalleryInput = document.getElementById('artistGallery');
    const artistGalleryPreview = document.getElementById('artistGalleryPreview');
    const addGalleryImageBtn = document.getElementById('addGalleryImageBtn');

    if (addGalleryImageBtn) {
        addGalleryImageBtn.addEventListener('click', function() {
            const widget = cloudinary.createUploadWidget({
                cloudName: 'dcsjpy3yh',
                uploadPreset: 'vive_aguachica'
            }, (error, result) => {
                if (!error && result && result.event === "success") {
                    const gallery = JSON.parse(artistGalleryInput.value || '[]');
                    gallery.push(result.info.secure_url);
                    artistGalleryInput.value = JSON.stringify(gallery);
                    renderGalleryPreview(gallery);
                }
            });
            widget.open();
        });
    }

    function renderGalleryPreview(gallery) {
        if (!artistGalleryPreview) return;
        
        artistGalleryPreview.innerHTML = '';
        gallery.forEach((url, idx) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'position-relative d-inline-block me-2 mb-2';
            
            const img = document.createElement('img');
            img.src = url;
            img.className = 'rounded';
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.objectFit = 'cover';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-sm position-absolute top-0 end-0';
            deleteBtn.innerHTML = '×';
            deleteBtn.style.padding = '0 5px';
            deleteBtn.style.fontSize = '16px';
            deleteBtn.onclick = (e) => {
                e.preventDefault();
                gallery.splice(idx, 1);
                artistGalleryInput.value = JSON.stringify(gallery);
                renderGalleryPreview(gallery);
            };
            
            imgContainer.appendChild(img);
            imgContainer.appendChild(deleteBtn);
            artistGalleryPreview.appendChild(imgContainer);
        });
    }
}

function setupEventoForm(evento) {
    const form = document.getElementById('eventoForm');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        // Validar campos requeridos
        if (!formData.get('titulo') || !formData.get('fecha') || !formData.get('lugar')) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        const artistsSelect = document.getElementById('eventArtists');
        const selectedArtists = artistsSelect ? Array.from(artistsSelect.selectedOptions).map(opt => opt.value) : [];
        
        const redes = {};
        formData.forEach((value, key) => {
            if (key.startsWith('redes_') && value.trim() !== '') {
                const red = key.replace('redes_', '');
                redes[red] = value;
            }
        });

        // Tomar la fecha tal cual del input para evitar ajustes de zona horaria
        const fechaAjustada = formData.get('fecha');

        const data = {
            id: formData.get('id') || generateId(formData.get('titulo')),
            titulo: formData.get('titulo'),
            categoria: formData.get('categoria') || 'Sin categoría',
            descripcion: formData.get('descripcion') || '',
            imagen: formData.get('imagen') || 'images/eventos/default.jpg',
            fecha: fechaAjustada,
            hora: formData.get('hora') || '00:00',
            lugar: formData.get('lugar'),
            patrocina: formData.get('patrocina') || '',
            precio: formData.get('precio') || 'Gratis',
            capacidad: parseInt(formData.get('capacidad')) || 0,
            artists: selectedArtists,
            redes: redes
        };

        try {
            const jsonData = await loadJSON('eventos.json');
            if (evento) {
                const index = jsonData.eventos.findIndex(e => e.id === evento.id);
                if (index !== -1) {
                    jsonData.eventos[index] = data;
                }
            } else {
                jsonData.eventos.push(data);
            }

            if (await saveJSON('eventos.json', jsonData)) {
                loadEventos();
                hideModal();
                if (window.location.pathname.includes('eventos.html')) {
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error('Error al guardar el evento:', error);
            alert('Error al guardar el evento. Por favor intente nuevamente.');
        }
    };
}

function setupOrganizadorForm(org) {
    const form = document.getElementById('organizadorForm');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        // Validar campos requeridos
        if (!formData.get('nombre') || !formData.get('email')) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        const redes = {};
        formData.forEach((value, key) => {
            if (key.startsWith('redes_') && value.trim() !== '') {
                const red = key.replace('redes_', '');
                redes[red] = value;
            }
        });

        const data = {
            id: formData.get('id') || generateId(formData.get('nombre')),
            nombre: formData.get('nombre'),
            descripcion: formData.get('descripcion') || '',
            imagen: formData.get('imagen') || 'images/organizadores/default.jpg',
            direccion: formData.get('direccion') || '',
            telefono: formData.get('telefono') || '',
            email: formData.get('email'),
            redes: redes
        };

        try {
            const jsonData = await loadJSON('organizadores.json');
            if (org) {
                const index = jsonData.organizadores.findIndex(o => o.id === org.id);
                if (index !== -1) {
                    jsonData.organizadores[index] = data;
                }
            } else {
                jsonData.organizadores.push(data);
            }

            if (await saveJSON('organizadores.json', jsonData)) {
                loadOrganizadores();
                hideModal();
            }
        } catch (error) {
            console.error('Error al guardar el organizador:', error);
            alert('Error al guardar el organizador. Por favor intente nuevamente.');
        }
    };
}

// Función auxiliar para generar IDs
function generateId(text) {
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
}

// Función para agregar campos de redes sociales
function addRedSocial() {
    const container = document.getElementById('redesContainer');
    const div = document.createElement('div');
    div.className = 'redes-sociales-input';
    div.innerHTML = `
        <input type="text" name="redes_nueva" placeholder="Nombre de la red">
        <input type="text" name="redes_url" placeholder="URL">
        <button type="button" onclick="this.parentElement.remove()">Eliminar</button>
    `;
    container.appendChild(div);
}

// Gestión de Artistas
async function loadArtistas() {
    const data = await loadJSON('artistas.json');
    if (!data) return;

    const container = document.getElementById('artistas-list');
    container.innerHTML = '';

    data.artistas.forEach(artista => {
        const div = document.createElement('div');
        div.className = 'bg-white p-4 rounded-lg shadow-sm mb-2';
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-semibold">${artista.nombre}</h3>
                    <p class="text-gray-600">${artista.categoria}</p>
                    <p class="text-sm text-gray-500">${artista.descripcion.substring(0, 100)}...</p>
                </div>
                <div class="space-x-2">
                    <button onclick="editArtista('${artista.id}')" class="btn btn-primary">Editar</button>
                    <button onclick="deleteArtista('${artista.id}')" class="btn btn-danger">Eliminar</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Gestión de Eventos
async function loadEventos() {
    const data = await loadJSON('eventos.json');
    if (!data) return;

    const container = document.getElementById('eventos-list');
    container.innerHTML = '';

    data.eventos.forEach(evento => {
        const div = document.createElement('div');
        div.className = 'bg-white p-4 rounded-lg shadow-sm mb-2';
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-semibold">${evento.titulo}</h3>
                    <p class="text-gray-600">${formatFechaDisplay(evento.fecha)} - ${evento.lugar}</p>
                    <p class="text-sm text-gray-500">${evento.descripcion.substring(0, 100)}...</p>
                </div>
                <div class="space-x-2">
                    <button onclick="editEvento('${evento.id}')" class="btn btn-primary">Editar</button>
                    <button onclick="deleteEvento('${evento.id}')" class="btn btn-danger">Eliminar</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Gestión de Organizadores
async function loadOrganizadores() {
    const data = await loadJSON('organizadores.json');
    if (!data) return;

    const container = document.getElementById('organizadores-list');
    container.innerHTML = '';

    data.organizadores.forEach(org => {
        const div = document.createElement('div');
        div.className = 'bg-white p-4 rounded-lg shadow-sm mb-2';
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-semibold">${org.nombre}</h3>
                    <p class="text-gray-600">${org.direccion}</p>
                </div>
                <div class="space-x-2">
                    <button onclick="editOrganizador('${org.id}')" class="btn btn-primary">Editar</button>
                    <button onclick="deleteOrganizador('${org.id}')" class="btn btn-danger">Eliminar</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadArtistas();
    loadEventos();
    loadOrganizadores();

    // Event listeners para botones de agregar
    document.getElementById('add-artista').addEventListener('click', () => showArtistaForm());
    document.getElementById('add-evento').addEventListener('click', () => showEventoForm());
    document.getElementById('add-organizador').addEventListener('click', () => showOrganizadorForm());
});

// Funciones de edición y eliminación
async function editArtista(id) {
    try {
        const data = await loadJSON('artistas.json');
        const artista = data.artistas.find(a => a.id === id);
        if (artista) {
            showArtistaForm(artista);
        } else {
            alert('No se encontró el artista');
        }
    } catch (error) {
        console.error('Error al cargar el artista:', error);
        alert('Error al cargar el artista. Por favor intente nuevamente.');
    }
}

async function deleteArtista(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este artista?')) {
        try {
            const data = await loadJSON('artistas.json');
            data.artistas = data.artistas.filter(a => a.id !== id);
            if (await saveJSON('artistas.json', data)) {
                loadArtistas();
                if (window.location.pathname.includes('artistas.html')) {
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error('Error al eliminar el artista:', error);
            alert('Error al eliminar el artista. Por favor intente nuevamente.');
        }
    }
}

async function editEvento(id) {
    try {
        const data = await loadJSON('eventos.json');
        const evento = data.eventos.find(e => e.id === id);
        if (evento) {
            showEventoForm(evento);
        } else {
            alert('No se encontró el evento');
        }
    } catch (error) {
        console.error('Error al cargar el evento:', error);
        alert('Error al cargar el evento. Por favor intente nuevamente.');
    }
}

async function deleteEvento(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
        try {
            const data = await loadJSON('eventos.json');
            data.eventos = data.eventos.filter(e => e.id !== id);
            if (await saveJSON('eventos.json', data)) {
                loadEventos();
                if (window.location.pathname.includes('eventos.html')) {
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error('Error al eliminar el evento:', error);
            alert('Error al eliminar el evento. Por favor intente nuevamente.');
        }
    }
}

async function editOrganizador(id) {
    try {
        const data = await loadJSON('organizadores.json');
        const org = data.organizadores.find(o => o.id === id);
        if (org) {
            showOrganizadorForm(org);
        } else {
            alert('No se encontró el organizador');
        }
    } catch (error) {
        console.error('Error al cargar el organizador:', error);
        alert('Error al cargar el organizador. Por favor intente nuevamente.');
    }
}

async function deleteOrganizador(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este organizador?')) {
        try {
            const data = await loadJSON('organizadores.json');
            data.organizadores = data.organizadores.filter(o => o.id !== id);
            if (await saveJSON('organizadores.json', data)) {
                loadOrganizadores();
            }
        } catch (error) {
            console.error('Error al eliminar el organizador:', error);
            alert('Error al eliminar el organizador. Por favor intente nuevamente.');
        }
    }
}

// Inserto helper para formatear fechas de forma segura evitando desfases
function formatFechaDisplay(fechaStr) {
    if (!fechaStr) return '';
    // Si viene en formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
        const [year, month, day] = fechaStr.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day); // Fecha en hora local
        return dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
    // Si ya viene en otro formato, devolver tal cual
    return fechaStr;
} 