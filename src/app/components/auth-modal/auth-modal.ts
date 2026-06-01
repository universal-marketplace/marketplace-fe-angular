import {Component, inject, signal} from '@angular/core';
import {AuthService} from '../../features/auth/services/auth.service';
import {UIService} from '../../core/services/ui.service';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css',
})
export class AuthModal {
  auth = inject(AuthService);
  ui = inject(UIService);
  router = inject(Router);

  activeTab = signal<'login' | 'register' | 'verify'>('login');
  loginError = signal<string>('');
  regError = signal<string>('');
  verifyError = signal<string>('');
  verifySuccess = signal<string>('');

  verifyData = {
    email: '',
    code: ''
  };

  loginData = {
    email: '',
    password: ''
  };

  regData = {
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  };

  onLogin() {
    this.loginError.set('');
    if (this.loginData.email && this.loginData.password) {
      this.auth.loginWithCredentials(this.loginData.email, this.loginData.password).subscribe({
        next: (res) => {
          if (res) {
            this.ui.closeAuthModal();
          }
        },
        error: (err) => {
          if (err.status === 403 || (err.message && err.message.includes('Konto nie jest aktywowane')) || (err.error && err.error.message && err.error.message.includes('Konto nie jest aktywowane'))) {
            this.verifyData.email = this.loginData.email;
            this.activeTab.set('verify');
            this.verifySuccess.set('');
            this.verifyError.set('');
            this.onResendVerification();
          } else {
            this.loginError.set(err.error?.message || err.message || 'Błędny email lub hasło.');
          }
        }
      });
    }
  }

  onRegister() {
    this.regError.set('');

    if (!this.regData.name || !this.regData.email || !this.regData.password) {
      this.regError.set('Wszystkie pola są wymagane.');
      return;
    }

    if (this.regData.password.length < 6) {
      this.regError.set('Hasło musi mieć co najmniej 6 znaków.');
      return;
    }

    if (this.regData.password !== this.regData.passwordConfirm) {
      this.regError.set('Hasła nie są identyczne.');
      return;
    }

    this.auth.register(this.regData.name, this.regData.email, this.regData.password).subscribe({
      next: (user) => {
        if (user) {
          this.verifyData.email = this.regData.email;
          this.activeTab.set('verify');
          this.verifySuccess.set('Rejestracja pomyślna. Sprawdź swoją skrzynkę e-mail i wprowadź kod aktywacyjny.');
          this.verifyError.set('');
          // Reset form
          this.regData = {
            name: '',
            email: '',
            password: '',
            passwordConfirm: ''
          };
        }
      },
      error: (err) => {
        this.regError.set(err.error?.message || err.message || 'Wystąpił błąd podczas rejestracji.');
      }
    });
  }

  onVerify() {
    this.verifyError.set('');
    this.verifySuccess.set('');
    
    if (!this.verifyData.email || !this.verifyData.code) {
      this.verifyError.set('Wprowadź kod weryfikacyjny.');
      return;
    }

    this.auth.verify(this.verifyData.email, this.verifyData.code).subscribe({
      next: () => {
        this.verifySuccess.set('Konto zostało pomyślnie aktywowane. Możesz się teraz zalogować.');
        setTimeout(() => {
          this.activeTab.set('login');
          this.loginData.email = this.verifyData.email;
          this.loginData.password = '';
        }, 3000);
      },
      error: (err) => {
        this.verifyError.set(err.message || 'Nieprawidłowy kod weryfikacyjny.');
      }
    });
  }

  onResendVerification() {
    this.verifyError.set('');
    this.verifySuccess.set('');

    if (!this.verifyData.email) {
      this.verifyError.set('Brak adresu e-mail do wysyłki.');
      return;
    }

    this.auth.resendVerification(this.verifyData.email).subscribe({
      next: () => {
        this.verifySuccess.set('Nowy kod weryfikacyjny został wysłany.');
      },
      error: (err) => {
        this.verifyError.set(err.message || 'Wystąpił błąd podczas wysyłania kodu.');
      }
    });
  }
}
