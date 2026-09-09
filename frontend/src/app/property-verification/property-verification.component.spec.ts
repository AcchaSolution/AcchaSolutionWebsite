import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyVerificationComponent } from './property-verification.component';

describe('PropertyVerificationComponent', () => {
  let component: PropertyVerificationComponent;
  let fixture: ComponentFixture<PropertyVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
