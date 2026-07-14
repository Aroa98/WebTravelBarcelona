import { Navbar } from '../components/Navbar.js';
import { ItineraryView } from '../components/ItineraryView.js';
import { HomeView } from '../components/HomeView.js';
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
// API Configuration
const API_KEY = 'barcelona-travel-2024';
/**
 * Helper to make authenticated API requests
 */
async function apiRequest(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...(options.headers || {})
    };
    return fetch(url, { ...options, headers });
}
// Global App State
let currentLang = (localStorage.getItem('app-lang') || 'es');
let currentPage = 'home';
let currentTab = 'itinerary';
let itineraryData = null;
async function loadDataAndRender(container) {
    try {
        // Strategy 1: Try the API server (works locally with Express)
        let response = await fetch(`/api/itinerary/${currentLang}`);
        // If API returns HTML (e.g. static hosting 404), it's not available
        const contentType = response.headers.get('content-type') || '';
        if (!response.ok || !contentType.includes('application/json')) {
            // Strategy 2: Fall back to reading the static JSON file directly
            // (works on GitHub Pages and any static hosting)
            console.log('API not available, loading static JSON file...');
            response = await fetch(`/src/database/${currentLang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }
        itineraryData = await response.json();
        if (!itineraryData) {
            throw new Error('Data could not be parsed.');
        }
        // Cache in localStorage as fallback
        localStorage.setItem(`cache-itinerary-${currentLang}`, JSON.stringify(itineraryData));
        renderApp(container);
    }
    catch (error) {
        console.error('Error loading data, trying localStorage cache:', error);
        // Strategy 3: Fall back to localStorage cache
        const cached = localStorage.getItem(`cache-itinerary-${currentLang}`);
        if (cached) {
            try {
                itineraryData = JSON.parse(cached);
                console.log('Loaded from localStorage cache.');
                renderApp(container);
                return;
            }
            catch (e) {
                console.error('Cache parse error:', e);
            }
        }
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
function renderApp(container) {
    if (!itineraryData)
        return;
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
                currentLang = lang;
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
    const navTabs = [
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
            currentTab = tabId;
            renderTabContent(container);
        },
        onLanguageSelect: (lang) => {
            currentLang = lang;
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
    }
    else {
        document.body.insertBefore(renderedHeader, container);
    }
    // Render the active tab content
    renderTabContent(container);
}
function renderTabContent(container) {
    if (!itineraryData)
        return;
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
                    // Persist each updated day to the server via API
                    for (const day of updatedDays) {
                        try {
                            await apiRequest(`/api/days/${currentLang}/${day.id}`, {
                                method: 'PUT',
                                body: JSON.stringify(day)
                            });
                        }
                        catch (err) {
                            console.error(`Error saving day ${day.id}:`, err);
                        }
                    }
                    // Also update the localStorage cache
                    localStorage.setItem(`cache-itinerary-${currentLang}`, JSON.stringify(itineraryData));
                }
            }
        });
        container.appendChild(itineraryView.render());
    }
    else if (currentTab === 'info') {
        renderGeneralInfo(container, itineraryData.ui);
    }
}
function renderGeneralInfo(container, ui) {
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
    if (!container)
        return;
    loadDataAndRender(container);
}
document.addEventListener('DOMContentLoaded', initApp);
//# sourceMappingURL=website.js.map