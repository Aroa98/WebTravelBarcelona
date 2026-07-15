-- 1. Limpiamos cualquier intento fallido (el orden de borrado es inverso al de creación)
DROP TABLE IF EXISTS "actividadDia";
DROP TABLE IF EXISTS "diaViaje";

-- 2. Creamos la tabla padre PRIMERO
CREATE TABLE "diaViaje" (
    id_dia SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    descripcion_es VARCHAR(255),
    descripcion_en VARCHAR(255)
);

-- 3. Creamos la tabla hija DESPUÉS
CREATE TABLE "actividadDia" (
    id_actividad SERIAL PRIMARY KEY,
    id_dia INT NOT NULL,
    hora TIME NOT NULL,
    titulo_es VARCHAR(150) NOT NULL,
    titulo_en VARCHAR(150) NOT NULL,
    descripcion_es TEXT,
    descripcion_en TEXT,
    url VARCHAR(255),
    "reservaLink" VARCHAR(255),
    notas_es TEXT,
    notas_en TEXT,
    -- Con las comillas dobles nos aseguramos de que busque exactamente "diaViaje"
    FOREIGN KEY (id_dia) REFERENCES "diaViaje"(id_dia) ON DELETE CASCADE
);


-- 1. Insertamos los días del viaje
INSERT INTO "diaViaje" (id_dia, fecha, descripcion_es, descripcion_en) VALUES
(7, '2026-10-07', 'Vuelo de ida', 'Departure Flight'),
(8, '2026-10-08', 'Llegada y el Corazón Histórico', 'Arrival & the Historic Heart'),
(9, '2026-10-09', 'La Ruta de Gaudí', 'The Gaudí Route'),
(10, '2026-10-10', 'Día de la Boda', 'Wedding Day'),
(11, '2026-10-11', 'La Montaña Mágica', 'The Magic Mountain'),
(12, '2026-10-12', 'La Magia de la Costa Brava', 'The Magic of Costa Brava'),
(13, '2026-10-13', 'Escapada a los Pirineos (Andorra)', 'Pyrenees Getaway (Andorra)'),
(14, '2026-10-14', 'Vino y Tradición (Sur de Cataluña)', 'Wine & Tradition (Southern Catalonia)'),
(15, '2026-10-15', 'Cultura y Brisa Marina (Vuelta a Barcelona)', 'Culture & Sea Breeze (Back to Barcelona)'),
(16, '2026-10-16', 'Tesoros Ocultos y Despedida', 'Hidden Gems & Farewell'),
(17, '2026-10-17', 'Regreso a Casa', 'Heading Home');

-- 2. Actualizamos la secuencia (Importante en PostgreSQL tras forzar IDs a mano)
SELECT setval(pg_get_serial_sequence('"diaViaje"', 'id_dia'), (SELECT MAX(id_dia) FROM "diaViaje"));

-- 3. Insertamos todas las actividades vinculadas a sus respectivos días
INSERT INTO "actividadDia" (id_dia, hora, titulo_es, titulo_en, descripcion_es, descripcion_en, notas_es, notas_en, "reservaLink") VALUES
-- Día 7
(7, '18:35:00', 'Salida del Vuelo a Barcelona', 'Flight Departure to Barcelona', 'Salida del vuelo desde Washington DC (IAD/DCA) a las 18:35 rumbo al Aeropuerto de Barcelona-El Prat (BCN).', 'Flight departure from Washington DC (IAD/DCA) at 6:35 PM heading to Barcelona-El Prat Airport (BCN).', 'Lugar: Washington DC', 'Location: Washington DC', NULL),

-- Día 8
(8, '08:20:00', 'Llegada', 'Arrival', 'Aterrizaje en el Aeropuerto de Barcelona-El Prat. Recogida de equipaje y traslado al alojamiento.', 'Landing at Barcelona-El Prat Airport (Flight from Washington DC). Baggage claim and transfer to accommodation.', 'Lugar: Barcelona-El Prat Airport (BCN)', 'Location: Barcelona-El Prat Airport (BCN)', NULL),
(8, '12:00:00', 'Paseo de Bienvenida', 'Welcome Walk', 'Paseo por Las Ramblas y el Mercado de la Boquería para un almuerzo rápido.', 'Walk along Las Ramblas and the Boquería Market for a quick lunch.', 'Lugar: Las Ramblas & Boquería Market', 'Location: Las Ramblas & Boquería Market', NULL),
(8, '16:00:00', 'Exploración Gótica', 'Gothic Exploration', 'Visita al Barrio Gótico, incluyendo la Catedral de Barcelona y la Plaza del Rey.', 'Visit to the Gothic Quarter, including Barcelona Cathedral and Plaza del Rey.', 'Lugar: Barrio Gótico', 'Location: Gothic Quarter', NULL),

