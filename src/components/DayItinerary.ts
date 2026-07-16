import { ActivityCard, type Activity } from './ActivityCard.js';
import { createActividad, translateText } from '../database/supabaseClient.js';
import { t } from '../i18n/index.js';
import { showMessage, showConfirm } from '../utils/ui.js';

export interface Day {
  id_dia: number;
  fecha: string;
  descripcion: string; // Aliased from DB
  actividadDia: Activity[];
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
    title.textContent = dayDesc;

    headerLeft.appendChild(dateBadge);
    headerLeft.appendChild(title);
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
      
      scrollContainer.appendChild(lbl);
      scrollContainer.appendChild(input);
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
      
      scrollContainer.appendChild(lbl);
      scrollContainer.appendChild(input);
      return input;
    };

    const timeInput = createTimeSelect(t('modalTimeLabel'), '10:00:00') as HTMLInputElement;
    const titleInput = createField(t('modalActivityNameLabel'), false, t('modalActivityNamePlaceholder')) as HTMLInputElement;
    const descTextarea = createField(t('modalDescriptionLabel'), true, t('modalDescriptionPlaceholder')) as HTMLTextAreaElement;
    const locInput = createField(t('modalLocationLabel'), false, t('modalLocationPlaceholder')) as HTMLInputElement;
    const linkInput = createField(t('modalBookingLinkLabel'), false, 'https://...') as HTMLInputElement;

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
      }
    });

    modal.appendChild(closeBtn);
    modal.appendChild(scrollContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
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
