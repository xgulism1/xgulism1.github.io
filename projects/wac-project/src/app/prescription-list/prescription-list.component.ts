import { Component, OnInit } from '@angular/core';
import { Prescription } from '../store/prescription/prescription.model';
import { Store, select } from '@ngrx/store';
import { State } from '../store';
import { Observable } from 'rxjs';
import { DeletePrescription } from '../store/prescription/prescription.actions';
import * as fromPrescription from '../store/prescription/prescription.reducer';

@Component({
  selector: 'app-prescription-list',
  templateUrl: './prescription-list.component.html',
  styleUrls: ['./prescription-list.component.css']
})
export class PrescriptionListComponent implements OnInit {

  public readonly prescriptionList: Observable<Prescription[]>;

  constructor(private store: Store<State>) {
    this.prescriptionList = store.pipe(
      select((state: State) => state.prescriptions),
      select(fromPrescription.adapter.getSelectors().selectAll)
    );
  }

  ngOnInit() {
  }

  public onDelete(entry: Prescription) {
    this.store.dispatch(new DeletePrescription({ id: entry.id }));
  }

}
