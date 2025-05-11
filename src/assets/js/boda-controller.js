import bodaData from './boda-data.js';

class BodaController {
    constructor() {
        this.categorias = Object.keys(bodaData);
        this.selecciones = new Map();
        this.filtrosActivos = new Set();
        this.categoriaActual = null;
        this.initialize();
    }

    initialize() {
        const mainContent = document.querySelector('.boda-content');
        if (!mainContent) {
            console.error('No se encontró el contenedor principal');
            return;
        }

        this.renderMenuLateral();
        this.setupEventListeners();
        this.mostrarCategoria('lugares'); // Mostrar la primera categoría por defecto
    }

    renderMenuLateral() {
        const mainContent = document.querySelector('.boda-content');
        const menuLateral = document.createElement('div');
        menuLateral.className = 'boda-sidebar';
        menuLateral.innerHTML = `
            <h3>Categorías</h3>
            <ul>
                ${this.categorias.map(cat => `
                    <li>
                        <button class="categoria-btn ${this.categoriaActual === cat ? 'active' : ''}"
                                data-categoria="${cat}">
                            ${this.getNombreCategoria(cat)}
                        </button>
                    </li>
                `).join('')}
            </ul>
        `;
        mainContent.appendChild(menuLateral);
    }

    getNombreCategoria(categoria) {
        const nombres = {
            lugares: '📍 Lugares',
            vestuario: '👗 Vestuario',
            maquillaje: '💄 Maquillaje',
            decoracion: '🎨 Decoración',
            catering: '🍽️ Catering',
            musica: '🎶 Música',
            agrupaciones: '🎵 Agrupaciones',
            animacion: '🎭 Animación',
            fotografia: '📸 Fotografía',
            transporte: '🚗 Transporte',
            efectos: '✨ Efectos',
            recordatorios: '🎁 Recordatorios',
            logistica: '📋 Logística'
        };
        return nombres[categoria] || categoria;
    }

