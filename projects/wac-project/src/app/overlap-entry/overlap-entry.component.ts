import { Component, OnInit, Input } from '@angular/core';
import { Overlap } from '../store/overlap';

@Component({
  selector: 'app-overlap-entry',
  templateUrl: './overlap-entry.component.html',
  styleUrls: ['./overlap-entry.component.css']
})
export class OverlapEntryComponent implements OnInit {

  @Input()
  public data: Overlap;

  constructor() { }

  ngOnInit() {
  }

}
