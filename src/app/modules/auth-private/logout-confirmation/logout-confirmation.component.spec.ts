import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutConfirmationComponent } from './logout-confirmation.component';

describe('LogoutConfirmationComponent', () => {
  let component: LogoutConfirmationComponent;
  let fixture: ComponentFixture<LogoutConfirmationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LogoutConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
