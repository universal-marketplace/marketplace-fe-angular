import {ChangeDetectorRef, Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ListingService} from '../../features/marketplace/services/listing.service';
import {ProfileService} from '../../features/profile/services/profile.service';
import {AuthService} from '../../features/auth/services/auth.service';
import {OrderService} from '../../core/services/order.service';
import {UIService} from '../../core/services/ui.service';
import {Listing, User, OrderStatus} from '../../models';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ListingCard} from '../listing-card/listing-card';
import {EditProfileModal} from '../edit-profile-modal/edit-profile-modal';
import { MatIconModule } from '@angular/material/icon';
import {catchError, of} from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, ListingCard, EditProfileModal],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  route = inject(ActivatedRoute);
  listingService = inject(ListingService);
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  orderService = inject(OrderService);
  ui = inject(UIService);
  cdr = inject(ChangeDetectorRef);

  profileUser = signal<User | undefined>(undefined);
  currentProfileId = signal<number | null>(null);
  activeTab = signal<'listings' | 'reviews' | 'purchases' | 'sales'>('listings');

  displayUser = computed(() => {
    const current = this.authService.currentUser();
    const profile = this.profileUser();
    const id = this.currentProfileId();

    if (current && id === current.id) {
      return current;
    }
    return profile;
  });

  isOwnProfile = computed(() => {
    const current = this.authService.currentUser();
    const id = this.currentProfileId();
    return !!(current && id === current.id);
  });

  isEditModalOpen = false;
  listingToDelete: number | null = null;

  replyingTo: number | null = null;
  replyText = '';

  newReview = {
    rating: 5,
    comment: ''
  };
  hoverRating = 0;

  listings = computed(() => this.profileService.activeProfileListings());
  reviews = computed(() => this.profileService.activeProfileReviews());
  buyerOrders = computed(() => this.orderService.buyerOrders());
  sellerOrders = computed(() => this.orderService.sellerOrders());

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = Number(idParam);
        this.currentProfileId.set(id);
        
        // Reset state for new profile
        this.profileUser.set(undefined);
        this.profileService.resetProfileData();
        this.orderService.buyerOrders.set([]);
        this.orderService.sellerOrders.set([]);

        this.profileService.fetchUserListings(id);
        this.profileService.fetchUserReviews(id);

        this.authService.getUserById(id).pipe(
          catchError(err => {
            console.error('Błąd podczas pobierania użytkownika:', err);
            return of(null);
          })
        ).subscribe(u => {
          if (u) {
            this.profileUser.set(u);
            if (this.isOwnProfile()) {
               this.orderService.loadBuyerOrders();
               this.orderService.loadSellerOrders();
            }
          }
          this.cdr.detectChanges();
        });
      }
    });
  }

  openAddListingModal() {
    this.ui.openListingModal();
  }

  openEditListingModal(listing: Listing) {
    this.ui.openListingModal(listing);
  }

  deleteListing(id: number) {
    this.listingToDelete = id;
  }

  confirmDelete() {
    if (this.listingToDelete) {
      this.listingService.deleteListing(this.listingToDelete).subscribe();
      this.listingToDelete = null;
    }
  }

  submitReply(reviewId: number) {
    if (this.replyText.trim()) {
      this.profileService.addReviewReply(reviewId, this.replyText.trim()).subscribe();
      this.replyingTo = null;
      this.replyText = '';
    }
  }

  submitReview() {
    if (this.isOwnProfile()) {
        alert('Nie możesz wystawić opinii samemu sobie.');
        return;
    }
    const user = this.displayUser();
    if (user && this.newReview.comment.trim()) {
      this.profileService.addReview(user.id, this.newReview.rating, this.newReview.comment.trim()).subscribe();
      this.newReview = { rating: 5, comment: '' };
    }
  }

  updateStatus(orderId: number, status: OrderStatus, trackingNumber?: string) {
    this.orderService.updateOrderStatus(orderId, status, trackingNumber).subscribe();
  }

  trackingInputs: Record<number, string> = {};
}
