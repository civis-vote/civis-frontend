import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentPolicyComponent } from './content-policy.component';

describe('ContentPolicyComponent', () => {
  let component: ContentPolicyComponent;
  let fixture: ComponentFixture<ContentPolicyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentPolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
