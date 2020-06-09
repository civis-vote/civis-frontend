import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationListComponent } from './consultation-list.component';

describe('ConsultationListComponent', () => {
  let component: ConsultationListComponent;
  let fixture: ComponentFixture<ConsultationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
