import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionEntryEditorComponent } from './prescription-entry-editor.component';
import {
  MatCardModule, MatSelectModule, MatSliderModule,
  MatDatepickerModule, MatNativeDateModule
} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { State } from '../store';
import { EMPTY } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const storeStub: Partial<Store<State>> = {
  pipe: () => EMPTY
};

describe('PrescriptionEntryEditorComponent', () => {
  let component: PrescriptionEntryEditorComponent;
  let fixture: ComponentFixture<PrescriptionEntryEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatSelectModule,
        MatSliderModule,
        MatDatepickerModule,
        MatNativeDateModule,
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [PrescriptionEntryEditorComponent],
      providers: [{ provide: Store, useValue: storeStub, PrescriptionEntryEditorComponent }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionEntryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should floor to day when not rounded`, () => {
    // given
    const date = new Date(2017, 7, 21, 13, 48, 32, 91);

    // when
    const result = PrescriptionEntryEditorComponent.floorDay(date);

    // then
    expect(result).toEqual(new Date(Date.UTC(2017, 7, 21)));
  });

  it(`should floor to day when after midnight lesser than timezone offset`, () => {
    // given
    const date = new Date(2017, 7, 21, 0, 16, 32, 91);

    // when
    const result = PrescriptionEntryEditorComponent.floorDay(date);

    // then
    expect(result).toEqual(new Date(Date.UTC(2017, 7, 21)));
  });

  it(`should floor to day when before midnight lesser than timezone offset`, () => {
    // given
    const date = new Date(2017, 7, 21, 23, 16, 32, 91);

    // when
    const result = PrescriptionEntryEditorComponent.floorDay(date);

    // then
    expect(result).toEqual(new Date(Date.UTC(2017, 7, 21)));
  });

  it(`should floor to day when already rounded`, () => {
    // given
    const date = new Date(2017, 7, 21);

    // when
    const result = PrescriptionEntryEditorComponent.floorDay(date);

    // then
    expect(result).toEqual(new Date(Date.UTC(2017, 7, 21)));
  });

  it(`should floor to day as string`, () => {
    // given
    const dateString = '2017-08-21T17:32:28Z';

    // when
    const result = PrescriptionEntryEditorComponent.floorDay(dateString as any);

    // then
    expect(result).toEqual(new Date(Date.UTC(2017, 7, 21)));
  });

  it('should have mat-card and mat-card-header', () => {
    const approot: HTMLElement = fixture.debugElement.nativeElement;
    const matCard: HTMLElement = approot.querySelector('mat-card');
    expect(matCard.querySelector('mat-card-header')).toBeTruthy();
  });
});
