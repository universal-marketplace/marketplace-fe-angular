import { Injectable, signal, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UIService {
  isDarkMode = signal<boolean>(false);
  viewMode = signal<'grid' | 'list'>('grid');
  isAuthModalOpen = signal<boolean>(false);
  isAccountSettingsModalOpen = signal<boolean>(false);
  isCartModalOpen = signal<boolean>(false);

  toggleTheme() {
    this.isDarkMode.update(v => !v);
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setViewMode(mode: 'grid' | 'list') { this.viewMode.set(mode); }
  openAuthModal() { this.isAuthModalOpen.set(true); }
  closeAuthModal() { this.isAuthModalOpen.set(false); }
  openAccountSettingsModal() { this.isAccountSettingsModalOpen.set(true); }
  closeAccountSettingsModal() { this.isAccountSettingsModalOpen.set(false); }
  openCartModal() { this.isCartModalOpen.set(true); }
  closeCartModal() { this.isCartModalOpen.set(false); }
}
