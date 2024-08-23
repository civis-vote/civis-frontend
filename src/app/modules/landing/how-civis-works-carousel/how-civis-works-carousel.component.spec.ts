import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { HowCivisWorksCarouselComponent } from './how-civis-works-carousel.component';

describe('HowCivisWorksCarouselComponent', () => {
  let component: HowCivisWorksCarouselComponent;
  let fixture: ComponentFixture<HowCivisWorksCarouselComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HowCivisWorksCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HowCivisWorksCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
