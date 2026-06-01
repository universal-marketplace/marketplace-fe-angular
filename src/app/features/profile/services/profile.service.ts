import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, map, tap } from 'rxjs';
import { Listing, Review } from '../../../models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  activeProfileListings = signal<Listing[]>([]);
  activeProfileReviews = signal<Review[]>([]);

  fetchUserListings(userId: number) {
    this.http.get<any>(`${this.apiUrl}/users/${userId}/listings`).pipe(
      map(res => res.content || []),
      catchError(() => of([]))
    ).subscribe(data => this.activeProfileListings.set(data));
  }

  fetchUserReviews(userId: number) {
    this.http.get<any>(`${this.apiUrl}/users/${userId}/reviews`).pipe(
      map(res => res.content || []),
      catchError(() => of([]))
    ).subscribe(data => this.activeProfileReviews.set(data));
  }

  resetProfileData() {
    this.activeProfileListings.set([]);
    this.activeProfileReviews.set([]);
  }

  addReview(targetId: number, rating: number, comment: string) {
    const payload = { targetId, rating, comment };
    return this.http.post<Review>(`${this.apiUrl}/reviews`, payload).pipe(
      tap(newReview => {
        if (newReview) {
          this.activeProfileReviews.update(r => [newReview, ...r]);
        }
      })
    );
  }

  addReviewReply(reviewId: number, comment: string) {
    return this.http.post<Review>(`${this.apiUrl}/reviews/${reviewId}/reply`, { reply: comment }).pipe(
      tap(updatedReview => {
        if (updatedReview) {
          this.activeProfileReviews.update(r => r.map(item => item.id === reviewId ? updatedReview : item));
        }
      })
    );
  }
}
