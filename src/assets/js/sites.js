document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    
    let currentIndex = 0;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    // Inicializar posiciones
    function initializeSlides() {
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active');
            } else if (index === currentIndex - 1 || (currentIndex === 0 && index === slides.length - 1)) {
                slide.classList.add('prev');
            } else if (index === currentIndex + 1 || (currentIndex === slides.length - 1 && index === 0)) {
                slide.classList.add('next');
            }
        });
    }

    // Actualizar clases de las diapositivas
    function updateSlideClasses() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            if (index === currentIndex) {
                slide.classList.add('active');
            } else if (index === getPrevIndex()) {
                slide.classList.add('prev');
            } else if (index === getNextIndex()) {
                slide.classList.add('next');
            }
        });
    }

    // Obtener índice anterior
    function getPrevIndex() {
        return currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    }

    // Obtener índice siguiente
    function getNextIndex() {
        return currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
    }

    // Manejar el clic en siguiente
    function handleNextClick() {
        currentIndex = getNextIndex();
        updateSlideClasses();
    }

    // Manejar el clic en anterior
    function handlePrevClick() {
        currentIndex = getPrevIndex();
        updateSlideClasses();
    }

    // Event Listeners para botones
    if (prevButton) {
        prevButton.addEventListener('click', handlePrevClick);
    }
    if (nextButton) {
        nextButton.addEventListener('click', handleNextClick);
    }

    // Touch events para móviles
    track.addEventListener('touchstart', touchStart);
    track.addEventListener('touchmove', touchMove);
    track.addEventListener('touchend', touchEnd);

    function touchStart(event) {
        startPos = event.touches[0].clientX;
        isDragging = true;
    }

    function touchMove(event) {
        if (!isDragging) return;
        const currentPosition = event.touches[0].clientX;
        currentTranslate = prevTranslate + currentPosition - startPos;
    }

    function touchEnd() {
        isDragging = false;
        const movedBy = currentTranslate - prevTranslate;

        // Si el movimiento fue significativo
        if (Math.abs(movedBy) > 100) {
            if (movedBy < 0) {
                handleNextClick();
            } else {
                handlePrevClick();
            }
        }

        currentTranslate = 0;
        prevTranslate = 0;
    }

    // Inicializar el carrusel
    initializeSlides();

    // Auto-rotación cada 5 segundos
    setInterval(handleNextClick, 5000);
}); 