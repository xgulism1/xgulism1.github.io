import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionEntryComponent } from './prescription-entry.component';
import { MatIconModule, MatExpansionModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PrescriptionEntryComponent', () => {
  let component: PrescriptionEntryComponent;
  let fixture: ComponentFixture<PrescriptionEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatIconModule,
        MatExpansionModule,
        MatInputModule,
        MatFormFieldModule,
        RouterTestingModule
      ],
      declarations: [PrescriptionEntryComponent],
      providers: [PrescriptionEntryComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionEntryComponent);
    component = fixture.componentInstance;
    component.data = {
      id: 'test-id',
      since: new Date(2017, 7, 21),
      until: new Date(2017, 8, 4),
      takeTimesPerDay: 4,
      takeAmount: 1,
      medicine: {
        id: 'test-medicineId',
        name: 'test-name',
        code: 'test-code',
        dosageForm: 'test-dosageForm',
        reference: 'test-reference'
      }
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have mat-expansion-panel and mat-expansion-panel-header', () => {
    const approot: HTMLElement = fixture.debugElement.nativeElement;
    const matExpansionPanel: HTMLElement = approot.querySelector('mat-expansion-panel');
    expect(matExpansionPanel.querySelector('mat-expansion-panel-header')).toBeTruthy();
  });
});
