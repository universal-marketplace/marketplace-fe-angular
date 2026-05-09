import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap, Observable } from 'rxjs';
import { CartDto, AddToCartRequest, Listing, DeliveryMethod, CheckoutRequest } from '../../../models';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { ListingService } from '../../marketplace/services/listing.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private listingService = inject(ListingService);
  private apiUrl = environment.apiUrl;

  cart = signal<CartDto | null>(null);

  cartCount = computed(() => {
    return this.cart()?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  });

  hasPhysicalItems = computed(() => {
    if (!this.cart()) return false;
    return this.cart()!.items.some(item => {
      const listing = this.listingService.listings().find((l: Listing) => l.id === item.listingId);
      return listing?.type === 'ITEM';
    });
  });

  loadCart() {
    if (!this.authService.currentUser()) return;
    this.http.get<CartDto>(`${this.apiUrl}/cart`).pipe(
      catchError(() => of({ items: [], totalPrice: 0 } as CartDto))
    ).subscribe(cart => this.enrichAndSetCart(cart));
  }

  addToCart(listingOrId: Listing | number, quantity: number = 1, bookingDate?: string): Observable<CartDto> {
    const listingId = typeof listingOrId === 'number' ? listingOrId : listingOrId.id;
    const bDate = bookingDate && bookingDate.trim() !== '' ? bookingDate : undefined;
    const payload: AddToCartRequest = { listingId, quantity: Number(quantity), bookingDate: bDate };
    return this.http.post<CartDto>(`${this.apiUrl}/cart/items`, payload).pipe(
      tap(c => this.enrichAndSetCart(c))
    );
  }

  removeFromCart(listingId: number): Observable<CartDto> {
    return this.http.delete<CartDto>(`${this.apiUrl}/cart/items/${listingId}`).pipe(
      tap(c => this.enrichAndSetCart(c))
    );
  }

  updateCartItemQuantity(listingId: number, quantity: number): Observable<CartDto | null> {
    if (quantity < 1) return of(null);
    const payload: AddToCartRequest = { listingId, quantity: Number(quantity) };
    return this.http.put<CartDto>(`${this.apiUrl}/cart/items`, payload).pipe(
      tap(c => this.enrichAndSetCart(c))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cart`).pipe(
      tap(() => {
        this.cart.set({ items: [], totalPrice: 0 });
      })
    );
  }

  checkout(deliveryMethod?: DeliveryMethod): Observable<void> {
    const payload: CheckoutRequest = { deliveryMethod };
    return this.http.post<void>(`${this.apiUrl}/cart/checkout`, payload).pipe(
      tap(() => this.clearCart().subscribe())
    );
  }

  private enrichAndSetCart(cart: CartDto) {
    if (!cart || !cart.items) {
      this.cart.set(cart);
      return;
    }
    const enrichedItems = cart.items.map(item => {
      const listing = this.listingService.listings().find((l: Listing) => l.id === item.listingId);
      return {
        ...item,
        imageUrl: listing?.imageUrl
      };
    });
    this.cart.set({ ...cart, items: enrichedItems });
  }
}
