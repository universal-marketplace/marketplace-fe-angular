import {ChangeDetectorRef, Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {State} from '../../services/state';
import {Listing, User} from '../../models';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ListingCard} from '../listing-card/listing-card';
import {EditProfileModal} from '../edit-profile-modal/edit-profile-modal';
import {ListingModal} from '../listing-modal/listing-modal';
import { MatIconModule } from '@angular/material/icon';
import {catchError, of} from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, ListingCard, EditProfileModal, ListingModal],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit { 
  route = inject(ActivatedRoute);
  state = inject(State);
  cdr = inject(ChangeDetectorRef);

  // Sygnał przechowujący dane przeglądanego profilu
  profileUser = signal<User | undefined>(undefined);
  
  // Zawsze wybieramy najświeższe dane: jeśli to nasz profil, bierzemy z currentUser()
  displayUser = computed(() => {
    const current = this.state.currentUser();
    const profile = this.profileUser();
    if (current && profile && current.id === profile.id) {
      return current; // Tutaj są dane po edycji
    }
    return profile;
  });

  isOwnProfile = computed(() => {
    const current = this.state.currentUser();
    const profile = this.profileUser();
    return !!(current && profile && current.id === profile.id);
  });

  isEditModalOpen = false;
  isListingModalOpen = false;
  editingListing: Listing | null = null;
  listingToDelete: number | null = null;

  replyingTo: number | null = null;
  replyText = '';

  newReview = {
    rating: 5,
    comment: ''
  };
  hoverRating = 0;

  listings = computed(() => this.state.getUserListings(0));
  reviews = computed(() => this.state.getUserReviews(0));

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = Number(idParam);
        this.profileUser.set(undefined);
        this.state.loadProfileData(id);

        this.state.fetchUser(id).pipe(
          catchError(err => {
            console.error('Błąd podczas pobierania użytkownika:', err);
            return of(undefined);
          })
        ).subscribe(u => {
          if (u) {
            if (!u.avatarUrl) {
              u.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`;
            }
            this.profileUser.set(u);
          }
          this.cdr.detectChanges();
        });
      }
    });
  }

  openAddListingModal() {
    this.editingListing = null;
    this.isListingModalOpen = true;
  }

  openEditListingModal(listing: Listing) {
    this.editingListing = listing;
    this.isListingModalOpen = true;
  }

  deleteListing(id: number) {
    this.listingToDelete = id;
  }

  confirmDelete() {
    if (this.listingToDelete) {
      this.state.deleteListing(this.listingToDelete);
      this.listingToDelete = null;
    }
  }

  submitReply(reviewId: number) {
    if (this.replyText.trim()) {
      this.state.addReviewReply(reviewId, this.replyText.trim());
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
      this.state.addReview(user.id, this.newReview.rating, this.newReview.comment.trim());
      this.newReview = { rating: 5, comment: '' };
    }
  }
}
