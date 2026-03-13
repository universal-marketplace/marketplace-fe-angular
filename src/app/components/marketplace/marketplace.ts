import {Component, inject} from '@angular/core';
import {State} from '../../services/state';
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
  state = inject(State);
}
