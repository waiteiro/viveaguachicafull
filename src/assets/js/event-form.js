// Configuración de Supabase
const SUPABASE_URL = 'TU_URL_DE_SUPABASE';
const SUPABASE_KEY = 'TU_CLAVE_DE_SUPABASE';
const BUCKET_NAME = 'NOMBRE_DEL_BUCKET';

// Inicialización de Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos del DOM
const modal = document.getElementById('eventModal');
const openModalBtn = document.getElementById('openEventModal');
const closeModalBtn = document.getElementById('closeEventModal');
const cancelBtn = document.getElementById('cancelEvent');
const form = document.getElementById('eventForm');
const ticketTypeRadios = document.querySelectorAll('input[name="ticket_type"]');
const ticketPriceContainer = document.getElementById('ticketPriceContainer');

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado');
    
    // Obtener los elementos
    const modal = document.getElementById('eventModal');
    const openButton = document.getElementById('openEventModal');
    const closeButton = document.getElementById('closeEventModal');
    const cancelButton = document.getElementById('cancelEvent');
    const form = document.getElementById('eventForm');

    // Función para abrir el modal
    function abrirModal() {
        console.log('Abriendo modal');
        modal.classList.remove('hidden');
    }

    // Función para cerrar el modal
    function cerrarModal() {
        console.log('Cerrando modal');
        modal.classList.add('hidden');
    }

    // Agregar eventos
    openButton.addEventListener('click', abrirModal);
    closeButton.addEventListener('click', cerrarModal);
    cancelButton.addEventListener('click', cerrarModal);

    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModal();
        }
    });

    // Manejar la visibilidad del campo de precio del boleto
    ticketTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            ticketPriceContainer.classList.toggle('hidden', radio.value !== 'con_boleto');
        });
    });

    // Manejar el envío del formulario
    form.addEventListener('submit', function(e) {
        // Validar que al menos un público objetivo esté seleccionado
        const targetAudience = form.querySelectorAll('input[name="target_audience"]:checked');
        if (targetAudience.length === 0) {
            e.preventDefault();
            alert('Por favor selecciona al menos un público objetivo');
            return;
        }

        // Mostrar mensaje de éxito
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.remove('hidden');
        
        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
            cerrarModal();
            successMessage.classList.add('hidden');
        }, 2000);
    });
}); 