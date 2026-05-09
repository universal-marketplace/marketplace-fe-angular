import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Listing} from '../../models';
import {ListingService} from '../../features/marketplace/services/listing.service';
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
        unitAmount: value.unitAmount || 1,
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
        unitAmount: 1,
        imageUrl: 'https://picsum.photos/seed/new/600/400',
        description: '',
        type: 'ITEM'
      };
      this.tagsString = '';
    }
    this.priceError = '';
  }
  @Output() isOpenChange = new EventEmitter<boolean>();

  listingService = inject(ListingService);

  isEditing = false;
  listingId: number | null = null;
  tagsString = '';
  priceError = '';

  formData = {
    title: '',
    price: 0,
    unitAmount: 1,
    imageUrl: '',
    description: '',
    type: 'ITEM' as 'ITEM' | 'SERVICE'
  };

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  isFormValid(): boolean {
    const isBaseValid = !!(this.formData.title && this.formData.price > 0 && this.formData.imageUrl && this.formData.description && this.tagsString);
    if (this.formData.type === 'ITEM') {
      return isBaseValid && this.formData.unitAmount > 0;
    }
    return isBaseValid;
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
      this.listingService.updateListing(this.listingId, data).subscribe();
    } else {
      this.listingService.addListing(data).subscribe();
    }

    this.close();
  }
}
