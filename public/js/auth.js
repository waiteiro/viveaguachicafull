// Configuración de Firebase
const firebaseConfig = {
    // Aquí va tu configuración de Firebase
    apiKey: "tu-api-key",
    authDomain: "tu-auth-domain",
    projectId: "tu-project-id",
    storageBucket: "tu-storage-bucket",
    messagingSenderId: "tu-messaging-sender-id",
    appId: "tu-app-id"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// Función para mostrar mensajes
function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    const form = document.querySelector('form');
    form.insertAdjacentElement('beforebegin', messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Función para verificar si el usuario está autenticado
function checkAuth() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
            resolve(user);
        });
    });
}

// Función para redirigir si el usuario no está autenticado
async function requireAuth() {
    const user = await checkAuth();
    if (!user) {
        window.location.href = '/login.html';
    }
    return user;
}

// Función para redirigir si el usuario está autenticado
async function redirectIfAuth() {
    const user = await checkAuth();
    if (user) {
        window.location.href = '/profile.html';
    }
} 