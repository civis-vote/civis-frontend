import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmEmailModalComponent } from './confirm-email-modal.component';

describe('ConfirmEmailModalComponent', () => {
  let component: ConfirmEmailModalComponent;
  let fixture: ComponentFixture<ConfirmEmailModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmEmailModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmEmailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
