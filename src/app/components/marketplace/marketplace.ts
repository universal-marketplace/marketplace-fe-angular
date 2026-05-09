import {Component, inject} from '@angular/core';
import { ListingService } from '../../features/marketplace/services/listing.service';
import { UIService } from '../../core/services/ui.service';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {ListingCard} from '../listing-card/listing-card';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, MatIconModule, ListingCard],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.css',
})
export class Marketplace {
  listingService = inject(ListingService);
  ui = inject(UIService);
}
