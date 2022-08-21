import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrescriptionListComponent } from './prescription-list/prescription-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PrescriptionEntryComponent } from './prescription-entry/prescription-entry.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './effects/app.effects';
import { PrescriptionEntryEditorComponent } from './prescription-entry-editor/prescription-entry-editor.component';
import { RouterModule } from '@angular/router';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import {
  MatToolbarModule, MatIconModule, MatExpansionModule, MatFormFieldModule,
  MatInputModule, MatButtonModule, MatCardModule, MatSelectModule, MatSliderModule,
  MatDatepickerModule, MatNativeDateModule, MatListModule, MatTooltipModule
} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { OverlapListComponent } from './overlap-list/overlap-list.component';
import { OverlapEntryComponent } from './overlap-entry/overlap-entry.component';

@NgModule({
  declarations: [
    AppComponent,
    PrescriptionListComponent,
    PrescriptionEntryComponent,
    PrescriptionEntryEditorComponent,
    OverlapListComponent,
    OverlapEntryComponent
  ],
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSliderModule,
    MatListModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    StoreRouterConnectingModule.forRoot(),
    RouterModule.forRoot(routes, { enableTracing: true }),
    StoreModule.forRoot(reducers, { metaReducers }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    EffectsModule.forRoot([AppEffects])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
