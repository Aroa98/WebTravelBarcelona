import { type Activity } from './ActivityCard.js';
export interface Day {
    id: number;
    fecha: string;
    tituloPrincipal: string;
    actividades: Activity[];
}
export declare class DayItinerary {
    private day;
    constructor(day: Day);
    render(): HTMLElement;
}
//# sourceMappingURL=DayItinerary.d.ts.map