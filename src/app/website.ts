import { Navbar, type NavbarTab } from '../components/Navbar.js';
import { ItineraryView } from '../components/ItineraryView.js';
import { HomeView } from '../components/HomeView.js';
import type { Day } from '../components/DayItinerary.js';
import { getDiasViaje, updateDiaViaje } from '../database/supabaseClient.js';

interface UIData {
  title: string;
  subtitle: string;
  itineraryTab: string;
  infoTab: string;
  searchPlaceholder: string;
  allDays: string;
  noResults: string;
  infoTitle: string;
  infoDestination: string;
  infoDestinationDesc: string;
  infoDates: string;
  infoDatesDesc: string;
  infoTips: string;
  infoTipsList: string[];
  infoPhones: string;
  infoPhonesList: Record<string, string>;
  errorTitle: string;
  errorDesc: string;
  homeTitle: string;
  homeSubtitle: string;
  startBtn: string;
  galleryTitle: string;
  galleryPlaces: {
    sagrada: string;
    park: string;
    barceloneta: string;
    gotico: string;
  };
  homeDestLabel: string;
  homeDestVal: string;
  homeDatesLabel: string;
  homeDatesVal: string;
  homeEventLabel: string;
  homeEventVal: string;
  homePackingLabel: string;
  homePackingVal: string;
  homeFlightLabel: string;
  homeFlightVal: string;
}

interface ItineraryData {
  ui: UIData;
  dias: Day[];
}

const staticUiTexts: Record<'es' | 'en', UIData> = {
  es: {
    title: "Boda de Aroa y Alberto",
    subtitle: "Nuestro Itinerario en Barcelona",
    itineraryTab: "Itinerario",
    infoTab: "Info General",
    searchPlaceholder: "Buscar actividades...",
    allDays: "Todos los días",
    noResults: "No se encontraron actividades.",
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
    errorTitle: "Oops! Algo salió mal.",
    errorDesc: "No se pudo cargar el itinerario del viaje desde la base de datos. Por favor, inténtalo más tarde.",
    homeTitle: "Bienvenidos a Nuestro Viaje",
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
    homeFlightVal: "IAD -> BCN"
  },
  en: {
    title: "Aroa & Alberto's Wedding",
    subtitle: "Our Barcelona Itinerary",
    itineraryTab: "Itinerary",
    infoTab: "General Info",
    searchPlaceholder: "Search activities...",
    allDays: "All Days",
    noResults: "No activities found.",
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
    errorTitle: "Oops! Something went wrong.",
    errorDesc: "Could not load the trip itinerary from the database. Please try again later.",
    homeTitle: "Welcome to Our Trip",
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
    homeFlightVal: "IAD -> BCN"
  }
};

// Global App State
let currentLang = (localStorage.getItem('app-lang') || 'es') as 'es' | 'en';
let currentPage: 'home' | 'itinerary' = 'home';
let currentTab: 'itinerary' | 'info' = 'itinerary';
let itineraryData: ItineraryData | null = null;

async function loadDataAndRender(container: HTMLElement) {
  try {
    // We get the raw data directly from Supabase!
    const daysData = await getDiasViaje();

    if (daysData && daysData.length > 0) {
      const dias: Day[] = daysData as Day[];
      itineraryData = { ui: staticUiTexts[currentLang], dias };
      console.log('✅ Data loaded successfully from Supabase.', dias);
      renderApp(container);
    } else {
      throw new Error('No data returned from the database.');
    }
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    
    const uiFallback = staticUiTexts[currentLang];
    container.innerHTML = `
      <div class="error-container">
        <h3>${uiFallback.errorTitle}</h3>
        <p>${uiFallback.errorDesc}</p>
        <p class="error-details">${error instanceof Error ? error.message : String(error)}</p>
      </div>
    `;
  }
}

