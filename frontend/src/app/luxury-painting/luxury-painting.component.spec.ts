import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LuxuryPaintingComponent } from './luxury-painting.component';

describe('LuxuryPaintingComponent', () => {
  let component: LuxuryPaintingComponent;
  let fixture: ComponentFixture<LuxuryPaintingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LuxuryPaintingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LuxuryPaintingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
