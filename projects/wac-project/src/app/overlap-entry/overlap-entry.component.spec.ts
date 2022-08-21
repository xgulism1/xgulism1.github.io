import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlapEntryComponent } from './overlap-entry.component';
import { MatIconModule, MatExpansionModule, MatListModule, MatToolbarModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('OverlapEntryComponent', () => {
  let component: OverlapEntryComponent;
  let fixture: ComponentFixture<OverlapEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatIconModule,
        MatExpansionModule,
        MatListModule
      ],
      declarations: [OverlapEntryComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlapEntryComponent);
    component = fixture.componentInstance;
    component.data = {
      id: 'overlap-test-id',
      since: new Date(2017, 7, 21),
      until: new Date(2017, 7, 24),
      prescriptionList: [{
        id: 'prescription-test-id01',
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
      }, {
        id: 'prescription-test-id02',
        since: new Date(2017, 7, 21),
        until: new Date(2017, 7, 24),
        takeTimesPerDay: 4,
        takeAmount: 1,
        medicine: {
          id: 'test-medicineId',
          name: 'test-name',
          code: 'test-code',
          dosageForm: 'test-dosageForm',
          reference: 'test-reference'
        }
      }]
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

  it('should have mat-expansion-panel and mat-list', () => {
    const approot: HTMLElement = fixture.debugElement.nativeElement;
    const matExpansionPanel: HTMLElement = approot.querySelector('mat-expansion-panel');
    expect(matExpansionPanel.querySelector('mat-list')).toBeTruthy();
  });
});
