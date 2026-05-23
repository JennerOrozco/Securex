import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationTest } from './notification-test';

describe('NotificationTest', () => {
  let component: NotificationTest;
  let fixture: ComponentFixture<NotificationTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
