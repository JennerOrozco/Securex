import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmtpSettingsComponent } from './smtp-settings';

describe('SmtpSettingsComponent', () => {
  let component: SmtpSettingsComponent;
  let fixture: ComponentFixture<SmtpSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmtpSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmtpSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
