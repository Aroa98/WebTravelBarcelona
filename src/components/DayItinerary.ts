import { ActivityCard, type Activity } from './ActivityCard.js';
import { createActividad, translateText, updateDiaViaje, getAlojamientos, createAlojamiento } from '../database/supabaseClient.js';
import { t } from '../i18n/index.js';
import { showMessage, showConfirm } from '../utils/ui.js';

export interface Alojamiento {
  id_alojamiento: number;
  nombre: string;
  url?: string | null;
  direccion?: string | null;
}

export interface Day {
  id_dia: number;
  fecha: string;
  descripcion: string; // Aliased from DB
  alojamiento?: Alojamiento | null;
  actividadDia: Activity[];
}

export class DayItinerary {
  private day: Day;
  private onDaySelect: ((dayId: number) => void) | undefined;
  private onUpdateDay: ((updatedDay: Day) => void) | undefined;
  private accomChipEl!: HTMLElement;

  constructor(day: Day, onDaySelect?: (dayId: number) => void, onUpdateDay?: (updatedDay: Day) => void) {
    this.day = day;
    this.onDaySelect = onDaySelect;
    this.onUpdateDay = onUpdateDay;
  }

  public render(): HTMLElement {
    const daySection = document.createElement('section');
    daySection.className = 'day-section';
    daySection.id = `day-${this.day.id_dia}`;

    const dayDesc = this.day.descripcion;

    const isWedding = this.day.id_dia === 10 || 
                      (dayDesc && dayDesc.toLowerCase().includes('boda')) || 
                      (dayDesc && dayDesc.toLowerCase().includes('wedding'));
    if (isWedding) {
      daySection.classList.add('wedding-theme');
    }

    const header = document.createElement('div');
    header.className = 'day-header clickable-day';
    header.title = t('clickToFocusDay');
    header.addEventListener('click', () => {
      if (this.onDaySelect) this.onDaySelect(this.day.id_dia);
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
    title.id = `day-title-${this.day.id_dia}`;
    title.textContent = dayDesc;

    const editDescBtn = document.createElement('button');
    editDescBtn.className = 'day-desc-edit-btn';
    editDescBtn.title = t('editDayDescTooltip');
    editDescBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    `;
    editDescBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openEditDayDescModal(title);
    });

    headerLeft.appendChild(dateBadge);
    headerLeft.appendChild(title);
    headerLeft.appendChild(editDescBtn);
    header.appendChild(headerLeft);

    const addPlanBtn = document.createElement('button');
    addPlanBtn.className = 'day-add-plan-btn';
    addPlanBtn.innerHTML = `
      <svg class="action-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    `;
    addPlanBtn.title = t('addCustomPlan');
    addPlanBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openAddPlanModal();
    });
    header.appendChild(addPlanBtn);
    daySection.appendChild(header);

    // Accommodation chip row
    const accomRow = this.buildAlojamientoRow();
    daySection.appendChild(accomRow);

    const timeline = document.createElement('div');
    timeline.className = 'day-timeline';

    if (this.day.actividadDia && this.day.actividadDia.length > 0) {
      this.day.actividadDia.forEach((activity, idx) => {
        const activityCard = new ActivityCard(activity, this.day.id_dia, 
          (updatedActivity) => {
            this.day.actividadDia[idx] = updatedActivity;
            this.day.actividadDia.sort((a, b) => a.hora.localeCompare(b.hora));
            if (this.onUpdateDay) this.onUpdateDay(this.day);
          }, 
          () => {
            this.day.actividadDia.splice(idx, 1);
            if (this.onUpdateDay) this.onUpdateDay(this.day);
          },
          (time: string, currentActivityId: number) => {
            return this.day.actividadDia.some(a => a.hora === time && a.id_actividad !== currentActivityId);
          }
        );
        timeline.appendChild(activityCard.render());
      });
    } else {
      const emptyState = document.createElement('p');
      emptyState.className = 'timeline-empty';
      emptyState.textContent = t('emptyDayTimeline');
      timeline.appendChild(emptyState);
    }

    daySection.appendChild(timeline);
    return daySection;
  }

