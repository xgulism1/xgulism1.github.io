import { Medicine } from '../medicine';

export interface Prescription {
  id: string;
  since: Date;
  until: Date;
  takeTimesPerDay: number;
  takeAmount: number;
  medicine: Medicine;
}
