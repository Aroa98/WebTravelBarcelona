import { Navbar, type NavbarTab } from '../components/Navbar.js';
import { ItineraryView } from '../components/ItineraryView.js';
import { HomeView } from '../components/HomeView.js';
import type { Day } from '../components/DayItinerary.js';

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

const errorFallback = {
  es: {
    title: "Oops! Algo salió mal.",
    desc: "No se pudo cargar el itinerario del viaje. Por favor, inténtalo más tarde."
  },
  en: {
    title: "Oops! Something went wrong.",
    desc: "Could not load the trip itinerary. Please try again later."
  }
};

// Global App State
let currentLang = (localStorage.getItem('app-lang') || 'es') as 'es' | 'en';
let currentPage: 'home' | 'itinerary' = 'home';
let currentTab: 'itinerary' | 'info' = 'itinerary';
let itineraryData: ItineraryData | null = null;

async function loadDataAndRender(container: HTMLElement) {
  try {
    // Fetch translated data based on current language
    const response = await fetch(`/src/database/${currentLang}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    itineraryData = await response.json();
    if (!itineraryData) {
      throw new Error('Data could not be parsed.');
    }

    renderApp(container);
  } catch (error) {
    console.error('Error al cargar la traducción:', error);
    const fallback = errorFallback[currentLang];
    container.innerHTML = `
      <div class="error-container">
        <h3>${fallback.title}</h3>
        <p>${fallback.desc}</p>
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
      loadDataAndRender(container); // Reload JSON and re-render app
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
