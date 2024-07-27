import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationPublicResponsesComponent } from './consultation-public-responses.component';

describe('ConsultationPublicResponsesComponent', () => {
  let component: ConsultationPublicResponsesComponent;
  let fixture: ComponentFixture<ConsultationPublicResponsesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultationPublicResponsesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationPublicResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
