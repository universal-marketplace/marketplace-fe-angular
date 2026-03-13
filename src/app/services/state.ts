import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Listing, Review, User} from '../models';
import {catchError, forkJoin, of} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class State {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api'; // Spring Boot backend URL

  // Local fallback arrays if backend is unavailable
  private localListings: Listing[] = [];
  private localUsers: User[] = [];
  private localReviews: Review[] = [];

  // Theme state
  isDarkMode = signal<boolean>(false);

  // View mode state
  viewMode = signal<'grid' | 'list'>('grid');

  // Auth state
  currentUser = signal<User | null>(null);
  isAuthModalOpen = signal<boolean>(false);
  isAccountSettingsModalOpen = signal<boolean>(false);

  // Data state
  listings = signal<Listing[]>([]);
  users = signal<User[]>([]);
  reviews = signal<Review[]>([]);

  // Cart state
  cart = signal<Listing[]>([]);
  isCartModalOpen = signal<boolean>(false);

  // Filter state
  searchQuery = signal<string>('');
  selectedTags = signal<string[]>([]);

  // Selected listing for details modal
  selectedListing = signal<Listing | null>(null);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    forkJoin({
      listings: this.http.get<Listing[]>(`${this.apiUrl}/listings`).pipe(
        catchError(() => {
          console.warn('Backend niedostępny. Używam lokalnej tablicy ogłoszeń.');
          return of(this.localListings);
        })
      ),
      users: this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
        catchError(() => {
          console.warn('Backend niedostępny. Używam lokalnej tablicy użytkowników.');
          return of(this.localUsers);
        })
      ),
      reviews: this.http.get<Review[]>(`${this.apiUrl}/reviews`).pipe(
        catchError(() => {
          console.warn('Backend niedostępny. Używam lokalnej tablicy opinii.');
          return of(this.localReviews);
        })
      )
    }).subscribe(data => {
      this.listings.set(data.listings);
      this.users.set(data.users);
      this.reviews.set(data.reviews);

      // Update local arrays to match fetched data (if successful)
      this.localListings = [...data.listings];
      this.localUsers = [...data.users];
      this.localReviews = [...data.reviews];
    });
  }

  // Computed filtered listings
  filteredListings = computed(() => {
    let filtered = this.listings();
    const query = this.searchQuery().toLowerCase();
    const tags = this.selectedTags();

    if (query) {
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query)
      );
    }

    if (tags.length > 0) {
      filtered = filtered.filter(l =>
        tags.every(tag => l.tags.includes(tag))
      );
    }

    return filtered;
  });

  // Computed available tags
  availableTags = computed(() => {
    const tags = new Set<string>();
    this.listings().forEach(l => l.tags.forEach((t: string) => tags.add(t)));
    return Array.from(tags).sort();
  });

  toggleTheme() {
    this.isDarkMode.update(v => !v);
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleViewMode() {
    this.viewMode.update(v => v === 'grid' ? 'list' : 'grid');
  }

  openListingDetails(listing: Listing) {
    this.selectedListing.set(listing);
  }

  closeListingDetails() {
    this.selectedListing.set(null);
  }

  openAuthModal() {
    this.isAuthModalOpen.set(true);
  }

  closeAuthModal() {
    this.isAuthModalOpen.set(false);
  }

  login(userId: string) {
    const user = this.users().find(u => u.id === userId);
    if (user) {
      this.currentUser.set(user);
      this.closeAuthModal();
    }
  }

  loginWithCredentials(email: string, password?: string): boolean {
    // For mock purposes, we just check email and password
    const user = this.users().find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUser.set(user);
      this.closeAuthModal();
      return true;
    }
    return false;
  }

  register(name: string, email: string, role: 'user' | 'advertiser', password?: string) {
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      password,
      role,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      description: 'Nowy użytkownik platformy.',
      rating: 0,
      reviewCount: 0
    };

    this.http.post<User>(`${this.apiUrl}/users`, newUser).pipe(
      catchError(() => {
        console.warn('Backend niedostępny. Rejestracja lokalna.');
        this.localUsers.push(newUser);
        return of(newUser);
      })
    ).subscribe(user => {
      this.users.update(users => [...users, user]);
      this.currentUser.set(user);
      this.closeAuthModal();
    });
  }

  logout() {
    this.currentUser.set(null);
    this.cart.set([]); // Clear cart on logout
  }

  // Cart methods
  openCartModal() {
    this.isCartModalOpen.set(true);
  }

  closeCartModal() {
    this.isCartModalOpen.set(false);
  }

  addToCart(listing: Listing) {
    const user = this.currentUser();
    if (user && user.role === 'user') {
      this.cart.update(items => {
        // Prevent adding duplicates
        if (items.find(item => item.id === listing.id)) {
          return items;
        }
        return [...items, listing];
      });
    }
  }

  removeFromCart(listingId: string) {
    this.cart.update(items => items.filter(item => item.id !== listingId));
  }

  clearCart() {
    this.cart.set([]);
  }

  toggleTag(tag: string) {
    this.selectedTags.update(tags => {
      if (tags.includes(tag)) {
        return tags.filter(t => t !== tag);
      } else {
        return [...tags, tag];
      }
    });
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  getUser(id: string): User | undefined {
    return this.users().find(u => u.id === id);
  }

  getUserListings(userId: string): Listing[] {
    return this.listings().filter(l => l.advertiserId === userId);
  }

  getUserReviews(userId: string): Review[] {
    return this.reviews().filter(r => r.targetId === userId);
  }

  updateUser(userId: string, data: Partial<User>) {
    this.http.patch<User>(`${this.apiUrl}/users/${userId}`, data).pipe(
      catchError(() => {
        console.warn('Backend niedostępny. Aktualizacja użytkownika lokalnie.');
        const index = this.localUsers.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.localUsers[index] = { ...this.localUsers[index], ...data };
        }
        return of(null);
      })
    ).subscribe(() => {
      this.users.update(users => users.map(u => u.id === userId ? { ...u, ...data } : u));
      if (this.currentUser()?.id === userId) {
        this.currentUser.set(this.users().find(u => u.id === userId) || null);
      }
    });
  }

  addListing(data: Omit<Listing, 'id' | 'advertiserId' | 'advertiserName' | 'advertiserAvatar' | 'rating' | 'reviewCount'>) {
    const user = this.currentUser();
    if (!user || user.role !== 'advertiser') return;

    const newListing: Listing = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      advertiserId: user.id,
      advertiserName: user.name,
      advertiserAvatar: user.avatarUrl,
      rating: 0,
      reviewCount: 0
    };

    this.http.post<Listing>(`${this.apiUrl}/listings`, newListing).pipe(
      catchError(() => {
        console.warn('Backend niedostępny. Dodawanie ogłoszenia lokalnie.');
        this.localListings.unshift(newListing);
        return of(newListing);
      })
    ).subscribe(listing => {
      this.listings.update(listings => [listing, ...listings]);
    });
  }

  updateListing(id: string, data: Partial<Listing>) {
    this.http.patch<Listing>(`${this.apiUrl}/listings/${id}`, data).pipe(
      catchError(() => {
        console.warn('Backend niedostępny. Aktualizacja ogłoszenia lokalnie.');
        const index = this.localListings.findIndex(l => l.id === id);
        if (index !== -1) {
          this.localListings[index] = { ...this.localListings[index], ...data };
        }
        return of(null);
      })
    ).subscribe(() => {
      this.listings.update(listings => listings.map(l => l.id === id ? { ...l, ...data } : l));
    });
  }

  deleteListing(id: string) {
    this.http.delete(`${this.apiUrl}/listings/${id}`).pipe(
      catchError(() => {
        console.warn('Backend niedostępny. Usuwanie ogłoszenia lokalnie.');
        this.localListings = this.localListings.filter(l => l.id !== id);
        return of(null);
      })
    ).subscribe(() => {
      this.listings.update(listings => listings.filter(l => l.id !== id));
    });
  }

  addReviewReply(reviewId: string, reply: string) {
    const date = new Date().toISOString().split('T')[0];

    this.http.patch<Review>(`${this.apiUrl}/reviews/${reviewId}/reply`, { reply, replyDate: date }).pipe(
      catchError(() => {
        console.warn('Backend niedostępny. Dodawanie odpowiedzi lokalnie.');
        const index = this.localReviews.findIndex(r => r.id === reviewId);
        if (index !== -1) {
          this.localReviews[index] = { ...this.localReviews[index], reply, replyDate: date };
        }
        return of(null);
      })
    ).subscribe(() => {
      this.reviews.update(reviews => reviews.map(r => r.id === reviewId ? { ...r, reply, replyDate: date } : r));
    });
  }

  addReview(targetId: string, rating: number, comment: string) {
    const user = this.currentUser();
    if (!user) return;

    const newReview: Review = {
      id: Math.random().toString(36).substring(2, 9),
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatarUrl,
      targetId,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    this.http.post<Review>(`${this.apiUrl}/reviews`, newReview).pipe(
      catchError(() => {
        console.warn('Backend niedostępny. Dodawanie opinii lokalnie.');
        this.localReviews.unshift(newReview);
        return of(newReview);
      })
    ).subscribe(review => {
      this.reviews.update(reviews => [review, ...reviews]);

      // Recalculate target user's rating
      const targetUserReviews = this.reviews().filter(r => r.targetId === targetId);
      const totalRating = targetUserReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = targetUserReviews.length > 0 ? totalRating / targetUserReviews.length : 0;

      this.updateUser(targetId, {
        rating: averageRating,
        reviewCount: targetUserReviews.length
      });
    });
  }
}
