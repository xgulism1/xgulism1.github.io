import { Routes } from '@angular/router';
import { PrescriptionListComponent } from './prescription-list/prescription-list.component';
import { PrescriptionEntryEditorComponent } from './prescription-entry-editor/prescription-entry-editor.component';
import { OverlapListComponent } from './overlap-list/overlap-list.component';

export const routes: Routes = [
  { path: 'prescription-list', component: PrescriptionListComponent },
  { path: 'prescription-list/:id', component: PrescriptionEntryEditorComponent },
  { path: 'overlap-list', component: OverlapListComponent },
  {
    path: '',
    redirectTo: '/prescription-list',
    pathMatch: 'full'
  }
];
