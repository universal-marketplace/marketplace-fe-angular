import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorResponse } from '../models/error.model';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Wystąpił nieoczekiwany błąd.';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Błąd: ${error.error.message}`;
      } else {
        const serverError = error.error as ErrorResponse;
        if (serverError && serverError.message) {
          errorMessage = serverError.message;
        } else if (error.status === 403) {
          errorMessage = 'Brak uprawnień do wykonania tej operacji.';
        } else if (error.status === 401) {
          errorMessage = 'Sesja wygasła. Zaloguj się ponownie.';
        }
      }

      toastService.error(errorMessage);
      console.error('API Error:', errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
