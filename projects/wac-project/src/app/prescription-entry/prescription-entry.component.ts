import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Prescription } from '../store/prescription/prescription.model';

@Component({
  selector: 'app-prescription-entry',
  templateUrl: './prescription-entry.component.html',
  styleUrls: ['./prescription-entry.component.css']
})
export class PrescriptionEntryComponent implements OnInit {

  @Output()
  public deleteEmitter = new EventEmitter<Prescription>();

  @Input()
  public data: Prescription;

  constructor() { }

  ngOnInit() {
  }

}
