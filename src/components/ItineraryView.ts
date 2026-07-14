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

    // Toolbar (search and filtering)
    const toolbar = this.createToolbar();
    container.appendChild(toolbar);

    // Content container for rendering the days
    const content = document.createElement('div');
    content.className = 'itinerary-content';
    this.contentContainer = content;
    container.appendChild(content);

    // First render
    this.updateList();

    this.element = container;
    return container;
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
      option.value = day.id.toString();
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
      if (this.activeDayFilter !== 'all' && day.id.toString() !== this.activeDayFilter) {
        return null;
      }

      // 2. Filter by search query within activities
      if (this.searchQuery.trim() !== '') {
        const matchingActivities = day.actividades.filter(act =>
          act.titulo.toLowerCase().includes(this.searchQuery) ||
          act.descripcion.toLowerCase().includes(this.searchQuery) ||
          act.lugar.toLowerCase().includes(this.searchQuery)
        );

        if (matchingActivities.length === 0) {
          return null; // Day has no matching activities
        }

        return {
          ...day,
          actividades: matchingActivities
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
            const index = this.days.findIndex(d => d.id === updatedDay.id);
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
