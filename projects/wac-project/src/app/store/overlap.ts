import { Prescription } from './prescription/prescription.model';

export interface Overlap {
    id: string;
    since: Date;
    until: Date;
    prescriptionList: Array<Prescription>;
}
