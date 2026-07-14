export interface HomeViewProps {
  ui: {
    homeTitle: string;
    homeSubtitle: string;
    startBtn: string;
    galleryTitle: string;
    galleryPlaces: {
      sagrada: string;
      park: string;
      barceloneta: string;
      gotico: string;
    };
    homeDestLabel: string;
    homeDestVal: string;
    homeDatesLabel: string;
    homeDatesVal: string;
    homeEventLabel: string;
    homeEventVal: string;
    homePackingLabel: string;
    homePackingVal: string;
    homeFlightLabel: string;
    homeFlightVal: string;
  };
  activeLang: 'es' | 'en';
  onLanguageSelect: (lang: 'es' | 'en') => void;
  onStartTrip: () => void;
}

export class HomeView {
  private props: HomeViewProps;

  constructor(props: HomeViewProps) {
    this.props = props;
  }

  public render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'home-container animate-fade-in';

    // Language switcher
    const langContainer = document.createElement('div');
    langContainer.className = 'home-lang-switcher';

    const esBtn = document.createElement('button');
    esBtn.className = `home-lang-btn ${this.props.activeLang === 'es' ? 'active' : ''}`;
    esBtn.textContent = 'ES';
    esBtn.addEventListener('click', () => {
      if (this.props.activeLang !== 'es') {
        this.props.onLanguageSelect('es');
      }
    });

    const enBtn = document.createElement('button');
    enBtn.className = `home-lang-btn ${this.props.activeLang === 'en' ? 'active' : ''}`;
    enBtn.textContent = 'EN';
    enBtn.addEventListener('click', () => {
      if (this.props.activeLang !== 'en') {
        this.props.onLanguageSelect('en');
      }
    });

    langContainer.appendChild(esBtn);
    langContainer.appendChild(enBtn);
    container.appendChild(langContainer);

    // The main scrapbook planner book container
    const plannerBook = document.createElement('div');
    plannerBook.className = 'planner-book';

    // 1. LEFT PAGE: Planner checklist
    const plannerPage = document.createElement('div');
    plannerPage.className = 'planner-page';

    // Decorative elements
    const sparklesTop = document.createElement('span');
    sparklesTop.className = 'decor-sparkle top-right-sparkle';
    sparklesTop.textContent = '✨';
    plannerPage.appendChild(sparklesTop);

    const title = document.createElement('h1');
    title.className = 'planner-title';
    title.textContent = this.props.ui.homeTitle;

    const subtitle = document.createElement('p');
    subtitle.className = 'planner-subtitle';
    subtitle.textContent = this.props.ui.homeSubtitle;

    const divider = document.createElement('div');
    divider.className = 'planner-divider';

    // Checklist of travel details
    const list = document.createElement('ul');
    list.className = 'planner-checklist';

    const checklistItems = [
      { icon: '📍', label: this.props.ui.homeDestLabel, val: this.props.ui.homeDestVal },
      { icon: '📅', label: this.props.ui.homeDatesLabel, val: this.props.ui.homeDatesVal },
      { icon: '🥂', label: this.props.ui.homeEventLabel, val: this.props.ui.homeEventVal },
      { icon: '🎒', label: this.props.ui.homePackingLabel, val: this.props.ui.homePackingVal },
      { icon: '✈️', label: this.props.ui.homeFlightLabel, val: this.props.ui.homeFlightVal }
    ];

    checklistItems.forEach(item => {
      const li = document.createElement('li');

      const iconSpan = document.createElement('span');
      iconSpan.className = 'checklist-icon';
      iconSpan.textContent = item.icon;

      const contentDiv = document.createElement('div');
      contentDiv.className = 'checklist-content';

      const labelStrong = document.createElement('strong');
      labelStrong.className = 'checklist-label';
      labelStrong.textContent = `${item.label}: `;

      const valSpan = document.createElement('span');
      valSpan.className = 'checklist-val';
      valSpan.textContent = item.val;

      contentDiv.appendChild(labelStrong);
      contentDiv.appendChild(valSpan);

      li.appendChild(iconSpan);
      li.appendChild(contentDiv);
      list.appendChild(li);
    });

