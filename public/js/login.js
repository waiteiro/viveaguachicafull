document.addEventListener('DOMContentLoaded', () => {
    // Redirigir si el usuario ya está autenticado
    redirectIfAuth();

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Iniciar sesión con Firebase Auth
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Obtener datos adicionales del usuario desde Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                throw new Error('Usuario no encontrado');
            }

            showMessage('Inicio de sesión exitoso', 'success');
            setTimeout(() => {
                window.location.href = '/profile.html';
            }, 1500);
        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            showMessage(error.message);
        }
    });
}); 