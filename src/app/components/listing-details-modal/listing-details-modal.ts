import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {State} from '../../services/state';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-listing-details-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './listing-details-modal.html',
  styleUrl: './listing-details-modal.css',
})
export class ListingDetailsModal {
  state = inject(State);

  addToCart() {
    const listing = this.state.selectedListing();
    if (listing) {
      this.state.addToCart(listing);
      this.state.closeListingDetails();
    }
  }
}
