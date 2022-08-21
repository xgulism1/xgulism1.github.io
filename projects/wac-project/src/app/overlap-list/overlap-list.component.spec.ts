import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlapListComponent } from './overlap-list.component';
import { MatToolbarModule, MatExpansionModule, MatIconModule, MatListModule } from '@angular/material';
import { Component, Input } from '@angular/core';
import { Overlap } from '../store/overlap';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Component({ selector: 'app-overlap-entry', template: '' })
class OverlapStubComponent {
  @Input()
  public data: Overlap;
}

describe('OverlapListComponent', () => {
  let component: OverlapListComponent;
  let fixture: ComponentFixture<OverlapListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatToolbarModule,
        MatExpansionModule,
        MatIconModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [OverlapListComponent, OverlapStubComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlapListComponent);
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

  it('should have "a" with mat-fab containing icon', () => {
    const approot: HTMLElement = fixture.debugElement.nativeElement;
    const aElement: HTMLElement = approot.querySelector('a');
    expect(aElement.hasAttribute('mat-fab')).toBeTruthy();
    expect(aElement.querySelector('mat-icon')).toBeTruthy();
  });
});
