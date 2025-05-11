// migrar_categoria_a_category.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

// Pega aquí tu configuración de Firebase:
const firebaseConfig = {
  apiKey: "AIzaSyB-BICWbcKpiP8ImeVBWYVh3eFmrS8mPWY",
  authDomain: "vive-aguachica.firebaseapp.com",
  projectId: "vive-aguachica",
  storageBucket: "vive-aguachica.firebasestorage.app",
  messagingSenderId: "551401519520",
  appId: "1:551401519520:web:c7d816f408135fc0f48cc5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Lista de categorías válidas
const categoriasValidas = [
    "Cultura",
    "Deporte",
    "Religión",
    "Educación",
    "Arte",
    "Gastronomía",
    "Música",
    "Salud",
    "Entretenimiento",
    "Moda",
    "Infantil",
    "Político",
    "Mascotas",
    "Ambiental",
    "Tradición",
    "Social",
    "Alternativos",
    "Privados",
    "Otros"
];

async function migrarCategorias() {
  const eventosRef = collection(db, "events");
  const snapshot = await getDocs(eventosRef);
  let actualizados = 0;
  let errores = 0;

  for (const d of snapshot.docs) {
    const data = d.data();
    let categoria = data.categoria || data.category || 'Otros';

    // Verificar si la categoría es válida
    if (!categoriasValidas.includes(categoria)) {
      console.log(`Categoría inválida encontrada en evento ${d.id}: ${categoria}`);
      categoria = 'Otros';
    }

    try {
      await updateDoc(doc(db, "events", d.id), { 
        category: categoria,
        categoria: categoria // Mantener ambos campos por compatibilidad
      });
      actualizados++;
      console.log(`Evento ${d.id} actualizado: category = ${categoria}`);
    } catch (error) {
      errores++;
      console.error(`Error actualizando evento ${d.id}:`, error);
    }
  }

  console.log(`Migración completada. Total de eventos actualizados: ${actualizados}`);
  console.log(`Total de errores: ${errores}`);
}

migrarCategorias().catch(console.error);