const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin con tu service account
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Ruta al archivo de eventos.js
const eventosPath = path.join(__dirname, 'src', 'assets', 'js', 'eventos.js');
const eventosFile = fs.readFileSync(eventosPath, 'utf8');

// Extraer el array de eventos usando una expresión regular robusta
const eventosRegex = /eventosData\s*=\s*\{\s*"eventos"\s*:\s*(\[[\s\S]*?\])\s*\}/m;
const match = eventosFile.match(eventosRegex);

if (!match) {
  console.error('No se pudo encontrar el array de eventos en eventos.js');
  process.exit(1);
}

let eventosArrayText = match[1];

// Eliminar comentarios de línea (// ...) y de bloque (/* ... */)
eventosArrayText = eventosArrayText
  .replace(/\/\/.*$/gm, '')
  .replace(/\/\*[\s\S]*?\*\//gm, '');

// Quitar comas finales antes de cerrar el array o un objeto
eventosArrayText = eventosArrayText
  .replace(/,\s*([\]}])/g, '$1');

// Asegurar que todas las claves estén entre comillas dobles (solo para nivel 1)
eventosArrayText = eventosArrayText.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

// Intentar parsear el array de eventos
let eventosArray;
try {
  eventosArray = JSON.parse(eventosArrayText);
} catch (e) {
  console.error('Error al parsear el array de eventos:', e);
  // Guardar el texto limpio en un archivo para que puedas revisarlo
  fs.writeFileSync('eventos_limpios.json', eventosArrayText);
  console.error('Se ha guardado el array limpio en eventos_limpios.json. Revísalo y corrige manualmente si es necesario.');
  process.exit(1);
}

async function migrarEventos() {
  for (const evento of eventosArray) {
    try {
      await db.collection('eventos').doc(evento.id).set(evento);
      console.log(`Evento migrado: ${evento.titulo}`);
    } catch (err) {
      console.error(`Error migrando evento ${evento.titulo}:`, err);
    }
  }
  console.log('¡Migración completada!');
  process.exit(0);
}

migrarEventos();