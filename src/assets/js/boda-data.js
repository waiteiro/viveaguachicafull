const bodaData = {
    lugares: [
        {
            id: 1,
            nombre: "Hacienda La Esperanza",
            descripcion: "Elegante hacienda colonial con jardines exuberantes y salón de eventos climatizado.",
            precio: "Desde $5.000.000",
            imagen: "images/boda/lugares/hacienda-esperanza.jpg",
            caracteristicas: ["Capacidad: 200 personas", "Jardines exteriores", "Parqueadero privado", "Cocina equipada"],
            filtros: ["interior", "exterior", "capacidad+200", "parqueadero"]
        },
        {
            id: 2,
            nombre: "Club Campestre Aguachica",
            descripcion: "Moderno club con vista panorámica y piscina para eventos al aire libre.",
            precio: "Desde $4.500.000",
            imagen: "images/boda/lugares/club-campestre.jpg",
            caracteristicas: ["Capacidad: 150 personas", "Piscina", "Terraza exterior", "Servicio de catering"],
            filtros: ["exterior", "capacidad+100", "piscina"]
        },
        {
            id: 3,
            nombre: "Salón Los Almendros",
            descripcion: "Acogedor salón de eventos con decoración moderna y excelente iluminación.",
            precio: "Desde $3.800.000",
            imagen: "images/boda/lugares/salon-almendros.jpg",
            caracteristicas: ["Capacidad: 120 personas", "Sistema de sonido", "Cocina profesional", "Estacionamiento"],
            filtros: ["interior", "capacidad+100", "parqueadero"]
        }
    ],
    vestuario: [
        {
            id: 1,
            nombre: "Boutique Elegancia",
            descripcion: "Diseñadores expertos en vestidos de novia y trajes de gala.",
            precio: "Desde $2.500.000",
            imagen: "images/boda/vestuario/boutique-elegancia.jpg",
            caracteristicas: ["Vestidos personalizados", "Pruebas ilimitadas", "Ajustes incluidos", "Accesorios"],
            filtros: ["vestido-novia", "personalizado"]
        },
        {
            id: 2,
            nombre: "Trajes Don Juan",
            descripcion: "Especialistas en trajes formales y vestimenta de novio.",
            precio: "Desde $1.800.000",
            imagen: "images/boda/vestuario/trajes-don-juan.jpg",
            caracteristicas: ["Trajes a medida", "Alquiler disponible", "Complementos", "Ajustes incluidos"],
            filtros: ["traje-novio", "alquiler"]
        },
        {
            id: 3,
            nombre: "Moda Nupcial Express",
            descripcion: "Boutique con amplia selección de vestidos y trajes de alquiler.",
            precio: "Desde $1.200.000",
            imagen: "images/boda/vestuario/moda-nupcial.jpg",
            caracteristicas: ["Alquiler de vestidos", "Trajes de alquiler", "Accesorios", "Pruebas express"],
            filtros: ["vestido-novia", "traje-novio", "alquiler"]
        }
    ],
    maquillaje: [
        {
            id: 1,
            nombre: "Estudio Belleza Total",
            descripcion: "Maquillaje profesional y peinados para bodas.",
            precio: "Desde $800.000",
            imagen: "images/boda/maquillaje/belleza-total.jpg",
            caracteristicas: ["Maquillaje HD", "Peinado incluido", "Prueba previa", "A domicilio"],
            filtros: ["a-domicilio", "incluye-peinado", "prueba-previa"]
        },
        {
            id: 2,
            nombre: "Glamour Novias",
            descripcion: "Especialistas en maquillaje de novias y acompañantes.",
            precio: "Desde $600.000",
            imagen: "images/boda/maquillaje/glamour-novias.jpg",
            caracteristicas: ["Maquillaje natural", "Peinado incluido", "Prueba previa", "Estudio propio"],
            filtros: ["incluye-peinado", "prueba-previa"]
        },
        {
            id: 3,
            nombre: "Makeup Express",
            descripcion: "Servicio de maquillaje profesional a domicilio.",
            precio: "Desde $500.000",
            imagen: "images/boda/maquillaje/makeup-express.jpg",
            caracteristicas: ["Maquillaje express", "A domicilio", "Productos premium", "Servicio 24/7"],
            filtros: ["a-domicilio"]
        }
    ],
    decoracion: [
        {
            id: 1,
            nombre: "Decoraciones Elegantes",
            descripcion: "Decoración completa para bodas con estilo elegante y moderno.",
            precio: "Desde $3.000.000",
            imagen: "images/boda/decoracion/elegantes.jpg",
            caracteristicas: ["Centros de mesa", "Arreglos florales", "Iluminación", "Mobiliario"],
            filtros: ["flores", "iluminacion", "mobiliario"]
        },
        {
            id: 2,
            nombre: "Flores y Más",
            descripcion: "Especialistas en arreglos florales y decoración natural.",
            precio: "Desde $2.500.000",
            imagen: "images/boda/decoracion/flores-mas.jpg",
            caracteristicas: ["Arreglos florales", "Centros de mesa", "Decoración exterior", "Flores frescas"],
            filtros: ["flores", "exterior"]
        },
        {
            id: 3,
            nombre: "Iluminación Profesional",
            descripcion: "Servicio especializado en iluminación para eventos.",
            precio: "Desde $1.800.000",
            imagen: "images/boda/decoracion/iluminacion.jpg",
            caracteristicas: ["Iluminación LED", "Efectos especiales", "Control remoto", "Diseño personalizado"],
            filtros: ["iluminacion", "efectos"]
        }
    ],
    catering: [
        {
            id: 1,
            nombre: "Sabores del Cesar",
            descripcion: "Catering especializado en gastronomía regional y platos gourmet.",
            precio: "Desde $150.000 por persona",
            imagen: "images/boda/catering/sabores-cesar.jpg",
            caracteristicas: ["Buffet completo", "Menú tradicional", "Postres artesanales", "Personal de servicio"],
            filtros: ["buffet", "tradicional"]
        },
        {
            id: 2,
            nombre: "Catering Verde",
            descripcion: "Especialistas en menús saludables y opciones veganas.",
            precio: "Desde $120.000 por persona",
            imagen: "images/boda/catering/catering-verde.jpg",
            caracteristicas: ["Opciones veganas", "Menú saludable", "Postres sin azúcar", "Servicio personalizado"],
            filtros: ["vegano-saludable"]
        },
        {
            id: 3,
            nombre: "Dulce Tentación",
            descripcion: "Especialistas en pasteles de boda y postres gourmet.",
            precio: "Desde $800.000",
            imagen: "images/boda/catering/dulce-tentacion.jpg",
            caracteristicas: ["Pasteles personalizados", "Postres gourmet", "Cupcakes", "Mesa de dulces"],
            filtros: ["solo-pastel"]
        }
    ],
    musica: [
        {
            id: 1,
            nombre: "DJ Master",
            descripcion: "DJ profesional con amplia experiencia en bodas.",
            precio: "Desde $1.200.000",
            imagen: "images/boda/musica/dj-master.jpg",
            caracteristicas: ["Música personalizada", "Equipo profesional", "Animación", "Luz y sonido"],
            filtros: ["dj", "grabado"]
        },
        {
            id: 2,
            nombre: "Los Reyes del Vallenato",
            descripcion: "Grupo vallenato tradicional para bodas.",
            precio: "Desde $2.000.000",
            imagen: "images/boda/musica/reyes-vallenato.jpg",
            caracteristicas: ["4 músicos", "Repertorio personalizado", "Animación", "Equipo profesional"],
            filtros: ["grupo-vallenato", "en-vivo"]
        },
        {
            id: 3,
            nombre: "Mariachis Aguachica",
            descripcion: "Grupo de mariachis profesionales para bodas.",
            precio: "Desde $1.800.000",
            imagen: "images/boda/musica/mariachis-aguachica.jpg",
            caracteristicas: ["8 músicos", "Repertorio clásico", "Trajes tradicionales", "Animación"],
            filtros: ["mariachis", "en-vivo"]
        }
    ],
    agrupaciones: [
        {
            id: 1,
            nombre: "Grupo Vallenato Tradicional",
            descripcion: "Agrupación vallenata con más de 10 años de experiencia.",
            precio: "Desde $2.500.000",
            imagen: "images/boda/agrupaciones/vallenato-tradicional.jpg",
            caracteristicas: ["4 músicos", "Repertorio clásico", "Animación", "Equipo profesional"],
            filtros: ["vallenato", "en-vivo"]
        },
        {
            id: 2,
            nombre: "Orquesta Sinfónica",
            descripcion: "Orquesta profesional para ceremonias y eventos formales.",
            precio: "Desde $3.500.000",
            imagen: "images/boda/agrupaciones/orquesta.jpg",
            caracteristicas: ["12 músicos", "Repertorio clásico", "Dirección profesional", "Equipo de sonido"],
            filtros: ["orquesta", "en-vivo"]
        },
        {
            id: 3,
            nombre: "Grupo Tropical",
            descripcion: "Agrupación versátil para todo tipo de música tropical.",
            precio: "Desde $2.000.000",
            imagen: "images/boda/agrupaciones/tropical.jpg",
            caracteristicas: ["5 músicos", "Repertorio variado", "Animación", "Equipo profesional"],
            filtros: ["tropical", "en-vivo"]
        }
    ],
    animacion: [
        {
            id: 1,
            nombre: "Animación Total",
            descripcion: "Servicio completo de animación para bodas.",
            precio: "Desde $1.500.000",
            imagen: "images/boda/animacion/total.jpg",
            caracteristicas: ["2 animadores", "Juegos interactivos", "Premios", "Música"],
            filtros: ["juegos", "premios"]
        },
        {
            id: 2,
            nombre: "Show Infantil",
            descripcion: "Animación especializada para niños en bodas.",
            precio: "Desde $1.000.000",
            imagen: "images/boda/animacion/infantil.jpg",
            caracteristicas: ["Animadores infantiles", "Juegos", "Pintacaritas", "Premios"],
            filtros: ["infantil", "juegos"]
        },
        {
            id: 3,
            nombre: "Animación Premium",
            descripcion: "Servicio de animación exclusivo para bodas.",
            precio: "Desde $2.000.000",
            imagen: "images/boda/animacion/premium.jpg",
            caracteristicas: ["3 animadores", "Juegos exclusivos", "Premios premium", "Fotografía"],
            filtros: ["premium", "fotografia"]
        }
    ],
    fotografia: [
        {
            id: 1,
            nombre: "Fotografía Artística",
            descripcion: "Fotógrafos profesionales especializados en bodas.",
            precio: "Desde $2.500.000",
            imagen: "images/boda/fotografia/artistica.jpg",
            caracteristicas: ["Fotos HD", "Álbum digital", "Sesión pre-boda", "Fotos impresas"],
            filtros: ["solo-fotos"]
        },
        {
            id: 2,
            nombre: "Video y Foto Studio",
            descripcion: "Servicio completo de fotografía y video para bodas.",
            precio: "Desde $3.800.000",
            imagen: "images/boda/fotografia/video-foto.jpg",
            caracteristicas: ["Fotos y video", "Dron incluido", "Video highlight", "Álbum digital"],
            filtros: ["video-incluido", "dron"]
        },
        {
            id: 3,
            nombre: "Dron Studio",
            descripcion: "Fotografía aérea profesional para bodas.",
            precio: "Desde $1.500.000",
            imagen: "images/boda/fotografia/dron-studio.jpg",
            caracteristicas: ["Fotos aéreas", "Video aéreo", "Fotos 360°", "Edición profesional"],
            filtros: ["dron"]
        }
    ],
    transporte: [
        {
            id: 1,
            nombre: "Transporte Elegante",
            descripcion: "Servicio de transporte exclusivo para bodas.",
            precio: "Desde $1.200.000",
            imagen: "images/boda/transporte/elegante.jpg",
            caracteristicas: ["Vehículos de lujo", "Chofer profesional", "Decoración", "Aire acondicionado"],
            filtros: ["lujo", "decorado"]
        },
        {
            id: 2,
            nombre: "Flota Familiar",
            descripcion: "Transporte para invitados y familiares.",
            precio: "Desde $800.000",
            imagen: "images/boda/transporte/familiar.jpg",
            caracteristicas: ["Vehículos familiares", "Capacidad 15 personas", "Aire acondicionado", "Seguro"],
            filtros: ["familiar", "grupo"]
        },
        {
            id: 3,
            nombre: "Transporte VIP",
            descripcion: "Servicio de transporte premium para novios.",
            precio: "Desde $1.500.000",
            imagen: "images/boda/transporte/vip.jpg",
            caracteristicas: ["Vehículo premium", "Chofer personal", "Decoración exclusiva", "Servicio 24/7"],
            filtros: ["vip", "premium"]
        }
    ],
    efectos: [
        {
            id: 1,
            nombre: "Efectos Especiales",
            descripcion: "Servicio completo de efectos especiales para bodas.",
            precio: "Desde $2.000.000",
            imagen: "images/boda/efectos/especiales.jpg",
            caracteristicas: ["Pirotecnia", "Humo", "Burbujas", "Confeti"],
            filtros: ["pirotecnia", "humo"]
        },
        {
            id: 2,
            nombre: "Iluminación Profesional",
            descripcion: "Efectos de iluminación profesional para bodas.",
            precio: "Desde $1.500.000",
            imagen: "images/boda/efectos/iluminacion.jpg",
            caracteristicas: ["Láser", "LED", "Control remoto", "Diseño personalizado"],
            filtros: ["laser", "led"]
        },
        {
            id: 3,
            nombre: "Efectos Naturales",
            descripcion: "Efectos naturales y elegantes para bodas.",
            precio: "Desde $1.000.000",
            imagen: "images/boda/efectos/naturales.jpg",
            caracteristicas: ["Burbujas", "Confeti biodegradable", "Pétalos", "Aromas"],
            filtros: ["natural", "biodegradable"]
        }
    ],
    recordatorios: [
        {
            id: 1,
            nombre: "Recuerdos Elegantes",
            descripcion: "Diseño y producción de recordatorios para bodas.",
            precio: "Desde $800.000",
            imagen: "images/boda/recordatorios/elegantes.jpg",
            caracteristicas: ["Diseño personalizado", "Materiales premium", "Empaque especial", "Mínimo 100 unidades"],
            filtros: ["premium", "personalizado"]
        },
        {
            id: 2,
            nombre: "Recuerdos Creativos",
            descripcion: "Recordatorios originales y creativos para bodas.",
            precio: "Desde $600.000",
            imagen: "images/boda/recordatorios/creativos.jpg",
            caracteristicas: ["Diseños únicos", "Materiales reciclables", "Empaque ecológico", "Mínimo 50 unidades"],
            filtros: ["creativo", "ecologico"]
        },
        {
            id: 3,
            nombre: "Recuerdos Clásicos",
            descripcion: "Recordatorios tradicionales para bodas.",
            precio: "Desde $500.000",
            imagen: "images/boda/recordatorios/clasicos.jpg",
            caracteristicas: ["Diseño clásico", "Materiales estándar", "Empaque simple", "Mínimo 50 unidades"],
            filtros: ["clasico", "economico"]
        }
    ],
    logistica: [
        {
            id: 1,
            nombre: "Logística Total",
            descripcion: "Servicio completo de logística para bodas.",
            precio: "Desde $3.000.000",
            imagen: "images/boda/logistica/total.jpg",
            caracteristicas: ["Coordinación general", "Personal de apoyo", "Montaje y desmontaje", "Supervisión"],
            filtros: ["completo", "coordinacion"]
        },
        {
            id: 2,
            nombre: "Logística Express",
            descripcion: "Servicio básico de logística para bodas.",
            precio: "Desde $1.500.000",
            imagen: "images/boda/logistica/express.jpg",
            caracteristicas: ["Montaje básico", "Personal mínimo", "Supervisión básica", "Soporte telefónico"],
            filtros: ["basico", "express"]
        },
        {
            id: 3,
            nombre: "Logística Premium",
            descripcion: "Servicio exclusivo de logística para bodas.",
            precio: "Desde $4.000.000",
            imagen: "images/boda/logistica/premium.jpg",
            caracteristicas: ["Coordinación exclusiva", "Personal premium", "Montaje profesional", "Supervisión 24/7"],
            filtros: ["premium", "exclusivo"]
        }
    ]
};

export default bodaData; 