import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {User} from '../../models';
import {State} from '../../services/state';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-account-settings-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './account-settings-modal.html',
  styleUrl: './account-settings-modal.css',
})
export class AccountSettingsModal {
  @Input() isOpen = false;
  @Input() set user(value: User | null) {
    this._user = value;
    if (value) {
      this.resetForm();
    }
  }
  get user(): User | null {
    return this._user;
  }
  @Output() isOpenChange = new EventEmitter<boolean>();

  state = inject(State);

  private _user: User | null = null;

  formData = {
    currentEmail: '',
    newEmail: '',
    currentPassword: '',
    newPassword: ''
  };

  errorMessage = '';
  successMessage = '';

  resetForm() {
    this.formData = {
      currentEmail: '',
      newEmail: '',
      currentPassword: '',
      newPassword: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
    this.resetForm();
  }

  isFormValid(): boolean {
    const isEmailChangeValid = this.formData.currentEmail && this.formData.newEmail && this.formData.newEmail.includes('@');
    const isPasswordChangeValid = this.formData.currentPassword && this.formData.newPassword;

    return !!(isEmailChangeValid || isPasswordChangeValid);
  }

  onSubmit() {
    if (!this.user) return;

    this.errorMessage = '';
    this.successMessage = '';

    const updates: Partial<User> = {};
    let hasChanges = false;

    // Handle email change
    if (this.formData.currentEmail || this.formData.newEmail) {
      if (this.formData.currentEmail !== this.user.email) {
        this.errorMessage = 'Aktualny adres e-mail jest nieprawidłowy.';
        return;
      }
      if (!this.formData.newEmail.includes('@')) {
        this.errorMessage = 'Nowy adres e-mail jest nieprawidłowy.';
        return;
      }
      updates.email = this.formData.newEmail;
      hasChanges = true;
    }

    // Handle password change
    if (this.formData.currentPassword || this.formData.newPassword) {
      if (this.formData.currentPassword !== this.user.password) {
        this.errorMessage = 'Aktualne hasło jest nieprawidłowe.';
        return;
      }
      if (!this.formData.newPassword) {
        this.errorMessage = 'Nowe hasło nie może być puste.';
        return;
      }
      updates.password = this.formData.newPassword;
      hasChanges = true;
    }

    if (hasChanges) {
      this.state.updateUser(this.user.id, updates);
      this.successMessage = 'Zmiany zostały zapisane pomyślnie.';

      // Reset form fields but keep modal open to show success message
      setTimeout(() => {
        this.close();
      }, 2000);
    }
  }
}
