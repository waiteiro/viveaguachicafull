document.addEventListener('DOMContentLoaded', () => {
    // Redirigir si el usuario ya está autenticado
    redirectIfAuth();

    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const displayName = document.getElementById('displayName').value;
        const photoURL = document.getElementById('photoURL').value;

        try {
            // Crear usuario en Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Actualizar el perfil del usuario
            await user.updateProfile({
                displayName,
                photoURL: photoURL || null
            });

            // Crear documento del usuario en Firestore
            await db.collection('users').doc(user.uid).set({
                id: user.uid,
                email,
                displayName,
                photoURL: photoURL || null,
                interests: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                role: 'user'
            });

            showMessage('Registro exitoso', 'success');
            setTimeout(() => {
                window.location.href = '/profile.html';
            }, 1500);
        } catch (error) {
            console.error('Error en el registro:', error);
            showMessage(error.message);
        }
    });
}); 