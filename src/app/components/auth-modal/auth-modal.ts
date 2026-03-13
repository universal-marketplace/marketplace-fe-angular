import {Component, inject, signal} from '@angular/core';
import {State} from '../../services/state';
import {Router} from '@angular/router';
import {Role} from '../../models';
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
  state = inject(State);
  router = inject(Router);

  activeTab = signal<'login' | 'register'>('login');
  loginError = signal<boolean>(false);

  loginData = {
    email: '',
    password: ''
  };

  regData = {
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'user' as Role
  };

  onLogin() {
    this.loginError.set(false);
    if (this.loginData.email && this.loginData.password) {
      const success = this.state.loginWithCredentials(this.loginData.email, this.loginData.password);
      if (success) {
        this.loginData = { email: '', password: '' };
        this.router.navigate(['/']);
      } else {
        this.loginError.set(true);
      }
    }
  }

  onRegister() {
    if (this.regData.name && this.regData.email && this.regData.password && this.regData.password === this.regData.passwordConfirm) {
      this.state.register(this.regData.name, this.regData.email, this.regData.role, this.regData.password);
      // Reset form
      this.regData = {
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        role: 'user'
      };
      this.activeTab.set('login');
      this.router.navigate(['/']);
    }
  }
}
