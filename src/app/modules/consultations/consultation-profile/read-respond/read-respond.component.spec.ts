import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadRespondComponent } from './read-respond.component';

describe('ReadRespondComponent', () => {
  let component: ReadRespondComponent;
  let fixture: ComponentFixture<ReadRespondComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadRespondComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadRespondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
