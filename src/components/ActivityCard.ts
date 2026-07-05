export interface Activity {
  hora: string;
  titulo: string;
  descripcion: string;
  lugar: string;
}

export class ActivityCard {
  private activity: Activity;

  constructor(activity: Activity) {
    this.activity = activity;
  }

  public render(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'activity-card';

    // Activity timeline marker / time indicator
    const timeContainer = document.createElement('div');
    timeContainer.className = 'activity-time-container';
    
    const timeBadge = document.createElement('span');
    timeBadge.className = 'activity-time';
    timeBadge.textContent = this.activity.hora;
    timeContainer.appendChild(timeBadge);

    // Content container
    const content = document.createElement('div');
    content.className = 'activity-content';

    const title = document.createElement('h3');
    title.className = 'activity-title';
    title.textContent = this.activity.titulo;

    const description = document.createElement('p');
    description.className = 'activity-description';
    description.textContent = this.activity.descripcion;

    const locationContainer = document.createElement('div');
    locationContainer.className = 'activity-location';

    // Pin icon svg
    const pinSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    pinSvg.setAttribute('viewBox', '0 0 24 24');
    pinSvg.setAttribute('fill', 'none');
    pinSvg.setAttribute('stroke', 'currentColor');
    pinSvg.setAttribute('stroke-width', '2');
    pinSvg.setAttribute('stroke-linecap', 'round');
    pinSvg.setAttribute('stroke-linejoin', 'round');
    pinSvg.setAttribute('class', 'location-icon');
    pinSvg.style.width = '14px';
    pinSvg.style.height = '14px';
    pinSvg.style.marginRight = '4px';
    pinSvg.style.display = 'inline-block';
    pinSvg.style.verticalAlign = 'middle';
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '10');
    circle.setAttribute('r', '3');
    
    pinSvg.appendChild(path);
    pinSvg.appendChild(circle);

    const locationText = document.createElement('span');
    locationText.className = 'location-text';
    locationText.textContent = this.activity.lugar;

    locationContainer.appendChild(pinSvg);
    locationContainer.appendChild(locationText);

    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(locationContainer);

    card.appendChild(timeContainer);
    card.appendChild(content);

    return card;
  }
}
