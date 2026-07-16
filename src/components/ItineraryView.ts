import { DayItinerary, type Day } from './DayItinerary.js';

export interface ItineraryViewProps {
  days: Day[];
  ui: {
    searchPlaceholder: string;
    allDays: string;
    noResults: string;
  };
  onUpdateItinerary?: (days: Day[]) => void;
}

export class ItineraryView {
  private days: Day[];
  private ui: ItineraryViewProps['ui'];
  private onUpdateItinerary: ((days: Day[]) => void) | undefined;
  private activeDayFilter: string = 'all'; // 'all' or day ID as string
  private searchQuery: string = '';
  private element: HTMLElement | null = null;
  private contentContainer: HTMLElement | null = null;

  constructor(props: ItineraryViewProps) {
    this.days = props.days;
    this.ui = props.ui;
    this.onUpdateItinerary = props.onUpdateItinerary;
  }

  public render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'itinerary-view-container';

    // 1. Timeline (Deadline) visual
    const timeline = this.createTimeline();
    container.appendChild(timeline);

    // 2. Toolbar (search and filtering)
    const toolbar = this.createToolbar();
    container.appendChild(toolbar);

    // 3. Content container for rendering the days
    const content = document.createElement('div');
    content.className = 'itinerary-content';
    this.contentContainer = content;
    container.appendChild(content);

    // First render
    this.updateList();

