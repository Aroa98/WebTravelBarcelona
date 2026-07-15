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
export declare class Navbar {
    private props;
    private element;
    constructor(props: NavbarProps);
    render(): HTMLElement;
    private setActiveTab;
}
