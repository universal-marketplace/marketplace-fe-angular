import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, forkJoin, of, map, Observable } from 'rxjs';
import { Listing, Review, User, CartDto, AddToCartRequest, PageResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class State {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'http://localhost:8080/api'; 

  isDarkMode = signal<boolean>(false);
  viewMode = signal<'grid' | 'list'>('grid');
  currentUser = signal<User | null>(null);
  isAuthModalOpen = signal<boolean>(false);
  isAccountSettingsModalOpen = signal<boolean>(false);
  listings = signal<Listing[]>([]);
  users = signal<User[]>([]);
  reviews = signal<Review[]>([]);
  cart = signal<CartDto | null>(null);
  isCartModalOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedTags = signal<string[]>([]);
  listingTypeFilter = signal<'ALL' | 'ITEM' | 'SERVICE'>('ALL');
  selectedListing = signal<Listing | null>(null);

  activeProfileListings = signal<Listing[]>([]);
  activeProfileReviews = signal<Review[]>([]);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get<PageResponse<Listing>>(`${this.apiUrl}/listings`).pipe(
      map(res => res.content),
      catchError(() => of([]))
    ).subscribe(data => {
      this.listings.set(data);
      const token = localStorage.getItem('token');
      if (token) {
        this.fetchCurrentUser();
      }
    });
  }

  private fetchCurrentUser() {
    this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
      catchError((err) => {
        console.error('Błąd pobierania /me:', err);
        localStorage.removeItem('token');
        return of(null);
      })
    ).subscribe(user => {
      if (user) {
        if (!user.avatarUrl) {
          user.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;
        }
        this.currentUser.set(user);
        this.loadCart();
      }
    });
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setViewMode(mode: 'grid' | 'list') { this.viewMode.set(mode); }
  openAuthModal() { this.isAuthModalOpen.set(true); }
  closeAuthModal() { this.isAuthModalOpen.set(false); }
  openAccountSettingsModal() { this.isAccountSettingsModalOpen.set(true); }
  closeAccountSettingsModal() { this.isAccountSettingsModalOpen.set(false); }
  openCartModal() { this.isCartModalOpen.set(true); this.loadCart(); }
  closeCartModal() { this.isCartModalOpen.set(false); }
  openListingDetails(listing: Listing) { this.selectedListing.set(listing); }
  closeListingDetails() { this.selectedListing.set(null); }

  setSearchQuery(query: string) { this.searchQuery.set(query); }
  toggleTag(tag: string) {
    this.selectedTags.update(tags =>
      tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    );
  }
  setListingTypeFilter(filter: 'ALL' | 'ITEM' | 'SERVICE') { this.listingTypeFilter.set(filter); }

  loginWithCredentials(email: string, password?: string): boolean {
    this.http.post<{token: string}>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        this.fetchCurrentUser();
        this.closeAuthModal();
      }
    });
    return true;
  }

  register(name: string, email: string, password?: string) {
    const payload = { name, email, password, passwordRepeated: password };
    this.http.post<User>(`${this.apiUrl}/auth/register`, payload).pipe(
      catchError(() => of(null))
    ).subscribe(user => {
      if (user) {
        this.loginWithCredentials(email, password);
      }
    });
  }

  logout() {
    this.currentUser.set(null);
    this.cart.set(null);
    localStorage.removeItem('token');
    this.activeProfileListings.set([]);
    this.activeProfileReviews.set([]);
    this.router.navigate(['/']);
  }

  loadCart() {
    if (!isPlatformBrowser(this.platformId) || !this.currentUser()) return;
    this.http.get<CartDto>(`${this.apiUrl}/cart`).pipe(
      catchError(() => of({ items: [], totalPrice: 0 } as CartDto))
    ).subscribe(cart => this.cart.set(cart));
  }

  addToCart(listingOrId: Listing | number, quantity: number = 1) {
    if (!this.currentUser()) { this.openAuthModal(); return; }
    const listingId = typeof listingOrId === 'number' ? listingOrId : listingOrId.id;
    const payload: AddToCartRequest = { listingId, quantity };
    this.http.post<CartDto>(`${this.apiUrl}/cart/items/`, payload).subscribe(c => this.cart.set(c));
  }

  removeFromCart(listingId: number) {
    if (!this.currentUser()) return;
    this.http.delete<CartDto>(`${this.apiUrl}/cart/items/${listingId}`).subscribe(c => this.cart.set(c));
  }

  updateCartItemQuantity(listingId: number, quantity: number) {
    if (!this.currentUser() || quantity < 1) return;
    const payload: AddToCartRequest = { listingId, quantity };
    this.http.put<CartDto>(`${this.apiUrl}/cart/items/`, payload).subscribe(c => this.cart.set(c));
  }

  clearCart() {
    if (!this.currentUser()) return;
    this.http.delete<CartDto>(`${this.apiUrl}/cart`).subscribe(c => this.cart.set(c));
  }

  updateUser(userId: number, data: Partial<User>) {
    const payload = {
      name: data.name,
      email: data.email,
      emailRepeated: data.email || this.currentUser()?.email,
      description: data.description,
      avatarUrl: data.avatarUrl
    };
    this.http.put<User>(`${this.apiUrl}/users/me`, payload).pipe(
      catchError((err) => {
        console.error('Błąd profilu:', err);
        return of(null);
      })
    ).subscribe(updatedUser => {
      if (updatedUser) {
        this.currentUser.set(updatedUser);
        // Po edycji profilu odświeżamy dane w widoku profilu, jeśli go oglądamy
        this.loadProfileData(userId);
      }
    });
  }

  addListing(listing: any) {
    const payload = {
      title: listing.title,
      description: listing.description,
      priceAmount: listing.price,
      type: listing.type,
      tags: listing.tags,
      imageUrl: listing.imageUrl
    };
    this.http.post<Listing>(`${this.apiUrl}/listings`, payload).subscribe(newListing => {
      if (newListing) {
        this.listings.update(listings => [newListing, ...listings]);
        // Jeśli dodajemy ogłoszenie, odświeżamy listę na profilu
        if (this.currentUser()) {
          this.loadProfileData(this.currentUser()!.id);
        }
      }
    });
  }

  updateListing(id: number, listing: any) {
    const payload = {
      title: listing.title,
      description: listing.description,
      priceAmount: listing.price,
      type: listing.type,
      tags: listing.tags,
      imageUrl: listing.imageUrl
    };
    this.http.put<Listing>(`${this.apiUrl}/listings/${id}`, payload).subscribe(updatedListing => {
      if (updatedListing) {
        this.listings.update(listings => listings.map(l => l.id === id ? updatedListing : l));
        // Po aktualizacji odświeżamy listę na profilu
        if (this.currentUser()) {
          this.loadProfileData(this.currentUser()!.id);
        }
      }
    });
  }

  deleteListing(id: number) {
    this.http.delete(`${this.apiUrl}/listings/${id}`).subscribe(() => {
      this.listings.update(listings => listings.filter(l => l.id !== id));
      // Po usunięciu odświeżamy listę na profilu
      if (this.currentUser()) {
        this.loadProfileData(this.currentUser()!.id);
      }
    });
  }

  addReviewReply(reviewId: number, comment: string) {
    this.http.post<Review>(`${this.apiUrl}/reviews/${reviewId}/reply`, { reply: comment }).subscribe(updatedReview => {
      if (updatedReview) {
        this.reviews.update(reviews => reviews.map(r => r.id === reviewId ? updatedReview : r));
        this.activeProfileReviews.update(revs => revs.map(r => r.id === reviewId ? updatedReview : r));
      }
    });
  }

  addReview(targetId: number, rating: number, comment: string) {
    const payload = { targetId, rating, comment };
    this.http.post<Review>(`${this.apiUrl}/reviews`, payload).subscribe(newReview => {
      if (newReview) {
        this.reviews.update(reviews => [newReview, ...reviews]);
        this.activeProfileReviews.update(revs => [newReview, ...revs]);
      }
    });
  }

  fetchUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  getUser(id: number) {
    return this.users().find(u => u.id === id);
  }

  loadProfileData(userId: number) {
    this.http.get<PageResponse<Listing>>(`${this.apiUrl}/users/${userId}/listings`).pipe(
      map(res => res.content),
      catchError(() => of([]))
    ).subscribe(data => this.activeProfileListings.set(data));

    this.http.get<PageResponse<Review>>(`${this.apiUrl}/users/${userId}/reviews`).pipe(
      map(res => res.content),
      catchError(() => of([]))
    ).subscribe(data => this.activeProfileReviews.set(data));
  }

  getUserListings(userId: number): Listing[] {
    return this.activeProfileListings();
  }

  getUserReviews(userId: number): Review[] {
    return this.activeProfileReviews();
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

  cartCount = computed(() => {
    return this.cart()?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  });
}
