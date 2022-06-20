import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SatisfactionRatingSelectionComponent } from './satisfaction-rating-selection.component';

describe('SatisfactionRatingSelectionComponent', () => {
  let component: SatisfactionRatingSelectionComponent;
  let fixture: ComponentFixture<SatisfactionRatingSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SatisfactionRatingSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SatisfactionRatingSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
