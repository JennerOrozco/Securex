import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PushSettingsComponent } from './push-settings';

describe('PushSettingsComponent', () => {
  let component: PushSettingsComponent;
  let fixture: ComponentFixture<PushSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PushSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PushSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