    // Start Trip CTA button inside the planner page
    const startBtn = document.createElement('button');
    startBtn.className = 'planner-cta-btn';

    const startBtnText = document.createElement('span');
    startBtnText.textContent = this.props.ui.startBtn;

    const startBtnIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    startBtnIcon.setAttribute('viewBox', '0 0 24 24');
    startBtnIcon.setAttribute('fill', 'none');
    startBtnIcon.setAttribute('stroke', 'currentColor');
    startBtnIcon.setAttribute('stroke-width', '2.5');
    startBtnIcon.setAttribute('class', 'cta-arrow-icon');
    startBtnIcon.style.width = '18px';
    startBtnIcon.style.height = '18px';
    startBtnIcon.style.marginLeft = '8px';
    startBtnIcon.style.verticalAlign = 'middle';

    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M5 12h14M12 5l7 7-7 7');
    startBtnIcon.appendChild(arrowPath);

    startBtn.appendChild(startBtnText);
    startBtn.appendChild(startBtnIcon);

    startBtn.addEventListener('click', () => {
      this.props.onStartTrip();
    });

    plannerPage.appendChild(title);
    plannerPage.appendChild(subtitle);
    plannerPage.appendChild(divider);
    plannerPage.appendChild(list);
    plannerPage.appendChild(startBtn);

    // 2. CENTER BINDER: Binder rings
    const binderRings = document.createElement('div');
    binderRings.className = 'binder-rings';
    for (let i = 0; i < 4; i++) {
      const ring = document.createElement('div');
      ring.className = 'binder-ring';
      binderRings.appendChild(ring);
    }

    // 3. RIGHT PAGE: Polaroid gallery collage
    const galleryPage = document.createElement('div');
    galleryPage.className = 'gallery-page';

    const galleryTitle = document.createElement('h2');
    galleryTitle.className = 'gallery-page-title';
    galleryTitle.textContent = this.props.ui.galleryTitle;
    galleryPage.appendChild(galleryTitle);

    const polaroidCollage = document.createElement('div');
    polaroidCollage.className = 'polaroid-collage';

    // Polaroid photos config with active Unsplash direct URLs
    const polaroids = [
      {
        id: 'sagrada',
        name: this.props.ui.galleryPlaces.sagrada,
        imgUrl: '/images/sagrada_familia.png'
      },
      {
        id: 'park',
        name: this.props.ui.galleryPlaces.park,
        imgUrl: '/images/park_guell.jpg'
      },
      {
        id: 'barceloneta',
        name: this.props.ui.galleryPlaces.barceloneta,
        imgUrl: '/images/barceloneta.png'
      },
      {
        id: 'gotico',
        name: this.props.ui.galleryPlaces.gotico,
        imgUrl: '/images/barrio_gotico.png'
      }
    ];

    polaroids.forEach((item, index) => {
      const polaroid = document.createElement('div');
      polaroid.className = `polaroid polaroid-${item.id}`;

      // Washi tape sticker at the top
      const washiTape = document.createElement('div');
      washiTape.className = 'washi-tape';

      const img = document.createElement('img');
      img.className = 'polaroid-img';
      img.src = item.imgUrl;
      img.alt = item.name;
      img.loading = 'lazy';

      const caption = document.createElement('p');
      caption.className = 'polaroid-caption';
      caption.textContent = item.name;

      polaroid.appendChild(washiTape);
      polaroid.appendChild(img);
      polaroid.appendChild(caption);
      polaroidCollage.appendChild(polaroid);
    });

    galleryPage.appendChild(polaroidCollage);

    // Assemble book
    plannerBook.appendChild(plannerPage);
    plannerBook.appendChild(binderRings);
    plannerBook.appendChild(galleryPage);
    container.appendChild(plannerBook);

    return container;
  }
}
