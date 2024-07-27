import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SatisfactionRatingDistributionComponent } from './satisfaction-rating-distribution.component';

describe('SatisfactionRatingDistributionComponent', () => {
  let component: SatisfactionRatingDistributionComponent;
  let fixture: ComponentFixture<SatisfactionRatingDistributionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SatisfactionRatingDistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SatisfactionRatingDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
