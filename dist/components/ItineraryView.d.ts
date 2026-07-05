import { type Day } from './DayItinerary.js';
export interface ItineraryViewProps {
    days: Day[];
    ui: {
        searchPlaceholder: string;
        allDays: string;
        noResults: string;
    };
}
export declare class ItineraryView {
    private days;
    private ui;
    private activeDayFilter;
    private searchQuery;
    private element;
    private contentContainer;
    constructor(props: ItineraryViewProps);
    render(): HTMLElement;
    private createToolbar;
    private setDayFilter;
    private updateList;
}
//# sourceMappingURL=ItineraryView.d.ts.map