// Funciones para compartir en redes sociales
function shareOnFacebook(eventUrl, eventTitle) {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(eventTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

function shareOnTwitter(eventUrl, eventTitle) {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(eventTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

function shareOnWhatsApp(eventUrl, eventTitle) {
    const url = `https://wa.me/?text=${encodeURIComponent(eventTitle + ' ' + eventUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

// Inicializar los botones de compartir
document.addEventListener('DOMContentLoaded', function() {
    const shareButtons = document.querySelectorAll('.share-buttons');
    
    shareButtons.forEach(container => {
        const eventUrl = container.dataset.url;
        const eventTitle = container.dataset.title;
        
        // Facebook
        const facebookBtn = container.querySelector('.share-facebook');
        if (facebookBtn) {
            facebookBtn.addEventListener('click', () => shareOnFacebook(eventUrl, eventTitle));
        }
        
        // Twitter
        const twitterBtn = container.querySelector('.share-twitter');
        if (twitterBtn) {
            twitterBtn.addEventListener('click', () => shareOnTwitter(eventUrl, eventTitle));
        }
        
        // WhatsApp
        const whatsappBtn = container.querySelector('.share-whatsapp');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => shareOnWhatsApp(eventUrl, eventTitle));
        }
    });
}); 