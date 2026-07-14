export interface Activity {
    hora: string;
    titulo: string;
    descripcion: string;
    lugar: string;
    enlace_reserva?: string | undefined;
}
export declare class ActivityCard {
    private activity;
    private dayId;
    private onUpdateActivity;
    private onDeleteActivity;
    private isEditing;
    constructor(activity: Activity, dayId?: number, onUpdateActivity?: (updatedActivity: Activity) => void, onDeleteActivity?: () => void);
    render(): HTMLElement;
    private updateNoteIndicator;
    private openDetailModal;
    private openUnsavedWarningModal;
    private openDeleteConfirmModal;
}
//# sourceMappingURL=ActivityCard.d.ts.map