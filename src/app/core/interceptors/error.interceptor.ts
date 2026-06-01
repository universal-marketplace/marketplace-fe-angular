import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorResponse } from '../models/error.model';
import { ToastService } from '../services/toast.service';

const ERROR_TRANSLATIONS: Record<string, string> = {
  'User with this email already exists': 'Użytkownik o tym adresie e-mail już istnieje.',
  'Emails do not match': 'Adresy e-mail nie są identyczne.',
  'Passwords do not match': 'Hasła nie są identyczne.',
  'Invalid user ID': 'Nieprawidłowy identyfikator użytkownika.',
  'Cart is empty': 'Koszyk jest pusty.',
  'Delivery method is required for physical items': 'Metoda dostawy jest wymagana dla przedmiotów fizycznych.',
  'Booking date is required for services': 'Data rezerwacji jest wymagana dla usług.',
  'Cannot book a date in the past': 'Nie można zarezerwować daty z przeszłości.',
  'Only one service can be booked per transaction': 'Tylko jedna usługa może być zarezerwowana w jednej transakcji.',
  'You already have this service booked for this date in your cart': 'Ta usługa na wybraną datę znajduje się już w Twoim koszyku.',
  'This date is already booked by someone else': 'Ta data została już zarezerwowana przez kogoś innego.',
  'Quantity for services must be exactly 1': 'Ilość dla usług musi wynosić dokładnie 1.',
  'You are not authorized to update this listing': 'Nie masz uprawnień do edycji tego ogłoszenia.',
  'You are not authorized to delete this listing': 'Nie masz uprawnień do usunięcia tego ogłoszenia.',
  'Unauthorized': 'Brak autoryzacji.',
  'Unauthorized to update order status': 'Brak uprawnień do zmiany statusu zamówienia.',
  'Cannot complete shipping order without a tracking number': 'Nie można zrealizować wysyłki bez numeru śledzenia paczki.',
  'User not found': 'Nie znaleziono użytkownika.',
  'User is already verified': 'Konto jest już zweryfikowane.',
  'Verification code not found': 'Nie znaleziono kodu weryfikacyjnego.',
  'Invalid verification code': 'Nieprawidłowy kod weryfikacyjny.',
  'Verification code has expired': 'Kod weryfikacyjny wygasł.'
};

const translateError = (message: string): string => {
  if (!message) return 'Wystąpił nieoczekiwany błąd.';
  if (message.includes('Requested quantity exceeds available stock')) {
    const match = message.match(/\d+/);
    const stock = match ? match[0] : '';
    return `Żądana ilość przekracza dostępny stan magazynowy (${stock}).`;
  }
  return ERROR_TRANSLATIONS[message] || message;
};

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
          errorMessage = translateError(serverError.message);
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
