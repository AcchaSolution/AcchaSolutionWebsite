import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullHomeCleaningComponent } from './full-home-cleaning.component';

describe('FullHomeCleaningComponent', () => {
  let component: FullHomeCleaningComponent;
  let fixture: ComponentFixture<FullHomeCleaningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullHomeCleaningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullHomeCleaningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
