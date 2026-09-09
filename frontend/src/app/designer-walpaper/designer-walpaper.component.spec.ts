import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignerWalpaperComponent } from './designer-walpaper.component';

describe('DesignerWalpaperComponent', () => {
  let component: DesignerWalpaperComponent;
  let fixture: ComponentFixture<DesignerWalpaperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignerWalpaperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignerWalpaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
