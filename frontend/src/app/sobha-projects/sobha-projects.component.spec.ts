import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SobhaProjectsComponent } from './sobha-projects.component';

describe('SobhaProjectsComponent', () => {
  let component: SobhaProjectsComponent;
  let fixture: ComponentFixture<SobhaProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SobhaProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SobhaProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
