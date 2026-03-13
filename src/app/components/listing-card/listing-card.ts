import {Component, inject, Input} from '@angular/core';
import {Listing} from '../../models';
import {State} from '../../services/state';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './listing-card.html',
  styleUrl: './listing-card.css',
})
export class ListingCard {
  @Input({ required: true }) listing!: Listing;
  @Input() viewMode: 'grid' | 'list' = 'grid';

  state = inject(State);

  openDetails() {
    this.state.openListingDetails(this.listing);
  }
}
