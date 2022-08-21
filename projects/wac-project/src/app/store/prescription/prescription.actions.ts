import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { Prescription } from './prescription.model';

export enum PrescriptionActionTypes {
  LoadPrescriptions = '[Prescription] Load Prescriptions',
  AddPrescription = '[Prescription] Add Prescription',
  UpsertPrescription = '[Prescription] Upsert Prescription',
  AddPrescriptions = '[Prescription] Add Prescriptions',
  UpsertPrescriptions = '[Prescription] Upsert Prescriptions',
  UpdatePrescription = '[Prescription] Update Prescription',
  UpdatePrescriptions = '[Prescription] Update Prescriptions',
  DeletePrescription = '[Prescription] Delete Prescription',
  DeletePrescriptions = '[Prescription] Delete Prescriptions',
  ClearPrescriptions = '[Prescription] Clear Prescriptions',
  UploadPrescription = '[Prescription] Upload Prescription'
}

export class LoadPrescriptions implements Action {
  readonly type = PrescriptionActionTypes.LoadPrescriptions;

  constructor(public payload: { prescriptions: Prescription[] }) {}
}

export class AddPrescription implements Action {
  readonly type = PrescriptionActionTypes.AddPrescription;

  constructor(public payload: { prescription: Prescription }) {}
}

export class UpsertPrescription implements Action {
  readonly type = PrescriptionActionTypes.UpsertPrescription;

  constructor(public payload: { prescription: Prescription }) {}
}

export class AddPrescriptions implements Action {
  readonly type = PrescriptionActionTypes.AddPrescriptions;

  constructor(public payload: { prescriptions: Prescription[] }) {}
}

export class UpsertPrescriptions implements Action {
  readonly type = PrescriptionActionTypes.UpsertPrescriptions;

  constructor(public payload: { prescriptions: Prescription[] }) {}
}

export class UpdatePrescription implements Action {
  readonly type = PrescriptionActionTypes.UpdatePrescription;

  constructor(public payload: { prescription: Update<Prescription> }) {}
}

export class UpdatePrescriptions implements Action {
  readonly type = PrescriptionActionTypes.UpdatePrescriptions;

  constructor(public payload: { prescriptions: Update<Prescription>[] }) {}
}

export class DeletePrescription implements Action {
  readonly type = PrescriptionActionTypes.DeletePrescription;

  constructor(public payload: { id: string }) {}
}

export class DeletePrescriptions implements Action {
  readonly type = PrescriptionActionTypes.DeletePrescriptions;

  constructor(public payload: { ids: string[] }) {}
}

export class ClearPrescriptions implements Action {
  readonly type = PrescriptionActionTypes.ClearPrescriptions;
}

export class UploadPrescription implements Action {
  readonly type = PrescriptionActionTypes.UploadPrescription;

  constructor(public payload: { prescription: Prescription }) {}
}

export type PrescriptionActions =
 LoadPrescriptions
 | AddPrescription
 | UpsertPrescription
 | AddPrescriptions
 | UpsertPrescriptions
 | UpdatePrescription
 | UpdatePrescriptions
 | DeletePrescription
 | DeletePrescriptions
 | ClearPrescriptions
 | UploadPrescription;
