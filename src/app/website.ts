import { Navbar, type NavbarTab } from '../components/Navbar.js';
import { ItineraryView } from '../components/ItineraryView.js';
import { HomeView } from '../components/HomeView.js';
import type { Day } from '../components/DayItinerary.js';
import { getDiasViaje, updateDiaViaje } from '../database/supabaseClient.js';

import { t } from '../i18n/index.js';

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

function getUIData(): UIData {
  return {
    title: t('title'),
    subtitle: t('subtitle'),
    itineraryTab: t('itineraryTab'),
    infoTab: t('infoTab'),
    searchPlaceholder: t('searchPlaceholder'),
    allDays: t('allDays'),
    noResults: t('noResults'),
    infoTitle: t('infoTitle'),
    infoDestination: t('infoDestination'),
    infoDestinationDesc: t('infoDestinationDesc'),
    infoDates: t('infoDates'),
    infoDatesDesc: t('infoDatesDesc'),
    infoTips: t('infoTips'),
    infoTipsList: t('infoTipsList') as string[],
    infoPhones: t('infoPhones'),
    infoPhonesList: t('infoPhonesList') as Record<string, string>,
    errorTitle: t('errorTitle'),
    errorDesc: t('errorDesc'),
    homeTitle: t('homeTitle'),
    homeSubtitle: t('homeSubtitle'),
    startBtn: t('startBtn'),
    galleryTitle: t('galleryTitle'),
    galleryPlaces: t('galleryPlaces'),
    homeDestLabel: t('homeDestLabel'),
    homeDestVal: t('homeDestVal'),
    homeDatesLabel: t('homeDatesLabel'),
    homeDatesVal: t('homeDatesVal'),
    homeEventLabel: t('homeEventLabel'),
    homeEventVal: t('homeEventVal'),
    homePackingLabel: t('homePackingLabel'),
    homePackingVal: t('homePackingVal'),
    homeFlightLabel: t('homeFlightLabel'),
    homeFlightVal: t('homeFlightVal')
  };
}

// Global App State
let currentLang = (localStorage.getItem('app-lang') || 'es') as 'es' | 'en';
let currentPage: 'home' | 'itinerary' = 'home';
let currentTab: 'itinerary' | 'info' = 'itinerary';
let itineraryData: ItineraryData | null = null;

async function loadDataAndRender(container: HTMLElement) {
  try {
    // We get the raw data directly from Supabase!
    const daysData = await getDiasViaje(currentLang);

    if (daysData && daysData.length > 0) {
      const dias: Day[] = daysData as Day[];
      dias.forEach(day => {
        if (day.actividadDia) {
          day.actividadDia.sort((a, b) => a.hora.localeCompare(b.hora));
        }
      });
      itineraryData = { ui: getUIData(), dias };
      console.log('✅ Data loaded successfully from Supabase.', dias);
      renderApp(container);
    } else {
      throw new Error('No data returned from the database.');
    }
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    
    const uiFallback = getUIData();
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
            const updatePayload: any = { fecha: day.fecha };
            updatePayload[`descripcion_${currentLang}`] = day.descripcion;
            await updateDiaViaje(day.id_dia, updatePayload);
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

