export interface Activity {
    id_actividad?: number;
    id_dia: number;
    hora: string;
    titulo: string;
    descripcion?: string | null;
    url?: string | null;
    reservaLink?: string | null;
    notas?: string | null;
}
export declare class ActivityCard {
    private activity;
    private dayId;
    private onUpdateActivity;
    private onDeleteActivity;
    private isEditing;
    private viewModeContainer;
    private editModeContainer;
    private timeSpan;
    private titleEl;
    private descEl;
    private locText;
    private bookBtn;
    private overlay;
    constructor(activity: Activity, dayId?: number, onUpdateActivity?: (updatedActivity: Activity) => void, onDeleteActivity?: () => void);
    render(): HTMLElement;
    private createPinSvg;
    private updateNoteIndicator;
    private openDetailModal;
    private buildViewMode;
    private buildEditMode;
    private buildNotesSection;
    private openUnsavedWarningModal;
    private openDeleteConfirmModal;
}
