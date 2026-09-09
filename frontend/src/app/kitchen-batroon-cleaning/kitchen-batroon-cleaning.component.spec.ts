import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenBatroonCleaningComponent } from './kitchen-batroon-cleaning.component';

describe('KitchenBatroonCleaningComponent', () => {
  let component: KitchenBatroonCleaningComponent;
  let fixture: ComponentFixture<KitchenBatroonCleaningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitchenBatroonCleaningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KitchenBatroonCleaningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
