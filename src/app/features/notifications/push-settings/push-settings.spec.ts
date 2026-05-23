import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PushSettings } from './push-settings';

describe('PushSettings', () => {
  let component: PushSettings;
  let fixture: ComponentFixture<PushSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PushSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PushSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
