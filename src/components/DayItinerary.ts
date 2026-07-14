import { ActivityCard, type Activity } from './ActivityCard.js';

export interface Day {
  id: number;
  fecha: string;
  tituloPrincipal: string;
  actividades: Activity[];
}

export class DayItinerary {
  private day: Day;
  private onDaySelect: ((dayId: number) => void) | undefined;
  private onUpdateDay: ((updatedDay: Day) => void) | undefined;

  constructor(day: Day, onDaySelect?: (dayId: number) => void, onUpdateDay?: (updatedDay: Day) => void) {
    this.day = day;
    this.onDaySelect = onDaySelect;
    this.onUpdateDay = onUpdateDay;
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

    // Header of the day (clickable to filter view)
    const header = document.createElement('div');
    header.className = 'day-header clickable-day';
    header.title = localStorage.getItem('app-lang') === 'en' ? 'Click to focus on this day' : 'Haz clic para enfocar este día';
    header.addEventListener('click', () => {
      if (this.onDaySelect) {
        this.onDaySelect(this.day.id);
      }
    });

    const headerLeft = document.createElement('div');
    headerLeft.style.display = 'flex';
    headerLeft.style.alignItems = 'center';
    headerLeft.style.gap = '12px';

    const dateBadge = document.createElement('div');
    dateBadge.className = 'day-badge';
    dateBadge.textContent = this.day.fecha;

    const title = document.createElement('h2');
    title.className = 'day-title';
    title.textContent = this.day.tituloPrincipal;

    headerLeft.appendChild(dateBadge);
    headerLeft.appendChild(title);
    header.appendChild(headerLeft);

    // Add activity plan button inside the day header
    const addPlanBtn = document.createElement('button');
    addPlanBtn.className = 'day-add-plan-btn';
    addPlanBtn.innerHTML = `
      <svg class="action-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    `;
    const isEn = localStorage.getItem('app-lang') === 'en';
    addPlanBtn.title = isEn ? 'Add custom plan' : 'Añadir plan personalizado';
    addPlanBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent day header filter click!
      this.openAddPlanModal();
    });
    header.appendChild(addPlanBtn);

    daySection.appendChild(header);

    // Timeline wrapper
    const timeline = document.createElement('div');
    timeline.className = 'day-timeline';

    if (this.day.actividades && this.day.actividades.length > 0) {
      this.day.actividades.forEach((activity, idx) => {
        const activityCard = new ActivityCard(activity, this.day.id, (updatedActivity) => {
          this.day.actividades[idx] = updatedActivity;
          // Sort by hour to maintain chronological order after edit
          this.day.actividades.sort((a, b) => a.hora.localeCompare(b.hora));
          if (this.onUpdateDay) {
            this.onUpdateDay(this.day);
          }
        }, () => {
          this.day.actividades.splice(idx, 1);
          if (this.onUpdateDay) {
            this.onUpdateDay(this.day);
          }
        });
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

  private openAddPlanModal(): void {
    const isEn = localStorage.getItem('app-lang') === 'en';
    
    // Modal Overlay
    const overlay = document.createElement('div');
    overlay.className = 'activity-modal-overlay';
    
    // Modal Box
    const modal = document.createElement('div');
    modal.className = 'activity-modal';

    // Washi tape decorator at the top
    const washiTape = document.createElement('div');
    washiTape.className = 'activity-modal-washi-tape';
    modal.appendChild(washiTape);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'activity-modal-close';
    closeBtn.innerHTML = '&times;';
    
    // Form Inputs
    const header = document.createElement('div');
    header.className = 'activity-modal-header';
    header.style.marginBottom = '12px';
    
    const timeLabel = document.createElement('div');
    timeLabel.className = 'activity-modal-time';
    timeLabel.style.fontSize = '0.9rem';
    timeLabel.style.marginBottom = '4px';
    timeLabel.textContent = isEn ? 'Time (e.g. 10:00):' : 'Hora (ej. 10:00):';
    
    const timeInput = document.createElement('input');
    timeInput.type = 'text';
    timeInput.className = 'activity-edit-input';
    timeInput.value = '10:00';
    timeInput.style.marginBottom = '12px';
    
    const titleLabel = document.createElement('div');
    titleLabel.style.fontWeight = '700';
    titleLabel.style.marginBottom = '4px';
    titleLabel.style.color = 'var(--primary-color)';
    titleLabel.textContent = isEn ? 'Activity Name:' : 'Nombre de la Actividad:';
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'activity-edit-input';
    titleInput.placeholder = isEn ? 'e.g. Lunch at beach...' : 'ej. Almuerzo en la playa...';
    titleInput.style.marginBottom = '12px';
    
    header.appendChild(timeLabel);
    header.appendChild(timeInput);
    header.appendChild(titleLabel);
    header.appendChild(titleInput);
    
    // Description
    const descLabel = document.createElement('div');
    descLabel.style.fontWeight = '700';
    descLabel.style.marginBottom = '4px';
    descLabel.style.color = 'var(--primary-color)';
    descLabel.textContent = isEn ? 'Description:' : 'Descripción:';
    
    const descTextarea = document.createElement('textarea');
    descTextarea.className = 'activity-edit-textarea';
    descTextarea.placeholder = isEn ? 'Details of the activity...' : 'Detalles de la actividad...';
    descTextarea.style.marginBottom = '12px';
    
    // Location
    const locLabel = document.createElement('div');
    locLabel.style.fontWeight = '700';
    locLabel.style.marginBottom = '4px';
    locLabel.style.color = 'var(--primary-color)';
    locLabel.textContent = isEn ? 'Location:' : 'Lugar:';
    
    const locInput = document.createElement('input');
    locInput.type = 'text';
    locInput.className = 'activity-edit-input';
    locInput.placeholder = isEn ? 'e.g. Barceloneta...' : 'ej. Barceloneta...';
    locInput.style.marginBottom = '12px';

    // Reservation Link (optional)
    const linkLabel = document.createElement('div');
    linkLabel.style.fontWeight = '700';
    linkLabel.style.marginBottom = '4px';
    linkLabel.style.color = 'var(--primary-color)';
    linkLabel.textContent = isEn ? 'Booking Link (optional):' : 'Enlace de Reserva (opcional):';
    
    const linkInput = document.createElement('input');
    linkInput.type = 'text';
    linkInput.className = 'activity-edit-input';
    linkInput.placeholder = 'https://...';
    linkInput.style.marginBottom = '16px';
    
    // Notes Area in the add modal (lined notebook style)
    const notesContainer = document.createElement('div');
    notesContainer.className = 'activity-modal-notes';
    
    const notesTitle = document.createElement('h4');
    notesTitle.textContent = isEn ? 'Initial Notes 📝' : 'Notas Iniciales 📝';
    
    const notesTextarea = document.createElement('textarea');
    notesTextarea.className = 'activity-notes-textarea';
    notesTextarea.placeholder = isEn ? 'Write here your notes...' : 'Escribe aquí tus anotaciones...';
    
    notesContainer.appendChild(notesTitle);
    notesContainer.appendChild(notesTextarea);
    
    // Action buttons
    const actionsWrapper = document.createElement('div');
    actionsWrapper.style.marginTop = '20px';
    actionsWrapper.style.display = 'flex';
    actionsWrapper.style.gap = '10px';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'activity-notes-save-btn';
    saveBtn.textContent = isEn ? 'Create Plan ➕' : 'Crear Plan ➕';
    
    saveBtn.addEventListener('click', () => {
      const titleVal = titleInput.value.trim();
      const timeVal = timeInput.value.trim();
      const locVal = locInput.value.trim() || 'Barcelona';
      const descVal = descTextarea.value.trim();
      const linkVal = linkInput.value.trim();
      
      if (!titleVal) {
        alert(isEn ? 'Please enter a name for the activity' : 'Por favor ingresa un nombre para la actividad');
        return;
      }
      
      const newActivity: Activity = {
        hora: timeVal || '10:00',
        titulo: titleVal,
        descripcion: descVal,
        lugar: locVal,
        enlace_reserva: linkVal || undefined
      };
      
      // Save notes if any
      if (notesTextarea.value.trim()) {
        const storageKey = `notes-${this.day.id}-${newActivity.titulo.replace(/\s+/g, '-').toLowerCase()}`;
        localStorage.setItem(storageKey, notesTextarea.value);
      }
      
      // Add to activities
      if (!this.day.actividades) {
        this.day.actividades = [];
      }
      this.day.actividades.push(newActivity);
      
      // Sort activities by time
      this.day.actividades.sort((a, b) => a.hora.localeCompare(b.hora));
      
      if (this.onUpdateDay) {
        this.onUpdateDay(this.day);
      }
      
      overlay.remove();
    });
    
    actionsWrapper.appendChild(saveBtn);

    // Change checks
    const hasChanges = () => {
      return titleInput.value.trim() !== '' ||
             timeInput.value.trim() !== '10:00' ||
             locInput.value.trim() !== '' ||
             descTextarea.value.trim() !== '' ||
             linkInput.value.trim() !== '' ||
             notesTextarea.value.trim() !== '';
    };

    const handleCloseAttempt = () => {
      if (hasChanges()) {
        this.openUnsavedWarningModal(() => {
          overlay.remove();
        });
      } else {
        overlay.remove();
      }
    };

    closeBtn.addEventListener('click', handleCloseAttempt);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        handleCloseAttempt();
      }
    });

    modal.appendChild(closeBtn);

    // Scroll Container
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'activity-modal-scroll-container';
    scrollContainer.appendChild(header);
    scrollContainer.appendChild(descLabel);
    scrollContainer.appendChild(descTextarea);
    scrollContainer.appendChild(locLabel);
    scrollContainer.appendChild(locInput);
    scrollContainer.appendChild(linkLabel);
    scrollContainer.appendChild(linkInput);
    scrollContainer.appendChild(notesContainer);
    scrollContainer.appendChild(actionsWrapper);

    modal.appendChild(scrollContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  private openUnsavedWarningModal(onConfirmDiscard: () => void): void {
    const isEn = localStorage.getItem('app-lang') === 'en';
    
    // Overlay
    const confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'confirm-modal-overlay';
    
    // Modal box
    const confirmModal = document.createElement('div');
    confirmModal.className = 'confirm-modal';
    confirmModal.style.borderTopColor = '#e67e22'; // Orange warning accent
    
    // Warning SVG Icon
    const warningIcon = document.createElement('div');
    warningIcon.className = 'confirm-modal-icon';
    warningIcon.style.color = '#e67e22';
    warningIcon.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    `;
    confirmModal.appendChild(warningIcon);
    
    // Title
    const title = document.createElement('h4');
    title.className = 'confirm-modal-title';
    title.textContent = isEn ? 'Unsaved Changes' : 'Cambios no guardados';
    confirmModal.appendChild(title);
    
    // Description
    const desc = document.createElement('p');
    desc.className = 'confirm-modal-desc';
    desc.textContent = isEn 
      ? 'Are you sure you want to leave? Your changes will not be saved.'
      : '¿Estás seguro de que deseas salir? Los datos introducidos no se guardarán.';
    confirmModal.appendChild(desc);
    
    // Actions Wrapper
    const actions = document.createElement('div');
    actions.className = 'confirm-modal-actions';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'confirm-modal-btn confirm-modal-btn-cancel';
    cancelBtn.textContent = isEn ? 'Keep Editing' : 'Seguir editando';
    cancelBtn.addEventListener('click', () => {
      confirmOverlay.remove();
    });
    
    const discardBtn = document.createElement('button');
    discardBtn.className = 'confirm-modal-btn confirm-modal-btn-delete';
    discardBtn.style.backgroundColor = '#e67e22';
    discardBtn.textContent = isEn ? 'Discard & Leave' : 'Salir sin guardar';
    discardBtn.addEventListener('click', () => {
      confirmOverlay.remove();
      onConfirmDiscard();
    });
    
    actions.appendChild(cancelBtn);
    actions.appendChild(discardBtn);
    confirmModal.appendChild(actions);
    
    confirmOverlay.appendChild(confirmModal);
    
    confirmOverlay.addEventListener('click', (e) => {
      if (e.target === confirmOverlay) {
        confirmOverlay.remove();
      }
    });
    
    document.body.appendChild(confirmOverlay);
  }
}
