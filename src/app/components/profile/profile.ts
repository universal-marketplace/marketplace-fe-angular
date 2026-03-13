import {Component, computed, inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {State} from '../../services/state';
import {Listing, User} from '../../models';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ListingCard} from '../listing-card/listing-card';
import {EditProfileModal} from '../edit-profile-modal/edit-profile-modal';
import {ListingModal} from '../listing-modal/listing-modal';
import { MatIconModule } from '@angular/material/icon';

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

  user: User | undefined;
  isOwnProfile = false;
  isEditModalOpen = false;
  isListingModalOpen = false;
  editingListing: Listing | null = null;
  listingToDelete: string | null = null;

  replyingTo: string | null = null;
  replyText = '';

  newReview = {
    rating: 5,
    comment: ''
  };
  hoverRating = 0;

  // Use computed to automatically react to state changes
  listings = computed(() => {
    if (!this.user) return [];
    return this.state.getUserListings(this.user.id);
  });

  reviews = computed(() => {
    if (!this.user) return [];
    return this.state.getUserReviews(this.user.id);
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.user = this.state.getUser(id);
        if (this.user) {
          this.isOwnProfile = this.state.currentUser()?.id === id;
        }
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

  deleteListing(id: string) {
    this.listingToDelete = id;
  }

  confirmDelete() {
    if (this.listingToDelete) {
      this.state.deleteListing(this.listingToDelete);
      this.listingToDelete = null;
    }
  }

  submitReply(reviewId: string) {
    if (this.replyText.trim()) {
      this.state.addReviewReply(reviewId, this.replyText.trim());
      this.replyingTo = null;
      this.replyText = '';
    }
  }

  submitReview() {
    if (this.user && this.newReview.comment.trim()) {
      this.state.addReview(this.user.id, this.newReview.rating, this.newReview.comment.trim());
      this.newReview = { rating: 5, comment: '' };
    }
  }
}
