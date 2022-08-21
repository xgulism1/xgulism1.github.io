import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Prescription } from './prescription.model';
import { PrescriptionActions, PrescriptionActionTypes } from './prescription.actions';

export interface State extends EntityState<Prescription> {
  // additional entities state properties
}

export const adapter: EntityAdapter<Prescription> = createEntityAdapter<Prescription>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(
  state = initialState,
  action: PrescriptionActions
): State {
  switch (action.type) {
    case PrescriptionActionTypes.AddPrescription: {
      return adapter.addOne(action.payload.prescription, state);
    }

    case PrescriptionActionTypes.UpsertPrescription: {
      return adapter.upsertOne(action.payload.prescription, state);
    }

    case PrescriptionActionTypes.AddPrescriptions: {
      return adapter.addMany(action.payload.prescriptions, state);
    }

    case PrescriptionActionTypes.UpsertPrescriptions: {
      return adapter.upsertMany(action.payload.prescriptions, state);
    }

    case PrescriptionActionTypes.UpdatePrescription: {
      return adapter.updateOne(action.payload.prescription, state);
    }

    case PrescriptionActionTypes.UpdatePrescriptions: {
      return adapter.updateMany(action.payload.prescriptions, state);
    }

    case PrescriptionActionTypes.DeletePrescription: {
      return adapter.removeOne(action.payload.id, state);
    }

    case PrescriptionActionTypes.DeletePrescriptions: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case PrescriptionActionTypes.LoadPrescriptions: {
      return adapter.addAll(action.payload.prescriptions, state);
    }

    case PrescriptionActionTypes.ClearPrescriptions: {
      return adapter.removeAll(state);
    }

    default: {
      return state;
    }
  }
}

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
