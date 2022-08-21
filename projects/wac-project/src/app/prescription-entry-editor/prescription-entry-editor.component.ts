import { Component, OnInit } from '@angular/core';
import { Prescription } from '../store/prescription/prescription.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { State } from '../store';
import { map, switchMap } from 'rxjs/operators';
import * as fromPrescription from '../store/prescription/prescription.reducer';
import { UploadPrescription } from '../store/prescription/prescription.actions';
import { AmbulancePrescriptionListService } from '../ambulance-prescription-list.service';
import { Medicine } from '../store/medicine';

@Component({
  selector: 'app-prescription-entry-editor',
  templateUrl: './prescription-entry-editor.component.html',
  styleUrls: ['./prescription-entry-editor.component.css']
})
export class PrescriptionEntryEditorComponent implements OnInit {

  public static readonly MILLISEC_IN_DAY = 24 * 60 * 60 * 1000;

  private static newEntryPlaceholder: Prescription = {
    id: undefined,
    since: PrescriptionEntryEditorComponent.floorDay(new Date(Date.now())),
    until: PrescriptionEntryEditorComponent.floorDay(new Date(Date.now()
      + 7 * PrescriptionEntryEditorComponent.MILLISEC_IN_DAY)),
    takeTimesPerDay: 1,
    takeAmount: 1,
    medicine: null,
  };

  public readonly availableMedicine$: Observable<Array<Medicine>>;

  public data$: Observable<Prescription>;

  public static floorDay(date: Date) {
    // From server arrives as string
    date = typeof(date) === 'string' ? new Date(date) : date;
    // UTC Date is required because of the server interpretation
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store<State>,
    private readonly router: Router,
    api: AmbulancePrescriptionListService
  ) {
    this.availableMedicine$ = api.getAvailableMedicine();
  }

  ngOnInit() {
    this.data$ = this.route.paramMap.pipe(
      map(_ => _.get('id')),
      switchMap(id =>
        id === 'new'
          ? of(Object.assign({}, PrescriptionEntryEditorComponent.newEntryPlaceholder))
          : this.store.pipe(
            select((state: State) => state.prescriptions),
            select(fromPrescription.adapter.getSelectors().selectEntities),
            select(entities => Object.assign({}, entities[id]))
          )
      )
    );
  }

  compareById = (o1: any, o2: any) => (o1 && o2) ? o1.id === o2.id : false;

  public onUpsertEntry(isValid: boolean, prescription: Prescription) {
    if (isValid) {
      prescription.since = PrescriptionEntryEditorComponent.floorDay(prescription.since);
      prescription.until = PrescriptionEntryEditorComponent.floorDay(prescription.until);

      this.store.dispatch(new UploadPrescription({ prescription }));
      this.router.navigate(['/', 'prescription-list']);
    }
  }

}
