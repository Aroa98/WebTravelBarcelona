import { updateActividad, deleteActividad, translateText } from '../database/supabaseClient.js';
import { t } from '../i18n/index.js';
export class ActivityCard {
    activity;
    dayId;
    onUpdateActivity;
    onDeleteActivity;
    isEditing = false;
    // Elements kept as instance variables to avoid passing them deeply
    viewModeContainer;
    editModeContainer;
    timeSpan;
    titleEl;
    descEl;
    locText;
    bookBtn = null;
    overlay;
    constructor(activity, dayId, onUpdateActivity, onDeleteActivity) {
        this.activity = activity;
        this.dayId = dayId;
        this.onUpdateActivity = onUpdateActivity;
        this.onDeleteActivity = onDeleteActivity;
    }
    render() {
        const card = document.createElement('div');
        card.className = 'activity-card';
        const timeContainer = document.createElement('div');
        timeContainer.className = 'activity-time-container';
        const timeBadge = document.createElement('span');
        timeBadge.className = 'activity-time';
        timeBadge.textContent = this.activity.hora ? this.activity.hora.substring(0, 5) : '10:00';
        timeContainer.appendChild(timeBadge);
        const content = document.createElement('div');
        content.className = 'activity-content';
        content.style.cursor = 'pointer';
        content.title = t('clickToViewAddNotes');
        const title = document.createElement('h3');
        title.className = 'activity-title';
        title.textContent = this.activity.titulo;
        content.addEventListener('click', () => {
            this.openDetailModal(content, title);
        });
        const description = document.createElement('p');
        description.className = 'activity-description';
        description.textContent = this.activity.descripcion || '';
        const locationContainer = document.createElement('div');
        locationContainer.className = 'activity-location clickable-location';
        locationContainer.title = this.activity.reservaLink ? t('clickToBookTickets') : t('viewOnMaps');
        locationContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.activity.reservaLink) {
                window.open(this.activity.reservaLink, '_blank');
            }
            else if (this.activity.url) {
                const query = encodeURIComponent(this.activity.url);
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
            }
        });
        const pinSvg = this.createPinSvg();
        const locationText = document.createElement('span');
        locationText.className = 'location-text';
        locationText.textContent = this.activity.url || '';
        if (this.activity.url) {
            locationContainer.appendChild(pinSvg);
            locationContainer.appendChild(locationText);
            content.appendChild(title);
            content.appendChild(description);
            content.appendChild(locationContainer);
        }
        else {
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
            link.textContent = t('bookTicketsBtn');
            link.addEventListener('click', (e) => e.stopPropagation());
            linkContainer.appendChild(link);
            content.appendChild(linkContainer);
        }
        this.updateNoteIndicator(content, title);
        card.appendChild(timeContainer);
        card.appendChild(content);
        return card;
    }
    createPinSvg() {
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
        return pinSvg;
    }
    updateNoteIndicator(contentEl, titleEl) {
        const savedNote = this.activity.notas;
        let indicator = titleEl.querySelector('.activity-note-indicator');
        if (savedNote && savedNote.trim()) {
            if (!indicator) {
                indicator = document.createElement('span');
                indicator.className = 'activity-note-indicator';
                indicator.textContent = '📌';
                indicator.title = t('hasNotesTooltip');
                titleEl.appendChild(indicator);
            }
            contentEl.classList.add('has-notes');
        }
        else {
            if (indicator) {
                indicator.remove();
            }
            contentEl.classList.remove('has-notes');
        }
    }
    openDetailModal(contentEl, titleEl) {
        this.isEditing = false;
        this.overlay = document.createElement('div');
        this.overlay.className = 'activity-modal-overlay';
        const modal = document.createElement('div');
        modal.className = 'activity-modal';
        const washiTape = document.createElement('div');
        washiTape.className = 'activity-modal-washi-tape';
        modal.appendChild(washiTape);
        const closeBtn = document.createElement('button');
        closeBtn.className = 'activity-modal-close';
        closeBtn.innerHTML = '&times;';
        const handleCloseAttempt = () => {
            if (this.isEditing) {
                this.openUnsavedWarningModal(() => {
                    this.overlay.remove();
                    this.isEditing = false;
                    this.updateNoteIndicator(contentEl, titleEl);
                });
            }
            else {
                this.overlay.remove();
                this.updateNoteIndicator(contentEl, titleEl);
            }
        };
        closeBtn.addEventListener('click', handleCloseAttempt);
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay)
                handleCloseAttempt();
        });
        this.viewModeContainer = document.createElement('div');
        this.viewModeContainer.className = 'activity-modal-view-mode';
        this.editModeContainer = document.createElement('div');
        this.editModeContainer.className = 'activity-modal-edit-mode';
        this.editModeContainer.style.display = 'none';
        this.editModeContainer.style.flexDirection = 'column';
        this.editModeContainer.style.gap = '12px';
        this.buildViewMode();
        this.buildEditMode();
        modal.appendChild(closeBtn);
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'activity-modal-scroll-container';
        scrollContainer.appendChild(this.viewModeContainer);
        scrollContainer.appendChild(this.editModeContainer);
        this.buildNotesSection(scrollContainer, contentEl, titleEl);
        modal.appendChild(scrollContainer);
        this.overlay.appendChild(modal);
        document.body.appendChild(this.overlay);
    }
    buildViewMode() {
        const header = document.createElement('div');
        header.className = 'activity-modal-header';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'flex-start';
        const headerInfo = document.createElement('div');
        this.timeSpan = document.createElement('span');
        this.timeSpan.className = 'activity-modal-time';
        this.timeSpan.textContent = this.activity.hora ? this.activity.hora.substring(0, 5) : '';
        this.titleEl = document.createElement('h3');
        this.titleEl.className = 'activity-modal-title';
        this.titleEl.textContent = this.activity.titulo;
        headerInfo.appendChild(this.timeSpan);
        headerInfo.appendChild(this.titleEl);
        header.appendChild(headerInfo);
        const headerActions = document.createElement('div');
        headerActions.style.display = 'flex';
        headerActions.style.gap = '8px';
        const editBtn = document.createElement('button');
        editBtn.className = 'activity-modal-edit-btn';
        editBtn.innerHTML = `
      <svg class="action-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    `;
        editBtn.title = t('editActivityTooltip');
        editBtn.addEventListener('click', () => {
            this.viewModeContainer.style.display = 'none';
            this.editModeContainer.style.display = 'flex';
            this.isEditing = true;
        });
        headerActions.appendChild(editBtn);
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
        deleteBtn.title = t('deleteActivityTooltip');
        deleteBtn.addEventListener('click', () => {
            this.openDeleteConfirmModal(this.overlay);
        });
        headerActions.appendChild(deleteBtn);
        header.appendChild(headerActions);
        this.viewModeContainer.appendChild(header);
        this.descEl = document.createElement('p');
        this.descEl.className = 'activity-modal-desc';
        this.descEl.textContent = this.activity.descripcion || '';
        this.viewModeContainer.appendChild(this.descEl);
        const locationBox = document.createElement('div');
        locationBox.className = 'activity-modal-location-container';
        this.locText = document.createElement('span');
        this.locText.className = 'location-text clickable-location';
        this.locText.title = this.activity.reservaLink ? t('clickToBookTickets') : t('viewOnMaps');
        this.locText.innerHTML = `📍 <strong>${this.activity.url || t('noLocation')}</strong>`;
        this.locText.addEventListener('click', () => {
            if (this.activity.reservaLink) {
                window.open(this.activity.reservaLink, '_blank');
            }
            else if (this.activity.url) {
                const query = encodeURIComponent(this.activity.url);
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
            }
        });
        locationBox.appendChild(this.locText);
        this.viewModeContainer.appendChild(locationBox);
        if (this.activity.reservaLink) {
            this.bookBtn = document.createElement('a');
            this.bookBtn.href = this.activity.reservaLink;
            this.bookBtn.target = '_blank';
            this.bookBtn.rel = 'noopener noreferrer';
            this.bookBtn.className = 'activity-booking-link';
            this.bookBtn.style.alignSelf = 'flex-start';
            this.bookBtn.style.display = 'inline-block';
            this.bookBtn.style.marginBottom = '12px';
            this.bookBtn.textContent = t('bookTicketsBtn');
            this.viewModeContainer.appendChild(this.bookBtn);
        }
    }
    buildEditMode() {
        const createField = (label, initialValue, isTextarea = false) => {
            const lbl = document.createElement('div');
            lbl.style.fontWeight = '700';
            lbl.style.color = 'var(--primary-color)';
            lbl.textContent = label;
            const input = document.createElement(isTextarea ? 'textarea' : 'input');
            input.className = isTextarea ? 'activity-edit-textarea' : 'activity-edit-input';
            if (!isTextarea)
                input.type = 'text';
            input.value = initialValue;
            this.editModeContainer.appendChild(lbl);
            this.editModeContainer.appendChild(input);
            return input;
        };
        const editTime = createField(t('modalTimeLabel'), this.activity.hora);
        const editTitle = createField(t('modalActivityNameLabel'), this.activity.titulo);
        const editLoc = createField(t('modalLocationLabel'), this.activity.url || '');
        const editDesc = createField(t('modalDescriptionLabel'), this.activity.descripcion || '', true);
        const editLink = createField(t('modalBookingLinkLabel'), this.activity.reservaLink || '');
        const editActions = document.createElement('div');
        editActions.style.display = 'flex';
        editActions.style.gap = '10px';
        editActions.style.marginTop = '8px';
        const saveChangesBtn = document.createElement('button');
        saveChangesBtn.className = 'activity-notes-save-btn';
        saveChangesBtn.textContent = t('saveChangesBtn');
        const cancelChangesBtn = document.createElement('button');
        cancelChangesBtn.className = 'activity-notes-save-btn';
        cancelChangesBtn.style.backgroundColor = 'var(--text-secondary)';
        cancelChangesBtn.textContent = t('cancelBtn');
        editActions.appendChild(saveChangesBtn);
        editActions.appendChild(cancelChangesBtn);
        this.editModeContainer.appendChild(editActions);
        cancelChangesBtn.addEventListener('click', () => {
            const hasChanges = editTime.value.trim() !== this.activity.hora ||
                editTitle.value.trim() !== this.activity.titulo ||
                editLoc.value.trim() !== (this.activity.url || '') ||
                editDesc.value.trim() !== (this.activity.descripcion || '') ||
                editLink.value.trim() !== (this.activity.reservaLink || '');
            const proceedCancel = () => {
                this.viewModeContainer.style.display = 'block';
                this.editModeContainer.style.display = 'none';
                this.isEditing = false;
                editTime.value = this.activity.hora;
                editTitle.value = this.activity.titulo;
                editLoc.value = this.activity.url || '';
                editDesc.value = this.activity.descripcion || '';
                editLink.value = this.activity.reservaLink || '';
            };
            if (hasChanges) {
                this.openUnsavedWarningModal(proceedCancel);
            }
            else {
                proceedCancel();
            }
        });
        saveChangesBtn.addEventListener('click', async () => {
            const newTitle = editTitle.value.trim();
            if (!newTitle) {
                alert(t('errorEmptyName'));
                return;
            }
            saveChangesBtn.disabled = true;
            saveChangesBtn.textContent = t('savingBtn');
            const sourceLang = (localStorage.getItem('app-lang') || 'es');
            const targetLang = sourceLang === 'es' ? 'en' : 'es';
            // Auto-translate using the mock function
            const descVal = editDesc.value.trim() || null;
            const [translatedTitle, translatedDesc] = await Promise.all([
                translateText(newTitle, targetLang),
                descVal ? translateText(descVal, targetLang) : Promise.resolve(null)
            ]);
            const payloadToSave = {
                hora: editTime.value.trim() || '10:00:00',
                url: editLoc.value.trim() || null,
                reservaLink: editLink.value.trim() || null,
                titulo_es: sourceLang === 'es' ? newTitle : translatedTitle,
                titulo_en: sourceLang === 'en' ? newTitle : translatedTitle,
                descripcion_es: sourceLang === 'es' ? descVal : translatedDesc,
                descripcion_en: sourceLang === 'en' ? descVal : translatedDesc,
            };
            if (this.activity.id_actividad) {
                const success = await updateActividad(this.activity.id_actividad, payloadToSave);
                if (!success) {
                    alert(t('errorSupabaseUpdate'));
                    saveChangesBtn.disabled = false;
                    saveChangesBtn.textContent = t('saveChangesBtn');
                    return;
                }
            }
            // Update local state with the saved language value
            this.activity.hora = payloadToSave.hora;
            this.activity.titulo = newTitle;
            this.activity.url = payloadToSave.url;
            this.activity.descripcion = descVal;
            this.activity.reservaLink = payloadToSave.reservaLink;
            this.timeSpan.textContent = this.activity.hora.substring(0, 5);
            this.titleEl.textContent = this.activity.titulo;
            this.descEl.textContent = this.activity.descripcion || '';
            this.locText.innerHTML = `📍 <strong>${this.activity.url || t('noLocation')}</strong>`;
            if (this.activity.reservaLink) {
                if (this.bookBtn) {
                    this.bookBtn.href = this.activity.reservaLink;
                    this.bookBtn.style.display = 'inline-block';
                }
                else {
                    this.bookBtn = document.createElement('a');
                    this.bookBtn.href = this.activity.reservaLink;
                    this.bookBtn.target = '_blank';
                    this.bookBtn.rel = 'noopener noreferrer';
                    this.bookBtn.className = 'activity-booking-link';
                    this.bookBtn.style.alignSelf = 'flex-start';
                    this.bookBtn.style.display = 'inline-block';
                    this.bookBtn.style.marginBottom = '12px';
                    this.bookBtn.textContent = t('bookTicketsBtn');
                    this.viewModeContainer.insertBefore(this.bookBtn, this.locText.parentElement.nextSibling);
                }
            }
            else {
                if (this.bookBtn) {
                    this.bookBtn.style.display = 'none';
                }
            }
            if (this.onUpdateActivity) {
                this.onUpdateActivity(this.activity);
            }
            this.viewModeContainer.style.display = 'block';
            this.editModeContainer.style.display = 'none';
            this.isEditing = false;
            saveChangesBtn.disabled = false;
            saveChangesBtn.textContent = t('saveChangesBtn');
        });
    }
    buildNotesSection(scrollContainer, contentEl, titleEl) {
        const notesContainer = document.createElement('div');
        notesContainer.className = 'activity-modal-notes';
        const notesTitle = document.createElement('h4');
        notesTitle.textContent = t('modalNotesTitle');
        const notesTextarea = document.createElement('textarea');
        notesTextarea.className = 'activity-notes-textarea';
        notesTextarea.placeholder = t('modalNotesPlaceholder');
        if (this.activity.notas)
            notesTextarea.value = this.activity.notas;
        const saveBtn = document.createElement('button');
        saveBtn.className = 'activity-notes-save-btn';
        saveBtn.textContent = t('saveBtn');
        const statusMsg = document.createElement('span');
        statusMsg.className = 'activity-notes-saved-status';
        statusMsg.textContent = t('savedSuccessMsg');
        saveBtn.addEventListener('click', async () => {
            const newNotes = notesTextarea.value.trim() || null;
            if (this.activity.id_actividad) {
                saveBtn.disabled = true;
                const sourceLang = (localStorage.getItem('app-lang') || 'es');
                const targetLang = sourceLang === 'es' ? 'en' : 'es';
                const translatedNotes = newNotes ? await translateText(newNotes, targetLang) : null;
                const payloadToSave = {
                    notas_es: sourceLang === 'es' ? newNotes : translatedNotes,
                    notas_en: sourceLang === 'en' ? newNotes : translatedNotes
                };
                const success = await updateActividad(this.activity.id_actividad, payloadToSave);
                if (success) {
                    this.activity.notas = newNotes;
                    statusMsg.classList.add('show');
                    setTimeout(() => statusMsg.classList.remove('show'), 2000);
                    this.updateNoteIndicator(contentEl, titleEl);
                }
                else {
                    alert(t('errorSupabaseNote'));
                }
                saveBtn.disabled = false;
            }
        });
        notesContainer.appendChild(notesTitle);
        notesContainer.appendChild(notesTextarea);
        notesContainer.appendChild(saveBtn);
        notesContainer.appendChild(statusMsg);
        scrollContainer.appendChild(notesContainer);
    }
    openUnsavedWarningModal(onConfirmDiscard) {
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
        title.textContent = t('unsavedChangesTitle');
        confirmModal.appendChild(title);
        const desc = document.createElement('p');
        desc.className = 'confirm-modal-desc';
        desc.textContent = t('unsavedChangesDesc');
        confirmModal.appendChild(desc);
        const actions = document.createElement('div');
        actions.className = 'confirm-modal-actions';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'confirm-modal-btn confirm-modal-btn-cancel';
        cancelBtn.textContent = t('keepEditingBtn');
        cancelBtn.addEventListener('click', () => confirmOverlay.remove());
        const discardBtn = document.createElement('button');
        discardBtn.className = 'confirm-modal-btn confirm-modal-btn-delete';
        discardBtn.style.backgroundColor = '#e67e22';
        discardBtn.textContent = t('discardLeaveBtn');
        discardBtn.addEventListener('click', () => {
            confirmOverlay.remove();
            onConfirmDiscard();
        });
        actions.appendChild(cancelBtn);
        actions.appendChild(discardBtn);
        confirmModal.appendChild(actions);
        confirmOverlay.appendChild(confirmModal);
        confirmOverlay.addEventListener('click', (e) => {
            if (e.target === confirmOverlay)
                confirmOverlay.remove();
        });
        document.body.appendChild(confirmOverlay);
    }
    openDeleteConfirmModal(detailOverlay) {
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
        title.textContent = t('confirmDeletionTitle');
        confirmModal.appendChild(title);
        const desc = document.createElement('p');
        desc.className = 'confirm-modal-desc';
        desc.textContent = t('confirmDeletionDesc');
        confirmModal.appendChild(desc);
        const actions = document.createElement('div');
        actions.className = 'confirm-modal-actions';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'confirm-modal-btn confirm-modal-btn-cancel';
        cancelBtn.textContent = t('cancelBtn');
        cancelBtn.addEventListener('click', () => confirmOverlay.remove());
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'confirm-modal-btn confirm-modal-btn-delete';
        deleteBtn.textContent = t('deleteBtn');
        deleteBtn.addEventListener('click', async () => {
            if (this.activity.id_actividad) {
                deleteBtn.disabled = true;
                deleteBtn.textContent = t('deletingBtn');
                const success = await deleteActividad(this.activity.id_actividad);
                if (!success) {
                    alert(t('errorSupabaseDelete'));
                    deleteBtn.disabled = false;
                    deleteBtn.textContent = t('deleteBtn');
                    return;
                }
            }
            confirmOverlay.remove();
            detailOverlay.remove();
            if (this.onDeleteActivity)
                this.onDeleteActivity();
        });
        actions.appendChild(cancelBtn);
        actions.appendChild(deleteBtn);
        confirmModal.appendChild(actions);
        confirmOverlay.appendChild(confirmModal);
        confirmOverlay.addEventListener('click', (e) => {
            if (e.target === confirmOverlay)
                confirmOverlay.remove();
        });
        document.body.appendChild(confirmOverlay);
    }
}
