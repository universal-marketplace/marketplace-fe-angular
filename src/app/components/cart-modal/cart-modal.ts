import {Component, inject, signal} from '@angular/core';
import {CartService} from '../../features/cart/services/cart.service';
import {UIService} from '../../core/services/ui.service';
import {ListingService} from '../../features/marketplace/services/listing.service';
import {NotificationService} from '../../core/services/notification.service';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {DeliveryMethod} from '../../models';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './cart-modal.html',
  styleUrl: './cart-modal.css',
})
export class CartModal {
  cartService = inject(CartService);
  ui = inject(UIService);
  listingService = inject(ListingService);
  notificationService = inject(NotificationService);
  
  showSuccessToast = signal<boolean>(false);
  deliveryMethod = signal<DeliveryMethod>('SHIPPING');

  updateQuantity(listingId: number, quantity: number) {
    if (quantity > 0) {
      this.cartService.updateCartItemQuantity(listingId, quantity)?.subscribe();
    }
  }

  removeItem(listingId: number) {
    this.cartService.removeFromCart(listingId).subscribe();
  }

  buyItems() {
    // Only send delivery method if the cart has physical items
    const method = this.cartService.hasPhysicalItems() ? this.deliveryMethod() : undefined;
    
    this.cartService.checkout(method).subscribe(() => {
      // Refresh listings after purchase to show updated stock
      this.listingService.fetchListings();
      
      // Reload notifications to show order confirmation
      this.notificationService.loadNotifications();
      
      this.showSuccessToast.set(true);
      setTimeout(() => {
        this.showSuccessToast.set(false);
        this.ui.closeCartModal();
      }, 3000);
    });
  }
}
