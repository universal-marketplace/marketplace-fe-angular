import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingsModal } from './account-settings-modal';

describe('AccountSettingsModal', () => {
  let component: AccountSettingsModal;
  let fixture: ComponentFixture<AccountSettingsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSettingsModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSettingsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
