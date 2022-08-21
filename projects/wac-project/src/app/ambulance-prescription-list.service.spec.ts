import { TestBed } from '@angular/core/testing';

import { AmbulancePrescriptionListService } from './ambulance-prescription-list.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Prescription } from './store/prescription/prescription.model';
import { environment } from 'src/environments/environment';

describe('AmbulancePrescriptionListService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [AmbulancePrescriptionListService]
  }));

  it('should be created', () => {
    const service: AmbulancePrescriptionListService = TestBed.get(AmbulancePrescriptionListService);
    expect(service).toBeTruthy();
  });

  it(`should get to retrieving API for prescriptions`, () => {
    // given
    const subjectUnderTest: AmbulancePrescriptionListService = TestBed.get(
      AmbulancePrescriptionListService
    );

    // when
    subjectUnderTest.getAllPrescriptions().subscribe(_ => { });

    // then
    const testingHttpClient: HttpTestingController = TestBed.get(
      HttpTestingController
    );
    const testRequest = testingHttpClient.expectOne(
      `${environment.apiBaseUrl}/${environment.prescriptionListUrl}/${environment.patientId}`
    );
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush({});
    testingHttpClient.verify();
  });

  it(`should get to retrieving API for overlaps`, () => {
    // given
    const subjectUnderTest: AmbulancePrescriptionListService = TestBed.get(
      AmbulancePrescriptionListService
    );

    // when
    subjectUnderTest.getOverlaps().subscribe(_ => { });

    // then
    const testingHttpClient: HttpTestingController = TestBed.get(
      HttpTestingController
    );
    const testRequest = testingHttpClient.expectOne(
      `${environment.apiBaseUrl}/${environment.prescriptionListUrl}/${environment.patientId}`
    );
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush({});
    testingHttpClient.verify();
  });

  it(`should post to creating API for prescriptions if id is not specified`, () => {
    // given
    const prescription: Prescription = {
      id: undefined,
      since: null,
      until: null,
      takeTimesPerDay: 4,
      takeAmount: 1,
      medicine: {
        id: 'test-id',
        name: 'test-name',
        code: 'test-code',
        dosageForm: 'test-dosageForm',
        reference: 'test-reference'
      }
    };
    const subjectUnderTest: AmbulancePrescriptionListService = TestBed.get(
      AmbulancePrescriptionListService
    );

    // when
    subjectUnderTest.upsertPrescription(prescription).subscribe(_ => { });

    // then
    const testingHttpClient: HttpTestingController = TestBed.get(
      HttpTestingController
    );
    const testRequest = testingHttpClient.expectOne(
      `${environment.apiBaseUrl}/${environment.prescriptionListUrl}/${environment.patientId}/${environment.prescriptionEntryUrl}`
    );
    expect(testRequest.request.method).toBe('POST');
    testRequest.flush({});
    testingHttpClient.verify();
  });

  it(`should post to updating API for prescriptions if id is specified`, () => {
    // given
    const prescription: Prescription = {
      id: '1',
      since: null,
      until: null,
      takeTimesPerDay: 4,
      takeAmount: 1,
      medicine: {
        id: 'test-id',
        name: 'test-name',
        code: 'test-code',
        dosageForm: 'test-dosageForm',
        reference: 'test-reference'
      }
    };
    const subjectUnderTest: AmbulancePrescriptionListService = TestBed.get(
      AmbulancePrescriptionListService
    );

    // when
    subjectUnderTest.upsertPrescription(prescription).subscribe(_ => { });

    // then
    const testingHttpClient: HttpTestingController = TestBed.get(
      HttpTestingController
    );
    const testRequest = testingHttpClient.expectOne(
      `${environment.apiBaseUrl}/${environment.prescriptionListUrl}/${environment.patientId}/${environment.prescriptionEntryUrl}/${prescription.id}`
    );
    expect(testRequest.request.method).toBe('POST');
    testRequest.flush({});
    testingHttpClient.verify();
  });

  it(`should delete to deleting API for prescriptions`, () => {
    // given
    const testId = 'test-id';
    const subjectUnderTest: AmbulancePrescriptionListService = TestBed.get(
      AmbulancePrescriptionListService
    );

    // when
    subjectUnderTest.deletePrescription(testId).subscribe(_ => { });

    // then
    const testingHttpClient: HttpTestingController = TestBed.get(
      HttpTestingController
    );
    const testRequest = testingHttpClient.expectOne(
      `${environment.apiBaseUrl}/${environment.prescriptionListUrl}/${environment.patientId}/${environment.prescriptionEntryUrl}/${testId}`
    );
    expect(testRequest.request.method).toBe('DELETE');
    testRequest.flush({});
    testingHttpClient.verify();
  });

  it(`should get to retrieving API for medicine`, () => {
    // given
    const subjectUnderTest: AmbulancePrescriptionListService = TestBed.get(
      AmbulancePrescriptionListService
    );

    // when
    subjectUnderTest.getAvailableMedicine().subscribe(_ => { });

    // then
    const testingHttpClient: HttpTestingController = TestBed.get(
      HttpTestingController
    );
    const testRequest = testingHttpClient.expectOne(
      `${environment.apiBaseUrl}/${environment.prescriptionListUrl}/${environment.patientId}`
    );
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush({});
    testingHttpClient.verify();
  });
});
