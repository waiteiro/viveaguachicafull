document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    const user = await requireAuth();
    if (!user) return;

    // Referencias a elementos del DOM
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const profileForm = document.getElementById('profileForm');
    const editPhotoBtn = document.getElementById('editPhotoBtn');

    // Cargar datos del usuario
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    // Mostrar datos del usuario
    userAvatar.src = userData.photoURL || 'https://via.placeholder.com/150';
    userName.textContent = userData.displayName;
    userEmail.textContent = userData.email;

    // Llenar formulario con datos existentes
    document.getElementById('displayName').value = userData.displayName || '';
    document.getElementById('bio').value = userData.bio || '';
    document.getElementById('phoneNumber').value = userData.phoneNumber || '';
    document.getElementById('address').value = userData.location?.address || '';
    document.getElementById('city').value = userData.location?.city || '';
    document.getElementById('state').value = userData.location?.state || '';
    document.getElementById('country').value = userData.location?.country || '';
    document.getElementById('interests').value = userData.interests?.join(', ') || '';
    document.getElementById('facebook').value = userData.socialMedia?.facebook || '';
    document.getElementById('twitter').value = userData.socialMedia?.twitter || '';
    document.getElementById('instagram').value = userData.socialMedia?.instagram || '';

    // Manejar cambio de foto
    editPhotoBtn.addEventListener('click', () => {
        const photoURL = prompt('Ingresa la URL de tu nueva foto de perfil:');
        if (photoURL) {
            userAvatar.src = photoURL;
            document.getElementById('photoURL').value = photoURL;
        }
    });

    // Manejar envío del formulario
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            displayName: document.getElementById('displayName').value,
            photoURL: document.getElementById('photoURL').value,
            bio: document.getElementById('bio').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            location: {
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                country: document.getElementById('country').value
            },
            interests: document.getElementById('interests').value
                .split(',')
                .map(interest => interest.trim())
                .filter(interest => interest),
            socialMedia: {
                facebook: document.getElementById('facebook').value,
                twitter: document.getElementById('twitter').value,
                instagram: document.getElementById('instagram').value
            },
            updatedAt: new Date()
        };

        try {
            // Actualizar perfil en Firebase Auth
            await user.updateProfile({
                displayName: formData.displayName,
                photoURL: formData.photoURL
            });

            // Actualizar datos en Firestore
            await db.collection('users').doc(user.uid).update(formData);

            // Actualizar UI
            userAvatar.src = formData.photoURL || 'https://via.placeholder.com/150';
            userName.textContent = formData.displayName;

            showMessage('Perfil actualizado exitosamente', 'success');
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            showMessage(error.message);
        }
    });
}); 