export const es = {
  // Global / App level
  title: "Bienvenido a Barcelona",
  subtitle: "Itinerario en Barcelona",
  itineraryTab: "Itinerario",
  infoTab: "Info General",
  searchPlaceholder: "Buscar actividades...",
  allDays: "Todos los días",
  noResults: "No se encontraron actividades.",

  // General Info Tab
  infoTitle: "Información General",
  infoDestination: "Destino",
  infoDestinationDesc: "Barcelona y alrededores, España",
  infoDates: "Fechas",
  infoDatesDesc: "Del 7 al 17 de Octubre de 2026",
  infoTips: "Consejos Prácticos",
  infoTipsList: [
    "Lleva calzado muy cómodo para caminar.",
    "Vigila tus pertenencias en zonas turísticas.",
    "Reserva con antelación las entradas (Sagrada Familia, Park Güell)."
  ],
  infoPhones: "Teléfonos Útiles",
  infoPhonesList: {
    "Emergencias": "112",
    "Policía Nacional": "091"
  },

  // Errors
  errorTitle: "Oops! Algo salió mal.",
  errorDesc: "No se pudo cargar el itinerario del viaje desde la base de datos. Por favor, inténtalo más tarde.",

  // Home View
  homeTitle: "Bienvenidos a Barcelona",
  homeSubtitle: "Descubre el itinerario y todos los detalles de nuestra boda en Barcelona.",
  startBtn: "Ver Itinerario",
  galleryTitle: "Lugares Destacados",
  galleryPlaces: {
    sagrada: "Sagrada Familia",
    park: "Park Güell",
    barceloneta: "La Barceloneta",
    gotico: "Barrio Gótico"
  },
  homeDestLabel: "Destino",
  homeDestVal: "Barcelona",
  homeDatesLabel: "Fechas",
  homeDatesVal: "7 - 17 Oct 2026",
  homeEventLabel: "Evento Principal",
  homeEventVal: "Boda (10 de Octubre)",
  homePackingLabel: "Equipaje",
  homePackingVal: "Otoño / Cómodo",
  homeFlightLabel: "Vuelo Salida",
  homeFlightVal: "IAD -> BCN",

  // DayItinerary Component
  clickToFocusDay: "Haz clic para enfocar este día",
  addCustomPlan: "Añadir plan personalizado",
  emptyDayTimeline: "No hay actividades planificadas para este día.",

  // Alojamiento
  addAlojamiento: "Añadir alojamiento",
  editAlojamiento: "Gestionar alojamiento",
  alojamientoModalTitle: "Alojamiento del Día",
  alojamientoSelectTab: "Seleccionar existente",
  alojamientoCreateTab: "Crear nuevo",
  alojamientoNoneOption: "— Sin alojamiento —",
  alojamientoSelectLabel: "Alojamiento:",
  alojamientoLinkBtn: "Vincular",
  alojamientoNameLabel: "Nombre del alojamiento:",
  alojamientoNamePlaceholder: "ej. Hotel Arts Barcelona",
  alojamientoUrlLabel: "Web / Reserva (opcional):",
  alojamientoUrlPlaceholder: "https://...",
  alojamientoAddressLabel: "Dirección (opcional):",
  alojamientoAddressPlaceholder: "ej. Carrer de la Marina, 19-21",
  alojamientoCreateBtn: "Crear y Vincular",
  alojamientoSavingBtn: "Guardando...",
  errorAlojamientoName: "El nombre del alojamiento es obligatorio.",
  errorAlojamientoSave: "Error guardando el alojamiento.",
  editDayDescTooltip: "Editar descripción del día",
  editDayDescTitle: "Editar Descripción del Día",
  editDayDescLabel: "Descripción del día (ES):",
  editDayDescPlaceholder: "ej. Llegada y exploración del centro",
  editDayDescSavingBtn: "Traduciendo y guardando...",
  errorSupabaseDayUpdate: "Error al actualizar la descripción del día.",

  modalTimeLabel: "Hora (ej. 10:00:00):",
  modalActivityNameLabel: "Nombre de la Actividad:",
  modalActivityNamePlaceholder: "ej. Almuerzo en la playa...",
  modalDescriptionLabel: "Descripción:",
  modalDescriptionPlaceholder: "Detalles de la actividad...",
  modalLocationLabel: "Lugar:",
  modalLocationPlaceholder: "ej. Barceloneta...",
  modalBookingLinkLabel: "Enlace de Reserva (opcional):",
  modalNotesInitialTitle: "Notas Iniciales 📝",
  modalNotesTitle: "Notas 📝",
  modalNotesPlaceholder: "Escribe aquí tus anotaciones...",
  createPlanBtn: "Crear Plan ➕",
  errorEmptyName: "Por favor ingresa un nombre para la actividad",
  errorTimeOccupied: "Esa hora ya está ocupada por otra actividad en este día.",
  savingBtn: "Guardando...",
  errorSupabaseCreate: "Error creando la actividad en Supabase.",

  // ActivityCard Component
  clickToViewAddNotes: "Haz clic para ver detalles y añadir notas",
  clickToBookTickets: "Haz clic para reservar",
  viewOnMaps: "Ver ubicación en Google Maps",
  noLocation: "Sin ubicación",
  bookTicketsBtn: "Reservar Entradas 🎟️",
  hasNotesTooltip: "Tiene notas",
  editActivityTooltip: "Editar detalles de la actividad",
  deleteActivityTooltip: "Eliminar actividad",
  saveChangesBtn: "Guardar Cambios",
  cancelBtn: "Cancelar",
  savedSuccessMsg: "¡Nota guardada! ✅",
  errorSupabaseUpdate: "Error actualizando actividad en Supabase.",
  errorSupabaseNote: "Error guardando la nota en Supabase.",
  errorSupabaseDelete: "Error borrando la actividad en Supabase.",
  deletingBtn: "Borrando...",
  saveBtn: "Guardar",

  // Warning/Confirm Modals
  unsavedChangesTitle: "Cambios no guardados",
  unsavedChangesDesc: "¿Estás seguro de que deseas salir? Los datos introducidos no se guardarán.",
  keepEditingBtn: "Seguir editando",
  discardLeaveBtn: "Salir sin guardar",
  confirmDeletionTitle: "Confirmar eliminación",
  confirmDeletionDesc: "¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.",
  deleteBtn: "Eliminar",

  // User Guide
  userGuideTitle: "Guía de Usuario",
  userGuideContent: `
    <div style="text-align: left; font-size: 0.95rem; line-height: 1.5;">
      <h3 style="color: var(--primary-color); margin-bottom: 8px; font-size: 1.1rem;">1. Navegación Principal</h3>
      <ul style="margin-bottom: 16px; padding-left: 20px;">
        <li><strong>Cambiar de Idioma</strong>: Usa el botón ES/EN de la esquina.</li>
        <li><strong>Filtrar por Día</strong>: En la línea de tiempo (Timeline), pulsa un día para ver solo sus actividades.</li>
        <li><strong>Todos los Días</strong>: Pulsa el botón "ALL DAYS" del Timeline para ver el viaje completo.</li>
      </ul>
      <h3 style="color: var(--primary-color); margin-bottom: 8px; font-size: 1.1rem;">2. Gestionar Actividades</h3>
      <ul style="margin-bottom: 16px; padding-left: 20px;">
        <li><strong>Añadir</strong>: Pulsa el botón rojo <strong>(+)</strong> junto al título del día.</li>
        <li><strong>Editar</strong>: Pasa el ratón sobre una actividad y pulsa el lápiz (✏️). Al guardar, se traduce automáticamente al otro idioma.</li>
        <li><strong>Eliminar</strong>: En el modo editar, pulsa la papelera (🗑️) arriba.</li>
      </ul>
      <h3 style="color: var(--primary-color); margin-bottom: 8px; font-size: 1.1rem;">3. Detalles y Enlaces</h3>
      <ul style="margin-bottom: 0; padding-left: 20px;">
        <li><strong>Añadir Notas</strong>: Pulsa la tarjeta (fuera del lápiz) para abrir detalles y escribir notas.</li>
        <li><strong>Ver en Mapa</strong>: Haz click en la ubicación (📍) para buscarla en Google Maps o abrir el link.</li>
        <li><strong>Reservar Tickets</strong>: Si hay enlace de reserva, verás el botón rojo "Reservar Entradas".</li>
      </ul>
    </div>
  `
};