    setupEventListeners() {
        document.querySelectorAll('.categoria-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoria = e.target.dataset.categoria;
                this.mostrarCategoria(categoria);
            });
        });
    }

    mostrarCategoria(categoria) {
        this.categoriaActual = categoria;
        const mainContent = document.querySelector('.boda-content');
        const menuLateral = mainContent.querySelector('.boda-sidebar');
        
        // Crear contenedor principal si no existe
        let contenedorPrincipal = mainContent.querySelector('.boda-main');
        if (!contenedorPrincipal) {
            contenedorPrincipal = document.createElement('div');
            contenedorPrincipal.className = 'boda-main';
            mainContent.appendChild(contenedorPrincipal);
        }
        
        // Renderizar filtros y tarjetas
        const filtrosHTML = this.renderFiltros(categoria);
        const tarjetasHTML = this.renderTarjetas(categoria);
        
        contenedorPrincipal.innerHTML = `
            <div class="boda-filters-container">
                <h2>${this.getNombreCategoria(categoria)}</h2>
                <div class="boda-filters">
                    ${filtrosHTML}
                </div>
            </div>
            <div class="boda-cards">
                ${tarjetasHTML}
            </div>
        `;

        // Actualizar clase active en el menú lateral
        document.querySelectorAll('.categoria-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.categoria === categoria);
        });

        // Agregar event listeners para los filtros y selecciones
        this.setupFiltrosEventListeners();
        this.setupSeleccionEventListeners();
    }

    renderFiltros(categoria) {
        const filtros = new Set();
        bodaData[categoria].forEach(item => {
            item.filtros.forEach(filtro => filtros.add(filtro));
        });

        return Array.from(filtros).map(filtro => `
            <button class="filtro-btn ${this.filtrosActivos.has(filtro) ? 'active' : ''}"
                    data-filtro="${filtro}">
                ${this.getNombreFiltro(filtro)}
            </button>
        `).join('');
    }

    getNombreFiltro(filtro) {
        const nombres = {
            'interior': 'Interior',
            'exterior': 'Exterior',
            'capacidad+50': 'Capacidad +50',
            'capacidad+100': 'Capacidad +100',
            'capacidad+200': 'Capacidad +200',
            'parqueadero': 'Con parqueadero',
            'piscina': 'Con piscina',
            'vestido-novia': 'Vestido de novia',
            'traje-novio': 'Traje del novio',
            'alquiler': 'Alquiler',
            'personalizado': 'Personalizado',
            'a-domicilio': 'A domicilio',
            'incluye-peinado': 'Incluye peinado',
            'prueba-previa': 'Prueba previa',
            'buffet': 'Tipo buffet',
            'tradicional': 'Menú tradicional',
            'vegano-saludable': 'Vegano / saludable',
            'solo-pastel': 'Solo pastel',
            'dj': 'DJ',
            'grupo-vallenato': 'Grupo vallenato',
            'mariachis': 'Mariachis',
            'en-vivo': 'En vivo',
            'grabado': 'Grabado',
            'solo-fotos': 'Solo fotos',
            'video-incluido': 'Video incluido',
            'dron': 'Dron',
            'flores': 'Flores',
            'iluminacion': 'Iluminación',
            'mobiliario': 'Mobiliario',
            'efectos': 'Efectos',
            'vallenato': 'Vallenato',
            'orquesta': 'Orquesta',
            'tropical': 'Tropical',
            'juegos': 'Juegos',
            'premios': 'Premios',
            'infantil': 'Infantil',
            'premium': 'Premium',
            'fotografia': 'Fotografía',
            'lujo': 'Lujo',
            'decorado': 'Decorado',
            'familiar': 'Familiar',
            'grupo': 'Grupo',
            'vip': 'VIP',
            'pirotecnia': 'Pirotecnia',
            'humo': 'Humo',
            'laser': 'Láser',
            'led': 'LED',
            'natural': 'Natural',
            'biodegradable': 'Biodegradable',
            'creativo': 'Creativo',
            'ecologico': 'Ecológico',
            'clasico': 'Clásico',
            'economico': 'Económico',
            'completo': 'Completo',
            'coordinacion': 'Coordinación',
            'basico': 'Básico',
            'express': 'Express',
            'exclusivo': 'Exclusivo'
        };
        return nombres[filtro] || filtro;
    }

    renderTarjetas(categoria) {
        let items = bodaData[categoria];
        
        // Aplicar filtros si hay activos
        if (this.filtrosActivos.size > 0) {
            items = items.filter(item => 
                item.filtros.some(filtro => this.filtrosActivos.has(filtro))
            );
        }

        return items.map(item => `
            <div class="boda-card ${this.selecciones.has(item.id) ? 'selected' : ''}"
                 data-id="${item.id}">
                <img src="${item.imagen}" alt="${item.nombre}" class="boda-card-image">
                <div class="boda-card-content">
                    <h3>${item.nombre}</h3>
                    <p>${item.descripcion}</p>
                    <p class="price">${item.precio}</p>
                    <ul>
                        ${item.caracteristicas.map(caracteristica => `
                            <li>${caracteristica}</li>
                        `).join('')}
                    </ul>
                    <button class="seleccionar-btn ${this.selecciones.has(item.id) ? 'selected' : ''}">
                        ${this.selecciones.has(item.id) ? 'Seleccionado' : 'Seleccionar'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupFiltrosEventListeners() {
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filtro = e.target.dataset.filtro;
                if (this.filtrosActivos.has(filtro)) {
                    this.filtrosActivos.delete(filtro);
                } else {
                    this.filtrosActivos.add(filtro);
                }
                e.target.classList.toggle('active');
                this.mostrarCategoria(this.categoriaActual);
            });
        });
    }

    setupSeleccionEventListeners() {
        document.querySelectorAll('.seleccionar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.boda-card');
                const id = parseInt(card.dataset.id);
                
                if (this.selecciones.has(id)) {
                    this.selecciones.delete(id);
                } else {
                    this.selecciones.set(id, {
                        categoria: this.categoriaActual,
                        id: id
                    });
                }
                
                card.classList.toggle('selected');
                e.target.classList.toggle('selected');
                e.target.textContent = this.selecciones.has(id) ? 'Seleccionado' : 'Seleccionar';
                
                this.actualizarBotonSiguiente();
            });
        });
    }

    actualizarBotonSiguiente() {
        let botonSiguiente = document.querySelector('.boda-next');
        if (!botonSiguiente) {
            botonSiguiente = document.createElement('button');
            botonSiguiente.className = 'boda-next';
            botonSiguiente.textContent = 'Siguiente';
            document.body.appendChild(botonSiguiente);
        }
        
        botonSiguiente.disabled = this.selecciones.size === 0;
    }
}

// Inicializar el controlador cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    const bodaController = new BodaController();
}); 