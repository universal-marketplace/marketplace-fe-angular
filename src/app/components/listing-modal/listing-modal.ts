import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Listing} from '../../models';
import {State} from '../../services/state';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-listing-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './listing-modal.html',
  styleUrl: './listing-modal.css',
})
export class ListingModal {
  @Input() isOpen = false;
  @Input() set listing(value: Listing | null) {
    if (value) {
      this.isEditing = true;
      this.listingId = value.id;
      this.formData = {
        title: value.title,
        price: value.price,
        imageUrl: value.imageUrl,
        description: value.description,
        type: value.type || 'ITEM'
      };
      this.tagsString = value.tags.join(', ');
    } else {
      this.isEditing = false;
      this.listingId = null;
      this.formData = {
        title: '',
        price: 0,
        imageUrl: 'https://picsum.photos/seed/new/600/400',
        description: '',
        type: 'ITEM'
      };
      this.tagsString = '';
    }
    this.priceError = '';
  }
  @Output() isOpenChange = new EventEmitter<boolean>();

  state = inject(State);

  isEditing = false;
  listingId: number | null = null;
  tagsString = '';
  priceError = '';

  formData = {
    title: '',
    price: 0,
    imageUrl: '',
    description: '',
    type: 'ITEM' as 'ITEM' | 'SERVICE'
  };

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  isFormValid(): boolean {
    return !!(this.formData.title && this.formData.price > 0 && this.formData.imageUrl && this.formData.description && this.tagsString);
  }

  onSubmit() {
    this.priceError = '';
    if (!this.isFormValid()) return;

    if (this.formData.price <= 0) {
      this.priceError = 'Podaj prawidłową kwotę.';
      return;
    }

    const tags = this.tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const data = {
      ...this.formData,
      tags
    };

    if (this.isEditing && this.listingId) {
      this.state.updateListing(this.listingId, data);
    } else {
      this.state.addListing(data);
    }

    this.close();
  }
}
