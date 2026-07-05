export interface NavbarTab {
  id: string;
  label: string;
}

export interface NavbarProps {
  title: string;
  subtitle?: string;
  tabs: NavbarTab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  activeLang: string;
  onLanguageSelect: (lang: string) => void;
  onBrandClick: () => void;
}

export class Navbar {
  private props: NavbarProps;
  private element: HTMLElement | null = null;

  constructor(props: NavbarProps) {
    this.props = props;
  }

  public render(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'app-header';

    const brand = document.createElement('div');
    brand.className = 'header-brand clickable';
    brand.addEventListener('click', () => {
      this.props.onBrandClick();
    });
    
    const title = document.createElement('h1');
    title.className = 'header-title';
    title.textContent = this.props.title;

    brand.appendChild(title);

    if (this.props.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.className = 'header-subtitle';
      subtitle.textContent = this.props.subtitle;
      brand.appendChild(subtitle);
    }

    header.appendChild(brand);

    const nav = document.createElement('nav');
    nav.className = 'header-nav';

    const ul = document.createElement('ul');
    ul.className = 'nav-list';

    this.props.tabs.forEach(tab => {
      const li = document.createElement('li');
      li.className = `nav-item ${tab.id === this.props.activeTabId ? 'active' : ''}`;
      
      const button = document.createElement('button');
      button.className = 'nav-button';
      button.textContent = tab.label;
      button.setAttribute('aria-selected', tab.id === this.props.activeTabId ? 'true' : 'false');
      
      button.addEventListener('click', () => {
        this.setActiveTab(tab.id);
        this.props.onTabSelect(tab.id);
      });

      li.appendChild(button);
      ul.appendChild(li);
    });

    nav.appendChild(ul);
    header.appendChild(nav);

    // Language switcher
    const langContainer = document.createElement('div');
    langContainer.className = 'lang-switcher';

    const esBtn = document.createElement('button');
    esBtn.className = `lang-btn ${this.props.activeLang === 'es' ? 'active' : ''}`;
    esBtn.textContent = 'ES';
    esBtn.addEventListener('click', () => {
      if (this.props.activeLang !== 'es') {
        this.props.onLanguageSelect('es');
      }
    });

    const enBtn = document.createElement('button');
    enBtn.className = `lang-btn ${this.props.activeLang === 'en' ? 'active' : ''}`;
    enBtn.textContent = 'EN';
    enBtn.addEventListener('click', () => {
      if (this.props.activeLang !== 'en') {
        this.props.onLanguageSelect('en');
      }
    });

    langContainer.appendChild(esBtn);
    langContainer.appendChild(enBtn);
    header.appendChild(langContainer);

    this.element = header;
    return header;
  }

  private setActiveTab(tabId: string): void {
    if (!this.element) return;
    this.props.activeTabId = tabId;

    const items = this.element.querySelectorAll('.nav-item');
    items.forEach((item, index) => {
      const tab = this.props.tabs[index];
      if (tab) {
        const isSelected = tab.id === tabId;
        item.classList.toggle('active', isSelected);
        const button = item.querySelector('.nav-button');
        if (button) {
          button.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        }
      }
    });
  }
}
