import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussEngageComponent } from './discuss-engage.component';

describe('DiscussEngageComponent', () => {
  let component: DiscussEngageComponent;
  let fixture: ComponentFixture<DiscussEngageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscussEngageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscussEngageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
