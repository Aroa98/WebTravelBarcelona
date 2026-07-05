import { ActivityCard, type Activity } from './ActivityCard.js';

export interface Day {
  id: number;
  fecha: string;
  tituloPrincipal: string;
  actividades: Activity[];
}

export class DayItinerary {
  private day: Day;

  constructor(day: Day) {
    this.day = day;
  }

  public render(): HTMLElement {
    const daySection = document.createElement('section');
    daySection.className = 'day-section';
    daySection.id = `day-${this.day.id}`;

    const isWedding = this.day.id === 10 || 
                      this.day.tituloPrincipal.toLowerCase().includes('boda') || 
                      this.day.tituloPrincipal.toLowerCase().includes('wedding');
    if (isWedding) {
      daySection.classList.add('wedding-theme');
    }

    // Header of the day
    const header = document.createElement('div');
    header.className = 'day-header';

    const dateBadge = document.createElement('div');
    dateBadge.className = 'day-badge';
    dateBadge.textContent = this.day.fecha;

    const title = document.createElement('h2');
    title.className = 'day-title';
    title.textContent = this.day.tituloPrincipal;

    header.appendChild(dateBadge);
    header.appendChild(title);
    daySection.appendChild(header);

    // Timeline wrapper
    const timeline = document.createElement('div');
    timeline.className = 'day-timeline';

    if (this.day.actividades && this.day.actividades.length > 0) {
      this.day.actividades.forEach(activity => {
        const activityCard = new ActivityCard(activity);
        timeline.appendChild(activityCard.render());
      });
    } else {
      const emptyState = document.createElement('p');
      emptyState.className = 'timeline-empty';
      emptyState.textContent = 'No hay actividades planificadas para este día.';
      timeline.appendChild(emptyState);
    }

    daySection.appendChild(timeline);

    return daySection;
  }
}
