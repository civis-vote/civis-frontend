import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageContentRendererComponent } from './page-content-renderer.component';

describe('PageContentRendererComponent', () => {
  let component: PageContentRendererComponent;
  let fixture: ComponentFixture<PageContentRendererComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PageContentRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageContentRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
