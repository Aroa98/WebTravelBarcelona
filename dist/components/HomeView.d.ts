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
export declare class HomeView {
    private props;
    constructor(props: HomeViewProps);
    render(): HTMLElement;
}
//# sourceMappingURL=HomeView.d.ts.map