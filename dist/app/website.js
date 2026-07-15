import { Navbar } from '../components/Navbar.js';
import { ItineraryView } from '../components/ItineraryView.js';
import { HomeView } from '../components/HomeView.js';
import { getDiasViaje, updateDiaViaje } from '../database/supabaseClient.js';
import { t } from '../i18n/index.js';
function getUIData() {
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
        infoTipsList: t('infoTipsList'),
        infoPhones: t('infoPhones'),
        infoPhonesList: t('infoPhonesList'),
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
let currentLang = (localStorage.getItem('app-lang') || 'es');
let currentPage = 'home';
let currentTab = 'itinerary';
let itineraryData = null;
async function loadDataAndRender(container) {
    try {
        // We get the raw data directly from Supabase!
        const daysData = await getDiasViaje(currentLang);
        if (daysData && daysData.length > 0) {
            const dias = daysData;
            dias.forEach(day => {
                if (day.actividadDia) {
                    day.actividadDia.sort((a, b) => a.hora.localeCompare(b.hora));
                }
            });
            itineraryData = { ui: getUIData(), dias };
            console.log('✅ Data loaded successfully from Supabase.', dias);
            renderApp(container);
        }
        else {
            throw new Error('No data returned from the database.');
        }
    }
    catch (error) {
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
                    // Guardar SOLO datos del día a Supabase, ya que
                    // las actividades ahora se guardan directo desde su propio modal.
                    for (const day of updatedDays) {
                        try {
                            const updatePayload = { fecha: day.fecha };
                            updatePayload[`descripcion_${currentLang}`] = day.descripcion;
                            await updateDiaViaje(day.id_dia, updatePayload);
                        }
                        catch (err) {
                            console.error(`Error saving day ${day.id_dia} to Supabase:`, err);
                        }
                    }
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
