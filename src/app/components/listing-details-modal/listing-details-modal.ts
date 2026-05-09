import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {ListingService} from '../../features/marketplace/services/listing.service';
import {CartService} from '../../features/cart/services/cart.service';
import {AuthService} from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-listing-details-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, FormsModule],
  templateUrl: './listing-details-modal.html',
  styleUrl: './listing-details-modal.css',
})
export class ListingDetailsModal {
  listingService = inject(ListingService);
  cartService = inject(CartService);
  authService = inject(AuthService);

  quantity = 1;
  bookingDate = '';

  addToCart() {
    const listing = this.listingService.selectedListing();
    if (listing) {
      if (listing.type === 'SERVICE') {
        if (!this.bookingDate) return;
        this.quantity = 1; // Enforce quantity 1 for services
      }
      const bDate = this.bookingDate && this.bookingDate.trim() !== '' ? this.bookingDate : undefined;
      this.cartService.addToCart(listing, this.quantity, bDate).subscribe();
      this.listingService.closeListingDetails();
    }
  }
}
