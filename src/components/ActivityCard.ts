import { updateActividad, deleteActividad } from '../database/supabaseClient.js';

export interface Activity {
  id_actividad?: number;
  id_dia: number;
  hora: string;
  titulo: string;
  descripcion?: string | null;
  url?: string | null;
  reservaLink?: string | null;
  notas?: string | null;
}

export class ActivityCard {
  private activity: Activity;
  private dayId: number | undefined;
  private onUpdateActivity: ((updatedActivity: Activity) => void) | undefined;
  private onDeleteActivity: (() => void) | undefined;
  private isEditing: boolean = false;

  constructor(
    activity: Activity, 
    dayId?: number, 
    onUpdateActivity?: (updatedActivity: Activity) => void,
    onDeleteActivity?: () => void
  ) {
    this.activity = activity;
    this.dayId = dayId;
    this.onUpdateActivity = onUpdateActivity;
    this.onDeleteActivity = onDeleteActivity;
  }

  public render(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'activity-card';

    // Activity timeline marker / time indicator
    const timeContainer = document.createElement('div');
    timeContainer.className = 'activity-time-container';
    
    const timeBadge = document.createElement('span');
    timeBadge.className = 'activity-time';
    // Format hora (remove seconds if present)
    timeBadge.textContent = this.activity.hora ? this.activity.hora.substring(0, 5) : '10:00';
    timeContainer.appendChild(timeBadge);

    // Content container
    const content = document.createElement('div');
    content.className = 'activity-content';
    content.style.cursor = 'pointer';
    content.title = localStorage.getItem('app-lang') === 'en' ? 'Click to view details and add notes' : 'Haz clic para ver detalles y añadir notas';
    
    const title = document.createElement('h3');
    title.className = 'activity-title';
    title.textContent = this.activity.titulo;

    // Clicking on content opens the detail modal
    content.addEventListener('click', () => {
      this.openDetailModal(content, title);
    });

    const description = document.createElement('p');
    description.className = 'activity-description';
    description.textContent = this.activity.descripcion || '';

    const locationContainer = document.createElement('div');
    locationContainer.className = 'activity-location clickable-location';
    
    const isEn = localStorage.getItem('app-lang') === 'en';
    locationContainer.title = this.activity.reservaLink 
      ? (isEn ? 'Click to book tickets' : 'Haz clic para reservar') 
      : (isEn ? 'View location on Google Maps' : 'Ver ubicación en Google Maps');

    // Click handler for location (booking or maps redirection)
    locationContainer.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent opening the detail modal
      if (this.activity.reservaLink) {
        window.open(this.activity.reservaLink, '_blank');
      } else if (this.activity.url) {
        const query = encodeURIComponent(this.activity.url);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
      }
    });

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
    locationText.textContent = this.activity.url || '';

    if (this.activity.url) {
      locationContainer.appendChild(pinSvg);
      locationContainer.appendChild(locationText);
      content.appendChild(title);
      content.appendChild(description);
      content.appendChild(locationContainer);
    } else {
      content.appendChild(title);
      content.appendChild(description);
    }

    if (this.activity.reservaLink) {
      const linkContainer = document.createElement('div');
      linkContainer.className = 'activity-link-container';
      
      const link = document.createElement('a');
      link.href = this.activity.reservaLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'activity-booking-link';
      
      const currentLang = localStorage.getItem('app-lang') || 'es';
      link.textContent = currentLang === 'en' ? 'Book Tickets 🎟️' : 'Reservar Entradas 🎟️';
      
      // Prevent detail modal from opening when clicking reservation button
      link.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      linkContainer.appendChild(link);
      content.appendChild(linkContainer);
    }

    this.updateNoteIndicator(content, title);

    card.appendChild(timeContainer);
    card.appendChild(content);

    return card;
  }

  private updateNoteIndicator(contentEl: HTMLElement, titleEl: HTMLElement): void {
    const savedNote = this.activity.notas;
    let indicator = titleEl.querySelector('.activity-note-indicator') as HTMLElement | null;
    
    if (savedNote && savedNote.trim()) {
      if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'activity-note-indicator';
        indicator.textContent = '📌';
        indicator.title = localStorage.getItem('app-lang') === 'en' ? 'Has notes' : 'Tiene notas';
        titleEl.appendChild(indicator);
      }
      contentEl.classList.add('has-notes');
    } else {
      if (indicator) {
        indicator.remove();
      }
      contentEl.classList.remove('has-notes');
    }
  }

  private openDetailModal(contentEl: HTMLElement, titleEl: HTMLElement): void {
    const isEn = localStorage.getItem('app-lang') === 'en';
    this.isEditing = false;
    
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
    
    // Close button (cruz)
    const closeBtn = document.createElement('button');
    closeBtn.className = 'activity-modal-close';
    closeBtn.innerHTML = '&times;';
    
    const handleCloseAttempt = () => {
      if (this.isEditing) {
        this.openUnsavedWarningModal(() => {
          overlay.remove();
          this.isEditing = false;
          this.updateNoteIndicator(contentEl, titleEl);
        });
      } else {
        overlay.remove();
        this.updateNoteIndicator(contentEl, titleEl);
      }
    };

    closeBtn.addEventListener('click', handleCloseAttempt);
    
    // Close on clicking outside the modal box
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        handleCloseAttempt();
      }
    });

    // VIEW MODE CONTAINER
    const viewModeContainer = document.createElement('div');
    viewModeContainer.className = 'activity-modal-view-mode';
    
    // Modal Header
    const header = document.createElement('div');
    header.className = 'activity-modal-header';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'flex-start';
    
    const headerInfo = document.createElement('div');
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'activity-modal-time';
    timeSpan.textContent = this.activity.hora ? this.activity.hora.substring(0, 5) : '';
    
    const title = document.createElement('h3');
    title.className = 'activity-modal-title';
    title.textContent = this.activity.titulo;
    
    headerInfo.appendChild(timeSpan);
    headerInfo.appendChild(title);
    header.appendChild(headerInfo);

    // Actions header wrapper (pencil + trash)
    const headerActions = document.createElement('div');
    headerActions.style.display = 'flex';
    headerActions.style.gap = '8px';

    // Edit (pencil) button inside the header
    const editBtn = document.createElement('button');
    editBtn.className = 'activity-modal-edit-btn';
    editBtn.innerHTML = `
      <svg class="action-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    `;
    editBtn.title = isEn ? 'Edit Activity Details' : 'Editar detalles de la actividad';
    headerActions.appendChild(editBtn);

    // Delete (trash) button inside the header
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'activity-modal-delete-btn';
    deleteBtn.innerHTML = `
      <svg class="action-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    `;
    deleteBtn.title = isEn ? 'Delete Activity' : 'Eliminar actividad';
    deleteBtn.addEventListener('click', () => {
      this.openDeleteConfirmModal(overlay);
    });
    headerActions.appendChild(deleteBtn);
    
    header.appendChild(headerActions);
    viewModeContainer.appendChild(header);
    
    // Modal Body
    const desc = document.createElement('p');
    desc.className = 'activity-modal-desc';
    desc.textContent = this.activity.descripcion || '';
    viewModeContainer.appendChild(desc);
    
    // Location in modal
    const locationBox = document.createElement('div');
    locationBox.className = 'activity-modal-location-container';
    
    const locText = document.createElement('span');
    locText.className = 'location-text clickable-location';
    locText.title = this.activity.reservaLink ? (isEn ? 'Book tickets' : 'Reservar') : (isEn ? 'Google Maps' : 'Google Maps');
    locText.innerHTML = `📍 <strong>${this.activity.url || 'Sin ubicación'}</strong>`;
    
    locText.addEventListener('click', () => {
      if (this.activity.reservaLink) {
        window.open(this.activity.reservaLink, '_blank');
      } else if (this.activity.url) {
        const query = encodeURIComponent(this.activity.url);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
      }
    });
    locationBox.appendChild(locText);
    viewModeContainer.appendChild(locationBox);
    
    // Booking button in modal
    let bookBtn: HTMLAnchorElement | null = null;
    if (this.activity.reservaLink) {
      bookBtn = document.createElement('a');
      bookBtn.href = this.activity.reservaLink;
      bookBtn.target = '_blank';
      bookBtn.rel = 'noopener noreferrer';
      bookBtn.className = 'activity-booking-link';
      bookBtn.style.alignSelf = 'flex-start';
      bookBtn.style.display = 'inline-block';
      bookBtn.style.marginBottom = '12px';
      bookBtn.textContent = isEn ? 'Book Tickets 🎟️' : 'Reservar Entradas 🎟️';
      viewModeContainer.appendChild(bookBtn);
    }

    // EDIT MODE CONTAINER (hidden by default)
    const editModeContainer = document.createElement('div');
    editModeContainer.className = 'activity-modal-edit-mode';
    editModeContainer.style.display = 'none';
    editModeContainer.style.flexDirection = 'column';
    editModeContainer.style.gap = '12px';

    // Edit inputs
    const timeLbl = document.createElement('div');
    timeLbl.style.fontWeight = '700';
    timeLbl.style.color = 'var(--primary-color)';
    timeLbl.textContent = isEn ? 'Time:' : 'Hora:';
    const editTime = document.createElement('input');
    editTime.type = 'text';
    editTime.className = 'activity-edit-input';
    editTime.value = this.activity.hora;

    const titleLbl = document.createElement('div');
    titleLbl.style.fontWeight = '700';
    titleLbl.style.color = 'var(--primary-color)';
    titleLbl.textContent = isEn ? 'Activity Name:' : 'Nombre de la Actividad:';
    const editTitle = document.createElement('input');
    editTitle.type = 'text';
    editTitle.className = 'activity-edit-input';
    editTitle.value = this.activity.titulo;

    const locLbl = document.createElement('div');
    locLbl.style.fontWeight = '700';
    locLbl.style.color = 'var(--primary-color)';
    locLbl.textContent = isEn ? 'Location:' : 'Lugar:';
    const editLoc = document.createElement('input');
    editLoc.type = 'text';
    editLoc.className = 'activity-edit-input';
    editLoc.value = this.activity.url || '';

    const descLbl = document.createElement('div');
    descLbl.style.fontWeight = '700';
    descLbl.style.color = 'var(--primary-color)';
    descLbl.textContent = isEn ? 'Description:' : 'Descripción:';
    const editDesc = document.createElement('textarea');
    editDesc.className = 'activity-edit-textarea';
    editDesc.value = this.activity.descripcion || '';

    const linkLbl = document.createElement('div');
    linkLbl.style.fontWeight = '700';
    linkLbl.style.color = 'var(--primary-color)';
    linkLbl.textContent = isEn ? 'Booking Link (optional):' : 'Enlace de Reserva (opcional):';
    const editLink = document.createElement('input');
    editLink.type = 'text';
    editLink.className = 'activity-edit-input';
    editLink.value = this.activity.reservaLink || '';

    // Action buttons inside edit mode
    const editActions = document.createElement('div');
    editActions.style.display = 'flex';
    editActions.style.gap = '10px';
    editActions.style.marginTop = '8px';

    const saveChangesBtn = document.createElement('button');
    saveChangesBtn.className = 'activity-notes-save-btn';
    saveChangesBtn.textContent = isEn ? 'Save Changes' : 'Guardar Cambios';

    const cancelChangesBtn = document.createElement('button');
    cancelChangesBtn.className = 'activity-notes-save-btn';
    cancelChangesBtn.style.backgroundColor = 'var(--text-secondary)';
    cancelChangesBtn.textContent = isEn ? 'Cancel' : 'Cancelar';

    editActions.appendChild(saveChangesBtn);
    editActions.appendChild(cancelChangesBtn);

    editModeContainer.appendChild(timeLbl);
    editModeContainer.appendChild(editTime);
    editModeContainer.appendChild(titleLbl);
    editModeContainer.appendChild(editTitle);
    editModeContainer.appendChild(locLbl);
    editModeContainer.appendChild(editLoc);
    editModeContainer.appendChild(descLbl);
    editModeContainer.appendChild(editDesc);
    editModeContainer.appendChild(linkLbl);
    editModeContainer.appendChild(editLink);
    editModeContainer.appendChild(editActions);

    // Toggle behavior
    editBtn.addEventListener('click', () => {
      viewModeContainer.style.display = 'none';
      editModeContainer.style.display = 'flex';
      this.isEditing = true;
    });

    cancelChangesBtn.addEventListener('click', () => {
      // Prompt warning if changes were made before canceling
      const hasChanges = 
        editTime.value.trim() !== this.activity.hora ||
        editTitle.value.trim() !== this.activity.titulo ||
        editLoc.value.trim() !== (this.activity.url || '') ||
        editDesc.value.trim() !== (this.activity.descripcion || '') ||
        editLink.value.trim() !== (this.activity.reservaLink || '');

      const proceedCancel = () => {
        viewModeContainer.style.display = 'block';
        editModeContainer.style.display = 'none';
        this.isEditing = false;
        // Revert fields
        editTime.value = this.activity.hora;
        editTitle.value = this.activity.titulo;
        editLoc.value = this.activity.url || '';
        editDesc.value = this.activity.descripcion || '';
        editLink.value = this.activity.reservaLink || '';
      };

      if (hasChanges) {
        this.openUnsavedWarningModal(proceedCancel);
      } else {
        proceedCancel();
      }
    });

    saveChangesBtn.addEventListener('click', async () => {
      const newTitle = editTitle.value.trim();
      if (!newTitle) {
        alert(isEn ? 'Please enter a name for the activity' : 'Por favor ingresa un nombre para la actividad');
        return;
      }

      saveChangesBtn.disabled = true;
      saveChangesBtn.textContent = 'Guardando...';

      // Update internal state
      const updateData = {
        hora: editTime.value.trim() || '10:00:00',
        titulo: newTitle,
        url: editLoc.value.trim() || null,
        descripcion: editDesc.value.trim() || null,
        reservaLink: editLink.value.trim() || null
      };

      if (this.activity.id_actividad) {
        const success = await updateActividad(this.activity.id_actividad, updateData);
        if (!success) {
          alert('Error updating activity in Supabase.');
          saveChangesBtn.disabled = false;
          saveChangesBtn.textContent = isEn ? 'Save Changes' : 'Guardar Cambios';
          return;
        }
      }

      this.activity.hora = updateData.hora;
      this.activity.titulo = updateData.titulo;
      this.activity.url = updateData.url;
      this.activity.descripcion = updateData.descripcion;
      this.activity.reservaLink = updateData.reservaLink;

      // Update modal view elements
      timeSpan.textContent = this.activity.hora.substring(0, 5);
      title.textContent = this.activity.titulo;
      desc.textContent = this.activity.descripcion || '';
      locText.innerHTML = `📍 <strong>${this.activity.url || 'Sin ubicación'}</strong>`;

      if (this.activity.reservaLink) {
        if (bookBtn) {
          bookBtn.href = this.activity.reservaLink;
          bookBtn.style.display = 'inline-block';
        } else {
          bookBtn = document.createElement('a');
          bookBtn.href = this.activity.reservaLink;
          bookBtn.target = '_blank';
          bookBtn.rel = 'noopener noreferrer';
          bookBtn.className = 'activity-booking-link';
          bookBtn.style.alignSelf = 'flex-start';
          bookBtn.style.display = 'inline-block';
          bookBtn.style.marginBottom = '12px';
          bookBtn.textContent = isEn ? 'Book Tickets 🎟️' : 'Reservar Entradas 🎟️';
          viewModeContainer.insertBefore(bookBtn, locationBox.nextSibling);
        }
      } else {
        if (bookBtn) {
          bookBtn.style.display = 'none';
        }
      }

      // Trigger callback to update website state
      if (this.onUpdateActivity) {
        this.onUpdateActivity(this.activity);
      }

      // Toggle views back
      viewModeContainer.style.display = 'block';
      editModeContainer.style.display = 'none';
      this.isEditing = false;
      saveChangesBtn.disabled = false;
      saveChangesBtn.textContent = isEn ? 'Save Changes' : 'Guardar Cambios';
    });

    modal.appendChild(closeBtn);
    
    // Scroll Container
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'activity-modal-scroll-container';
    
    scrollContainer.appendChild(viewModeContainer);
    scrollContainer.appendChild(editModeContainer);
    
    // Notes Section
    const notesContainer = document.createElement('div');
    notesContainer.className = 'activity-modal-notes';
    
    const notesTitle = document.createElement('h4');
    notesTitle.textContent = isEn ? 'Notes 📝' : 'Notas 📝';
    
    const notesTextarea = document.createElement('textarea');
    notesTextarea.className = 'activity-notes-textarea';
    notesTextarea.placeholder = isEn ? 'Write here your notes, checklist, booking references...' : 'Escribe aquí tus anotaciones, lista de cosas a llevar, referencias...';
    
    // Load note from database
    if (this.activity.notas) {
      notesTextarea.value = this.activity.notas;
    }
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'activity-notes-save-btn';
    saveBtn.textContent = isEn ? 'Save' : 'Guardar';
    
    const statusMsg = document.createElement('span');
    statusMsg.className = 'activity-notes-saved-status';
    statusMsg.textContent = isEn ? 'Saved! ✅' : '¡Nota guardada! ✅';
    
    saveBtn.addEventListener('click', async () => {
      const newNotes = notesTextarea.value.trim();
      if (this.activity.id_actividad) {
        saveBtn.disabled = true;
        const success = await updateActividad(this.activity.id_actividad, { notas: newNotes || null });
        if (success) {
          this.activity.notas = newNotes || null;
          statusMsg.classList.add('show');
          setTimeout(() => {
            statusMsg.classList.remove('show');
          }, 2000);
          this.updateNoteIndicator(contentEl, title);
        } else {
          alert('Error saving note in Supabase');
        }
        saveBtn.disabled = false;
      }
    });
    
    notesContainer.appendChild(notesTitle);
    notesContainer.appendChild(notesTextarea);
    notesContainer.appendChild(saveBtn);
    notesContainer.appendChild(statusMsg);
    
    scrollContainer.appendChild(notesContainer);
    modal.appendChild(scrollContainer);
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  private openUnsavedWarningModal(onConfirmDiscard: () => void): void {
    const isEn = localStorage.getItem('app-lang') === 'en';
    
    const confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'confirm-modal-overlay';
    
    const confirmModal = document.createElement('div');
    confirmModal.className = 'confirm-modal';
    confirmModal.style.borderTopColor = '#e67e22'; 
    
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
    
    const title = document.createElement('h4');
    title.className = 'confirm-modal-title';
    title.textContent = isEn ? 'Unsaved Changes' : 'Cambios no guardados';
    confirmModal.appendChild(title);
    
    const desc = document.createElement('p');
    desc.className = 'confirm-modal-desc';
    desc.textContent = isEn 
      ? 'Are you sure you want to leave? Your changes will not be saved.'
      : '¿Estás seguro de que deseas salir? Los cambios realizados no se guardarán.';
    confirmModal.appendChild(desc);
    
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

  private openDeleteConfirmModal(detailOverlay: HTMLElement): void {
    const isEn = localStorage.getItem('app-lang') === 'en';
    
    const confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'confirm-modal-overlay';
    
    const confirmModal = document.createElement('div');
    confirmModal.className = 'confirm-modal';
    
    const warningIcon = document.createElement('div');
    warningIcon.className = 'confirm-modal-icon';
    warningIcon.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `;
    confirmModal.appendChild(warningIcon);
    
    const title = document.createElement('h4');
    title.className = 'confirm-modal-title';
    title.textContent = isEn ? 'Confirm Deletion' : 'Confirmar eliminación';
    confirmModal.appendChild(title);
    
    const desc = document.createElement('p');
    desc.className = 'confirm-modal-desc';
    desc.textContent = isEn 
      ? 'Are you sure you want to delete this activity? This action cannot be undone.'
      : '¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.';
    confirmModal.appendChild(desc);
    
    const actions = document.createElement('div');
    actions.className = 'confirm-modal-actions';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'confirm-modal-btn confirm-modal-btn-cancel';
    cancelBtn.textContent = isEn ? 'Cancel' : 'Cancelar';
    cancelBtn.addEventListener('click', () => {
      confirmOverlay.remove();
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'confirm-modal-btn confirm-modal-btn-delete';
    deleteBtn.textContent = isEn ? 'Delete' : 'Eliminar';
    deleteBtn.addEventListener('click', async () => {
      if (this.activity.id_actividad) {
        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Borrando...';
        const success = await deleteActividad(this.activity.id_actividad);
        if (!success) {
          alert('Error deleting activity in Supabase');
          deleteBtn.disabled = false;
          deleteBtn.textContent = isEn ? 'Delete' : 'Eliminar';
          return;
        }
      }

      confirmOverlay.remove();
      detailOverlay.remove();
      if (this.onDeleteActivity) {
        this.onDeleteActivity();
      }
    });
    
    actions.appendChild(cancelBtn);
    actions.appendChild(deleteBtn);
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
