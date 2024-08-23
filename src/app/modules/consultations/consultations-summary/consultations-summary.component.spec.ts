import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationsSummaryComponent } from './consultations-summary.component';

describe('ConsultationsSummaryComponent', () => {
  let component: ConsultationsSummaryComponent;
  let fixture: ComponentFixture<ConsultationsSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultationsSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
