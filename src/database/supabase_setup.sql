-- 1. Limpiamos cualquier intento fallido (el orden de borrado es inverso al de creación)
DROP TABLE IF EXISTS "actividadDia";
DROP TABLE IF EXISTS "diaViaje";

-- 2. Creamos la tabla padre PRIMERO
CREATE TABLE "diaViaje" (
    id_dia SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    descripcion VARCHAR(255)
);

-- 3. Creamos la tabla hija DESPUÉS
CREATE TABLE "actividadDia" (
    id_actividad SERIAL PRIMARY KEY,
    id_dia INT NOT NULL,
    hora TIME NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    url VARCHAR(255),
    "reservaLink" VARCHAR(255),
    notas TEXT,
    -- Con las comillas dobles nos aseguramos de que busque exactamente "diaViaje"
    FOREIGN KEY (id_dia) REFERENCES "diaViaje"(id_dia) ON DELETE CASCADE
);


-- 1. Insertamos los días del viaje
INSERT INTO "diaViaje" (id_dia, fecha, descripcion) VALUES
(7, '2026-10-07', 'Departure Flight'),
(8, '2026-10-08', 'Arrival & the Historic Heart'),
(9, '2026-10-09', 'The Gaudí Route'),
(10, '2026-10-10', 'Wedding Day'),
(11, '2026-10-11', 'The Magic Mountain'),
(12, '2026-10-12', 'The Magic of Costa Brava'),
(13, '2026-10-13', 'Pyrenees Getaway (Andorra)'),
(14, '2026-10-14', 'Wine & Tradition (Southern Catalonia)'),
(15, '2026-10-15', 'Culture & Sea Breeze (Back to Barcelona)'),
(16, '2026-10-16', 'Hidden Gems & Farewell'),
(17, '2026-10-17', 'Heading Home');

-- 2. Actualizamos la secuencia (Importante en PostgreSQL tras forzar IDs a mano)
SELECT setval(pg_get_serial_sequence('"diaViaje"', 'id_dia'), (SELECT MAX(id_dia) FROM "diaViaje"));

-- 3. Insertamos todas las actividades vinculadas a sus respectivos días
INSERT INTO "actividadDia" (id_dia, hora, titulo, descripcion, notas, "reservaLink") VALUES
-- Día 7
(7, '18:35:00', 'Flight Departure to Barcelona', 'Flight departure from Washington DC (IAD/DCA) at 6:35 PM heading to Barcelona-El Prat Airport (BCN).', 'Lugar: Washington DC', NULL),

-- Día 8
(8, '08:20:00', 'Arrival', 'Landing at Barcelona-El Prat Airport (Flight from Washington DC). Baggage claim and transfer to accommodation.', 'Lugar: Barcelona-El Prat Airport (BCN)', NULL),
(8, '12:00:00', 'Welcome Walk', 'Walk along Las Ramblas and the Boquería Market for a quick lunch.', 'Lugar: Las Ramblas & Boquería Market', NULL),
(8, '16:00:00', 'Gothic Exploration', 'Visit to the Gothic Quarter, including Barcelona Cathedral and Plaza del Rey.', 'Lugar: Gothic Quarter', NULL),

-- Día 9
(9, '09:30:00', 'Masterpiece', 'Interior visit to the Sagrada Familia (Advance booking required).', 'Lugar: Sagrada Familia', 'https://tickets.sagradafamilia.org/'),
(9, '13:30:00', 'Paseo de Gràcia', 'Walk to see the facades of Casa Batlló and La Pedrera (Casa Milà), with the option to enter one of them.', 'Lugar: Paseo de Gràcia', 'https://www.casabatllo.es/venta-entradas/'),
(9, '17:00:00', 'Sunset at the Park', 'Visit to Park Güell (Advance booking required for the monumental zone).', 'Lugar: Park Güell', 'https://parkguell.barcelona/es/compra-de-entradas'),

