import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Prescription } from './store/prescription/prescription.model';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { Medicine } from './store/medicine';
import { Overlap } from './store/overlap';

@Injectable({
  providedIn: 'root'
})
export class AmbulancePrescriptionListService {

  // Use mockups instead of the http requests, backend is not deployed
  private mockupMedicineList: Medicine[] = [
    {
      id: 'PA1077/093/007',
      name: 'Augmentin',
      code: 'Augmentin 250 mg/125 mg film-coated tablets',
      dosageForm: 'tablets',
      reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=PA1077/093/007&t=Augmentin%20%20250%20mg/125%20mg%20film-coated%20tablets'
    },
    {
      id: 'PA0577/195/001',
      name: 'Baclopar',
      code: 'Baclopar 10 mg Tablets',
      dosageForm: 'tablets',
      reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=PA0577/195/001&t=Baclopar%2010%20mg%20Tablets'
    },
    {
      id: 'EU/1/20/1448/001',
      name: 'Cabazitaxel',
      code: 'Cabazitaxel Accord',
      dosageForm: 'Concentrate for solution for infusion',
      reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=EU/1/20/1448/001&t=Cabazitaxel%20Accord'
    }
  ];
  private mockupPrescriptionList: Prescription[] = [
    {
      id: '001',
      since: new Date(Date.UTC(2017, 7, 20)),
      until: new Date(Date.UTC(2017, 7, 27)),
      takeTimesPerDay: 3,
      takeAmount: 4,
      medicine:
      {
        id: 'PA1077/093/007',
        name: 'Augmentin',
        code: 'Augmentin 250 mg/125 mg film-coated tablets',
        dosageForm: 'tablets',
        reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=PA1077/093/007&t=Augmentin%20%20250%20mg/125%20mg%20film-coated%20tablets'
      },
    },
    {
      id: '002',
      since: new Date(Date.UTC(2017, 7, 18)),
      until: new Date(Date.UTC(2017, 7, 26)),
      takeTimesPerDay: 4,
      takeAmount: 2,
      medicine:
      {
        id: 'PA0577/195/001',
        name: 'Baclopar',
        code: 'Baclopar 10 mg Tablets',
        dosageForm: 'tablets',
        reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=PA0577/195/001&t=Baclopar%2010%20mg%20Tablets'
      },
    },
    {
      id: '003',
      since: new Date(Date.UTC(2017, 7, 24)),
      until: new Date(Date.UTC(2017, 7, 31)),
      takeTimesPerDay: 2,
      takeAmount: 1,
      medicine: 
      {
        id: 'EU/1/20/1448/001',
        name: 'Cabazitaxel',
        code: 'Cabazitaxel Accord',
        dosageForm: 'Concentrate for solution for infusion',
        reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=EU/1/20/1448/001&t=Cabazitaxel%20Accord'
      },
    }
  ];
  private mockupOverlapList: Overlap[] = [
    {
      id: '001',
      since: new Date(Date.UTC(2017, 7, 20)),
      until: new Date(Date.UTC(2017, 7, 23)),
      prescriptionList: [
        {
          id: '001',
          since: new Date(Date.UTC(2017, 7, 20)),
          until: new Date(Date.UTC(2017, 7, 27)),
          takeTimesPerDay: 3,
          takeAmount: 4,
          medicine:
          {
            id: 'PA1077/093/007',
            name: 'Augmentin',
            code: 'Augmentin 250 mg/125 mg film-coated tablets',
            dosageForm: 'tablets',
            reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=PA1077/093/007&t=Augmentin%20%20250%20mg/125%20mg%20film-coated%20tablets'
          },
        },
        {
          id: '002',
          since: new Date(Date.UTC(2017, 7, 18)),
          until: new Date(Date.UTC(2017, 7, 26)),
          takeTimesPerDay: 4,
          takeAmount: 2,
          medicine:
          {
            id: 'PA0577/195/001',
            name: 'Baclopar',
            code: 'Baclopar 10 mg Tablets',
            dosageForm: 'tablets',
            reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=PA0577/195/001&t=Baclopar%2010%20mg%20Tablets'
          },
        }
      ]
    },
    {
      id: '002',
      since: new Date(Date.UTC(2017, 7, 24)),
      until: new Date(Date.UTC(2017, 7, 26)),
      prescriptionList: [
        {
          id: '001',
          since: new Date(Date.UTC(2017, 7, 20)),
          until: new Date(Date.UTC(2017, 7, 27)),
          takeTimesPerDay: 3,
          takeAmount: 4,
          medicine:
          {
            id: 'PA1077/093/007',
            name: 'Augmentin',
            code: 'Augmentin 250 mg/125 mg film-coated tablets',
            dosageForm: 'tablets',
            reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=PA1077/093/007&t=Augmentin%20%20250%20mg/125%20mg%20film-coated%20tablets'
          },
        },
        {
          id: '002',
          since: new Date(Date.UTC(2017, 7, 18)),
          until: new Date(Date.UTC(2017, 7, 26)),
          takeTimesPerDay: 4,
          takeAmount: 2,
          medicine:
          {
            id: 'PA0577/195/001',
            name: 'Baclopar',
            code: 'Baclopar 10 mg Tablets',
            dosageForm: 'tablets',
            reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=PA0577/195/001&t=Baclopar%2010%20mg%20Tablets'
          },
        },
        {
          id: '003',
          since: new Date(Date.UTC(2017, 7, 24)),
          until: new Date(Date.UTC(2017, 7, 31)),
          takeTimesPerDay: 2,
          takeAmount: 1,
          medicine: 
          {
            id: 'EU/1/20/1448/001',
            name: 'Cabazitaxel',
            code: 'Cabazitaxel Accord',
            dosageForm: 'Concentrate for solution for infusion',
            reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=EU/1/20/1448/001&t=Cabazitaxel%20Accord'
          },
        }
      ]
    },
    {
      id: '003',
      since: new Date(Date.UTC(2017, 7, 27)),
      until: new Date(Date.UTC(2017, 7, 27)),
      prescriptionList: [
        {
          id: '001',
          since: new Date(Date.UTC(2017, 7, 20)),
          until: new Date(Date.UTC(2017, 7, 27)),
          takeTimesPerDay: 3,
          takeAmount: 4,
          medicine:
          {
            id: 'PA1077/093/007',
            name: 'Augmentin',
            code: 'Augmentin 250 mg/125 mg film-coated tablets',
            dosageForm: 'tablets',
            reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=PA1077/093/007&t=Augmentin%20%20250%20mg/125%20mg%20film-coated%20tablets'
          },
        },
        {
          id: '003',
          since: new Date(Date.UTC(2017, 7, 24)),
          until: new Date(Date.UTC(2017, 7, 31)),
          takeTimesPerDay: 2,
          takeAmount: 1,
          medicine: 
          {
            id: 'EU/1/20/1448/001',
            name: 'Cabazitaxel',
            code: 'Cabazitaxel Accord',
            dosageForm: 'Concentrate for solution for infusion',
            reference: 'http://www.hpra.ie/homepage/medicines/medicines-information/find-a-medicine/results/item?pano=EU/1/20/1448/001&t=Cabazitaxel%20Accord'
          },
        }
      ]
    }
  ];

