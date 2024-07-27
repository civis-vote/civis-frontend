import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FailureComponent } from './failure.component';

describe('FailureComponent', () => {
  let component: FailureComponent;
  let fixture: ComponentFixture<FailureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FailureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FailureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