    this.element = container;
    return container;
  }

  private createTimeline(): HTMLElement {
    const timelineContainer = document.createElement('div');
    timelineContainer.className = 'timeline-deadline-container animate-fade-in';

    // Beautiful generated local images for Barcelona & Catalunya
    const bgImages = [
      '/images/sagrada_familia.png',
      '/images/park_guell.jpg',
      '/images/barrio_gotico.png',
      '/images/barceloneta.png',
      '/images/tossa_de_mar_1784198486541.png',
      '/images/tarragona_ruins_1784198494824.png',
      '/images/montserrat_1784198502558.png',
      '/images/sitges_sunset_1784198509962.png',
      '/images/girona_onyar_1784198517887.png'
    ];

    // Day 7 of October 2026 is Wednesday (Miércoles)
    const dayNames = ['MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM', 'LUN', 'MAR'];

    this.days.forEach((day, index) => {
      // Extraemos el número del día de la fecha (ej. "7 de Octubre" -> "7")
      const dayNumberMatch = day.fecha.match(/\d+/);
      const dayNumber = dayNumberMatch ? dayNumberMatch[0] : (index + 7).toString();
      
      // Intentamos extraer el nombre del día de la fecha si existe, si no, asumimos que empieza en Lunes
      let dayNameLabel = dayNames[index % 7];
      const lowerFecha = day.fecha.toLowerCase();
      if (lowerFecha.includes('lun')) dayNameLabel = 'LUN';
      else if (lowerFecha.includes('mar')) dayNameLabel = 'MAR';
      else if (lowerFecha.includes('mié') || lowerFecha.includes('mie')) dayNameLabel = 'MIÉ';
      else if (lowerFecha.includes('jue')) dayNameLabel = 'JUE';
      else if (lowerFecha.includes('vie')) dayNameLabel = 'VIE';
      else if (lowerFecha.includes('sáb') || lowerFecha.includes('sab')) dayNameLabel = 'SÁB';
      else if (lowerFecha.includes('dom')) dayNameLabel = 'DOM';

      const imageUrl = bgImages[index % bgImages.length];

      const item = document.createElement('div');
      item.className = 'timeline-deadline-item';
      item.style.backgroundImage = `url('${imageUrl}')`;
      
      if (this.activeDayFilter === day.id_dia.toString()) {
        item.classList.add('active');
      }

      item.innerHTML = `
        <div class="timeline-deadline-content">
          <div class="timeline-deadline-day-label">${dayNameLabel}</div>
          <div class="timeline-deadline-day-number">${dayNumber}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        // Toggle the filter
        if (this.activeDayFilter === day.id_dia.toString()) {
          this.activeDayFilter = 'all'; // deselect
        } else {
          this.activeDayFilter = day.id_dia.toString(); // select
        }
        
        // Update visual active state of items
        Array.from(timelineContainer.children).forEach(child => child.classList.remove('active'));
        if (this.activeDayFilter !== 'all') {
          item.classList.add('active');
        }
        
        // Update the select dropdown to match
        const select = this.element?.querySelector('.day-select-filter') as HTMLSelectElement;
        if (select) {
          select.value = this.activeDayFilter;
        }

        this.updateList();
      });

      timelineContainer.appendChild(item);
    });

    return timelineContainer;
  }

  private createToolbar(): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.className = 'itinerary-toolbar';

    // Search bar
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-wrapper';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = this.ui.searchPlaceholder;
    searchInput.className = 'search-input';

    // Search SVG icon
    const searchIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    searchIcon.setAttribute('viewBox', '0 0 24 24');
    searchIcon.setAttribute('fill', 'none');
    searchIcon.setAttribute('stroke', 'currentColor');
    searchIcon.setAttribute('stroke-width', '2');
    searchIcon.setAttribute('class', 'search-icon');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '11');
    circle.setAttribute('cy', '11');
    circle.setAttribute('r', '8');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '21');
    line.setAttribute('y1', '21');
    line.setAttribute('x2', '16.65');
    line.setAttribute('y2', '16.65');

    searchIcon.appendChild(circle);
    searchIcon.appendChild(line);

    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(searchInput);

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
      this.updateList();
    });

    // Day Quick Filters (Dropdown)
    const filterWrapper = document.createElement('div');
    filterWrapper.className = 'filter-wrapper';

    const daySelect = document.createElement('select');
    daySelect.className = 'day-select-filter';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = this.ui.allDays;
    daySelect.appendChild(allOption);

    this.days.forEach(day => {
      const option = document.createElement('option');
      option.value = day.id_dia.toString();
      option.textContent = day.fecha;
      daySelect.appendChild(option);
    });

    daySelect.addEventListener('change', (e) => {
      this.activeDayFilter = (e.target as HTMLSelectElement).value;
      this.updateList();
    });

    filterWrapper.appendChild(daySelect);

    toolbar.appendChild(searchWrapper);
    toolbar.appendChild(filterWrapper);

    return toolbar;
  }

  private updateList(): void {
    if (!this.contentContainer) return;

    // Clear current content
    this.contentContainer.innerHTML = '';

    // Filter data
    const filteredDays = this.days.map(day => {
      // 1. Filter by day if single day filter is active
      if (this.activeDayFilter !== 'all' && day.id_dia.toString() !== this.activeDayFilter) {
        return null;
      }

      // 2. Filter by search query within activities
      if (this.searchQuery.trim() !== '') {
        const matchingActivities = (day.actividadDia || []).filter(act =>
          (act.titulo && act.titulo.toLowerCase().includes(this.searchQuery)) ||
          (act.descripcion && act.descripcion.toLowerCase().includes(this.searchQuery)) ||
          (act.url && act.url.toLowerCase().includes(this.searchQuery))
        );

        if (matchingActivities.length === 0) {
          return null; // Day has no matching activities
        }

        return {
          ...day,
          actividadDia: matchingActivities
        };
      }

      return day;
    }).filter((day): day is Day => day !== null);

    // Render results
    if (filteredDays.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';

      const text = document.createElement('p');
      text.textContent = this.ui.noResults;

      noResults.appendChild(text);
      this.contentContainer.appendChild(noResults);
    } else {
      filteredDays.forEach(day => {
        const dayItinerary = new DayItinerary(
          day,
          (dayId) => {
            const select = this.element?.querySelector('.day-select-filter') as HTMLSelectElement;
            if (select) {
              select.value = dayId.toString();
            }
            this.activeDayFilter = dayId.toString();
            this.updateList();
          },
          (updatedDay) => {
            const index = this.days.findIndex(d => d.id_dia === updatedDay.id_dia);
            if (index !== -1) {
              this.days[index] = updatedDay;
              if (this.onUpdateItinerary) {
                this.onUpdateItinerary(this.days);
              }
              this.updateList();
            }
          }
        );
        this.contentContainer!.appendChild(dayItinerary.render());
      });
    }
  }
}
