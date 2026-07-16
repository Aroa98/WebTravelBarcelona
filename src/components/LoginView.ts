import { supabase } from '../database/supabaseClient.js';

export class LoginView {
  private container: HTMLElement;

  constructor(private onLoginSuccess: () => void) {
    this.container = document.createElement('div');
    this.container.className = 'login-container animate-fade-in';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.alignItems = 'center';
    this.container.style.justifyContent = 'center';
    this.container.style.height = '100vh';
    this.container.style.backgroundColor = 'var(--bg-color)';
    this.container.style.color = 'var(--text-color)';
  }

  render(): HTMLElement {
    this.container.innerHTML = `
      <div class="login-card" style="background: var(--card-bg); padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; width: 100%;">
        <h2 style="text-align: center; margin-bottom: 1.5rem;">Iniciar Sesión</h2>
        <form id="login-form">
          <div style="margin-bottom: 1rem;">
            <label for="email" style="display: block; margin-bottom: 0.5rem;">Email</label>
            <input type="email" id="email" required style="width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid #ccc; background: var(--bg-color); color: var(--text-color);">
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label for="password" style="display: block; margin-bottom: 0.5rem;">Contraseña</label>
            <input type="password" id="password" required style="width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid #ccc; background: var(--bg-color); color: var(--text-color);">
          </div>
          <button type="submit" class="primary-btn" style="width: 100%; padding: 0.75rem; border-radius: 6px; background-color: var(--primary-color); color: white; border: none; cursor: pointer; font-weight: bold;">Entrar</button>
          <div id="login-error" style="color: red; margin-top: 1rem; text-align: center; display: none;"></div>
        </form>
      </div>
    `;

    const form = this.container.querySelector('#login-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = this.container.querySelector('#email') as HTMLInputElement;
      const passwordInput = this.container.querySelector('#password') as HTMLInputElement;
      const errorDiv = this.container.querySelector('#login-error') as HTMLElement;
      
      errorDiv.style.display = 'none';
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.value,
        password: passwordInput.value,
      });

      if (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
      } else if (data.session) {
        this.onLoginSuccess();
      }
    });

    return this.container;
  }
}
