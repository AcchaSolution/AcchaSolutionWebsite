import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SofaCarpetCleaningComponent } from './sofa-carpet-cleaning.component';

describe('SofaCarpetCleaningComponent', () => {
  let component: SofaCarpetCleaningComponent;
  let fixture: ComponentFixture<SofaCarpetCleaningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SofaCarpetCleaningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SofaCarpetCleaningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
