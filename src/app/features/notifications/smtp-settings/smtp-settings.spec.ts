import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmtpSettings } from './smtp-settings';

describe('SmtpSettings', () => {
  let component: SmtpSettings;
  let fixture: ComponentFixture<SmtpSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmtpSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmtpSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
