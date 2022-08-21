import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromPrescription from './prescription/prescription.reducer';
import { SerializedRouterStateSnapshot, RouterReducerState, routerReducer } from '@ngrx/router-store';

export interface State {
  router: RouterReducerState<SerializedRouterStateSnapshot>;
  prescriptions: fromPrescription.State;
}

export const reducers: ActionReducerMap<State> = {
  router: routerReducer,
  prescriptions: fromPrescription.reducer,
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
