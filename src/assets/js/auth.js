// Elementos del DOM
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const closeAuthModal = document.getElementById('closeAuthModal');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const googleSignIn = document.getElementById('googleSignIn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Elementos del DOM para el menú de usuario
const userMenuButton = document.getElementById('userMenuButton');
const userMenu = document.getElementById('userMenu');
const logoutButton = document.getElementById('logoutButton');
const logoutButtonMobile = document.getElementById('logoutButtonMobile');

let isLoginMode = true;

// Reasignar funciones de Firebase desde window
const auth = window.firebaseAuth;
const googleProvider = window.firebaseGoogleProvider;
const signInWithEmailAndPassword = window.signInWithEmailAndPassword;
const createUserWithEmailAndPassword = window.createUserWithEmailAndPassword;
const signInWithPopup = window.signInWithPopup;

// Función para obtener avatar por defecto según nombre
function getDefaultAvatar(name) {
    const initials = name
        ? name.trim().split(' ').map(w => w[0].toUpperCase()).join('').slice(0, 2)
        : 'US';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=E0E7FF&color=3730A3&rounded=true`;
}

const DEFAULT_AVATAR = getDefaultAvatar('Usuario');

// Toast visual
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `px-4 py-3 rounded shadow-lg text-white font-medium flex items-center space-x-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3500);
}

// Mostrar/ocultar campo nombre según modo
function updateNameField() {
    const nameField = document.getElementById('nameField');
    if (isLoginMode) {
        nameField.style.display = 'none';
    } else {
        nameField.style.display = 'block';
    }
}

// Función para mostrar el modal
function showAuthModal() {
    authModal.classList.remove('hidden');
    authModal.classList.add('flex');
}

// Función para ocultar el modal
function hideAuthModal() {
    authModal.classList.add('hidden');
    authModal.classList.remove('flex');
}

// Función para cambiar entre login y registro
function toggleMode() {
    isLoginMode = !isLoginMode;
    const title = authModal.querySelector('h2');
    const submitButton = authForm.querySelector('button[type="submit"]');
    const toggleButton = toggleAuthMode;
    
    if (isLoginMode) {
        title.textContent = 'Iniciar Sesión';
        submitButton.textContent = 'Iniciar Sesión';
        toggleButton.textContent = 'Regístrate';
    } else {
        title.textContent = 'Crear Cuenta';
        submitButton.textContent = 'Registrarse';
        toggleButton.textContent = 'Iniciar Sesión';
    }
    updateNameField();
}

// Función para manejar el inicio de sesión con email/password
async function handleEmailPasswordAuth(e) {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
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
                await window.updateProfile(userCredential.user, { displayName });
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

// Función para mostrar mensajes de éxito
function showSuccessMessage(message) {
    showToast(message, 'success');
}

// Función para mostrar mensajes de error
function showErrorMessage(message) {
    showToast(message, 'error');
}

// Función para mostrar/ocultar el menú de usuario
function toggleUserMenu() {
    userMenu.classList.toggle('hidden');
}

// Función para cerrar sesión
async function handleLogout() {
    try {
        await auth.signOut();
        hideAuthModal();
        showToast('Sesión cerrada correctamente', 'success');
        window.location.reload(); // Recargar la página tras cerrar sesión
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar modal cuando se hace clic en el botón de login
    document.querySelectorAll('[data-auth="login"]').forEach(button => {
        button.addEventListener('click', showAuthModal);
    });

    // Cerrar modal
    closeAuthModal.addEventListener('click', hideAuthModal);

    // Cambiar entre login y registro
    toggleAuthMode.addEventListener('click', toggleMode);

    // Manejar envío del formulario
    authForm.addEventListener('submit', handleEmailPasswordAuth);

    // Manejar inicio de sesión con Google
    googleSignIn.addEventListener('click', handleGoogleSignIn);

    // Manejar menú de usuario
    userMenuButton.addEventListener('click', toggleUserMenu);

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
            userMenu.classList.add('hidden');
        }
    });

    // Manejar cierre de sesión
    logoutButton.addEventListener('click', handleLogout);
    logoutButtonMobile.addEventListener('click', handleLogout);

    // Observar cambios en el estado de autenticación
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Usuario ha iniciado sesión
            console.log('Usuario autenticado:', user);
            
            // Actualizar UI para usuario autenticado
            document.querySelectorAll('[data-auth="login"]').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('[data-auth="user"]').forEach(el => {
                el.style.display = 'block';
            });

            // Actualizar información del usuario
            const userName = user.displayName || 'Usuario';
            const userAvatar = user.photoURL || getDefaultAvatar(userName);

            document.getElementById('userName').textContent = userName;
            document.getElementById('userNameMobile').textContent = userName;
            document.getElementById('userAvatar').src = userAvatar;
            document.getElementById('userAvatarMobile').src = userAvatar;
            // Si la imagen falla, usar la por defecto
            document.getElementById('userAvatar').onerror = function() {
                this.src = getDefaultAvatar(userName);
            };
            document.getElementById('userAvatarMobile').onerror = function() {
                this.src = getDefaultAvatar(userName);
            };
        } else {
            // Usuario ha cerrado sesión
            console.log('Usuario no autenticado');
            
            // Actualizar UI para usuario no autenticado
            document.querySelectorAll('[data-auth="login"]').forEach(el => {
                el.style.display = 'block';
            });
            document.querySelectorAll('[data-auth="user"]').forEach(el => {
                el.style.display = 'none';
            });
        }
    });

    // Permitir cerrar el modal haciendo clic fuera del contenido
    if (authModal) {
        authModal.addEventListener('click', function (e) {
            if (e.target === authModal) {
                hideAuthModal();
            }
        });
    }

    updateNameField();
}); 