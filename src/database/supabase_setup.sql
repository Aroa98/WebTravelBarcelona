-- ============================================
-- Barcelona Travel Planner — Supabase Schema
-- ============================================
-- Run this SQL in the Supabase SQL Editor to create
-- the tables and insert the initial seed data.

-- 1. Create Tables
-- ============================================

-- UI texts per language (stores all interface labels)
CREATE TABLE ui_texts (
  lang TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Days of the itinerary
CREATE TABLE days (
  id INTEGER NOT NULL,
  lang TEXT NOT NULL,
  fecha TEXT NOT NULL,
  titulo_principal TEXT NOT NULL,
  actividades JSONB NOT NULL DEFAULT '[]',
  PRIMARY KEY (id, lang)
);

-- 2. Row Level Security
-- ============================================
ALTER TABLE ui_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read ui_texts" ON ui_texts FOR SELECT USING (true);
CREATE POLICY "Public read days" ON days FOR SELECT USING (true);

-- Allow public write access (for the anon key)
-- In production, you'd restrict this further
CREATE POLICY "Public insert days" ON days FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update days" ON days FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete days" ON days FOR DELETE USING (true);

-- 3. Seed Data — Spanish (ES)
-- ============================================

INSERT INTO ui_texts (lang, data) VALUES ('es', '{
  "title": "Barcelona y alrededores",
  "subtitle": "Del 7 al 17 de Octubre",
  "itineraryTab": "Itinerario",
  "infoTab": "Información General",
  "searchPlaceholder": "Buscar actividades o lugares...",
  "allDays": "Ver Todo",
  "noResults": "No se encontraron actividades con los filtros actuales.",
  "infoTitle": "Información del Viaje",
  "infoDestination": "Destino",
  "infoDestinationDesc": "Barcelona y sus alrededores, Cataluña, España.",
  "infoDates": "Fechas",
  "infoDatesDesc": "Del 7 al 17 de Octubre",
  "infoTips": "Consejos Útiles",
  "infoTipsList": [
    "<strong>Transporte:</strong> Utiliza la tarjeta T-Usual o T-Casual para moverte por la red de metro y bus de forma económica.",
    "<strong>Seguridad:</strong> Cuida tus pertenencias en zonas concurridas (Las Ramblas, metro, etc.).",
    "<strong>Reservas:</strong> Recuerda reservar con antelación para la Sagrada Familia y el Park Güell."
  ],
  "infoPhones": "Teléfonos de Interés",
  "infoPhonesList": { "Emergencias": "112", "Policía Local": "092" },
  "errorTitle": "Oops! Algo salió mal.",
  "errorDesc": "No se pudo cargar el itinerario del viaje. Por favor, inténtalo más tarde.",
  "homeTitle": "Barcelona Travel Planner",
  "homeSubtitle": "Tu Próxima Aventura",
  "startBtn": "Iniciar viaje",
  "galleryTitle": "Mis Recuerdos",
  "galleryPlaces": { "sagrada": "Sagrada Familia", "park": "Park Güell", "barceloneta": "La Barceloneta", "gotico": "Barrio Gótico" },
  "homeDestLabel": "Destino",
  "homeDestVal": "Barcelona, España",
  "homeDatesLabel": "Fechas",
  "homeDatesVal": "7 - 17 de Octubre (11 Días)",
  "homeEventLabel": "Evento Especial",
  "homeEventVal": "Boda en el Hostal (Día 10) 🥂",
  "homePackingLabel": "Equipaje",
  "homePackingVal": "Completado 🎒",
  "homeFlightLabel": "Vuelo / Tren",
  "homeFlightVal": "Confirmado ✈️"
}'::jsonb);

INSERT INTO days (id, lang, fecha, titulo_principal, actividades) VALUES
(7, 'es', 'Día 7', 'Vuelo de Salida', '[{"hora":"18:35","titulo":"Salida del Vuelo a Barcelona","descripcion":"Salida del vuelo desde Washington DC (IAD/DCA) a las 6:35 pm con destino al Aeropuerto de Barcelona-El Prat (BCN).","lugar":"Washington DC"}]'::jsonb),
(8, 'es', 'Día 8', 'Llegada y el Corazón Histórico', '[{"hora":"08:20","titulo":"Llegada","descripcion":"Aterrizaje en el Aeropuerto de Barcelona-El Prat (Vuelo desde Washington DC). Recogida de maletas y traslado al alojamiento.","lugar":"Aeropuerto de Barcelona-El Prat (BCN)"},{"hora":"12:00","titulo":"Paseo de bienvenida","descripcion":"Caminata por Las Ramblas y el Mercado de la Boquería para un almuerzo rápido.","lugar":"Las Ramblas y el Mercado de la Boquería"},{"hora":"16:00","titulo":"Exploración Gótica","descripcion":"Visita al Barrio Gótico, incluyendo la Catedral de Barcelona y la Plaza del Rey.","lugar":"Barrio Gótico"}]'::jsonb),
(9, 'es', 'Día 9', 'La Ruta de Gaudí', '[{"hora":"09:30","titulo":"Obra Maestra","descripcion":"Visita interior a la Sagrada Familia (Imprescindible reserva previa).","lugar":"Sagrada Familia","enlace_reserva":"https://tickets.sagradafamilia.org/"},{"hora":"13:30","titulo":"Paseo de Gràcia","descripcion":"Caminata para ver las fachadas de Casa Batlló y La Pedrera (Casa Milà), con opción a entrar a una de ellas.","lugar":"Paseo de Gràcia","enlace_reserva":"https://www.casabatllo.es/venta-entradas/"},{"hora":"17:00","titulo":"Atardecer en el Parque","descripcion":"Visita al Park Güell (Se requiere reserva previa para la zona monumental).","lugar":"Park Güell","enlace_reserva":"https://parkguell.barcelona/es/compra-de-entradas"}]'::jsonb),
(10, 'es', 'Día 10', 'Boda', '[{"hora":"11:00","titulo":"Llegada al lugar","descripcion":"Llegada de los invitados al lugar del evento y acomodación.","lugar":"Hostal de la Boda"},{"hora":"12:00","titulo":"Ceremonia","descripcion":"Enlace matrimonial y celebración oficial.","lugar":"Hostal de la Boda"},{"hora":"13:00","titulo":"Aperitivo","descripcion":"Pica-pica y cóctel de bienvenida con los invitados.","lugar":"Jardines del Hostal"},{"hora":"14:00","titulo":"Comida / Banquete","descripcion":"Banquete principal de la boda.","lugar":"Salón del Hostal"},{"hora":"16:00","titulo":"Fiesta de la Boda","descripcion":"Baile, música y celebración festiva hasta la noche (20:00).","lugar":"Zona de Baile"},{"hora":"20:00","titulo":"Cena","descripcion":"Cena para recuperar fuerzas (duración de 20:00 a 21:00).","lugar":"Hostal de la Boda"},{"hora":"21:00","titulo":"Alojamiento y Descanso","descripcion":"Dormir en el hostal de la boda hasta la mañana del día 11.","lugar":"Hostal de la Boda"}]'::jsonb),
(11, 'es', 'Día 11', 'La Montaña Mágica', '[{"hora":"10:00","titulo":"Excursión a Montserrat","descripcion":"Subida en tren cremallera o teleférico para visitar la Abadía de Montserrat y ver a La Moreneta.","lugar":"Abadía de Montserrat"},{"hora":"14:00","titulo":"Senderismo ligero","descripcion":"Ruta a pie hacia la Cruz de San Miguel para disfrutar de las vistas panorámicas.","lugar":"Cruz de San Miguel, Montserrat"}]'::jsonb),
(12, 'es', 'Día 12', 'La Magia de la Costa Brava', '[{"hora":"10:30","titulo":"El Castillo junto al mar","descripcion":"Visita a la Vila Vella de Tossa de Mar y su espectacular recinto amurallado medieval.","lugar":"Vila Vella de Tossa de Mar"},{"hora":"14:00","titulo":"Gastronomía marinera","descripcion":"Comida en un restaurante local frente al mar.","lugar":"Tossa de Mar"},{"hora":"16:30","titulo":"Caminos de Ronda","descripcion":"Paseo por los senderos costeros cercanos a Tossa para disfrutar de las calas escondidas.","lugar":"Caminos de Ronda, Tossa de Mar"}]'::jsonb),
(13, 'es', 'Día 13', 'Escapada a los Pirineos (Andorra)', '[{"hora":"11:00","titulo":"Compras y montaña","descripcion":"Llegada a Andorra la Vella. Paseo por el centro comercial y calles peatonales.","lugar":"Andorra la Vella"},{"hora":"15:00","titulo":"Relax termal o Vistas","descripcion":"Tarde en el balneario de Caldea o visita al Mirador Roc del Quer para vistas espectaculares del valle.","lugar":"Caldea / Mirador Roc del Quer"}]'::jsonb),
(14, 'es', 'Día 14', 'Vinos y Tradición (Sur de Cataluña)', '[{"hora":"10:30","titulo":"Región del Penedès","descripcion":"Visita a unas cavas tradicionales (como Codorníu o Freixenet) o una bodega de vinos (como Familia Torres) para cata y maridaje.","lugar":"Penedès","enlace_reserva":"https://www.torres.es/es/experiencias/penedes"},{"hora":"16:00","titulo":"Tarragona Romana","descripcion":"Paseo de tarde por la ciudad de Tarragona para ver el Anfiteatro Romano frente al mar Mediterráneo.","lugar":"Tarragona"}]'::jsonb),
(15, 'es', 'Día 15', 'Cultura y Brisa Marina (Vuelta a Barcelona)', '[{"hora":"10:00","titulo":"Montjuïc","descripcion":"Subida en teleférico al Castillo de Montjuïc y visita a los alrededores del Estadio Olímpico.","lugar":"Montjuïc"},{"hora":"14:00","titulo":"El frente marítimo","descripcion":"Comida en el barrio de la Barceloneta y paseo por el Port Vell (Puerto Viejo).","lugar":"La Barceloneta y Port Vell"}]'::jsonb),
(16, 'es', 'Día 16', 'Joyas Escondidas y Despedida', '[{"hora":"10:30","titulo":"Modernismo musical","descripcion":"Visita al Palau de la Música Catalana (Una de las joyas arquitectónicas más bonitas, recomendable visita guiada).","lugar":"Palau de la Música Catalana","enlace_reserva":"https://www.palaumusica.cat/es/visitas-guiadas"},{"hora":"12:30","titulo":"Parque de la Ciutadella y Arc de Triomf","descripcion":"Paseo relajado por el pulmón verde de la ciudad.","lugar":"Parque de la Ciutadella"},{"hora":"18:00","titulo":"Tarde en Gràcia","descripcion":"Últimas compras y tapeo de despedida por las plazas del pintoresco barrio de Gràcia.","lugar":"Barrio de Gràcia"}]'::jsonb),
(17, 'es', 'Día 17', 'Regreso a Casa', '[{"hora":"08:00","titulo":"Desplazamiento","descripcion":"Salida hacia el Aeropuerto de Barcelona-El Prat.","lugar":"Aeropuerto de Barcelona-El Prat (BCN)"},{"hora":"11:15","titulo":"Vuelo de vuelta","descripcion":"Despegue con destino Washington DC (Llegada estimada a las 02:35 PM hora local de EEUU).","lugar":"Washington DC"}]'::jsonb);

-- 4. Seed Data — English (EN)
-- ============================================

INSERT INTO ui_texts (lang, data) VALUES ('en', '{
  "title": "Barcelona & Surroundings",
  "subtitle": "From October 7th to 17th",
  "itineraryTab": "Itinerary",
  "infoTab": "General Info",
  "searchPlaceholder": "Search activities or locations...",
  "allDays": "View All",
  "noResults": "No activities found with the current filters.",
  "infoTitle": "Trip Information",
  "infoDestination": "Destination",
  "infoDestinationDesc": "Barcelona and its surroundings, Catalonia, Spain.",
  "infoDates": "Dates",
  "infoDatesDesc": "From October 7th to 17th",
  "infoTips": "Useful Tips",
  "infoTipsList": [
    "<strong>Transportation:</strong> Use a T-Usual or T-Casual card to travel economically via metro and bus network.",
    "<strong>Safety:</strong> Take care of your belongings in crowded areas (Las Ramblas, metro, etc.).",
    "<strong>Reservations:</strong> Remember to book tickets in advance for Sagrada Familia and Park Güell."
  ],
  "infoPhones": "Emergency Numbers",
  "infoPhonesList": { "Emergencies": "112", "Local Police": "092" },
  "errorTitle": "Oops! Something went wrong.",
  "errorDesc": "Could not load the trip itinerary. Please try again later.",
  "homeTitle": "Barcelona Travel Planner",
  "homeSubtitle": "Your Next Adventure",
  "startBtn": "Start Trip",
  "galleryTitle": "My Memories",
  "galleryPlaces": { "sagrada": "Sagrada Familia", "park": "Park Güell", "barceloneta": "La Barceloneta", "gotico": "Gothic Quarter" },
  "homeDestLabel": "Destination",
  "homeDestVal": "Barcelona, Spain",
  "homeDatesLabel": "Dates",
  "homeDatesVal": "October 7 - 17 (11 Days)",
  "homeEventLabel": "Special Event",
  "homeEventVal": "Wedding at Guesthouse (Day 10) 🥂",
  "homePackingLabel": "Packing",
  "homePackingVal": "Completed 🎒",
  "homeFlightLabel": "Flight / Train",
  "homeFlightVal": "Confirmed ✈️"
}'::jsonb);

INSERT INTO days (id, lang, fecha, titulo_principal, actividades) VALUES
(7, 'en', 'Day 7', 'Departure Flight', '[{"hora":"18:35","titulo":"Flight Departure to Barcelona","descripcion":"Flight departure from Washington DC (IAD/DCA) at 6:35 PM heading to Barcelona-El Prat Airport (BCN).","lugar":"Washington DC"}]'::jsonb),
(8, 'en', 'Day 8', 'Arrival & the Historic Heart', '[{"hora":"08:20","titulo":"Arrival","descripcion":"Landing at Barcelona-El Prat Airport (Flight from Washington DC). Baggage claim and transfer to accommodation.","lugar":"Barcelona-El Prat Airport (BCN)"},{"hora":"12:00","titulo":"Welcome Walk","descripcion":"Walk along Las Ramblas and the Boquería Market for a quick lunch.","lugar":"Las Ramblas & Boquería Market"},{"hora":"16:00","titulo":"Gothic Exploration","descripcion":"Visit to the Gothic Quarter, including Barcelona Cathedral and Plaza del Rey.","lugar":"Gothic Quarter"}]'::jsonb),
(9, 'en', 'Day 9', 'The Gaudí Route', '[{"hora":"09:30","titulo":"Masterpiece","descripcion":"Interior visit to the Sagrada Familia (Advance booking required).","lugar":"Sagrada Familia","enlace_reserva":"https://tickets.sagradafamilia.org/"},{"hora":"13:30","titulo":"Paseo de Gràcia","descripcion":"Walk to see the facades of Casa Batlló and La Pedrera (Casa Milà), with the option to enter one of them.","lugar":"Paseo de Gràcia","enlace_reserva":"https://www.casabatllo.es/venta-entradas/"},{"hora":"17:00","titulo":"Sunset at the Park","descripcion":"Visit to Park Güell (Advance booking required for the monumental zone).","lugar":"Park Güell","enlace_reserva":"https://parkguell.barcelona/es/compra-de-entradas"}]'::jsonb),
(10, 'en', 'Day 10', 'Wedding Day', '[{"hora":"11:00","titulo":"Arrival at the Venue","descripcion":"Guests arrival at the venue and room check-in.","lugar":"Wedding Guesthouse"},{"hora":"12:00","titulo":"Ceremony","descripcion":"Wedding service and official celebration.","lugar":"Wedding Guesthouse"},{"hora":"13:00","titulo":"Appetizer","descripcion":"Finger food and welcome cocktail with the guests.","lugar":"Guesthouse Gardens"},{"hora":"14:00","titulo":"Lunch / Banquet","descripcion":"Main wedding banquet.","lugar":"Guesthouse Hall"},{"hora":"16:00","titulo":"Wedding Party","descripcion":"Dancing, music, and festive celebrations until evening (20:00).","lugar":"Dance Floor"},{"hora":"20:00","titulo":"Dinner","descripcion":"Dinner to regain energy (duration from 20:00 to 21:00).","lugar":"Wedding Guesthouse"},{"hora":"21:00","titulo":"Lodging & Rest","descripcion":"Sleep at the wedding guesthouse rooms until Day 11 morning.","lugar":"Wedding Guesthouse"}]'::jsonb),
(11, 'en', 'Day 11', 'The Magic Mountain', '[{"hora":"10:00","titulo":"Montserrat Day Trip","descripcion":"Ascend by rack railway or cable car to visit the Abbey of Montserrat and see La Moreneta (the Black Madonna).","lugar":"Montserrat Abbey"},{"hora":"14:00","titulo":"Light Hiking","descripcion":"Walk up to Saint Michael''s Cross to enjoy panoramic views.","lugar":"Saint Michael''s Cross, Montserrat"}]'::jsonb),
(12, 'en', 'Day 12', 'The Magic of Costa Brava', '[{"hora":"10:30","titulo":"The Castle by the Sea","descripcion":"Visit the Vila Vella of Tossa de Mar and its spectacular medieval walled enclosure.","lugar":"Vila Vella, Tossa de Mar"},{"hora":"14:00","titulo":"Seafood Gastronomy","descripcion":"Lunch at a local restaurant right in front of the sea.","lugar":"Tossa de Mar"},{"hora":"16:30","titulo":"Caminos de Ronda","descripcion":"Walk along the coastal paths near Tossa to enjoy hidden coves.","lugar":"Caminos of Ronda, Tossa de Mar"}]'::jsonb),
(13, 'en', 'Day 13', 'Pyrenees Getaway (Andorra)', '[{"hora":"11:00","titulo":"Shopping & Mountains","descripcion":"Arrival at Andorra la Vella. Walk around the shopping center and pedestrian streets.","lugar":"Andorra la Vella"},{"hora":"15:00","titulo":"Thermal Relax or Views","descripcion":"Spend the afternoon at Caldea spa or visit the Roc del Quer viewpoint for spectacular valley views.","lugar":"Caldea / Roc del Quer Viewpoint"}]'::jsonb),
(14, 'en', 'Day 14', 'Wine & Tradition (Southern Catalonia)', '[{"hora":"10:30","titulo":"Penedès Region","descripcion":"Visit traditional cavas (such as Codorníu or Freixenet) or a winery (such as Familia Torres) for tasting and pairing.","lugar":"Penedès","enlace_reserva":"https://www.torres.es/es/experiencias/penedes"},{"hora":"16:00","titulo":"Roman Tarragona","descripcion":"Afternoon walk around Tarragona to see the Roman Amphitheatre facing the Mediterranean Sea.","lugar":"Tarragona"}]'::jsonb),
(15, 'en', 'Day 15', 'Culture & Sea Breeze (Back to Barcelona)', '[{"hora":"10:00","titulo":"Montjuïc","descripcion":"Cable car ride to Montjuïc Castle and visit the Olympic Stadium surroundings.","lugar":"Montjuïc"},{"hora":"14:00","titulo":"The Seafront","descripcion":"Lunch in the Barceloneta neighborhood and walk around Port Vell (Old Port).","lugar":"La Barceloneta & Port Vell"}]'::jsonb),
(16, 'en', 'Day 16', 'Hidden Gems & Farewell', '[{"hora":"10:30","titulo":"Musical Modernism","descripcion":"Visit the Palau de la Música Catalana (one of the most beautiful architectural gems, guided tour recommended).","lugar":"Palau de la Música Catalana","enlace_reserva":"https://www.palaumusica.cat/es/visitas-guiadas"},{"hora":"12:30","titulo":"Ciutadella Park & Arc de Triomf","descripcion":"Relaxing walk through the city''s green lung.","lugar":"Ciutadella Park"},{"hora":"18:00","titulo":"Afternoon in Gràcia","descripcion":"Final shopping and farewell tapas around the plazas of the picturesque Gràcia neighborhood.","lugar":"Gràcia District"}]'::jsonb),
(17, 'en', 'Day 17', 'Heading Home', '[{"hora":"08:00","titulo":"Transfer","descripcion":"Departure to Barcelona-El Prat Airport.","lugar":"Barcelona-El Prat Airport (BCN)"},{"hora":"11:15","titulo":"Return flight","descripcion":"Takeoff bound for Washington DC (Estimated arrival at 02:35 PM US local time).","lugar":"Washington DC"}]'::jsonb);
