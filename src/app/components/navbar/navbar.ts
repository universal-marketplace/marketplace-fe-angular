import {Component, inject, OnInit} from '@angular/core';
import { UIService } from '../../core/services/ui.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { ListingService } from '../../features/marketplace/services/listing.service';
import { CartService } from '../../features/cart/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { OrderService } from '../../core/services/order.service';
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
export class Navbar implements OnInit {
  ui = inject(UIService);
  auth = inject(AuthService);
  listingService = inject(ListingService);
  cartService = inject(CartService);
  notificationService = inject(NotificationService);
  orderService = inject(OrderService);

  isDropdownOpen = false;
  isNotificationsOpen = false;

  ngOnInit() {
    if (this.auth.currentUser()) {
      this.notificationService.loadNotifications();
    }
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.listingService.setSearchQuery(target.value);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.isNotificationsOpen = false;
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.isDropdownOpen = false;
    if (this.isNotificationsOpen) {
      this.notificationService.loadNotifications();
    }
  }

  openSettings() {
    this.isDropdownOpen = false;
    this.ui.isAccountSettingsModalOpen.set(true);
  }

  switchAccount() {
    this.isDropdownOpen = false;
    this.auth.logout();
    this.ui.openAuthModal();
  }

  logout() {
    this.isDropdownOpen = false;
    this.auth.logout();
  }

  markRead(id: number) {
    this.notificationService.markAsRead(id);
  }
}