  private buildAlojamientoRow(): HTMLElement {
    const row = document.createElement('div');
    row.className = 'accommodation-row';

    this.accomChipEl = document.createElement('div');
    this.accomChipEl.className = 'accommodation-chip' + (this.day.alojamiento ? '' : ' empty');
    this.renderChipContent();
    row.appendChild(this.accomChipEl);
    return row;
  }

  private renderChipContent(): void {
    this.accomChipEl.innerHTML = '';
    this.accomChipEl.className = 'accommodation-chip' + (this.day.alojamiento ? '' : ' empty');

    if (this.day.alojamiento) {
      const icon = document.createElement('span');
      icon.className = 'accommodation-icon';
      icon.textContent = '🏨';

      const name = document.createElement('span');
      name.className = 'accommodation-name';
      name.textContent = this.day.alojamiento.nombre;
      if (this.day.alojamiento.url) {
        name.classList.add('clickable');
        name.title = this.day.alojamiento.url;
        name.addEventListener('click', (e) => {
          e.stopPropagation();
          window.open(this.day.alojamiento!.url!, '_blank');
        });
      }

      const editBtn = document.createElement('button');
      editBtn.className = 'accommodation-edit-btn';
      editBtn.title = t('editAlojamiento');
      editBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openAlojamientoModal(editBtn);
      });

