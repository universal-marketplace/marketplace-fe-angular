import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {State} from './services/state';
import {Navbar} from './components/navbar/navbar';
import {AuthModal} from './components/auth-modal/auth-modal';
import {ListingDetailsModal} from './components/listing-details-modal/listing-details-modal';
import {AccountSettingsModal} from './components/account-settings-modal/account-settings-modal';
import {CartModal} from './components/cart-modal/cart-modal';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, AuthModal, ListingDetailsModal, AccountSettingsModal, CartModal, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  state = inject(State);

  ngOnInit() {
    // Initialize theme based on system preference or saved state
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.state.isDarkMode.set(true);
      document.documentElement.classList.add('dark');
    }
  }
}
