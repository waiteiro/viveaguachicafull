import { BodaBuilder } from './eventos/boda.js';

class EventController {
    constructor() {
        this.currentBuilder = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.querySelectorAll('.event-type-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const eventType = card.dataset.type;
                this.handleEventSelection(eventType);
            });
        });
    }

    handleEventSelection(eventType) {
        console.log(`Seleccionado evento tipo: ${eventType}`);
        
        // Limpiar selección previa
        document.querySelectorAll('.event-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Marcar la selección actual
        const selectedCard = document.querySelector(`.event-type-card[data-type="${eventType}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        // Ocultar selector de tipos de evento
        const eventTypes = document.getElementById('event-types');
        eventTypes.classList.add('hidden');

        // Limpiar contenedor principal
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';
        
        // Crear y renderizar el builder correspondiente
        switch(eventType) {
            case 'boda':
                this.currentBuilder = new BodaBuilder();
                mainContent.classList.remove('hidden');
                mainContent.innerHTML = this.currentBuilder.render();
                // Hacer accesible el builder globalmente para los event listeners
                window.weddingBuilder = this.currentBuilder;
                break;
                
            default:
                mainContent.classList.remove('hidden');
                mainContent.innerHTML = this.renderComingSoon(eventType);
        }

        // Scroll al inicio del contenido
        mainContent.scrollIntoView({ behavior: 'smooth' });
    }

    renderComingSoon(eventType) {
        const titles = {
            'xv': 'XV Años',
            'cumpleanos': 'Cumpleaños',
            'social': 'Evento Social',
            'artistico': 'Presentación Artística',
            'consulta': 'Consulta Personalizada'
        };

        return `
            <div class="text-center py-16">
                <h1 class="text-3xl font-bold text-gray-900 mb-4">Planifica tus ${titles[eventType] || 'Evento'}</h1>
                <p class="text-xl text-gray-600">¡Próximamente! Estamos preparando algo especial para ti.</p>
                <p class="text-gray-500 mt-4">Mientras tanto, puedes contactarnos directamente para planificar tu evento.</p>
                <button class="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                        onclick="alert('¡Gracias por tu interés! Pronto nos pondremos en contacto contigo.')">
                    Solicitar Información
                </button>
                <button class="mt-4 block mx-auto text-indigo-600 hover:text-indigo-700"
                        onclick="document.getElementById('event-types').classList.remove('hidden'); document.getElementById('main-content').classList.add('hidden');">
                    ← Volver a tipos de eventos
                </button>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.eventController = new EventController();
}); 