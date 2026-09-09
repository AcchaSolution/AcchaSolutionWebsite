import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalAgreementComponent } from './rental-agreement.component';

describe('RentalAgreementComponent', () => {
  let component: RentalAgreementComponent;
  let fixture: ComponentFixture<RentalAgreementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalAgreementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RentalAgreementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
