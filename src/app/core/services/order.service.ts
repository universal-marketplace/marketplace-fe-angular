import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OrderResponse, OrderStatus } from '../../models';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  buyerOrders = signal<OrderResponse[]>([]);
  sellerOrders = signal<OrderResponse[]>([]);

  loadBuyerOrders() {
    this.http.get<OrderResponse[]>(`${this.apiUrl}/buyer`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.buyerOrders.set(data));
  }

  loadSellerOrders() {
    this.http.get<OrderResponse[]>(`${this.apiUrl}/seller`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.sellerOrders.set(data));
  }

  updateOrderStatus(orderId: number, status: OrderStatus, trackingNumber?: string) {
    let url = `${this.apiUrl}/${orderId}/status?status=${status}`;
    if (trackingNumber) {
      url += `&trackingNumber=${encodeURIComponent(trackingNumber)}`;
    }
    return this.http.patch<OrderResponse>(url, {}).pipe(
      tap(updated => {
        this.sellerOrders.update(list => list.map(o => o.id === orderId ? updated : o));
      })
    );
  }
}
