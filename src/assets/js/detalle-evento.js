import { db } from './firebase.js';
import { doc, getDoc, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, deleteDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// Obtener auth de Firebase
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

// Función para formatear la fecha
function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Función para formatear la hora
function formatTime(timeString) {
    return timeString;
}

// Función para mostrar/ocultar elementos basado en si tienen contenido
function toggleElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        let visible = false;
        if (typeof content === 'string') {
            visible = content.trim() !== '';
        } else if (typeof content === 'number') {
            visible = true;
        } else if (Array.isArray(content)) {
            visible = content.length > 0;
        } else if (content) {
            visible = true;
        }
        element.style.display = visible ? 'block' : 'none';
        return visible;
    }
    return false;
}

// Función para cargar los comentarios
async function loadComments(eventoId, currentUser) {
    try {
        const commentsRef = collection(db, 'comments');
        const q = query(
            commentsRef,
            where('eventId', '==', eventoId),
            orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        // Obtener ambas listas de comentarios (móvil y escritorio)
        const commentsLists = document.querySelectorAll('#comentarios-lista');
        
        commentsLists.forEach(commentsList => {
            commentsList.innerHTML = '';
            
            if (querySnapshot.empty) {
                commentsList.innerHTML = `
                    <div class="text-center text-gray-500 py-8">
                        <i class="fas fa-comments text-4xl mb-3"></i>
                        <p>Se el primero en comentar</p>
                    </div>
                `;
                return;
            }
            
            querySnapshot.forEach(docSnap => {
                const comment = docSnap.data();
                const commentDiv = document.createElement('div');
                commentDiv.className = 'flex gap-4 p-4 bg-gray-50 rounded-xl relative';
                commentDiv.innerHTML = `
                    <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-user text-indigo-600"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-2">
                            <div class="font-medium text-gray-800">${comment.userName || 'Usuario'}</div>
                            <div class="text-sm text-gray-500">${formatCommentDate(comment.timestamp)}</div>
                        </div>
                        <p class="text-gray-600">${comment.text}</p>
                    </div>
                    ${currentUser && comment.userId === currentUser.uid ? `<button class='absolute top-2 right-2 text-red-500 hover:text-red-700' title='Eliminar' data-id='${docSnap.id}'><i class='fas fa-trash'></i></button>` : ''}
                `;
                
                if (currentUser && comment.userId === currentUser.uid) {
                    commentDiv.querySelector('button[data-id]').onclick = async function() {
                        if (confirm('¿Eliminar este comentario?')) {
                            await deleteDoc(doc(db, 'comments', docSnap.id));
                            await loadComments(eventoId, currentUser);
                        }
                    };
                }
                
                commentsList.appendChild(commentDiv);
            });
        });
    } catch (error) {
        console.error('Error al cargar comentarios:', error);
    }
}

// Función para formatear la fecha de los comentarios
function formatCommentDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    
    // Si es menos de 24 horas
    if (diff < 24 * 60 * 60 * 1000) {
        if (diff < 60 * 1000) return 'Ahora mismo';
        if (diff < 60 * 60 * 1000) return `Hace ${Math.floor(diff / (60 * 1000))} minutos`;
        return `Hace ${Math.floor(diff / (60 * 60 * 1000))} horas`;
    }
    
    // Si es menos de 7 días
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        return `Hace ${Math.floor(diff / (24 * 60 * 60 * 1000))} días`;
    }
    
    // Si es más de 7 días, mostrar la fecha completa
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para agregar un comentario
async function addComment(eventoId, text, user) {
    try {
        const commentsRef = collection(db, 'comments');
        await addDoc(commentsRef, {
            eventId: eventoId,
            text: text,
            userName: user.displayName || 'Usuario',
            userId: user.uid,
            timestamp: serverTimestamp()
        });
        await loadComments(eventoId, user);
        document.getElementById('comentario-texto').value = '';
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        alert('Error al agregar el comentario. Por favor, intenta de nuevo.');
    }
}

// Función para mostrar/ocultar el modal de autenticación
function showAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.remove('hidden');
        authModal.classList.add('flex');
    }
}

function hideAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.add('hidden');
        authModal.classList.remove('flex');
    }
}

