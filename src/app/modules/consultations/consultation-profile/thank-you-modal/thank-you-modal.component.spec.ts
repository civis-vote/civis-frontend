import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThankYouModalComponent } from './thank-you-modal.component';

describe('ThankYouModalComponent', () => {
  let component: ThankYouModalComponent;
  let fixture: ComponentFixture<ThankYouModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThankYouModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThankYouModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
