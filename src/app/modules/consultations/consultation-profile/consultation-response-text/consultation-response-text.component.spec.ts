import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationResponseTextComponent } from './consultation-response-text.component';

describe('ConsultationResponseTextComponent', () => {
  let component: ConsultationResponseTextComponent;
  let fixture: ComponentFixture<ConsultationResponseTextComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultationResponseTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationResponseTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
