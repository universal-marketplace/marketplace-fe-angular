# Przewodnik Testowania - Universal Marketplace

Ten dokument zawiera instrukcję krok po kroku, jak przetestować pełną funkcjonalność aplikacji Universal Marketplace (Frontend + Backend).

## 1. Wymagania wstępne
- **Backend (Spring Boot)**: Uruchomiony na `https://webappbuc.azurewebsites.net` (Azure) lub `http://localhost:8081` (lokalnie)
- **Frontend (Angular)**: Uruchomiony na `http://localhost:4200`
- **Baza danych**: Czysta lub z dostępem do zapisu.

---

## 2. Scenariusze Testowe

### Scenariusz A: Autentykacja i Profil
1. **Rejestracja Użytkownika 1**:
    - Wejdź na stronę, otwórz modal logowania -> Rejestracja.
    - Dane: `ja@example.com`, `ja123456`, `ja123456`, nazwa: `Janek`.
    - **Oczekiwany rezultat**: Automatyczne zalogowanie, widoczna nazwa użytkownika w nawigacji.
2. **Edycja Profilu**:
    - Przejdź do swojego profilu.
    - Kliknij "Edytuj Profil", zmień opis na: "Jestem rzetelnym sprzedawcą".
    - **Oczekiwany rezultat**: Dane aktualizują się natychmiast bez przeładowania strony.
3. **Wylogowanie**:
    - Kliknij "Wyloguj".
    - **Oczekiwany rezultat**: Przekierowanie na stronę główną, brak tokena w `localStorage`.

### Scenariusz B: Zarządzanie Ogłoszeniami (Sprzedawca)
1. **Dodanie Ogłoszenia (Przedmiot)**:
    - Zaloguj się jako `Janek`.
    - Kliknij "Dodaj Ogłoszenie".
    - Dane:
        - Tytuł: `Rower Górski KROSS`
        - Cena: `1500`
        - Typ: `Przedmiot` (ITEM)
        - Tagi: `rower, sport, kross`
        - Zdjęcie: `https://picsum.photos/seed/bike/600/400`
    - **Oczekiwany rezultat**: Ogłoszenie pojawia się na Twoim profilu i na stronie głównej.
2. **Dodanie Ogłoszenia (Usługa)**:
    - Dane: `Naprawa Komputerów`, Cena: `100`, Typ: `Usługa` (SERVICE), Tagi: `it, serwis`.
3. **Edycja Ogłoszenia**:
    - Na swoim profilu kliknij ikonę edycji (ołówka) przy rowerze. Zmień cenę na `1400`.
    - **Oczekiwany rezultat**: Cena aktualizuje się w bazie i na widoku.

### Scenariusz C: Zakupy i Koszyk (Kupujący)
1. **Rejestracja Użytkownika 2**:
    - Dane: `marek@example.com`, `marek123`, nazwa: `Marek`.
2. **Przeglądanie Marketplace**:
    - Użyj filtrów: wybierz tylko "Usługi", potem wpisz "Rower" w wyszukiwarkę.
    - **Oczekiwany rezultat**: Filtrowanie działa poprawnie (widzisz tylko pasujące rekordy).
3. **Koszyk**:
    - Otwórz szczegóły "Rower Górski KROSS" i kliknij "Do koszyka".
    - Otwórz koszyk (ikona w nawigacji).
    - Zwiększ ilość do `2`, potem usuń przedmiot.
    - **Oczekiwany rezultat**: Licznik na ikonie koszyka aktualizuje się poprawnie.

### Scenariusz D: Interakcje i Recenzje
1. **Wystawienie Opinii**:
    - Jako `Marek` wejdź na profil `Janka` (klikając w jego nazwę przy ogłoszeniu).
    - W sekcji "Opinie" wybierz 5 gwiazdek i napisz: "Świetny rower, polecam!".
    - **Oczekiwany rezultat**: Opinia pojawia się na liście, średnia ocena Janka aktualizuje się.
2. **Wielokrotne Odpowiadanie (Czat)**:
    - Zaloguj się jako `Janek`, wejdź na swój profil.
    - Kliknij "Odpowiedz" pod opinią Marka: "Dzięki za zaufanie!".
    - Kliknij "Odpowiedz ponownie" pod tą samą opinią: "Cieszę się, że rower służy!".
    - **Oczekiwany rezultat**: Widoczne są obie odpowiedzi w wątku.

---

## 3. Przykładowe Dane do Bazy (JSON)

### Nowe Ogłoszenie (POST /api/v1/listings)
```json
{
  "title": "Konsola PS5 Slim",
  "description": "Nowa konsola, nierozpakowana.",
  "priceAmount": 2100.00,
  "imageUrl": "https://picsum.photos/seed/ps5/600/400",
  "tags": ["elektronika", "gry", "sony"],
  "type": "ITEM"
}
```

### Nowa Opinia (POST /api/v1/reviews)
```json
{
  "targetId": 1,
  "rating": 4,
  "comment": "Wszystko OK, ale wysyłka mogłaby być szybsza."
}
```

---

## 4. Rozwiązywanie Problemów
- **Błąd 403 Forbidden**: Sprawdź czy w `SecurityConfig.java` masz `permitAll()` dla `/api/v1/users/*`.
- **Błąd 404 default_avatar.png**: Dodaj plik o tej nazwie do folderu `public/` we frontendzie.
- **Zmiany nie są widoczne**: Wyczyść cache Angulara (`rm -rf .angular/cache`) i zrestartuj `ng serve`.
