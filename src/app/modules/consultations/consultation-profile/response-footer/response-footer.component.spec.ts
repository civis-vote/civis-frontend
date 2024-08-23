import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseFooterComponent } from './response-footer.component';

describe('ResponseFooterComponent', () => {
  let component: ResponseFooterComponent;
  let fixture: ComponentFixture<ResponseFooterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponseFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponseFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