      this.accomChipEl.appendChild(icon);
      this.accomChipEl.appendChild(name);
      this.accomChipEl.appendChild(editBtn);
    } else {
      const addBtn = document.createElement('button');
      addBtn.className = 'accommodation-add-btn';
      addBtn.textContent = '+ ' + t('addAlojamiento');
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openAlojamientoModal(addBtn);
      });
      this.accomChipEl.appendChild(addBtn);
    }
  }

  private async openAlojamientoModal(triggerBtn: HTMLElement): Promise<void> {
    // Show loading state on trigger
    const originalContent = triggerBtn.innerHTML;
    triggerBtn.setAttribute('disabled', 'true');
    triggerBtn.style.opacity = '0.5';

    const allAlojamientos = await getAlojamientos();

    triggerBtn.removeAttribute('disabled');
    triggerBtn.style.opacity = '';
    triggerBtn.innerHTML = originalContent;

    // --- Build Modal ---
    const overlay = document.createElement('div');
    overlay.className = 'activity-modal-overlay';
    document.body.style.overflow = 'hidden';

    const modal = document.createElement('div');
    modal.className = 'activity-modal';

    const washiTape = document.createElement('div');
    washiTape.className = 'activity-modal-washi-tape';
    modal.appendChild(washiTape);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'activity-modal-close';
    closeBtn.innerHTML = '&times;';

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'activity-modal-scroll-container';

    // Modal title
    const modalTitleEl = document.createElement('h3');
    modalTitleEl.style.fontFamily = "'Playfair Display', Georgia, serif";
    modalTitleEl.style.fontSize = '1.4rem';
    modalTitleEl.style.color = 'var(--primary-color)';
    modalTitleEl.style.marginBottom = '20px';
    modalTitleEl.textContent = t('alojamientoModalTitle');
    scrollContainer.appendChild(modalTitleEl);

    // --- TABS ---
    const tabsEl = document.createElement('div');
    tabsEl.className = 'aloj-tabs';

    const tabSelectBtn = document.createElement('button');
    tabSelectBtn.className = 'aloj-tab-btn active';
    tabSelectBtn.textContent = t('alojamientoSelectTab');

    const tabCreateBtn = document.createElement('button');
    tabCreateBtn.className = 'aloj-tab-btn';
    tabCreateBtn.textContent = t('alojamientoCreateTab');

    tabsEl.appendChild(tabSelectBtn);
    tabsEl.appendChild(tabCreateBtn);
    scrollContainer.appendChild(tabsEl);

    // --- PANEL 1: Select existing ---
    const panelSelect = document.createElement('div');

    const selectLbl = document.createElement('div');
    selectLbl.style.fontWeight = '700';
    selectLbl.style.color = 'var(--primary-color)';
    selectLbl.style.marginBottom = '6px';
    selectLbl.style.fontSize = '0.95rem';
    selectLbl.textContent = t('alojamientoSelectLabel');
    panelSelect.appendChild(selectLbl);

    const selectEl = document.createElement('select');
    selectEl.className = 'day-select-filter';
    selectEl.style.width = '100%';
    selectEl.style.marginBottom = '0';
    selectEl.style.fontSize = '1rem';

    const noneOpt = document.createElement('option');
    noneOpt.value = '0';
    noneOpt.textContent = t('alojamientoNoneOption');
    selectEl.appendChild(noneOpt);

    allAlojamientos.forEach((a) => {
      const opt = document.createElement('option');
      opt.value = String(a.id_alojamiento);
      opt.textContent = a.nombre;
      selectEl.appendChild(opt);
    });

    // Pre-select current
    if (this.day.alojamiento) {
      selectEl.value = String(this.day.alojamiento.id_alojamiento);
    }

    panelSelect.appendChild(selectEl);

    // Details hint
    const detailsHint = document.createElement('div');
    detailsHint.className = 'aloj-details-hint';
    panelSelect.appendChild(detailsHint);

    const updateHint = () => {
      const selectedId = parseInt(selectEl.value);
      if (selectedId === 0) {
        detailsHint.classList.remove('visible');
        return;
      }
      const found = allAlojamientos.find(a => a.id_alojamiento === selectedId);
      if (found) {
        let html = '';
        if (found.direccion) html += `📍 ${found.direccion}<br>`;
        if (found.url) html += `🔗 <a href="${found.url}" target="_blank" style="color:var(--barcelona-blue)">${found.url}</a>`;
        detailsHint.innerHTML = html || '';
        detailsHint.classList.toggle('visible', html.length > 0);
      } else {
        detailsHint.classList.remove('visible');
      }
    };
    selectEl.addEventListener('change', updateHint);
    updateHint();

    // Link button
    const linkBtn = document.createElement('button');
    linkBtn.className = 'activity-notes-save-btn';
    linkBtn.style.marginTop = '16px';
    linkBtn.textContent = t('alojamientoLinkBtn');
    panelSelect.appendChild(linkBtn);
    scrollContainer.appendChild(panelSelect);

    // --- PANEL 2: Create new ---
    const panelCreate = document.createElement('div');
    panelCreate.style.display = 'none';

    const createField = (labelText: string, placeholder: string, type = 'text') => {
      const lbl = document.createElement('div');
      lbl.style.fontWeight = '700';
      lbl.style.color = 'var(--primary-color)';
      lbl.style.marginBottom = '4px';
      lbl.style.fontSize = '0.95rem';
      lbl.textContent = labelText;

      const inp = document.createElement('input');
      inp.type = type;
      inp.className = 'activity-edit-input';
      inp.placeholder = placeholder;
      inp.style.marginBottom = '14px';
      inp.style.width = '100%';

      panelCreate.appendChild(lbl);
      panelCreate.appendChild(inp);
      return inp;
    };

    const nameInput = createField(t('alojamientoNameLabel'), t('alojamientoNamePlaceholder'));
    const urlInput  = createField(t('alojamientoUrlLabel'), t('alojamientoUrlPlaceholder'), 'url');
    const addrInput = createField(t('alojamientoAddressLabel'), t('alojamientoAddressPlaceholder'));

    const createBtn = document.createElement('button');
    createBtn.className = 'activity-notes-save-btn';
    createBtn.textContent = t('alojamientoCreateBtn');
    panelCreate.appendChild(createBtn);
    scrollContainer.appendChild(panelCreate);

    // --- Tab switching ---
    const switchTab = (showSelect: boolean) => {
      tabSelectBtn.classList.toggle('active', showSelect);
      tabCreateBtn.classList.toggle('active', !showSelect);
      panelSelect.style.display = showSelect ? 'block' : 'none';
      panelCreate.style.display = showSelect ? 'none' : 'block';
    };
    tabSelectBtn.addEventListener('click', () => switchTab(true));
    tabCreateBtn.addEventListener('click', () => switchTab(false));

    // --- Close helpers ---
    const closeModal = () => { overlay.remove(); document.body.style.overflow = ''; };
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    // --- Link existing handler ---
    linkBtn.addEventListener('click', async () => {
      const selectedId = parseInt(selectEl.value);
      linkBtn.disabled = true;
      linkBtn.textContent = t('alojamientoSavingBtn');

      const payload = selectedId === 0
        ? { id_alojamiento: null }
        : { id_alojamiento: selectedId };

      const success = await updateDiaViaje(this.day.id_dia, payload);
      if (success) {
        this.day.alojamiento = selectedId === 0
          ? null
          : (allAlojamientos.find(a => a.id_alojamiento === selectedId) || null);
        this.renderChipContent();
        if (this.onUpdateDay) this.onUpdateDay(this.day);
        closeModal();
      } else {
        showMessage('Error', t('errorAlojamientoSave'));
        linkBtn.disabled = false;
        linkBtn.textContent = t('alojamientoLinkBtn');
      }
    });

    // --- Create new + link handler ---
    createBtn.addEventListener('click', async () => {
      const nombre = nameInput.value.trim();
      if (!nombre) {
        showMessage('Error', t('errorAlojamientoName'));
        return;
      }

      createBtn.disabled = true;
      createBtn.textContent = t('alojamientoSavingBtn');

      const newAloj = await createAlojamiento({
        nombre,
        url: urlInput.value.trim() || null,
        direccion: addrInput.value.trim() || null
      });

      if (!newAloj) {
        showMessage('Error', t('errorAlojamientoSave'));
        createBtn.disabled = false;
        createBtn.textContent = t('alojamientoCreateBtn');
        return;
      }

      const linked = await updateDiaViaje(this.day.id_dia, { id_alojamiento: newAloj.id_alojamiento });
      if (linked) {
        this.day.alojamiento = newAloj;
        this.renderChipContent();
        if (this.onUpdateDay) this.onUpdateDay(this.day);
        closeModal();
      } else {
        showMessage('Error', t('errorAlojamientoSave'));
        createBtn.disabled = false;
        createBtn.textContent = t('alojamientoCreateBtn');
      }
    });

    modal.appendChild(closeBtn);
    modal.appendChild(scrollContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  private openAddPlanModal(): void {
    const overlay = document.createElement('div');
    overlay.className = 'activity-modal-overlay';
    document.body.style.overflow = 'hidden';
    
    const modal = document.createElement('div');
    modal.className = 'activity-modal';

    const washiTape = document.createElement('div');
    washiTape.className = 'activity-modal-washi-tape';
    modal.appendChild(washiTape);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'activity-modal-close';
    closeBtn.innerHTML = '&times;';
    
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'activity-modal-scroll-container';

    const fieldsContainer = document.createElement('div');
    fieldsContainer.style.display = 'flex';
    fieldsContainer.style.flexDirection = 'column';
    fieldsContainer.style.gap = '12px';

    const createField = (label: string, isTextarea = false, placeholder = '', defaultValue = '') => {
      const lbl = document.createElement('div');
      lbl.style.fontWeight = '700';
      lbl.style.marginBottom = '2px';
      lbl.style.color = 'var(--primary-color)';
      lbl.textContent = label;
      
      const input = document.createElement(isTextarea ? 'textarea' : 'input') as HTMLInputElement | HTMLTextAreaElement;
      input.className = isTextarea ? 'activity-edit-textarea' : 'activity-edit-input';
      if (!isTextarea) (input as HTMLInputElement).type = 'text';
      if (placeholder) input.placeholder = placeholder;
      if (defaultValue) input.value = defaultValue;
      input.style.marginBottom = '6px';
      
      fieldsContainer.appendChild(lbl);
      fieldsContainer.appendChild(input);
      return input;
    };

    const createTimeSelect = (label: string, defaultValue = '10:00:00') => {
      const lbl = document.createElement('div');
      lbl.style.fontWeight = '700';
      lbl.style.marginBottom = '2px';
      lbl.style.color = 'var(--primary-color)';
      lbl.textContent = label;
      
      const input = document.createElement('input');
      input.type = 'time';
      input.className = 'activity-edit-input';
      input.style.marginBottom = '6px';
      input.style.cursor = 'pointer';
      
      // Native time input uses HH:mm
      input.value = defaultValue.length >= 5 ? defaultValue.substring(0, 5) : '10:00';
      
      fieldsContainer.appendChild(lbl);
      fieldsContainer.appendChild(input);
      return input;
    };

    const timeInput = createTimeSelect(t('modalTimeLabel'), '10:00:00') as HTMLInputElement;
    const titleInput = createField(t('modalActivityNameLabel'), false, t('modalActivityNamePlaceholder')) as HTMLInputElement;
    const locInput = createField(t('modalLocationLabel'), false, t('modalLocationPlaceholder')) as HTMLInputElement;
    const descTextarea = createField(t('modalDescriptionLabel'), true, t('modalDescriptionPlaceholder')) as HTMLTextAreaElement;
    const linkInput = createField(t('modalBookingLinkLabel') || 'Link Reserva', false, 'https://...') as HTMLInputElement;

    scrollContainer.appendChild(fieldsContainer);

    const notesTitle = document.createElement('h4');
    notesTitle.textContent = t('modalNotesTitle');
    const notesTextarea = document.createElement('textarea');
    notesTextarea.className = 'activity-notes-textarea';
    notesTextarea.placeholder = t('modalNotesPlaceholder');
    
    const notesContainer = document.createElement('div');
    notesContainer.className = 'activity-modal-notes';
    notesContainer.appendChild(notesTitle);
    notesContainer.appendChild(notesTextarea);
    scrollContainer.appendChild(notesContainer);
    
    const actionsWrapper = document.createElement('div');
    actionsWrapper.style.marginTop = '20px';
    actionsWrapper.style.display = 'flex';
    actionsWrapper.style.gap = '10px';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'activity-notes-save-btn';
    saveBtn.textContent = t('createPlanBtn');
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'activity-notes-save-btn';
    cancelBtn.style.backgroundColor = 'var(--text-secondary)';
    cancelBtn.textContent = t('cancelBtn') || 'Cancel';
    
    cancelBtn.addEventListener('click', () => {
      if (hasChanges()) {
        showConfirm({
          title: t('unsavedChangesTitle') || 'Cambios no guardados',
          message: t('unsavedChangesDesc') || '¿Seguro que quieres salir?',
          confirmText: t('discardLeaveBtn') || 'Salir',
          cancelText: t('keepEditingBtn') || 'Seguir',
          confirmColor: '#e74c3c',
          onConfirm: () => {
            overlay.remove();
            document.body.style.overflow = '';
          }
        });
      } else {
        overlay.remove();
        document.body.style.overflow = '';
      }
    });
    
    saveBtn.addEventListener('click', async () => {
      const newTitle = titleInput.value.trim();
      const newTime = timeInput.value ? (timeInput.value.length === 5 ? timeInput.value + ':00' : timeInput.value) : '10:00:00';

      if (!newTitle) {
        showMessage('Error', t('errorEmptyName'));
        return;
      }
      
      if (this.day.actividadDia && this.day.actividadDia.some(a => a.hora === newTime)) {
        showMessage('Error', t('errorTimeOccupied'));
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = t('savingBtn');

      const sourceLang = (localStorage.getItem('app-lang') || 'es') as 'es' | 'en';
      const targetLang = sourceLang === 'es' ? 'en' : 'es';

      const descVal = descTextarea.value.trim() || null;
      const notesVal = notesTextarea.value.trim() || null;

      const [translatedTitle, translatedDesc, translatedNotes] = await Promise.all([
        translateText(newTitle, targetLang),
        descVal ? translateText(descVal, targetLang) : Promise.resolve(null),
        notesVal ? translateText(notesVal, targetLang) : Promise.resolve(null)
      ]);
      
      const newActivityPayload = {
        id_dia: this.day.id_dia,
        hora: newTime,
        url: locInput.value.trim() || null,
        reservaLink: linkInput.value.trim() || null,
        
        titulo_es: sourceLang === 'es' ? newTitle : translatedTitle,
        titulo_en: sourceLang === 'en' ? newTitle : translatedTitle,
        
        descripcion_es: sourceLang === 'es' ? descVal : translatedDesc,
        descripcion_en: sourceLang === 'en' ? descVal : translatedDesc,
        
        notas_es: sourceLang === 'es' ? notesVal : translatedNotes,
        notas_en: sourceLang === 'en' ? notesVal : translatedNotes
      };

      const createdRecord = await createActividad(newActivityPayload);
      
      if (createdRecord) {
        // Remap the inserted fields so the frontend immediately works without refreshing
        createdRecord.titulo = newTitle;
        createdRecord.descripcion = descVal;
        createdRecord.notas = notesVal;

        if (!this.day.actividadDia) this.day.actividadDia = [];
        this.day.actividadDia.push(createdRecord);
        this.day.actividadDia.sort((a, b) => a.hora.localeCompare(b.hora));
        
        if (this.onUpdateDay) this.onUpdateDay(this.day);
        overlay.remove();
        document.body.style.overflow = '';
      } else {
        showMessage('Error', t('errorSupabaseCreate'));
        saveBtn.disabled = false;
        saveBtn.textContent = t('createPlanBtn');
      }
    });
    
    actionsWrapper.appendChild(saveBtn);
    actionsWrapper.appendChild(cancelBtn);
    scrollContainer.appendChild(actionsWrapper);

    const hasChanges = () => {
      const timeVal = timeInput.value ? (timeInput.value.length === 5 ? timeInput.value + ':00' : timeInput.value) : '10:00:00';
      return titleInput.value.trim() !== '' ||
             timeVal !== '10:00:00' ||
             locInput.value.trim() !== '' ||
             descTextarea.value.trim() !== '' ||
             linkInput.value.trim() !== '' ||
             notesTextarea.value.trim() !== '';
    };

    closeBtn.addEventListener('click', () => {
      if (hasChanges()) {
        showConfirm({
          title: t('unsavedChangesTitle') || 'Cambios no guardados',
          message: t('unsavedChangesDesc') || '¿Seguro que quieres salir?',
          confirmText: t('discardLeaveBtn') || 'Salir',
          cancelText: t('keepEditingBtn') || 'Seguir',
          confirmColor: '#e74c3c',
          onConfirm: () => {
            overlay.remove();
            document.body.style.overflow = '';
          }
        });
      } else {
        overlay.remove();
        document.body.style.overflow = '';
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        document.body.style.overflow = '';
      }
    });

    modal.appendChild(closeBtn);
    modal.appendChild(scrollContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  private openEditDayDescModal(titleEl: HTMLElement): void {
    const sourceLang = (localStorage.getItem('app-lang') || 'es') as 'es' | 'en';
    const targetLang: 'es' | 'en' = sourceLang === 'es' ? 'en' : 'es';

    const overlay = document.createElement('div');
    overlay.className = 'activity-modal-overlay';
    document.body.style.overflow = 'hidden';

    const modal = document.createElement('div');
    modal.className = 'activity-modal';

    const washiTape = document.createElement('div');
    washiTape.className = 'activity-modal-washi-tape';
    modal.appendChild(washiTape);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'activity-modal-close';
    closeBtn.innerHTML = '&times;';

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'activity-modal-scroll-container';

    // Title
    const modalHeader = document.createElement('div');
    modalHeader.className = 'activity-modal-header';
    const modalTitle = document.createElement('h3');
    modalTitle.style.fontFamily = "'Playfair Display', Georgia, serif";
    modalTitle.style.fontSize = '1.4rem';
    modalTitle.style.color = 'var(--primary-color)';
    modalTitle.style.marginBottom = '20px';
    modalTitle.textContent = t('editDayDescTitle');
    modalHeader.appendChild(modalTitle);
    scrollContainer.appendChild(modalHeader);

    // Label + input
    const lbl = document.createElement('div');
    lbl.style.fontWeight = '700';
    lbl.style.marginBottom = '6px';
    lbl.style.color = 'var(--primary-color)';
    lbl.style.fontSize = '0.95rem';
    lbl.textContent = t('editDayDescLabel');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'activity-edit-input';
    input.value = this.day.descripcion || '';
    input.placeholder = t('editDayDescPlaceholder');
    input.style.marginBottom = '20px';

    scrollContainer.appendChild(lbl);
    scrollContainer.appendChild(input);

    // Translation hint
    const hint = document.createElement('p');
    hint.style.fontSize = '0.85rem';
    hint.style.color = 'var(--text-secondary)';
    hint.style.marginBottom = '20px';
    hint.style.fontStyle = 'italic';
    hint.textContent = sourceLang === 'es'
      ? '💡 Se guardará en español y se traducirá automáticamente al inglés.'
      : '💡 Will be saved in English and auto-translated to Spanish.';
    scrollContainer.appendChild(hint);

    // Actions
    const actionsWrapper = document.createElement('div');
    actionsWrapper.style.display = 'flex';
    actionsWrapper.style.gap = '10px';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'activity-notes-save-btn';
    saveBtn.textContent = t('saveChangesBtn');

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'activity-notes-save-btn';
    cancelBtn.style.backgroundColor = 'var(--text-secondary)';
    cancelBtn.textContent = t('cancelBtn');

    const closeModal = () => {
      overlay.remove();
      document.body.style.overflow = '';
    };

    const tryClose = () => {
      const hasChanges = input.value.trim() !== (this.day.descripcion || '').trim();
      if (hasChanges) {
        showConfirm({
          title: t('unsavedChangesTitle'),
          message: t('unsavedChangesDesc'),
          confirmText: t('discardLeaveBtn'),
          cancelText: t('keepEditingBtn'),
          confirmColor: '#e74c3c',
          onConfirm: closeModal
        });
      } else {
        closeModal();
      }
    };

    cancelBtn.addEventListener('click', tryClose);
    closeBtn.addEventListener('click', tryClose);
    // Overlay (backdrop) click closes directly — confirm only on ✕ / Cancel button
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    saveBtn.addEventListener('click', async () => {
      const newValue = input.value.trim();
      if (!newValue) {
        showMessage('Error', sourceLang === 'es'
          ? 'La descripción no puede estar vacía.'
          : 'Description cannot be empty.');
        return;
      }

      saveBtn.disabled = true;
      cancelBtn.disabled = true;
      saveBtn.textContent = t('editDayDescSavingBtn');

      try {
        // Auto-translate to the other language
        const translatedValue = await translateText(newValue, targetLang);

        const payload = {
          descripcion_es: sourceLang === 'es' ? newValue : translatedValue,
          descripcion_en: sourceLang === 'en' ? newValue : translatedValue
        };

        const success = await updateDiaViaje(this.day.id_dia, payload);

        if (success) {
          // Update in-memory and DOM
          this.day.descripcion = newValue;
          titleEl.textContent = newValue;
          if (this.onUpdateDay) this.onUpdateDay(this.day);
          closeModal();
        } else {
          showMessage('Error', t('errorSupabaseDayUpdate'));
          saveBtn.disabled = false;
          cancelBtn.disabled = false;
          saveBtn.textContent = t('saveChangesBtn');
        }
      } catch {
        showMessage('Error', t('errorSupabaseDayUpdate'));
        saveBtn.disabled = false;
        cancelBtn.disabled = false;
        saveBtn.textContent = t('saveChangesBtn');
      }
    });

    actionsWrapper.appendChild(saveBtn);
    actionsWrapper.appendChild(cancelBtn);
    scrollContainer.appendChild(actionsWrapper);

    modal.appendChild(closeBtn);
    modal.appendChild(scrollContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Auto-focus the input
    setTimeout(() => input.focus(), 50);
  }

  private openUnsavedWarningModal(onConfirmDiscard: () => void): void {
    showConfirm({
      title: t('unsavedChangesTitle'),
      message: t('unsavedChangesDesc'),
      confirmText: t('discardLeaveBtn'),
      cancelText: t('keepEditingBtn'),
      confirmColor: '#e67e22',
      onConfirm: onConfirmDiscard
    });
  }
}
