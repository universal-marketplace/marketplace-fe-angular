import {Component, inject} from '@angular/core';
import {State} from '../../services/state';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  state = inject(State);
  isDropdownOpen = false;

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.state.setSearchQuery(target.value);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  openSettings() {
    this.isDropdownOpen = false;
    this.state.isAccountSettingsModalOpen.set(true);
  }

  switchAccount() {
    this.isDropdownOpen = false;
    this.state.logout();
    this.state.openAuthModal();
  }

  logout() {
    this.isDropdownOpen = false;
    this.state.logout();
  }
}
