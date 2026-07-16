export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string; // e.g. '#e74c3c' for delete, '#e67e22' for warning
  onConfirm: () => void;
  onCancel?: () => void;
}

export function showConfirm(options: ConfirmModalOptions): void {
  const confirmOverlay = document.createElement('div');
  confirmOverlay.className = 'confirm-modal-overlay';
  document.body.style.overflow = 'hidden';
  
  const confirmModal = document.createElement('div');
  confirmModal.className = 'confirm-modal';
  
  const color = options.confirmColor || '#e74c3c';
  confirmModal.style.borderTopColor = color;
  
  const warningIcon = document.createElement('div');
  warningIcon.className = 'confirm-modal-icon';
  warningIcon.style.color = color;
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
  title.textContent = options.title;
  confirmModal.appendChild(title);
  
  const desc = document.createElement('p');
  desc.className = 'confirm-modal-desc';
  desc.textContent = options.message;
  confirmModal.appendChild(desc);
  
  const actions = document.createElement('div');
  actions.className = 'confirm-modal-actions';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'confirm-modal-btn confirm-modal-btn-cancel';
  cancelBtn.textContent = options.cancelText || 'Cancel';
  cancelBtn.addEventListener('click', () => {
    confirmOverlay.remove();
    document.body.style.overflow = '';
    if (options.onCancel) options.onCancel();
  });
  
  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'confirm-modal-btn confirm-modal-btn-delete';
  confirmBtn.style.backgroundColor = color;
  confirmBtn.textContent = options.confirmText || 'Confirm';
  confirmBtn.addEventListener('click', () => {
    confirmOverlay.remove();
    document.body.style.overflow = '';
    options.onConfirm();
  });
  
  actions.appendChild(cancelBtn);
  actions.appendChild(confirmBtn);
  confirmModal.appendChild(actions);
  confirmOverlay.appendChild(confirmModal);
  
  confirmOverlay.addEventListener('click', (e) => {
    if (e.target === confirmOverlay) {
      confirmOverlay.remove();
      document.body.style.overflow = '';
      if (options.onCancel) options.onCancel();
    }
  });
  
  document.body.appendChild(confirmOverlay);
}

export function showMessage(title: string, message: string): void {
  const confirmOverlay = document.createElement('div');
  confirmOverlay.className = 'confirm-modal-overlay';
  document.body.style.overflow = 'hidden';
  
  const confirmModal = document.createElement('div');
  confirmModal.className = 'confirm-modal';
  confirmModal.style.borderTopColor = '#f39c12'; // Orange warning color for general messages
  
  const icon = document.createElement('div');
  icon.className = 'confirm-modal-icon';
  icon.style.color = '#f39c12';
  icon.innerHTML = `
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;
  confirmModal.appendChild(icon);
  
  const titleEl = document.createElement('h4');
  titleEl.className = 'confirm-modal-title';
  titleEl.textContent = title;
  confirmModal.appendChild(titleEl);
  
  const desc = document.createElement('p');
  desc.className = 'confirm-modal-desc';
  desc.textContent = message;
  confirmModal.appendChild(desc);
  
  const actions = document.createElement('div');
  actions.className = 'confirm-modal-actions';
  actions.style.justifyContent = 'center';
  
  const okBtn = document.createElement('button');
  okBtn.className = 'confirm-modal-btn confirm-modal-btn-delete'; // Use solid button for OK
  okBtn.style.backgroundColor = '#f39c12';
  okBtn.textContent = 'OK';
  okBtn.addEventListener('click', () => {
    confirmOverlay.remove();
    document.body.style.overflow = '';
  });
  
  actions.appendChild(okBtn);
  confirmModal.appendChild(actions);
  confirmOverlay.appendChild(confirmModal);
  
  confirmOverlay.addEventListener('click', (e) => {
    if (e.target === confirmOverlay) {
      confirmOverlay.remove();
      document.body.style.overflow = '';
    }
  });
  
  document.body.appendChild(confirmOverlay);
}

export function showUserGuideModal(title: string, contentHtml: string): void {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-modal-overlay';
  document.body.style.overflow = 'hidden';
  
  const modal = document.createElement('div');
  modal.className = 'confirm-modal';
  modal.style.borderTopColor = 'var(--primary-color)';
  modal.style.maxWidth = '500px'; 
  modal.style.maxHeight = '90vh';
  modal.style.overflowY = 'auto';
  
  const icon = document.createElement('div');
  icon.className = 'confirm-modal-icon';
  icon.style.color = 'var(--primary-color)';
  icon.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;
  modal.appendChild(icon);
  
  const titleEl = document.createElement('h4');
  titleEl.className = 'confirm-modal-title';
  titleEl.textContent = title;
  modal.appendChild(titleEl);
  
  const desc = document.createElement('div');
  desc.className = 'confirm-modal-desc';
  desc.innerHTML = contentHtml;
  modal.appendChild(desc);
  
  const actions = document.createElement('div');
  actions.className = 'confirm-modal-actions';
  actions.style.justifyContent = 'center';
  
  const okBtn = document.createElement('button');
  okBtn.className = 'confirm-modal-btn confirm-modal-btn-delete';
  okBtn.style.backgroundColor = 'var(--primary-color)';
  okBtn.textContent = 'OK';
  okBtn.addEventListener('click', () => {
    overlay.remove();
    document.body.style.overflow = '';
  });
  
  actions.appendChild(okBtn);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  });
  
  document.body.appendChild(overlay);
}