  constructor(private httpClient: HttpClient) { }

  private get baseUrl() {
    const baseUrl = environment.apiBaseUrl || '/api';
    const prescriptionListUrl = environment.prescriptionListUrl || 'prescription-list';
    const patient = environment.patientId || 'test-patient';
    return `${baseUrl}/${prescriptionListUrl}/${patient}`;
  }

  private get entryUrl() {
    const prescriptionEntryUrl = environment.prescriptionEntryUrl || 'prescription';
    return `${this.baseUrl}/${prescriptionEntryUrl}`;
  }

  public getAllPrescriptions(): Observable<Prescription[]> {
    /*return this.httpClient
      .get(this.baseUrl)
      .pipe(
        map(response => (response as any).prescriptionList as Array<Prescription>)
      );*/
    return of(this.mockupPrescriptionList).pipe(delay(400));
  }

  public getOverlaps(): Observable<Array<Overlap>> {
    /*return this.httpClient
      .get(this.baseUrl)
      .pipe(
        map(response => (response as any).prescriptionOverlapList as Array<Overlap>)
      );*/
    return of(this.mockupOverlapList).pipe(delay(500));
  }

  public upsertPrescription(prescription: Prescription): Observable<Prescription> {
    /*let url = this.entryUrl;
    if (prescription.id) {
      url = `${url}/${prescription.id}`;
    } else {
      prescription.id = 'new-entry';
    }

    return this.httpClient
      .post(url, prescription)
      .pipe(map(response => response as Prescription));*/
    prescription = Object.assign({}, prescription);

    if (!prescription.id) {
      prescription.id = `${this.mockupPrescriptionList.length + 1}`;
      this.mockupPrescriptionList.push(prescription);
    }
    else {
      this.mockupPrescriptionList = this.mockupPrescriptionList.map(element => (element.id !== prescription.id) ? element : prescription);
    }

    return of(prescription).pipe(delay(300));
  }

  public deletePrescription(prescriptionId: string): Observable<boolean> {
    /*return this.httpClient
      .delete(`${this.entryUrl}/${prescriptionId}`)
      .pipe(
        map(_ => true),
        catchError(err => {
          if (err.error instanceof Error) {
            console.error(`Error deleting prescription ${prescriptionId}: ${err.error.message}`);
          } else {
            console.error(`Error deleting prescription ${prescriptionId}: ${err.status}: ${err.error}`);
          }
          return of(false);
        })
      );*/
    const exists = this.mockupPrescriptionList.findIndex(element => element.id === prescriptionId) >= 0;
    this.mockupPrescriptionList = this.mockupPrescriptionList.filter(element => (element.id !== prescriptionId));
    return of(exists).pipe(delay(200));
  }

  public getAvailableMedicine(): Observable<Array<Medicine>> {
    /*return this.httpClient
      .get(this.baseUrl)
      .pipe(map(response => (response as any).availableMedicineList as Array<Medicine>));*/
    return of(this.mockupMedicineList).pipe(delay(250));
  }

}
