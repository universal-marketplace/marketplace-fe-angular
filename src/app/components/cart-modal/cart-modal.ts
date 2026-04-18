import {Component, inject, signal} from '@angular/core';
import {State} from '../../services/state';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './cart-modal.html',
  styleUrl: './cart-modal.css',
})
export class CartModal {
  state = inject(State);
  showSuccessToast = signal<boolean>(false);

  updateQuantity(listingId: number, quantity: number) {
    if (quantity > 0) {
      this.state.updateCartItemQuantity(listingId, quantity);
    }
  }

  buyItems() {
    // Show success toast
    this.showSuccessToast.set(true);

    // Clear cart
    this.state.clearCart();

    // Hide toast and close modal after 3 seconds
    setTimeout(() => {
      this.showSuccessToast.set(false);
      this.state.closeCartModal();
    }, 3000);
  }
}
