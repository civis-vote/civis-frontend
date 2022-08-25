import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfaneModalComponent } from './profane-modal.component';

describe('ConfirmationModalComponent', () => {
  let component: ProfaneModalComponent;
  let fixture: ComponentFixture<ProfaneModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfaneModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfaneModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
