import { Injectable } from '@angular/core';
import { Actions, Effect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { AmbulancePrescriptionListService } from '../ambulance-prescription-list.service';
import { Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { Action } from '@ngrx/store';
import {
  LoadPrescriptions, UpsertPrescription, UploadPrescription,
  DeletePrescription, PrescriptionActionTypes
} from '../store/prescription/prescription.actions';


@Injectable()
export class AppEffects {

  constructor(
    private actions$: Actions,
    private prescriptionListService: AmbulancePrescriptionListService
  ) { }

  @Effect()
  init$: Observable<Action> = this.actions$.pipe(
    ofType(ROOT_EFFECTS_INIT),
    mergeMap(_ => this.prescriptionListService.getAllPrescriptions()),
    map(prescriptions => new LoadPrescriptions({ prescriptions })));

  @Effect()
  upsert$: Observable<Action> = this.actions$.pipe(
    ofType(PrescriptionActionTypes.UploadPrescription),
    mergeMap((action: UploadPrescription) =>
      this.prescriptionListService.upsertPrescription(action.payload.prescription)),
    map(prescription => new UpsertPrescription({ prescription })));

  @Effect({ dispatch: false })
  delete$: Observable<boolean> = this.actions$.pipe(
    ofType(PrescriptionActionTypes.DeletePrescription),
    mergeMap((action: DeletePrescription) =>
      this.prescriptionListService.deletePrescription(action.payload.id)));

}
