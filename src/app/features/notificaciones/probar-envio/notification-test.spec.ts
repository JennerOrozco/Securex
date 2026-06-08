import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationTestComponent } from './notification-test';

describe('NotificationTestComponent', () => {
  let component: NotificationTestComponent;
  let fixture: ComponentFixture<NotificationTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
