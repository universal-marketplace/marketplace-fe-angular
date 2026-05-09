import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationDto } from '../../models';
import { catchError, of, tap } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/notifications`;

  notifications = signal<NotificationDto[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  loadNotifications() {
    if (!this.authService.currentUser()) return;
    this.http.get<NotificationDto[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.notifications.set(data));
  }

  markAsRead(id: number) {
    this.http.patch<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.notifications.update(list => 
          list.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
      })
    ).subscribe();
  }
}
