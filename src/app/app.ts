import {ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {State} from './services/state';
import {Navbar} from './components/navbar/navbar';
import {AuthModal} from './components/auth-modal/auth-modal';
import {ListingDetailsModal} from './components/listing-details-modal/listing-details-modal';
import {AccountSettingsModal} from './components/account-settings-modal/account-settings-modal';
import {CartModal} from './components/cart-modal/cart-modal';
import { MatIconModule } from '@angular/material/icon';
import {isPlatformBrowser} from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, AuthModal, ListingDetailsModal, AccountSettingsModal, CartModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  state = inject(State);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.state.isDarkMode.set(true);
        document.documentElement.classList.add('dark');
      }
    }
  }
}
