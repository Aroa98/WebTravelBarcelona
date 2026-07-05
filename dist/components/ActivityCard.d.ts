export interface Activity {
    hora: string;
    titulo: string;
    descripcion: string;
    lugar: string;
}
export declare class ActivityCard {
    private activity;
    constructor(activity: Activity);
    render(): HTMLElement;
}
//# sourceMappingURL=ActivityCard.d.ts.map