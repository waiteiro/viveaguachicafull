document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Resetear errores
            resetErrors();
            
            // Validar campos
            let isValid = true;
            
            // Validar nombre
            const nombre = document.getElementById('nombre').value.trim();
            if (nombre === '') {
                showError('nombre', 'Por favor ingresa tu nombre');
                isValid = false;
            }
            
            // Validar email
            const email = document.getElementById('email').value.trim();
            if (email === '') {
                showError('email', 'Por favor ingresa tu correo electrónico');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError('email', 'Por favor ingresa un correo electrónico válido');
                isValid = false;
            }
            
            // Validar asunto
            const asunto = document.getElementById('asunto').value;
            if (asunto === '') {
                showError('asunto', 'Por favor selecciona un asunto');
                isValid = false;
            }
            
            // Validar mensaje
            const mensaje = document.getElementById('mensaje').value.trim();
            if (mensaje === '') {
                showError('mensaje', 'Por favor ingresa tu mensaje');
                isValid = false;
            } else if (mensaje.length < 10) {
                showError('mensaje', 'El mensaje debe tener al menos 10 caracteres');
                isValid = false;
            }
            
            // Si el formulario es válido, enviar
            if (isValid) {
                // Aquí iría el código para enviar el formulario
                alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
                contactForm.reset();
            }
        });
    }
});

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    
    field.classList.add('border-red-500');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

function resetErrors() {
    const errorElements = document.querySelectorAll('[id$="-error"]');
    errorElements.forEach(element => {
        const fieldId = element.id.replace('-error', '');
        const field = document.getElementById(fieldId);
        
        field.classList.remove('border-red-500');
        element.classList.add('hidden');
    });
}