// Función para mostrar notificaciones
function showToast(message, type = 'error') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `p-4 rounded-lg shadow-lg ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Función para manejar el inicio de sesión con email/password
async function handleEmailPasswordAuth(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const displayNameInput = document.getElementById('displayName');
    const displayName = displayNameInput ? displayNameInput.value : '';

    try {
        let userCredential;
        if (isLoginMode) {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Guardar nombre en el perfil
            if (displayName) {
                await updateProfile(userCredential.user, { displayName });
                await userCredential.user.reload();
            }
            // Recargar la página tras registro exitoso
            window.location.reload();
            return;
        }
        hideAuthModal();
        showToast(isLoginMode ? 'Sesión iniciada correctamente' : 'Cuenta creada correctamente', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Función para manejar el inicio de sesión con Google
async function handleGoogleSignIn() {
    try {
        await signInWithPopup(auth, googleProvider);
        hideAuthModal();
        showToast('Sesión iniciada correctamente con Google', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

let isLoginMode = true;

// Función para cambiar entre login y registro
function toggleMode() {
    isLoginMode = !isLoginMode;
    const title = document.querySelector('#authModal h2');
    const submitButton = document.querySelector('#authForm button[type="submit"]');
    const toggleButton = document.getElementById('toggleAuthMode');
    const nameField = document.getElementById('nameField');
    
    if (isLoginMode) {
        title.textContent = 'Iniciar Sesión';
        submitButton.textContent = 'Iniciar Sesión';
        toggleButton.textContent = 'Regístrate';
        nameField.style.display = 'none';
    } else {
        title.textContent = 'Crear Cuenta';
        submitButton.textContent = 'Registrarse';
        toggleButton.textContent = 'Iniciar Sesión';
        nameField.style.display = 'block';
    }
}

// Función para controlar la UI de comentarios según autenticación
function setupCommentUI(user) {
    const textareas = document.querySelectorAll('#comentario-texto');
    const btnComentars = document.querySelectorAll('#btn-comentar');
    
    textareas.forEach(textarea => {
        const btnComentar = textarea.closest('.bg-gray-50').querySelector('#btn-comentar');
        
        if (!user) {
            textarea.disabled = true;
            btnComentar.disabled = true;
            textarea.placeholder = 'Inicia sesión para comentar...';
            
            // Crear botón de inicio de sesión
            const loginButton = document.createElement('button');
            loginButton.className = 'text-indigo-600 hover:text-indigo-800 font-medium mt-2';
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt mr-1"></i> Iniciar Sesión';
            loginButton.onclick = showAuthModal;
            
            // Insertar botón después del textarea
            textarea.parentNode.insertBefore(loginButton, textarea.nextSibling);
            
            // Hacer que el textarea y el botón de comentar también abran el modal
            textarea.onclick = showAuthModal;
            btnComentar.onclick = showAuthModal;
        } else {
            textarea.disabled = false;
            btnComentar.disabled = false;
            textarea.placeholder = 'Escribe tu comentario...';
            
            // Remover el botón de inicio de sesión si existe
            const loginButton = textarea.parentNode.querySelector('button');
            if (loginButton) {
                loginButton.remove();
            }
            
            btnComentar.onclick = async () => {
                const text = textarea.value.trim();
                if (text) {
                    await addComment(window.eventoId, text, user);
                }
            };
            textarea.onclick = null;
        }
    });
}

// Función para cargar los datos del evento
async function loadEventoData() {
    try {
        // Obtener el ID del evento de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const eventoId = urlParams.get('id');
        window.eventoId = eventoId;
        if (!eventoId) {
            throw new Error('No se proporcionó un ID de evento');
        }

        // Obtener el documento del evento desde Firebase
        const eventoDoc = await getDoc(doc(db, 'events', eventoId));
        
        if (!eventoDoc.exists()) {
            throw new Error('El evento no existe');
        }

        const evento = eventoDoc.data();

        // Cargar imagen principal
        const imagenPrincipal = document.querySelector('#imagen-principal img');
        if (evento.imageUrl) {
            imagenPrincipal.src = evento.imageUrl;
            imagenPrincipal.alt = evento.title;
        }

        // Cargar título y categoría
        document.getElementById('evento-titulo').textContent = evento.title || '';
        document.getElementById('evento-categoria').textContent = evento.category || '';

        // Cargar fecha y hora
        if (toggleElement('evento-fecha', evento.fechaInicio)) {
            document.querySelector('#evento-fecha span').textContent = formatDate(evento.fechaInicio.toDate ? evento.fechaInicio.toDate() : evento.fechaInicio);
        }
        if (toggleElement('evento-hora', evento.time)) {
            document.querySelector('#evento-hora span').textContent = formatTime(evento.time);
        }

        // Cargar ubicación
        if (toggleElement('evento-lugar', evento.location)) {
            document.querySelector('#evento-lugar span').textContent = evento.location;
        }
        if (toggleElement('evento-direccion', evento.address)) {
            document.getElementById('evento-direccion').textContent = evento.address;
        }

        // Cargar organizador y contacto
        if (toggleElement('evento-organizador', evento.organizer && evento.organizer.nombre)) {
            document.querySelector('#evento-organizador span').textContent = evento.organizer.nombre;
        }
        if (toggleElement('evento-contacto', evento.organizer && evento.organizer.contacto)) {
            document.getElementById('evento-contacto').textContent = evento.organizer.contacto;
        }

        // Contacto del organizador con ícono
        const contactoContainer = document.getElementById('evento-contacto');
        if (contactoContainer) {
            contactoContainer.innerHTML = '';
            if (evento.organizer && evento.organizer.contacto) {
                let icon = 'fa-user';
                if (/^\+?\d[\d\s-]+$/.test(evento.organizer.contacto)) icon = 'fa-phone';
                if (/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(evento.organizer.contacto)) icon = 'fa-envelope';
                contactoContainer.innerHTML = `<i class="fas ${icon}"></i> <span>${evento.organizer.contacto}</span>`;
            }
        }

        // Cargar descripción
        if (toggleElement('evento-descripcion', evento.description)) {
            document.getElementById('evento-descripcion').textContent = evento.description;
        }

        // Cargar información adicional
        if (toggleElement('evento-precio', evento.price)) {
            document.querySelector('#evento-precio span').textContent = evento.price;
        }
        // Capacidad: solo si es mayor que 0
        if (toggleElement('evento-capacidad', evento.capacity && evento.capacity > 0 ? evento.capacity : null)) {
            document.querySelector('#evento-capacidad span').textContent = evento.capacity;
        }
        // Patrocinador: solo si existe
        if (toggleElement('evento-patrocinador', evento.patrocina)) {
            document.querySelector('#evento-patrocinador span').textContent = evento.patrocina;
        }

        // Cargar información general
        if (toggleElement('evento-publico', evento.targetAudience)) {
            document.querySelector('#evento-publico span').textContent = evento.targetAudience;
        }
        if (toggleElement('evento-requisitos', evento.requirements)) {
            document.getElementById('evento-requisitos').textContent = evento.requirements;
        }

        // Participantes: artistas y grupos
        const participantesContainer = document.getElementById('evento-participantes');
        if (participantesContainer) {
            participantesContainer.innerHTML = '';
            // Artistas
            if (evento.artists && evento.artists.length > 0) {
                for (const artistId of evento.artists) {
                    try {
                        const artistRef = doc(db, 'artists', artistId);
                        const artistSnap = await getDoc(artistRef);
                        if (artistSnap.exists()) {
                            const artist = artistSnap.data();
                            const div = document.createElement('div');
                            div.className = 'flex items-center cursor-pointer bg-indigo-50 border border-indigo-100 rounded-full px-2 py-1';
                            div.innerHTML = `
                                <img src="${artist.imageUrl || '../src/assets/images/placeholder.jpg'}" class="w-8 h-8 object-cover rounded-full">
                                <span class='text-indigo-700 text-xs font-medium ml-2 whitespace-nowrap'>${artist.name}</span>
                            `;
                            div.onclick = () => {
                                window.location.href = `/src/views/artistas/perfil.html?id=${artistId}`;
                            };
                            participantesContainer.appendChild(div);
                        }
                    } catch (e) { /* ignorar errores individuales */ }
                }
            }
            // Grupos
            if (evento.groups && evento.groups.length > 0) {
                for (const groupId of evento.groups) {
                    try {
                        const groupRef = doc(db, 'groups', groupId);
                        const groupSnap = await getDoc(groupRef);
                        if (groupSnap.exists()) {
                            const group = groupSnap.data();
                            const div = document.createElement('div');
                            div.className = 'flex items-center cursor-pointer bg-indigo-50 border border-indigo-100 rounded-full px-2 py-1';
                            div.innerHTML = `
                                <img src="${group.imageUrl || '../src/assets/images/placeholder.jpg'}" class="w-8 h-8 object-cover rounded-full">
                                <span class='text-indigo-700 text-xs font-medium ml-2 whitespace-nowrap'>${group.name}</span>
                            `;
                            div.onclick = () => {
                                window.location.href = `/src/views/agrupaciones/perfil.html?id=${groupId}`;
                            };
                            participantesContainer.appendChild(div);
                        }
                    } catch (e) { /* ignorar errores individuales */ }
                }
            }
            // Si no hay participantes
            if ((!evento.artists || evento.artists.length === 0) && (!evento.groups || evento.groups.length === 0)) {
                participantesContainer.style.display = 'none';
            } else {
                participantesContainer.style.display = 'grid';
            }
        }

        // Galería carrusel y modal
        const galeriaContainer = document.getElementById('galeria-imagenes');
        const galeriaPrev = document.getElementById('galeria-prev');
        const galeriaNext = document.getElementById('galeria-next');
        let galeriaImgs = [];
        let galeriaIndex = 0;
        if (evento.gallery && evento.gallery.length > 0) {
            galeriaImgs = evento.gallery;
            galeriaContainer.innerHTML = '';
            galeriaImgs.forEach((imgUrl, idx) => {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'relative aspect-square overflow-hidden rounded-lg min-w-[120px] max-w-[180px] h-28 cursor-pointer';
                const img = document.createElement('img');
                img.src = imgUrl;
                img.alt = evento.title;
                img.className = 'w-full h-full object-cover hover:scale-110 transition-transform duration-300';
                img.onclick = () => openModal(idx);
                imgDiv.appendChild(img);
                galeriaContainer.appendChild(imgDiv);
            });
            // Mostrar flechas solo si hay más de 3 imágenes
            if (galeriaImgs.length > 3) {
                galeriaPrev.classList.remove('hidden');
                galeriaNext.classList.remove('hidden');
            } else {
                galeriaPrev.classList.add('hidden');
                galeriaNext.classList.add('hidden');
            }
        } else {
            document.getElementById('evento-galeria').style.display = 'none';
        }
        // Carrusel scroll
        galeriaPrev && galeriaPrev.addEventListener('click', () => {
            galeriaContainer.scrollBy({ left: -200, behavior: 'smooth' });
        });
        galeriaNext && galeriaNext.addEventListener('click', () => {
            galeriaContainer.scrollBy({ left: 200, behavior: 'smooth' });
        });

        // Modal galería
        const modal = document.getElementById('modal-galeria');
        const modalImg = document.getElementById('modal-img');
        const modalCerrar = document.getElementById('modal-cerrar');
        const modalPrev = document.getElementById('modal-prev');
        const modalNext = document.getElementById('modal-next');
        function openModal(idx) {
            galeriaIndex = idx;
            modalImg.src = galeriaImgs[galeriaIndex];
            modal.classList.remove('hidden');
        }
        function closeModal() {
            modal.classList.add('hidden');
            modalImg.src = '';
        }
        function showPrev() {
            galeriaIndex = (galeriaIndex - 1 + galeriaImgs.length) % galeriaImgs.length;
            modalImg.src = galeriaImgs[galeriaIndex];
        }
        function showNext() {
            galeriaIndex = (galeriaIndex + 1) % galeriaImgs.length;
            modalImg.src = galeriaImgs[galeriaIndex];
        }
        modalCerrar && modalCerrar.addEventListener('click', closeModal);
        modalPrev && modalPrev.addEventListener('click', showPrev);
        modalNext && modalNext.addEventListener('click', showNext);
        // Cerrar modal con click fuera de la imagen
        modal && modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('hidden')) return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });

        // Configurar botones de acción
        document.getElementById('btn-compartir').addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: evento.title,
                    text: evento.description,
                    url: window.location.href
                });
            } else {
                // Fallback para navegadores que no soportan la API Web Share
                const dummy = document.createElement('input');
                document.body.appendChild(dummy);
                dummy.value = window.location.href;
                dummy.select();
                document.execCommand('copy');
                document.body.removeChild(dummy);
                alert('Enlace copiado al portapapeles');
            }
        });

        // Botón Google Calendar bien integrado
        const btnCalendario = document.getElementById('btn-calendario');
        if (btnCalendario) {
            btnCalendario.onclick = () => {
                let startDate, endDate;
                if (evento.fechaInicio && evento.time) {
                    // Si fechaInicio es Timestamp de Firestore
                    const fecha = evento.fechaInicio.toDate ? evento.fechaInicio.toDate() : new Date(evento.fechaInicio);
                    const hora = evento.time;
                    const [h, m] = hora.split(':');
                    fecha.setHours(parseInt(h), parseInt(m), 0, 0);
                    startDate = fecha;
                    endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 horas por defecto
                } else {
                    startDate = new Date();
                    endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
                }
                const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento.title)}&dates=${startDate.toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, 15)}/${endDate.toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, 15)}&details=${encodeURIComponent(evento.description || '')}&location=${encodeURIComponent(evento.location || '')}`;
                window.open(calendarUrl, '_blank');
            };
        }

        // Cargar comentarios y controlar UI según autenticación
        auth.onAuthStateChanged(async (user) => {
            setupCommentUI(user);
            await loadComments(eventoId, user);
            // Permitir enviar comentario con Enter solo si está autenticado
            const textarea = document.getElementById('comentario-texto');
            if (user) {
                textarea.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const text = textarea.value.trim();
                        if (text) {
                            await addComment(eventoId, text, user);
                        }
                    }
                });
            } else {
                textarea.removeEventListener('keypress', () => {});
            }
        });

        // Agregar corazón y estrellas
        const favBtn = document.createElement('button');
        favBtn.id = 'fav-btn';
        favBtn.title = 'Agregar a favoritos';
        favBtn.innerHTML = '<i class="fa-regular fa-heart text-2xl text-gray-400 hover:text-red-500"></i>';
        const ratingDiv = document.createElement('div');
        ratingDiv.id = 'rating-div';
        ratingDiv.className = 'flex items-center gap-2 mt-2';
        const infoSection = document.getElementById('event-info-section');
        if (infoSection) {
            infoSection.prepend(ratingDiv);
            infoSection.prepend(favBtn);
        }
        // Lógica de favoritos y puntuación
        auth.onAuthStateChanged(async user => {
            if (!user) return;
            // Favorito
            if (await isEventFavorite(user.uid, eventoId)) {
                favBtn.innerHTML = '<i class="fa-solid fa-heart text-2xl text-red-500"></i>';
                favBtn.title = 'Quitar de favoritos';
            }
            favBtn.onclick = async () => {
                if (await isEventFavorite(user.uid, eventoId)) {
                    await removeFavorite(user.uid, eventoId);
                    favBtn.innerHTML = '<i class="fa-regular fa-heart text-2xl text-gray-400 hover:text-red-500"></i>';
                    favBtn.title = 'Agregar a favoritos';
                } else {
                    await addFavorite(user.uid, eventoId);
                    favBtn.innerHTML = '<i class="fa-solid fa-heart text-2xl text-red-500"></i>';
                    favBtn.title = 'Quitar de favoritos';
                }
            };
            // Puntuación promedio
            const { avg, count } = await getEventRating(eventoId);
            ratingDiv.innerHTML = `<span class='text-lg'>${renderStars(avg)}</span> <span class='text-xs text-gray-500'>${avg.toFixed(1)} (${count})</span>`;
            // Puntuación propia
            let userScore = await getUserRating(user.uid, eventoId) || 0;
            const starsInputDiv = document.createElement('div');
            starsInputDiv.className = 'flex gap-1 ml-2';
            starsInputDiv.innerHTML = renderStarsInput(userScore);
            ratingDiv.appendChild(starsInputDiv);
            starsInputDiv.querySelectorAll('.va-star-btn').forEach(btn => {
                btn.onclick = async () => {
                    const score = parseInt(btn.dataset.score);
                    await setUserRating(user.uid, eventoId, score);
                    userScore = score;
                    starsInputDiv.innerHTML = renderStarsInput(userScore);
                    // Actualizar promedio
                    const { avg, count } = await getEventRating(eventoId);
                    ratingDiv.innerHTML = `<span class='text-lg'>${renderStars(avg)}</span> <span class='text-xs text-gray-500'>${avg.toFixed(1)} (${count})</span>`;
                    ratingDiv.appendChild(starsInputDiv);
                };
            });
        });

    } catch (error) {
        console.error('Error al cargar el evento:', error);
        // Mostrar mensaje de error al usuario
        const container = document.getElementById('evento-detalle');
        container.innerHTML = `
            <div class="text-center py-12">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">Error al cargar el evento</h2>
                <p class="text-gray-600">${error.message}</p>
                <a href="eventos.html" class="inline-block mt-4 text-indigo-600 hover:text-indigo-800">
                    Volver a la lista de eventos
                </a>
            </div>
        `;
    }
}

