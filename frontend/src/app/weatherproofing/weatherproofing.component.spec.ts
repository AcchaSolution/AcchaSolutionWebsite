import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherproofingComponent } from './weatherproofing.component';

describe('WeatherproofingComponent', () => {
  let component: WeatherproofingComponent;
  let fixture: ComponentFixture<WeatherproofingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherproofingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherproofingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
