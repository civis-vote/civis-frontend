import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseContainerComponent } from './response-container.component';

describe('ResponseContainerComponent', () => {
  let component: ResponseContainerComponent;
  let fixture: ComponentFixture<ResponseContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponseContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponseContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
