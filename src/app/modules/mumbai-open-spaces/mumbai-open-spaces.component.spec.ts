import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MumbaiOpenSpacesComponent } from './mumbai-open-spaces.component';

describe('MumbaiOpenSpacesComponent', () => {
  let component: MumbaiOpenSpacesComponent;
  let fixture: ComponentFixture<MumbaiOpenSpacesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MumbaiOpenSpacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MumbaiOpenSpacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
