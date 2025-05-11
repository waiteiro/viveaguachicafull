// after build fechaStr
const sitioHTML = (ev.siteRef && sitesMap[ev.siteRef]) ?
  `<i class="bi bi-geo-alt-fill me-1"></i><a href="sitio.html?slug=${encodeURIComponent(sitesMap[ev.siteRef].slug)}" class="text-decoration-none fw-semibold">${sitesMap[ev.siteRef].name}</a>`
  : (ev.location || '');

// Etiqueta Finalizado si la fecha es pasada
let badgeHTML = '';
if(ev.fechaInicio?.seconds){
  const startDate = new Date(ev.fechaInicio.seconds *1000);
  const now = new Date();
  if(startDate < now) badgeHTML = '<span class="badge bg-secondary ms-1">Finalizado</span>';
}

art.innerHTML = `
  <h3 class="fs-5 fw-bold">${ev.title} ${badgeHTML}</h3>
  <p class="text-muted mb-1">${fechaStr}</p>
  <p class="text-muted mb-1">${sitioHTML}</p>
  <p>${ev.description || ''}</p>
`;