import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed bottom-4 right-4 z-[999] flex flex-col gap-2">
      @for (toast of toastService.toasts(); track toast) {
        <div 
          class="flex items-center p-4 rounded-2xl shadow-lg border animate-slide-in-right max-w-sm"
          [ngClass]="{
            'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300': toast.type === 'success',
            'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300': toast.type === 'error',
            'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300': toast.type === 'info'
          }"
        >
          <mat-icon class="mr-3">
            {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info' }}
          </mat-icon>
          <span class="text-sm font-medium">{{ toast.message }}</span>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