-- Día 9
(9, '09:30:00', 'Obra Maestra', 'Masterpiece', 'Visita interior a la Sagrada Familia (Requiere reserva previa).', 'Interior visit to the Sagrada Familia (Advance booking required).', 'Lugar: Sagrada Familia', 'Location: Sagrada Familia', 'https://tickets.sagradafamilia.org/'),
(9, '13:30:00', 'Paseo de Gràcia', 'Paseo de Gràcia', 'Paseo para ver las fachadas de la Casa Batlló y La Pedrera (Casa Milà), con la opción de entrar a una de ellas.', 'Walk to see the facades of Casa Batlló and La Pedrera (Casa Milà), with the option to enter one of them.', 'Lugar: Paseo de Gràcia', 'Location: Paseo de Gràcia', 'https://www.casabatllo.es/venta-entradas/'),
(9, '17:00:00', 'Atardecer en el Parque', 'Sunset at the Park', 'Visita al Park Güell (Requiere reserva previa para la zona monumental).', 'Visit to Park Güell (Advance booking required for the monumental zone).', 'Lugar: Park Güell', 'Location: Park Güell', 'https://parkguell.barcelona/es/compra-de-entradas'),

-- Día 10
(10, '11:00:00', 'Llegada al Recinto', 'Arrival at the Venue', 'Llegada de los invitados al recinto y check-in en las habitaciones.', 'Guests arrival at the venue and room check-in.', 'Lugar: Finca de Boda', 'Location: Wedding Guesthouse', NULL),
(10, '12:00:00', 'Ceremonia', 'Ceremony', 'Servicio de boda y celebración oficial.', 'Wedding service and official celebration.', 'Lugar: Finca de Boda', 'Location: Wedding Guesthouse', NULL),
(10, '13:00:00', 'Aperitivo', 'Appetizer', 'Aperitivos y cóctel de bienvenida con los invitados.', 'Finger food and welcome cocktail with the guests.', 'Lugar: Jardines de la Finca', 'Location: Guesthouse Gardens', NULL),
(10, '14:00:00', 'Comida / Banquete', 'Lunch / Banquet', 'Banquete principal de bodas.', 'Main wedding banquet.', 'Lugar: Salón de la Finca', 'Location: Guesthouse Hall', NULL),
(10, '16:00:00', 'Fiesta', 'Wedding Party', 'Baile, música y celebraciones festivas hasta la tarde (20:00).', 'Dancing, music, and festive celebrations until evening (20:00).', 'Lugar: Pista de Baile', 'Location: Dance Floor', NULL),
(10, '20:00:00', 'Cena', 'Dinner', 'Cena para recuperar energías (duración de 20:00 a 21:00).', 'Dinner to regain energy (duration from 20:00 to 21:00).', 'Lugar: Finca de Boda', 'Location: Wedding Guesthouse', NULL),
(10, '21:00:00', 'Alojamiento y Descanso', 'Lodging & Rest', 'Dormir en las habitaciones de la finca de boda hasta la mañana del Día 11.', 'Sleep at the wedding guesthouse rooms until Day 11 morning.', 'Lugar: Finca de Boda', 'Location: Wedding Guesthouse', NULL),

-- Día 11
(11, '10:00:00', 'Excursión a Montserrat', 'Montserrat Day Trip', 'Subida en tren cremallera o teleférico para visitar la Abadía de Montserrat y ver a La Moreneta (la Virgen Negra).', 'Ascend by rack railway or cable car to visit the Abbey of Montserrat and see La Moreneta (the Black Madonna).', 'Lugar: Abadía de Montserrat', 'Location: Montserrat Abbey', NULL),
(11, '14:00:00', 'Senderismo Ligero', 'Light Hiking', 'Caminata hasta la Cruz de San Miguel para disfrutar de vistas panorámicas.', 'Walk up to Saint Michael''s Cross to enjoy panoramic views.', 'Lugar: Cruz de San Miguel, Montserrat', 'Location: Saint Michael''s Cross, Montserrat', NULL),

-- Día 12
(12, '10:30:00', 'El Castillo junto al Mar', 'The Castle by the Sea', 'Visita a la Vila Vella de Tossa de Mar y su espectacular recinto amurallado medieval.', 'Visit the Vila Vella of Tossa de Mar and its spectacular medieval walled enclosure.', 'Lugar: Vila Vella, Tossa de Mar', 'Location: Vila Vella, Tossa de Mar', NULL),
(12, '14:00:00', 'Gastronomía Marinera', 'Seafood Gastronomy', 'Comida en un restaurante local justo frente al mar.', 'Lunch at a local restaurant right in front of the sea.', 'Lugar: Tossa de Mar', 'Location: Tossa de Mar', NULL),
(12, '16:30:00', 'Caminos de Ronda', 'Caminos de Ronda', 'Caminata por los senderos costeros cerca de Tossa para disfrutar de calas escondidas.', 'Walk along the coastal paths near Tossa to enjoy hidden coves.', 'Lugar: Caminos de Ronda, Tossa de Mar', 'Location: Caminos of Ronda, Tossa de Mar', NULL),

