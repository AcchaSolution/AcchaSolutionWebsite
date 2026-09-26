import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EkhataComponent } from './ekhata.component';

describe('EkhataComponent', () => {
  let component: EkhataComponent;
  let fixture: ComponentFixture<EkhataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EkhataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EkhataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
