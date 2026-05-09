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

  activeTab = signal<'login' | 'register'>('login');
  loginError = signal<string>('');
  regError = signal<string>('');

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
      this.auth.loginWithCredentials(this.loginData.email, this.loginData.password).subscribe(res => {
        if (res) {
          this.ui.closeAuthModal();
        } else {
          this.loginError.set('Błędny email lub hasło.');
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

    this.auth.register(this.regData.name, this.regData.email, this.regData.password).subscribe(user => {
      if (user) {
        this.ui.closeAuthModal();
        // Reset form
        this.regData = {
          name: '',
          email: '',
          password: '',
          passwordConfirm: ''
        };
        this.activeTab.set('login');
      } else {
        this.regError.set('Wystąpił błąd podczas rejestracji.');
      }
    });
  }
}
