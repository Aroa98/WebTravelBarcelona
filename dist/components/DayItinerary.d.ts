import { type Activity } from './ActivityCard.js';
export interface Day {
    id_dia: number;
    fecha: string;
    descripcion: string;
    actividadDia: Activity[];
}
export declare class DayItinerary {
    private day;
    private onDaySelect;
    private onUpdateDay;
    constructor(day: Day, onDaySelect?: (dayId: number) => void, onUpdateDay?: (updatedDay: Day) => void);
    render(): HTMLElement;
    private openAddPlanModal;
    private openUnsavedWarningModal;
}
//# sourceMappingURL=DayItinerary.d.ts.map