// Cargar los datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadEventoData);

// Agregar event listeners para el modal de autenticación
document.addEventListener('DOMContentLoaded', () => {
    // Cerrar modal
    const closeAuthModal = document.getElementById('closeAuthModal');
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', hideAuthModal);
    }

    // Cambiar entre login y registro
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    if (toggleAuthMode) {
        toggleAuthMode.addEventListener('click', toggleMode);
    }

    // Manejar envío del formulario
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleEmailPasswordAuth);
    }

    // Manejar inicio de sesión con Google
    const googleSignIn = document.getElementById('googleSignIn');
    if (googleSignIn) {
        googleSignIn.addEventListener('click', handleGoogleSignIn);
    }

    // Permitir cerrar el modal haciendo clic fuera del contenido
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                hideAuthModal();
            }
        });
    }
});

// === FAVORITOS Y PUNTUACIÓN ===

// Utilidad para saber si es favorito
async function isEventFavorite(userId, eventId) {
    const favsRef = collection(db, 'favorites');
    const q = query(favsRef, where('userId', '==', userId), where('eventId', '==', eventId));
    const snap = await getDocs(q);
    return !snap.empty;
}

// Agregar favorito
async function addFavorite(userId, eventId) {
    const favsRef = collection(db, 'favorites');
    await addDoc(favsRef, { userId, eventId, createdAt: new Date() });
}

