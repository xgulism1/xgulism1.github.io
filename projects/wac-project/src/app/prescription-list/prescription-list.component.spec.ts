import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionListComponent } from './prescription-list.component';
import { MatToolbarModule, MatExpansionModule, MatIconModule } from '@angular/material';
import { Component, Input } from '@angular/core';
import { Prescription } from '../store/prescription/prescription.model';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { State } from '../store';
import { EMPTY } from 'rxjs';

@Component({ selector: 'app-prescription-entry', template: '' })
class PrescriptionStubComponent {
  @Input()
  data: Prescription;
}

const storeStub: Partial<Store<State>> = {
  pipe: () => EMPTY
};

describe('PrescriptionListComponent', () => {
  let component: PrescriptionListComponent;
  let fixture: ComponentFixture<PrescriptionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatToolbarModule,
        MatIconModule,
        MatExpansionModule,
        RouterTestingModule
      ],
      declarations: [PrescriptionListComponent, PrescriptionStubComponent],
      providers: [{ provide: Store, useValue: storeStub }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have toolbar', () => {
    const approot: HTMLElement = fixture.debugElement.nativeElement;
    expect(approot.querySelector('mat-toolbar')).toBeTruthy();
  });

  it('should have accordion', () => {
    const approot: HTMLElement = fixture.debugElement.nativeElement;
    expect(approot.querySelector('mat-accordion')).toBeTruthy();
  });

  it('should have two "a"', () => {
    const approot: HTMLElement = fixture.debugElement.nativeElement;
    const aElements: NodeListOf<HTMLElement> = approot.querySelectorAll('a');
    expect(aElements.length).toEqual(2);
  });

  it('should have first "a" with mat-fab containing icon', () => {
    const approot: HTMLElement = fixture.debugElement.nativeElement;
    const aElements: NodeListOf<HTMLElement> = approot.querySelectorAll('a');
    expect(aElements[0].hasAttribute('mat-fab')).toBeTruthy();
    expect(aElements[0].querySelector('mat-icon')).toBeTruthy();
  });

  it('should have second "a" with mat-fab containing icon', () => {
    const approot: HTMLElement = fixture.debugElement.nativeElement;
    const aElements: NodeListOf<HTMLElement> = approot.querySelectorAll('a');
    expect(aElements[1].hasAttribute('mat-fab')).toBeTruthy();
    expect(aElements[1].querySelector('mat-icon')).toBeTruthy();
  });
});