function renderApp(container: HTMLElement) {
  if (!itineraryData) return;

  const data = itineraryData;

  // Render Home page
  if (currentPage === 'home') {
    const existingHeader = document.querySelector('header');
    if (existingHeader) {
      existingHeader.remove();
    }

    container.innerHTML = '';
    const homeView = new HomeView({
      ui: {
        homeTitle: data.ui.homeTitle,
        homeSubtitle: data.ui.homeSubtitle,
        startBtn: data.ui.startBtn,
        galleryTitle: data.ui.galleryTitle,
        galleryPlaces: data.ui.galleryPlaces,
        homeDestLabel: data.ui.homeDestLabel,
        homeDestVal: data.ui.homeDestVal,
        homeDatesLabel: data.ui.homeDatesLabel,
        homeDatesVal: data.ui.homeDatesVal,
        homeEventLabel: data.ui.homeEventLabel,
        homeEventVal: data.ui.homeEventVal,
        homePackingLabel: data.ui.homePackingLabel,
        homePackingVal: data.ui.homePackingVal,
        homeFlightLabel: data.ui.homeFlightLabel,
        homeFlightVal: data.ui.homeFlightVal
      },
      activeLang: currentLang,
      onLanguageSelect: (lang) => {
        currentLang = lang as 'es' | 'en';
        localStorage.setItem('app-lang', currentLang);
        loadDataAndRender(container);
      },
      onStartTrip: () => {
        currentPage = 'itinerary';
        currentTab = 'itinerary';
        renderApp(container);
      }
    });

    container.appendChild(homeView.render());
    return;
  }

  // Render Itinerary (Navbar + Day cards)
  const existingHeader = document.querySelector('header');
  
  // Navigation tabs config using translations
  const navTabs: NavbarTab[] = [
    { id: 'itinerary', label: data.ui.itineraryTab },
    { id: 'info', label: data.ui.infoTab }
  ];

  // Re-instantiate the Navbar with the selected language state
  const navbar = new Navbar({
    title: data.ui.title,
    subtitle: data.ui.subtitle,
    tabs: navTabs,
    activeTabId: currentTab,
    activeLang: currentLang,
    onTabSelect: (tabId) => {
      currentTab = tabId as 'itinerary' | 'info';
      renderTabContent(container);
    },
    onLanguageSelect: (lang) => {
      currentLang = lang as 'es' | 'en';
      localStorage.setItem('app-lang', currentLang);
      loadDataAndRender(container);
    },
    onBrandClick: () => {
      currentPage = 'home';
      renderApp(container);
    }
  });

  const renderedHeader = navbar.render();

  if (existingHeader) {
    existingHeader.replaceWith(renderedHeader);
  } else {
    document.body.insertBefore(renderedHeader, container);
  }

  // Render the active tab content
  renderTabContent(container);
}

function renderTabContent(container: HTMLElement) {
  if (!itineraryData) return;

  if (currentTab === 'itinerary') {
    container.innerHTML = '';
    const itineraryView = new ItineraryView({
      days: itineraryData.dias,
      ui: {
        searchPlaceholder: itineraryData.ui.searchPlaceholder,
        allDays: itineraryData.ui.allDays,
        noResults: itineraryData.ui.noResults
      },
      onUpdateItinerary: async (updatedDays) => {
        if (itineraryData) {
          itineraryData.dias = updatedDays;
          
          // Guardar SOLO datos del día a Supabase, ya que
          // las actividades ahora se guardan directo desde su propio modal.
          for (const day of updatedDays) {
            try {
              await updateDiaViaje(day.id_dia, {
                fecha: day.fecha,
                descripcion: day.descripcion
              });
            } catch (err) {
              console.error(`Error saving day ${day.id_dia} to Supabase:`, err);
            }
          }
        }
      }
    });
    container.appendChild(itineraryView.render());
  } else if (currentTab === 'info') {
    renderGeneralInfo(container, itineraryData.ui);
  }
}

function renderGeneralInfo(container: HTMLElement, ui: UIData) {
  container.innerHTML = '';

  const infoSection = document.createElement('div');
  infoSection.className = 'info-section animate-fade-in';

  // Construct Tips List HTML
  const tipsHtml = ui.infoTipsList
    .map(tip => `<li>${tip}</li>`)
    .join('');

  // Construct Phones List HTML
  const phonesHtml = Object.entries(ui.infoPhonesList)
    .map(([name, num]) => `<p><strong>${name}:</strong> ${num}</p>`)
    .join('');

  infoSection.innerHTML = `
    <h2>${ui.infoTitle}</h2>
    <div class="info-grid">
      <div class="info-card">
        <h3>${ui.infoDestination}</h3>
        <p>${ui.infoDestinationDesc}</p>
      </div>
      <div class="info-card">
        <h3>${ui.infoDates}</h3>
        <p>${ui.infoDatesDesc}</p>
      </div>
      <div class="info-card">
        <h3>${ui.infoTips}</h3>
        <ul>
          ${tipsHtml}
        </ul>
      </div>
      <div class="info-card">
        <h3>${ui.infoPhones}</h3>
        ${phonesHtml}
      </div>
    </div>
  `;

  container.appendChild(infoSection);
}

function initApp() {
  const container = document.getElementById('itinerario-container');
  if (!container) return;
  loadDataAndRender(container);
}

document.addEventListener('DOMContentLoaded', initApp);

