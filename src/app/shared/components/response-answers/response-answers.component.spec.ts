import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseAnswersComponent } from './response-answers.component';

describe('ResponseAnswersComponent', () => {
  let component: ResponseAnswersComponent;
  let fixture: ComponentFixture<ResponseAnswersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponseAnswersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponseAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