-- Día 13
(13, '11:00:00', 'Compras y Montañas', 'Shopping & Mountains', 'Llegada a Andorra la Vella. Paseo por el centro comercial y las calles peatonales.', 'Arrival at Andorra la Vella. Walk around the shopping center and pedestrian streets.', 'Lugar: Andorra la Vella', 'Location: Andorra la Vella', NULL),
(13, '15:00:00', 'Relax Termal o Vistas', 'Thermal Relax or Views', 'Pasar la tarde en el balneario de Caldea o visitar el mirador del Roc del Quer para disfrutar de espectaculares vistas del valle.', 'Spend the afternoon at Caldea spa or visit the Roc del Quer viewpoint for spectacular valley views.', 'Lugar: Caldea / Mirador del Roc del Quer', 'Location: Caldea / Roc del Quer Viewpoint', NULL),

-- Día 14
(14, '10:30:00', 'Región del Penedès', 'Penedès Region', 'Visita a cavas tradicionales (como Codorníu o Freixenet) o una bodega (como Familia Torres) para degustación y maridaje.', 'Visit traditional cavas (such as Codorníu or Freixenet) or a winery (such as Familia Torres) for tasting and pairing.', 'Lugar: Penedès', 'Location: Penedès', 'https://www.torres.es/es/experiencias/penedes'),
(14, '16:00:00', 'Tarragona Romana', 'Roman Tarragona', 'Paseo por la tarde por Tarragona para ver el Anfiteatro Romano frente al Mar Mediterráneo.', 'Afternoon walk around Tarragona to see the Roman Amphitheatre facing the Mediterranean Sea.', 'Lugar: Tarragona', 'Location: Tarragona', NULL),

-- Día 15
(15, '10:00:00', 'Montjuïc', 'Montjuïc', 'Paseo en teleférico al Castillo de Montjuïc y visita a los alrededores del Estadio Olímpico.', 'Cable car ride to Montjuïc Castle and visit the Olympic Stadium surroundings.', 'Lugar: Montjuïc', 'Location: Montjuïc', NULL),
(15, '14:00:00', 'El Paseo Marítimo', 'The Seafront', 'Comida en el barrio de La Barceloneta y paseo por el Port Vell (Puerto Viejo).', 'Lunch in the Barceloneta neighborhood and walk around Port Vell (Old Port).', 'Lugar: La Barceloneta & Port Vell', 'Location: La Barceloneta & Port Vell', NULL),

-- Día 16
(16, '10:30:00', 'Modernismo Musical', 'Musical Modernism', 'Visita al Palau de la Música Catalana (una de las gemas arquitectónicas más hermosas, se recomienda visita guiada).', 'Visit the Palau de la Música Catalana (one of the most beautiful architectural gems, guided tour recommended).', 'Lugar: Palau de la Música Catalana', 'Location: Palau de la Música Catalana', 'https://www.palaumusica.cat/es/visitas-guiadas'),
(16, '12:30:00', 'Parque de la Ciutadella y Arc de Triomf', 'Ciutadella Park & Arc de Triomf', 'Relajante paseo por el pulmón verde de la ciudad.', 'Relaxing walk through the city''s green lung.', 'Lugar: Parque de la Ciutadella', 'Location: Ciutadella Park', NULL),
(16, '18:00:00', 'Tarde en Gràcia', 'Afternoon in Gràcia', 'Últimas compras y tapas de despedida por las plazas del pintoresco barrio de Gràcia.', 'Final shopping and farewell tapas around the plazas of the picturesque Gràcia neighborhood.', 'Lugar: Barrio de Gràcia', 'Location: Gràcia District', NULL),

-- Día 17
(17, '08:00:00', 'Traslado', 'Transfer', 'Salida hacia el Aeropuerto de Barcelona-El Prat.', 'Departure to Barcelona-El Prat Airport.', 'Lugar: Aeropuerto de Barcelona-El Prat (BCN)', 'Location: Barcelona-El Prat Airport (BCN)', NULL),
(17, '11:15:00', 'Vuelo de Regreso', 'Return flight', 'Despegue con destino a Washington DC (Llegada estimada a las 14:35 hora local).', 'Takeoff bound for Washington DC (Estimated arrival at 02:35 PM US local time).', 'Lugar: Washington DC', 'Location: Washington DC', NULL);