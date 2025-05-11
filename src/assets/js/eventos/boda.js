import { bodaData } from './boda-data.js';

export class BodaBuilder {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.selecciones = {
            fecha: null,
            invitados: null,
            lugarCeremonia: null,
            lugarRecepcion: null,
            catering: null,
            decoracion: null,
            entretenimiento: null,
            fotoVideo: null
        };
    }

    render() {
        return `
            <div class="max-w-4xl mx-auto">
                <!-- Barra de progreso -->
                <div class="mb-8">
                    <div class="flex justify-between mb-2">
                        ${Array.from({length: this.totalSteps}, (_, i) => `
                            <div class="flex flex-col items-center">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center
                                    ${i + 1 <= this.currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}">
                                    ${i + 1}
                                </div>
                                <span class="text-xs mt-1 ${i + 1 <= this.currentStep ? 'text-indigo-600' : 'text-gray-600'}">
                                    ${this.getStepName(i + 1)}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="h-1 bg-gray-200 rounded-full">
                        <div class="h-1 bg-indigo-600 rounded-full" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
                    </div>
                </div>

                <!-- Contenido del paso actual -->
                <div class="bg-white rounded-lg shadow-lg p-6">
                    ${this.renderCurrentStep()}
                </div>

                <!-- Navegación -->
                <div class="flex justify-between mt-6">
                    <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300
                        ${this.currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                        onclick="window.weddingBuilder.previousStep()" ${this.currentStep === 1 ? 'disabled' : ''}>
                        Anterior
                    </button>
                    <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        onclick="window.weddingBuilder.nextStep()">
                        ${this.currentStep === this.totalSteps ? 'Finalizar' : 'Siguiente'}
                    </button>
                </div>
            </div>
        `;
    }

    getStepName(step) {
        const steps = {
            1: 'Fecha e Invitados',
            2: 'Lugares',
            3: 'Servicios',
            4: 'Entretenimiento',
            5: 'Foto/Video',
            6: 'Resumen'
        };
        return steps[step];
    }

    renderCurrentStep() {
        switch(this.currentStep) {
            case 1:
                return this.renderFechaInvitados();
            case 2:
                return this.renderLugares();
            case 3:
                return this.renderServicios();
            case 4:
                return this.renderEntretenimiento();
            case 5:
                return this.renderFotoVideo();
            case 6:
                return this.renderResumen();
            default:
                return '';
        }
    }

    renderFechaInvitados() {
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-gray-900">Fecha e Invitados</h2>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de la boda</label>
                    <input type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        min="${new Date().toISOString().split('T')[0]}"
                        onchange="window.weddingBuilder.updateSeleccion('fecha', this.value)">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Número de invitados</label>
                    <input type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        min="1" max="300"
                        onchange="window.weddingBuilder.updateSeleccion('invitados', parseInt(this.value))">
                </div>
            </div>
        `;
    }

    renderLugares() {
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-gray-900">Lugares</h2>
                
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Ceremonia</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${bodaData.lugares.ceremonias.map(lugar => `
                            <div class="venue-card ${this.selecciones.lugarCeremonia === lugar.id ? 'selected' : ''}"
                                onclick="window.weddingBuilder.updateSeleccion('lugarCeremonia', '${lugar.id}')">
                                <div class="bg-white rounded-lg shadow overflow-hidden">
                                    <div class="aspect-w-16 aspect-h-9">
                                        <img src="${lugar.imagen}" alt="${lugar.nombre}" class="w-full h-full object-cover">
                                    </div>
                                    <div class="p-4">
                                        <h4 class="font-semibold text-gray-900">${lugar.nombre}</h4>
                                        <p class="text-sm text-gray-600">${lugar.descripcion}</p>
                                        <p class="text-sm text-gray-900 mt-2">Capacidad: ${lugar.capacidad} personas</p>
                                        <p class="text-sm font-semibold text-indigo-600 mt-1">$${lugar.precio.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Recepción</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${bodaData.lugares.recepciones.map(lugar => `
                            <div class="venue-card ${this.selecciones.lugarRecepcion === lugar.id ? 'selected' : ''}"
                                onclick="window.weddingBuilder.updateSeleccion('lugarRecepcion', '${lugar.id}')">
                                <div class="bg-white rounded-lg shadow overflow-hidden">
                                    <div class="aspect-w-16 aspect-h-9">
                                        <img src="${lugar.imagen}" alt="${lugar.nombre}" class="w-full h-full object-cover">
                                    </div>
                                    <div class="p-4">
                                        <h4 class="font-semibold text-gray-900">${lugar.nombre}</h4>
                                        <p class="text-sm text-gray-600">${lugar.descripcion}</p>
                                        <p class="text-sm text-gray-900 mt-2">Capacidad: ${lugar.capacidad} personas</p>
                                        <p class="text-sm font-semibold text-indigo-600 mt-1">$${lugar.precio.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderServicios() {
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-gray-900">Servicios</h2>
                
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Catering</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${bodaData.servicios.catering.map(servicio => `
                            <div class="service-card ${this.selecciones.catering === servicio.id ? 'selected' : ''}"
                                onclick="window.weddingBuilder.updateSeleccion('catering', '${servicio.id}')">
                                <div class="bg-white rounded-lg shadow overflow-hidden">
                                    <div class="aspect-w-16 aspect-h-9">
                                        <img src="${servicio.imagen}" alt="${servicio.nombre}" class="w-full h-full object-cover">
                                    </div>
                                    <div class="p-4">
                                        <h4 class="font-semibold text-gray-900">${servicio.nombre}</h4>
                                        <p class="text-sm text-gray-600">${servicio.descripcion}</p>
                                        <p class="text-sm font-semibold text-indigo-600 mt-1">
                                            $${servicio.precioPorPersona.toLocaleString()} por persona
                                        </p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Decoración</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${bodaData.servicios.decoracion.map(servicio => `
                            <div class="service-card ${this.selecciones.decoracion === servicio.id ? 'selected' : ''}"
                                onclick="window.weddingBuilder.updateSeleccion('decoracion', '${servicio.id}')">
                                <div class="bg-white rounded-lg shadow overflow-hidden">
                                    <div class="aspect-w-16 aspect-h-9">
                                        <img src="${servicio.imagen}" alt="${servicio.nombre}" class="w-full h-full object-cover">
                                    </div>
                                    <div class="p-4">
                                        <h4 class="font-semibold text-gray-900">${servicio.nombre}</h4>
                                        <p class="text-sm text-gray-600">${servicio.descripcion}</p>
                                        <p class="text-sm font-semibold text-indigo-600 mt-1">$${servicio.precio.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderEntretenimiento() {
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-gray-900">Entretenimiento</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${bodaData.entretenimiento.map(item => `
                        <div class="entertainment-card ${this.selecciones.entretenimiento === item.id ? 'selected' : ''}"
                            onclick="window.weddingBuilder.updateSeleccion('entretenimiento', '${item.id}')">
                            <div class="bg-white rounded-lg shadow overflow-hidden">
                                <div class="aspect-w-16 aspect-h-9">
                                    <img src="${item.imagen}" alt="${item.nombre}" class="w-full h-full object-cover">
                                </div>
                                <div class="p-4">
                                    <h4 class="font-semibold text-gray-900">${item.nombre}</h4>
                                    <p class="text-sm text-gray-600">${item.descripcion}</p>
                                    <p class="text-sm font-semibold text-indigo-600 mt-1">$${item.precio.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderFotoVideo() {
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-gray-900">Fotografía y Video</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${bodaData.fotoVideo.map(item => `
                        <div class="photo-video-card ${this.selecciones.fotoVideo === item.id ? 'selected' : ''}"
                            onclick="window.weddingBuilder.updateSeleccion('fotoVideo', '${item.id}')">
                            <div class="bg-white rounded-lg shadow overflow-hidden">
                                <div class="aspect-w-16 aspect-h-9">
                                    <img src="${item.imagen}" alt="${item.nombre}" class="w-full h-full object-cover">
                                </div>
                                <div class="p-4">
                                    <h4 class="font-semibold text-gray-900">${item.nombre}</h4>
                                    <p class="text-sm text-gray-600">${item.descripcion}</p>
                                    <p class="text-sm font-semibold text-indigo-600 mt-1">$${item.precio.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderResumen() {
        const total = this.calcularTotal();
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-gray-900">Resumen de tu Boda</h2>
                
                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-gray-900">Fecha e Invitados</h3>
                        <p class="text-gray-600">Fecha: ${this.selecciones.fecha}</p>
                        <p class="text-gray-600">Invitados: ${this.selecciones.invitados}</p>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-gray-900">Lugares</h3>
                        <p class="text-gray-600">Ceremonia: ${this.getNombreLugar('ceremonias', this.selecciones.lugarCeremonia)}</p>
                        <p class="text-gray-600">Recepción: ${this.getNombreLugar('recepciones', this.selecciones.lugarRecepcion)}</p>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-gray-900">Servicios</h3>
                        <p class="text-gray-600">Catering: ${this.getNombreServicio('catering', this.selecciones.catering)}</p>
                        <p class="text-gray-600">Decoración: ${this.getNombreServicio('decoracion', this.selecciones.decoracion)}</p>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-gray-900">Entretenimiento</h3>
                        <p class="text-gray-600">${this.getNombreEntretenimiento(this.selecciones.entretenimiento)}</p>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-gray-900">Fotografía y Video</h3>
                        <p class="text-gray-600">${this.getNombreFotoVideo(this.selecciones.fotoVideo)}</p>
                    </div>

                    <div class="bg-indigo-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-indigo-900">Total Estimado</h3>
                        <p class="text-2xl font-bold text-indigo-600">$${total.toLocaleString()}</p>
                    </div>
                </div>

                <div class="flex justify-between items-center mt-6">
                    <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        onclick="window.weddingBuilder.previousStep()">
                        Editar Selecciones
                    </button>
                    <button class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        onclick="window.weddingBuilder.confirmarBoda()">
                        Confirmar y Contactar
                    </button>
                </div>
            </div>
        `;
    }

    getNombreLugar(tipo, id) {
        const lugar = bodaData.lugares[tipo].find(l => l.id === id);
        return lugar ? lugar.nombre : 'No seleccionado';
    }

    getNombreServicio(tipo, id) {
        const servicio = bodaData.servicios[tipo].find(s => s.id === id);
        return servicio ? servicio.nombre : 'No seleccionado';
    }

    getNombreEntretenimiento(id) {
        const item = bodaData.entretenimiento.find(e => e.id === id);
        return item ? item.nombre : 'No seleccionado';
    }

    getNombreFotoVideo(id) {
        const item = bodaData.fotoVideo.find(f => f.id === id);
        return item ? item.nombre : 'No seleccionado';
    }

    calcularTotal() {
        let total = 0;

        // Lugares
        const lugarCeremonia = bodaData.lugares.ceremonias.find(l => l.id === this.selecciones.lugarCeremonia);
        const lugarRecepcion = bodaData.lugares.recepciones.find(l => l.id === this.selecciones.lugarRecepcion);
        if (lugarCeremonia) total += lugarCeremonia.precio;
        if (lugarRecepcion) total += lugarRecepcion.precio;

        // Servicios
        const catering = bodaData.servicios.catering.find(s => s.id === this.selecciones.catering);
        const decoracion = bodaData.servicios.decoracion.find(s => s.id === this.selecciones.decoracion);
        if (catering && this.selecciones.invitados) total += catering.precioPorPersona * this.selecciones.invitados;
        if (decoracion) total += decoracion.precio;

        // Entretenimiento
        const entretenimiento = bodaData.entretenimiento.find(e => e.id === this.selecciones.entretenimiento);
        if (entretenimiento) total += entretenimiento.precio;

        // Foto/Video
        const fotoVideo = bodaData.fotoVideo.find(f => f.id === this.selecciones.fotoVideo);
        if (fotoVideo) total += fotoVideo.precio;

        return total;
    }

    updateSeleccion(tipo, valor) {
        this.selecciones[tipo] = valor;
        this.actualizarUI();
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.actualizarUI();
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            if (this.validarPasoActual()) {
                this.currentStep++;
                this.actualizarUI();
            } else {
                alert('Por favor completa todas las selecciones requeridas en este paso.');
            }
        } else {
            this.confirmarBoda();
        }
    }

    validarPasoActual() {
        switch(this.currentStep) {
            case 1:
                return this.selecciones.fecha && this.selecciones.invitados;
            case 2:
                return this.selecciones.lugarCeremonia && this.selecciones.lugarRecepcion;
            case 3:
                return this.selecciones.catering && this.selecciones.decoracion;
            case 4:
                return this.selecciones.entretenimiento;
            case 5:
                return this.selecciones.fotoVideo;
            default:
                return true;
        }
    }

    actualizarUI() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = this.render();
    }

    confirmarBoda() {
        const total = this.calcularTotal();
        const mensaje = `
            ¡Gracias por planificar tu boda con nosotros!
            
            Resumen de tu selección:
            - Fecha: ${this.selecciones.fecha}
            - Invitados: ${this.selecciones.invitados}
            - Lugar Ceremonia: ${this.getNombreLugar('ceremonias', this.selecciones.lugarCeremonia)}
            - Lugar Recepción: ${this.getNombreLugar('recepciones', this.selecciones.lugarRecepcion)}
            - Catering: ${this.getNombreServicio('catering', this.selecciones.catering)}
            - Decoración: ${this.getNombreServicio('decoracion', this.selecciones.decoracion)}
            - Entretenimiento: ${this.getNombreEntretenimiento(this.selecciones.entretenimiento)}
            - Foto/Video: ${this.getNombreFotoVideo(this.selecciones.fotoVideo)}
            
            Total Estimado: $${total.toLocaleString()}
            
            Nos pondremos en contacto contigo pronto para confirmar los detalles y coordinar tu evento.
        `;
        
        alert(mensaje);
    }
} 