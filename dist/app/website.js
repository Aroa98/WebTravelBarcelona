import { Navbar } from '../components/Navbar.js';
import { ItineraryView } from '../components/ItineraryView.js';
import { HomeView } from '../components/HomeView.js';
import { fetchUiTexts, fetchDays, updateDay, isConfigured } from '../database/supabaseClient.js';
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
let currentLang = (localStorage.getItem('app-lang') || 'es');
let currentPage = 'home';
let currentTab = 'itinerary';
let itineraryData = null;
async function loadDataAndRender(container) {
    try {
        let loaded = false;
        // Strategy 1: Try Supabase (works everywhere — local & deployed)
        if (isConfigured()) {
            try {
                const [uiData, daysData] = await Promise.all([
                    fetchUiTexts(currentLang),
                    fetchDays(currentLang)
                ]);
                if (uiData && daysData.length > 0) {
                    // Transform Supabase rows into the app's expected format
                    const dias = daysData.map(row => ({
                        id: row.id,
                        fecha: row.fecha,
                        tituloPrincipal: row.titulo_principal,
                        actividades: row.actividades
                    }));
                    itineraryData = { ui: uiData, dias };
                    loaded = true;
                    console.log('✅ Data loaded from Supabase.');
                }
            }
            catch (e) {
                console.warn('Supabase not reachable, trying fallback...', e);
            }
        }
        // Strategy 2: Fall back to static JSON files
        if (!loaded) {
            console.log('Loading from static JSON file...');
            const response = await fetch(`/src/database/${currentLang}.json`);
            if (response.ok) {
                itineraryData = await response.json();
                loaded = true;
            }
        }
        if (!loaded || !itineraryData) {
            throw new Error('Could not load data from any source.');
        }
        // Cache in localStorage as last-resort fallback
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
                    // Persist to Supabase if configured
                    if (isConfigured()) {
                        for (const day of updatedDays) {
                            try {
                                await updateDay(day.id, currentLang, {
                                    fecha: day.fecha,
                                    titulo_principal: day.tituloPrincipal,
                                    actividades: day.actividades
                                });
                            }
                            catch (err) {
                                console.error(`Error saving day ${day.id} to Supabase:`, err);
                            }
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