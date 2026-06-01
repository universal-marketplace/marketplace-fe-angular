import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { catchError, of, map, tap } from 'rxjs';
import { Listing, PageResponse } from '../../../models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  listings = signal<Listing[]>([]);
  selectedListing = signal<Listing | null>(null);
  searchQuery = signal<string>('');
  selectedTags = signal<string[]>([]);
  listingTypeFilter = signal<'ALL' | 'ITEM' | 'SERVICE'>('ALL');

  constructor() {
    this.fetchListings();
  }

  fetchListings() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get<PageResponse<Listing>>(`${this.apiUrl}/listings`).pipe(
      map(res => res.content),
      catchError(() => of([]))
    ).subscribe(data => {
      this.listings.set(data);
    });
  }

  addListing(listing: any) {
    const payload = { ...listing, priceAmount: listing.price };
    return this.http.post<Listing>(`${this.apiUrl}/listings`, payload).pipe(
      tap(newListing => {
        if (newListing) {
          this.listings.update(l => [newListing, ...l]);
        }
      })
    );
  }

  updateListing(id: number, listing: any) {
    const payload = { ...listing, priceAmount: listing.price };
    return this.http.put<Listing>(`${this.apiUrl}/listings/${id}`, payload).pipe(
      tap(updatedListing => {
        if (updatedListing) {
          this.listings.update(l => l.map(item => item.id === id ? updatedListing : item));
        }
      })
    );
  }

  deleteListing(id: number) {
    return this.http.delete(`${this.apiUrl}/listings/${id}`).pipe(
      tap(() => {
        this.listings.update(l => l.filter(item => item.id !== id));
      })
    );
  }

  filteredListings = computed(() => {
    let result = this.listings();
    if (this.listingTypeFilter() !== 'ALL') {
      result = result.filter(l => l.type === this.listingTypeFilter());
    }
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        l.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    if (this.selectedTags().length > 0) {
      result = result.filter(l =>
        this.selectedTags().every(tag => l.tags.includes(tag))
      );
    }
    return result;
  });

  availableTags = computed(() => {
    const tags = new Set<string>();
    this.listings().forEach(l => {
      if (l.tags) l.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  });

  setSearchQuery(query: string) { this.searchQuery.set(query); }
  toggleTag(tag: string) {
    this.selectedTags.update(tags =>
      tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    );
  }
  setListingTypeFilter(filter: 'ALL' | 'ITEM' | 'SERVICE') { this.listingTypeFilter.set(filter); }
  openListingDetails(listing: Listing) { this.selectedListing.set(listing); }
  closeListingDetails() { this.selectedListing.set(null); }
}