// Quitar favorito
async function removeFavorite(userId, eventId) {
    const favsRef = collection(db, 'favorites');
    const q = query(favsRef, where('userId', '==', userId), where('eventId', '==', eventId));
    const snap = await getDocs(q);
    snap.forEach(async d => await deleteDoc(doc(db, 'favorites', d.id)));
}

// Obtener promedio de estrellas y cantidad de votos
async function getEventRating(eventId) {
    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('eventId', '==', eventId));
    const snap = await getDocs(q);
    if (snap.empty) return { avg: 0, count: 0 };
    let sum = 0;
    snap.forEach(d => sum += d.data().score);
    return { avg: sum / snap.size, count: snap.size };
}

// Obtener rating propio
async function getUserRating(userId, eventId) {
    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('userId', '==', userId), where('eventId', '==', eventId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data().score;
}

// Guardar/actualizar rating
async function setUserRating(userId, eventId, score) {
    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('userId', '==', userId), where('eventId', '==', eventId));
    const snap = await getDocs(q);
    if (snap.empty) {
        await addDoc(ratingsRef, { userId, eventId, score, ratedAt: new Date() });
    } else {
        await setDoc(doc(db, 'ratings', snap.docs[0].id), { userId, eventId, score, ratedAt: new Date() });
    }
}

function renderStars(avg) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<i class="fa-star${i <= Math.round(avg) ? ' fa-solid text-yellow-400' : ' fa-regular text-gray-300'}"></i>`;
    }
    return html;
}

function renderStarsInput(userScore) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<button class='va-star-btn' data-score='${i}' type='button'>` +
            `<i class="fa-star${i <= userScore ? ' fa-solid text-yellow-400' : ' fa-regular text-gray-300'}"></i></button>`;
    }
    return html;
} 