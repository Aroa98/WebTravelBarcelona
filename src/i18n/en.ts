export const en = {
  // Global / App level
  title: "Aroa & Chanchai's Wedding",
  subtitle: "Barcelona Itinerary",
  itineraryTab: "Itinerary",
  infoTab: "General Info",
  searchPlaceholder: "Search activities...",
  allDays: "All Days",
  noResults: "No activities found.",

  // General Info Tab
  infoTitle: "General Information",
  infoDestination: "Destination",
  infoDestinationDesc: "Barcelona and surroundings, Spain",
  infoDates: "Dates",
  infoDatesDesc: "October 7th to 17th, 2026",
  infoTips: "Practical Tips",
  infoTipsList: [
    "Wear very comfortable shoes for walking.",
    "Watch your belongings in tourist areas.",
    "Book tickets in advance (Sagrada Familia, Park Güell)."
  ],
  infoPhones: "Useful Numbers",
  infoPhonesList: {
    "Emergencies": "112",
    "National Police": "091"
  },

  // Errors
  errorTitle: "Oops! Something went wrong.",
  errorDesc: "Could not load the trip itinerary from the database. Please try again later.",

  // Home View
  homeTitle: "Welcome to Barcelona",
  homeSubtitle: "Discover the itinerary and all the details for our wedding in Barcelona.",
  startBtn: "View Itinerary",
  galleryTitle: "Highlighted Places",
  galleryPlaces: {
    sagrada: "Sagrada Familia",
    park: "Park Güell",
    barceloneta: "La Barceloneta",
    gotico: "Gothic Quarter"
  },
  homeDestLabel: "Destination",
  homeDestVal: "Barcelona",
  homeDatesLabel: "Dates",
  homeDatesVal: "Oct 7 - 17, 2026",
  homeEventLabel: "Main Event",
  homeEventVal: "Wedding (October 10th)",
  homePackingLabel: "Packing",
  homePackingVal: "Autumn / Casual",
  homeFlightLabel: "Departure Flight",
  homeFlightVal: "IAD -> BCN",

  // DayItinerary Component
  clickToFocusDay: "Click to focus on this day",
  addCustomPlan: "Add custom plan",
  emptyDayTimeline: "No activities planned for this day.",

  modalTimeLabel: "Time (e.g. 10:00:00):",
  modalActivityNameLabel: "Activity Name:",
  modalActivityNamePlaceholder: "e.g. Lunch at beach...",
  modalDescriptionLabel: "Description:",
  modalDescriptionPlaceholder: "Details of the activity...",
  modalLocationLabel: "Location:",
  modalLocationPlaceholder: "e.g. Barceloneta...",
  modalBookingLinkLabel: "Booking Link (optional):",
  modalNotesInitialTitle: "Initial Notes 📝",
  modalNotesTitle: "Notes 📝",
  modalNotesPlaceholder: "Write here your notes...",
  createPlanBtn: "Create Plan ➕",
  errorEmptyName: "Please enter a name for the activity",
  errorTimeOccupied: "That time is already occupied by another activity on this day.",
  savingBtn: "Saving...",
  errorSupabaseCreate: "Error creating activity in Supabase.",

  // ActivityCard Component
  clickToViewAddNotes: "Click to view details and add notes",
  clickToBookTickets: "Click to book tickets",
  viewOnMaps: "View location on Google Maps",
  noLocation: "No location",
  bookTicketsBtn: "Book Tickets 🎟️",
  hasNotesTooltip: "Has notes",
  editActivityTooltip: "Edit Activity Details",
  deleteActivityTooltip: "Delete Activity",
  saveChangesBtn: "Save Changes",
  cancelBtn: "Cancel",
  savedSuccessMsg: "Saved! ✅",
  errorSupabaseUpdate: "Error updating activity in Supabase.",
  errorSupabaseNote: "Error saving note in Supabase.",
  errorSupabaseDelete: "Error deleting activity in Supabase.",
  deletingBtn: "Deleting...",
  saveBtn: "Save",

  // Warning/Confirm Modals
  unsavedChangesTitle: "Unsaved Changes",
  unsavedChangesDesc: "Are you sure you want to leave? Your changes will not be saved.",
  keepEditingBtn: "Keep Editing",
  discardLeaveBtn: "Discard & Leave",
  confirmDeletionTitle: "Confirm Deletion",
  confirmDeletionDesc: "Are you sure you want to delete this activity? This action cannot be undone.",
  deleteBtn: "Delete",

  // User Guide
  userGuideTitle: "User Guide",
  userGuideContent: `
    <div style="text-align: left; font-size: 0.95rem; line-height: 1.5;">
      <h3 style="color: var(--primary-color); margin-bottom: 8px; font-size: 1.1rem;">1. Main Navigation</h3>
      <ul style="margin-bottom: 16px; padding-left: 20px;">
        <li><strong>Switch Language</strong>: Use the ES/EN button in the corner.</li>
        <li><strong>Filter by Day</strong>: In the Timeline, click a day to see only its activities.</li>
        <li><strong>All Days</strong>: Click the "ALL DAYS" button in the Timeline to see the full trip.</li>
      </ul>
      <h3 style="color: var(--primary-color); margin-bottom: 8px; font-size: 1.1rem;">2. Manage Activities</h3>
      <ul style="margin-bottom: 16px; padding-left: 20px;">
        <li><strong>Add</strong>: Click the red <strong>(+)</strong> button next to the day title.</li>
        <li><strong>Edit</strong>: Hover over an activity and click the pencil (✏️). Upon saving, it auto-translates.</li>
        <li><strong>Delete</strong>: In edit mode, click the trash bin (🗑️) at the top.</li>
      </ul>
      <h3 style="color: var(--primary-color); margin-bottom: 8px; font-size: 1.1rem;">3. Details and Links</h3>
      <ul style="margin-bottom: 0; padding-left: 20px;">
        <li><strong>Add Notes</strong>: Click the card (away from the pencil) to open details and add notes.</li>
        <li><strong>View on Map</strong>: Click the location (📍) to search Google Maps or open the link.</li>
        <li><strong>Book Tickets</strong>: If there's a booking link, a red "Book Tickets" button appears.</li>
      </ul>
    </div>
  `
};
