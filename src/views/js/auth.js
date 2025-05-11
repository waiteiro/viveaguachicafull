// FAVORITOS EN PERFIL
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { db } from '../../assets/js/firebase.js';
import { createEventCard } from '../../assets/js/eventos.js';

async function getUserFavorites(userId) {
    const favsRef = collection(db, 'favorites');
    const q = query(favsRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data().eventId);
}

async function renderUserFavorites(userId) {
    const favIds = await getUserFavorites(userId);
    if (!favIds.length) {
        document.getElementById('favoritos-container').innerHTML = '<p class="text-gray-500">No tienes eventos favoritos aún.</p>';
        return;
    }
    // Obtener datos de los eventos favoritos
    const events = [];
    for (const id of favIds) {
        const eventSnap = await getDoc(doc(db, 'events', id));
        if (eventSnap.exists()) {
            events.push({ id, ...eventSnap.data() });
        }
    }
    document.getElementById('favoritos-container').innerHTML = events.map(createEventCard).join('');
}

auth.onAuthStateChanged((user) => {
    if (user) {
        if (window.location.pathname.includes('perfil.html')) {
            renderUserFavorites(user.uid);
        }
    }
});
// Llamar a renderUserFavorites(user.uid) cuando el usuario esté autenticado y en el perfil 