-- Día 10
(10, '11:00:00', 'Arrival at the Venue', 'Guests arrival at the venue and room check-in.', 'Lugar: Wedding Guesthouse', NULL),
(10, '12:00:00', 'Ceremony', 'Wedding service and official celebration.', 'Lugar: Wedding Guesthouse', NULL),
(10, '13:00:00', 'Appetizer', 'Finger food and welcome cocktail with the guests.', 'Lugar: Guesthouse Gardens', NULL),
(10, '14:00:00', 'Lunch / Banquet', 'Main wedding banquet.', 'Lugar: Guesthouse Hall', NULL),
(10, '16:00:00', 'Wedding Party', 'Dancing, music, and festive celebrations until evening (20:00).', 'Lugar: Dance Floor', NULL),
(10, '20:00:00', 'Dinner', 'Dinner to regain energy (duration from 20:00 to 21:00).', 'Lugar: Wedding Guesthouse', NULL),
(10, '21:00:00', 'Lodging & Rest', 'Sleep at the wedding guesthouse rooms until Day 11 morning.', 'Lugar: Wedding Guesthouse', NULL),

-- Día 11
(11, '10:00:00', 'Montserrat Day Trip', 'Ascend by rack railway or cable car to visit the Abbey of Montserrat and see La Moreneta (the Black Madonna).', 'Lugar: Montserrat Abbey', NULL),
(11, '14:00:00', 'Light Hiking', 'Walk up to Saint Michael''s Cross to enjoy panoramic views.', 'Lugar: Saint Michael''s Cross, Montserrat', NULL),

-- Día 12
(12, '10:30:00', 'The Castle by the Sea', 'Visit the Vila Vella of Tossa de Mar and its spectacular medieval walled enclosure.', 'Lugar: Vila Vella, Tossa de Mar', NULL),
(12, '14:00:00', 'Seafood Gastronomy', 'Lunch at a local restaurant right in front of the sea.', 'Lugar: Tossa de Mar', NULL),
(12, '16:30:00', 'Caminos de Ronda', 'Walk along the coastal paths near Tossa to enjoy hidden coves.', 'Lugar: Caminos of Ronda, Tossa de Mar', NULL),

-- Día 13
(13, '11:00:00', 'Shopping & Mountains', 'Arrival at Andorra la Vella. Walk around the shopping center and pedestrian streets.', 'Lugar: Andorra la Vella', NULL),
(13, '15:00:00', 'Thermal Relax or Views', 'Spend the afternoon at Caldea spa or visit the Roc del Quer viewpoint for spectacular valley views.', 'Lugar: Caldea / Roc del Quer Viewpoint', NULL),

-- Día 14
(14, '10:30:00', 'Penedès Region', 'Visit traditional cavas (such as Codorníu or Freixenet) or a winery (such as Familia Torres) for tasting and pairing.', 'Lugar: Penedès', 'https://www.torres.es/es/experiencias/penedes'),
(14, '16:00:00', 'Roman Tarragona', 'Afternoon walk around Tarragona to see the Roman Amphitheatre facing the Mediterranean Sea.', 'Lugar: Tarragona', NULL),

-- Día 15
(15, '10:00:00', 'Montjuïc', 'Cable car ride to Montjuïc Castle and visit the Olympic Stadium surroundings.', 'Lugar: Montjuïc', NULL),
(15, '14:00:00', 'The Seafront', 'Lunch in the Barceloneta neighborhood and walk around Port Vell (Old Port).', 'Lugar: La Barceloneta & Port Vell', NULL),

-- Día 16
(16, '10:30:00', 'Musical Modernism', 'Visit the Palau de la Música Catalana (one of the most beautiful architectural gems, guided tour recommended).', 'Lugar: Palau de la Música Catalana', 'https://www.palaumusica.cat/es/visitas-guiadas'),
(16, '12:30:00', 'Ciutadella Park & Arc de Triomf', 'Relaxing walk through the city''s green lung.', 'Lugar: Ciutadella Park', NULL),
(16, '18:00:00', 'Afternoon in Gràcia', 'Final shopping and farewell tapas around the plazas of the picturesque Gràcia neighborhood.', 'Lugar: Gràcia District', NULL),

-- Día 17
(17, '08:00:00', 'Transfer', 'Departure to Barcelona-El Prat Airport.', 'Lugar: Barcelona-El Prat Airport (BCN)', NULL),
(17, '11:15:00', 'Return flight', 'Takeoff bound for Washington DC (Estimated arrival at 02:35 PM US local time).', 'Lugar: Washington DC', NULL);