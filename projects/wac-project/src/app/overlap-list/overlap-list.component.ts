import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AmbulancePrescriptionListService } from '../ambulance-prescription-list.service';
import { Prescription } from '../store/prescription/prescription.model';
import { Overlap } from '../store/overlap';

@Component({
  selector: 'app-overlap-list',
  templateUrl: './overlap-list.component.html',
  styleUrls: ['./overlap-list.component.css']
})
export class OverlapListComponent implements OnInit {

  public readonly overlapList$: Observable<Array<Overlap>>;

  constructor(
    api: AmbulancePrescriptionListService
  ) {
    this.overlapList$ = api.getOverlaps();
  }

  ngOnInit() {
  }

}
