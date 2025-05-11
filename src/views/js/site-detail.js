import { db } from './firebase-init.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug') || '';
}

async function cargarSitio() {
  const container = document.getElementById('siteContainer');
  const loading = document.getElementById('loadingSite');
  const slug = getSlug();
  if (!slug) {
    if (loading) loading.textContent = 'Slug no proporcionado.';
    return;
  }
  try {
    const q = query(collection(db, 'sites'), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) {
      if (loading) loading.textContent = 'Sitio no encontrado.';
      return;
    }
    const data = snap.docs[0].data();
    loading.remove();
    container.innerHTML = `
      <h1 class="h3 fw-bold mb-3">${data.name}</h1>
      <p class="text-muted">Pronto verás la información detallada de este sitio.</p>
    `;
  } catch (e) {
    console.error('Error cargando sitio', e);
    if (loading) loading.textContent = 'Error cargando sitio.';
  }
}

document.addEventListener('DOMContentLoaded', cargarSitio); 